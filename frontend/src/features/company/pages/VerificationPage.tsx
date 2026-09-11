import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface FormDataState {
  legalName: string;
  tradingName: string;
  region: string;
  companyRegNo: string;
  website: string;
  industry: string;
  registeredAddress: string;
  companyEmail: string;
  phone: string;
  companySize: string;
  companyDescription: string;
  repFullName: string;
  repTitle: string;
  repEmail: string;
  repPhone: string;
  idType: string;
  idNumber: string;
  verificationStatus: 'pending' | 'verifying' | 'approved' | 'failed';
  billingContactName: string;
  billingContactEmail: string;
  invoicingAddress: string;
  taxVatNumber: string;
  paymentMethod: string;
  agreeToTerms: boolean;
}

const STORAGE_KEY = 'trucity_company_verification';
const ONBOARDING_KEY = 'trucity_company_onboarding';

const DEFAULT_FORM_DATA: FormDataState = {
  legalName: '',
  tradingName: '',
  region: '',
  companyRegNo: '',
  website: '',
  industry: '',
  registeredAddress: '',
  companyEmail: '',
  phone: '',
  companySize: '',
  companyDescription: '',
  repFullName: '',
  repTitle: '',
  repEmail: '',
  repPhone: '',
  idType: 'ID',
  idNumber: '',
  verificationStatus: 'pending',
  billingContactName: '',
  billingContactEmail: '',
  invoicingAddress: '',
  taxVatNumber: '',
  paymentMethod: 'card',
  agreeToTerms: false,
};

