import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../../assets/branding/trucity-logo.png';

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
const SUBMISSION_KEY = 'trucity_company_onboarding_submission';
const PROFILE_KEY = 'trucity_company_profile';

const COMPANY_REGISTRATION_PATTERN = /^\d{4}\/\d{6}\/\d{2}$/;

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

const STEPS = [
  {
    number: 1,
    title: 'Company Identity',
    description: 'Tell us about your organisation',
  },
  {
    number: 2,
    title: 'Contacts & Branding',
    description: 'Company contact and profile details',
  },
  {
    number: 3,
    title: 'Representative',
    description: 'Authorised company representative',
  },
  {
    number: 4,
    title: 'Verification',
    description: 'Preliminary company verification',
  },
  {
    number: 5,
    title: 'Billing & Terms',
    description: 'Final billing and agreement',
  },
];

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
   * File objects cannot safely be stored in localStorage, so only
   * file metadata is persisted.
   */
  useEffect(() => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);

      if (!savedData) {
        return;
      }

      const parsedData =
        JSON.parse(savedData) as Partial<CompanyOnboardingData>;

      setFormData((prev) => ({
        ...prev,
        ...parsedData,
      }));

      if (
        parsedData.verificationStatus ===
        'Verification Check Completed'
      ) {
        setVerificationComplete(true);
      }
    } catch (error) {
      console.error(
        'Failed to restore company onboarding data:',
        error,
      );

      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  /*
   * Persist onboarding progress whenever the form or step changes.
   */
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(formData),
      );

      localStorage.setItem(
        STEP_KEY,
        String(currentStep),
      );
    } catch (error) {
      console.error(
        'Failed to save company onboarding progress:',
        error,
      );
    }
  }, [formData, currentStep]);

  const updateField = <
    K extends keyof CompanyOnboardingData
  >(
    field: K,
    value: CompanyOnboardingData[K],
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    setErrorMessage('');
  };

  const fileToMetadata = (
    file: File | null,
  ): FileMetadata | null => {
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
    field:
      | 'logo'
      | 'repIdPhoto'
      | 'proofOfAuthority',
    file: File | null,
  ) => {
    updateField(field, fileToMetadata(file));
  };

  const validateStep = (step: number): boolean => {
    setErrorMessage('');

    if (step === 1) {
      if (!formData.legalName.trim()) {
        setErrorMessage(
          'Please enter the legal company name.',
        );
        return false;
      }

      if (!formData.companyRegNo.trim()) {
        setErrorMessage(
          'Please enter the company CIPC registration number.',
        );
        return false;
      }

      if (
        !COMPANY_REGISTRATION_PATTERN.test(
          formData.companyRegNo.trim(),
        )
      ) {
        setErrorMessage(
          'Please enter the CIPC registration number in the format 2023/123456/07.',
        );
        return false;
      }

      if (!formData.website.trim()) {
        setErrorMessage(
          'Please enter the company website.',
        );
        return false;
      }

      if (!formData.registeredAddress.trim()) {
        setErrorMessage(
          'Please enter the registered company address.',
        );
        return false;
      }
    }

    if (step === 2) {
      if (!formData.companyEmail.trim()) {
        setErrorMessage(
          'Please enter the company email address.',
        );
        return false;
      }

      if (!formData.phone.trim()) {
        setErrorMessage(
          'Please enter the company phone number.',
        );
        return false;
      }

      if (!formData.logo) {
        setErrorMessage(
          'Please upload the company logo.',
        );
        return false;
      }

      if (!formData.companyDescription.trim()) {
        setErrorMessage(
          'Please provide a short company description.',
        );
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
        setErrorMessage(
          'Please enter the representative full name.',
        );
        return false;
      }

      if (!formData.repTitle.trim()) {
        setErrorMessage(
          'Please enter the representative position.',
        );
        return false;
      }

      if (!formData.repEmail.trim()) {
        setErrorMessage(
          'Please enter the representative email.',
        );
        return false;
      }

      if (!formData.repPhone.trim()) {
        setErrorMessage(
          'Please enter the representative phone number.',
        );
        return false;
      }

      if (!formData.idNumber.trim()) {
        setErrorMessage(
          'Please enter the ID or passport number.',
        );
        return false;
      }

      if (!formData.repIdPhoto) {
        setErrorMessage(
          'Please upload a representative ID document.',
        );
        return false;
      }

      if (!formData.proofOfAuthority) {
        setErrorMessage(
          'Please upload proof of authority.',
        );
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
        setErrorMessage(
          'Please enter the billing contact name.',
        );
        return false;
      }

      if (!formData.billingEmail.trim()) {
        setErrorMessage(
          'Please enter the billing contact email.',
        );
        return false;
      }

      if (!formData.invoicingAddress.trim()) {
        setErrorMessage(
          'Please enter the invoicing address.',
        );
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
     * The real CIPC verification service can later be connected
     * through companyService without changing this page's UI.
     */
    window.setTimeout(() => {
      setIsVerifying(false);
      setVerificationComplete(true);

      setFormData((prev) => ({
        ...prev,
        verificationStatus:
          'Verification Check Completed',
      }));
    }, 1200);
  };

  const handleNext = (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
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
        SUBMISSION_KEY,
        JSON.stringify(completedOnboarding),
      );

      localStorage.setItem(
        PROFILE_KEY,
        JSON.stringify({
          legalName: formData.legalName,
          tradingName: formData.tradingName,
          region: formData.region,
          companyRegNo: formData.companyRegNo,
          website: formData.website,
          industry: formData.industry,
          registeredAddress:
            formData.registeredAddress,
          companyEmail: formData.companyEmail,
          phone: formData.phone,
          companySize: formData.companySize,
          companyDescription:
            formData.companyDescription,
          verificationStatus:
            formData.verificationStatus,
        }),
      );

      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STEP_KEY);

      alert(
        'Onboarding complete! Your company has been submitted for verification.',
      );

      navigate('/dashboard');
    } catch (error) {
      console.error(
        'Failed to save completed onboarding:',
        error,
      );

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

  const progressPercentage =
    (currentStep / totalSteps) * 100;

  return (
    <div className="company-onboarding-page">
      <style>
        {`
          .company-onboarding-page {
            min-height: 100vh;
            background: #F8FCFF;
            color: #00273D;
            padding: 32px 24px 56px;
            position: relative;
            overflow: hidden;
            font-family: Helvetica, Arial, sans-serif;
          }

          .company-onboarding-page *,
          .company-onboarding-page *::before,
          .company-onboarding-page *::after {
            box-sizing: border-box;
          }

          .onboarding-watermark {
            position: absolute;
            pointer-events: none;
            user-select: none;
            z-index: 0;
          }

          .watermark-word {
            right: -80px;
            bottom: 20px;
            color: rgba(0, 70, 109, 0.035);
            font-size: clamp(90px, 15vw, 210px);
            font-weight: 900;
            letter-spacing: -0.08em;
            transform: rotate(-8deg);
          }

          .watermark-city {
            right: 5%;
            bottom: 0;
            width: 330px;
            height: 90px;
            opacity: 0.055;
            display: flex;
            align-items: flex-end;
            gap: 5px;
          }

          .watermark-city span {
            display: block;
            width: 20px;
            background: #00466D;
            border-radius: 3px 3px 0 0;
          }

          .watermark-city span:nth-child(1) { height: 35px; }
          .watermark-city span:nth-child(2) { height: 55px; }
          .watermark-city span:nth-child(3) { height: 42px; }
          .watermark-city span:nth-child(4) { height: 75px; }
          .watermark-city span:nth-child(5) { height: 48px; }
          .watermark-city span:nth-child(6) { height: 65px; }
          .watermark-city span:nth-child(7) { height: 38px; }
          .watermark-city span:nth-child(8) { height: 82px; }
          .watermark-city span:nth-child(9) { height: 52px; }
          .watermark-city span:nth-child(10) { height: 70px; }
          .watermark-city span:nth-child(11) { height: 44px; }
          .watermark-city span:nth-child(12) { height: 60px; }

          .onboarding-container {
            width: 100%;
            max-width: 1120px;
            margin: 0 auto;
            position: relative;
            z-index: 1;
          }

          .onboarding-header {
            background: #FFFFFF;
            border: 1px solid rgba(0, 70, 109, 0.10);
            border-radius: 18px;
            min-height: 82px;
            padding: 16px 22px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 20px;
            box-shadow: 0 10px 35px rgba(0, 39, 61, 0.06);
            margin-bottom: 22px;
          }

          .brand-area {
            display: flex;
            align-items: center;
            gap: 16px;
            min-width: 0;
          }

          .brand-logo {
            width: 150px;
            max-width: 35vw;
            height: 52px;
            object-fit: contain;
            object-position: left center;
          }

          .brand-divider {
            width: 1px;
            height: 38px;
            background: rgba(0, 70, 109, 0.15);
          }

          .brand-copy {
            min-width: 0;
          }

          .brand-title {
            margin: 0;
            color: #00466D;
            font-size: 12px;
            font-weight: 800;
            letter-spacing: 0.12em;
            text-transform: uppercase;
          }

          .brand-subtitle {
            margin: 4px 0 0;
            color: #64748B;
            font-size: 11px;
          }

          .secure-pill {
            display: inline-flex;
            align-items: center;
            gap: 7px;
            padding: 9px 13px;
            border-radius: 999px;
            background: rgba(255, 173, 1, 0.10);
            border: 1px solid rgba(255, 173, 1, 0.25);
            color: #7A5100;
            font-size: 11px;
            font-weight: 700;
            white-space: nowrap;
          }

          .secure-dot {
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: #FFAD01;
          }

          .onboarding-layout {
            display: grid;
            grid-template-columns: 290px minmax(0, 1fr);
            gap: 22px;
            align-items: stretch;
          }

          .progress-panel {
            background: #00466D;
            border-radius: 18px;
            padding: 28px 22px;
            color: #FFFFFF;
            min-height: 650px;
            position: relative;
            overflow: hidden;
            box-shadow: 0 16px 45px rgba(0, 39, 61, 0.12);
          }

          .progress-panel::after {
            content: "";
            position: absolute;
            width: 170px;
            height: 170px;
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 50%;
            right: -80px;
            bottom: -70px;
          }

          .progress-heading {
            position: relative;
            z-index: 1;
            margin-bottom: 32px;
          }

          .progress-heading-label {
            margin: 0 0 7px;
            color: #FFD784;
            font-size: 10px;
            font-weight: 800;
            letter-spacing: 0.16em;
            text-transform: uppercase;
          }

          .progress-heading h1 {
            margin: 0;
            font-size: 24px;
            line-height: 1.15;
            letter-spacing: -0.03em;
          }

          .progress-heading p {
            margin: 10px 0 0;
            color: rgba(255,255,255,0.68);
            font-size: 12px;
            line-height: 1.55;
          }

          .step-list {
            position: relative;
            z-index: 1;
          }

          .step-item {
            display: flex;
            gap: 12px;
            position: relative;
            padding-bottom: 25px;
          }

          .step-item:last-child {
            padding-bottom: 0;
          }

          .step-item:not(:last-child)::after {
            content: "";
            position: absolute;
            left: 14px;
            top: 31px;
            width: 1px;
            height: calc(100% - 27px);
            background: rgba(255,255,255,0.15);
          }

          .step-item.completed:not(:last-child)::after,
          .step-item.active:not(:last-child)::after {
            background: rgba(255,173,1,0.45);
          }

          .step-number {
            width: 29px;
            height: 29px;
            border-radius: 50%;
            flex: 0 0 29px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1px solid rgba(255,255,255,0.25);
            color: rgba(255,255,255,0.62);
            font-size: 11px;
            font-weight: 800;
            background: rgba(255,255,255,0.04);
            position: relative;
            z-index: 2;
          }

          .step-item.active .step-number {
            background: #FFAD01;
            border-color: #FFAD01;
            color: #00273D;
            box-shadow: 0 0 0 5px rgba(255,173,1,0.13);
          }

          .step-item.completed .step-number {
            background: rgba(255,173,1,0.16);
            border-color: rgba(255,173,1,0.65);
            color: #FFD784;
          }

          .step-copy {
            padding-top: 1px;
          }

          .step-copy strong {
            display: block;
            font-size: 12px;
            line-height: 1.3;
            color: rgba(255,255,255,0.58);
          }

          .step-item.active .step-copy strong,
          .step-item.completed .step-copy strong {
            color: #FFFFFF;
          }

          .step-copy span {
            display: block;
            margin-top: 4px;
            color: rgba(255,255,255,0.42);
            font-size: 10px;
            line-height: 1.45;
          }

          .step-item.active .step-copy span {
            color: rgba(255,255,255,0.68);
          }

          .progress-footer {
            position: absolute;
            left: 22px;
            right: 22px;
            bottom: 24px;
            padding-top: 18px;
            border-top: 1px solid rgba(255,255,255,0.10);
            color: rgba(255,255,255,0.45);
            font-size: 9px;
            line-height: 1.5;
            text-transform: uppercase;
            letter-spacing: 0.08em;
          }

          .form-panel {
            background: #FFFFFF;
            border: 1px solid rgba(0, 70, 109, 0.10);
            border-radius: 18px;
            padding: 32px;
            min-width: 0;
            box-shadow: 0 16px 45px rgba(0, 39, 61, 0.07);
          }

          .form-panel-header {
            display: flex;
            justify-content: space-between;
            gap: 20px;
            align-items: flex-start;
            padding-bottom: 22px;
            margin-bottom: 24px;
            border-bottom: 1px solid #E8F0F5;
          }

          .form-eyebrow {
            margin: 0 0 6px;
            color: #1E92D2;
            font-size: 10px;
            font-weight: 800;
            letter-spacing: 0.12em;
            text-transform: uppercase;
          }

          .form-title {
            margin: 0;
            color: #00273D;
            font-size: 23px;
            line-height: 1.2;
            letter-spacing: -0.03em;
          }

          .form-description {
            margin: 7px 0 0;
            color: #64748B;
            font-size: 12px;
            line-height: 1.5;
            max-width: 560px;
          }

          .mobile-progress {
            display: none;
          }

          .form-content {
            display: flex;
            flex-direction: column;
            gap: 20px;
          }

          .field-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 17px;
          }

          .field {
            min-width: 0;
          }

          .field-label {
            display: block;
            margin-bottom: 7px;
            color: #24475A;
            font-size: 11px;
            font-weight: 800;
          }

          .field-label span {
            color: #94A3B8;
            font-weight: 400;
            margin-left: 5px;
          }

          .field-input,
          .field-select,
          .field-textarea {
            width: 100%;
            border: 1px solid #D8E4EB;
            border-radius: 9px;
            background: #FFFFFF;
            color: #00273D;
            padding: 11px 12px;
            font-family: inherit;
            font-size: 12px;
            outline: none;
            transition: border-color 0.18s ease, box-shadow 0.18s ease;
          }

          .field-input,
          .field-select {
            height: 42px;
          }

          .field-textarea {
            resize: vertical;
            min-height: 78px;
            line-height: 1.5;
          }

          .field-input::placeholder,
          .field-textarea::placeholder {
            color: #A4B2BB;
          }

          .field-input:focus,
          .field-select:focus,
          .field-textarea:focus {
            border-color: #1E92D2;
            box-shadow: 0 0 0 3px rgba(30,146,210,0.10);
          }

          .file-field {
            width: 100%;
            border: 1px dashed #BFD2DD;
            border-radius: 10px;
            padding: 13px;
            background: #F8FCFF;
          }

          .file-input {
            width: 100%;
            color: #64748B;
            font-size: 11px;
          }

          .selected-file {
            margin: 7px 0 0;
            color: #1E92D2;
            font-size: 10px;
            font-weight: 700;
          }

          .character-count {
            text-align: right;
            margin-top: 5px;
            color: #94A3B8;
            font-size: 10px;
          }

          .info-box {
            background: rgba(30,146,210,0.06);
            border: 1px solid rgba(30,146,210,0.15);
            border-radius: 10px;
            padding: 13px 15px;
            color: #587080;
            font-size: 11px;
            line-height: 1.55;
          }

          .error-box {
            background: #FFF5F5;
            border: 1px solid #FECACA;
            color: #B91C1C;
            border-radius: 10px;
            padding: 12px 14px;
            font-size: 11px;
            line-height: 1.45;
            margin-bottom: 20px;
          }

          .verification-card {
            border-radius: 13px;
            border: 1px solid #DCEAF1;
            background: #F8FCFF;
            padding: 22px;
          }

          .verification-icon {
            width: 42px;
            height: 42px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 13px;
            background: rgba(255,173,1,0.14);
            color: #A66A00;
            font-size: 17px;
            font-weight: 800;
          }

          .verification-icon.complete {
            background: rgba(34,197,94,0.12);
            color: #15803D;
          }

          .verification-icon.loading {
            background: rgba(30,146,210,0.12);
            color: #1E92D2;
          }

          .verification-title {
            margin: 0 0 6px;
            color: #00273D;
            font-size: 15px;
            font-weight: 800;
          }

          .verification-text {
            margin: 0 0 17px;
            color: #64748B;
            font-size: 11px;
            line-height: 1.55;
          }

          .verification-button {
            border: none;
            background: #00466D;
            color: #FFFFFF;
            border-radius: 8px;
            padding: 10px 16px;
            font-size: 11px;
            font-weight: 800;
            cursor: pointer;
          }

          .verification-button:hover {
            background: #003955;
          }

          .verification-summary {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 12px;
            margin-top: 14px;
          }

          .summary-card {
            border: 1px solid #E2EBF0;
            background: #FFFFFF;
            border-radius: 10px;
            padding: 13px;
          }

          .summary-label {
            color: #94A3B8;
            font-size: 9px;
            font-weight: 800;
            letter-spacing: 0.08em;
            margin-bottom: 5px;
          }

          .summary-value {
            color: #00273D;
            font-size: 12px;
            font-weight: 700;
            word-break: break-word;
          }

          .summary-value.pending {
            color: #A66A00;
          }

          .summary-value.complete {
            color: #15803D;
          }

          .terms-row {
            display: flex;
            align-items: flex-start;
            gap: 9px;
            margin-top: 4px;
          }

          .terms-row input {
            width: 16px;
            height: 16px;
            margin: 1px 0 0;
            accent-color: #FFAD01;
            flex: 0 0 auto;
          }

          .terms-row label {
            color: #64748B;
            font-size: 11px;
            line-height: 1.5;
            cursor: pointer;
          }

          .terms-row strong {
            color: #00466D;
          }

          .form-actions {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 12px;
            margin-top: 8px;
            padding-top: 20px;
            border-top: 1px solid #E8F0F5;
          }

          .back-button,
          .next-button {
            min-height: 42px;
            border-radius: 9px;
            padding: 0 18px;
            font-family: inherit;
            font-size: 11px;
            font-weight: 800;
            cursor: pointer;
            transition: all 0.18s ease;
          }

          .back-button {
            background: #FFFFFF;
            border: 1px solid #D5E2E9;
            color: #526C7A;
          }

          .back-button:hover {
            border-color: #9EB7C5;
            background: #F8FCFF;
          }

          .next-button {
            border: 1px solid #FFAD01;
            background: #FFAD01;
            color: #00273D;
            margin-left: auto;
            box-shadow: 0 6px 16px rgba(255,173,1,0.18);
          }

          .next-button:hover:not(:disabled) {
            background: #F5A300;
            transform: translateY(-1px);
          }

          .next-button:disabled {
            background: #B9C4CA;
            border-color: #B9C4CA;
            color: #FFFFFF;
            cursor: not-allowed;
            box-shadow: none;
          }

          @media (max-width: 900px) {
            .onboarding-layout {
              grid-template-columns: 1fr;
            }

            .progress-panel {
              min-height: auto;
              padding: 22px;
            }

            .progress-footer {
              display: none;
            }

            .step-list {
              display: grid;
              grid-template-columns: repeat(5, minmax(0, 1fr));
              gap: 8px;
            }

            .step-item {
              padding: 0;
              display: block;
            }

            .step-item:not(:last-child)::after {
              display: none;
            }

            .step-copy {
              display: none;
            }

            .step-number {
              margin: 0 auto;
            }

            .progress-heading {
              margin-bottom: 20px;
            }

            .progress-heading p {
              max-width: 600px;
            }
          }

          @media (max-width: 640px) {
            .company-onboarding-page {
              padding: 16px 12px 35px;
            }

            .onboarding-header {
              padding: 14px;
              border-radius: 14px;
            }

            .brand-divider,
            .brand-copy,
            .secure-pill {
              display: none;
            }

            .brand-logo {
              width: 135px;
              height: 45px;
            }

            .onboarding-layout {
              gap: 14px;
            }

            .progress-panel {
              border-radius: 14px;
              padding: 18px;
            }

            .progress-heading h1 {
              font-size: 20px;
            }

            .step-list {
              grid-template-columns: repeat(5, 1fr);
            }

            .form-panel {
              padding: 20px 16px;
              border-radius: 14px;
            }

            .form-panel-header {
              margin-bottom: 19px;
              padding-bottom: 17px;
            }

            .form-title {
              font-size: 20px;
            }

            .field-grid,
            .verification-summary {
              grid-template-columns: 1fr;
            }

            .mobile-progress {
              display: block;
              margin-bottom: 20px;
            }

            .mobile-progress-top {
              display: flex;
              justify-content: space-between;
              color: #1E92D2;
              font-size: 9px;
              font-weight: 800;
              margin-bottom: 6px;
            }

            .mobile-progress-track {
              height: 5px;
              border-radius: 99px;
              overflow: hidden;
              background: #E6EEF2;
            }

            .mobile-progress-fill {
              height: 100%;
              background: #FFAD01;
              transition: width 0.25s ease;
            }

            .watermark-city {
              display: none;
            }

            .watermark-word {
              right: -45px;
              bottom: 15px;
              font-size: 80px;
            }
          }
        `}
      </style>

      <div className="onboarding-watermark watermark-word">
        TRUCITY
      </div>

      <div className="onboarding-watermark watermark-city">
        {Array.from({ length: 12 }).map((_, index) => (
          <span key={index} />
        ))}
      </div>

      <div className="onboarding-container">
        <header className="onboarding-header">
          <div className="brand-area">
            <img
              src={logo}
              alt="TruCity"
              className="brand-logo"
            />

            <div className="brand-divider" />

            <div className="brand-copy">
              <p className="brand-title">
                Company Onboarding
              </p>

              <p className="brand-subtitle">
                VERIFY • CONNECT • PERSUE
              </p>
            </div>
          </div>

          <div className="secure-pill">
            <span className="secure-dot" />
            Secure company registration
          </div>
        </header>

        <div className="onboarding-layout">
          <aside className="progress-panel">
            <div className="progress-heading">
              <p className="progress-heading-label">
                Employer setup
              </p>

              <h1>
                Build your
                <br />
                company profile
              </h1>

              <p>
                Complete your company information so TruCity
                can verify your organisation and connect you
                with skilled professionals.
              </p>
            </div>

            <div className="step-list">
              {STEPS.map((step) => {
                const isActive =
                  currentStep === step.number;

                const isCompleted =
                  currentStep > step.number;

                return (
                  <div
                    key={step.number}
                    className={`step-item ${
                      isActive ? 'active' : ''
                    } ${
                      isCompleted ? 'completed' : ''
                    }`}
                  >
                    <div className="step-number">
                      {isCompleted
                        ? '✓'
                        : step.number}
                    </div>

                    <div className="step-copy">
                      <strong>{step.title}</strong>
                      <span>{step.description}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="progress-footer">
              TruCity verified employer onboarding
            </div>
          </aside>

          <main className="form-panel">
            <div className="mobile-progress">
              <div className="mobile-progress-top">
                <span>
                  STEP {currentStep} OF {totalSteps}
                </span>

                <span>
                  {Math.round(progressPercentage)}%
                </span>
              </div>

              <div className="mobile-progress-track">
                <div
                  className="mobile-progress-fill"
                  style={{
                    width: `${progressPercentage}%`,
                  }}
                />
              </div>
            </div>

            <div className="form-panel-header">
              <div>
                <p className="form-eyebrow">
                  Company registration
                </p>

                <h2 className="form-title">
                  {STEPS[currentStep - 1].title}
                </h2>

                <p className="form-description">
                  {STEPS[currentStep - 1].description}
                </p>
              </div>
            </div>

            {errorMessage && (
              <div
                className="error-box"
                role="alert"
              >
                {errorMessage}
              </div>
            )}

            <form
              onSubmit={handleNext}
              className="form-content"
            >
              {/* STEP 1 */}
              {currentStep === 1 && (
                <>
                  <div className="field">
                    <label className="field-label">
                      Legal Company Name *
                      <span>
                        helps us verify your company quickly
                      </span>
                    </label>

                    <input
                      type="text"
                      required
                      className="field-input"
                      placeholder="Official registered legal name"
                      value={formData.legalName}
                      onChange={(e) =>
                        updateField(
                          'legalName',
                          e.target.value,
                        )
                      }
                    />
                  </div>

                  <div className="field">
                    <label className="field-label">
                      Trading Name
                      <span>Optional</span>
                    </label>

                    <input
                      type="text"
                      className="field-input"
                      placeholder="Public operating name if different"
                      value={formData.tradingName}
                      onChange={(e) =>
                        updateField(
                          'tradingName',
                          e.target.value,
                        )
                      }
                    />
                  </div>

                  <div className="field-grid">
                    <div className="field">
                      <label className="field-label">
                        Company CIPC *
                      </label>

                      <input
                        type="text"
                        required
                        className="field-input"
                        placeholder="2023/123456/07"
                        value={formData.companyRegNo}
                        onChange={(e) =>
                          updateField(
                            'companyRegNo',
                            e.target.value,
                          )
                        }
                      />
                    </div>

                    <div className="field">
                      <label className="field-label">
                        Website URL *
                      </label>

                      <input
                        type="url"
                        required
                        className="field-input"
                        placeholder="https://company.com"
                        value={formData.website}
                        onChange={(e) =>
                          updateField(
                            'website',
                            e.target.value,
                          )
                        }
                      />
                    </div>
                  </div>

                  <div className="field-grid">
                    <div className="field">
                      <label className="field-label">
                        Region *
                      </label>

                      <select
                        className="field-select"
                        value={formData.region}
                        onChange={(e) =>
                          updateField(
                            'region',
                            e.target.value,
                          )
                        }
                      >
                        <option value="Gauteng">
                          Gauteng
                        </option>
                        <option value="Western Cape">
                          Western Cape
                        </option>
                        <option value="KwaZulu-Natal">
                          KwaZulu-Natal
                        </option>
                        <option value="Eastern Cape">
                          Eastern Cape
                        </option>
                        <option value="Free State">
                          Free State
                        </option>
                        <option value="Limpopo">
                          Limpopo
                        </option>
                        <option value="Mpumalanga">
                          Mpumalanga
                        </option>
                        <option value="North West">
                          North West
                        </option>
                        <option value="Northern Cape">
                          Northern Cape
                        </option>
                      </select>
                    </div>

                    <div className="field">
                      <label className="field-label">
                        Industry *
                      </label>

                      <select
                        className="field-select"
                        value={formData.industry}
                        onChange={(e) =>
                          updateField(
                            'industry',
                            e.target.value,
                          )
                        }
                      >
                        <option value="Technology">
                          Technology
                        </option>
                        <option value="Finance">
                          Finance
                        </option>
                        <option value="Healthcare">
                          Healthcare
                        </option>
                        <option value="Retail">
                          Retail
                        </option>
                        <option value="Construction">
                          Construction
                        </option>
                        <option value="Education">
                          Education
                        </option>
                        <option value="Manufacturing">
                          Manufacturing
                        </option>
                        <option value="Professional Services">
                          Professional Services
                        </option>
                        <option value="Other">
                          Other
                        </option>
                      </select>
                    </div>
                  </div>

                  <div className="field">
                    <label className="field-label">
                      Registered Address *
                    </label>

                    <textarea
                      required
                      rows={2}
                      className="field-textarea"
                      placeholder="Full physical corporate address"
                      value={formData.registeredAddress}
                      onChange={(e) =>
                        updateField(
                          'registeredAddress',
                          e.target.value,
                        )
                      }
                    />
                  </div>
                </>
              )}

              {/* STEP 2 */}
              {currentStep === 2 && (
                <>
                  <div className="field-grid">
                    <div className="field">
                      <label className="field-label">
                        Company Email *
                      </label>

                      <input
                        type="email"
                        required
                        className="field-input"
                        placeholder="info@company.com"
                        value={formData.companyEmail}
                        onChange={(e) =>
                          updateField(
                            'companyEmail',
                            e.target.value,
                          )
                        }
                      />
                    </div>

                    <div className="field">
                      <label className="field-label">
                        Phone Number *
                      </label>

                      <input
                        type="tel"
                        required
                        className="field-input"
                        placeholder="+27 11 000 0000"
                        value={formData.phone}
                        onChange={(e) =>
                          updateField(
                            'phone',
                            e.target.value,
                          )
                        }
                      />
                    </div>
                  </div>

                  <div className="field-grid">
                    <div className="field">
                      <label className="field-label">
                        Company Size *
                      </label>

                      <select
                        className="field-select"
                        value={formData.companySize}
                        onChange={(e) =>
                          updateField(
                            'companySize',
                            e.target.value,
                          )
                        }
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

                    <div className="field">
                      <label className="field-label">
                        Social Links
                        <span>Optional</span>
                      </label>

                      <input
                        type="text"
                        className="field-input"
                        placeholder="LinkedIn, X, Facebook..."
                        value={formData.socialLinks}
                        onChange={(e) =>
                          updateField(
                            'socialLinks',
                            e.target.value,
                          )
                        }
                      />
                    </div>
                  </div>

                  <div className="field">
                    <label className="field-label">
                      Company Logo *
                    </label>

                    <div className="file-field">
                      <input
                        type="file"
                        required={!formData.logo}
                        accept="image/png, image/jpeg"
                        className="file-input"
                        onChange={(e) =>
                          handleFileChange(
                            'logo',
                            e.target.files?.[0] ?? null,
                          )
                        }
                      />

                      {formData.logo && (
                        <p className="selected-file">
                          Selected: {formData.logo.name}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="field">
                    <label className="field-label">
                      Company Description *
                    </label>

                    <textarea
                      required
                      rows={4}
                      maxLength={400}
                      className="field-textarea"
                      placeholder="Short business summary (max 400 characters)..."
                      value={formData.companyDescription}
                      onChange={handleDescriptionChange}
                    />

                    <div className="character-count">
                      {formData.companyDescription.length}
                      /400
                    </div>
                  </div>
                </>
              )}

              {/* STEP 3 */}
              {currentStep === 3 && (
                <>
                  <div className="field-grid">
                    <div className="field">
                      <label className="field-label">
                        Rep Full Name *
                      </label>

                      <input
                        type="text"
                        required
                        className="field-input"
                        placeholder="Authorised full name"
                        value={formData.repFullName}
                        onChange={(e) =>
                          updateField(
                            'repFullName',
                            e.target.value,
                          )
                        }
                      />
                    </div>

                    <div className="field">
                      <label className="field-label">
                        Rep Title / Position *
                      </label>

                      <input
                        type="text"
                        required
                        className="field-input"
                        placeholder="e.g. Director"
                        value={formData.repTitle}
                        onChange={(e) =>
                          updateField(
                            'repTitle',
                            e.target.value,
                          )
                        }
                      />
                    </div>
                  </div>

                  <div className="field-grid">
                    <div className="field">
                      <label className="field-label">
                        Rep Email *
                      </label>

                      <input
                        type="email"
                        required
                        className="field-input"
                        placeholder="representative@company.com"
                        value={formData.repEmail}
                        onChange={(e) =>
                          updateField(
                            'repEmail',
                            e.target.value,
                          )
                        }
                      />
                    </div>

                    <div className="field">
                      <label className="field-label">
                        Rep Phone *
                      </label>

                      <input
                        type="tel"
                        required
                        className="field-input"
                        placeholder="+27 82 000 0000"
                        value={formData.repPhone}
                        onChange={(e) =>
                          updateField(
                            'repPhone',
                            e.target.value,
                          )
                        }
                      />
                    </div>
                  </div>

                  <div className="field-grid">
                    <div className="field">
                      <label className="field-label">
                        ID Type *
                      </label>

                      <select
                        className="field-select"
                        value={formData.idType}
                        onChange={(e) =>
                          updateField(
                            'idType',
                            e.target.value as IdType,
                          )
                        }
                      >
                        <option value="National ID">
                          South African National ID
                        </option>
                        <option value="Passport">
                          Passport
                        </option>
                      </select>
                    </div>

                    <div className="field">
                      <label className="field-label">
                        ID / Passport Number *
                      </label>

                      <input
                        type="text"
                        required
                        className="field-input"
                        placeholder="Document number"
                        value={formData.idNumber}
                        onChange={(e) =>
                          updateField(
                            'idNumber',
                            e.target.value,
                          )
                        }
                      />
                    </div>
                  </div>

                  <div className="field">
                    <label className="field-label">
                      Representative ID Document *
                    </label>

                    <div className="file-field">
                      <input
                        type="file"
                        required={!formData.repIdPhoto}
                        accept="image/png, image/jpeg, application/pdf"
                        className="file-input"
                        onChange={(e) =>
                          handleFileChange(
                            'repIdPhoto',
                            e.target.files?.[0] ?? null,
                          )
                        }
                      />

                      {formData.repIdPhoto && (
                        <p className="selected-file">
                          Selected:{' '}
                          {formData.repIdPhoto.name}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="field">
                    <label className="field-label">
                      Proof of Authority *
                    </label>

                    <div className="file-field">
                      <input
                        type="file"
                        required={!formData.proofOfAuthority}
                        accept="image/png, image/jpeg, application/pdf"
                        className="file-input"
                        onChange={(e) =>
                          handleFileChange(
                            'proofOfAuthority',
                            e.target.files?.[0] ?? null,
                          )
                        }
                      />

                      {formData.proofOfAuthority && (
                        <p className="selected-file">
                          Selected:{' '}
                          {formData.proofOfAuthority.name}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="info-box">
                    Your representative information is used to
                    establish who is authorised to act on behalf
                    of the company.
                  </div>
                </>
              )}

              {/* STEP 4 */}
              {currentStep === 4 && (
                <>
                  <div className="verification-card">
                    <div
                      className={`verification-icon ${
                        verificationComplete
                          ? 'complete'
                          : isVerifying
                            ? 'loading'
                            : ''
                      }`}
                    >
                      {verificationComplete
                        ? '✓'
                        : isVerifying
                          ? '…'
                          : '✓'}
                    </div>

                    {!verificationComplete &&
                      !isVerifying && (
                        <>
                          <h3 className="verification-title">
                            Ready for preliminary verification
                          </h3>

                          <p className="verification-text">
                            TruCity will perform a preliminary
                            check using your CIPC registration
                            number and company information.
                          </p>

                          <button
                            type="button"
                            className="verification-button"
                            onClick={runVerification}
                          >
                            Run Verification Check
                          </button>
                        </>
                      )}

                    {isVerifying && (
                      <>
                        <h3 className="verification-title">
                          Checking company information...
                        </h3>

                        <p className="verification-text">
                          Checking registration number{' '}
                          <strong>
                            {formData.companyRegNo ||
                              'Pending'}
                          </strong>
                          .
                        </p>
                      </>
                    )}

                    {verificationComplete && (
                      <>
                        <h3 className="verification-title">
                          Verification check completed
                        </h3>

                        <p className="verification-text">
                          Your company information has passed
                          the preliminary verification step and
                          is ready for final submission.
                        </p>
                      </>
                    )}
                  </div>

                  <div className="verification-summary">
                    <div className="summary-card">
                      <div className="summary-label">
                        CIPC NUMBER
                      </div>

                      <div className="summary-value">
                        {formData.companyRegNo || 'Pending'}
                      </div>
                    </div>

                    <div className="summary-card">
                      <div className="summary-label">
                        STATUS
                      </div>

                      <div
                        className={`summary-value ${
                          verificationComplete
                            ? 'complete'
                            : 'pending'
                        }`}
                      >
                        {formData.verificationStatus}
                      </div>
                    </div>
                  </div>

                  <div className="info-box">
                    This is currently a preliminary/demo
                    verification step. The production CIPC
                    verification service can be connected later
                    without changing this onboarding interface.
                  </div>
                </>
              )}

              {/* STEP 5 */}
              {currentStep === 5 && (
                <>
                  <div className="field-grid">
                    <div className="field">
                      <label className="field-label">
                        Billing Contact Name *
                      </label>

                      <input
                        type="text"
                        required
                        className="field-input"
                        placeholder="Person responsible for invoices"
                        value={formData.billingName}
                        onChange={(e) =>
                          updateField(
                            'billingName',
                            e.target.value,
                          )
                        }
                      />
                    </div>

                    <div className="field">
                      <label className="field-label">
                        Billing Contact Email *
                      </label>

                      <input
                        type="email"
                        required
                        className="field-input"
                        placeholder="billing@company.com"
                        value={formData.billingEmail}
                        onChange={(e) =>
                          updateField(
                            'billingEmail',
                            e.target.value,
                          )
                        }
                      />
                    </div>
                  </div>

                  <div className="field">
                    <label className="field-label">
                      Invoicing Address *
                    </label>

                    <textarea
                      required
                      rows={2}
                      className="field-textarea"
                      placeholder="Official invoicing address"
                      value={formData.invoicingAddress}
                      onChange={(e) =>
                        updateField(
                          'invoicingAddress',
                          e.target.value,
                        )
                      }
                    />
                  </div>

                  <div className="field-grid">
                    <div className="field">
                      <label className="field-label">
                        Tax / VAT Number
                        <span>Optional</span>
                      </label>

                      <input
                        type="text"
                        className="field-input"
                        placeholder="Optional VAT number"
                        value={formData.taxVatNumber}
                        onChange={(e) =>
                          updateField(
                            'taxVatNumber',
                            e.target.value,
                          )
                        }
                      />
                    </div>

                    <div className="field">
                      <label className="field-label">
                        Payment Method *
                      </label>

                      <select
                        className="field-select"
                        value={formData.paymentMethod}
                        onChange={(e) =>
                          updateField(
                            'paymentMethod',
                            e.target
                              .value as PaymentMethod,
                          )
                        }
                      >
                        <option value="Paystack">
                          Paystack
                        </option>
                        <option value="Invoice">
                          Invoice
                        </option>
                      </select>
                    </div>
                  </div>

                  <div className="terms-row">
                    <input
                      type="checkbox"
                      id="final-terms"
                      required
                      checked={formData.agreeTerms}
                      onChange={(e) =>
                        updateField(
                          'agreeTerms',
                          e.target.checked,
                        )
                      }
                    />

                    <label htmlFor="final-terms">
                      I agree to the{' '}
                      <strong>
                        Terms of Service
                      </strong>{' '}
                      and{' '}
                      <strong>
                        Privacy Policy
                      </strong>{' '}
                      *
                    </label>
                  </div>

                  <div className="info-box">
                    Your company profile will be submitted for
                    verification after you complete this step.
                    Payment processing is not performed by this
                    onboarding form.
                  </div>
                </>
              )}

              <div className="form-actions">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    className="back-button"
                    onClick={handlePrev}
                  >
                    ← Back
                  </button>
                ) : (
                  <span />
                )}

                <button
                  type="submit"
                  className="next-button"
                  disabled={
                    currentStep === 4 &&
                    (!verificationComplete ||
                      isVerifying)
                  }
                >
                  {currentStep === totalSteps
                    ? 'Complete & Finish →'
                    : 'Save & Continue →'}
                </button>
              </div>
            </form>
          </main>
        </div>
      </div>
    </div>
  );
};

export default CompanyOnboarding;