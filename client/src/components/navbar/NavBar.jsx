import { Link } from 'react-router-dom';
import { useState } from 'react';

const NavBar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  return (
    <nav className="bg-gray-800 shadow-lg">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* Logo on the left */}
          <div>
            <Link to="/" className="flex items-center py-5 px-2 text-gray-200 hover:text-white">
              <div className="flex items-center">
                <img
                  src="/src/assets/images/logo.png"
                  alt="Logo"
                  className="h-12 w-auto object-contain drop-shadow-lg"
                  style={{ filter: 'brightness(1.1) contrast(1.1)' }}
                />
                <span className="font-semibold text-xl ml-3 tracking-wider uppercase">RIA-STREAM</span>
              </div>
            </Link>
          </div>
          
          {/* Primary Nav - Centered */}
          <div className="hidden md:flex items-center space-x-1">
            <Link to="/stream" className="py-5 px-3 text-gray-300 hover:text-white">Stream Data</Link>
            <Link to="/history" className="py-5 px-3 text-gray-300 hover:text-white">History</Link>
            <Link to="/predict" className="py-5 px-3 text-gray-300 hover:text-white">Make You Predict</Link>
          </div>
          
          {/* Contact Us - Right aligned */}
          <div className="hidden md:flex items-center">

          </div>
          
          {/* Mobile button */}
          <div className="md:hidden flex items-center">
            <button
              className="mobile-menu-button p-4 focus:outline-none"
              onClick={toggleMobileMenu}
            >
              <svg className="h-6 w-6 text-gray-300 hover:text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <div className={`mobile-menu md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
        <Link to="/stream" className="block py-2 px-4 text-sm hover:bg-gray-700 text-gray-300 hover:text-white">Stream Data</Link>
        <Link to="/history" className="block py-2 px-4 text-sm hover:bg-gray-700 text-gray-300 hover:text-white">History</Link>
        <Link to="/predict" className="block py-2 px-4 text-sm hover:bg-gray-700 text-gray-300 hover:text-white">Make You Predict</Link>
      </div>
    </nav>
  );
};

export default NavBar;