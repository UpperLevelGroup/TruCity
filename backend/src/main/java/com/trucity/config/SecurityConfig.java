
package com.trucity.config;


import com.trucity.security.JwtAuthenticationFilter;

import lombok.RequiredArgsConstructor;


import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;


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


        .sessionManagement(session ->
            session.sessionCreationPolicy(
                SessionCreationPolicy.STATELESS
            )
        )


        .authorizeHttpRequests(auth -> auth


            // Public authentication endpoints
            .requestMatchers(
                "/api/v1/auth/**"
            )
            .permitAll()


            // Swagger
            .requestMatchers(
                "/swagger-ui/**",
                "/v3/api-docs/**"
            )
            .permitAll()


            // Everything else requires JWT
            .anyRequest()
            .authenticated()

        )


        .authenticationProvider(authenticationProvider())


        .addFilterBefore(
            jwtAuthenticationFilter,
            UsernamePasswordAuthenticationFilter.class
        );



        return http.build();

    }




    @Bean
    public AuthenticationProvider authenticationProvider(){


        DaoAuthenticationProvider provider =
                new DaoAuthenticationProvider();



        provider.setUserDetailsService(
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