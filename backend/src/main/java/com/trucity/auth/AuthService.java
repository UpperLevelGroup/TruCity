package com.trucity.auth;

import com.trucity.audit.AuditService;
import com.trucity.security.JwtService;
import com.trucity.user.Role;
import com.trucity.user.RoleRepository;
import com.trucity.user.User;
import com.trucity.user.UserRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;

    private final JwtService jwtService;

    private final RoleRepository roleRepository;

    private final PasswordEncoder passwordEncoder;

    private final AuditService auditService;


    /*
     * =========================================================
     * REGISTER
     * =========================================================
     */

    @Transactional
    public AuthResponse register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {

            throw new RuntimeException(
                    "Email already registered"
            );
        }


        Role candidateRole =
                roleRepository
                        .findByName("CANDIDATE")
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "CANDIDATE role does not exist"
                                )
                        );


        User user = User.builder()

                .firstName(
                        request.getFirstName()
                )

                .lastName(
                        request.getLastName()
                )

                .email(
                        request.getEmail()
                )

                .passwordHash(
                        passwordEncoder.encode(
                                request.getPassword()
                        )
                )

                .roles(
                        new HashSet<>()
                )

                .enabled(true)

                .build();


        user.getRoles()
                .add(candidateRole);


        User savedUser =
                userRepository.save(user);


        /*
         * =====================================================
         * AUDIT
         * =====================================================
         */

        auditService.log(
                savedUser.getId(),
                "CANDIDATE_REGISTERED",
                "Candidate account registered: "
                        + savedUser.getEmail()
        );


        String token =
                jwtService.generateToken(
                        savedUser.getEmail()
                );


        return AuthResponse.builder()

                .accessToken(token)

                .refreshToken(null)

                .role(
                        candidateRole.getName()
                )

                .build();
    }


    /*
     * =========================================================
     * LOGIN
     * =========================================================
     */

    @Transactional
    public AuthResponse login(LoginRequest request) {

        User user =
                userRepository
                        .findByEmail(request.getEmail())
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Invalid credentials"
                                )
                        );


        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPasswordHash()
        )) {

            throw new RuntimeException(
                    "Invalid credentials"
            );
        }


        /*
         * =====================================================
         * AUDIT SUCCESSFUL LOGIN
         * =====================================================
         */

        auditService.log(
                user.getId(),
                "USER_LOGIN",
                "User signed in successfully"
        );


        String token =
                jwtService.generateToken(
                        user.getEmail()
                );


        String userRole =
                user.getRoles()
                        .stream()
                        .findFirst()
                        .map(Role::getName)
                        .orElse("USER");


        return AuthResponse.builder()

                .accessToken(token)

                .refreshToken(null)

                .role(userRole)

                .build();
    }
}