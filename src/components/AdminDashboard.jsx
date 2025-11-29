import { useState, useEffect } from "react";

// --- API CONFIGURATION ---
// Ensure you keep the "/api" at the end!
const API_URL = "https://cautious-waddle-jjpr947gj7jvcpjwr-3001.app.github.dev/api";

// --- Icons ---
const Icon = ({ children, className = "", size = 24 }) => (
  <svg className={`w-${size / 4} h-${size / 4} ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">{children}</svg>
);

// Icon Definitions
const LayoutDashboard = (props) => (<Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></Icon>);
const BookOpen = (props) => (<Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></Icon>);
const Users = (props) => (<Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></Icon>);
const Settings = (props) => (<Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.942 3.313.823 2.392 2.392a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.942 1.543-.823 3.313-2.392 2.392a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.942-3.313-.823-2.392-2.392a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.942-1.543.823-3.313 2.392-2.392a1.724 1.724 0 002.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></Icon>);
const Menu = (props) => (<Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></Icon>);
const LogOut = (props) => (<Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></Icon>);

// --- Constants & Colors ---
const PAGES = {
  OVERVIEW: "Academic Overview",
  CLASSES: "Class Management", 
  USERS: "User Directory",
  PROFILE: "Admin Profile",
};

const PAGE_ICONS = {
  [PAGES.OVERVIEW]: LayoutDashboard,
  [PAGES.CLASSES]: BookOpen,
  [PAGES.USERS]: Users, 
  [PAGES.PROFILE]: Settings,
};

const FORMAL_COLORS = {
  BG_PRIMARY: "bg-slate-900",
  BG_SECONDARY: "bg-slate-800",
  BG_SIDEBAR: "bg-slate-900",
  TEXT_PRIMARY: "text-gray-100",
  TEXT_SECONDARY: "text-gray-400",
  ACCENT: "text-blue-400",
  ACTIVE_BG: "bg-blue-600",
  HOVER_BG: "hover:bg-slate-700",
  BORDER: "border-slate-700",
};

// --- API HELPERS (FIXED) ---
const fetchData = async (endpoint) => {
  try {
    const res = await fetch(`${API_URL}${endpoint}`);
    if (!res.ok) throw new Error("Failed to fetch");
    return res.json();
  } catch (error) {
    console.error("Fetch error:", error);
    return [];
  }
};

const postData = async (endpoint, data) => {
  try {
    console.log(`Sending to ${endpoint}:`, data); // Debugging: See what we are sending
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: "POST",
      headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json" // FIX: Helps ensure server sends JSON back
      },
      body: JSON.stringify(data),
    });
    
    if (!res.ok) {
        // FIX: safely handle non-JSON errors (like 404/500 HTML pages)
        let errorMsg = `Server Error (${res.status})`;
        try {
            const err = await res.json();
            if(err.message) errorMsg = err.message;
        } catch (e) {
            // response was not JSON, use status text
            errorMsg = res.statusText || errorMsg;
        }
        throw new Error(errorMsg);
    }
    return res.json();
  } catch (error) {
    console.error("Post error:", error);
    // If the server is down, error.message is usually "Failed to fetch"
    const displayMsg = error.message === "Failed to fetch" 
        ? "Cannot connect to server. Is backend running?" 
        : error.message;
    alert(`Error saving to database: ${displayMsg}`); 
    return null; 
  }
};

const putData = async (endpoint, data) => {
    try {
        const res = await fetch(`${API_URL}${endpoint}`, {
          method: "PUT",
          headers: { 
              "Content-Type": "application/json",
              "Accept": "application/json" 
          },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Update Failed");
        return res.json();
    } catch (error) {
        console.error("Put error:", error);
        alert("Failed to update.");
        return null;
    }
};

// --- COMPONENT: Class & Schedule Management ---
const ClassManagementComponent = ({ refreshTrigger }) => {
  const [classes, setClasses] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [schedules, setSchedules] = useState([]);
  
  // Forms
  const [newClass, setNewClass] = useState({ name: "", code: "", faculty_id: "" });
  const [newSchedule, setNewSchedule] = useState({ class_id: "", day_of_week: "Monday", start_time: "", end_time: "", room: "" });

  const loadData = async () => {
    const cls = await fetchData("/classes");
    const faculty = await fetchData("/faculty-list"); 
    const sch = await fetchData("/schedules");
    
    if(cls) setClasses(cls);
    if(faculty) setFacultyList(faculty); 
    if(sch) setSchedules(sch);
  };

  useEffect(() => { loadData(); }, [refreshTrigger]);

  const handleCreateClass = async (e) => {
    e.preventDefault();
    const createdClass = await postData("/classes", newClass);
    if (createdClass && createdClass.id) {
        setClasses(prev => [...prev, createdClass]);
        setNewClass({ name: "", code: "", faculty_id: "" });
    }
  };

  const handleCreateSchedule = async (e) => {
    e.preventDefault();
    const createdSchedule = await postData("/schedules", newSchedule);
    if (createdSchedule && createdSchedule.schedule_id) {
        setSchedules(prev => [...prev, createdSchedule]);
        setNewSchedule({ ...newSchedule, room: "" }); 
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. Create Class Section */}
      <div className={`${FORMAL_COLORS.BG_SECONDARY} p-6 rounded-xl border ${FORMAL_COLORS.BORDER}`}>
        <h3 className="text-xl font-bold text-white mb-4">Create New Class & Assign Faculty</h3>
        <form onSubmit={handleCreateClass} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
                <label className="text-sm text-gray-400">Class Name</label>
                <input type="text" placeholder="e.g. Calculus I" required className="w-full bg-slate-700 border-slate-600 rounded p-2 text-white" 
                 value={newClass.name} onChange={e => setNewClass({...newClass, name: e.target.value})} />
            </div>
            <div>
                <label className="text-sm text-gray-400">Course Code</label>
                <input type="text" placeholder="e.g. MTH-101" required className="w-full bg-slate-700 border-slate-600 rounded p-2 text-white" 
                 value={newClass.code} onChange={e => setNewClass({...newClass, code: e.target.value})} />
            </div>
            <div>
                <label className="text-sm text-gray-400">Assign Faculty</label>
                <select className="w-full bg-slate-700 border-slate-600 rounded p-2 text-white" required
                    value={newClass.faculty_id} onChange={e => setNewClass({...newClass, faculty_id: e.target.value})}>
                    <option value="">Select Faculty...</option>
                    {facultyList.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
            </div>
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded font-bold">Create Class</button>
        </form>
      </div>

      {/* 2. Create Schedule Section */}
      <div className={`${FORMAL_COLORS.BG_SECONDARY} p-6 rounded-xl border ${FORMAL_COLORS.BORDER}`}>
        <h3 className="text-xl font-bold text-white mb-4">Add Schedule to Class</h3>
        <form onSubmit={handleCreateSchedule} className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
            <div className="md:col-span-2">
                <label className="text-sm text-gray-400">Select Class</label>
                <select className="w-full bg-slate-700 border-slate-600 rounded p-2 text-white" required
                    value={newSchedule.class_id} onChange={e => setNewSchedule({...newSchedule, class_id: e.target.value})}>
                    <option value="">Select Class...</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.code} - {c.name}</option>)}
                </select>
            </div>
            <div>
                <label className="text-sm text-gray-400">Day</label>
                <select className="w-full bg-slate-700 border-slate-600 rounded p-2 text-white"
                 value={newSchedule.day_of_week} onChange={e => setNewSchedule({...newSchedule, day_of_week: e.target.value})}>
                    {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'].map(d => <option key={d} value={d}>{d}</option>)}
                </select>
            </div>
            <div>
                <label className="text-sm text-gray-400">Start Time</label>
                <input type="time" required className="w-full bg-slate-700 border-slate-600 rounded p-2 text-white" 
                 value={newSchedule.start_time} onChange={e => setNewSchedule({...newSchedule, start_time: e.target.value})} />
            </div>
            <div>
                <label className="text-sm text-gray-400">End Time</label>
                <input type="time" required className="w-full bg-slate-700 border-slate-600 rounded p-2 text-white" 
                 value={newSchedule.end_time} onChange={e => setNewSchedule({...newSchedule, end_time: e.target.value})} />
            </div>
            <div>
                <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white p-2 rounded font-bold">Add</button>
            </div>
        </form>
      </div>

      {/* 3. Display Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className={`${FORMAL_COLORS.BG_SECONDARY} p-6 rounded-xl border ${FORMAL_COLORS.BORDER}`}>
            <h4 className="font-bold text-white mb-3">Existing Classes</h4>
            <ul className="space-y-2 text-sm text-gray-300">
                {classes.map(c => (
                    <li key={c.id} className="p-3 bg-slate-700 rounded flex justify-between items-center">
                        <div>
                            <span className="text-blue-400 font-bold mr-2">{c.code}</span> 
                            <span className="text-white">{c.name}</span>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                            c.facultyName 
                            ? "bg-indigo-900/60 text-indigo-300 border-indigo-700" 
                            : "bg-red-900/40 text-red-300 border-red-800"
                        }`}>
                            {c.facultyName ? (
                                <>
                                    <span className="opacity-70 font-normal mr-1">Faculty:</span>
                                    {c.facultyName}
                                </>
                            ) : "Unassigned"}
                        </span>
                    </li>
                ))}
            </ul>
          </div>

          <div className={`${FORMAL_COLORS.BG_SECONDARY} p-6 rounded-xl border ${FORMAL_COLORS.BORDER}`}>
            <h4 className="font-bold text-white mb-3">Master Schedule</h4>
            <ul className="space-y-2 text-sm text-gray-300">
                {schedules.map(s => (
                    <li key={s.schedule_id || s.id} className="p-3 bg-slate-700 rounded flex justify-between items-center">
                        <div>
                            <span className="block font-bold text-white">{s.class_name}</span>
                            <span className="text-xs text-gray-400">{s.day_of_week} ({s.start_time_formatted || s.start_time} - {s.end_time_formatted || s.end_time_ || s.end_time})</span>
                        </div>
                        <span className="bg-slate-800 px-2 py-1 rounded text-xs border border-slate-600 text-gray-300">
                            Room: <span className="text-green-400 font-bold">{s.room || "Presentryx"}</span>
                        </span>
                    </li>
                ))}
            </ul>
          </div>
      </div>
    </div>
  );
};

