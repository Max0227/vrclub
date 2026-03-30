import { useState } from 'react';
import { allGames } from '../../../mocks/games';

type FilterType = 'ВСЕ' | 'VR' | 'PS5' | 'MOZA';

const filterColors: Record<string, string> = {
  VR: '#00f5ff',
  PS5: '#9b4dff',
  MOZA: '#ff006e',
};

const categoryLabels: Record<string, string> = {
  VR: 'VR',
  PS5: 'PS5',
  MOZA: 'MOZA',
};

const Games = () => {
  const [activeFilter, setActiveFilter] = useState<FilterType>('ВСЕ');

  const filtered = activeFilter === 'ВСЕ'
    ? allGames
    : allGames.filter((g) => g.category === activeFilter);

  const getColor = (cat: string) => filterColors[cat] ?? '#00f5ff';

  return (
    <section id="games" className="relative py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="tag-line" />
            <span className="font-mono-tech text-xs tracking-widest" style={{ color: '#00f5ff' }}>БИБЛИОТЕКА ИГР</span>
            <span className="tag-line" />
          </div>
          <h2 className="section-title text-white mb-3">Игры</h2>
          <p className="text-white/50 font-rajdhani text-lg">
            29+ VR игр · 11 PS5 игр · 4 гоночных симулятора
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap gap-3 justify-center mb-8">
          {(['ВСЕ', 'VR', 'PS5', 'MOZA'] as FilterType[]).map((f) => {
            const isActive = activeFilter === f;
            const col = f === 'ВСЕ' ? '#00f5ff' : getColor(f);
            return (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className="filter-btn whitespace-nowrap"
                style={isActive ? { borderColor: col, color: col, boxShadow: `0 0 16px ${col}50`, background: `${col}10` } : {}}
              >
                {f === 'ВСЕ' ? `ВСЕ (${allGames.length})` : `${categoryLabels[f]} (${allGames.filter(g => g.category === f).length})`}
              </button>
            );
          })}
        </div>

        {/* Games grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {filtered.map((game) => {
            const color = getColor(game.category);
            return (
              <div
                key={game.id}
                className="group relative rounded-lg overflow-hidden cursor-default"
                style={{ border: `1px solid ${color}20`, background: 'rgba(1,0,20,0.8)' }}
              >
                {/* Image */}
                <div className="relative h-28 overflow-hidden">
                  <img
                    src={game.image}
                    alt={game.name}
                    className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div
                    className="absolute inset-0 transition-opacity duration-300"
                    style={{ background: 'linear-gradient(to top, rgba(1,0,20,0.95) 0%, rgba(1,0,20,0.4) 60%, transparent 100%)' }}
                  />
                  {/* Category badge */}
                  <div
                    className="absolute top-1.5 left-1.5 font-mono-tech text-xs px-1.5 py-0.5 rounded-sm"
                    style={{ background: `${color}20`, border: `1px solid ${color}50`, color, backdropFilter: 'blur(4px)', fontSize: '9px', letterSpacing: '1px' }}
                  >
                    {game.category}
                  </div>
                </div>

                {/* Content */}
                <div className="p-2.5">
                  <div className="font-orbitron font-bold text-white leading-tight mb-1" style={{ fontSize: '10px' }}>
                    {game.name}
                  </div>
                  <div className="text-white/50 font-rajdhani leading-tight" style={{ fontSize: '10px' }}>
                    {game.desc}
                  </div>
                </div>

                {/* Hover glow line */}
                <div
                  className="absolute bottom-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
                />
              </div>
            );
          })}
        </div>

        {/* Footer note */}
        <p className="text-center font-mono-tech text-xs mt-8" style={{ color: '#00f5ff', opacity: 0.5 }}>
          [{filtered.length.toString().padStart(2, '0')} ИГР ДОСТУПНО] · БИБЛИОТЕКА ПОСТОЯННО ПОПОЛНЯЕТСЯ
        </p>
      </div>
    </section>
  );
};

export default Games;
