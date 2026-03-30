import { useState, useCallback, useEffect, memo } from 'react';
import { supabase } from '../../../lib/supabase';
import BookingServiceStep, { BookingItem, getTotalPrice, getItemPrice } from './BookingServiceStep';
import { generateBookingPng } from './generateBookingPng';

const MAX_LINK = 'https://max.ru/u/f9LHodD0cOKWJo7eQiYHPywhtGUXtiX40o8Na8eR6jKCMNRpsNgDUk5doGg';
const MAX_ICON = 'https://storage.readdy-site.link/project_files/af3cd35d-3e8e-4232-8f1f-1d33bf236cc8/82d5ad42-8081-4413-a1d6-09b0aa2a0be7_MAX.jpg?v=ec55d078d68434f28e45c6897811f4ef';
const ADMIN_EMAIL = 'paradoxclub54@gmail.com';

const GUEST_OPTIONS = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1),
  label: `${i + 1} ${i === 0 ? 'человек' : i < 4 ? 'человека' : 'человек'}`,
}));

interface FormState {
  name: string;
  phone: string;
  guests: string;
  comment: string;
}

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedService?: string;
}

type Step = 'services' | 'info';

const BookingModal = memo(({ isOpen, onClose, selectedService }: BookingModalProps) => {
  const [step, setStep] = useState<Step>('services');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isBirthday, setIsBirthday] = useState(false);
  const [items, setItems] = useState<BookingItem[]>([]);
  const [form, setForm] = useState<FormState>({ name: '', phone: '', guests: '1', comment: '' });

  // Pre-select service if provided
  const [prevSelectedService, setPrevSelectedService] = useState(selectedService);
  if (selectedService !== prevSelectedService) {
    setPrevSelectedService(selectedService);
  }

  const handleClose = useCallback(() => {
    if (!loading) {
      setSent(false);
      setStep('services');
      setItems([]);
      setIsBirthday(false);
      setForm({ name: '', phone: '', guests: '1', comment: '' });
      onClose();
    }
  }, [loading, onClose]);

  const handleAddItem = useCallback((item: BookingItem) => {
    setItems(prev => [...prev, item]);
  }, []);

  const handleRemoveItem = useCallback((uid: string) => {
    setItems(prev => prev.filter(i => i.uid !== uid));
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Insert each booking item as separate row
      for (const item of items) {
        await supabase.from('bookings').insert({
          name: form.name,
          phone: form.phone,
          email: null,
          service: item.service,
          booking_date: item.date,
          booking_time: item.time,
          guests: parseInt(form.guests, 10),
          vr_count: item.service.startsWith('VR') ? item.vrCount : 1,
          duration_minutes: item.durationMinutes,
          comment: form.comment || null,
          status: 'pending',
        });
      }

      const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL;
      const total = getTotalPrice(items, isBirthday);
      const totalNormal = getTotalPrice(items, false);

      const supabaseKey = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY as string;
      await fetch(`${supabaseUrl}/functions/v1/send-booking-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          items: items.map(item => ({
            service: item.service,
            date: item.date,
            time: item.time,
            vrCount: item.service.startsWith('VR') ? item.vrCount : null,
            price: getItemPrice(item, isBirthday),
          })),
          guests: form.guests,
          isBirthday,
          total,
          totalNormal,
          comment: form.comment || '',
          adminEmail: ADMIN_EMAIL,
        }),
      });
    } catch {
      // silent fail - booking saved to DB anyway
    } finally {
      setLoading(false);
      setSent(true);
    }
  }, [form, items, isBirthday]);

  if (!isOpen) return null;

  const total = getTotalPrice(items, isBirthday);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(1,0,20,0.94)' }}
      onClick={(e) => e.target === e.currentTarget && handleClose()}
      role="dialog"
      aria-modal="true"
      aria-label="Онлайн запись"
    >
      <div
        className="relative w-full max-w-xl rounded-lg overflow-hidden"
        style={{ background: '#06001e', border: '1px solid rgba(0,245,255,0.35)', maxHeight: '92vh', overflowY: 'auto' }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4"
          style={{ background: '#06001e', borderBottom: '1px solid rgba(0,245,255,0.15)' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center rounded-sm"
              style={{ border: '1px solid rgba(0,245,255,0.4)', background: 'rgba(0,245,255,0.08)' }}>
              <i className="ri-calendar-check-line text-sm" style={{ color: '#00f5ff' }} />
            </div>
            <div>
              <h2 className="font-orbitron font-bold text-white text-sm tracking-wider">ОНЛАЙН ЗАПИСЬ</h2>
              <p className="font-mono-tech text-xs" style={{ color: '#00f5ff', opacity: 0.7, fontSize: '10px' }}>PARADOX VR CLUB · НСК</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {!sent && step === 'info' && (
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(0,245,255,0.07)', border: '1px solid rgba(0,245,255,0.2)' }}>
                <span className="font-orbitron font-bold text-xs" style={{ color: '#00f5ff', fontSize: '11px' }}>{total} ₽</span>
              </div>
            )}
            <button onClick={handleClose}
              className="w-8 h-8 flex items-center justify-center cursor-pointer text-white/40 hover:text-white transition-colors rounded hover:bg-white/10"
              aria-label="Закрыть">
              <i className="ri-close-line text-lg" />
            </button>
          </div>
        </div>

        <div className="px-6 py-5">
          {sent ? (
            <SuccessState items={items} form={form} isBirthday={isBirthday} onClose={handleClose} />
          ) : (
            <>
              {/* Step indicator */}
              {step === 'info' && (
                <div className="flex items-center gap-2 mb-5">
                  <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => setStep('services')}>
                    <div className="w-6 h-6 rounded-full flex items-center justify-center font-mono-tech"
                      style={{ background: 'rgba(0,245,255,0.1)', border: '1px solid rgba(0,245,255,0.5)', color: 'rgba(0,245,255,0.7)', fontSize: '10px' }}>✓</div>
                    <span className="font-mono-tech text-xs" style={{ color: 'rgba(0,245,255,0.5)', fontSize: '10px' }}>УСЛУГИ</span>
                  </div>
                  <div className="flex-1 h-px" style={{ background: 'rgba(0,245,255,0.2)' }} />
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center font-mono-tech"
                      style={{ background: 'rgba(0,245,255,0.15)', border: '1px solid #00f5ff', color: '#00f5ff', fontSize: '10px' }}>2</div>
                    <span className="font-mono-tech text-xs" style={{ color: '#00f5ff', fontSize: '10px' }}>КОНТАКТЫ</span>
                  </div>
                </div>
              )}

              {step === 'services' ? (
                <BookingServiceStep
                  items={items}
                  isBirthday={isBirthday}
                  onAddItem={handleAddItem}
                  onRemoveItem={handleRemoveItem}
                  onToggleBirthday={setIsBirthday}
                  onNext={() => setStep('info')}
                />
              ) : (
                <InfoStep
                  form={form}
                  items={items}
                  isBirthday={isBirthday}
                  total={total}
                  loading={loading}
                  onChange={handleChange}
                  onSubmit={handleSubmit}
                  onBack={() => setStep('services')}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
});
BookingModal.displayName = 'BookingModal';

// ─── Info Step ───────────────────────────────────────────────────────────────
interface InfoStepProps {
  form: FormState;
  items: BookingItem[];
  isBirthday: boolean;
  total: number;
  loading: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
}

const InfoStep = memo(({ form, items, isBirthday, total, loading, onChange, onSubmit, onBack }: InfoStepProps) => (
  <form onSubmit={onSubmit} data-readdy-form className="space-y-4">
    {/* Booking summary */}
    <div className="p-3 rounded-sm space-y-2" style={{ background: 'rgba(0,245,255,0.05)', border: '1px solid rgba(0,245,255,0.15)' }}>
      {items.map((item) => (
        <div key={item.uid} className="flex items-center justify-between font-mono-tech" style={{ fontSize: '11px' }}>
          <span style={{ color: 'rgba(255,255,255,0.6)' }}>
            {item.service}{item.service.startsWith('VR') ? ` ×${item.vrCount}` : ''}
          </span>
          <span style={{ color: '#00f5ff' }}>
            {item.date.split('-').reverse().slice(0, 2).join('.')} в {item.time}
          </span>
        </div>
      ))}
      <div className="flex items-center justify-between pt-1" style={{ borderTop: '1px solid rgba(0,245,255,0.1)' }}>
        <span className="font-mono-tech text-xs" style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px' }}>ИТОГО</span>
        <span className="font-orbitron font-bold text-base" style={{ color: '#00f5ff' }}>
          {total} ₽ {isBirthday && <span className="font-rajdhani text-xs" style={{ color: '#4ade80', fontWeight: 400 }}>🎂 скидка</span>}
        </span>
      </div>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label className="font-mono-tech text-xs text-white/45 block mb-1.5" style={{ fontSize: '10px', letterSpacing: '1px' }}>ИМЯ *</label>
        <input required name="name" value={form.name} onChange={onChange} className="cyber-input" placeholder="Ваше имя" autoComplete="given-name" />
      </div>
      <div>
        <label className="font-mono-tech text-xs text-white/45 block mb-1.5" style={{ fontSize: '10px', letterSpacing: '1px' }}>ТЕЛЕФОН *</label>
        <input required name="phone" value={form.phone} onChange={onChange} className="cyber-input" placeholder="+7 (___) ___-__-__" type="tel" autoComplete="tel" />
      </div>
    </div>

    <div>
      <label className="font-mono-tech text-xs text-white/45 block mb-1.5" style={{ fontSize: '10px', letterSpacing: '1px' }}>КОЛИЧЕСТВО ГОСТЕЙ</label>
      <select name="guests" value={form.guests} onChange={onChange} className="cyber-input cursor-pointer">
        {GUEST_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>

    <div>
      <label className="font-mono-tech text-xs text-white/45 block mb-1.5" style={{ fontSize: '10px', letterSpacing: '1px' }}>КОММЕНТАРИЙ</label>
      <textarea name="comment" value={form.comment} onChange={onChange} className="cyber-input resize-none" rows={2}
        placeholder="Пожелания, вопросы..." maxLength={500} />
      {form.comment.length > 0 && (
        <p className="text-right font-mono-tech mt-0.5" style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)' }}>{form.comment.length}/500</p>
      )}
    </div>

    <div className="flex gap-3">
      <button type="button" onClick={onBack}
        className="px-4 py-3.5 rounded-sm text-sm flex items-center gap-2 cursor-pointer transition-colors whitespace-nowrap"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}>
        <i className="ri-arrow-left-line" />
      </button>
      <button type="submit" disabled={loading}
        className="btn-cyber-pink flex-1 py-3.5 rounded-sm text-sm flex items-center justify-center gap-2 whitespace-nowrap"
        style={{ opacity: loading ? 0.7 : 1 }}>
        {loading
          ? <><i className="ri-loader-4-line animate-spin" />Отправка...</>
          : <><i className="ri-send-plane-line" />Забронировать · {total} ₽</>}
      </button>
    </div>

    <div className="flex items-center gap-2 px-3 py-2 rounded-sm" style={{ background: 'rgba(0,245,255,0.04)', border: '1px solid rgba(0,245,255,0.12)' }}>
      <i className="ri-checkbox-circle-line text-xs flex-shrink-0" style={{ color: '#00f5ff' }} />
      <p className="font-rajdhani text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
        Регистрация <strong style={{ color: 'rgba(255,255,255,0.7)' }}>не требуется</strong>. Мы перезвоним для подтверждения.
      </p>
    </div>

    <div className="flex items-center justify-center gap-4 pt-1">
      <a href="tel:+79232440220" className="flex items-center gap-1.5 text-white/35 hover:text-white/70 transition-colors font-rajdhani text-xs">
        <i className="ri-phone-line text-xs" />+7 923 244-02-20
      </a>
      <span className="text-white/20 text-xs">·</span>
      <a href={MAX_LINK} target="_blank" rel="noopener noreferrer"
        className="flex items-center gap-1.5 text-white/35 hover:text-orange-400 transition-colors font-rajdhani text-xs">
        <img src={MAX_ICON} alt="MAX" className="w-3.5 h-3.5 rounded-sm object-cover" />MAX
      </a>
    </div>
  </form>
));
InfoStep.displayName = 'InfoStep';

// ─── Success ──────────────────────────────────────────────────────────────────
interface SuccessStateProps {
  items: BookingItem[];
  form: FormState;
  isBirthday: boolean;
  onClose: () => void;
}

const SuccessState = memo(({ items, form, isBirthday, onClose }: SuccessStateProps) => {
  const total = getTotalPrice(items, isBirthday);
  const [loyaltyCard, setLoyaltyCard] = useState<string | null>(null);
  const [cardChecked, setCardChecked] = useState(false);
  const [pngLoading, setPngLoading] = useState(false);

  // Check if phone matches a loyalty card
  useEffect(() => {
    const check = async () => {
      if (!form.phone) { setCardChecked(true); return; }
      const normalized = form.phone.replace(/[\s\-()]/g, '');
      const { data } = await supabase
        .from('loyalty_cards')
        .select('card_number')
        .eq('phone', normalized)
        .maybeSingle();
      setLoyaltyCard(data?.card_number ?? null);
      setCardChecked(true);
    };
    check();
  }, [form.phone]);

  const handleDownloadPng = useCallback(async () => {
    setPngLoading(true);
    try {
      await generateBookingPng({
        items,
        name: form.name,
        phone: form.phone,
        guests: form.guests,
        comment: form.comment,
        isBirthday,
        loyaltyCardNumber: loyaltyCard,
      });
    } finally {
      setPngLoading(false);
    }
  }, [items, form, isBirthday, loyaltyCard]);

  const qrLink = loyaltyCard
    ? `${window.location.origin}/loyalty/admin?client=${encodeURIComponent(loyaltyCard)}`
    : null;
  const qrImgUrl = qrLink
    ? `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(qrLink)}&format=png&margin=6`
    : null;

  return (
    <div className="text-center py-8">
      <div className="w-16 h-16 flex items-center justify-center rounded-full mx-auto mb-5"
        style={{ border: '2px solid #00f5ff', background: 'rgba(0,245,255,0.08)' }}>
        <i className="ri-check-line text-3xl" style={{ color: '#00f5ff' }} />
      </div>
      <h3 className="font-orbitron font-bold text-white text-lg mb-2">Бронирование принято!</h3>
      <p className="text-white/40 font-rajdhani text-sm mb-4">Мы свяжемся с вами для подтверждения.</p>

      {/* Booking summary */}
      <div className="my-4 p-4 rounded-sm mx-auto max-w-xs space-y-2"
        style={{ background: 'rgba(0,245,255,0.05)', border: '1px solid rgba(0,245,255,0.2)' }}>
        {items.map((item) => (
          <div key={item.uid} className="text-left">
            <div className="font-rajdhani font-bold text-white text-sm">{item.service}</div>
            <div className="font-mono-tech text-xs" style={{ color: '#00f5ff' }}>
              {item.date.split('-').reverse().join('.')} в {item.time}
              {item.service.startsWith('VR') && ` · ${item.vrCount} комплект${item.vrCount > 1 ? 'а' : ''}`}
            </div>
          </div>
        ))}
        <div className="flex items-center justify-between pt-2" style={{ borderTop: '1px solid rgba(0,245,255,0.15)' }}>
          <span className="font-mono-tech text-xs text-white/40" style={{ fontSize: '10px' }}>ИТОГО</span>
          <span className="font-orbitron font-bold" style={{ color: '#00f5ff' }}>{total} ₽</span>
        </div>
      </div>

      <p className="font-mono-tech text-xs mb-5" style={{ color: '#00f5ff' }}>+7 923 244-02-20</p>

      {/* Loyalty card QR — shown only if registered */}
      {cardChecked && loyaltyCard && qrImgUrl && (
        <div className="mx-auto max-w-xs mb-5 rounded-lg overflow-hidden"
          style={{ background: 'rgba(0,245,255,0.04)', border: '1px solid rgba(0,245,255,0.25)' }}>
          <div className="flex items-center justify-center gap-2 px-3 py-2.5"
            style={{ background: 'rgba(0,245,255,0.07)', borderBottom: '1px solid rgba(0,245,255,0.12)' }}>
            <i className="ri-vip-crown-line text-xs" style={{ color: '#00f5ff' }} />
            <span className="font-orbitron font-bold text-xs tracking-wider" style={{ color: '#00f5ff' }}>
              КАРТА КЛУБА
            </span>
          </div>
          <div className="px-4 pt-3 pb-4">
            <p className="font-rajdhani text-white/50 text-xs mb-3 leading-relaxed">
              Покажи QR-код администратору на ресепшен — он сразу откроет твою карту
            </p>
            <div className="flex justify-center mb-2">
              <div className="p-2 rounded-lg" style={{ background: '#ffffff' }}>
                <img src={qrImgUrl} alt="QR карты лояльности" width={130} height={130} className="block" />
              </div>
            </div>
            <div className="font-mono-tech text-white/30 text-center mt-2" style={{ fontSize: '9px' }}>
              {loyaltyCard}
            </div>
          </div>
        </div>
      )}

      {/* PNG download */}
      <button
        type="button"
        onClick={handleDownloadPng}
        disabled={pngLoading || !cardChecked}
        className="w-full max-w-xs mx-auto mb-2 py-3 rounded-sm text-sm font-orbitron font-bold flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 whitespace-nowrap"
        style={{ background: 'rgba(0,245,255,0.12)', border: '1px solid rgba(0,245,255,0.5)', color: '#00f5ff' }}
      >
        {pngLoading
          ? <><i className="ri-loader-4-line animate-spin text-base" />Создаём картинку...</>
          : <><i className="ri-image-download-line text-base" />Скачать PNG-запись</>
        }
      </button>
      <p className="font-rajdhani text-xs text-white/30 mb-5">
        Сохрани или покажи администратору на ресепшен
        {loyaltyCard && ' · карта клуба включена'}
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <a href="tel:+79232440220" className="btn-cyber-cyan px-6 py-2.5 rounded-sm text-xs inline-flex items-center justify-center gap-2 whitespace-nowrap">
          <i className="ri-phone-line" />Позвонить
        </a>
        <a href={MAX_LINK} target="_blank" rel="noopener noreferrer"
          className="px-6 py-2.5 rounded-sm text-xs inline-flex items-center justify-center gap-2 font-orbitron font-bold cursor-pointer whitespace-nowrap"
          style={{ background: 'rgba(255,106,0,0.12)', border: '1px solid rgba(255,106,0,0.5)', color: '#ff6a00' }}>
          <img src={MAX_ICON} alt="MAX" className="w-4 h-4 rounded-sm object-cover" />Написать в MAX
        </a>
        <button onClick={onClose} className="btn-cyber-pink px-6 py-2.5 rounded-sm text-xs cursor-pointer whitespace-nowrap">Закрыть</button>
      </div>
    </div>
  );
});
SuccessState.displayName = 'SuccessState';

export default BookingModal;
