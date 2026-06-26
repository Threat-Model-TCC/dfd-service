package com.microdfd.auth_service.service;

import com.microdfd.auth_service.dto.TokensDTO;
import com.microdfd.auth_service.enums.JwtTokenType;
import com.microdfd.auth_service.vo.JwtToken;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.Objects;

@Service
public class JwtService {

    private final Long JWT_ACCESS_EXPIRATION = 1800000L;

    private final Long JWT_REFRESH_EXPIRATION = 604800000L;

    private final String JWT_SECRET = "0Hm08ePzQrbOQHJdtm0oi0OglriYYKID8GX+LHAh7mE=";

    private final String ISSUER = "auth-service";

    private final String TOKEN_TYPE_CLAIM = "token-type";

    public String extractUsername(JwtToken jwtToken) {
        return Jwts.parser()
                .verifyWith(getSignInKey())
                .build()
                .parseSignedClaims(jwtToken.getValue())
                .getPayload()
                .getSubject();
    }

    public boolean isTokenExpired(JwtToken jwtToken) {
        Date expiration = extractExpiration(jwtToken);
        return expiration.before(new Date());
    }

    private Date extractExpiration(JwtToken jwtToken) {
        return Jwts.parser()
                .verifyWith(getSignInKey())
                .build()
                .parseSignedClaims(jwtToken.getValue())
                .getPayload()
                .getExpiration();
    }

    boolean isRefreshToken(JwtToken token) {
        JwtTokenType tokenType = extractTokenType(token);
        return Objects.equals(JwtTokenType.REFRESH, tokenType);
    }

    private JwtTokenType extractTokenType(JwtToken token) {
        String type = Jwts.parser()
                .verifyWith(getSignInKey())
                .build()
                .parseSignedClaims(token.getValue())
                .getPayload()
                .get(TOKEN_TYPE_CLAIM, String.class);
        return JwtTokenType.valueOf(type);
    }

    public TokensDTO generateTokens(String username) {
        if(username == null || username.isEmpty()) {
            throw new IllegalArgumentException("Username cannot be null or empty");
        }

        JwtToken accessToken = generateToken(username, JwtTokenType.ACCESS, JWT_ACCESS_EXPIRATION);
        JwtToken refreshToken = generateToken(username, JwtTokenType.REFRESH, JWT_REFRESH_EXPIRATION);

        return new TokensDTO(
                accessToken.getValueWithBearer(),
                refreshToken.getValue()
        );
    }

    private JwtToken generateToken(String username, JwtTokenType tokenType, Long msExpiration) {
        return new JwtToken(
                Jwts.builder()
                        .subject(username)
                        .claim(TOKEN_TYPE_CLAIM, tokenType)
                        .issuedAt(new Date())
                        .issuer(ISSUER)
                        .expiration(new Date(System.currentTimeMillis() + msExpiration))
                        .signWith(getSignInKey())
                        .compact()
        );
    }

    private SecretKey getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(JWT_SECRET);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
