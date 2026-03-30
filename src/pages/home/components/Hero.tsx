import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

interface HeroProps {
  onBooking: () => void;
}

const STATS = [
  { icon: 'ri-vr-glasses-line', value: '40+', label: 'VR игр', color: '#00f5ff' },
  { icon: 'ri-road-map-line', value: '45+', label: 'Трасс MOZA', color: '#ff006e' },
  { icon: 'ri-group-line', value: '12', label: 'Мест', color: '#9b4dff' },
  { icon: 'ri-time-line', value: '7/7', label: '12:00–22:00', color: '#00f5ff' },
  { icon: 'ri-parking-line', value: '✓', label: 'Парковка', color: '#ff006e' },
  { icon: 'ri-restaurant-2-line', value: '✓', label: 'Своя еда', color: '#9b4dff' },
];

const FEATURES = [
  'Беспроводные шлемы Oculus Quest 2',
  'PlayStation 5 · 4 геймпада',
  'Профессиональный MOZA Racing Sim',
  '70м² · до 12 человек',
];

const Hero = ({ onBooking }: HeroProps) => {
  const [featureIdx, setFeatureIdx] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const target = FEATURES[featureIdx];
    const speed = isDeleting ? 38 : 65;
    timerRef.current = setTimeout(() => {
      if (!isDeleting) {
        setDisplayText(target.slice(0, displayText.length + 1));
        if (displayText.length + 1 === target.length) {
          timerRef.current = setTimeout(() => setIsDeleting(true), 2200);
        }
      } else {
        setDisplayText(target.slice(0, displayText.length - 1));
        if (displayText.length === 0) {
          setIsDeleting(false);
          setFeatureIdx(i => (i + 1) % FEATURES.length);
        }
      }
    }, speed);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [displayText, isDeleting, featureIdx]);

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <section id="home" className="relative min-h-screen flex flex-col justify-center overflow-hidden">

      {/* ── Background: people in VR glasses blurred bokeh ── */}
      <div className="absolute inset-0" style={{ zIndex: 0 }}>
        <img
          src="https://readdy.ai/api/search-image?query=group%20of%20happy%20young%20people%20wearing%20VR%20headsets%20Oculus%20Quest%20in%20dark%20gaming%20room%20laughing%20excited%20arms%20raised%20immersive%20experience%20blurred%20bokeh%20depth%20of%20field%20cinematic%20shallow%20focus%20neon%20cyan%20pink%20lighting%20vibrant%20atmosphere%20friends%20having%20fun%20virtual%20reality%20club&width=1920&height=1080&seq=hero_vr_people_blur_v1&orientation=landscape"
          alt=""
          className="w-full h-full object-cover object-center"
          aria-hidden="true"
          style={{ filter: 'blur(2px)', transform: 'scale(1.05)' }}
        />
        {/* Multi-layer dark overlay for text contrast */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg, rgba(1,0,20,0.82) 0%, rgba(1,0,20,0.55) 40%, rgba(1,0,20,0.78) 100%)' }} />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 45%, rgba(0,245,255,0.06) 0%, transparent 60%)' }} />
        {/* Bottom and top fades */}
        <div className="absolute bottom-0 left-0 right-0 h-64" style={{ background: 'linear-gradient(to top, #010014 0%, rgba(1,0,20,0.6) 60%, transparent 100%)' }} />
        <div className="absolute top-0 left-0 right-0 h-36" style={{ background: 'linear-gradient(to bottom, rgba(1,0,20,0.7) 0%, transparent 100%)' }} />
      </div>

      {/* ── Neon border lines ── */}
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #00f5ff 20%, #9b4dff 50%, #ff006e 80%, transparent)', opacity: 0.9, zIndex: 4 }} />
      <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #ff006e 20%, #9b4dff 50%, #00f5ff 80%, transparent)', opacity: 0.6, zIndex: 4 }} />

      {/* ── Main Content ── */}
      <div className="relative w-full max-w-6xl mx-auto px-4 pt-24 md:pt-28 pb-16 flex flex-col items-center text-center" style={{ zIndex: 5 }}>

        {/* Status badge */}
        <div className="flex items-center gap-3 mb-8 md:mb-10">
          <div className="h-px w-10 md:w-14 hidden sm:block" style={{ background: 'linear-gradient(90deg, transparent, rgba(0,245,255,0.7))' }} />
          <div
            className="flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 font-mono-tech text-xs tracking-widest"
            style={{ border: '1px solid rgba(0,245,255,0.4)', color: '#00f5ff', background: 'rgba(0,245,255,0.06)', borderRadius: '2px', backdropFilter: 'blur(8px)' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="hidden sm:inline">SYS::ONLINE &nbsp;·&nbsp; </span>НОВОСИБИРСК &nbsp;·&nbsp; С 2022
          </div>
          <div className="h-px w-10 md:w-14 hidden sm:block" style={{ background: 'linear-gradient(90deg, rgba(255,0,110,0.7), transparent)' }} />
        </div>

        {/* ── PARADOX VR CLUB — no frame, pure neon text ── */}
        <div className="relative mb-6 md:mb-8 select-none">
          {/* Decorative accent lines */}
          <div className="flex items-center justify-center gap-4 mb-3">
            <div className="h-px" style={{ width: 'clamp(30px, 8vw, 80px)', background: 'linear-gradient(90deg, transparent, rgba(0,245,255,0.7))' }} />
            <div className="w-1.5 h-1.5 rotate-45" style={{ background: '#00f5ff', boxShadow: '0 0 8px #00f5ff' }} />
            <div className="h-px" style={{ width: 'clamp(30px, 8vw, 80px)', background: 'linear-gradient(90deg, rgba(0,245,255,0.7), transparent)' }} />
          </div>

          <h1 className="leading-none">
            <span
              className="block font-orbitron font-black"
              style={{
                fontSize: 'clamp(3.5rem, 13vw, 10rem)',
                letterSpacing: '0.1em',
                color: '#ffffff',
                textShadow: [
                  '0 0 7px #fff',
                  '0 0 14px #fff',
                  '0 0 30px #fff',
                  '0 0 60px #00f5ff',
                  '0 0 110px #00f5ff',
                  '0 0 140px rgba(0,245,255,0.5)',
                ].join(', '),
                animation: 'neonFlicker 3s infinite alternate',
              }}
            >
              PARADOX
            </span>
            <div className="flex items-center justify-center gap-3 md:gap-5 my-1">
              <div className="h-px flex-1 max-w-xs" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,0,110,0.8))' }} />
              <div className="font-mono-tech text-xs tracking-widest" style={{ color: 'rgba(255,0,110,0.7)', fontSize: 'clamp(8px, 1.5vw, 12px)' }}>
                VIRTUAL REALITY
              </div>
              <div className="h-px flex-1 max-w-xs" style={{ background: 'linear-gradient(90deg, rgba(255,0,110,0.8), transparent)' }} />
            </div>
            <span
              className="block font-orbitron font-black"
              style={{
                fontSize: 'clamp(1.8rem, 5.5vw, 4.5rem)',
                letterSpacing: '0.35em',
                color: '#ff006e',
                textShadow: [
                  '0 0 7px #fff',
                  '0 0 14px #ff006e',
                  '0 0 30px #ff006e',
                  '0 0 60px #ff006e',
                  '0 0 100px rgba(255,0,110,0.6)',
                ].join(', '),
                animation: 'neonFlicker2 4s infinite alternate',
              }}
            >
              CLUB
            </span>
          </h1>

          {/* Bottom accent */}
          <div className="flex items-center justify-center gap-4 mt-3">
            <div className="h-px" style={{ width: 'clamp(30px, 8vw, 80px)', background: 'linear-gradient(90deg, transparent, rgba(255,0,110,0.6))' }} />
            <div className="w-1.5 h-1.5 rotate-45" style={{ background: '#ff006e', boxShadow: '0 0 8px #ff006e' }} />
            <div className="h-px" style={{ width: 'clamp(30px, 8vw, 80px)', background: 'linear-gradient(90deg, rgba(255,0,110,0.6), transparent)' }} />
          </div>
        </div>

        {/* Subtitle divider */}
        <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-5 w-full max-w-sm md:max-w-xl">
          <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(0,245,255,0.6))' }} />
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full" style={{ background: '#ff006e', boxShadow: '0 0 6px #ff006e' }} />
            <span className="font-mono-tech text-xs tracking-widest" style={{ color: 'rgba(0,245,255,0.7)', fontSize: 'clamp(9px, 2vw, 12px)' }}>VR · PS5 · RACING</span>
            <div className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full" style={{ background: '#00f5ff', boxShadow: '0 0 6px #00f5ff' }} />
          </div>
          <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, rgba(0,245,255,0.6), transparent)' }} />
        </div>

        {/* Typewriter */}
        <div
          className="font-mono-tech text-sm md:text-base mb-8 md:mb-10 h-7 flex items-center justify-center gap-2"
          style={{ color: 'rgba(255,255,255,0.75)' }}
        >
          <span style={{ color: '#ff006e', textShadow: '0 0 10px #ff006e' }}>&gt;_</span>
          <span>{displayText}</span>
          <span className="inline-block w-0.5 h-5 bg-current hero-cursor" />
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 md:gap-4 justify-center mb-12 md:mb-16 w-full px-4 sm:px-0">
          <button
            onClick={onBooking}
            className="btn-cyber-pink px-8 md:px-12 py-3.5 md:py-4 rounded-sm text-sm font-orbitron relative overflow-hidden whitespace-nowrap"
            style={{ letterSpacing: '2px', boxShadow: '0 0 25px rgba(255,0,110,0.3), 0 0 50px rgba(255,0,110,0.1)' }}
          >
            <span className="relative z-10 flex items-center gap-2 justify-center">
              <i className="ri-calendar-check-line" />
              Записаться
            </span>
          </button>
          <Link
            to="/loyalty"
            className="font-orbitron text-sm px-8 md:px-10 py-3.5 md:py-4 rounded-sm whitespace-nowrap transition-all duration-300 cursor-pointer inline-flex items-center justify-center gap-2"
            style={{ border: '1px solid rgba(0,245,255,0.55)', color: '#00f5ff', letterSpacing: '2px', background: 'rgba(0,245,255,0.07)', backdropFilter: 'blur(4px)', boxShadow: '0 0 20px rgba(0,245,255,0.1)' }}
          >
            <i className="ri-vip-crown-2-line" />
            Карта клуба
          </Link>
          <button
            onClick={() => scrollTo('pricing')}
            className="btn-cyber-cyan px-8 md:px-10 py-3.5 md:py-4 rounded-sm text-sm font-orbitron whitespace-nowrap"
            style={{ letterSpacing: '2px' }}
          >
            <span className="flex items-center gap-2 justify-center">
              <i className="ri-price-tag-3-line" />
              Тарифы
            </span>
          </button>
          <Link
            to="/games"
            className="font-orbitron text-sm px-8 md:px-10 py-3.5 md:py-4 rounded-sm whitespace-nowrap transition-all duration-300 cursor-pointer inline-flex items-center justify-center gap-2"
            style={{ border: '1px solid rgba(155,77,255,0.55)', color: '#9b4dff', letterSpacing: '2px', background: 'rgba(155,77,255,0.06)', backdropFilter: 'blur(4px)' }}
          >
            <i className="ri-gamepad-line" />
            Игры
          </Link>
        </div>

        {/* Stats bar */}
        <div className="w-full max-w-4xl">
          <div className="w-full h-px mb-0" style={{ background: 'linear-gradient(90deg, transparent, rgba(0,245,255,0.5), rgba(155,77,255,0.5), rgba(255,0,110,0.5), transparent)' }} />
          <div
            className="grid grid-cols-3 lg:grid-cols-6 divide-x divide-y lg:divide-y-0"
            style={{
              borderBottom: '1px solid rgba(0,245,255,0.15)',
              borderLeft: '1px solid rgba(0,245,255,0.15)',
              borderRight: '1px solid rgba(0,245,255,0.15)',
              background: 'rgba(1,0,20,0.85)',
              backdropFilter: 'blur(20px)',
            }}
          >
            {STATS.map(s => (
              <div
                key={s.label}
                className="flex flex-col items-center justify-center py-3 md:py-4 px-2 md:px-3 gap-1 transition-all duration-300 hover:bg-white/5"
                style={{ borderColor: 'rgba(0,245,255,0.1)' }}
              >
                <div className="w-5 md:w-6 h-5 md:h-6 flex items-center justify-center">
                  <i className={`${s.icon} text-base md:text-lg`} style={{ color: s.color }} />
                </div>
                <div className="font-orbitron font-black text-lg md:text-xl leading-none" style={{ color: s.color, textShadow: `0 0 12px ${s.color}80` }}>
                  {s.value}
                </div>
                <div className="font-rajdhani text-xs text-white/50 text-center" style={{ fontSize: 'clamp(9px, 2vw, 12px)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="mt-8 md:mt-10 flex flex-col items-center gap-2">
          <span className="font-mono-tech text-xs tracking-widest hidden md:block" style={{ color: 'rgba(255,255,255,0.25)' }}>ПРОКРУТИ ВНИЗ</span>
          <div className="w-5 h-8 rounded-full flex items-start justify-center pt-1" style={{ border: '1px solid rgba(0,245,255,0.35)', boxShadow: '0 0 8px rgba(0,245,255,0.15)' }}>
            <div className="w-1 h-2 rounded-full" style={{ background: '#00f5ff', animation: 'scrollDot 1.8s ease-in-out infinite' }} />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes neonFlicker {
          0%, 19%, 21%, 23%, 25%, 54%, 56%, 100% {
            text-shadow:
              0 0 7px #fff,
              0 0 14px #fff,
              0 0 30px #fff,
              0 0 60px #00f5ff,
              0 0 110px #00f5ff,
              0 0 140px rgba(0,245,255,0.5);
            opacity: 1;
          }
          20%, 24%, 55% {
            text-shadow: none;
            opacity: 0.92;
          }
        }
        @keyframes neonFlicker2 {
          0%, 18%, 20%, 52%, 54%, 100% {
            text-shadow:
              0 0 7px #fff,
              0 0 14px #ff006e,
              0 0 30px #ff006e,
              0 0 60px #ff006e,
              0 0 100px rgba(255,0,110,0.6);
            opacity: 1;
          }
          19%, 53% {
            text-shadow: 0 0 4px rgba(255,0,110,0.3);
            opacity: 0.88;
          }
        }
        @keyframes scrollDot {
          0% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(10px); opacity: 0; }
        }
      `}</style>
    </section>
  );
};

export default Hero;
