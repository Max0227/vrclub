import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { AdminCalendar, BookingCard, Booking, useBookings } from './components/AdminCalendar';
import BookingEditModal from './components/BookingEditModal';
import { getCardTier, CARD_TIERS, STICKER_GOAL } from '../loyalty/hooks/useLoyalty';

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = '02191988';
const SESSION_KEY = 'paradox_admin_auth';

// ── Login Screen ──────────────────────────────────────────────────────────────
const LoginScreen = ({ onLogin }: { onLogin: () => void }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, '1');
      onLogin();
    } else {
      setError('Неверное имя или пароль');
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#010014' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-10 flex items-center justify-center rounded-sm"
              style={{ border: '1px solid rgba(0,245,255,0.5)', background: 'rgba(0,245,255,0.08)' }}>
              <i className="ri-shield-keyhole-line text-xl" style={{ color: '#00f5ff' }} />
            </div>
          </div>
          <h1 className="font-orbitron font-black text-white text-xl tracking-widest mb-1">PARADOX</h1>
          <p className="font-mono-tech text-xs tracking-widest" style={{ color: 'rgba(0,245,255,0.6)' }}>ADMIN PANEL</p>
        </div>

        <div className="rounded-lg p-6" style={{ background: 'rgba(1,0,20,0.95)', border: '1px solid rgba(0,245,255,0.25)' }}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="admin-label">ИМЯ ПОЛЬЗОВАТЕЛЯ</label>
              <input
                type="text"
                value={username}
                onChange={e => { setUsername(e.target.value); setError(''); }}
                className="cyber-input"
                placeholder="paradox"
                autoComplete="username"
              />
            </div>
            <div>
              <label className="admin-label">ПАРОЛЬ</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  className="cyber-input pr-10"
                  placeholder="········"
                  autoComplete="current-password"
                  maxLength={8}
                />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-white/30 hover:text-white/70 transition-colors">
                  <i className={showPass ? 'ri-eye-off-line' : 'ri-eye-line'} style={{ fontSize: '14px' }} />
                </button>
              </div>
              {error && (
                <p className="mt-1.5 font-mono-tech text-xs" style={{ color: '#ff006e', fontSize: '10px' }}>
                  {error}
                </p>
              )}
            </div>
            <button type="submit"
              className="w-full py-3.5 rounded-sm text-sm font-orbitron font-bold flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
              style={{ background: 'rgba(0,245,255,0.12)', border: '1px solid rgba(0,245,255,0.5)', color: '#00f5ff' }}>
              <i className="ri-login-box-line" />
              Войти
            </button>
          </form>
        </div>

        <p className="text-center font-mono-tech text-xs mt-6" style={{ color: 'rgba(255,255,255,0.15)' }}>
          PARADOX VR CLUB · НОВОСИБИРСК
        </p>
      </div>

      <style>{`
        .admin-label {
          display: block;
          font-family: 'Rajdhani', sans-serif;
          font-size: 10px;
          letter-spacing: 1px;
          color: rgba(255,255,255,0.4);
          margin-bottom: 6px;
          text-transform: uppercase;
        }
        .cyber-input {
          width: 100%;
          background: rgba(0,245,255,0.03);
          border: 1px solid rgba(0,245,255,0.2);
          border-radius: 4px;
          padding: 10px 14px;
          font-size: 13px;
          color: rgba(255,255,255,0.9);
          outline: none;
          font-family: 'Rajdhani', sans-serif;
          transition: border-color 0.2s;
        }
        .cyber-input:focus {
          border-color: rgba(0,245,255,0.5);
          box-shadow: 0 0 0 3px rgba(0,245,255,0.06);
        }
      `}</style>
    </div>
  );
};

// ── Confirm Delete Dialog ─────────────────────────────────────────────────────
const ConfirmDialog = ({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: 'rgba(1,0,20,0.9)' }}>
    <div className="w-full max-w-sm rounded-lg p-6 text-center"
      style={{ background: '#06001e', border: '1px solid rgba(255,0,110,0.4)' }}>
      <div className="w-12 h-12 flex items-center justify-center rounded-full mx-auto mb-4"
        style={{ background: 'rgba(255,0,110,0.1)', border: '1px solid rgba(255,0,110,0.3)' }}>
        <i className="ri-delete-bin-line text-xl" style={{ color: '#ff006e' }} />
      </div>
      <h3 className="font-orbitron font-bold text-white text-sm mb-2">Удалить запись?</h3>
      <p className="font-rajdhani text-white/50 text-sm mb-6">Это действие нельзя отменить.</p>
      <div className="flex gap-3">
        <button onClick={onCancel} className="flex-1 py-2.5 rounded-sm text-sm font-rajdhani cursor-pointer"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}>
          Отмена
        </button>
        <button onClick={onConfirm} className="flex-1 py-2.5 rounded-sm text-sm font-rajdhani font-bold cursor-pointer"
          style={{ background: 'rgba(255,0,110,0.1)', border: '1px solid rgba(255,0,110,0.4)', color: '#ff006e' }}>
          Удалить
        </button>
      </div>
    </div>
  </div>
);

// ── Sticker Modal ──────────────────────────────────────────────────────────────
interface StickerModalProps {
  client: LoyaltyUser;
  onClose: () => void;
  onAdded: () => void;
}

const STICKER_HOUR_OPTIONS = [
  { label: '30 мин', value: 0.5 },
  { label: '1 час', value: 1 },
  { label: '2 часа', value: 2 },
  { label: '3 часа', value: 3 },
  { label: '4 часа', value: 4 },
];

