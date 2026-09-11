package com.trucity.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import lombok.RequiredArgsConstructor;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter
extends OncePerRequestFilter {

private final JwtService jwtService;

private final CustomUserDetailsService userDetailsService;


@Override
protected boolean shouldNotFilter(
        HttpServletRequest request
) {

    String path = request.getServletPath();

    return path.equals("/api/v1/auth/register")
            || path.equals("/api/v1/auth/login");
}


@Override
protected void doFilterInternal(
        HttpServletRequest request,
        HttpServletResponse response,
        FilterChain filterChain
) throws ServletException, IOException {

    String authHeader =
            request.getHeader("Authorization");

    System.out.println(
            "AUTH HEADER: " + authHeader
    );


    if (
            authHeader == null ||
            !authHeader.startsWith("Bearer ")
    ) {

        filterChain.doFilter(
                request,
                response
        );

        return;
    }


    String token =
            authHeader.substring(7);


    if (
            token.isBlank() ||
            token.equalsIgnoreCase("undefined") ||
            token.equalsIgnoreCase("null")
    ) {

        filterChain.doFilter(
                request,
                response
        );

        return;
    }


    try {

        String email =
                jwtService.extractUsername(token);

        System.out.println(
                "JWT EMAIL: " + email
        );


        if (
                email != null &&
                SecurityContextHolder
                        .getContext()
                        .getAuthentication() == null
        ) {

            UserDetails userDetails =
                    userDetailsService
                            .loadUserByUsername(email);


            if (jwtService.validateToken(token)) {

                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                userDetails.getAuthorities()
                        );


                authentication.setDetails(
                        new WebAuthenticationDetailsSource()
                                .buildDetails(request)
                );


                SecurityContextHolder
                        .getContext()
                        .setAuthentication(
                                authentication
                        );


                System.out.println(
                        "AUTH USER: " + email
                );

                System.out.println(
                        "AUTHORITIES: " +
                        userDetails.getAuthorities()
                );
            }
        }

    } catch (Exception exception) {

        System.out.println(
                "JWT authentication failed: " +
                exception.getMessage()
        );

        SecurityContextHolder
                .clearContext();
    }


    filterChain.doFilter(
            request,
            response
    );
}

}
