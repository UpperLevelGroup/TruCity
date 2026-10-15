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
    void loadProfile();
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
    value: string,
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
    if (!formData || saving) return;

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
      <div className="tc-company-profile">
        <ProfileStyles />
        <Watermark />

        <div className="tcp-state-card">
          <div className="tcp-spinner" />
          <h2>Loading company profile</h2>
          <p>
            Please wait while we retrieve your company information.
          </p>
        </div>
      </div>
    );
  }

  if (!profile || !formData) {
    return (
      <div className="tc-company-profile">
        <ProfileStyles />
        <Watermark />

        <div className="tcp-state-card">
          <div className="tcp-state-icon">!</div>
          <h2>Company profile unavailable</h2>
          <p>
            We couldn't retrieve your company profile at the moment.
          </p>
          <button
            type="button"
            className="tcp-button tcp-button-primary"
            onClick={() => void loadProfile()}
          >
            Try Again
          </button>
        </div>

        {message && (
          <div className={`tcp-message tcp-message-${message.type}`}>
            {message.text}
          </div>
        )}
      </div>
    );
  }

  const verification = getVerificationStatus(
    profile.verificationStatus,
  );

  return (
    <div className="tc-company-profile">
      <ProfileStyles />
      <Watermark />

      <div className="tcp-decor tcp-decor-one" aria-hidden="true" />
      <div className="tcp-decor tcp-decor-two" aria-hidden="true" />
      <div className="tcp-decor tcp-decor-three" aria-hidden="true" />
      <div className="tcp-decor tcp-decor-four" aria-hidden="true" />

      <div className="tcp-container">
        {/* Page heading */}
        <header className="tcp-page-heading">
          <div className="tcp-heading-copy">
            <div className="tcp-heading-brand">
              <div className="tcp-logo-wrap">
                <img src={logo} alt="TruCity" />
              </div>

              <div>
                <div className="tcp-eyebrow">
                  COMPANY ACCOUNT
                </div>
                <h1 className="tcp-page-title">
                  Company Profile
                </h1>
                <p className="tcp-page-description">
                  Manage your company's registered information,
                  contact details and verification status.
                </p>
              </div>
            </div>
          </div>

          <div className="tcp-heading-actions">
            {!editing ? (
              <button
                type="button"
                className="tcp-button tcp-button-primary"
                onClick={handleEdit}
              >
                <span aria-hidden="true">✎</span>
                Edit Profile
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="tcp-button tcp-button-secondary"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="tcp-button tcp-button-primary"
                  onClick={() => void handleSave()}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span className="tcp-button-spinner" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <span aria-hidden="true">✓</span>
                      Save Changes
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </header>

        {/* Feedback */}
        {message && (
          <div
            className={`tcp-message tcp-message-${message.type}`}
            role="status"
            aria-live="polite"
          >
            <span className="tcp-message-icon" aria-hidden="true">
              {message.type === "success" ? "✓" : "!"}
            </span>
            <span>{message.text}</span>
            <button
              type="button"
              className="tcp-message-dismiss"
              onClick={() => setMessage(null)}
              aria-label="Dismiss message"
            >
              ×
            </button>
          </div>
        )}

        {/* Company summary */}
        <section className="tcp-company-hero">
          <div className="tcp-hero-decoration" aria-hidden="true" />

          <div className="tcp-hero-main">
            <div className="tcp-company-logo">
              <img src={logo} alt="TruCity" />
            </div>

            <div className="tcp-company-heading">
              <div className="tcp-hero-eyebrow">
                COMPANY ACCOUNT OVERVIEW
              </div>
              <h2>{displayValue(profile.tradingName)}</h2>
              <p>{displayValue(profile.legalName)}</p>
              <div className="tcp-company-reference">
                <span className="tcp-reference-dot" />
                Company information and account details
              </div>
            </div>
          </div>

          <div
            className="tcp-verification-badge"
            style={{
              color: verification.color,
              background: verification.background,
              borderColor: verification.border,
            }}
          >
            <span className="tcp-status-dot" />
            {verification.label}
          </div>
        </section>

        {/* Profile sections */}
        <div className="tcp-section-heading">
          <div>
            <span className="tcp-eyebrow">ACCOUNT DETAILS</span>
            <h2>Company Information</h2>
            <p>
              Keep your company's details accurate and up to date.
            </p>
          </div>

          <span className="tcp-section-indicator">
            {editing ? "EDITING PROFILE" : "PROFILE OVERVIEW"}
          </span>
        </div>

        <div className="tcp-profile-grid">
          <ProfileCard
            eyebrow="01 / IDENTITY"
            title="Company Identity"
            description="Your company's registered and public information."
          >
            <div className="tcp-fields-grid">
              <ProfileField
                label="Legal Name"
                value={formData.legalName}
                editing={editing}
                onChange={(value) => handleChange("legalName", value)}
              />

              <ProfileField
                label="Trading Name"
                value={formData.tradingName}
                editing={editing}
                onChange={(value) => handleChange("tradingName", value)}
              />

              <ProfileField
                label="Company Registration Number"
                value={formData.companyRegNo}
                editing={editing}
                onChange={(value) => handleChange("companyRegNo", value)}
              />

              <ProfileField
                label="Industry"
                value={formData.industry}
                editing={editing}
                onChange={(value) => handleChange("industry", value)}
              />

              <ProfileField
                label="Region"
                value={formData.region}
                editing={editing}
                onChange={(value) => handleChange("region", value)}
              />

              <ProfileField
                label="Website"
                value={formData.website}
                editing={editing}
                onChange={(value) => handleChange("website", value)}
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

          <ProfileCard
            eyebrow="02 / CONTACT"
            title="Contact Information"
            description="How candidates and TruCity can contact your company."
          >
            <div className="tcp-fields-grid">
              <ProfileField
                label="Company Email"
                value={formData.companyEmail}
                editing={editing}
                onChange={(value) => handleChange("companyEmail", value)}
              />

              <ProfileField
                label="Phone Number"
                value={formData.phone}
                editing={editing}
                onChange={(value) => handleChange("phone", value)}
              />
            </div>
          </ProfileCard>

          <ProfileCard
            eyebrow="03 / REPRESENTATIVE"
            title="Company Representative"
            description="Primary representative associated with this account."
          >
            <div className="tcp-fields-grid">
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

          <ProfileCard
            eyebrow="04 / TRUST & ACCOUNT"
            title="Verification & Account Details"
            description="Your company's verification status and account history."
          >
            <div className="tcp-verification-panel">
              <div
                className="tcp-large-status-icon"
                style={{
                  background: verification.background,
                  color: verification.color,
                }}
                aria-hidden="true"
              >
                {verification.icon}
              </div>

              <div className="tcp-verification-copy">
                <div
                  className="tcp-verification-status"
                  style={{ color: verification.color }}
                >
                  {verification.label}
                </div>
                <p>{verification.description}</p>
              </div>
            </div>

            <div className="tcp-meta-grid">
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

            <div className="tcp-verification-note">
              <span className="tcp-note-mark" aria-hidden="true">
                i
              </span>
              <p>
                Your verification status reflects the information
                recorded for your company account. If your status
                requires attention, contact TruCity support.
              </p>
            </div>
          </ProfileCard>
        </div>

        {/* Edit-mode reminder */}
        {editing && (
          <div className="tcp-edit-notice">
            <span aria-hidden="true">✎</span>
            <div>
              <strong>You are editing your company profile.</strong>
              <p>
                Save your changes when you are finished, or cancel
                to restore the previously loaded information.
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="tcp-footer">
          <div className="tcp-footer-brand">
            <img src={logo} alt="TruCity" />
            <div>
              <strong>TRUCITY</strong>
              <span>VERIFY • CONNECT • PERSUE</span>
            </div>
          </div>

          <span className="tcp-footer-tagline">
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
    <section className="tcp-card">
      <header className="tcp-card-header">
        <div>
          <div className="tcp-card-eyebrow">{eyebrow}</div>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
        <span className="tcp-card-accent" aria-hidden="true" />
      </header>

      <div className="tcp-card-body">{children}</div>
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
    <div className={`tcp-field${fullWidth ? " tcp-field-full" : ""}`}>
      <label className="tcp-field-label">{label}</label>

      {editing ? (
        multiline ? (
          <textarea
            value={value ?? ""}
            onChange={(event) => onChange(event.target.value)}
            rows={4}
            className="tcp-input tcp-textarea"
            aria-label={label}
          />
        ) : (
          <input
            type="text"
            value={value ?? ""}
            onChange={(event) => onChange(event.target.value)}
            className="tcp-input"
            aria-label={label}
          />
        )
      ) : (
        <div
          className={`tcp-field-value${
            display === "Not provided" ? " tcp-value-empty" : ""
          }`}
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
    <div className="tcp-meta-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Watermark() {
  return (
    <div className="tcp-watermark" aria-hidden="true">
      <div className="tcp-watermark-symbol">🤝</div>
      <div className="tcp-watermark-name">TRUCITY</div>
      <div className="tcp-watermark-subtitle">
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
  if (!value) return "Not available";

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
  const normalized = String(status ?? "").toLowerCase().trim();

  if (normalized === "approved" || normalized === "verified") {
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

  if (normalized === "rejected" || normalized === "declined") {
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

function ProfileStyles() {
  return (
    <style>{`
      .tc-company-profile {
        --tcp-navy: #00273D;
        --tcp-blue: #00466D;
        --tcp-bright-blue: #1E92D2;
        --tcp-amber: #FFAD01;
        --tcp-pale-amber: #FFD784;
        --tcp-bg: #F8FCFF;
        --tcp-border: #DCE7EF;
        --tcp-muted: #718896;
        position: relative;
        isolation: isolate;
        width: 100%;
        min-height: 100%;
        padding: 28px;
        box-sizing: border-box;
        overflow: hidden;
        background: linear-gradient(135deg, #F8FCFF 0%, #FFFFFF 52%, #F4FAFD 100%);
        color: var(--tcp-navy);
        font-family: Helvetica, Arial, sans-serif;
      }

      .tc-company-profile *,
      .tc-company-profile *::before,
      .tc-company-profile *::after {
        box-sizing: border-box;
      }

      .tcp-container {
        position: relative;
        z-index: 2;
        width: 100%;
        max-width: 1450px;
        margin: 0 auto;
      }

      .tcp-watermark {
        position: absolute;
        z-index: 0;
        top: 180px;
        right: -25px;
        width: 420px;
        text-align: center;
        pointer-events: none;
        user-select: none;
        opacity: .035;
        transform: rotate(-8deg);
      }

      .tcp-watermark-symbol {
        font-size: 125px;
        line-height: 1;
      }

      .tcp-watermark-name {
        margin-top: -8px;
        font-size: 65px;
        font-weight: 900;
        letter-spacing: 8px;
      }

      .tcp-watermark-subtitle {
        margin-top: 8px;
        font-size: 10px;
        font-weight: 900;
        letter-spacing: 3px;
      }

      .tcp-decor {
        position: absolute;
        z-index: 0;
        border-radius: 50%;
        pointer-events: none;
      }

      .tcp-decor-one {
        width: 105px;
        height: 105px;
        top: -30px;
        left: 11%;
        background: linear-gradient(135deg, rgba(255,173,1,.15), rgba(255,215,132,.04));
      }

      .tcp-decor-two {
        width: 82px;
        height: 82px;
        right: 3%;
        bottom: 100px;
        border: 12px solid rgba(30,146,210,.055);
      }

      .tcp-decor-three {
        width: 42px;
        height: 42px;
        top: 43%;
        left: 1.5%;
        background: rgba(0,70,109,.045);
      }

      .tcp-decor-four {
        width: 28px;
        height: 28px;
        bottom: 8%;
        left: 10%;
        background: rgba(255,173,1,.12);
      }

      .tcp-page-heading {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 22px;
        flex-wrap: wrap;
        margin-bottom: 25px;
      }

      .tcp-heading-copy {
        min-width: 0;
      }

      .tcp-heading-brand {
        display: flex;
        align-items: center;
        gap: 16px;
      }

      .tcp-logo-wrap {
        display: flex;
        flex: 0 0 62px;
        align-items: center;
        justify-content: center;
        width: 62px;
        height: 62px;
        padding: 8px;
        background: #FFFFFF;
        border: 1px solid var(--tcp-border);
        border-radius: 15px;
        box-shadow: 0 5px 16px rgba(0,39,61,.045);
      }

      .tcp-logo-wrap img {
        display: block;
        width: 100%;
        max-height: 100%;
        object-fit: contain;
      }

      .tcp-eyebrow {
        margin-bottom: 5px;
        color: var(--tcp-bright-blue);
        font-size: 10px;
        font-weight: 900;
        letter-spacing: 1.7px;
      }

      .tcp-page-title {
        margin: 0;
        color: var(--tcp-navy);
        font-size: clamp(25px, 2.4vw, 31px);
        line-height: 1.2;
        font-weight: 800;
        letter-spacing: -.65px;
      }

      .tcp-page-description {
        max-width: 650px;
        margin: 7px 0 0;
        color: var(--tcp-muted);
        font-size: 13px;
        line-height: 1.6;
      }

      .tcp-heading-actions {
        display: flex;
        align-items: center;
        gap: 9px;
        flex-wrap: wrap;
      }

      .tcp-button {
        display: inline-flex;
        min-height: 40px;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 10px 15px;
        border: 1px solid transparent;
        border-radius: 9px;
        font-family: inherit;
        font-size: 12px;
        font-weight: 800;
        line-height: 1.2;
        cursor: pointer;
        transition: background .18s ease, border-color .18s ease, transform .18s ease;
      }

      .tcp-button:hover:not(:disabled) {
        transform: translateY(-1px);
      }

      .tcp-button:focus-visible,
      .tcp-message-dismiss:focus-visible,
      .tcp-input:focus-visible {
        outline: 3px solid rgba(30,146,210,.24);
        outline-offset: 2px;
      }

      .tcp-button:disabled {
        opacity: .6;
        cursor: not-allowed;
      }

      .tcp-button-primary {
        color: #FFFFFF;
        background: var(--tcp-blue);
        box-shadow: 0 4px 12px rgba(0,70,109,.12);
      }

      .tcp-button-primary:hover:not(:disabled) {
        background: #003653;
      }

      .tcp-button-secondary {
        color: var(--tcp-blue);
        background: #FFFFFF;
        border-color: #C9DCE5;
      }

      .tcp-button-secondary:hover:not(:disabled) {
        background: #F3F9FC;
        border-color: #A9C9D9;
      }

      .tcp-button-spinner {
        width: 13px;
        height: 13px;
        border: 2px solid rgba(255,255,255,.35);
        border-top-color: #FFFFFF;
        border-radius: 50%;
        animation: tcp-spin .8s linear infinite;
      }

      .tcp-message {
        position: relative;
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 19px;
        padding: 12px 14px;
        border: 1px solid;
        border-radius: 10px;
        font-size: 12px;
        font-weight: 700;
        line-height: 1.5;
      }

      .tcp-message-success {
        color: #087443;
        background: #F0FAF4;
        border-color: #B8E5CB;
      }

      .tcp-message-error {
        color: #B42318;
        background: #FFF5F4;
        border-color: #F1C6C2;
      }

      .tcp-message-icon {
        display: flex;
        flex: 0 0 23px;
        align-items: center;
        justify-content: center;
        width: 23px;
        height: 23px;
        border-radius: 50%;
        background: rgba(255,255,255,.75);
        font-weight: 900;
      }

      .tcp-message-dismiss {
        margin-left: auto;
        padding: 2px 6px;
        border: 0;
        background: transparent;
        color: inherit;
        font-size: 20px;
        line-height: 1;
        cursor: pointer;
      }

      .tcp-company-hero {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
        min-height: 150px;
        margin-bottom: 27px;
        padding: 25px 26px;
        overflow: hidden;
        border: 1px solid rgba(255,255,255,.08);
        border-radius: 14px;
        background: linear-gradient(110deg, #00344F 0%, #00466D 60%, #075B84 100%);
        box-shadow: 0 9px 25px rgba(0,39,61,.11);
        flex-wrap: wrap;
      }

      .tcp-hero-decoration {
        position: absolute;
        top: -100px;
        right: 18%;
        width: 260px;
        height: 260px;
        border: 1px solid rgba(255,255,255,.075);
        border-radius: 50%;
        box-shadow: 0 0 0 28px rgba(255,255,255,.018), 0 0 0 58px rgba(255,255,255,.015);
        pointer-events: none;
      }

      .tcp-hero-main {
        position: relative;
        z-index: 1;
        display: flex;
        min-width: 0;
        align-items: center;
        gap: 17px;
      }

      .tcp-company-logo {
        display: flex;
        flex: 0 0 67px;
        align-items: center;
        justify-content: center;
        width: 67px;
        height: 67px;
        padding: 9px;
        border: 3px solid rgba(255,255,255,.16);
        border-radius: 13px;
        background: #FFFFFF;
      }

      .tcp-company-logo img {
        width: 100%;
        max-height: 100%;
        object-fit: contain;
      }

      .tcp-company-heading {
        min-width: 0;
      }

      .tcp-hero-eyebrow {
        margin-bottom: 6px;
        color: var(--tcp-pale-amber);
        font-size: 9px;
        font-weight: 900;
        letter-spacing: 1.7px;
      }

      .tcp-company-heading h2 {
        margin: 0;
        color: #FFFFFF;
        font-size: clamp(19px, 2vw, 24px);
        line-height: 1.3;
        font-weight: 800;
        overflow-wrap: anywhere;
      }

      .tcp-company-heading > p {
        margin: 5px 0 0;
        color: rgba(255,255,255,.73);
        font-size: 12px;
        line-height: 1.5;
        overflow-wrap: anywhere;
      }

      .tcp-company-reference {
        display: flex;
        align-items: center;
        gap: 7px;
        margin-top: 11px;
        color: rgba(255,255,255,.76);
        font-size: 10px;
      }

      .tcp-reference-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: var(--tcp-amber);
      }

      .tcp-verification-badge {
        position: relative;
        z-index: 1;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 9px 12px;
        border: 1px solid;
        border-radius: 7px;
        font-size: 11px;
        font-weight: 900;
        white-space: nowrap;
      }

      .tcp-status-dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: currentColor;
      }

      .tcp-section-heading {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 15px;
        margin: 0 0 17px;
        flex-wrap: wrap;
      }

      .tcp-section-heading h2 {
        margin: 0;
        color: var(--tcp-navy);
        font-size: 20px;
        line-height: 1.3;
        font-weight: 800;
        letter-spacing: -.3px;
      }

      .tcp-section-heading p {
        margin: 5px 0 0;
        color: var(--tcp-muted);
        font-size: 12px;
        line-height: 1.5;
      }

      .tcp-section-indicator {
        display: inline-flex;
        align-items: center;
        min-height: 28px;
        padding: 6px 9px;
        border: 1px solid #D9E9F1;
        border-radius: 6px;
        background: #EFF7FB;
        color: var(--tcp-blue);
        font-size: 9px;
        font-weight: 900;
        letter-spacing: .8px;
      }

      .tcp-profile-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        align-items: start;
        gap: 18px;
      }

      .tcp-card {
        min-width: 0;
        overflow: hidden;
        border: 1px solid var(--tcp-border);
        border-radius: 12px;
        background: rgba(255,255,255,.97);
        box-shadow: 0 4px 15px rgba(0,39,61,.035);
      }

      .tcp-card-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 15px;
        padding: 18px 19px 15px;
        border-bottom: 1px solid #EAF0F4;
      }

      .tcp-card-eyebrow {
        margin-bottom: 5px;
        color: var(--tcp-bright-blue);
        font-size: 9px;
        font-weight: 900;
        letter-spacing: 1.2px;
      }

      .tcp-card-header h3 {
        margin: 0;
        color: var(--tcp-navy);
        font-size: 16px;
        line-height: 1.4;
        font-weight: 800;
      }

      .tcp-card-header p {
        margin: 5px 0 0;
        color: var(--tcp-muted);
        font-size: 11px;
        line-height: 1.55;
      }

      .tcp-card-accent {
        flex: 0 0 5px;
        width: 5px;
        height: 32px;
        border-radius: 5px;
        background: linear-gradient(180deg, var(--tcp-amber), var(--tcp-pale-amber));
      }

      .tcp-card-body {
        padding: 19px;
      }

      .tcp-fields-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 16px 14px;
      }

      .tcp-field {
        min-width: 0;
      }

      .tcp-field-full {
        grid-column: 1 / -1;
      }

      .tcp-field-label {
        display: block;
        margin-bottom: 7px;
        color: #627C8B;
        font-size: 9px;
        font-weight: 900;
        letter-spacing: .75px;
        line-height: 1.4;
        text-transform: uppercase;
      }

      .tcp-field-value {
        display: flex;
        min-height: 40px;
        align-items: center;
        width: 100%;
        padding: 10px 11px;
        border: 1px solid #E4EDF2;
        border-radius: 7px;
        background: #F8FAFC;
        color: #244858;
        font-size: 12px;
        line-height: 1.55;
        white-space: pre-wrap;
        overflow-wrap: anywhere;
      }

      .tcp-value-empty {
        color: #91A1AA;
        font-style: italic;
      }

      .tcp-input {
        display: block;
        width: 100%;
        min-height: 40px;
        padding: 9px 11px;
        border: 1px solid #C9DCE5;
        border-radius: 7px;
        outline: none;
        background: #FFFFFF;
        color: #173F53;
        font-family: inherit;
        font-size: 12px;
        line-height: 1.5;
        transition: border-color .18s ease, box-shadow .18s ease;
      }

      .tcp-input:focus {
        border-color: var(--tcp-bright-blue);
        box-shadow: 0 0 0 3px rgba(30,146,210,.1);
      }

      .tcp-textarea {
        min-height: 100px;
        resize: vertical;
      }

      .tcp-verification-panel {
        display: flex;
        align-items: center;
        gap: 13px;
        padding: 15px;
        border: 1px solid #E4EDF2;
        border-radius: 9px;
        background: #F8FAFC;
      }

      .tcp-large-status-icon {
        display: flex;
        flex: 0 0 42px;
        align-items: center;
        justify-content: center;
        width: 42px;
        height: 42px;
        border-radius: 10px;
        font-size: 19px;
        font-weight: 900;
      }

      .tcp-verification-copy {
        min-width: 0;
      }

      .tcp-verification-status {
        font-size: 13px;
        font-weight: 900;
      }

      .tcp-verification-copy p {
        margin: 4px 0 0;
        color: var(--tcp-muted);
        font-size: 11px;
        line-height: 1.55;
      }

      .tcp-meta-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 8px;
        margin-top: 13px;
      }

      .tcp-meta-item {
        min-width: 0;
        padding: 11px 10px;
        border: 1px solid #EAF0F4;
        border-radius: 7px;
        background: #FFFFFF;
      }

      .tcp-meta-item span {
        display: block;
        margin-bottom: 5px;
        color: #8396A1;
        font-size: 8px;
        font-weight: 900;
        letter-spacing: .65px;
        line-height: 1.4;
        text-transform: uppercase;
      }

      .tcp-meta-item strong {
        display: block;
        color: #244C5F;
        font-size: 10px;
        line-height: 1.5;
        overflow-wrap: anywhere;
      }

      .tcp-verification-note {
        display: flex;
        align-items: flex-start;
        gap: 9px;
        margin-top: 13px;
        padding: 11px;
        border: 1px solid #DCECF5;
        border-radius: 7px;
        background: #F1F8FC;
      }

      .tcp-note-mark {
        display: flex;
        flex: 0 0 18px;
        align-items: center;
        justify-content: center;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: #DCEFF9;
        color: var(--tcp-blue);
        font-size: 11px;
        font-weight: 900;
      }

      .tcp-verification-note p {
        margin: 0;
        color: #597687;
        font-size: 10px;
        line-height: 1.55;
      }

      .tcp-edit-notice {
        display: flex;
        align-items: flex-start;
        gap: 11px;
        margin-top: 18px;
        padding: 14px 16px;
        border: 1px solid #F1D69A;
        border-radius: 9px;
        background: #FFFAED;
        color: #855B05;
      }

      .tcp-edit-notice > span {
        font-size: 16px;
      }

      .tcp-edit-notice strong {
        font-size: 12px;
      }

      .tcp-edit-notice p {
        margin: 4px 0 0;
        color: #8B7547;
        font-size: 11px;
        line-height: 1.5;
      }

      .tcp-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 15px;
        flex-wrap: wrap;
        margin-top: 24px;
        padding: 17px 2px 4px;
        border-top: 1px solid #E1EBF0;
      }

      .tcp-footer-brand {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .tcp-footer-brand img {
        display: block;
        width: 52px;
        max-height: 29px;
        object-fit: contain;
      }

      .tcp-footer-brand strong,
      .tcp-footer-brand span {
        display: block;
      }

      .tcp-footer-brand strong {
        color: var(--tcp-blue);
        font-size: 10px;
        font-weight: 900;
        letter-spacing: 1.3px;
      }

      .tcp-footer-brand span {
        margin-top: 3px;
        color: #8296A1;
        font-size: 8px;
        font-weight: 800;
        letter-spacing: 1px;
      }

      .tcp-footer-tagline {
        color: #8A9CA6;
        font-size: 10px;
      }

      .tcp-state-card {
        position: relative;
        z-index: 2;
        width: min(460px, 100%);
        margin: 100px auto;
        padding: 36px 25px;
        border: 1px solid var(--tcp-border);
        border-radius: 12px;
        background: #FFFFFF;
        box-shadow: 0 8px 25px rgba(0,39,61,.06);
        text-align: center;
      }

      .tcp-state-card h2 {
        margin: 0;
        color: var(--tcp-navy);
        font-size: 19px;
        font-weight: 800;
      }

      .tcp-state-card p {
        margin: 8px 0 20px;
        color: var(--tcp-muted);
        font-size: 12px;
        line-height: 1.6;
      }

      .tcp-spinner {
        width: 34px;
        height: 34px;
        margin: 0 auto 18px;
        border: 3px solid #E3EDF3;
        border-top-color: var(--tcp-blue);
        border-radius: 50%;
        animation: tcp-spin .8s linear infinite;
      }

      .tcp-button-spinner {
        display: inline-block;
      }

      .tcp-state-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 43px;
        height: 43px;
        margin: 0 auto 15px;
        border-radius: 50%;
        background: #FFF5DF;
        color: #A66A00;
        font-size: 21px;
        font-weight: 900;
      }

      @keyframes tcp-spin {
        to { transform: rotate(360deg); }
      }

      @media (max-width: 1000px) {
        .tc-company-profile {
          padding: 22px;
        }

        .tcp-profile-grid {
          gap: 14px;
        }

        .tcp-card-header,
        .tcp-card-body {
          padding-left: 16px;
          padding-right: 16px;
        }

        .tcp-fields-grid {
          gap: 14px 11px;
        }
      }

      @media (max-width: 760px) {
        .tc-company-profile {
          padding: 17px;
        }

        .tcp-page-heading {
          align-items: flex-start;
        }

        .tcp-heading-actions {
          width: 100%;
        }

        .tcp-heading-actions .tcp-button {
          flex: 1;
        }

        .tcp-profile-grid {
          grid-template-columns: minmax(0, 1fr);
        }

        .tcp-company-hero {
          padding: 20px;
        }

        .tcp-section-heading {
          align-items: flex-start;
        }

        .tcp-watermark {
          right: -150px;
        }
      }

      @media (max-width: 480px) {
        .tc-company-profile {
          padding: 13px;
        }

        .tcp-heading-brand {
          align-items: flex-start;
          gap: 11px;
        }

        .tcp-logo-wrap {
          flex-basis: 47px;
          width: 47px;
          height: 47px;
          padding: 6px;
          border-radius: 11px;
        }

        .tcp-page-description {
          font-size: 12px;
        }

        .tcp-company-hero {
          align-items: flex-start;
          gap: 16px;
          padding: 17px;
        }

        .tcp-hero-main {
          align-items: flex-start;
          gap: 11px;
        }

        .tcp-company-logo {
          flex-basis: 48px;
          width: 48px;
          height: 48px;
          padding: 6px;
          border-radius: 9px;
        }

        .tcp-company-reference {
          align-items: flex-start;
          font-size: 9px;
        }

        .tcp-verification-badge {
          font-size: 10px;
        }

        .tcp-card-header {
          padding: 15px 14px 13px;
        }

        .tcp-card-body {
          padding: 15px 14px;
        }

        .tcp-fields-grid {
          grid-template-columns: minmax(0, 1fr);
          gap: 13px;
        }

        .tcp-field-full {
          grid-column: auto;
        }

        .tcp-meta-grid {
          grid-template-columns: minmax(0, 1fr);
        }

        .tcp-meta-item {
          padding: 10px;
        }

        .tcp-footer {
          align-items: flex-start;
          flex-direction: column;
        }

        .tcp-state-card {
          margin: 55px auto;
          padding: 28px 18px;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .tc-company-profile *,
        .tc-company-profile *::before,
        .tc-company-profile *::after {
          animation-duration: .01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: .01ms !important;
          scroll-behavior: auto !important;
        }
      }
    `}</style>
  );
}