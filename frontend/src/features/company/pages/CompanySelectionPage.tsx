import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function CompanySelectionPage() {
  const navigate = useNavigate();
  const [activeModal, setActiveModal] = useState<'none' | 'about' | 'contact'>('none');

  const companies = [
    { 
      id: 1, 
      name: 'Company 1', 
      industry: 'Embedded Systems & IoT Engineering', 
      activeJobs: 4, 
      location: 'Johannesburg, SA' 
    },
    { 
      id: 2, 
      name: 'Company 2', 
      industry: 'Financial Services & Fintech', 
      activeJobs: 2, 
      location: 'Cape Town, SA' 
    },
    { 
      id: 3, 
      name: 'Company 3', 
      industry: 'Enterprise Software Solutions', 
      activeJobs: 6, 
      location: 'Durban, SA' 
    },
  ];

  const handleSelectCompany = (_companyId: number) => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-white overflow-x-hidden relative" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
      
      {/* Background Organic Shapes, Logo Watermark & Vibrant Bubbles */}
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
          <Link to="/" className="no-underline text-slate-600 hover:text-[#003366]">HOME</Link>
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

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-6 lg:px-12 py-12">
        <div className="w-full max-w-[1000px]">
          
          <div className="text-center mb-10">
            <div className="inline-block px-6 py-2.5 rounded-full text-white font-bold text-base shadow-md mb-3" style={{ background: 'linear-gradient(135deg, #0077b6 0%, #003366 100%)' }}>
              Workspace Portal
            </div>
            <h1 className="text-3xl lg:text-4xl font-black mb-3 drop-shadow-sm" style={{ color: '#003366' }}>
            Select Your Company Workspace
            </h1>
            
            <p className="text-base font-bold" style={{ color: '#003366' }}>
              Choose an organization to manage your verified candidate pipelines and job listings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {companies.map((company) => (
              <div
                key={company.id}
                onClick={() => handleSelectCompany(company.id)}
                className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl hover:shadow-2xl transition-all cursor-pointer flex flex-col justify-between group transform hover:-translate-y-1"
              >
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#fffbeb]" style={{ color: '#003366', border: '1px solid #fef3c7' }}>
                      ● Verified
                    </span>
                    <span className="text-xs font-semibold text-slate-400">{company.location}</span>
                  </div>
                  <h3 className="text-2xl font-black mb-1 group-hover:text-[#0284c7] transition-colors" style={{ color: '#003366' }}>
                    {company.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mb-6">{company.industry}</p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-700">
                    {company.activeJobs} Active Positions
                  </span>
                  <span className="text-sm font-black text-[#0284c7]">Open →</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="bg-transparent border-none text-sm font-bold cursor-pointer underline"
              style={{ color: '#003366' }}
            >
              ← Back to Sign In
            </button>
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

      {/* Footer */}
      <footer className="relative z-10 bg-white/90 backdrop-blur px-6 lg:px-12 py-5 text-center text-xs font-medium border-t border-slate-200 text-slate-500">
        <span>TruCity © 2026</span> • <a href="#" className="no-underline text-slate-500">User Agreement</a> • <a href="#" className="no-underline text-slate-500">Privacy Policy</a> • <a href="#" className="no-underline text-slate-500">Cookie Policy</a>
      </footer>
    </div>
  );
}