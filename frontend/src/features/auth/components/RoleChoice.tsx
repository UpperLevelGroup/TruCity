import { useNavigate, Link } from "react-router-dom";
import "../../../styles/auth.css";

export default function RoleChoice() {
  const navigate = useNavigate();

  return (
    <main
      className="min-h-screen flex flex-col bg-[#F8FCFF] overflow-hidden relative"
      style={{
        fontFamily:
          "Helvetica, Inter, system-ui, -apple-system, sans-serif",
      }}
    >
      {/* =========================================================
          BACKGROUND — INTERN VISUAL STYLE
      ========================================================== */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {/* City watermark */}
        <img
          src="/city-watermark.png"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover opacity-[0.12] mix-blend-overlay"
        />

        {/* Top-left dark blue circle */}
        <div className="absolute top-[-8%] left-[-5%] w-[320px] h-[320px] rounded-full bg-[#00273D] overflow-hidden">
          <div className="absolute inset-0 rounded-full border border-[#FFAD01] translate-x-6 translate-y-6 scale-90" />
        </div>

        {/* Top-right gold ring */}
        <div className="absolute top-[-10%] right-[-5%] w-[380px] h-[380px] rounded-full border-[65px] border-[#FFAD01] overflow-hidden">
          <div className="absolute inset-0 rounded-full border border-[#00273D]/40 -translate-x-8 -translate-y-8 scale-110" />
        </div>

        {/* Large gold organic shape */}
        <div className="absolute top-[-5%] left-[-10%] w-[950px] h-[750px] rounded-[50%_40%_60%_50%/60%_50%_50%_40%] bg-[#FFAD01] opacity-75 blur-[1px]" />

        {/* Light gold bubble */}
        <div className="absolute top-[10%] right-[5%] w-[320px] h-[320px] rounded-full bg-[#FFD784] opacity-40 blur-2xl" />

        {/* Gold bubble */}
        <div className="absolute top-[45%] right-[15%] w-[200px] h-[200px] rounded-full bg-[#FFAD01] opacity-55 blur-xl" />

        {/* Lower-left blue circle */}
        <div className="absolute top-[72%] left-[10%] w-[220px] h-[220px] rounded-full bg-[#1E92D2] shadow-xl overflow-hidden">
          <div className="absolute inset-0 rounded-full border border-[#FFAD01] -translate-x-6 -translate-y-6 scale-95" />
        </div>

        {/* Bottom-right dark blue circle */}
        <div className="absolute bottom-[-8%] right-[-5%] w-[340px] h-[340px] rounded-full bg-[#00273D] overflow-hidden">
          <div className="absolute inset-0 rounded-full border border-[#FFAD01] -translate-x-8 -translate-y-8 scale-90" />
        </div>

        {/* Bottom-left gold circle */}
        <div className="absolute bottom-[-10%] left-[-5%] w-[300px] h-[300px] rounded-full bg-[#FFAD01]" />

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-[120px] bg-gradient-to-t from-slate-200/50 to-transparent" />
      </div>

      {/* =========================================================
          HEADER
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
            className="no-underline text-[#00273D] hover:text-[#00466D]"
          >
            SIGN IN
          </Link>
        </nav>
      </header>

      {/* =========================================================
          MAIN
      ========================================================== */}
      <section className="relative z-10 flex-1 flex items-center justify-center px-6 lg:px-12 py-12">
        <div className="w-full max-w-[1050px] flex items-center justify-center">
          <section className="w-full max-w-[760px] bg-white rounded-3xl p-8 sm:p-10 lg:p-14 border border-slate-200 shadow-2xl">

            {/* Badge */}
            <div className="text-center mb-4">
              <div
                className="inline-block px-6 py-2.5 rounded-full text-white font-bold text-sm sm:text-base shadow-md"
                style={{
                  background:
                    "linear-gradient(135deg, #1E92D2 0%, #00273D 100%)",
                }}
              >
                GET STARTED
              </div>
            </div>

            {/* Heading */}
            <div className="text-center mb-10">
              <h1
                className="text-3xl sm:text-4xl lg:text-[42px] font-black tracking-tight mb-3"
                style={{ color: "#FFAD01" }}
              >
                Join TruCity
              </h1>

              <p className="text-base sm:text-lg font-medium text-slate-600">
                Tell us who you're signing up as
              </p>
            </div>

            {/* Role options */}
            <div className="flex flex-col gap-5">

              {/* Candidate */}
              <button
                type="button"
                onClick={() => navigate("/register/candidate")}
                className="group w-full flex items-center gap-5 text-left bg-white border-2 border-slate-200 rounded-2xl p-5 sm:p-6 cursor-pointer transition-all duration-200 hover:border-[#1E92D2] hover:shadow-lg"
              >
                <div
                  className="flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center text-2xl shadow-md"
                  style={{
                    background:
                      "linear-gradient(135deg, #1E92D2 0%, #00273D 100%)",
                  }}
                >
                  <span className="text-white">👤</span>
                </div>

                <div className="flex-1 min-w-0">
                  <h2
                    className="text-lg sm:text-xl font-extrabold mb-1"
                    style={{ color: "#00466D" }}
                  >
                    I'm a Candidate
                  </h2>

                  <p className="text-sm sm:text-base text-slate-500 font-medium">
                    Looking for verified job opportunities
                  </p>
                </div>

                <span
                  className="flex-shrink-0 text-2xl font-bold transition-transform duration-200 group-hover:translate-x-1"
                  style={{ color: "#FFAD01" }}
                >
                  →
                </span>
              </button>

              {/* Company */}
              <button
                type="button"
                onClick={() => navigate("/register/company")}
                className="group w-full flex items-center gap-5 text-left bg-white border-2 border-slate-200 rounded-2xl p-5 sm:p-6 cursor-pointer transition-all duration-200 hover:border-[#FFAD01] hover:shadow-lg"
              >
                <div
                  className="flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center text-2xl shadow-md"
                  style={{
                    background:
                      "linear-gradient(135deg, #FFAD01 0%, #00466D 100%)",
                  }}
                >
                  <span className="text-white">🏢</span>
                </div>

                <div className="flex-1 min-w-0">
                  <h2
                    className="text-lg sm:text-xl font-extrabold mb-1"
                    style={{ color: "#00466D" }}
                  >
                    I'm a Company
                  </h2>

                  <p className="text-sm sm:text-base text-slate-500 font-medium">
                    Hiring verified specialists
                  </p>
                </div>

                <span
                  className="flex-shrink-0 text-2xl font-bold transition-transform duration-200 group-hover:translate-x-1"
                  style={{ color: "#FFAD01" }}
                >
                  →
                </span>
              </button>
            </div>

            {/* Sign in */}
            <div className="mt-8 text-center text-sm font-medium text-slate-500">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-bold no-underline"
                style={{ color: "#00466D" }}
              >
                Sign in
              </Link>
            </div>
          </section>
        </div>
      </section>

      {/* =========================================================
          FOOTER
      ========================================================== */}
      <footer className="relative z-10 bg-white/90 backdrop-blur px-6 lg:px-12 py-5 text-center text-xs font-medium border-t border-slate-200 text-slate-500">
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
    </main>
  );
}
