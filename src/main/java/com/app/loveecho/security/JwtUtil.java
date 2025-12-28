package com.app.loveecho.security;

import java.security.Key;
import java.util.Date;

import org.springframework.stereotype.Component;

import com.app.loveecho.jpa.entity.User;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

@Component
public class JwtUtil {

    // 🔐 256-bit secret (32+ chars)
    private static final String SECRET_STRING =
            "LoveEchoSuperSecretKeyForHS256Algorithm123!";

    private static final long EXPIRATION_TIME =
            1000 * 60 * 60 * 24; // 24 hours

    private final Key SECRET_KEY =
            Keys.hmacShaKeyFor(SECRET_STRING.getBytes());

    // ✅ Generate token with USER ID
    public String generateToken(User user) {
        return Jwts.builder()
                .setSubject(user.getUsername())   // ✅ THIS IS THE FIX
                .setIssuedAt(new Date())
                .setExpiration(
                        new Date(System.currentTimeMillis() + EXPIRATION_TIME)
                )
                .signWith(SECRET_KEY, SignatureAlgorithm.HS256)
                .compact();
    }


    // ✅ Extract subject (userId)
    public String extractSubject(String token) {
        return getClaims(token).getSubject();
    }

    // ✅ Validate token (expiration only)
    public boolean validateToken(String token) {
        try {
            return !isTokenExpired(token);
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    private boolean isTokenExpired(String token) {
        return getClaims(token)
                .getExpiration()
                .before(new Date());
    }

    private Claims getClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(SECRET_KEY)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
