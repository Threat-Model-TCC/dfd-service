package com.microdfd.auth_service.dto;

public record TokensDTO(
        String accessToken,
        String refreshToken
) {
}
