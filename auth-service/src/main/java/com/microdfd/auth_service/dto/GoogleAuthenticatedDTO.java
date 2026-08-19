package com.microdfd.auth_service.dto;

public record GoogleAuthenticatedDTO(
        String name,
        String mail,
        String googleSub
) {
}
