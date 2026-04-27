import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Globe, Bike } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { isDark, toggleTheme } = useTheme();

  const toggleLang = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'sw' : 'en');
  };

  return (
    <nav className="fixed top-0 w-full z-50 glass px-6 py-4 flex justify-between items-center transition-all duration-300">
      <Link to="/" className="flex items-center gap-2">
        <Bike className="text-primary-light w-8 h-8" />
        <span className="text-2xl font-black tracking-tighter text-primary-light dark:text-white">BodaKitaa</span>
      </Link>

      <div className="flex items-center gap-6">
        <div className="hidden md:flex gap-8 text-sm font-medium">
          <Link to="/" className="text-slate-700 dark:text-slate-300 hover:text-primary-light dark:hover:text-primary-light transition-colors">{t('nav.home')}</Link>
          <a href="#features" className="text-slate-700 dark:text-slate-300 hover:text-primary-light dark:hover:text-primary-light transition-colors">{t('nav.about')}</a>
          <a href="#contact" className="text-slate-700 dark:text-slate-300 hover:text-primary-light dark:hover:text-primary-light transition-colors">{t('nav.contact')}</a>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={toggleLang} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors flex items-center gap-1 text-slate-700 dark:text-white">
            <Globe size={18} />
            <span className="text-xs font-bold uppercase">{i18n.language}</span>
          </button>
          
          <button onClick={toggleTheme} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors text-slate-700 dark:text-white">
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <Link to="/login" className="premium-btn text-sm border-2 border-primary-light text-primary-light hover:bg-primary-light hover:text-white bg-transparent">
            {t('nav.login')}
          </Link>
          
          <Link to="/register" className="premium-btn text-sm bg-primary-light text-white hover:opacity-90 shadow-lg shadow-primary-light/30 border-2 border-primary-light">
            {t('nav.register')}
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
