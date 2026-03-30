import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { getCardTier } from '../hooks/useLoyalty';

const ADMIN_LOGIN = 'admin';
const ADMIN_PASSWORD = '02191988';

interface CardFull {
  card_number: string;
  name: string;
  phone: string;
  email: string;
  vr_tokens: number;
  auto_tokens: number;
  vr_sessions: number;
  auto_sessions: number;
  vr_hours: number;
  stickers: number;
  created_at: string;
}

type Tab = 'info' | 'sticker' | 'token' | 'reset';

const AdminScanPage = () => {
  const [params] = useSearchParams();
  const cardNumber = params.get('card') || '';

  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');
  const [authed, setAuthed] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const [card, setCard] = useState<CardFull | null>(null);
  const [cardLoading, setCardLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('info');

  // Sticker
  const [stickerHours, setStickerHours] = useState('1');
  const [stickerLoading, setStickerLoading] = useState(false);
  const [stickerMsg, setStickerMsg] = useState('');

  // Token
  const [tokenType, setTokenType] = useState<'VR' | 'AUTO'>('VR');
  const [tokenLoading, setTokenLoading] = useState(false);
  const [tokenMsg, setTokenMsg] = useState('');

  // Reset
  const [resetCode, setResetCode] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMsg, setResetMsg] = useState('');

  const loadCard = useCallback(async () => {
    if (!cardNumber) return;
    setCardLoading(true);
    const { data } = await supabase
      .from('loyalty_cards')
      .select('card_number,name,phone,email,vr_tokens,auto_tokens,vr_sessions,auto_sessions,vr_hours,stickers,created_at')
      .eq('card_number', cardNumber)
      .maybeSingle();
    setCardLoading(false);
    if (data) setCard(data as CardFull);
  }, [cardNumber]);

  useEffect(() => { if (authed) loadCard(); }, [authed, loadCard]);

  const handleLogin = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (loginUser.trim() === ADMIN_LOGIN && loginPass === ADMIN_PASSWORD) {
      setAuthed(true);
      setLoginError('');
    } else {
      setLoginError('Неверный логин или пароль');
      setTimeout(() => setLoginError(''), 2500);
    }
  }, [loginUser, loginPass]);

  const handleAddSticker = useCallback(async () => {
    if (!card || stickerLoading) return;
    const hours = parseFloat(stickerHours) || 1;
    setStickerLoading(true);
    const GOAL = 10;
    const next = (card.stickers || 0) + 1;
    const completed = next >= GOAL;
    const { error } = await supabase.from('loyalty_cards').update({
      stickers: completed ? 0 : next,
      vr_hours: (card.vr_hours || 0) + hours,
      vr_sessions: (card.vr_sessions || 0) + 1,
    }).eq('card_number', card.card_number);
    await supabase.from('loyalty_history').insert({
      card_number: card.card_number, type: 'VR',
      description: completed ? `VR ${hours}ч — карта заполнена! [Скан]` : `VR ${hours}ч — наклейка [Скан]`,
      tokens: 1,
    });
    setStickerLoading(false);
    setStickerMsg(error ? 'Ошибка' : completed ? 'Карточка заполнена! 🎉' : `Наклейка добавлена (${next}/${GOAL})`);
    if (!error) loadCard();
    setTimeout(() => setStickerMsg(''), 4000);
  }, [card, stickerLoading, stickerHours, loadCard]);

  const handleAddToken = useCallback(async () => {
    if (!card || tokenLoading) return;
    setTokenLoading(true);
    const isVr = tokenType === 'VR';
    const fields = isVr
      ? { vr_tokens: (card.vr_tokens || 0) + 1, vr_sessions: (card.vr_sessions || 0) + 1 }
      : { auto_tokens: (card.auto_tokens || 0) + 1, auto_sessions: (card.auto_sessions || 0) + 1 };
    const { error } = await supabase.from('loyalty_cards').update(fields).eq('card_number', card.card_number);
    await supabase.from('loyalty_history').insert({
      card_number: card.card_number, type: tokenType,
      description: isVr ? 'VR-сессия [Скан администратора]' : 'Автосимулятор [Скан администратора]',
      tokens: 1,
    });
    setTokenLoading(false);
    setTokenMsg(error ? 'Ошибка' : `+1 жетон ${tokenType} начислен`);
    if (!error) loadCard();
    setTimeout(() => setTokenMsg(''), 3500);
  }, [card, tokenLoading, tokenType, loadCard]);

  const handleGenerateReset = useCallback(async () => {
    if (!card || resetLoading) return;
    setResetLoading(true);
    const code = String(Math.floor(1000 + Math.random() * 9000));
    const { error } = await supabase.from('loyalty_cards').update({ reset_code: code }).eq('card_number', card.card_number);
    setResetLoading(false);
    if (!error) { setResetCode(code); setResetMsg('Код сгенерирован — назовите клиенту'); }
    else setResetMsg('Ошибка генерации кода');
  }, [card, resetLoading]);

  const tier = card ? getCardTier(card.vr_hours || 0) : null;

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'info', label: 'Профиль', icon: 'ri-user-line' },
    { id: 'sticker', label: 'Наклейка', icon: 'ri-bookmark-fill' },
    { id: 'token', label: 'Жетон', icon: 'ri-coin-line' },
    { id: 'reset', label: 'Пароль', icon: 'ri-lock-unlock-line' },
  ];

  return (
    <div style={{ background: '#010014', minHeight: '100vh' }}>
      <div className="fixed inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(0,245,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(0,245,255,0.025) 1px, transparent 1px)', backgroundSize: '60px 60px', zIndex: 0 }} />

      {/* Top bar */}
      <div className="sticky top-0 z-40 flex items-center justify-between px-4 h-14" style={{ background: 'rgba(1,0,20,0.98)', borderBottom: '1px solid rgba(0,245,255,0.1)' }}>
        <Link to="/loyalty" className="flex items-center gap-2 cursor-pointer">
          <i className="ri-arrow-left-line text-sm" style={{ color: '#00f5ff' }} />
          <span className="font-orbitron text-xs font-bold tracking-wider" style={{ color: '#00f5ff' }}>PARADOX VR</span>
        </Link>
        <div className="flex items-center gap-2">
          <i className="ri-qr-scan-line text-xs" style={{ color: '#9b4dff' }} />
          <span className="font-orbitron font-bold text-white tracking-widest" style={{ fontSize: '10px' }}>QR-СКАН АДМИНИСТРАТОРА</span>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto px-4 py-8">
        {!authed ? (
          <div className="min-h-[60vh] flex items-center justify-center">
            <div className="w-full">
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(155,77,255,0.1)', border: '2px solid rgba(155,77,255,0.4)' }}>
                  <i className="ri-qr-scan-2-line text-2xl" style={{ color: '#9b4dff' }} />
                </div>
                <h1 className="font-orbitron font-black text-xl text-white tracking-wider mb-2">ВХОД ДЛЯ АДМИНИСТРАТОРА</h1>
                <p className="font-rajdhani text-white/40 text-sm">Введите данные для управления картой клиента</p>
                {cardNumber && (
                  <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: 'rgba(155,77,255,0.08)', border: '1px solid rgba(155,77,255,0.25)' }}>
                    <i className="ri-bank-card-line text-xs" style={{ color: '#9b4dff' }} />
                    <span className="font-mono-tech text-xs" style={{ color: '#9b4dff' }}>{cardNumber}</span>
                  </div>
                )}
              </div>
              <form onSubmit={handleLogin} className="rounded-xl p-6 relative overflow-hidden space-y-4" style={{ background: 'rgba(1,0,20,0.92)', border: '1px solid rgba(155,77,255,0.3)' }}>
                <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #9b4dff, transparent)' }} />
                <div>
                  <label className="font-mono-tech text-xs text-white/40 block mb-1.5" style={{ fontSize: '10px', letterSpacing: '1px' }}>ЛОГИН</label>
                  <input type="text" value={loginUser} onChange={(e) => setLoginUser(e.target.value)} className="cyber-input w-full" placeholder="admin" required autoComplete="username" />
                </div>
                <div>
                  <label className="font-mono-tech text-xs text-white/40 block mb-1.5" style={{ fontSize: '10px', letterSpacing: '1px' }}>ПАРОЛЬ</label>
                  <div className="relative">
                    <input type={showPass ? 'text' : 'password'} value={loginPass} onChange={(e) => setLoginPass(e.target.value)} className="cyber-input w-full pr-10" placeholder="Пароль" required autoComplete="current-password" />
                    <button type="button" onClick={() => setShowPass((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center cursor-pointer text-white/30 hover:text-white/60 transition-colors">
                      <i className={showPass ? 'ri-eye-off-line text-sm' : 'ri-eye-line text-sm'} />
                    </button>
                  </div>
                </div>
                {loginError && (
                  <div className="px-3 py-2 rounded font-rajdhani text-sm" style={{ background: 'rgba(255,0,110,0.08)', border: '1px solid rgba(255,0,110,0.25)', color: '#ff006e' }}>{loginError}</div>
                )}
                <button type="submit" className="w-full py-3 rounded-sm text-xs font-orbitron font-bold cursor-pointer whitespace-nowrap" style={{ background: 'rgba(155,77,255,0.15)', border: '1px solid rgba(155,77,255,0.5)', color: '#9b4dff' }}>
                  <i className="ri-lock-unlock-line mr-2" />Войти
                </button>
              </form>
            </div>
          </div>
        ) : cardLoading ? (
          <div className="flex items-center justify-center min-h-[50vh]">
            <i className="ri-loader-4-line text-4xl animate-spin" style={{ color: '#00f5ff' }} />
          </div>
        ) : !card ? (
          <div className="text-center py-16">
            <i className="ri-error-warning-line text-4xl text-white/20 block mb-3" />
            <p className="font-rajdhani text-white/40">Карта не найдена: {cardNumber}</p>
          </div>
        ) : (
          <>
            {/* Card header */}
            <div className="rounded-xl p-5 mb-6 relative overflow-hidden" style={{ background: 'rgba(1,0,20,0.9)', border: `1px solid ${tier?.borderColor ?? 'rgba(0,245,255,0.3)'}` }}>
              <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${tier?.color ?? '#00f5ff'}, transparent)` }} />
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full flex items-center justify-center font-orbitron font-black text-xl flex-shrink-0" style={{ background: `${tier?.color ?? '#00f5ff'}15`, border: `2px solid ${tier?.color ?? '#00f5ff'}40`, color: tier?.color ?? '#00f5ff' }}>
                  {card.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-orbitron font-black text-white text-lg">{card.name}</div>
                  <div className="font-rajdhani text-white/50 text-sm mt-0.5">{card.phone}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-mono-tech text-white/25" style={{ fontSize: '9px' }}>{card.card_number}</span>
                    {tier && <span className="font-orbitron font-bold px-2 py-0.5 rounded-full" style={{ fontSize: '8px', background: `${tier.color}15`, color: tier.color, border: `1px solid ${tier.color}30` }}>{tier.name}</span>}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                {[
                  { label: 'VR Жетоны', value: `${card.vr_tokens}/5`, color: '#00f5ff' },
                  { label: 'Авто Жетоны', value: `${card.auto_tokens}/3`, color: '#ff6600' },
                  { label: 'VR Часов', value: card.vr_hours, color: '#4ade80' },
                ].map((s) => (
                  <div key={s.label} className="text-center">
                    <div className="font-orbitron font-black text-lg" style={{ color: s.color }}>{s.value}</div>
                    <div className="font-mono-tech text-white/25" style={{ fontSize: '8px' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-5 rounded-lg p-1" style={{ background: 'rgba(0,245,255,0.04)', border: '1px solid rgba(0,245,255,0.1)' }}>
              {tabs.map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className="flex-1 py-2.5 rounded-md font-orbitron font-bold cursor-pointer whitespace-nowrap transition-all"
                  style={{ fontSize: '8px', background: activeTab === tab.id ? 'rgba(0,245,255,0.12)' : 'transparent', color: activeTab === tab.id ? '#00f5ff' : 'rgba(255,255,255,0.3)', border: activeTab === tab.id ? '1px solid rgba(0,245,255,0.3)' : '1px solid transparent' }}
                >
                  <i className={`${tab.icon} mr-1`} />{tab.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="rounded-xl p-5 space-y-4" style={{ background: 'rgba(1,0,20,0.9)', border: '1px solid rgba(0,245,255,0.1)' }}>

              {activeTab === 'info' && (
                <>
                  {[
                    { icon: 'ri-vr-line', label: 'VR-сессий', value: card.vr_sessions, color: '#00f5ff' },
                    { icon: 'ri-steering-2-line', label: 'Авто-сессий', value: card.auto_sessions, color: '#ff6600' },
                    { icon: 'ri-time-line', label: 'Часов VR', value: card.vr_hours, color: '#4ade80' },
                    { icon: 'ri-bookmark-fill', label: 'Наклейки', value: `${card.stickers}/10`, color: '#ffd700' },
                    { icon: 'ri-mail-line', label: 'Email', value: card.email || '—', color: '#9b4dff' },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center justify-between py-2 px-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 flex items-center justify-center rounded-sm" style={{ background: `${row.color}12`, border: `1px solid ${row.color}25` }}>
                          <i className={`${row.icon} text-xs`} style={{ color: row.color }} />
                        </div>
                        <span className="font-rajdhani text-white/50 text-sm">{row.label}</span>
                      </div>
                      <span className="font-orbitron font-bold text-sm" style={{ color: row.color }}>{row.value}</span>
                    </div>
                  ))}
                </>
              )}

              {activeTab === 'sticker' && (
                <>
                  <div className="rounded-lg p-3" style={{ background: 'rgba(255,215,0,0.06)', border: '1px solid rgba(255,215,0,0.2)' }}>
                    <p className="font-rajdhani text-white/60 text-xs leading-relaxed">Добавить VR-наклейку на карточку клиента. Укажите количество отыгранных часов.</p>
                  </div>
                  <div className="flex items-center gap-3 py-2 px-3 rounded-lg" style={{ background: 'rgba(255,215,0,0.05)', border: '1px solid rgba(255,215,0,0.2)' }}>
                    <i className="ri-bookmark-fill" style={{ color: '#ffd700' }} />
                    <span className="font-rajdhani text-white/60 text-sm">Текущие наклейки: <strong style={{ color: '#ffd700' }}>{card.stickers}/10</strong></span>
                  </div>
                  <div>
                    <label className="font-mono-tech text-xs text-white/40 block mb-1.5" style={{ fontSize: '10px', letterSpacing: '1px' }}>ЧАСОВ ОТЫГРАНО</label>
                    <input type="number" min="0.5" step="0.5" value={stickerHours} onChange={(e) => setStickerHours(e.target.value)} className="cyber-input w-full text-sm" />
                  </div>
                  {stickerMsg && <div className="px-3 py-2 rounded font-rajdhani text-sm" style={{ background: 'rgba(255,215,0,0.08)', border: '1px solid rgba(255,215,0,0.3)', color: '#ffd700' }}>{stickerMsg}</div>}
                  <button onClick={handleAddSticker} disabled={stickerLoading} className="w-full py-4 rounded-sm font-orbitron font-bold text-xs cursor-pointer disabled:opacity-50 whitespace-nowrap" style={{ background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.45)', color: '#ffd700' }}>
                    {stickerLoading ? <><i className="ri-loader-4-line mr-2 animate-spin" />Добавление...</> : <><i className="ri-bookmark-fill mr-2" />Добавить наклейку</>}
                  </button>
                </>
              )}

              {activeTab === 'token' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    {(['VR', 'AUTO'] as const).map((t) => (
                      <button key={t} onClick={() => setTokenType(t)}
                        className="py-4 rounded-lg font-orbitron font-bold text-xs cursor-pointer transition-all"
                        style={{ background: tokenType === t ? (t === 'VR' ? 'rgba(0,245,255,0.15)' : 'rgba(255,102,0,0.15)') : 'rgba(255,255,255,0.03)', border: `2px solid ${tokenType === t ? (t === 'VR' ? '#00f5ff' : '#ff6600') : 'rgba(255,255,255,0.08)'}`, color: tokenType === t ? (t === 'VR' ? '#00f5ff' : '#ff6600') : 'rgba(255,255,255,0.35)' }}
                      >
                        <i className={`${t === 'VR' ? 'ri-vr-line' : 'ri-steering-2-line'} text-lg block mb-1`} />
                        {t === 'VR' ? `VR (${card.vr_tokens}/5)` : `Авто (${card.auto_tokens}/3)`}
                      </button>
                    ))}
                  </div>
                  {tokenMsg && <div className="px-3 py-2 rounded font-rajdhani text-sm" style={{ background: 'rgba(0,245,255,0.08)', border: '1px solid rgba(0,245,255,0.25)', color: '#00f5ff' }}>{tokenMsg}</div>}
                  <button onClick={handleAddToken} disabled={tokenLoading} className="btn-cyber-cyan w-full py-4 rounded-sm text-xs font-orbitron disabled:opacity-50 whitespace-nowrap">
                    {tokenLoading ? <><i className="ri-loader-4-line mr-2 animate-spin" />Начисление...</> : <><i className="ri-add-circle-line mr-2" />Начислить жетон {tokenType}</>}
                  </button>
                </>
              )}

              {activeTab === 'reset' && (
                <>
                  <div className="rounded-lg p-3" style={{ background: 'rgba(255,165,0,0.06)', border: '1px solid rgba(255,165,0,0.2)' }}>
                    <p className="font-rajdhani text-white/60 text-xs leading-relaxed">Нажмите кнопку и назовите клиенту 4-значный код. Клиент использует его на странице входа для сброса пароля.</p>
                  </div>
                  <button onClick={handleGenerateReset} disabled={resetLoading}
                    className="w-full py-4 rounded-sm font-orbitron font-bold text-xs cursor-pointer disabled:opacity-50 whitespace-nowrap"
                    style={{ background: 'rgba(255,165,0,0.12)', border: '1px solid rgba(255,165,0,0.45)', color: '#ffa500' }}
                  >
                    {resetLoading ? <><i className="ri-loader-4-line mr-2 animate-spin" />Генерация...</> : <><i className="ri-refresh-line mr-2" />Сгенерировать код сброса</>}
                  </button>
                  {resetCode && (
                    <div className="rounded-lg p-5 text-center relative overflow-hidden" style={{ background: 'rgba(255,165,0,0.06)', border: '2px solid rgba(255,165,0,0.6)' }}>
                      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #ffa500, transparent)' }} />
                      <div className="font-mono-tech text-white/35 text-xs tracking-widest mb-2">КОД СБРОСА ПАРОЛЯ</div>
                      <div className="font-orbitron font-black tracking-[0.4em] mb-2" style={{ fontSize: '52px', color: '#ffa500', textShadow: '0 0 30px rgba(255,165,0,0.6)' }}>{resetCode}</div>
                      <div className="font-rajdhani text-white/45 text-sm">Назовите клиенту этот код</div>
                    </div>
                  )}
                  {resetMsg && !resetCode && <div className="px-3 py-2 rounded font-rajdhani text-sm" style={{ background: 'rgba(255,165,0,0.08)', border: '1px solid rgba(255,165,0,0.3)', color: '#ffa500' }}>{resetMsg}</div>}
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminScanPage;
