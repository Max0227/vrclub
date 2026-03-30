import { useState, useCallback, useRef, useEffect, useMemo, memo } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import { supabase } from '../../../lib/supabase';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface RegisterForm {
  name: string;
  phone: string;
  email: string;
  birth_date: string;
  password: string;
}

const INITIAL_FORM: RegisterForm = { name: '', phone: '+7', email: '', birth_date: '', password: '' };

function generateCardNumber(): string {
  const num = Math.floor(10000 + Math.random() * 90000);
  return `PDX-CLUB-${num}`;
}

const RegisterModal = memo(({ isOpen, onClose }: RegisterModalProps) => {
  const [form, setForm] = useState<RegisterForm>(INITIAL_FORM);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cardNumber, setCardNumber] = useState('');

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      const cleaned = value.startsWith('+7') ? value : '+7' + value.replace(/^\+7?/, '');
      setForm((prev) => ({ ...prev, phone: cleaned }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
    setError('');
  }, []);

  const handleClose = useCallback(() => {
    if (!loading) {
      setForm(INITIAL_FORM);
      setError('');
      setCardNumber('');
      onClose();
    }
  }, [loading, onClose]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 8) {
      setError('Пароль должен быть не менее 8 символов');
      return;
    }
    setLoading(true);
    setError('');

    // Check if phone already registered
    const { data: existing } = await supabase
      .from('loyalty_cards')
      .select('card_number')
      .eq('phone', form.phone.trim())
      .maybeSingle();
    if (existing) {
      setError('Этот телефон уже зарегистрирован. Войдите в личный кабинет.');
      setLoading(false);
      return;
    }

    const cn = generateCardNumber();
    try {
      const { error: dbError } = await supabase.from('loyalty_cards').insert({
        card_number: cn,
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email ? form.email.toLowerCase().trim() : null,
        birth_date: form.birth_date || null,
        password: form.password.trim(),
        vr_tokens: 0,
        auto_tokens: 0,
        vr_sessions: 0,
        auto_sessions: 0,
        vr_hours: 0,
        stickers: 0,
      });
      if (dbError) {
        setError('Ошибка при регистрации. Попробуйте ещё раз.');
      } else {
        setCardNumber(cn);
      }
    } catch {
      setError('Ошибка соединения. Попробуйте позже.');
    } finally {
      setLoading(false);
    }
  }, [form]);

  const pwStrength = form.password.length >= 12 ? 'strong' : form.password.length >= 8 ? 'ok' : 'weak';

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(1,0,20,0.96)' }}
      onClick={(e) => e.target === e.currentTarget && handleClose()}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-md rounded-lg overflow-hidden"
        style={{ background: '#06001e', border: '1px solid rgba(155,77,255,0.4)', maxHeight: '94vh', overflowY: 'auto' }}
      >
        {/* Header */}
        <div
          className="sticky top-0 z-10 flex items-center justify-between px-6 py-4"
          style={{ background: '#06001e', borderBottom: '1px solid rgba(155,77,255,0.15)' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center rounded-sm" style={{ border: '1px solid rgba(155,77,255,0.5)', background: 'rgba(155,77,255,0.1)' }}>
              <i className="ri-vip-crown-line text-sm" style={{ color: '#9b4dff' }} />
            </div>
            <div>
              <h2 className="font-orbitron font-bold text-white text-sm tracking-wider">КЛУБНАЯ КАРТА</h2>
              <p className="font-mono-tech text-xs" style={{ color: '#9b4dff', opacity: 0.7, fontSize: '10px' }}>PARADOX VR CLUB · РЕГИСТРАЦИЯ</p>
            </div>
          </div>
          <button onClick={handleClose} className="w-8 h-8 flex items-center justify-center cursor-pointer text-white/40 hover:text-white transition-colors rounded hover:bg-white/10" aria-label="Закрыть">
            <i className="ri-close-line text-lg" />
          </button>
        </div>

        <div className="px-6 py-5">
          {cardNumber ? (
            <SuccessCard cardNumber={cardNumber} name={form.name} onClose={handleClose} />
          ) : (
            <RegisterFormView
              form={form}
              loading={loading}
              error={error}
              showPassword={showPassword}
              pwStrength={pwStrength}
              onTogglePassword={() => setShowPassword((v) => !v)}
              onChange={handleChange}
              onSubmit={handleSubmit}
            />
          )}
        </div>
      </div>
    </div>
  );
});
RegisterModal.displayName = 'RegisterModal';

