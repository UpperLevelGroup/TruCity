package com.trucity.report;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminReportService {

    @PersistenceContext
    private EntityManager entityManager;


    /*
     * =====================================================
     * MAIN REPORT
     * =====================================================
     */

    public AdminReportResponse getReport(int period) {

        int safePeriod =
                normalizePeriod(period);

        LocalDateTime from =
                LocalDateTime.now()
                        .minusDays(safePeriod);

        AdminReportResponse.Overview overview =
                getOverview();

        AdminReportResponse.UserReport users =
                getUserReport(from);

        AdminReportResponse.JobReport jobs =
                getJobReport(from);

        AdminReportResponse.ApplicationReport applications =
                getApplicationReport(from);

        AdminReportResponse.VerificationReport verifications =
                getVerificationReport(from);

        List<AdminReportResponse.DailyActivity> dailyActivity =
                getDailyActivity(from);


        return new AdminReportResponse(
                String.valueOf(safePeriod),
                LocalDateTime.now().toString(),
                overview,
                users,
                jobs,
                applications,
                verifications,
                dailyActivity
        );
    }


    /*
     * =====================================================
     * OVERVIEW
     * =====================================================
     */

    private AdminReportResponse.Overview getOverview() {

        long totalUsers =
                count(
                        "SELECT COUNT(*) FROM users"
                );


        long candidates =
                count("""
                        SELECT COUNT(DISTINCT u.id)
                        FROM users u
                        JOIN user_roles ur
                            ON ur.user_id = u.id
                        JOIN roles r
                            ON r.id = ur.role_id
                        WHERE UPPER(r.name) = 'CANDIDATE'
                        """
                );


        long employers =
                count("""
                        SELECT COUNT(DISTINCT u.id)
                        FROM users u
                        JOIN user_roles ur
                            ON ur.user_id = u.id
                        JOIN roles r
                            ON r.id = ur.role_id
                        WHERE UPPER(r.name) = 'EMPLOYER'
                        """
                );


        long jobs =
                count(
                        "SELECT COUNT(*) FROM jobs"
                );


        long applications =
                count(
                        "SELECT COUNT(*) FROM applications"
                );


        long verifications =
                count(
                        "SELECT COUNT(*) FROM verification_requests"
                );


        return new AdminReportResponse.Overview(
                totalUsers,
                candidates,
                employers,
                jobs,
                applications,
                verifications
        );
    }


    /*
     * =====================================================
     * USER REPORT
     * =====================================================
     */

    private AdminReportResponse.UserReport getUserReport(
            LocalDateTime from
    ) {

        long newUsers =
                count("""
                        SELECT COUNT(*)
                        FROM users
                        WHERE created_at >= :from
                        """,
                        from
                );


        long newCandidates =
                count("""
                        SELECT COUNT(DISTINCT u.id)
                        FROM users u
                        JOIN user_roles ur
                            ON ur.user_id = u.id
                        JOIN roles r
                            ON r.id = ur.role_id
                        WHERE UPPER(r.name) = 'CANDIDATE'
                          AND u.created_at >= :from
                        """,
                        from
                );


        long newEmployers =
                count("""
                        SELECT COUNT(DISTINCT u.id)
                        FROM users u
                        JOIN user_roles ur
                            ON ur.user_id = u.id
                        JOIN roles r
                            ON r.id = ur.role_id
                        WHERE UPPER(r.name) = 'EMPLOYER'
                          AND u.created_at >= :from
                        """,
                        from
                );


        return new AdminReportResponse.UserReport(
                newUsers,
                newCandidates,
                newEmployers
        );
    }


    /*
     * =====================================================
     * JOB REPORT
     * =====================================================
     */

    private AdminReportResponse.JobReport getJobReport(
            LocalDateTime from
    ) {

        long total =
                count(
                        "SELECT COUNT(*) FROM jobs"
                );


        long created =
                count("""
                        SELECT COUNT(*)
                        FROM jobs
                        WHERE created_at >= :from
                        """,
                        from
                );


        long active =
                count("""
                        SELECT COUNT(*)
                        FROM jobs
                        WHERE UPPER(status) = 'ACTIVE'
                        """
                );


        long pending =
                count("""
                        SELECT COUNT(*)
                        FROM jobs
                        WHERE UPPER(status) = 'PENDING'
                        """
                );


        long closed =
                count("""
                        SELECT COUNT(*)
                        FROM jobs
                        WHERE UPPER(status) = 'CLOSED'
                        """
                );


        return new AdminReportResponse.JobReport(
                total,
                created,
                active,
                pending,
                closed
        );
    }


    /*
     * =====================================================
     * APPLICATION REPORT
     * =====================================================
     */

    private AdminReportResponse.ApplicationReport getApplicationReport(
            LocalDateTime from
    ) {

        long total =
                count("""
                        SELECT COUNT(*)
                        FROM applications
                        WHERE applied_at >= :from
                        """,
                        from
                );


        List<AdminReportResponse.StatusCount> statuses =
                getStatusCounts(
                        """
                        SELECT
                            COALESCE(status, 'UNKNOWN'),
                            COUNT(*)
                        FROM applications
                        WHERE applied_at >= :from
                        GROUP BY status
                        ORDER BY COUNT(*) DESC
                        """,
                        from
                );


        return new AdminReportResponse.ApplicationReport(
                total,
                statuses
        );
    }


    /*
     * =====================================================
     * VERIFICATION REPORT
     * =====================================================
     */

    private AdminReportResponse.VerificationReport getVerificationReport(
            LocalDateTime from
    ) {

        long total =
                count("""
                        SELECT COUNT(*)
                        FROM verification_requests
                        WHERE submitted_at >= :from
                        """,
                        from
                );


        List<AdminReportResponse.StatusCount> statuses =
                getStatusCounts(
                        """
                        SELECT
                            COALESCE(status, 'UNKNOWN'),
                            COUNT(*)
                        FROM verification_requests
                        WHERE submitted_at >= :from
                        GROUP BY status
                        ORDER BY COUNT(*) DESC
                        """,
                        from
                );


        return new AdminReportResponse.VerificationReport(
                total,
                statuses
        );
    }


    /*
     * =====================================================
     * DAILY ACTIVITY
     *
     * IMPORTANT:
     *
     * PostgreSQL/Supabase may return the generated date as:
     *
     * 2026-08-03
     *
     * OR:
     *
     * 2026-08-03T00:00:00Z
     *
     * OR a java.sql.Date / Timestamp.
     *
     * This method handles all of those safely.
     * =====================================================
     */

    private List<AdminReportResponse.DailyActivity> getDailyActivity(
            LocalDateTime from
    ) {

        LocalDate startDate =
                from.toLocalDate();


        List<AdminReportResponse.DailyActivity> activity =
                new ArrayList<>();


        List<?> rows =
                entityManager
                        .createNativeQuery(
                                """
                                SELECT
                                    dates.activity_date,

                                    (
                                        SELECT COUNT(*)
                                        FROM users u
                                        WHERE u.created_at >= dates.activity_date
                                          AND u.created_at < dates.activity_date + INTERVAL '1 day'
                                    ) AS users,

                                    (
                                        SELECT COUNT(*)
                                        FROM jobs j
                                        WHERE j.created_at >= dates.activity_date
                                          AND j.created_at < dates.activity_date + INTERVAL '1 day'
                                    ) AS jobs,

                                    (
                                        SELECT COUNT(*)
                                        FROM applications a
                                        WHERE a.applied_at >= dates.activity_date
                                          AND a.applied_at < dates.activity_date + INTERVAL '1 day'
                                    ) AS applications,

                                    (
                                        SELECT COUNT(*)
                                        FROM verification_requests v
                                        WHERE v.submitted_at >= dates.activity_date
                                          AND v.submitted_at < dates.activity_date + INTERVAL '1 day'
                                    ) AS verifications

                                FROM generate_series(
                                    CAST(:startDate AS date),
                                    CURRENT_DATE,
                                    INTERVAL '1 day'
                                ) AS dates(activity_date)

                                ORDER BY dates.activity_date
                                """
                        )
                        .setParameter(
                                "startDate",
                                startDate
                        )
                        .getResultList();


        for (Object result : rows) {

            Object[] row =
                    (Object[]) result;


            /*
             * Convert database date safely.
             */
            LocalDate date =
                    parseDatabaseDate(
                            row[0]
                    );


            long users =
                    number(row[1]);


            long jobs =
                    number(row[2]);


            long applications =
                    number(row[3]);


            long verifications =
                    number(row[4]);


            activity.add(
                    new AdminReportResponse.DailyActivity(
                            date.toString(),
                            users,
                            jobs,
                            applications,
                            verifications
                    )
            );
        }


        return activity;
    }


    /*
     * =====================================================
     * DATABASE DATE PARSER
     * =====================================================
     */

    private LocalDate parseDatabaseDate(
            Object value
    ) {

        if (value == null) {

            return LocalDate.now();
        }


        /*
         * PostgreSQL DATE
         */
        if (value instanceof java.sql.Date sqlDate) {

            return sqlDate.toLocalDate();
        }


        /*
         * PostgreSQL TIMESTAMP
         */
        if (value instanceof java.sql.Timestamp timestamp) {

            return timestamp
                    .toLocalDateTime()
                    .toLocalDate();
        }


        /*
         * Java LocalDate
         */
        if (value instanceof LocalDate localDate) {

            return localDate;
        }


        /*
         * Java LocalDateTime
         */
        if (value instanceof LocalDateTime localDateTime) {

            return localDateTime.toLocalDate();
        }


        /*
         * Java OffsetDateTime
         */
        if (value instanceof OffsetDateTime offsetDateTime) {

            return offsetDateTime.toLocalDate();
        }


        /*
         * Java Instant
         */
        if (value instanceof Instant instant) {

            return instant
                    .atZone(
                            ZoneId.systemDefault()
                    )
                    .toLocalDate();
        }


        /*
         * String returned by PostgreSQL/JDBC.
         */
        String text =
                value.toString().trim();


        /*
         * Normal DATE:
         *
         * 2026-08-03
         */
        if (text.matches(
                "\\d{4}-\\d{2}-\\d{2}"
        )) {

            return LocalDate.parse(
                    text
            );
        }


        /*
         * ISO timestamp with offset:
         *
         * 2026-08-03T00:00:00Z
         */
        try {

            return OffsetDateTime
                    .parse(text)
                    .toLocalDate();

        } catch (Exception ignored) {
            // Continue with next parser.
        }


        /*
         * ISO local timestamp:
         *
         * 2026-08-03T00:00:00
         */
        try {

            return LocalDateTime
                    .parse(text)
                    .toLocalDate();

        } catch (Exception ignored) {
            // Continue with final fallback.
        }


        /*
         * Last-resort extraction of the date portion.
         */
        if (text.length() >= 10) {

            String datePart =
                    text.substring(
                            0,
                            10
                    );

            try {

                return LocalDate.parse(
                        datePart
                );

            } catch (Exception ignored) {
                // Fall through.
            }
        }


        throw new IllegalArgumentException(
                "Unable to parse database date: "
                        + text
        );
    }


    /*
     * =====================================================
     * STATUS COUNTS
     * =====================================================
     */

    private List<AdminReportResponse.StatusCount> getStatusCounts(
            String query,
            LocalDateTime from
    ) {

        List<?> rows =
                entityManager
                        .createNativeQuery(query)
                        .setParameter(
                                "from",
                                from
                        )
                        .getResultList();


        List<AdminReportResponse.StatusCount> result =
                new ArrayList<>();


        for (Object rowObject : rows) {

            Object[] row =
                    (Object[]) rowObject;


            String status =
                    row[0] != null
                            ? row[0].toString()
                            : "UNKNOWN";


            long count =
                    number(row[1]);


            result.add(
                    new AdminReportResponse.StatusCount(
                            status,
                            count
                    )
            );
        }


        return result;
    }


    /*
     * =====================================================
     * COUNT
     * =====================================================
     */

    private long count(
            String query
    ) {

        Number result =
                (Number)
                        entityManager
                                .createNativeQuery(
                                        query
                                )
                                .getSingleResult();


        return result.longValue();
    }


    /*
     * =====================================================
     * COUNT WITH DATE
     * =====================================================
     */

    private long count(
            String query,
            LocalDateTime from
    ) {

        Number result =
                (Number)
                        entityManager
                                .createNativeQuery(
                                        query
                                )
                                .setParameter(
                                        "from",
                                        from
                                )
                                .getSingleResult();


        return result.longValue();
    }


    /*
     * =====================================================
     * SAFE NUMBER
     * =====================================================
     */

    private long number(
            Object value
    ) {

        if (value instanceof Number number) {

            return number.longValue();
        }


        if (value == null) {

            return 0;
        }


        return Long.parseLong(
                value.toString()
        );
    }


    /*
     * =====================================================
     * PERIOD VALIDATION
     * =====================================================
     */

    private int normalizePeriod(
            int period
    ) {

        return switch (period) {

            case 7 ->
                    7;

            case 30 ->
                    30;

            case 90 ->
                    90;

            case 365 ->
                    365;

            default ->
                    30;
        };
    }
}