import { useState, useEffect, createContext, useContext, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  User,
  BookOpen,
  Settings as SettingsIcon,
  LogOut,
  LayoutDashboard,
  Clock,
  AlertTriangle,
  CheckCircle,
  BarChart,
  GraduationCap,
  Lock,
  Bell,
  Mail,
  AlertCircle,
} from "lucide-react";

// --- THEME & COLOR DEFINITIONS (Strictly Dark Mode Palette) ---
const FORMAL_COLORS = {
  // DARK MODE PALETTE
  BG_PRIMARY: "bg-slate-900", // Main content background
  BG_SECONDARY: "bg-slate-800", // Card/Panel background
  BG_SIDEBAR: "bg-slate-900", // Sidebar Background
  BG_ACCENT: "bg-blue-900", // Sidebar/Active background
  TEXT_PRIMARY: "text-gray-100", // Main text
  TEXT_SECONDARY: "text-gray-400", // Secondary text
  ACCENT_BLUE: "text-blue-400", // Accent header text
  BORDER: "border-slate-700", // Dark mode borders
  // GENERAL COLORS
  DANGER: "bg-red-600 hover:bg-red-700",
  ACTION_BUTTON: "bg-blue-600 hover:bg-blue-700",
};

// --- CUSTOM MODAL COMPONENT ---
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
      icon: LogOut,
      confirmText: "Confirm Logout",
    },
    confirm: {
      bg: "bg-blue-700",
      icon: AlertCircle,
      confirmText: "Continue",
    },
    warning: {
      bg: "bg-yellow-600",
      icon: AlertTriangle,
      confirmText: "Acknowledge",
    },
    info: {
      bg: "bg-blue-700",
      icon: AlertCircle,
      confirmText: "Close",
    },
  };
  const { bg, icon: Icon, confirmText } = colorMap[type] || colorMap.confirm;

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
        className={`${FORMAL_COLORS.BG_SECONDARY} rounded-xl shadow-2xl w-full max-w-md p-6 space-y-6 ${FORMAL_COLORS.BORDER}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center space-x-4 border-b border-slate-700 pb-4">
          <div className={`p-2 rounded-full ${bg}`}>
            <Icon size={24} className="text-white" />
          </div>
          <h3 className="text-xl font-bold text-white">{title}</h3>
        </div>

        <p className={FORMAL_COLORS.TEXT_SECONDARY}>{message}</p>
        <p className="text-sm font-medium text-green-400">{statusMessage}</p>

        <div className="flex justify-end space-x-3 pt-4 border-t border-slate-700">
          {type !== "info" && onCancel && (
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

// --- THEME CONTEXT ---
const ThemeContext = createContext();

function ThemeProvider({ children }) {
  const theme = "dark";

  return (
    <ThemeContext.Provider value={{ theme }}>
      <div
        className={`min-h-screen font-['Roboto'] transition-colors duration-500 ${FORMAL_COLORS.BG_PRIMARY} ${FORMAL_COLORS.TEXT_PRIMARY}`}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

// --- MAIN EXPORT ---
export default function StudentDashboard({ user, onLogout }) {
  // FIX: Handle case where user is null/undefined immediately to prevent property access errors
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-gray-400">
        Loading user profile...
      </div>
    );
  }

  // ADAPTER: Combine firstname and lastname for the new dashboard layout
  const adaptedUser = {
    ...user,
    fullname:
      user.firstname && user.lastname
        ? `${user.firstname} ${user.lastname}`
        : user.fullname || "Student",
  };

  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap"
      />
      <ThemeProvider>
        <DashboardInner user={adaptedUser} onLogout={onLogout} />
      </ThemeProvider>
    </>
  );
}

// --- TOP BAR COMPONENT ---
function TopBar({ user, setSidebarOpen }) {
  const { fullname, studentId } = user;
  const { BG_SECONDARY, TEXT_SECONDARY, ACCENT_BLUE, BORDER } = FORMAL_COLORS;
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

  const bgColor = BG_SECONDARY;
  const borderColor = BORDER;
  const nameColor = FORMAL_COLORS.TEXT_PRIMARY;

  return (
    <header
      className={`p-4 flex justify-between items-center sticky top-0 z-30 shadow-lg ${bgColor} border-b ${borderColor}`}
    >
      {/* LEFT SIDE: Menu & Time */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => setSidebarOpen(true)}
          className={`p-2 rounded-md transition-colors duration-200 ${ACCENT_BLUE} hover:bg-slate-700 md:hidden`}
        >
          <Menu size={24} />
        </button>

        <div className="text-sm flex items-center space-x-3">
          <span className={`font-bold ${ACCENT_BLUE} flex items-center`}>
            <Clock size={16} className="mr-1" />
            {formattedTime}
          </span>
          <span className={`${TEXT_SECONDARY}`}>|</span>
          <span className={`${TEXT_SECONDARY} text-xs`}>{formattedDate}</span>
        </div>
      </div>

      {/* RIGHT SIDE: User Info */}
      <div className="flex items-center space-x-3">
        <div className={`flex flex-col text-right`}>
          <span
            className={`text-sm font-semibold ${nameColor} truncate max-w-[120px] md:max-w-none`}
          >
            {fullname}
          </span>
          {studentId && (
            <span className={`text-xs ${TEXT_SECONDARY}`}>ID: {studentId}</span>
          )}
        </div>

        <div
          className={`w-9 h-9 rounded-full ${FORMAL_COLORS.BG_ACCENT.replace(
            "bg-",
            "bg-"
          )} flex items-center justify-center text-white font-bold text-sm shrink-0`}
        >
          {fullname ? fullname.charAt(0) : "S"}
        </div>
      </div>
    </header>
  );
}

// --- DASHBOARD INNER ---
function DashboardInner({ user, onLogout }) {
  const { theme } = useContext(ThemeContext);
  const { fullname, role, studentId, email } = user;
  const [activePage, setActivePage] = useState("overview");
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [modalState, setModalState] = useState({
    isOpen: false,
    type: "confirm",
    title: "",
    message: "",
    onConfirm: () => setModalState({ ...modalState, isOpen: false }),
    onCancel: () => setModalState({ ...modalState, isOpen: false }),
  });

  useEffect(() => {
    const loadRecords = () => {
      // Using local storage mock for attendance data
      const all = JSON.parse(localStorage.getItem("attendance") || "[]");
      const studentRecords = all.filter((r) => r.studentName === fullname);
      setAttendanceRecords(studentRecords);
    };
    loadRecords();
  }, [fullname, activePage]);

  const stats = useMemo(
    () => ({
      total: attendanceRecords.length,
      present: attendanceRecords.filter((r) => r.status === "Present").length,
      late: attendanceRecords.filter((r) => r.status === "Late").length,
      absent: attendanceRecords.filter((r) => r.status === "Absent").length,
    }),
    [attendanceRecords]
  );

  const labels = {
    overview: "Overview",
    attendance: "Attendance Records",
    profile: "My Profile",
    settings: "Settings",
    logout: "Logout",
  };

  const navItems = [
    { id: "overview", label: labels.overview, icon: LayoutDashboard },
    { id: "attendance", label: labels.attendance, icon: BookOpen },
    { id: "profile", label: labels.profile, icon: User },
    { id: "settings", label: labels.settings, icon: SettingsIcon },
  ];

  const handleLogoutConfirm = () => {
    setModalState({
      isOpen: true,
      type: "logout",
      title: "Confirm Logout",
      message: "Are you sure you want to sign out of the Student Dashboard?",
      statusMessage: "You will be redirected to the Signup/Login page.",
      onConfirm: () => {
        setModalState({ ...modalState, isOpen: false });
        onLogout();
      },
      onCancel: () => setModalState({ ...modalState, isOpen: false }),
    });
  };

  const renderContent = () => {
    switch (activePage) {
      case "overview":
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Present"
                value={stats.present}
                color="green"
                icon={CheckCircle}
                theme={theme}
              />
              <StatCard
                title="Late"
                value={stats.late}
                color="yellow"
                icon={Clock}
                theme={theme}
              />
              <StatCard
                title="Absent"
                value={stats.absent}
                color="red"
                icon={AlertTriangle}
                theme={theme}
              />
              <StatCard
                title="Total Records"
                value={stats.total}
                color="blue"
                icon={BarChart}
                theme={theme}
              />
            </div>
            <AttendanceGraph records={attendanceRecords} theme={theme} />
          </motion.div>
        );
      case "attendance":
        return <AttendanceTable records={attendanceRecords} theme={theme} />;
      case "profile":
        return <ProfileCard user={{ fullname, role, studentId, email }} />;
      case "settings":
        return (
          <Settings user={user} setModalState={setModalState} theme={theme} />
        );
      default:
        return null;
    }
  };

  const sidebarColor = FORMAL_COLORS.BG_SIDEBAR;
  const sidebarTextColor = "text-white";
  const highlightClass =
    "bg-blue-600 dark:bg-blue-700 text-white shadow-md shadow-blue-950/50";
  const normalClass =
    "text-blue-200 hover:bg-blue-800 hover:text-white dark:text-gray-300 dark:hover:bg-slate-700";

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile Sidebar (Drawer) */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.2 }}
              className={`fixed md:hidden top-0 left-0 w-64 h-full z-50 ${sidebarColor} ${sidebarTextColor} shadow-2xl p-6 flex flex-col`}
            >
              <div className="flex justify-between items-center mb-8 border-b border-blue-700 pb-4">
                <h2 className="font-bold text-lg tracking-wide">
                  <GraduationCap
                    size={20}
                    className="inline mr-2 text-blue-400"
                  />
                  Student Dashboard
                </h2>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-1 rounded-full hover:bg-blue-700 transition"
                >
                  <X size={26} />
                </button>
              </div>

              {navItems.map(({ id, label, icon: Icon }) => (
                <motion.button
                  key={id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setActivePage(id);
                    setSidebarOpen(false);
                  }}
                  className={`flex items-center w-full text-left px-4 py-3 rounded-lg mb-2 font-medium transition-all duration-200 ${
                    activePage === id ? highlightClass : normalClass
                  }`}
                >
                  <Icon size={20} className="mr-3" />
                  {label}
                </motion.button>
              ))}

              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => {
                  setSidebarOpen(false);
                  handleLogoutConfirm();
                }}
                className={`mt-auto flex items-center justify-center ${FORMAL_COLORS.DANGER} px-4 py-3 rounded-lg text-white font-semibold transition-all duration-300 shadow-lg hover:shadow-xl`}
              >
                <LogOut size={20} className="mr-2" />
                {labels.logout}
              </motion.button>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col w-64 h-full ${sidebarColor} ${sidebarTextColor} shadow-2xl shrink-0`}
      >
        <div className="p-6 border-b border-blue-800 dark:border-slate-700">
          <h1 className="text-2xl font-bold mb-1 tracking-wider text-blue-400">
            <GraduationCap size={24} className="inline mr-2" />
            Student Dashboard
          </h1>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map(({ id, label, icon: Icon }) => (
            <motion.button
              key={id}
              whileHover={{ x: 5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActivePage(id)}
              className={`flex items-center w-full text-left px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                activePage === id ? highlightClass : normalClass
              }`}
            >
              <Icon size={20} className="mr-3" />
              {label}
            </motion.button>
          ))}
        </nav>

        <div className="p-4 border-t border-blue-800 dark:border-slate-700">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogoutConfirm}
            className={`w-full flex items-center justify-center ${FORMAL_COLORS.DANGER} text-white py-2 rounded-lg font-semibold transition-all duration-300 shadow-md`}
          >
            <LogOut size={20} className="mr-2" />
            {labels.logout}
          </motion.button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col ${FORMAL_COLORS.BG_PRIMARY}`}>
        <TopBar
          user={user}
          theme={theme}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          activePage={activePage}
          labels={labels}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="p-6 md:p-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={activePage}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Global Modal */}
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
}

// --- PROFILE COMPONENT ---
function ProfileCard({ user }) {
  const { theme } = useContext(ThemeContext);
  const cardBg = FORMAL_COLORS.BG_SECONDARY;
  const valueColor = FORMAL_COLORS.TEXT_PRIMARY;

  const initials = user.fullname
    ? user.fullname
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "S";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className={`max-w-4xl mx-auto shadow-xl rounded-2xl overflow-hidden shadow-slate-700/30`}
    >
      <div className={`p-8 md:p-10 ${cardBg} border-2 ${FORMAL_COLORS.BORDER}`}>
        <div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8">
          {/* Avatar */}
          <div className="relative">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-blue-600 flex items-center justify-center text-white text-5xl font-bold shadow-lg ring-4 ring-blue-300/50">
              {initials}
            </div>
            <div className="absolute bottom-0 right-0 p-2 bg-green-500 rounded-full border-4 border-white dark:border-slate-800">
              <User size={20} className="text-white" />
            </div>
          </div>

          {/* Details */}
          <div className="text-center md:text-left">
            <h1 className={`text-4xl font-extrabold mb-1 ${valueColor}`}>
              {user.fullname}
            </h1>
            <p className="text-xl font-medium text-blue-600 dark:text-blue-400 capitalize mb-4">
              {user.role}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 mt-6">
              <ProfileItem
                label="Student ID"
                value={user.studentId || "N/A"}
                theme={theme}
              />
              <ProfileItem
                label="Email Address"
                value={user.email || "N/A"}
                theme={theme}
              />
              <ProfileItem
                label="Current Role"
                value={user.role || "N/A"}
                theme={theme}
                capitalize={true}
              />
              <ProfileItem
                label="Account Status"
                value="Active"
                theme={theme}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ProfileItem({ label, value, theme, capitalize = false }) {
  const labelColor = FORMAL_COLORS.TEXT_SECONDARY;
  const valueColor = FORMAL_COLORS.TEXT_PRIMARY;

  return (
    <div>
      <p
        className={`text-sm font-semibold uppercase ${labelColor} tracking-wider mb-1`}
      >
        {label}
      </p>
      <p
        className={`text-lg font-medium ${valueColor} ${
          capitalize ? "capitalize" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}