export default function VerificationPage() {
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState(false);

  const [formData, setFormData] =
    useState<FormDataState>(DEFAULT_FORM_DATA);

  /*
   * Restore previously saved verification/onboarding data.
   *
   * We deliberately use localStorage here rather than calling an unknown
   * backend verification endpoint. This keeps the company flow functional
   * while the backend/CIPC integration is being stabilised.
   */
  useEffect(() => {
    try {
      const savedVerification = localStorage.getItem(STORAGE_KEY);
      const savedOnboarding = localStorage.getItem(ONBOARDING_KEY);

      let restoredData: Partial<FormDataState> = {};

      if (savedOnboarding) {
        try {
          restoredData = JSON.parse(savedOnboarding);
        } catch {
          restoredData = {};
        }
      }

      if (savedVerification) {
        try {
          restoredData = {
            ...restoredData,
            ...JSON.parse(savedVerification),
          };
        } catch {
          // Ignore invalid local storage data.
        }
      }

      setFormData({
        ...DEFAULT_FORM_DATA,
        ...restoredData,
      });
    } catch {
      setFormData(DEFAULT_FORM_DATA);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  /*
   * Persist the current form whenever it changes.
   */
  useEffect(() => {
    if (!isLoaded) return;

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(formData)
      );
    } catch {
      // Ignore localStorage errors.
    }
  }, [formData, isLoaded]);

  const updateField = <K extends keyof FormDataState>(
    field: K,
    value: FormDataState[K]
  ) => {
    setErrorMsg('');

    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validateStep = (): boolean => {
    setErrorMsg('');

    if (currentStep === 1) {
      if (
        !formData.legalName.trim() ||
        !formData.region.trim() ||
        !formData.companyRegNo.trim() ||
        !formData.website.trim() ||
        !formData.industry.trim() ||
        !formData.registeredAddress.trim()
      ) {
        setErrorMsg(
          'Please complete all required fields marked with *.'
        );
        return false;
      }

      /*
       * South African CIPC registration format:
       * YYYY/NNNNNN/NN
       */
      const cipcPattern = /^\d{4}\/\d{6}\/\d{2}$/;

      if (!cipcPattern.test(formData.companyRegNo.trim())) {
        setErrorMsg(
          'Please enter a valid CIPC registration number in the format YYYY/NNNNNN/NN.'
        );
        return false;
      }

      try {
        new URL(formData.website.trim());
      } catch {
        setErrorMsg(
          'Please enter a valid company website URL, for example https://trucity.co.za.'
        );
        return false;
      }
    }

    if (currentStep === 2) {
      if (
        !formData.companyEmail.trim() ||
        !formData.phone.trim() ||
        !formData.companyDescription.trim()
      ) {
        setErrorMsg(
          'Please complete all required company contact details.'
        );
        return false;
      }

      if (!validateEmail(formData.companyEmail.trim())) {
        setErrorMsg(
          'Please enter a valid company email address.'
        );
        return false;
      }
    }

    if (currentStep === 3) {
      /*
       * Representative information remains optional so that the
       * existing "Skip for now" behaviour is preserved.
       */
      if (
        formData.repEmail.trim() &&
        !validateEmail(formData.repEmail.trim())
      ) {
        setErrorMsg(
          'Please enter a valid representative email address.'
        );
        return false;
      }
    }

    if (currentStep === 4) {
      if (formData.verificationStatus !== 'approved') {
        setErrorMsg(
          'Please execute and complete the verification check before proceeding.'
        );
        return false;
      }
    }

    if (currentStep === 5) {
      if (
        !formData.billingContactName.trim() ||
        !formData.billingContactEmail.trim() ||
        !formData.invoicingAddress.trim() ||
        !formData.agreeToTerms
      ) {
        setErrorMsg(
          'Please complete billing details and accept the terms of service.'
        );
        return false;
      }

      if (
        !validateEmail(formData.billingContactEmail.trim())
      ) {
        setErrorMsg(
          'Please enter a valid billing contact email address.'
        );
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    if (!validateStep()) return;

    if (currentStep < 5) {
      setCurrentStep((prev) => prev + 1);
      setErrorMsg('');
      return;
    }

    /*
     * Final submission is currently local/demo only.
     * This avoids inventing a backend company-verification endpoint.
     */
    const completedData: FormDataState = {
      ...formData,
      legalName: formData.legalName.trim(),
      tradingName: formData.tradingName.trim(),
      region: formData.region.trim(),
      companyRegNo: formData.companyRegNo.trim(),
      website: formData.website.trim(),
      industry: formData.industry.trim(),
      registeredAddress: formData.registeredAddress.trim(),
      companyEmail: formData.companyEmail.trim(),
      phone: formData.phone.trim(),
      companyDescription: formData.companyDescription.trim(),
      repFullName: formData.repFullName.trim(),
      repTitle: formData.repTitle.trim(),
      repEmail: formData.repEmail.trim(),
      repPhone: formData.repPhone.trim(),
      idNumber: formData.idNumber.trim(),
      billingContactName: formData.billingContactName.trim(),
      billingContactEmail:
        formData.billingContactEmail.trim(),
      invoicingAddress: formData.invoicingAddress.trim(),
      taxVatNumber: formData.taxVatNumber.trim(),
    };

    try {
      localStorage.setItem(
        'trucity_company_verification_completed',
        JSON.stringify({
          ...completedData,
          completedAt: new Date().toISOString(),
        })
      );

      localStorage.setItem(
        'trucity_company_profile',
        JSON.stringify({
          legalName: completedData.legalName,
          tradingName: completedData.tradingName,
          region: completedData.region,
          companyRegNo: completedData.companyRegNo,
          website: completedData.website,
          industry: completedData.industry,
          companyEmail: completedData.companyEmail,
          phone: completedData.phone,
          companySize: completedData.companySize,
          companyDescription:
            completedData.companyDescription,
          verificationStatus:
            completedData.verificationStatus,
        })
      );

      localStorage.removeItem(ONBOARDING_KEY);
      localStorage.removeItem(STORAGE_KEY);

      navigate('/dashboard', {
        state: {
          companyVerificationCompleted: true,
          formData: completedData,
        },
      });
    } catch {
      setErrorMsg(
        'Unable to save your verification details. Please try again.'
      );
    }
  };

  const handleSkipStep3 = () => {
    setErrorMsg('');

    setFormData((prev) => ({
      ...prev,
      repFullName: prev.repFullName.trim(),
      repTitle: prev.repTitle.trim(),
      repEmail: prev.repEmail.trim(),
      repPhone: prev.repPhone.trim(),
    }));

    setCurrentStep((prev) => prev + 1);
  };

  const runAutoVerification = () => {
    setErrorMsg('');

    /*
     * Frontend simulation only.
     *
     * When the actual backend/CIPC verification contract is available,
     * this function can be replaced by a companyService verification call.
     */
    setFormData((prev) => ({
      ...prev,
      verificationStatus: 'verifying',
    }));

    window.setTimeout(() => {
      setFormData((prev) => ({
        ...prev,
        verificationStatus: 'approved',
      }));
    }, 1200);
  };

  const handleBack = () => {
    if (currentStep === 1) return;

    setErrorMsg('');

    setCurrentStep((prev) => prev - 1);
  };

  if (!isLoaded) {
    return (
      <div style={vStyles.pageContainer}>
        <div style={vStyles.bgLogoWatermark} />

        <header style={vStyles.header}>
          <Link to="/" style={vStyles.logoContainer}>
            <img
              src="/logo.png"
              alt="TruCity Logo"
              style={{
                height: '36px',
                width: 'auto',
                objectFit: 'contain',
              }}
            />

            <span style={vStyles.logoText}>
              <span style={{ color: '#ffb703' }}>
                Tru
              </span>
              <span style={{ color: '#0284c7' }}>
                City
              </span>
            </span>
          </Link>
        </header>

        <main style={vStyles.main}>
          <div style={vStyles.card}>
            <div style={vStyles.loadingState}>
              Loading verification...
            </div>
          </div>
        </main>
      </div>
    );
  }

  const verificationIsRunning =
    formData.verificationStatus === 'verifying';

  const verificationApproved =
    formData.verificationStatus === 'approved';

  return (
    <div style={vStyles.pageContainer}>
      {/* Background Logo Watermark */}
      <div style={vStyles.bgLogoWatermark} />

      {/* Background Glowing Bubbles */}
      <div style={vStyles.bubbleBlueTop} />
      <div style={vStyles.bubbleOrangeCenter} />
      <div style={vStyles.bubbleBlueCenterRight} />
      <div style={vStyles.bubbleOrangeBottom} />

      {/* Decorative Rings */}
      <div style={vStyles.dottedRingTopRight} />
      <div style={vStyles.dottedRingBottomRight} />

      <header style={vStyles.header}>
        <Link to="/" style={vStyles.logoContainer}>
          <img
            src="/logo.png"
            alt="TruCity Logo"
            style={{
              height: '36px',
              width: 'auto',
              objectFit: 'contain',
            }}
          />

          <span style={vStyles.logoText}>
            <span style={{ color: '#ffb703' }}>
              Tru
            </span>
            <span style={{ color: '#0284c7' }}>
              City
            </span>
          </span>
        </Link>
      </header>

      <main style={vStyles.main}>
        <div style={vStyles.card}>
          {/* Progress */}
          <div style={{ marginBottom: '24px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '13px',
                fontWeight: 'bold',
                color: '#0284c7',
              }}
            >
              <span>
                STEP {currentStep} OF 5
              </span>

              <span>
                {currentStep * 20}% COMPLETED
              </span>
            </div>

            <div style={vStyles.progressBg}>
              <div
                style={{
                  ...vStyles.progressBar,
                  width: `${currentStep * 20}%`,
                }}
              />
            </div>
          </div>

          {errorMsg && (
            <div
              style={vStyles.errorBox}
              role="alert"
              aria-live="polite"
            >
              {errorMsg}
            </div>
          )}

          {/* STEP 1 */}
          {currentStep === 1 && (
            <div>
              <h2 style={vStyles.title}>
                Step 1: Company Identity
              </h2>

              <p style={vStyles.subtitle}>
                Enter official business and registry records.
              </p>

              <div style={vStyles.formGrid}>
                <div>
                  <label style={vStyles.label}>
                    Legal Name *
                  </label>

                  <input
                    type="text"
                    placeholder="e.g. TruCity Technologies (Pty) Ltd"
                    value={formData.legalName}
                    onChange={(e) =>
                      updateField(
                        'legalName',
                        e.target.value
                      )
                    }
                    style={vStyles.input}
                    autoComplete="organization"
                  />
                </div>

                <div>
                  <label style={vStyles.label}>
                    Trading Name (optional)
                  </label>

                  <input
                    type="text"
                    placeholder="e.g. TruCity Digital"
                    value={formData.tradingName}
                    onChange={(e) =>
                      updateField(
                        'tradingName',
                        e.target.value
                      )
                    }
                    style={vStyles.input}
                  />
                </div>

                <div>
                  <label style={vStyles.label}>
                    Region *
                  </label>

                  <input
                    type="text"
                    placeholder="e.g. Gauteng, South Africa"
                    value={formData.region}
                    onChange={(e) =>
                      updateField(
                        'region',
                        e.target.value
                      )
                    }
                    style={vStyles.input}
                  />
                </div>

                <div>
                  <label style={vStyles.label}>
                    Company CIPC *
                  </label>

                  <input
                    type="text"
                    placeholder="e.g. 2026/123456/07"
                    value={formData.companyRegNo}
                    onChange={(e) =>
                      updateField(
                        'companyRegNo',
                        e.target.value
                      )
                    }
                    style={vStyles.input}
                    maxLength={13}
                  />

                  <small style={vStyles.fieldHint}>
                    Format: YYYY/NNNNNN/NN
                  </small>
                </div>

                <div>
                  <label style={vStyles.label}>
                    Website *
                  </label>

                  <input
                    type="url"
                    placeholder="https://trucity.co.za"
                    value={formData.website}
                    onChange={(e) =>
                      updateField(
                        'website',
                        e.target.value
                      )
                    }
                    style={vStyles.input}
                    autoComplete="url"
                  />
                </div>

                <div>
                  <label style={vStyles.label}>
                    Industry *
                  </label>

                  <input
                    type="text"
                    placeholder="e.g. Software & FinTech"
                    value={formData.industry}
                    onChange={(e) =>
                      updateField(
                        'industry',
                        e.target.value
                      )
                    }
                    style={vStyles.input}
                  />
                </div>
              </div>

              <div style={{ marginTop: '16px' }}>
                <label style={vStyles.label}>
                  Registered Address *
                </label>

                <textarea
                  rows={2}
                  placeholder="e.g. 123 Rivonia Road, Sandton, Johannesburg, 2196"
                  value={formData.registeredAddress}
                  onChange={(e) =>
                    updateField(
                      'registeredAddress',
                      e.target.value
                    )
                  }
                  style={{
                    ...vStyles.input,
                    resize: 'vertical',
                  }}
                />
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {currentStep === 2 && (
            <div>
              <h2 style={vStyles.title}>
                Step 2: Company Contacts
              </h2>

              <p style={vStyles.subtitle}>
                Specify public company profile details and
                contact points.
              </p>

              <div style={vStyles.formGrid}>
                <div>
                  <label style={vStyles.label}>
                    Company Email *
                  </label>

                  <input
                    type="email"
                    placeholder="e.g. support@trucity.co.za"
                    value={formData.companyEmail}
                    onChange={(e) =>
                      updateField(
                        'companyEmail',
                        e.target.value
                      )
                    }
                    style={vStyles.input}
                    autoComplete="email"
                  />
                </div>

                <div>
                  <label style={vStyles.label}>
                    Phone *
                  </label>

                  <input
                    type="tel"
                    placeholder="e.g. +27 11 555 0192"
                    value={formData.phone}
                    onChange={(e) =>
                      updateField(
                        'phone',
                        e.target.value
                      )
                    }
                    style={vStyles.input}
                    autoComplete="tel"
                  />
                </div>

                <div>
                  <label style={vStyles.label}>
                    Company Size (optional)
                  </label>

                  <select
                    value={formData.companySize}
                    onChange={(e) =>
                      updateField(
                        'companySize',
                        e.target.value
                      )
                    }
                    style={vStyles.input}
                  >
                    <option value="">
                      Select size
                    </option>
                    <option value="1-10">
                      1-10 employees
                    </option>
                    <option value="11-50">
                      11-50 employees
                    </option>
                    <option value="51-200">
                      51-200 employees
                    </option>
                    <option value="201-500">
                      201-500 employees
                    </option>
                    <option value="501+">
                      501+ employees
                    </option>
                  </select>
                </div>

                <div>
                  <label style={vStyles.label}>
                    Upload Logo (optional)
                  </label>

                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    style={vStyles.fileInput}
                  />
                </div>
              </div>

              <div style={{ marginTop: '16px' }}>
                <label style={vStyles.label}>
                  Company Description *
                </label>

                <textarea
                  rows={3}
                  placeholder="e.g. Building next-generation digital verification and governance tools for modern enterprises..."
                  value={formData.companyDescription}
                  onChange={(e) =>
                    updateField(
                      'companyDescription',
                      e.target.value
                    )
                  }
                  style={{
                    ...vStyles.input,
                    resize: 'vertical',
                  }}
                />
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {currentStep === 3 && (
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '16px',
                }}
              >
                <h2 style={vStyles.title}>
                  Step 3: Representative Info
                </h2>

                <button
                  type="button"
                  onClick={handleSkipStep3}
                  style={vStyles.btnSkip}
                >
                  Skip for now
                </button>
              </div>

              <p style={vStyles.subtitle}>
                Provide details for the authorized
                representative.
              </p>

              <div style={vStyles.formGrid}>
                <div>
                  <label style={vStyles.label}>
                    Rep Full Name
                  </label>

                  <input
                    type="text"
                    placeholder="e.g. Jane Doe"
                    value={formData.repFullName}
                    onChange={(e) =>
                      updateField(
                        'repFullName',
                        e.target.value
                      )
                    }
                    style={vStyles.input}
                    autoComplete="name"
                  />
                </div>

                <div>
                  <label style={vStyles.label}>
                    Rep Title
                  </label>

                  <input
                    type="text"
                    placeholder="e.g. Chief Executive Officer"
                    value={formData.repTitle}
                    onChange={(e) =>
                      updateField(
                        'repTitle',
                        e.target.value
                      )
                    }
                    style={vStyles.input}
                  />
                </div>

                <div>
                  <label style={vStyles.label}>
                    Rep Email
                  </label>

                  <input
                    type="email"
                    placeholder="e.g. jane.doe@trucity.co.za"
                    value={formData.repEmail}
                    onChange={(e) =>
                      updateField(
                        'repEmail',
                        e.target.value
                      )
                    }
                    style={vStyles.input}
                    autoComplete="email"
                  />
                </div>

                <div>
                  <label style={vStyles.label}>
                    Rep Phone
                  </label>

                  <input
                    type="tel"
                    placeholder="e.g. +27 82 555 0192"
                    value={formData.repPhone}
                    onChange={(e) =>
                      updateField(
                        'repPhone',
                        e.target.value
                      )
                    }
                    style={vStyles.input}
                    autoComplete="tel"
                  />
                </div>

                <div>
                  <label style={vStyles.label}>
                    ID Type
                  </label>

                  <select
                    value={formData.idType}
                    onChange={(e) =>
                      updateField(
                        'idType',
                        e.target.value
                      )
                    }
                    style={vStyles.input}
                  >
                    <option value="ID">
                      National ID
                    </option>

                    <option value="Passport">
                      Passport
                    </option>
                  </select>
                </div>

                <div>
                  <label style={vStyles.label}>
                    ID Number
                  </label>

                  <input
                    type="text"
                    placeholder="Enter ID or passport number"
                    value={formData.idNumber}
                    onChange={(e) =>
                      updateField(
                        'idNumber',
                        e.target.value
                      )
                    }
                    style={vStyles.input}
                    autoComplete="off"
                  />
                </div>
              </div>

              <div style={vStyles.optionalNotice}>
                Representative information can be completed
                later if you do not have the details available
                right now.
              </div>
            </div>
          )}

          {/* STEP 4 */}
          {currentStep === 4 && (
            <div>
              <h2 style={vStyles.title}>
                Step 4: Verification
              </h2>

              <p style={vStyles.subtitle}>
                Automatic registry validation & identity
                checks.
              </p>

              <div style={vStyles.verificationCard}>
                {formData.verificationStatus ===
                  'pending' && (
                  <div>
                    <div
                      style={vStyles.verificationIcon}
                    >
                      ✓
                    </div>

                    <h3
                      style={
                        vStyles.verificationHeading
                      }
                    >
                      Ready for verification
                    </h3>

                    <p
                      style={
                        vStyles.verificationDescription
                      }
                    >
                      Click below to run registry checks
                      against the company information
                      provided.
                    </p>

                    <button
                      type="button"
                      onClick={runAutoVerification}
                      style={vStyles.btnPrimary}
                    >
                      Run Verification Check
                    </button>

                    <p style={vStyles.simulationNote}>
                      Verification is currently running
                      in demonstration mode.
                    </p>
                  </div>
                )}

                {verificationIsRunning && (
                  <div>
                    <div
                      style={{
                        ...vStyles.verificationIcon,
                        color: '#0284c7',
                        borderColor: '#bae6fd',
                        backgroundColor: '#f0f9ff',
                      }}
                    >
                      ...
                    </div>

                    <h3
                      style={
                        vStyles.verificationHeading
                      }
                    >
                      Checking registry records...
                    </h3>

                    <p
                      style={
                        vStyles.verificationDescription
                      }
                    >
                      TruCity is validating the supplied
                      company information.
                    </p>

                    <div
                      style={vStyles.checkingBar}
                    >
                      <div
                        style={vStyles.checkingBarFill}
                      />
                    </div>
                  </div>
                )}

                {verificationApproved && (
                  <div>
                    <div
                      style={{
                        ...vStyles.verificationIcon,
                        color: '#16a34a',
                        borderColor: '#bbf7d0',
                        backgroundColor: '#f0fdf4',
                      }}
                    >
                      ✓
                    </div>

                    <h3
                      style={{
                        ...vStyles.verificationHeading,
                        color: '#15803d',
                      }}
                    >
                      Verification Successful
                    </h3>

                    <p
                      style={
                        vStyles.verificationDescription
                      }
                    >
                      The company information passed the
                      current verification check. You are
                      clear to proceed.
                    </p>

                    <div
                      style={
                        vStyles.verifiedBadge
                      }
                    >
                      ✓ COMPANY VERIFIED
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 5 */}
          {currentStep === 5 && (
            <div>
              <h2 style={vStyles.title}>
                Step 5: Billing & Terms
              </h2>

              <p style={vStyles.subtitle}>
                Configure billing preferences and accept
                terms.
              </p>

              <div style={vStyles.formGrid}>
                <div>
                  <label style={vStyles.label}>
                    Billing Contact Name *
                  </label>

                  <input
                    type="text"
                    placeholder="e.g. John Smith"
                    value={formData.billingContactName}
                    onChange={(e) =>
                      updateField(
                        'billingContactName',
                        e.target.value
                      )
                    }
                    style={vStyles.input}
                    autoComplete="name"
                  />
                </div>

                <div>
                  <label style={vStyles.label}>
                    Billing Contact Email *
                  </label>

                  <input
                    type="email"
                    placeholder="e.g. billing@trucity.co.za"
                    value={
                      formData.billingContactEmail
                    }
                    onChange={(e) =>
                      updateField(
                        'billingContactEmail',
                        e.target.value
                      )
                    }
                    style={vStyles.input}
                    autoComplete="email"
                  />
                </div>
              </div>

              <div style={{ marginTop: '16px' }}>
                <label style={vStyles.label}>
                  Invoicing Address *
                </label>

                <textarea
                  rows={2}
                  placeholder="e.g. Suite 402, Financial District, Johannesburg, 2001"
                  value={formData.invoicingAddress}
                  onChange={(e) =>
                    updateField(
                      'invoicingAddress',
                      e.target.value
                    )
                  }
                  style={{
                    ...vStyles.input,
                    resize: 'vertical',
                  }}
                />
              </div>

              <div style={{ marginTop: '16px' }}>
                <label style={vStyles.label}>
                  VAT / Tax Number
                </label>

                <input
                  type="text"
                  placeholder="Optional VAT or tax registration number"
                  value={formData.taxVatNumber}
                  onChange={(e) =>
                    updateField(
                      'taxVatNumber',
                      e.target.value
                    )
                  }
                  style={vStyles.input}
                />
              </div>

              <div style={{ marginTop: '16px' }}>
                <label style={vStyles.label}>
                  Payment Method
                </label>

                <select
                  value={formData.paymentMethod}
                  onChange={(e) =>
                    updateField(
                      'paymentMethod',
                      e.target.value
                    )
                  }
                  style={vStyles.input}
                >
                  <option value="card">
                    Card
                  </option>

                  <option value="invoice">
                    Invoice
                  </option>
                </select>
              </div>

              <div
                style={{
                  marginTop: '20px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                }}
              >
                <input
                  type="checkbox"
                  id="terms"
                  checked={formData.agreeToTerms}
                  onChange={(e) =>
                    updateField(
                      'agreeToTerms',
                      e.target.checked
                    )
                  }
                  style={{
                    width: '18px',
                    height: '18px',
                    marginTop: '1px',
                    accentColor: '#0284c7',
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                />

                <label
                  htmlFor="terms"
                  style={{
                    fontSize: '14px',
                    color: '#334155',
                    cursor: 'pointer',
                    lineHeight: '1.5',
                  }}
                >
                  I agree to the Terms of Service and
                  Privacy Policy *
                </label>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div style={vStyles.navRow}>
            <button
              type="button"
              disabled={
                currentStep === 1 ||
                verificationIsRunning
              }
              onClick={handleBack}
              style={{
                ...vStyles.btnSecondary,
                opacity:
                  currentStep === 1 ||
                  verificationIsRunning
                    ? 0.4
                    : 1,
                cursor:
                  currentStep === 1 ||
                  verificationIsRunning
                    ? 'not-allowed'
                    : 'pointer',
              }}
            >
              Back
            </button>

            <button
              type="button"
              onClick={handleNext}
              disabled={verificationIsRunning}
              style={{
                ...vStyles.btnPrimary,
                opacity: verificationIsRunning
                  ? 0.6
                  : 1,
                cursor: verificationIsRunning
                  ? 'not-allowed'
                  : 'pointer',
              }}
            >
              {currentStep === 5
                ? 'Launch Application'
                : 'Continue'}
            </button>
          </div>
        </div>
      </main>

      <footer style={vStyles.footer}>
        <span>TruCity © 2026</span>
        {' • '}
        <a
          href="#"
          style={vStyles.footerLink}
          onClick={(e) => e.preventDefault()}
        >
          User Agreement
        </a>
        {' • '}
        <a
          href="#"
          style={vStyles.footerLink}
          onClick={(e) => e.preventDefault()}
        >
          Privacy Policy
        </a>
      </footer>
    </div>
  );
}

const vStyles: {
  [key: string]: React.CSSProperties;
} = {
  pageContainer: {
    minHeight: '100vh',
    width: '100%',
    backgroundColor: '#f1f5f9',
    fontFamily:
      '-apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    position: 'relative',
    overflowX: 'hidden',
    boxSizing: 'border-box',
  },

  bgLogoWatermark: {
    position: 'fixed',
    inset: 0,
    backgroundImage: 'url("/logo.png")',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'contain',
    opacity: 0.04,
    pointerEvents: 'none',
    zIndex: 0,
  },

  bubbleBlueTop: {
    position: 'absolute',
    top: '-5%',
    left: '-10%',
    width: '950px',
    height: '750px',
    borderRadius:
      '50% 40% 60% 50% / 60% 50% 50% 40%',
    backgroundColor: '#ffb703',
    opacity: 0.85,
    filter: 'blur(1px)',
    border:
      '2px solid rgba(255, 255, 255, 0.4)',
    boxShadow:
      'inset 0 0 40px rgba(255, 255, 255, 0.5), 0 0 30px rgba(255, 183, 3, 0.3)',
    zIndex: 0,
    pointerEvents: 'none',
  },

  bubbleOrangeCenter: {
    position: 'absolute',
    top: '10%',
    right: '-5%',
    width: '320px',
    height: '320px',
    borderRadius: '50%',
    backgroundColor: '#ff9900',
    opacity: 0.4,
    filter: 'blur(32px)',
    border:
      '1px dashed rgba(255, 255, 255, 0.5)',
    boxShadow:
      'inset 0 0 20px rgba(255, 255, 255, 0.4)',
    zIndex: 0,
    pointerEvents: 'none',
  },

  bubbleBlueCenterRight: {
    position: 'absolute',
    top: '45%',
    right: '15%',
    width: '200px',
    height: '200px',
    borderRadius: '50%',
    backgroundColor: '#ffb703',
    opacity: 0.65,
    filter: 'blur(24px)',
    border:
      '2px solid rgba(255, 255, 255, 0.5)',
    boxShadow:
      'inset 0 0 15px rgba(255, 255, 255, 0.6)',
    zIndex: 0,
    pointerEvents: 'none',
  },

  bubbleOrangeBottom: {
    position: 'absolute',
    top: '52%',
    left: '34%',
    width: '260px',
    height: '260px',
    borderRadius: '50%',
    backgroundColor: '#0077b6',
    border:
      '2px solid rgba(255, 255, 255, 0.3)',
    boxShadow:
      'inset 0 0 25px rgba(255, 255, 255, 0.4), 0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    zIndex: 0,
    pointerEvents: 'none',
  },

  dottedRingTopRight: {
    position: 'absolute',
    top: '25%',
    right: '-50px',
    width: '260px',
    height: '260px',
    borderRadius: '50%',
    border: '6px dotted #003366',
    opacity: 0.4,
    zIndex: 0,
    pointerEvents: 'none',
  },

  dottedRingBottomRight: {
    position: 'absolute',
    bottom: '18%',
    right: '-70px',
    width: '300px',
    height: '300px',
    borderRadius: '50%',
    border: '8px dotted #ff9900',
    opacity: 0.5,
    zIndex: 0,
    pointerEvents: 'none',
  },

  header: {
    padding: '24px 48px',
    zIndex: 1,
    backgroundColor:
      'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid #e2e8f0',
  },

  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    textDecoration: 'none',
  },

  logoText: {
    fontSize: '32px',
    fontWeight: '900',
    letterSpacing: '-1px',
    lineHeight: '1',
  },

  main: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px 20px 60px',
    zIndex: 1,
  },

  card: {
    width: '100%',
    maxWidth: '760px',
    backgroundColor:
      'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    borderRadius: '24px',
    padding: '44px',
    boxShadow:
      '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
    border:
      '1px solid rgba(255, 255, 255, 0.9)',
    boxSizing: 'border-box',
    zIndex: 10,
  },

  loadingState: {
    textAlign: 'center',
    padding: '40px',
    color: '#0284c7',
    fontWeight: '700',
    fontSize: '15px',
  },

  progressBg: {
    width: '100%',
    height: '6px',
    backgroundColor: '#e2e8f0',
    borderRadius: '3px',
    marginTop: '8px',
    overflow: 'hidden',
  },

  progressBar: {
    height: '100%',
    backgroundColor: '#0284c7',
    transition: 'width 0.3s ease',
  },

  title: {
    fontSize: '22px',
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: '4px',
    marginTop: 0,
  },

  subtitle: {
    fontSize: '14px',
    color: '#64748b',
    marginBottom: '20px',
    lineHeight: '1.5',
  },

  errorBox: {
    backgroundColor: '#fef2f2',
    border: '1px solid #fca5a5',
    color: '#b91c1c',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '13px',
    marginBottom: '16px',
    lineHeight: '1.5',
  },

  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },

  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '600',
    color: '#334155',
    marginBottom: '6px',
  },

  fieldHint: {
    display: 'block',
    marginTop: '5px',
    fontSize: '11px',
    color: '#94a3b8',
  },

  input: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: '12px',
    border: '1px solid #cbd5e1',
    fontSize: '14px',
    boxSizing: 'border-box',
    outline: 'none',
    backgroundColor: '#ffffff',
    color: '#0f172a',
  },

  fileInput: {
    width: '100%',
    padding: '8px 0',
    fontSize: '13px',
    color: '#475569',
  },

  optionalNotice: {
    marginTop: '18px',
    padding: '12px 14px',
    borderRadius: '10px',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    color: '#64748b',
    fontSize: '12px',
    lineHeight: '1.5',
  },

  verificationCard: {
    textAlign: 'center',
    padding: '36px 20px',
    backgroundColor:
      'rgba(248, 250, 252, 0.7)',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
  },

  verificationIcon: {
    width: '52px',
    height: '52px',
    margin: '0 auto 14px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '22px',
    fontWeight: '800',
    color: '#0284c7',
    backgroundColor: '#f0f9ff',
    border: '1px solid #bae6fd',
  },

  verificationHeading: {
    margin: '0 0 8px',
    fontSize: '17px',
    fontWeight: '800',
    color: '#0f172a',
  },

  verificationDescription: {
    maxWidth: '500px',
    margin:
      '0 auto 20px',
    color: '#475569',
    fontSize: '14px',
    lineHeight: '1.6',
  },

  simulationNote: {
    marginTop: '14px',
    marginBottom: 0,
    color: '#94a3b8',
    fontSize: '11px',
  },

  checkingBar: {
    width: '100%',
    maxWidth: '420px',
    height: '6px',
    margin: '20px auto 0',
    backgroundColor: '#e2e8f0',
    borderRadius: '4px',
    overflow: 'hidden',
  },

  checkingBarFill: {
    width: '65%',
    height: '100%',
    backgroundColor: '#0284c7',
    borderRadius: '4px',
    animation:
      'trucityVerificationProgress 1.2s ease-in-out infinite alternate',
  },

  verifiedBadge: {
    display: 'inline-block',
    padding: '8px 14px',
    borderRadius: '999px',
    backgroundColor: '#dcfce7',
    color: '#15803d',
    border: '1px solid #bbf7d0',
    fontSize: '11px',
    fontWeight: '800',
    letterSpacing: '0.5px',
  },

  navRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '32px',
    paddingTop: '20px',
    borderTop: '1px solid #e2e8f0',
  },

  btnSecondary: {
    padding: '12px 20px',
    borderRadius: '12px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#fff',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#0f172a',
  },

  btnPrimary: {
    padding: '12px 28px',
    borderRadius: '12px',
    border: 'none',
    backgroundColor: '#0284c7',
    color: '#fff',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '14px',
    boxShadow:
      '0 4px 6px -1px rgba(2, 132, 199, 0.2)',
  },

  btnSkip: {
    background: 'transparent',
    border: 'none',
    color: '#0284c7',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    textDecoration: 'underline',
    padding: '0',
  },

  footer: {
    backgroundColor:
      'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(12px)',
    padding: '20px 48px',
    textAlign: 'center',
    fontSize: '12px',
    color: '#64748b',
    borderTop: '1px solid #e2e8f0',
    zIndex: 1,
  },

  footerLink: {
    color: '#64748b',
    textDecoration: 'none',
  },
};