import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LogIn,
  Mail,
  Eye,
  EyeOff,
  AlertTriangle,
  Lock,
  ChevronDown,
  UserCheck,
} from "lucide-react";

// -------------------------------------------------------------
// --- Custom Input & Select Field ---
// -------------------------------------------------------------
const InputField = ({
  label,
  value,
  onChange,
  onBlur = () => {},
  error,
  placeholder,
  type = "text",
  className = "",
  isPassword = false,
  showPassword,
  togglePasswordVisibility,
  inputMode,
  maxLength,
  isSelect = false,
  options = [],
}) => {
  // New style: Simple underline, red only on error
  const borderColor = error
    ? "border-red-500"
    : "border-gray-300 focus:border-black";

  const InputElement = isSelect ? (
    <div className="relative">
      <select
        id={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        // Underline style - font-sans is the default and matches the clean look
        className={`w-full px-0 py-1 text-sm text-gray-900 border-b ${borderColor} border-t-0 border-x-0 bg-transparent transition duration-150 appearance-none font-sans`}
      >
        {options.map((option) => (
          // Note: Labels for options are extracted for clean look
          <option key={option.value} value={option.value}>
            {option.label.replace(/[^a-zA-Z\s]/g, "").trim()}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-0 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none" />
    </div>
  ) : (
    <div className="relative">
      <input
        id={label}
        type={isPassword ? (showPassword ? "text" : "password") : type}
        placeholder={placeholder || ""}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        inputMode={inputMode}
        maxLength={maxLength}
        // Underline style - font-sans is the default and matches the clean look
        className={`w-full px-0 py-1 text-sm text-gray-900 border-b ${borderColor} border-t-0 border-x-0 placeholder-gray-500 transition duration-150 font-sans focus:outline-none focus:border-black`}
        style={{ height: "30px" }} // Explicit height for consistent look
      />
      {isPassword && (
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <Eye className="w-4 h-4" />
          ) : (
            <EyeOff className="w-4 h-4" />
          )}
        </button>
      )}
    </div>
  );

  return (
    <div className={`space-y-1 ${className}`}>
      <label
        htmlFor={label}
        // Label style: Matches the image's uppercase, slightly bold, small text.
        className="block text-xs font-semibold text-gray-900 uppercase tracking-wider mb-1 font-sans"
      >
        {label}
      </label>
      {InputElement}
      {/* WRAPPER ADDED: fixed height for error message area */}
      <div className="h-4">
        {error && (
          <p className="mt-1 text-xs text-red-600 flex items-center gap-1 font-sans">
            <AlertTriangle className="w-3 h-3 flex-shrink-0" />
            {error}
          </p>
        )}
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// --- MAIN LOGIN COMPONENT ---
// -------------------------------------------------------------
export default function LoginPage({ onLogin, onSwitch }) {
  // Main Login States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [studentId, setStudentId] = useState("");
  const [role, setRole] = useState("student");
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  // Password Reset States
  const [isForgotPasswordMode, setIsForgotPasswordMode] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState(1);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setConfirmNewPasswordVisibility] =
    useState(false);
  const [forgotMessage, setForgotMessage] = useState("");
  const [isPasswordChangeSuccess, setIsPasswordChangeSuccess] = useState(false);

  // --- Role Options ---
  const roleOptions = [
    { value: "student", label: "Student" },
    { value: "faculty", label: "Faculty" },
    { value: "admin", label: "Admin" },
  ];

  // --- Student ID Formatting ---
  const formatStudentId = (value) => {
    const numbers = value.replace(/[^0-9]/g, "");
    const trimmedNumbers = numbers.slice(0, 10);
    let formatted = "";

    if (trimmedNumbers.length > 0) {
      formatted += trimmedNumbers.substring(0, 4);
    }
    if (trimmedNumbers.length > 4) {
      formatted += "-" + trimmedNumbers.substring(4, 9);
    }
    if (trimmedNumbers.length >= 10) {
      formatted += "-SM-" + trimmedNumbers.substring(9, 10);
    } else if (trimmedNumbers.length > 4) {
      // Only add the first hyphen if more than 4 digits
    }

    return formatted;
  };

  // --- Validation Helpers ---
  const validateEmail = (value) =>
    /^([a-z0-9_\.-]+)@gmail\.com$/i.test(value.trim());
  const validatePassword = (value) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/.test(
      value
    );
  const validateStudentId = (value) => /^\d{4}-\d{5}-SM-\d$/.test(value.trim());

  // --- Input Change Handlers ---

  const onEmailBlur = () => {
    setErrors((e) => {
      const { email, ...rest } = e;
      return rest;
    });
    if (!email.trim()) {
      setErrors((e) => ({ ...e, email: "Email is required." }));
    }
  };

  const onPasswordBlur = () => {
    setErrors((e) => {
      const { password, ...rest } = e;
      return rest;
    });
    if (!password) {
      setErrors((e) => ({ ...e, password: "Password is required." }));
    }
  };

  const onStudentIdBlur = () => {
    setErrors((e) => {
      const { studentId, ...rest } = e;
      return rest;
    });
    if (role === "student" && !studentId.trim()) {
      setErrors((e) => ({
        ...e,
        studentId: "Student ID is required for students.",
      }));
    }
  };

  const handleEmailChange = (value) => {
    setEmail(value);
    if (errors.email && value.trim() && validateEmail(value)) {
      setErrors((e) => {
        const { email, ...rest } = e;
        return rest;
      });
    }
    if (errors.general)
      setErrors((e) => {
        const { general, ...rest } = e;
        return rest;
      });
  };

  const handlePasswordChange = (value) => {
    setPassword(value);
    if (errors.password && value) {
      setErrors((e) => {
        const { password, ...rest } = e;
        return rest;
      });
    }
    if (errors.general)
      setErrors((e) => {
        const { general, ...rest } = e;
        return rest;
      });
  };

  const handleStudentIdChange = (value) => {
    const formatted = formatStudentId(value);
    setStudentId(formatted);

    if (errors.studentId && formatted.trim() && validateStudentId(formatted)) {
      setErrors((e) => {
        const { studentId, ...rest } = e;
        return rest;
      });
    }
    if (errors.general)
      setErrors((e) => {
        const { general, ...rest } = e;
        return rest;
      });
  };

  const handleNewPasswordChange = (value) => {
    setNewPassword(value);
    let updatedErrors = errors;

    if (errors.newPassword && validatePassword(value)) {
      const { newPassword, ...rest } = errors;
      updatedErrors = rest;
    }

    if (value === confirmNewPassword && confirmNewPassword) {
      const { confirmNewPassword, ...rest } = updatedErrors;
      updatedErrors = rest;
    } else if (confirmNewPassword && value !== confirmNewPassword) {
      updatedErrors = {
        ...updatedErrors,
        confirmNewPassword: "Passwords do not match.",
      };
    }

    setErrors(updatedErrors);
  };

  const handleConfirmNewPasswordChange = (value) => {
    setConfirmNewPassword(value);

    if (newPassword !== value && value) {
      setErrors((e) => ({
        ...e,
        confirmNewPassword: "Passwords do not match.",
      }));
    } else if (errors.confirmNewPassword && newPassword === value) {
      setErrors((e) => {
        const { confirmNewPassword, ...rest } = e;
        return rest;
      });
    }
  };

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setEmail("");
    setPassword("");
    setStudentId("");
    setNewPassword("");
    setConfirmNewPassword("");
    setErrors({});
    setForgotMessage("");
  };

  const handleForgotPasswordToggle = () => {
    setIsForgotPasswordMode(!isForgotPasswordMode);
    setForgotPasswordStep(1);
    setErrors({});
    setForgotMessage("");
    setIsPasswordChangeSuccess(false);
    setEmail("");
    setPassword("");
    setStudentId("");
    setNewPassword("");
    setConfirmNewPassword("");
  };

  // --- NOTE: Forgot Password logic remains CLIENT-SIDE (Mocked) ---
  // The backend provided does not yet have password reset routes.
  const handleVerifyAccount = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!email.trim()) newErrors.email = "Email is required.";
    else if (!validateEmail(email))
      newErrors.email =
        'Invalid email. Must be in the exact format "user@gmail.com".';

    if (role === "student") {
      if (!studentId.trim())
        newErrors.studentId = "Student ID is required for students.";
      else if (!validateStudentId(studentId))
        newErrors.studentId =
          "Invalid Student ID format. Example: 2023-00341-SM-0";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setForgotMessage("");
      return;
    }

    // --- Mock Logic for Forgot Password (No API endpoint available yet) ---
    setErrors({});
    // Note: We can't access localStorage for user list anymore since it's backend only now
    // But we keep this mocked for the "Forgot Password" UI flow as requested.
    const mockSuccess = true;

    if (mockSuccess) {
      setForgotMessage(
        `**Verification successful!** You may now set a new password.`
      );
      setTimeout(() => {
        setForgotPasswordStep(2);
        setForgotMessage("");
        setErrors({});
      }, 1500);
    } else {
      setErrors({
        general:
          "❌ Account locally not found (Demo Mode). Please check details.",
      });
      setForgotMessage("");
    }
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    const passwordErrors = {};

    if (!newPassword) {
      passwordErrors.newPassword = "New password is required.";
    } else if (!validatePassword(newPassword)) {
      passwordErrors.newPassword =
        "Password must be 8+ chars, include uppercase, lowercase, number, and special character.";
    }

    if (!confirmNewPassword) {
      passwordErrors.confirmNewPassword = "Confirmation is required.";
    } else if (newPassword !== confirmNewPassword) {
      passwordErrors.confirmNewPassword = "Passwords do not match.";
    }

    if (Object.keys(passwordErrors).length > 0) {
      setErrors(passwordErrors);
      return;
    }

    // --- Mock Logic for Password Update ---
    setErrors({});
    setForgotMessage(
      `✅ Password successfully changed! Redirecting to login...`
    );
    setIsPasswordChangeSuccess(true);

    setTimeout(() => {
      handleForgotPasswordToggle();
    }, 3000);
  };

  /**
   * 🚨 *** UPDATED handleSubmit for API CONNECTION *** 🚨
   * This now fetches data from http://localhost:3001/api/login
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Client-Side Validation
    let newErrors = {};
    if (!email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!validateEmail(email)) {
      newErrors.email = 'Invalid email format (must be "user@gmail.com").';
    }

    if (!password) {
      newErrors.password = "Password is required.";
    }

    if (role === "student") {
      if (!studentId.trim()) {
        newErrors.studentId = "Student ID is required for students.";
      } else if (!validateStudentId(studentId)) {
        newErrors.studentId =
          "Invalid Student ID format. Example: 2023-00341-SM-0";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // 2. API Call to MySQL Backend
    try {
      setErrors({}); // Clear previous errors

      const response = await fetch("http://localhost:3001/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // <--- CRITICAL: Allows cookie to be received
        body: JSON.stringify({
          email,
          password,
          role,
          // Only send studentId if role is student
          studentId: role === "student" ? studentId : null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // --- Login Success ---
        const userData = data.user;

        // Check for Photo Requirement (if student)
        if (userData.role === "student" && !userData.photo) {
          setErrors({
            general:
              "❌ Student account requires facial biometric enrollment. Please contact administration.",
          });
          return;
        }

        console.log("Login Successful:", userData);
        // Pass the real database user object to the parent App component
        onLogin(userData);
      } else {
        // --- Server Error (Credentials Invalid) ---
        const errorMsg = data.error || "Login failed";

        if (errorMsg.toLowerCase().includes("incorrect password")) {
          setErrors({ password: "❌ Incorrect password." });
        } else if (errorMsg.toLowerCase().includes("student id")) {
          setErrors({ studentId: "❌ ID mismatch or not found." });
        } else if (errorMsg.toLowerCase().includes("role mismatch")) {
          setErrors({
            general: `❌ Account exists but is not a ${role}.`,
          });
        } else if (errorMsg.toLowerCase().includes("user not found")) {
          setErrors({
            general: "❌ Account not found. Please check your email.",
          });
        } else {
          setErrors({ general: `❌ ${errorMsg}` });
        }
      }
    } catch (error) {
      console.error("API Login Error:", error);
      setErrors({
        general: "❌ Server connection failed. Is the backend running?",
      });
    }
  };

  // --- Conditional Card Content (Forgot Password) ---
  const renderForgotPasswordContent = () => {
    const isStep1 = forgotPasswordStep === 1;

    return (
      <motion.div
        key={`forgot-form-step-${forgotPasswordStep}`}
        initial={{ opacity: 0, x: isStep1 ? 50 : -50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: isStep1 ? -50 : 50 }}
        transition={{ duration: 0.5 }}
        className="p-4 w-full"
      >
        <div className="max-w-sm mx-auto">
          {/* Title */}
          <div className="text-left mb-6 relative">
            <h2 className={`text-3xl font-bold text-gray-900 mb-1 font-sans`}>
              {isPasswordChangeSuccess
                ? "Password Updated!"
                : isStep1
                ? "Verify Account"
                : "Change Password"}
            </h2>
            <p className="text-gray-600 text-xs font-sans">
              {isPasswordChangeSuccess
                ? "Your password has been reset."
                : isStep1
                ? "Enter details to verify your account."
                : "Enter and confirm your new password."}
            </p>
          </div>

          {/* Password Rules Display (Visible in Step 2) */}
          {!isStep1 && !isPasswordChangeSuccess && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="p-3 mb-4 text-xs text-blue-800 bg-blue-50 border border-blue-200 rounded-lg font-sans"
            >
              <p className="font-semibold mb-1">New Password Requirements:</p>
              <ul className="list-disc list-inside space-y-0.5 ml-2">
                <li>Minimum 8 characters.</li>
                <li>
                  Must include uppercase, lowercase, a number, and a symbol.
                </li>
              </ul>
            </motion.div>
          )}

          {/* Form: Step 1 or Step 2 */}
          <form
            onSubmit={isStep1 ? handleVerifyAccount : handleChangePassword}
            className="space-y-6"
          >
            {/* Step 1 Content: Verification - Hidden on final success */}
            {isStep1 && !isPasswordChangeSuccess && (
              <>
                {/* Role Selection */}
                <InputField
                  label="Role"
                  value={role}
                  onChange={handleRoleChange}
                  isSelect={true}
                  options={roleOptions}
                />

                {/* Student ID (only for students) */}
                {role === "student" && (
                  <AnimatePresence>
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <InputField
                        label="Student ID"
                        placeholder="20XX-XXXXX-SM-0"
                        value={studentId}
                        onChange={handleStudentIdChange}
                        onBlur={onStudentIdBlur}
                        error={errors.studentId}
                        inputMode="text"
                        maxLength={17}
                      />
                    </motion.div>
                  </AnimatePresence>
                )}

                {/* Email */}
                <InputField
                  label="Email ID"
                  placeholder=""
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  onBlur={onEmailBlur}
                  error={errors.email}
                />
              </>
            )}

            {/* *** START: CHANGE PASSWORD FORM (STEP 2) *** */}
            {!isStep1 && !isPasswordChangeSuccess && (
              <>
                {/* New Password Input */}
                <InputField
                  label="New Password"
                  type="password"
                  value={newPassword}
                  onChange={handleNewPasswordChange}
                  error={errors.newPassword}
                  isPassword={true}
                  showPassword={showNewPassword}
                  togglePasswordVisibility={() =>
                    setShowNewPassword(!showNewPassword)
                  }
                />

                {/* Confirm New Password Input */}
                <InputField
                  label="Confirm New Password"
                  type="password"
                  value={confirmNewPassword}
                  onChange={handleConfirmNewPasswordChange}
                  error={errors.confirmNewPassword}
                  isPassword={true}
                  showPassword={showConfirmNewPassword}
                  togglePasswordVisibility={() =>
                    setConfirmNewPasswordVisibility(!showConfirmNewPassword)
                  }
                />
              </>
            )}
            {/* *** END: CHANGE PASSWORD FORM (STEP 2) *** */}

            {/* General Error / Success Message (For Forgot Password flow only) */}
            {(errors.general || forgotMessage) && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-3 rounded-lg text-sm font-medium font-sans ${
                  forgotMessage.includes("✅ Password successfully changed")
                    ? "bg-green-100 text-green-700 border border-green-300"
                    : forgotMessage.includes("**Verification successful!**")
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-red-100 text-red-700 border border-red-300"
                } flex items-start gap-2`}
              >
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{errors.general || forgotMessage}</span>
              </motion.div>
            )}

            {/* Submit Button - Hidden if successful */}
            {!isPasswordChangeSuccess && (
              <motion.div
                className="pt-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <button
                  type="submit"
                  className={`w-full font-bold py-2 rounded-sm transition shadow-sm font-sans`}
                  style={{
                    height: "36px",
                    background: isStep1 ? "#03A9F4" : "#E91E63",
                    color: "white",
                  }}
                >
                  {isStep1 ? "Verify Account & Continue" : "CHANGE PASSWORD"}
                </button>
              </motion.div>
            )}
          </form>

          {/* Switch back to Login */}
          <p className="mt-6 text-center text-xs text-gray-500 font-sans">
            {isStep1 || isPasswordChangeSuccess
              ? "Remember your password?"
              : "Cancel reset?"}{" "}
            <motion.button
              onClick={handleForgotPasswordToggle}
              className="text-blue-600 font-semibold hover:text-blue-800 transition hover:underline"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Back to Login
            </motion.button>
          </p>
        </div>
      </motion.div>
    );
  };

  // --- Conditional Card Content (Main Login - Image Style) ---
  const renderLoginContent = () => (
    <motion.div
      key="login-form"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.5 }}
      className="p-4 w-full"
    >
      <div className="max-w-sm mx-auto">
        {/* --- SYSTEM SIGNATURE --- */}
        <div className="flex items-center text-red-600 mb-6">
          <UserCheck className="w-8 h-8 mr-2" />
          <span className="text-sm font-semibold uppercase tracking-wider">
            Smart Attendance System
          </span>
        </div>

        {/* Title (Welcome Back!) */}
        <div className="text-left mb-6 relative">
          <h2 className="text-3xl font-bold text-gray-900 mb-1 font-sans">
            Welcome Back! 👋
          </h2>
          <p className="text-gray-600 text-xs font-sans">
            Log in to access the Secure Biometric Attendance System.
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 1. Role Selection */}
          <InputField
            label="Role"
            value={role}
            onChange={handleRoleChange}
            isSelect={true}
            options={roleOptions}
          />

          {/* 2. Student ID (only for students) */}
          {role === "student" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <InputField
                label="Student ID"
                placeholder="20XX-XXXXX-SM-0"
                value={studentId}
                onChange={handleStudentIdChange}
                onBlur={onStudentIdBlur}
                error={errors.studentId}
                inputMode="text"
                maxLength={17}
              />
            </motion.div>
          )}

          {/* 3. Email */}
          <InputField
            label="Email ID"
            placeholder=""
            type="email"
            value={email}
            onChange={handleEmailChange}
            onBlur={onEmailBlur}
            error={errors.email}
          />

          {/* 4. Password (with Forgot Password inline label) */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-gray-900 uppercase tracking-wider font-sans">
                Password
              </label>
              <motion.button
                type="button"
                onClick={handleForgotPasswordToggle}
                className="text-xs text-blue-600 font-semibold hover:underline transition font-sans"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Forgot Password?
              </motion.button>
            </div>
            {/* The InputField now receives the password-specific error, including the "incorrect password" message. */}
            <InputField
              label=""
              type="password"
              value={password}
              onChange={handlePasswordChange}
              onBlur={onPasswordBlur}
              error={errors.password} // <--- This will now show the "Incorrect password" message
              isPassword={true}
              showPassword={showPassword}
              togglePasswordVisibility={() => setShowPassword(!showPassword)}
            />
          </div>

          {/* General Error (Used only for biometric/unmatched credentials) */}
          {errors.general && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-3 rounded-lg text-sm font-medium bg-red-100 text-red-700 border border-red-300 flex items-center gap-2 font-sans`}
            >
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{errors.general}</span>
            </motion.div>
          )}

          {/* Submit Button (Matching Signup's RED LOGIN button) */}
          <motion.div
            className="pt-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <button
              type="submit"
              className="w-full bg-red-600 text-white font-bold py-2 rounded-sm transition shadow-sm shadow-red-500/30 hover:bg-red-700 font-sans"
              style={{ height: "36px" }}
            >
              LOGIN
            </button>
          </motion.div>
        </form>

        {/* Switch to Sign Up (Simple text link, matching login page style) */}
        <p className="mt-6 text-center text-xs border-t border-gray-200 pt-4 text-gray-600 font-sans">
          New to Presentryx?{" "}
          <motion.button
            onClick={onSwitch}
            className="text-blue-500 font-semibold hover:text-blue-700 transition"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Create an account
          </motion.button>
        </p>
      </div>
    </motion.div>
  );

  return (
    // Outer Container: Set min-h-screen for initial rendering, but rely on inner container for desktop constraint.
    <div className="relative min-h-screen font-sans">
      <AnimatePresence mode="wait">
        {/* --- MAIN CONTAINER: Applied md:h-screen for fixed height and scroll confinement on desktop --- */}
        <motion.div
          key={isForgotPasswordMode ? "forgot-card" : "login-card"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          // Key changes: md:h-screen sets the desktop height. flex-row for column layout.
          className="relative w-full z-10 flex flex-col md:flex-row min-h-screen md:h-screen"
        >
          {/* --- LEFT COLUMN: IMAGE BANNER (flex-1 and fixed height) --- */}
          <div
            key="design-col"
            // flex-1 for 50/50 split on desktop, md:h-screen for fixed height
            className="relative flex-1 flex flex-col justify-center items-center p-10 md:p-12 h-80 md:h-screen text-white overflow-hidden"
            style={{ fontFamily: "sans-serif" }}
          >
            {/* Background Image Container */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage:
                  'url("https://media.istockphoto.com/id/1458679872/photo/back-view-of-high-school-students-listening-to-their-teach-on-a-class.jpg?s=612x612&w=0&k=20&c=Z8aVsWYsp5VdwRtxOnKSee6B2LRG4gY6YeHC57sZXlM=")',
                backgroundPosition: "center 70%",
              }}
            ></div>
            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-black opacity-10"></div>

            {/* Content Overlay (Adjusted Font Sizes) */}
            <div className="relative z-20 text-center">
              <h1 className="text-4xl font-extrabold mb-3 tracking-tight">
                Welcome Back to Presentryx
              </h1>
              <p className="text-base font-medium mb-6 backdrop-blur-sm bg-black/10 inline-block px-3 py-1 rounded-full">
                Secure & Touchless Attendance
              </p>
              <p className="text-sm font-light leading-relaxed max-w-sm mx-auto">
                Log in quickly with your credentials to manage your academic
                presence using our Smart Biometric System.
              </p>
            </div>

            {/* Footer Text is kept */}
            <p className="absolute bottom-4 left-10 text-xs text-gray-400 z-20">
              © 2025 Presentryx | Academic Integrity System
            </p>
          </div>

          {/* --- RIGHT COLUMN: LOGIN/RESET FORM (Aligned to Top for Downward Expansion) --- */}
          <motion.div
            key="form-col-content"
            // FIX APPLIED: Changed items-center to items-start to pin content to the top.
            // Content expansion due to errors will now push elements downwards.
            className="bg-white flex-1 flex items-start justify-center py-10 md:py-20 relative md:h-screen overflow-y-auto"
          >
            {/* The form content (login or forgot password) still uses AnimatePresence for smooth transitions */}
            <AnimatePresence mode="wait">
              {isForgotPasswordMode
                ? renderForgotPasswordContent()
                : renderLoginContent()}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
