import { Link } from 'react-router-dom';

interface PricingProps {
  onBooking: (service?: string) => void;
}

const Pricing = ({ onBooking }: PricingProps) => {
  const highlights = [
    { 
      label: 'VR 1 час', 
      value: '800 ₽', 
      sub: '1 шлем Oculus Quest 2', 
      color: '#00f5ff', 
      icon: 'ri-vr-glasses-line',
      ariaLabel: 'VR 1 час — 800 рублей'
    },
    { 
      label: 'VR 4 шлема × 1 час', 
      value: '3 200 ₽', 
      sub: 'Совместная игра', 
      color: '#00f5ff', 
      icon: 'ri-group-line',
      ariaLabel: 'Аренда 4 VR шлемов на 1 час — 3200 рублей'
    },
    { 
      label: 'MOZA Racing 1 час', 
      value: '1 000 ₽', 
      sub: 'Профессиональный симулятор', 
      color: '#ff006e', 
      icon: 'ri-steering-2-line',
      ariaLabel: 'MOZA Racing симулятор 1 час — 1000 рублей'
    },
    { 
      label: 'PlayStation 5 — 1 час', 
      value: '350 ₽', 
      sub: '4K · до 4 игроков', 
      color: '#9b4dff', 
      icon: 'ri-gamepad-line',
      ariaLabel: 'PlayStation 5 1 час — 350 рублей'
    },
    { 
      label: 'Весь клуб — 1 час', 
      value: '4 750 ₽', 
      sub: 'VR + PS5 + MOZA · до 12 чел', 
      color: '#00f5ff', 
      icon: 'ri-building-2-line',
      ariaLabel: 'Аренда всего клуба на 1 час — 4750 рублей'
    },
    { 
      label: 'Скидка на ДР', 
      value: '−20%', 
      sub: '±3 дня от даты рождения', 
      color: '#ff006e', 
      icon: 'ri-cake-2-line',
      ariaLabel: 'Скидка 20% на день рождения'
    },
  ];

  return (
    <section id="pricing" className="relative py-20 px-4 overflow-hidden" aria-label="Цены на услуги VR клуба">
      {/* Ambient glow blobs */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(0,245,255,0.04) 0%, transparent 70%)' }}
        aria-hidden="true"
      />
      <div 
        className="absolute top-0 right-0 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(255,0,110,0.05) 0%, transparent 70%)' }}
        aria-hidden="true"
      />

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="tag-line" aria-hidden="true" />
            <span className="font-mono-tech text-xs tracking-widest" style={{ color: '#00f5ff' }}>
              СТОИМОСТЬ
            </span>
            <span className="tag-line" aria-hidden="true" />
          </div>
          <h2 className="section-title text-white mb-3">Цены</h2>
          <p className="text-white/50 font-rajdhani text-lg max-w-xl mx-auto">
            Честные цены без скрытых доплат · Скидки по клубной карте · ДР −20%
          </p>
        </div>

        {/* Price highlights grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-10 max-w-4xl mx-auto">
          {highlights.map((h) => (
            <div
              key={h.label}
              className="group relative rounded-lg p-4 flex flex-col transition-all duration-300 hover:scale-[1.02] cursor-default"
              style={{
                background: `linear-gradient(135deg, ${h.color}08 0%, rgba(1,0,20,0.7) 100%)`,
                border: `1px solid ${h.color}20`,
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = `${h.color}50`; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = `${h.color}20`; }}
              aria-label={h.ariaLabel}
            >
              <div className="flex items-center gap-2 mb-2">
                <div 
                  className="w-6 h-6 flex items-center justify-center rounded-sm flex-shrink-0"
                  style={{ background: `${h.color}15`, border: `1px solid ${h.color}30` }}
                  aria-hidden="true"
                >
                  <i className={`${h.icon} text-xs`} style={{ color: h.color }} />
                </div>
                <span className="font-mono-tech text-white/40 leading-tight" style={{ fontSize: '9px' }}>
                  {h.label}
                </span>
              </div>
              <span className="font-orbitron font-black text-2xl leading-none mb-1" style={{ color: h.color }}>
                {h.value}
              </span>
              <span className="font-rajdhani text-white/35 text-xs leading-tight">
                {h.sub}
              </span>
              {/* Bottom accent line */}
              <div 
                className="absolute bottom-0 left-0 right-0 h-px rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: `linear-gradient(90deg, transparent, ${h.color}, transparent)` }}
                aria-hidden="true"
              />
            </div>
          ))}
        </div>

        {/* CTA to full prices page */}
        <div className="flex flex-col items-center gap-5">
          <div
            className="relative w-full max-w-3xl rounded-lg overflow-hidden"
            style={{ background: 'rgba(0,245,255,0.04)', border: '1px solid rgba(0,245,255,0.18)' }}
          >
            {/* Background image slightly blurred */}
            <img
              src="/images/pricing/cta-bg.jpg"
              alt="Группа людей играет в VR игры в клубе PARADOX"
              className="absolute inset-0 w-full h-full object-cover object-center"
              style={{ filter: 'blur(3px) brightness(0.18)', transform: 'scale(1.04)' }}
              loading="lazy"
            />
            <div 
              className="absolute inset-0" 
              style={{ background: 'linear-gradient(90deg, rgba(1,0,20,0.92) 0%, rgba(1,0,20,0.6) 50%, rgba(1,0,20,0.92) 100%)' }}
              aria-hidden="true"
            />
            {/* Glow top */}
            <div 
              className="absolute inset-0" 
              style={{ background: 'radial-gradient(ellipse at 50% -20%, rgba(0,245,255,0.1) 0%, transparent 65%)' }}
              aria-hidden="true"
            />

            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6 px-8 py-8">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <i className="ri-price-tag-3-line text-sm" style={{ color: '#00f5ff' }} aria-hidden="true" />
                  <span className="font-mono-tech text-xs tracking-widest" style={{ color: '#00f5ff' }}>
                    ПОЛНЫЙ ПРАЙС-ЛИСТ
                  </span>
                </div>
                <p className="font-orbitron font-bold text-white text-xl md:text-2xl leading-snug mb-1">
                  Все тарифы · Таблица скидок
                </p>
                <p className="font-rajdhani text-white/45 text-sm">
                  5 видов услуг · Клубная карта · Бонусная система · FAQ
                </p>
              </div>
              <div className="flex flex-col gap-3 flex-shrink-0">
                <Link
                  to="/prices"
                  className="inline-flex items-center gap-2 font-orbitron font-bold text-sm px-7 py-3 rounded-sm whitespace-nowrap transition-all duration-300 hover:scale-105 cursor-pointer"
                  style={{
                    background: 'linear-gradient(135deg, rgba(0,245,255,0.2) 0%, rgba(0,245,255,0.08) 100%)',
                    border: '1px solid rgba(0,245,255,0.5)',
                    color: '#00f5ff',
                  }}
                  aria-label="Перейти к полному прайс-листу"
                >
                  <i className="ri-price-tag-3-line" aria-hidden="true" />
                  Смотреть прайс
                  <i className="ri-arrow-right-line text-xs" aria-hidden="true" />
                </Link>
                <button
                  onClick={() => onBooking()}
                  className="btn-cyber-pink px-7 py-3 text-sm rounded-sm whitespace-nowrap font-orbitron font-bold cursor-pointer transition-all hover:scale-105"
                  aria-label="Записаться в VR клуб онлайн"
                >
                  Записаться
                </button>
              </div>
            </div>
          </div>

          <p className="font-mono-tech text-xs text-white/25 text-center">
            * Скидка на ДР −20% · ±3 дня от даты рождения при предъявлении документа
          </p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;