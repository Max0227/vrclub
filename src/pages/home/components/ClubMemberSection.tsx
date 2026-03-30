import { memo } from 'react';

interface ClubMemberSectionProps {
  onRegister: () => void;
  onBooking: () => void;
}

const BENEFITS = [
  { icon: 'ri-gift-2-line', title: 'Бонусные токены', desc: 'За каждый визит — токены на следующие сессии', color: '#9b4dff' },
  { icon: 'ri-cake-line', title: 'Скидка в день рождения', desc: '−20% за ±3 дня от даты рождения', color: '#ff006e' },
  { icon: 'ri-history-line', title: 'История визитов', desc: 'Все твои бронирования в одном месте', color: '#00f5ff' },
  { icon: 'ri-discuss-line', title: 'Клубный форум', desc: 'Общение, обзоры игр, турниры — скоро!', color: '#9b4dff' },
  { icon: 'ri-notification-3-line', title: 'Акции первым', desc: 'Уведомления о новых играх и скидках', color: '#ff006e' },
  { icon: 'ri-vip-crown-line', title: 'VIP-статус', desc: 'Приоритетное бронирование популярных слотов', color: '#00f5ff' },
];

const ClubMemberSection = memo(({ onRegister, onBooking }: ClubMemberSectionProps) => (
  <section id="club" className="relative py-20 px-4 overflow-hidden">
    {/* Background glow */}
    <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(155,77,255,0.06) 0%, transparent 70%)' }} />

    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <span className="tag-line" />
          <span className="font-mono-tech text-xs tracking-widest" style={{ color: '#9b4dff' }}>ПРОГРАММА ЛОЯЛЬНОСТИ</span>
          <span className="tag-line" />
        </div>
        <h2 className="section-title text-white mb-3">Стань членом клуба</h2>
        <p className="text-white/50 font-rajdhani text-lg max-w-xl mx-auto">
          Бесплатная регистрация — и ты сразу получаешь клубную карту с привилегиями
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        {/* Left: Virtual card */}
        <div className="flex flex-col items-center">
          {/* Card mockup */}
          <div className="relative rounded-2xl overflow-hidden mb-6" style={{ width: '320px', height: '190px', background: 'linear-gradient(135deg, #1a0040 0%, #0a001a 50%, #200050 100%)', border: '1px solid rgba(155,77,255,0.45)', boxShadow: '0 0 40px rgba(155,77,255,0.2)' }}>
            <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 25% 40%, rgba(155,77,255,0.35) 0%, transparent 65%)' }} />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.02) 50%, transparent 100%)' }} />
            <div className="absolute top-5 left-6 right-6">
              <div className="flex items-center justify-between mb-7">
                <div>
                  <p className="font-orbitron font-black text-sm tracking-widest" style={{ color: '#9b4dff' }}>PARADOX</p>
                  <p className="font-mono-tech" style={{ color: 'rgba(155,77,255,0.5)', fontSize: '9px', letterSpacing: '2px' }}>VR CLUB · NOVOSIBIRSK</p>
                </div>
                <div className="w-10 h-10 flex items-center justify-center">
                  <i className="ri-vip-crown-fill text-2xl" style={{ color: 'rgba(155,77,255,0.5)' }} />
                </div>
              </div>
              <p className="font-orbitron font-black text-xl tracking-widest text-white mb-2">PDX-••••••</p>
              <div className="flex items-center justify-between">
                <p className="font-rajdhani text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>Имя Участника</p>
                <p className="font-mono-tech text-xs" style={{ color: 'rgba(155,77,255,0.6)', fontSize: '9px' }}>MEMBER</p>
              </div>
            </div>
            {/* Chip */}
            <div className="absolute bottom-4 left-6 w-10 h-7 rounded-sm" style={{ background: 'linear-gradient(135deg, rgba(155,77,255,0.3), rgba(155,77,255,0.1))', border: '1px solid rgba(155,77,255,0.3)' }} />
          </div>

          {/* Stats row */}
          <div className="flex gap-6 text-center">
            {[
              { value: '500+', label: 'участников' },
              { value: 'FREE', label: 'регистрация' },
              { value: '∞', label: 'бонусов' },
            ].map((s) => (
              <div key={s.label}>
                <div className="font-orbitron font-black text-xl" style={{ color: '#9b4dff' }}>{s.value}</div>
                <div className="font-mono-tech text-xs text-white/40" style={{ fontSize: '10px' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Benefits + CTA */}
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-7">
            {BENEFITS.map((b) => (
              <div key={b.title} className="p-3.5 rounded-md" style={{ background: `${b.color}06`, border: `1px solid ${b.color}18` }}>
                <div className="flex items-center gap-2.5 mb-1.5">
                  <div className="w-7 h-7 flex items-center justify-center flex-shrink-0 rounded-sm" style={{ background: `${b.color}15` }}>
                    <i className={`${b.icon} text-sm`} style={{ color: b.color }} />
                  </div>
                  <span className="font-orbitron font-bold text-white" style={{ fontSize: '11px' }}>{b.title}</span>
                </div>
                <p className="font-rajdhani text-xs text-white/45 leading-snug">{b.desc}</p>
              </div>
            ))}
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onRegister}
              className="flex-1 py-3.5 rounded-sm text-sm flex items-center justify-center gap-2 font-orbitron font-bold transition-all cursor-pointer"
              style={{ background: 'rgba(155,77,255,0.15)', border: '1px solid rgba(155,77,255,0.5)', color: '#9b4dff', boxShadow: '0 0 20px rgba(155,77,255,0.1)' }}
            >
              <i className="ri-vip-crown-line" />
              Получить клубную карту
            </button>
            <button
              onClick={onBooking}
              className="px-5 py-3.5 rounded-sm text-sm flex items-center justify-center gap-2 font-rajdhani font-bold transition-all cursor-pointer text-white/40 hover:text-white/70 whitespace-nowrap"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              или просто записаться
            </button>
          </div>

          <p className="font-mono-tech text-xs text-white/20 mt-3 leading-relaxed" style={{ fontSize: '10px' }}>
            Регистрация бесплатная и ни к чему не обязывает · Также можно записаться по телефону +7 923 244-02-20
          </p>
        </div>
      </div>
    </div>
  </section>
));

ClubMemberSection.displayName = 'ClubMemberSection';
export default ClubMemberSection;
