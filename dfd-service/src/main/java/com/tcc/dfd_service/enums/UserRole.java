package com.tcc.dfd_service.enums;

import org.springframework.security.core.GrantedAuthority;

public enum UserRole implements GrantedAuthority {
    ADMIN;

    @Override
    public String getAuthority() {
        return this.name();
    }
}
