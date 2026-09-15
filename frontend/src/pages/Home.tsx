import { useNavigate, Link } from "react-router-dom";

interface HomepageProps {
  onLogin?: () => void;
  onSignUp?: () => void;
}

export default function Home({
  onLogin,
  onSignUp,
}: HomepageProps) {
  const navigate = useNavigate();

  const handleCreateAccount = () => {
    if (onSignUp) {
      onSignUp();
      return;
    }

    navigate("/register");
  };

  const handleSignIn = () => {
    if (onLogin) {
      onLogin();
      return;
    }

    navigate("/login");
  };

  return (
    <div
      className="min-h-screen flex flex-col bg-[#F8FCFF] overflow-x-hidden relative"
      style={{
        fontFamily:
          "Helvetica, Inter, system-ui, -apple-system, sans-serif",
      }}
    >
      {/* =========================================================
          BACKGROUND
          Same visual language as intern AuthPage
      ========================================================== */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {/* CITY WATERMARK */}
        <img
          src="/city-watermark.png"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover opacity-[0.12] mix-blend-overlay"
        />

        {/* =====================================================
            TOP LEFT DARK BLUE CIRCLE
        ====================================================== */}
        <div className="absolute top-[-8%] left-[-5%] w-[320px] h-[320px] rounded-full bg-[#00273D] overflow-hidden sm:w-[370px] sm:h-[370px] lg:w-[430px] lg:h-[430px]">
          <div className="absolute inset-0 rounded-full border border-[#FFAD01] translate-x-6 translate-y-6 scale-90" />
        </div>

        {/* =====================================================
            TOP RIGHT GOLD RING
        ====================================================== */}
        <div className="absolute top-[-10%] right-[-5%] w-[380px] h-[380px] rounded-full border-[65px] border-[#FFAD01] overflow-hidden sm:w-[410px] sm:h-[410px] lg:w-[495px] lg:h-[495px]">
          <div className="absolute inset-0 rounded-full border border-[#00273D]/40 -translate-x-8 -translate-y-8 scale-110" />
        </div>

        {/* =====================================================
            LARGE GOLD ORGANIC SHAPE
        ====================================================== */}
        <div className="absolute top-[-5%] left-[-10%] w-[950px] h-[750px] rounded-[50%_40%_60%_50%/60%_50%_50%_40%] bg-[#FFAD01] opacity-75 blur-[1px]" />

        {/* =====================================================
            LIGHT GOLD BUBBLE
        ====================================================== */}
        <div className="absolute top-[10%] right-[5%] w-[320px] h-[320px] rounded-full bg-[#FFD784] opacity-40 blur-2xl" />

        {/* =====================================================
            GOLD BUBBLE
        ====================================================== */}
        <div className="absolute top-[45%] right-[15%] w-[200px] h-[200px] rounded-full bg-[#FFAD01] opacity-55 blur-xl" />

        {/* =====================================================
            LOWER LEFT BLUE CIRCLE
        ====================================================== */}
        <div className="absolute top-[72%] left-[10%] w-[220px] h-[220px] rounded-full bg-[#1E92D2] shadow-xl overflow-hidden">
          <div className="absolute inset-0 rounded-full border border-[#FFAD01] -translate-x-6 -translate-y-6 scale-95" />
        </div>

        {/* =====================================================
            BOTTOM RIGHT DARK BLUE CIRCLE
        ====================================================== */}
        <div className="absolute bottom-[-8%] right-[-5%] w-[340px] h-[340px] rounded-full bg-[#00273D] overflow-hidden sm:w-[435px] sm:h-[435px] lg:w-[515px] lg:h-[515px]">
          <div className="absolute inset-0 rounded-full border border-[#FFAD01] -translate-x-8 -translate-y-8 scale-90" />
        </div>

        {/* =====================================================
            BOTTOM LEFT GOLD CIRCLE
        ====================================================== */}
        <div className="absolute bottom-[-10%] left-[-5%] w-[300px] h-[300px] rounded-full bg-[#FFAD01] sm:w-[410px] sm:h-[410px] lg:w-[495px] lg:h-[495px]" />

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-[120px] bg-gradient-to-t from-slate-200/50 to-transparent" />
      </div>

      {/* =========================================================
          HEADER
          Same header treatment as intern page
      ========================================================== */}
      <header className="relative z-20 px-6 lg:px-12 py-4 bg-white/90 backdrop-blur-md border-b border-slate-100 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-3 no-underline"
        >
          <img
            src="/Logo TruCity.png"
            alt="TruCity Logo"
            className="h-[60px] w-auto object-contain"
          />

          <div className="flex flex-col justify-center">
            <div className="text-[28px] font-[900] tracking-tight leading-[1.1]">
              <span className="text-[#f59e0b]">Tru</span>
              <span className="text-[#00466D]">City</span>
            </div>

            <div className="text-[8.5px] font-[800] text-[#00466D] tracking-[1.2px] mt-[2px] whitespace-nowrap">
              VERIFY • CONNECT • PERSUE
            </div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-[14px] font-medium text-[#00273D]">
          <Link
            to="/"
            className="no-underline border-b-2 border-[#FFAD01] pb-1 text-[#00273D]"
          >
            HOME
          </Link>

          <Link
            to="/login"
            className="no-underline text-[#00273D] hover:text-[#00466D] transition-colors"
          >
            SIGN IN
          </Link>

          <Link
            to="/register"
            className="no-underline text-[#00273D] hover:text-[#00466D] transition-colors"
          >
            GET STARTED
          </Link>
        </nav>
      </header>

      {/* =========================================================
          MAIN CONTENT
      ========================================================== */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-6 lg:px-12 py-12">
        <div className="w-full max-w-[1300px] flex flex-wrap items-center justify-between gap-12">

          {/* =====================================================
              LEFT — WELCOME MESSAGE
          ====================================================== */}
          <section className="flex-1 min-w-[320px] max-w-[610px] relative z-10">
            <div className="mb-5">
              <span
                className="inline-block px-6 py-2.5 rounded-full text-white font-bold text-sm shadow-md"
                style={{
                  background:
                    "linear-gradient(135deg, #1E92D2 0%, #00273D 100%)",
                }}
              >
                VERIFY • CONNECT • PERSUE
              </span>
            </div>

            <h1
              className="text-4xl sm:text-5xl lg:text-[58px] font-black leading-[1.05] tracking-tight mb-6"
              style={{ color: "#00466D" }}
            >
              CONNECTING
              <br />
              <span style={{ color: "#FFAD01" }}>
                TRUSTED
              </span>
              <br />
              TALENT.
            </h1>

            <p
              className="text-lg sm:text-xl font-bold leading-relaxed mb-5 max-w-[570px]"
              style={{ color: "#00466D" }}
            >
              TruCity connects skilled professionals with
              vetted employers, making job searches simpler,
              safer and more meaningful.
            </p>

            <p className="text-base font-medium italic text-slate-600 mb-8">
              Where Truth and Authenticity meet.
            </p>

            {/* Benefits */}
            <div className="flex flex-col gap-4 text-base font-bold text-[#00466D]">
              <div className="flex items-center gap-3">
                <span className="font-black text-lg bg-white/90 w-8 h-8 rounded-full flex items-center justify-center shadow-md text-[#00466D]">
                  ✓
                </span>

                <span>
                  100% vetted candidates & credible job opportunities
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-black text-lg bg-white/90 w-8 h-8 rounded-full flex items-center justify-center shadow-md text-[#00466D]">
                  ✓
                </span>

                <span>
                  Secure encrypted profiles & data protection
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-black text-lg bg-white/90 w-8 h-8 rounded-full flex items-center justify-center shadow-md text-[#00466D]">
                  ✓
                </span>

                <span>
                  Built for professionals and trusted employers
                </span>
              </div>
            </div>
          </section>

          {/* =====================================================
              RIGHT — ACTION CARD
          ====================================================== */}
          <section className="flex-1 min-w-[340px] flex justify-center relative z-10">
            <div className="w-full max-w-[580px] bg-white rounded-3xl p-8 sm:p-10 lg:p-12 border border-slate-200 shadow-2xl">

              {/* Logo */}
              <div className="flex justify-center mb-6">
                <img
                  src="/Logo TruCity.png"
                  alt="TruCity"
                  className="h-[75px] w-auto object-contain"
                />
              </div>

              {/* Badge */}
              <div className="text-center mb-4">
                <span
                  className="inline-block px-6 py-2.5 rounded-full text-white font-bold text-sm shadow-md"
                  style={{
                    background:
                      "linear-gradient(135deg, #1E92D2 0%, #00273D 100%)",
                  }}
                >
                  GET STARTED
                </span>
              </div>

              <h2
                className="text-3xl sm:text-4xl font-black text-center mb-3"
                style={{ color: "#FFAD01" }}
              >
                Welcome to TruCity
              </h2>

              <p className="text-center text-slate-600 font-medium leading-relaxed mb-8">
                Join a trusted professional network where
                verified talent meets credible employers.
              </p>

              {/* Actions */}
              <div className="flex flex-col gap-4">
                <button
                  type="button"
                  onClick={handleCreateAccount}
                  className="w-full min-h-[56px] rounded-2xl border-0 px-6 text-base font-extrabold text-white cursor-pointer shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-4 active:translate-y-0"
                  style={{
                    background:
                      "linear-gradient(90deg, #00466D 0%, #1E92D2 100%)",
                    boxShadow:
                      "0 8px 20px rgba(0, 70, 109, 0.18)",
                  }}
                >
                  Create Account
                </button>

                <button
                  type="button"
                  onClick={handleSignIn}
                  className="w-full min-h-[56px] rounded-2xl border-[1.5px] px-6 text-base font-extrabold cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#F8FCFF] hover:shadow-md focus-visible:outline-none active:translate-y-0"
                  style={{
                    borderColor: "#00466D",
                    color: "#00466D",
                    backgroundColor: "#F8FCFF",
                  }}
                >
                  Sign In
                </button>
              </div>

              {/* Role explanation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                <div className="rounded-2xl bg-[#F8FCFF] border border-slate-200 p-4">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center mb-3 text-white font-bold"
                    style={{
                      background:
                        "linear-gradient(135deg, #1E92D2 0%, #00273D 100%)",
                    }}
                  >
                    👤
                  </div>

                  <h3
                    className="font-extrabold text-sm mb-1"
                    style={{ color: "#00466D" }}
                  >
                    Candidates
                  </h3>

                  <p className="text-xs leading-relaxed text-slate-500">
                    Find credible opportunities with trusted
                    employers.
                  </p>
                </div>

                <div className="rounded-2xl bg-[#F8FCFF] border border-slate-200 p-4">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center mb-3 text-white font-bold"
                    style={{
                      background:
                        "linear-gradient(135deg, #FFAD01 0%, #00466D 100%)",
                    }}
                  >
                    🏢
                  </div>

                  <h3
                    className="font-extrabold text-sm mb-1"
                    style={{ color: "#00466D" }}
                  >
                    Employers
                  </h3>

                  <p className="text-xs leading-relaxed text-slate-500">
                    Hire verified professionals with confidence.
                  </p>
                </div>
              </div>

              {/* Existing account */}
              <div className="mt-7 text-center text-sm font-medium text-slate-500">
                Already have a TruCity account?{" "}
                <button
                  type="button"
                  onClick={handleSignIn}
                  className="bg-transparent border-none p-0 font-bold cursor-pointer"
                  style={{ color: "#00466D" }}
                >
                  Sign in
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* =========================================================
          FOOTER
      ========================================================== */}
      <footer className="relative z-10 bg-white/90 backdrop-blur-md px-6 lg:px-12 py-4 text-center text-xs font-medium border-t border-slate-200 text-slate-500">
        <span>TruCity © 2026</span>
        {" • "}
        <a
          href="#"
          className="no-underline text-slate-500 hover:text-[#00466D]"
        >
          User Agreement
        </a>
        {" • "}
        <a
          href="#"
          className="no-underline text-slate-500 hover:text-[#00466D]"
        >
          Privacy Policy
        </a>
        {" • "}
        <a
          href="#"
          className="no-underline text-slate-500 hover:text-[#00466D]"
        >
          Cookie Policy
        </a>
      </footer>
    </div>
  );
}
