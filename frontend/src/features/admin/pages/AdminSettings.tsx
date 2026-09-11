import { useEffect, useState, type ReactNode } from "react";

import {
  getAdminAuditLogs,
  getAdminPermissions,
  getAdminRoles,
  getAdminSettings,
  getAdminSystemInformation,
  updateAdminApplicationSettings,
  updateAdminJobSettings,
  updateAdminNotificationSettings,
  updateAdminPlatformSettings,
  updateAdminRolePermissions,
  updateAdminSecuritySettings,
  updateAdminUserSettings,
  updateAdminVerificationSettings,
} from "../admin.service";

import type {
  AdminAuditLog,
  AdminPermission,
  AdminRole,
  AdminSettings,
  AdminSystemInformation,
} from "../admin.types";

type SettingsSection =
  | "platform"
  | "users"
  | "jobs"
  | "verification"
  | "applications"
  | "notifications"
  | "security"
  | "roles"
  | "audit"
  | "privacy"
  | "system";

const sections: Array<{
  id: SettingsSection;
  label: string;
  icon: string;
}> = [
  { id: "platform", label: "Platform", icon: "▣" },
  { id: "users", label: "Users & Registration", icon: "◉" },
  { id: "jobs", label: "Jobs", icon: "▤" },
  { id: "verification", label: "Verification", icon: "✓" },
  { id: "applications", label: "Applications", icon: "↗" },
  { id: "notifications", label: "Notifications", icon: "●" },
  { id: "security", label: "Security", icon: "◆" },
  { id: "roles", label: "Roles & Permissions", icon: "♙" },
  { id: "audit", label: "Audit Logs", icon: "▥" },
  { id: "privacy", label: "Privacy & Data", icon: "◇" },
  { id: "system", label: "System", icon: "⚙" },
];

function formatDate(value?: string) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      className={`admin-settings-toggle ${checked ? "active" : ""}`}
      onClick={() => onChange(!checked)}
      aria-pressed={checked}
    >
      <span className="admin-settings-toggle-track">
        <span className="admin-settings-toggle-thumb" />
      </span>

      <span className="admin-settings-toggle-state">
        {checked ? "Enabled" : "Disabled"}
      </span>
    </button>
  );
}

function SettingRow({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="admin-settings-row">
      <div className="admin-settings-row-copy">
        <strong>{title}</strong>
        <span>{description}</span>
      </div>

      <div className="admin-settings-row-control">
        {children}
      </div>
    </div>
  );
}