interface FormProps {
  form: RegisterForm;
  loading: boolean;
  error: string;
  showPassword: boolean;
  pwStrength: 'weak' | 'ok' | 'strong';
  onTogglePassword: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const RegisterFormView = memo(({ form, loading, error, showPassword, pwStrength, onTogglePassword, onChange, onSubmit }: FormProps) => (
  <>
    {/* Benefits */}
    <div className="mb-6 p-4 rounded-md" style={{ background: 'rgba(155,77,255,0.06)', border: '1px solid rgba(155,77,255,0.15)' }}>
      <p className="font-orbitron text-xs font-bold mb-3" style={{ color: '#9b4dff' }}>ЧТО ДАЁТ КАРТА</p>
      <div className="space-y-2">
        {[
          { icon: 'ri-gift-line', text: 'Накопительные бонусы за каждое посещение' },
          { icon: 'ri-cake-line', text: 'Скидка -20% на день рождения ±3 дня' },
          { icon: 'ri-history-line', text: 'История всех твоих визитов и бронирований' },
          { icon: 'ri-discuss-line', text: 'Доступ к клубному форуму (скоро)' },
          { icon: 'ri-notification-3-line', text: 'Уведомления об акциях и новых играх' },
        ].map((b) => (
          <div key={b.text} className="flex items-center gap-2.5">
            <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
              <i className={`${b.icon} text-sm`} style={{ color: '#9b4dff' }} />
            </div>
            <span className="font-rajdhani text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>{b.text}</span>
          </div>
        ))}
      </div>
    </div>

    <form onSubmit={onSubmit} data-readdy-form className="space-y-4">
      <div>
        <label className="font-mono-tech text-xs text-white/45 block mb-1.5" style={{ fontSize: '10px', letterSpacing: '1px' }}>ИМЯ *</label>
        <input required name="name" value={form.name} onChange={onChange} className="cyber-input" placeholder="Как тебя зовут?" autoComplete="given-name" />
      </div>
      <div>
        <label className="font-mono-tech text-xs text-white/45 block mb-1.5" style={{ fontSize: '10px', letterSpacing: '1px' }}>ТЕЛЕФОН *</label>
        <input required name="phone" value={form.phone} onChange={onChange} className="cyber-input" placeholder="+7 (___) ___-__-__" type="tel" autoComplete="tel" />
      </div>
      <div>
        <label className="font-mono-tech text-xs text-white/45 block mb-1.5" style={{ fontSize: '10px', letterSpacing: '1px' }}>EMAIL <span className="text-white/20">(необязательно)</span></label>
        <input name="email" value={form.email} onChange={onChange} className="cyber-input" placeholder="your@email.com" type="email" autoComplete="email" />
      </div>
      <div>
        <label className="font-mono-tech text-xs text-white/45 block mb-1.5" style={{ fontSize: '10px', letterSpacing: '1px' }}>ДАТА РОЖДЕНИЯ <span className="text-white/20">(для скидки)</span></label>
        <input name="birth_date" value={form.birth_date} onChange={onChange} className="cyber-input" type="date" autoComplete="bday" />
      </div>

      {/* Password field */}
      <div>
        <label className="font-mono-tech text-xs block mb-1.5" style={{ fontSize: '10px', letterSpacing: '1px', color: '#9b4dff' }}>
          ПРИДУМАЙТЕ ПАРОЛЬ *
        </label>
        <div className="relative">
          <input
            required
            name="password"
            value={form.password}
            onChange={onChange}
            className="cyber-input pr-10"
            placeholder="Минимум 8 символов"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            minLength={8}
          />
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center cursor-pointer text-white/30 hover:text-white/60 transition-colors"
          >
            <i className={showPassword ? 'ri-eye-off-line text-sm' : 'ri-eye-line text-sm'} />
          </button>
        </div>
        {form.password.length > 0 && (
          <div className="mt-2 space-y-1">
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-1 flex-1 rounded-full transition-all duration-300"
                  style={{
                    background: i === 0
                      ? (pwStrength === 'weak' ? 'rgba(255,0,110,0.7)' : pwStrength === 'ok' ? 'rgba(0,245,255,0.7)' : 'rgba(74,222,128,0.8)')
                      : i === 1
                        ? (pwStrength === 'ok' ? 'rgba(0,245,255,0.7)' : pwStrength === 'strong' ? 'rgba(74,222,128,0.8)' : 'rgba(255,255,255,0.1)')
                        : (pwStrength === 'strong' ? 'rgba(74,222,128,0.8)' : 'rgba(255,255,255,0.1)'),
                  }}
                />
              ))}
            </div>
            <p className="font-rajdhani text-xs" style={{
              color: pwStrength === 'weak' ? '#ff006e' : pwStrength === 'ok' ? '#00f5ff' : '#4ade80',
              fontSize: '10px',
            }}>
              {pwStrength === 'weak'
                ? `Введено ${form.password.length} из 8 символов`
                : pwStrength === 'ok'
                  ? 'Хороший пароль — ещё 4 символа для максимума'
                  : 'Надёжный пароль — обязательно запомни!'}
            </p>
          </div>
        )}
        <p className="font-rajdhani text-xs mt-1" style={{ color: 'rgba(155,77,255,0.5)', fontSize: '10px' }}>
          Этот пароль понадобится для входа в личный кабинет
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-sm font-rajdhani text-sm" style={{ background: 'rgba(255,0,110,0.08)', border: '1px solid rgba(255,0,110,0.3)', color: '#ff006e' }}>
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 rounded-sm text-sm flex items-center justify-center gap-2 font-orbitron font-bold transition-all cursor-pointer"
        style={{
          background: loading ? 'rgba(155,77,255,0.1)' : 'rgba(155,77,255,0.15)',
          border: '1px solid rgba(155,77,255,0.5)',
          color: '#9b4dff',
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? <><i className="ri-loader-4-line animate-spin" />Создаём карту...</> : <><i className="ri-vip-crown-line" />Получить клубную карту</>}
      </button>

      <p className="text-center font-rajdhani text-xs text-white/30 leading-relaxed">
        Регистрируясь, ты соглашаешься на хранение данных.<br />
        Мы не передаём их третьим лицам.
      </p>
    </form>
  </>
));
RegisterFormView.displayName = 'RegisterFormView';

