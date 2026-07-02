package com.tcc.dfd_service.service;

import com.tcc.dfd_service.enums.UserRole;
import com.tcc.dfd_service.enums.JwtTokenType;
import com.tcc.dfd_service.vo.JwtToken;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import org.springframework.stereotype.Service;

import java.security.KeyFactory;
import java.security.PublicKey;
import java.security.spec.X509EncodedKeySpec;
import java.util.Date;
import java.util.Objects;

@Service
public class JwtService {

    private final String JWT_PUBLIC_KEY = "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAz5pruXhkpj7+V3PD6TMU\n" +
            "19K8Lg1wkBxseuUsc3wU5Ad02jRojn6vCX9q1Yv0LeEhj1cQm/YH00/v/2tnbf9N\n" +
            "HdxWZlzzVTiPsFRB6tbQJcne0A2OoiSy7oKB5xMQsf6TNbZrWJ3cHwqbTEz4/jk2\n" +
            "IvXYy3Lw6KyoPDdBzdeMfplV51UI6xDju+3xONMPxk57tvGXmgdfzJiU0R294I3V\n" +
            "w2J0EcuUr063eaBraZaW6DTZ8j8egk/cYKqZcJB7lOZxdk7mFWL1KhtCJIXn3vl7\n" +
            "0HSFedPCxlVUbIdtDTL3QM5eUaOINCGOilyKRbIB5GlhcUwGGSYOmF3ESkRlxBEa\n" +
            "dwIDAQAB";

    private final String TOKEN_TYPE_CLAIM = "token-type";

    private final String AUTHORITY_CLAIM = "authority";

    public String extractUsername(JwtToken jwtToken) {
        return Jwts.parser()
                .verifyWith(getSignInPublicKey())
                .build()
                .parseSignedClaims(jwtToken.getValue())
                .getPayload()
                .getSubject();
    }

    public UserRole extractAuthority(JwtToken jwtToken) {
        String authority = Jwts.parser()
                .verifyWith(getSignInPublicKey())
                .build()
                .parseSignedClaims(jwtToken.getValue())
                .getPayload()
                .get(AUTHORITY_CLAIM, String.class);
        return UserRole.valueOf(authority);
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
                .verifyWith(getSignInPublicKey())
                .build()
                .parseSignedClaims(jwtToken.getValue())
                .getPayload()
                .getExpiration();
    }

    private JwtTokenType extractTokenType(JwtToken token) {
        String type = Jwts.parser()
                .verifyWith(getSignInPublicKey())
                .build()
                .parseSignedClaims(token.getValue())
                .getPayload()
                .get(TOKEN_TYPE_CLAIM, String.class);
        return JwtTokenType.valueOf(type);
    }

    private PublicKey getSignInPublicKey() {
        try {
            KeyFactory keyFactory = KeyFactory.getInstance("RSA");
            String cleanPublicKey = JWT_PUBLIC_KEY.replaceAll("\\s+", "");
            byte[] publicKeyBytes = Decoders.BASE64.decode(cleanPublicKey);
            return keyFactory.generatePublic(new X509EncodedKeySpec(publicKeyBytes));
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
