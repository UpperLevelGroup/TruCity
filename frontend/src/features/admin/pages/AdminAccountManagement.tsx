import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Eye,
  Flag,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  UserRound,
  Building2,
  X,
} from "lucide-react";

import api from "../../../api/axios";
import AdminPageHeader from "../components/AdminPageHeader";
import "../../../styles/admin-account-management.css";

//type AccountRole = "CANDIDATE" | "EMPLOYER" | "ADMIN" | "VERIFIER";

type Account = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  companyName: string;
  roles: string[];
  role: string;
  status: string;
  enabled: boolean;
  verified: boolean;
  createdAt: string;
  location: string;
  openFlagCount: number;
  hasOpenFlags: boolean;
  raw: Record<string, unknown>;
};

type AccountFlag = {
  id: string;
  userId: string;
  reason: string;
  createdAt?: string;
  resolved: boolean;
  user?: Record<string, unknown>;
  raw: Record<string, unknown>;
};

type AccountDetails = Record<string, unknown>;

type Notice = {
  kind: "success" | "error";
  message: string;
};

const ACCOUNT_ROLES: { value: string; label: string }[] = [
  { value: "", label: "All account types" },
  { value: "CANDIDATE", label: "Candidates" },
  { value: "EMPLOYER", label: "Employers" },
  { value: "ADMIN", label: "Administrators" },
  { value: "VERIFIER", label: "Verifiers" },
];

function asObject(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
}

function asString(value: unknown, fallback = ""): string {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }
  return fallback;
}

function asBoolean(value: unknown, fallback = false): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string") {
    if (value.toLowerCase() === "true") return true;
    if (value.toLowerCase() === "false") return false;
  }
  return fallback;
}

function normalizeRoles(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (typeof item === "string") return item.toUpperCase();

      const role = asObject(item);
      return asString(role.name ?? role.roleName ?? role.authority)
        .toUpperCase();
    })
    .filter(Boolean);
}

function normalizeAccount(value: unknown): Account {
  const outer = asObject(value);
  const user = asObject(outer.user);
  const source = Object.keys(user).length ? user : outer;

  const roles = normalizeRoles(outer.roles ?? source.roles);
  const role = asString(
    outer.role ?? source.role ?? roles[0],
    "UNKNOWN",
  ).toUpperCase();

  const status = asString(
    outer.status ?? source.status,
    asBoolean(source.enabled, true) ? "ACTIVE" : "SUSPENDED",
  ).toUpperCase();

  const deleted =
    Boolean(source.deletedAt ?? source.deleted_at) ||
    status === "REMOVED" ||
    status === "DELETED";

  const enabled = asBoolean(
    source.enabled,
    !["SUSPENDED", "DISABLED", "REMOVED", "DELETED"].includes(status),
  );

  const firstName = asString(
    source.firstName ?? source.first_name,
  );
  const lastName = asString(
    source.lastName ?? source.last_name,
  );

  const flagsCount = Number(
    outer.openFlagCount ?? source.openFlagCount ?? 0,
  );

  return {
    id: asString(outer.id ?? source.id ?? outer.userId ?? source.userId),
    email: asString(outer.email ?? source.email),
    firstName,
    lastName,
    companyName: asString(
      outer.companyName ??
        source.companyName ??
        source.company_name ??
        outer.company,
    ),
    roles,
    role,
    status: deleted ? "REMOVED" : status,
    enabled: deleted ? false : enabled,
    verified: asBoolean(
      outer.verified ??
        outer.isVerified ??
        source.verified ??
        source.isVerified ??
        source.is_verified,
    ),
    createdAt: asString(
      outer.createdAt ?? outer.created_at ??
        source.createdAt ?? source.created_at,
    ),
    location: asString(
      outer.location ?? source.location ?? source.registeredAddress,
    ),
    openFlagCount: Number.isFinite(flagsCount) ? flagsCount : 0,
    hasOpenFlags: asBoolean(
      outer.hasOpenFlags ?? source.hasOpenFlags,
      flagsCount > 0,
    ),
    raw: outer,
  };
}

