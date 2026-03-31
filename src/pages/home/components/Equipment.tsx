const equipmentData = [
  {
    id: 1,
    icon: 'ri-vr-glasses-line',
    title: 'Oculus Quest 2',
    subtitle: 'Беспроводные VR-шлемы',
    color: '#00f5ff',
    image: '/images/equipment/oculus-quest-2.jpg',
    features: [
      { icon: 'ri-wifi-line', text: 'Полностью беспроводные' },
      { icon: 'ri-hand-coin-line', text: 'Трекинг рук без контроллеров' },
      { icon: 'ri-gamepad-line', text: '40+ эксклюзивных VR-игр' },
      { icon: 'ri-group-line', text: 'До 4 игроков в совместной игре' },
      { icon: 'ri-building-2-line', text: 'Клуб вмещает до 12 человек' },
    ],
    description: 'Погрузитесь в виртуальный мир без проводов. 4 беспроводных шлема для совместной игры — зовите компанию! Клуб с комфортом размещает до 12 гостей одновременно.',
  },
  {
    id: 2,
    icon: 'ri-gamepad-line',
    title: 'PlayStation 5',
    subtitle: 'Консольный гейминг',
    color: '#9b4dff',
    image: '/images/equipment/playstation-5.jpg',
    features: [
      { icon: 'ri-gamepad-2-line', text: '4 геймпада для мультиплеера' },
      { icon: 'ri-4k-line', text: '4K HDR графика' },
      { icon: 'ri-group-2-line', text: 'Совместная игра до 4 человек' },
      { icon: 'ri-star-line', text: 'Лучшие эксклюзивы PlayStation' },
    ],
    description: 'Четыре геймпада и лучшие эксклюзивы PlayStation. Идеально для компании друзей или захватывающих соревнований — Spider-Man 2, Mortal Kombat и другие.',
  },
  {
    id: 3,
    icon: 'ri-steering-2-line',
    title: 'MOZA Racing',
    subtitle: 'Профессиональный автосимулятор',
    color: '#ff006e',
    image: '/images/equipment/moza-racing.jpg',
    features: [
      { icon: 'ri-steering-2-line', text: 'Профессиональный руль MOZA' },
      { icon: 'ri-footprint-line', text: 'Педали с обратной связью' },
      { icon: 'ri-road-map-line', text: '45+ гоночных трасс' },
      { icon: 'ri-speed-line', text: 'Forza, BeamNG, DiRT Rally' },
    ],
    description: 'Профессиональная установка гоночного симулятора. Реалистичный руль MOZA, педали с обратной связью и более 45 трасс в Forza Horizon 5, BeamNG.drive и DiRT Rally 2.0.',
  },
];

const Equipment = () => {
  return (
    <section id="equipment" className="relative py-10 md:py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-8 md:mb-14">
          <div className="flex items-center justify-center gap-3 mb-3 md:mb-4">
            <span className="tag-line" />
            <span className="font-mono-tech text-xs tracking-widest" style={{ color: '#00f5ff' }}>НАШИ ТЕХНОЛОГИИ</span>
            <span className="tag-line" />
          </div>
          <h2 className="section-title text-white mb-2 md:mb-3">
            Оборудование
          </h2>
          <p className="text-white/50 font-rajdhani text-base md:text-lg max-w-xl mx-auto px-2">
            Три вида развлечений — один клуб. Выбери свой мир.
          </p>
        </div>

        {/* Cards — horizontal scroll on mobile, grid on desktop */}
        <div className="flex md:grid md:grid-cols-3 gap-4 md:gap-6 overflow-x-auto pb-3 md:pb-0 snap-x snap-mandatory md:overflow-visible scrollbar-hide">
          {equipmentData.map((item) => (
            <div
              key={item.id}
              className="group relative rounded-lg overflow-hidden flex flex-col flex-shrink-0 w-72 sm:w-80 md:w-auto snap-start"
              style={{
                background: 'rgba(1,0,20,0.85)',
                border: `1px solid ${item.color}25`,
                transition: 'all 0.4s ease',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = `${item.color}70`;
                (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 30px ${item.color}15`;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = `${item.color}25`;
                (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
              }}
            >
              {/* Corner accents */}
              <div className="absolute top-0 left-0 w-5 h-5 z-10" style={{ borderTop: `2px solid ${item.color}`, borderLeft: `2px solid ${item.color}` }} />
              <div className="absolute bottom-0 right-0 w-5 h-5 z-10" style={{ borderBottom: `2px solid ${item.color}`, borderRight: `2px solid ${item.color}` }} />

              {/* Image */}
              <div className="relative h-44 md:h-52 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div
                  className="absolute inset-0"
                  style={{ background: `linear-gradient(to top, rgba(1,0,20,1) 0%, rgba(1,0,20,0.3) 55%, rgba(1,0,20,0.15) 100%)` }}
                />
                {/* Icon badge */}
                <div
                  className="absolute top-3 right-3 w-8 h-8 md:w-9 md:h-9 flex items-center justify-center rounded-md"
                  style={{ border: `1px solid ${item.color}60`, background: 'rgba(1,0,20,0.85)', backdropFilter: 'blur(4px)' }}
                >
                  <i className={`${item.icon} text-sm`} style={{ color: item.color }} />
                </div>
                {/* Bottom label */}
                <div className="absolute bottom-3 left-4">
                  <div className="font-mono-tech" style={{ color: item.color, letterSpacing: '1px', fontSize: '9px' }}>
                    {item.subtitle.toUpperCase()}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 md:p-5 flex flex-col flex-1">
                <h3 className="font-orbitron font-bold text-lg md:text-xl text-white mb-1.5 md:mb-2">{item.title}</h3>
                <p className="text-white/50 text-xs md:text-sm font-rajdhani mb-4 leading-relaxed flex-1">{item.description}</p>

                <ul className="space-y-2">
                  {item.features.map((f) => (
                    <li key={f.text} className="flex items-center gap-2.5">
                      <div className="w-5 h-5 md:w-6 md:h-6 flex items-center justify-center flex-shrink-0 rounded-sm" style={{ background: `${item.color}15`, border: `1px solid ${item.color}30` }}>
                        <i className={`${f.icon} text-xs`} style={{ color: item.color }} />
                      </div>
                      <span className="text-white/70 font-rajdhani text-xs md:text-sm">{f.text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Bottom gradient line */}
              <div className="h-0.5 w-full flex-shrink-0" style={{ background: `linear-gradient(90deg, transparent, ${item.color}, transparent)` }} />
            </div>
          ))}
        </div>

        {/* Mobile scroll hint */}
        <div className="flex items-center justify-center gap-2 mt-3 md:hidden">
          <i className="ri-arrow-left-s-line text-xs" style={{ color: 'rgba(0,245,255,0.4)' }} />
          <span className="font-mono-tech text-center" style={{ color: 'rgba(0,245,255,0.4)', fontSize: '10px', letterSpacing: '1px' }}>
            ЛИСТАЙ ВПРАВО
          </span>
          <i className="ri-arrow-right-s-line text-xs" style={{ color: 'rgba(0,245,255,0.4)' }} />
        </div>
      </div>
    </section>
  );
};

export default Equipment;
