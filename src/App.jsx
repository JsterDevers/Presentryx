import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import "./App.css";
import AppHeader from "./AppHeader";
import AppMain from "./AppMain";
import AppFooter from "./AppFooter";
import AuthContainer from "./components/AuthContainer";
import DevelopersPage from "./components/Developers";
import "react-datepicker/dist/react-datepicker.css";
import { AlertTriangle } from "lucide-react"; 

// --- DASHBOARDS ---
import AdminDashboard from "./components/AdminDashboard";
import FacultyDashboard from "./components/FacultyDashboard";
import StudentDashboard from "./components/StudentDashboard";

// --- GLOBAL LOCK VARIABLE ---
let isGlobalLogoutProcessing = false;

// --- DYNAMIC URL CONSTRUCTION ---
// This function determines the correct API base URL for Codespaces or localhost.
const getApiBaseUrl = () => {
  const BACKEND_PORT = 3001;
  const isCodespace = window.location.hostname.endsWith(".app.github.dev");

  if (isCodespace) {
    // Automatically construct the secure public URL for port 3001
    // e.g., https://<hash>-5173.app.github.dev -> https://<hash>-3001.app.github.dev
    
    // Regex to strip the frontend port (e.g., -5173) and replace it with -3001
    const codespaceHost = window.location.hostname.replace(/-\d{4}\.app\.github\.dev$/, `-${BACKEND_PORT}.app.github.dev`);
    return `https://${codespaceHost}`;
  }
  // Standard local development fallback
  return `http://localhost:${BACKEND_PORT}`;
};

const API_BASE_URL = getApiBaseUrl();
// --- END DYNAMIC URL CONSTRUCTION ---


