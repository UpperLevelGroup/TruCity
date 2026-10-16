
package com.trucity.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;

@RestController
@RequestMapping("/admin/accounts")
@PreAuthorize("hasRole('ADMIN')")
public class AdminAccountManagementController {

    private final JdbcTemplate jdbcTemplate;
    private final ObjectMapper objectMapper;

    public AdminAccountManagementController(
            JdbcTemplate jdbcTemplate,
            ObjectMapper objectMapper
    ) {
        this.jdbcTemplate = jdbcTemplate;
        this.objectMapper = objectMapper;
    }

    /*
     * ACCOUNT LIST
     *
     * GET /admin/accounts
     * GET /admin/accounts?role=CANDIDATE
     * GET /admin/accounts?role=EMPLOYER
     */
    @GetMapping
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAccounts(
            @RequestParam(required = false) String role
    ) {
        String normalizedRole = role == null || role.isBlank()
                ? null
                : role.trim().toUpperCase(Locale.ROOT);

        if (normalizedRole != null
                && !Set.of("CANDIDATE", "EMPLOYER", "ADMIN", "VERIFIER")
                .contains(normalizedRole)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Unsupported account role."
            );
        }

        String sql = """
                SELECT
                    u.id::text AS id,
                    u.email,
                    u.first_name AS "firstName",
                    u.last_name AS "lastName",
                    COALESCE(u.enabled, TRUE) AS enabled,
                    u.created_at AS "createdAt",
                    to_jsonb(u)::text AS "userRecord",
                    COALESCE(
                        (
                            SELECT jsonb_agg(r.name ORDER BY r.name)
                            FROM user_roles ur
                            JOIN roles r ON r.id = ur.role_id
                            WHERE ur.user_id = u.id
                        ),
                        '[]'::jsonb
                    )::text AS "rolesJson",
                    EXISTS (
                        SELECT 1
                        FROM admin_user_flags f
                        WHERE f.user_id = u.id
                          AND COALESCE(f.resolved, FALSE) = FALSE
                    ) AS "hasOpenFlags",
                    (
                        SELECT COUNT(*)
                        FROM admin_user_flags f
                        WHERE f.user_id = u.id
                          AND COALESCE(f.resolved, FALSE) = FALSE
                    ) AS "openFlagCount",
                    u.deleted_at AS "deletedAt"
                FROM users u
                WHERE (
                    CAST(? AS text) IS NULL
                    OR EXISTS (
                        SELECT 1
                        FROM user_roles ur
                        JOIN roles r ON r.id = ur.role_id
                        WHERE ur.user_id = u.id
                          AND UPPER(r.name) = CAST(? AS text)
                    )
                )
                ORDER BY u.created_at DESC NULLS LAST
                """;

        List<Map<String, Object>> rows = jdbcTemplate.queryForList(
                sql,
                normalizedRole,
                normalizedRole
        );

        for (Map<String, Object> row : rows) {
            row.put("user", parseJson(row.remove("userRecord")));
            row.put("roles", parseJson(row.remove("rolesJson")));
            row.put("status", resolveStatus(row));
        }

