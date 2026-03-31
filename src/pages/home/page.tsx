import { useState, lazy, Suspense, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import BookingModal from './components/BookingModal';
import RegisterModal from './components/RegisterModal';
import ScrollToTop from './components/ScrollToTop';
import SchemaOrg from './components/SchemaOrg';
import LiveCounter from './components/LiveCounter';
import PageMeta from '../../components/feature/PageMeta';

const Equipment = lazy(() => import('./components/Equipment'));
const Pricing = lazy(() => import('./components/Pricing'));
const Reviews = lazy(() => import('./components/Reviews'));
const ClubMemberSection = lazy(() => import('./components/ClubMemberSection'));
const Certificates = lazy(() => import('./components/Certificates'));
const Invitations = lazy(() => import('./components/Invitations'));
const Contacts = lazy(() => import('./components/Contacts'));
const Footer = lazy(() => import('./components/Footer'));

const SectionFallback = () => (
  <div className="h-24 flex items-center justify-center">
    <div className="w-8 h-8 rounded-full border-2 border-cyan-500/30 border-t-cyan-500 animate-spin" />
  </div>
);

const GamesTeaser = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    type Particle = { x: number; y: number; r: number; vx: number; vy: number; cyan: boolean; alpha: number; pulse: number; pulseSpeed: number };
    const particles: Particle[] = Array.from({ length: 40 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.4 + 0.4,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      cyan: Math.random() > 0.45,
      alpha: Math.random() * 0.45 + 0.2,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: Math.random() * 0.025 + 0.01,
    }));

    type ScanLine = { y: number; speed: number; alpha: number };
    const scanLines: ScanLine[] = Array.from({ length: 4 }, () => ({
      y: Math.random() * canvas.height,
      speed: Math.random() * 0.35 + 0.15,
      alpha: Math.random() * 0.12 + 0.04,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += p.pulseSpeed;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        const a = p.alpha + Math.sin(p.pulse) * 0.15;
        const cr = p.cyan ? 0 : 155;
        const cg = p.cyan ? 245 : 77;
        const cb = p.cyan ? 255 : 255;

        // Glow halo
        const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 5);
        grd.addColorStop(0, `rgba(${cr},${cg},${cb},${a * 0.35})`);
        grd.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 5, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();

        // Core dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${cr},${cg},${cb},${Math.min(a + 0.2, 0.9)})`;
        ctx.fill();
      });

      // Animated horizontal neon scan lines
      scanLines.forEach((sl) => {
        sl.y += sl.speed;
        if (sl.y > canvas.height + 2) sl.y = -2;

        const grad = ctx.createLinearGradient(0, sl.y, canvas.width, sl.y);
        grad.addColorStop(0, 'rgba(0,245,255,0)');
        grad.addColorStop(0.3, `rgba(0,245,255,${sl.alpha})`);
        grad.addColorStop(0.7, `rgba(0,245,255,${sl.alpha})`);
        grad.addColorStop(1, 'rgba(0,245,255,0)');
        ctx.beginPath();
        ctx.moveTo(0, sl.y);
        ctx.lineTo(canvas.width, sl.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      });

      // Subtle crossing diagonal neon lines
      ctx.save();
      ctx.globalAlpha = 0.04;
      ctx.strokeStyle = '#00f5ff';
      ctx.lineWidth = 0.5;
      for (let i = -canvas.height; i < canvas.width + canvas.height; i += 60) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i + canvas.height, canvas.height);
        ctx.stroke();
      }
      ctx.restore();

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <section id="games" className="relative py-10 md:py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div
          className="relative rounded-xl overflow-hidden"
          style={{ border: '1px solid rgba(0,245,255,0.2)', background: 'rgba(1,0,20,0.95)' }}
        >
          {/* Animated canvas particles layer */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ zIndex: 1 }}
          />

          {/* Image */}
<div
  className="w-full h-52 sm:h-64 md:h-72 relative overflow-hidden"
  style={{ background: 'linear-gradient(135deg, #010014 0%, #0a0025 30%, #060018 60%, #010014 100%)' }}
>
  <div className="absolute inset-0" style={{
    backgroundImage: 'radial-gradient(ellipse at 20% 50%, rgba(0,245,255,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 30%, rgba(139,92,246,0.07) 0%, transparent 60%)',
  }} />
  <img
    src="/images/games/banner.jpg"
    alt="Библиотека игр VR Club Paradox"
    className="absolute inset-0 w-full h-full object-cover object-center"
    loading="lazy"
    onError={(e) => { e.currentTarget.style.opacity = '0'; }}
  />
  <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(1,0,20,0.1) 0%, rgba(1,0,20,0.55) 55%, rgba(1,0,20,1) 100%)' }} />