function normalizeFlag(value: unknown): AccountFlag {
  const raw = asObject(value);
  const user = asObject(raw.user);

  return {
    id: asString(raw.id ?? raw.flagId),
    userId: asString(raw.userId ?? raw.user_id ?? user.id),
    reason: asString(raw.reason ?? raw.description, "No reason supplied"),
    createdAt: asString(raw.createdAt ?? raw.created_at),
    resolved: asBoolean(raw.resolved),
    user,
    raw,
  };
}

function displayDate(value?: string): string {
  if (!value) return "—";

  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString();
}

function readable(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";

  if (typeof value === "boolean") return value ? "Yes" : "No";

  if (Array.isArray(value)) {
    return value.length
      ? value.map((item) => readable(item)).join(", ")
      : "—";
  }

  if (typeof value === "object") {
    return JSON.stringify(value, null, 2);
  }

  return String(value);
}

function accountName(account: Account): string {
  return (
    account.companyName ||
    `${account.firstName} ${account.lastName}`.trim() ||
    account.email ||
    "Unnamed account"
  );
}

function getErrorMessage(error: unknown, fallback: string): string {
  const err = asObject(error);
  const response = asObject(err.response);
  const data = asObject(response.data);

  return asString(data.message ?? data.error ?? data.detail, fallback);
}

