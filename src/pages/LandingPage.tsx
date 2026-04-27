import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Shield, Zap, TrendingUp, Users, Bike, Star, ArrowRight, CheckCircle,
  MapPin, Clock, Smartphone, Globe, ChevronDown, PhoneCall, Mail,
  Instagram, Twitter, Facebook, ArrowUpRight, Activity, Award
} from 'lucide-react';
import Navbar from '../components/Navbar';
import bodasImage from '../assets/bodas.jpeg';

gsap.registerPlugin(ScrollTrigger);

// --- Types ---
interface FeatureItem {
  id: string;
  icon: React.ElementType;
  titleKey: string;
  descKey: string;
  color: string;
  delay: number;
}

interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  rating: number;
  avatarUrl: string;
}

interface PricingTier {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  isPopular?: boolean;
}

interface FAQItem {
  question: string;
  answer: string;
}

// --- Dummy Data ---
const featuresData: FeatureItem[] = [
  { id: 'f1', icon: Shield, titleKey: 'Safety First', descKey: 'Every ride is monitored in real-time. Verified riders, SOS buttons, and ride-sharing links ensure your complete peace of mind throughout the journey.', color: 'text-primary-light', delay: 0 },
  { id: 'f2', icon: Zap, titleKey: 'Lightning Fast', descKey: 'Our AI-powered dispatch algorithm connects you with the nearest available rider in seconds, minimizing your wait time drastically.', color: 'text-amber-500', delay: 0.2 },
  { id: 'f3', icon: TrendingUp, titleKey: 'Transparent Pricing', descKey: 'No hidden fees. See the estimated fare before you book, and pay seamlessly via cash, M-Pesa, Tigo Pesa, or Airtel Money.', color: 'text-green-500', delay: 0.4 },
  { id: 'f4', icon: Users, titleKey: 'Fleet Management', descKey: 'Owners can track bike earnings, assign riders, set daily targets, and monitor maintenance schedules all from a single dashboard.', color: 'text-blue-500', delay: 0.6 },
  { id: 'f5', icon: Activity, titleKey: 'Performance Analytics', descKey: 'Deep insights into ride patterns, peak hours, and driver performance to optimize operations and maximize revenue streams.', color: 'text-purple-500', delay: 0.8 },
  { id: 'f6', icon: Award, titleKey: 'Premium Support', descKey: '24/7 dedicated support team ready to assist you with any inquiries, disputes, or technical issues you might face.', color: 'text-pink-500', delay: 1.0 },
];

