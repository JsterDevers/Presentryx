import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import LoginPage from "./LoginPage";
import SignupPage from "./SignupPage";

// Receive the apiBaseUrl here and pass it down
export default function AuthContainer({ 
    onLogin, 
    initialIsLogin = true, 
    apiBaseUrl // <-- RECEIVED HERE
}) {
  const [isLogin, setIsLogin] = useState(initialIsLogin);

  // --- THE FIX ---
  // This ensures that if the prop changes, the state updates immediately.
  useEffect(() => {
    setIsLogin(initialIsLogin);
  }, [initialIsLogin]);

  const handleSwitch = () => {
    setIsLogin((prev) => !prev);
  };

  const handleSignupSuccess = () => {
    setIsLogin(true);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-linear-to-b from-blue-100 via-white to-indigo-100 overflow-hidden">
      <AnimatePresence mode="wait">
        {isLogin ? (
          <motion.div
            key="login"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="w-full"
          >
            {/* PASSED HERE */}
            <LoginPage 
                onLogin={onLogin} 
                onSwitch={handleSwitch} 
                apiBaseUrl={apiBaseUrl} 
            />
          </motion.div>
        ) : (
          <motion.div
            key="signup"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="w-full"
          >
            {/* PASSED HERE */}
            <SignupPage 
                onSwitch={handleSwitch} 
                onSuccess={handleSignupSuccess} 
                apiBaseUrl={apiBaseUrl} 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}