// --- STAT CARD ---
function StatCard({ title, value, color, icon: Icon, theme }) {
  const colors = {
    blue: {
      accent: "border-blue-600",
      text: "text-blue-500",
      iconBg: "bg-blue-900/50",
    },
    green: {
      accent: "border-green-600",
      text: "text-green-500",
      iconBg: "bg-green-900/50",
    },
    yellow: {
      accent: "border-yellow-600",
      text: "text-yellow-500",
      iconBg: "bg-yellow-900/50",
    },
    red: {
      accent: "border-red-600",
      text: "text-red-500",
      iconBg: "bg-red-900/50",
    },
  };

  const currentColors = colors[color];
  const bgColor = FORMAL_COLORS.BG_SECONDARY;
  const textColor = currentColors.text;
  const shadow = "shadow-xl dark:shadow-slate-950/50";
  const labelColor = FORMAL_COLORS.TEXT_SECONDARY;

  return (
    <motion.div
      whileHover={{ y: -5, boxShadow: "0 15px 30px -5px rgba(0, 0, 0, 0.1)" }}
      whileTap={{ scale: 0.98 }}
      className={`p-6 rounded-xl ${bgColor} border-b-4 ${currentColors.accent} ${shadow} transition-all duration-300 ${FORMAL_COLORS.BORDER}`}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className={`text-sm font-medium uppercase ${labelColor}`}>
            {title}
          </h3>
          <p className={`text-4xl font-extrabold ${textColor} mt-1`}>{value}</p>
        </div>
        <div className={`p-3 rounded-full ${currentColors.iconBg} text-white`}>
          <Icon size={24} />
        </div>
      </div>
    </motion.div>
  );
}