const testimonialsData: Testimonial[] = [
  { id: 't1', name: 'Aisha Juma', role: 'Daily Commuter', content: 'BodaKitaa has completely changed how I commute to work. The app is fast, the riders are professional, and the pricing is very transparent. I feel much safer using this platform compared to hailing a random bike on the street.', rating: 5, avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aisha' },
  { id: 't2', name: 'Baraka M.', role: 'Fleet Owner', content: 'As an owner of 15 bikes, tracking daily collections was a nightmare. This system gives me a crystal clear view of every bike\'s revenue, maintenance needs, and rider performance. It is a game changer for my business.', rating: 5, avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Baraka' },
  { id: 't3', name: 'Kassim Ali', role: 'Professional Rider', content: 'Since I joined the platform, my daily earnings have increased significantly. The app directs me to high-demand areas, reducing my idle time. The wallet system makes it easy to track my income.', rating: 4, avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kassim' },
];

const pricingData: PricingTier[] = [
  { id: 'p1', name: 'Passenger', price: 'Free', period: 'Forever', description: 'Everything you need to request and track rides safely.', features: ['Real-time GPS tracking', 'Fare estimation', 'Multiple payment options', 'SOS emergency button', 'Ride history & receipts'] },
  { id: 'p2', name: 'Fleet Owner Pro', price: '$29', period: '/month', description: 'Advanced tools for managing multiple motorcycles.', isPopular: true, features: ['Unlimited bike registration', 'Real-time revenue tracking', 'Rider assignment & scheduling', 'Maintenance logs & alerts', 'Detailed performance analytics', 'Priority customer support'] },
  { id: 'p3', name: 'Enterprise API', price: 'Custom', period: '', description: 'Integrate our logistics engine into your own business.', features: ['Full REST/GraphQL API access', 'Custom webhooks', 'Dedicated account manager', 'SLA guarantees', 'Custom white-label options'] },
];

const faqData: FAQItem[] = [
  { question: 'How do I request a ride?', answer: 'Simply download the app, create an account, enter your destination in the search bar, review the estimated fare, and tap "Request Ride". The nearest available rider will be dispatched to your location immediately.' },
  { question: 'What payment methods are supported?', answer: 'We support a variety of payment methods to ensure convenience. You can pay using cash directly to the rider, or digitally via mobile money platforms like M-Pesa, Tigo Pesa, Airtel Money, and HaloPesa.' },
  { question: 'How do I register as a fleet owner?', answer: 'Navigate to the registration page and select the "Fleet Owner" role. You will need to provide your business details, and then you can start adding your motorcycles (with plate numbers and insurance details) to your digital garage.' },
  { question: 'Is my personal information secure?', answer: 'Yes, absolutely. We use industry-standard encryption to protect your data. Your location is only shared during an active ride, and your payment details are processed securely through certified gateway partners.' },
  { question: 'What happens in case of an emergency?', answer: 'Our app features a prominent SOS button. When triggered, it immediately sends your live location and vehicle details to your pre-configured trusted contacts and alerts our 24/7 security monitoring team.' },
];

// --- Sub-Components ---

const HeroSection: React.FC = () => {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      tl.fromTo(".hero-badge", { y: 20, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.6, ease: "back.out(1.7)" })
        .fromTo(".hero-title span", { y: 100, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8, stagger: 0.1, ease: "power4.out" }, "-=0.2")
        .fromTo(".hero-subtitle", { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8, ease: "power3.out" }, "-=0.4")
        .fromTo(".hero-cta", { y: 20, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.6, stagger: 0.2, ease: "power2.out" }, "-=0.4")
        .fromTo(".hero-graphic", { scale: 0.8, autoAlpha: 0, rotation: 5 }, { scale: 1, autoAlpha: 1, rotation: 0, duration: 1.2, ease: "elastic.out(1, 0.7)" }, "-=1");

      gsap.to(".floating-element", {
        y: -20,
        rotation: 2,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        stagger: 0.2
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="relative pt-40 pb-32 px-6 overflow-hidden">
      {/* Decorative Background Patterns */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-primary-light/10 rounded-full blur-[100px] mix-blend-screen" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[800px] h-[800px] bg-primary-dark/20 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute top-[30%] left-[20%] w-[300px] h-[300px] bg-amber-500/10 rounded-full blur-[80px]" />

        {/* Abstract Grid */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsIDI1NSwgMjU1LCAwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />
      </div>

      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center relative z-10">
        <div className="space-y-10">
          <div className="hero-badge inline-flex items-center gap-3 px-5 py-2.5 rounded-full glass border border-primary-light/30 text-sm font-bold uppercase tracking-widest text-primary-light shadow-[0_0_30px_rgba(254,119,67,0.2)]">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-light opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary-light"></span>
            </span>
            The Future of Urban Mobility
          </div>

          <h1 className="hero-title text-6xl sm:text-7xl lg:text-8xl font-black leading-[1.1] tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white to-white/60 dark:from-white dark:to-slate-400">
            <span className="block">Smart</span>
            <span className="block text-primary-light">Transport</span>
            <span className="block">Ecosystem</span>
          </h1>

          <p className="hero-subtitle text-xl sm:text-2xl text-slate-600 dark:text-slate-300 max-w-xl font-light leading-relaxed">
            {t('hero.subtitle')} Experience seamless ride-hailing, transparent pricing, and advanced fleet management in one revolutionary platform.
          </p>

          <div className="flex flex-col sm:flex-row gap-5">
            <button className="hero-cta premium-btn bg-primary-light text-white text-lg px-8 py-5 flex items-center justify-center gap-3 shadow-[0_20px_40px_-15px_rgba(254,119,67,0.5)] group overflow-hidden relative">
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              <span className="relative z-10 font-black">{t('hero.cta_request')}</span>
              <ArrowRight className="relative z-10 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="hero-cta premium-btn glass text-lg px-8 py-5 border border-primary-light/20 text-slate-800 dark:text-white hover:bg-primary-light/10 flex items-center justify-center gap-3 group">
              <span className="font-bold">{t('hero.cta_join')}</span>
              <div className="w-8 h-8 rounded-full bg-primary-light/20 flex items-center justify-center group-hover:bg-primary-light group-hover:text-white transition-colors">
                <ArrowUpRight size={18} />
              </div>
            </button>
          </div>

          <div className="hero-cta pt-8 flex items-center gap-6 border-t border-slate-200 dark:border-white/10">
            <div className="flex -space-x-4">
              {[1, 2, 3, 4].map((i) => (
                <img key={i} src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} alt="User" className="w-12 h-12 rounded-full border-2 border-white dark:border-black bg-slate-200" />
              ))}
            </div>
            <div>
              <div className="flex items-center gap-1 text-amber-500 mb-1">
                {[1, 2, 3, 4, 5].map((star) => <Star key={star} size={16} className="fill-current" />)}
              </div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Trusted by 10,000+ users</p>
            </div>
          </div>
        </div>

        <div className="hero-graphic relative hidden lg:block">
          <div className="absolute inset-0 bg-gradient-to-tr from-primary-light/20 to-transparent rounded-[3rem] transform rotate-3 scale-105 blur-lg" />
          <div className="relative glass p-2 rounded-[3rem] border border-white/20 shadow-2xl backdrop-blur-xl overflow-hidden aspect-[4/5] flex items-center justify-center bg-slate-900/50">
            <div className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay" style={{ backgroundImage: `url(${bodasImage})` }} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            {/* Floating UI Elements within Graphic */}
            <div className="floating-element absolute top-10 left-10 glass p-4 rounded-2xl border border-white/10 flex items-center gap-4 shadow-xl">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center text-green-500">
                <MapPin size={24} />
              </div>
              <div>
                <p className="text-xs text-slate-300 font-bold uppercase tracking-wider">Driver Found</p>
                <p className="text-white font-black">2 mins away</p>
              </div>
            </div>

            <div className="floating-element absolute bottom-20 right-10 glass p-4 rounded-2xl border border-white/10 flex items-center gap-4 shadow-xl" style={{ animationDelay: '1s' }}>
              <div className="w-12 h-12 bg-primary-light/20 rounded-xl flex items-center justify-center text-primary-light">
                <Shield size={24} />
              </div>
              <div>
                <p className="text-xs text-slate-300 font-bold uppercase tracking-wider">Safe Ride</p>
                <p className="text-white font-black">Verified & Insured</p>
              </div>
            </div>

            <Bike size={200} className="text-white relative z-10 drop-shadow-[0_0_30px_rgba(255,255,255,0.5)] transform -rotate-12" />
          </div>
        </div>
      </div>
    </section>
  );
};

const FeatureSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Attractive Animated Background Blobs
      gsap.to(".bg-blob", {
        x: "random(-50, 50)",
        y: "random(-50, 50)",
        rotation: "random(-20, 20)",
        scale: "random(0.8, 1.2)",
        duration: "random(4, 8)",
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        stagger: { amount: 2, from: "random" }
      });

      // Synchronized ScrollTrigger for headers and cards to prevent gaps
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 95%", // Early trigger
        }
      });

      tl.fromTo(".feature-header",
        { y: 50, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.8 }
      )
        .fromTo(".feature-card",
          { y: 80, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.8, stagger: 0.15, ease: "back.out(1.5)" },
          "-=0.4"
        );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} id="features" className="py-32 px-6 bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
      {/* Decorative Background Patterns to fill space attractively */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="bg-blob absolute top-[10%] left-[5%] w-[400px] h-[400px] bg-primary-light/10 dark:bg-primary-light/5 rounded-full blur-[80px]" />
        <div className="bg-blob absolute top-[60%] right-[10%] w-[500px] h-[500px] bg-amber-500/10 dark:bg-amber-500/5 rounded-full blur-[100px]" />
        <div className="bg-blob absolute bottom-[5%] left-[30%] w-[600px] h-[600px] bg-blue-500/5 dark:bg-blue-500/5 rounded-full blur-[120px]" />
        {/* Subtle dot pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMTQ4LCAxNjMsIDE4NCwgMC4xNSkiLz48L3N2Zz4=')] opacity-50 dark:opacity-20" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="feature-header text-center max-w-3xl mx-auto mb-24 space-y-6">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass border border-primary-light/20 text-xs font-bold uppercase tracking-widest text-primary-light mb-4 shadow-[0_0_20px_rgba(254,119,67,0.1)]">
            <Zap size={16} className="animate-pulse" /> Why Choose Us
          </div>
          <h3 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white leading-tight">Engineered for Reliability and Scale</h3>
          <p className="text-lg text-slate-600 dark:text-slate-400 font-light max-w-2xl mx-auto">
            We've built a platform that not only connects passengers with riders but also empowers fleet owners with unprecedented control and analytics.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuresData.map((feature) => (
            <div key={feature.id} className="feature-card glass bg-white/70 dark:bg-slate-900/40 backdrop-blur-xl border border-white/50 dark:border-white/10 rounded-[2.5rem] p-10 group hover:-translate-y-3 hover:shadow-[0_30px_60px_-15px_rgba(254,119,67,0.15)] dark:hover:shadow-[0_30px_60px_-15px_rgba(254,119,67,0.1)] transition-all duration-500 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-primary-light to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-8 transform group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500 shadow-lg bg-white dark:bg-black/50 ${feature.color} relative border border-slate-100 dark:border-white/5`}>
                <div className="absolute inset-0 bg-current opacity-10 rounded-3xl group-hover:opacity-20 transition-opacity" />
                <feature.icon size={36} strokeWidth={1.5} />
              </div>

              <h4 className="text-2xl font-black mb-4 text-slate-900 dark:text-white group-hover:text-primary-light transition-colors">{feature.titleKey}</h4>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                {feature.descKey}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const StatsSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".stat-item",
        { scale: 0.5, autoAlpha: 0 },
        {
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 75%",
          },
          scale: 1,
          autoAlpha: 1,
          duration: 1,
          stagger: 0.2,
          ease: "elastic.out(1, 0.5)"
        }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="py-24 px-6 relative overflow-hidden bg-primary-dark text-white">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1449844908441-8829872d2607?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-fixed bg-center opacity-10 mix-blend-overlay" />
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
          {[
            { value: "1.2M+", label: "Rides Completed" },
            { value: "50K+", label: "Active Riders" },
            { value: "5K+", label: "Fleet Owners" },
            { value: "99.9%", label: "Platform Uptime" }
          ].map((stat, i) => (
            <div key={i} className="stat-item space-y-2">
              <div className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50 drop-shadow-lg">
                {stat.value}
              </div>
              <div className="text-sm md:text-base font-bold uppercase tracking-widest text-primary-light">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const AppInterfacePreview: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".mockup",
        { y: 150, autoAlpha: 0 },
        {
          scrollTrigger: { trigger: containerRef.current, start: "top 70%" },
          y: 0, autoAlpha: 1, duration: 1.2, ease: "power4.out"
        }
      );
      gsap.fromTo(".mockup-feature",
        { x: 50, autoAlpha: 0 },
        {
          scrollTrigger: { trigger: containerRef.current, start: "top 60%" },
          x: 0, autoAlpha: 1, duration: 0.8, stagger: 0.2, ease: "power2.out"
        }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="py-32 px-6 max-w-7xl mx-auto overflow-hidden">
      <div className="grid lg:grid-cols-2 gap-16 items-center">
        <div className="order-2 lg:order-1 relative flex justify-center mockup">
          {/* Complex SVG Mockup representing a phone interface */}
          <div className="relative w-[300px] h-[600px] bg-slate-900 rounded-[3rem] border-[8px] border-slate-800 shadow-2xl shadow-primary-light/20 overflow-hidden flex flex-col">
            <div className="absolute top-0 w-full h-8 flex justify-center z-20 pt-2">
              <div className="w-24 h-5 bg-slate-800 rounded-b-xl" />
            </div>

            {/* Map Area */}
            <div className="flex-1 bg-slate-800 relative overflow-hidden">
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

              {/* Route line */}
              <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                <path d="M 50 150 Q 150 200 200 350 T 150 500" fill="none" stroke="#FE7743" strokeWidth="4" strokeDasharray="8 4" className="animate-[dash_20s_linear_infinite]" />
              </svg>

              {/* Markers */}
              <div className="absolute top-[130px] left-[30px] w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg"><div className="w-3 h-3 bg-white rounded-full" /></div>
              <div className="absolute top-[480px] left-[130px] w-8 h-8 bg-primary-light rounded-full flex items-center justify-center shadow-lg"><div className="w-3 h-3 bg-white rounded-full" /></div>

              {/* Moving Bike */}
              <div className="absolute top-[280px] left-[180px] text-white animate-bounce shadow-lg bg-slate-900 p-2 rounded-full border border-white/20">
                <Bike size={20} className="text-primary-light" />
              </div>
            </div>

            {/* Bottom Sheet */}
            <div className="h-[250px] bg-white dark:bg-black rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.2)] p-6 relative z-10 flex flex-col space-y-4">
              <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto" />
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-lg text-slate-900 dark:text-white">Ride to Posta</h4>
                  <p className="text-sm text-slate-500 font-medium">12 mins • 4.5 km</p>
                </div>
                <div className="text-right">
                  <h4 className="font-black text-xl text-primary-light">TSh 3,500</h4>
                  <p className="text-xs text-slate-500 font-bold uppercase">Cash</p>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-slate-50 dark:bg-white/5 p-3 rounded-2xl border border-slate-100 dark:border-white/10">
                <div className="w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Rider" alt="Rider" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm text-slate-900 dark:text-white">Juma Kapuya</p>
                  <div className="flex items-center gap-1 text-xs text-amber-500 font-bold">
                    <Star size={12} className="fill-current" /> 4.9
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-sm bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded text-slate-900 dark:text-white">MC 123 ABC</p>
                </div>
              </div>
              <button className="w-full py-3 bg-primary-light text-white font-bold rounded-xl shadow-lg mt-auto hover:scale-[1.02] transition-transform">
                Contact Rider
              </button>
            </div>
          </div>

          {/* Decorative elements around mockup */}
          <div className="absolute top-20 -left-10 glass p-4 rounded-2xl border border-white/10 shadow-2xl animate-[float_4s_ease-in-out_infinite]">
            <div className="flex gap-3 items-center">
              <Shield className="text-green-500" size={24} />
              <div>
                <p className="text-xs font-bold text-slate-400">Status</p>
                <p className="text-sm font-black text-white">Insured Trip</p>
              </div>
            </div>
          </div>
        </div>

        <div className="order-1 lg:order-2 space-y-10">
          <div className="space-y-6">
            <h2 className="text-primary-light font-black tracking-widest uppercase text-sm">Intuitive Interface</h2>
            <h3 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white leading-tight">Everything at your fingertips</h3>
            <p className="text-lg text-slate-600 dark:text-slate-400 font-light">
              Our application is designed with extreme attention to detail, ensuring a frictionless experience whether you are booking a ride in a hurry or managing a fleet of 100 motorcycles.
            </p>
          </div>

          <div className="space-y-6">
            {[
              { icon: Smartphone, title: 'Clean & Modern UI', desc: 'No clutter. Just the information you need, when you need it.' },
              { icon: MapPin, title: 'Precision Mapping', desc: 'Custom map integration for pin-point pickup and drop-off accuracy.' },
              { icon: Clock, title: 'Real-time Updates', desc: 'Watch your rider approach live on the map with sub-second latency.' }
            ].map((item, i) => (
              <div key={i} className="mockup-feature flex gap-5 group">
                <div className="w-12 h-12 rounded-2xl bg-primary-light/10 text-primary-light flex items-center justify-center flex-shrink-0 group-hover:bg-primary-light group-hover:text-white transition-colors duration-300">
                  <item.icon size={24} />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{item.title}</h4>
                  <p className="text-slate-600 dark:text-slate-400 font-light">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const TestimonialSection: React.FC = () => {
  return (
    <section className="py-32 px-6 bg-slate-900 text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary-light/10 to-transparent skew-x-12 transform origin-top-right -z-10" />
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-6">
          <h2 className="text-primary-light font-black tracking-widest uppercase text-sm">Community Feedback</h2>
          <h3 className="text-4xl md:text-5xl font-black leading-tight">Don't just take our word for it</h3>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonialsData.map((testimonial) => (
            <div key={testimonial.id} className="glass p-8 rounded-3xl border border-white/10 hover:border-primary-light/50 transition-colors duration-300 relative">
              <div className="text-primary-light/20 absolute top-6 right-6 font-serif text-6xl">"</div>
              <div className="flex items-center gap-1 text-amber-400 mb-6">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={16} className={i < testimonial.rating ? "fill-current" : "opacity-30"} />
                ))}
              </div>
              <p className="text-lg font-light leading-relaxed mb-8 relative z-10">
                {testimonial.content}
              </p>
              <div className="flex items-center gap-4 mt-auto">
                <img src={testimonial.avatarUrl} alt={testimonial.name} className="w-14 h-14 rounded-full bg-slate-800 border-2 border-white/10" />
                <div>
                  <h4 className="font-bold text-white">{testimonial.name}</h4>
                  <p className="text-sm text-primary-light uppercase tracking-wider text-[10px] font-bold">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const FAQSection: React.FC = () => {
  const [openId, setOpenId] = useState<number | null>(0);

  return (
    <section className="py-32 px-6 max-w-4xl mx-auto">
      <div className="text-center mb-16 space-y-4">
        <h2 className="text-primary-light font-black tracking-widest uppercase text-sm">Support</h2>
        <h3 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white">Frequently Asked Questions</h3>
      </div>

      <div className="space-y-4">
        {faqData.map((faq, i) => (
          <div key={i} className="glass border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden bg-white dark:bg-white/5 transition-all duration-300">
            <button
              onClick={() => setOpenId(openId === i ? null : i)}
              className="w-full px-6 py-5 flex justify-between items-center text-left focus:outline-none"
            >
              <span className="font-bold text-lg text-slate-900 dark:text-white">{faq.question}</span>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-300 ${openId === i ? 'bg-primary-light text-white rotate-180' : 'bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-white'}`}>
                <ChevronDown size={20} />
              </div>
            </button>
            <div className={`px-6 overflow-hidden transition-all duration-500 ease-in-out ${openId === i ? 'max-h-96 pb-6 opacity-100' : 'max-h-0 opacity-0'}`}>
              <p className="text-slate-600 dark:text-slate-400 font-light leading-relaxed border-t border-slate-100 dark:border-white/10 pt-4">
                {faq.answer}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 py-20 px-6 border-t border-white/10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Bike className="text-primary-light w-8 h-8" />
            <span className="text-2xl font-black tracking-tighter text-white">BodaKitaa</span>
          </div>
          <p className="font-light text-sm leading-relaxed max-w-xs">
            Transforming the informal transport sector in East Africa through technology, transparency, and trust.
          </p>
          <div className="flex gap-4">
            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary-light hover:text-white transition-colors"><Twitter size={18} /></a>
            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary-light hover:text-white transition-colors"><Facebook size={18} /></a>
            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary-light hover:text-white transition-colors"><Instagram size={18} /></a>
          </div>
        </div>

        <div>
          <h4 className="text-white font-bold mb-6">Platform</h4>
          <ul className="space-y-4 text-sm font-light">
            <li><a href="#" className="hover:text-primary-light transition-colors">Passenger App</a></li>
            <li><a href="#" className="hover:text-primary-light transition-colors">Rider Application</a></li>
            <li><a href="#" className="hover:text-primary-light transition-colors">Fleet Management</a></li>
            <li><a href="#" className="hover:text-primary-light transition-colors">Pricing & Fees</a></li>
            <li><a href="#" className="hover:text-primary-light transition-colors">Safety Features</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-6">Company</h4>
          <ul className="space-y-4 text-sm font-light">
            <li><a href="#" className="hover:text-primary-light transition-colors">About Us</a></li>
            <li><a href="#" className="hover:text-primary-light transition-colors">Careers</a></li>
            <li><a href="#" className="hover:text-primary-light transition-colors">Press & Media</a></li>
            <li><a href="#" className="hover:text-primary-light transition-colors">Partner Program</a></li>
            <li><a href="#" className="hover:text-primary-light transition-colors">Contact</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-6">Contact Us</h4>
          <ul className="space-y-4 text-sm font-light">
            <li className="flex items-center gap-3"><MapPin size={16} className="text-primary-light" /> Dar es Salaam, Tanzania</li>
            <li className="flex items-center gap-3"><PhoneCall size={16} className="text-primary-light" /> +255 123 456 789</li>
            <li className="flex items-center gap-3"><Mail size={16} className="text-primary-light" /> hello@bodakitaa.com</li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/10 text-xs">
        <p>© 2026 BodaKitaa Mobility. All rights reserved.</p>
        <div className="flex gap-6 mt-4 md:mt-0">
          <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-white transition-colors">Cookie Settings</a>
        </div>
      </div>
    </footer>
  );
};

// --- Main Page Component ---
const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-black font-sans selection:bg-primary-light/30 selection:text-primary-light">
      <Navbar />
      <HeroSection />
      <FeatureSection />
      <AppInterfacePreview />
      <StatsSection />
      <TestimonialSection />
      <FAQSection />
      <Footer />
    </div>
  );
};

export default LandingPage;
