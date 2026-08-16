package com.microdfd.auth_service.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.microdfd.auth_service.dto.GoogleAuthenticatedDTO;
import com.microdfd.auth_service.dto.GoogleLoginDTO;
import com.microdfd.auth_service.entity.User;
import com.microdfd.auth_service.exception.UnauthorizedException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.security.GeneralSecurityException;

@Service
@RequiredArgsConstructor
public class GoogleAuthService {

    private final UserService userService;
    private final GoogleIdTokenVerifier googleIdTokenVerifier;

    public GoogleAuthenticatedDTO authenticateWithGoogle(GoogleLoginDTO dto) {
        if (dto.idToken() == null || dto.idToken().isBlank()) {
            throw new UnauthorizedException("Google token is required.");
        }

        GoogleIdToken.Payload payload = verifyToken(dto.idToken());

        if (!Boolean.TRUE.equals(payload.getEmailVerified())) {
            throw new UnauthorizedException("Google account email is not verified.");
        }

        String email = payload.getEmail();
        String name = (String) payload.get("name");
        String googleSub = payload.getSubject();

        User user = userService.findOrCreateGoogleUser(email, name, googleSub);

        return new GoogleAuthenticatedDTO(user.getName(), user.getMail(), user.getGoogleId());
    }

    private GoogleIdToken.Payload verifyToken(String rawToken) {
        try {
            GoogleIdToken idToken = googleIdTokenVerifier.verify(rawToken);
            if (idToken == null) {
                throw new UnauthorizedException("Invalid or expired Google token.");
            }
            return idToken.getPayload();
        } catch (GeneralSecurityException | IOException e) {
            throw new UnauthorizedException("Failed to validate Google token.");
        }
    }
}