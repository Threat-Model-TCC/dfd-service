package com.microdfd.auth_service.dto;

public record RegisterUserDTO (
        String name,
        String mail,
        String password
) {
}
