package com.microdfd.auth_service.service;

import com.microdfd.auth_service.dto.LoginDTO;
import com.microdfd.auth_service.dto.TokensDTO;
import com.microdfd.auth_service.exception.UnauthorizedException;
import com.microdfd.auth_service.vo.JwtToken;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public TokensDTO authenticateUser(LoginDTO dto) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(dto.mail(), dto.password()));

        return jwtService.generateTokens(dto.mail());
    }

    public TokensDTO refreshTokens(String refreshToken) {
        JwtToken jwtToken = new JwtToken(refreshToken);

        if(!jwtService.isRefreshToken(jwtToken)) {
            throw new UnauthorizedException("Invalid token type. Expected a refresh token.");
        }

        String username = jwtService.extractUsername(jwtToken);
        return jwtService.generateTokens(username);
    }
}
