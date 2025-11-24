// AppFooter component renders the footer section with copyright, social links, and branding.
function AppFooter() {
  return (
    <section id="contact">
      <footer className="bg-gray-900 text-white py-12 text-center relative">
        <div className="container mx-auto px-6">
          <p className="mb-6">
            &copy; 2025 Presentryx. All rights reserved. |{" "}
            <a href="#" className="text-blue-400 hover:text-blue-300 underline">
              Presentryx
            </a>
          </p>
          <ul className="flex justify-center space-x-8 mb-6">
            <li>
              <a
                href="https://www.instagram.com/_anthoninja/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xl hover:scale-110 transition-transform duration-300"
              >
                📸 Instagram
              </a>
            </li>
            <li>
              <a
                href="https://www.facebook.com/johnmichael.devera.372"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xl hover:scale-110 transition-transform duration-300"
              >
                📘 Facebook
              </a>
            </li>
            <li>
              <a
                href="https://www.facebook.com/johnjeremy.eugenio"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xl hover:scale-110 transition-transform duration-300"
              >
                ❓ Support
              </a>
            </li>
          </ul>
          <div className="border-t border-gray-700 pt-6">
            <p className="text-gray-400">
              Powered by Presentryx for Smarter Schools
            </p>
          </div>
        </div>
      </footer>
    </section>
  );
}

export default AppFooter;
