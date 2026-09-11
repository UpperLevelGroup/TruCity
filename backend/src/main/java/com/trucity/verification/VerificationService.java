package com.trucity.verification;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class VerificationService {

    @PersistenceContext
    private EntityManager entityManager;

    private final VerificationRepository verificationRepository;

    private final VerificationResultRepository verificationResultRepository;


    /*
     * =========================================================
     * GET ALL VERIFICATIONS
     * =========================================================
     */

    public List<VerificationResponse> getAllVerifications() {

        List<Object[]> rows = entityManager
                .createNativeQuery("""
                        SELECT
                            vr.id,
                            vr.candidate_id,

                            CONCAT(
                                COALESCE(u.first_name, ''),
                                CASE
                                    WHEN u.first_name IS NOT NULL
                                     AND u.last_name IS NOT NULL
                                    THEN ' '
                                    ELSE ''
                                END,
                                COALESCE(u.last_name, '')
                            ) AS candidate_name,

                            u.email,

                            vr.verification_type,
                            vr.status,
                            vr.submitted_at,

                            vres.verifier_name,
                            vres.result,
                            vres.notes,
                            vres.verified_at

                        FROM verification_requests vr

                        JOIN candidate_profiles cp
                            ON cp.id = vr.candidate_id

                        JOIN users u
                            ON u.id = cp.user_id

                        LEFT JOIN verification_results vres
                            ON vres.request_id = vr.id

                        ORDER BY vr.submitted_at DESC
                        """)
                .getResultList();


        List<VerificationResponse> verifications =
                new ArrayList<>();


        for (Object result : rows) {

            Object[] row = (Object[]) result;


            verifications.add(
                    new VerificationResponse(

                            row[0] != null
                                    ? UUID.fromString(row[0].toString())
                                    : null,

                            row[1] != null
                                    ? UUID.fromString(row[1].toString())
                                    : null,

                            row[2] != null
                                    ? row[2].toString().trim()
                                    : "Unknown Candidate",

                            row[3] != null
                                    ? row[3].toString()
                                    : "",

                            row[4] != null
                                    ? row[4].toString()
                                    : "UNKNOWN",

                            row[5] != null
                                    ? row[5].toString()
                                    : "UNKNOWN",

                            row[6] instanceof java.sql.Timestamp
                                    ? ((java.sql.Timestamp) row[6])
                                        .toLocalDateTime()
                                    : null,

                            row[7] != null
                                    ? row[7].toString()
                                    : null,

                            row[8] != null
                                    ? row[8].toString()
                                    : null,

                            row[9] != null
                                    ? row[9].toString()
                                    : null,

                            row[10] instanceof java.sql.Timestamp
                                    ? ((java.sql.Timestamp) row[10])
                                        .toLocalDateTime()
                                    : null
                    )
            );
        }

        return verifications;
    }


    /*
     * =========================================================
     * UPDATE VERIFICATION
     * =========================================================
     */

    @Transactional
    public VerificationResponse reviewVerification(
            UUID verificationId,
            VerificationReviewRequest request,
            String verifierName
    ) {

        Verification verification =
                verificationRepository
                        .findById(verificationId)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Verification request not found."
                                )
                        );


        String status =
                request.status() != null
                        ? request.status().trim().toUpperCase()
                        : null;


        if (status == null || status.isBlank()) {

            throw new IllegalArgumentException(
                    "Verification status is required."
            );
        }


        if (!status.equals("VERIFIED")
                && !status.equals("REJECTED")
                && !status.equals("IN_PROGRESS")
                && !status.equals("PENDING")) {

            throw new IllegalArgumentException(
                    "Invalid verification status."
            );
        }


        /*
         * Update verification request
         */

        verification.setStatus(status);

        verificationRepository.save(verification);


        /*
         * Create or update verification result
         */

        VerificationResult result =
                verificationResultRepository
                        .findByRequestId(verificationId)
                        .orElseGet(
                                VerificationResult::new
                        );


        result.setRequestId(
                verificationId
        );

        result.setVerifierName(
                verifierName
        );

        result.setResult(
                status
        );

        result.setNotes(
                request.notes()
        );


        /*
         * Only completed decisions get a
         * verified timestamp.
         */

        if (status.equals("VERIFIED")
                || status.equals("REJECTED")) {

            result.setVerifiedAt(
                    LocalDateTime.now()
            );

        } else {

            result.setVerifiedAt(null);

        }


        verificationResultRepository.save(result);


        /*
         * Return updated verification
         */

        return getVerificationById(
                verificationId
        );
    }


    /*
     * =========================================================
     * GET SINGLE VERIFICATION
     * =========================================================
     */

    public VerificationResponse getVerificationById(
            UUID verificationId
    ) {

        List<Object[]> rows = entityManager
                .createNativeQuery("""
                        SELECT
                            vr.id,
                            vr.candidate_id,

                            CONCAT(
                                COALESCE(u.first_name, ''),
                                CASE
                                    WHEN u.first_name IS NOT NULL
                                     AND u.last_name IS NOT NULL
                                    THEN ' '
                                    ELSE ''
                                END,
                                COALESCE(u.last_name, '')
                            ) AS candidate_name,

                            u.email,

                            vr.verification_type,
                            vr.status,
                            vr.submitted_at,

                            vres.verifier_name,
                            vres.result,
                            vres.notes,
                            vres.verified_at

                        FROM verification_requests vr

                        JOIN candidate_profiles cp
                            ON cp.id = vr.candidate_id

                        JOIN users u
                            ON u.id = cp.user_id

                        LEFT JOIN verification_results vres
                            ON vres.request_id = vr.id

                        WHERE vr.id = :id
                        """)
                .setParameter("id", verificationId)
                .getResultList();


        if (rows.isEmpty()) {

            throw new RuntimeException(
                    "Verification request not found."
            );
        }


        Object[] row = rows.get(0);


        return new VerificationResponse(

                row[0] != null
                        ? UUID.fromString(row[0].toString())
                        : null,

                row[1] != null
                        ? UUID.fromString(row[1].toString())
                        : null,

                row[2] != null
                        ? row[2].toString().trim()
                        : "Unknown Candidate",

                row[3] != null
                        ? row[3].toString()
                        : "",

                row[4] != null
                        ? row[4].toString()
                        : "UNKNOWN",

                row[5] != null
                        ? row[5].toString()
                        : "UNKNOWN",

                row[6] instanceof java.sql.Timestamp
                        ? ((java.sql.Timestamp) row[6])
                            .toLocalDateTime()
                        : null,

                row[7] != null
                        ? row[7].toString()
                        : null,

                row[8] != null
                        ? row[8].toString()
                        : null,

                row[9] != null
                        ? row[9].toString()
                        : null,

                row[10] instanceof java.sql.Timestamp
                        ? ((java.sql.Timestamp) row[10])
                            .toLocalDateTime()
                        : null
        );
    }
}