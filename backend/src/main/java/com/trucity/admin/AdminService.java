package com.trucity.admin;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminService {

    @PersistenceContext
    private EntityManager entityManager;


    /*
     * =========================================================
     * DASHBOARD
     * =========================================================
     */

    public DashboardResponse getDashboard() {

        Number totalUsers = (Number) entityManager
                .createNativeQuery("""
                        SELECT COUNT(*)
                        FROM users
                        """)
                .getSingleResult();

        Number candidates = (Number) entityManager
                .createNativeQuery("""
                        SELECT COUNT(DISTINCT u.id)
                        FROM users u
                        JOIN user_roles ur
                            ON ur.user_id = u.id
                        JOIN roles r
                            ON r.id = ur.role_id
                        WHERE r.name = 'CANDIDATE'
                        """)
                .getSingleResult();

        Number employers = (Number) entityManager
                .createNativeQuery("""
                        SELECT COUNT(DISTINCT u.id)
                        FROM users u
                        JOIN user_roles ur
                            ON ur.user_id = u.id
                        JOIN roles r
                            ON r.id = ur.role_id
                        WHERE r.name = 'EMPLOYER'
                        """)
                .getSingleResult();

        Number jobs = (Number) entityManager
                .createNativeQuery("""
                        SELECT COUNT(*)
                        FROM jobs
                        """)
                .getSingleResult();

        List<ActivityResponse> activity = getRecentActivity();

        return new DashboardResponse(
                totalUsers.longValue(),
                candidates.longValue(),
                employers.longValue(),
                jobs.longValue(),
                activity
        );
    }


    /*
     * =========================================================
     * USERS
     * =========================================================
     */

    public List<UserResponse> getUsers() {

        List<?> rawRows = entityManager
                .createNativeQuery("""
                        SELECT
                            u.id,
                            u.first_name,
                            u.last_name,
                            u.email,
                            COALESCE(
                                STRING_AGG(DISTINCT r.name, ', '
                                    ORDER BY r.name),
                                'UNKNOWN'
                            ),
                            u.is_verified,
                            u.created_at
                        FROM users u
                        LEFT JOIN user_roles ur
                            ON ur.user_id = u.id
                        LEFT JOIN roles r
                            ON r.id = ur.role_id
                        GROUP BY
                            u.id,
                            u.first_name,
                            u.last_name,
                            u.email,
                            u.is_verified,
                            u.created_at
                        ORDER BY u.created_at DESC
                        """)
                .getResultList();

        List<UserResponse> users = new ArrayList<>();

        for (Object result : rawRows) {

            Object[] row = (Object[]) result;

            users.add(
                    new UserResponse(
                            value(row[0]),
                            valueOrDefault(row[1], ""),
                            valueOrDefault(row[2], ""),
                            valueOrDefault(row[3], ""),
                            valueOrDefault(row[4], "UNKNOWN"),
                            booleanValue(row[5]),
                            value(row[6])
                    )
            );
        }

        return users;
    }


    /*
     * =========================================================
     * CANDIDATES
     * =========================================================
     */

    public List<CandidateResponse> getCandidates() {

        List<?> rawRows = entityManager
                .createNativeQuery("""
                        SELECT DISTINCT
                            u.id,
                            u.first_name,
                            u.last_name,
                            u.email,
                            cp.location,
                            u.is_verified,
                            u.created_at
                        FROM users u
                        JOIN user_roles ur
                            ON ur.user_id = u.id
                        JOIN roles r
                            ON r.id = ur.role_id
                        LEFT JOIN candidate_profiles cp
                            ON cp.user_id = u.id
                        WHERE r.name = 'CANDIDATE'
                        ORDER BY u.created_at DESC
                        """)
                .getResultList();

        List<CandidateResponse> candidates = new ArrayList<>();

        for (Object result : rawRows) {

            Object[] row = (Object[]) result;

            candidates.add(
                    new CandidateResponse(
                            value(row[0]),
                            valueOrDefault(row[1], ""),
                            valueOrDefault(row[2], ""),
                            valueOrDefault(row[3], ""),
                            value(row[4]),
                            booleanValue(row[5]),
                            value(row[6])
                    )
            );
        }

        return candidates;
    }


    /*
     * =========================================================
     * COMPANIES / EMPLOYERS
     * =========================================================
     */

    public List<EmployerResponse> getEmployers() {

        List<?> rawRows = entityManager
                .createNativeQuery("""
                        SELECT DISTINCT
                            c.id,
                            c.name,
                            u.email,
                            c.industry,
                            COALESCE(u.is_verified, false),
                            c.created_at
                        FROM companies c
                        LEFT JOIN employer_profiles ep
                            ON ep.company_id = c.id
                        LEFT JOIN users u
                            ON u.id = ep.user_id
                        LEFT JOIN user_roles ur
                            ON ur.user_id = u.id
                        LEFT JOIN roles r
                            ON r.id = ur.role_id
                        ORDER BY c.created_at DESC
                        """)
                .getResultList();

        List<EmployerResponse> employers = new ArrayList<>();

        for (Object result : rawRows) {

            Object[] row = (Object[]) result;

            employers.add(
                    new EmployerResponse(
                            value(row[0]),
                            valueOrDefault(
                                    row[1],
                                    "Unnamed Company"
                            ),
                            valueOrDefault(
                                    row[2],
                                    "No employer email"
                            ),
                            value(row[3]),
                            booleanValue(row[4]),
                            "ACTIVE"
                    )
            );
        }

        return employers;
    }


    /*
     * =========================================================
     * RECENT ACTIVITY
     * =========================================================
     *
     * This reads REAL audit records from the database.
     *
     * Any backend operation that inserts into audit_logs
     * automatically becomes visible here.
     */

    private List<ActivityResponse> getRecentActivity() {

        List<?> rawRows = entityManager
                .createNativeQuery("""
                        SELECT
                            a.action,
                            a.description,
                            a.created_at,
                            COALESCE(
                                u.email,
                                'System'
                            )
                        FROM audit_logs a
                        LEFT JOIN users u
                            ON u.id = a.user_id
                        ORDER BY a.created_at DESC
                        LIMIT 15
                        """)
                .getResultList();

        List<ActivityResponse> activities = new ArrayList<>();

        for (Object result : rawRows) {

            Object[] row = (Object[]) result;

            activities.add(
                    new ActivityResponse(
                            valueOrDefault(
                                    row[0],
                                    "Activity"
                            ),
                            valueOrDefault(
                                    row[1],
                                    ""
                            ),
                            value(row[2]),
                            valueOrDefault(
                                    row[3],
                                    "System"
                            )
                    )
            );
        }

        return activities;
    }


    /*
     * =========================================================
     * SYSTEM HEALTH
     * =========================================================
     */

    public SystemHealthResponse getSystemHealth() {

        String databaseStatus = checkDatabase();

        /*
         * The API is already executing this method.
         * Therefore reaching this point means the API is
         * responding successfully.
         */
        String apiStatus = "OPERATIONAL";

        /*
         * Authentication is considered operational when
         * the application can access the users table.
         */
        String authenticationStatus;

        try {

            entityManager
                    .createNativeQuery("""
                            SELECT 1
                            FROM users
                            LIMIT 1
                            """)
                    .getResultList();

            authenticationStatus = "OPERATIONAL";

        } catch (Exception exception) {

            authenticationStatus = "ERROR";
        }

        /*
         * Verification currently depends on the verification
         * tables being accessible.
         */
        String verificationStatus;

        try {

            entityManager
                    .createNativeQuery("""
                            SELECT 1
                            FROM verifications
                            LIMIT 1
                            """)
                    .getResultList();

            verificationStatus = "OPERATIONAL";

        } catch (Exception exception) {

            verificationStatus = "ERROR";
        }

        boolean allOperational =
                databaseStatus.equals("OPERATIONAL")
                        && apiStatus.equals("OPERATIONAL")
                        && authenticationStatus.equals("OPERATIONAL")
                        && verificationStatus.equals("OPERATIONAL");

        return new SystemHealthResponse(
                databaseStatus,
                apiStatus,
                authenticationStatus,
                verificationStatus,
                allOperational
        );
    }


    private String checkDatabase() {

        try {

            entityManager
                    .createNativeQuery("SELECT 1")
                    .getSingleResult();

            return "OPERATIONAL";

        } catch (Exception exception) {

            return "ERROR";
        }
    }


    /*
     * =========================================================
     * RESPONSE TYPES
     * =========================================================
     */

    public record DashboardResponse(
            long totalUsers,
            long candidates,
            long employers,
            long jobs,
            List<ActivityResponse> recentActivity
    ) {
    }


    public record ActivityResponse(
            String action,
            String description,
            String createdAt,
            String userEmail
    ) {
    }


    public record SystemHealthResponse(
            String database,
            String api,
            String authentication,
            String verification,
            boolean allOperational
    ) {
    }


    public record UserResponse(
            String id,
            String firstName,
            String lastName,
            String email,
            String role,
            boolean verified,
            String createdAt
    ) {
    }


    public record CandidateResponse(
            String id,
            String firstName,
            String lastName,
            String email,
            String location,
            boolean verified,
            String createdAt
    ) {
    }


    public record EmployerResponse(
            String id,
            String company,
            String email,
            String industry,
            boolean verified,
            String status
    ) {
    }


    public record JobResponse(
            String id,
            String title,
            String company,
            String location,
            String type,
            String status,
            String createdAt,
            long applications
    ) {
    }


    /*
     * =========================================================
     * VALUE HELPERS
     * =========================================================
     */

    private String value(Object value) {

        return value != null
                ? value.toString()
                : null;
    }


    private String valueOrDefault(
            Object value,
            String defaultValue
    ) {

        return value != null
                ? value.toString()
                : defaultValue;
    }


    private boolean booleanValue(Object value) {

        if (value instanceof Boolean booleanValue) {
            return booleanValue;
        }

        return value != null
                && Boolean.parseBoolean(
                        value.toString()
                );
    }
}