function SettingsCard({
  title,
  description,
  children,
  onSave,
  saving,
}: {
  title: string;
  description: string;
  children: ReactNode;
  onSave?: () => void;
  saving?: boolean;
}) {
  return (
    <section className="admin-settings-card">
      <div className="admin-settings-card-header">
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>

        {onSave && (
          <button
            type="button"
            className="admin-primary-button"
            onClick={onSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        )}
      </div>

      <div className="admin-settings-card-body">
        {children}
      </div>
    </section>
  );
}

export default function AdminSettings() {
  const [activeSection, setActiveSection] =
    useState<SettingsSection>("platform");

  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [permissions, setPermissions] = useState<AdminPermission[]>([]);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);
  const [systemInfo, setSystemInfo] =
    useState<AdminSystemInformation | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);

  useEffect(() => {
    void loadSettings();
  }, []);

  useEffect(() => {
    if (activeSection === "roles") {
      void loadRoles();
    }

    if (activeSection === "audit") {
      void loadAuditLogs();
    }

    if (activeSection === "system") {
      void loadSystemInfo();
    }
  }, [activeSection]);

  async function loadSettings() {
    try {
      setLoading(true);
      setError("");

      const data = await getAdminSettings();
      setSettings(data);
    } catch (err) {
      console.error(err);
      setError("Unable to load administrator settings.");
    } finally {
      setLoading(false);
    }
  }

  async function loadRoles() {
    try {
      const [roleData, permissionData] = await Promise.all([
        getAdminRoles(),
        getAdminPermissions(),
      ]);

      setRoles(roleData);
      setPermissions(permissionData);

      if (!selectedRoleId && roleData.length > 0) {
        setSelectedRoleId(roleData[0].id);
      }
    } catch (err) {
      console.error(err);
      setError("Unable to load roles and permissions.");
    }
  }

  async function loadAuditLogs() {
    try {
      setAuditLogs(await getAdminAuditLogs());
    } catch (err) {
      console.error(err);
      setError("Unable to load audit logs.");
    }
  }

  async function loadSystemInfo() {
    try {
      setSystemInfo(await getAdminSystemInformation());
    } catch (err) {
      console.error(err);
      setError("Unable to load system information.");
    }
  }

  async function save(
    operation: () => Promise<AdminSettings>
  ) {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const updated = await operation();

      setSettings(updated);
      setSuccess("Settings saved successfully.");

      window.setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      console.error(err);
      setError("Unable to save settings.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-settings-loading">
          Loading administrator settings...
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="admin-page">
        <div className="admin-settings-error">
          {error || "Settings could not be loaded."}
        </div>
      </div>
    );
  }

  const selectedRole =
    roles.find((role) => role.id === selectedRoleId) ?? null;

  const selectedPermissionIds = new Set(
    selectedRole?.permissions.map((permission) => permission.id) ?? []
  );

  return (
    <div className="admin-page admin-settings-page">
      <div className="admin-page-header">
        <div>
          <div className="admin-page-eyebrow">SYSTEM</div>

          <h1>Settings</h1>

          <p>
            Configure how the TruCity platform operates.
          </p>
        </div>
      </div>

      {(error || success) && (
        <div
          className={`admin-settings-alert ${
            error ? "error" : "success"
          }`}
        >
          {error || success}
        </div>
      )}

      <div className="admin-settings-layout">
        <aside className="admin-settings-navigation">
          <div className="admin-settings-navigation-title">
            Settings
          </div>

          {sections.map((section) => (
            <button
              type="button"
              key={section.id}
              className={`admin-settings-nav-item ${
                activeSection === section.id ? "active" : ""
              }`}
              onClick={() => {
                setActiveSection(section.id);
                setError("");
                setSuccess("");
              }}
            >
              <span>{section.icon}</span>
              <strong>{section.label}</strong>
            </button>
          ))}
        </aside>

        <div className="admin-settings-content">

          {activeSection === "platform" && (
            <SettingsCard
              title="Platform"
              description="General configuration for the TruCity platform."
              saving={saving}
              onSave={() =>
                void save(() =>
                  updateAdminPlatformSettings(settings.platform)
                )
              }
            >
              <div className="admin-settings-form-grid">
                <label className="admin-settings-field">
                  <span>Platform name</span>
                  <input
                    value={settings.platform.platformName}
                    onChange={(event) =>
                      setSettings({
                        ...settings,
                        platform: {
                          ...settings.platform,
                          platformName: event.target.value,
                        },
                      })
                    }
                  />
                </label>

                <label className="admin-settings-field full">
                  <span>Platform description</span>
                  <textarea
                    rows={4}
                    value={
                      settings.platform.platformDescription ?? ""
                    }
                    onChange={(event) =>
                      setSettings({
                        ...settings,
                        platform: {
                          ...settings.platform,
                          platformDescription: event.target.value,
                        },
                      })
                    }
                  />
                </label>

                <SettingRow
                  title="Maintenance mode"
                  description="Temporarily place the platform into maintenance mode."
                >
                  <Toggle
                    checked={settings.platform.maintenanceMode}
                    onChange={(value) =>
                      setSettings({
                        ...settings,
                        platform: {
                          ...settings.platform,
                          maintenanceMode: value,
                        },
                      })
                    }
                  />
                </SettingRow>

                {settings.platform.maintenanceMode && (
                  <label className="admin-settings-field full">
                    <span>Maintenance message</span>
                    <textarea
                      rows={3}
                      value={
                        settings.platform.maintenanceMessage ?? ""
                      }
                      onChange={(event) =>
                        setSettings({
                          ...settings,
                          platform: {
                            ...settings.platform,
                            maintenanceMessage: event.target.value,
                          },
                        })
                      }
                    />
                  </label>
                )}
              </div>
            </SettingsCard>
          )}

          {activeSection === "users" && (
            <SettingsCard
              title="Users & Registration"
              description="Control account creation and onboarding behaviour."
              saving={saving}
              onSave={() =>
                void save(() =>
                  updateAdminUserSettings(settings.users)
                )
              }
            >
              <SettingRow
                title="Candidate registration"
                description="Allow new candidates to register."
              >
                <Toggle
                  checked={
                    settings.users.candidateRegistrationEnabled
                  }
                  onChange={(value) =>
                    setSettings({
                      ...settings,
                      users: {
                        ...settings.users,
                        candidateRegistrationEnabled: value,
                      },
                    })
                  }
                />
              </SettingRow>

              <SettingRow
                title="Employer registration"
                description="Allow new employers to register."
              >
                <Toggle
                  checked={
                    settings.users.employerRegistrationEnabled
                  }
                  onChange={(value) =>
                    setSettings({
                      ...settings,
                      users: {
                        ...settings.users,
                        employerRegistrationEnabled: value,
                      },
                    })
                  }
                />
              </SettingRow>

              <SettingRow
                title="Require email verification"
                description="Require users to verify their email before normal account access."
              >
                <Toggle
                  checked={settings.users.requireEmailVerification}
                  onChange={(value) =>
                    setSettings({
                      ...settings,
                      users: {
                        ...settings.users,
                        requireEmailVerification: value,
                      },
                    })
                  }
                />
              </SettingRow>

              <SettingRow
                title="Automatically enable new accounts"
                description="New accounts are enabled immediately after creation."
              >
                <Toggle
                  checked={settings.users.autoEnableNewAccounts}
                  onChange={(value) =>
                    setSettings({
                      ...settings,
                      users: {
                        ...settings.users,
                        autoEnableNewAccounts: value,
                      },
                    })
                  }
                />
              </SettingRow>
            </SettingsCard>
          )}

          {activeSection === "jobs" && (
            <SettingsCard
              title="Jobs"
              description="Configure job publishing and employer job management."
              saving={saving}
              onSave={() =>
                void save(() =>
                  updateAdminJobSettings(settings.jobs)
                )
              }
            >
              <SettingRow
                title="Job creation"
                description="Allow employers to create job postings."
              >
                <Toggle
                  checked={settings.jobs.jobCreationEnabled}
                  onChange={(value) =>
                    setSettings({
                      ...settings,
                      jobs: {
                        ...settings.jobs,
                        jobCreationEnabled: value,
                      },
                    })
                  }
                />
              </SettingRow>

              <SettingRow
                title="Require job approval"
                description="Require administrators to approve new jobs."
              >
                <Toggle
                  checked={settings.jobs.requireJobApproval}
                  onChange={(value) =>
                    setSettings({
                      ...settings,
                      jobs: {
                        ...settings.jobs,
                        requireJobApproval: value,
                      },
                    })
                  }
                />
              </SettingRow>

              <SettingRow
                title="Allow published job editing"
                description="Employers may edit jobs after publishing."
              >
                <Toggle
                  checked={settings.jobs.allowPublishedJobEditing}
                  onChange={(value) =>
                    setSettings({
                      ...settings,
                      jobs: {
                        ...settings.jobs,
                        allowPublishedJobEditing: value,
                      },
                    })
                  }
                />
              </SettingRow>

              <SettingRow
                title="Allow job closing"
                description="Employers may close their job postings."
              >
                <Toggle
                  checked={settings.jobs.allowJobClosing}
                  onChange={(value) =>
                    setSettings({
                      ...settings,
                      jobs: {
                        ...settings.jobs,
                        allowJobClosing: value,
                      },
                    })
                  }
                />
              </SettingRow>
            </SettingsCard>
          )}

          {activeSection === "verification" && (
            <SettingsCard
              title="Verification"
              description="Control candidate and document verification workflows."
              saving={saving}
              onSave={() =>
                void save(() =>
                  updateAdminVerificationSettings(
                    settings.verification
                  )
                )
              }
            >
              <SettingRow
                title="Candidate verification required"
                description="Require candidates to complete verification."
              >
                <Toggle
                  checked={
                    settings.verification
                      .candidateVerificationRequired
                  }
                  onChange={(value) =>
                    setSettings({
                      ...settings,
                      verification: {
                        ...settings.verification,
                        candidateVerificationRequired: value,
                      },
                    })
                  }
                />
              </SettingRow>

              <SettingRow
                title="Document verification required"
                description="Require submitted documents to go through verification."
              >
                <Toggle
                  checked={
                    settings.verification
                      .documentVerificationRequired
                  }
                  onChange={(value) =>
                    setSettings({
                      ...settings,
                      verification: {
                        ...settings.verification,
                        documentVerificationRequired: value,
                      },
                    })
                  }
                />
              </SettingRow>

              <SettingRow
                title="Verifier workflow"
                description="Enable the verifier review workflow."
              >
                <Toggle
                  checked={
                    settings.verification.verifierWorkflowEnabled
                  }
                  onChange={(value) =>
                    setSettings({
                      ...settings,
                      verification: {
                        ...settings.verification,
                        verifierWorkflowEnabled: value,
                      },
                    })
                  }
                />
              </SettingRow>
            </SettingsCard>
          )}

          {activeSection === "applications" && (
            <SettingsCard
              title="Applications"
              description="Configure how candidates apply for jobs."
              saving={saving}
              onSave={() =>
                void save(() =>
                  updateAdminApplicationSettings(
                    settings.applications
                  )
                )
              }
            >
              <SettingRow
                title="Applications enabled"
                description="Allow candidates to submit applications."
              >
                <Toggle
                  checked={settings.applications.applicationsEnabled}
                  onChange={(value) =>
                    setSettings({
                      ...settings,
                      applications: {
                        ...settings.applications,
                        applicationsEnabled: value,
                      },
                    })
                  }
                />
              </SettingRow>

              <SettingRow
                title="Multiple applications"
                description="Allow a candidate to apply to multiple jobs."
              >
                <Toggle
                  checked={
                    settings.applications.allowMultipleApplications
                  }
                  onChange={(value) =>
                    setSettings({
                      ...settings,
                      applications: {
                        ...settings.applications,
                        allowMultipleApplications: value,
                      },
                    })
                  }
                />
              </SettingRow>

              <SettingRow
                title="Application withdrawal"
                description="Allow candidates to withdraw submitted applications."
              >
                <Toggle
                  checked={
                    settings.applications.allowApplicationWithdrawal
                  }
                  onChange={(value) =>
                    setSettings({
                      ...settings,
                      applications: {
                        ...settings.applications,
                        allowApplicationWithdrawal: value,
                      },
                    })
                  }
                />
              </SettingRow>
            </SettingsCard>
          )}

          {activeSection === "notifications" && (
            <SettingsCard
              title="Notifications"
              description="Control platform notification categories."
              saving={saving}
              onSave={() =>
                void save(() =>
                  updateAdminNotificationSettings(
                    settings.notifications
                  )
                )
              }
            >
              <SettingRow
                title="Email notifications"
                description="Enable platform email notifications."
              >
                <Toggle
                  checked={
                    settings.notifications.emailNotificationsEnabled
                  }
                  onChange={(value) =>
                    setSettings({
                      ...settings,
                      notifications: {
                        ...settings.notifications,
                        emailNotificationsEnabled: value,
                      },
                    })
                  }
                />
              </SettingRow>

              <SettingRow
                title="Application notifications"
                description="Send notifications about application activity."
              >
                <Toggle
                  checked={
                    settings.notifications
                      .applicationNotificationsEnabled
                  }
                  onChange={(value) =>
                    setSettings({
                      ...settings,
                      notifications: {
                        ...settings.notifications,
                        applicationNotificationsEnabled: value,
                      },
                    })
                  }
                />
              </SettingRow>

              <SettingRow
                title="Verification notifications"
                description="Send notifications about verification activity."
              >
                <Toggle
                  checked={
                    settings.notifications
                      .verificationNotificationsEnabled
                  }
                  onChange={(value) =>
                    setSettings({
                      ...settings,
                      notifications: {
                        ...settings.notifications,
                        verificationNotificationsEnabled: value,
                      },
                    })
                  }
                />
              </SettingRow>

              <SettingRow
                title="Job notifications"
                description="Send notifications related to jobs."
              >
                <Toggle
                  checked={
                    settings.notifications.jobNotificationsEnabled
                  }
                  onChange={(value) =>
                    setSettings({
                      ...settings,
                      notifications: {
                        ...settings.notifications,
                        jobNotificationsEnabled: value,
                      },
                    })
                  }
                />
              </SettingRow>
            </SettingsCard>
          )}

          {activeSection === "security" && (
            <SettingsCard
              title="Security"
              description="Configure authentication and administrative security."
              saving={saving}
              onSave={() =>
                void save(() =>
                  updateAdminSecuritySettings(settings.security)
                )
              }
            >
              <div className="admin-settings-form-grid">
                <label className="admin-settings-field">
                  <span>Session timeout (minutes)</span>

                  <input
                    type="number"
                    min={5}
                    max={43200}
                    value={settings.security.sessionTimeoutMinutes}
                    onChange={(event) =>
                      setSettings({
                        ...settings,
                        security: {
                          ...settings.security,
                          sessionTimeoutMinutes: Number(
                            event.target.value
                          ),
                        },
                      })
                    }
                  />
                </label>

                <label className="admin-settings-field">
                  <span>Maximum login attempts</span>

                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={settings.security.maxLoginAttempts}
                    onChange={(event) =>
                      setSettings({
                        ...settings,
                        security: {
                          ...settings.security,
                          maxLoginAttempts: Number(
                            event.target.value
                          ),
                        },
                      })
                    }
                  />
                </label>

                <label className="admin-settings-field">
                  <span>Data retention (days)</span>

                  <input
                    type="number"
                    min={30}
                    value={settings.security.dataRetentionDays}
                    onChange={(event) =>
                      setSettings({
                        ...settings,
                        security: {
                          ...settings.security,
                          dataRetentionDays: Number(
                            event.target.value
                          ),
                        },
                      })
                    }
                  />
                </label>
              </div>

              <SettingRow
                title="Require MFA for administrators"
                description="Require multi-factor authentication for administrative users."
              >
                <Toggle
                  checked={settings.security.requireMfaForAdmins}
                  onChange={(value) =>
                    setSettings({
                      ...settings,
                      security: {
                        ...settings.security,
                        requireMfaForAdmins: value,
                      },
                    })
                  }
                />
              </SettingRow>
            </SettingsCard>
          )}

          {activeSection === "roles" && (
            <SettingsCard
              title="Roles & Permissions"
              description="Manage permissions using TruCity's existing RBAC tables."
            >
              <div className="admin-settings-role-layout">
                <div className="admin-settings-role-list">
                  {roles.map((role) => (
                    <button
                      type="button"
                      key={role.id}
                      className={`admin-settings-role ${
                        selectedRoleId === role.id ? "active" : ""
                      }`}
                      onClick={() => setSelectedRoleId(role.id)}
                    >
                      <strong>{role.name}</strong>

                      <span>
                        {role.permissions.length} permissions
                      </span>
                    </button>
                  ))}
                </div>

                <div className="admin-settings-permission-list">
                  {selectedRole ? (
                    <>
                      <div className="admin-settings-permission-header">
                        <div>
                          <h3>{selectedRole.name}</h3>
                          <p>
                            Select the permissions assigned to this
                            role.
                          </p>
                        </div>

                        <button
                          type="button"
                          className="admin-primary-button"
                          onClick={async () => {
                            try {
                              setSaving(true);
                              setError("");

                              const updated =
                                await updateAdminRolePermissions(
                                  selectedRole.id,
                                  Array.from(selectedPermissionIds)
                                );

                              setRoles(updated);
                              setSuccess(
                                "Role permissions saved successfully."
                              );
                            } catch (err) {
                              console.error(err);
                              setError(
                                "Unable to update role permissions."
                              );
                            } finally {
                              setSaving(false);
                            }
                          }}
                          disabled={saving}
                        >
                          {saving ? "Saving..." : "Save permissions"}
                        </button>
                      </div>

                      <div className="admin-settings-permissions">
                        {permissions.map((permission) => {
                          const checked =
                            selectedPermissionIds.has(
                              permission.id
                            );

                          return (
                            <label
                              key={permission.id}
                              className="admin-settings-permission"
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => {
                                  const role =
                                    roles.find(
                                      (item) =>
                                        item.id === selectedRole.id
                                    );

                                  if (!role) return;

                                  const nextIds = new Set(
                                    role.permissions.map(
                                      (item) => item.id
                                    )
                                  );

                                  if (nextIds.has(permission.id)) {
                                    nextIds.delete(permission.id);
                                  } else {
                                    nextIds.add(permission.id);
                                  }

                                  setRoles(
                                    roles.map((item) =>
                                      item.id === role.id
                                        ? {
                                            ...item,
                                            permissions:
                                              permissions.filter(
                                                (itemPermission) =>
                                                  nextIds.has(
                                                    itemPermission.id
                                                  )
                                              ),
                                          }
                                        : item
                                    )
                                  );
                                }}
                              />

                              <span>
                                <strong>{permission.name}</strong>
                                <small>
                                  {permission.description ||
                                    "No description"}
                                </small>
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    <div className="admin-settings-empty">
                      No roles available.
                    </div>
                  )}
                </div>
              </div>
            </SettingsCard>
          )}

          {activeSection === "audit" && (
            <SettingsCard
              title="Audit Logs"
              description="Recent administrative activity recorded by TruCity."
            >
              <div className="admin-settings-audit-list">
                {auditLogs.length === 0 ? (
                  <div className="admin-settings-empty">
                    No audit activity found.
                  </div>
                ) : (
                  auditLogs.map((log) => (
                    <div
                      className="admin-settings-audit-item"
                      key={log.id}
                    >
                      <div className="admin-settings-audit-icon">
                        ✓
                      </div>

                      <div>
                        <strong>{log.action}</strong>
                        <p>{log.description}</p>

                        <span>
                          {log.userEmail} ·{" "}
                          {formatDate(log.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </SettingsCard>
          )}

          {activeSection === "privacy" && (
            <SettingsCard
              title="Privacy & Data"
              description="Review platform data retention configuration."
              saving={saving}
              onSave={() =>
                void save(() =>
                  updateAdminSecuritySettings(settings.security)
                )
              }
            >
              <div className="admin-settings-info-box">
                <strong>Data retention</strong>

                <p>
                  TruCity is configured to retain platform data for{" "}
                  <strong>
                    {settings.security.dataRetentionDays}
                  </strong>{" "}
                  days.
                </p>
              </div>

              <div className="admin-settings-info-box warning">
                <strong>Destructive data operations</strong>

                <p>
                  Permanent deletion of platform data is not exposed
                  from this settings screen. This prevents accidental
                  destruction of users, applications, jobs or
                  verification records.
                </p>
              </div>
            </SettingsCard>
          )}

          {activeSection === "system" && (
            <SettingsCard
              title="System"
              description="Read-only information about the TruCity environment."
            >
              {systemInfo ? (
                <div className="admin-system-info-grid">
                  <div>
                    <span>Application</span>
                    <strong>{systemInfo.application}</strong>
                  </div>

                  <div>
                    <span>Backend</span>
                    <strong>{systemInfo.backend}</strong>
                  </div>

                  <div>
                    <span>Spring Boot</span>
                    <strong>{systemInfo.springBootVersion}</strong>
                  </div>

                  <div>
                    <span>Java</span>
                    <strong>{systemInfo.javaVersion}</strong>
                  </div>

                  <div>
                    <span>Database</span>
                    <strong>{systemInfo.database}</strong>
                  </div>

                  <div>
                    <span>Database status</span>
                    <strong
                      className={
                        systemInfo.databaseStatus === "CONNECTED"
                          ? "online"
                          : "offline"
                      }
                    >
                      {systemInfo.databaseStatus}
                    </strong>
                  </div>

                  <div>
                    <span>Environment</span>
                    <strong>{systemInfo.environment}</strong>
                  </div>
                </div>
              ) : (
                <div className="admin-settings-empty">
                  Loading system information...
                </div>
              )}
            </SettingsCard>
          )}
        </div>
      </div>
    </div>
  );
}