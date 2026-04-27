import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "nav": {
        "home": "Home",
        "about": "About",
        "contact": "Contact",
        "login": "Login",
        "register": "Join Us"
      },
      "hero": {
        "title": "Smart Boda Boda Ride Management",
        "subtitle": "Connecting passengers, riders, and fleet owners in one unified ecosystem. Built for East Africa.",
        "cta_request": "Request a Ride",
        "cta_join": "Become a Partner"
      },
      "auth": {
        "login_title": "Welcome Back",
        "register_title": "Create Account",
        "email": "Email Address",
        "password": "Password",
        "fullname": "Full Name",
        "role": "Select Your Role",
        "client": "Passenger",
        "rider": "Rider (Driver)",
        "owner": "Fleet Owner",
        "admin": "Admin",
        "submit_login": "Sign In",
        "submit_register": "Sign Up",
        "no_account": "Don't have an account?",
        "have_account": "Already have an account?"
      },
      "dashboard": {
        "overview": "Overview",
        "rides": "My Rides",
        "wallet": "Wallet",
        "fleet": "Fleet Management",
        "bikes": "Bikes",
        "riders": "Riders",
        "reports": "Reports",
        "settings": "Settings",
        "logout": "Logout",
        "welcome": "Welcome back, {{name}}",
        "stats": {
          "total_rides": "Total Rides",
          "earnings": "Total Earnings",
          "active_bikes": "Active Bikes",
          "rating": "Average Rating"
        }
      }
    }
  },
  sw: {
    translation: {
      "nav": {
        "home": "Mwanzo",
        "about": "Kuhusu",
        "contact": "Wasiliana",
        "login": "Ingia",
        "register": "Jiunge Nasi"
      },
      "hero": {
        "title": "Usimamizi Bora wa Usafiri wa Boda Boda",
        "subtitle": "Kuunganisha abiria, madereva, na wamiliki wa vyombo katika mfumo mmoja. Imeundwa kwa ajili ya Afrika Mashariki.",
        "cta_request": "Omba Usafiri",
        "cta_join": "Kuwa mshirika"
      },
      "auth": {
        "login_title": "Karibu Tena",
        "register_title": "Fungua Akaunti",
        "email": "Barua Pepe",
        "password": "Nenosiri",
        "fullname": "Jina Kamili",
        "role": "Chagua Jukumu Lako",
        "client": "Abiria",
        "rider": "Dereva (Rider)",
        "owner": "Mmiliki wa Fleet",
        "admin": "Admin",
        "submit_login": "Ingia",
        "submit_register": "Jisajili",
        "no_account": "Hauna akaunti?",
        "have_account": "Tayari una akaunti?"
      },
      "dashboard": {
        "overview": "Muhtasari",
        "rides": "Safari Zangu",
        "wallet": "Mkoba",
        "fleet": "Usimamizi wa Vyombo",
        "bikes": "Pikipiki",
        "riders": "Madereva",
        "reports": "Ripoti",
        "settings": "Mipangilio",
        "logout": "Ondoka",
        "welcome": "Karibu tena, {{name}}",
        "stats": {
          "total_rides": "Jumla ya Safari",
          "earnings": "Jumla ya Mapato",
          "active_bikes": "Pikipiki Zinazofanya Kazi",
          "rating": "Wastani wa Ukadiriaji"
        }
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
