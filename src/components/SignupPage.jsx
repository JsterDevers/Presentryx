import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  Video,
  AlertTriangle,
  ScanFace,
  Info,
  Eye,
  EyeOff,
  CheckSquare,
  ChevronDown,
  UserCheck,
} from "lucide-react";

// --- Custom Input & Select Field (Underline Style) ---
const InputField = ({
  label,
  value,
  onChange,
  onBlur,
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
        // Underline style
        className={`w-full px-0 py-1 text-sm text-gray-900 border-b ${borderColor} border-t-0 border-x-0 bg-transparent transition duration-150 appearance-none font-sans`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
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
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        inputMode={inputMode}
        maxLength={maxLength}
        // Underline style: border-b only, no padding on x-axis
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
        // Label style matching the image's simple text labels
        className="block text-xs font-semibold text-gray-900 uppercase tracking-wider mb-1"
      >
        {label}
      </label>
      {InputElement}
      {error && (
        <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3 flex-shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
};

// --- MAIN COMPONENT ---
export default function SignupPage({ onSwitch = () => {}, onSuccess }) {
  // --- CUSTOMIZATION: Image URL and Opacity State ---
  const DEFAULT_IMAGE_URL =
    "https://htigroup.vn/wp-content/uploads/2021/07/hti-he-thong-cham-cong-bang-khuon-mat-h4.png";
  const [bannerImageUrl, setBannerImageUrl] = useState(DEFAULT_IMAGE_URL);

  /** * 🛑 CODE OPTION: Adjust this value (0.0 to 1.0) to change the dark overlay intensity.
   * Lower values = clearer image; Higher values = darker image (better text contrast).
   */
  const [imageOpacity, setImageOpacity] = useState(0);
  // --------------------------------------------------------

  const [lastname, setLastname] = useState("");
  const [firstname, setFirstname] = useState("");
  const [studentIdInput, setStudentIdInput] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("student"); // Default role set to student
  const [photo, setPhoto] = useState(null);
  const [showScanner, setShowScanner] = useState(false);
  const [message, setMessage] = useState("");
  const [isCameraActive, setIsCameraActive] = useState(false);

  // --- Terms and Conditions States ---
  const [hasAgreedToTerms, setHasAgreedToTerms] = useState(false);
  const [termsError, setTermsError] = useState("");
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);

  // Per-field errors
  const [lastnameError, setLastnameError] = useState("");
  const [firstnameError, setFirstnameError] = useState("");
  const [studentIdError, setStudentIdError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  // Password visibility states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Define the detailed error message for password validation
  const PASSWORD_ERROR_MSG =
    "Must be 8+ characters and contain upper, lower, number, and special character.";

  // Role options
  const roleOptions = [
    { value: "student", label: "Student" },
    { value: "faculty", label: "Faculty" },
    { value: "admin", label: "Admin" },
  ];

  // Stop camera stream when component unmounts or scanner is hidden
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // --- Helper Functions for Validation and Formatting ---
  const validateName = (value) => value.trim().length > 0;
  const validateEmail = (value) =>
    /^([a-z0-9_\.-]+)@gmail\.com$/i.test(value.trim());

  const validatePassword = (value) => {
    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    return strongPasswordRegex.test(value);
  };

  const validateStudentId = (value) => /^\d{4}-\d{5}-SM-\d$/.test(value.trim());

  const formatStudentId = (value) => {
    let digits = value.replace(/\D/g, "");
    let formatted = "";

    if (digits.length > 0) {
      formatted += digits.substring(0, 4);
    }
    if (digits.length > 4) {
      formatted += "-" + digits.substring(4, 9);
    }
    if (digits.length > 9) {
      formatted += "-SM-" + digits.substring(9, 10);
    }

    return formatted.slice(0, 17);
  };

  // --- Camera / Scanner Handlers ---
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraActive(false);
    }
  };

  const startCamera = async () => {
    stopCamera();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240 },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsCameraActive(true);
        setMessage("Camera activated. Please center your face.");
      }
    } catch (err) {
      console.error("Error accessing camera: ", err);
      setMessage(
        "❌ Camera access denied or failed. Please allow camera permissions."
      );
      setIsCameraActive(false);
    }
  };

  const handleCapturePhoto = () => {
    if (!isCameraActive) {
      setMessage("⚠️ Please activate the camera before capturing a photo.");
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video && canvas) {
      const context = canvas.getContext("2d");
      canvas.width = 320;
      canvas.height = 240;
      context.drawImage(video, 0, 0, 320, 240);
      const photoDataUrl = canvas.toDataURL("image/jpeg", 0.9);

      setPhoto(photoDataUrl);
      setMessage(
        "✅ Photo captured successfully! Scanner interface remains open."
      );
      stopCamera();
    }
  };

  const handleRetake = () => {
    setPhoto(null);
    setShowScanner(true);
    startCamera();
    setMessage("Ready for photo retake. Camera activated.");
  };

  const handleToggleScanner = (newState) => {
    setShowScanner(newState);
    if (newState) {
      if (!photo) {
        startCamera();
      } else {
        setMessage("Photo already registered. Click retake to change it.");
      }
    } else {
      stopCamera();
    }
  };

  // --- Form Input Handlers ---

  // FIX: Terms & Conditions handler now allows toggling
  const handleTermsToggle = () => {
    const newState = !hasAgreedToTerms;
    setHasAgreedToTerms(newState);
    if (newState) {
      setTermsError("");
    }
  };

  // Function to clear all fields on role switch
  const clearAllFieldsAndErrors = () => {
    setLastname("");
    setFirstname("");
    setStudentIdInput("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setPhoto(null);
    setHasAgreedToTerms(false);

    setLastnameError("");
    setFirstnameError("");
    setStudentIdError("");
    setEmailError("");
    setPasswordError("");
    setConfirmPasswordError("");
    setTermsError("");

    setMessage("");
    handleToggleScanner(false);
  };

  // Role change logic that clears all fields
  const handleRoleChange = (v) => {
    setRole(v);
    clearAllFieldsAndErrors(); // Clear all data immediately on role switch
  };

  // 1. Real-time validation for First Name
  const handleFirstnameChange = (v) => {
    setFirstname(v);
    if (validateName(v)) setFirstnameError("");
    else if (v.length > 0) setFirstnameError("First name is required.");
  };
  const onFirstnameBlur = () => {
    if (!validateName(firstname)) setFirstnameError("First name is required.");
  };

  // 2. Real-time validation for Last Name
  const handleLastnameChange = (v) => {
    setLastname(v);
    if (validateName(v)) setLastnameError("");
    else if (v.length > 0) setLastnameError("Last name is required.");
  };
  const onLastnameBlur = () => {
    if (!validateName(lastname)) setLastnameError("Last name is required.");
  };

  // 3. Real-time validation for Email
  const handleEmailChange = (v) => {
    setEmail(v);
    if (validateEmail(v)) setEmailError("");
    else if (v.length > 0)
      setEmailError(
        'Invalid email. Must be in the exact format "user@gmail.com".'
      );
    else setEmailError("Email is required.");
  };
  const onEmailBlur = () => {
    if (!validateEmail(email.trim())) {
      setEmailError(
        !email.trim()
          ? "Email is required."
          : 'Invalid email. Must be in the exact format "user@gmail.com".'
      );
    }
  };

  // 4. Real-time validation for Password
  const handlePasswordChange = (v) => {
    setPassword(v);
    if (validatePassword(v)) setPasswordError("");
    else if (v.length > 0) setPasswordError(PASSWORD_ERROR_MSG);
    else setPasswordError("Password is required.");

    // Update Confirm Password validation in real-time too
    if (confirmPassword.length > 0) {
      if (v !== confirmPassword)
        setConfirmPasswordError("Passwords do not match.");
      else setConfirmPasswordError("");
    }
  };
  const onPasswordBlur = () => {
    if (!validatePassword(password)) {
      setPasswordError(
        !password ? "Password is required." : PASSWORD_ERROR_MSG
      );
    }
  };

  // 5. Real-time validation for Confirm Password
  const handleConfirmPasswordChange = (v) => {
    setConfirmPassword(v);
    if (password === v && validatePassword(password))
      setConfirmPasswordError("");
    else if (v.length > 0 && password !== v)
      setConfirmPasswordError("Passwords do not match.");
    else if (!v) setConfirmPasswordError("Confirm Password is required.");
    else setConfirmPasswordError("");
  };
  const onConfirmPasswordBlur = () => {
    if (!confirmPassword) {
      setConfirmPasswordError("Confirm Password is required.");
    } else if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match.");
    }
  };

  // 6. Student ID validation
  const handleStudentIdChange = (value) => {
    const formatted = formatStudentId(value);
    setStudentIdInput(formatted);
    if (validateStudentId(formatted)) setStudentIdError("");
    else if (formatted.length > 0)
      setStudentIdError("Invalid Student ID format. Example: 2023-00341-SM-0");
    else setStudentIdError("");
  };
  const onStudentIdBlur = () => {
    if (role !== "student") return;
    if (!validateStudentId(studentIdInput.trim())) {
      setStudentIdError(
        !studentIdInput.trim()
          ? "Student ID is required for students."
          : "Invalid Student ID. Example: 2023-00341-SM-0"
      );
    }
  };

  const toggleTermsModal = () => setIsTermsModalOpen((prev) => !prev);
  // --- End Handlers ---

  const handleSignup = async (e) => {
    e.preventDefault();

    setMessage("");

    // Run all final validations on submit
    onFirstnameBlur();
    onLastnameBlur();
    onEmailBlur();
    onPasswordBlur();
    onConfirmPasswordBlur();
    if (role === "student") onStudentIdBlur();

    // Give state a moment to update
    await new Promise((resolve) => setTimeout(resolve, 50));

    const currentErrors = [
      lastnameError,
      firstnameError,
      emailError,
      passwordError,
      confirmPasswordError,
      role === "student" ? studentIdError : null,
    ].filter(Boolean);

    let hasError =
      currentErrors.length > 0 ||
      !validateName(firstname) ||
      !validateName(lastname) ||
      !validateEmail(email) ||
      !validatePassword(password) ||
      password !== confirmPassword ||
      (role === "student" && !validateStudentId(studentIdInput.trim()));

    if (!hasAgreedToTerms) {
      setTermsError(
        "You must agree to the Terms and Conditions to create an account."
      );
      hasError = true;
    } else setTermsError("");

    if (role === "student" && !photo && !hasError) {
      setMessage(
        "⚠️ Facial Biometric Enrollment is mandatory for students. Please use the scanner to capture your photo."
      );
      hasError = true;
    }

    if (hasError) {
      if (!message || message.startsWith("⚠️") || message.startsWith("❌")) {
        setMessage(
          "⚠️ Please fix the highlighted fields and review required steps."
        );
      }
      return;
    }

    // ----------------------------------------------------------------------
    // --- CONNECT TO MYSQL API ENDPOINT ---
    // ----------------------------------------------------------------------
    const API_URL = "http://localhost:3001/api/signup";

    const newUser = {
      lastname: lastname.trim(),
      firstname: firstname.trim(),
      studentId: role === "student" ? studentIdInput : null,
      email: email.trim(),
      password: password,
      role,
      photo, // Base64 string from canvas
      agreedToTerms: hasAgreedToTerms,
    };

    try {
      setMessage("⏳ Creating account...");
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUser),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Server Response:", data);
        setMessage(
          `✅ Account created successfully! Redirecting to login...`
        );
        // Trigger switch to Login Page
        if (onSuccess) onSuccess();
        else onSwitch();
      } else {
        console.error("Signup Failed:", data.error);
        setMessage(`❌ Registration failed: ${data.error || "Server error."}`);
      }
    } catch (error) {
      console.error("Network or Fetch Error:", error);
      setMessage(
        "❌ Could not connect to the server. Ensure the Node.js server on port 3001 is running."
      );
    }
    // ----------------------------------------------------------------------
  };

  const isBiometricRequiredAndMissing = role === "student" && !photo;

  const backgroundStyle = {
    background: `linear-gradient(rgba(0,0,0,${imageOpacity}), rgba(0,0,0,${
      imageOpacity + 0.1
    })), url("${bannerImageUrl}")`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
  };

  return (
    <div className="font-sans bg-gray-50 min-h-screen">
      {/* 1. MAIN CONTAINER: Use h-screen on desktop for fixed height and scrolling control */}
      <div className="flex flex-col md:flex-row min-h-screen md:h-screen">
        {/* 2. Left Column: Image Banner (DYNAMIC OPACITY APPLIED) */}
        <div
          className="relative flex-1 flex flex-col justify-center items-center p-10 md:p-12 h-80 md:h-screen text-white overflow-hidden"
          style={backgroundStyle}
        >
          {/* CONTENT OVERLAY (Adjusted Font Sizes) */}
          <div className="relative z-10 text-center">
            {/* H1 font size: text-3xl */}
            <h1 className="text-4xl font-extrabold mb-3 tracking-tight">
              Presentryx
            </h1>
            {/* Tagline font size: text-base */}
            <p className="text-base font-medium mb-6 backdrop-blur-sm bg-black/20 inline-block px-3 py-1 rounded-full">
              Smart Attendance System
            </p>
            <p className="text-sm font-light leading-relaxed max-w-sm mx-auto">
              The future of class attendance verification through fast and secure
              facial biometrics and student ID tracking.
            </p>
          </div>
        </div>

        {/* 3. Right Column: REGISTER FORM LAYOUT (SCROLLABLE) */}
        <div
          // 🛑 Key Change: Added md:h-screen to match the parent container height,
          // and overflow-y-auto to enable scrolling for long content on desktop.
          className="flex-1 bg-white flex justify-center items-start overflow-y-auto py-10 md:py-20 p-4 relative md:h-screen"
        >
          <AnimatePresence>
            <motion.div
              key="signup-card"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.6 }}
              className="w-full max-w-sm mx-auto p-0 z-20 mt-16 md:mt-0"
            >
              {/* --- SYSTEM SIGNATURE (ADDED) --- */}
              <div className="flex items-center text-red-600 mb-6">
                <UserCheck className="w-8 h-8 mr-2" />
                <span className="text-sm font-semibold uppercase tracking-wider">
                  Smart Attendance System
                </span>
              </div>

              {/* FORM HEADER - Matches the image style */}
              <h2 className="text-3xl font-bold text-gray-900 text-left mb-2">
                Register
              </h2>

              {/* --- NEW TAGLINE BELOW REGISTER --- */}
              <p className="text-sm text-gray-600 mb-8">
                Create your secure account with the Smart Attendance System.
              </p>
              {/* --- END NEW TAGLINE --- */}

              {/* Form Fields */}
              <form onSubmit={handleSignup} className="space-y-6">
                {/* 1. --- ROLE SELECTION DROPDOWN --- */}
                <InputField
                  label="Role"
                  value={role}
                  onChange={handleRoleChange}
                  isSelect={true}
                  options={roleOptions}
                />

                {/* 2. --- FIRST NAME --- */}
                <InputField
                  label="First Name"
                  placeholder=""
                  value={firstname}
                  onChange={handleFirstnameChange}
                  onBlur={onFirstnameBlur}
                  error={firstnameError}
                />

                {/* 3. --- LAST NAME --- */}
                <InputField
                  label="Last Name"
                  placeholder=""
                  value={lastname}
                  onChange={handleLastnameChange}
                  onBlur={onLastnameBlur}
                  error={lastnameError}
                />

                {/* 4. --- EMAIL --- (Matches "EMAIL ID" label from image) */}
                <InputField
                  label="Email ID"
                  placeholder=""
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  onBlur={onEmailBlur}
                  error={emailError}
                />

                {/* 5. --- STUDENT ID (Conditional for students) --- */}
                {role === "student" && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <InputField
                      label="Student ID"
                      placeholder="20XX-XXXXX-SM-0"
                      value={studentIdInput}
                      onChange={handleStudentIdChange}
                      onBlur={onStudentIdBlur}
                      error={studentIdError}
                      inputMode="text"
                      maxLength={17}
                    />
                  </motion.div>
                )}

                {/* 6. --- PASSWORD --- */}
                <InputField
                  label="Password"
                  placeholder="••••••"
                  type="password"
                  value={password}
                  onChange={handlePasswordChange}
                  onBlur={onPasswordBlur}
                  error={passwordError}
                  isPassword={true}
                  showPassword={showPassword}
                  togglePasswordVisibility={() =>
                    setShowPassword(!showPassword)
                  }
                />

                {/* 7. --- CONFIRM PASSWORD --- */}
                <InputField
                  label="Confirm Password"
                  placeholder="••••••"
                  type="password"
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  onBlur={onConfirmPasswordBlur}
                  error={confirmPasswordError}
                  isPassword={true}
                  showPassword={showConfirmPassword}
                  togglePasswordVisibility={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                />

                {/* Terms and Conditions Radio Button (Now behaves like a toggle) */}
                <div className="pt-2 -mt-4">
                  <div className="flex items-center">
                    {/* The outer div handles the click to allow toggling, as the radio input itself often doesn't allow unchecking */}
                    <div
                      onClick={handleTermsToggle}
                      className="flex items-center cursor-pointer"
                    >
                      <input
                        id="terms-agreement"
                        name="terms-agreement"
                        type="radio"
                        checked={hasAgreedToTerms}
                        readOnly // Prevents default radio behavior on input click
                        className={`h-4 w-4 rounded-full transition duration-200 ${
                          termsError
                            ? "border-red-500 text-red-600 focus:ring-red-500"
                            : "border-gray-300 text-blue-600 focus:ring-blue-500"
                        }`}
                      />
                      <label
                        htmlFor="terms-agreement"
                        className={`ml-2 block text-xs leading-snug cursor-pointer ${
                          termsError
                            ? "text-red-700 font-medium"
                            : "text-gray-700"
                        }`}
                      >
                        I accept{" "}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent the click from toggling the radio state via the label's parent div
                            toggleTermsModal();
                          }}
                          className="text-blue-600 hover:text-blue-800 font-medium underline underline-offset-2"
                        >
                          terms and conditions & privacy policy
                        </button>
                      </label>
                    </div>
                  </div>
                  {termsError && (
                    <p className="mt-2 text-xs text-red-600 flex items-center gap-1 ml-6">
                      <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                      {termsError}
                    </p>
                  )}
                </div>

                {/* Face Scanner for Students - (Conditional for Students only) */}
                {role === "student" && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="pt-4 border-t border-gray-100 mt-4"
                  >
                    <div className="text-center">
                      <p className="text-gray-700 font-semibold mb-3 text-sm">
                        Facial Biometric Registration (Mandatory)
                      </p>

                      {isBiometricRequiredAndMissing && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1, duration: 0.3 }}
                          className="p-3 mb-3 rounded-md text-sm font-medium bg-red-50 text-red-700 border border-red-300 flex items-center gap-2 text-left"
                        >
                          <ScanFace className="w-4 h-4 flex-shrink-0" />
                          <span className="font-bold">
                            Facial Biometric Registration is REQUIRED for
                            students.
                          </span>
                        </motion.div>
                      )}

                      <motion.button
                        type="button"
                        onClick={() => handleToggleScanner(!showScanner)}
                        className={`w-full font-bold py-2.5 rounded-md transition shadow-sm flex items-center justify-center gap-2 text-sm ${
                          showScanner
                            ? "bg-gray-500 hover:bg-gray-600 text-white"
                            : "bg-white hover:bg-gray-100 text-gray-800 border border-gray-300"
                        }`}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        {showScanner ? (
                          <>❌ Close Scanner Interface</>
                        ) : (
                          <>
                            {photo ? (
                              "✅ Photo Registered (Click to Retake)"
                            ) : (
                              <>
                                <ScanFace className="w-4 h-4" /> Initialize
                                Biometric Scan
                              </>
                            )}
                          </>
                        )}
                      </motion.button>

                      <AnimatePresence>
                        {showScanner && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                            className="mt-4 p-4 bg-white rounded-lg border border-gray-200"
                          >
                            {!photo ? (
                              <>
                                <div className="flex items-start text-left bg-blue-50/70 p-3 mb-4 rounded-lg border border-blue-200">
                                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mr-3 mt-1" />
                                  <p className="text-gray-700 text-sm">
                                    1. Press Activate Camera.<br></br>
                                    2. Center your face and hold still.<br></br>
                                    3. Press Capture Photo to complete.
                                  </p>
                                </div>

                                <video
                                  ref={videoRef}
                                  autoPlay
                                  muted
                                  width="320"
                                  height="240"
                                  className="rounded-lg border-2 border-gray-300 mx-auto w-full max-w-xs aspect-video object-cover shadow-md bg-gray-900"
                                ></video>
                                <canvas
                                  ref={canvasRef}
                                  width="320"
                                  height="240"
                                  className="hidden"
                                />
                                <div className="flex flex-col sm:flex-row justify-center gap-3 mt-4">
                                  <motion.button
                                    type="button"
                                    onClick={startCamera}
                                    className={`flex-1 flex items-center justify-center gap-1 px-4 py-2 rounded-md font-bold transition text-sm shadow-md ${
                                      isCameraActive
                                        ? "bg-teal-600 text-white hover:bg-teal-700"
                                        : "bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-300"
                                    }`}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.98 }}
                                  >
                                    <Video className="w-4 h-4" />
                                    {isCameraActive
                                      ? "Camera Active"
                                      : "Activate Camera"}
                                  </motion.button>
                                  <motion.button
                                    type="button"
                                    onClick={handleCapturePhoto}
                                    className="flex-1 flex items-center justify-center gap-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-bold text-sm shadow-md disabled:opacity-50"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.98 }}
                                    disabled={!isCameraActive}
                                  >
                                    <Camera className="w-4 h-4" /> Capture Photo
                                  </motion.button>
                                </div>
                              </>
                            ) : (
                              <div className="flex flex-col items-center">
                                <img
                                  src={photo}
                                  alt="Captured Face"
                                  className="rounded-lg border-2 border-teal-600 mx-auto w-32 h-32 object-cover shadow-xl"
                                />
                                <p className="text-sm text-teal-700 mt-2 font-medium">
                                  Face photo successfully registered!
                                </p>
                                <motion.button
                                  type="button"
                                  onClick={handleRetake}
                                  className="mt-3 bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 text-sm font-medium shadow-md"
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  Retake Photo
                                </motion.button>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}

                {/* Message Box (Unchanged) */}
                {message && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-3 rounded-md text-sm font-medium ${
                      message.includes("✅")
                        ? "bg-green-100 text-green-700 border border-green-300"
                        : "bg-red-100 text-red-700 border border-red-300"
                    } flex items-center gap-2 mt-4`}
                  >
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span>{message}</span>
                  </motion.div>
                )}

                {/* Submit Button (Image Red Style) */}
                <motion.div className="pt-8">
                  <motion.button
                    type="submit"
                    className={`w-full text-white font-bold py-2 rounded-sm transition text-base ${
                      isBiometricRequiredAndMissing
                        ? "bg-red-600 hover:bg-red-700 shadow-red-500/30"
                        : "bg-red-600 hover:bg-red-700 shadow-sm" // Primary red color
                    } flex items-center justify-center gap-2`}
                    style={{ height: "36px" }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isBiometricRequiredAndMissing ? (
                      <>
                        <ScanFace className="w-5 h-5" /> Register Biometric to
                        Continue
                      </>
                    ) : (
                      "REGISTER ACCOUNT" // Changed to be more accurate
                    )}
                  </motion.button>
                </motion.div>
              </form>

              {/* --- Sign-in link text (Centered) --- */}
              <p className="text-xs text-gray-600 mt-6 text-center">
                Already have an account?{" "}
                <button
                  onClick={onSwitch}
                  className="text-blue-500 hover:text-blue-700 font-semibold transition"
                >
                  Sign In
                </button>
              </p>
              {/* --- END Sign-in Link --- */}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* --- Terms and Conditions Modal (Unchanged) --- */}
        <AnimatePresence>
          {isTermsModalOpen && (
            <motion.div
              key="terms-modal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={toggleTermsModal}
            >
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
                transition={{ type: "spring", stiffness: 100 }}
                className="bg-white rounded-xl w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2 flex items-center gap-2">
                  <CheckSquare className="w-6 h-6 text-gray-700" /> Terms and
                  Conditions Policy
                </h3>
                <div className="space-y-4 text-gray-700 text-sm leading-relaxed">
                  <p>
                    <strong>1. Acceptance of Terms:</strong> By creating an
                    account with the Smart Attendance System ("Presentryx"), you
                    agree to be bound by these Terms and Conditions ("Terms").
                    If you disagree with any part of the terms, you must not use
                    the System.
                  </p>
                  <p>
                    <strong>2. Biometric Data (Students Only):</strong> Student
                    users acknowledge and consent to the collection and
                    processing of facial biometric data solely for the purpose
                    of touchless class attendance verification. This data
                    will be securely stored, encrypted, and used exclusively for
                    internal academic and administrative operations. This data
                    will not be shared with unauthorized third parties.
                  </p>
                  <p>
                    <strong>3. User Conduct:</strong> You agree to use the
                    System responsibly and lawfully. Any attempt to compromise
                    the integrity or security of the attendance system (e.g.,
                    proxy attendance, unauthorized access) will result in
                    disciplinary action up to and including termination of
                    access.
                  </p>
                  <p>
                    <strong>4. Privacy Policy:</strong> Your personal
                    information (email, ID, password hash) is protected and
                    covered by our institutional Privacy Policy. We commit to
                    protecting your data and using it only for the stated
                    academic and administrative purposes, in compliance with
                    data privacy regulations.
                  </p>
                  <p>
                    <strong>5. Account Security:</strong> You are responsible
                    for maintaining the confidentiality of your password and
                    account information. You must notify the system
                    administrators immediately of any unauthorized use of your
                    account.
                  </p>
                </div>
                <button
                  onClick={toggleTermsModal}
                  className="mt-6 w-full bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700 transition shadow-lg shadow-blue-600/50 text-sm"
                >
                  I Understand and Accept
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}