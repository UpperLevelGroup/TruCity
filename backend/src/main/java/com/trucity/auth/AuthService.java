package com.trucity.auth;

import com.trucity.audit.AuditService;
import com.trucity.candidate.CandidateProfile;
import com.trucity.candidate.CandidateProfileRepository;
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
    private final CandidateProfileRepository candidateProfileRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;

    /*
     * ============================================================
     * REGISTER
     * ============================================================
     *
     * Public registration may create only:
     *
     * CANDIDATE
     * EMPLOYER
     *
     * ADMIN and VERIFIER accounts must be created through a
     * protected administrative process.
     */
    @Transactional
    public AuthResponse register(RegisterRequest request) {

        if (request == null) {
            throw new IllegalArgumentException(
                    "Registration request is required"
            );
        }

        String email = clean(request.getEmail());

        if (email == null) {
            throw new IllegalArgumentException(
                    "Email is required"
            );
        }

        if (request.getPassword() == null ||
                request.getPassword().isBlank()) {

            throw new IllegalArgumentException(
                    "Password is required"
            );
        }

        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException(
                    "Email already registered"
            );
        }

        /*
         * --------------------------------------------------------
         * Resolve public registration role safely.
         * --------------------------------------------------------
         *
         * Only CANDIDATE and EMPLOYER are allowed through the
         * public registration endpoint.
         *
         * ADMIN and VERIFIER cannot be created through this
         * endpoint.
         */
        String requestedRole =
                request.getRole() == null
                        ? ""
                        : request.getRole().trim().toUpperCase();

        if (!requestedRole.equals("CANDIDATE") &&
                !requestedRole.equals("EMPLOYER")) {

            throw new IllegalArgumentException(
                    "Public registration is only available for candidates and employers."
            );
        }

        Role registrationRole =
                roleRepository
                        .findByName(requestedRole)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        requestedRole +
                                                " role does not exist"
                                )
                        );

        /*
         * --------------------------------------------------------
         * Create user.
         * --------------------------------------------------------
         */
        User user =
                User.builder()
                        .firstName(
                                clean(request.getFirstName())
                        )
                        .lastName(
                                clean(request.getLastName())
                        )
                        .email(email)
                        .passwordHash(
                                passwordEncoder.encode(
                                        request.getPassword()
                                )
                        )
                        .roles(new HashSet<>())
                        .enabled(true)
                        .build();

        user.getRoles().add(registrationRole);

        User savedUser =
                userRepository.save(user);

        /*
         * --------------------------------------------------------
         * Candidate-specific setup.
         * --------------------------------------------------------
         *
         * Employers must NOT receive a CandidateProfile.
         */
        if ("CANDIDATE".equals(requestedRole)) {

            CandidateProfile candidateProfile =
                    CandidateProfile.builder()
                            .userId(savedUser.getId())
                            .yearsExperience(0)
                            .profileCompletion(0)
                            .build();

            candidateProfileRepository.save(
                    candidateProfile
            );

            auditService.log(
                    savedUser.getId(),
                    "CANDIDATE_REGISTERED",
                    "Candidate account registered: " +
                            savedUser.getEmail()
            );

        } else if ("EMPLOYER".equals(requestedRole)) {

            auditService.log(
                    savedUser.getId(),
                    "EMPLOYER_REGISTERED",
                    "Employer account registered: " +
                            savedUser.getEmail()
            );
        }

        /*
         * --------------------------------------------------------
         * Issue JWT immediately.
         * --------------------------------------------------------
         *
         * The frontend can immediately use this token to access
         * employer/candidate protected endpoints.
         */
        String token =
                jwtService.generateToken(
                        savedUser.getEmail()
                );

        return AuthResponse.builder()
                .accessToken(token)
                .refreshToken(null)
                .role(registrationRole.getName())
                .build();
    }

    /*
     * ============================================================
     * LOGIN
     * ============================================================
     */
    @Transactional
    public AuthResponse login(LoginRequest request) {

        if (request == null) {
            throw new IllegalArgumentException(
                    "Login request is required"
            );
        }

        String email = clean(request.getEmail());

        if (email == null ||
                request.getPassword() == null) {

            throw new RuntimeException(
                    "Invalid credentials"
            );
        }

        User user =
                userRepository
                        .findByEmail(email)
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
     * ============================================================
     * FORGOT PASSWORD
     * ============================================================
     *
     * Uses the existing PasswordResetToken model:
     *
     * user     -> User relationship
     * usedAt   -> null until the token is consumed
     */
    @Transactional
    public PasswordResetResponse forgotPassword(
            ForgotPasswordRequest request
    ) {

        if (request == null) {
            throw new IllegalArgumentException(
                    "Forgot password request is required"
            );
        }

        String email =
                request.getEmail() == null
                        ? null
                        : request.getEmail().trim();

        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException(
                    "Email is required"
            );
        }

        User user =
                userRepository
                        .findByEmail(email)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "No account found for this email"
                                )
                        );

        /*
         * Remove any existing active reset tokens for this user.
         *
         * PasswordResetToken uses:
         *
         *     user
         *     usedAt
         *
         * rather than userId/used.
         */
        passwordResetTokenRepository
                .deleteActiveTokensForUser(user);

        byte[] randomBytes =
                new byte[32];

        new SecureRandom()
                .nextBytes(randomBytes);

        String token =
                Base64.getUrlEncoder()
                        .withoutPadding()
                        .encodeToString(randomBytes);

        PasswordResetToken resetToken =
                PasswordResetToken.builder()
                        .user(user)
                        .token(token)
                        .expiresAt(
                                LocalDateTime.now()
                                        .plusMinutes(30)
                        )
                        .build();

        passwordResetTokenRepository.save(
                resetToken
        );

        /*
         * Temporary development behavior.
         *
         * Replace with email delivery when mail infrastructure
         * is connected.
         */
        System.out.println(
                "PASSWORD RESET TOKEN for " +
                        email +
                        ": " +
                        token
        );

        auditService.log(
                user.getId(),
                "PASSWORD_RESET_REQUESTED",
                "Password reset requested"
        );

        return new PasswordResetResponse(
                "Password reset instructions have been generated."
        );
    }

    /*
     * ============================================================
     * RESET PASSWORD
     * ============================================================
     *
     * Uses the existing PasswordResetToken model and marks the
     * token as used by setting usedAt.
     */
    @Transactional
    public PasswordResetResponse resetPassword(
            ResetPasswordRequest request
    ) {

        if (request == null ||
                request.getToken() == null ||
                request.getToken().isBlank()) {

            throw new IllegalArgumentException(
                    "Reset token is required"
            );
        }

        if (request.getNewPassword() == null ||
                request.getNewPassword().isBlank()) {

            throw new IllegalArgumentException(
                    "New password is required"
            );
        }

        PasswordResetToken resetToken =
                passwordResetTokenRepository
                        .findByToken(request.getToken())
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Invalid password reset token"
                                )
                        );

        /*
         * Token has already been consumed.
         */
        if (resetToken.isUsed()) {
            throw new RuntimeException(
                    "Password reset token has already been used"
            );
        }

        /*
         * Token has expired.
         */
        if (resetToken.getExpiresAt() == null ||
                resetToken.getExpiresAt()
                        .isBefore(LocalDateTime.now())) {

            throw new RuntimeException(
                    "Password reset token has expired"
            );
        }

        /*
         * PasswordResetToken contains the User entity directly.
         */
        User user =
                resetToken.getUser();

        if (user == null) {
            throw new RuntimeException(
                    "User account could not be found"
            );
        }

        user.setPasswordHash(
                passwordEncoder.encode(
                        request.getNewPassword()
                )
        );

        userRepository.save(user);

        /*
         * Mark token as consumed.
         *
         * PasswordResetToken uses usedAt rather than a boolean
         * used field.
         */
        resetToken.setUsedAt(
                LocalDateTime.now()
        );

        passwordResetTokenRepository.save(
                resetToken
        );

        auditService.log(
                user.getId(),
                "PASSWORD_RESET_COMPLETED",
                "Password was successfully reset"
        );

        return new PasswordResetResponse(
                "Password has been reset successfully."
        );
    }

    /*
     * ============================================================
     * HELPERS
     * ============================================================
     */
    private String clean(String value) {

        if (value == null ||
                value.isBlank()) {

            return null;
        }

        return value.trim();
    }
}
