import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import LanguageSwitcher from '../common/LanguageSwitcher';

function PublicLayout({ children }) {
  const { t } = useTranslation();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Smooth scroll to section
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setMobileMenuOpen(false); // Close mobile menu after clicking
    }
  };

  // Handle navbar background on scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
      
      // Determine active section based on scroll position
      const sections = ['home', 'about', 'rooms', 'services', 'gallery', 'contact'];
      const scrollPosition = window.scrollY + 100; // offset for navbar height
      
      for (const sectionId of sections) {
        const element = document.getElementById(sectionId === 'home' ? 'hero-section' : sectionId);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };
    
    handleScroll(); // Initial call
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path) => {
    return location.pathname === path;
  };
  
  const isSectionActive = (section) => {
    return activeSection === section;
  };

  return (
    <div className="min-h-screen flex flex-col bg-transparent w-full px-0">
      {/* Navbar */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled 
            ? 'bg-white shadow-lg' 
            : 'bg-transparent'
        }`}
      >
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex justify-between h-20">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="flex items-center"
            >
              <Link to="/" className="flex items-center space-x-3">
                <motion.div 
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg"
                >
                  <span className="text-2xl font-bold text-white">C</span>
                </motion.div>
                <span className={`text-2xl font-bold transition-all duration-500 ${
                  scrolled ? 'text-gray-900' : 'text-white drop-shadow-lg'
                }`} style={!scrolled ? { textShadow: '0 2px 10px rgba(0,0,0,0.3)' } : {}}>
                  Comfort Hub
                </span>
              </Link>
            </motion.div>

            <div className="hidden lg:flex items-center space-x-8">
              <a
                href="/#hero-section"
                className={`text-sm font-semibold transition-all duration-500 hover:scale-110 relative group ${
                  isSectionActive('home')
                    ? 'text-indigo-600' 
                    : scrolled 
                      ? 'text-gray-800 hover:text-indigo-600'
                      : 'text-white hover:text-indigo-100'
                }`}
                style={!scrolled ? { textShadow: '0 2px 8px rgba(0,0,0,0.4)' } : {}}
              >
                {t('nav.home')}
                {isSectionActive('home') && (
                  <motion.div 
                    layoutId="activeNav"
                    className={`absolute -bottom-1 left-0 right-0 h-0.5 ${
                      scrolled ? 'bg-indigo-600' : 'bg-white'
                    }`}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </a>
              <a
                href="/#about"
                className={`text-sm font-semibold transition-all duration-500 hover:scale-110 relative group ${
                  isSectionActive('about')
                    ? 'text-indigo-600'
                    : scrolled 
                      ? 'text-gray-800 hover:text-indigo-600'
                      : 'text-white hover:text-indigo-100'
                }`}
                style={!scrolled ? { textShadow: '0 2px 8px rgba(0,0,0,0.4)' } : {}}
              >
                {t('nav.about')}
                {isSectionActive('about') && (
                  <motion.div 
                    layoutId="activeNav"
                    className={`absolute -bottom-1 left-0 right-0 h-0.5 ${
                      scrolled ? 'bg-indigo-600' : 'bg-white'
                    }`}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </a>
              <a
                href="/#rooms"
                className={`text-sm font-semibold transition-all duration-500 hover:scale-110 relative group ${
                  isSectionActive('rooms')
                    ? 'text-indigo-600'
                    : scrolled 
                      ? 'text-gray-800 hover:text-indigo-600'
                      : 'text-white hover:text-indigo-100'
                }`}
                style={!scrolled ? { textShadow: '0 2px 8px rgba(0,0,0,0.4)' } : {}}
              >
                {t('nav.rooms')}
                {isSectionActive('rooms') && (
                  <motion.div 
                    layoutId="activeNav"
                    className={`absolute -bottom-1 left-0 right-0 h-0.5 ${
                      scrolled ? 'bg-indigo-600' : 'bg-white'
                    }`}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </a>
              <a
                href="/#services"
                className={`text-sm font-semibold transition-all duration-500 hover:scale-110 relative group ${
                  isSectionActive('services')
                    ? 'text-indigo-600'
                    : scrolled 
                      ? 'text-gray-800 hover:text-indigo-600'
                      : 'text-white hover:text-indigo-100'
                }`}
                style={!scrolled ? { textShadow: '0 2px 8px rgba(0,0,0,0.4)' } : {}}
              >
                {t('nav.services')}
                {isSectionActive('services') && (
                  <motion.div 
                    layoutId="activeNav"
                    className={`absolute -bottom-1 left-0 right-0 h-0.5 ${
                      scrolled ? 'bg-indigo-600' : 'bg-white'
                    }`}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </a>
              <a
                href="/#gallery"
                className={`text-sm font-semibold transition-all duration-500 hover:scale-110 relative group ${
                  isSectionActive('gallery')
                    ? 'text-indigo-600'
                    : scrolled 
                      ? 'text-gray-800 hover:text-indigo-600'
                      : 'text-white hover:text-indigo-100'
                }`}
                style={!scrolled ? { textShadow: '0 2px 8px rgba(0,0,0,0.4)' } : {}}
              >
                {t('nav.gallery')}
                {isSectionActive('gallery') && (
                  <motion.div 
                    layoutId="activeNav"
                    className={`absolute -bottom-1 left-0 right-0 h-0.5 ${
                      scrolled ? 'bg-indigo-600' : 'bg-white'
                    }`}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </a>
              <a
                href="/#contact"
                className={`text-sm font-semibold transition-all duration-500 hover:scale-110 relative group ${
                  isSectionActive('contact')
                    ? 'text-indigo-600'
                    : scrolled 
                      ? 'text-gray-800 hover:text-indigo-600'
                      : 'text-white hover:text-indigo-100'
                }`}
                style={!scrolled ? { textShadow: '0 2px 8px rgba(0,0,0,0.4)' } : {}}
              >
                {t('nav.contact')}
                {isSectionActive('contact') && (
                  <motion.div 
                    layoutId="activeNav"
                    className={`absolute -bottom-1 left-0 right-0 h-0.5 ${
                      scrolled ? 'bg-indigo-600' : 'bg-white'
                    }`}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </a>
            </div>

            <div className="flex items-center space-x-4">
              <div className={`hidden lg:block ${scrolled ? '' : 'drop-shadow-lg'}`}>
                <LanguageSwitcher variant="dropdown" scrolled={scrolled} />
              </div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="hidden lg:block">
                <Link
                  to="/guest/login"
                  className={`text-sm font-semibold transition-all duration-500 ${
                    scrolled 
                      ? 'text-gray-800 hover:text-indigo-600'
                      : 'text-white hover:text-indigo-100'
                  }`}
                  style={!scrolled ? { textShadow: '0 2px 8px rgba(0,0,0,0.4)' } : {}}
                >
                  {t('nav.login')}
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="hidden lg:block">
                <Link
                  to="/guest/register"
                  className={`px-6 py-2.5 rounded-lg font-bold transition-all duration-500 shadow-lg hover:shadow-xl border-2 ${
                    scrolled
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-transparent hover:from-indigo-700 hover:to-purple-700'
                      : 'bg-white text-indigo-600 border-white hover:bg-indigo-50'
                  }`}
                >
                  {t('nav.register')}
                </Link>
              </motion.div>

              {/* Mobile menu button */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`lg:hidden p-2 rounded-lg ${
                  scrolled ? 'text-gray-800' : 'text-white'
                }`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </motion.button>
            </div>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-white shadow-lg rounded-b-2xl overflow-hidden"
            >
              <div className="px-4 py-6 space-y-4">
                {[
                  { label: t('nav.home'), section: 'hero-section' },
                  { label: t('nav.about'), section: 'about' },
                  { label: t('nav.rooms'), section: 'rooms' },
                  { label: t('nav.services'), section: 'services' },
                  { label: t('nav.gallery'), section: 'gallery' },
                  { label: t('nav.contact'), section: 'contact' }
                ].map((item) => (
                  <button
                    key={item.section}
                    onClick={() => scrollToSection(item.section)}
                    className="block w-full text-left px-4 py-3 text-gray-800 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition font-semibold"
                  >
                    {item.label}
                  </button>
                ))}
                
                <div className="border-t pt-4 space-y-3">
                  <LanguageSwitcher variant="dropdown" />
                  
                  <Link
                    to="/guest/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full text-center px-4 py-3 text-gray-800 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition font-semibold"
                  >
                    {t('nav.login')}
                  </Link>
                  
                  <Link
                    to="/guest/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full text-center px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-bold hover:from-indigo-700 hover:to-purple-700 transition"
                  >
                    {t('nav.register')}
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.nav>

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* About */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center space-x-3 mb-4">
                <motion.div 
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                  className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center"
                >
                  <span className="text-xl font-bold text-white">C</span>
                </motion.div>
                <h3 className="text-xl font-bold">Comfort Hub</h3>
              </div>
              <p className="text-gray-400 text-sm">
                Eng yaxshi xizmat va qulay xonalar bilan sizni kutamiz.
              </p>
            </motion.div>

            {/* Quick Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-lg font-bold mb-4">{t('footer.quickLinks')}</h3>
              <ul className="space-y-2">
                {[
                  { label: t('nav.rooms'), section: 'rooms' },
                  { label: t('nav.about'), section: 'about' },
                  { label: t('nav.services'), section: 'services' },
                  { label: t('nav.gallery'), section: 'gallery' },
                  { label: t('nav.contact'), section: 'contact' }
                ].map((item) => (
                  <motion.li 
                    key={item.section}
                    whileHover={{ x: 5 }} 
                    transition={{ duration: 0.2 }}
                  >
                    <button
                      onClick={() => {
                        if (location.pathname === '/') {
                          scrollToSection(item.section);
                        } else {
                          window.location.href = `/#${item.section}`;
                        }
                      }}
                      className="text-gray-400 hover:text-white text-sm transition-colors duration-200"
                    >
                      {item.label}
                    </button>
                  </motion.li>
                ))}
                <motion.li whileHover={{ x: 5 }} transition={{ duration: 0.2 }}>
                  <Link 
                    to="/guest/register" 
                    className="text-gray-400 hover:text-indigo-400 text-sm transition-colors duration-200 flex items-center gap-1"
                  >
                    {t('nav.register')}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                </motion.li>
              </ul>
            </motion.div>

            {/* Contact */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="text-lg font-bold mb-4">{t('footer.contact')}</h3>
              <ul className="space-y-3 text-sm text-gray-400">
                <motion.li whileHover={{ x: 5, color: '#818CF8' }} className="flex items-center space-x-3 transition-colors">
                  <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <span>Toshkent, O'zbekiston</span>
                </motion.li>
                <motion.li whileHover={{ x: 5, color: '#818CF8' }} className="transition-colors">
                  <a href="tel:+998901234567" className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <span>+998 90 123 45 67</span>
                  </a>
                </motion.li>
                <motion.li whileHover={{ x: 5, color: '#818CF8' }} className="transition-colors">
                  <a href="mailto:info@comforthub.uz" className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span>info@comforthub.uz</span>
                  </a>
                </motion.li>
              </ul>
            </motion.div>

            {/* Social */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <h3 className="text-lg font-bold mb-4">{t('footer.followUs')}</h3>
              <div className="flex space-x-3">
                {[
                  { 
                    name: 'Facebook', 
                    icon: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
                    color: 'hover:bg-blue-600'
                  },
                  { 
                    name: 'Instagram', 
                    icon: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z',
                    color: 'hover:bg-pink-600'
                  },
                  { 
                    name: 'Twitter', 
                    icon: 'M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z',
                    color: 'hover:bg-sky-500'
                  }
                ].map((social) => (
                  <motion.a 
                    key={social.name}
                    href="#" 
                    whileHover={{ scale: 1.15, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                    className={`w-10 h-10 bg-gray-800 ${social.color} rounded-lg flex items-center justify-center transition-all duration-300 group`}
                    aria-label={social.name}
                  >
                    <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                      <path d={social.icon}/>
                    </svg>
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400"
          >
            <p>&copy; 2025 Comfort Hub. {t('footer.allRightsReserved')}.</p>
          </motion.div>
        </div>
      </footer>
    </div>
  );
}

export default PublicLayout;
