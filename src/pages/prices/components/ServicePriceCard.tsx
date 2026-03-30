import { useState } from 'react';

export interface PriceRow {
  label: string;
  price: number;
  note?: string;
}

interface ServicePriceCardProps {
  icon: string;
  title: string;
  subtitle: string;
  color: string;
  rows: PriceRow[];
  badge?: string;
  bonus?: string;
  image: string;
  birthdayMode: boolean;
  onBook?: () => void;
}

const ServicePriceCard = ({
  icon,
  title,
  subtitle,
  color,
  rows,
  badge,
  bonus,
  image,
  birthdayMode,
  onBook,
}: ServicePriceCardProps) => {
  const [imgError, setImgError] = useState(false);

  return (
    <article
      className="relative rounded-lg overflow-hidden flex flex-col"
      style={{ background: 'rgba(1,0,20,0.85)', border: `1px solid ${color}25` }}
    >
      {/* Image header */}
      <div className="relative h-40 overflow-hidden flex-shrink-0">
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ background: `radial-gradient(ellipse at center, ${color}22 0%, rgba(1,0,20,0.95) 70%)` }}
        >
          <i className={`${icon} text-6xl`} style={{ color: `${color}35` }} />
        </div>
        {!imgError && (
          <img
            src={image}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover object-top"
            onError={() => setImgError(true)}
          />
        )}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(1,0,20,1) 0%, rgba(1,0,20,0.35) 60%, transparent 100%)' }}
        />
        {badge && (
          <div
            className="absolute top-3 right-3 font-orbitron text-xs px-2.5 py-1 rounded-sm font-bold z-10"
            style={{ background: color, color: '#010014' }}
          >
            {badge}
          </div>
        )}
        <div
          className="absolute bottom-3 left-4 flex items-center gap-2"
        >
          <div className="w-8 h-8 flex items-center justify-center rounded-sm" style={{ background: 'rgba(1,0,20,0.85)', border: `1px solid ${color}50` }}>
            <i className={`${icon} text-sm`} style={{ color }} />
          </div>
          <div>
            <h3 className="font-orbitron font-bold text-white leading-none" style={{ fontSize: '13px' }}>{title}</h3>
            <p className="font-mono-tech" style={{ color, fontSize: '9px', letterSpacing: '1px' }}>{subtitle}</p>
          </div>
        </div>
      </div>

      {/* Bonus badge */}
      {bonus && (
        <div
          className="mx-4 mt-4 flex items-center gap-2 px-3 py-2 rounded-md"
          style={{ background: 'linear-gradient(135deg, rgba(0,245,255,0.08), rgba(0,245,255,0.04))', border: '1px solid rgba(0,245,255,0.3)' }}
        >
          <span style={{ fontSize: '13px' }}>🎁</span>
          <span className="font-orbitron font-bold" style={{ color: '#00f5ff', fontSize: '9px', letterSpacing: '0.5px' }}>{bonus}</span>
        </div>
      )}

      {/* Price rows */}
      <div className="p-4 flex-1 flex flex-col gap-2">
        {rows.map((row) => {
          const discounted = birthdayMode ? Math.round(row.price * 0.8) : null;
          return (
            <div
              key={row.label}
              className="flex items-center justify-between py-2.5 px-3 rounded-md"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div>
                <span className="font-rajdhani font-semibold text-white/80 text-sm">{row.label}</span>
                {row.note && (
                  <p className="font-mono-tech text-white/30 mt-0.5" style={{ fontSize: '9px' }}>{row.note}</p>
                )}
              </div>
              <div className="text-right">
                {birthdayMode && (
                  <div className="font-orbitron text-xs text-white/30 line-through">{row.price} ₽</div>
                )}
                <div className="flex items-baseline gap-1">
                  <span className="font-orbitron font-black text-xl" style={{ color: birthdayMode ? '#ff006e' : color }}>
                    {discounted ?? row.price}
                  </span>
                  <span className="font-rajdhani text-white/40 text-sm">₽</span>
                </div>
                {birthdayMode && discounted && (
                  <div className="font-mono-tech" style={{ color: '#ff006e', fontSize: '9px' }}>
                    −{row.price - discounted} ₽
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {onBook && (
        <div className="px-4 pb-4">
          <button
            onClick={onBook}
            className="w-full py-2.5 rounded-sm font-orbitron text-xs font-bold transition-all hover:scale-[1.02] cursor-pointer whitespace-nowrap"
            style={{ border: `1px solid ${color}60`, color, background: `${color}08` }}
          >
            Записаться
          </button>
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
    </article>
  );
};

export default ServicePriceCard;