// --- OVERVIEW COMPONENT ---
const OverviewComponent = ({ metrics, recentUsers }) => {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className={`${FORMAL_COLORS.BG_SECONDARY} p-6 rounded-xl border-b-4 border-blue-500`}>
                    <p className="text-gray-400 uppercase text-sm">Total Faculty</p>
                    <p className="text-3xl font-bold text-white">{metrics.faculty}</p>
                </div>
                <div className={`${FORMAL_COLORS.BG_SECONDARY} p-6 rounded-xl border-b-4 border-green-500`}>
                    <p className="text-gray-400 uppercase text-sm">Total Students</p>
                    <p className="text-3xl font-bold text-white">{metrics.students}</p>
                </div>
                <div className={`${FORMAL_COLORS.BG_SECONDARY} p-6 rounded-xl border-b-4 border-purple-500`}>
                    <p className="text-gray-400 uppercase text-sm">Total Classes</p>
                    <p className="text-3xl font-bold text-white">{metrics.classes}</p>
                </div>
            </div>
            {/* Recent Users Table */}
            <div className={`${FORMAL_COLORS.BG_SECONDARY} p-6 rounded-xl border ${FORMAL_COLORS.BORDER}`}>
                <h3 className="text-white font-bold mb-4">Recent Users</h3>
                <table className="w-full text-sm text-left text-gray-400">
                    <thead className="text-xs uppercase bg-slate-700 text-gray-200">
                        <tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Email</th></tr>
                    </thead>
                    <tbody>
                        {recentUsers.slice(0, 5).map(u => (
                            <tr key={u.id} className="border-b border-slate-700 hover:bg-slate-700">
                                <td className="px-4 py-3 font-medium text-white">{u.full_name || u.firstname + ' ' + u.lastname}</td>
                                <td className="px-4 py-3">{u.role}</td>
                                <td className="px-4 py-3">{u.email}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// --- USER MANAGEMENT (UPDATED) ---
const UserManagementComponent = ({ refreshTrigger, onEdit }) => {
    const [users, setUsers] = useState([]);
    const [newUser, setNewUser] = useState({ firstname: "", lastname: "", email: "", role: "Student", password: "" });

    const loadUsers = async () => {
        const data = await fetchData("/users");
        setUsers(data || []);
    };

    useEffect(() => { loadUsers(); }, [refreshTrigger]);

    const handleCreateUser = async (e) => {
        e.preventDefault();
        const result = await postData("/users", newUser);
        if (result) {
            setNewUser({ firstname: "", lastname: "", email: "", role: "Student", password: "" });
            loadUsers();
        }
    };

    return (
        <div className="space-y-8">
            {/* Create User Form */}
            <div className={`${FORMAL_COLORS.BG_SECONDARY} p-6 rounded-xl border ${FORMAL_COLORS.BORDER}`}>
                <h3 className="font-bold text-white mb-4">Add New User</h3>
                <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                    <div className="col-span-1">
                        <input type="text" placeholder="First Name" required className="w-full bg-slate-700 p-2 rounded text-white" 
                            value={newUser.firstname} onChange={e => setNewUser({...newUser, firstname: e.target.value})} />
                    </div>
                    <div className="col-span-1">
                        <input type="text" placeholder="Last Name" required className="w-full bg-slate-700 p-2 rounded text-white" 
                            value={newUser.lastname} onChange={e => setNewUser({...newUser, lastname: e.target.value})} />
                    </div>
                    <div className="col-span-2">
                        <input type="email" placeholder="Email" required className="w-full bg-slate-700 p-2 rounded text-white" 
                            value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} />
                    </div>
                    <div className="col-span-1">
                        <input type="password" placeholder="Password" required className="w-full bg-slate-700 p-2 rounded text-white" 
                            value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} />
                    </div>
                    <div className="col-span-1">
                        <select className="w-full bg-slate-700 p-2 rounded text-white" 
                            value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}>
                            <option value="Student">Student</option>
                            <option value="Faculty">Faculty</option>
                            <option value="Admin">Admin</option>
                        </select>
                    </div>
                    <div className="col-span-6">
                        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded font-bold hover:bg-blue-700">Create User</button>
                    </div>
                </form>
            </div>

            {/* User Table */}
            <div className={`${FORMAL_COLORS.BG_SECONDARY} rounded-xl shadow-lg overflow-x-auto border ${FORMAL_COLORS.BORDER}`}>
                <table className="min-w-full divide-y divide-gray-700 text-sm">
                    <thead className="bg-slate-700 text-gray-300">
                        <tr>
                            <th className="px-6 py-3 text-left">Full Name</th>
                            <th className="px-6 py-3 text-left">Role</th>
                            <th className="px-6 py-3 text-left">Email</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700 text-gray-300">
                        {users.map(user => (
                            <tr key={user.id} className="hover:bg-slate-700">
                                <td className="px-6 py-4 font-medium text-white">
                                    {user.full_name ? user.full_name : `${user.firstname} ${user.lastname}`}
                                </td>
                                <td className="px-6 py-4">{user.role}</td>
                                <td className="px-6 py-4">{user.email}</td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => onEdit(user)} className="text-blue-400 hover:text-blue-300">Edit</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// --- MAIN DASHBOARD SHELL ---
const AdminDashboard = ({ onLogout }) => {
  const [currentPage, setCurrentPage] = useState(PAGES.OVERVIEW);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Data State for Overview
  const [metrics, setMetrics] = useState({ faculty: 0, students: 0, classes: 0 });
  const [recentUsers, setRecentUsers] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0); 

  // Editing State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // LOGOUT MODAL STATE
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  useEffect(() => {
    const loadOverview = async () => {
        try {
            const users = await fetchData("/users");
            const classes = await fetchData("/classes");
            
            if(users && classes) {
                setMetrics({
                    faculty: users.filter(u => u.role === "Faculty").length,
                    students: users.filter(u => u.role === "Student").length,
                    classes: classes.length
                });
                setRecentUsers(users);
            }
        } catch (e) {
            console.error("Overview load error", e);
        }
    };
    loadOverview();
  }, [refreshTrigger, currentPage]);

  const handleEditUser = (user) => {
      setEditingUser(user);
      setIsEditModalOpen(true);
  };

  const saveEditUser = async (e) => {
      e.preventDefault();
      const result = await putData(`/users/${editingUser.id}`, editingUser);
      if(result) {
          setIsEditModalOpen(false);
          setRefreshTrigger(prev => prev + 1);
      }
  };

  const handleLogoutClick = () => {
      setIsLogoutModalOpen(true);
  };

  const confirmLogout = async () => {
      try {
          await fetch(`${API_URL}/logout`, { method: "POST" });
          setIsLogoutModalOpen(false);
          if (onLogout) onLogout(); 
      } catch (error) {
          console.error("Logout failed", error);
      }
  };

  return (
    <div className={`min-h-screen ${FORMAL_COLORS.BG_PRIMARY} flex ${FORMAL_COLORS.TEXT_PRIMARY} font-sans overflow-hidden`}>
      {/* Sidebar - FIXED LAYOUT WITH SCROLLABLE MENU */}
      <div className={`fixed inset-y-0 left-0 transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:static md:shrink-0 w-64 ${FORMAL_COLORS.BG_SIDEBAR} p-6 flex flex-col shadow-2xl transition-transform z-30 h-screen`}>
        
        {/* Header - Fixed */}
        <div className="shrink-0 mb-6">
            <h1 className="text-2xl font-extrabold text-blue-400 flex items-center"><LayoutDashboard className="mr-2"/> Admin</h1>
        </div>

        {/* Navigation - UPDATED WITH ICONS */}
        <nav className="flex-1 overflow-y-auto min-h-0 space-y-2 custom-scrollbar">
            {[PAGES.OVERVIEW, PAGES.CLASSES, PAGES.USERS, PAGES.PROFILE].map(page => {
                const PageIcon = PAGE_ICONS[page];
                return (
                    <button key={page} onClick={() => { setCurrentPage(page); setIsSidebarOpen(false); }}
                        className={`w-full flex items-center px-4 py-3 rounded-xl transition font-medium ${
                            currentPage === page 
                            ? `${FORMAL_COLORS.ACTIVE_BG} text-white shadow-lg shadow-blue-900/50` 
                            : "text-gray-400 hover:bg-slate-800 hover:text-white"
                        }`}>
                        <PageIcon className={`mr-3 ${currentPage === page ? "text-white" : "text-gray-500 group-hover:text-white"}`} size={20} />
                        {page}
                    </button>
                );
            })}
        </nav>
        
        {/* Sign Out - Fixed at Bottom */}
        <div className="shrink-0 mt-4 pt-6 border-t border-slate-700">
            <button onClick={handleLogoutClick} className="flex items-center w-full px-4 py-3 text-red-400 hover:bg-slate-800 hover:text-red-300 rounded-xl transition">
                <LogOut className="mr-3" />
                Sign Out
            </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden h-screen">
        {/* Top Bar */}
        <header className={`${FORMAL_COLORS.BG_SECONDARY} p-4 flex justify-between items-center shadow-lg shrink-0`}>
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden text-white"><Menu/></button>
            <div className="flex items-center space-x-3 ml-auto">
                <div className="text-right">
                    <p className="text-sm font-bold text-white">System Admin</p>
                    <p className="text-xs text-gray-400">Online</p>
                </div>
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-bold">SA</div>
            </div>
        </header>

        {/* Page Content - SCROLLS HERE */}
        <main className="flex-1 overflow-auto p-6">
            <h2 className="text-3xl font-bold text-white mb-6 border-b border-slate-700 pb-2">{currentPage}</h2>
            
            {currentPage === PAGES.OVERVIEW && <OverviewComponent metrics={metrics} recentUsers={recentUsers} />}
            {currentPage === PAGES.CLASSES && <ClassManagementComponent refreshTrigger={refreshTrigger} />}
            {currentPage === PAGES.USERS && <UserManagementComponent refreshTrigger={refreshTrigger} onEdit={handleEditUser} />}
            {currentPage === PAGES.PROFILE && <div className="text-gray-400">Profile Settings (Admin Only)</div>}
        </main>
      </div>

      {/* EDIT USER MODAL */}
      {isEditModalOpen && editingUser && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
              <div className="bg-slate-800 p-6 rounded-lg w-full max-w-md border border-slate-600">
                  <h3 className="text-xl font-bold mb-4">Edit User</h3>
                  <form onSubmit={saveEditUser} className="space-y-4">
                      <div>
                          <label className="block text-sm text-gray-400">First Name</label>
                          <input className="w-full bg-slate-700 p-2 rounded text-white" value={editingUser.firstname} onChange={e => setEditingUser({...editingUser, firstname: e.target.value})} />
                      </div>
                      <div>
                          <label className="block text-sm text-gray-400">Last Name</label>
                          <input className="w-full bg-slate-700 p-2 rounded text-white" value={editingUser.lastname} onChange={e => setEditingUser({...editingUser, lastname: e.target.value})} />
                      </div>
                      <div>
                          <label className="block text-sm text-gray-400">Email</label>
                          <input className="w-full bg-slate-700 p-2 rounded text-white" value={editingUser.email} onChange={e => setEditingUser({...editingUser, email: e.target.value})} />
                      </div>
                      <div>
                          <label className="block text-sm text-gray-400">Role</label>
                          <select className="w-full bg-slate-700 p-2 rounded text-white" value={editingUser.role} onChange={e => setEditingUser({...editingUser, role: e.target.value})}>
                              <option value="Student">Student</option>
                              <option value="Faculty">Faculty</option>
                              <option value="Admin">Admin</option>
                          </select>
                      </div>
                      <div className="flex justify-end space-x-2 pt-4">
                          <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 bg-slate-600 rounded hover:bg-slate-500">Cancel</button>
                          <button type="submit" className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-500">Save Changes</button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      {/* --- CONFIRM LOGOUT MODAL --- */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-slate-800 p-6 rounded-lg w-full max-w-sm border border-slate-600 shadow-xl">
                <h3 className="text-xl font-bold text-white mb-2">Confirm Logout</h3>
                <p className="text-gray-300 mb-6">Are you sure you want to log out of the system?</p>
                <div className="flex justify-end space-x-3">
                    <button 
                        onClick={() => setIsLogoutModalOpen(false)} 
                        className="px-4 py-2 bg-slate-700 text-gray-300 rounded hover:bg-slate-600 transition"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={confirmLogout} 
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition font-bold"
                    >
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;