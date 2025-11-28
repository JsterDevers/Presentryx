const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);
const db = require("./db"); // Assumes this exports a mysql2/promise pool

const app = express();
const PORT = 3001;

// --- Constants ---
const SESSION_SECRET = "your_secure_random_secret_key_here";
// The ALLOWED_ORIGIN constant is removed as origin is handled dynamically below.
const ONE_DAY = 86400000;

// --- 1. Middleware Configuration ---
// FIX: Dynamic CORS configuration to allow Codespaces URLs for cross-port communication
app.use(
  cors({
    origin: (origin, callback) => {
      // 1. Allow if there is no origin (e.g., direct requests, tool tests)
      if (!origin) {
        return callback(null, true);
      }
      
      // 2. Allow localhost (for local testing)
      if (origin.includes("localhost")) {
        return callback(null, true);
      }
      
      // 3. Allow any GitHub Codespace domain (*.app.github.dev)
      if (origin.endsWith(".app.github.dev")) {
        return callback(null, true);
      }
      
      // Otherwise, reject the connection
      callback(new Error('Not allowed by CORS'));
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true, // Crucial for session cookies
  })
);

app.use(express.json({ limit: "50mb" }));

// --- 2. Session Configuration ---
const sessionStore = new MySQLStore(
  {
    expiration: ONE_DAY,
    createDatabaseTable: true,
    schema: {
      tableName: "sessions",
      columnNames: {
        session_id: "session_id",
        expires: "expires",
        data: "data",
      },
    },
  },
  db
);

app.use(
  session({
    key: "presentryx_session_cookie",
    secret: SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true if using HTTPS
      httpOnly: true,
      maxAge: ONE_DAY,
    },
  })
);

// --- 3. Routes ---

app.get("/", (_req, res) => res.send("Presentryx Backend Running"));

/**
 * Check Session
 */
app.get("/api/check-session", (req, res) => {
  if (req.session.user) {
    return res.json({ authenticated: true, user: req.session.user });
  }
  return res.json({ authenticated: false });
});

// ============================================================
// AUTHENTICATION ROUTES
// ============================================================

/**
 * User Registration (Public)
 */
