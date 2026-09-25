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

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HashSet;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;

    private final JwtService jwtService;

    private final RoleRepository roleRepository;

    private final PasswordEncoder passwordEncoder;

    private final AuditService auditService;

    private final PasswordResetTokenRepository passwordResetTokenRepository;


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


    /*
     * =========================================================
     * FORGOT PASSWORD
     * =========================================================
     */

    @Transactional
    public PasswordResetResponse forgotPassword(
            ForgotPasswordRequest request
    ) {

        String email =
                request.getEmail() == null
                        ? ""
                        : request.getEmail().trim();

        /*
         * Always return the same response whether the
         * account exists or not.
         *
         * This prevents someone from discovering which
         * email addresses have TruCity accounts.
         */

        User user =
                userRepository
                        .findByEmail(email)
                        .orElse(null);

        if (user == null) {

            return PasswordResetResponse.builder()
                    .message(
                            "If an account exists for that email, password reset instructions have been sent."
                    )
                    .build();
        }

        /*
         * Remove any previous unused reset tokens.
         */

        passwordResetTokenRepository
                .deleteActiveTokensForUser(user);


        /*
         * Generate a secure random token.
         */

        SecureRandom secureRandom =
                new SecureRandom();

        byte[] randomBytes =
                new byte[48];

        secureRandom.nextBytes(randomBytes);

        String resetToken =
                Base64.getUrlEncoder()
                        .withoutPadding()
                        .encodeToString(randomBytes);


        /*
         * Token is valid for 30 minutes.
         */

        PasswordResetToken passwordResetToken =
                PasswordResetToken.builder()

                        .user(user)

                        .token(resetToken)

                        .expiresAt(
                                LocalDateTime.now()
                                        .plusMinutes(30)
                        )

                        .build();

        passwordResetTokenRepository
                .save(passwordResetToken);


        /*
         * TEMPORARY DEVELOPMENT OUTPUT
         *
         * Until SMTP/email delivery is configured,
         * the reset token is printed to the backend log.
         *
         * Do NOT use this as the production email solution.
         */

        System.out.println(
                "================================================="
        );

        System.out.println(
                "TRUCITY PASSWORD RESET TOKEN"
        );

        System.out.println(
                "User: " + user.getEmail()
        );

        System.out.println(
                "Token: " + resetToken
        );

        System.out.println(
                "Expires: "
                        + passwordResetToken.getExpiresAt()
        );

        System.out.println(
                "================================================="
        );


        auditService.log(
                user.getId(),
                "PASSWORD_RESET_REQUESTED",
                "Password reset requested"
        );


        return PasswordResetResponse.builder()

                .message(
                        "If an account exists for that email, password reset instructions have been sent."
                )

                .build();
    }


    /*
     * =========================================================
     * RESET PASSWORD
     * =========================================================
     */

    @Transactional
    public PasswordResetResponse resetPassword(
            ResetPasswordRequest request
    ) {

        if (request.getToken() == null ||
                request.getToken().trim().isEmpty()) {

            throw new RuntimeException(
                    "Invalid password reset token"
            );
        }

        if (request.getNewPassword() == null ||
                request.getNewPassword().trim().isEmpty()) {

            throw new RuntimeException(
                    "New password is required"
            );
        }


        PasswordResetToken resetToken =
                passwordResetTokenRepository
                        .findByToken(
                                request.getToken().trim()
                        )
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Invalid password reset token"
                                )
                        );


        if (resetToken.isUsed()) {

            throw new RuntimeException(
                    "Password reset token has already been used"
            );
        }


        if (resetToken.isExpired()) {

            throw new RuntimeException(
                    "Password reset token has expired"
            );
        }


        User user =
                resetToken.getUser();


        user.setPasswordHash(
                passwordEncoder.encode(
                        request.getNewPassword()
                )
        );


        userRepository.save(user);


        resetToken.setUsedAt(
                LocalDateTime.now()
        );


        passwordResetTokenRepository
                .save(resetToken);


        auditService.log(
                user.getId(),
                "PASSWORD_RESET_COMPLETED",
                "User password was successfully reset"
        );


        return PasswordResetResponse.builder()

                .message(
                        "Your password has been reset successfully."
                )

                .build();
    }
}