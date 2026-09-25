import { useState } from 'react';

import AppRoutes from './routes/AppRoutes';
import AppWatermark from './components/AppWatermark';
import { SplashScreen } from './components/SplashScreen';

export default function App() {
  const [showSplash, setShowSplash] =
    useState(true);

  return (
    <div className="relative min-h-screen">
      {/* =====================================================
          GLOBAL BACKGROUND WATERMARK

          Sits behind every page.
      ====================================================== */}

      <AppWatermark />

      {/* =====================================================
          APPLICATION CONTENT

          Sits above the watermark.
      ====================================================== */}

      <div className="relative z-10">
        <AppRoutes />
      </div>

      {/* =====================================================
          GLOBAL SPLASH SCREEN

          Must be outside all layouts so the PublicLayout
          topbar cannot appear above or through it.
      ====================================================== */}

      {showSplash && (
        <SplashScreen
          onFinish={() => {
            setShowSplash(false);
          }}
        />
      )}
    </div>
  );
}
