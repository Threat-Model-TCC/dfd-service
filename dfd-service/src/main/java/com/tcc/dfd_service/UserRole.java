package com.tcc.dfd_service;

import org.springframework.security.core.GrantedAuthority;

public enum UserRole implements GrantedAuthority {
    ADMIN;

    @Override
    public String getAuthority() {
        return this.name();
    }
}
