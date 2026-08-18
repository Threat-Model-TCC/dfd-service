package com.tcc.dfd_service.security;

import com.tcc.dfd_service.enums.UserRole;
import com.tcc.dfd_service.service.JwtService;
import com.tcc.dfd_service.vo.JwtToken;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.NonNull;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain)
            throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            JwtToken jwtToken = new JwtToken(authHeader);
            String username = jwtService.extractUsername(jwtToken);
            boolean isTokenExpired = jwtService.isTokenExpired(jwtToken);
            boolean isAccessToken = jwtService.isAccessToken(jwtToken);

            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null
                    && !isTokenExpired && isAccessToken) {

                UserRole role = jwtService.extractAuthority(jwtToken);
                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(username, null, List.of(role));

                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            } else {
                handleError(response);
                return;
            }
        } catch (Exception e) {
            handleError(response);
            return;
        }

        filterChain.doFilter(request, response);
    }

    private void handleError(HttpServletResponse response) throws IOException {
        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.setContentType("application/json");
        response.getWriter().write("{\"error\": \"Invalid or expired JWT token.\"}");
        response.getWriter().flush();
    }
}
