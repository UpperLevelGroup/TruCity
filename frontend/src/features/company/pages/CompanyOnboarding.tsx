import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

type IdType = 'National ID' | 'Passport';
type PaymentMethod = 'Paystack' | 'Invoice';

interface FileMetadata {
  name: string;
  size: number;
  type: string;
}

interface CompanyOnboardingData {
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
  logo: FileMetadata | null;
  socialLinks: string;
  companyDescription: string;

  repFullName: string;
  repTitle: string;
  repEmail: string;
  repPhone: string;
  idType: IdType;
  idNumber: string;
  repIdPhoto: FileMetadata | null;
  proofOfAuthority: FileMetadata | null;

  verificationStatus: string;

  billingName: string;
  billingEmail: string;
  invoicingAddress: string;
  taxVatNumber: string;
  paymentMethod: PaymentMethod;
  agreeTerms: boolean;
}

const STORAGE_KEY = 'trucity_company_onboarding';
const STEP_KEY = 'trucity_company_onboarding_step';

const initialFormData: CompanyOnboardingData = {
  legalName: '',
  tradingName: '',
  region: 'Gauteng',
  companyRegNo: '',
  website: '',
  industry: 'Technology',
  registeredAddress: '',

  companyEmail: '',
  phone: '',
  companySize: '11-50 employees',
  logo: null,
  socialLinks: '',
  companyDescription: '',

  repFullName: '',
  repTitle: '',
  repEmail: '',
  repPhone: '',
  idType: 'National ID',
  idNumber: '',
  repIdPhoto: null,
  proofOfAuthority: null,

  verificationStatus: 'Pending Direct CIPC Check',

  billingName: '',
  billingEmail: '',
  invoicingAddress: '',
  taxVatNumber: '',
  paymentMethod: 'Paystack',
  agreeTerms: false,
};

const COMPANY_REGISTRATION_PATTERN = /^\d{4}\/\d{6}\/\d{2}$/;

