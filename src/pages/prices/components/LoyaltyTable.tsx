const tiers = [
  { name: 'Стандартная', icon: 'ri-shield-line', color: '#8a8a9e', hours: 0, discount: 5, note: 'При регистрации' },
  { name: 'Серебряная', icon: 'ri-shield-star-line', color: '#c0c0d0', hours: 20, discount: 7, note: '20+ часов VR' },
  { name: 'Золотая', icon: 'ri-vip-crown-line', color: '#f0c040', hours: 40, discount: 10, note: '40+ часов VR' },
  { name: 'Платиновая', icon: 'ri-award-line', color: '#a0d8ef', hours: 60, discount: 12, note: '60+ часов VR' },
  { name: 'CYBER', icon: 'ri-flashlight-line', color: '#00f5ff', hours: 100, discount: 20, note: '100+ часов VR' },
];

const bonuses = [
  { icon: 'ri-gift-line', color: '#00f5ff', title: '5 часов VR = 1 час в подарок', desc: 'Каждые 5 часов VR-игры в будни — получаете 1 час бесплатно. Часы считаются по времени сессии, не по числу шлемов.' },
  { icon: 'ri-steering-2-line', color: '#ff006e', title: '10 часов автосима = 2 часа VR', desc: 'Отыграйте 10 часов на MOZA Racing Simulator — и получите 2 часа VR в подарок.' },
  { icon: 'ri-cake-line', color: '#ff006e', title: 'День рождения −20%', desc: 'Скидка 20% действует ±3 дня от даты рождения. Не суммируется со скидкой карты — применяется лучшая из двух. Часы всё равно засчитываются в карту.' },
];

interface LoyaltyTableProps {
  vrPricePerHour?: number;
}

const LoyaltyTable = ({ vrPricePerHour = 800 }: LoyaltyTableProps) => (
  <section className="py-16 px-4">
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="flex items-center justify-center gap-3 mb-3">
          <span className="h-px w-12" style={{ background: 'linear-gradient(90deg, transparent, rgba(0,245,255,0.5))' }} />
          <span className="font-mono-tech text-xs tracking-widest" style={{ color: '#00f5ff' }}>ПРОГРАММА ЛОЯЛЬНОСТИ</span>
          <span className="h-px w-12" style={{ background: 'linear-gradient(90deg, rgba(0,245,255,0.5), transparent)' }} />
        </div>
        <h2 className="font-orbitron font-black text-white text-2xl md:text-3xl mb-3">Клубная карта</h2>
        <p className="font-rajdhani text-white/50 text-lg max-w-xl mx-auto">
          Накапливайте VR-часы — уровень карты растёт, скидка увеличивается
        </p>
      </div>

      {/* Tiers table */}
      <div className="overflow-x-auto mb-10">
        <table className="w-full text-left border-collapse" style={{ minWidth: '600px' }}>
          <thead>
            <tr>
              <th className="font-orbitron text-white/40 text-xs pb-3 pr-4" style={{ fontSize: '10px', letterSpacing: '1px' }}>УРОВЕНЬ</th>
              <th className="font-orbitron text-white/40 text-xs pb-3 pr-4 text-center" style={{ fontSize: '10px', letterSpacing: '1px' }}>VR ЧАСОВ</th>
              <th className="font-orbitron text-white/40 text-xs pb-3 pr-4 text-center" style={{ fontSize: '10px', letterSpacing: '1px' }}>СКИДКА</th>
              <th className="font-orbitron text-white/40 text-xs pb-3 text-right" style={{ fontSize: '10px', letterSpacing: '1px' }}>VR 1Ч С КАРТОЙ</th>
            </tr>
          </thead>
          <tbody>
            {tiers.map((tier, i) => (
              <tr
                key={tier.name}
                className="transition-all duration-200 hover:bg-white/[0.02] rounded-lg"
                style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
              >
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 flex items-center justify-center rounded-sm flex-shrink-0"
                      style={{ background: `${tier.color}15`, border: `1px solid ${tier.color}40` }}
                    >
                      <i className={`${tier.icon} text-sm`} style={{ color: tier.color }} />
                    </div>
                    <div>
                      <div className="font-orbitron font-bold text-white" style={{ fontSize: '12px' }}>{tier.name}</div>
                      <div className="font-mono-tech text-white/30" style={{ fontSize: '9px' }}>{tier.note}</div>
                    </div>
                    {i === 4 && (
                      <span className="font-orbitron text-xs px-2 py-0.5 rounded-sm font-bold ml-1 hidden sm:inline-block" style={{ background: '#00f5ff', color: '#010014', fontSize: '9px' }}>МАХ</span>
                    )}
                  </div>
                </td>
                <td className="py-3 pr-4 text-center">
                  <span className="font-orbitron font-black" style={{ color: tier.color, fontSize: '18px' }}>
                    {tier.hours === 0 ? '0' : `${tier.hours}+`}
                  </span>
                  <span className="font-rajdhani text-white/30 text-xs ml-1">ч</span>
                </td>
                <td className="py-3 pr-4 text-center">
                  <span
                    className="inline-block font-orbitron font-black px-3 py-1 rounded-sm"
                    style={{ background: `${tier.color}15`, border: `1px solid ${tier.color}35`, color: tier.color, fontSize: '14px' }}
                  >
                    −{tier.discount}%
                  </span>
                </td>
                <td className="py-3 text-right">
                  <span className="font-orbitron font-black text-xl text-white">
                    {Math.round(vrPricePerHour * (1 - tier.discount / 100))} ₽
                  </span>
                  <div className="font-rajdhani text-white/30 text-xs">вместо {vrPricePerHour} ₽</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bonus cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {bonuses.map((b) => (
          <div
            key={b.title}
            className="relative rounded-lg p-5"
            style={{ background: `${b.color}06`, border: `1px solid ${b.color}25` }}
          >
            <div className="w-10 h-10 flex items-center justify-center rounded-sm mb-4" style={{ background: `${b.color}15`, border: `1px solid ${b.color}40` }}>
              <i className={`${b.icon} text-lg`} style={{ color: b.color }} />
            </div>
            <h4 className="font-orbitron font-bold text-white mb-2" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>{b.title}</h4>
            <p className="font-rajdhani text-white/50 text-sm leading-relaxed">{b.desc}</p>
            <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-lg" style={{ background: `linear-gradient(90deg, transparent, ${b.color}60, transparent)` }} />
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default LoyaltyTable;