export default function App() {
  // --- State Management ---
  const [formData, setFormData] = useState({ email: "", name: "" });
  const [page, setPage] = useState("landing");
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [initialAuthIsLogin, setInitialAuthIsLogin] = useState(true);
  
  // URL validation check is no longer needed since it's dynamic
  const isUrlSetupCorrect = true; 
  
  // --- 1. PERSIST VIEW ---
  useEffect(() => {
    if (page !== "login" && page !== "landing") {
      sessionStorage.setItem("last_view", page);
    }
  }, [page]);

  // --- 2. CHECK SESSION ON LOAD ---
  useEffect(() => {
    const checkSession = async () => {
      
      // 1. Check if this specific tab has an active session marker
      const tabUserId = sessionStorage.getItem("tab_user_id");

      // If this tab was never logged in, show Landing immediately
      if (!tabUserId) {
        setIsLoading(false);
        setPage("landing");
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/check-session`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include", // This sends the Cookie
        });

        const data = await response.json();

        if (data.authenticated && data.user) {
          // --- SECURITY CHECK: SESSION MISMATCH ---
          if (String(data.user.id) !== String(tabUserId)) {
            console.warn("Session mismatch detected. Logging out of this tab.");
            handleLocalLogout();
            return;
          }

          const fullName = `${data.user.firstname} ${data.user.lastname}`;

          // Capitalize Role
          const role = data.user.role
            ? data.user.role.charAt(0).toUpperCase() + data.user.role.slice(1)
            : "Student";

          setCurrentUser({
            ...data.user,
            name: fullName,
            fullname: fullName,
            role: role,
          });

          const lastView = sessionStorage.getItem("last_view");
          if (lastView === "developers") {
            setPage("developers");
          } else {
            setPage("dashboard");
          }
        } else {
          handleLocalLogout();
        }
      } catch (error) {
        // If the URL is wrong or the server is down, this catches it
        console.error("Session check failed (Network Error).", error);
        handleLocalLogout();
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, [API_BASE_URL]);

  // --- Helper: Clear Local State Only ---
  const handleLocalLogout = () => {
    setPage("landing");
    setCurrentUser(null);
    sessionStorage.clear(); // Wipes data for THIS tab only
  };

  // --- Handle Global Logout ---
  const handleLogout = async (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();

    if (isGlobalLogoutProcessing) return;
    isGlobalLogoutProcessing = true;

    try {
      if (currentUser && currentUser.id) {
        await fetch(`${API_BASE_URL}/api/logout`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ userId: currentUser.id }),
        });
      }
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      handleLocalLogout();
      setInitialAuthIsLogin(true);

      setTimeout(() => {
        isGlobalLogoutProcessing = false;
      }, 1000);
    }
  };

  // --- Handlers ---
  const handleInputChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.email && formData.name) {
      console.log(`Thanks, ${formData.name}!`);
      setFormData({ email: "", name: "" });
    }
  };

  const handleSignUpClick = () => {
    setInitialAuthIsLogin(false);
    setPage("login");
  };

  const handleLoginClick = () => {
    setInitialAuthIsLogin(true);
    setPage("login");
  };

  const handleShowDevelopers = () => setPage("developers");

  const handleGoHome = () => {
    if (currentUser) setPage("dashboard");
    else setPage("landing");
  };

  // --- Handle Login Success ---
  const handleLoginSuccess = (backendUser) => {
      const fullName = `${backendUser.firstname} ${backendUser.lastname}`;
      const role = backendUser.role
        ? backendUser.role.charAt(0).toUpperCase() + backendUser.role.slice(1)
        : "Student";

      setCurrentUser({
        ...backendUser,
        name: fullName,
        fullname: fullName,
        role: role,
      });

      // CRITICAL: Save the User ID to this specific Tab
      sessionStorage.setItem("tab_user_id", backendUser.id);

      setPage("dashboard");
  };

  // --- Render Loading Screen ---
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-900 text-blue-400 font-bold text-lg animate-pulse">
        Initializing Presentryx...
      </div>
    );
  }


  // --- ROLE BASED ROUTING ---
  if (page === "dashboard" && currentUser) {
    switch (currentUser.role) {
      case "Admin":
        return <AdminDashboard user={currentUser} onLogout={handleLogout} apiBaseUrl={API_BASE_URL} />;
      case "Faculty":
        return <FacultyDashboard user={currentUser} onLogout={handleLogout} apiBaseUrl={API_BASE_URL} />;
      case "Student":
      default:
        return <StudentDashboard user={currentUser} onLogout={handleLogout} apiBaseUrl={API_BASE_URL} />;
    }
  }

  if (page === "developers") {
    return (
      <DevelopersPage
        onViewPortfolio={handleSignUpClick}
        onConnect={handleGoHome}
      />
    );
  }

  if (page === "login") {
    return (
      <>
        {/* If the dynamic URL calculation failed, show a non-blocking warning. */}
        {!isUrlSetupCorrect && (
          <div className="absolute top-0 left-0 right-0 p-3 bg-red-100 text-red-700 text-xs font-medium border-b border-red-300 z-50 flex items-center justify-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <p>SETUP ALERT: Could not automatically determine API Base URL. Network calls might fail.</p>
          </div>
        )}
        <AuthContainer
          initialIsLogin={initialAuthIsLogin}
          onLogin={handleLoginSuccess}
          onSignup={() => console.log("Signed up")}
          apiBaseUrl={API_BASE_URL} // Pass the correct URL to the Auth component
        />
      </>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-[#3b0dab] via-[#4b2cc6] to-[#081a51] text-white">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
        <div className="absolute bg-white/10 rounded-full w-24 h-24 top-10 left-20 blur-3xl animate-pulse"></div>
        <div className="absolute bg-indigo-400/20 rounded-full w-48 h-48 bottom-20 right-32 blur-2xl animate-pulse"></div>
      </div>

      {page === "landing" && (
        <AppHeader
          onSignUpClick={handleSignUpClick}
          onLoginClick={handleLoginClick}
          onDevTeamClick={handleShowDevelopers}
        />
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key="landing"
          initial={{ opacity: 0, x: -80 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 80 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          <AppMain
            formData={formData}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
            onShowDevelopers={handleShowDevelopers}
          />
          <AppFooter />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}