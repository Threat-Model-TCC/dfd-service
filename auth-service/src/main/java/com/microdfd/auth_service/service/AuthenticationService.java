package com.microdfd.auth_service.service;

import com.microdfd.auth_service.dto.GoogleAuthenticatedDTO;
import com.microdfd.auth_service.dto.GoogleLoginDTO;
import com.microdfd.auth_service.dto.LoginDTO;
import com.microdfd.auth_service.dto.TokensDTO;
import com.microdfd.auth_service.entity.User;
import com.microdfd.auth_service.enums.UserRole;
import com.microdfd.auth_service.exception.UnauthorizedException;
import com.microdfd.auth_service.vo.JwtToken;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserService userService;
    private final GoogleAuthService googleAuthService;

    public TokensDTO authenticateUser(LoginDTO dto) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(dto.mail(), dto.password()));

        UserRole role = authentication.getAuthorities().stream()
                .findFirst()
                .map(grantedAuthority -> UserRole.valueOf(grantedAuthority.getAuthority()))
                .orElseThrow(() -> new UnauthorizedException("User role not found."));
        return jwtService.generateTokens(dto.mail(), role);
    }

    public TokensDTO authenticateWithGoogle(GoogleLoginDTO dto) {
        GoogleAuthenticatedDTO authenticatedDTO = googleAuthService.authenticateWithGoogle(dto);
        return jwtService.generateTokens(authenticatedDTO.mail(), UserRole.ADMIN);
    }

    public TokensDTO refreshTokens(String refreshToken) {
        JwtToken jwtToken = new JwtToken(refreshToken);

        if(!jwtService.isRefreshToken(jwtToken)) {
            throw new UnauthorizedException("Invalid token type. Expected a refresh token.");
        }

        String username = jwtService.extractUsername(jwtToken);
        User user = userService.findByMail(username);
        return jwtService.generateTokens(username, user.getRole());
    }
}
