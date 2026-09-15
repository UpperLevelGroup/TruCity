import { useState } from 'react';

import {
  ArrowRight,
  Building2,
  CheckCircle2,
  CreditCard,
  Landmark,
  LockKeyhole,
  ShieldCheck,
  Smartphone,
  Sparkles,
  WalletCards,
} from 'lucide-react';

import type { LucideIcon } from 'lucide-react';
import { useChoosePlan } from './plans/useChoosePlan';
import AuthShell from '../../../components/auth/AuthShell';

/* =========================================================
   TYPES
========================================================= */

type PaymentMethod =
  | 'card'
  | 'eft'
  | 'apple-pay'
  | 'google-pay'
  | 'bank-transfer';

interface PaymentForm {
  cardholderName: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
}

interface PaymentErrors {
  cardholderName?: string;
  cardNumber?: string;
  expiry?: string;
  cvv?: string;
}

interface PaymentMethodOption {
  id: PaymentMethod;
  name: string;
  description: string;
  icon: LucideIcon;
}

/* =========================================================
   PAYMENT METHODS
========================================================= */

const PAYMENT_METHODS: PaymentMethodOption[] = [
  {
    id: 'card',
    name: 'Card',
    description: 'Visa or Mastercard',
    icon: CreditCard,
  },
  {
    id: 'eft',
    name: 'Instant EFT',
    description: 'Pay securely from your bank',
    icon: Landmark,
  },
  {
    id: 'apple-pay',
    name: 'Apple Pay',
    description: 'Fast wallet checkout',
    icon: Smartphone,
  },
  {
    id: 'google-pay',
    name: 'Google Pay',
    description: 'Pay using your Google Wallet',
    icon: WalletCards,
  },
  {
    id: 'bank-transfer',
    name: 'Bank Transfer',
    description: 'Manual EFT payment',
    icon: Building2,
  },
];

/* =========================================================
   HELPERS
========================================================= */

function formatCardNumber(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 19);

  return digits.replace(/(.{4})/g, '$1 ').trim();
}

function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 4);

  if (digits.length <= 2) {
    return digits;
  }

  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

function isValidExpiry(value: string) {
  if (!/^\d{2}\/\d{2}$/.test(value)) {
    return false;
  }

  const [monthText, yearText] = value.split('/');

  const month = Number(monthText);
  const year = Number(`20${yearText}`);

  if (month < 1 || month > 12) {
    return false;
  }

  const now = new Date();

  const expiryDate = new Date(
    year,
    month,
    0,
    23,
    59,
    59,
  );

  return expiryDate >= now;
}

/* =========================================================
   COMPONENT
========================================================= */