// --- GRAPH MOCK ---
function AttendanceGraph({ records, theme }) {
  const cardBg = FORMAL_COLORS.BG_SECONDARY;

  const recentDates = useMemo(() => {
    const uniqueDates = Array.from(new Set(records.map((r) => r.date)))
      .sort()
      .slice(-5);

    return uniqueDates.map((date) => {
      const dateRecords = records.filter((r) => r.date === date);
      const present = dateRecords.filter((r) => r.status === "Present").length;
      const late = dateRecords.filter((r) => r.status === "Late").length;
      const absent = dateRecords.filter((r) => r.status === "Absent").length;

      const dateObj = new Date(date);
      const name = dateObj.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });

      return { name, Present: present, Late: late, Absent: absent };
    });
  }, [records]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      className={`${cardBg} rounded-xl shadow-xl p-6 mt-8 border ${FORMAL_COLORS.BORDER}`}
    >
      <h3 className={`text-xl font-bold mb-4 ${FORMAL_COLORS.ACCENT_BLUE}`}>
        Attendance Summary (Last {recentDates.length} Records)
      </h3>
      <div
        style={{
          height: "300px",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: FORMAL_COLORS.BG_PRIMARY,
        }}
      >
        <p
          className={`text-sm ${FORMAL_COLORS.TEXT_SECONDARY} dark:text-gray-500`}
        >
          [Visual representation of data is not included in this code due to
          missing charting dependency.]
        </p>
      </div>
    </motion.div>
  );
}