</div>

          {/* Content below image — mobile */}
          <div className="relative px-5 pt-4 pb-7 text-center flex flex-col items-center md:hidden" style={{ zIndex: 2 }}>
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="h-px w-8" style={{ background: 'linear-gradient(90deg, transparent, rgba(0,245,255,0.6))' }} />
              <span className="font-mono-tech text-xs tracking-widest" style={{ color: '#00f5ff' }}>ИГРОВАЯ БИБЛИОТЕКА</span>
              <span className="h-px w-8" style={{ background: 'linear-gradient(90deg, rgba(0,245,255,0.6), transparent)' }} />
            </div>
            <h2 className="font-orbitron font-black text-white text-xl mb-1 tracking-wider">
              40+ VR · 11 PS5 · 4 Sim
            </h2>
            <p className="font-rajdhani text-white/55 text-sm mb-4">
              Постоянно пополняющаяся библиотека — от экшенов до гоночных симуляторов
            </p>
            <Link
              to="/games"
              className="inline-flex items-center gap-2 font-orbitron text-xs font-bold px-6 py-3 rounded-sm transition-all active:scale-95 cursor-pointer whitespace-nowrap"
              style={{ background: 'rgba(0,245,255,0.1)', border: '1px solid rgba(0,245,255,0.5)', color: '#00f5ff', letterSpacing: '2px' }}
            >
              <i className="ri-gamepad-line" />
              Смотреть все игры
              <i className="ri-arrow-right-line" />
            </Link>
          </div>

          {/* Overlay content — desktop */}
          <div className="absolute inset-0 flex-col items-center justify-end pb-8 px-6 text-center hidden md:flex" style={{ zIndex: 2 }}>
            <div className="flex items-center justify-center gap-3 mb-3">
              <span className="h-px w-10" style={{ background: 'linear-gradient(90deg, transparent, rgba(0,245,255,0.6))' }} />
              <span className="font-mono-tech text-xs tracking-widest" style={{ color: '#00f5ff' }}>ИГРОВАЯ БИБЛИОТЕКА</span>
              <span className="h-px w-10" style={{ background: 'linear-gradient(90deg, rgba(0,245,255,0.6), transparent)' }} />
            </div>
            <h2 className="font-orbitron font-black text-white text-3xl mb-2 tracking-wider">
              40+ VR · 11 PS5 · 4 Sim
            </h2>
            <p className="font-rajdhani text-white/55 text-base mb-5">
              Постоянно пополняющаяся библиотека — от экшенов до гоночных симуляторов
            </p>
            <Link
              to="/games"
              className="inline-flex items-center gap-2 font-orbitron text-xs font-bold px-8 py-3 rounded-sm transition-all hover:scale-105 cursor-pointer whitespace-nowrap"
              style={{ background: 'rgba(0,245,255,0.1)', border: '1px solid rgba(0,245,255,0.5)', color: '#00f5ff', letterSpacing: '2px', boxShadow: '0 0 20px rgba(0,245,255,0.15)' }}
            >
              <i className="ri-gamepad-line" />
              Смотреть все игры
              <i className="ri-arrow-right-line" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

const Home = () => {
  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<string | undefined>(undefined);
  const [registerOpen, setRegisterOpen] = useState(false);

  const handleBooking = (service?: string) => {
    setSelectedService(service);
    setBookingOpen(true);
  };

  const handleCloseBooking = () => {
    setBookingOpen(false);
    setSelectedService(undefined);
  };

  return (
    <div style={{ background: '#010014', minHeight: '100vh', position: 'relative' }}>
      <PageMeta
        title="PARADOX VR CLUB Новосибирск — VR-клуб | Oculus Quest 2, MOZA Racing, PS5"
        description="Лучший VR-клуб в Новосибирске с 2022 года. Oculus Quest 2 (40+ игр), PlayStation 5, MOZA Racing симулятор (45+ трасс). VR от 800 ₽/час. Аренда до 12 человек. День рождения −20%. Клубная карта. Ежедневно 12:00–22:00."
        canonical="https://paradoxvr.ru/"
        keywords="VR клуб Новосибирск, виртуальная реальность Новосибирск, Oculus Quest 2 Новосибирск, MOZA Racing симулятор, аренда VR клуба Новосибирск, день рождения VR"
      />
      <SchemaOrg />
      <div className="grid-overlay" />
      <div className="scanlines" />

      <div className="relative z-10">
        <Navbar onBooking={() => handleBooking()} onRegister={() => setRegisterOpen(true)} />
        <Hero onBooking={() => handleBooking()} />
        <Suspense fallback={<SectionFallback />}>
          <Equipment />
        </Suspense>
        <GamesTeaser />
        <Suspense fallback={<SectionFallback />}>
          <Pricing onBooking={handleBooking} />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <Reviews />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <ClubMemberSection onRegister={() => setRegisterOpen(true)} onBooking={() => handleBooking()} />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <Certificates />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <Invitations />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <Contacts />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <Footer onBooking={() => handleBooking()} />
        </Suspense>
      </div>

      <BookingModal
        isOpen={bookingOpen}
        onClose={handleCloseBooking}
        selectedService={selectedService}
      />
      <RegisterModal isOpen={registerOpen} onClose={() => setRegisterOpen(false)} />
      <LiveCounter />
      <ScrollToTop />
    </div>
  );
};

export default Home;