export default function ChoosePlan() {
  const {
    selectedPlan,
    setSelectedPlan,
    continueToFeed,
    PLANS,
  } = useChoosePlan();

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>('card');

  const [payment, setPayment] = useState<PaymentForm>({
    cardholderName: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
  });

  const [errors, setErrors] = useState<PaymentErrors>({});

  const [isProcessing, setIsProcessing] = useState(false);

  const [paymentComplete, setPaymentComplete] =
    useState(false);

  const selectedPlanDetails =
    PLANS.find((plan) => plan.id === selectedPlan) ?? null;

  const selectedPaymentMethod =
    PAYMENT_METHODS.find(
      (method) => method.id === paymentMethod,
    ) ?? PAYMENT_METHODS[0];

  /* =======================================================
     FORM
  ======================================================= */

  const updatePayment = (
    field: keyof PaymentForm,
    value: string,
  ) => {
    setPayment((current) => ({
      ...current,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((current) => ({
        ...current,
        [field]: undefined,
      }));
    }
  };

  const selectPaymentMethod = (method: PaymentMethod) => {
    setPaymentMethod(method);
    setErrors({});
    setPaymentComplete(false);
  };

  /* =======================================================
     CARD VALIDATION
  ======================================================= */

  const validateCard = () => {
    const nextErrors: PaymentErrors = {};

    if (!payment.cardholderName.trim()) {
      nextErrors.cardholderName =
        'Enter the name shown on the card.';
    }

    const cardDigits = payment.cardNumber.replace(/\D/g, '');

    if (
      cardDigits.length < 13 ||
      cardDigits.length > 19
    ) {
      nextErrors.cardNumber =
        'Enter a valid card number.';
    }

    if (!isValidExpiry(payment.expiry)) {
      nextErrors.expiry =
        'Enter a valid expiry date.';
    }

    if (!/^\d{3,4}$/.test(payment.cvv)) {
      nextErrors.cvv =
        'Enter a valid security code.';
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  /* =======================================================
     PAYMENT
  ======================================================= */

  const completeDemoPayment = async () => {
    setIsProcessing(true);

    /*
     * DEMO ONLY.
     *
     * Production:
     * 1. Create the transaction/subscription server-side.
     * 2. Redirect/open the payment provider where required.
     * 3. Verify the transaction server-side.
     * 4. Activate the candidate plan only after confirmation.
     */

    await new Promise<void>((resolve) => {
      window.setTimeout(resolve, 1500);
    });

    setIsProcessing(false);
    setPaymentComplete(true);

    window.setTimeout(() => {
      continueToFeed();
    }, 900);
  };

  const handlePayment = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!selectedPlanDetails) {
      return;
    }

    if (paymentMethod === 'card' && !validateCard()) {
      return;
    }

    /*
     * IMPORTANT:
     *
     * Raw card information must never be stored in:
     * - Supabase
     * - localStorage
     * - sessionStorage
     * - your own application database
     *
     * Replace this with secure provider tokenisation.
     */

    await completeDemoPayment();
  };

  /* =======================================================
     PAYMENT BUTTON LABEL
  ======================================================= */

  const getPaymentButtonLabel = () => {
    if (!selectedPlanDetails) {
      return 'Select a Plan';
    }

    switch (paymentMethod) {
      case 'card':
        return `Pay ${selectedPlanDetails.price}`;

      case 'eft':
        return `Continue to Instant EFT`;

      case 'apple-pay':
        return `Pay ${selectedPlanDetails.price} with Apple Pay`;

      case 'google-pay':
        return `Pay ${selectedPlanDetails.price} with Google Pay`;

      case 'bank-transfer':
        return 'Get Bank Details';

      default:
        return `Pay ${selectedPlanDetails.price}`;
    }
  };

  return (
    <AuthShell
  wide
  title="PLANS"
  body={
    <>
      <p>
        Select the verification plan that fits your
        career goals.
      </p>

      <p className="mt-7 font-semibold">
        Build trust. Unlock better opportunities.
      </p>
    </>
  }

    >
      <div
        className="
          w-full
          max-w-[1050px]
          rounded-[28px]
          border
          border-brand-border
          bg-white
          p-5
          shadow-[0_24px_60px_rgba(0,70,109,0.12)]
          sm:p-7
        "
      >
        {/* =================================================
            HEADER
        ================================================== */}

        <div className="mb-7 text-center">
          <div
            className="
              mx-auto
              mb-4
              flex
              w-fit
              items-center
              gap-2
              rounded-full
              border
              border-brand-border
              bg-brand-bg
              px-4
              py-2
              text-[10px]
              font-bold
              uppercase
              tracking-[0.16em]
              text-brand-primary
            "
          >
            <Sparkles className="h-4 w-4 text-brand-gold" />

            Candidate Plan
          </div>

          <h1
            className="
              !m-0
              text-3xl
              font-bold
              !text-brand-primary
            "
          >
            Choose Your Plan
          </h1>

          <p
            className="
              mx-auto
              mt-2
              max-w-[560px]
              text-sm
              leading-6
              text-brand-textMuted
            "
          >
            Choose your verification level and preferred
            payment method.
          </p>
        </div>

        {/* =================================================
            SIDE-BY-SIDE
        ================================================== */}

        <div
          className="
            grid
            gap-6
            lg:grid-cols-[0.9fr_1.1fr]
            lg:items-start
          "
        >
          {/* =================================================
              LEFT — PLANS
          ================================================== */}

          <section
            className="
              rounded-[22px]
              border
              border-brand-border
              bg-brand-bg
              p-5
            "
          >
            <SectionHeading
              number="1"
              title="Choose your plan"
              description="Select your verification level."
              active
            />

            <div className="mt-5 space-y-4">
              {PLANS.map((plan) => {
                const isSelected =
                  selectedPlan === plan.id;

                const Icon = plan.icon;

                return (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() =>
                      setSelectedPlan(plan.id)
                    }
                    aria-pressed={isSelected}
                    className={`
                      w-full
                      rounded-[18px]
                      border-2
                      bg-white
                      p-5
                      text-left
                      transition

                      ${
                        isSelected
                          ? `
                            border-brand-accent
                            shadow-[0_12px_30px_rgba(30,146,210,0.10)]
                          `
                          : `
                            border-brand-border
                            hover:border-brand-accent/50
                          `
                      }
                    `}
                  >
                    <div
                      className="
                        flex
                        items-start
                        justify-between
                        gap-3
                      "
                    >
                      <div className="flex min-w-0 gap-3">
                        <div
                          className={`
                            grid
                            h-11
                            w-11
                            shrink-0
                            place-items-center
                            rounded-[13px]
                            border

                            ${
                              isSelected
                                ? `
                                  border-brand-primary
                                  bg-brand-primary
                                  text-white
                                `
                                : `
                                  border-brand-border
                                  bg-brand-bg
                                  text-brand-primary
                                `
                            }
                          `}
                        >
                          <Icon className="h-5 w-5" />
                        </div>

                        <div>
                          <h3
                            className="
                              !m-0
                              text-sm
                              font-bold
                              leading-5
                              !text-brand-primary
                            "
                          >
                            {plan.name}
                          </h3>

                          <div
                            className="
                              mt-1
                              flex
                              items-baseline
                              gap-1
                            "
                          >
                            <span
                              className="
                                text-xl
                                font-bold
                                text-brand-primary
                              "
                            >
                              {plan.price}
                            </span>

                            <span
                              className="
                                text-xs
                                text-brand-textMuted
                              "
                            >
                              {plan.period}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div
                        className={`
                          grid
                          h-6
                          w-6
                          shrink-0
                          place-items-center
                          rounded-full
                          border

                          ${
                            isSelected
                              ? `
                                border-brand-accent
                                bg-brand-accent
                                text-white
                              `
                              : `
                                border-brand-border
                                bg-white
                              `
                          }
                        `}
                      >
                        {isSelected && (
                          <CheckCircle2 className="h-4 w-4" />
                        )}
                      </div>
                    </div>

                    <p
                      className="
                        mt-4
                        text-xs
                        leading-5
                        text-brand-textMuted
                      "
                    >
                      {plan.description}
                    </p>
                  </button>
                );
              })}
            </div>

            <div
              className="
                mt-4
                flex
                items-start
                gap-3
                rounded-[14px]
                border
                border-brand-border
                bg-white
                p-4
              "
            >
              <ShieldCheck
                className="
                  mt-0.5
                  h-4
                  w-4
                  shrink-0
                  text-brand-primary
                "
              />

              <div>
                <p
                  className="
                    text-[11px]
                    font-bold
                    text-brand-primary
                  "
                >
                  Monthly verification subscription
                </p>

                <p
                  className="
                    mt-1
                    text-[10px]
                    leading-4
                    text-brand-textMuted
                  "
                >
                  Your selected plan renews monthly until
                  cancelled.
                </p>
              </div>
            </div>
          </section>

          {/* =================================================
              RIGHT — PAYMENT
          ================================================== */}

          <section
            className="
              rounded-[22px]
              border
              border-brand-border
              bg-white
              p-5
              shadow-[0_12px_32px_rgba(0,70,109,0.06)]
            "
          >
            <SectionHeading
              number="2"
              title="Payment"
              description="Choose how you would like to pay."
              active={Boolean(selectedPlanDetails)}
            />

            {/* =============================================
                SUMMARY
            ============================================== */}

            {selectedPlanDetails ? (
              <div
                className="
                  mt-5
                  flex
                  items-center
                  justify-between
                  gap-4
                  rounded-[15px]
                  border
                  border-brand-border
                  bg-brand-bg
                  p-4
                "
              >
                <div>
                  <p
                    className="
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-[0.12em]
                      text-brand-textMuted
                    "
                  >
                    Selected plan
                  </p>

                  <p
                    className="
                      mt-1
                      text-xs
                      font-bold
                      text-brand-primary
                    "
                  >
                    {selectedPlanDetails.name}
                  </p>
                </div>

                <div className="shrink-0 text-right">
                  <span
                    className="
                      text-xl
                      font-bold
                      text-brand-primary
                    "
                  >
                    {selectedPlanDetails.price}
                  </span>

                  <span
                    className="
                      ml-1
                      text-[10px]
                      text-brand-textMuted
                    "
                  >
                    / month
                  </span>
                </div>
              </div>
            ) : (
              <div
                className="
                  mt-5
                  rounded-[15px]
                  border
                  border-dashed
                  border-brand-border
                  bg-brand-bg
                  p-4
                  text-center
                "
              >
                <p
                  className="
                    text-xs
                    font-bold
                    text-brand-primary
                  "
                >
                  Select a plan first
                </p>

                <p
                  className="
                    mt-1
                    text-[10px]
                    text-brand-textMuted
                  "
                >
                  Payment options will activate after you
                  choose a plan.
                </p>
              </div>
            )}

            {/* =============================================
                PAYMENT METHOD OPTIONS
            ============================================== */}

            <div className="mt-5">
              <p
                className="
                  mb-3
                  text-xs
                  font-bold
                  text-brand-primary
                "
              >
                Payment method
              </p>

              <div
                className="
                  grid
                  grid-cols-2
                  gap-2
                  sm:grid-cols-3
                "
              >
                {PAYMENT_METHODS.map((method) => {
                  const Icon = method.icon;

                  const selected =
                    paymentMethod === method.id;

                  return (
                    <button
                      key={method.id}
                      type="button"
                      disabled={!selectedPlanDetails}
                      onClick={() =>
                        selectPaymentMethod(method.id)
                      }
                      className={`
                        relative
                        min-h-[82px]
                        rounded-[14px]
                        border
                        p-3
                        text-left
                        transition
                        disabled:cursor-not-allowed
                        disabled:opacity-40

                        ${
                          selected
                            ? `
                              border-brand-accent
                              bg-brand-bg
                              ring-2
                              ring-brand-accent/10
                            `
                            : `
                              border-brand-border
                              bg-white
                              hover:border-brand-accent/50
                            `
                        }
                      `}
                    >
                      <div
                        className="
                          flex
                          items-start
                          justify-between
                          gap-2
                        "
                      >
                        <Icon
                          className={`
                            h-5
                            w-5

                            ${
                              selected
                                ? 'text-brand-primary'
                                : 'text-brand-textMuted'
                            }
                          `}
                        />

                        {selected && (
                          <CheckCircle2
                            className="
                              h-4
                              w-4
                              text-brand-accent
                            "
                          />
                        )}
                      </div>

                      <p
                        className="
                          mt-2
                          text-[11px]
                          font-bold
                          text-brand-primary
                        "
                      >
                        {method.name}
                      </p>

                      <p
                        className="
                          mt-0.5
                          text-[9px]
                          leading-3
                          text-brand-textMuted
                        "
                      >
                        {method.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* =============================================
                PAYMENT FORM
            ============================================== */}

            <form
              onSubmit={handlePayment}
              className="mt-5"
            >
              {/* ===========================================
                  CARD
              ============================================ */}

              {paymentMethod === 'card' && (
                <fieldset
                  disabled={
                    !selectedPlanDetails ||
                    isProcessing ||
                    paymentComplete
                  }
                  className="
                    space-y-4
                    disabled:opacity-50
                  "
                >
                  <PaymentField
                    id="cardholder-name"
                    label="Name on card"
                    value={payment.cardholderName}
                    placeholder="e.g. Luthando Ndlovu"
                    autoComplete="cc-name"
                    error={errors.cardholderName}
                    onChange={(value) =>
                      updatePayment(
                        'cardholderName',
                        value,
                      )
                    }
                  />

                  <div>
                    <label
                      htmlFor="card-number"
                      className="
                        mb-1.5
                        block
                        text-xs
                        font-bold
                        text-brand-primary
                      "
                    >
                      Card number
                    </label>

                    <div className="relative">
                      <CreditCard
                        className="
                          pointer-events-none
                          absolute
                          left-4
                          top-1/2
                          h-4
                          w-4
                          -translate-y-1/2
                          text-brand-textMuted
                        "
                      />

                      <input
                        id="card-number"
                        type="text"
                        inputMode="numeric"
                        autoComplete="cc-number"
                        value={payment.cardNumber}
                        onChange={(event) =>
                          updatePayment(
                            'cardNumber',
                            formatCardNumber(
                              event.target.value,
                            ),
                          )
                        }
                        placeholder="1234 5678 9012 3456"
                        className={`
                          min-h-[48px]
                          w-full
                          rounded-[13px]
                          border
                          bg-white
                          py-3
                          pl-11
                          pr-4
                          text-sm
                          text-brand-text
                          outline-none
                          transition
                          placeholder:text-brand-textMuted/50
                          focus:ring-4
                          focus:ring-brand-accent/10

                          ${
                            errors.cardNumber
                              ? `
                                border-brand-crimson
                                focus:border-brand-crimson
                              `
                              : `
                                border-brand-border
                                focus:border-brand-accent
                              `
                          }
                        `}
                      />
                    </div>

                    {errors.cardNumber && (
                      <p
                        className="
                          mt-1.5
                          text-[11px]
                          font-semibold
                          text-brand-crimson
                        "
                      >
                        {errors.cardNumber}
                      </p>
                    )}
                  </div>

                  <div
                    className="
                      grid
                      grid-cols-2
                      gap-3
                    "
                  >
                    <PaymentField
                      id="expiry"
                      label="Expiry date"
                      value={payment.expiry}
                      placeholder="MM/YY"
                      autoComplete="cc-exp"
                      inputMode="numeric"
                      error={errors.expiry}
                      onChange={(value) =>
                        updatePayment(
                          'expiry',
                          formatExpiry(value),
                        )
                      }
                    />

                    <PaymentField
                      id="cvv"
                      label="CVV"
                      value={payment.cvv}
                      placeholder="123"
                      autoComplete="cc-csc"
                      inputMode="numeric"
                      maxLength={4}
                      error={errors.cvv}
                      onChange={(value) =>
                        updatePayment(
                          'cvv',
                          value
                            .replace(/\D/g, '')
                            .slice(0, 4),
                        )
                      }
                    />
                  </div>
                </fieldset>
              )}

              {/* ===========================================
                  INSTANT EFT
              ============================================ */}

              {paymentMethod === 'eft' && (
                <PaymentInformationBox
                  icon={Landmark}
                  title="Instant EFT"
                  description="You will be redirected to a secure banking checkout where you can select your bank and authorise the payment."
                >
                  <div
                    className="
                      grid
                      grid-cols-3
                      gap-2
                    "
                  >
                    {[
                      'FNB',
                      'ABSA',
                      'Nedbank',
                      'Standard Bank',
                      'Capitec',
                      'Other Bank',
                    ].map((bank) => (
                      <div
                        key={bank}
                        className="
                          rounded-[10px]
                          border
                          border-brand-border
                          bg-white
                          px-2
                          py-2.5
                          text-center
                          text-[9px]
                          font-bold
                          text-brand-primary
                        "
                      >
                        {bank}
                      </div>
                    ))}
                  </div>
                </PaymentInformationBox>
              )}

              {/* ===========================================
                  APPLE PAY
              ============================================ */}

              {paymentMethod === 'apple-pay' && (
                <PaymentInformationBox
                  icon={Smartphone}
                  title="Apple Pay"
                  description="Use a supported card already saved in your Apple Wallet. The secure Apple Pay confirmation will open when you continue."
                />
              )}

              {/* ===========================================
                  GOOGLE PAY
              ============================================ */}

              {paymentMethod === 'google-pay' && (
                <PaymentInformationBox
                  icon={WalletCards}
                  title="Google Pay"
                  description="Use a supported payment method saved in your Google Wallet. You will confirm the payment through Google Pay."
                />
              )}

              {/* ===========================================
                  BANK TRANSFER
              ============================================ */}

              {paymentMethod === 'bank-transfer' && (
                <PaymentInformationBox
                  icon={Building2}
                  title="Manual Bank Transfer"
                  description="Use the payment reference below when making your EFT. Your subscription should only activate once the payment has been confirmed."
                >
                  <div
                    className="
                      space-y-2
                      rounded-[12px]
                      border
                      border-brand-border
                      bg-white
                      p-3
                    "
                  >
                    <BankDetail
                      label="Account name"
                      value="TruCity"
                    />

                    <BankDetail
                      label="Reference"
                      value="Generated at checkout"
                    />

                    <p
                      className="
                        pt-1
                        text-[9px]
                        leading-4
                        text-brand-textMuted
                      "
                    >
                      Production banking details should
                      come securely from your payment
                      provider or backend rather than
                      being hard-coded into this page.
                    </p>
                  </div>
                </PaymentInformationBox>
              )}

              {/* ===========================================
                  SECURITY
              ============================================ */}

              <div
                className="
                  mt-5
                  flex
                  items-start
                  gap-3
                  rounded-[14px]
                  border
                  border-brand-border
                  bg-brand-bg
                  p-3
                "
              >
                <LockKeyhole
                  className="
                    mt-0.5
                    h-4
                    w-4
                    shrink-0
                    text-brand-primary
                  "
                />

                <div>
                  <p
                    className="
                      text-[11px]
                      font-bold
                      text-brand-primary
                    "
                  >
                    Secure checkout
                  </p>

                  <p
                    className="
                      mt-0.5
                      text-[10px]
                      leading-4
                      text-brand-textMuted
                    "
                  >
                    Your payment is processed using your
                    selected payment method. TruCity should
                    not store raw card or banking
                    credentials.
                  </p>
                </div>
              </div>

              {/* ===========================================
                  BUTTON
              ============================================ */}

              <button
                type="submit"
                disabled={
                  !selectedPlanDetails ||
                  isProcessing ||
                  paymentComplete
                }
                className="
                  mt-5
                  flex
                  min-h-[50px]
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-[14px]
                  bg-brand-primary
                  px-5
                  text-sm
                  font-bold
                  text-white
                  shadow-[0_10px_24px_rgba(0,70,109,0.18)]
                  transition
                  hover:bg-brand-dark
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                {paymentComplete ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Payment Successful
                  </>
                ) : isProcessing ? (
                  <>
                    <span
                      className="
                        h-4
                        w-4
                        animate-spin
                        rounded-full
                        border-2
                        border-white/30
                        border-t-white
                      "
                    />

                    Processing...
                  </>
                ) : (
                  <>
                    <LockKeyhole className="h-4 w-4" />

                    {getPaymentButtonLabel()}

                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              {selectedPlanDetails && (
                <p
                  className="
                    mx-auto
                    mt-3
                    max-w-[360px]
                    text-center
                    text-[10px]
                    leading-4
                    text-brand-textMuted
                  "
                >
                  {paymentMethod === 'bank-transfer' ? (
                    <>
                      Your verification subscription will
                      activate after the payment is
                      confirmed.
                    </>
                  ) : (
                    <>
                      By continuing, you authorise a recurring
                      charge of{' '}

                      <strong className="text-brand-primary">
                        {selectedPlanDetails.price} per month
                      </strong>

                      {' '}until cancelled.
                    </>
                  )}
                </p>
              )}
            </form>
          </section>
        </div>
      </div>
    </AuthShell>
  );
}

/* =========================================================
   SECTION HEADING
========================================================= */

interface SectionHeadingProps {
  number: string;
  title: string;
  description: string;
  active: boolean;
}

function SectionHeading({
  number,
  title,
  description,
  active,
}: SectionHeadingProps) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`
          grid
          h-8
          w-8
          shrink-0
          place-items-center
          rounded-full
          text-xs
          font-bold

          ${
            active
              ? 'bg-brand-primary text-white'
              : 'bg-brand-border text-brand-textMuted'
          }
        `}
      >
        {number}
      </div>

      <div>
        <h2
          className="
            !m-0
            text-base
            font-bold
            !text-brand-primary
          "
        >
          {title}
        </h2>

        <p
          className="
            mt-0.5
            text-[11px]
            text-brand-textMuted
          "
        >
          {description}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   PAYMENT FIELD
========================================================= */

interface PaymentFieldProps {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  error?: string;
  autoComplete?: string;

  inputMode?:
    | 'text'
    | 'numeric'
    | 'decimal'
    | 'tel'
    | 'search'
    | 'email'
    | 'url'
    | 'none';

  maxLength?: number;
}

function PaymentField({
  id,
  label,
  value,
  placeholder,
  onChange,
  error,
  autoComplete,
  inputMode,
  maxLength,
}: PaymentFieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="
          mb-1.5
          block
          text-xs
          font-bold
          text-brand-primary
        "
      >
        {label}
      </label>

      <input
        id={id}
        type="text"
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        autoComplete={autoComplete}
        inputMode={inputMode}
        maxLength={maxLength}
        className={`
          min-h-[48px]
          w-full
          rounded-[13px]
          border
          bg-white
          px-4
          py-3
          text-sm
          text-brand-text
          outline-none
          transition
          placeholder:text-brand-textMuted/50
          focus:ring-4
          focus:ring-brand-accent/10

          ${
            error
              ? `
                border-brand-crimson
                focus:border-brand-crimson
              `
              : `
                border-brand-border
                focus:border-brand-accent
              `
          }
        `}
      />

      {error && (
        <p
          className="
            mt-1.5
            text-[11px]
            font-semibold
            text-brand-crimson
          "
        >
          {error}
        </p>
      )}
    </div>
  );
}

/* =========================================================
   PAYMENT INFORMATION BOX
========================================================= */

interface PaymentInformationBoxProps {
  icon: LucideIcon;
  title: string;
  description: string;
  children?: React.ReactNode;
}

function PaymentInformationBox({
  icon: Icon,
  title,
  description,
  children,
}: PaymentInformationBoxProps) {
  return (
    <div
      className="
        rounded-[16px]
        border
        border-brand-border
        bg-brand-bg
        p-4
      "
    >
      <div className="flex items-start gap-3">
        <div
          className="
            grid
            h-10
            w-10
            shrink-0
            place-items-center
            rounded-[12px]
            bg-brand-primary
            text-white
          "
        >
          <Icon className="h-4 w-4" />
        </div>

        <div>
          <h3
            className="
              !m-0
              text-xs
              font-bold
              !text-brand-primary
            "
          >
            {title}
          </h3>

          <p
            className="
              mt-1
              text-[10px]
              leading-4
              text-brand-textMuted
            "
          >
            {description}
          </p>
        </div>
      </div>

      {children && (
        <div className="mt-4">
          {children}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   BANK DETAIL
========================================================= */

function BankDetail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      className="
        flex
        items-center
        justify-between
        gap-4
        text-[10px]
      "
    >
      <span className="text-brand-textMuted">
        {label}
      </span>

      <span
        className="
          text-right
          font-bold
          text-brand-primary
        "
      >
        {value}
      </span>
    </div>
  );
}