// --- ATTENDANCE TABLE ---
function AttendanceTable({ records, theme }) {
  const tableBg = FORMAL_COLORS.BG_SECONDARY;

  const tableHeaders = ["Date", "Class", "Status", "Time In", "Time Out"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${tableBg} rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-slate-700`}
    >
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
          <thead className="bg-blue-700 dark:bg-blue-900">
            <tr>
              {tableHeaders.map((header) => (
                <th
                  key={header}
                  className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody
            className={`divide-y divide-gray-200 dark:divide-slate-700 ${FORMAL_COLORS.TEXT_PRIMARY}`}
          >
            {records.length > 0 ? (
              records.map((r, i) => (
                <tr
                  key={i}
                  className="hover:bg-blue-50 dark:hover:bg-slate-700 transition"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {r.date ? new Date(r.date).toLocaleDateString() : "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {r.subject || r.className || "General Class"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        r.status === "Present"
                          ? "bg-green-900/70 text-green-300"
                          : r.status === "Late"
                          ? "bg-yellow-900/70 text-yellow-300"
                          : "bg-red-900/70 text-red-300"
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {r.timeIn || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {r.timeOut ||
                      (r.timeIn && r.status !== "Absent" ? (
                        <span className="text-blue-400 dark:text-blue-300">
                          Active
                        </span>
                      ) : (
                        "N/A"
                      ))}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                >
                  No attendance records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

// --- SETTINGS COMPONENT ---
function Settings({ user, setModalState }) {
  const cardBg = FORMAL_COLORS.BG_SECONDARY;
  const itemBg = FORMAL_COLORS.BG_PRIMARY;
  const { BORDER, TEXT_PRIMARY, TEXT_SECONDARY } = FORMAL_COLORS;

  const [gradeAlertsActive, setGradeAlertsActive] = useState(true);
  const [attendanceEmailActive, setAttendanceEmailActive] = useState(false);

  const handlePasswordChange = () => {
    setModalState({
      isOpen: true,
      type: "info",
      title: "Password Update",
      message:
        "A secure password reset link or form has been opened/sent to your registered email address.",
      statusMessage:
        "Please check your inbox to continue the password update process.",
      onConfirm: () => setModalState((prev) => ({ ...prev, isOpen: false })),
      onCancel: () => setModalState((prev) => ({ ...prev, isOpen: false })),
      confirmText: "Acknowledge",
    });
  };

  const handleToggle = (setter, settingName) => {
    setter((prev) => !prev);
    console.log(`Toggling ${settingName}`);
  };

  const ToggleSwitch = ({ isActive, onClick }) => (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`w-12 h-6 rounded-full flex items-center p-1 cursor-pointer transition-colors ${
        isActive ? "bg-blue-600 justify-end" : "bg-slate-700 justify-start"
      }`}
    >
      <motion.div
        className="w-4 h-4 rounded-full bg-white shadow-md"
        layout
        transition={{ type: "spring", stiffness: 700, damping: 30 }}
      />
    </motion.button>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-3xl mx-auto"
    >
      <div
        className={`${cardBg} rounded-xl shadow-xl p-8 space-y-8 border-t-4 border-blue-600 ${BORDER}`}
      >
        <h2 className={`text-2xl font-bold text-blue-400 mb-4`}>
          Account and Preferences
        </h2>

        {/* Password Change */}
        <div
          className={`p-5 rounded-xl ${itemBg} shadow-sm border ${BORDER} flex flex-col sm:flex-row items-start sm:items-center justify-between`}
        >
          <div className="flex items-center">
            <Lock size={20} className="mr-3 text-red-400" />
            <div>
              <h3 className={`font-semibold ${TEXT_PRIMARY} mb-1`}>
                Change Password
              </h3>
              <p className={`text-sm ${TEXT_SECONDARY}`}>
                Secure your account by periodically updating your password.
              </p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePasswordChange}
            className={`mt-3 sm:mt-0 px-4 py-2 text-white rounded-lg transition font-medium ${FORMAL_COLORS.ACTION_BUTTON}`}
          >
            Update Password
          </motion.button>
        </div>

        {/* Notifications */}
        <div>
          <h3
            className={`text-xl font-bold ${TEXT_PRIMARY} mb-4 border-b ${BORDER} pb-2`}
          >
            Notification Preferences
          </h3>
          <div className="space-y-4">
            <div
              className={`flex items-center justify-between p-4 rounded-lg ${itemBg} shadow-sm border ${BORDER}`}
            >
              <div className="flex items-center">
                <Bell size={20} className="mr-3 text-green-400" />
                <div>
                  <h4 className={`font-medium ${TEXT_PRIMARY}`}>
                    Grade Alerts
                  </h4>
                  <p className={`text-xs ${TEXT_SECONDARY}`}>
                    Receive a notification when a new grade is posted.
                  </p>
                </div>
              </div>
              <ToggleSwitch
                isActive={gradeAlertsActive}
                onClick={() =>
                  handleToggle(setGradeAlertsActive, "Grade Alerts")
                }
              />
            </div>

            <div
              className={`flex items-center justify-between p-4 rounded-lg ${itemBg} shadow-sm border ${BORDER}`}
            >
              <div className="flex items-center">
                <Mail size={20} className="mr-3 text-yellow-400" />
                <div>
                  <h4 className={`font-medium ${TEXT_PRIMARY}`}>
                    Attendance Summaries
                  </h4>
                  <p className={`text-xs ${TEXT_SECONDARY}`}>
                    Email me weekly attendance summaries.
                  </p>
                </div>
              </div>
              <ToggleSwitch
                isActive={attendanceEmailActive}
                onClick={() =>
                  handleToggle(setAttendanceEmailActive, "Attendance Email")
                }
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
