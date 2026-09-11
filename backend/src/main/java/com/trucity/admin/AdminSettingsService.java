package com.trucity.admin;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminSettingsService {

    @PersistenceContext
    private EntityManager entityManager;

    private static final String SETTINGS_QUERY = """
        SELECT
            id,
            platform_name,
            platform_description,
            maintenance_mode,
            maintenance_message,

            candidate_registration_enabled,
            employer_registration_enabled,
            require_email_verification,
            auto_enable_new_accounts,

            job_creation_enabled,
            require_job_approval,
            allow_published_job_editing,
            allow_job_closing,

            candidate_verification_required,
            document_verification_required,
            verifier_workflow_enabled,

            applications_enabled,
            allow_multiple_applications,
            allow_application_withdrawal,

            email_notifications_enabled,
            application_notifications_enabled,
            verification_notifications_enabled,
            job_notifications_enabled,

            session_timeout_minutes,
            max_login_attempts,
            require_mfa_for_admins,

            data_retention_days,

            created_at,
            updated_at
        FROM admin_settings
        LIMIT 1
        """;

    @Transactional(readOnly = true)
    public SettingsResponse getSettings() {

        Object[] row = (Object[]) entityManager
                .createNativeQuery(SETTINGS_QUERY)
                .getSingleResult();

        return mapSettings(row);
    }

    @Transactional
    public SettingsResponse updatePlatform(
            PlatformSettingsRequest request,
            Authentication authentication
    ) {
        execute("""
            UPDATE admin_settings
            SET
                platform_name = :platformName,
                platform_description = :platformDescription,
                maintenance_mode = :maintenanceMode,
                maintenance_message = :maintenanceMessage,
                updated_at = NOW()
            """,
            Map.of(
                "platformName", request.platformName(),
                "platformDescription", request.platformDescription(),
                "maintenanceMode", request.maintenanceMode(),
                "maintenanceMessage",
                    request.maintenanceMessage() == null
                        ? ""
                        : request.maintenanceMessage()
            )
        );

        audit(
            authentication,
            "ADMIN_SETTINGS_UPDATED",
            "Platform settings were updated"
        );

        return getSettings();
    }

    @Transactional
    public SettingsResponse updateUsers(
            UserSettingsRequest request,
            Authentication authentication
    ) {
        execute("""
            UPDATE admin_settings
            SET
                candidate_registration_enabled = :candidateRegistrationEnabled,
                employer_registration_enabled = :employerRegistrationEnabled,
                require_email_verification = :requireEmailVerification,
                auto_enable_new_accounts = :autoEnableNewAccounts,
                updated_at = NOW()
            """,
            Map.of(
                "candidateRegistrationEnabled", request.candidateRegistrationEnabled(),
                "employerRegistrationEnabled", request.employerRegistrationEnabled(),
                "requireEmailVerification", request.requireEmailVerification(),
                "autoEnableNewAccounts", request.autoEnableNewAccounts()
            )
        );

        audit(
            authentication,
            "ADMIN_SETTINGS_UPDATED",
            "User and registration settings were updated"
        );

        return getSettings();
    }

    @Transactional
    public SettingsResponse updateJobs(
            JobSettingsRequest request,
            Authentication authentication
    ) {
        execute("""
            UPDATE admin_settings
            SET
                job_creation_enabled = :jobCreationEnabled,
                require_job_approval = :requireJobApproval,
                allow_published_job_editing = :allowPublishedJobEditing,
                allow_job_closing = :allowJobClosing,
                updated_at = NOW()
            """,
            Map.of(
                "jobCreationEnabled", request.jobCreationEnabled(),
                "requireJobApproval", request.requireJobApproval(),
                "allowPublishedJobEditing", request.allowPublishedJobEditing(),
                "allowJobClosing", request.allowJobClosing()
            )
        );

        audit(
            authentication,
            "ADMIN_SETTINGS_UPDATED",
            "Job settings were updated"
        );

        return getSettings();
    }

    @Transactional
    public SettingsResponse updateVerification(
            VerificationSettingsRequest request,
            Authentication authentication
    ) {
        execute("""
            UPDATE admin_settings
            SET
                candidate_verification_required = :candidateVerificationRequired,
                document_verification_required = :documentVerificationRequired,
                verifier_workflow_enabled = :verifierWorkflowEnabled,
                updated_at = NOW()
            """,
            Map.of(
                "candidateVerificationRequired", request.candidateVerificationRequired(),
                "documentVerificationRequired", request.documentVerificationRequired(),
                "verifierWorkflowEnabled", request.verifierWorkflowEnabled()
            )
        );

        audit(
            authentication,
            "ADMIN_SETTINGS_UPDATED",
            "Verification settings were updated"
        );

        return getSettings();
    }

    @Transactional
    public SettingsResponse updateApplications(
            ApplicationSettingsRequest request,
            Authentication authentication
    ) {
        execute("""
            UPDATE admin_settings
            SET
                applications_enabled = :applicationsEnabled,
                allow_multiple_applications = :allowMultipleApplications,
                allow_application_withdrawal = :allowApplicationWithdrawal,
                updated_at = NOW()
            """,
            Map.of(
                "applicationsEnabled", request.applicationsEnabled(),
                "allowMultipleApplications", request.allowMultipleApplications(),
                "allowApplicationWithdrawal", request.allowApplicationWithdrawal()
            )
        );

        audit(
            authentication,
            "ADMIN_SETTINGS_UPDATED",
            "Application settings were updated"
        );

        return getSettings();
    }

    @Transactional
    public SettingsResponse updateNotifications(
            NotificationSettingsRequest request,
            Authentication authentication
    ) {
        execute("""
            UPDATE admin_settings
            SET
                email_notifications_enabled = :emailNotificationsEnabled,
                application_notifications_enabled = :applicationNotificationsEnabled,
                verification_notifications_enabled = :verificationNotificationsEnabled,
                job_notifications_enabled = :jobNotificationsEnabled,
                updated_at = NOW()
            """,
            Map.of(
                "emailNotificationsEnabled", request.emailNotificationsEnabled(),
                "applicationNotificationsEnabled", request.applicationNotificationsEnabled(),
                "verificationNotificationsEnabled", request.verificationNotificationsEnabled(),
                "jobNotificationsEnabled", request.jobNotificationsEnabled()
            )
        );

        audit(
            authentication,
            "ADMIN_SETTINGS_UPDATED",
            "Notification settings were updated"
        );

        return getSettings();
    }

    @Transactional
    public SettingsResponse updateSecurity(
            SecuritySettingsRequest request,
            Authentication authentication
    ) {
        if (request.sessionTimeoutMinutes() < 5 ||
                request.sessionTimeoutMinutes() > 43200) {
            throw new IllegalArgumentException(
                    "Session timeout must be between 5 and 43200 minutes"
            );
        }

        if (request.maxLoginAttempts() < 1 ||
                request.maxLoginAttempts() > 20) {
            throw new IllegalArgumentException(
                    "Maximum login attempts must be between 1 and 20"
            );
        }

        execute("""
            UPDATE admin_settings
            SET
                session_timeout_minutes = :sessionTimeoutMinutes,
                max_login_attempts = :maxLoginAttempts,
                require_mfa_for_admins = :requireMfaForAdmins,
                data_retention_days = :dataRetentionDays,
                updated_at = NOW()
            """,
            Map.of(
                "sessionTimeoutMinutes", request.sessionTimeoutMinutes(),
                "maxLoginAttempts", request.maxLoginAttempts(),
                "requireMfaForAdmins", request.requireMfaForAdmins(),
                "dataRetentionDays", request.dataRetentionDays()
            )
        );

        audit(
            authentication,
            "ADMIN_SETTINGS_UPDATED",
            "Security and privacy settings were updated"
        );

        return getSettings();
    }

    @Transactional(readOnly = true)
    public List<RoleResponse> getRoles() {

        List<?> rows = entityManager.createNativeQuery("""
            SELECT
                r.id,
                r.name,
                COALESCE(
                    json_agg(
                        json_build_object(
                            'id', p.id,
                            'name', p.name,
                            'description', p.description
                        )
                    ) FILTER (WHERE p.id IS NOT NULL),
                    '[]'::json
                )
            FROM roles r
            LEFT JOIN role_permissions rp
                ON rp.role_id = r.id
            LEFT JOIN permissions p
                ON p.id = rp.permission_id
            GROUP BY r.id, r.name
            ORDER BY r.name
            """)
            .getResultList();

        List<RoleResponse> roles = new ArrayList<>();

        for (Object result : rows) {
            Object[] row = (Object[]) result;

            List<PermissionResponse> permissions =
                    parsePermissions(row[2]);

            roles.add(
                    new RoleResponse(
                            row[0].toString(),
                            row[1].toString(),
                            permissions
                    )
            );
        }

        return roles;
    }

    @Transactional(readOnly = true)
    public List<PermissionResponse> getPermissions() {

        List<?> rows = entityManager.createNativeQuery("""
            SELECT id, name, description
            FROM permissions
            ORDER BY name
            """)
            .getResultList();

        List<PermissionResponse> permissions = new ArrayList<>();

        for (Object result : rows) {
            Object[] row = (Object[]) result;

            permissions.add(
                    new PermissionResponse(
                            row[0].toString(),
                            row[1].toString(),
                            row[2] != null ? row[2].toString() : null
                    )
            );
        }

        return permissions;
    }

    @Transactional
    public List<RoleResponse> updateRolePermissions(
            UUID roleId,
            RolePermissionsRequest request,
            Authentication authentication
    ) {

        entityManager.createNativeQuery("""
            DELETE FROM role_permissions
            WHERE role_id = :roleId
            """)
            .setParameter("roleId", roleId)
            .executeUpdate();

        if (request.permissionIds() != null &&
                !request.permissionIds().isEmpty()) {

            for (UUID permissionId : request.permissionIds()) {

                entityManager.createNativeQuery("""
                    INSERT INTO role_permissions(role_id, permission_id)
                    VALUES (:roleId, :permissionId)
                    ON CONFLICT DO NOTHING
                    """)
                    .setParameter("roleId", roleId)
                    .setParameter("permissionId", permissionId)
                    .executeUpdate();
            }
        }

        audit(
            authentication,
            "ROLE_PERMISSIONS_UPDATED",
            "Permissions were updated for role " + roleId
        );

        return getRoles();
    }

    @Transactional(readOnly = true)
    public List<AuditResponse> getRecentAuditLogs() {

        List<?> rows = entityManager.createNativeQuery("""
            SELECT
                a.id,
                a.action,
                a.description,
                a.created_at,
                u.email
            FROM audit_logs a
            LEFT JOIN users u
                ON u.id = a.user_id
            ORDER BY a.created_at DESC
            LIMIT 50
            """)
            .getResultList();

        List<AuditResponse> result = new ArrayList<>();

        for (Object rowObject : rows) {
            Object[] row = (Object[]) rowObject;

            result.add(
                    new AuditResponse(
                            row[0].toString(),
                            row[1] != null ? row[1].toString() : "Activity",
                            row[2] != null ? row[2].toString() : "",
                            row[3] != null ? row[3].toString() : null,
                            row[4] != null ? row[4].toString() : "System"
                    )
            );
        }

        return result;
    }

    @Transactional(readOnly = true)
    public SystemResponse getSystemInformation() {

        String databaseStatus = "CONNECTED";

        try {
            entityManager.createNativeQuery("SELECT 1")
                    .getSingleResult();
        } catch (Exception exception) {
            databaseStatus = "ERROR";
        }

        return new SystemResponse(
                "TruCity",
                "Spring Boot",
                "3.5.5",
                System.getProperty("java.version"),
                databaseStatus,
                "PostgreSQL",
                "Administrator"
        );
    }

    private SettingsResponse mapSettings(Object[] row) {

        return new SettingsResponse(
                row[0].toString(),

                new PlatformSettings(
                        stringValue(row[1]),
                        stringValue(row[2]),
                        boolValue(row[3]),
                        stringValue(row[4])
                ),

                new UserSettings(
                        boolValue(row[5]),
                        boolValue(row[6]),
                        boolValue(row[7]),
                        boolValue(row[8])
                ),

                new JobSettings(
                        boolValue(row[9]),
                        boolValue(row[10]),
                        boolValue(row[11]),
                        boolValue(row[12])
                ),

                new VerificationSettings(
                        boolValue(row[13]),
                        boolValue(row[14]),
                        boolValue(row[15])
                ),

                new ApplicationSettings(
                        boolValue(row[16]),
                        boolValue(row[17]),
                        boolValue(row[18])
                ),

                new NotificationSettings(
                        boolValue(row[19]),
                        boolValue(row[20]),
                        boolValue(row[21]),
                        boolValue(row[22])
                ),

                new SecuritySettings(
                        intValue(row[23]),
                        intValue(row[24]),
                        boolValue(row[25]),
                        intValue(row[26])
                ),

                stringValue(row[27]),
                stringValue(row[28])
        );
    }

    private List<PermissionResponse> parsePermissions(Object value) {

        List<PermissionResponse> permissions = new ArrayList<>();

        if (value == null) {
            return permissions;
        }

        String json = value.toString();

        if (json.equals("[]")) {
            return permissions;
        }

        String cleaned = json
                .replace("[", "")
                .replace("]", "");

        if (cleaned.isBlank()) {
            return permissions;
        }

        String[] entries = cleaned.split("\\},\\{");

        for (String entry : entries) {

            String normalized = entry
                    .replace("{", "")
                    .replace("}", "")
                    .replace("\"", "");

            Map<String, String> values = new LinkedHashMap<>();

            for (String part : normalized.split(",")) {
                String[] pair = part.split(":", 2);

                if (pair.length == 2) {
                    values.put(pair[0], pair[1]);
                }
            }

            String id = values.get("id");
            String name = values.get("name");
            String description = values.get("description");

            if (id != null && name != null) {
                permissions.add(
                        new PermissionResponse(
                                id,
                                name,
                                description
                        )
                );
            }
        }

        return permissions;
    }

    private void execute(String sql, Map<String, Object> parameters) {

        var query = entityManager.createNativeQuery(sql);

        parameters.forEach(query::setParameter);

        query.executeUpdate();
    }

    private void audit(
            Authentication authentication,
            String action,
            String description
    ) {

        String email = authentication != null
                ? authentication.getName()
                : null;

        UUID userId = null;

        if (email != null) {
            List<?> users = entityManager.createNativeQuery("""
                SELECT id
                FROM users
                WHERE email = :email
                LIMIT 1
                """)
                .setParameter("email", email)
                .getResultList();

            if (!users.isEmpty()) {
                userId = UUID.fromString(users.get(0).toString());
            }
        }

        entityManager.createNativeQuery("""
            INSERT INTO audit_logs(
                user_id,
                action,
                description,
                created_at
            )
            VALUES(
                :userId,
                :action,
                :description,
                NOW()
            )
            """)
            .setParameter("userId", userId)
            .setParameter("action", action)
            .setParameter("description", description)
            .executeUpdate();
    }

    private boolean boolValue(Object value) {
        return value != null && Boolean.parseBoolean(value.toString());
    }

    private int intValue(Object value) {
        return value == null ? 0 : ((Number) value).intValue();
    }

    private String stringValue(Object value) {
        return value == null ? null : value.toString();
    }

    public record SettingsResponse(
            String id,
            PlatformSettings platform,
            UserSettings users,
            JobSettings jobs,
            VerificationSettings verification,
            ApplicationSettings applications,
            NotificationSettings notifications,
            SecuritySettings security,
            String createdAt,
            String updatedAt
    ) {}

    public record PlatformSettings(
            String platformName,
            String platformDescription,
            boolean maintenanceMode,
            String maintenanceMessage
    ) {}

    public record UserSettings(
            boolean candidateRegistrationEnabled,
            boolean employerRegistrationEnabled,
            boolean requireEmailVerification,
            boolean autoEnableNewAccounts
    ) {}

    public record JobSettings(
            boolean jobCreationEnabled,
            boolean requireJobApproval,
            boolean allowPublishedJobEditing,
            boolean allowJobClosing
    ) {}

    public record VerificationSettings(
            boolean candidateVerificationRequired,
            boolean documentVerificationRequired,
            boolean verifierWorkflowEnabled
    ) {}

    public record ApplicationSettings(
            boolean applicationsEnabled,
            boolean allowMultipleApplications,
            boolean allowApplicationWithdrawal
    ) {}

    public record NotificationSettings(
            boolean emailNotificationsEnabled,
            boolean applicationNotificationsEnabled,
            boolean verificationNotificationsEnabled,
            boolean jobNotificationsEnabled
    ) {}

    public record SecuritySettings(
            int sessionTimeoutMinutes,
            int maxLoginAttempts,
            boolean requireMfaForAdmins,
            int dataRetentionDays
    ) {}

    public record PlatformSettingsRequest(
            String platformName,
            String platformDescription,
            boolean maintenanceMode,
            String maintenanceMessage
    ) {}

    public record UserSettingsRequest(
            boolean candidateRegistrationEnabled,
            boolean employerRegistrationEnabled,
            boolean requireEmailVerification,
            boolean autoEnableNewAccounts
    ) {}

    public record JobSettingsRequest(
            boolean jobCreationEnabled,
            boolean requireJobApproval,
            boolean allowPublishedJobEditing,
            boolean allowJobClosing
    ) {}

    public record VerificationSettingsRequest(
            boolean candidateVerificationRequired,
            boolean documentVerificationRequired,
            boolean verifierWorkflowEnabled
    ) {}

    public record ApplicationSettingsRequest(
            boolean applicationsEnabled,
            boolean allowMultipleApplications,
            boolean allowApplicationWithdrawal
    ) {}

    public record NotificationSettingsRequest(
            boolean emailNotificationsEnabled,
            boolean applicationNotificationsEnabled,
            boolean verificationNotificationsEnabled,
            boolean jobNotificationsEnabled
    ) {}

    public record SecuritySettingsRequest(
            int sessionTimeoutMinutes,
            int maxLoginAttempts,
            boolean requireMfaForAdmins,
            int dataRetentionDays
    ) {}

    public record PermissionResponse(
            String id,
            String name,
            String description
    ) {}

    public record RoleResponse(
            String id,
            String name,
            List<PermissionResponse> permissions
    ) {}

    public record RolePermissionsRequest(
            List<UUID> permissionIds
    ) {}

    public record AuditResponse(
            String id,
            String action,
            String description,
            String createdAt,
            String userEmail
    ) {}

    public record SystemResponse(
            String application,
            String backend,
            String springBootVersion,
            String javaVersion,
            String databaseStatus,
            String database,
            String environment
    ) {}
}