        return rows;
    }

    /*
     * CANDIDATE DETAILS
     *
     * GET /admin/accounts/candidates/{userId}
     */
    @GetMapping("/candidates/{userId}")
    @Transactional(readOnly = true)
    public Map<String, Object> getCandidate(
            @PathVariable UUID userId
    ) {
        Map<String, Object> account = findUser(userId);

        List<Map<String, Object>> profiles = jdbcTemplate.queryForList(
                """
                SELECT to_jsonb(cp)::text AS profile
                FROM candidate_profiles cp
                WHERE cp.user_id = ?
                """,
                userId
        );

        List<Object> parsedProfiles = parseJsonColumn(profiles, "profile");

        account.put("profiles", parsedProfiles);
        account.put(
                "profile",
                parsedProfiles.isEmpty() ? null : parsedProfiles.get(0)
        );
        account.put("flags", getFlagsForUser(userId));
        account.put("status", resolveStatus(account));

        return account;
    }

    /*
     * EMPLOYER DETAILS
     *
     * GET /admin/accounts/employers/{userId}
     */
    @GetMapping("/employers/{userId}")
    @Transactional(readOnly = true)
    public Map<String, Object> getEmployer(
            @PathVariable UUID userId
    ) {
        Map<String, Object> account = findUser(userId);

        List<Map<String, Object>> profiles = jdbcTemplate.queryForList(
                """
                SELECT
                    to_jsonb(ep)::text AS profile,
                    CASE
                        WHEN c.id IS NULL THEN NULL
                        ELSE to_jsonb(c)::text
                    END AS company
                FROM employer_profiles ep
                LEFT JOIN companies c ON c.id = ep.company_id
                WHERE ep.user_id = ?
                """,
                userId
        );

        List<Map<String, Object>> employerProfiles = new ArrayList<>();

        for (Map<String, Object> row : profiles) {
            Map<String, Object> profile = new LinkedHashMap<>();
            profile.put("profile", parseJson(row.get("profile")));
            profile.put("company", parseJson(row.get("company")));
            employerProfiles.add(profile);
        }

        account.put("profiles", employerProfiles);
        account.put(
                "profile",
                employerProfiles.isEmpty()
                        ? null
                        : employerProfiles.get(0).get("profile")
        );
        account.put(
                "companies",
                employerProfiles.stream()
                        .map(item -> item.get("company"))
                        .filter(Objects::nonNull)
                        .toList()
        );
        account.put("flags", getFlagsForUser(userId));
        account.put("status", resolveStatus(account));

        return account;
    }

    /*
     * SUSPEND OR REACTIVATE
     *
     * PATCH /admin/accounts/users/{userId}/suspension
     * Body: {"suspended": true}
     * Body: {"suspended": false}
     */
    @PatchMapping("/users/{userId}/suspension")
    @Transactional
    public Map<String, Object> setSuspension(
            @PathVariable UUID userId,
            @RequestBody SuspensionRequest request
    ) {
        if (request == null || request.suspended() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "The suspended field is required."
            );
        }

        Map<String, Object> existing = findUser(userId);

        if ("REMOVED".equals(existing.get("status"))) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "A removed account cannot be reactivated or suspended."
            );
        }

        int updated = jdbcTemplate.update(
                """
                UPDATE users
                SET enabled = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
                  AND deleted_at IS NULL
                """,
                !request.suspended(),
                userId
        );

        if (updated == 0) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Account not found or already removed."
            );
        }

        Map<String, Object> result = findUser(userId);
        result.put("status", resolveStatus(result));
        result.put(
                "message",
                Boolean.TRUE.equals(request.suspended())
                        ? "Account suspended."
                        : "Account reactivated."
        );

        return result;
    }

    /*
     * SOFT REMOVE
     *
     * POST /admin/accounts/users/{userId}/remove
     * Body: {"reason": "Duplicate account"}
     *
     * Requires deleted_at and deletion_reason columns in users.
     */
    @PostMapping("/users/{userId}/remove")
    @Transactional
    public Map<String, Object> removeAccount(
            @PathVariable UUID userId,
            @RequestBody(required = false) RemovalRequest request
    ) {
        findUser(userId);

        String reason = request == null || request.reason() == null
                ? "Removed by administrator"
                : request.reason().trim();

        if (reason.isBlank()) {
            reason = "Removed by administrator";
        }

        if (reason.length() > 2000) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "The removal reason cannot exceed 2000 characters."
            );
        }

        int updated = jdbcTemplate.update(
                """
                UPDATE users
                SET enabled = FALSE,
                    deleted_at = COALESCE(deleted_at, CURRENT_TIMESTAMP),
                    deletion_reason = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
                  AND deleted_at IS NULL
                """,
                reason,
                userId
        );

        Map<String, Object> result = findUser(userId);
        result.put("status", resolveStatus(result));
        result.put(
                "message",
                updated == 0
                        ? "Account was already removed."
                        : "Account removed."
        );

        return result;
    }

    /*
     * FLAG AN ACCOUNT
     *
     * POST /admin/accounts/users/{userId}/flags
     * Body: {"reason": "Suspected fraudulent profile"}
     */
    @PostMapping("/users/{userId}/flags")
    @Transactional
    public Map<String, Object> flagAccount(
            @PathVariable UUID userId,
            @RequestBody FlagRequest request
    ) {
        findUser(userId);

        if (request == null
                || request.reason() == null
                || request.reason().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "A flag reason is required."
            );
        }

        String reason = request.reason().trim();

        if (reason.length() > 2000) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "The flag reason cannot exceed 2000 characters."
            );
        }

        UUID flagId = UUID.randomUUID();

        jdbcTemplate.update(
                """
                INSERT INTO admin_user_flags
                    (id, user_id, reason, created_at, resolved)
                VALUES (?, ?, ?, CURRENT_TIMESTAMP, FALSE)
                """,
                flagId,
                userId,
                reason
        );

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("id", flagId.toString());
        result.put("userId", userId.toString());
        result.put("reason", reason);
        result.put("resolved", false);
        result.put("message", "Account flagged for review.");

        return result;
    }

    /*
     * LIST FLAGS
     *
     * GET /admin/accounts/flags
     * GET /admin/accounts/flags?resolved=false
     * GET /admin/accounts/flags?resolved=true
     */
    @GetMapping("/flags")
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getFlags(
            @RequestParam(required = false) Boolean resolved
    ) {
        return jdbcTemplate.queryForList(
                """
                SELECT
                    f.id::text AS id,
                    f.user_id::text AS "userId",
                    f.reason,
                    f.created_at AS "createdAt",
                    COALESCE(f.resolved, FALSE) AS resolved,
                    u.email,
                    u.first_name AS "firstName",
                    u.last_name AS "lastName"
                FROM admin_user_flags f
                LEFT JOIN users u ON u.id = f.user_id
                WHERE (
                    CAST(? AS boolean) IS NULL
                    OR COALESCE(f.resolved, FALSE) = CAST(? AS boolean)
                )
                ORDER BY f.created_at DESC NULLS LAST
                """,
                resolved,
                resolved
        );
    }

    /*
     * RESOLVE OR REOPEN A FLAG
     *
     * PATCH /admin/accounts/flags/{flagId}/resolution
     * Body: {"resolved": true}
     */
    @PatchMapping("/flags/{flagId}/resolution")
    @Transactional
    public Map<String, Object> setFlagResolution(
            @PathVariable UUID flagId,
            @RequestBody FlagResolutionRequest request
    ) {
        if (request == null || request.resolved() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "The resolved field is required."
            );
        }

        int updated = jdbcTemplate.update(
                """
                UPDATE admin_user_flags
                SET resolved = ?
                WHERE id = ?
                """,
                request.resolved(),
                flagId
        );

        if (updated == 0) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Flag not found."
            );
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("id", flagId.toString());
        result.put("resolved", request.resolved());
        result.put(
                "message",
                request.resolved()
                        ? "Flag marked as resolved."
                        : "Flag reopened."
        );

        return result;
    }

    /*
     * PRIVATE HELPERS
     */

    private Map<String, Object> findUser(UUID userId) {
        if (userId == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "User ID is required."
            );
        }

        List<Map<String, Object>> rows = jdbcTemplate.queryForList(
                """
                SELECT
                    u.id::text AS id,
                    u.email,
                    u.first_name AS "firstName",
                    u.last_name AS "lastName",
                    COALESCE(u.enabled, TRUE) AS enabled,
                    u.created_at AS "createdAt",
                    to_jsonb(u)::text AS "userRecord",
                    COALESCE(
                        (
                            SELECT jsonb_agg(r.name ORDER BY r.name)
                            FROM user_roles ur
                            JOIN roles r ON r.id = ur.role_id
                            WHERE ur.user_id = u.id
                        ),
                        '[]'::jsonb
                    )::text AS "rolesJson",
                    EXISTS (
                        SELECT 1
                        FROM admin_user_flags f
                        WHERE f.user_id = u.id
                          AND COALESCE(f.resolved, FALSE) = FALSE
                    ) AS "hasOpenFlags",
                    (
                        SELECT COUNT(*)
                        FROM admin_user_flags f
                        WHERE f.user_id = u.id
                          AND COALESCE(f.resolved, FALSE) = FALSE
                    ) AS "openFlagCount",
                    u.deleted_at AS "deletedAt"
                FROM users u
                WHERE u.id = ?
                """,
                userId
        );

        if (rows.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Account not found."
            );
        }

        Map<String, Object> account = rows.get(0);
        account.put("user", parseJson(account.remove("userRecord")));
        account.put("roles", parseJson(account.remove("rolesJson")));
        account.put("status", resolveStatus(account));

        return account;
    }

    private List<Map<String, Object>> getFlagsForUser(UUID userId) {
        return jdbcTemplate.queryForList(
                """
                SELECT
                    id::text AS id,
                    user_id::text AS "userId",
                    reason,
                    created_at AS "createdAt",
                    COALESCE(resolved, FALSE) AS resolved
                FROM admin_user_flags
                WHERE user_id = ?
                ORDER BY created_at DESC NULLS LAST
                """,
                userId
        );
    }

    private List<Object> parseJsonColumn(
            List<Map<String, Object>> rows,
            String column
    ) {
        List<Object> parsed = new ArrayList<>();

        for (Map<String, Object> row : rows) {
            parsed.add(parseJson(row.get(column)));
        }

        return parsed;
    }

    private Object parseJson(Object value) {
        if (value == null) {
            return null;
        }

        try {
            return objectMapper.readValue(value.toString(), Object.class);
        } catch (JsonProcessingException exception) {
            return value.toString();
        }
    }

    private String resolveStatus(Map<String, Object> account) {
        Object deletedAt = account.get("deletedAt");

        if (deletedAt == null) {
            Object userValue = account.get("user");

            if (userValue instanceof Map<?, ?> user) {
                deletedAt = user.get("deleted_at");
            }
        }

        if (deletedAt != null) {
            return "REMOVED";
        }

        if (Boolean.FALSE.equals(account.get("enabled"))) {
            return "SUSPENDED";
        }

        return "ACTIVE";
    }

    public record SuspensionRequest(Boolean suspended) {}

    public record RemovalRequest(String reason) {}

    public record FlagRequest(String reason) {}

    public record FlagResolutionRequest(Boolean resolved) {}
}
