import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if current route is login
  const isLoginMode = location.pathname === '/login';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [activeModal, setActiveModal] = useState<'none' | 'about' | 'contact'>('none');

  // Strict validation rules for the password:
  // - Minimum 8 characters long
  // - At least one uppercase letter (A-Z)
  // - At least one lowercase letter (a-z)
  // - At least one number (0-9)
  // - At least one special symbol (!@#$%^&*(),.?":{}|<>-)
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>-]).{8,}$/;
  const isPasswordValid = passwordRegex.test(password);
  const isPasswordMatch = password === confirmPassword;

  const isFormValid = isLoginMode 
    ? email.trim().length > 0 && password.trim().length > 0
    : email.trim().length > 0 && isPasswordValid && isPasswordMatch;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid) {
      if (isLoginMode) {
        navigate('/company-select');
      } else {
        navigate('/verification');
      }
    }
  };

  const handleGoogleAuth = () => {
    navigate(isLoginMode ? '/company-select' : '/verification');
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-white overflow-x-hidden relative" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
      
      {/* Background Organic Shapes, Logo Watermark & Vibrant Bubbles with Exact Contour Lines */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 flex items-center justify-center">
        <div 
          className="absolute inset-0 bg-center bg-no-repeat bg-contain opacity-[0.04]"
          style={{ backgroundImage: 'url("/logo.png")' }}
        />
        
        {/* Top-Left Blue Circle with Contour Arc */}
        <div className="absolute top-[-8%] left-[-5%] w-[320px] h-[320px] rounded-full bg-[#003366] overflow-hidden">
          <div className="absolute inset-0 rounded-full border border-[#ffb703] translate-x-6 translate-y-6 scale-90" />
        </div>

        {/* Top-Right Yellow Donut/Ring with Blue Contour Arc */}
        <div className="absolute top-[-10%] right-[-5%] w-[380px] h-[380px] rounded-full border-[65px] border-[#ffb703] overflow-hidden">
          <div className="absolute inset-0 rounded-full border border-[#003366]/40 -translate-x-8 -translate-y-8 scale-110" />
        </div>

        {/* Large Central/Left Background Orange Wave Bubble */}
        <div className="absolute top-[-5%] left-[-10%] w-[950px] h-[750px] rounded-[50%_40%_60%_50%/60%_50%_50%_40%] bg-[#ffb703] opacity-85 blur-[1px]" />
        <div className="absolute top-[10%] right-[-5%] w-[320px] h-[320px] rounded-full bg-[#ff9900] opacity-40 blur-2xl z-0" />
        <div className="absolute top-[45%] right-[15%] w-[200px] h-[200px] rounded-full bg-[#ffb703] opacity-65 blur-xl z-0" />
        
        {/* Center Blue Circle with Contour Arc */}
        <div className="absolute top-[52%] left-[34%] w-[260px] h-[260px] rounded-full bg-[#0077b6] shadow-xl z-0 overflow-hidden">
          <div className="absolute inset-0 rounded-full border border-[#ffb703] -translate-x-6 -translate-y-6 scale-95" />
        </div>

        {/* Bottom-Right Blue Circle with Contour Arc */}
        <div className="absolute bottom-[-8%] right-[-5%] w-[340px] h-[340px] rounded-full bg-[#003366] overflow-hidden">
          <div className="absolute inset-0 rounded-full border border-[#ffb703] -translate-x-8 -translate-y-8 scale-90" />
        </div>

        {/* Bottom-Left Yellow Circle */}
        <div className="absolute bottom-[-10%] left-[-5%] w-[300px] h-[300px] rounded-full bg-[#ffb703]" />

        <div className="absolute bottom-0 left-0 right-0 h-[120px] bg-gradient-to-t from-slate-200/50 to-transparent pointer-events-none" />
      </div>

      {/* Top Header Logo & Navigation Bar */}
      <header className="relative z-20 px-6 lg:px-12 py-4 bg-white/90 backdrop-blur-md border-b border-slate-100 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 no-underline">
          <img 
            src="/logo.png" 
            alt="TruCity Logo" 
            className="h-10 w-auto object-contain" 
          />
          <span className="text-2xl font-black tracking-tight" style={{ color: '#003366' }}>
            Tru<span style={{ color: '#ff9900' }}>City</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold" style={{ color: '#003366' }}>
          <Link to="/" className="no-underline border-b-2 border-[#ffb703] pb-1" style={{ color: '#003366' }}>HOME</Link>
          <button 
            type="button" 
            onClick={() => setActiveModal('about')}
            className="bg-transparent border-none text-sm font-semibold text-slate-600 hover:text-[#003366] cursor-pointer p-0"
          >
            About
          </button>
          <button 
            type="button" 
            onClick={() => setActiveModal('contact')}
            className="bg-transparent border-none text-sm font-semibold text-slate-600 hover:text-[#003366] cursor-pointer p-0"
          >
            Contact
          </button>
        </nav>
      </header>

      {/* Main Split Section */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-6 lg:px-12 py-10">
        <div className="flex flex-wrap items-center justify-between w-full max-w-[1300px] gap-12">
          
          <div className="flex-1 min-w-[320px] max-w-[620px] relative z-10">
            <h1 className="text-4xl lg:text-[52px] font-black leading-tight tracking-tight mb-4 text-white drop-shadow-sm">
              WELCOME
            </h1>
            <p className="text-lg font-bold leading-relaxed mb-6" style={{ color: '#003366' }}>
              TRUCITY WHERE VERIFIED PROFESSIONALS ARE CONNECTED TO TRUSTED EMPLOYERS.
            </p>
            <p className="text-base font-medium italic mb-8 text-slate-700">
              Where Truth and Authenticity meet.
            </p>
            <div className="flex flex-col gap-4 text-base font-bold" style={{ color: '#003366' }}>
              <div className="flex items-center gap-3">
                <span className="font-black text-xl bg-white/90 w-7 h-7 rounded-full flex items-center justify-center shadow-sm" style={{ color: '#003366' }}>✓</span>
                <span>100% Vetted Candidates & Credible Job opportunities</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-black text-xl bg-white/90 w-7 h-7 rounded-full flex items-center justify-center shadow-sm" style={{ color: '#003366' }}>✓</span>
                <span>Secure Encrypted profile & data protection</span>
              </div>
            </div>
          </div>

          <div className="flex-1 min-w-[340px] flex justify-center relative z-10">
            <div className="w-full max-w-[680px] bg-white rounded-3xl p-14 lg:p-16 border border-slate-200 shadow-2xl relative z-20">

              {/* Back button: Takes user back to Sign Up (/) when viewing Sign In (/login) */}
              {isLoginMode && (
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="mb-4 text-xs font-bold bg-transparent border-none cursor-pointer flex items-center gap-1 p-0 hover:underline relative z-30 pointer-events-auto"
                  style={{ color: '#003366' }}
                >
                  ← Back to Sign Up
                </button>
              )}

              <div className="mb-8 text-center pt-2">
                <div className="inline-block px-6 py-2.5 rounded-full text-white font-bold text-base shadow-md mb-3" style={{ background: 'linear-gradient(135deg, #0077b6 0%, #003366 100%)' }}>
                  {isLoginMode ? 'Sign In Page' : 'Sign Up Page'}
                </div>
                <h2 className="text-3xl font-extrabold" style={{ color: '#ffb703' }}>
                  {isLoginMode ? 'Welcome back to TruCity!' : 'Join TruCity now!'}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold" style={{ color: '#003366' }}>Email or phone number</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-4 rounded-xl border border-slate-300 text-base box-border outline-none bg-white font-medium focus:border-[#003366]"
                    style={{ color: '#003366' }}
                    placeholder="name@example.com"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold" style={{ color: '#003366' }}>
                    {isLoginMode ? 'Password' : 'Password (letters, numbers & symbols)'}
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={isLoginMode ? "Enter your password" : "e.g. Pass#2026!"}
                      className="w-full p-4 pr-20 rounded-xl border border-slate-300 text-base box-border outline-none bg-white font-medium focus:border-[#003366]"
                      style={{ color: '#003366' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 bg-none border-none font-bold text-sm cursor-pointer"
                      style={{ color: '#003366' }}
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  {!isLoginMode && password.length > 0 && !isPasswordValid && (
                    <p className="text-xs text-red-500 font-medium mt-1">
                      Password must be at least 8 characters long and include uppercase, lowercase, a number, and a special character.
                    </p>
                  )}
                </div>

                {!isLoginMode && (
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold" style={{ color: '#003366' }}>Confirm password</label>
                    <div className="relative flex items-center">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        className="w-full p-4 rounded-xl border border-slate-300 text-base box-border outline-none bg-white font-medium focus:border-[#003366]"
                        style={{ color: '#003366' }}
                      />
                    </div>
                    {confirmPassword.length > 0 && !isPasswordMatch && (
                      <p className="text-xs text-red-500 font-medium mt-1">
                        Passwords do not match.
                      </p>
                    )}
                  </div>
                )}

                {!isLoginMode && (
                  <p className="text-xs text-left leading-relaxed my-1 font-medium text-slate-500">
                    By clicking Agree & Join or Continue, you agree to the TruCity{' '}
                    <a href="#" className="font-semibold no-underline" style={{ color: '#003366' }}>User Agreement</a>,{' '}
                    <a href="#" className="font-semibold no-underline" style={{ color: '#003366' }}>Privacy Policy</a>, and{' '}
                    <a href="#" className="font-semibold no-underline" style={{ color: '#003366' }}>Cookie Policy</a>.
                  </p>
                )}

                <button 
                  type="submit" 
                  disabled={!isFormValid}
                  className={`w-full text-white p-4 rounded-xl border-none text-base font-extrabold transition-colors shadow-md ${
                    isFormValid ? 'cursor-pointer' : 'opacity-60 cursor-not-allowed'
                  }`}
                  style={{ backgroundColor: '#003366', boxShadow: '0 4px 12px rgba(0, 51, 102, 0.3)' }}
                >
                  {isLoginMode ? 'Sign In' : 'Agree & Join'}
                </button>
              </form>

              <div className="flex items-center my-6">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="px-3 text-sm font-semibold text-slate-500">or</span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>

              <button 
                type="button" 
                onClick={handleGoogleAuth} 
                className="w-full bg-white p-4 rounded-xl border border-slate-300 text-base font-bold flex items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors shadow-sm"
                style={{ color: '#003366' }}
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                Continue with Google
              </button>

              <div className="mt-6 text-center text-sm font-medium text-slate-500">
                {isLoginMode ? (
                  <>
                    Don't have a TruCity account?{' '}
                    <Link to="/" className="font-bold no-underline ml-1" style={{ color: '#003366' }}>
                      Sign up
                    </Link>
                  </>
                ) : (
                  <>
                    Already on TruCity?{' '}
                    <button 
                      type="button" 
                      onClick={() => navigate('/login')} 
                      className="bg-transparent border-none font-bold text-sm cursor-pointer ml-1 p-0"
                      style={{ color: '#003366' }}
                    >
                      Sign in
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* About Modal */}
      {activeModal === 'about' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl relative border border-slate-100">
            <h3 className="text-2xl font-black mb-3" style={{ color: '#003366' }}>About TruCity</h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-6">
              TruCity is a premier verified workspace platform designed to streamline recruitment, connect verified professional talent with top employers, and accelerate hiring workflows securely.
            </p>
            <button
              type="button"
              onClick={() => setActiveModal('none')}
              className="w-full py-3 rounded-xl text-white font-bold text-sm cursor-pointer border-none shadow-md"
              style={{ backgroundColor: '#003366' }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Contact Modal */}
      {activeModal === 'contact' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl relative border border-slate-100">
            <h3 className="text-2xl font-black mb-3" style={{ color: '#003366' }}>Contact Support</h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-4">
              Need assistance with your workspace or active listings? Reach out directly to our support team.
            </p>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 mb-6 text-sm font-semibold text-[#003366]">
              Email: support@trucity.co.za
            </div>
            <button
              type="button"
              onClick={() => setActiveModal('none')}
              className="w-full py-3 rounded-xl text-white font-bold text-sm cursor-pointer border-none shadow-md"
              style={{ backgroundColor: '#003366' }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <footer className="relative z-10 bg-white/90 backdrop-blur px-6 lg:px-12 py-5 text-center text-xs font-medium border-t border-slate-200 text-slate-500">
        <span>TruCity © 2026</span> • <a href="#" className="no-underline text-slate-500">User Agreement</a> • <a href="#" className="no-underline text-slate-500">Privacy Policy</a> • <a href="#" className="no-underline text-slate-500">Cookie Policy</a>
      </footer>
    </div>
  );
}