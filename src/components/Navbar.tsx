import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Globe, Bike, Menu, X, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { isDark, toggleTheme } = useTheme();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const toggleLang = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'sw' : 'en');
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-white dark:bg-black border-b border-slate-100 dark:border-white/10 px-6 py-4 flex justify-between items-center transition-all duration-300">
      <Link to="/" className="flex items-center gap-2">
        <Bike className="text-primary-light w-8 h-8" />
        <span className="text-2xl font-black tracking-tighter text-primary-light dark:text-white">BodaKitaa</span>
      </Link>

      <div className="flex items-center gap-4 lg:gap-8">
        <div className="hidden lg:flex gap-8 text-sm font-medium">
          <Link to="/" className="text-slate-700 dark:text-slate-300 hover:text-primary-light dark:hover:text-primary-light transition-colors">{t('nav.home')}</Link>
          <a href="#features" className="text-slate-700 dark:text-slate-300 hover:text-primary-light dark:hover:text-primary-light transition-colors">{t('nav.about')}</a>
          <a href="#contact" className="text-slate-700 dark:text-slate-300 hover:text-primary-light dark:hover:text-primary-light transition-colors">{t('nav.contact')}</a>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <button onClick={toggleLang} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors flex items-center gap-1 text-slate-700 dark:text-white">
            <Globe size={18} />
            <span className="text-xs font-bold uppercase hidden xs:block">{i18n.language}</span>
          </button>

          <button onClick={toggleTheme} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors text-slate-700 dark:text-white">
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <div className="hidden md:flex items-center gap-3">
            <Link to="/login" className="premium-btn text-sm border-2 border-primary-light text-primary-light hover:bg-primary-light hover:text-white bg-transparent py-2 px-4">
              {t('nav.login')}
            </Link>
            <Link to="/register" className="premium-btn text-sm bg-primary-light text-white hover:opacity-90 shadow-lg shadow-primary-light/30 border-2 border-primary-light py-2 px-4">
              {t('nav.register')}
            </Link>
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 lg:hidden text-slate-700 dark:text-white hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay & Drawer */}
      <div className={`fixed inset-0 z-[100] lg:hidden transition-all duration-500 ${isMobileMenuOpen ? 'visible' : 'invisible'}`}>
        {/* Dimmer Background */}
        <div
          className={`absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-500 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setIsMobileMenuOpen(false)}
        />

        {/* Drawer Content */}
        <div className={`absolute inset-y-0 right-0 w-full xs:w-[320px] bg-white/80 dark:bg-black/80 backdrop-blur-2xl border-l border-white/20 shadow-2xl p-8 flex flex-col gap-10 transition-transform duration-500 ease-out ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex justify-between items-center mb-4">
            <Link to="/" className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
              <Bike className="text-primary-light w-8 h-8" />
              <span className="text-xl font-black tracking-tighter text-primary-light dark:text-white">BodaKitaa</span>
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors text-slate-700 dark:text-white"
            >
              <X size={24} />
            </button>
          </div>

          <div className="flex flex-col gap-8 relative z-10">
            <Link
              to="/"
              className="text-2xl font-black text-slate-900 dark:text-white flex items-center justify-between group"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {t('nav.home')}
              <ArrowRight className="opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary-light" />
            </Link>
            <a
              href="#features"
              className="text-2xl font-black text-slate-900 dark:text-white flex items-center justify-between group"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {t('nav.about')}
              <ArrowRight className="opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary-light" />
            </a>
            <a
              href="#contact"
              className="text-2xl font-black text-slate-900 dark:text-white flex items-center justify-between group"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {t('nav.contact')}
              <ArrowRight className="opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary-light" />
            </a>
          </div>

          <div className="mt-auto flex flex-col gap-4 relative z-10">
            <Link
              to="/login"
              className="w-full py-4 text-center rounded-2xl border-2 border-primary-light text-primary-light font-bold text-lg hover:bg-primary-light hover:text-white transition-all"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {t('nav.login')}
            </Link>
            <Link
              to="/register"
              className="w-full py-4 text-center rounded-2xl bg-primary-light text-white font-bold text-lg shadow-lg shadow-primary-light/30 border-2 border-primary-light hover:opacity-90 transition-all"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {t('nav.register')}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
