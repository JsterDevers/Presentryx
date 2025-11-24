import { useState } from "react";
import { motion } from "framer-motion";

// Developer data 
const developers = [
  {
    name: "John Jeremy Eugenio",
    role: "Developer Leader / Backend Developer ",
    expertise: "MySql, Python, Nodejs, Team Leadership",
    imagePlaceholder: "data:image/jpeg;base64,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",
    contactLink: "mailto:new.partner@presentryx.dev",
    email: "mindy.m@presentryx.dev",
  },
  {
    name: "John Michael De Vera",
    role: "Frontend Developer / Database ",
    expertise:"Javascript, Vite-React, TailwindCSS, Html, Css, UI/UX Design",
    imagePlaceholder: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSIrV6h2Zyrz0aMgOa6mXLgtkc7-juMgKf-SuwR-EgkP2LOUMQqq1OHpX3hZJXjEdJrAV9rG4d5y7w3KubN00eRm_JqPFqoQ16VhoLKym4&s=10",
    contactLink: "mailto:new.partner@presentryx.dev",
    email: "johnmichaelgunita2005@gmail.com",
  },
  {
    name: "Anthony Pascual Lumbao",
    role: "Project Manager/ QA / Backend Developer",
    expertise: "Python, Data Algorithm, Testing Strategies",    
    imagePlaceholder: "https://scontent.fbag5-1.fna.fbcdn.net/v/t1.15752-9/553961884_1351078203071847_8143031771540178172_n.jpg?_nc_cat=101&ccb=1-7&_nc_sid=9f807c&_nc_eui2=AeFIFTydL_ma5dNF1J2avGR0UqnHBziCzDFSqccHOILMMfIy6vFEN21tE1hNL2AHHa981X4mTIlDMBf8-vXJyoPg&_nc_ohc=5ZPvQxx87qYQ7kNvwHuh6Pw&_nc_oc=AdmOChq7PqsyKEZpAt6CMpGN5J2WyhD8x0CoEH3NxC2eCdjYLFOv-M_cXiX2Z-NDBK8&_nc_zt=23&_nc_ht=scontent.fbag5-1.fna&oh=03_Q7cD3wGitxYAvI7Db_pVfFkFkJe_qAhbtms5rhR3xHL5md-k-g&oe=692D0243&dl=1",
    contactLink: "mailto:new.partner@presentryx.dev",
    email: "eric.h@presentryx.dev",
  },
  {
    name: "Justine Jauco DC",
    role: "Frontend Developer",
    expertise: "UI/UX Design, Html, Bootsrap, CSS, Figma",
    imagePlaceholder: "data:image/jpeg;base64,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",
    contactLink: "mailto:new.partner@presentryx.dev",
    email: "justinejauco91@gmail.com",
  },
  {
    name: "John Paul Balonzo",
    role: "Backend Developer",
    expertise: "Python, MySql, Programming logic",
    imagePlaceholder: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT54wyzB941m_OSCWBgN95iNwKokKhJkKMKtA&s",
    contactLink: "mailto:new.partner@presentryx.dev",
    email: "emma@presentryx.dev",
  },
];

// ---
// FlowNode Component (Modal helper - unchanged)
// ---
const FlowNode = ({ node }) => (
    <div
      className={`flex flex-col items-center justify-center p-4 rounded-lg shadow-xl w-[200px] sm:w-[220px] text-white ${node.color} transition-all duration-300 hover:scale-[1.03] border-2 border-slate-600/50`}
    >
      <i className={`${node.icon} text-3xl mb-2`}></i>
      <h3 className="font-semibold text-center text-base leading-tight mb-1">
        {node.title}
      </h3>
      {node.description && (
        <p className="text-xs text-center opacity-90">{node.description}</p>
      )}
    </div>
  );


// DevelopmentFlowChartModal Component 

const DevelopmentFlowChartModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
    const flowChartData = {
    title: "Developer Leader", description: "Guides the entire technical vision, team structure, and process.",
    icon: "fas fa-user-tie",
    color: "bg-blue-800",
    children: [
      { title: "Frontend Dev", icon: "fas fa-box", color: "bg-blue-600", description: "Receive UI/UX Specs, Analyze User Interaction, Build Visual Components, Implement Connection Logic (API calls) to the Backend." },
      { title: "Backend Dev ", icon: "fas fa-sync-alt", color: "bg-blue-600", description: "Design Data Models, Build Business Logic, Create APIs to Handle Requests, Manage User Data Flow and Storage, Send Feedback/Data back to Frontend Logic."},
      {
        title: "Development Team",
        icon: "fas fa-code",
        color: "bg-blue-600",
        description: "Coding & Feature Implementation, Analyze Potential Future Errors/Scalability Issues, Design Proactive Solutions, Code Review.",
        children: [
          { title: "Developer Leader", icon: "fas fa-user-graduate", color: "bg-emerald-500", description: "Guides and mentors the front-back(end) developers." },
          { title: "Frontend Developers", icon: "fas fa-desktop", color: "bg-emerald-500", description: "Develops user-facing features." },
          { title: "Backend Developers", icon: "fas fa-database", color: "bg-emerald-500", description: "Builds server-side logic and APIs." },
          { title: "Developers", icon: "fas fa-laptop-code", color: "bg-emerald-500", description: "Build a logic that connecting the front-back(end)." },
          { title: "Quality Assurance (QA)", icon: "fas fa-check-circle", color: "bg-emerald-500", description: "Create Test Cases, Execute Tests Against Built Features, Report and Verify Bugs, Ensure the system quality is met." },
        ],
      },
    ],
  };

  return (
    //  FULL SCREEN CONTAINER
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black bg-opacity-90"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        transition={{ duration: 0.3 }}
        // MODAL BODY: Added gradient background to modal
        className="bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 rounded-none shadow-2xl w-screen h-screen p-6 sm:p-10 overflow-y-auto text-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto max-w-7xl">
            <div className="flex justify-between items-start mb-6 border-b border-gray-700 pb-3">
                <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-wide">
                    Web Development Organizational Flow Chart
                </h2>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-red-400 p-2 rounded-full transition-colors"
                >
                    <i className="fas fa-times text-2xl"></i>
                </button>
            </div>

            {/* --- Flow Chart Visualization --- */}
            <div className="flex flex-col items-center py-4 text-slate-200">
                {/* Level 1: Team Lead */}
                <FlowNode node={flowChartData} />

                {/* Connecting Line from Level 1 */}
                <div className="w-1 h-8 bg-gray-500 my-2"></div>

                {/* Horizontal Connector Line for Level 2 */}
                <div className="relative w-full flex justify-center">
                    <div className="w-full max-w-[1200px] h-1 bg-gray-500"></div> 
                    <div className="absolute top-1/2 -translate-y-1/2 w-1 h-8 bg-gray-500"></div>
                </div>

                {/* Level 2 Nodes: Frontend, Backend, Development Team */}
                <div className="flex justify-center flex-wrap gap-x-8 gap-y-10 relative mt-4">
                    {flowChartData.children.map((child, index) => (
                        <div key={index} className="flex flex-col items-center">
                            {/* Vertical line connecting to the horizontal connector above */}
                            <div className="w-1 h-8 bg-gray-500 mb-2"></div>
                            <FlowNode node={child} />

                            {child.children && ( // If this child also has children (Development Team)
                                <>
                                    {/* Connecting Line from Level 2 to 3 */}
                                    <div className="w-1 h-8 bg-gray-500 my-2"></div>

                                    {/* Horizontal Line above grandchildren - Adjusted max-w for better centering */}
                                    <div className="relative w-full flex justify-center">
                                        <div className="w-full max-w-[680px] h-1 bg-gray-500"></div>
                                        <div className="absolute top-1/2 -translate-y-1/2 w-1 h-8 bg-gray-500"></div>
                                    </div>

                                    {/* Level 3 Nodes: Development Team Sub-Roles - Adjusted gap for Level 3 sub-roles */}
                                    <div className="flex justify-center flex-wrap gap-x-4 gap-y-8 relative mt-4 max-w-7xl">
                                        {child.children.map((grandchild, gcIndex) => (
                                            <div
                                                key={gcIndex}
                                                className="flex flex-col items-center"
                                            >
                                                <div className="w-1 h-8 bg-gray-500 mb-2"></div>
                                                <FlowNode node={grandchild} />
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-8 text-center pt-6 border-t border-gray-700">
                <button
                    onClick={onClose}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-8 rounded-md transition-colors shadow-lg tracking-wide"
                >
                    Close Flow Chart
                </button>
            </div>
        </div>
      </motion.div>
    </div>
  );
};


// Main Component: DevelopersPage

export default function DevelopersPage({ onConnect }) {
  const [isFlowChartOpen, setIsFlowChartOpen] = useState(false);
  const toggleFlowChart = () => setIsFlowChartOpen(!isFlowChartOpen);

  const handleButtonShake = (callback) => {
    if (callback) {
      callback();
    }
  };

  return (
    // FULL SCREEN CONTAINER: Added grid background pattern
    <div className="relative min-h-screen w-full flex flex-col items-center overflow-hidden font-sans text-gray-100">
      {/* Background Image + Gradient Overlay (Kept the original for good design) */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1571260899304-425eee4c7efc?auto=format&fit=crop&w=1920&q=80')",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a]/95 via-[#1e293b]/90 to-[#334155]/95"></div>

      {/* Subtle Grid/Pattern Overlay */}
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(90deg, transparent 99%, #334155 1%), linear-gradient(#334155 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

      {/* Floating Icons (Kept for good design) */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          initial={{ y: 0 }}
          animate={{ y: [-10, 10, -10] }}
          transition={{ repeat: Infinity, duration: 6 }}
          className="absolute top-32 left-[15%] text-indigo-400/25 text-6xl"
        >
          <i className="fas fa-code"></i>
        </motion.div>
        <motion.div
          initial={{ y: 0 }}
          animate={{ y: [10, -10, 10] }}
          transition={{ repeat: Infinity, duration: 7 }}
          className="absolute bottom-28 right-[20%] text-blue-400/20 text-6xl"
        >
          <i className="fas fa-lightbulb"></i>
        </motion.div>
      </div>

      {/*  Main Card - Meet the Team */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        // Full screen style
        className="relative z-10 w-screen h-screen bg-white rounded-none shadow-none p-6 sm:p-10 border-none overflow-y-auto"
      >
        <div className="mx-auto max-w-6xl py-4">
            <h1 className="text-center text-3xl sm:text-4xl font-bold mb-3 text-slate-800 tracking-tight">
                Structure of Organizational Development Team
            </h1>

            <p className="text-gray-600 text-base sm:text-lg mb-8 leading-relaxed text-center max-w-3xl mx-auto font-normal">
                This slide focuses on the structure of the organizational development
                team such as Frontend Dev, Qa, Backend Dev, etc.
            </p>

            {/* Developer Profile Cards Container - UPDATED FOR CENTERED LAYOUT */}
            <div className="flex overflow-x-auto lg:grid lg:grid-cols-5 gap-y-12 gap-x-8 pt-2 snap-x snap-mandatory pb-6 -mx-4 sm:mx-0 lg:max-w-7xl lg:mx-auto lg:justify-center">
                {developers.map((dev, index) => {

                    return (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                            // Adjusted w-80 on mobile for better scroll, and used lg:w-auto for grid
                            className={`flex-shrink-0 w-80 lg:w-auto snap-center flex flex-col items-center text-center p-6 rounded-xl transition-all duration-300 transform hover:shadow-lg bg-white border border-gray-100 lg:hover:bg-gray-50/50`}
                        >
                            {/* Image Holder */}
                            <img
                                src={dev.imagePlaceholder}
                                alt={`Profile of ${dev.name}`}
                                className="w-36 h-36 object-cover rounded-full mb-4 border-4 border-white shadow-md ring-4 ring-blue-200"
                            />
                            <h3 className="text-xl font-bold text-slate-900 mb-1 tracking-tight">
                                {dev.name}
                            </h3>
                            {/* Role: Adjusted Boldness and Color for clean look */}
                            <p
                                className={`text-slate-700 font-medium mb-2 text-base tracking-wide`}
                            >
                                {dev.role}
                            </p>

                            {/* Expertise Information - HIGHLIGHTED EXPERTISE */}
                            <p className="text-gray-600 text-sm mb-4 leading-snug">
                                <span className="font-semibold text-gray-700">
                                    Expertise:
                                </span>{" "}
                                {/* Split expertise string and wrap each item in a highlighted span */}
                                {dev.expertise.split(',').map((item, i) => (
                                  <span
                                      key={i}
                                      className="inline-block bg-blue-100 text-blue-800 text-xs font-medium mr-1 mb-1 px-2.5 py-0.5 rounded-full"
                                  >
                                    {item.trim()}
                                  </span>
                                ))}
                            </p>

                            {/* Contact Details - HIGHLIGHTED EMAIL BUTTON */}
                            <div className="mt-auto w-full max-w-[200px] pt-2 border-t border-gray-100">
                                <a
                                    href={dev.contactLink}
                                    // KEY CHANGE: Formal Indigo Highlight for the button
                                    className="inline-flex items-center justify-center w-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100 py-2 px-3 rounded-lg text-sm font-semibold transition-colors shadow-sm hover:shadow-md border border-indigo-200"
                                    title={`Email ${dev.name}`}
                                >
                                    <i className="fas fa-envelope mr-2"></i> Email {dev.name.split(' ')[0]}
                                </a>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            <p className="text-gray-500 text-xs mt-12 italic text-center">
                For technical collaboration or inquiries, please use the contact
                information below.
            </p>

            {/* Contact Info and Buttons - REVISED FORMAL STYLING */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-gray-200">
                {/* View Web Development Flow - Secondary Formal Button */}
                <button
                    onClick={toggleFlowChart}
                    // REVISED: Formal Secondary Button Style (Gray/Subtle Blue)
                    className="flex-1 text-center bg-gray-100 text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 py-3 rounded-md font-semibold text-base transition-colors shadow-md tracking-wide border border-gray-300"
                >
                    <i className="fas fa-sitemap mr-2"></i> View Web Development
                    Flow
                </button>

                {/* Back to Landing Page - Primary Formal Button */}
                <button
                    onClick={() => handleButtonShake(onConnect)}
                    // REVISED: Formal Primary Button Style (Indigo)
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-md font-semibold text-base transition-colors shadow-lg shadow-indigo-700/30 transform hover:scale-[1.005] tracking-wide"
                >
                    <i className="fas fa-undo-alt mr-2"></i> Back to Landing Page
                </button>
            </div>
        </div>
      </motion.div>

      {/* Flow Chart Modal Component */}
      <DevelopmentFlowChartModal
        isOpen={isFlowChartOpen}
        onClose={toggleFlowChart}
      />
    </div>
  );
}