export const CompanyOnboarding: React.FC = () => {
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState<number>(() => {
    const savedStep = localStorage.getItem(STEP_KEY);

    if (!savedStep) {
      return 1;
    }

    const parsedStep = Number(savedStep);

    return parsedStep >= 1 && parsedStep <= 5 ? parsedStep : 1;
  });

  const [formData, setFormData] =
    useState<CompanyOnboardingData>(initialFormData);

  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationComplete, setVerificationComplete] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const totalSteps = 5;

  /*
   * Restore previously saved onboarding information.
   *
   * Files are stored as metadata only because File objects cannot safely
   * be persisted directly in localStorage.
   */
  useEffect(() => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);

      if (!savedData) {
        return;
      }

      const parsedData = JSON.parse(savedData) as Partial<CompanyOnboardingData>;

      setFormData((prev) => ({
        ...prev,
        ...parsedData,
      }));
    } catch (error) {
      console.error('Failed to restore company onboarding data:', error);
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  /*
   * Persist the form whenever it changes.
   */
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
      localStorage.setItem(STEP_KEY, String(currentStep));
    } catch (error) {
      console.error('Failed to save company onboarding progress:', error);
    }
  }, [formData, currentStep]);

  const updateField = <K extends keyof CompanyOnboardingData>(
    field: K,
    value: CompanyOnboardingData[K],
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    setErrorMessage('');
  };

  const fileToMetadata = (file: File | null): FileMetadata | null => {
    if (!file) {
      return null;
    }

    return {
      name: file.name,
      size: file.size,
      type: file.type,
    };
  };

  const handleFileChange = (
    field: 'logo' | 'repIdPhoto' | 'proofOfAuthority',
    file: File | null,
  ) => {
    updateField(field, fileToMetadata(file));
  };

  const validateStep = (step: number): boolean => {
    setErrorMessage('');

    if (step === 1) {
      if (!formData.legalName.trim()) {
        setErrorMessage('Please enter the legal company name.');
        return false;
      }

      if (!formData.companyRegNo.trim()) {
        setErrorMessage('Please enter the company CIPC registration number.');
        return false;
      }

      if (!COMPANY_REGISTRATION_PATTERN.test(formData.companyRegNo.trim())) {
        setErrorMessage(
          'Please enter the CIPC registration number in the format 2023/123456/07.',
        );
        return false;
      }

      if (!formData.website.trim()) {
        setErrorMessage('Please enter the company website.');
        return false;
      }

      if (!formData.registeredAddress.trim()) {
        setErrorMessage('Please enter the registered company address.');
        return false;
      }
    }

    if (step === 2) {
      if (!formData.companyEmail.trim()) {
        setErrorMessage('Please enter the company email address.');
        return false;
      }

      if (!formData.phone.trim()) {
        setErrorMessage('Please enter the company phone number.');
        return false;
      }

      if (!formData.companyDescription.trim()) {
        setErrorMessage('Please provide a short company description.');
        return false;
      }

      if (formData.companyDescription.length > 400) {
        setErrorMessage(
          'Company description must be 400 characters or less.',
        );
        return false;
      }
    }

    if (step === 3) {
      if (!formData.repFullName.trim()) {
        setErrorMessage('Please enter the representative full name.');
        return false;
      }

      if (!formData.repTitle.trim()) {
        setErrorMessage('Please enter the representative position.');
        return false;
      }

      if (!formData.repEmail.trim()) {
        setErrorMessage('Please enter the representative email.');
        return false;
      }

      if (!formData.repPhone.trim()) {
        setErrorMessage('Please enter the representative phone number.');
        return false;
      }

      if (!formData.idNumber.trim()) {
        setErrorMessage('Please enter the ID or passport number.');
        return false;
      }

      if (!formData.repIdPhoto) {
        setErrorMessage('Please upload a representative ID document.');
        return false;
      }

      if (!formData.proofOfAuthority) {
        setErrorMessage('Please upload proof of authority.');
        return false;
      }
    }

    if (step === 4) {
      if (!verificationComplete) {
        setErrorMessage(
          'Please complete the verification check before continuing.',
        );
        return false;
      }
    }

    if (step === 5) {
      if (!formData.billingName.trim()) {
        setErrorMessage('Please enter the billing contact name.');
        return false;
      }

      if (!formData.billingEmail.trim()) {
        setErrorMessage('Please enter the billing contact email.');
        return false;
      }

      if (!formData.invoicingAddress.trim()) {
        setErrorMessage('Please enter the invoicing address.');
        return false;
      }

      if (!formData.agreeTerms) {
        setErrorMessage(
          'You must agree to the Terms of Service and Privacy Policy.',
        );
        return false;
      }
    }

    return true;
  };

  const runVerification = () => {
    setErrorMessage('');
    setIsVerifying(true);
    setVerificationComplete(false);

    /*
     * Demo verification only.
     *
     * The real CIPC verification service can later be connected through
     * companyService without changing this page's UI.
     */
    window.setTimeout(() => {
      setIsVerifying(false);
      setVerificationComplete(true);

      setFormData((prev) => ({
        ...prev,
        verificationStatus: 'Verification Check Completed',
      }));
    }, 1200);
  };

  const handleNext = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateStep(currentStep)) {
      return;
    }

    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
      return;
    }

    const completedOnboarding = {
      ...formData,
      submittedAt: new Date().toISOString(),
      onboardingStatus: 'Submitted',
    };

    try {
      localStorage.setItem(
        'trucity_company_onboarding_submission',
        JSON.stringify(completedOnboarding),
      );

      localStorage.setItem(
        'trucity_company_profile',
        JSON.stringify({
          legalName: formData.legalName,
          tradingName: formData.tradingName,
          region: formData.region,
          companyRegNo: formData.companyRegNo,
          website: formData.website,
          industry: formData.industry,
          registeredAddress: formData.registeredAddress,
          companyEmail: formData.companyEmail,
          phone: formData.phone,
          companySize: formData.companySize,
          companyDescription: formData.companyDescription,
          verificationStatus: formData.verificationStatus,
        }),
      );

      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STEP_KEY);

      alert(
        'Onboarding complete! Your company has been submitted for verification.',
      );

      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to save completed onboarding:', error);
      setErrorMessage(
        'We could not save your onboarding submission. Please try again.',
      );
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setErrorMessage('');
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleDescriptionChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    const value = event.target.value.slice(0, 400);
    updateField('companyDescription', value);
  };

  const progressPercentage = (currentStep / totalSteps) * 100;

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px',
    backgroundColor: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '13px',
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '12px',
    fontWeight: '600',
    color: '#cbd5e1',
    marginBottom: '4px',
  };

  const selectStyle: React.CSSProperties = {
    ...inputStyle,
    cursor: 'pointer',
  };

  return (
    <div
      style={{
        backgroundColor: '#0f172a',
        minHeight: 'calc(100vh - 65px)',
        color: '#ffffff',
        padding: '40px 16px',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          backgroundColor: '#1e293b',
          border: '1px solid #334155',
          borderRadius: '12px',
          padding: '32px',
          maxWidth: '720px',
          width: '100%',
        }}
      >
        {/* Step Progress Bar Header */}
        <div style={{ marginBottom: '28px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '12px',
              color: '#38bdf8',
              fontWeight: '700',
              marginBottom: '8px',
            }}
          >
            <span>
              STEP {currentStep} OF {totalSteps}
            </span>

            <span>{Math.round(progressPercentage)}% Completed</span>
          </div>

          <div
            style={{
              backgroundColor: '#0f172a',
              height: '8px',
              borderRadius: '4px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                backgroundColor: '#2563eb',
                height: '100%',
                width: `${progressPercentage}%`,
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div
            role="alert"
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.45)',
              color: '#fca5a5',
              padding: '12px 14px',
              borderRadius: '8px',
              fontSize: '13px',
              marginBottom: '20px',
            }}
          >
            {errorMessage}
          </div>
        )}

        <form
          onSubmit={handleNext}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
        >
          {/* STEP 1: COMPANY IDENTITY */}
          {currentStep === 1 && (
            <>
              <h3
                style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  margin: 0,
                }}
              >
                Step 1: Company Identity
              </h3>

              <div>
                <label style={labelStyle}>
                  Legal Company Name *
                  <span
                    style={{
                      color: '#94a3b8',
                      fontWeight: 'normal',
                      marginLeft: '6px',
                    }}
                  >
                    (helps us verify your company quickly)
                  </span>
                </label>

                <input
                  type="text"
                  required
                  placeholder="Official registered legal name"
                  value={formData.legalName}
                  onChange={(e) =>
                    updateField('legalName', e.target.value)
                  }
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>
                  Trading Name (Optional)
                </label>

                <input
                  type="text"
                  placeholder="Public operating name if different"
                  value={formData.tradingName}
                  onChange={(e) =>
                    updateField('tradingName', e.target.value)
                  }
                  style={inputStyle}
                />
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '16px',
                }}
              >
                <div>
                  <label style={labelStyle}>Company CIPC *</label>

                  <input
                    type="text"
                    required
                    placeholder="e.g. 2023/123456/07"
                    value={formData.companyRegNo}
                    onChange={(e) =>
                      updateField('companyRegNo', e.target.value)
                    }
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Website URL *</label>

                  <input
                    type="url"
                    required
                    placeholder="https://company.com"
                    value={formData.website}
                    onChange={(e) =>
                      updateField('website', e.target.value)
                    }
                    style={inputStyle}
                  />
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '16px',
                }}
              >
                <div>
                  <label style={labelStyle}>Region *</label>

                  <select
                    value={formData.region}
                    onChange={(e) =>
                      updateField('region', e.target.value)
                    }
                    style={selectStyle}
                  >
                    <option value="Gauteng">Gauteng</option>
                    <option value="Western Cape">Western Cape</option>
                    <option value="KwaZulu-Natal">
                      KwaZulu-Natal
                    </option>
                    <option value="Eastern Cape">
                      Eastern Cape
                    </option>
                    <option value="Free State">Free State</option>
                    <option value="Limpopo">Limpopo</option>
                    <option value="Mpumalanga">Mpumalanga</option>
                    <option value="North West">North West</option>
                    <option value="Northern Cape">
                      Northern Cape
                    </option>
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Industry *</label>

                  <select
                    value={formData.industry}
                    onChange={(e) =>
                      updateField('industry', e.target.value)
                    }
                    style={selectStyle}
                  >
                    <option value="Technology">Technology</option>
                    <option value="Finance">Finance</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Retail">Retail</option>
                    <option value="Construction">
                      Construction
                    </option>
                    <option value="Education">Education</option>
                    <option value="Manufacturing">
                      Manufacturing
                    </option>
                    <option value="Professional Services">
                      Professional Services
                    </option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={labelStyle}>
                  Registered Address *
                </label>

                <textarea
                  required
                  rows={2}
                  placeholder="Full physical corporate address"
                  value={formData.registeredAddress}
                  onChange={(e) =>
                    updateField('registeredAddress', e.target.value)
                  }
                  style={inputStyle}
                />
              </div>
            </>
          )}

          {/* STEP 2: COMPANY CONTACTS & LOGO */}
          {currentStep === 2 && (
            <>
              <h3
                style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  margin: 0,
                }}
              >
                Step 2: Company Contacts & Branding
              </h3>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '16px',
                }}
              >
                <div>
                  <label style={labelStyle}>Company Email *</label>

                  <input
                    type="email"
                    required
                    placeholder="info@company.com"
                    value={formData.companyEmail}
                    onChange={(e) =>
                      updateField('companyEmail', e.target.value)
                    }
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Phone Number *</label>

                  <input
                    type="tel"
                    required
                    placeholder="+27 11 000 0000"
                    value={formData.phone}
                    onChange={(e) =>
                      updateField('phone', e.target.value)
                    }
                    style={inputStyle}
                  />
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '16px',
                }}
              >
                <div>
                  <label style={labelStyle}>Company Size *</label>

                  <select
                    value={formData.companySize}
                    onChange={(e) =>
                      updateField('companySize', e.target.value)
                    }
                    style={selectStyle}
                  >
                    <option value="1-10 employees">
                      1-10 employees
                    </option>
                    <option value="11-50 employees">
                      11-50 employees
                    </option>
                    <option value="51-200 employees">
                      51-200 employees
                    </option>
                    <option value="201-500 employees">
                      201-500 employees
                    </option>
                    <option value="501-1000 employees">
                      501-1000 employees
                    </option>
                    <option value="1000+ employees">
                      1000+ employees
                    </option>
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>
                    Social Links (Optional)
                  </label>

                  <input
                    type="text"
                    placeholder="LinkedIn, X, Facebook..."
                    value={formData.socialLinks}
                    onChange={(e) =>
                      updateField('socialLinks', e.target.value)
                    }
                    style={inputStyle}
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Company Logo *</label>

                <input
                  type="file"
                  required={!formData.logo}
                  accept="image/png, image/jpeg"
                  onChange={(e) =>
                    handleFileChange(
                      'logo',
                      e.target.files?.[0] ?? null,
                    )
                  }
                  style={{
                    width: '100%',
                    fontSize: '12px',
                    color: '#94a3b8',
                  }}
                />

                {formData.logo && (
                  <p
                    style={{
                      color: '#38bdf8',
                      fontSize: '11px',
                      margin: '6px 0 0',
                    }}
                  >
                    Selected: {formData.logo.name}
                  </p>
                )}
              </div>

              <div>
                <label style={labelStyle}>
                  Company Description *
                </label>

                <textarea
                  required
                  rows={3}
                  maxLength={400}
                  placeholder="Short business summary (max 400 characters)..."
                  value={formData.companyDescription}
                  onChange={handleDescriptionChange}
                  style={inputStyle}
                />

                <div
                  style={{
                    textAlign: 'right',
                    color: '#64748b',
                    fontSize: '11px',
                    marginTop: '4px',
                  }}
                >
                  {formData.companyDescription.length}/400
                </div>
              </div>
            </>
          )}

          {/* STEP 3: REPRESENTATIVE INFO */}
          {currentStep === 3 && (
            <>
              <h3
                style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  margin: 0,
                }}
              >
                Step 3: Representative Info
              </h3>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '16px',
                }}
              >
                <div>
                  <label style={labelStyle}>Rep Full Name *</label>

                  <input
                    type="text"
                    required
                    placeholder="Authorized full name"
                    value={formData.repFullName}
                    onChange={(e) =>
                      updateField('repFullName', e.target.value)
                    }
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>
                    Rep Title / Position *
                  </label>

                  <input
                    type="text"
                    required
                    placeholder="e.g. Director"
                    value={formData.repTitle}
                    onChange={(e) =>
                      updateField('repTitle', e.target.value)
                    }
                    style={inputStyle}
                  />
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '16px',
                }}
              >
                <div>
                  <label style={labelStyle}>Rep Email *</label>

                  <input
                    type="email"
                    required
                    placeholder="representative@company.com"
                    value={formData.repEmail}
                    onChange={(e) =>
                      updateField('repEmail', e.target.value)
                    }
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Rep Phone *</label>

                  <input
                    type="tel"
                    required
                    placeholder="+27 82 000 0000"
                    value={formData.repPhone}
                    onChange={(e) =>
                      updateField('repPhone', e.target.value)
                    }
                    style={inputStyle}
                  />
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '16px',
                }}
              >
                <div>
                  <label style={labelStyle}>ID Type *</label>

                  <select
                    value={formData.idType}
                    onChange={(e) =>
                      updateField(
                        'idType',
                        e.target.value as IdType,
                      )
                    }
                    style={selectStyle}
                  >
                    <option value="National ID">
                      South African National ID
                    </option>
                    <option value="Passport">Passport</option>
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>
                    ID / Passport Number *
                  </label>

                  <input
                    type="text"
                    required
                    placeholder="Document number"
                    value={formData.idNumber}
                    onChange={(e) =>
                      updateField('idNumber', e.target.value)
                    }
                    style={inputStyle}
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>
                  Representative ID Document *
                </label>

                <input
                  type="file"
                  required={!formData.repIdPhoto}
                  accept="image/png, image/jpeg, application/pdf"
                  onChange={(e) =>
                    handleFileChange(
                      'repIdPhoto',
                      e.target.files?.[0] ?? null,
                    )
                  }
                  style={{
                    width: '100%',
                    fontSize: '12px',
                    color: '#94a3b8',
                  }}
                />

                {formData.repIdPhoto && (
                  <p
                    style={{
                      color: '#38bdf8',
                      fontSize: '11px',
                      margin: '6px 0 0',
                    }}
                  >
                    Selected: {formData.repIdPhoto.name}
                  </p>
                )}
              </div>

              <div>
                <label style={labelStyle}>
                  Proof of Authority *
                </label>

                <input
                  type="file"
                  required={!formData.proofOfAuthority}
                  accept="image/png, image/jpeg, application/pdf"
                  onChange={(e) =>
                    handleFileChange(
                      'proofOfAuthority',
                      e.target.files?.[0] ?? null,
                    )
                  }
                  style={{
                    width: '100%',
                    fontSize: '12px',
                    color: '#94a3b8',
                  }}
                />

                {formData.proofOfAuthority && (
                  <p
                    style={{
                      color: '#38bdf8',
                      fontSize: '11px',
                      margin: '6px 0 0',
                    }}
                  >
                    Selected: {formData.proofOfAuthority.name}
                  </p>
                )}
              </div>

              <div
                style={{
                  backgroundColor: 'rgba(56, 189, 248, 0.08)',
                  border: '1px solid rgba(56, 189, 248, 0.2)',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  color: '#94a3b8',
                  fontSize: '11px',
                  lineHeight: 1.5,
                }}
              >
                Your representative information is used to establish
                who is authorized to act on behalf of the company.
              </div>
            </>
          )}

          {/* STEP 4: VERIFICATION */}
          {currentStep === 4 && (
            <>
              <h3
                style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  margin: 0,
                }}
              >
                Step 4: Automated Verification
              </h3>

              <div
                style={{
                  backgroundColor: '#0f172a',
                  padding: '20px',
                  borderRadius: '8px',
                  border: '1px solid #334155',
                }}
              >
                {!verificationComplete && !isVerifying && (
                  <>
                    <p
                      style={{
                        color: '#38bdf8',
                        fontSize: '14px',
                        fontWeight: '700',
                        margin: '0 0 8px 0',
                      }}
                    >
                      ✓ Ready to check registry information
                    </p>

                    <p
                      style={{
                        color: '#cbd5e1',
                        fontSize: '13px',
                        margin: '0 0 16px',
                      }}
                    >
                      We will perform a preliminary verification
                      using your CIPC registration number and company
                      information.
                    </p>

                    <button
                      type="button"
                      onClick={runVerification}
                      style={{
                        backgroundColor: '#2563eb',
                        color: '#ffffff',
                        border: 'none',
                        padding: '10px 18px',
                        borderRadius: '6px',
                        fontWeight: '700',
                        fontSize: '13px',
                        cursor: 'pointer',
                      }}
                    >
                      Run Verification Check
                    </button>
                  </>
                )}

                {isVerifying && (
                  <>
                    <p
                      style={{
                        color: '#38bdf8',
                        fontSize: '14px',
                        fontWeight: '700',
                        margin: '0 0 8px 0',
                      }}
                    >
                      Checking company information...
                    </p>

                    <p
                      style={{
                        color: '#cbd5e1',
                        fontSize: '13px',
                        margin: 0,
                      }}
                    >
                      Checking registration number{' '}
                      <strong>
                        {formData.companyRegNo || 'Pending'}
                      </strong>
                      .
                    </p>
                  </>
                )}

                {verificationComplete && (
                  <>
                    <p
                      style={{
                        color: '#4ade80',
                        fontSize: '14px',
                        fontWeight: '700',
                        margin: '0 0 8px 0',
                      }}
                    >
                      ✓ Verification check completed
                    </p>

                    <p
                      style={{
                        color: '#cbd5e1',
                        fontSize: '13px',
                        margin: 0,
                      }}
                    >
                      Your company information has passed the
                      preliminary verification step and is ready for
                      final submission.
                    </p>
                  </>
                )}
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                }}
              >
                <div
                  style={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    padding: '14px',
                  }}
                >
                  <div
                    style={{
                      color: '#64748b',
                      fontSize: '10px',
                      fontWeight: '700',
                      marginBottom: '5px',
                    }}
                  >
                    CIPC NUMBER
                  </div>

                  <div
                    style={{
                      color: '#ffffff',
                      fontSize: '13px',
                    }}
                  >
                    {formData.companyRegNo || 'Pending'}
                  </div>
                </div>

                <div
                  style={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    padding: '14px',
                  }}
                >
                  <div
                    style={{
                      color: '#64748b',
                      fontSize: '10px',
                      fontWeight: '700',
                      marginBottom: '5px',
                    }}
                  >
                    STATUS
                  </div>

                  <div
                    style={{
                      color: verificationComplete
                        ? '#4ade80'
                        : '#fbbf24',
                      fontSize: '13px',
                    }}
                  >
                    {formData.verificationStatus}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* STEP 5: BILLING & TERMS */}
          {currentStep === 5 && (
            <>
              <h3
                style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  margin: 0,
                }}
              >
                Step 5: Billing & Final Terms
              </h3>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '16px',
                }}
              >
                <div>
                  <label style={labelStyle}>
                    Billing Contact Name *
                  </label>

                  <input
                    type="text"
                    required
                    placeholder="Person responsible for invoices"
                    value={formData.billingName}
                    onChange={(e) =>
                      updateField('billingName', e.target.value)
                    }
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>
                    Billing Contact Email *
                  </label>

                  <input
                    type="email"
                    required
                    placeholder="billing@company.com"
                    value={formData.billingEmail}
                    onChange={(e) =>
                      updateField('billingEmail', e.target.value)
                    }
                    style={inputStyle}
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Invoicing Address *</label>

                <textarea
                  required
                  rows={2}
                  placeholder="Official invoicing address"
                  value={formData.invoicingAddress}
                  onChange={(e) =>
                    updateField('invoicingAddress', e.target.value)
                  }
                  style={inputStyle}
                />
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '16px',
                }}
              >
                <div>
                  <label style={labelStyle}>
                    Tax / VAT Number
                  </label>

                  <input
                    type="text"
                    placeholder="Optional VAT number"
                    value={formData.taxVatNumber}
                    onChange={(e) =>
                      updateField('taxVatNumber', e.target.value)
                    }
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Payment Method *</label>

                  <select
                    value={formData.paymentMethod}
                    onChange={(e) =>
                      updateField(
                        'paymentMethod',
                        e.target.value as PaymentMethod,
                      )
                    }
                    style={selectStyle}
                  >
                    <option value="Paystack">Paystack</option>
                    <option value="Invoice">Invoice</option>
                  </select>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginTop: '8px',
                }}
              >
                <input
                  type="checkbox"
                  id="final-terms"
                  required
                  checked={formData.agreeTerms}
                  onChange={(e) =>
                    updateField('agreeTerms', e.target.checked)
                  }
                />

                <label
                  htmlFor="final-terms"
                  style={{
                    fontSize: '12px',
                    color: '#cbd5e1',
                    cursor: 'pointer',
                  }}
                >
                  I agree to the{' '}
                  <strong>Terms of Service</strong> and{' '}
                  <strong>Privacy Policy</strong> *
                </label>
              </div>

              <div
                style={{
                  backgroundColor: 'rgba(37, 99, 235, 0.08)',
                  border: '1px solid rgba(37, 99, 235, 0.25)',
                  borderRadius: '8px',
                  padding: '14px',
                  color: '#94a3b8',
                  fontSize: '11px',
                  lineHeight: 1.5,
                }}
              >
                Your company profile will be submitted for verification
                after you complete this step. Payment processing will
                be connected separately and is not performed by this
                onboarding form.
              </div>
            </>
          )}

          {/* Form Controls */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '16px',
              gap: '12px',
            }}
          >
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handlePrev}
                style={{
                  backgroundColor: 'transparent',
                  border: '1px solid #334155',
                  color: '#cbd5e1',
                  padding: '10px 18px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                }}
              >
                ← Back
              </button>
            )}

            <button
              type="submit"
              disabled={currentStep === 4 && isVerifying}
              style={{
                backgroundColor:
                  currentStep === 4 && !verificationComplete
                    ? '#475569'
                    : '#2563eb',
                color: '#ffffff',
                border: 'none',
                padding: '10px 24px',
                borderRadius: '6px',
                fontWeight: '700',
                fontSize: '14px',
                cursor:
                  currentStep === 4 && !verificationComplete
                    ? 'not-allowed'
                    : 'pointer',
                marginLeft: 'auto',
                opacity: isVerifying ? 0.7 : 1,
              }}
            >
              {currentStep === totalSteps
                ? 'Complete & Finish →'
                : 'Save & Continue →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompanyOnboarding;