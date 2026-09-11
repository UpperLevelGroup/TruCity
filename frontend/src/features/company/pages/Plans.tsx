import React, { useState } from 'react';

interface Plan {
  id: string;
  name: string;
  price: string;
  cadence: string;
  features: string[];
}

type PaymentMethod = 'card' | 'paypal';

const subscriptionPlans: Plan[] = [
  {
    id: 'growth',
    name: 'Growth Recruiter',
    price: 'R299,99',
    cadence: 'per month',
    features: [
      'Up to 25 verified candidate views/mo',
      'Direct candidate messaging',
      'Standard CIPC verification checks',
      'Email support',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise Verified',
    price: 'R499,99',
    cadence: 'per month',
    features: [
      'Unlimited verified candidate access',
      'Advanced background screening tools',
      'Automated CIPC and compliance reporting',
      'Priority 24/7 dedicated support',
    ],
  },
];

export default function Plans() {
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardHolder, setCardHolder] = useState('');

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>('card');

  const [isProcessing, setIsProcessing] = useState(false);

  const resetCheckout = () => {
    setSelectedPlan(null);
    setIsSuccess(false);
    setIsProcessing(false);

    /*
     * Clear sensitive payment form fields.
     *
     * These values are intentionally never stored in localStorage.
     */
    setCardNumber('');
    setExpiry('');
    setCvv('');
    setCardHolder('');
    setPaymentMethod('card');
  };

  const handleSelectPlan = (plan: Plan) => {
    setSelectedPlan(plan);
    setIsSuccess(false);
    setPaymentMethod('card');
  };

  const handleCheckout = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!selectedPlan) {
      return;
    }

    /*
     * This is intentionally a local/demo checkout.
     *
     * We are NOT processing real payments yet.
     * Real payment processing will later be handled by the
     * backend/payment provider.
     */
    setIsProcessing(true);

    window.setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
    }, 700);
  };

  const handleCardNumberChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const digitsOnly = event.target.value
      .replace(/\D/g, '')
      .slice(0, 16);

    const formatted = digitsOnly.replace(
      /(\d{4})(?=\d)/g,
      '$1 '
    );

    setCardNumber(formatted);
  };

  const handleExpiryChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const digitsOnly = event.target.value
      .replace(/\D/g, '')
      .slice(0, 4);

    let formatted = digitsOnly;

    if (digitsOnly.length > 2) {
      formatted = `${digitsOnly.slice(0, 2)}/${digitsOnly.slice(2)}`;
    }

    setExpiry(formatted);
  };

  const handleCvvChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCvv(
      event.target.value
        .replace(/\D/g, '')
        .slice(0, 4)
    );
  };

  return (
    <div
      className="min-h-screen flex flex-col justify-between bg-white overflow-x-hidden relative"
      style={{
        color: '#003366',
        fontFamily:
          'Inter, system-ui, -apple-system, sans-serif',
      }}
    >
      {/* SkyBlue Ambient Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-1/4 left-1/4 w-[800px] h-[800px] bg-sky-400/10 rounded-full blur-[180px]" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 p-6 lg:p-12 w-full max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <h1
            className="text-3xl font-extrabold tracking-tight mb-1"
            style={{
              color: '#003366',
              letterSpacing: '-0.02em',
            }}
          >
            Plans & Billing
          </h1>

          <p
            className="text-sm font-medium"
            style={{ color: '#475569' }}
          >
            Select a subscription tier to unlock full
            enterprise recruitment features.
          </p>
        </header>

        {/* PLAN SELECTION */}
        {!selectedPlan ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {subscriptionPlans.map((plan) => (
              <div
                key={plan.id}
                className="bg-white rounded-2xl p-8 border border-slate-200 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow"
              >
                <div>
                  <h3
                    className="text-2xl font-extrabold mb-2"
                    style={{ color: '#003366' }}
                  >
                    {plan.name}
                  </h3>

                  <div className="flex items-baseline gap-1.5 mb-6">
                    <span
                      className="text-4xl font-black"
                      style={{ color: '#003366' }}
                    >
                      {plan.price}
                    </span>

                    <span
                      className="text-sm font-semibold"
                      style={{ color: '#475569' }}
                    >
                      {plan.cadence}
                    </span>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="text-base font-medium flex items-center gap-3"
                        style={{ color: '#003366' }}
                      >
                        <span
                          className="font-bold"
                          style={{ color: '#003366' }}
                        >
                          ✓
                        </span>

                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  type="button"
                  className="w-full py-4 text-white rounded-xl font-bold text-base transition-colors shadow-sm cursor-pointer"
                  style={{
                    backgroundColor: '#003366',
                    boxShadow:
                      '0 2px 4px rgba(0, 51, 102, 0.2)',
                  }}
                  onClick={() => handleSelectPlan(plan)}
                >
                  Choose {plan.name}
                </button>
              </div>
            ))}
          </div>
        ) : isSuccess ? (
          /* SUCCESS */
          <div className="bg-white rounded-2xl p-10 border border-slate-200 text-center max-w-xl mx-auto shadow-sm">
            <div className="text-6xl mb-4">🎉</div>

            <h2
              className="text-2xl font-extrabold mb-2"
              style={{ color: '#003366' }}
            >
              Subscription Activated!
            </h2>

            <p
              className="text-base font-medium leading-relaxed mb-6"
              style={{ color: '#475569' }}
            >
              Your payment for the{' '}
              <strong
                className="font-bold"
                style={{ color: '#003366' }}
              >
                {selectedPlan.name}
              </strong>{' '}
              plan was successfully processed. Your
              workspace is now fully upgraded.
            </p>

            <button
              type="button"
              className="w-full py-3.5 text-white rounded-xl font-bold text-base transition-colors cursor-pointer"
              style={{
                backgroundColor: '#003366',
                boxShadow:
                  '0 2px 4px rgba(0, 51, 102, 0.2)',
              }}
              onClick={resetCheckout}
            >
              Return to Plans
            </button>
          </div>
        ) : (
          /* CHECKOUT */
          <div className="bg-white rounded-2xl p-8 border border-slate-200 max-w-xl mx-auto shadow-sm">
            {/* Checkout Header */}
            <div className="flex justify-between items-center mb-4 gap-4">
              <h3
                className="text-xl font-bold m-0"
                style={{ color: '#003366' }}
              >
                Complete Your Subscription
              </h3>

              <button
                type="button"
                className="bg-transparent border-none text-sm font-semibold cursor-pointer whitespace-nowrap"
                style={{ color: '#003366' }}
                onClick={() => setSelectedPlan(null)}
              >
                ← Back to Plans
              </button>
            </div>

            {/* Selected Plan */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 flex flex-col gap-0.5">
              <span
                className="text-xs font-semibold"
                style={{ color: '#475569' }}
              >
                Selected Plan:
              </span>

              <strong
                className="text-base font-bold"
                style={{ color: '#003366' }}
              >
                {selectedPlan.name} ({selectedPlan.price}{' '}
                {selectedPlan.cadence})
              </strong>
            </div>

            {/* Demo Payment Notice */}
            <div
              className="mb-6 rounded-xl p-4 border"
              style={{
                backgroundColor: '#fffbeb',
                borderColor: '#fde68a',
              }}
            >
              <p
                className="m-0 text-xs font-medium leading-relaxed"
                style={{ color: '#92400e' }}
              >
                <strong>Demo checkout:</strong> payment
                processing is not connected yet. Do not
                enter real card details.
              </p>
            </div>

            <form
              onSubmit={handleCheckout}
              className="flex flex-col gap-5"
            >
              {/* CARD */}
              <div
                className={`border rounded-xl p-5 cursor-pointer transition-all ${
                  paymentMethod === 'card'
                    ? 'border-[#003366] bg-slate-50/80'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
                onClick={() => setPaymentMethod('card')}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'card'}
                      onChange={() =>
                        setPaymentMethod('card')
                      }
                      className="w-4 h-4 cursor-pointer"
                      style={{ accentColor: '#003366' }}
                    />

                    <span
                      className="text-base font-bold"
                      style={{ color: '#003366' }}
                    >
                      Credit / Debit Card
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="bg-[#1A1F71] text-white text-[10px] font-black italic tracking-wide px-2 py-0.5 rounded shadow-xs flex items-center h-[20px]">
                      VISA
                    </div>

                    <div className="bg-slate-100 border border-slate-200 rounded px-1.5 flex items-center relative h-[20px] w-[30px]">
                      <span className="w-3 h-3 rounded-full bg-[#eb001b] absolute left-1 opacity-90" />
                      <span className="w-3 h-3 rounded-full bg-[#f79e1b] absolute right-1 opacity-90" />
                    </div>
                  </div>
                </div>

                {paymentMethod === 'card' && (
                  <div
                    className="mt-4 pt-4 border-t border-slate-200 flex flex-col gap-4"
                    onClick={(event) =>
                      event.stopPropagation()
                    }
                  >
                    {/* Card Number */}
                    <div className="flex flex-col gap-1.5">
                      <label
                        className="text-xs font-bold"
                        style={{ color: '#003366' }}
                      >
                        Card Number
                      </label>

                      <div className="flex items-center bg-white rounded-xl border border-slate-300 pr-3 focus-within:border-[#003366]">
                        <input
                          type="text"
                          inputMode="numeric"
                          autoComplete="off"
                          placeholder="4000 1234 5678 9010"
                          value={cardNumber}
                          onChange={handleCardNumberChange}
                          className="flex-1 p-3 border-none text-base outline-none bg-transparent font-medium"
                          style={{ color: '#003366' }}
                          maxLength={19}
                          required={paymentMethod === 'card'}
                        />

                        <span className="text-sm text-slate-400">
                          🔒
                        </span>
                      </div>
                    </div>

                    {/* Card Holder */}
                    <div className="flex flex-col gap-1.5">
                      <label
                        className="text-xs font-bold"
                        style={{ color: '#003366' }}
                      >
                        Name on Card
                      </label>

                      <input
                        type="text"
                        autoComplete="off"
                        placeholder="e.g. John Smith"
                        value={cardHolder}
                        onChange={(event) =>
                          setCardHolder(event.target.value)
                        }
                        className="p-3 rounded-xl border border-slate-300 text-base outline-none bg-white font-medium"
                        style={{ color: '#003366' }}
                        required={paymentMethod === 'card'}
                      />
                    </div>

                    {/* Expiry / CVV */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label
                          className="text-xs font-bold"
                          style={{ color: '#003366' }}
                        >
                          Expiry Date
                        </label>

                        <input
                          type="text"
                          inputMode="numeric"
                          autoComplete="off"
                          placeholder="MM/YY"
                          value={expiry}
                          onChange={handleExpiryChange}
                          className="p-3 rounded-xl border border-slate-300 text-base outline-none bg-white font-medium"
                          style={{ color: '#003366' }}
                          maxLength={5}
                          required={paymentMethod === 'card'}
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label
                          className="text-xs font-bold"
                          style={{ color: '#003366' }}
                        >
                          CVC / CVV
                        </label>

                        <input
                          type="password"
                          inputMode="numeric"
                          autoComplete="off"
                          placeholder="123"
                          value={cvv}
                          onChange={handleCvvChange}
                          className="p-3 border-none text-base outline-none bg-transparent font-medium"
                          style={{ color: '#003366' }}
                          maxLength={4}
                          required={paymentMethod === 'card'}
                        />
                      </div>
                    </div>

                    {/* Save Card */}
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="checkbox"
                        id="saveCard"
                        className="w-4 h-4 cursor-pointer"
                        style={{ accentColor: '#003366' }}
                      />

                      <label
                        htmlFor="saveCard"
                        className="text-xs font-medium cursor-pointer"
                        style={{ color: '#475569' }}
                      >
                        Save this card for future
                        transactions
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* PAYPAL */}
              <div
                className={`border rounded-xl p-5 cursor-pointer transition-all ${
                  paymentMethod === 'paypal'
                    ? 'border-[#003366] bg-slate-50/80'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
                onClick={() => setPaymentMethod('paypal')}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'paypal'}
                      onChange={() =>
                        setPaymentMethod('paypal')
                      }
                      className="w-4 h-4 cursor-pointer"
                      style={{ accentColor: '#003366' }}
                    />

                    <div className="text-sm font-black tracking-tight italic flex items-center">
                      <span className="text-[#253b80]">
                        Pay
                      </span>

                      <span className="text-[#179bd7]">
                        Pal
                      </span>
                    </div>
                  </div>
                </div>

                {paymentMethod === 'paypal' && (
                  <div className="mt-3 pt-3 border-t border-slate-200">
                    <p
                      className="text-sm font-medium m-0 leading-normal"
                      style={{ color: '#475569' }}
                    >
                      A real PayPal redirect will be
                      connected here when billing is
                      integrated. For now this is a demo
                      checkout.
                    </p>
                  </div>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isProcessing}
                className="mt-2 w-full py-4 text-white rounded-xl font-extrabold text-base transition-colors shadow-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: '#003366',
                  boxShadow:
                    '0 2px 4px rgba(0, 51, 102, 0.2)',
                }}
              >
                {isProcessing
                  ? 'Processing...'
                  : `Place Order (${selectedPlan.price})`}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-200 bg-white">
        <div
          className="max-w-6xl mx-auto px-6 lg:px-12 py-5 text-center text-xs font-medium"
          style={{ color: '#64748b' }}
        >
          © {new Date().getFullYear()}{' '}
          <span
            className="font-semibold"
            style={{ color: '#003366' }}
          >
            UpperLevel Group
          </span>
          . All rights reserved.
        </div>
      </footer>
    </div>
  );
}