app.post("/api/signup", async (req, res) => {
  const {
    lastname,
    firstname,
    studentId,
    email,
    password,
    role,
    photo,
    agreedToTerms,
  } = req.body;

  if (!firstname || !lastname || !email || !password || !role) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  try {
    const [existingUsers] = await db.query(
      "SELECT email FROM users WHERE email = ?",
      [email]
    );
    if (existingUsers.length > 0) {
      return res.status(409).json({ error: "Email is already registered." });
    }

    let finalStudentId = null;
    const roleLower = role.toLowerCase();

    if (roleLower === "student") {
      const [existingIds] = await db.query(
        "SELECT student_id FROM users WHERE student_id = ?",
        [studentId]
      );
      if (existingIds.length > 0)
        return res
          .status(409)
          .json({ error: "Student ID is already registered." });
      finalStudentId = studentId;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const finalPhoto = roleLower === "student" ? photo : null;

    const insertQuery = `
      INSERT INTO users (firstname, lastname, email, password_hash, role, student_id, photo_data, agreed_to_terms) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

    const [result] = await db.query(insertQuery, [
      firstname,
      lastname,
      email,
      hashedPassword,
      role,
      finalStudentId,
      finalPhoto,
      agreedToTerms,
    ]);

    console.log(`✅ User Registered: ${email} (${role})`);
    res
      .status(201)
      .json({
        message: "User registered successfully",
        userId: result.insertId,
      });
  } catch (err) {
    console.error("❌ Signup Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * User Login
 */
app.post("/api/login", async (req, res) => {
  const { email, password, role, studentId } = req.body;

  try {
    const [users] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (users.length === 0)
      return res.status(401).json({ error: "User not found." });

    const user = users[0];

    // Case-insensitive role check
    if (user.role.toLowerCase() !== role.toLowerCase())
      return res.status(401).json({ error: "Role mismatch." });

    if (role.toLowerCase() === "student" && user.student_id !== studentId) {
      return res.status(401).json({ error: "Student ID mismatch." });
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch)
      return res.status(401).json({ error: "Incorrect password." });

    // Log the login
    await db.query(
      "INSERT INTO activity_logs (user_id, login_time) VALUES (?, NOW())",
      [user.id]
    );

    const userData = {
      id: user.id,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      role: user.role,
      studentId: user.student_id,
      photo: user.photo_data,
    };

    req.session.user = userData;

    console.log(`✅ Login Success: ${email}`);
    res.json({ message: "Login successful", user: userData });
  } catch (err) {
    console.error("❌ Login Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * User Logout
 */
app.post("/api/logout", async (req, res) => {
  if (!req.session || !req.session.user) {
    res.clearCookie("presentryx_session_cookie");
    return res.json({ message: "Already logged out" });
  }

  const userId = req.session.user.id;

  try {
    // Log logout time
    await db.query(
      `UPDATE activity_logs SET logout_time = NOW() WHERE user_id = ? AND logout_time IS NULL ORDER BY log_id DESC LIMIT 1`,
      [userId]
    );

    req.session.destroy((err) => {
      if (err) return res.status(500).json({ error: "Could not log out" });
      res.clearCookie("presentryx_session_cookie");
      console.log(`✅ Logout Success: User ID ${userId}`);
      res.json({ message: "Logout successful" });
    });
  } catch (err) {
    console.error("❌ Logout Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ============================================================
// ADMIN DATA MANAGEMENT ROUTES (UPDATED)
// ============================================================

/**
 * 1. GET ALL USERS (For Admin Directory)
 * Uses view_master_data for formatted dates/times
 */
app.get("/api/users", async (req, res) => {
  try {
    const query = "SELECT * FROM view_master_data";
    const [rows] = await db.query(query);
    res.json(rows);
  } catch (err) {
    console.error("❌ Fetch Users Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * 2. GET ONLY FACULTY (For Dropdown in Class Creation)
 */
app.get("/api/faculty-list", async (req, res) => {
  try {
    const query = `
            SELECT id, CONCAT(firstname, ' ', lastname) as name 
            FROM users 
            WHERE role = 'Faculty' 
            ORDER BY firstname ASC
        `;
    const [rows] = await db.query(query);
    res.json(rows);
  } catch (err) {
    console.error("❌ Fetch Faculty Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * 3. CREATE USER (Admin Manual Creation)
 */
app.post("/api/users", async (req, res) => {
  const { firstname, lastname, email, role, password } = req.body;

  try {
    // Hash the password (using input or default)
    const hashedPassword = await bcrypt.hash(password || "default123", 10);

    const [result] = await db.query(
      `INSERT INTO users (firstname, lastname, email, role, password_hash, agreed_to_terms) VALUES (?, ?, ?, ?, ?, 1)`,
      [firstname, lastname, email, role, hashedPassword]
    );
    res.json({ message: "User created by Admin", id: result.insertId });
  } catch (err) {
    console.error("❌ Create User Error:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * 4. EDIT USER
 */
app.put("/api/users/:id", async (req, res) => {
  const { firstname, lastname, email, role } = req.body;
  const userId = req.params.id;

  try {
    await db.query(
      `UPDATE users SET firstname=?, lastname=?, email=?, role=? WHERE id=?`,
      [firstname, lastname, email, role, userId]
    );
    res.json({ message: "User updated successfully" });
  } catch (err) {
    console.error("❌ Update User Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * 5. GET ALL CLASSES
 * Joins with users table to get the Faculty Name
 */
app.get("/api/classes", async (_req, res) => {
  try {
    // We alias columns here to match what React expects:
    // class_name -> name
    // course_code -> code
    const sql = `
            SELECT c.id, c.class_name as name, c.course_code as code, 
            CONCAT(u.firstname, ' ', u.lastname) as facultyName
            FROM classes c
            LEFT JOIN users u ON c.faculty_id = u.id
            ORDER BY c.course_code ASC
        `;
    const [rows] = await db.query(sql);
    res.json(rows);
  } catch (err) {
    console.error("❌ Fetch Classes Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * 6. CREATE CLASS (UPDATED FOR INSTANT UPDATE)
 * Returns the full class object (including Faculty Name) immediately.
 */
app.post("/api/classes", async (req, res) => {
  // React sends 'name', 'code', 'faculty_id'
  const { name, code, faculty_id } = req.body;

  try {
    // 1. Insert the new class
    const [result] = await db.query(
      `INSERT INTO classes (class_name, course_code, faculty_id) VALUES (?, ?, ?)`,
      [name, code, faculty_id]
    );

    // 2. IMMEDIATELY fetch the new record with the Faculty Name included
    const [newClass] = await db.query(
      `
            SELECT c.id, c.class_name as name, c.course_code as code, 
            CONCAT(u.firstname, ' ', u.lastname) as facultyName
            FROM classes c
            LEFT JOIN users u ON c.faculty_id = u.id
            WHERE c.id = ?
        `,
      [result.insertId]
    );

    // 3. Send back the FULL object so React can display it instantly
    res.json(newClass[0]);
  } catch (err) {
    console.error("❌ Create Class Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * 7. GET SCHEDULES (UPDATED)
 * Fetches from the combined view 'view_class_schedules'
 */
app.get("/api/schedules", async (req, res) => {
  try {
    // We now select from the View we created in SQL
    const [rows] = await db.query("SELECT * FROM view_class_schedules");
    res.json(rows);
  } catch (err) {
    console.error("❌ Fetch Schedules Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * 8. CREATE SCHEDULE (UPDATED FOR INSTANT UPDATE)
 * Returns the full schedule object (with formatted time and faculty) immediately.
 */
app.post("/api/schedules", async (req, res) => {
  const { class_id, day_of_week, start_time, end_time, room } = req.body;
  try {
    // 1. Insert the schedule
    // Note: We use 'Presentryx Room' if the user leaves room empty
    const roomValue = room || "Presentryx";

    const [result] = await db.query(
      `INSERT INTO schedules (class_id, day_of_week, start_time, end_time, room) VALUES (?, ?, ?, ?, ?)`,
      [class_id, day_of_week, start_time, end_time, roomValue]
    );

    // 2. IMMEDIATELY fetch the new record from the VIEW we created
    const [newSchedule] = await db.query(
      "SELECT * FROM view_class_schedules WHERE schedule_id = ?",
      [result.insertId]
    );

    // 3. Send back the FULL formatted object
    res.json(newSchedule[0]);
  } catch (err) {
    console.error("❌ Create Schedule Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// --- Server Start ---
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
}); 