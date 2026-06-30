package com.microdfd.auth_service.service;

import com.microdfd.auth_service.dto.TokensDTO;
import com.microdfd.auth_service.enums.JwtTokenType;
import com.microdfd.auth_service.vo.JwtToken;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import org.springframework.stereotype.Service;

import java.security.KeyFactory;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.Date;
import java.util.Objects;

@Service
public class JwtService {

    private final Long JWT_ACCESS_EXPIRATION = 1800000L;

    private final Long JWT_REFRESH_EXPIRATION = 604800000L;

    private final String JWT_PRIVATE_KEY = "MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDPmmu5eGSmPv5X\n" +
            "c8PpMxTX0rwuDXCQHGx65SxzfBTkB3TaNGiOfq8Jf2rVi/Qt4SGPVxCb9gfTT+//\n" +
            "a2dt/00d3FZmXPNVOI+wVEHq1tAlyd7QDY6iJLLugoHnExCx/pM1tmtYndwfCptM\n" +
            "TPj+OTYi9djLcvDorKg8N0HN14x+mVXnVQjrEOO77fE40w/GTnu28ZeaB1/MmJTR\n" +
            "Hb3gjdXDYnQRy5SvTrd5oGtplpboNNnyPx6CT9xgqplwkHuU5nF2TuYVYvUqG0Ik\n" +
            "hefe+XvQdIV508LGVVRsh20NMvdAzl5Ro4g0IY6KXIpFsgHkaWFxTAYZJg6YXcRK\n" +
            "RGXEERp3AgMBAAECggEAY6qIAw+4ilN9ubBbIo6ieAa0zwsmuhjbP5jcYUj1oo+t\n" +
            "2sAEXjyVfeLNAF5jSM9nVDCBSc6w7RLYbnA6xIUnmalZVWVUcNppqUaaKsscPLgQ\n" +
            "nyOTEWa6/GRtRulRP5KvS78bA/0tWz21VskxVKNUyS3r+ahh3eJeFiKVFeRgj7ni\n" +
            "LpVgstO0Aky7y/a8nI5/tmV+hZxc+oKZHz5NiOVcgnI1n+7cNIU57uuSxFwtJRgx\n" +
            "prK0S8IZU+9KeR3YdML9xEgEubD/yzIgIMgXr4zBYkgYuL9gzyjk2wG3V+2ec6YX\n" +
            "zuW/r95LsPJZJ7LauKth4GVyv3foyh1MIT8jCRZ3qQKBgQDiT59BtdRd6uWMpaz+\n" +
            "Ye+u5zTr9su6fX3huolzSTbFrrEBOqPD3eODnTbvN2ewbacwmh3slIVS85VPTqNU\n" +
            "Viw6DNxjxfUSiQEr1Hz6V/1kWMH9szF1sbyKeF2wpe4DncGVc2GPbAINDg2yF27K\n" +
            "HCZp+Lf5Xb/OvEUv1zZgngkd8wKBgQDq1oUFjn2yn9uNNg3fkdQJiyDEUJ2QcJbw\n" +
            "fOJ6KfYe6lIBorYp0hDws2ZWvntncub6d2lqPwoZSbulX1SMPS2F8Y6e54k2Q2LI\n" +
            "1lW3eqmUXPkbUSyPkWGZPbiJnB/nJz1pvF9jhzOltzMwAZOclOUO9HJGFlHl2mck\n" +
            "8zHqjne+bQKBgEf4nmMdWl5L15i1D6EOsFTlPpVUNVInmqLw2cmKHRsdBTmo1m/x\n" +
            "3ur6UoAdFKKtHKB+Qsn8KbJJuNAx6AtoJESJ1oT8bYXpgC/aMazD0tfYykjOdgpB\n" +
            "7f3zbYhCHMGVp/zJZttfs/9G2uAqR5eLAERvTsLFJ7ytbytZu/daCvg1AoGBAM9r\n" +
            "LFDNG07TDRt7m+NVLWBEh2t9/L1gBKFi3LKkL2P8+PPC4HytsxK2kfSaB+tGPKcL\n" +
            "I4uZJHVTf67ANbAsNPIyehL2VGYePLlBPrJxYCjPuaKcHuyrrvWn4z+AK1mCeibT\n" +
            "H7mL6F09I7QKIHPTu0FrPSeUfT+0mRe0yejvbuo9AoGBAIW66e0uNeiqMf9oy3Vt\n" +
            "0z31Lz6FzxOH97VKmdbBsmc4h0qz1AUqG0UsPhONETI32mMHQeDROId30zU7LZa8\n" +
            "HVS7JG7CAk7V8TLUcV5jLZ13I7w9kM+i8NyRfWEs9nlK4wZZ7Q5/f46WVMM/ZY2W\n" +
            "iP690xp4IYmhBp/ZL7AououJ";

    private final String JWT_PUBLIC_KEY = "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAz5pruXhkpj7+V3PD6TMU\n" +
            "19K8Lg1wkBxseuUsc3wU5Ad02jRojn6vCX9q1Yv0LeEhj1cQm/YH00/v/2tnbf9N\n" +
            "HdxWZlzzVTiPsFRB6tbQJcne0A2OoiSy7oKB5xMQsf6TNbZrWJ3cHwqbTEz4/jk2\n" +
            "IvXYy3Lw6KyoPDdBzdeMfplV51UI6xDju+3xONMPxk57tvGXmgdfzJiU0R294I3V\n" +
            "w2J0EcuUr063eaBraZaW6DTZ8j8egk/cYKqZcJB7lOZxdk7mFWL1KhtCJIXn3vl7\n" +
            "0HSFedPCxlVUbIdtDTL3QM5eUaOINCGOilyKRbIB5GlhcUwGGSYOmF3ESkRlxBEa\n" +
            "dwIDAQAB";

    private final String ISSUER = "auth-service";

    private final String TOKEN_TYPE_CLAIM = "token-type";

    public String extractUsername(JwtToken jwtToken) {
        return Jwts.parser()
                .verifyWith(getSignInPublicKey())
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
                .verifyWith(getSignInPublicKey())
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
                .verifyWith(getSignInPublicKey())
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
                        .signWith(getSignInPrivateKey())
                        .compact()
        );
    }

    private PrivateKey getSignInPrivateKey() {
        try {
            KeyFactory keyFactory = KeyFactory.getInstance("RSA");
            byte[] privateKeyBytes = Decoders.BASE64.decode(JWT_PRIVATE_KEY);
            return keyFactory.generatePrivate(new PKCS8EncodedKeySpec(privateKeyBytes));
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    private PublicKey getSignInPublicKey() {
        try {
            KeyFactory keyFactory = KeyFactory.getInstance("RSA");
            byte[] publicKeyBytes = Decoders.BASE64.decode(JWT_PUBLIC_KEY);
            return keyFactory.generatePublic(new X509EncodedKeySpec(publicKeyBytes));
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
