import StudentDashboard from "./StudentDashboard";
import FacultyDashboard from "./FacultyDashboard";
import AdminDashboard from "./AdminDashboard";

export default function Dashboard({ user, onLogout }) {
  if (!user) return null;

  const { role } = user;

  const handleLogout = async () => {
    if (user && user.id) {
      try {
        console.log("Attempting to record logout for User ID:", user.id);
        
        // We verify the server is listening before redirecting
        await fetch("http://localhost:3001/api/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId: user.id }),
          keepalive: true // <--- CRITICAL FIX: Ensures request finishes even if page closes
        });
        
        console.log("Logout request sent.");
      } catch (error) {
        console.error("Failed to record logout time:", error);
      }
    }

    // Proceed to clear local state
    onLogout();
  };

  if (role === "student")
    return <StudentDashboard user={user} onLogout={handleLogout} />;
  if (role === "faculty")
    return <FacultyDashboard user={user} onLogout={handleLogout} />;
  if (role === "admin")
    return <AdminDashboard user={user} onLogout={handleLogout} />;

  return (
    <div className="p-8 text-center text-gray-600">
      <p>⚠️ Unknown role: {role}</p>
      <button
        onClick={handleLogout}
        className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
      >
        Force Logout
      </button>
    </div>
  );
}