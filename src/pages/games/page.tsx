import { useState } from 'react';
import { Link } from 'react-router-dom';
import { allGames } from '../../mocks/games';
import type { Game } from '../../mocks/games';
import SchemaOrgGames from './SchemaOrgGames';
import GameDetailModal from './components/GameDetailModal';
import PageMeta from '../../components/feature/PageMeta';

type FilterType = 'ВСЕ' | 'VR' | 'PS5' | 'MOZA';

const filterColors: Record<string, string> = {
  VR: '#00f5ff',
  PS5: '#9b4dff',
  MOZA: '#ff006e',
};

const GamesPage = () => {
  const [activeFilter, setActiveFilter] = useState<FilterType>('ВСЕ');
  const [search, setSearch] = useState('');
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  const filtered = allGames.filter((g) => {
    const matchCat = activeFilter === 'ВСЕ' || g.category === activeFilter;
    const matchSearch = search.trim() === '' || g.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const selectedIndex = selectedGame ? filtered.findIndex((g) => g.id === selectedGame.id) : -1;

  const handleNext = () => {
    if (selectedIndex < filtered.length - 1) setSelectedGame(filtered[selectedIndex + 1]);
  };

  const handlePrev = () => {
    if (selectedIndex > 0) setSelectedGame(filtered[selectedIndex - 1]);
  };

  const getColor = (cat: string) => filterColors[cat] ?? '#00f5ff';

  const counts = {
    VR: allGames.filter((g) => g.category === 'VR').length,
    PS5: allGames.filter((g) => g.category === 'PS5').length,
    MOZA: allGames.filter((g) => g.category === 'MOZA').length,
  };

  return (
    <div style={{ background: '#010014', minHeight: '100vh' }}>
      <PageMeta
        title="Игры PARADOX VR CLUB Новосибирск — 40+ VR игр, PS5, MOZA Racing 45+ трасс"
        description="Каталог игр VR-клуба PARADOX в Новосибирске: 40+ VR игр для Oculus Quest 2, 11 игр PlayStation 5, 45+ гоночных трасс MOZA Racing Simulator. Библиотека постоянно пополняется."
        canonical="https://paradoxvr.ru/games"
        keywords="VR игры Новосибирск, Beat Saber Новосибирск, Oculus Quest 2 игры, PS5 аренда игры Новосибирск, гоночный симулятор Новосибирск"
      />
      <SchemaOrgGames />
      {/* Background grid */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0,245,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(0,245,255,0.025) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          zIndex: 0,
        }}
      />

      {/* Top bar */}
      <div
        className="sticky top-0 z-40 flex items-center justify-between px-4 md:px-8 h-16"
        style={{ background: 'rgba(1,0,20,0.98)', borderBottom: '1px solid rgba(0,245,255,0.12)', backdropFilter: 'blur(12px)' }}
      >
        <Link to="/" className="flex items-center gap-2 cursor-pointer group">
          <i className="ri-arrow-left-line text-sm transition-transform group-hover:-translate-x-1" style={{ color: '#00f5ff' }} />
          <span className="font-orbitron text-xs font-bold tracking-wider" style={{ color: '#00f5ff' }}>PARADOX VR CLUB</span>
        </Link>
        <div className="flex items-center gap-2">
          <i className="ri-gamepad-line text-xs" style={{ color: '#9b4dff' }} />
          <span className="font-orbitron font-bold text-white tracking-widest" style={{ fontSize: '10px' }}>БИБЛИОТЕКА ИГР</span>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="h-px w-12" style={{ background: 'linear-gradient(90deg, transparent, rgba(0,245,255,0.6))' }} />
            <span className="font-mono-tech text-xs tracking-widest" style={{ color: '#00f5ff' }}>ИГРОВОЙ КАТАЛОГ</span>
            <span className="h-px w-12" style={{ background: 'linear-gradient(90deg, rgba(0,245,255,0.6), transparent)' }} />
          </div>
          <h1 className="font-orbitron font-black text-white mb-4" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', textShadow: '0 0 40px rgba(0,245,255,0.2)' }}>
            Игры
          </h1>
          <p className="font-rajdhani text-white/50 text-lg">
            {counts.VR} VR игр &nbsp;·&nbsp; {counts.PS5} PS5 игр &nbsp;·&nbsp; {counts.MOZA} гоночных симулятора
          </p>
        </div>

        {/* Category stats */}
        <div className="grid grid-cols-3 gap-4 mb-10 max-w-2xl mx-auto">
          {([
            { key: 'VR', icon: 'ri-vr-glasses-line', label: 'VR Шлем', desc: 'Oculus Quest 2' },
            { key: 'PS5', icon: 'ri-gamepad-line', label: 'PlayStation 5', desc: '4K Gaming' },
            { key: 'MOZA', icon: 'ri-steering-2-line', label: 'Racing Sim', desc: 'MOZA R5' },
          ] as const).map(({ key, icon, label, desc }) => {
            const col = getColor(key);
            const isActive = activeFilter === key;
            return (
              <button
                key={key}
                onClick={() => setActiveFilter(isActive ? 'ВСЕ' : key)}
                className="relative rounded-lg p-4 text-center transition-all duration-300 cursor-pointer"
                style={{
                  background: isActive ? `${col}12` : 'rgba(1,0,20,0.8)',
                  border: `1px solid ${isActive ? col : `${col}25`}`,
                  boxShadow: isActive ? `0 0 20px ${col}20` : 'none',
                }}
              >
                <div className="w-8 h-8 flex items-center justify-center rounded-sm mx-auto mb-2" style={{ background: `${col}15`, border: `1px solid ${col}40` }}>
                  <i className={`${icon} text-sm`} style={{ color: col }} />
                </div>
                <div className="font-orbitron font-black text-2xl" style={{ color: col, lineHeight: 1 }}>
                  {counts[key]}
                </div>
                <div className="font-orbitron font-bold text-white mt-1" style={{ fontSize: '9px', letterSpacing: '1px' }}>{label}</div>
                <div className="font-rajdhani text-white/40 text-xs">{desc}</div>
                <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-lg" style={{ background: `linear-gradient(90deg, transparent, ${col}, transparent)` }} />
              </button>
            );
          })}
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8 items-center">
          <div className="relative flex-1 max-w-sm">
            <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'rgba(0,245,255,0.5)' }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full py-2.5 pl-9 pr-4 rounded-sm font-rajdhani text-sm text-white placeholder-white/30 bg-transparent outline-none"
              style={{ border: '1px solid rgba(0,245,255,0.2)', background: 'rgba(0,245,255,0.04)' }}
              placeholder="Поиск по названию..."
            />
          </div>
          <div className="flex gap-2 flex-wrap justify-center">
            {(['ВСЕ', 'VR', 'PS5', 'MOZA'] as FilterType[]).map((f) => {
              const isActive = activeFilter === f;
              const col = f === 'ВСЕ' ? '#00f5ff' : getColor(f);
              return (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className="font-orbitron font-bold text-xs px-4 py-2 rounded-sm cursor-pointer transition-all duration-200 whitespace-nowrap"
                  style={
                    isActive
                      ? { borderColor: col, color: col, border: `1px solid ${col}`, boxShadow: `0 0 12px ${col}40`, background: `${col}10` }
                      : { border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)', background: 'transparent' }
                  }
                >
                  {f === 'ВСЕ' ? `ВСЕ (${allGames.length})` : `${f} (${counts[f as keyof typeof counts]})`}
                </button>
              );
            })}
          </div>
        </div>

        {/* Games grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {filtered.map((game) => {
            const color = getColor(game.category);
            return (
              <div
                key={game.id}
                onClick={() => setSelectedGame(game)}
                className="group relative rounded-lg overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.05] hover:-translate-y-1"
                style={{
                  border: `1px solid ${color}20`,
                  background: 'rgba(1,0,20,0.85)',
                  boxShadow: 'none',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 20px ${color}25, 0 8px 24px rgba(0,0,0,0.5)`;
                  (e.currentTarget as HTMLDivElement).style.borderColor = `${color}50`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
                  (e.currentTarget as HTMLDivElement).style.borderColor = `${color}20`;
                }}
              >
                {/* Image */}
                <div className="relative h-28 overflow-hidden">
                  <div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ background: `radial-gradient(ellipse at center, ${color}20 0%, rgba(1,0,20,0.95) 70%)` }}
                  >
                    <i className="ri-gamepad-line text-4xl" style={{ color: `${color}35` }} />
                  </div>
                  <img
                    src={game.image}
                    alt={game.name}
                    className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                  <div
                    className="absolute inset-0"
                    style={{ background: 'linear-gradient(to top, rgba(1,0,20,0.95) 0%, rgba(1,0,20,0.4) 60%, transparent 100%)' }}
                  />
                  <div
                    className="absolute top-1.5 left-1.5 font-mono-tech px-1.5 py-0.5 rounded-sm"
                    style={{ background: `${color}20`, border: `1px solid ${color}50`, color, backdropFilter: 'blur(4px)', fontSize: '9px', letterSpacing: '1px' }}
                  >
                    {game.category}
                  </div>
                  {/* Hover overlay hint */}
                  <div
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    style={{ background: `${color}10` }}
                  >
                    <div
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm font-orbitron font-bold"
                      style={{ background: 'rgba(1,0,14,0.85)', border: `1px solid ${color}60`, color, fontSize: '9px', backdropFilter: 'blur(4px)' }}
                    >
                      <i className="ri-eye-line" />
                      Подробнее
                    </div>
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

                <div
                  className="absolute bottom-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
                />
              </div>
            );
          })}
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="text-center py-20">
            <i className="ri-search-line text-4xl text-white/15 block mb-3" />
            <p className="font-orbitron text-white/30 text-sm">Игры не найдены</p>
            <button
              onClick={() => { setSearch(''); setActiveFilter('ВСЕ'); }}
              className="mt-4 font-orbitron text-xs px-6 py-2 rounded-sm cursor-pointer transition-colors"
              style={{ border: '1px solid rgba(0,245,255,0.3)', color: '#00f5ff' }}
            >
              Сбросить фильтры
            </button>
          </div>
        )}

        {/* Footer note */}
        <div className="mt-10 text-center">
          <p className="font-mono-tech text-xs" style={{ color: '#00f5ff', opacity: 0.4 }}>
            [{filtered.length.toString().padStart(2, '0')} ИГР ДОСТУПНО] · БИБЛИОТЕКА ПОСТОЯННО ПОПОЛНЯЕТСЯ
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 mt-6 font-orbitron text-xs px-8 py-3 rounded-sm cursor-pointer transition-all hover:scale-105"
            style={{ border: '1px solid rgba(255,0,110,0.4)', color: '#ff006e', background: 'rgba(255,0,110,0.06)' }}
          >
            <i className="ri-arrow-left-line" />
            Вернуться на главную
          </Link>
        </div>
      </div>

      {/* Game Detail Modal */}
      {selectedGame && (
        <GameDetailModal
          game={selectedGame}
          onClose={() => setSelectedGame(null)}
          onNext={selectedIndex < filtered.length - 1 ? handleNext : undefined}
          onPrev={selectedIndex > 0 ? handlePrev : undefined}
        />
      )}
    </div>
  );
};

export default GamesPage;
