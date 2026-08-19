package com.microdfd.auth_service.vo;

public class JwtToken {

    private String value;

    public JwtToken(String token) {
        String cleanToken = token.trim();
        if (cleanToken.startsWith("Bearer ")) {
            cleanToken = cleanToken.substring(7);
        }
        this.value = cleanToken;
    }

    public String getValue() {
        return this.value;
    }
}
