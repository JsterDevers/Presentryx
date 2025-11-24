import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import LoginPage from "./LoginPage";
import SignupPage from "./SignupPage";

// Default initialIsLogin to true so it doesn't break if undefined
export default function AuthContainer({ onLogin, initialIsLogin = true }) {
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
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-100 via-white to-indigo-100 overflow-hidden">
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
            <LoginPage onLogin={onLogin} onSwitch={handleSwitch} />
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
            <SignupPage onSwitch={handleSwitch} onSuccess={handleSignupSuccess} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}