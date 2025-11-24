import { useState } from "react";

function AppHeader({ onSignUpClick, onLoginClick, onDevTeamClick }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { name: "Features", href: "#features" },
    { name: "How It Works", href: "#how-it-works" },
    { name: "About", href: "#about" },
    { name: "Dev Team", href: "#developers" },
    { name: "Contact", href: "#contact" },
  ];

  const logoPlaceholderUrl =
    "public/558115641_1544396270263248_227794251727803456_n.jpg";

  const closeMenu = (action) => {
    setMenuOpen(false);
    if (action) action();
  };

  const handleNavClick = (e, itemName) => {
    if (itemName === "Dev Team") {
      e.preventDefault();
      if (onDevTeamClick) onDevTeamClick();
      closeMenu();
    }
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-transparent backdrop-blur-md border-b border-white/10 transition-all duration-300">
      {/* CONTAINER LAYOUT:
         - px-4: Phones
         - md:px-6: Tablets
         - lg:px-10: Laptops
         - max-w-[1920px]: Prevents stretching on super-wide 4k monitors
      */}
      <nav className="relative container mx-auto max-w-[1920px] px-4 md:px-6 lg:px-10 py-3 lg:py-4 flex justify-between items-center">
        {/* --- LEFT: Logo & Brand --- */}
        <div className="flex items-center gap-2 z-20 flex-shrink-0">
          <img
            src={logoPlaceholderUrl}
            alt="Presentryx Logo"
            // RESPONSIVE IMAGE: h-8 (phone) -> h-9 (tablet) -> h-12 (desktop)
            className="h-8 w-8 md:h-9 md:w-9 lg:h-12 lg:w-12 rounded-full transition-all duration-300 object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = logoPlaceholderUrl;
            }}
          />
          {/* RESPONSIVE TEXT: text-lg (phone) -> text-lg (tablet) -> text-2xl (desktop) */}
          <h1 className="text-lg md:text-lg lg:text-2xl font-bold tracking-wide text-white drop-shadow-md whitespace-nowrap">
            Presentryx
          </h1>
        </div>

        {/* --- CENTER: Navigation Links --- */}
        {/* LOGIC: 
           - Hidden on Mobile (< 768px)
           - Flex on Tablet & up (md:flex)
           - Layout: absolute center to ensure perfect alignment, but uses 'hidden' on mobile to prevent overlap
        */}
        <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2">
          <ul
            className="flex items-center justify-center w-full
            gap-4         /* Tablet Gap: Tight */
            lg:gap-8      /* Laptop Gap: Normal */
            xl:gap-12     /* Desktop Gap: Wide */
          "
          >
            {navItems.map((item) => (
              <li key={item.name}>
                <a
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.name)}
                  // RESPONSIVE FONT SIZE:
                  // text-xs (Tablet) -> text-sm (Laptop) -> text-base (Desktop)
                  className="
                    text-white/90 font-medium tracking-wide 
                    text-xs lg:text-sm xl:text-base
                    hover:text-white transition-all hover:underline 
                    decoration-indigo-500 decoration-2 underline-offset-8 
                    whitespace-nowrap cursor-pointer
                  "
                >
                  {item.name}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* --- RIGHT: Action Buttons --- */}
        <div className="flex items-center z-20 gap-3">
          {/* Desktop/Tablet Buttons */}
          <div className="hidden md:flex items-center gap-2 lg:gap-4">
            <button
              onClick={onLoginClick}
              // Scaling text size
              className="text-xs lg:text-base text-white/90 hover:text-white font-semibold px-2 py-1 lg:px-4 lg:py-2 transition-colors duration-300 whitespace-nowrap"
            >
              Log In
            </button>

            <button
              onClick={onSignUpClick}
              // Scaling button size: Smaller padding on tablet, larger on desktop
              className="
                bg-indigo-600 text-white rounded-md font-bold transition duration-300 
                shadow-lg shadow-indigo-600/40 hover:bg-indigo-500 hover:scale-105
                text-xs px-3 py-1.5        /* Tablet Size */
                lg:text-base lg:px-6 lg:py-2 /* Desktop Size */
                whitespace-nowrap
              "
            >
              Sign Up
            </button>
          </div>

          {/* --- Mobile Hamburger Toggle (Hidden on Tablet/Desktop) --- */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            // md:hidden ensures this ONLY shows on small mobile screens
            className="md:hidden bg-gray-800/80 text-white p-2 rounded-lg shadow-lg border border-white/10 backdrop-blur-sm"
          >
            <span
              className={`block relative z-10 transition-all duration-500 text-lg leading-none ${
                menuOpen ? "rotate-180 scale-110" : "rotate-0 scale-100"
              }`}
            >
              {menuOpen ? "✖" : "☰"}
            </span>
          </button>
        </div>
      </nav>

      {/* --- Mobile Dropdown Content --- */}
      {/* Only rendered when menuOpen is true AND on mobile */}
      <div
        className={`
          md:hidden fixed top-[60px] left-0 w-full bg-gray-900/95 backdrop-blur-xl 
          border-b border-white/10 shadow-2xl transition-all duration-300 ease-in-out origin-top
          ${
            menuOpen
              ? "opacity-100 scale-y-100 translate-y-0"
              : "opacity-0 scale-y-0 -translate-y-4 pointer-events-none h-0"
          }
        `}
      >
        <div className="flex flex-col items-center py-8 space-y-6">
          {navItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              onClick={(e) => handleNavClick(e, item.name)}
              className="text-gray-200 hover:text-white text-lg font-medium tracking-wide hover:scale-105 transition-transform duration-200"
            >
              {item.name}
            </a>
          ))}

          {/* Divider */}
          <div className="w-16 h-px bg-white/20 my-2"></div>

          <div className="flex flex-col w-full px-10 gap-4">
            <button
              onClick={() => closeMenu(onLoginClick)}
              className="text-white font-semibold py-2"
            >
              Log In
            </button>
            <button
              onClick={() => closeMenu(onSignUpClick)}
              className="bg-indigo-600 text-white w-full py-3 rounded-lg font-bold shadow-lg hover:bg-indigo-500 active:scale-95 transition-all"
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default AppHeader;
