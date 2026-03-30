import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface NavbarProps {
  onBooking: () => void;
  onRegister?: () => void;
}

const navLinks = [
  { href: '#equipment', label: 'Оборудование' },
  { href: '#pricing', label: 'Цены' },
  { href: '#reviews', label: 'Отзывы' },
  { href: '#certificates', label: 'Сертификаты' },
  { href: '#contacts', label: 'Контакты' },
];

const Navbar = ({ onBooking, onRegister }: NavbarProps) => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const handleLink = (href: string) => {
    setMenuOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      style={{
        background: scrolled ? 'rgba(1,0,20,0.95)' : 'transparent',
        borderBottom: scrolled ? '1px solid rgba(0,245,255,0.15)' : 'none',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between h-16 md:h-20">
        {/* Logo */}
        <a href="#" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-3 cursor-pointer">
          <img
            src="https://public.readdy.ai/ai/img_res/555b681d-a7af-4440-8e70-a9ecb63c7b48.png"
            alt="PARADOX VR CLUB"
            className="h-10 md:h-12 w-auto"
          />
          <div className="hidden sm:block">
            <div className="font-orbitron text-sm font-bold tracking-widest" style={{ color: '#00f5ff' }}>PARADOX</div>
            <div className="font-orbitron text-xs font-bold tracking-widest text-white/70">VR CLUB</div>
          </div>
        </a>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-3">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => handleLink(link.href)}
              className="font-orbitron text-xs font-medium text-white/70 hover:text-cyan-400 transition-colors uppercase whitespace-nowrap cursor-pointer"
              style={{ letterSpacing: '0.5px', fontSize: '11px' }}
            >
              {link.label}
            </button>
          ))}
          <button
            onClick={() => navigate('/games')}
            className="font-orbitron text-xs font-medium text-white/70 hover:text-purple-400 transition-colors uppercase whitespace-nowrap cursor-pointer"
            style={{ letterSpacing: '0.5px', fontSize: '11px' }}
          >
            Игры
          </button>
          <button
            onClick={() => navigate('/prices')}
            className="font-orbitron text-xs font-medium text-white/70 hover:text-cyan-400 transition-colors uppercase whitespace-nowrap cursor-pointer"
            style={{ letterSpacing: '0.5px', fontSize: '11px' }}
          >
            Цены
          </button>
          <button
            onClick={() => navigate('/forum')}
            className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-sm font-orbitron text-xs font-bold uppercase whitespace-nowrap cursor-pointer transition-all duration-300 group overflow-hidden"
            style={{
              letterSpacing: '0.5px',
              fontSize: '11px',
              border: '1px solid rgba(0,245,255,0.5)',
              background: 'rgba(0,245,255,0.08)',
              color: '#00f5ff',
              boxShadow: '0 0 10px rgba(0,245,255,0.15)',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,245,255,0.18)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 18px rgba(0,245,255,0.35)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,245,255,0.08)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 10px rgba(0,245,255,0.15)';
            }}
          >
            <i className="ri-discuss-line text-xs" />
            Форум
          </button>
          <div className="w-px h-4 mx-1" style={{ background: 'rgba(0,245,255,0.2)' }} />
          <button
            onClick={() => navigate('/loyalty')}
            title="Личный кабинет / Регистрация"
            className="w-9 h-9 flex items-center justify-center rounded-sm transition-all cursor-pointer group relative"
            style={{ border: '1px solid rgba(0,245,255,0.25)', background: 'rgba(0,245,255,0.04)' }}
          >
            <i className="ri-user-line text-sm group-hover:text-cyan-300 transition-colors" style={{ color: 'rgba(0,245,255,0.7)' }} />
            <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 bg-black/80 text-cyan-300 text-xs px-2 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none font-rajdhani" style={{ fontSize: '10px' }}>
              Личный кабинет
            </span>
          </button>
          <button
            onClick={onBooking}
            className="btn-cyber-pink px-4 py-2 text-xs rounded-sm whitespace-nowrap"
          >
            Записаться
          </button>
        </div>

        {/* Mobile toggle */}
        <button
          className="lg:hidden text-white p-2 cursor-pointer"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Меню"
        >
          <i className={`ri-${menuOpen ? 'close' : 'menu'}-line text-2xl`} style={{ color: '#00f5ff' }} />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="lg:hidden absolute top-full left-0 right-0 py-4 px-6 flex flex-col gap-4"
          style={{ background: 'rgba(1,0,20,0.98)', borderBottom: '1px solid rgba(0,245,255,0.2)' }}
        >
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => handleLink(link.href)}
              className="font-orbitron text-xs font-medium tracking-wider text-white/70 hover:text-cyan-400 transition-colors uppercase text-left cursor-pointer py-1"
            >
              {link.label}
            </button>
          ))}
          <button
            onClick={() => { setMenuOpen(false); navigate('/games'); }}
            className="font-orbitron text-xs font-medium tracking-wider text-white/70 hover:text-purple-400 transition-colors uppercase text-left cursor-pointer py-1"
          >
            Игры
          </button>
          <button
            onClick={() => { setMenuOpen(false); navigate('/prices'); }}
            className="font-orbitron text-xs font-medium tracking-wider text-white/70 hover:text-cyan-400 transition-colors uppercase text-left cursor-pointer py-1"
          >
            Цены
          </button>
          <button
            onClick={() => { setMenuOpen(false); navigate('/forum'); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-sm font-orbitron text-xs font-bold uppercase whitespace-nowrap cursor-pointer self-start"
            style={{
              border: '1px solid rgba(0,245,255,0.5)',
              background: 'rgba(0,245,255,0.08)',
              color: '#00f5ff',
              boxShadow: '0 0 12px rgba(0,245,255,0.2)',
              letterSpacing: '0.5px',
            }}
          >
            <i className="ri-discuss-line text-sm" />
            Форум
          </button>
          <div className="h-px w-full my-1" style={{ background: 'rgba(0,245,255,0.1)' }} />
          <div className="flex gap-2">
            <button
              onClick={() => { setMenuOpen(false); navigate('/loyalty'); }}
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs rounded-sm font-orbitron whitespace-nowrap cursor-pointer"
              style={{ border: '1px solid rgba(0,245,255,0.35)', background: 'rgba(0,245,255,0.06)', color: '#00f5ff' }}
            >
              <i className="ri-user-line text-sm" />
              Войти
            </button>
            <button
              onClick={() => { setMenuOpen(false); navigate('/loyalty'); }}
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs rounded-sm font-orbitron whitespace-nowrap cursor-pointer"
              style={{ border: '1px solid rgba(155,77,255,0.35)', background: 'rgba(155,77,255,0.06)', color: '#c084fc' }}
            >
              <i className="ri-vip-crown-line text-sm" />
              Регистрация
            </button>
          </div>
          <button
            onClick={() => { setMenuOpen(false); onBooking(); }}
            className="btn-cyber-pink px-5 py-2.5 text-xs rounded-sm self-start whitespace-nowrap"
          >
            Записаться
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
