// AppMain component renders all main sections of the landing page, including hero, features, fun facts, how it works, about, testimonials, and the contact form.

function AppMain({ formData, handleInputChange, handleSubmit, onShowDevelopers }) {
  return (
    <>
      {/* Hero Section */}
      <section className="pt-24 pb-20 bg-linear-to-br from-purple-900 via-blue-900 to-black text-white relative overflow-hidden">
        {/* Galaxy Layers - Multi-Layered for Depth */}
        <div className="absolute inset-0 pointer-events-none z-0">
          {/* Star Field Background */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-15 animate-galaxy-twinkle"></div>
          {/* Nebula Clouds */}
          <div
            className="absolute top-1/4 left-1/4 w-64 h-64 bg-linear-to-br from-purple-500/20 via-blue-500/20 to-transparent rounded-full blur-3xl animate-rotate"
            style={{ animationDuration: "30s" }}
          ></div>
          <div
            className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-linear-to-br from-pink-500/15 via-purple-500/15 to-transparent rounded-full blur-3xl animate-float-drift"
            style={{ animationDelay: "2s" }}
          ></div>
          {/* Shooting Stars */}
          <div className="absolute top-10 left-0 w-1 h-1 bg-white rounded-full animate-shoot"></div>
          <div
            className="absolute top-20 left-0 w-1 h-1 bg-cyan-300 rounded-full animate-shoot"
            style={{ animationDelay: "1.5s" }}
          ></div>
          <div
            className="absolute top-40 left-0 w-1 h-1 bg-yellow-300 rounded-full animate-shoot"
            style={{ animationDelay: "3s" }}
          ></div>
          {/* Drifting Particles */}
          <div className="absolute top-1/3 left-10 w-4 h-4 bg-gray-300/30 rounded-full animate-float-drift"></div>
          <div
            className="absolute bottom-1/2 right-20 w-3 h-3 bg-gray-400/20 rounded animate-float-drift"
            style={{ animationDelay: "4s" }}
          ></div>
        </div>
        {/* Background Image */}
        <div
          className="absolute bottom-0 left-0 w-full h-1/2 bg-cover bg-center opacity-15 animate-float-drift"
          style={{
            backgroundImage:
              'url("https://source.unsplash.com/random/1920x1080/?facial,recognition,school,galaxy")',
          }}
        ></div>
        <div className="container mx-auto px-6 text-center relative z-10">
          <h2 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in-up animate-glow-pulse drop-shadow-2xl">
            Revolutionary School Attendance with Face Recognition
          </h2>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-95 leading-relaxed drop-shadow-lg">
            Securely track student attendance using advanced facial recognition.
            Real-time updates, insightful reports, and zero hassle. Focus on
            teaching, not roll calls.
          </p>
          <div className="grid md:grid-cols-3 gap-8 mb-12 text-center animate-bounce-slow">
            <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm border border-purple-500/30 hover:rotate-5 transition-transform">
              <h3 className="text-3xl font-bold text-yellow-300 animate-galaxy-twinkle">
                50%
              </h3>
              <p className="text-blue-100">Time Saved</p>
            </div>
            <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm border border-blue-500/30 hover:rotate-5 transition-transform">
              <h3 className="text-3xl font-bold text-cyan-300 animate-galaxy-twinkle">
                99.9%
              </h3>
              <p className="text-blue-100">Accuracy</p>
            </div>
            <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm border border-pink-500/30 hover:rotate-5 transition-transform">
              <h3 className="text-3xl font-bold text-yellow-300 animate-galaxy-twinkle">
                100%
              </h3>
              <p className="text-blue-100">Easy To Use</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6">
            <a href="#fun-facts">
              <button className="bg-white text-purple-600 px-8 sm:px-10 py-4 rounded-full text-lg sm:text-xl font-bold hover:bg-gray-100 transform hover:scale-110 hover:rotate-1 transition-all duration-500 shadow-2xl hover:shadow-purple-500/50 w-full sm:w-auto">
                Start Your Day With Me
              </button>
            </a>
            <button
              onClick={onShowDevelopers}
              className="border-2 border-white text-white px-8 sm:px-10 py-4 rounded-full text-lg sm:text-xl font-bold hover:bg-purple-600 hover:text-white transition-all duration-300 w-full sm:w-auto shadow-lg hover:shadow-purple-500/50"
            >
               Development Team{" "}
            </button>
          </div>
          {/* Enhanced Floating Elements */}
          <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full animate-pulse animate-float-drift"></div>
          <div
            className="absolute bottom-20 right-10 w-32 h-32 bg-purple-500/10 rounded-full animate-bounce animate-rotate"
            style={{ animationDuration: "15s" }}
          ></div>
        </div>
      </section>

      {/* Fun Facts Section */}
      <section
        id="fun-facts"
        className="relative py-28 bg-linear-to-b from-[#0a0f24] via-[#151e3d] to-[#0a0f24] text-white overflow-hidden"
      >
        {/* Animated Galaxy Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(147,51,234,0.15),transparent_60%),radial-gradient(circle_at_80%_70%,rgba(59,130,246,0.15),transparent_70%)] animate-[spin_100s_linear_infinite]"></div>
          <div className="absolute inset-0 animate-[pulse_10s_ease-in-out_infinite] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent_80%)]"></div>
        </div>
        {/* Floating Stars */}
        <div className="absolute inset-0">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-0.5 h-0.5 bg-white rounded-full animate-twinkle"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 4}s`,
              }}
            ></div>
          ))}
        </div>
        {/* Section Title */}
        <div className="relative z-10 text-center mb-16">
          <h2 className="text-5xl font-bold drop-shadow-[0_0_20px_rgba(255,255,255,0.5)] mb-4">
            Fun Facts & Trivia
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Explore some fascinating and unexpected insights about facial
            recognition and the futuristic world of attendance technology.
          </p>
        </div>
        {/* Trivia Cards */}
        <div className="relative z-10 container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {[
            {
              fact: "Your face is your password 🔒",
              desc: "Facial recognition is 99.8% accurate when trained with diverse datasets — more secure than PINs or cards.",
            },
            {
              fact: "Presentryx learns your uniqueness 🤖",
              desc: "The system analyzes over 80 facial points — like eye distance and jawline shape — to confirm identity.",
            },
            {
              fact: "Fast as light ⚡",
              desc: "Modern scanners can recognize a face in under 0.5 seconds, even faster than fingerprint scans!",
            },
            {
              fact: "Born from space tech 🚀",
              desc: "NASA originally developed early computer vision systems to analyze space images — now used in schools!",
            },
            {
              fact: "Smarter over time 🧠",
              desc: "Presentryx-based facial systems improve accuracy each time they scan — learning and adapting to lighting and angles.",
            },
            {
              fact: "Eco-friendly attendance 🌍",
              desc: "No need for plastic IDs or paper logs — face scanners save thousands of sheets per school every year.",
            },
          ].map((item, index) => (
            <div
              key={index}
              className="bg-white/10 border border-white/20 rounded-2xl p-6 backdrop-blur-lg shadow-lg hover:shadow-[0_0_25px_rgba(147,51,234,0.4)] hover:-translate-y-2 transition-all duration-500"
            >
              <h3 className="text-2xl font-semibold mb-3 text-purple-300">
                {item.fact}
              </h3>
              <p className="text-gray-200">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="features"></section>
      <section className="relative py-28 bg-linear-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white overflow-hidden">
        {/* Subtle Galaxy Glow Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.15),transparent_70%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(147,51,234,0.15),transparent_70%)]"></div>
        <div className="container mx-auto px-6 relative z-10">
          <h3 className="text-5xl font-bold text-center mb-20 text-white animate-fade-in drop-shadow-lg">
            Powerful Features for Secure Attendance
          </h3>
          <div className="grid md:grid-cols-2 gap-12">
            {/* Left Side: Features Cards */}
            <div className="space-y-8 md:space-y-12">
              {/* Feature 1 */}
              <div className="bg-linear-to-br from-indigo-900/40 to-purple-800/30 p-10 rounded-2xl text-center backdrop-blur-md hover:shadow-2xl hover:-translate-y-4 hover:rotate-1 transition-all duration-500 border border-indigo-700/30 relative z-10">
                <div className="w-20 h-20 bg-linear-to-r from-green-400 to-teal-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg animate-pulse-slow">
                  <span className="text-3xl">👤</span>
                </div>
                <h4 className="text-3xl font-bold mb-6 text-white drop-shadow-sm">
                  Face Scanner
                </h4>
                <p className="text-gray-300 text-lg leading-relaxed">
                  Secure facial recognition for instant check-ins. Students
                  simply look at the camera for attendance in seconds.
                </p>
              </div>
              {/* Feature 2 */}
              <div className="bg-linear-to-br from-indigo-900/40 to-blue-800/30 p-10 rounded-2xl text-center backdrop-blur-md hover:shadow-2xl hover:-translate-y-4 hover:-rotate-1 transition-all duration-500 border border-blue-700/30 relative z-10">
                <div className="w-20 h-20 bg-linear-to-r from-blue-400 to-indigo-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg animate-bounce-slow">
                  <span className="text-3xl">⚡</span>
                </div>
                <h4 className="text-3xl font-bold mb-6 text-white drop-shadow-sm">
                  Real-Time Marked
                </h4>
                <p className="text-gray-300 text-lg leading-relaxed">
                  Only faculty has access to use the Face Cam Scanner for
                  real-time recording in their dashboard.
                </p>
              </div>
              {/* Feature 3 */}
              <div className="bg-linear-to-br from-purple-900/40 to-pink-800/30 p-10 rounded-2xl text-center backdrop-blur-md hover:shadow-2xl hover:-translate-y-4 hover:rotate-2 transition-all duration-500 border border-purple-700/30 relative z-10">
                <div className="w-20 h-20 bg-linear-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg animate-pulse">
                  <span className="text-3xl">📊</span>
                </div>
                <h4 className="text-3xl font-bold mb-6 text-white drop-shadow-sm">
                  Analytics & Reports
                </h4>
                <p className="text-gray-300 text-lg leading-relaxed">
                  Generate smart reports and attendance insights with real-time
                  data visualizations to improve student engagement.
                </p>
              </div>
            </div>
            {/* Right Side: Secure Attendance Card */}
            <div className="bg-linear-to-br from-slate-900/60 to-indigo-900/40 backdrop-blur-md rounded-2xl p-8 border border-indigo-700/40 shadow-2xl flex flex-col justify-center items-center min-h-[600px] space-y-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent_70%)]"></div>
              <div className="w-24 h-24 bg-linear-to-r from-blue-400 to-indigo-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg animate-pulse-slow z-10">
                <span className="text-5xl">🔒</span>
              </div>
              <h4 className="text-3xl font-bold mb-6 text-white text-center z-10">
                Secure Attendance Management
              </h4>
              <p className="text-gray-300 text-lg leading-relaxed text-center max-w-md z-10">
                Attendance is protected with advanced facial recognition by
                Presentryx. Your data is encrypted end-to-end following strict
                school compliance.
              </p>
              <ul className="text-left text-gray-200 space-y-2 max-w-md w-full z-10">
                <li className="flex items-center">
                  <span className="text-green-400 mr-2">✓</span> End-to-End
                  Encryption
                </li>
                <li className="flex items-center">
                  <span className="text-green-400 mr-2">✓</span> Easy to use for
                  Admin And Faculty
                </li>
                <li className="flex items-center">
                  <span className="text-green-400 mr-2">✓</span> Database-Safe,
                  No Scamming Use
                </li>
                <li className="flex items-center">
                  <span className="text-green-400 mr-2">✓</span> Real-Time
                  Compliance Analytics
                </li>
              </ul>
              <button className="bg-linear-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-2 group z-10">
                <span className="text-xl group-hover:rotate-12 transition-transform duration-300">
                  🔒
                </span>
                <span>Secure Process</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* How it works section */}
      <section
        id="how-it-works"
        className="relative py-24 overflow-hidden bg-linear-to-b from-[#0a0333] via-[#1a0b52] to-[#0b0224] text-white"
      >
        {/* Animated Galaxy Background Orbs */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-64 h-64 bg-purple-600/30 rounded-full blur-2xl animate-ping"></div>
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        </div>
        {/* Content Container */}
        <div className="container mx-auto px-6 relative z-10 text-center">
          <h2 className="text-5xl font-extrabold mb-12 drop-shadow-lg bg-linear-to-r from-blue-300 via-purple-400 to-pink-300 text-transparent bg-clip-text animate-fade-in">
            How It Works
          </h2>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto mb-20 leading-relaxed">
            Presentryx simplifies school attendance with cutting-edge face
            recognition and secure cloud syncing. Here’s how our seamless system
            works for every class and every student — all powered by Presentryx.
          </p>
          {/* Steps Grid */}
          <div className="grid md:grid-cols-3 gap-10">
            {/* Step 1 */}
            <div className="bg-white/10 backdrop-blur-md p-10 rounded-2xl border border-white/20 hover:border-indigo-400 hover:shadow-indigo-500/50 hover:shadow-2xl transition-all duration-500">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-linear-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-4xl shadow-lg">
                📷
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white drop-shadow-md">
                1. Face Capture
              </h3>
              <p className="text-gray-300 leading-relaxed">
                Students simply SignUp form and look at the camera for a few
                seconds. The system captures their face in real-time using
                advanced facial recognition.
              </p>
            </div>
            {/* Step 2 */}
            <div className="bg-white/10 backdrop-blur-md p-10 rounded-2xl border border-white/20 hover:border-purple-400 hover:shadow-purple-500/50 hover:shadow-2xl transition-all duration-500">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-linear-to-r from-purple-500 to-pink-500 flex items-center justify-center text-4xl shadow-lg">
                ☁️
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white drop-shadow-md">
                2. Data Sync
              </h3>
              <p className="text-gray-300 leading-relaxed">
                The attendance data is encrypted and instantly sent to our
                secure database — no manual input needed.
              </p>
            </div>
            {/* Step 3 */}
            <div className="bg-white/10 backdrop-blur-md p-10 rounded-2xl border border-white/20 hover:border-blue-400 hover:shadow-blue-500/50 hover:shadow-2xl transition-all duration-500">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-linear-to-r from-teal-400 to-blue-500 flex items-center justify-center text-4xl shadow-lg">
                📊
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white drop-shadow-md">
                3. Real-Time Dashboard
              </h3>
              <p className="text-gray-300 leading-relaxed">
                Teachers and admins can monitor attendance instantly on their
                dashboards with smart analytics and daily reports.
              </p>
            </div>
          </div>
          {/* Call to Action */}
          <div className="mt-20">
            <button className="bg-linear-to-r from-blue-600 to-purple-600 hover:from-purple-600 hover:to-pink-600 text-white px-10 py-4 rounded-xl font-semibold shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105 flex items-center mx-auto space-x-2">
              <span className="text-2xl animate-pulse">🚀</span>
              <span>Start Secure Attendance</span>
            </button>
          </div>
        </div>
        {/* Floating Stars Background */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 animate-twinkle"></div>
      </section>

      {/* About Section */}
      <section
        id="about"
        className="relative py-24 bg-linear-to-br from-[#0f172a] via-[#1e1b4b] to-[#0f172a] text-white overflow-hidden"
      >
        {/* Galaxy Glow Layers */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.15),transparent_70%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(147,51,234,0.15),transparent_70%)]"></div>
        {/* Subtle Stars */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 mix-blend-soft-light"></div>
        <div className="container mx-auto px-6 max-w-5xl text-center relative z-10">
          <h3 className="text-5xl font-bold mb-8 text-white animate-fade-in drop-shadow-lg">
            Why Choose <span className="text-indigo-400">Presentryx?</span>
          </h3>
          <p className="text-xl text-gray-200 leading-relaxed mb-12 max-w-3xl mx-auto">
            In today’s fast-paced schools, manual attendance is outdated and
            prone to errors.{" "}
            <span className="text-indigo-300 font-semibold">Presentryx</span>, 
            revolutionizes attendance with intuitive facial recognition built
            for educators, students, and parents. Whether for small classrooms
            or large districts, our Presentryx-driven system ensures accuracy,
            reduces admin work, and fosters better communication. Join the
            future of attendance today.
          </p>
          <div className="mt-12 flex justify-center items-center flex-col space-y-4">
            <div className="w-24 h-24 bg-linear-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-xl animate-pulse-slow">
              <span className="text-6xl">👨‍🏫</span>
            </div>
            <p className="text-gray-300 text-lg max-w-md">
              Empower teachers with smarter tools. Let Presentryx handle the
              attendance, while you focus on education.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials Section - Smart Learning in Motion (Updated with 3D animated objects) */}
      <section className="py-24 bg-linear-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 animate-twinkle"></div>
        <div className="container mx-auto px-6 text-center relative z-10">
          <h3 className="text-5xl font-extrabold text-white mb-16 drop-shadow-lg">
            Smart Learning in Motion
          </h3>
          <div className="grid md:grid-cols-3 gap-12">
            {/* 3D Card 1 - Students */}
            <div className="relative bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-xl transform transition-transform duration-700 hover:-translate-y-6 hover:rotate-3 border border-blue-400/30">
              <div className="w-48 h-48 mx-auto mb-6 flex items-center justify-center perspective-1000">
                <div className="w-full h-full bg-linear-to-tr from-blue-300 to-purple-400 rounded-full animate-rotate-3d flex items-center justify-center text-8xl shadow-2xl">
                  🧑‍🎓
                </div>
              </div>
              <h4 className="text-white text-3xl font-bold mb-2 drop-shadow-md">
                Engaged Students
              </h4>
              <p className="text-gray-200 text-lg">
                Interactive and intuitive attendance experience keeps students focused on learning.
              </p>
            </div>

            {/* 3D Card 2 - Mobile */}
            <div className="relative bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-xl transform transition-transform duration-700 hover:-translate-y-6 hover:-rotate-3 border border-pink-400/30">
              <div className="w-48 h-48 mx-auto mb-6 flex items-center justify-center perspective-1000">
                <div className="w-full h-full bg-linear-to-tr from-pink-300 to-red-400 rounded-full animate-scale-bounce-3d flex items-center justify-center text-8xl shadow-2xl">
                  📱
                </div>
              </div>
              <h4 className="text-white text-3xl font-bold mb-2 drop-shadow-md">
                On-the-Go Access
              </h4>
              <p className="text-gray-200 text-lg">
                Manage attendance from any device, anytime, ensuring flexibility for faculty and staff.
              </p>
            </div>

            {/* 3D Card 3 - Dashboard */}
            <div className="relative bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-xl transform transition-transform duration-700 hover:-translate-y-6 hover:rotate-2 border border-green-400/30">
              <div className="w-48 h-48 mx-auto mb-6 flex items-center justify-center perspective-1000">
                <div className="w-full h-full bg-linear-to-tr from-green-300 to-teal-400 rounded-full animate-pulse-3d flex items-center justify-center text-8xl shadow-2xl">
                  🖥️
                </div>
               
              </div>
              <h4 className="text-white text-3xl font-bold mb-2 drop-shadow-md">
                Insightful Analytics
              </h4>
              <p className="text-gray-200 text-lg">
                Comprehensive dashboards provide actionable insights into attendance patterns.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/*  CONTACT SECTION (SLEEK, MODERN, AND MINIMALIST DESIGN)  */}
      <section
        id="contact"
        className="py-24 bg-linear-to-br from-gray-900 to-gray-800 text-white relative overflow-hidden"
      >
        {/* Subtle geometric pattern / texture for background */}
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/clean-gray-paper.png')]"></div>

        <div className="container mx-auto px-6 relative z-10 max-w-2xl bg-white/5 backdrop-blur-md rounded-xl p-10 shadow-2xl border border-gray-700 transform transition-all duration-500 hover:shadow-gray-700/50 hover:border-gray-600">
          <h3 className="text-5xl font-bold mb-6 text-gray-100 drop-shadow-md">
            Simplify Your School's Attendance
          </h3>
          <p className="text-lg mb-10 text-gray-300 max-w-lg mx-auto leading-relaxed">
            Ready for a streamlined, secure, and modern attendance system? Get in touch with our team today.
          </p>
          <form onSubmit={handleSubmit} className="space-y-6">
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-5 py-3 rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 transition-colors duration-300 text-base"
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Work Email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-5 py-3 rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 transition-colors duration-300 text-base"
              required
            />
            <textarea
              name="message"
              placeholder="Tell us about your needs (optional)"
              value={formData.message}
              onChange={handleInputChange}
              rows="4"
              className="w-full px-5 py-3 rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 transition-colors duration-300 text-base"
            ></textarea>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white px-8 py-4 rounded-md text-lg font-semibold hover:bg-blue-700 transition-colors duration-330 shadow-lg hover:shadow-blue-500/40 transform hover:scale-[1.01] flex items-center justify-center space-x-2 mt-8"
            >     
              <span>Request Now</span>
            </button>
          </form>
        </div>
      </section>
    </>
  );
}

export default AppMain;