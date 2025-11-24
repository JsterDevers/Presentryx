import {
  useState,
  useEffect,
  useContext,
  createContext,
  useRef,
  useMemo,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import DatePicker from "react-datepicker";
import { parseISO, format } from "date-fns";

// --- THEME & COLOR DEFINITIONS ---
const FORMAL_COLORS = {
  BG_PRIMARY: "bg-slate-900", // Main background
  BG_SECONDARY: "bg-slate-800", // Card/Panel background
  BG_ACCENT: "bg-blue-900", // Sidebar/Active background
  TEXT_PRIMARY: "text-gray-100", // Main text
  TEXT_SECONDARY: "text-gray-400", // Secondary text
  ACCENT_TEXT: "text-blue-500", // Accent icon/header text
  BORDER: "border-slate-700",
};

// --- UTILITY FUNCTIONS ---

const getLocalTime = () =>
  new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
const getTodayDate = () => new Date().toISOString().split("T")[0];
const generateId = () =>
  Date.now().toString(36) + Math.random().toString(36).substring(2, 9);

/**
 * Helper to convert AM/PM time string to a comparative numeric value (minutes since midnight).
 * @param {string} timeStr - Time string (e.g., "09:45 AM").
 * @returns {number} Minutes since midnight.
 */
const timeToMinutes = (timeStr) => {
  if (!timeStr || timeStr === "N/A") return -1;
  const [time, period] = timeStr.split(" ");
  let [hours, minutes] = time.split(":").map(Number);

  if (period === "PM" && hours !== 12) {
    hours += 12;
  } else if (period === "AM" && hours === 12) {
    hours = 0; // Midnight 12:xx AM
  }
  return hours * 60 + minutes;
};

/**
 * Helper to convert minutes since midnight to HH:MM AM/PM format.
 * @param {number} minutes - Minutes since midnight.
 * @returns {string} Time string (e.g., "09:45 AM").
 */
const minutesToAmPm = (minutes) => {
  if (minutes < 0) return "N/A";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;

  const period = h >= 12 ? "PM" : "AM";
  const hours = h % 12 === 0 ? 12 : h % 12; // Handle 0 (midnight) and 12 (noon)
  const paddedMinutes = m < 10 ? `0${m}` : m;
  const paddedHours = hours < 10 ? `0${hours}` : hours; // Ensure 2 digits for hours

  return `${paddedHours}:${paddedMinutes} ${period}`;
};

/**
 * Helper to convert the composite schedule string (e.g., "09:30 AM - 11:00 AM")
 * into separate HH:MM 24-hour strings (e.g., "09:30", "11:00").
 * @param {string} scheduleStr - The full schedule string.
 * @returns {{start24: string, end24: string}}
 */
const parseScheduleTo24Hr = (scheduleStr) => {
  if (!scheduleStr || scheduleStr.indexOf(" - ") === -1)
    return { start24: "", end24: "" };

  const [startTimeStr, endTimeStr] = scheduleStr.split(" - ");

  // Helper to convert AM/PM string to 24-hour string (HH:MM)
  const to24Hour = (timeStr) => {
    if (!timeStr) return "";
    const [time, period] = timeStr.split(" ");
    let [hours, minutes] = time.split(":").map(Number);

    if (period === "PM" && hours !== 12) {
      hours += 12;
    } else if (period === "AM" && hours === 12) {
      hours = 0; // Midnight 12:xx AM
    }

    const paddedHours = hours < 10 ? `0${hours}` : hours;
    const paddedMinutes = minutes < 10 ? `0${minutes}` : minutes;

    return `${paddedHours}:${paddedMinutes}`;
  };

  return {
    start24: to24Hour(startTimeStr),
    end24: to24Hour(endTimeStr),
  };
};

/**
 * Checks if the scanned time is after the class end time.
 * @param {string} classSchedule - Schedule string (e.g., "09:30 AM - 11:00 AM").
 * @returns {boolean} True if the current time is past the end of the class.
 */
const checkIfOverdue = (classSchedule) => {
  if (!classSchedule) return false;

  // Extract the end time from the schedule string (e.g., "11:00 AM")
  const endTimeStr = classSchedule.split(" - ")[1];
  const endTimeMinutes = timeToMinutes(endTimeStr);

  // Get current time in the same format
  const currentTimeStr = getLocalTime();
  const currentMinutes = timeToMinutes(currentTimeStr);

  // Check if current time is after the end time (e.g., 11:01 AM > 11:00 AM)
  return currentMinutes > endTimeMinutes;
};

/**
 * Checks if the scanned time is after the class start time.
 * @param {string} scanTime - Current time string (e.g., "09:45 AM").
 * @param {string} classSchedule - Schedule string (e.g., "09:30 AM - 11:00 AM").
 * @returns {boolean} True if the scan is late.
 */
const checkIfLate = (scanTime, classSchedule) => {
  if (!classSchedule) return false;

  // Extract the start time from the schedule string (e.g., "09:30 AM")
  const startTimeStr = classSchedule.split(" - ")[0];

  const scanMinutes = timeToMinutes(scanTime);
  const startMinutes = timeToMinutes(startTimeStr);

  // Define a grace period (e.g., 5 minutes)
  const GRACE_PERIOD_MINUTES = 5;

  // Check if the scan time is after the start time plus the grace period
  return scanMinutes > startMinutes + GRACE_PERIOD_MINUTES;
};

const defaultFacultyInfo = {
  name: "",
  school: "Not Set",
  notifications: true,
};

// *** NEW DEFAULT FOR TERM ***
const defaultTerm = "2024-2025 - Semester 1";

// --- CONTEXT SETUP ---
const DashboardContext = createContext();

const DashboardProvider = ({ children, user }) => {
  // *** PERSISTENCE FIX: Initialize state from localStorage using functional component ***
  // NOTE: This function now relies on the `App` component to have cleared old data
  // if a new user logs in, ensuring this only pulls data relevant to the current user
  // or the default empty state.
  const initializeState = (key, defaultValue) => {
    try {
      // NOTE: Because App component clears keys if user changes,
      // this pull is safe for the *current* user or will return null for defaults.
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error);
      return defaultValue;
    }
  };

  const [classes, setClasses] = useState(() => initializeState("classes", []));
  const [attendance, setAttendance] = useState(() =>
    initializeState("attendance", [])
  );

  const [facultyInfo, setFacultyInfo] = useState(() => {
    const storedInfo = initializeState("facultyInfo", defaultFacultyInfo);
    return {
      ...defaultFacultyInfo,
      ...storedInfo,
      // CRITICAL: Prioritize user prop for name/school regardless of stored data
      name: user?.name || storedInfo.name || defaultFacultyInfo.name,
      school: user?.school || storedInfo.school || defaultFacultyInfo.school,
    };
  });

  // *** NEW STATE FOR TERM ***
  const [currentTerm, setCurrentTermState] = useState(() =>
    initializeState("currentTerm", defaultTerm)
  );
  const [selectedClassForDetail, setSelectedClassForDetail] = useState(null);

  const [toastMessage, setToastMessage] = useState(null);

  // --- Initialization and User Update (Remains for prop updates) ---
  // Ensures faculty name/school updates if the `user` prop changes (e.g., initial load)
  useEffect(() => {
    if (user?.name) {
      setFacultyInfo((prev) => ({
        ...defaultFacultyInfo,
        ...prev,
        name: user.name,
        school: user.school || prev.school,
      }));
    }
  }, [user]);

  // --- Persistence: Save Data to localStorage (on state change) ---
  // NOTE: Data is saved using generic keys, relying on App/Logout logic to clear when session changes.
  useEffect(() => {
    localStorage.setItem("classes", JSON.stringify(classes));
  }, [classes]);
  useEffect(() => {
    localStorage.setItem("attendance", JSON.stringify(attendance));
  }, [attendance]);
  useEffect(() => {
    localStorage.setItem("facultyInfo", JSON.stringify(facultyInfo));
  }, [facultyInfo]);
  // *** NEW PERSISTENCE FOR TERM ***
  useEffect(() => {
    localStorage.setItem("currentTerm", JSON.stringify(currentTerm));
  }, [currentTerm]);

  // --- CRUD Functions ---
  const showToast = (message, type = "success") => {
    if (!facultyInfo.notifications) return; // Guard for notifications
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const addClass = (newClass) => {
    setClasses((prev) => [...prev, { id: generateId(), ...newClass }]);
    showToast("Class added successfully!");
  };

  const updateClass = (id, updatedClass) => {
    setClasses((prev) =>
      prev.map((c) => (c.id === id ? { id, ...updatedClass } : c))
    );
    showToast("Class updated successfully!");
  };

  const deleteClass = (id) => {
    // *** FIX: Delete class and update attendance immediately, which triggers Overview re-render ***
    setClasses((prev) => prev.filter((c) => c.id !== id));
    setAttendance((att) => att.filter((r) => r.classId !== id)); // This triggers the overview chart update
    setSelectedClassForDetail(null); // Clear detail view if the deleted class was active
    showToast("Class deleted!", "error");
  };

  const addAttendanceRecord = (record) => {
    setAttendance((prev) => [...prev, { id: generateId(), ...record }]);
  };

  const updateAttendanceRecord = (id, updates) => {
    if (Array.isArray(updates)) {
      setAttendance(updates);
      return;
    }
    setAttendance((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
    );
  };

  const updateFacultyInfo = (info) => {
    // MODIFIED: Ensure name is not overwritten by settings update
    setFacultyInfo((prev) => ({
      ...prev,
      ...info,
      name: user?.name || prev.name, // Name remains locked to the user prop or existing context value
    }));
    showToast("Settings saved.");
  };

  // *** NEW TERM SETTER ***
  const setCurrentTerm = (term) => {
    setCurrentTermState(term);
    showToast(`Current term set to: ${term}`);
  };

  const contextValue = useMemo(
    () => ({
      classes,
      attendance,
      facultyInfo,
      currentTerm, // *** NEW CONTEXT VALUE ***
      setCurrentTerm, // *** NEW CONTEXT FUNCTION ***
      addClass,
      updateClass,
      deleteClass,
      addAttendanceRecord,
      updateAttendanceRecord,
      updateFacultyInfo,
      showToast,
      // Setters added for App component functions (logout/archive)
      setClasses,
      setAttendance,
      setFacultyInfo,
      // *** NEW CONTEXT VALUES ***
      selectedClassForDetail,
      setSelectedClassForDetail,
    }),
    [classes, attendance, facultyInfo, selectedClassForDetail, currentTerm] // *** ADDED currentTerm DEPENDENCY ***
  );

  return (
    <DashboardContext.Provider value={contextValue}>
      {children}
      {/* Toast Notification (Dark Theme Compatible) */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.3 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.5 }}
            className={`fixed bottom-5 right-5 p-4 rounded-xl shadow-2xl ${FORMAL_COLORS.TEXT_PRIMARY
              } font-semibold z-50 transition-all ${toastMessage.type === "success" ? "bg-green-600" : "bg-red-600"
              }`}
          >
            {toastMessage.message}
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardContext.Provider>
  );
};

// Custom hook to use the dashboard context
const useDashboard = () => useContext(DashboardContext);

// --- CUSTOM MODAL COMPONENTS (Kept as is) ---
const CustomModal = ({
  isOpen,
  title,
  message,
  type,
  onConfirm,
  onCancel,
  statusMessage,
}) => {
  if (!isOpen) return null;

  const colorMap = {
    logout: {
      bg: "bg-red-700",
      icon: "fas fa-sign-out-alt",
      confirmText: "Confirm Logout",
    },
    archive: {
      bg: "bg-yellow-600",
      icon: "fas fa-archive",
      confirmText: "Confirm Archive",
    },
    delete: {
      bg: "bg-red-700",
      icon: "fas fa-trash-alt",
      confirmText: "Confirm Delete",
    },
    confirm: {
      bg: "bg-blue-700",
      icon: "fas fa-info-circle",
      confirmText: "Continue",
    },
    warning: { // NEW TYPE FOR WARNINGS/ALERTS
      bg: "bg-yellow-600",
      icon: "fas fa-exclamation-triangle",
      confirmText: "Acknowledge",
    }
  };
  const { bg, icon, confirmText } = colorMap[type] || colorMap.confirm;

  return (
    <div
      className="fixed inset-0 bg-slate-900 bg-opacity-90 z-50 flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.3 }}
        className={`${FORMAL_COLORS.BG_SECONDARY
          } rounded-xl shadow-2xl w-full max-w-md p-6 space-y-6 ${FORMAL_COLORS.BORDER}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center space-x-4 border-b border-slate-700 pb-4">
          <i
            className={`${icon} text-2xl text-white p-2 rounded-full ${bg}`}
          ></i>
          <h3 className="text-xl font-bold text-white">{title}</h3>
        </div>

        <p className={FORMAL_COLORS.TEXT_SECONDARY}>{message}</p>
        <p className="text-sm font-medium text-green-400">{statusMessage}</p>

        <div className="flex justify-end space-x-3 pt-4 border-t border-slate-700">
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-slate-600 text-white rounded-lg hover:bg-slate-700 transition font-medium text-sm"
            >
              Cancel
            </button>
          )}
          {onConfirm && (
            <button
              onClick={onConfirm}
              className={`px-4 py-2 ${bg} text-white rounded-lg hover:opacity-90 transition font-medium shadow-md text-sm`}
            >
              {confirmText || "Confirm"}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

// --- NEW COMPONENT: CustomDateModal (Using react-datepicker) ---
const CustomDateModal = ({ isOpen, currentDate, onDateSelect, onClose }) => {
  if (!isOpen) return null;

  // currentDate is YYYY-MM-DD string, so parse it.
  const initialDate = currentDate ? parseISO(currentDate) : new Date();
  const [selectedDate, setSelectedDate] = useState(initialDate);

  const handleSelect = () => {
    // Format back to YYYY-MM-DD string before calling onDateSelect
    onDateSelect(format(selectedDate, "yyyy-MM-dd"));
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-slate-900 bg-opacity-90 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.3 }}
        className={`${FORMAL_COLORS.BG_SECONDARY
          } rounded-xl shadow-2xl w-full max-w-xs sm:max-w-md p-6 space-y-4 ${FORMAL_COLORS.BORDER}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center space-x-3 border-b border-blue-700 pb-3">
          <i
            className={`fas fa-calendar-alt text-2xl ${FORMAL_COLORS.ACCENT_TEXT}`}
          ></i>
          <h3 className="text-xl font-bold text-white">Select Schedule Date</h3>
        </div>

        {/* --- LIVE CALENDAR COMPONENT --- */}
        <div className="p-1 flex justify-center custom-datepicker-container">
          <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            inline
            // These classes are hints for the global CSS override provided in App.
            className="w-full"
            calendarClassName="bg-slate-800 text-white shadow-xl rounded-lg"
          />
        </div>

        <p
          className={`text-sm font-medium pt-2 ${FORMAL_COLORS.TEXT_SECONDARY}`}
        >
          Selected Date:{" "}
          <span className="text-white font-semibold">
            {format(selectedDate, "PPP")}
          </span>
        </p>
        {/* --- END LIVE CALENDAR COMPONENT --- */}

        <div className="flex justify-end space-x-3 pt-4 border-t border-slate-700">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-600 text-white rounded-lg hover:bg-slate-700 transition font-medium text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSelect}
            className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium shadow-md text-sm`}
          >
            Set Date
          </button>
        </div>
      </motion.div>
    </div>
  );
};
// --- END CustomDateModal ---

// --- NEW COMPONENT: CustomTimeModal (FOR TIME PICKER) ---
const CustomTimeModal = ({ isOpen, currentSchedule, onTimeSelect, onClose }) => {
  const { showToast } = useDashboard(); // Use toast instead of alert

  if (!isOpen) return null;

  const { start24, end24 } = parseScheduleTo24Hr(currentSchedule);

  const [startTime, setStartTime] = useState(start24 || "09:00");
  const [endTime, setEndTime] = useState(end24 || "10:30");

  const handleSelect = () => {
    if (!startTime || !endTime) {
      showToast("Please select both start and end times.", "error"); // Changed from alert
      return;
    }

    // Convert 24-hour HH:MM strings to minutes since midnight
    const [startH, startM] = startTime.split(":").map(Number);
    const [endH, endM] = endTime.split(":").map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    if (endMinutes <= startMinutes) {
      showToast("End time must be after the start time.", "error"); // Changed from alert
      return;
    }

    // Convert minutes back to AM/PM format
    const startAmPm = minutesToAmPm(startMinutes);
    const endAmPm = minutesToAmPm(endMinutes);

    // Construct the final schedule string
    const finalSchedule = `${startAmPm} - ${endAmPm}`;

    onTimeSelect(finalSchedule);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-slate-900 bg-opacity-90 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.3 }}
        className={`${FORMAL_COLORS.BG_SECONDARY
          } rounded-xl shadow-2xl w-full max-w-sm p-6 space-y-6 ${FORMAL_COLORS.BORDER}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center space-x-3 border-b border-blue-700 pb-3">
          <i
            className={`fas fa-clock text-2xl ${FORMAL_COLORS.ACCENT_TEXT}`}
          ></i>
          <h3 className="text-xl font-bold text-white">Select Schedule Time</h3>
        </div>

        {/* Time Inputs */}
        <div className="space-y-4">
          <div>
            <label
              htmlFor="startTime"
              className={`block text-sm font-medium ${FORMAL_COLORS.TEXT_SECONDARY} mb-1`}
            >
              Class Start Time
            </label>
            <input
              type="time"
              id="startTime"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
              className={`block w-full rounded-md ${FORMAL_COLORS.BORDER} ${FORMAL_COLORS.BG_PRIMARY} shadow-sm p-3 border text-sm ${FORMAL_COLORS.TEXT_PRIMARY} focus:border-blue-500 focus:ring-blue-500`}
            />
          </div>
          <div>
            <label
              htmlFor="endTime"
              className={`block text-sm font-medium ${FORMAL_COLORS.TEXT_SECONDARY} mb-1`}
            >
              Class End Time
            </label>
            <input
              type="time"
              id="endTime"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
              className={`block w-full rounded-md ${FORMAL_COLORS.BORDER} ${FORMAL_COLORS.BG_PRIMARY} shadow-sm p-3 border text-sm ${FORMAL_COLORS.TEXT_PRIMARY} focus:border-blue-500 focus:ring-blue-500`}
            />
          </div>
        </div>

        <p
          className={`text-sm font-medium pt-2 ${FORMAL_COLORS.TEXT_SECONDARY}`}
        >
          Selected Schedule:{" "}
          <span className="text-white font-semibold">
            {minutesToAmPm(timeToMinutes(minutesToAmPm(timeToMinutes(startTime))))} - {minutesToAmPm(timeToMinutes(minutesToAmPm(timeToMinutes(endTime))))}
          </span>
        </p>

        <div className="flex justify-end space-x-3 pt-4 border-t border-slate-700">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-600 text-white rounded-lg hover:bg-slate-700 transition font-medium text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSelect}
            className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium shadow-md text-sm`}
          >
            Set Time
          </button>
        </div>
      </motion.div>
    </div>
  );
};
// --- END CustomTimeModal ---

// --- COMPONENT: Sidebar (The functional navigation structure) ---
const Sidebar = ({
  activePage,
  setActivePage,
  handleLogout,
  handleArchiveData,
  isMobileDrawer,
  isDrawerOpen,
}) => {
  const NavItem = ({ name, icon, page }) => (
    <button
      onClick={() => setActivePage(page)}
      className={`flex items-center space-x-3 p-3 rounded-xl w-full text-left font-medium transition duration-200 ${activePage === page
          ? `${FORMAL_COLORS.BG_ACCENT} text-white shadow-lg`
          : `${FORMAL_COLORS.TEXT_SECONDARY} hover:bg-slate-700 hover:text-white`
        }`}
    >
      <i className={`fas fa-${icon}`}></i>
      <span>{name}</span>
    </button>
  );

  return (
    // The fixed/absolute positioning and z-index are key for mobile responsiveness
    <motion.div
      initial={isMobileDrawer ? { x: "-100%" } : {}}
      animate={isMobileDrawer ? { x: isDrawerOpen ? 0 : "-100%" } : {}}
      exit={isMobileDrawer ? { x: "-100%" } : {}}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className={`h-full flex flex-col justify-between ${FORMAL_COLORS.BG_PRIMARY
        }
			p-6 flex-shrink-0 w-64
			${isMobileDrawer
          ? `fixed inset-y-0 left-0 z-50 shadow-2xl lg:hidden`
          : `relative shadow-2xl lg:shadow-none` // Static state on desktop
        }
			`}
    >
      <div>
        <h1 className="text-2xl font-bold text-white mb-6 border-b border-slate-700 pb-3">
          <i
            className={`fas fa-graduation-cap mr-2 ${FORMAL_COLORS.ACCENT_TEXT}`}
          ></i>{" "}
          Faculty Dashboard
        </h1>
        {/* === MOBILE CLOSE BUTTON (NEW) === */}
        {isMobileDrawer && isDrawerOpen && (
          <div className="absolute top-4 right-4 lg:hidden">
            <button
              onClick={() => setActivePage("__CLOSE_DRAWER__")} // Special action to close
              className={`text-2xl p-1 ${FORMAL_COLORS.TEXT_SECONDARY} hover:text-white transition`}
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        )}
        {/* === END MOBILE CLOSE BUTTON === */}
        <nav className="space-y-3">
          <NavItem name="Overview" icon="chart-line" page="Overview" />
          <NavItem name="Attendance" icon="camera" page="Attendance" />
          <NavItem name="Classes " icon="chalkboard-teacher" page="Classes" />
          {/* *** NEW NAVIGATION ITEM FOR TERM *** */}
          <NavItem name="Term " icon="calendar-alt" page="Term" />
          <NavItem name="Settings" icon="cog" page="Settings" />
        </nav>
      </div>
      <div className="mt-auto space-y-2 border-t border-slate-700 pt-3">
        {/* Archive Data button */}
        <button
          onClick={() => handleArchiveData()}
          className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg bg-yellow-600 hover:bg-yellow-700 text-white font-medium transition-colors"
        >
          <i className="fas fa-archive text-base"></i>
          <span className="text-base">Archive</span>
        </button>

        {/* Logout button */}
        <button
          onClick={() => handleLogout()}
          className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors"
        >
          <i className="fas fa-sign-out-alt text-base"></i>
          <span className="text-base">Logout</span>
        </button>
      </div>
    </motion.div>
  );
};

// --- COMPONENT: Topbar (Dark Theme) ---

const Topbar = ({ onMobileMenuToggle }) => {
  const { facultyInfo } = useDashboard();
  const [dateTime, setDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = dateTime.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const formattedTime = dateTime.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <header
      className={`${FORMAL_COLORS.BG_SECONDARY
        } shadow-xl p-4 flex justify-between items-center sticky top-0 z-30 ${FORMAL_COLORS.BORDER}`}
    >
      <div className="flex items-center">
        {/* Hamburger menu: visible only on non-large screens (mobile/tablet) */}
        <button
          onClick={onMobileMenuToggle}
          className="text-2xl p-1 transition-colors duration-200 mr-4 text-blue-500 hover:text-white lg:hidden"
        >
          <i className="fas fa-bars"></i>
        </button>
        {/* Responsive text size for date/time */}
        <div className="text-sm md:text-lg font-semibold text-white">
          <i className="far fa-calendar-alt mr-2 text-blue-400"></i>{" "}
          {formattedDate}
          <span
            className={`ml-2 md:ml-4 ${FORMAL_COLORS.TEXT_SECONDARY} inline`}
          >
            <i className="far fa-clock mr-1"></i> {formattedTime}
          </span>
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <span className={`md:text-base text-white font-semibold text-lg`}>
          {facultyInfo.name}
        </span>
        <div
          className={`w-8 h-8 rounded-full ${FORMAL_COLORS.BG_ACCENT.replace(
            "bg-",
            "bg-"
          )} flex items-center justify-center text-white font-bold text-sm`}
        >
          {facultyInfo.name ? facultyInfo.name.charAt(0) : "F"}
        </div>
      </div>
    </header>
  );
};

// --- COMPONENT: StudentDetailsModal (Dark Theme) ---
const StudentDetailsModal = ({
  isOpen,
  onClose,
  status,
  students,
  todayDate,
}) => {
  if (!isOpen) return null;

  // Determine color scheme
  const statusColorMap = {
    Present: {
      bg: "bg-green-700",
      text: "text-green-300",
      border: "border-green-400",
    },
    Late: {
      bg: "bg-yellow-700",
      text: "text-yellow-300",
      border: "border-yellow-400",
    },
    Absent: {
      bg: "bg-red-700",
      text: "text-red-300",
      border: "border-red-400",
    },
  };
  const { bg, text, border } = statusColorMap[status] || statusColorMap.Present;

  return (
    <div
      className="fixed inset-0 bg-gray-900 bg-opacity-75 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.3 }}
        // Max width and height optimized for smaller screens
        className={`${FORMAL_COLORS.BG_SECONDARY
          } rounded-2xl shadow-2xl w-full max-w-xs sm:max-w-md md:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col ${FORMAL_COLORS.TEXT_PRIMARY}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className={`p-5 flex justify-between items-center text-white rounded-t-2xl ${bg}`}
        >
          <h2 className="text-xl sm:text-2xl font-bold">
            <i
              className={`fas fa-${status === "Present"
                  ? "check-circle"
                  : status === "Late"
                    ? "exclamation-circle"
                    : "times-circle"
                } mr-2`}
            ></i>
            {status} Students ({students.length})
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-300 transition text-2xl"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Sub-Header with Date */}
        <div className={`px-5 pt-3 pb-1 ${FORMAL_COLORS.BG_SECONDARY}`}>
          <p className="text-sm font-medium text-white">
            Date:{" "}
            <span className="font-semibold text-blue-400">{todayDate}</span>
          </p>
        </div>

        {/* Content - Scrollable for many students */}
        <div className="p-4 sm:p-5 flex-1 overflow-y-auto">
          {students.length > 0 ? (
            <div className="space-y-3">
              {students.map((student, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-3 rounded-xl ${FORMAL_COLORS.BG_PRIMARY
                    } flex justify-between items-center border-l-4 ${border}`}
                >
                  <span className="font-semibold text-white text-sm sm:text-lg truncate">
                    {student.studentName}
                  </span>
                  <span
                    className={`text-xs sm:text-sm font-medium ${text} ml-2 whitespace-nowrap`}
                  >
                    <span className="font-bold mr-1">{student.status}:</span>
                    {student.timeIn !== "N/A"
                      ? `${student.timeIn}`
                      : "No Scan Time"}
                  </span>
                </motion.div>
              ))}
            </div>
          ) : (
            <div
              className={`text-center p-6 ${FORMAL_COLORS.BG_PRIMARY} rounded-xl`}
            >
              <i className="fas fa-frown text-3xl sm:text-4xl text-gray-500 mb-3"></i>
              <p className="text-gray-300 font-medium text-sm">
                No students currently marked as {status} in today's records.
              </p>
              {status === "Absent" && (
                <p className="text-xs text-gray-400 mt-2">
                  (Note: This list only includes students explicitly marked
                  Absent, not all unscanned students.)
                </p>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

// --- COMPONENT: OverviewPage (Dark Theme) ---
const ClickableCard = ({
  title,
  value,
  icon,
  color,
  onClick,
  status,
  footer,
}) => (
  <motion.button
    onClick={() => onClick(status)}
    whileHover={{ y: -3, boxShadow: "0 10px 20px -5px rgba(0, 0, 0, 0.3)" }}
    whileTap={{ scale: 0.98 }}
    className={`${FORMAL_COLORS.BG_SECONDARY
      } p-4 sm:p-6 rounded-xl shadow-lg border-b-4 ${color} flex flex-col justify-between h-full w-full text-left transition-all duration-300 transform hover:ring-2 hover:ring-opacity-50 hover:ring-blue-500/50`}
  >
    <div className="flex items-center justify-between">
      <h3
        className={`text-xs sm:text-sm font-medium uppercase ${FORMAL_COLORS.TEXT_SECONDARY}`}
      >
        {title}
      </h3>
      <i
        className={`fas fa-${icon} text-2xl sm:text-3xl ${color.split(" ")[1]}`}
      ></i>
    </div>
    <p
      className={`text-2xl sm:text-3xl font-bold ${FORMAL_COLORS.TEXT_PRIMARY} my-1`}
    >
      {value}
    </p>
    {footer && (
      <p
        className={`text-xs ${FORMAL_COLORS.TEXT_SECONDARY} pt-2 border-t ${FORMAL_COLORS.BORDER} hidden sm:block`}
      >
        {footer}
      </p>
    )}
  </motion.button>
);

// MODIFIED OverviewPage to accept setActivePage
const OverviewPage = ({ setActivePage }) => {
  const { attendance, classes, currentTerm } = useDashboard(); // *** ADDED currentTerm ***
  const today = getTodayDate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStatus, setModalStatus] = useState("Present");

  const todayAttendance = useMemo(
    () => attendance.filter((r) => r.date === today),
    [attendance, today]
  );

  const presentRecords = todayAttendance.filter((r) => r.status === "Present");
  const lateRecords = todayAttendance.filter((r) => r.status === "Late");
  const absentRecords = todayAttendance.filter((r) => r.status === "Absent");

  const presentCount = Array.from(
    new Set(presentRecords.map((r) => r.studentName))
  ).length;
  const lateCount = Array.from(
    new Set(lateRecords.map((r) => r.studentName))
  ).length;
  const absentCount = Array.from(
    new Set(absentRecords.map((r) => r.studentName))
  ).length;

  const totalScanned = presentCount + lateCount + absentCount;

  // *** FILTER CLASSES BY CURRENT TERM ***
  const termClasses = classes.filter((c) => c.term === currentTerm);
  const totalClasses = termClasses.length; // *** USE FILTERED COUNT ***
  const latestClass =
    termClasses.length > 0 ? termClasses[termClasses.length - 1] : null;

  const chartData = [
    { name: "Present", value: presentCount, fill: "#10b981" }, // emerald
    { name: "Late", value: lateCount, fill: "#f59e0b" }, // amber
    { name: "Absent", value: absentCount, fill: "#ef4444" }, // red
  ];

  const handleCardClick = (status) => {
    // This is for the attendance stats (Present/Late/Absent)
    setModalStatus(status);
    setIsModalOpen(true);
  };

  // NEW: Handler for Total Classes card
  const handleClassesClick = () => {
    setActivePage("Classes");
  };

  const studentsToDisplay = useMemo(() => {
    let records;
    if (modalStatus === "Present") records = presentRecords;
    else if (modalStatus === "Late") records = lateRecords;
    else if (modalStatus === "Absent") records = absentRecords;
    else return [];

    const uniqueStudentsMap = new Map();
    // Use the latest record for each unique student for the list
    records.forEach((r) => {
      const existing = uniqueStudentsMap.get(r.studentName);
      if (
        !existing ||
        (r.timeIn &&
          existing.timeIn &&
          timeToMinutes(r.timeIn) > timeToMinutes(existing.timeIn))
      ) {
        uniqueStudentsMap.set(r.studentName, r);
      }
    });

    return Array.from(uniqueStudentsMap.values());
  }, [modalStatus, presentRecords, lateRecords, absentRecords]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 md:p-6 space-y-6 sm:space-y-8"
    >
      <h2
        className={`text-xl md:text-2xl font-bold ${FORMAL_COLORS.ACCENT_TEXT}`}
      >
        Today's Attendance Snapshot <br />
        {/* *** NEW TERM DISPLAY *** */}
        <span className="text-sm text-white/80">
          Academic Term:{" "}
          <span className="font-semibold text-blue-400">{currentTerm}</span>
        </span>
      </h2>

      {/* Stats Cards (Responsive Grid: 2 columns -> 4 columns) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <ClickableCard
          title="Present Students"
          value={presentCount}
          icon="user-check"
          color="border-green-500 text-green-500"
          onClick={handleCardClick}
          status="Present"
          footer={`Total recorded attendance: ${totalScanned}`}
        />
        <ClickableCard
          title="Late Arrivals"
          value={lateCount}
          icon="user-clock"
          color="border-yellow-500 text-yellow-500"
          onClick={handleCardClick}
          status="Late"
          footer={`Scanned/Recorded Late: ${lateRecords.length}`}
        />
        <ClickableCard
          title="Explicitly Absent"
          value={absentCount}
          icon="user-times"
          color="border-red-500 text-red-500"
          onClick={handleCardClick}
          status="Absent"
          footer={`Manually marked Absent: ${absentRecords.length}`}
        />

        {/* Total Classes - NOW CLICKABLE */}
        <motion.button
          onClick={handleClassesClick} // NEW CLICK HANDLER
          whileHover={{ y: -3, boxShadow: "0 0 15px rgba(66, 153, 225, 0.5)" }}
          whileTap={{ scale: 0.98 }}
          className={`${FORMAL_COLORS.BG_SECONDARY
            } p-4 sm:p-6 rounded-xl shadow-lg border-b-4 border-blue-600 flex flex-col justify-between h-full text-left transition-all duration-300 transform hover:ring-2 hover:ring-opacity-50 hover:ring-blue-500/50`}
        >
          <div className="flex items-center justify-between">
            <h3
              className={`text-xs sm:text-sm font-medium uppercase ${FORMAL_COLORS.TEXT_SECONDARY}`}
            >
              Total Classes ({currentTerm})
            </h3>
            <i
              className={`fas fa-chalkboard-teacher text-2xl sm:text-3xl ${FORMAL_COLORS.ACCENT_TEXT}`}
            ></i>
          </div>
          <p
            className={`text-2xl sm:text-3xl font-bold ${FORMAL_COLORS.TEXT_PRIMARY} my-1`}
          >
            {totalClasses}
          </p>
          <p
            className={`text-xs ${FORMAL_COLORS.TEXT_SECONDARY} pt-2 border-t ${FORMAL_COLORS.BORDER} hidden sm:block`}
          >
            Latest: {latestClass ? latestClass.subject : "N/A"}
          </p>
        </motion.button>
      </div>

      {/* Visual & Detailed Overview (Responsive Grid: 1 column -> 3 columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Chart (Dark Theme Applied) - uses ResponsiveContainer */}
        <motion.div
          className={`${FORMAL_COLORS.BG_SECONDARY
            } lg:col-span-2 p-4 sm:p-6 rounded-xl shadow-lg ${FORMAL_COLORS.BORDER}`}
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
        >
          <h3 className={`text-xl font-bold mb-4 ${FORMAL_COLORS.ACCENT_TEXT}`}>
            Daily Attendance Ratio (Recorded)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={chartData}
              margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis dataKey="name" stroke="#a3b3c9" />
              <YAxis allowDecimals={false} stroke="#a3b3c9" />
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: `1px solid #475569`,
                  backgroundColor: "#0f172a",
                  color: "#e2e8f0",
                }}
              />
              <Bar dataKey="value" name="Students" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Attendance Summary List (Dark Theme Applied) */}
        <div
          className={`${FORMAL_COLORS.BG_SECONDARY
            } lg:col-span-1 p-4 sm:p-6 rounded-xl shadow-lg ${FORMAL_COLORS.BORDER}`}
        >
          <h3 className={`text-xl font-bold mb-4 ${FORMAL_COLORS.ACCENT_TEXT}`}>
            Recent Scans ({totalScanned})
          </h3>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {todayAttendance
              .slice(-5)
              .reverse()
              .map((record) => (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`p-3 ${FORMAL_COLORS.BG_PRIMARY
                    } rounded-lg flex justify-between items-center border ${FORMAL_COLORS.BORDER}`}
                >
                  <span
                    className={`font-medium ${FORMAL_COLORS.TEXT_PRIMARY} truncate text-sm`}
                  >
                    {record.studentName}
                  </span>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ml-2 whitespace-nowrap ${record.status === "Present"
                        ? "bg-green-800 text-green-200"
                        : record.status === "Late"
                          ? "bg-yellow-800 text-yellow-200"
                          : "bg-red-800 text-red-200"
                      }`}
                  >
                    {record.status}
                  </span>
                </motion.div>
              ))}
          </div>
          {totalScanned === 0 && (
            <p className={`${FORMAL_COLORS.TEXT_SECONDARY} italic text-sm`}>
              No attendance recorded today.
            </p>
          )}
        </div>
      </div>

      {/* Student Details Modal */}
      <AnimatePresence>
        <StudentDetailsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          status={modalStatus}
          students={studentsToDisplay}
          todayDate={format(parseISO(today), "EEEE, MMM dd, yyyy")} // *** NEW PROP: Format the date for display ***
        />
      </AnimatePresence>
    </motion.div>
  );
};

// --- NEW COMPONENT: TermPage (for setting the current term) ---
const TermPage = () => {
  const { currentTerm, setCurrentTerm, showToast } = useDashboard(); // Added showToast

  const [termInput, setTermInput] = useState(currentTerm);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simple validation/formatting for the term
    if (termInput.trim()) {
      setCurrentTerm(termInput.trim());
    } else {
      showToast("Term cannot be empty.", "error"); // Changed from alert
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 md:p-6 space-y-6 sm:space-y-8"
    >
      <h2
        className={`text-2xl md:text-4xl font-extrabold ${FORMAL_COLORS.ACCENT_TEXT}`}
      >
        Academic Term Configuration
      </h2>

      <form
        onSubmit={handleSubmit}
        className={`${FORMAL_COLORS.BG_SECONDARY} p-4 sm:p-6 rounded-xl shadow-lg max-w-lg space-y-6 border-t-4 border-yellow-500`}
      >
        <div className="text-sm text-yellow-400 font-medium p-3 bg-yellow-900/30 rounded-lg border border-yellow-700">
          <i className="fas fa-info-circle mr-2"></i> Setting the Academic Term
          here filters ALL subsequent class creation and attendance displays.
        </div>

        <div>
          <label
            htmlFor="currentTerm"
            className={`block text-sm font-medium ${FORMAL_COLORS.TEXT_SECONDARY}`}
          >
            Current Active Academic Term
          </label>
          <input
            type="text"
            id="currentTerm"
            name="currentTerm"
            value={termInput}
            onChange={(e) => setTermInput(e.target.value)}
            required
            className={`mt-1 block w-full rounded-md ${FORMAL_COLORS.BORDER} ${FORMAL_COLORS.BG_PRIMARY} shadow-sm p-3 border text-sm ${FORMAL_COLORS.TEXT_PRIMARY} focus:border-yellow-500 focus:ring-yellow-500`}
            placeholder="e.g., 2024-2025 - Semester 2"
          />
        </div>

        <motion.button
          type="submit"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full py-3 text-sm bg-yellow-600 text-white font-bold rounded-lg shadow-md hover:bg-yellow-700 transition duration-150"
        >
          <i className="fas fa-check-circle mr-2"></i> Set Current Term
        </motion.button>
      </form>
    </motion.div>
  );
};
// --- END TermPage ---

// --- COMPONENT: ClassesPage (Dark Theme & Modal) ---
const ClassesPage = () => {
  const {
    classes,
    addClass,
    updateClass,
    deleteClass,
    showToast,
    setSelectedClassForDetail,
    currentTerm,
  } = useDashboard(); // *** ADDED currentTerm ***
  const initialFormState = {
    subject: "",
    year: "",
    section: "",
    time: "09:00 AM - 10:30 AM", // Updated default time
    date: getTodayDate(),
    term: currentTerm, // *** DEFAULTED to context term ***
  };
  const [formData, setFormData] = useState(initialFormState);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  // --- NEW STATE FOR DATE/TIME PICKER MODAL ---
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [isTimeModalOpen, setIsTimeModalOpen] = useState(false); // *** NEW STATE FOR TIME MODAL ***

  // *** STATE FOR DELETE CONFIRMATION MODAL ***
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteClassId, setDeleteClassId] = useState(null);

  // *** EFFECT TO UPDATE FORM TERM WHEN CONTEXT TERM CHANGES ***
  useEffect(() => {
    if (!isEditing) {
      setFormData((prev) => ({ ...prev, term: currentTerm }));
    }
  }, [currentTerm, isEditing]);

  // --- NEW VALIDATION HANDLER (Simplified for 'time' field) ---
  const validateAndHandleChange = (e) => {
    let { name, value } = e.target;

    // 1. Academic Year Validation: Numbers and Hyphen/Slash only (e.g., 2024-2025 or 2024/2025)
    if (name === "year") {
      // Allows digits, '-', and '/'
      const yearRegex = /^[0-9\-\/]*$/;
      if (!yearRegex.test(value)) {
        showToast(
          "Academic Year should only contain numbers, hyphens, or slashes (e.g., 2024-2025).",
          "error"
        );
        return; // Stop update if invalid characters are entered
      }
    }

    // If validation passes or for non-validated fields:
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  // --- END NEW VALIDATION HANDLER ---

  const handleSubmit = (e) => {
    e.preventDefault();
    const classData = { ...formData, term: formData.term || currentTerm }; // Ensure term is set

    // --- FINAL SUBMISSION VALIDATION ---
    // Stricter check on Academic Year: Must be four digits, a separator, and four digits.
    if (!/^\d{4}[\-\/]\d{4}$/.test(classData.year)) {
      showToast(
        "Error: Academic Year must be in a strict format like '2024-2025'.",
        "error"
      );
      return;
    }
    // Stricter check on Schedule Time: Must match HH:MM AM/PM - HH:MM AM/PM (case insensitive)
    // NOTE: This is less critical now that the picker enforces the format, but remains a safeguard.
    if (
      !/^\d{1,2}:\d{2}\s(?:AM|PM)\s\-\s\d{1,2}:\d{2}\s(?:AM|PM)$/i.test(
        classData.time
      )
    ) {
      showToast(
        "Error: Schedule Time format is incorrect. Use 'HH:MM AM/PM - HH:MM AM/PM'.",
        "error"
      );
      return;
    }
    // --- END FINAL SUBMISSION VALIDATION ---

    if (isEditing) {
      updateClass(editId, classData);
    } else {
      addClass(classData);
    }
    setFormData(initialFormState);
    setIsEditing(false);
    setEditId(null);
  };

  const handleEdit = (classItem) => {
    setFormData(classItem);
    setIsEditing(true);
    setEditId(classItem.id);
  };

  // NEW: Function to trigger the detail view
  const handleViewDetails = (id) => {
    setSelectedClassForDetail(id);
  };

  // Function to open the custom modal for delete
  const handleDeleteConfirm = (id) => {
    setDeleteClassId(id);
    setIsDeleteModalOpen(true);
  };

  // Function to execute the delete action
  const handleDeleteExecute = () => {
    if (deleteClassId) {
      deleteClass(deleteClassId); // *** deleteClass now handles attendance update and overview refresh ***
      showToast("Class and all records deleted successfully!", "error");
    }
    setIsDeleteModalOpen(false);
    setDeleteClassId(null);
  };

  const handleCancel = () => {
    setFormData(initialFormState);
    setIsEditing(false);
    setEditId(null);
  };

  const formFields = [
    {
      label: "Subject Name",
      name: "subject",
      type: "text",
      placeholder: "e.g., Data Structures",
    },
    {
      label: "Academic Year (e.g., 2024-2025)", // Added explicit format hint
      name: "year",
      type: "text",
      placeholder: "e.g., 2024-2025",
    },
    {
      label: "Section/Cohort",
      name: "section",
      type: "text",
      placeholder: "e.g., CS-B, 10th Grade",
    },
  ];

  // *** FILTER CLASSES BY CURRENT TERM ***
  const filteredClasses = classes.filter((c) => c.term === currentTerm);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 md:p-6 space-y-6 sm:space-y-8"
    >
      <h2
        className={`text-xl md:text-2xl font-bold ${FORMAL_COLORS.ACCENT_TEXT}`}
      >
        Class Management
      </h2>

      {/* Class Form (Responsive Grid) */}
      <motion.div
        initial={{ scale: 0.98, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`${FORMAL_COLORS.BG_SECONDARY} p-4 sm:p-6 rounded-xl shadow-lg border-t-4 border-blue-500`}
      >
        <h3 className={`text-xl md:text-2xl font-bold mb-4 text-white`}>
          {isEditing ? "Edit Class" : "Add New Class"}
        </h3>
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {formFields.map((field) => (
            <div key={field.name}>
              <label
                htmlFor={field.name}
                className={`block text-sm font-medium ${FORMAL_COLORS.TEXT_SECONDARY}`}
              >
                {field.label}
              </label>
              <input
                type={field.type}
                name={field.name}
                id={field.name}
                value={formData[field.name]}
                onChange={validateAndHandleChange} // *** USED VALIDATING HANDLER ***
                required
                className={`mt-1 block w-full rounded-md ${FORMAL_COLORS.BORDER} ${FORMAL_COLORS.BG_PRIMARY} shadow-sm p-3 border text-sm ${FORMAL_COLORS.TEXT_PRIMARY} focus:border-blue-500 focus:ring-blue-500`}
                placeholder={field.placeholder}
              />
            </div>
          ))}

          {/* *** NEW TERM FIELD IN FORM *** */}
          <div>
            <label
              htmlFor="term"
              className={`block text-sm font-medium ${FORMAL_COLORS.TEXT_SECONDARY}`}
            >
              Academic Term
            </label>
            <input
              type="text"
              name="term"
              id="term"
              value={formData.term}
              readOnly // Display-only, value set by context/initial state
              required
              className={`mt-1 block w-full rounded-md ${FORMAL_COLORS.BORDER} ${FORMAL_COLORS.BG_ACCENT} shadow-inner p-3 border text-sm ${FORMAL_COLORS.TEXT_PRIMARY} font-bold`}
              placeholder="Term Value"
            />
            <p className="text-xs mt-1 text-gray-400">
              This class belongs to the current term set in Term Setup.
            </p>
          </div>
          {/* === END NEW TERM FIELD === */}

          {/* === MODIFIED DATE FIELD FOR CALENDAR MODAL === */}
          <div>
            <label
              htmlFor="date"
              className={`block text-sm font-medium ${FORMAL_COLORS.TEXT_SECONDARY}`}
            >
              Schedule Date
            </label>
            <div className="flex mt-1">
              <input
                type="text"
                name="date"
                id="date"
                value={formData.date}
                readOnly // Make it read-only
                required
                className={`block w-full rounded-l-md ${FORMAL_COLORS.BORDER} ${FORMAL_COLORS.BG_PRIMARY} shadow-sm p-3 border text-sm ${FORMAL_COLORS.TEXT_PRIMARY} focus:border-blue-500 focus:ring-blue-500`}
                placeholder="Select date using the calendar button"
              />
              <motion.button
                type="button"
                onClick={() => setIsDateModalOpen(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`p-3 rounded-r-md ${FORMAL_COLORS.BG_ACCENT} text-white hover:bg-blue-800 transition shadow-md`}
              >
                <i className="fas fa-calendar-alt"></i>
              </motion.button>
            </div>
          </div>
          {/* === END MODIFIED DATE FIELD === */}

          {/* === MODIFIED TIME FIELD FOR TIME PICKER MODAL (CLEANED UP) === */}
          <div>
            <label
              htmlFor="time"
              className={`block text-sm font-medium ${FORMAL_COLORS.TEXT_SECONDARY}`}
            >
              Schedule Time
            </label>
            <div className="flex mt-1">
              <input
                type="text"
                name="time"
                id="time"
                value={formData.time}
                readOnly // Make it read-only
                required
                placeholder="Select time using the clock button"
                className={`block w-full rounded-l-md ${FORMAL_COLORS.BORDER} ${FORMAL_COLORS.BG_PRIMARY} shadow-sm p-3 border text-sm ${FORMAL_COLORS.TEXT_PRIMARY} focus:border-blue-500 focus:ring-blue-500`}
              />
              <motion.button
                type="button"
                onClick={() => setIsTimeModalOpen(true)} // *** OPEN TIME MODAL ***
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`p-3 rounded-r-md ${FORMAL_COLORS.BG_ACCENT} text-white hover:bg-blue-800 transition shadow-md`}
              >
                <i className="fas fa-clock"></i>
              </motion.button>
            </div>
            {/* REMOVED: Extra help text about time format */}
          </div>
          {/* === END MODIFIED TIME FIELD === */}

          <div className="md:col-span-2 flex justify-end space-x-3 mt-4">
            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 text-sm bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-150"
            >
              {isEditing ? "Save Changes" : "Add Class"}
            </motion.button>
            {isEditing && (
              <motion.button
                type="button"
                onClick={handleCancel}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 text-sm bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700 transition duration-150"
              >
                Cancel Edit
              </motion.button>
            )}
          </div>
        </form>
      </motion.div>

      {/* Class List Table (Dark Theme Applied) - uses overflow-x-auto for responsiveness */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className={`${FORMAL_COLORS.BG_SECONDARY} p-4 sm:p-6 rounded-xl shadow-lg`}
      >
        <h3 className={`text-xl md:text-2xl font-bold mb-4 text-white`}>
          Existing Classes in Term "{currentTerm}" ({filteredClasses.length})
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-slate-700">
              <tr>
                {[
                  "Subject",
                  "Year",
                  "Section",
                  "Term",
                  "Date",
                  "Time",
                  "Actions",
                ].map((header) => (
                  <th
                    key={header}
                    className={`px-3 sm:px-4 py-3 text-left text-xs font-medium ${FORMAL_COLORS.TEXT_SECONDARY} uppercase tracking-wider`}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody
              className={`${FORMAL_COLORS.BG_SECONDARY} divide-y divide-gray-700`}
            >
              {filteredClasses.map((c) => (
                <motion.tr
                  key={c.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="hover:bg-slate-700"
                >
                  <td
                    className={`px-3 sm:px-4 py-3 whitespace-nowrap text-xs sm:text-sm ${FORMAL_COLORS.TEXT_PRIMARY}`}
                  >
                    {c.subject}
                  </td>
                  <td
                    className={`px-3 sm:px-4 py-3 whitespace-nowrap text-xs sm:text-sm ${FORMAL_COLORS.TEXT_SECONDARY}`}
                  >
                    {c.year}
                  </td>
                  <td
                    className={`px-3 sm:px-4 py-3 whitespace-nowrap text-xs sm:text-sm ${FORMAL_COLORS.TEXT_SECONDARY}`}
                  >
                    {c.section}
                  </td>
                  {/* *** NEW TERM COLUMN *** */}
                  <td
                    className={`px-3 sm:px-4 py-3 whitespace-nowrap text-xs sm:text-sm ${FORMAL_COLORS.TEXT_PRIMARY} font-bold`}
                  >
                    {c.term}
                  </td>
                  <td
                    className={`px-3 sm:px-4 py-3 whitespace-nowrap text-xs sm:text-sm ${FORMAL_COLORS.TEXT_SECONDARY}`}
                  >
                    {c.date}
                  </td>
                  <td
                    className={`px-3 sm:px-4 py-3 whitespace-nowrap text-xs sm:text-sm ${FORMAL_COLORS.TEXT_SECONDARY}`}
                  >
                    {c.time}
                  </td>
                  <td className="px-3 sm:px-4 py-3 whitespace-nowrap text-xs sm:text-sm font-medium space-x-2">
                    <motion.button
                      onClick={() => handleEdit(c)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="text-blue-500 hover:text-blue-400"
                    >
                      <i className="fas fa-edit"></i>
                    </motion.button>
                    <motion.button
                      onClick={() => handleDeleteConfirm(c.id)} // UPDATED: Call custom modal function
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="text-red-500 hover:text-red-400 ml-2 sm:ml-3"
                    >
                      <i className="fas fa-trash-alt"></i>
                    </motion.button>
                    <motion.button
                      onClick={() => handleViewDetails(c.id)} // NEW: View Details button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="text-green-500 hover:text-green-400 ml-2 sm:ml-3"
                    >
                      <i className="fas fa-chart-bar"></i>
                    </motion.button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredClasses.length === 0 && (
          <p className="text-center py-4 text-gray-500 italic text-sm">
            No classes have been added yet for the term "{currentTerm}".
          </p>
        )}
      </motion.div>

      {/* Date Picker Modal (NEW) */}
      <AnimatePresence>
        <CustomDateModal
          isOpen={isDateModalOpen}
          currentDate={formData.date}
          onDateSelect={(newDate) =>
            setFormData((prev) => ({ ...prev, date: newDate }))
          }
          onClose={() => setIsDateModalOpen(false)}
        />
      </AnimatePresence>

      {/* Time Picker Modal (NEW) */}
      <AnimatePresence>
        <CustomTimeModal
          isOpen={isTimeModalOpen}
          currentSchedule={formData.time}
          onTimeSelect={(newTime) =>
            setFormData((prev) => ({ ...prev, time: newTime }))
          }
          onClose={() => setIsTimeModalOpen(false)}
        />
      </AnimatePresence>

      {/* Custom Delete Confirmation Modal */}
      <AnimatePresence>
        <CustomModal
          isOpen={isDeleteModalOpen}
          title="Confirm Class Deletion"
          message={`Are you sure you want to delete the class "${classes.find(c => c.id === deleteClassId)?.subject || 'N/A'}"? All associated attendance records will also be permanently removed.`}
          type="delete"
          onConfirm={handleDeleteExecute}
          onCancel={() => setIsDeleteModalOpen(false)}
          statusMessage="This action will also update the Overview statistics."
        />
      </AnimatePresence>
    </motion.div>
  );
};

// --- NEW COMPONENT: ClassDetailPage ---
const ClassDetailPage = ({ classId, onBackToClasses }) => {
  const { attendance, classes, facultyInfo } = useDashboard();
  const classData = classes.find((c) => c.id === classId);

  // Safety Check
  if (!classData) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-red-500 text-xl mb-4">Error: Class Not Found</h2>
        <p className={FORMAL_COLORS.TEXT_SECONDARY}>
          The selected class ID ({classId}) could not be found.
        </p>
        <button
          onClick={onBackToClasses}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Go Back to Class List
        </button>
      </div>
    );
  }

  const classRecords = attendance.filter((r) => r.classId === classId);

  // --- Data Aggregation for Chart (Real-time) ---
  const historicalChartData = useMemo(() => {
    // Group by date
    const recordsByDate = classRecords.reduce((acc, record) => {
      const dateKey = record.date;
      if (!acc[dateKey]) {
        acc[dateKey] = {
          Present: 0,
          Late: 0,
          Absent: 0,
          TotalScanned: 0,
        };
      }

      if (record.status === "Present") acc[dateKey].Present++;
      else if (record.status === "Late") acc[dateKey].Late++;
      else if (record.status === "Absent") acc[dateKey].Absent++;

      // Total scanned is the count of records that were not explicitly marked Absent without a timeIn (simplified)
      if (record.timeIn !== "N/A" && record.timeIn !== null) {
        acc[dateKey].TotalScanned++;
      }

      return acc;
    }, {});

    // Convert to Chart Data Format (Top 7 most recent dates)
    return Object.keys(recordsByDate)
      .sort((a, b) => new Date(b) - new Date(a)) // Sort descending by date (newest first)
      .slice(0, 7) // <--- MODIFIED: Changed from 10 to 7
      .reverse() // Reverse back to ascending for chart order (oldest on left)
      .map((date) => ({
        date: format(parseISO(date), "MMM dd"),
        Present: recordsByDate[date].Present,
        Late: recordsByDate[date].Late,
        Absent: recordsByDate[date].Absent,
      }));
  }, [classRecords]);

  // --- Prepare Student List for Detail View (Last seen) ---
  const studentDetailList = useMemo(() => {
    const latestRecordsMap = new Map();

    classRecords.forEach((record) => {
      const key = `${record.studentName}_${record.date}`; // Group by student and date

      // Keep the most complete or latest scan for a specific student on a specific day
      latestRecordsMap.set(key, record);
    });

    // Convert map to array and sort by date then name
    return Array.from(latestRecordsMap.values()).sort((a, b) => {
      // Sort by Date (newest first)
      const dateComparison = new Date(b.date) - new Date(a.date);
      if (dateComparison !== 0) return dateComparison;

      // Then sort by Student Name
      return a.studentName.localeCompare(b.studentName);
    });
  }, [classRecords]);

  const totalRecorded = classRecords.length;
  const uniqueStudents = Array.from(
    new Set(classRecords.map((r) => r.studentName))
  ).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 md:p-6 space-y-6 sm:space-y-8"
    >
      {/* Header and Back Button */}
      <div className="flex items-center justify-between mb-6">
        <h2
          className={`text-xl md:text-3xl font-bold ${FORMAL_COLORS.ACCENT_TEXT}`}
        >
          Details: **{classData.subject}** ({classData.section})
        </h2>
        <motion.button
          onClick={onBackToClasses}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-3 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition flex items-center text-sm"
        >
          <i className="fas fa-arrow-left mr-2"></i> Back to All Classes
        </motion.button>
      </div>

      {/* Summary Cards for the Class (Responsive Grid: 2 columns -> 4 columns) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div
          className={`${FORMAL_COLORS.BG_SECONDARY
            } p-4 sm:p-6 rounded-xl shadow-lg border-b-4 border-yellow-500 flex flex-col justify-between h-full text-left`}
        >
          <h3
            className={`text-xs sm:text-sm font-medium uppercase ${FORMAL_COLORS.TEXT_SECONDARY}`}
          >
            Academic Term
          </h3>
          <p
            className={`text-lg sm:text-xl font-bold ${FORMAL_COLORS.TEXT_PRIMARY} my-1`}
          >
            {classData.term}
          </p>
          <p
            className={`text-xs ${FORMAL_COLORS.TEXT_SECONDARY} pt-2 border-t ${FORMAL_COLORS.BORDER} hidden sm:block`}
          >
            Class Year: {classData.year}
          </p>
        </div>
        <div
          className={`${FORMAL_COLORS.BG_SECONDARY
            } p-4 sm:p-6 rounded-xl shadow-lg border-b-4 border-blue-500 flex flex-col justify-between h-full text-left`}
        >
          <h3
            className={`text-xs sm:text-sm font-medium uppercase ${FORMAL_COLORS.TEXT_SECONDARY}`}
          >
            Class Schedule
          </h3>
          <p
            className={`text-lg sm:text-xl font-bold ${FORMAL_COLORS.TEXT_PRIMARY} my-1`}
          >
            {classData.time}
          </p>
          <p
            className={`text-xs ${FORMAL_COLORS.TEXT_SECONDARY} pt-2 border-t ${FORMAL_COLORS.BORDER} hidden sm:block`}
          >
            Scheduled for: {classData.date}
          </p>
        </div>

        <div
          className={`${FORMAL_COLORS.BG_SECONDARY
            } p-4 sm:p-6 rounded-xl shadow-lg border-b-4 border-emerald-500 flex flex-col justify-between h-full text-left`}
        >
          <h3
            className={`text-xs sm:text-sm font-medium uppercase ${FORMAL_COLORS.TEXT_SECONDARY}`}
          >
            Unique Students Recorded
          </h3>
          <p className={`text-2xl sm:text-3xl font-bold text-emerald-400 my-1`}>
            {uniqueStudents}
          </p>
          <p
            className={`text-xs ${FORMAL_COLORS.TEXT_SECONDARY} pt-2 border-t ${FORMAL_COLORS.BORDER} hidden sm:block`}
          >
            Total Scans: {totalRecorded}
          </p>
        </div>

        {/* Placeholder for another metric */}
        <div
          className={`${FORMAL_COLORS.BG_SECONDARY
            } p-4 sm:p-6 rounded-xl shadow-lg border-b-4 border-gray-500 flex flex-col justify-between h-full text-left`}
        >
          <h3
            className={`text-xs sm:text-sm font-medium uppercase ${FORMAL_COLORS.TEXT_SECONDARY}`}
          >
            School Context
          </h3>
          <p
            className={`text-lg sm:text-xl font-bold ${FORMAL_COLORS.TEXT_PRIMARY} my-1`}
          >
            {facultyInfo.school}
          </p>
          <p
            className={`text-xs ${FORMAL_COLORS.TEXT_SECONDARY} pt-2 border-t ${FORMAL_COLORS.BORDER} hidden sm:block`}
          >
            Faculty: {facultyInfo.name}
          </p>
        </div>
      </div>

      <hr className={`border-t ${FORMAL_COLORS.BORDER}`} />

      {/* Historical Attendance Chart (Real-time updated) - uses ResponsiveContainer */}
      <motion.div
        className={`${FORMAL_COLORS.BG_SECONDARY} p-4 sm:p-6 rounded-xl shadow-lg border-t-4 border-yellow-500`}
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
      >
        <h3 className={`text-xl font-bold mb-4 ${FORMAL_COLORS.ACCENT_TEXT}`}>
          Last 7 Days Attendance Ratio ({classData.term})
        </h3>
        {historicalChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={historicalChartData}
              margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis dataKey="date" stroke="#a3b3c9" />
              <YAxis allowDecimals={false} stroke="#a3b3c9" />
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: `1px solid #475569`,
                  backgroundColor: "#0f172a",
                  color: "#e2e8f0",
                }}
              />
              <Bar
                dataKey="Present"
                stackId="a"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="Late"
                stackId="a"
                fill="#f59e0b"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="Absent"
                stackId="a"
                fill="#ef4444"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center bg-slate-800 rounded-lg">
            <p className="text-gray-400 italic">
              No historical attendance data found for this class.
            </p>
          </div>
        )}
      </motion.div>

      {/* Detailed Student List - uses overflow-x-auto for responsiveness */}
      <motion.div
        className={`${FORMAL_COLORS.BG_SECONDARY} p-4 sm:p-6 rounded-xl shadow-lg`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className={`text-xl md:text-2xl font-bold mb-4 text-white`}>
          Student Attendance Log ({uniqueStudents} Unique Students)
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-slate-700">
              <tr>
                {["Student Name", "Date", "Time In", "Status", "Time Out"].map(
                  (header) => (
                    <th
                      key={header}
                      className={`px-3 sm:px-4 py-3 text-left text-xs font-medium ${FORMAL_COLORS.TEXT_SECONDARY} uppercase tracking-wider`}
                    >
                      {header}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody
              className={`${FORMAL_COLORS.BG_SECONDARY} divide-y divide-gray-700`}
            >
              {studentDetailList.map((record) => (
                <motion.tr
                  key={record.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="hover:bg-slate-700"
                >
                  <td
                    className={`px-3 sm:px-4 py-3 whitespace-nowrap text-sm ${FORMAL_COLORS.TEXT_PRIMARY}`}
                  >
                    {record.studentName}
                  </td>
                  <td
                    className={`px-3 sm:px-4 py-3 whitespace-nowrap text-xs ${FORMAL_COLORS.TEXT_SECONDARY}`}
                  >
                    {record.date}
                  </td>
                  <td
                    className={`px-3 sm:px-4 py-3 whitespace-nowrap text-xs ${FORMAL_COLORS.TEXT_SECONDARY}`}
                  >
                    {record.timeIn || "N/A"}
                  </td>
                  <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${record.status === "Present"
                          ? "bg-green-800 text-green-200"
                          : record.status === "Late"
                            ? "bg-yellow-800 text-yellow-200"
                            : "bg-red-800 text-red-200"
                        }`}
                    >
                      {record.status}
                    </span>
                  </td>
                  <td
                    className={`px-3 sm:px-4 py-3 whitespace-nowrap text-xs ${FORMAL_COLORS.TEXT_SECONDARY}`}
                  >
                    {record.timeOut || (
                      <span className="text-blue-400">Active...</span>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalRecorded === 0 && (
          <p className="text-center py-4 text-gray-500 italic text-sm">
            No attendance records for this class.
          </p>
        )}
      </motion.div>
    </motion.div>
  );
};
// --- END ClassDetailPage ---

// --- COMPONENT: AttendancePage (Dark Theme) ---
const AttendancePage = () => {
  const {
    classes,
    attendance,
    addAttendanceRecord,
    updateAttendanceRecord,
    showToast,
    currentTerm, // *** ADDED currentTerm ***
  } = useDashboard();
  const [selectedClassId, setSelectedClassId] = useState("");
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // ❗ NEW STATE: To toggle between manual select and automatic face scan for OUT
  // Options: "IN_SCAN_FIRST" | "FACE_OUT"
  const [scanMode, setScanMode] = useState("IN_SCAN_FIRST");

  // OLD STATE: For manual selection (now only used if scanMode is "IN_SCAN_FIRST")
  const [selectedStudentForOut, setSelectedStudentForOut] = useState("");

  // *** STATE FOR RESET CONFIRMATION MODAL ***
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);


  const activeClass = useMemo(
    () => classes.find((c) => c.id === selectedClassId),
    [selectedClassId, classes]
  );

  const todayAttendance = useMemo(() => {
    const today = getTodayDate();
    // Filter to only include records for the selected class today
    return attendance.filter(
      (r) => r.classId === selectedClassId && r.date === today
    );
  }, [attendance, selectedClassId]);

  // NEW: List of students currently scanned IN but not OUT
  const activeStudents = useMemo(() => {
    // Create a map of studentName -> most recent attendance record
    const activeMap = new Map();
    todayAttendance.forEach((record) => {
      // Keep only the latest "IN" record that has no "OUT" time
      if (!record.timeOut) {
        // Simple heuristic: rely on timeIn to determine the latest "active" scan
        const existing = activeMap.get(record.studentName);
        if (
          !existing ||
          (record.timeIn &&
            existing.timeIn &&
            timeToMinutes(record.timeIn) > timeToMinutes(existing.timeIn))
        ) {
          activeMap.set(record.studentName, record);
        }
      }
    });
    return Array.from(activeMap.values());
  }, [todayAttendance]);

  // --- Camera Control Logic (Remains the same) ---
  const startCamera = async () => {
    if (isCameraActive) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraActive(true);
        videoRef.current.play();
        showToast("Camera started successfully!");
      }
    } catch (error) {
      console.error("Error accessing webcam: ", error);
      showToast("Error: Could not access webcam. Check permissions.", "error");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => stopCamera, []);

  // --- MOCK Face Capture (In/Out/Absent Logic) - UPDATED FOR MODE ---
  const handleCaptureFace = () => {
    if (!activeClass) {
      showToast("Please select an active class first.", "error");
      return;
    }
    if (!isCameraActive) {
      showToast("Please start the camera first.", "error");
      return;
    }

    const currentTime = getLocalTime();
    const today = getTodayDate();

    // --- 1. OVERDUE CHECK ---
    if (checkIfOverdue(activeClass.time)) {
      // In a real system, we'd still detect the face. Here, we mock a detected face.
      const studentNameForOverdue = "Student_OVERDUE_99";

      const newRecord = {
        studentName: studentNameForOverdue,
        status: "Absent",
        classId: activeClass.id,
        date: today,
        timeIn: currentTime, // Record the attempt time
        timeOut: null,
      };
      addAttendanceRecord(newRecord);
      setSelectedStudentForOut(""); // Clear manual select
      setScanMode("IN_SCAN_FIRST"); // Reset mode
      showToast(
        `Class is over. ${studentNameForOverdue} marked ABSENT (Scanned at ${currentTime}).`,
        "error"
      );
      return;
    }

    // --- 2. Determine Scan Action based on Mode ---

    if (scanMode === "FACE_OUT" && activeStudents.length > 0) {
      // **NEW: FACE OUT MODE**
      // MOCK: Face detection happens here. For this mock, we'll randomly pick an active student.
      const randomIndex = Math.floor(Math.random() * activeStudents.length);
      const detectedRecord = activeStudents[randomIndex];
      const studentName = detectedRecord.studentName;

      // Process OUT
      const updatedRecord = {
        ...detectedRecord,
        timeOut: currentTime,
      };
      updateAttendanceRecord(detectedRecord.id, updatedRecord);

      showToast(
        `Scanned OUT: ${studentName} at ${currentTime} (Automatic Mode).`
      );
      // NOTE: We do NOT reset mode here, allowing continuous OUT scans.
    } else {
      // **DEFAULT/IN_SCAN_FIRST MODE** (Handles both new IN scan and selected OUT scan)

      if (selectedStudentForOut) {
        // Manual OUT Scan
        const studentNameForScan = selectedStudentForOut;
        const recordToUpdate = activeStudents.find(
          (r) => r.studentName === studentNameForScan
        );

        if (recordToUpdate) {
          const updatedRecord = {
            ...recordToUpdate,
            timeOut: currentTime,
          };
          updateAttendanceRecord(recordToUpdate.id, updatedRecord);
          showToast(`Scanned OUT: ${studentNameForScan} at ${currentTime}.`);
          setSelectedStudentForOut(""); // Clear selection after successful out scan
        } else {
          showToast(
            `${selectedStudentForOut} is not currently marked IN.`,
            "error"
          );
        }
      } else {
        // New IN Scan (Mock student name generation)
        const uniqueStudentNums = Array.from(
          new Set(
            todayAttendance.map((r) =>
              r.studentName.match(/\d+/)
                ? parseInt(r.studentName.match(/\d+/)[0])
                : 0
            )
          )
        );
        const maxNum =
          uniqueStudentNums.length > 0 ? Math.max(...uniqueStudentNums) : 0;
        const nextStudentNum = maxNum + 1;
        const studentNameForScan = `Student ${nextStudentNum}`;

        // Process IN
        const isStudentLate = checkIfLate(currentTime, activeClass.time);
        const status = isStudentLate ? "Late" : "Present";

        const newRecord = {
          studentName: studentNameForScan,
          status: status,
          classId: activeClass.id,
          date: today,
          timeIn: currentTime,
          timeOut: null,
        };

        addAttendanceRecord(newRecord);
        showToast(`Scanned IN: ${studentNameForScan} marked ${status}!`);
      }
    }
  };

  const handleSaveAttendance = () => {
    if (todayAttendance.length === 0) {
      showToast("No attendance records to save.", "error");
      return;
    }
    showToast("Attendance data synchronized and saved.");
  };

  // Function to open the custom modal for reset
  const handleResetAttendanceConfirm = () => {
    if (!selectedClassId) {
      showToast("Please select a class to reset its attendance.", "error");
      return;
    }
    setIsResetModalOpen(true);
  };

  // Function to execute the reset action
  const handleResetAttendanceExecute = () => {
    const today = getTodayDate();
    const recordsToKeep = attendance.filter(
      (r) => r.date !== today || r.classId !== selectedClassId
    );
    updateAttendanceRecord(null, recordsToKeep);
    showToast("Daily attendance records reset for this class.", "error");
    setSelectedStudentForOut(""); // Clear manual select
    setScanMode("IN_SCAN_FIRST"); // Reset mode
    setIsResetModalOpen(false);
  };

  // ❗ Handler for mode switch
  const handleModeSwitch = () => {
    setSelectedStudentForOut(""); // Clear manual selection when switching modes
    if (scanMode === "IN_SCAN_FIRST") {
      if (activeStudents.length === 0) {
        showToast(
          "No students are currently marked IN. Face OUT mode not available.",
          "error"
        );
        return;
      }
      setScanMode("FACE_OUT");
      showToast(
        "Switched to FACE OUT mode. Scan an active student's face.",
        "success"
      );
    } else {
      setScanMode("IN_SCAN_FIRST");
      showToast("Switched to IN/Manual OUT mode.", "success");
    }
  };

  // Helper to determine button style for mode switch
  const getModeButtonClasses = (mode) =>
    scanMode === mode
      ? "bg-blue-600 text-white shadow-lg"
      : "bg-slate-600 text-gray-300 hover:bg-slate-500";

  // *** FILTER CLASSES BY CURRENT TERM ***
  const termClasses = classes.filter((c) => c.term === currentTerm);

  // Dark theme applied
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 md:p-6"
    >
      <h2
        className={`text-2xl md:text-4xl font-extrabold ${FORMAL_COLORS.ACCENT_TEXT} mb-6`}
      >
        Attendance Scanner
      </h2>
      <h3 className={`text-xl font-bold mb-4 text-white`}>
        Active Term: <span className="text-yellow-400">{currentTerm}</span>
      </h3>

      {/* Class Selection (Responsive Layout) */}
      <div
        className={`mb-6 flex flex-col md:flex-row items-start md:items-center space-y-3 md:space-y-0 md:space-x-4 p-4 ${FORMAL_COLORS.BG_SECONDARY} rounded-xl border ${FORMAL_COLORS.BORDER}`}
      >
        <label
          className={`font-bold text-base ${FORMAL_COLORS.TEXT_PRIMARY} min-w-[120px]`}
        >
          Active Class:
        </label>
        <select
          value={selectedClassId}
          onChange={(e) => {
            setSelectedClassId(e.target.value);
            setSelectedStudentForOut(""); // Clear manual select on class change
            setScanMode("IN_SCAN_FIRST"); // Reset mode on class change
          }}
          className={`p-3 border ${FORMAL_COLORS.BORDER} rounded-lg shadow-inner w-full md:w-80 text-sm ${FORMAL_COLORS.BG_PRIMARY} ${FORMAL_COLORS.TEXT_PRIMARY} focus:ring-blue-500 focus:border-blue-500`}
        >
          <option value="" disabled>
            -- Choose a Class ({currentTerm}) --
          </option>
          {termClasses.map((c) => (
            // *** USING FILTERED CLASSES ***
            <option key={c.id} value={c.id}>
              {c.subject} ({c.section}) - {c.date}
            </option>
          ))}
        </select>

        {activeClass && (
          <div
            className={`md:ml-auto text-xs ${FORMAL_COLORS.ACCENT_TEXT} font-semibold p-2 ${FORMAL_COLORS.BG_PRIMARY} rounded-md`}
          >
            {activeClass.year} | {activeClass.time}
          </div>
        )}
      </div>

      {/* ❗ SCAN MODE TOGGLE (Responsive Layout) */}
      <div
        className={`mb-6 p-4 ${FORMAL_COLORS.BG_SECONDARY} rounded-xl border ${FORMAL_COLORS.BORDER} flex flex-col md:flex-row md:items-center justify-between`}
      >
        <h3
          className={`font-bold text-base mb-2 md:mb-0 ${FORMAL_COLORS.TEXT_PRIMARY}`}
        >
          Current Mode:{" "}
          <span className="text-blue-400">
            {scanMode === "FACE_OUT" ? "Automatic Time OUT" : "IN / Manual OUT"}
          </span>
        </h3>
        <div className="flex space-x-2">
          <motion.button
            type="button"
            onClick={handleModeSwitch}
            disabled={!selectedClassId}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`px-4 py-2 text-sm font-bold rounded-lg transition duration-150 disabled:opacity-50 ${getModeButtonClasses(
              scanMode
            )}`}
          >
            <i
              className={`fas fa-${scanMode === "FACE_OUT" ? "user-check" : "user-clock"
                } mr-1`}
            ></i>
            Switch to{" "}
            {scanMode === "FACE_OUT" ? "Face Scan OUT" : "IN/Manual OUT"}
          </motion.button>
          <motion.button
            type="button"
            onClick={stopCamera}
            disabled={!isCameraActive}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 text-sm bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition duration-150 disabled:opacity-50"
          >
            <i className="fas fa-stop-circle mr-1"></i> Stop Camera
          </motion.button>
        </div>
      </div>

      {/* Student Selection for Time Out (Conditional) */}
      <div
        className={`mb-6 p-4 ${FORMAL_COLORS.BG_SECONDARY} rounded-xl border ${FORMAL_COLORS.BORDER}`}
      >
        {scanMode === "FACE_OUT" ? (
          // New FACE_OUT description
          <div className="text-yellow-300 font-medium">
            <i className="fas fa-camera mr-2"></i> Automatic Time Out Mode
            Active: The next successful face scan will record Time OUT for one
            of the {activeStudents.length} active students.
          </div>
        ) : (
          // OLD: Manual Selection / IN Scan prompt
          <>
            <label
              className={`block font-bold text-base mb-2 ${FORMAL_COLORS.TEXT_PRIMARY}`}
            >
              Select Student for Manual Time OUT Scan:
            </label>
            <select
              value={selectedStudentForOut}
              onChange={(e) => setSelectedStudentForOut(e.target.value)}
              disabled={!selectedClassId || activeStudents.length === 0}
              className={`p-3 border ${FORMAL_COLORS.BORDER} rounded-lg shadow-inner w-full text-sm ${FORMAL_COLORS.BG_PRIMARY} ${FORMAL_COLORS.TEXT_PRIMARY} focus:ring-yellow-500 focus:border-yellow-500 disabled:opacity-50`}
            >
              <option value="">
                -- Scan a New Face for IN or Select Student Below for Manual OUT
                --
              </option>
              {activeStudents.map((record) => (
                <option key={record.id} value={record.studentName}>
                  {record.studentName} (IN: {record.timeIn})
                </option>
              ))}
            </select>
            {selectedStudentForOut && (
              <p className="text-sm mt-2 text-yellow-400 font-medium">
                Next scan will record Time OUT for **{selectedStudentForOut}**.
              </p>
            )}
            {!selectedStudentForOut && selectedClassId && (
              <p className="text-sm mt-2 text-green-400 font-medium">
                Next scan will record a Time IN for a new student.
              </p>
            )}
          </>
        )}

        {!selectedClassId && (
          <p className="text-sm mt-2 text-red-400 font-medium">
            Please select an Active Class above to enable scanning.
          </p>
        )}
      </div>

      {/* Webcam & Action Panel (Responsive Grid: 1 column -> 3 columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Webcam View */}
        <div className="relative bg-gray-900 rounded-xl shadow-2xl overflow-hidden lg:col-span-2 aspect-video">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          {!isCameraActive && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-80 text-white p-4">
              <p className="mb-4 text-lg">Webcam Scanner is Inactive</p>
              <motion.button
                onClick={startCamera}
                className="px-6 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full shadow-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={!selectedClassId}
              >
                <i className="fas fa-video mr-2"></i> Start Camera
              </motion.button>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-4 lg:col-span-1">
          <motion.button
            onClick={handleCaptureFace}
            className={`w-full py-3 text-base text-white font-bold rounded-xl shadow-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${isCameraActive && selectedClassId
                ? "bg-green-600 hover:bg-green-700"
                : "bg-gray-500 cursor-not-allowed"
              }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={!isCameraActive || !selectedClassId}
          >
            <i className="fas fa-street-view mr-2"></i> Capture Face
            {scanMode === "FACE_OUT"
              ? " (Auto OUT)"
              : selectedStudentForOut
                ? " (Manual OUT)"
                : " (New IN)"}
          </motion.button>

          <div className="pt-4 border-t border-slate-700 space-y-3">
            <motion.button
              onClick={handleSaveAttendance}
              className="w-full py-3 text-sm bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <i className="fas fa-save mr-2"></i> Save Attendance
            </motion.button>
            <motion.button
              onClick={handleResetAttendanceConfirm} // UPDATED: Call custom modal function
              className="w-full py-3 text-sm bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-xl shadow-md"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <i className="fas fa-undo-alt mr-2"></i> Reset Daily Attendance
            </motion.button>
          </div>
        </div>
      </div>

      {/* Attendance Table (Dark Theme Applied) - uses overflow-x-auto for responsiveness */}
      <div className="mt-8">
        <h3
          className={`text-xl md:text-2xl font-bold mb-4 ${FORMAL_COLORS.ACCENT_TEXT}`}
        >
          Live Attendance Records ({todayAttendance.length})
        </h3>
        <div
          className={`overflow-x-auto ${FORMAL_COLORS.BG_SECONDARY} rounded-xl shadow-xl`}
        >
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-slate-700">
              <tr>
                {["Student Name", "Status", "Time In", "Time Out"].map(
                  (header) => (
                    <th
                      key={header}
                      className={`px-3 sm:px-4 py-3 text-left text-xs font-medium ${FORMAL_COLORS.TEXT_SECONDARY} uppercase tracking-wider`}
                    >
                      {header}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {todayAttendance.map((record) => (
                <motion.tr
                  key={record.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="hover:bg-slate-700"
                >
                  <td
                    className={`px-3 sm:px-4 py-3 whitespace-nowrap text-xs sm:text-sm ${FORMAL_COLORS.TEXT_PRIMARY}`}
                  >
                    {record.studentName}
                  </td>
                  <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${record.status === "Present"
                          ? "bg-green-800 text-green-200"
                          : record.status === "Late"
                            ? "bg-yellow-800 text-yellow-200"
                            : "bg-red-800 text-red-200"
                        }`}
                    >
                      {record.status}
                    </span>
                  </td>
                  <td
                    className={`px-3 sm:px-4 py-3 whitespace-nowrap text-xs sm:text-sm ${FORMAL_COLORS.TEXT_SECONDARY}`}
                  >
                    {record.timeIn || "N/A"}
                  </td>
                  <td
                    className={`px-3 sm:px-4 py-3 whitespace-nowrap text-xs sm:text-sm ${FORMAL_COLORS.TEXT_SECONDARY}`}
                  >
                    {record.timeOut ||
                      (record.timeIn ? (
                        <span className="text-blue-400">Active...</span>
                      ) : (
                        "N/A"
                      ))}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {todayAttendance.length === 0 && selectedClassId && (
          <p className="text-center py-4 text-gray-500 italic text-sm">
            No attendance scans recorded for this class yet.
          </p>
        )}
        {!selectedClassId && (
          <p className="text-center py-4 text-gray-500 italic text-sm">
            Please select a class to begin scanning attendance.
          </p>
        )}
      </div>

      {/* Custom Reset Confirmation Modal */}
      <AnimatePresence>
        <CustomModal
          isOpen={isResetModalOpen}
          title="Confirm Daily Attendance Reset"
          message={`Are you sure you want to reset ALL of today's attendance records for the active class: **${activeClass?.subject || 'N/A'}**? This action cannot be undone.`}
          type="delete"
          onConfirm={handleResetAttendanceExecute}
          onCancel={() => setIsResetModalOpen(false)}
          statusMessage={`Class Schedule: ${activeClass?.time || 'N/A'}`}
        />
      </AnimatePresence>
    </motion.div>
  );
};

// --- COMPONENT: SettingsPage (Dark Theme) ---
const SettingsPage = () => {
  const { facultyInfo, updateFacultyInfo } = useDashboard();

  // MODIFIED: Initialize with 'school' and ensure correct structure
  const [formData, setFormData] = useState({
    name: facultyInfo.name,
    school: facultyInfo.school,
    notifications: facultyInfo.notifications,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // MODIFIED: Only send editable fields (school/notifications) to update. Name is controlled externally.
    updateFacultyInfo({
      school: formData.school, // Use 'school' here
      notifications: formData.notifications,
    });
  };

  // Dark theme applied
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 md:p-6 space-y-6 sm:space-y-8"
    >
      <h2
        className={`text-2xl md:text-4xl font-extrabold ${FORMAL_COLORS.ACCENT_TEXT}`}
      >
        Faculty Settings
      </h2>

      <form
        onSubmit={handleSubmit}
        className={`${FORMAL_COLORS.BG_SECONDARY} p-4 sm:p-6 rounded-xl shadow-lg max-w-lg space-y-6 border-t-4 border-blue-500`}
      >
        {/* MODIFIED: Faculty Name (Read-Only) */}
        <div>
          <label
            htmlFor="name"
            className={`block text-sm font-medium ${FORMAL_COLORS.TEXT_SECONDARY}`}
          >
            Faculty Name (Logged In As)
          </label>
          <p className="mt-1 block w-full rounded-md bg-slate-700/50 shadow-inner p-3 border border-slate-700 text-sm text-white font-semibold">
            <i className="fas fa-lock mr-2 text-blue-400"></i>
            {formData.name || "User Name Not Provided"}
          </p>
        </div>

        <div>
          {/* RENAMED: Department -> School/Institution */}
          <label
            htmlFor="school"
            className={`block text-sm font-medium ${FORMAL_COLORS.TEXT_SECONDARY}`}
          >
            School / Institution
          </label>
          <input
            type="text"
            name="school" // RENAMED: department -> school
            id="school" // RENAMED: department -> school
            value={formData.school}
            onChange={handleChange}
            required
            className={`mt-1 block w-full rounded-md ${FORMAL_COLORS.BORDER} ${FORMAL_COLORS.BG_PRIMARY} shadow-sm p-3 border text-sm ${FORMAL_COLORS.TEXT_PRIMARY} focus:border-blue-500 focus:ring-blue-500`}
            placeholder="e.g., College of Technology"
          />
        </div>

        <div className="flex items-center">
          <input
            id="notifications"
            name="notifications"
            type="checkbox"
            checked={formData.notifications}
            onChange={handleChange}
            className="h-5 w-5 text-blue-600 border-gray-600 rounded focus:ring-blue-500 bg-slate-700"
          />
          <label
            htmlFor="notifications"
            className={`ml-3 text-sm font-medium ${FORMAL_COLORS.TEXT_PRIMARY}`}
          >
            Enable Desktop Notifications for Attendance Events
          </label>
        </div>

        <motion.button
          type="submit"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full py-3 text-sm bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 transition duration-150"
        >
          <i className="fas fa-save mr-2"></i> Save Settings
        </motion.button>
      </form>
    </motion.div>
  );
};

// --- Dashboard Main Component (Handles Page View and Mobile Drawer State) ---
const DashboardMain = ({ onLogout }) => {
  const {
    classes,
    attendance,
    facultyInfo,
    showToast,
    setSelectedClassForDetail,
    selectedClassForDetail,
    currentTerm,
  } = useDashboard();

  const [activePage, setActivePage] = useState("Overview");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // *** MODAL STATE FOR LOGOUT AND ARCHIVE ***
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: 'confirm',
    title: '',
    message: '',
    onConfirm: () => { },
    onCancel: () => setModalState({ ...modalState, isOpen: false }),
  });

  // --- Action Functions (Logout/Archive) ---
  const handleLogout = () => {
    // 1. Open the save confirmation modal
    setModalState({
      isOpen: true,
      type: 'logout',
      title: 'Confirm Logout',
      message: 'Do you want to explicitly save your current data to your browser before logging out? (Recommended)',
      statusMessage: 'Choosing "Cancel" will abort logout. Choosing "Continue" will log out without an explicit save check.',
      onConfirm: handleLogoutExecute, // This handles the actual logout/save logic
      onCancel: () => setModalState({ ...modalState, isOpen: false }),
      confirmText: 'Continue Logout' // Changed to be more explicit
    });
  };

  const handleLogoutExecute = async (shouldAttemptSave = true) => {
    setModalState({ ...modalState, isOpen: false }); // Close the main modal

    let shouldLogout = true;

    if (shouldAttemptSave) {
      // 1. Attempt to save data
      try {
        localStorage.setItem("classes", JSON.stringify(classes));
        localStorage.setItem("attendance", JSON.stringify(attendance));
        localStorage.setItem("facultyInfo", JSON.stringify(facultyInfo));
        localStorage.setItem("currentTerm", JSON.stringify(currentTerm));

        showToast("Data saved successfully! Logging out...");
      } catch (error) {
        // 2. Handle Save Error with a warning modal
        shouldLogout = await new Promise((resolve) => {
          setModalState({
            isOpen: true,
            type: 'warning',
            title: 'Save Error',
            message: "Error saving data to local storage. Proceed with logout? (Data may be lost)",
            onConfirm: () => {
              setModalState({ ...modalState, isOpen: false });
              resolve(true); // Proceed with logout
            },
            onCancel: () => {
              setModalState({ ...modalState, isOpen: false });
              resolve(false); // Cancel logout
            },
            confirmText: 'Logout Anyway',
          });
        });
      }
    }

    if (shouldLogout) {
      // Clear previous user data before logging out
      localStorage.removeItem("classes");
      localStorage.removeItem("attendance");
      localStorage.removeItem("facultyInfo");
      localStorage.removeItem("currentTerm");

      // Final logout action
      setTimeout(onLogout, 500);
    }
  };

  const handleArchiveData = () => {
    setModalState({
      isOpen: true,
      type: 'archive',
      title: 'Confirm Data Archive',
      message: 'This action will save all current classes, attendance records, and settings to your browser\'s local storage, simulating a data backup.',
      onConfirm: handleArchiveExecute,
      onCancel: () => setModalState({ ...modalState, isOpen: false }),
      statusMessage: 'The saved data will persist through browser restarts but is not a permanent cloud backup.',
      confirmText: 'Confirm Archive'
    });
  };

  const handleArchiveExecute = () => {
    setModalState({ ...modalState, isOpen: false });

    try {
      localStorage.setItem("classes", JSON.stringify(classes));
      localStorage.setItem("attendance", JSON.stringify(attendance));
      localStorage.setItem("facultyInfo", JSON.stringify(facultyInfo));
      localStorage.setItem("currentTerm", JSON.stringify(currentTerm));

      showToast(
        "Data successfully saved (archived) to local storage!",
        "success"
      );
    } catch (error) {
      showToast("Error saving data for archive. Please try again.", "error");
    }
  };


  const handleSetPage = (page) => {
    // *** ADDED LOGIC: Check for the special close action from the sidebar button ***
    if (page === "__CLOSE_DRAWER__") {
      setIsMobileSidebarOpen(false);
      return;
    }

    setActivePage(page);

    // FIX: Clear the class detail view when navigating away from the 'Classes' page.
    if (page !== "Classes") {
      setSelectedClassForDetail(null);
    }
  };

  const renderPage = () => {
    // 1. CHECK FOR CLASS DETAIL VIEW FIRST (Higher Priority)
    if (selectedClassForDetail) {
      return (
        <ClassDetailPage
          classId={selectedClassForDetail}
          onBackToClasses={() => {
            setSelectedClassForDetail(null); // Clear selection
            setActivePage("Classes"); // Navigate to the main Classes tab
          }}
        />
      );
    }

    // 2. RENDER MAIN PAGE
    switch (activePage) {
      case "Overview":
        return <OverviewPage setActivePage={setActivePage} />; // Pass setActivePage down
      case "Attendance":
        return <AttendancePage />;
      case "Classes":
        return <ClassesPage />; // Now supports setting detail view state
      case "Term": // *** NEW ROUTE ***
        return <TermPage />;
      case "Settings":
        return <SettingsPage />;
      default:
        return <OverviewPage setActivePage={setActivePage} />;
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* --- TOPBAR --- */}
      <Topbar
        onMobileMenuToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
      />

      {/* --- MAIN CONTENT AREA (Scrollable) --- */}
      <main className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activePage + (selectedClassForDetail ? "detail" : "")} // Key changes if we switch page or enter/exit detail view
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="min-h-full"
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* --- SIDEBARS --- */}

      {/* FUNCTIONAL DESKTOP SIDEBAR (Visible on Desktop) */}
      <div className="hidden lg:flex w-64 flex-shrink-0 fixed inset-y-0 left-0 z-40">
        <Sidebar
          activePage={activePage}
          setActivePage={(page) => handleSetPage(page)} // Use combined function
          handleLogout={handleLogout}
          handleArchiveData={handleArchiveData}
          isMobileDrawer={false}
        />
      </div>

      {/* MOBILE DRAWER (Hidden on Desktop, uses AnimatePresence for motion) */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <>
            {/* Overlay for mobile drawer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-40 lg:hidden"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
            <Sidebar
              activePage={activePage}
              setActivePage={(page) => {
                handleSetPage(page); // Use combined function (will close drawer if page is __CLOSE_DRAWER__)
                // If the page is a regular page, manually close the drawer after navigation
                if (page !== "__CLOSE_DRAWER__") {
                  setIsMobileSidebarOpen(false);
                }
              }}
              handleLogout={handleLogout}
              handleArchiveData={handleArchiveData}
              isMobileDrawer={true}
              isDrawerOpen={isMobileSidebarOpen}
            />
          </>
        )}
      </AnimatePresence>

      {/* Global Custom Modal for Logout/Archive/Errors */}
      <AnimatePresence>
        {modalState.isOpen && (
          <CustomModal
            isOpen={modalState.isOpen}
            title={modalState.title}
            message={modalState.message}
            type={modalState.type}
            onConfirm={modalState.onConfirm}
            onCancel={modalState.onCancel}
            statusMessage={modalState.statusMessage}
            confirmText={modalState.confirmText}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// --- MAIN APP EXPORT (Layout Manager) ---
const App = ({ user, onLogout }) => {
  const previousUserNameRef = useRef(user?.name);

  // *** SECURITY FIX: Clear localStorage only when the user identity changes ***
  useEffect(() => {
    const currentUserName = user?.name;
    const previousUserName = previousUserNameRef.current;

    // Scenario 1: Fresh Login after a logout, or switching users
    if (currentUserName && currentUserName !== previousUserName) {
      console.log(
        `User switched from '${previousUserName || "None"
        }' to '${currentUserName}'. Clearing old session data.`
      );

      // Explicitly remove all keys used for persistence
      localStorage.removeItem("classes");
      localStorage.removeItem("attendance");
      localStorage.removeItem("facultyInfo");
      localStorage.removeItem("currentTerm");

      // Update the ref to the new user's name
      previousUserNameRef.current = currentUserName;

      // We rely on the DashboardProvider state to re-initialize with default/empty values
      // because the localStorage values are now null.
    } else if (currentUserName) {
      // Scenario 2: Same user refreshing the page. Data should remain.
      // We just ensure the ref is current.
      previousUserNameRef.current = currentUserName;
    } else {
      // Scenario 3: Logged out state. We clear the ref.
      previousUserNameRef.current = null;
    }
  }, [user]);

  return (
    <DashboardProvider user={user}>
      {/* Font & Icon Links */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap"
      />
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css"
      />

      {/* DatePicker Custom Styling */}
      <style>{`
				/* Custom Dark Theme Overrides for react-datepicker */
				.react-datepicker-popper {
					z-index: 60; /* Ensure it's above other elements */
				}
				.react-datepicker {
					font-family: 'Roboto', sans-serif;
					border: 1px solid #334155; /* slate-700 */
					background-color: #1e293b; /* slate-800 */
					color: #f1f5f9; /* gray-100 */
					border-radius: 0.75rem; /* rounded-xl */
					box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
				}
				.react-datepicker__header {
					background-color: #0f172a; /* slate-900 */
					border-bottom: 1px solid #334155;
				}
				.react-datepicker__current-month,
				.react-datepicker__day-name {
					color: #fff;
				}
				.react-datepicker__day {
					color: #f1f5f9;
				}
				.react-datepicker__day--keyboard-selected,
				.react-datepicker__day--selected {
					background-color: #3b82f6 !important; /* blue-500 */
					color: #fff !important;
					border-radius: 50%;
				}
				.react-datepicker__day:hover {
					background-color: #475569; /* slate-600 */
					border-radius: 50%;
				}
				.react-datepicker__day--outside-month {
					color: #64748b; /* gray-500 */
				}
				.react-datepicker__navigation-icon::before {
					border-color: #94a3b8; /* gray-400 */
				}
				.react-datepicker-popper[data-placement^="bottom"] .react-datepicker__triangle::before,
				.react-datepicker-popper[data-placement^="bottom"] .react-datepicker__triangle::after {
					border-bottom-color: #1e293b !important;
				}
			`}</style>

      <div
        className={`flex min-h-screen ${FORMAL_COLORS.BG_PRIMARY} ${FORMAL_COLORS.TEXT_PRIMARY} font-['Roboto']`}
      >
        {/* Space clearing div for the fixed desktop sidebar */}
        <div className="flex-1 lg:ml-64">
          <DashboardMain onLogout={onLogout} />
        </div>
      </div>
    </DashboardProvider>
  );
};

export default App;