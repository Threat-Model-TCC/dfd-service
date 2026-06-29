package com.tcc.dfd_service.service;

import com.tcc.dfd_service.enums.JwtTokenType;
import com.tcc.dfd_service.vo.JwtToken;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.Objects;

@Service
public class JwtService {

    private final String JWT_SECRET = "0Hm08ePzQrbOQHJdtm0oi0OglriYYKID8GX+LHAh7mE=";

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

    public boolean isAccessToken(JwtToken jwtToken) {
        JwtTokenType tokenType = extractTokenType(jwtToken);
        return Objects.equals(JwtTokenType.ACCESS, tokenType);
    }

    private Date extractExpiration(JwtToken jwtToken) {
        return Jwts.parser()
                .verifyWith(getSignInKey())
                .build()
                .parseSignedClaims(jwtToken.getValue())
                .getPayload()
                .getExpiration();
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

    private SecretKey getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(JWT_SECRET);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
