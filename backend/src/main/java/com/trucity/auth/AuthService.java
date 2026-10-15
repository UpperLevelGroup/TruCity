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

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HashSet;
import java.util.Locale;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private static final int RESET_TOKEN_BYTES = 32;
    private static final int RESET_TOKEN_EXPIRY_MINUTES = 30;

    /*
     * Generic response avoids revealing whether an email address
     * is registered. Email delivery must be connected before
     * users can actually receive reset links.
     */
    private static final String FORGOT_PASSWORD_MESSAGE =
            "If an account exists for that email, password reset instructions will be sent.";

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;
    private final CandidateProfileRepository candidateProfileRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;

    private final SecureRandom secureRandom = new SecureRandom();

    /*
     * ============================================================
     * REGISTER
     * ============================================================
     */
    @Transactional
    public AuthResponse register(RegisterRequest request) {

        if (request == null) {
            throw new IllegalArgumentException(
                    "Registration request is required"
            );
        }

        String email = cleanEmail(request.getEmail());

        if (email == null) {
            throw new IllegalArgumentException(
                    "Email is required"
            );
        }

        if (request.getPassword() == null
                || request.getPassword().isBlank()) {
            throw new IllegalArgumentException(
                    "Password is required"
            );
        }

        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException(
                    "Unable to register with the supplied details."
            );
        }

        String requestedRole = request.getRole() == null
                ? ""
                : request.getRole().trim().toUpperCase(Locale.ROOT);

        if (!requestedRole.equals("CANDIDATE")
                && !requestedRole.equals("EMPLOYER")) {
            throw new IllegalArgumentException(
                    "Public registration is only available for candidates and employers."
            );
        }

        Role registrationRole = roleRepository
                .findByName(requestedRole)
                .orElseThrow(() -> new IllegalStateException(
                        "Registration is temporarily unavailable."
                ));

        User user = User.builder()
                .firstName(clean(request.getFirstName()))
                .lastName(clean(request.getLastName()))
                .email(email)
                .passwordHash(
                        passwordEncoder.encode(request.getPassword())
                )
                .roles(new HashSet<>())
                .enabled(true)
                .build();

        user.getRoles().add(registrationRole);

        User savedUser = userRepository.save(user);

        if ("CANDIDATE".equals(requestedRole)) {

            CandidateProfile candidateProfile =
                    CandidateProfile.builder()
                            .userId(savedUser.getId())
                            .yearsExperience(0)
                            .profileCompletion(0)
                            .build();

            candidateProfileRepository.save(candidateProfile);

            auditService.log(
                    savedUser.getId(),
                    "CANDIDATE_REGISTERED",
                    "Candidate account registered"
            );

        } else {

            auditService.log(
                    savedUser.getId(),
                    "EMPLOYER_REGISTERED",
                    "Employer account registered"
            );
        }

        String token = jwtService.generateToken(savedUser.getEmail());

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
                    "Invalid email or password."
            );
        }

        String email = cleanEmail(request.getEmail());

        if (email == null || request.getPassword() == null) {
            throw new IllegalArgumentException(
                    "Invalid email or password."
            );
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Invalid email or password."
                ));

        if (!user.isEnabled()
                || !passwordEncoder.matches(
                        request.getPassword(),
                        user.getPasswordHash()
                )) {
            throw new IllegalArgumentException(
                    "Invalid email or password."
            );
        }

        auditService.log(
                user.getId(),
                "USER_LOGIN",
                "User signed in successfully"
        );

        String token = jwtService.generateToken(user.getEmail());

        String userRole = user.getRoles()
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
     * The raw token is never logged or stored.
     *
     * IMPORTANT:
     * Connect an email service to deliver the raw token as a
     * one-time reset link. This implementation intentionally does
     * not return the token in the API response.
     */
    @Transactional
    public PasswordResetResponse forgotPassword(
            ForgotPasswordRequest request
    ) {

        if (request == null
                || cleanEmail(request.getEmail()) == null) {
            return new PasswordResetResponse(
                    FORGOT_PASSWORD_MESSAGE
            );
        }

        String email = cleanEmail(request.getEmail());

        Optional<User> optionalUser = userRepository.findByEmail(email);

        if (optionalUser.isEmpty()) {
            return new PasswordResetResponse(
                    FORGOT_PASSWORD_MESSAGE
            );
        }

        User user = optionalUser.get();

        /*
         * Delete previous tokens before creating a new one.
         */
        passwordResetTokenRepository.deleteActiveTokensForUser(user);

        byte[] randomBytes = new byte[RESET_TOKEN_BYTES];
        secureRandom.nextBytes(randomBytes);

        String rawToken = Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(randomBytes);

        String tokenHash = hashToken(rawToken);

        PasswordResetToken resetToken = PasswordResetToken.builder()
                .user(user)
                .token(tokenHash)
                .expiresAt(
                        LocalDateTime.now()
                                .plusMinutes(RESET_TOKEN_EXPIRY_MINUTES)
                )
                .build();

        passwordResetTokenRepository.save(resetToken);

        /*
         * TODO: Deliver a reset link through a configured email
         * service. The link should contain rawToken and should
         * use the trusted frontend base URL.
         *
         * Never log rawToken, tokenHash, or a complete reset URL.
         */

        auditService.log(
                user.getId(),
                "PASSWORD_RESET_REQUESTED",
                "Password reset requested"
        );

        return new PasswordResetResponse(
                FORGOT_PASSWORD_MESSAGE
        );
    }

    /*
     * ============================================================
     * RESET PASSWORD
     * ============================================================
     *
     * The frontend submits the raw token received by email.
     * The database lookup uses its SHA-256 hash.
     */
    @Transactional
    public PasswordResetResponse resetPassword(
            ResetPasswordRequest request
    ) {

        if (request == null
                || request.getToken() == null
                || request.getToken().isBlank()) {
            throw new IllegalArgumentException(
                    "Invalid or expired password reset link."
            );
        }

        if (request.getNewPassword() == null
                || request.getNewPassword().isBlank()) {
            throw new IllegalArgumentException(
                    "A new password is required."
            );
        }

        String tokenHash = hashToken(request.getToken().trim());

        PasswordResetToken resetToken =
                passwordResetTokenRepository.findByToken(tokenHash)
                        .orElseThrow(() -> new IllegalArgumentException(
                                "Invalid or expired password reset link."
                        ));

        if (resetToken.isUsed() || resetToken.isExpired()) {
            throw new IllegalArgumentException(
                    "Invalid or expired password reset link."
            );
        }

        User user = resetToken.getUser();

        if (user == null) {
            throw new IllegalArgumentException(
                    "Invalid or expired password reset link."
            );
        }

        user.setPasswordHash(
                passwordEncoder.encode(request.getNewPassword())
        );

        userRepository.save(user);

        resetToken.setUsedAt(LocalDateTime.now());
        passwordResetTokenRepository.save(resetToken);

        /*
         * Invalidate other outstanding reset tokens for this user.
         */
        passwordResetTokenRepository.deleteActiveTokensForUser(user);

        auditService.log(
                user.getId(),
                "PASSWORD_RESET_COMPLETED",
                "Password was successfully reset"
        );

        /*
         * Existing JWTs remain valid until expiry unless JWT
         * revocation/version checking is implemented separately.
         */
        return new PasswordResetResponse(
                "Password has been reset successfully. Please sign in again."
        );
    }

    /*
     * ============================================================
     * HELPERS
     * ============================================================
     */
    private String clean(String value) {

        if (value == null || value.isBlank()) {
            return null;
        }

        return value.trim();
    }

    private String cleanEmail(String value) {

        if (value == null || value.isBlank()) {
            return null;
        }

        return value.trim().toLowerCase(Locale.ROOT);
    }

    private String hashToken(String token) {

        try {
            MessageDigest digest =
                    MessageDigest.getInstance("SHA-256");

            byte[] hash = digest.digest(
                    token.getBytes(StandardCharsets.UTF_8)
            );

            return Base64.getUrlEncoder()
                    .withoutPadding()
                    .encodeToString(hash);

        } catch (NoSuchAlgorithmException exception) {
            /*
             * SHA-256 is required by Java. Fail safely if the
             * runtime unexpectedly does not provide it.
             */
            throw new IllegalStateException(
                    "Password reset is temporarily unavailable."
            );
        }
    }
}