const SuccessCard = memo(({ cardNumber, name, onClose }: { cardNumber: string; name: string; onClose: () => void }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<'scan' | 'build' | 'done'>('scan');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('build'), 950);
    const t2 = setTimeout(() => setPhase('done'), 2150);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const PARTICLES = useMemo(() =>
    [...Array(22)].map((_, i) => {
      const angle = (i / 22) * 360 + (Math.random() - 0.5) * 18;
      const dist = 75 + Math.floor(Math.random() * 110);
      const rad = (angle * Math.PI) / 180;
      return {
        id: i,
        tx: Math.round(Math.cos(rad) * dist),
        ty: Math.round(Math.sin(rad) * dist),
        size: 2 + Math.floor(Math.random() * 4),
        color: ['#00f5ff', '#9b4dff', '#ff006e', '#ffd700', '#00f5ff'][i % 5],
        delay: Math.floor(Math.random() * 180),
        dur: 650 + Math.floor(Math.random() * 450),
      };
    }), []
  );

  const handleSave = useCallback(async () => {
    if (!cardRef.current || saving) return;
    setSaving(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#0d0030',
        scale: 3,
        useCORS: true,
        logging: false,
      });
      const link = document.createElement('a');
      link.download = `paradox-card-${cardNumber}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  }, [cardNumber, saving]);

  const qrValue = `${window.location.origin}/loyalty/admin-scan?card=${cardNumber}`;
  const isBuild = phase === 'build' || phase === 'done';
  const isDone = phase === 'done';

  return (
    <div className="text-center py-2">
      {/* Badge — pops in at 'done' */}
      <div
        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5"
        style={{
          background: 'rgba(0,245,255,0.08)',
          border: '1px solid rgba(0,245,255,0.25)',
          opacity: isDone ? 1 : 0,
          transform: isDone ? 'translateY(0) scale(1)' : 'translateY(-14px) scale(0.85)',
          transition: 'all 0.5s cubic-bezier(0.34,1.56,0.64,1)',
        }}
      >
        <i className="ri-checkbox-circle-fill text-sm" style={{ color: '#00f5ff' }} />
        <span className="font-orbitron font-bold text-xs tracking-wider" style={{ color: '#00f5ff' }}>КАРТА АКТИВИРОВАНА</span>
      </div>

      {/* Card + effects wrapper */}
      <div className="relative mx-auto mb-5" style={{ width: '300px' }}>

        {/* Particle burst */}
        {isBuild && PARTICLES.map((p) => (
          <div
            key={p.id}
            style={{
              position: 'absolute',
              top: '50%', left: '50%',
              width: `${p.size}px`, height: `${p.size}px`,
              borderRadius: '50%',
              background: p.color,
              boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
              pointerEvents: 'none',
              zIndex: 30,
              animation: `card-particle ${p.dur}ms ${p.delay}ms ease-out forwards`,
              '--tx': `${p.tx}px`,
              '--ty': `${p.ty}px`,
            } as React.CSSProperties}
          />
        ))}

        {/* Outer glow ring — pulses when done */}
        <div
          style={{
            position: 'absolute',
            inset: '-10px',
            borderRadius: '22px',
            border: '1px solid rgba(155,77,255,0.5)',
            pointerEvents: 'none',
            zIndex: 0,
            opacity: isDone ? 1 : 0,
            animation: isDone ? 'card-glow-pulse 2.8s ease-in-out 0.3s infinite' : 'none',
            transition: 'opacity 0.4s ease',
          }}
        />

        {/* The card itself */}
        <div
          ref={cardRef}
          className="relative rounded-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #0d0030 0%, #1a0045 40%, #0a001e 70%, #150035 100%)',
            border: `1px solid ${isBuild ? 'rgba(155,77,255,0.7)' : 'rgba(155,77,255,0.25)'}`,
            boxShadow: isDone
              ? '0 0 50px rgba(155,77,255,0.3), inset 0 0 60px rgba(0,0,0,0.3)'
              : isBuild
                ? '0 0 25px rgba(155,77,255,0.18)'
                : '0 0 6px rgba(155,77,255,0.08)',
            padding: '20px',
            opacity: phase === 'scan' ? 0.2 : 1,
            transition: 'opacity 0.25s ease, box-shadow 0.6s ease, border-color 0.4s ease',
          }}
        >
          {/* Scan beam */}
          {phase === 'scan' && (
            <div className="absolute inset-0 z-10 overflow-hidden rounded-2xl pointer-events-none">
              <div style={{
                position: 'absolute',
                top: 0, left: '-10%', right: '-10%',
                height: '3px',
                background: 'linear-gradient(90deg, transparent 0%, rgba(0,245,255,0.2) 15%, #00f5ff 45%, rgba(155,77,255,0.9) 70%, rgba(0,245,255,0.3) 85%, transparent 100%)',
                boxShadow: '0 0 20px #00f5ff, 0 0 6px #9b4dff',
                animation: 'card-scanline 0.92s linear forwards',
              }} />
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                background: 'linear-gradient(to bottom, rgba(0,245,255,0.06) 0%, rgba(0,245,255,0.02) 50%, transparent 100%)',
                animation: 'card-scan-trail 0.92s linear forwards',
              }} />
            </div>
          )}

          {/* Glitch flash on build transition */}
          {phase === 'build' && (
            <div
              className="absolute inset-0 z-10 pointer-events-none rounded-2xl"
              style={{ animation: 'card-glitch-flash 0.5s ease forwards' }}
            />
          )}

          {/* Ambient glows */}
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 20% 20%, rgba(155,77,255,0.15) 0%, transparent 60%)' }} />
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 80% 80%, rgba(0,245,255,0.08) 0%, transparent 50%)' }} />

          {/* Header row */}
          <div
            className="relative flex items-start justify-between mb-4"
            style={{
              opacity: isBuild ? 1 : 0,
              transform: isBuild ? 'translateY(0)' : 'translateY(-8px)',
              transition: 'all 0.4s 0.0s ease',
            }}
          >
            <div>
              <div className="font-orbitron font-black text-sm tracking-[0.2em] mb-0.5" style={{ color: '#9b4dff' }}>PARADOX</div>
              <div className="font-mono-tech text-xs tracking-widest" style={{ color: 'rgba(155,77,255,0.5)', fontSize: '9px' }}>VR CLUB · MEMBER</div>
            </div>
            <div
              className="w-8 h-8 flex items-center justify-center"
              style={{
                border: '1px solid rgba(155,77,255,0.4)',
                borderRadius: '6px',
                background: 'rgba(155,77,255,0.1)',
                animation: isBuild ? 'card-crown-pop 0.55s 0.1s cubic-bezier(0.34,1.56,0.64,1) both' : 'none',
              }}
            >
              <i className="ri-vip-crown-fill text-sm" style={{ color: '#9b4dff' }} />
            </div>
          </div>

          {/* QR + Info row */}
          <div className="relative flex items-center gap-4">
            {/* QR — bounces in */}
            <div
              className="flex-shrink-0 rounded-lg overflow-hidden flex items-center justify-center"
              style={{
                width: '88px', height: '88px',
                background: '#fff', padding: '6px',
                opacity: isBuild ? 1 : 0,
                transform: isBuild ? 'scale(1)' : 'scale(0.3)',
                transition: 'all 0.55s 0.18s cubic-bezier(0.34,1.56,0.64,1)',
              }}
            >
              <QRCodeSVG value={qrValue} size={76} bgColor="#ffffff" fgColor="#0d0030" level="M" />
            </div>

            {/* Text info */}
            <div className="flex-1 min-w-0">
              {/* Name */}
              <div
                className="font-rajdhani font-semibold text-sm mb-2 truncate"
                style={{
                  color: 'rgba(255,255,255,0.85)',
                  opacity: isBuild ? 1 : 0,
                  transform: isBuild ? 'translateX(0)' : 'translateX(14px)',
                  transition: 'all 0.4s 0.22s ease',
                }}
              >{name}</div>

              {/* Card number — types in */}
              <div
                className="font-orbitron font-black text-base"
                style={{
                  color: '#fff',
                  opacity: isDone ? 1 : 0,
                  animation: isDone ? 'card-number-type 0.5s 0.05s ease forwards' : 'none',
                  letterSpacing: '0.1em',
                }}
              >{cardNumber}</div>

              {/* Tier */}
              <div
                className="flex items-center gap-1.5 mt-3"
                style={{
                  opacity: isDone ? 1 : 0,
                  transform: isDone ? 'translateY(0)' : 'translateY(5px)',
                  transition: 'all 0.4s 0.2s ease',
                }}
              >
                <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                  <i className="ri-star-fill text-xs" style={{ color: '#ffd700' }} />
                </div>
                <span className="font-mono-tech" style={{ color: 'rgba(255,215,0,0.7)', fontSize: '9px', letterSpacing: '1px' }}>STANDARD</span>
              </div>
              <div className="font-mono-tech mt-1" style={{ color: 'rgba(255,255,255,0.22)', fontSize: '8px' }}>
                {new Date().getFullYear()} · PARADOX VR
              </div>
            </div>
          </div>

          {/* Bottom */}
          <div
            className="relative mt-4 pt-3"
            style={{
              borderTop: '1px solid rgba(155,77,255,0.15)',
              opacity: isDone ? 1 : 0,
              transform: isDone ? 'translateY(0)' : 'translateY(4px)',
              transition: 'all 0.4s 0.3s ease',
            }}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono-tech" style={{ color: 'rgba(155,77,255,0.4)', fontSize: '8px', letterSpacing: '1px' }}>ОТСКАНИРУЙ ДЛЯ ВХОДА</span>
              <div className="flex gap-1">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="rounded-full" style={{ width: '4px', height: '4px', background: `rgba(155,77,255,${0.2 + i * 0.2})` }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hint + buttons — slides up at 'done' */}
      <div
        style={{
          opacity: isDone ? 1 : 0,
          transform: isDone ? 'translateY(0)' : 'translateY(12px)',
          transition: 'all 0.5s 0.18s ease',
        }}
      >
        <p className="font-rajdhani text-sm mb-5" style={{ color: 'rgba(255,255,255,0.35)' }}>
          Сохрани карту — покажи QR-код при визите
        </p>

        <div className="flex flex-col gap-3 max-w-xs mx-auto">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3 rounded-sm flex items-center justify-center gap-2 font-orbitron font-bold text-xs tracking-wider transition-all cursor-pointer whitespace-nowrap"
            style={{
              background: saved ? 'rgba(74,222,128,0.12)' : 'rgba(0,245,255,0.08)',
              border: saved ? '1px solid rgba(74,222,128,0.5)' : '1px solid rgba(0,245,255,0.35)',
              color: saved ? '#4ade80' : '#00f5ff',
            }}
          >
            {saving ? (
              <><i className="ri-loader-4-line animate-spin" />Сохраняем...</>
            ) : saved ? (
              <><i className="ri-checkbox-circle-line" />Сохранено!</>
            ) : (
              <><i className="ri-download-2-line" />Сохранить карту как фото</>
            )}
          </button>

          <button
            onClick={onClose}
            className="w-full py-3 rounded-sm text-xs font-orbitron font-bold transition-all cursor-pointer whitespace-nowrap"
            style={{ background: 'rgba(155,77,255,0.1)', border: '1px solid rgba(155,77,255,0.3)', color: 'rgba(155,77,255,0.7)' }}
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
});
SuccessCard.displayName = 'SuccessCard';

export default RegisterModal;
