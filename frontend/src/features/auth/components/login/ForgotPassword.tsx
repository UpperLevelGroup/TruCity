import { Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

import { useForgotPassword } from "../../useForgotPassword";
import AuthShell from "../../../../components/auth/AuthShell";

export default function ForgotPassword() {
  const {
    email,
    setEmail,
    submitted,
    handleSubmit,
  } = useForgotPassword();

  return (
    <AuthShell
     title="Reset your password."
     body={
     <>
       Enter your email address to receive
       instructions for resetting your password.
      </>
      }
     >
      <div className="w-full max-w-[500px] rounded-3xl border border-slate-200 bg-white p-7 shadow-2xl sm:p-9">
        {!submitted ? (
          <>
            <div className="text-center">
              <h1
                className="!m-0 text-3xl font-black"
                style={{ color: "#FFAD01" }}
              >
                Reset your password
              </h1>

              <p className="mt-2 text-sm font-medium text-slate-600">
                Enter your account email and we&apos;ll send recovery
                instructions.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="mt-7 space-y-5"
            >
              <div>
                <label
                  htmlFor="reset-email"
                  className="mb-1.5 block text-sm font-extrabold"
                  style={{ color: "#00466D" }}
                >
                  Email Address
                </label>

                <input
                  id="reset-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full rounded-2xl border border-slate-200 bg-[#F8FCFF] px-4 py-3 text-sm font-medium text-[#00273D] outline-none transition-all placeholder:text-slate-400 focus:border-[#1E92D2] focus:ring-2 focus:ring-[#1E92D2]/20"
                />
              </div>

              <button
                type="submit"
                className="mx-auto flex min-h-[56px] w-full max-w-[190px] items-center justify-center rounded-2xl border-0 px-5 text-sm font-extrabold text-white cursor-pointer shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 focus-visible:outline-none focus-visible:ring-4"
                style={{
                  background:
                    "linear-gradient(90deg, #00466D 0%, #1E92D2 100%)",
                  boxShadow:
                    "0 8px 20px rgba(0, 70, 109, 0.18)",
                }}
              >
                Send Reset Link
              </button>
            </form>
          </>
        ) : (
          <div className="py-5 text-center">
            <div
              className="mx-auto grid h-14 w-14 place-items-center rounded-full text-white shadow-md"
              style={{
                background:
                  "linear-gradient(135deg, #1E92D2 0%, #00273D 100%)",
              }}
            >
              <CheckCircle2 className="h-7 w-7" />
            </div>

            <h2
              className="mt-4 text-2xl font-black"
              style={{ color: "#00466D" }}
            >
              Check your email
            </h2>

            <p className="mt-2 text-sm font-medium leading-relaxed text-slate-600">
              We&apos;ve sent password reset instructions to{" "}
              <strong className="text-[#00466D]">
                {email}
              </strong>
              .
            </p>
          </div>
        )}

        <div className="mt-7 border-t border-slate-200 pt-5 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-xs font-extrabold no-underline transition-colors hover:text-[#1E92D2]"
            style={{ color: "#00466D" }}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Sign In
          </Link>
        </div>
      </div>
    </AuthShell>
  );
}
