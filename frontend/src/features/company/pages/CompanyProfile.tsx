import React, { useEffect, useState } from "react";
import companyService from "../company.service";
import type { CompanyProfile as CompanyProfileType } from "../company.types";
import logo from "../../../assets/trucity-logo.png";

export default function CompanyProfile() {
  const [profile, setProfile] = useState<CompanyProfileType | null>(null);
  const [formData, setFormData] = useState<CompanyProfileType | null>(null);

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setMessage(null);

      const data = await companyService.getProfile();

      if (data) {
        setProfile(data);
        setFormData(data);
      } else {
        setProfile(null);
        setFormData(null);
      }
    } catch (error) {
      console.error("Failed to load company profile:", error);

      setMessage({
        type: "error",
        text: "Unable to load your company profile. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    field: keyof CompanyProfileType,
    value: string
  ) => {
    if (!formData) return;

    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleEdit = () => {
    if (!profile) return;

    setFormData({ ...profile });
    setEditing(true);
    setMessage(null);
  };

  const handleCancel = () => {
    setFormData(profile ? { ...profile } : null);
    setEditing(false);
    setMessage(null);
  };

  const handleSave = async () => {
    if (!formData) return;

    try {
      setSaving(true);
      setMessage(null);

      const updatedProfile = {
        ...formData,
        updatedAt: new Date().toISOString(),
      };

      const savedProfile =
        await companyService.saveProfile(updatedProfile);

      setProfile(savedProfile);
      setFormData(savedProfile);
      setEditing(false);

      setMessage({
        type: "success",
        text: "Company profile updated successfully.",
      });
    } catch (error) {
      console.error("Failed to save company profile:", error);

      setMessage({
        type: "error",
        text: "Unable to save your changes. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <Watermark />

        <div style={styles.loadingCard}>
          <div style={styles.spinner} />

          <h2 style={styles.loadingTitle}>
            Loading company profile
          </h2>

          <p style={styles.loadingText}>
            Please wait while we retrieve your company information.
          </p>
        </div>
      </div>
    );
  }

  if (!profile || !formData) {
    return (
      <div style={styles.page}>
        <Watermark />

        <div style={styles.emptyCard}>
          <div style={styles.emptyIcon}>!</div>

          <h2 style={styles.emptyTitle}>
            Company profile unavailable
          </h2>

          <p style={styles.emptyText}>
            We couldn't retrieve your company profile at the moment.
          </p>

          <button
            type="button"
            onClick={loadProfile}
            style={styles.primaryButton}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const verification = getVerificationStatus(
    profile.verificationStatus
  );

  return (
    <div style={styles.page}>
      <Watermark />

      {/* Decorative branding */}
      <div style={styles.decorCircleOne} />
      <div style={styles.decorCircleTwo} />
      <div style={styles.decorCircleThree} />
      <div style={styles.decorCircleFour} />

      <div style={styles.container}>
        {/* Header */}
        <header style={styles.header}>
          <div style={styles.headerLeft}>
            <div style={styles.logoWrap}>
              <img
                src={logo}
                alt="TruCity"
                style={styles.logo}
              />
            </div>

            <div>
              <div style={styles.eyebrow}>
                COMPANY ACCOUNT
              </div>

              <h1 style={styles.title}>
                Company Profile
              </h1>

              <p style={styles.subtitle}>
                Manage your company's verified information and
                contact details.
              </p>
            </div>
          </div>

          <div style={styles.headerActions}>
            {!editing ? (
              <button
                type="button"
                onClick={handleEdit}
                style={styles.primaryButton}
              >
                <span style={styles.buttonIcon}>✎</span>
                Edit Profile
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={saving}
                  style={styles.secondaryButton}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  style={{
                    ...styles.primaryButton,
                    opacity: saving ? 0.65 : 1,
                  }}
                >
                  {saving ? (
                    <>
                      <span style={styles.smallSpinner} />
                      Saving...
                    </>
                  ) : (
                    <>
                      <span style={styles.buttonIcon}>✓</span>
                      Save Changes
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </header>

        {/* Message */}
        {message && (
          <div
            style={{
              ...styles.message,
              ...(message.type === "success"
                ? styles.successMessage
                : styles.errorMessage),
            }}
          >
            <div
              style={{
                ...styles.messageIcon,
                ...(message.type === "success"
                  ? styles.successIcon
                  : styles.errorIcon),
              }}
            >
              {message.type === "success" ? "✓" : "!"}
            </div>

            <span>{message.text}</span>
          </div>
        )}

        {/* Profile overview */}
        <section style={styles.profileHero}>
          <div style={styles.heroBrand}>
            <div style={styles.companyLogo}>
              <img
                src={logo}
                alt="TruCity"
                style={styles.heroLogo}
              />
            </div>

            <div>
              <div style={styles.heroLabel}>
                VERIFIED COMPANY
              </div>

              <h2 style={styles.companyName}>
                {displayValue(profile.tradingName)}
              </h2>

              <p style={styles.companyLegalName}>
                {displayValue(profile.legalName)}
              </p>
            </div>
          </div>

          <div
            style={{
              ...styles.verificationBadge,
              background: verification.background,
              borderColor: verification.border,
              color: verification.color,
            }}
          >
            <span style={styles.verificationDot} />
            {verification.label}
          </div>
        </section>

        {/* Main grid */}
        <div style={styles.grid}>
          {/* Company identity */}
          <ProfileCard
            eyebrow="IDENTITY"
            title="Company Identity"
            description="Your company's registered and public information."
          >
            <div style={styles.fieldsGrid}>
              <ProfileField
                label="Legal Name"
                value={formData.legalName}
                editing={editing}
                onChange={(value) =>
                  handleChange("legalName", value)
                }
              />

              <ProfileField
                label="Trading Name"
                value={formData.tradingName}
                editing={editing}
                onChange={(value) =>
                  handleChange("tradingName", value)
                }
              />

              <ProfileField
                label="Company Registration Number"
                value={formData.companyRegNo}
                editing={editing}
                onChange={(value) =>
                  handleChange("companyRegNo", value)
                }
              />

              <ProfileField
                label="Industry"
                value={formData.industry}
                editing={editing}
                onChange={(value) =>
                  handleChange("industry", value)
                }
              />

              <ProfileField
                label="Region"
                value={formData.region}
                editing={editing}
                onChange={(value) =>
                  handleChange("region", value)
                }
              />

              <ProfileField
                label="Website"
                value={formData.website}
                editing={editing}
                onChange={(value) =>
                  handleChange("website", value)
                }
              />

              <ProfileField
                label="Registered Address"
                value={formData.registeredAddress}
                editing={editing}
                onChange={(value) =>
                  handleChange("registeredAddress", value)
                }
                fullWidth
              />

              <ProfileField
                label="Company Description"
                value={formData.companyDescription}
                editing={editing}
                onChange={(value) =>
                  handleChange("companyDescription", value)
                }
                multiline
                fullWidth
              />
            </div>
          </ProfileCard>

          {/* Contact */}
          <ProfileCard
            eyebrow="CONTACT"
            title="Contact Information"
            description="How candidates and TruCity can contact your company."
          >
            <div style={styles.fieldsGrid}>
              <ProfileField
                label="Company Email"
                value={formData.companyEmail}
                editing={editing}
                onChange={(value) =>
                  handleChange("companyEmail", value)
                }
              />

              <ProfileField
                label="Phone Number"
                value={formData.phone}
                editing={editing}
                onChange={(value) =>
                  handleChange("phone", value)
                }
              />
            </div>
          </ProfileCard>

          {/* Representative */}
          <ProfileCard
            eyebrow="REPRESENTATIVE"
            title="Company Representative"
            description="Primary representative associated with this account."
          >
            <div style={styles.fieldsGrid}>
              <ProfileField
                label="Full Name"
                value={formData.representativeName}
                editing={editing}
                onChange={(value) =>
                  handleChange("representativeName", value)
                }
              />

              <ProfileField
                label="Email Address"
                value={formData.representativeEmail}
                editing={editing}
                onChange={(value) =>
                  handleChange("representativeEmail", value)
                }
              />

              <ProfileField
                label="Phone Number"
                value={formData.representativePhone}
                editing={editing}
                onChange={(value) =>
                  handleChange("representativePhone", value)
                }
              />
            </div>
          </ProfileCard>

          {/* Verification */}
          <ProfileCard
            eyebrow="TRUCITY VERIFICATION"
            title="Verification"
            description="Your company's verification and account information."
          >
            <div style={styles.verificationPanel}>
              <div style={styles.verificationTop}>
                <div
                  style={{
                    ...styles.largeStatusIcon,
                    background: verification.background,
                    color: verification.color,
                  }}
                >
                  {verification.icon}
                </div>

                <div style={styles.verificationCopy}>
                  <div
                    style={{
                      ...styles.verificationStatus,
                      color: verification.color,
                    }}
                  >
                    {verification.label}
                  </div>

                  <p style={styles.verificationDescription}>
                    {verification.description}
                  </p>
                </div>
              </div>
            </div>

            <div style={styles.metaGrid}>
              <MetaItem
                label="Account ID"
                value={displayValue(profile.id)}
              />

              <MetaItem
                label="Created"
                value={formatDate(profile.createdAt)}
              />

              <MetaItem
                label="Last Updated"
                value={formatDate(profile.updatedAt)}
              />
            </div>
          </ProfileCard>
        </div>

        {/* Footer branding */}
        <footer style={styles.footer}>
          <div style={styles.footerBrand}>
            <img
              src={logo}
              alt="TruCity"
              style={styles.footerLogo}
            />

            <span>
              VERIFY • CONNECT • PERSUE
            </span>
          </div>

          <span style={styles.footerText}>
            Trusted employers. Verified talent.
          </span>
        </footer>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Components                                                                 */
/* -------------------------------------------------------------------------- */

interface ProfileCardProps {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}

function ProfileCard({
  eyebrow,
  title,
  description,
  children,
}: ProfileCardProps) {
  return (
    <section style={styles.card}>
      <div style={styles.cardHeader}>
        <div>
          <div style={styles.cardEyebrow}>
            {eyebrow}
          </div>

          <h3 style={styles.cardTitle}>
            {title}
          </h3>

          <p style={styles.cardDescription}>
            {description}
          </p>
        </div>

        <div style={styles.cardAccent} />
      </div>

      <div style={styles.cardBody}>
        {children}
      </div>
    </section>
  );
}

interface ProfileFieldProps {
  label: string;
  value?: string | null;
  editing: boolean;
  onChange: (value: string) => void;
  multiline?: boolean;
  fullWidth?: boolean;
}

function ProfileField({
  label,
  value,
  editing,
  onChange,
  multiline = false,
  fullWidth = false,
}: ProfileFieldProps) {
  const display = displayValue(value);

  return (
    <div
      style={{
        ...styles.field,
        ...(fullWidth ? styles.fullWidth : {}),
      }}
    >
      <label style={styles.fieldLabel}>
        {label}
      </label>

      {editing ? (
        multiline ? (
          <textarea
            value={value ?? ""}
            onChange={(event) =>
              onChange(event.target.value)
            }
            rows={4}
            style={styles.textarea}
          />
        ) : (
          <input
            type="text"
            value={value ?? ""}
            onChange={(event) =>
              onChange(event.target.value)
            }
            style={styles.input}
          />
        )
      ) : (
        <div
          style={{
            ...styles.fieldValue,
            ...(display === "Not provided"
              ? styles.emptyValue
              : {}),
          }}
        >
          {display}
        </div>
      )}
    </div>
  );
}

interface MetaItemProps {
  label: string;
  value: string;
}

function MetaItem({ label, value }: MetaItemProps) {
  return (
    <div style={styles.metaItem}>
      <span style={styles.metaLabel}>
        {label}
      </span>

      <span style={styles.metaValue}>
        {value}
      </span>
    </div>
  );
}

function Watermark() {
  return (
    <div style={styles.watermark} aria-hidden="true">
      <div style={styles.watermarkHandshake}>
        🤝
      </div>

      <div style={styles.watermarkText}>
        TRUCITY
      </div>

      <div style={styles.watermarkSubtext}>
        VERIFY • CONNECT • PERSUE
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function displayValue(value?: string | null) {
  if (!value || !value.trim()) {
    return "Not provided";
  }

  return value;
}

function formatDate(value?: string | null) {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return date.toLocaleDateString("en-ZA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getVerificationStatus(status?: string | null) {
  const normalized = String(status ?? "")
    .toLowerCase()
    .trim();

  if (
    normalized === "approved" ||
    normalized === "verified"
  ) {
    return {
      label: "Verified",
      color: "#087443",
      background: "#EAF8F0",
      border: "#B8E5CB",
      icon: "✓",
      description:
        "Your company has successfully completed TruCity verification.",
    };
  }

  if (
    normalized === "rejected" ||
    normalized === "declined"
  ) {
    return {
      label: "Verification Rejected",
      color: "#B42318",
      background: "#FFF1F0",
      border: "#F3C4C0",
      icon: "!",
      description:
        "Your company verification requires attention.",
    };
  }

  if (
    normalized === "verifying" ||
    normalized === "in_review" ||
    normalized === "in review"
  ) {
    return {
      label: "Under Review",
      color: "#B54708",
      background: "#FFF7E8",
      border: "#F3D19B",
      icon: "•",
      description:
        "Your company information is currently being reviewed.",
    };
  }

  return {
    label: "Pending Verification",
    color: "#B54708",
    background: "#FFF7E8",
    border: "#F3D19B",
    icon: "•",
    description:
      "Complete verification to build trust with candidates.",
  };
}

/* -------------------------------------------------------------------------- */
/* Styles                                                                     */
/* -------------------------------------------------------------------------- */

const styles: Record<string, React.CSSProperties> = {
  page: {
    position: "relative",
    minHeight: "100%",
    width: "100%",
    overflow: "hidden",
    background:
      "linear-gradient(135deg, #F8FCFF 0%, #FFFFFF 48%, #F4FAFD 100%)",
    color: "#00273D",
    fontFamily:
      "Helvetica, Arial, sans-serif",
    padding: "32px",
    boxSizing: "border-box",
  },

  container: {
    position: "relative",
    zIndex: 2,
    width: "100%",
    maxWidth: "1450px",
    margin: "0 auto",
  },

  watermark: {
    position: "absolute",
    zIndex: 0,
    right: "-20px",
    top: "130px",
    width: "470px",
    textAlign: "center",
    pointerEvents: "none",
    userSelect: "none",
    opacity: 0.035,
    transform: "rotate(-8deg)",
  },

  watermarkHandshake: {
    fontSize: "150px",
    lineHeight: 1,
  },

  watermarkText: {
    marginTop: "-10px",
    fontSize: "74px",
    fontWeight: 900,
    letterSpacing: "10px",
  },

  watermarkSubtext: {
    marginTop: "8px",
    fontSize: "12px",
    fontWeight: 800,
    letterSpacing: "4px",
  },

  decorCircleOne: {
    position: "absolute",
    zIndex: 0,
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    background:
      "linear-gradient(135deg, rgba(255,173,1,.20), rgba(255,215,132,.06))",
    top: "-35px",
    left: "12%",
    pointerEvents: "none",
  },

  decorCircleTwo: {
    position: "absolute",
    zIndex: 0,
    width: "90px",
    height: "90px",
    borderRadius: "50%",
    border: "14px solid rgba(30,146,210,.06)",
    bottom: "90px",
    right: "4%",
    pointerEvents: "none",
  },

  decorCircleThree: {
    position: "absolute",
    zIndex: 0,
    width: "52px",
    height: "52px",
    borderRadius: "50%",
    background: "rgba(0,70,109,.055)",
    top: "42%",
    left: "2%",
    pointerEvents: "none",
  },

  decorCircleFour: {
    position: "absolute",
    zIndex: 0,
    width: "34px",
    height: "34px",
    borderRadius: "50%",
    background: "rgba(255,173,1,.13)",
    bottom: "8%",
    left: "12%",
    pointerEvents: "none",
  },

  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "24px",
    marginBottom: "28px",
    flexWrap: "wrap",
  },

  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "18px",
  },

  logoWrap: {
    width: "68px",
    height: "68px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#FFFFFF",
    border: "1px solid rgba(0,70,109,.10)",
    borderRadius: "18px",
    boxShadow: "0 8px 24px rgba(0,39,61,.08)",
  },

  logo: {
    width: "52px",
    maxHeight: "52px",
    objectFit: "contain",
  },

  eyebrow: {
    color: "#FFAD01",
    fontSize: "11px",
    fontWeight: 900,
    letterSpacing: "2px",
    marginBottom: "4px",
  },

  title: {
    margin: 0,
    color: "#00273D",
    fontSize: "32px",
    lineHeight: 1.1,
    fontWeight: 800,
    letterSpacing: "-0.8px",
  },

  subtitle: {
    margin: "7px 0 0",
    color: "#668091",
    fontSize: "14px",
    lineHeight: 1.5,
  },

  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  primaryButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    border: "none",
    borderRadius: "11px",
    padding: "12px 18px",
    background: "#00466D",
    color: "#FFFFFF",
    fontSize: "13px",
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: "0 8px 18px rgba(0,70,109,.18)",
    transition: "all .2s ease",
  },

  secondaryButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid #C9DCE5",
    borderRadius: "11px",
    padding: "11px 17px",
    background: "#FFFFFF",
    color: "#00466D",
    fontSize: "13px",
    fontWeight: 800,
    cursor: "pointer",
  },

  buttonIcon: {
    fontSize: "15px",
    lineHeight: 1,
  },

  message: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "13px 16px",
    borderRadius: "12px",
    marginBottom: "22px",
    fontSize: "13px",
    fontWeight: 700,
    border: "1px solid",
  },

  successMessage: {
    color: "#087443",
    background: "#F0FAF4",
    borderColor: "#B8E5CB",
  },

  errorMessage: {
    color: "#B42318",
    background: "#FFF5F4",
    borderColor: "#F1C6C2",
  },

  messageIcon: {
    width: "24px",
    height: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50%",
    fontWeight: 900,
  },

  successIcon: {
    background: "#D9F3E4",
  },

  errorIcon: {
    background: "#FDE0DD",
  },

  profileHero: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px",
    padding: "25px",
    marginBottom: "22px",
    borderRadius: "18px",
    background:
      "linear-gradient(115deg, #003D5D 0%, #00466D 58%, #075B84 100%)",
    boxShadow: "0 15px 38px rgba(0,39,61,.16)",
    position: "relative",
    overflow: "hidden",
    flexWrap: "wrap",
  },

  heroBrand: {
    display: "flex",
    alignItems: "center",
    gap: "18px",
  },

  companyLogo: {
    width: "74px",
    height: "74px",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#FFFFFF",
    border: "4px solid rgba(255,255,255,.12)",
  },

  heroLogo: {
    width: "56px",
    maxHeight: "56px",
    objectFit: "contain",
  },

  heroLabel: {
    color: "#FFD784",
    fontSize: "10px",
    fontWeight: 900,
    letterSpacing: "2px",
    marginBottom: "6px",
  },

  companyName: {
    margin: 0,
    color: "#FFFFFF",
    fontSize: "24px",
    fontWeight: 800,
  },

  companyLegalName: {
    margin: "5px 0 0",
    color: "rgba(255,255,255,.68)",
    fontSize: "13px",
  },

  verificationBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "9px 13px",
    borderRadius: "999px",
    border: "1px solid",
    fontSize: "12px",
    fontWeight: 900,
    background: "#FFFFFF",
  },

  verificationDot: {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    background: "currentColor",
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(420px, 1fr))",
    gap: "22px",
  },

  card: {
    background: "rgba(255,255,255,.96)",
    border: "1px solid #DFEAF0",
    borderRadius: "17px",
    boxShadow: "0 10px 30px rgba(0,39,61,.055)",
    overflow: "hidden",
  },

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: "22px 22px 17px",
    borderBottom: "1px solid #EDF3F6",
  },

  cardEyebrow: {
    color: "#1E92D2",
    fontSize: "10px",
    fontWeight: 900,
    letterSpacing: "1.7px",
    marginBottom: "5px",
  },

  cardTitle: {
    margin: 0,
    color: "#00273D",
    fontSize: "19px",
    fontWeight: 800,
  },

  cardDescription: {
    margin: "5px 0 0",
    color: "#78909E",
    fontSize: "12px",
    lineHeight: 1.45,
  },

  cardAccent: {
    width: "8px",
    height: "38px",
    borderRadius: "6px",
    background:
      "linear-gradient(180deg, #FFAD01, #FFD784)",
    flexShrink: 0,
  },

  cardBody: {
    padding: "21px 22px 23px",
  },

  fieldsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",
    gap: "18px",
  },

  field: {
    minWidth: 0,
  },

  fullWidth: {
    gridColumn: "1 / -1",
  },

  fieldLabel: {
    display: "block",
    marginBottom: "7px",
    color: "#668091",
    fontSize: "10px",
    fontWeight: 900,
    letterSpacing: "1px",
    textTransform: "uppercase",
  },

  fieldValue: {
    minHeight: "42px",
    display: "flex",
    alignItems: "center",
    padding: "11px 13px",
    boxSizing: "border-box",
    borderRadius: "10px",
    background: "#F7FAFC",
    border: "1px solid #E4EDF1",
    color: "#173F53",
    fontSize: "13px",
    lineHeight: 1.5,
    wordBreak: "break-word",
  },

  emptyValue: {
    color: "#9AAAB3",
    fontStyle: "italic",
  },

  input: {
    width: "100%",
    height: "42px",
    padding: "0 12px",
    boxSizing: "border-box",
    borderRadius: "10px",
    border: "1px solid #BFD5DF",
    background: "#FFFFFF",
    color: "#173F53",
    fontSize: "13px",
    outline: "none",
  },

  textarea: {
    width: "100%",
    padding: "11px 12px",
    boxSizing: "border-box",
    resize: "vertical",
    borderRadius: "10px",
    border: "1px solid #BFD5DF",
    background: "#FFFFFF",
    color: "#173F53",
    fontSize: "13px",
    lineHeight: 1.5,
    outline: "none",
    fontFamily: "inherit",
  },

  verificationPanel: {
    padding: "16px",
    borderRadius: "13px",
    background: "#F7FAFC",
    border: "1px solid #E4EDF1",
  },

  verificationTop: {
    display: "flex",
    alignItems: "center",
    gap: "13px",
  },

  largeStatusIcon: {
    width: "45px",
    height: "45px",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "13px",
    fontSize: "20px",
    fontWeight: 900,
  },

  verificationCopy: {
    minWidth: 0,
  },

  verificationStatus: {
    fontSize: "14px",
    fontWeight: 900,
  },

  verificationDescription: {
    margin: "4px 0 0",
    color: "#718793",
    fontSize: "12px",
    lineHeight: 1.5,
  },

  metaGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(3, minmax(0, 1fr))",
    gap: "10px",
    marginTop: "16px",
  },

  metaItem: {
    padding: "12px",
    borderRadius: "10px",
    background: "#FBFCFD",
    border: "1px solid #EDF2F4",
    minWidth: 0,
  },

  metaLabel: {
    display: "block",
    marginBottom: "4px",
    color: "#8A9AA3",
    fontSize: "9px",
    fontWeight: 900,
    letterSpacing: ".8px",
    textTransform: "uppercase",
  },

  metaValue: {
    display: "block",
    color: "#244C5F",
    fontSize: "11px",
    fontWeight: 700,
    wordBreak: "break-word",
  },

  footer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px",
    marginTop: "28px",
    padding: "18px 3px 5px",
    borderTop: "1px solid #E3EDF2",
    flexWrap: "wrap",
  },

  footerBrand: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    color: "#79909D",
    fontSize: "9px",
    fontWeight: 900,
    letterSpacing: "1.4px",
  },

  footerLogo: {
    width: "65px",
    maxHeight: "28px",
    objectFit: "contain",
  },

  footerText: {
    color: "#9AAAB3",
    fontSize: "11px",
  },

  loadingCard: {
    position: "relative",
    zIndex: 2,
    width: "min(460px, 100%)",
    margin: "120px auto",
    padding: "45px 30px",
    boxSizing: "border-box",
    textAlign: "center",
    background: "#FFFFFF",
    border: "1px solid #DFEAF0",
    borderRadius: "18px",
    boxShadow: "0 15px 40px rgba(0,39,61,.08)",
  },

  spinner: {
    width: "38px",
    height: "38px",
    margin: "0 auto 20px",
    border: "4px solid #E5EEF3",
    borderTop: "4px solid #00466D",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },

  smallSpinner: {
    width: "13px",
    height: "13px",
    border: "2px solid rgba(255,255,255,.35)",
    borderTop: "2px solid #FFFFFF",
    borderRadius: "50%",
    display: "inline-block",
  },

  loadingTitle: {
    margin: 0,
    color: "#00273D",
    fontSize: "20px",
    fontWeight: 800,
  },

  loadingText: {
    margin: "8px 0 0",
    color: "#78909E",
    fontSize: "13px",
  },

  emptyCard: {
    position: "relative",
    zIndex: 2,
    width: "min(500px, 100%)",
    margin: "120px auto",
    padding: "42px 30px",
    boxSizing: "border-box",
    textAlign: "center",
    background: "#FFFFFF",
    border: "1px solid #DFEAF0",
    borderRadius: "18px",
    boxShadow: "0 15px 40px rgba(0,39,61,.08)",
  },

  emptyIcon: {
    width: "50px",
    height: "50px",
    margin: "0 auto 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50%",
    background: "#FFF7E8",
    color: "#B54708",
    fontSize: "24px",
    fontWeight: 900,
  },

  emptyTitle: {
    margin: 0,
    color: "#00273D",
    fontSize: "21px",
    fontWeight: 800,
  },

  emptyText: {
    margin: "8px auto 22px",
    maxWidth: "360px",
    color: "#78909E",
    fontSize: "13px",
    lineHeight: 1.5,
  },
};
