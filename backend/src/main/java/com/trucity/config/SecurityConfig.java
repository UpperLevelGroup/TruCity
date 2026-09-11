package com.trucity.config;

import com.trucity.security.JwtAuthenticationFilter;

import lombok.RequiredArgsConstructor;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.http.HttpMethod;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;

import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;

import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;

import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;


@Configuration
@RequiredArgsConstructor
@EnableMethodSecurity
public class SecurityConfig {


    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    private final PasswordEncoder passwordEncoder;

    private final org.springframework.security.core.userdetails.UserDetailsService userDetailsService;


    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http
    ) throws Exception {

        http

        .csrf(csrf -> csrf.disable())


        // Enable CORS
        .cors(cors ->
            cors.configurationSource(
                corsConfigurationSource()
            )
        )


        // JWT authentication = stateless
        .sessionManagement(session ->
            session.sessionCreationPolicy(
                SessionCreationPolicy.STATELESS
            )
        )


        .authorizeHttpRequests(auth -> auth


            // CORS preflight
            .requestMatchers(
                HttpMethod.OPTIONS,
                "/**"
            )
            .permitAll()


            // Public authentication endpoints
            .requestMatchers(
                "/api/v1/auth/register",
                "/api/v1/auth/login"
            )
            .permitAll()


            // Swagger
            .requestMatchers(
                "/swagger-ui/**",
                "/v3/api-docs/**"
            )
            .permitAll()


            // Health
            .requestMatchers(
                "/api/health"
            )
            .permitAll()


            // Everything else requires JWT
            .anyRequest()
            .authenticated()

        )


        .authenticationProvider(
            authenticationProvider()
        )


        .addFilterBefore(
            jwtAuthenticationFilter,
            UsernamePasswordAuthenticationFilter.class
        );


        return http.build();

    }


    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration =
                new CorsConfiguration();


        configuration.setAllowedOrigins(
            List.of(
                "http://localhost:5173",
                "https://trucity-frontend.vercel.app/"
            )
        );


        configuration.setAllowedMethods(
            List.of(
                "GET",
                "POST",
                "PUT",
                "PATCH",
                "DELETE",
                "OPTIONS"
            )
        );


        configuration.setAllowedHeaders(
            List.of(
                "Authorization",
                "Content-Type"
            )
        );


        configuration.setAllowCredentials(true);


        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();


        source.registerCorsConfiguration(
            "/**",
            configuration
        );


        return source;
    }


    @Bean
    public AuthenticationProvider authenticationProvider() {

        DaoAuthenticationProvider provider =
                new DaoAuthenticationProvider(
                        userDetailsService
                );

        provider.setPasswordEncoder(
                passwordEncoder
        );

        return provider;
    }


    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration
    ) throws Exception {

        return configuration.getAuthenticationManager();

    }

}