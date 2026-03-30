import { memo, useState, useCallback, useEffect } from 'react';
import type { LoyaltyCard } from '../hooks/useLoyalty';
import { getCardTier, CARD_TIERS, STICKER_GOAL } from '../hooks/useLoyalty';
import { supabase } from '../../../lib/supabase';

interface Props {
  card: LoyaltyCard;
  onCardUpdate?: () => void;
}

const VR_GOAL = 5;
const AUTO_GOAL = 3;

// ── Tier badge styles ─────────────────────────────────────────────────────────
const TIER_ICONS = ['ri-shield-line', 'ri-shield-star-line', 'ri-trophy-line', 'ri-vip-crown-line', 'ri-cpu-line'];

type QrStep = 'idle' | 'pin' | 'adding' | 'success' | 'error';

const LoyaltyCardDisplay = memo(({ card, onCardUpdate }: Props) => {
  // ── Live card state — updates after quick VR add without page reload ────────
  const [liveCard, setLiveCard] = useState<LoyaltyCard>(card);

  // Sync with parent if card prop changes (e.g. full page refresh)
  useEffect(() => {
    setLiveCard(card);
  }, [card]);

  const vrProgress = Math.min(liveCard.vrTokens / VR_GOAL, 1);
  const autoProgress = Math.min(liveCard.autoTokens / AUTO_GOAL, 1);
  const joined = new Date(liveCard.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
  const [showQr, setShowQr] = useState(false);
  const [qrStep, setQrStep] = useState<QrStep>('idle');
  const [qrPin, setQrPin] = useState('');
  const [qrMsg, setQrMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const tier = getCardTier(liveCard.vrHours);
  const nextTier = tier.nextAt !== null ? CARD_TIERS[tier.tier + 1] : null;
  const tierProgress = nextTier
    ? Math.min((liveCard.vrHours - tier.minHours) / (tier.nextAt! - tier.minHours), 1)
    : 1;

  const adminLink = `${window.location.origin}/loyalty/admin?client=${encodeURIComponent(liveCard.cardNumber)}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(adminLink)}&format=png&margin=10`;

  // ── Tier-specific card decorations ─────────────────────────────────────────
  const isCyber = tier.tier === 4;
  const isGold = tier.tier === 2;
  const isPlatinum = tier.tier === 3;

  const handleCloseQr = useCallback(() => {
    setShowQr(false);
    setQrStep('idle');
    setQrPin('');
    setQrMsg(null);
  }, []);

  const handleQuickVrVisit = useCallback(async () => {
    if (!qrPin.trim()) return;
    setQrStep('adding');

    const { data: settings } = await supabase
      .from('admin_settings')
      .select('pin')
      .eq('id', 1)
      .maybeSingle();

    if (settings?.pin !== qrPin.trim()) {
      setQrStep('pin');
      setQrMsg({ ok: false, text: 'Неверный PIN-код' });
      setTimeout(() => setQrMsg(null), 3000);
      return;
    }

    const { data: cardData } = await supabase
      .from('loyalty_cards')
      .select('vr_tokens, vr_sessions')
      .eq('card_number', liveCard.cardNumber)
      .maybeSingle();

    if (!cardData) {
      setQrStep('error');
      setQrMsg({ ok: false, text: 'Карта не найдена' });
      return;
    }

    const { error } = await supabase
      .from('loyalty_cards')
      .update({
        vr_tokens: (cardData.vr_tokens || 0) + 1,
        vr_sessions: (cardData.vr_sessions || 0) + 1,
      })
      .eq('card_number', liveCard.cardNumber);

    await supabase.from('loyalty_history').insert({
      card_number: liveCard.cardNumber,
      type: 'VR',
      description: 'VR-сессия [Быстрое добавление]',
      tokens: 1,
    });

    if (error) {
      setQrStep('error');
      setQrMsg({ ok: false, text: 'Ошибка записи' });
      return;
    }

    // ── Re-fetch fresh card data and update local state immediately ───────────
    const { data: freshRow } = await supabase
      .from('loyalty_cards')
      .select('vr_tokens, auto_tokens, vr_sessions, auto_sessions, vr_hours, stickers')
      .eq('card_number', liveCard.cardNumber)
      .maybeSingle();

    if (freshRow) {
      setLiveCard(prev => ({
        ...prev,
        vrTokens: freshRow.vr_tokens as number,
        autoTokens: freshRow.auto_tokens as number,
        vrSessions: freshRow.vr_sessions as number,
        autoSessions: freshRow.auto_sessions as number,
        vrHours: freshRow.vr_hours as number,
        stickers: freshRow.stickers as number,
      }));
      // Notify parent to also refresh its global card state
      onCardUpdate?.();
    }

    const newCount = (cardData.vr_tokens || 0) + 1;
    setQrStep('success');
    setQrMsg({ ok: true, text: `+1 VR-жетон начислен · теперь ${newCount}/5` });
    setTimeout(() => {
      setQrStep('idle');
      setQrPin('');
      setQrMsg(null);
    }, 5000);
  }, [qrPin, liveCard.cardNumber, onCardUpdate]);

  return (
    <div className="space-y-4 w-full">
      {/* ── Physical card ──────────────────────────────────────────────────── */}
      <div
        className="relative rounded-xl overflow-hidden select-none w-full mx-auto"
        style={{
          background: tier.bgGradient,
          border: `1px solid ${tier.borderColor}`,
          boxShadow: `0 0 30px ${tier.glowColor}, 0 0 60px ${tier.glowColor.replace('0.4', '0.08')}`,
          aspectRatio: '1.586',
          maxWidth: '400px',
          width: '100%',
        }}
      >
        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `linear-gradient(${tier.color}50 1px, transparent 1px), linear-gradient(90deg, ${tier.color}50 1px, transparent 1px)`,
            backgroundSize: '20px 20px',
          }}
        />

        {/* Top shimmer line */}
        <div className="absolute top-0 left-0 right-0 h-px" style={{
          background: tier.tier === 2
            ? 'linear-gradient(90deg, transparent, #ffd700, #fff8dc, transparent)'
            : tier.tier === 3
            ? 'linear-gradient(90deg, transparent, #c084fc, #e879f9, transparent)'
            : tier.tier === 4
            ? 'linear-gradient(90deg, transparent, #00f5ff, #ff006e, #ffd700, transparent)'
            : `linear-gradient(90deg, transparent, ${tier.color}, transparent)`,
        }} />
        <div className="absolute bottom-0 left-0 right-0 h-px" style={{
          background: `linear-gradient(90deg, transparent, ${tier.color}80, transparent)`,
        }} />

        {/* Glow orbs */}
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full opacity-20" style={{ background: `radial-gradient(circle, ${tier.color}, transparent 70%)` }} />
        <div className="absolute -left-8 -bottom-8 w-32 h-32 rounded-full opacity-15" style={{ background: `radial-gradient(circle, ${tier.color}, transparent 70%)` }} />

        {/* CYBER animated gradient overlay */}
        {tier.tier === 4 && (
          <div className="absolute inset-0 opacity-10" style={{
            background: 'linear-gradient(45deg, #00f5ff20, #ff006e20, #ffd70020, #00f5ff20)',
          }} />
        )}

        <div className="relative p-3 sm:p-5 h-full flex flex-col justify-between">
          {/* Header: Logo + Tier badge */}
          <div className="flex items-start justify-between">
            <div>
              <div className="font-orbitron font-black text-sm sm:text-base tracking-widest"
                style={{ color: tier.color, textShadow: `0 0 10px ${tier.glowColor}` }}>
                PARADOX
              </div>
              <div className="font-orbitron font-medium tracking-widest" style={{ fontSize: '9px', color: `${tier.color}80` }}>
                VR CLUB · LOYALTY
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <div
                className="px-2 py-1 rounded flex items-center gap-1 font-orbitron font-bold"
                style={{ background: `${tier.color}18`, border: `1px solid ${tier.color}60`, color: tier.color, fontSize: '7px', letterSpacing: '1px' }}
              >
                <i className={`${TIER_ICONS[tier.tier]}`} style={{ fontSize: '9px' }} />
                {tier.name}
              </div>
              <div
                className="px-2 py-0.5 rounded font-orbitron font-black"
                style={{ background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.5)', color: '#4ade80', fontSize: '9px', letterSpacing: '0.5px' }}
              >
                −{tier.discount}%
              </div>
            </div>
          </div>

          {/* Sticker row — 10 slots */}
          <div className="flex items-center gap-1">
            {Array.from({ length: STICKER_GOAL }).map((_, i) => {
              const filled = i < liveCard.stickers;
              return (
                <div
                  key={i}
                  className="flex-1 rounded-sm transition-all duration-300"
                  style={{
                    height: '14px',
                    background: filled ? `${tier.color}22` : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${filled ? tier.color : 'rgba(255,255,255,0.1)'}`,
                    boxShadow: filled ? `0 0 6px ${tier.glowColor}` : 'none',
                  }}
                >
                  {filled && (
                    <div className="w-full h-full flex items-center justify-center">
                      <i className="ri-vr-line" style={{ fontSize: '8px', color: tier.color }} />
                    </div>
                  )}
                </div>
              );
            })}
            <span className="font-mono-tech ml-1 flex-shrink-0"
              style={{ fontSize: '8px', color: `${tier.color}90`, letterSpacing: '0.5px' }}>
              {liveCard.stickers}/{STICKER_GOAL}
            </span>
          </div>

          {/* Card number */}
          <div>
            <div className="text-white/30 mb-0.5" style={{ letterSpacing: '1px', fontSize: '7px', fontFamily: 'monospace' }}>CARD NUMBER</div>
            <div
              className="font-bold tracking-widest"
              style={{ color: '#fff', letterSpacing: '2px', textShadow: `0 0 8px ${tier.glowColor}`, fontFamily: 'monospace', fontSize: 'clamp(11px, 3vw, 15px)' }}
            >
              {liveCard.cardNumber}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-end justify-between">
            <div>
              <div className="text-white/30 mb-0.5" style={{ fontSize: '7px', letterSpacing: '1px', fontFamily: 'monospace' }}>ВЛАДЕЛЕЦ</div>
              <div className="font-orbitron font-bold text-white tracking-wider uppercase" style={{ fontSize: 'clamp(10px, 2.5vw, 14px)' }}>{liveCard.name}</div>
            </div>
            <div className="text-right">
              <div style={{ color: `${tier.color}80`, fontSize: '8px', fontFamily: 'monospace' }}>
                {liveCard.vrHours}ч VR
              </div>
              <div className="text-white/40" style={{ fontFamily: 'monospace', fontSize: '9px' }}>{joined}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tier progress bar ─────────────────────────────────────────────── */}
      <div className="rounded-lg p-4 relative overflow-hidden"
        style={{ background: `${tier.color}06`, border: `1px solid ${tier.color}20` }}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 flex items-center justify-center rounded-sm"
              style={{ background: `${tier.color}15`, border: `1px solid ${tier.color}40` }}>
              <i className={`${TIER_ICONS[tier.tier]}`} style={{ color: tier.color, fontSize: '12px' }} />
            </div>
            <div>
              <span className="font-orbitron font-bold text-xs" style={{ color: tier.color }}>{tier.label}</span>
              {nextTier && (
                <span className="font-mono-tech text-white/30 ml-2" style={{ fontSize: '9px' }}>
                  → {nextTier.label} через {tier.nextAt! - liveCard.vrHours}ч
                </span>
              )}
            </div>
          </div>
          <span className="font-orbitron font-bold text-xs" style={{ color: tier.color }}>
            {liveCard.vrHours}ч
          </span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${tierProgress * 100}%`, background: `linear-gradient(90deg, ${tier.color}, ${nextTier?.color ?? tier.color})` }}
          />
        </div>
        {!nextTier && (
          <div className="mt-1 text-center font-orbitron text-xs animate-pulse" style={{ color: tier.color, fontSize: '9px' }}>
            МАКСИМАЛЬНЫЙ УРОВЕНЬ
          </div>
        )}
      </div>

      {/* ── QR button ─────────────────────────────────────────────────────── */}
      <button
        onClick={() => setShowQr(true)}
        className="w-full py-3 rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02] whitespace-nowrap"
        style={{ background: `${tier.color}06`, border: `1px solid ${tier.color}20`, color: tier.color }}
      >
        <i className="ri-qr-code-line text-base" />
        <span className="font-orbitron font-bold text-xs tracking-wider">Показать QR-код администратору</span>
      </button>

      {/* ── Token progress panels ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
        {/* VR Tokens */}
        <div className="rounded-lg p-4 relative overflow-hidden w-full"
          style={{ background: 'rgba(1,0,20,0.9)', border: '1px solid rgba(0,245,255,0.2)' }}>
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #00f5ff, transparent)' }} />
          <div className="flex items-center justify-between mb-3">
            <div className="flex-1 min-w-0 pr-2">
              <div className="font-orbitron font-bold text-white text-xs sm:text-sm">VR-Жетоны</div>
              <div className="font-mono-tech text-white/40 mt-0.5" style={{ fontSize: '9px' }}>5 часов VR = 1 час бесплатно (будни)</div>
            </div>
            <div className="font-orbitron font-black text-2xl sm:text-3xl flex-shrink-0"
              style={{ color: '#00f5ff', textShadow: '0 0 15px rgba(0,245,255,0.5)' }}>
              {liveCard.vrTokens}
            </div>
          </div>
          <div className="flex items-center gap-1.5 mb-2.5">
            {Array.from({ length: VR_GOAL }).map((_, i) => (
              <div key={i} className="flex-1 h-7 rounded-sm flex items-center justify-center transition-all duration-300"
                style={{
                  background: i < liveCard.vrTokens ? 'rgba(0,245,255,0.15)' : 'rgba(0,245,255,0.04)',
                  border: `1px solid ${i < liveCard.vrTokens ? 'rgba(0,245,255,0.7)' : 'rgba(0,245,255,0.15)'}`,
                  boxShadow: i < liveCard.vrTokens ? '0 0 8px rgba(0,245,255,0.3)' : 'none',
                }}>
                <i className="ri-vr-line text-xs" style={{ color: i < liveCard.vrTokens ? '#00f5ff' : 'rgba(0,245,255,0.2)' }} />
              </div>
            ))}
          </div>
          <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(0,245,255,0.08)' }}>
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${vrProgress * 100}%`, background: 'linear-gradient(90deg, #00f5ff, #9b4dff)' }} />
          </div>
          <div className="mt-2 flex justify-between">
            <span className="text-white/30" style={{ fontSize: '9px', fontFamily: 'monospace' }}>{liveCard.vrTokens}/{VR_GOAL}</span>
            {liveCard.vrTokens >= VR_GOAL && (
              <span className="animate-pulse font-orbitron font-bold" style={{ fontSize: '9px', color: '#00f5ff' }}>НАГРАДА!</span>
            )}
          </div>
        </div>

        {/* Auto Tokens */}
        <div className="rounded-lg p-4 relative overflow-hidden w-full"
          style={{ background: 'rgba(1,0,20,0.9)', border: '1px solid rgba(255,102,0,0.2)' }}>
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #ff6600, transparent)' }} />
          <div className="flex items-center justify-between mb-3">
            <div className="flex-1 min-w-0 pr-2">
              <div className="font-orbitron font-bold text-white text-xs sm:text-sm">Авто-Жетоны</div>
              <div className="font-mono-tech text-white/40 mt-0.5" style={{ fontSize: '9px' }}>3 = 1 час Автосима бесплатно</div>
            </div>
            <div className="font-orbitron font-black text-2xl sm:text-3xl flex-shrink-0"
              style={{ color: '#ff6600', textShadow: '0 0 15px rgba(255,102,0,0.5)' }}>
              {liveCard.autoTokens}
            </div>
          </div>
          <div className="flex items-center gap-1.5 mb-2.5">
            {Array.from({ length: AUTO_GOAL }).map((_, i) => (
              <div key={i} className="flex-1 h-7 rounded-sm flex items-center justify-center transition-all duration-300"
                style={{
                  background: i < liveCard.autoTokens ? 'rgba(255,102,0,0.15)' : 'rgba(255,102,0,0.04)',
                  border: `1px solid ${i < liveCard.autoTokens ? 'rgba(255,102,0,0.7)' : 'rgba(255,102,0,0.15)'}`,
                  boxShadow: i < liveCard.autoTokens ? '0 0 8px rgba(255,102,0,0.3)' : 'none',
                }}>
                <i className="ri-steering-2-line text-xs" style={{ color: i < liveCard.autoTokens ? '#ff6600' : 'rgba(255,102,0,0.2)' }} />
              </div>
            ))}
          </div>
          <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,102,0,0.08)' }}>
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${autoProgress * 100}%`, background: 'linear-gradient(90deg, #ff6600, #ff006e)' }} />
          </div>
          <div className="mt-2 flex justify-between">
            <span className="text-white/30" style={{ fontSize: '9px', fontFamily: 'monospace' }}>{liveCard.autoTokens}/{AUTO_GOAL}</span>
            {liveCard.autoTokens >= AUTO_GOAL && (
              <span className="animate-pulse font-orbitron font-bold" style={{ fontSize: '9px', color: '#ff6600' }}>НАГРАДА!</span>
            )}
          </div>
        </div>
      </div>

      {/* ── QR Modal ──────────────────────────────────────────────────────── */}
      {showQr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(1,0,20,0.97)' }}
          onClick={handleCloseQr}>
          <div className="relative rounded-xl p-7 text-center"
            style={{ background: '#06001e', border: `1px solid ${tier.borderColor}`, boxShadow: `0 0 60px ${tier.glowColor}`, maxWidth: '340px', width: '100%' }}
            onClick={(e) => e.stopPropagation()}>
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${tier.color}, transparent)` }} />
            <button onClick={handleCloseQr}
              className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full cursor-pointer text-white/30 hover:text-white transition-colors">
              <i className="ri-close-line text-base" />
            </button>
            <div className="font-orbitron font-black text-xs tracking-widest mb-1" style={{ color: tier.color }}>QR-КОД КАРТЫ</div>
            <div className="font-mono-tech text-white/30 text-xs mb-1">{liveCard.cardNumber}</div>
            <div className="font-orbitron text-xs mb-4" style={{ color: `${tier.color}80` }}>{tier.label}</div>
            <div className="flex justify-center mb-5">
              <div className="p-3 rounded-lg" style={{ background: '#ffffff' }}>
                <img src={qrUrl} alt={`QR ${liveCard.cardNumber}`} width={220} height={220} className="block" />
              </div>
            </div>
            <div className="font-rajdhani text-white/50 text-sm mb-4 leading-relaxed">
              Покажите QR-код администратору — он отсканирует и сразу попадёт в вашу карту
            </div>
            <div className="font-orbitron font-bold text-white text-sm tracking-wider">{liveCard.name}</div>
            <div className="flex items-center justify-center gap-4 mt-3 mb-5">
              <div className="text-center">
                <div className="font-orbitron font-black text-xl transition-all duration-500" style={{ color: '#00f5ff' }}>{liveCard.vrTokens}</div>
                <div className="font-mono-tech text-white/30" style={{ fontSize: '9px' }}>VR жетонов</div>
              </div>
              <div className="w-px h-8" style={{ background: 'rgba(255,255,255,0.1)' }} />
              <div className="text-center">
                <div className="font-orbitron font-black text-xl transition-all duration-500" style={{ color: '#ff6600' }}>{liveCard.autoTokens}</div>
                <div className="font-mono-tech text-white/30" style={{ fontSize: '9px' }}>Авто жетонов</div>
              </div>
              <div className="w-px h-8" style={{ background: 'rgba(255,255,255,0.1)' }} />
              <div className="text-center">
                <div className="font-orbitron font-black text-xl transition-all duration-500" style={{ color: tier.color }}>{liveCard.vrHours}</div>
                <div className="font-mono-tech text-white/30" style={{ fontSize: '9px' }}>часов VR</div>
              </div>
            </div>

            {/* ── Quick VR visit block ─────────────────────────────── */}
            <div className="rounded-lg overflow-hidden" style={{ border: `1px solid rgba(0,245,255,0.2)` }}>
              <div className="flex items-center gap-2 px-3 py-2.5" style={{ background: 'rgba(0,245,255,0.06)', borderBottom: '1px solid rgba(0,245,255,0.1)' }}>
                <div className="w-5 h-5 flex items-center justify-center">
                  <i className="ri-vr-line text-xs" style={{ color: '#00f5ff' }} />
                </div>
                <span className="font-orbitron font-bold text-xs tracking-wider" style={{ color: '#00f5ff' }}>БЫСТРОЕ ДОБАВЛЕНИЕ VR</span>
              </div>

              <div className="p-3">
                {qrStep === 'idle' && (
                  <button
                    onClick={() => setQrStep('pin')}
                    className="w-full py-3 rounded-sm font-orbitron font-bold text-xs cursor-pointer transition-all hover:scale-[1.02] whitespace-nowrap"
                    style={{ background: 'rgba(0,245,255,0.1)', border: '1px solid rgba(0,245,255,0.4)', color: '#00f5ff' }}
                  >
                    <i className="ri-add-circle-line mr-2" />
                    Добавить посещение VR
                  </button>
                )}

                {qrStep === 'pin' && (
                  <div className="space-y-2">
                    <p className="font-mono-tech text-white/35 text-center" style={{ fontSize: '9px', letterSpacing: '0.5px' }}>
                      ВВЕДИТЕ PIN АДМИНИСТРАТОРА
                    </p>
                    <input
                      type="password"
                      value={qrPin}
                      onChange={(e) => setQrPin(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleQuickVrVisit()}
                      placeholder="PIN-код..."
                      autoComplete="off"
                      className="cyber-input w-full text-sm text-center tracking-widest"
                      autoFocus
                    />
                    {qrMsg && !qrMsg.ok && (
                      <div className="px-2 py-1.5 rounded font-rajdhani text-xs text-center" style={{ background: 'rgba(255,0,110,0.08)', border: '1px solid rgba(255,0,110,0.25)', color: '#ff006e' }}>
                        {qrMsg.text}
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => { setQrStep('idle'); setQrPin(''); setQrMsg(null); }}
                        className="py-2.5 rounded-sm font-orbitron font-bold text-xs cursor-pointer transition-all whitespace-nowrap"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.35)' }}
                      >
                        Отмена
                      </button>
                      <button
                        onClick={handleQuickVrVisit}
                        disabled={!qrPin.trim()}
                        className="py-2.5 rounded-sm font-orbitron font-bold text-xs cursor-pointer transition-all disabled:opacity-40 whitespace-nowrap"
                        style={{ background: 'rgba(0,245,255,0.12)', border: '1px solid rgba(0,245,255,0.4)', color: '#00f5ff' }}
                      >
                        <i className="ri-check-line mr-1" />Подтвердить
                      </button>
                    </div>
                  </div>
                )}

                {qrStep === 'adding' && (
                  <div className="py-3 flex items-center justify-center gap-2">
                    <i className="ri-loader-4-line animate-spin text-sm" style={{ color: '#00f5ff' }} />
                    <span className="font-orbitron font-bold text-xs" style={{ color: '#00f5ff' }}>Добавляем...</span>
                  </div>
                )}

                {(qrStep === 'success') && qrMsg && (
                  <div className="py-3 text-center space-y-1">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.4)' }}>
                        <i className="ri-check-line text-sm" style={{ color: '#4ade80' }} />
                      </div>
                    </div>
                    <div className="font-orbitron font-bold text-xs" style={{ color: '#4ade80' }}>Посещение записано!</div>
                    <div className="font-mono-tech text-white/40" style={{ fontSize: '9px' }}>{qrMsg.text}</div>
                  </div>
                )}

                {(qrStep === 'error') && qrMsg && (
                  <div className="py-2 px-3 rounded text-center" style={{ background: 'rgba(255,0,110,0.08)', border: '1px solid rgba(255,0,110,0.25)' }}>
                    <i className="ri-error-warning-line mr-1 text-xs" style={{ color: '#ff006e' }} />
                    <span className="font-rajdhani text-xs" style={{ color: '#ff006e' }}>{qrMsg.text}</span>
                  </div>
                )}
              </div>
            </div>
            {/* ── end quick visit ──────────────────────────────────── */}

          </div>
        </div>
      )}
    </div>
  );
});

LoyaltyCardDisplay.displayName = 'LoyaltyCardDisplay';
export default LoyaltyCardDisplay;
