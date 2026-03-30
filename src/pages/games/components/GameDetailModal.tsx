import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Game } from '../../../mocks/games';

const filterColors: Record<string, string> = {
  VR: '#00f5ff',
  PS5: '#9b4dff',
  MOZA: '#ff006e',
};

const categoryMeta: Record<string, { device: string; icon: string; tags: string[] }> = {
  VR: {
    device: 'Oculus Quest 2',
    icon: 'ri-vr-glasses-line',
    tags: ['Виртуальная реальность', 'Полное погружение', 'Физическая активность'],
  },
  PS5: {
    device: 'PlayStation 5 · DualSense',
    icon: 'ri-gamepad-line',
    tags: ['Консоль', '4K HDR', 'Контроллер DualSense'],
  },
  MOZA: {
    device: 'MOZA R5 · Руль + педали',
    icon: 'ri-steering-2-line',
    tags: ['Racing Simulator', 'Руль MOZA', 'Педали + сиденье'],
  },
};

interface Props {
  game: Game;
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
}

const GameDetailModal = ({ game, onClose, onNext, onPrev }: Props) => {
  const navigate = useNavigate();
  const color = filterColors[game.category] ?? '#00f5ff';
  const meta = categoryMeta[game.category];

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && onNext) onNext();
      if (e.key === 'ArrowLeft' && onPrev) onPrev();
    },
    [onClose, onNext, onPrev],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [handleKeyDown]);

  const handleBooking = () => {
    onClose();
    navigate('/', { state: { openBooking: true } });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(1,0,14,0.92)', backdropFilter: 'blur(12px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="relative w-full max-w-2xl rounded-xl overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, #06001e 0%, #0a0028 100%)',
          border: `1px solid ${color}40`,
          boxShadow: `0 0 60px ${color}18, 0 0 120px rgba(0,0,0,0.6)`,
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        {/* Top accent line */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
        />

        {/* Hero image */}
        <div className="relative w-full overflow-hidden" style={{ height: '260px' }}>
          {/* Fallback bg */}
          <div
            className="absolute inset-0"
            style={{ background: `radial-gradient(ellipse at 50% 40%, ${color}20 0%, rgba(1,0,20,0.95) 70%)` }}
          />
          <img
            src={game.image}
            alt={game.name}
            className="absolute inset-0 w-full h-full object-cover object-top"
            style={{ opacity: 0.9 }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          {/* Gradient overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to bottom, rgba(1,0,20,0.1) 0%, rgba(1,0,20,0.4) 60%, rgba(6,0,30,1) 100%)',
            }}
          />

          {/* Category badge */}
          <div
            className="absolute top-4 left-4 font-mono-tech px-3 py-1.5 rounded-sm"
            style={{
              background: `${color}18`,
              border: `1px solid ${color}60`,
              color,
              backdropFilter: 'blur(8px)',
              fontSize: '10px',
              letterSpacing: '2px',
            }}
          >
            <i className={`${meta?.icon} mr-1.5`} />
            {game.category}
          </div>

          {/* Emoji badge */}
          <div
            className="absolute top-4 right-14 text-2xl"
            style={{ filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.3))' }}
          >
            {game.emoji}
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full cursor-pointer transition-all hover:scale-110"
            style={{ background: 'rgba(1,0,20,0.7)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)' }}
          >
            <i className="ri-close-line text-sm" />
          </button>

          {/* Nav arrows */}
          {onPrev && (
            <button
              onClick={onPrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full cursor-pointer transition-all hover:scale-110"
              style={{ background: 'rgba(1,0,20,0.7)', border: `1px solid ${color}40`, color }}
            >
              <i className="ri-arrow-left-s-line text-lg" />
            </button>
          )}
          {onNext && (
            <button
              onClick={onNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full cursor-pointer transition-all hover:scale-110"
              style={{ background: 'rgba(1,0,20,0.7)', border: `1px solid ${color}40`, color }}
            >
              <i className="ri-arrow-right-s-line text-lg" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="px-6 pt-4 pb-8">
          {/* Title */}
          <h2
            className="font-orbitron font-black text-white mb-1 leading-tight"
            style={{ fontSize: 'clamp(1.25rem, 3vw, 1.8rem)', textShadow: `0 0 30px ${color}30` }}
          >
            {game.name}
          </h2>

          {/* Description */}
          <p className="font-rajdhani text-white/70 text-base leading-relaxed mb-5" style={{ fontSize: '15px' }}>
            {game.desc}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-5">
            {meta?.tags.map((tag) => (
              <span
                key={tag}
                className="font-mono-tech px-3 py-1 rounded-sm"
                style={{
                  background: `${color}08`,
                  border: `1px solid ${color}25`,
                  color: `${color}cc`,
                  fontSize: '10px',
                  letterSpacing: '0.5px',
                }}
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Device info */}
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-lg mb-5"
            style={{ background: `${color}06`, border: `1px solid ${color}18` }}
          >
            <div
              className="w-10 h-10 flex items-center justify-center rounded-md flex-shrink-0"
              style={{ background: `${color}12`, border: `1px solid ${color}30` }}
            >
              <i className={`${meta?.icon} text-xl`} style={{ color }} />
            </div>
            <div>
              <div className="font-orbitron font-bold text-white text-xs mb-0.5">{game.category} — Платформа</div>
              <div className="font-rajdhani text-white/50 text-sm">{meta?.device}</div>
            </div>
            <div className="ml-auto">
              <span
                className="font-mono-tech text-xs px-2 py-1 rounded-sm"
                style={{ background: `${color}15`, color, border: `1px solid ${color}40` }}
              >
                ДОСТУПНО
              </span>
            </div>
          </div>

          {/* CTA */}
          <div className="flex gap-3">
            <button
              onClick={handleBooking}
              className="flex-1 py-3 rounded-sm font-orbitron font-bold text-xs cursor-pointer transition-all hover:scale-[1.02] whitespace-nowrap"
              style={{
                background: `${color}12`,
                border: `1px solid ${color}50`,
                color,
                boxShadow: `0 0 20px ${color}15`,
              }}
            >
              <i className="ri-calendar-check-line mr-2" />
              Записаться играть
            </button>
            <button
              onClick={onClose}
              className="px-5 py-3 rounded-sm font-orbitron font-bold text-xs cursor-pointer transition-colors whitespace-nowrap"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)' }}
            >
              Закрыть
            </button>
          </div>

          {/* Keyboard hint */}
          <p className="text-center font-mono-tech text-white/20 mt-4" style={{ fontSize: '10px' }}>
            ← → навигация · ESC закрыть
          </p>
        </div>

        {/* Bottom accent line */}
        <div
          className="absolute bottom-0 left-0 right-0 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${color}60, transparent)` }}
        />
      </div>
    </div>
  );
};

export default GameDetailModal;
