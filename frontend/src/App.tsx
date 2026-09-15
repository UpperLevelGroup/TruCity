import { useState } from "react";

import AppRoutes from "./routes/AppRoutes";
import { SplashScreen } from "./components/SplashScreen";

function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <>
      {showSplash && (
        <SplashScreen
          onFinish={() => setShowSplash(false)}
        />
      )}

      <AppRoutes />
    </>
  );
}

export default App;