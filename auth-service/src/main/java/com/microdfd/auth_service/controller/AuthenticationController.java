package com.microdfd.auth_service.controller;

import com.microdfd.auth_service.dto.LoginDTO;
import com.microdfd.auth_service.dto.TokensDTO;
import com.microdfd.auth_service.service.AuthenticationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class AuthenticationController {

    private final AuthenticationService authenticationService;

    @PostMapping("/auth/login")
    ResponseEntity<TokensDTO> authenticateUser(@RequestBody LoginDTO dto) {
        TokensDTO tokens = authenticationService.authenticateUser(dto);
        return ResponseEntity.ok(tokens);
    }

    @PostMapping("/auth/refresh")
    ResponseEntity<TokensDTO> refreshTokens(@RequestBody String refreshToken) {
        TokensDTO tokens = authenticationService.refreshTokens(refreshToken);
        return ResponseEntity.ok(tokens);
    }
}