export default function AdminAccountManagement() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [flags, setFlags] = useState<AccountFlag[]>([]);
  const [selectedAccount, setSelectedAccount] =
    useState<AccountDetails | null>(null);
  const [selectedAccountSummary, setSelectedAccountSummary] =
    useState<Account | null>(null);

  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [flagFilter, setFlagFilter] = useState("OPEN");
  const [activeTab, setActiveTab] = useState<"accounts" | "flags">(
    "accounts",
  );

  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [loadingFlags, setLoadingFlags] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [workingId, setWorkingId] = useState("");
  const [notice, setNotice] = useState<Notice | null>(null);

  const loadAccounts = useCallback(async () => {
    setLoadingAccounts(true);

    try {
      const response = await api.get<unknown>("/admin/accounts", {
        params: role ? { role } : undefined,
      });

      const data = Array.isArray(response.data)
        ? response.data
        : Array.isArray(asObject(response.data).content)
          ? (asObject(response.data).content as unknown[])
          : Array.isArray(asObject(response.data).accounts)
            ? (asObject(response.data).accounts as unknown[])
            : [];

      setAccounts(data.map(normalizeAccount));
    } catch (error) {
      setNotice({
        kind: "error",
        message: getErrorMessage(
          error,
          "Unable to load accounts. Confirm you are signed in as an administrator and the account API is available.",
        ),
      });
    } finally {
      setLoadingAccounts(false);
    }
  }, [role]);

  const loadFlags = useCallback(async () => {
    setLoadingFlags(true);

    try {
      const response = await api.get<unknown>("/admin/accounts/flags", {
        params:
          flagFilter === "OPEN"
            ? { resolved: false }
            : flagFilter === "RESOLVED"
              ? { resolved: true }
              : undefined,
      });

      const data = Array.isArray(response.data)
        ? response.data
        : Array.isArray(asObject(response.data).content)
          ? (asObject(response.data).content as unknown[])
          : Array.isArray(asObject(response.data).flags)
            ? (asObject(response.data).flags as unknown[])
            : [];

      setFlags(data.map(normalizeFlag));
    } catch (error) {
      setNotice({
        kind: "error",
        message: getErrorMessage(
          error,
          "Unable to load account flags.",
        ),
      });
    } finally {
      setLoadingFlags(false);
    }
  }, [flagFilter]);

  const refreshAll = useCallback(async () => {
    setNotice(null);
    await Promise.all([loadAccounts(), loadFlags()]);
  }, [loadAccounts, loadFlags]);

  useEffect(() => {
    void loadAccounts();
  }, [loadAccounts]);

  useEffect(() => {
    void loadFlags();
  }, [loadFlags]);

  const filteredAccounts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return accounts.filter((account) => {
      const matchesSearch =
        !query ||
        [
          account.id,
          account.email,
          account.firstName,
          account.lastName,
          account.companyName,
          account.role,
          account.location,
          account.status,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        !status ||
        (status === "ACTIVE" && account.enabled && account.status === "ACTIVE") ||
        (status === "SUSPENDED" &&
          !account.enabled &&
          account.status !== "REMOVED") ||
        (status === "REMOVED" && account.status === "REMOVED");

      return matchesSearch && matchesStatus;
    });
  }, [accounts, search, status]);

  const activeCount = accounts.filter(
    (account) => account.enabled && account.status === "ACTIVE",
  ).length;

  const suspendedCount = accounts.filter(
    (account) =>
      !account.enabled && account.status !== "REMOVED",
  ).length;

  const removedCount = accounts.filter(
    (account) => account.status === "REMOVED",
  ).length;

  async function viewAccount(account: Account) {
    setSelectedAccountSummary(account);
    setSelectedAccount(null);
    setLoadingDetails(true);
    setNotice(null);

    try {
      let endpoint: string;

      if (account.role === "CANDIDATE") {
        endpoint = `/admin/accounts/candidates/${account.id}`;
      } else if (account.role === "EMPLOYER") {
        endpoint = `/admin/accounts/employers/${account.id}`;
      } else {
        endpoint = `/admin/accounts/users/${account.id}`;
      }

      const response = await api.get<unknown>(endpoint);
      setSelectedAccount(asObject(response.data));
    } catch (error) {
      setNotice({
        kind: "error",
        message: getErrorMessage(
          error,
          "Unable to load full account details. Check that the account-detail endpoint exists for this role.",
        ),
      });
    } finally {
      setLoadingDetails(false);
    }
  }

  async function toggleSuspension(account: Account) {
    if (account.status === "REMOVED") {
      setNotice({
        kind: "error",
        message: "Removed accounts cannot be reactivated from this screen.",
      });
      return;
    }

    const suspended = account.enabled;

    const confirmed = window.confirm(
      `${suspended ? "Suspend" : "Reactivate"} ${accountName(account)}?\n\n${
        suspended
          ? "This will disable account access."
          : "This will restore account access."
      }`,
    );

    if (!confirmed) return;

    setWorkingId(account.id);
    setNotice(null);

    try {
      await api.patch(
        `/admin/accounts/users/${account.id}/suspension`,
        { suspended },
      );

      setNotice({
        kind: "success",
        message: `${accountName(account)} has been ${
          suspended ? "suspended" : "reactivated"
        }.`,
      });

      await loadAccounts();
    } catch (error) {
      setNotice({
        kind: "error",
        message: getErrorMessage(
          error,
          "Unable to update account status.",
        ),
      });
    } finally {
      setWorkingId("");
    }
  }

  async function flagAccount(account: Account) {
    const reason = window.prompt(
      `Why are you flagging ${accountName(account)}?`,
    );

    if (!reason?.trim()) return;

    setWorkingId(account.id);
    setNotice(null);

    try {
      await api.post(
        `/admin/accounts/users/${account.id}/flags`,
        { reason: reason.trim() },
      );

      setNotice({
        kind: "success",
        message: "Account flagged for administrator review.",
      });

      await Promise.all([loadAccounts(), loadFlags()]);
    } catch (error) {
      setNotice({
        kind: "error",
        message: getErrorMessage(
          error,
          "Unable to flag this account.",
        ),
      });
    } finally {
      setWorkingId("");
    }
  }

  async function removeAccount(account: Account) {
    if (account.status === "REMOVED") return;

    const reason = window.prompt(
      `Enter a reason for removing ${accountName(account)}.\n\nThe account will be marked removed rather than physically deleting its database record.`,
    );

    if (!reason?.trim()) return;

    const confirmed = window.confirm(
      `Confirm removal of ${accountName(account)}?\n\nThe account will be disabled and marked as removed.`,
    );

    if (!confirmed) return;

    setWorkingId(account.id);
    setNotice(null);

    try {
      await api.post(
        `/admin/accounts/users/${account.id}/remove`,
        { reason: reason.trim() },
      );

      setNotice({
        kind: "success",
        message: `${accountName(account)} has been marked as removed.`,
      });

      if (selectedAccountSummary?.id === account.id) {
        setSelectedAccount(null);
        setSelectedAccountSummary(null);
      }

      await loadAccounts();
    } catch (error) {
      setNotice({
        kind: "error",
        message: getErrorMessage(
          error,
          "Unable to remove this account.",
        ),
      });
    } finally {
      setWorkingId("");
    }
  }

  async function resolveFlag(flag: AccountFlag, resolved: boolean) {
    setWorkingId(flag.id);
    setNotice(null);

    try {
      await api.patch(
        `/admin/accounts/flags/${flag.id}/resolution`,
        { resolved },
      );

      setNotice({
        kind: "success",
        message: resolved
          ? "Flag marked as resolved."
          : "Flag reopened for review.",
      });

      await Promise.all([loadFlags(), loadAccounts()]);
    } catch (error) {
      setNotice({
        kind: "error",
        message: getErrorMessage(
          error,
          "Unable to update flag resolution.",
        ),
      });
    } finally {
      setWorkingId("");
    }
  }

  function renderDetails(value: unknown, parentKey = "") {
    if (value === null || value === undefined) return null;

    if (Array.isArray(value)) {
      if (value.length === 0) return null;

      return (
        <section className="aam-detail-section" key={parentKey}>
          <h3>{parentKey || "Records"}</h3>
          <div className="aam-record-list">
            {value.map((item, index) => (
              <article className="aam-record" key={`${parentKey}-${index}`}>
                {typeof item === "object" && item !== null
                  ? renderDetails(item, `${parentKey} ${index + 1}`)
                  : <p>{readable(item)}</p>}
              </article>
            ))}
          </div>
        </section>
      );
    }

    if (typeof value === "object") {
      const entries = Object.entries(value as Record<string, unknown>).filter(
        ([key, item]) =>
          !["password", "passwordHash", "password_hash", "token"].includes(key) &&
          item !== null &&
          item !== undefined &&
          item !== "",
      );

      if (!entries.length) return null;

      const simpleEntries = entries.filter(
        ([, item]) =>
          typeof item !== "object" || item === null,
      );

      const nestedEntries = entries.filter(
        ([, item]) =>
          typeof item === "object" && item !== null,
      );

      return (
        <section className="aam-detail-section" key={parentKey || "details"}>
          {parentKey && <h3>{parentKey}</h3>}

          {simpleEntries.length > 0 && (
            <dl className="aam-detail-grid">
              {simpleEntries.map(([key, item]) => (
                <div className="aam-detail-field" key={key}>
                  <dt>{key.replace(/([A-Z])/g, " $1").replace(/_/g, " ")}</dt>
                  <dd>{readable(item)}</dd>
                </div>
              ))}
            </dl>
          )}

          {nestedEntries.map(([key, item]) =>
            renderDetails(item, key.replace(/([A-Z])/g, " $1")),
          )}
        </section>
      );
    }

    return (
      <p className="aam-detail-value" key={parentKey}>
        {readable(value)}
      </p>
    );
  }

  return (
    <main className="admin-page aam-page">
      <AdminPageHeader
        eyebrow="ADMINISTRATION"
        title="Account Management"
        description="Review candidate and employer accounts, inspect account details, manage access and resolve user flags."
      />

      {notice && (
        <div className={`aam-notice ${notice.kind}`}>
          {notice.kind === "success" ? (
            <CheckCircle2 size={18} />
          ) : (
            <AlertTriangle size={18} />
          )}
          <span>{notice.message}</span>
          <button
            type="button"
            aria-label="Dismiss notification"
            onClick={() => setNotice(null)}
          >
            <X size={16} />
          </button>
        </div>
      )}

      <section className="aam-metrics">
        <article>
          <UserRound />
          <span>Accounts returned</span>
          <strong>{loadingAccounts ? "—" : accounts.length}</strong>
        </article>
        <article>
          <ShieldCheck />
          <span>Active accounts</span>
          <strong>{loadingAccounts ? "—" : activeCount}</strong>
        </article>
        <article>
          <AlertTriangle />
          <span>Suspended accounts</span>
          <strong>{loadingAccounts ? "—" : suspendedCount}</strong>
        </article>
        <article>
          <Trash2 />
          <span>Removed accounts</span>
          <strong>{loadingAccounts ? "—" : removedCount}</strong>
        </article>
      </section>

      <div className="aam-toolbar">
        <div className="aam-tabs">
          <button
            type="button"
            className={activeTab === "accounts" ? "active" : ""}
            onClick={() => setActiveTab("accounts")}
          >
            <UserRound size={16} />
            Accounts
          </button>
          <button
            type="button"
            className={activeTab === "flags" ? "active" : ""}
            onClick={() => setActiveTab("flags")}
          >
            <Flag size={16} />
            Flag review
            {flags.filter((flag) => !flag.resolved).length > 0 && (
              <span className="aam-count">
                {flags.filter((flag) => !flag.resolved).length}
              </span>
            )}
          </button>
        </div>

        <button
          type="button"
          className="aam-refresh"
          onClick={() => void refreshAll()}
          disabled={loadingAccounts || loadingFlags}
        >
          <RefreshCw size={15} />
          Refresh
        </button>
      </div>

      {activeTab === "accounts" && (
        <>
          <div className="aam-filters">
            <label className="aam-search">
              <Search size={18} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name, email, company or account ID..."
              />
            </label>

            <label>
              Account type
              <select
                value={role}
                onChange={(event) => setRole(event.target.value)}
              >
                {ACCOUNT_ROLES.map((item) => (
                  <option value={item.value} key={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Account status
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
              >
                <option value="">All statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="REMOVED">Removed</option>
              </select>
            </label>
          </div>

          <section className="aam-table-card">
            <div className="aam-table-heading">
              <div>
                <h2>Registered accounts</h2>
                <p>
                  Account details and management actions are restricted to
                  administrators.
                </p>
              </div>
              <span>{filteredAccounts.length} results</span>
            </div>

            {loadingAccounts ? (
              <div className="aam-state">Loading accounts…</div>
            ) : (
              <div className="aam-table-wrap">
                <table className="aam-table">
                  <thead>
                    <tr>
                      <th>Account</th>
                      <th>Role</th>
                      <th>Location</th>
                      <th>Verification</th>
                      <th>Status</th>
                      <th>Flags</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAccounts.map((account) => (
                      <tr key={account.id}>
                        <td>
                          <strong>{accountName(account)}</strong>
                          <small>{account.email || account.id}</small>
                          {account.createdAt && (
                            <small>
                              Joined {displayDate(account.createdAt)}
                            </small>
                          )}
                        </td>
                        <td>{account.role}</td>
                        <td>{account.location || "—"}</td>
                        <td>
                          <span
                            className={`aam-pill ${
                              account.verified ? "good" : "warning"
                            }`}
                          >
                            {account.verified ? "Verified" : "Not verified"}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`aam-pill ${
                              account.status === "ACTIVE"
                                ? "good"
                                : account.status === "REMOVED"
                                  ? "removed"
                                  : "warning"
                            }`}
                          >
                            {account.status}
                          </span>
                        </td>
                        <td>
                          {account.openFlagCount > 0 || account.hasOpenFlags ? (
                            <span className="aam-pill warning">
                              {account.openFlagCount || "Open"} flag(s)
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td>
                          <div className="aam-actions">
                            <button
                              type="button"
                              onClick={() => void viewAccount(account)}
                              disabled={workingId === account.id}
                            >
                              <Eye size={14} />
                              View
                            </button>
                            <button
                              type="button"
                              onClick={() => void flagAccount(account)}
                              disabled={workingId === account.id}
                            >
                              <Flag size={14} />
                              Flag
                            </button>
                            {account.status !== "REMOVED" && (
                              <button
                                type="button"
                                className={
                                  account.enabled ? "danger" : "reactivate"
                                }
                                onClick={() => void toggleSuspension(account)}
                                disabled={workingId === account.id}
                              >
                                {account.enabled ? "Suspend" : "Reactivate"}
                              </button>
                            )}
                            {account.status !== "REMOVED" && (
                              <button
                                type="button"
                                className="danger"
                                onClick={() => void removeAccount(account)}
                                disabled={workingId === account.id}
                              >
                                <Trash2 size={14} />
                                Remove
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredAccounts.length === 0 && (
                  <div className="aam-state">
                    {accounts.length
                      ? "No accounts match your search and filters."
                      : "No accounts were returned by the backend."}
                  </div>
                )}
              </div>
            )}
          </section>
        </>
      )}

      {activeTab === "flags" && (
        <section className="aam-table-card">
          <div className="aam-table-heading">
            <div>
              <h2>Account flag review</h2>
              <p>
                Review reports submitted by administrators and track
                outstanding concerns.
              </p>
            </div>

            <label className="aam-flag-filter">
              Filter flags
              <select
                value={flagFilter}
                onChange={(event) => setFlagFilter(event.target.value)}
              >
                <option value="OPEN">Open flags</option>
                <option value="RESOLVED">Resolved flags</option>
                <option value="ALL">All flags</option>
              </select>
            </label>
          </div>

          {loadingFlags ? (
            <div className="aam-state">Loading flags…</div>
          ) : (
            <div className="aam-table-wrap">
              <table className="aam-table">
                <thead>
                  <tr>
                    <th>Account ID</th>
                    <th>Reason</th>
                    <th>Reported</th>
                    <th>Review status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {flags.map((flag) => (
                    <tr key={flag.id}>
                      <td>
                        <strong>{flag.userId || "Unknown account"}</strong>
                        {flag.user && (
                          <small>
                            {asString(flag.user.email) ||
                              asString(flag.user.firstName) ||
                              ""}
                          </small>
                        )}
                      </td>
                      <td className="aam-reason">{flag.reason}</td>
                      <td>{displayDate(flag.createdAt)}</td>
                      <td>
                        <span
                          className={`aam-pill ${
                            flag.resolved ? "good" : "warning"
                          }`}
                        >
                          {flag.resolved ? "Resolved" : "Open"}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className={
                            flag.resolved ? "aam-action-button" : "aam-resolve"
                          }
                          disabled={workingId === flag.id}
                          onClick={() =>
                            void resolveFlag(flag, !flag.resolved)
                          }
                        >
                          {flag.resolved ? "Reopen" : "Mark resolved"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {flags.length === 0 && (
                <div className="aam-state">
                  No flags were returned for this filter.
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {selectedAccountSummary && (
        <div
          className="aam-overlay"
          onClick={() => {
            setSelectedAccountSummary(null);
            setSelectedAccount(null);
          }}
        >
          <section
            className="aam-drawer"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="aam-drawer-header">
              <div className="aam-drawer-icon">
                {selectedAccountSummary.role === "EMPLOYER" ? (
                  <Building2 />
                ) : (
                  <UserRound />
                )}
              </div>
              <div>
                <span className="aam-eyebrow">
                  {selectedAccountSummary.role} ACCOUNT
                </span>
                <h2>{accountName(selectedAccountSummary)}</h2>
                <p>{selectedAccountSummary.email}</p>
              </div>
              <button
                type="button"
                className="aam-close"
                aria-label="Close account details"
                onClick={() => {
                  setSelectedAccountSummary(null);
                  setSelectedAccount(null);
                }}
              >
                <X />
              </button>
            </div>

            {loadingDetails ? (
              <div className="aam-state">Loading full account details…</div>
            ) : selectedAccount ? (
              <div className="aam-drawer-content">
                <div className="aam-summary-strip">
                  <span
                    className={`aam-pill ${
                      selectedAccountSummary.status === "ACTIVE"
                        ? "good"
                        : "warning"
                    }`}
                  >
                    {selectedAccountSummary.status}
                  </span>
                  <span className="aam-pill">
                    {selectedAccountSummary.verified
                      ? "Verified"
                      : "Not verified"}
                  </span>
                  <span className="aam-pill">
                    {selectedAccountSummary.openFlagCount} open flags
                  </span>
                </div>

                {renderDetails(selectedAccount, "Account details")}
              </div>
            ) : (
              <div className="aam-state">
                Account details could not be loaded. Close this panel and try
                again.
              </div>
            )}

            <div className="aam-drawer-footer">
              <button
                type="button"
                className="aam-action-button"
                onClick={() => {
                  setSelectedAccountSummary(null);
                  setSelectedAccount(null);
                }}
              >
                Close
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}