const StickerModal = ({ client, onClose, onAdded }: StickerModalProps) => {
  const [hours, setHours] = useState(1);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ success: boolean; text: string } | null>(null);

  const tier = getCardTier((client.vr_hours ?? 0));
  const currentStickers = client.stickers ?? 0;
  const newStickers = currentStickers + 1 >= STICKER_GOAL ? 0 : currentStickers + 1;
  const cardCompletes = currentStickers + 1 >= STICKER_GOAL;
  const newVrHours = (client.vr_hours ?? 0) + hours;
  const newTier = getCardTier(newVrHours);

  const handleAdd = async () => {
    setLoading(true);
    const finalStickers = cardCompletes ? 0 : currentStickers + 1;
    const { error } = await supabase
      .from('loyalty_cards')
      .update({
        stickers: finalStickers,
        vr_hours: newVrHours,
        vr_sessions: client.vr_sessions + 1,
      })
      .eq('card_number', client.card_number);

    if (!error) {
      await supabase.from('loyalty_history').insert({
        card_number: client.card_number,
        type: 'VR',
        description: cardCompletes
          ? `VR ${hours}ч — наклейка добавлена, карта заполнена! [Администратор]`
          : `VR ${hours}ч — наклейка добавлена (${finalStickers}/${STICKER_GOAL}) [Администратор]`,
        tokens: 1,
      });
    }

    setLoading(false);
    if (error) {
      setMsg({ success: false, text: 'Ошибка сохранения. Попробуйте ещё раз.' });
    } else {
      setMsg({
        success: true,
        text: cardCompletes
          ? `Карточка заполнена! Поздравьте клиента! Уровень: ${newTier.label}`
          : `Наклейка добавлена! ${finalStickers}/${STICKER_GOAL}`,
      });
      setTimeout(() => { onAdded(); onClose(); }, 1800);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: 'rgba(1,0,20,0.95)' }}
      onClick={onClose}>
      <div className="w-full max-w-sm rounded-lg p-6"
        style={{ background: '#06001e', border: `1px solid ${tier.borderColor}` }}
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-orbitron font-bold text-white text-sm">Добавить наклейку</h3>
            <p className="font-mono-tech text-xs mt-0.5" style={{ color: tier.color }}>{client.name}</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full cursor-pointer text-white/30 hover:text-white">
            <i className="ri-close-line" />
          </button>
        </div>

        {/* Current sticker progress */}
        <div className="mb-4 p-3 rounded-lg" style={{ background: 'rgba(155,77,255,0.06)', border: '1px solid rgba(155,77,255,0.2)' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono-tech text-xs text-white/50">Наклейки сейчас</span>
            <span className="font-orbitron font-bold text-xs" style={{ color: '#9b4dff' }}>{currentStickers}/{STICKER_GOAL}</span>
          </div>
          <div className="grid grid-cols-10 gap-0.5 mb-2">
            {Array.from({ length: STICKER_GOAL }).map((_, i) => {
              const filled = i < currentStickers;
              const willFill = i === currentStickers;
              return (
                <div key={i} className="rounded-sm flex items-center justify-center"
                  style={{
                    aspectRatio: '1',
                    background: willFill ? 'rgba(155,77,255,0.3)' : filled ? 'rgba(155,77,255,0.2)' : 'rgba(155,77,255,0.04)',
                    border: `1px solid ${willFill ? 'rgba(155,77,255,1)' : filled ? 'rgba(155,77,255,0.6)' : 'rgba(155,77,255,0.15)'}`,
                  }}>
                  {(filled || willFill) && (
                    <i className="ri-vr-line" style={{ fontSize: '7px', color: willFill ? '#e879f9' : '#9b4dff' }} />
                  )}
                </div>
              );
            })}
          </div>
          {cardCompletes && (
            <div className="text-center font-orbitron font-bold text-xs animate-pulse" style={{ color: '#e879f9' }}>
              КАРТОЧКА ЗАПОЛНИТСЯ!
            </div>
          )}
        </div>

        {/* Tier info */}
        <div className="mb-4 flex items-center gap-3 p-3 rounded-lg"
          style={{ background: `${tier.color}08`, border: `1px solid ${tier.color}20` }}>
          <div className="w-8 h-8 flex items-center justify-center rounded-sm"
            style={{ background: `${tier.color}15`, border: `1px solid ${tier.color}40` }}>
            <i className="ri-vr-line text-sm" style={{ color: tier.color }} />
          </div>
          <div className="flex-1">
            <div className="font-orbitron font-bold text-xs" style={{ color: tier.color }}>
              {tier.label} · {client.vr_hours ?? 0}ч VR
            </div>
            {tier.nextAt && (
              <div className="font-mono-tech text-xs" style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px' }}>
                До {CARD_TIERS[tier.tier + 1].label}: {tier.nextAt - (client.vr_hours ?? 0)}ч → {newTier.tier > tier.tier ? `ПЕРЕХОД → ${newTier.label}!` : ''}
              </div>
            )}
          </div>
          {newTier.tier > tier.tier && (
            <div className="font-orbitron font-bold text-xs animate-pulse" style={{ color: newTier.color }}>АПГРЕЙД!</div>
          )}
        </div>

        {/* Hours selector */}
        <div className="mb-4">
          <label className="admin-label">ПРОДОЛЖИТЕЛЬНОСТЬ СЕССИИ</label>
          <div className="grid grid-cols-5 gap-1.5">
            {STICKER_HOUR_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setHours(opt.value)}
                className="py-2 rounded-sm font-orbitron font-bold cursor-pointer transition-all whitespace-nowrap"
                style={{
                  fontSize: '9px',
                  background: hours === opt.value ? `${tier.color}18` : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${hours === opt.value ? tier.color : 'rgba(255,255,255,0.1)'}`,
                  color: hours === opt.value ? tier.color : 'rgba(255,255,255,0.5)',
                  boxShadow: hours === opt.value ? `0 0 8px ${tier.glowColor}` : 'none',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {msg && (
          <div className="mb-4 px-4 py-3 rounded-lg font-rajdhani text-sm"
            style={{ background: msg.success ? 'rgba(74,222,128,0.1)' : 'rgba(255,0,110,0.1)', border: `1px solid ${msg.success ? 'rgba(74,222,128,0.3)' : 'rgba(255,0,110,0.3)'}`, color: msg.success ? '#4ade80' : '#ff006e' }}>
            {msg.text}
          </div>
        )}

        <button onClick={handleAdd} disabled={loading}
          className="w-full py-3 rounded-sm font-orbitron font-bold text-sm cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 whitespace-nowrap"
          style={{ background: `${tier.color}18`, border: `1px solid ${tier.color}60`, color: tier.color }}>
          {loading ? <i className="ri-loader-4-line animate-spin" /> : <i className="ri-add-circle-line" />}
          Добавить наклейку (+{hours}ч VR)
        </button>
      </div>
    </div>
  );
};

// ── Client Edit Modal ─────────────────────────────────────────────────────────
interface ClientEditModalProps {
  client: LoyaltyUser;
  onClose: () => void;
  onSaved: () => void;
}

const ClientEditModal = ({ client, onClose, onSaved }: ClientEditModalProps) => {
  const [name, setName] = useState(client.name);
  const [phone, setPhone] = useState(client.phone);
  const [email, setEmail] = useState(client.email ?? '');
  const [vrTokens, setVrTokens] = useState(client.vr_tokens);
  const [autoTokens, setAutoTokens] = useState(client.auto_tokens);
  const [vrHours, setVrHours] = useState(client.vr_hours ?? 0);
  const [vrSessions, setVrSessions] = useState(client.vr_sessions);
  const [stickers, setStickers] = useState(client.stickers ?? 0);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ success: boolean; text: string } | null>(null);
  const [activeSection, setActiveSection] = useState<'info' | 'stats'>('info');

  const tier = getCardTier(vrHours);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    setLoading(true);
    const { error } = await supabase
      .from('loyalty_cards')
      .update({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || null,
        vr_tokens: Math.max(0, vrTokens),
        auto_tokens: Math.max(0, autoTokens),
        vr_hours: Math.max(0, vrHours),
        vr_sessions: Math.max(0, vrSessions),
        stickers: Math.max(0, Math.min(STICKER_GOAL, stickers)),
      })
      .eq('card_number', client.card_number);
    setLoading(false);
    if (error) {
      setMsg({ success: false, text: 'Ошибка сохранения. Попробуйте ещё раз.' });
    } else {
      setMsg({ success: true, text: 'Данные клиента обновлены!' });
      setTimeout(() => { onSaved(); onClose(); }, 1200);
    }
  };

  const NumField = ({ label, value, onChange, max, color }: { label: string; value: number; onChange: (v: number) => void; max?: number; color?: string }) => (
    <div>
      <label className="admin-label">{label}</label>
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => onChange(Math.max(0, value - 1))}
          className="w-9 h-9 flex items-center justify-center rounded-sm cursor-pointer flex-shrink-0"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.5)' }}>
          <i className="ri-subtract-line text-sm" />
        </button>
        <input
          type="number"
          value={value}
          onChange={e => onChange(Math.max(0, max !== undefined ? Math.min(max, Number(e.target.value)) : Number(e.target.value)))}
          className="cyber-input text-center font-orbitron font-bold flex-1"
          style={{ color: color ?? '#00f5ff', fontSize: '15px' }}
          min={0}
          max={max}
        />
        <button type="button" onClick={() => onChange(max !== undefined ? Math.min(max, value + 1) : value + 1)}
          className="w-9 h-9 flex items-center justify-center rounded-sm cursor-pointer flex-shrink-0"
          style={{ background: 'rgba(0,245,255,0.06)', border: '1px solid rgba(0,245,255,0.25)', color: '#00f5ff' }}>
          <i className="ri-add-line text-sm" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 overflow-y-auto py-4"
      style={{ background: 'rgba(1,0,20,0.97)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-md rounded-xl overflow-hidden relative"
        style={{ background: '#06001e', border: `1px solid ${tier.borderColor}`, boxShadow: `0 0 40px ${tier.glowColor}` }}>
        <div className="absolute top-0 left-0 right-0 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${tier.color}, transparent)` }} />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: `1px solid ${tier.color}18` }}>
          <div>
            <h3 className="font-orbitron font-bold text-white text-sm tracking-wide">РЕДАКТИРОВАТЬ КЛИЕНТА</h3>
            <div className="font-mono-tech text-xs mt-0.5" style={{ color: tier.color }}>
              {client.card_number} · {tier.label}
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center cursor-pointer text-white/30 hover:text-white/70 transition-colors">
            <i className="ri-close-line text-lg" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-5 pt-4 pb-2">
          {([
            { key: 'info', label: 'Данные', icon: 'ri-user-line' },
            { key: 'stats', label: 'Статистика', icon: 'ri-bar-chart-line' },
          ] as const).map(tab => (
            <button key={tab.key} onClick={() => setActiveSection(tab.key)}
              className="flex-1 py-2 rounded-md font-orbitron font-bold cursor-pointer transition-all"
              style={{
                fontSize: '10px', letterSpacing: '0.5px',
                background: activeSection === tab.key ? `${tier.color}15` : 'transparent',
                color: activeSection === tab.key ? tier.color : 'rgba(255,255,255,0.35)',
                border: activeSection === tab.key ? `1px solid ${tier.color}40` : '1px solid transparent',
              }}>
              <i className={`${tab.icon} mr-1.5`} />
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSave} className="px-5 pb-5 space-y-3">
          {activeSection === 'info' && (
            <>
              <div>
                <label className="admin-label">ИМЯ И ФАМИЛИЯ *</label>
                <input value={name} onChange={e => setName(e.target.value)} className="cyber-input" placeholder="Иван Иванов" required />
              </div>
              <div>
                <label className="admin-label">ТЕЛЕФОН *</label>
                <input value={phone} onChange={e => setPhone(e.target.value)} className="cyber-input" placeholder="+7 (___) ___-__-__" required />
              </div>
              <div>
                <label className="admin-label">EMAIL</label>
                <input value={email} onChange={e => setEmail(e.target.value)} className="cyber-input" placeholder="email@example.com" type="email" />
              </div>
              <div className="rounded-lg p-3" style={{ background: 'rgba(0,245,255,0.04)', border: '1px solid rgba(0,245,255,0.1)' }}>
                <div className="flex items-center gap-2 mb-1">
                  <i className="ri-information-line text-xs" style={{ color: '#00f5ff' }} />
                  <span className="font-mono-tech text-xs" style={{ color: '#00f5ff', fontSize: '10px' }}>НОМЕР КАРТЫ</span>
                </div>
                <div className="font-orbitron font-bold text-sm" style={{ color: tier.color }}>{client.card_number}</div>
                <div className="font-rajdhani text-xs mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  Зарегистрирован: {new Date(client.created_at).toLocaleDateString('ru-RU')}
                </div>
              </div>
            </>
          )}

          {activeSection === 'stats' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <NumField label="VR ЖЕТОНЫ" value={vrTokens} onChange={setVrTokens} color="#00f5ff" />
                <NumField label="АВТО ЖЕТОНЫ" value={autoTokens} onChange={setAutoTokens} color="#ff6600" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <NumField label="VR ЧАСОВ" value={vrHours} onChange={setVrHours} color={tier.color} />
                <NumField label="VR СЕССИЙ" value={vrSessions} onChange={setVrSessions} color={tier.color} />
              </div>
              <NumField label="НАКЛЕЙКИ (0–10)" value={stickers} onChange={setStickers} max={STICKER_GOAL} color="#9b4dff" />
              <div className="pt-1">
                <div className="text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Rajdhani, sans-serif', letterSpacing: '0.5px' }}>
                  Прогресс наклеек
                </div>
                <div className="grid grid-cols-10 gap-0.5">
                  {Array.from({ length: STICKER_GOAL }).map((_, i) => (
                    <div key={i} className="rounded-sm"
                      style={{ aspectRatio: '1', background: i < stickers ? 'rgba(155,77,255,0.3)' : 'rgba(155,77,255,0.04)', border: `1px solid ${i < stickers ? 'rgba(155,77,255,0.7)' : 'rgba(155,77,255,0.15)'}` }}>
                    </div>
                  ))}
                </div>
                <div className="mt-1 font-rajdhani text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  Уровень карты: <span style={{ color: tier.color, fontWeight: 'bold' }}>{tier.label}</span> ({vrHours} ч VR)
                </div>
              </div>
            </>
          )}

          {msg && (
            <div className="px-3 py-2 rounded font-rajdhani text-sm"
              style={{ background: msg.success ? 'rgba(74,222,128,0.08)' : 'rgba(255,0,110,0.08)', border: `1px solid ${msg.success ? 'rgba(74,222,128,0.25)' : 'rgba(255,0,110,0.25)'}`, color: msg.success ? '#4ade80' : '#ff006e' }}>
              {msg.text}
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 rounded-sm text-xs font-rajdhani cursor-pointer"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.5)' }}>
              Отмена
            </button>
            <button type="submit" disabled={loading || !name.trim() || !phone.trim()}
              className="flex-1 py-3 rounded-sm text-xs font-orbitron cursor-pointer disabled:opacity-40 flex items-center justify-center gap-2 whitespace-nowrap"
              style={{ background: `${tier.color}18`, border: `1px solid ${tier.color}50`, color: tier.color }}>
              {loading ? <i className="ri-loader-4-line animate-spin" /> : <i className="ri-save-line" />}
              Сохранить
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .admin-label {
          display: block;
          font-family: 'Rajdhani', sans-serif;
          font-size: 10px;
          letter-spacing: 1px;
          color: rgba(255,255,255,0.4);
          margin-bottom: 6px;
          text-transform: uppercase;
        }
        .cyber-input {
          width: 100%;
          background: rgba(0,245,255,0.03);
          border: 1px solid rgba(0,245,255,0.2);
          border-radius: 4px;
          padding: 10px 14px;
          font-size: 13px;
          color: rgba(255,255,255,0.9);
          outline: none;
          font-family: 'Rajdhani', sans-serif;
          transition: border-color 0.2s;
        }
        .cyber-input:focus {
          border-color: rgba(0,245,255,0.5);
          box-shadow: 0 0 0 3px rgba(0,245,255,0.06);
        }
      `}</style>
    </div>
  );
};

// ── Reset Code Modal ──────────────────────────────────────────────────────────
interface ResetCodeModalProps {
  client: LoyaltyUser;
  onClose: () => void;
}

const ResetCodeModal = ({ client, onClose }: ResetCodeModalProps) => {
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    const generatedCode = String(Math.floor(100000 + Math.random() * 900000));
    const { error: err } = await supabase
      .from('loyalty_cards')
      .update({ reset_code: generatedCode })
      .eq('card_number', client.card_number);
    setLoading(false);
    if (err) { setError('Ошибка генерации кода. Попробуйте ещё раз.'); return; }
    setCode(generatedCode);
  };

  const tier = getCardTier(client.vr_hours ?? 0);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-4"
      style={{ background: 'rgba(1,0,20,0.97)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-sm rounded-xl overflow-hidden relative"
        style={{ background: '#06001e', border: '1px solid rgba(255,165,0,0.4)' }}>
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #ffa500, transparent)' }} />

        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(255,165,0,0.15)' }}>
          <div>
            <h3 className="font-orbitron font-bold text-white text-sm">СБРОС ПАРОЛЯ</h3>
            <div className="font-mono-tech text-xs mt-0.5" style={{ color: '#ffa500' }}>{client.name}</div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center cursor-pointer text-white/30 hover:text-white/70 transition-colors">
            <i className="ri-close-line text-lg" />
          </button>
        </div>

        <div className="px-5 pb-5 pt-4 space-y-4">
          <div className="rounded-lg p-3" style={{ background: 'rgba(255,165,0,0.06)', border: '1px solid rgba(255,165,0,0.2)' }}>
            <div className="flex items-start gap-2">
              <i className="ri-information-line text-sm flex-shrink-0 mt-0.5" style={{ color: '#ffa500' }} />
              <p className="font-rajdhani text-white/60 text-xs leading-relaxed">
                Нажмите кнопку, получите <strong className="text-white/80">6-значный код</strong>. Назовите его клиенту — он введёт его в разделе «Забыл пароль» и установит новый пароль.
              </p>
            </div>
          </div>

          <div className="rounded-lg p-4 flex items-center gap-3" style={{ background: `${tier.color}06`, border: `1px solid ${tier.color}20` }}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-orbitron font-black"
              style={{ background: `${tier.color}12`, border: `2px solid ${tier.color}40`, color: tier.color }}>
              {client.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-rajdhani font-bold text-white text-sm">{client.name}</div>
              <div className="font-mono-tech text-white/40 mt-0.5" style={{ fontSize: '10px' }}>{client.phone}</div>
              <div className="font-mono-tech mt-0.5" style={{ fontSize: '9px', color: tier.color }}>{client.card_number}</div>
            </div>
          </div>

          <button onClick={handleGenerate} disabled={loading}
            className="w-full py-3.5 rounded-sm font-orbitron font-bold text-xs transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: 'rgba(255,165,0,0.12)', border: '1px solid rgba(255,165,0,0.45)', color: '#ffa500' }}>
            {loading
              ? <><i className="ri-loader-4-line mr-2 animate-spin" />Генерация...</>
              : <><i className="ri-refresh-line mr-2" />Сгенерировать код сброса</>
            }
          </button>

          {error && (
            <div className="px-3 py-2 rounded font-rajdhani text-sm" style={{ background: 'rgba(255,0,110,0.08)', border: '1px solid rgba(255,0,110,0.3)', color: '#ff006e' }}>
              {error}
            </div>
          )}

          {code && (
            <div className="rounded-lg p-5 text-center relative overflow-hidden" style={{ background: 'rgba(255,165,0,0.06)', border: '2px solid rgba(255,165,0,0.6)' }}>
              <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #ffa500, transparent)' }} />
              <div className="font-mono-tech text-white/35 text-xs tracking-widest mb-2">КОД СБРОСА ПАРОЛЯ</div>
              <div className="font-orbitron font-black tracking-[0.3em] mb-2"
                style={{ fontSize: '42px', color: '#ffa500', textShadow: '0 0 30px rgba(255,165,0,0.6)' }}>
                {code}
              </div>
              <div className="font-rajdhani text-white/45 text-sm">Назовите этот код клиенту вслух</div>
              <div className="mt-1 font-mono-tech text-xs" style={{ color: 'rgba(255,165,0,0.5)' }}>Код одноразовый — после использования аннулируется</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Delete Client Modal ───────────────────────────────────────────────────────
interface DeleteClientModalProps {
  client: LoyaltyUser;
  onClose: () => void;
  onDeleted: () => void;
}

const DeleteClientModal = ({ client, onClose, onDeleted }: DeleteClientModalProps) => {
  const [step, setStep] = useState<0 | 1>(0);
  const [confirmName, setConfirmName] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const tier = getCardTier(client.vr_hours ?? 0);

  const handleDelete = async () => {
    setLoading(true);
    await supabase.from('loyalty_history').delete().eq('card_number', client.card_number);
    const { error } = await supabase.from('loyalty_cards').delete().eq('card_number', client.card_number);
    setLoading(false);
    if (error) { setMsg('Ошибка удаления. Попробуйте ещё раз.'); return; }
    onDeleted();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-4"
      style={{ background: 'rgba(1,0,20,0.97)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-sm rounded-xl overflow-hidden relative"
        style={{ background: '#06001e', border: '2px solid rgba(255,0,110,0.4)' }}>
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #ff006e, transparent)' }} />

        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(255,0,110,0.15)' }}>
          <div>
            <h3 className="font-orbitron font-bold text-sm" style={{ color: '#ff006e' }}>УДАЛИТЬ КЛИЕНТА</h3>
            <div className="font-mono-tech text-xs mt-0.5" style={{ color: 'rgba(255,0,110,0.6)' }}>НЕОБРАТИМОЕ ДЕЙСТВИЕ</div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center cursor-pointer text-white/30 hover:text-white/70 transition-colors">
            <i className="ri-close-line text-lg" />
          </button>
        </div>

        <div className="px-5 pb-5 pt-4 space-y-4">
          <div className="rounded-lg p-4 flex items-center gap-3" style={{ background: 'rgba(255,0,110,0.04)', border: '1px solid rgba(255,0,110,0.2)' }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 font-orbitron font-black text-lg"
              style={{ background: 'rgba(255,0,110,0.1)', border: '2px solid rgba(255,0,110,0.35)', color: '#ff006e' }}>
              {client.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-orbitron font-bold text-white text-sm">{client.name}</div>
              <div className="font-mono-tech text-white/40 mt-0.5" style={{ fontSize: '10px' }}>{client.phone}</div>
              <div className="flex gap-3 mt-1">
                <span className="font-mono-tech" style={{ fontSize: '9px', color: `${tier.color}80` }}>{tier.label}</span>
                <span className="font-mono-tech" style={{ fontSize: '9px', color: 'rgba(0,245,255,0.5)' }}>VR: {client.vr_tokens}</span>
                <span className="font-mono-tech" style={{ fontSize: '9px', color: 'rgba(255,102,0,0.5)' }}>Авто: {client.auto_tokens}</span>
              </div>
            </div>
          </div>

          {step === 0 && (
            <>
              <div className="rounded-lg px-3 py-2.5" style={{ background: 'rgba(255,165,0,0.06)', border: '1px solid rgba(255,165,0,0.25)' }}>
                <p className="font-rajdhani text-xs leading-relaxed" style={{ color: '#ffa500' }}>
                  <i className="ri-keyboard-line mr-1" />
                  Для подтверждения введите имя клиента точно как написано:
                  <strong className="block mt-1 text-white/80">«{client.name}»</strong>
                </p>
              </div>
              <input
                value={confirmName}
                onChange={e => setConfirmName(e.target.value)}
                placeholder={`Введите: ${client.name}`}
                className="cyber-input w-full text-sm"
                style={{ borderColor: 'rgba(255,165,0,0.35)', color: '#ffa500' }}
              />
              {msg && (
                <div className="px-3 py-2 rounded font-rajdhani text-sm" style={{ background: 'rgba(255,0,110,0.08)', border: '1px solid rgba(255,0,110,0.3)', color: '#ff006e' }}>
                  {msg}
                </div>
              )}
              <div className="grid grid-cols-2 gap-2">
                <button onClick={onClose}
                  className="py-3 rounded-sm font-orbitron font-bold text-xs cursor-pointer transition-all whitespace-nowrap"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.5)' }}>
                  <i className="ri-close-line mr-1" />Отмена
                </button>
                <button
                  onClick={() => {
                    if (confirmName.trim().toLowerCase() !== client.name.toLowerCase()) {
                      setMsg('Имя не совпадает. Попробуйте ещё раз.');
                      setTimeout(() => setMsg(''), 2500);
                      return;
                    }
                    setStep(1);
                  }}
                  disabled={!confirmName.trim()}
                  className="py-3 rounded-sm font-orbitron font-bold text-xs cursor-pointer transition-all disabled:opacity-40 whitespace-nowrap"
                  style={{ background: 'rgba(255,0,110,0.12)', border: '1px solid rgba(255,0,110,0.4)', color: '#ff006e' }}>
                  Продолжить <i className="ri-arrow-right-line ml-1" />
                </button>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <div className="rounded-lg p-4 text-center" style={{ background: 'rgba(255,0,110,0.06)', border: '2px dashed rgba(255,0,110,0.4)' }}>
                <i className="ri-delete-bin-fill text-2xl mb-2 block" style={{ color: '#ff006e' }} />
                <p className="font-orbitron font-bold text-xs text-white mb-1">ПОСЛЕДНЕЕ ПОДТВЕРЖДЕНИЕ</p>
                <p className="font-rajdhani text-white/50 text-xs">Карта и вся история будут удалены навсегда. Отменить нельзя.</p>
              </div>
              {msg && (
                <div className="px-3 py-2 rounded font-rajdhani text-sm" style={{ background: 'rgba(255,0,110,0.08)', border: '1px solid rgba(255,0,110,0.3)', color: '#ff006e' }}>
                  {msg}
                </div>
              )}
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => { setStep(0); setConfirmName(''); }}
                  className="py-3 rounded-sm font-orbitron font-bold text-xs cursor-pointer transition-all whitespace-nowrap"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.5)' }}>
                  <i className="ri-arrow-left-line mr-1" />Назад
                </button>
                <button onClick={handleDelete} disabled={loading}
                  className="py-3 rounded-sm font-orbitron font-black text-xs cursor-pointer transition-all disabled:opacity-50 whitespace-nowrap"
                  style={{ background: 'rgba(255,0,110,0.2)', border: '2px solid #ff006e', color: '#ff006e' }}>
                  {loading
                    ? <><i className="ri-loader-4-line mr-1 animate-spin" />Удаление...</>
                    : <><i className="ri-delete-bin-fill mr-1" />УДАЛИТЬ</>
                  }
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Loyalty Card User Row ─────────────────────────────────────────────────────
interface LoyaltyUser {
  id: string;
  card_number: string;
  name: string;
  phone: string;
  email: string | null;
  vr_tokens: number;
  auto_tokens: number;
  vr_sessions: number;
  auto_sessions: number;
  vr_hours: number;
  stickers: number;
  birth_date: string | null;
  created_at: string;
}

const useClients = () => {
  const [clients, setClients] = useState<LoyaltyUser[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    supabase
      .from('loyalty_cards')
      .select('id, card_number, name, phone, email, vr_tokens, auto_tokens, vr_sessions, auto_sessions, vr_hours, stickers, birth_date, created_at')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setClients((data as LoyaltyUser[]) ?? []);
        setLoading(false);
      });
  }, []);

  useEffect(() => { load(); }, [load]);

  return { clients, loading, reload: load };
};

const ClientsTab = () => {
  const { clients, loading, reload } = useClients();
  const [search, setSearch] = useState('');
  const [stickerClient, setStickerClient] = useState<LoyaltyUser | null>(null);
  const [editClient, setEditClient] = useState<LoyaltyUser | null>(null);
  const [resetClient, setResetClient] = useState<LoyaltyUser | null>(null);
  const [deleteClient, setDeleteClient] = useState<LoyaltyUser | null>(null);

  const filtered = clients.filter(c =>
    !search ||
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search) ||
    c.card_number.includes(search)
  );

  const formatDate = (str: string) => {
    const d = new Date(str);
    return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="flex-1 relative">
          <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'rgba(0,245,255,0.4)' }} />
          <input
            type="text"
            placeholder="Поиск по имени, телефону или номеру карты..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="cyber-input pl-9 text-sm w-full"
          />
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="font-mono-tech text-xs flex items-center gap-1.5" style={{ color: 'rgba(0,245,255,0.6)' }}>
            <i className="ri-group-line" />
            {filtered.length} клиентов
          </div>
          <button onClick={reload} disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-sm text-xs font-orbitron cursor-pointer whitespace-nowrap disabled:opacity-60"
            style={{ background: 'rgba(0,245,255,0.06)', border: '1px solid rgba(0,245,255,0.25)', color: '#00f5ff' }}>
            {loading ? <i className="ri-loader-4-line animate-spin" /> : <><i className="ri-refresh-line" />Обновить</>}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: 'rgba(0,245,255,0.2)', borderTopColor: '#00f5ff' }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 rounded-lg" style={{ border: '1px dashed rgba(0,245,255,0.15)' }}>
          <i className="ri-user-line text-2xl mb-2" style={{ color: 'rgba(0,245,255,0.3)' }} />
          <p className="font-rajdhani text-white/30 text-sm">Нет зарегистрированных клиентов</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(c => {
            const clientTier = getCardTier(c.vr_hours ?? 0);
            return (
              <div key={c.id} className="rounded-lg p-4"
                style={{ background: `${clientTier.color}04`, border: `1px solid ${clientTier.color}18` }}>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="w-10 h-10 flex items-center justify-center rounded-full flex-shrink-0 font-orbitron font-black text-sm"
                    style={{ background: `${clientTier.color}12`, border: `1px solid ${clientTier.color}30`, color: clientTier.color }}>
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                      <span className="font-rajdhani font-bold text-white text-sm">{c.name}</span>
                      <span className="font-mono-tech px-2 py-0.5 rounded-sm"
                        style={{ fontSize: '9px', background: `${clientTier.color}10`, color: clientTier.color, letterSpacing: '0.5px', border: `1px solid ${clientTier.color}30` }}>
                        {c.card_number}
                      </span>
                      <span className="font-orbitron px-2 py-0.5 rounded-sm"
                        style={{ fontSize: '8px', background: `${clientTier.color}15`, color: clientTier.color, border: `1px solid ${clientTier.color}40` }}>
                        {clientTier.label}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <span className="font-mono-tech text-xs" style={{ color: 'rgba(255,255,255,0.45)', fontSize: '11px' }}>
                        <i className="ri-phone-line mr-1" />{c.phone}
                      </span>
                      {c.email && (
                        <span className="font-mono-tech text-xs" style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px' }}>
                          <i className="ri-mail-line mr-1" />{c.email}
                        </span>
                      )}
                      <span className="font-mono-tech text-xs" style={{ color: 'rgba(255,255,255,0.25)', fontSize: '10px' }}>
                        <i className="ri-calendar-line mr-1" />{formatDate(c.created_at)}
                      </span>
                    </div>
                    {/* Sticker progress mini */}
                    <div className="flex items-center gap-1 mt-1.5">
                      {Array.from({ length: STICKER_GOAL }).map((_, i) => (
                        <div key={i} className="rounded-sm"
                          style={{
                            width: '12px', height: '8px',
                            background: i < (c.stickers ?? 0) ? `${clientTier.color}30` : 'rgba(255,255,255,0.04)',
                            border: `1px solid ${i < (c.stickers ?? 0) ? `${clientTier.color}70` : 'rgba(255,255,255,0.08)'}`,
                          }} />
                      ))}
                      <span className="font-mono-tech ml-1" style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)' }}>
                        {c.stickers ?? 0}/{STICKER_GOAL} наклеек
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 flex-shrink-0 items-center">
                    <div className="text-center px-2">
                      <div className="font-orbitron font-bold text-sm" style={{ color: clientTier.color }}>{c.vr_hours ?? 0}ч</div>
                      <div className="font-mono-tech" style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)' }}>VR часов</div>
                    </div>
                    <div className="text-center px-2">
                      <div className="font-orbitron font-bold text-sm" style={{ color: '#00f5ff' }}>{c.vr_tokens}</div>
                      <div className="font-mono-tech" style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)' }}>VR жетон</div>
                    </div>
                    <div className="text-center px-2">
                      <div className="font-orbitron font-bold text-sm" style={{ color: '#ff6600' }}>{c.auto_tokens}</div>
                      <div className="font-mono-tech" style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)' }}>Авто</div>
                    </div>
                    <button
                      onClick={() => setStickerClient(c)}
                      className="flex items-center gap-1 px-3 py-2 rounded-sm text-xs font-orbitron cursor-pointer whitespace-nowrap transition-all"
                      style={{ background: `${clientTier.color}10`, border: `1px solid ${clientTier.color}30`, color: clientTier.color }}>
                      <i className="ri-sticky-note-line" />
                      Наклейка
                    </button>
                    <button
                      onClick={() => setEditClient(c)}
                      className="flex items-center gap-1 px-3 py-2 rounded-sm text-xs font-orbitron cursor-pointer whitespace-nowrap transition-all"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.6)' }}>
                      <i className="ri-edit-line" />
                      Изменить
                    </button>
                    <button
                      onClick={() => setResetClient(c)}
                      className="flex items-center gap-1 px-3 py-2 rounded-sm text-xs font-orbitron cursor-pointer whitespace-nowrap transition-all"
                      style={{ background: 'rgba(255,165,0,0.08)', border: '1px solid rgba(255,165,0,0.3)', color: '#ffa500' }}>
                      <i className="ri-lock-unlock-line" />
                      Пароль
                    </button>
                    <button
                      onClick={() => setDeleteClient(c)}
                      className="flex items-center gap-1 px-3 py-2 rounded-sm text-xs font-orbitron cursor-pointer whitespace-nowrap transition-all"
                      style={{ background: 'rgba(255,0,110,0.06)', border: '1px solid rgba(255,0,110,0.3)', color: '#ff006e' }}>
                      <i className="ri-delete-bin-line" />
                      Удалить
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {stickerClient && (
        <StickerModal
          client={stickerClient}
          onClose={() => setStickerClient(null)}
          onAdded={() => { setStickerClient(null); reload(); }}
        />
      )}
      {editClient && (
        <ClientEditModal
          client={editClient}
          onClose={() => setEditClient(null)}
          onSaved={() => { setEditClient(null); reload(); }}
        />
      )}
      {resetClient && (
        <ResetCodeModal
          client={resetClient}
          onClose={() => setResetClient(null)}
        />
      )}
      {deleteClient && (
        <DeleteClientModal
          client={deleteClient}
          onClose={() => setDeleteClient(null)}
          onDeleted={() => { setDeleteClient(null); reload(); }}
        />
      )}
    </div>
  );
};

// ── Forum Tab ─────────────────────────────────────────────────────────────────
interface ForumUserRow {
  id: string;
  username: string;
  email: string;
  card_number: string | null;
  is_approved: boolean;
  avatar_color: string;
  role: string;
  posts_count: number;
  threads_count: number;
  likes_received: number;
  created_at: string;
}

const useForumUsers = () => {
  const [users, setUsers] = useState<ForumUserRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    supabase
      .from('forum_users')
      .select('id, username, email, card_number, is_approved, avatar_color, role, posts_count, threads_count, likes_received, created_at')
      .order('is_approved', { ascending: true })
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setUsers((data as ForumUserRow[]) ?? []);
        setLoading(false);
      });
  }, []);

  useEffect(() => { load(); }, [load]);

  return { users, loading, reload: load };
};

const ForumTab = () => {
  const { users, loading, reload } = useForumUsers();
  const [activating, setActivating] = useState<string | null>(null);
  const [blocking, setBlocking] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'active'>('all');
  const [toast, setToast] = useState<{ ok: boolean; text: string } | null>(null);

  const showToast = (ok: boolean, text: string) => {
    setToast({ ok, text });
    setTimeout(() => setToast(null), 3500);
  };

  const handleActivate = async (userId: string, username: string) => {
    setActivating(userId);
    const { error } = await supabase
      .from('forum_users')
      .update({ is_approved: true })
      .eq('id', userId);
    setActivating(null);
    if (error) {
      showToast(false, 'Ошибка активации');
    } else {
      showToast(true, `${username} активирован — теперь может писать на форуме!`);
      reload();
    }
  };

  const handleBlock = async (userId: string, username: string, currentStatus: boolean) => {
    if (currentStatus === false) { handleActivate(userId, username); return; }
    setBlocking(userId);
    const { error } = await supabase
      .from('forum_users')
      .update({ is_approved: false })
      .eq('id', userId);
    setBlocking(null);
    if (error) {
      showToast(false, 'Ошибка изменения статуса');
    } else {
      showToast(true, `${username} заблокирован`);
      reload();
    }
  };

  const pending = users.filter(u => !u.is_approved);
  const active = users.filter(u => u.is_approved);

  const filtered = users.filter(u => {
    const matchesSearch = !search ||
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.card_number && u.card_number.includes(search));
    const matchesFilter = filter === 'all' || (filter === 'pending' ? !u.is_approved : u.is_approved);
    return matchesSearch && matchesFilter;
  });

  const formatDate = (str: string) => {
    const d = new Date(str);
    return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-5 relative">
      {toast && (
        <div
          className="fixed top-6 right-6 z-50 px-4 py-3 rounded-lg font-rajdhani text-sm flex items-center gap-2"
          style={{
            background: toast.ok ? 'rgba(74,222,128,0.12)' : 'rgba(255,0,110,0.12)',
            border: `1px solid ${toast.ok ? 'rgba(74,222,128,0.5)' : 'rgba(255,0,110,0.5)'}`,
            color: toast.ok ? '#4ade80' : '#ff006e',
          }}
        >
          <i className={toast.ok ? 'ri-checkbox-circle-line' : 'ri-error-warning-line'} />
          {toast.text}
        </div>
      )}

      {pending.length > 0 && (
        <div className="rounded-lg px-4 py-3 flex items-center gap-3"
          style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.35)' }}>
          <div className="w-8 h-8 flex items-center justify-center rounded-full flex-shrink-0"
            style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.4)' }}>
            <i className="ri-time-line text-sm" style={{ color: '#f59e0b' }} />
          </div>
          <div className="flex-1">
            <span className="font-orbitron font-bold text-sm" style={{ color: '#f59e0b' }}>
              {pending.length} {pending.length === 1 ? 'новая заявка' : pending.length < 5 ? 'новые заявки' : 'новых заявок'} на вступление в форум
            </span>
            <p className="font-rajdhani text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>
              Нажмите «Активировать» — пользователь сразу получит доступ к форуму
            </p>
          </div>
          <button onClick={() => setFilter('pending')}
            className="flex-shrink-0 px-3 py-2 rounded-sm text-xs font-orbitron cursor-pointer whitespace-nowrap"
            style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.5)', color: '#f59e0b' }}>
            Показать заявки
          </button>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Всего участников', value: users.length, color: '#00f5ff', icon: 'ri-group-line' },
          { label: 'Ожидают активации', value: pending.length, color: '#f59e0b', icon: 'ri-time-line' },
          { label: 'Активных', value: active.length, color: '#4ade80', icon: 'ri-checkbox-circle-line' },
        ].map(stat => (
          <div key={stat.label} className="rounded-lg px-4 py-3 flex items-center gap-3"
            style={{ background: `${stat.color}08`, border: `1px solid ${stat.color}25` }}>
            <div className="w-8 h-8 flex items-center justify-center rounded-sm flex-shrink-0"
              style={{ background: `${stat.color}12` }}>
              <i className={`${stat.icon} text-sm`} style={{ color: stat.color }} />
            </div>
            <div>
              <div className="font-orbitron font-black text-xl leading-none" style={{ color: stat.color }}>{stat.value}</div>
              <div className="font-rajdhani text-xs" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="flex-1 relative">
          <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'rgba(0,245,255,0.4)' }} />
          <input
            type="text"
            placeholder="Поиск по нику, email или номеру карты..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="cyber-input pl-9 text-sm w-full"
          />
        </div>
        <div className="flex gap-1 p-1 rounded-full flex-shrink-0"
          style={{ background: 'rgba(0,245,255,0.05)', border: '1px solid rgba(0,245,255,0.15)' }}>
          {([
            { key: 'all', label: 'Все' },
            { key: 'pending', label: 'Заявки' },
            { key: 'active', label: 'Активные' },
          ] as const).map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className="px-4 py-1.5 rounded-full text-xs font-orbitron cursor-pointer transition-all whitespace-nowrap"
              style={{
                background: filter === f.key ? 'rgba(0,245,255,0.15)' : 'transparent',
                color: filter === f.key ? '#00f5ff' : 'rgba(255,255,255,0.4)',
                border: filter === f.key ? '1px solid rgba(0,245,255,0.4)' : '1px solid transparent',
              }}>
              {f.label}
            </button>
          ))}
        </div>
        <button onClick={reload} disabled={loading}
          className="flex items-center gap-1.5 px-3 py-2 rounded-sm text-xs font-orbitron cursor-pointer whitespace-nowrap disabled:opacity-60 flex-shrink-0"
          style={{ background: 'rgba(0,245,255,0.06)', border: '1px solid rgba(0,245,255,0.25)', color: '#00f5ff' }}>
          {loading ? <i className="ri-loader-4-line animate-spin" /> : <><i className="ri-refresh-line" />Обновить</>}
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: 'rgba(0,245,255,0.2)', borderTopColor: '#00f5ff' }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 rounded-lg" style={{ border: '1px dashed rgba(0,245,255,0.15)' }}>
          <i className="ri-user-line text-2xl mb-2" style={{ color: 'rgba(0,245,255,0.3)' }} />
          <p className="font-rajdhani text-white/30 text-sm">Нет участников</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(u => (
            <div key={u.id} className="rounded-lg p-4 transition-all"
              style={{
                background: !u.is_approved ? 'rgba(245,158,11,0.04)' : 'rgba(0,245,255,0.03)',
                border: !u.is_approved ? '1px solid rgba(245,158,11,0.25)' : '1px solid rgba(0,245,255,0.12)',
              }}>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 font-orbitron font-black text-base"
                  style={{
                    background: `${u.avatar_color}15`,
                    border: `2px solid ${u.avatar_color}40`,
                    color: u.avatar_color,
                  }}>
                  {u.username.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-0.5">
                    <span className="font-rajdhani font-bold text-white text-sm">{u.username}</span>
                    {u.role === 'admin' && (
                      <span className="font-orbitron px-2 py-0.5 rounded-sm"
                        style={{ background: 'rgba(0,245,255,0.12)', color: '#00f5ff', border: '1px solid rgba(0,245,255,0.4)', fontSize: '9px' }}>
                        ADMIN
                      </span>
                    )}
                    {u.role === 'moderator' && (
                      <span className="font-orbitron px-2 py-0.5 rounded-sm"
                        style={{ background: 'rgba(155,77,255,0.12)', color: '#c084fc', border: '1px solid rgba(155,77,255,0.4)', fontSize: '9px' }}>
                        MOD
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded-sm font-orbitron"
                      style={{
                        fontSize: '9px',
                        background: u.is_approved ? 'rgba(74,222,128,0.1)' : 'rgba(245,158,11,0.1)',
                        color: u.is_approved ? '#4ade80' : '#f59e0b',
                        border: `1px solid ${u.is_approved ? 'rgba(74,222,128,0.3)' : 'rgba(245,158,11,0.4)'}`,
                      }}>
                      {u.is_approved ? '● АКТИВЕН' : '◌ ОЖИДАЕТ'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <span className="font-mono-tech" style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
                      <i className="ri-mail-line mr-1" />{u.email}
                    </span>
                    {u.card_number && (
                      <span className="font-mono-tech" style={{ fontSize: '11px', color: 'rgba(0,245,255,0.5)' }}>
                        <i className="ri-vip-crown-2-line mr-1" />{u.card_number}
                      </span>
                    )}
                    <span className="font-mono-tech" style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)' }}>
                      <i className="ri-calendar-line mr-1" />{formatDate(u.created_at)}
                    </span>
                  </div>
                  {u.is_approved && (
                    <div className="flex gap-4 mt-1.5">
                      <span className="font-mono-tech" style={{ color: 'rgba(0,245,255,0.6)', fontSize: '10px' }}>
                        <i className="ri-discuss-line mr-1" />{u.threads_count} тем
                      </span>
                      <span className="font-mono-tech" style={{ color: 'rgba(155,77,255,0.6)', fontSize: '10px' }}>
                        <i className="ri-message-3-line mr-1" />{u.posts_count} сообщений
                      </span>
                      <span className="font-mono-tech" style={{ color: 'rgba(245,158,11,0.6)', fontSize: '10px' }}>
                        <i className="ri-heart-3-line mr-1" />{u.likes_received} лайков
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  {!u.is_approved ? (
                    <button
                      onClick={() => handleActivate(u.id, u.username)}
                      disabled={activating === u.id}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-sm text-xs font-orbitron cursor-pointer whitespace-nowrap disabled:opacity-60 transition-all"
                      style={{ background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.5)', color: '#4ade80' }}>
                      {activating === u.id
                        ? <><i className="ri-loader-4-line animate-spin" />Активация...</>
                        : <><i className="ri-checkbox-circle-line" />Активировать</>
                      }
                    </button>
                  ) : (
                    <button
                      onClick={() => handleBlock(u.id, u.username, u.is_approved)}
                      disabled={blocking === u.id || u.role === 'admin'}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-sm text-xs font-orbitron cursor-pointer whitespace-nowrap disabled:opacity-40 transition-all"
                      style={{ background: 'rgba(255,0,110,0.06)', border: '1px solid rgba(255,0,110,0.25)', color: 'rgba(255,0,110,0.7)' }}>
                      {blocking === u.id
                        ? <i className="ri-loader-4-line animate-spin" />
                        : <i className="ri-forbid-2-line" />
                      }
                      Заблокировать
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Main Admin Panel ──────────────────────────────────────────────────────────
const AdminDashboard = ({ onLogout }: { onLogout: () => void }) => {
  const { bookings, loading, updateStatus, deleteBooking, updateBooking } = useBookings();
  const [activeTab, setActiveTab] = useState<'bookings' | 'clients' | 'forum'>('bookings');
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  });
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const handleCreate = useCallback(async (data: Partial<Booking>) => {
    await supabase.from('bookings').insert({ ...data, email: null });
    window.location.reload();
  }, []);

  const handleDelete = useCallback(async () => {
    if (deleteId) {
      await deleteBooking(deleteId);
      setDeleteId(null);
    }
  }, [deleteId, deleteBooking]);

  const dayBookings = bookings.filter(b => {
    const matchesDate = b.booking_date === selectedDate;
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    const matchesSearch = !searchQuery || b.name.toLowerCase().includes(searchQuery.toLowerCase()) || b.phone.includes(searchQuery);
    return matchesDate && matchesStatus && matchesSearch;
  });

  const todayStr = (() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  })();

  const todayBookings = bookings.filter(b => b.booking_date === todayStr && b.status !== 'cancelled');
  const pendingCount = bookings.filter(b => b.status === 'pending').length;
  const confirmedCount = bookings.filter(b => b.status === 'confirmed').length;

  const formatDateDisplay = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-');
    const months = ['янв','фев','мар','апр','май','июн','июл','авг','сен','окт','ноя','дек'];
    return `${parseInt(d)} ${months[parseInt(m) - 1]} ${y}`;
  };

  return (
    <div style={{ background: '#010014', minHeight: '100vh' }}>
      {/* Top Nav */}
      <nav className="sticky top-0 z-30 flex items-center justify-between px-4 md:px-6 py-4"
        style={{ background: 'rgba(1,0,20,0.97)', borderBottom: '1px solid rgba(0,245,255,0.15)', backdropFilter: 'blur(12px)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center rounded-sm"
            style={{ border: '1px solid rgba(0,245,255,0.4)', background: 'rgba(0,245,255,0.08)' }}>
            <i className="ri-shield-keyhole-line text-sm" style={{ color: '#00f5ff' }} />
          </div>
          <div>
            <h1 className="font-orbitron font-bold text-white text-sm tracking-wider">ADMIN PANEL</h1>
            <p className="font-mono-tech" style={{ fontSize: '9px', color: 'rgba(0,245,255,0.5)' }}>PARADOX VR CLUB</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {activeTab === 'bookings' && (
            <button onClick={() => setIsCreating(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-sm text-xs font-orbitron cursor-pointer whitespace-nowrap"
              style={{ background: 'rgba(0,245,255,0.1)', border: '1px solid rgba(0,245,255,0.4)', color: '#00f5ff' }}>
              <i className="ri-add-line" />Новая запись
            </button>
          )}
          <button onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-2 rounded-sm text-xs font-rajdhani cursor-pointer whitespace-nowrap"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}>
            <i className="ri-logout-box-line" />
            <span className="hidden sm:inline">Выйти</span>
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-6">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Сегодня', value: todayBookings.length, color: '#00f5ff', icon: 'ri-calendar-today-line' },
            { label: 'Ожидают', value: pendingCount, color: '#f59e0b', icon: 'ri-time-line' },
            { label: 'Подтверждено', value: confirmedCount, color: '#4ade80', icon: 'ri-checkbox-circle-line' },
          ].map(stat => (
            <div key={stat.label} className="rounded-lg px-4 py-3 flex items-center gap-3"
              style={{ background: `${stat.color}08`, border: `1px solid ${stat.color}25` }}>
              <div className="w-8 h-8 flex items-center justify-center rounded-sm flex-shrink-0"
                style={{ background: `${stat.color}12` }}>
                <i className={`${stat.icon} text-sm`} style={{ color: stat.color }} />
              </div>
              <div>
                <div className="font-orbitron font-black text-xl leading-none" style={{ color: stat.color }}>{stat.value}</div>
                <div className="font-rajdhani text-xs" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tab switcher */}
        <div className="flex gap-1 p-1 rounded-full"
          style={{ background: 'rgba(0,245,255,0.05)', border: '1px solid rgba(0,245,255,0.15)', width: 'fit-content' }}>
          {[
            { key: 'bookings', label: 'Записи', icon: 'ri-calendar-line' },
            { key: 'clients', label: 'Клиенты', icon: 'ri-group-line' },
            { key: 'forum', label: 'Форум', icon: 'ri-discuss-line' },
          ].map(tab => (
            <button key={tab.key}
              onClick={() => setActiveTab(tab.key as 'bookings' | 'clients' | 'forum')}
              className="flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-orbitron cursor-pointer transition-all whitespace-nowrap"
              style={{
                background: activeTab === tab.key ? 'rgba(0,245,255,0.15)' : 'transparent',
                color: activeTab === tab.key ? '#00f5ff' : 'rgba(255,255,255,0.4)',
                border: activeTab === tab.key ? '1px solid rgba(0,245,255,0.4)' : '1px solid transparent',
              }}>
              <i className={tab.icon} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'clients' ? (
          <ClientsTab />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar */}
            <div className="lg:col-span-1">
              <AdminCalendar bookings={bookings} selectedDate={selectedDate} onSelectDate={setSelectedDate} />
            </div>

            {/* Bookings list */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="flex-1 relative">
                  <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'rgba(0,245,255,0.4)' }} />
                  <input
                    type="text"
                    placeholder="Поиск по имени или телефону..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="cyber-input pl-9 text-sm w-full"
                  />
                </div>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                  className="cyber-input cursor-pointer text-sm whitespace-nowrap"
                  style={{ minWidth: '130px' }}>
                  <option value="all" style={{ background: '#06001e' }}>Все статусы</option>
                  <option value="pending" style={{ background: '#06001e' }}>Ожидание</option>
                  <option value="confirmed" style={{ background: '#06001e' }}>Подтверждено</option>
                  <option value="cancelled" style={{ background: '#06001e' }}>Отменено</option>
                </select>
                <button onClick={() => setIsCreating(true)}
                  className="sm:hidden flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-sm text-xs font-orbitron cursor-pointer whitespace-nowrap"
                  style={{ background: 'rgba(0,245,255,0.1)', border: '1px solid rgba(0,245,255,0.4)', color: '#00f5ff' }}>
                  <i className="ri-add-line" />Новая запись
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-px flex-1" style={{ background: 'rgba(0,245,255,0.1)' }} />
                <span className="font-mono-tech text-xs" style={{ color: '#00f5ff', fontSize: '11px', letterSpacing: '1px' }}>
                  {formatDateDisplay(selectedDate)} · {dayBookings.length} записей
                </span>
                <div className="h-px flex-1" style={{ background: 'rgba(0,245,255,0.1)' }} />
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: 'rgba(0,245,255,0.2)', borderTopColor: '#00f5ff' }} />
                </div>
              ) : dayBookings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center rounded-lg"
                  style={{ border: '1px dashed rgba(0,245,255,0.15)' }}>
                  <div className="w-12 h-12 flex items-center justify-center rounded-full mb-3"
                    style={{ background: 'rgba(0,245,255,0.06)', border: '1px solid rgba(0,245,255,0.15)' }}>
                    <i className="ri-calendar-line text-xl" style={{ color: 'rgba(0,245,255,0.4)' }} />
                  </div>
                  <p className="font-rajdhani text-white/30 text-sm">Нет записей на этот день</p>
                  <button onClick={() => setIsCreating(true)}
                    className="mt-4 px-4 py-2 rounded-sm text-xs font-orbitron cursor-pointer"
                    style={{ background: 'rgba(0,245,255,0.08)', border: '1px solid rgba(0,245,255,0.25)', color: '#00f5ff' }}>
                    + Добавить запись
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {dayBookings.map(b => (
                    <BookingCard
                      key={b.id}
                      booking={b}
                      onEdit={setEditingBooking}
                      onDelete={id => setDeleteId(id)}
                      onStatusChange={updateStatus}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Forum Tab ───────────────────────────────────────────────────────────────── */}
        {activeTab === 'forum' && (
          <ForumTab />
        )}
      </div>

      {(editingBooking || isCreating) && (
        <BookingEditModal
          booking={editingBooking}
          isNew={isCreating}
          onClose={() => { setEditingBooking(null); setIsCreating(false); }}
          onSave={updateBooking}
          onCreate={handleCreate}
        />
      )}

      {deleteId && (
        <ConfirmDialog
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}

      <style>{`
        .admin-label {
          display: block;
          font-family: 'Rajdhani', sans-serif;
          font-size: 10px;
          letter-spacing: 1px;
          color: rgba(255,255,255,0.4);
          margin-bottom: 6px;
          text-transform: uppercase;
        }
        .cyber-input {
          width: 100%;
          background: rgba(0,245,255,0.03);
          border: 1px solid rgba(0,245,255,0.2);
          border-radius: 4px;
          padding: 10px 14px;
          font-size: 13px;
          color: rgba(255,255,255,0.9);
          outline: none;
          font-family: 'Rajdhani', sans-serif;
          transition: border-color 0.2s;
        }
        .cyber-input:focus {
          border-color: rgba(0,245,255,0.5);
          box-shadow: 0 0 0 3px rgba(0,245,255,0.06);
        }
        .cyber-input option {
          background: #06001e;
          color: rgba(255,255,255,0.9);
        }
      `}</style>
    </div>
  );
};

// ── Root Export ───────────────────────────────────────────────────────────────
const AdminPage = () => {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(SESSION_KEY) === '1');

  const handleLogout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setAuthed(false);
  };

  if (!authed) return <LoginScreen onLogin={() => setAuthed(true)} />;
  return <AdminDashboard onLogout={handleLogout} />;
};

export default AdminPage;
