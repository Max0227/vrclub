import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import ClientDetailModal from './components/ClientDetailModal';

interface CardRow {
  card_number: string;
  name: string;
  phone: string;
  vr_tokens: number;
  auto_tokens: number;
  vr_sessions: number;
  auto_sessions: number;
  created_at: string;
}

interface HistoryRow {
  id: string;
  card_number: string;
  date: string;
  type: string;
  description: string;
  tokens: number;
}

const AdminCardsPage = () => {
  const [searchParams] = useSearchParams();
  const clientParam = searchParams.get('client');

  const [pinInput, setPinInput] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [pinError, setPinError] = useState('');
  const [pinLoading, setPinLoading] = useState(false);

  const [cards, setCards] = useState<CardRow[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'vr' | 'auto' | 'date'>('date');
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [history, setHistory] = useState<Record<string, HistoryRow[]>>({});
  const [historyLoading, setHistoryLoading] = useState<string | null>(null);
  const [detailCard, setDetailCard] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<'all' | 'inactive'>('all');
  const [lastActivity, setLastActivity] = useState<Record<string, string | null>>({});
  const [activityLoading, setActivityLoading] = useState(false);

  const validatePin = useCallback(async (pin: string): Promise<boolean> => {
    const { data } = await supabase
      .from('admin_settings')
      .select('pin')
      .eq('id', 1)
      .maybeSingle();
    return data?.pin === pin;
  }, []);

  const handlePinSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinInput.trim()) return;
    setPinLoading(true);
    const ok = await validatePin(pinInput.trim());
    setPinLoading(false);
    if (ok) {
      setUnlocked(true);
      setPinError('');
    } else {
      setPinError('Неверный PIN-код');
      setTimeout(() => setPinError(''), 2500);
    }
  }, [pinInput, validatePin]);

  const loadLastActivity = useCallback(async () => {
    setActivityLoading(true);
    const { data } = await supabase
      .from('loyalty_history')
      .select('card_number, date')
      .order('date', { ascending: false });
    setActivityLoading(false);
    if (data) {
      const map: Record<string, string> = {};
      data.forEach((row: { card_number: string; date: string }) => {
        if (!map[row.card_number]) {
          map[row.card_number] = row.date;
        }
      });
      setLastActivity(map);
    }
  }, []);

  const loadCards = useCallback(async () => {
    setDataLoading(true);
    const { data } = await supabase
      .from('loyalty_cards')
      .select('*')
      .order('created_at', { ascending: false });
    setDataLoading(false);
    if (data) setCards(data as CardRow[]);
  }, []);

  useEffect(() => {
    if (unlocked) {
      loadCards();
      loadLastActivity();
    }
  }, [unlocked, loadCards, loadLastActivity]);

  // Auto-open client card if ?client= param is present after unlock
  useEffect(() => {
    if (unlocked && clientParam && !detailCard) {
      setDetailCard(clientParam);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unlocked, clientParam]);

  const loadHistory = useCallback(async (cardNumber: string) => {
    if (history[cardNumber]) {
      setExpandedCard(expandedCard === cardNumber ? null : cardNumber);
      return;
    }
    setHistoryLoading(cardNumber);
    const { data } = await supabase
      .from('loyalty_history')
      .select('*')
      .eq('card_number', cardNumber)
      .order('date', { ascending: false });
    setHistoryLoading(null);
    if (data) {
      setHistory((prev) => ({ ...prev, [cardNumber]: data as HistoryRow[] }));
    }
    setExpandedCard(expandedCard === cardNumber ? null : cardNumber);
  }, [history, expandedCard]);

  const getDaysSinceActivity = useCallback((card: CardRow): number => {
    const lastDate = lastActivity[card.card_number];
    const referenceDate = lastDate ? new Date(lastDate) : new Date(card.created_at);
    const now = new Date();
    return Math.floor((now.getTime() - referenceDate.getTime()) / (1000 * 60 * 60 * 24));
  }, [lastActivity]);

  const inactiveCards = cards.filter((c) => getDaysSinceActivity(c) >= 60);

  const filtered = cards
    .filter((c) => {
      if (filterMode === 'inactive') return getDaysSinceActivity(c) >= 60;
      return true;
    })
    .filter((c) => {
      const q = search.toLowerCase();
      return !q || c.name.toLowerCase().includes(q) || c.card_number.toLowerCase().includes(q) || c.phone.includes(q);
    })
    .sort((a, b) => {
      if (filterMode === 'inactive') return getDaysSinceActivity(b) - getDaysSinceActivity(a);
      if (sortBy === 'name') return a.name.localeCompare(b.name, 'ru');
      if (sortBy === 'vr') return b.vr_tokens - a.vr_tokens;
      if (sortBy === 'auto') return b.auto_tokens - a.auto_tokens;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  const totalVr = cards.reduce((s, c) => s + c.vr_tokens, 0);
  const totalAuto = cards.reduce((s, c) => s + c.auto_tokens, 0);

  return (
    <div style={{ background: '#010014', minHeight: '100vh' }}>
      {/* Background grid */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(0,245,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(0,245,255,0.025) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          zIndex: 0,
        }}
      />

      {/* Top bar */}
      <div
        className="sticky top-0 z-40 flex items-center justify-between px-4 md:px-6 h-14"
        style={{ background: 'rgba(1,0,20,0.98)', borderBottom: '1px solid rgba(0,245,255,0.1)' }}
      >
        <Link to="/loyalty" className="flex items-center gap-2 cursor-pointer">
          <i className="ri-arrow-left-line text-sm" style={{ color: '#00f5ff' }} />
          <span className="font-orbitron text-xs font-bold tracking-wider" style={{ color: '#00f5ff' }}>КАРТА ЛОЯЛЬНОСТИ</span>
        </Link>
        <div className="flex items-center gap-2">
          <i className="ri-database-2-line text-xs" style={{ color: '#ff006e' }} />
          <span className="font-orbitron font-bold text-white tracking-widest" style={{ fontSize: '10px' }}>БАЗА КЛИЕНТОВ</span>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 py-8">
        {/* PIN Gate */}
        {!unlocked ? (
          <div className="min-h-[60vh] flex items-center justify-center">
            <div className="w-full max-w-sm">
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(255,0,110,0.1)', border: '2px solid rgba(255,0,110,0.4)' }}>
                  <i className="ri-database-lock-line text-2xl" style={{ color: '#ff006e' }} />
                </div>
                <h1 className="font-orbitron font-black text-xl text-white tracking-wider mb-2">ADMIN ПАНЕЛЬ</h1>
                {clientParam ? (
                  <div className="mt-3 px-4 py-3 rounded-lg" style={{ background: 'rgba(0,245,255,0.07)', border: '1px solid rgba(0,245,255,0.3)' }}>
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <i className="ri-qr-scan-line text-sm" style={{ color: '#00f5ff' }} />
                      <span className="font-orbitron font-bold text-xs tracking-wider" style={{ color: '#00f5ff' }}>QR-код клиента считан</span>
                    </div>
                    <p className="font-mono-tech text-white/40 text-xs">Введите PIN — карта откроется автоматически</p>
                    <p className="font-mono-tech mt-1" style={{ fontSize: '9px', color: 'rgba(0,245,255,0.5)' }}>{clientParam}</p>
                  </div>
                ) : (
                  <p className="font-rajdhani text-white/40 text-sm">Введите PIN для просмотра всех карт</p>
                )}
              </div>
              <form
                onSubmit={handlePinSubmit}
                className="rounded-xl p-6 relative overflow-hidden"
                style={{ background: 'rgba(1,0,20,0.92)', border: '1px solid rgba(255,0,110,0.3)' }}
              >
                <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #ff006e, transparent)' }} />
                <div className="mb-4">
                  <label className="font-mono-tech text-xs text-white/40 block mb-1.5" style={{ fontSize: '10px', letterSpacing: '1px' }}>PIN-КОД АДМИНИСТРАТОРА</label>
                  <input
                    type="password"
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    className="cyber-input w-full"
                    placeholder="Введите PIN..."
                    autoComplete="off"
                    required
                  />
                </div>
                {pinError && (
                  <div className="mb-3 px-3 py-2 rounded font-rajdhani text-sm" style={{ background: 'rgba(255,0,110,0.08)', border: '1px solid rgba(255,0,110,0.25)', color: '#ff006e' }}>
                    {pinError}
                  </div>
                )}
                <button type="submit" disabled={!pinInput.trim() || pinLoading} className="btn-cyber-pink w-full py-3 rounded-sm text-xs font-orbitron disabled:opacity-40 disabled:cursor-not-allowed">
                  {pinLoading
                    ? <><i className="ri-loader-4-line mr-2 animate-spin" />Проверка...</>
                    : <><i className="ri-lock-unlock-line mr-2" />Войти</>
                  }
                </button>
              </form>
            </div>
          </div>
        ) : (
          <>
            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {[
                { icon: 'ri-user-line', color: '#00f5ff', label: 'Клиентов', value: cards.length },
                { icon: 'ri-vr-line', color: '#00f5ff', label: 'VR-жетонов всего', value: totalVr },
                { icon: 'ri-steering-2-line', color: '#ff6600', label: 'Авто-жетонов всего', value: totalAuto },
                { icon: 'ri-sleep-line', color: '#f59e0b', label: 'Неактивных (60+ дней)', value: activityLoading ? '...' : inactiveCards.length },
              ].map((s) => (
                <div
                  key={s.label}
                  className={`rounded-lg p-4 relative overflow-hidden transition-all ${s.label.startsWith('Неактивных') ? 'cursor-pointer hover:scale-[1.02]' : ''}`}
                  style={{ background: 'rgba(1,0,20,0.9)', border: `1px solid ${s.color}20` }}
                  onClick={s.label.startsWith('Неактивных') ? () => setFilterMode(filterMode === 'inactive' ? 'all' : 'inactive') : undefined}
                >
                  <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${s.color}, transparent)` }} />
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 flex items-center justify-center rounded-sm" style={{ background: `${s.color}15`, border: `1px solid ${s.color}30` }}>
                      <i className={`${s.icon} text-xs`} style={{ color: s.color }} />
                    </div>
                  </div>
                  <div className="font-orbitron font-black text-2xl text-white">{s.value}</div>
                  <div className="font-mono-tech text-white/30 mt-0.5" style={{ fontSize: '9px' }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Filter tabs */}
            <div className="flex items-center gap-2 mb-4">
              <button
                onClick={() => setFilterMode('all')}
                className="px-4 py-1.5 rounded-full font-orbitron font-bold text-xs cursor-pointer transition-all whitespace-nowrap"
                style={{
                  background: filterMode === 'all' ? 'rgba(0,245,255,0.15)' : 'transparent',
                  border: `1px solid ${filterMode === 'all' ? 'rgba(0,245,255,0.5)' : 'rgba(255,255,255,0.1)'}`,
                  color: filterMode === 'all' ? '#00f5ff' : 'rgba(255,255,255,0.3)',
                }}
              >
                <i className="ri-team-line mr-1.5" />
                Все клиенты
                <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-white/50" style={{ fontSize: '9px', background: 'rgba(255,255,255,0.08)' }}>
                  {cards.length}
                </span>
              </button>
              <button
                onClick={() => setFilterMode('inactive')}
                className="px-4 py-1.5 rounded-full font-orbitron font-bold text-xs cursor-pointer transition-all whitespace-nowrap"
                style={{
                  background: filterMode === 'inactive' ? 'rgba(245,158,11,0.15)' : 'transparent',
                  border: `1px solid ${filterMode === 'inactive' ? 'rgba(245,158,11,0.5)' : 'rgba(255,255,255,0.1)'}`,
                  color: filterMode === 'inactive' ? '#f59e0b' : 'rgba(255,255,255,0.3)',
                }}
              >
                <i className="ri-sleep-line mr-1.5" />
                Неактивные
                <span
                  className="ml-1.5 px-1.5 py-0.5 rounded-full font-bold"
                  style={{
                    fontSize: '9px',
                    background: inactiveCards.length > 0 ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.08)',
                    color: inactiveCards.length > 0 ? '#f59e0b' : 'rgba(255,255,255,0.3)',
                  }}
                >
                  {activityLoading ? '...' : inactiveCards.length}
                </span>
              </button>
            </div>

            {/* Inactive mode info banner */}
            {filterMode === 'inactive' && !activityLoading && (
              <div
                className="rounded-lg px-4 py-3 mb-4 flex items-start gap-3"
                style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.25)' }}
              >
                <div className="w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <i className="ri-alarm-warning-line text-sm" style={{ color: '#f59e0b' }} />
                </div>
                <div>
                  <div className="font-orbitron font-bold text-xs mb-0.5" style={{ color: '#f59e0b' }}>
                    ФИЛЬТР: НЕАКТИВНЫЕ КАРТЫ
                  </div>
                  <div className="font-rajdhani text-white/40 text-xs leading-relaxed">
                    Показаны карты без посещений 60 и более дней. Карты без активности 90+ дней удаляются автоматически. Отсортировано по убыванию дней неактивности.
                  </div>
                </div>
              </div>
            )}

            {/* Search + sort + refresh */}
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
              <div className="relative flex-1">
                <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Поиск по имени, номеру карты или телефону..."
                  className="cyber-input w-full pl-9 text-sm"
                />
              </div>
              <div className="flex gap-2 flex-shrink-0">
                {filterMode === 'all' && (
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                    className="cyber-input text-xs cursor-pointer"
                    style={{ minWidth: '140px' }}
                  >
                    <option value="date">По дате (новые)</option>
                    <option value="name">По имени</option>
                    <option value="vr">VR жетоны ↓</option>
                    <option value="auto">Авто жетоны ↓</option>
                  </select>
                )}
                <button
                  onClick={() => { loadCards(); loadLastActivity(); }}
                  disabled={dataLoading || activityLoading}
                  className="btn-cyber-cyan px-4 py-2 rounded-sm text-xs whitespace-nowrap disabled:opacity-60"
                >
                  {(dataLoading || activityLoading)
                    ? <i className="ri-loader-4-line animate-spin" />
                    : <><i className="ri-refresh-line mr-1" />Обновить</>
                  }
                </button>
              </div>
            </div>

            {/* Cards list */}
            {dataLoading && cards.length === 0 ? (
              <div className="text-center py-16">
                <i className="ri-loader-4-line text-3xl animate-spin block mb-3" style={{ color: '#00f5ff' }} />
                <p className="font-mono-tech text-white/30 text-xs tracking-widest">ЗАГРУЗКА ДАННЫХ...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16">
                {filterMode === 'inactive' ? (
                  <>
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
                      <i className="ri-checkbox-circle-line text-2xl" style={{ color: '#f59e0b' }} />
                    </div>
                    <p className="font-orbitron font-bold text-sm mb-1" style={{ color: '#f59e0b' }}>Неактивных карт нет</p>
                    <p className="font-rajdhani text-white/30 text-sm">Все клиенты посещали клуб в последние 60 дней</p>
                  </>
                ) : (
                  <>
                    <i className="ri-user-search-line text-3xl text-white/15 block mb-3" />
                    <p className="font-rajdhani text-white/30 text-sm">{search ? 'Ничего не найдено' : 'Карт пока нет'}</p>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {filtered.map((c) => {
                  const isExpanded = expandedCard === c.card_number;
                  const cardHistory = history[c.card_number];
                  const vrReady = c.vr_tokens >= 5;
                  const autoReady = c.auto_tokens >= 3;
                  const joinedDate = new Date(c.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });
                  const daysInactive = getDaysSinceActivity(c);
                  const isInactiveWarning = daysInactive >= 60;
                  const isInactiveCritical = daysInactive >= 80;

                  return (
                    <div
                      key={c.card_number}
                      className="rounded-lg overflow-hidden transition-all duration-300"
                      style={{
                        background: 'rgba(1,0,20,0.9)',
                        border: `1px solid ${isExpanded ? 'rgba(0,245,255,0.3)' : isInactiveCritical ? 'rgba(245,158,11,0.25)' : isInactiveWarning ? 'rgba(245,158,11,0.15)' : 'rgba(0,245,255,0.1)'}`,
                      }}
                    >
                      {/* Card header */}
                      <div
                        className="flex items-center gap-3 px-4 py-3.5 cursor-pointer hover:bg-white/[0.02] transition-colors"
                        onClick={() => loadHistory(c.card_number)}
                      >
                        {/* Avatar */}
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-orbitron font-black text-sm"
                          style={{ background: 'rgba(0,245,255,0.08)', border: '1px solid rgba(0,245,255,0.3)', color: '#00f5ff' }}
                        >
                          {c.name.charAt(0).toUpperCase()}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-orbitron font-bold text-white text-sm">{c.name}</span>
                            {(vrReady || autoReady) && (
                              <span className="px-1.5 py-0.5 rounded-full font-orbitron font-bold animate-pulse" style={{ fontSize: '8px', background: 'rgba(255,0,110,0.15)', border: '1px solid rgba(255,0,110,0.4)', color: '#ff006e' }}>
                                НАГРАДА
                              </span>
                            )}
                            {isInactiveWarning && (
                              <span
                                className="px-1.5 py-0.5 rounded-full font-orbitron font-bold"
                                style={{
                                  fontSize: '8px',
                                  background: isInactiveCritical ? 'rgba(245,158,11,0.2)' : 'rgba(245,158,11,0.1)',
                                  border: `1px solid ${isInactiveCritical ? 'rgba(245,158,11,0.5)' : 'rgba(245,158,11,0.3)'}`,
                                  color: '#f59e0b',
                                }}
                              >
                                {isInactiveCritical ? <><i className="ri-alarm-warning-line mr-0.5" />КРИТИЧНО</> : <><i className="ri-sleep-line mr-0.5" />НЕАКТИВНА</>}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                            <span className="font-mono-tech text-white/30" style={{ fontSize: '10px' }}>{c.card_number}</span>
                            {c.phone && <span className="font-rajdhani text-white/40 text-xs">{c.phone}</span>}
                            <span className="font-mono-tech text-white/20" style={{ fontSize: '9px' }}>с {joinedDate}</span>
                            {isInactiveWarning && (
                              <span
                                className="font-mono-tech font-bold"
                                style={{ fontSize: '9px', color: isInactiveCritical ? '#f59e0b' : 'rgba(245,158,11,0.6)' }}
                              >
                                <i className="ri-time-line mr-0.5" />{daysInactive} дн. без визита
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Tokens */}
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <div className="text-center">
                            <div className="font-orbitron font-black text-base leading-none" style={{ color: vrReady ? '#00f5ff' : 'rgba(0,245,255,0.5)' }}>{c.vr_tokens}</div>
                            <div className="font-mono-tech text-white/25 mt-0.5" style={{ fontSize: '8px' }}>VR</div>
                          </div>
                          <div className="w-px h-6" style={{ background: 'rgba(255,255,255,0.08)' }} />
                          <div className="text-center">
                            <div className="font-orbitron font-black text-base leading-none" style={{ color: autoReady ? '#ff6600' : 'rgba(255,102,0,0.5)' }}>{c.auto_tokens}</div>
                            <div className="font-mono-tech text-white/25 mt-0.5" style={{ fontSize: '8px' }}>АВТО</div>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); setDetailCard(c.card_number); }}
                            className="ml-1 px-3 py-1.5 rounded-sm font-orbitron font-bold cursor-pointer transition-all hover:scale-105 whitespace-nowrap"
                            style={{ fontSize: '9px', background: 'rgba(0,245,255,0.08)', border: '1px solid rgba(0,245,255,0.3)', color: '#00f5ff' }}
                          >
                            <i className="ri-settings-3-line mr-1" />Подробнее
                          </button>
                          <div className="w-5 h-5 flex items-center justify-center text-white/30 ml-0">
                            {historyLoading === c.card_number
                              ? <i className="ri-loader-4-line text-xs animate-spin" />
                              : <i className={`ri-arrow-${isExpanded ? 'up' : 'down'}-s-line text-sm`} />
                            }
                          </div>
                        </div>
                      </div>

                      {/* Expanded history */}
                      {isExpanded && (
                        <div style={{ borderTop: '1px solid rgba(0,245,255,0.08)' }}>
                          {/* Stats bar */}
                          <div className="px-4 py-3 flex items-center gap-4 flex-wrap" style={{ background: 'rgba(0,245,255,0.02)' }}>
                            {[
                              { label: 'VR сессий', value: c.vr_sessions, color: '#00f5ff' },
                              { label: 'Авто сессий', value: c.auto_sessions, color: '#ff6600' },
                              { label: 'VR жетонов', value: c.vr_tokens, color: '#00f5ff' },
                              { label: 'Авто жетонов', value: c.auto_tokens, color: '#ff6600' },
                            ].map((s) => (
                              <div key={s.label} className="flex items-center gap-1.5">
                                <span className="font-mono-tech text-white/30" style={{ fontSize: '9px' }}>{s.label}:</span>
                                <span className="font-orbitron font-bold text-xs" style={{ color: s.color }}>{s.value}</span>
                              </div>
                            ))}
                          </div>

                          {/* History entries */}
                          <div className="px-4 pb-4 pt-2">
                            <div className="font-mono-tech text-white/20 text-xs tracking-widest mb-2">ИСТОРИЯ ВИЗИТОВ</div>
                            {!cardHistory || cardHistory.length === 0 ? (
                              <div className="text-center py-4 font-rajdhani text-white/25 text-sm">История пуста</div>
                            ) : (
                              <div className="space-y-1.5 max-h-56 overflow-y-auto">
                                {cardHistory.map((h) => {
                                  const isReward = h.type === 'REWARD_VR' || h.type === 'REWARD_AUTO';
                                  const isVr = h.type === 'VR' || h.type === 'REWARD_VR';
                                  const color = isReward ? '#ff006e' : isVr ? '#00f5ff' : '#ff6600';
                                  const icon = isReward ? 'ri-gift-line' : isVr ? 'ri-vr-line' : 'ri-steering-2-line';
                                  const dateStr = new Date(h.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
                                  return (
                                    <div key={h.id} className="flex items-center gap-2.5 py-2 px-3 rounded-md" style={{ background: 'rgba(1,0,20,0.6)', border: `1px solid ${color}12` }}>
                                      <div className="w-6 h-6 flex items-center justify-center rounded-sm flex-shrink-0" style={{ background: `${color}10`, border: `1px solid ${color}25` }}>
                                        <i className={`${icon} text-xs`} style={{ color }} />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="font-rajdhani text-white/70 text-xs truncate">{h.description}</div>
                                        <div className="font-mono-tech text-white/25 mt-0.5" style={{ fontSize: '9px' }}>{dateStr}</div>
                                      </div>
                                      <div className="font-orbitron font-bold text-xs flex-shrink-0" style={{ color: h.tokens > 0 ? '#00f5ff' : '#ff006e' }}>
                                        {h.tokens > 0 ? `+${h.tokens}` : h.tokens}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {filtered.length > 0 && (
              <div className="mt-4 text-center font-mono-tech text-white/20 text-xs">
                Показано {filtered.length} из {filterMode === 'inactive' ? inactiveCards.length : cards.length} карт
                {filterMode === 'inactive' && <span className="ml-2" style={{ color: 'rgba(245,158,11,0.4)' }}>• отсортировано по неактивности</span>}
              </div>
            )}
          </>
        )}
      </div>

      {/* Client Detail Modal */}
      {detailCard && unlocked && (
        <ClientDetailModal
          cardNumber={detailCard}
          adminPin={pinInput}
          onClose={() => setDetailCard(null)}
          onRefresh={loadCards}
          validatePin={validatePin}
        />
      )}
    </div>
  );
};

export default AdminCardsPage;
