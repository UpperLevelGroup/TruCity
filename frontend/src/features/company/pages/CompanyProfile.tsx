import React, { useEffect, useState } from 'react';
import companyService from '../company.service';
import type { CompanyProfile as CompanyProfileType } from '../company.types';

import logo from '../../../assets/branding/trucity-logo.png';

export default function CompanyProfile() {
  const [profile, setProfile] =
    useState<CompanyProfileType | null>(null);

  const [formData, setFormData] =
    useState<CompanyProfileType | null>(null);

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  /*
   * =========================================================
   * LOAD REAL COMPANY PROFILE
   * =========================================================
   */

  const loadProfile = async () => {
    try {
      setLoading(true);
      setMessage('');

      const currentProfile =
        await companyService.getProfile();

      if (!currentProfile) {
        setProfile(null);
        setFormData(null);
        setMessage(
          'No company profile was found for this account.'
        );
        return;
      }

      setProfile(currentProfile);
      setFormData(currentProfile);
    } catch (error) {
      console.error(
        'Failed to load company profile:',
        error
      );

      setProfile(null);
      setFormData(null);

      setMessage(
        'Unable to load the company profile.'
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * =========================================================
   * HANDLE FIELD CHANGE
   * =========================================================
   */

  const handleChange = (
    field: keyof CompanyProfileType,
    value: string
  ) => {
    setFormData((previous) => {
      if (!previous) {
        return previous;
      }

      return {
        ...previous,
        [field]: value,
      };
    });
  };

  /*
   * =========================================================
   * EDIT
   * =========================================================
   */

  const handleEdit = () => {
    if (!profile) {
      return;
    }

    setMessage('');
    setFormData({
      ...profile,
    });

    setEditing(true);
  };

  /*
   * =========================================================
   * CANCEL
   * =========================================================
   */

  const handleCancel = () => {
    if (profile) {
      setFormData({
        ...profile,
      });
    }

    setMessage('');
    setEditing(false);
  };

  /*
   * =========================================================
   * SAVE
   * =========================================================
   */

  const handleSave = async () => {
    if (!formData) {
      return;
    }

    try {
      setSaving(true);
      setMessage('');

      const updatedProfile: CompanyProfileType = {
        ...formData,
        updatedAt: new Date().toISOString(),
      };

      const savedProfile =
        await companyService.saveProfile(
          updatedProfile
        );

      setProfile(savedProfile);
      setFormData(savedProfile);
      setEditing(false);

      setMessage(
        'Company profile updated successfully.'
      );
    } catch (error) {
      console.error(
        'Failed to save company profile:',
        error
      );

      setMessage(
        'Unable to save the company profile. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  /*
   * =========================================================
   * LOADING
   * =========================================================
   */

  if (loading) {
    return (
      <div style={styles.loadingCard}>
        <div style={styles.loadingSpinner} />

        <p style={styles.loadingText}>
          Loading company profile...
        </p>
      </div>
    );
  }

  /*
   * =========================================================
   * NO PROFILE
   * =========================================================
   */

  if (!profile || !formData) {
    return (
      <div>
        <div style={styles.headerArea}>
          <div>
            <div style={styles.eyebrow}>
              COMPANY ACCOUNT
            </div>

            <h1 style={styles.title}>
              Company Profile
            </h1>

            <p style={styles.subtitle}>
              View and manage your organisation's information,
              contact details and verification status.
            </p>
          </div>
        </div>

        <div style={styles.emptyCard}>
          <div style={styles.emptyIcon}>
            !
          </div>

          <h2 style={styles.emptyTitle}>
            No company profile found
          </h2>

          <p style={styles.emptyText}>
            There is no company profile associated with
            the currently logged-in employer account.
          </p>

          {message && (
            <div style={styles.errorBanner}>
              {message}
            </div>
          )}

          <button
            type="button"
            style={styles.primaryButton}
            onClick={loadProfile}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  /*
   * =========================================================
   * MAIN PROFILE
   * =========================================================
   */

  return (
    <div>

      {/* Header */}

      <div style={styles.headerArea}>

        <div>
          <div style={styles.eyebrow}>
            COMPANY ACCOUNT
          </div>

          <h1 style={styles.title}>
            Company Profile
          </h1>

          <p style={styles.subtitle}>
            View and manage your organisation's information,
            contact details and verification status.
          </p>
        </div>

        <div style={styles.headerActions}>

          {!editing ? (

            <button
              type="button"
              style={styles.primaryButton}
              onClick={handleEdit}
            >
              Edit Profile
            </button>

          ) : (

            <>
              <button
                type="button"
                style={styles.cancelButton}
                onClick={handleCancel}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="button"
                style={styles.primaryButton}
                onClick={handleSave}
                disabled={saving}
              >
                {saving
                  ? 'Saving...'
                  : 'Save Changes'}
              </button>
            </>

          )}

        </div>

      </div>

      {/* Message */}

      {message && (
        <div
          style={{
            ...styles.messageBanner,

            ...(message.includes('Unable') ||
            message.includes('No company')
              ? styles.errorBanner
              : styles.successBanner),
          }}
        >
          {message}
        </div>
      )}

      {/* Profile Overview */}

      <div style={styles.profileGrid}>

        {/* Company Identity */}

        <section style={styles.card}>

          <div style={styles.cardHeader}>

            <div>

              <h2 style={styles.cardTitle}>
                Company Identity
              </h2>

              <p style={styles.cardDescription}>
                Core information about your organisation.
              </p>

            </div>

            <div
              style={getVerificationBadgeStyle(
                profile.verificationStatus
              )}
            >

              <span
                style={getVerificationDotStyle(
                  profile.verificationStatus
                )}
              />

              {formatVerificationStatus(
                profile.verificationStatus
              )}

            </div>

          </div>

          {/* Company Logo */}

          <div style={styles.logoSection}>

            <div style={styles.logoWrapper}>

              <img
                src={logo}
                alt="TruCity"
                style={styles.profileLogo}
              />

            </div>

            <div>

              <div style={styles.logoTitle}>
                {profile.tradingName ||
                  profile.legalName ||
                  'Company'}
              </div>

              <div style={styles.logoDescription}>
                Company information registered on
                the TruCity platform.
              </div>

            </div>

          </div>

          {/* Identity Fields */}

          <div style={styles.formGrid}>

            <ProfileField
              label="Legal Company Name"
              value={formData.legalName}
              editing={editing}
              onChange={(value) =>
                handleChange(
                  'legalName',
                  value
                )
              }
            />

            <ProfileField
              label="Trading Name"
              value={formData.tradingName ?? ''}
              editing={editing}
              onChange={(value) =>
                handleChange(
                  'tradingName',
                  value
                )
              }
            />

            <ProfileField
              label="Company Registration Number"
              value={formData.companyRegNo}
              editing={editing}
              onChange={(value) =>
                handleChange(
                  'companyRegNo',
                  value
                )
              }
            />

            <ProfileField
              label="Industry"
              value={formData.industry}
              editing={editing}
              onChange={(value) =>
                handleChange(
                  'industry',
                  value
                )
              }
            />

            <ProfileField
              label="Region"
              value={formData.region}
              editing={editing}
              onChange={(value) =>
                handleChange(
                  'region',
                  value
                )
              }
            />

            <ProfileField
              label="Website"
              value={formData.website}
              editing={editing}
              onChange={(value) =>
                handleChange(
                  'website',
                  value
                )
              }
            />

          </div>

          <ProfileField
            label="Registered Address"
            value={formData.registeredAddress}
            editing={editing}
            fullWidth
            onChange={(value) =>
              handleChange(
                'registeredAddress',
                value
              )
            }
          />

          <ProfileField
            label="Company Description"
            value={formData.companyDescription}
            editing={editing}
            fullWidth
            multiline
            onChange={(value) =>
              handleChange(
                'companyDescription',
                value
              )
            }
          />

        </section>

        {/* Contact Information */}

        <section style={styles.card}>

          <div style={styles.cardHeader}>

            <div>

              <h2 style={styles.cardTitle}>
                Contact Information
              </h2>

              <p style={styles.cardDescription}>
                Primary communication details for the
                organisation.
              </p>

            </div>

          </div>

          <div style={styles.formGrid}>

            <ProfileField
              label="Company Email"
              value={formData.companyEmail}
              editing={editing}
              onChange={(value) =>
                handleChange(
                  'companyEmail',
                  value
                )
              }
            />

            <ProfileField
              label="Phone Number"
              value={formData.phone}
              editing={editing}
              onChange={(value) =>
                handleChange(
                  'phone',
                  value
                )
              }
            />

          </div>

        </section>

        {/* Representative */}

        <section style={styles.card}>

          <div style={styles.cardHeader}>

            <div>

              <h2 style={styles.cardTitle}>
                Company Representative
              </h2>

              <p style={styles.cardDescription}>
                The primary representative associated with
                this organisation.
              </p>

            </div>

          </div>

          <div style={styles.formGrid}>

            <ProfileField
              label="Representative Name"
              value={
                formData.representativeName ?? ''
              }
              editing={editing}
              onChange={(value) =>
                handleChange(
                  'representativeName',
                  value
                )
              }
            />

            <ProfileField
              label="Representative Email"
              value={
                formData.representativeEmail ?? ''
              }
              editing={editing}
              onChange={(value) =>
                handleChange(
                  'representativeEmail',
                  value
                )
              }
            />

            <ProfileField
              label="Representative Phone"
              value={
                formData.representativePhone ?? ''
              }
              editing={editing}
              onChange={(value) =>
                handleChange(
                  'representativePhone',
                  value
                )
              }
            />

          </div>

        </section>

        {/* Verification */}

        <section style={styles.card}>

          <div style={styles.cardHeader}>

            <div>

              <h2 style={styles.cardTitle}>
                Verification
              </h2>

              <p style={styles.cardDescription}>
                Current verification information for this
                company account.
              </p>

            </div>

          </div>

          <div
            style={getVerificationPanelStyle(
              profile.verificationStatus
            )}
          >

            <div
              style={getVerificationIconStyle(
                profile.verificationStatus
              )}
            >
              {profile.verificationStatus ===
              'approved'
                ? '✓'
                : profile.verificationStatus ===
                  'rejected'
                  ? '!'
                  : '•'}
            </div>

            <div style={{ flex: 1 }}>

              <div
                style={getVerificationTitleStyle(
                  profile.verificationStatus
                )}
              >
                {formatVerificationStatus(
                  profile.verificationStatus
                )}
              </div>

              <p
                style={getVerificationTextStyle(
                  profile.verificationStatus
                )}
              >
                Your company profile is currently registered
                with this verification status.
              </p>

            </div>

          </div>

          {/* Account Details */}

          <div style={styles.accountDetails}>

            <div>

              <span style={styles.detailLabel}>
                Account ID
              </span>

              <span style={styles.detailValue}>
                {profile.id}
              </span>

            </div>

            <div>

              <span style={styles.detailLabel}>
                Created
              </span>

              <span style={styles.detailValue}>
                {formatDate(profile.createdAt)}
              </span>

            </div>

            <div>

              <span style={styles.detailLabel}>
                Last Updated
              </span>

              <span style={styles.detailValue}>
                {formatDate(profile.updatedAt)}
              </span>

            </div>

          </div>

        </section>

      </div>

    </div>
  );
}


/*
 * =========================================================
 * PROFILE FIELD
 * =========================================================
 */

interface ProfileFieldProps {
  label: string;
  value: string;
  editing: boolean;
  fullWidth?: boolean;
  multiline?: boolean;
  onChange: (value: string) => void;
}

function ProfileField({
  label,
  value,
  editing,
  fullWidth = false,
  multiline = false,
  onChange,
}: ProfileFieldProps) {

  return (
    <div
      style={{
        ...styles.field,

        ...(fullWidth
          ? styles.fullWidthField
          : {}),
      }}
    >

      <label style={styles.fieldLabel}>
        {label}
      </label>

      {editing ? (

        multiline ? (

          <textarea
            value={value}
            onChange={(event) =>
              onChange(
                event.target.value
              )
            }
            style={{
              ...styles.input,
              ...styles.textarea,
            }}
            rows={4}
          />

        ) : (

          <input
            value={value}
            onChange={(event) =>
              onChange(
                event.target.value
              )
            }
            style={styles.input}
          />

        )

      ) : (

        <div style={styles.fieldValue}>
          {value || 'Not provided'}
        </div>

      )}

    </div>
  );
}


/*
 * =========================================================
 * VERIFICATION HELPERS
 * =========================================================
 */

function formatVerificationStatus(
  status: CompanyProfileType['verificationStatus']
) {
  switch (status) {
    case 'approved':
      return 'Verified';

    case 'pending':
      return 'Pending Verification';

    case 'verifying':
      return 'Verification In Progress';

    case 'rejected':
      return 'Verification Rejected';

    default:
      return 'Unknown';
  }
}


function getVerificationBadgeStyle(
  status: CompanyProfileType['verificationStatus']
): React.CSSProperties {

  switch (status) {

    case 'approved':
      return {
        ...styles.statusBadge,
        backgroundColor: '#E8FFF5',
        borderColor: '#43ED9C',
        color: '#00273D',
      };

    case 'rejected':
      return {
        ...styles.statusBadge,
        backgroundColor: '#FFF0F4',
        borderColor: '#FF4672',
        color: '#B51F49',
      };

    case 'pending':
    case 'verifying':
    default:
      return {
        ...styles.statusBadge,
        backgroundColor: '#FFF8DD',
        borderColor: '#FADB4B',
        color: '#00273D',
      };
  }
}


function getVerificationDotStyle(
  status: CompanyProfileType['verificationStatus']
): React.CSSProperties {

  switch (status) {

    case 'approved':
      return {
        ...styles.statusDot,
        backgroundColor: '#43ED9C',
      };

    case 'rejected':
      return {
        ...styles.statusDot,
        backgroundColor: '#FF4672',
      };

    case 'pending':
    case 'verifying':
    default:
      return {
        ...styles.statusDot,
        backgroundColor: '#FADB4B',
      };
  }
}


function getVerificationPanelStyle(
  status: CompanyProfileType['verificationStatus']
): React.CSSProperties {

  switch (status) {

    case 'approved':
      return {
        ...styles.verificationPanel,
        backgroundColor: '#E8FFF5',
        borderColor: '#43ED9C',
      };

    case 'rejected':
      return {
        ...styles.verificationPanel,
        backgroundColor: '#FFF0F4',
        borderColor: '#FF4672',
      };

    case 'pending':
    case 'verifying':
    default:
      return {
        ...styles.verificationPanel,
        backgroundColor: '#FFF8DD',
        borderColor: '#FADB4B',
      };
  }
}


function getVerificationIconStyle(
  status: CompanyProfileType['verificationStatus']
): React.CSSProperties {

  switch (status) {

    case 'approved':
      return {
        ...styles.verificationIcon,
        backgroundColor: '#43ED9C',
        color: '#00273D',
      };

    case 'rejected':
      return {
        ...styles.verificationIcon,
        backgroundColor: '#FF4672',
        color: '#FFFFFF',
      };

    case 'pending':
    case 'verifying':
    default:
      return {
        ...styles.verificationIcon,
        backgroundColor: '#FADB4B',
        color: '#00273D',
      };
  }
}


function getVerificationTitleStyle(
  status: CompanyProfileType['verificationStatus']
): React.CSSProperties {

  switch (status) {

    case 'approved':
      return {
        ...styles.verificationTitle,
        color: '#00273D',
      };

    case 'rejected':
      return {
        ...styles.verificationTitle,
        color: '#B51F49',
      };

    case 'pending':
    case 'verifying':
    default:
      return {
        ...styles.verificationTitle,
        color: '#00273D',
      };
  }
}


function getVerificationTextStyle(
  status: CompanyProfileType['verificationStatus']
): React.CSSProperties {

  switch (status) {

    case 'approved':
      return {
        ...styles.verificationText,
        color: '#00466D',
      };

    case 'rejected':
      return {
        ...styles.verificationText,
        color: '#B51F49',
      };

    case 'pending':
    case 'verifying':
    default:
      return {
        ...styles.verificationText,
        color: '#00466D',
      };
  }
}


/*
 * =========================================================
 * DATE
 * =========================================================
 */

function formatDate(value?: string) {

  if (!value) {
    return 'Not available';
  }

  const date =
    new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(
    'en-ZA',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }
  );
}


/*
 * =========================================================
 * STYLES
 * =========================================================
 *
 * TruCity September 2026 Brand Palette
 *
 * Primary Dark Teal-Blue: #00466D
 * Primary Golden Orange: #FFAD01
 * TruCity Blue:          #1E92D2
 * TruCity Orange:        #FFD784
 * Dark Blue:             #00273D
 * Background:            #F8FCFF
 * White:                 #FFFFFF
 *
 * Status:
 * Green:                 #43ED9C
 * Red:                   #FF4672
 * Yellow:                #FADB4B
 *
 * =========================================================
 */

const styles: {
  [key: string]: React.CSSProperties;
} = {

  headerArea: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '28px',
    gap: '20px',
  },

  eyebrow: {
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '0.12em',
    color: '#FFAD01',
    marginBottom: '7px',
  },

  title: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#00273D',
    margin: 0,
    marginBottom: '6px',
    letterSpacing: '-0.02em',
  },

  subtitle: {
    fontSize: '14px',
    color: '#64748B',
    fontWeight: '400',
    margin: 0,
    maxWidth: '700px',
    lineHeight: 1.6,
  },

  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },

  primaryButton: {
    padding: '10px 20px',
    backgroundColor: '#00466D',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '10px',
    fontWeight: '700',
    fontSize: '13px',
    cursor: 'pointer',
    boxShadow:
      '0 4px 8px rgba(0, 70, 109, 0.16)',
    fontFamily: 'Helvetica, Arial, sans-serif',
  },

  cancelButton: {
    padding: '10px 18px',
    backgroundColor: '#FFFFFF',
    color: '#00466D',
    border: '1px solid #D4D2E6',
    borderRadius: '10px',
    fontWeight: '700',
    fontSize: '13px',
    cursor: 'pointer',
    fontFamily: 'Helvetica, Arial, sans-serif',
  },

  messageBanner: {
    padding: '12px 16px',
    borderRadius: '10px',
    marginBottom: '20px',
    fontSize: '13px',
    fontWeight: '600',
  },

  successBanner: {
    backgroundColor: '#E8FFF5',
    border: '1px solid #43ED9C',
    color: '#00273D',
  },

  errorBanner: {
    backgroundColor: '#FFF0F4',
    border: '1px solid #FF4672',
    color: '#B51F49',
  },

  profileGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(2, minmax(0, 1fr))',
    gap: '20px',
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    padding: '26px',
    border: '1px solid #E9E8F3',
    boxShadow:
      '0 8px 20px rgba(0, 39, 61, 0.05)',
  },

  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '16px',
    marginBottom: '24px',
  },

  cardTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#00466D',
    margin: 0,
    marginBottom: '5px',
  },

  cardDescription: {
    fontSize: '12px',
    color: '#64748B',
    margin: 0,
    lineHeight: 1.5,
  },

  statusBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '7px',
    padding: '6px 10px',
    borderRadius: '8px',
    fontSize: '10px',
    fontWeight: '700',
    whiteSpace: 'nowrap',
    border: '1px solid',
  },

  statusDot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    flexShrink: 0,
  },

  logoSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px',
    marginBottom: '22px',
    backgroundColor: '#F8FCFF',
    border: '1px solid #E9E8F3',
    borderRadius: '12px',
  },

  logoWrapper: {
    width: '72px',
    height: '72px',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    border: '1px solid #D4D2E6',
    overflow: 'hidden',
    flexShrink: 0,
  },

  profileLogo: {
    width: '58px',
    height: '58px',
    objectFit: 'contain',
  },

  logoTitle: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#00273D',
    marginBottom: '4px',
  },

  logoDescription: {
    fontSize: '12px',
    color: '#64748B',
    lineHeight: 1.5,
  },

  formGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(2, minmax(0, 1fr))',
    gap: '18px',
  },

  field: {
    minWidth: 0,
    marginBottom: '18px',
  },

  fullWidthField: {
    gridColumn: '1 / -1',
  },

  fieldLabel: {
    display: 'block',
    fontSize: '11px',
    fontWeight: '700',
    color: '#00466D',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    marginBottom: '7px',
  },

  fieldValue: {
    minHeight: '20px',
    fontSize: '13px',
    fontWeight: '500',
    color: '#00273D',
    lineHeight: 1.5,
    wordBreak: 'break-word',
  },

  input: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '10px 12px',
    borderRadius: '9px',
    border: '1px solid #D4D2E6',
    backgroundColor: '#FFFFFF',
    color: '#00273D',
    fontSize: '13px',
    fontWeight: '500',
    outline: 'none',
    fontFamily: 'Helvetica, Arial, sans-serif',
  },

  textarea: {
    resize: 'vertical',
    lineHeight: 1.5,
    fontFamily: 'Helvetica, Arial, sans-serif',
  },

  verificationPanel: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '16px',
    borderRadius: '12px',
    marginBottom: '20px',
    border: '1px solid',
  },

  verificationIcon: {
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    fontWeight: '700',
    flexShrink: 0,
  },

  verificationTitle: {
    fontSize: '14px',
    fontWeight: '700',
    marginBottom: '3px',
  },

  verificationText: {
    fontSize: '12px',
    margin: 0,
    lineHeight: 1.5,
  },

  accountDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },

  detailLabel: {
    display: 'block',
    fontSize: '10px',
    color: '#64748B',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '3px',
  },

  detailValue: {
    display: 'block',
    fontSize: '12px',
    color: '#00273D',
    fontWeight: '600',
    wordBreak: 'break-word',
  },

  emptyCard: {
    minHeight: '320px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    padding: '40px',
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    border: '1px solid #E9E8F3',
    boxShadow:
      '0 8px 20px rgba(0, 39, 61, 0.05)',
  },

  emptyIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF8DD',
    color: '#00273D',
    border: '1px solid #FADB4B',
    fontSize: '20px',
    fontWeight: '700',
    marginBottom: '16px',
  },

  emptyTitle: {
    margin: 0,
    marginBottom: '8px',
    fontSize: '20px',
    fontWeight: '700',
    color: '#00466D',
  },

  emptyText: {
    maxWidth: '520px',
    margin: 0,
    marginBottom: '20px',
    fontSize: '13px',
    lineHeight: 1.6,
    color: '#64748B',
  },

  loadingCard: {
    minHeight: '300px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    border: '1px solid #E9E8F3',
  },

  loadingSpinner: {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    border: '3px solid #E9E8F3',
    borderTop: '3px solid #00466D',
    marginBottom: '14px',
  },

  loadingText: {
    fontSize: '13px',
    color: '#64748B',
    fontWeight: '600',
  },
};