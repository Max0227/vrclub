import { useState, memo, useCallback } from 'react';
import TimeSlotPicker from './TimeSlotPicker';

export interface BookingItem {
  uid: string;
  service: string;
  date: string;
  time: string;
  vrCount: number;
  durationMinutes: number;
}

// VR duration options (1 час = 800₽, birthday = -20%)
export const VR_DURATIONS = [
  { minutes: 30, label: '30 мин', price: 400, birthdayPrice: 320 },
  { minutes: 60, label: '1 час', price: 800, birthdayPrice: 640 },
  { minutes: 120, label: '2 часа', price: 1600, birthdayPrice: 1280 },
  { minutes: 180, label: '3 часа', price: 2400, birthdayPrice: 1920 },
  { minutes: 240, label: '4 часа', price: 3200, birthdayPrice: 2560 },
];

// Club rental duration options
export const CLUB_DURATIONS = [
  { minutes: 60, label: '1 час', price: 4550, birthdayPrice: 3800 },
  { minutes: 120, label: '2 часа', price: 8000, birthdayPrice: 6800 },
  { minutes: 180, label: '3 часа', price: 11500, birthdayPrice: 9775 },
  { minutes: 240, label: '4 часа', price: 15000, birthdayPrice: 12750 },
];

// Fixed services (birthday = -20%)
const FIXED_SERVICE_PRICES: Record<string, { price: number; birthdayPrice: number; durationMinutes: number }> = {
  'MOZA 15 минут': { price: 300, birthdayPrice: 240, durationMinutes: 15 },
  'MOZA 30 минут': { price: 550, birthdayPrice: 440, durationMinutes: 30 },
  'PlayStation 5 — 1 час': { price: 350, birthdayPrice: 280, durationMinutes: 60 },
};

export function getItemPrice(item: BookingItem, isBirthday: boolean): number {
  if (item.service.startsWith('VR')) {
    const dur = VR_DURATIONS.find(d => d.minutes === item.durationMinutes);
    if (!dur) return 0;
    const base = isBirthday ? dur.birthdayPrice : dur.price;
    return base * item.vrCount;
  }
  if (item.service.startsWith('Аренда клуба')) {
    const dur = CLUB_DURATIONS.find(d => d.minutes === item.durationMinutes);
    if (!dur) return 0;
    return isBirthday ? dur.birthdayPrice : dur.price;
  }
  const p = FIXED_SERVICE_PRICES[item.service];
  if (!p) return 0;
  return isBirthday ? p.birthdayPrice : p.price;
}

export function getTotalPrice(items: BookingItem[], isBirthday: boolean): number {
  return items.reduce((acc, item) => acc + getItemPrice(item, isBirthday), 0);
}

type ServiceCategory = 'VR' | 'MOZA 15 минут' | 'MOZA 30 минут' | 'PlayStation 5 — 1 час' | 'Аренда клуба';

const SERVICES: { category: ServiceCategory; label: string; icon: string; color: string; basePrice: string; hasDuration: boolean }[] = [
  { category: 'VR', label: 'VR очки', icon: 'ri-vr-glasses-line', color: '#00f5ff', basePrice: '800 ₽/час/компл.', hasDuration: true },
  { category: 'MOZA 15 минут', label: 'MOZA 15 мин', icon: 'ri-steering-2-line', color: '#ff006e', basePrice: '300 ₽', hasDuration: false },
  { category: 'MOZA 30 минут', label: 'MOZA 30 мин', icon: 'ri-steering-2-line', color: '#ff006e', basePrice: '550 ₽', hasDuration: false },
  { category: 'PlayStation 5 — 1 час', label: 'PlayStation 5', icon: 'ri-gamepad-line', color: '#a855f7', basePrice: '350 ₽/час', hasDuration: false },
  { category: 'Аренда клуба', label: 'Аренда клуба', icon: 'ri-building-line', color: '#00f5ff', basePrice: 'от 4550 ₽', hasDuration: true },
];

const MAX_VR = 4;

function vrLabel(n: number) {
  if (n === 1) return 'комплект';
  if (n < 5) return 'комплекта';
  return 'комплектов';
}

function itemsWord(n: number): string {
  if (n === 1) return 'услуга';
  if (n < 5) return 'услуги';
  return 'услуг';
}

interface PendingState {
  category: ServiceCategory;
  date: string;
  time: string;
  vrCount: number;
  durationMinutes: number;
}

interface Props {
  items: BookingItem[];
  isBirthday: boolean;
  onAddItem: (item: BookingItem) => void;
  onRemoveItem: (uid: string) => void;
  onToggleBirthday: (val: boolean) => void;
  onNext: () => void;
}

const BookingServiceStep = memo(({ items, isBirthday, onAddItem, onRemoveItem, onToggleBirthday, onNext }: Props) => {
  const [pending, setPending] = useState<PendingState | null>(null);
  const [showTip, setShowTip] = useState(false);

  const handleSelectService = useCallback((category: ServiceCategory) => {
    const defaultDuration = category === 'VR' ? 60 : category === 'Аренда клуба' ? 120 : (FIXED_SERVICE_PRICES[category]?.durationMinutes ?? 60);
    setPending({ category, date: '', time: '', vrCount: 1, durationMinutes: defaultDuration });
  }, []);

  const handleConfirmPending = useCallback(() => {
    if (!pending?.date || !pending?.time) return;
    let serviceLabel = pending.category as string;
    if (pending.category === 'VR') {
      const dur = VR_DURATIONS.find(d => d.minutes === pending.durationMinutes);
      serviceLabel = `VR ${dur?.label ?? '1 час'}`;
    } else if (pending.category === 'Аренда клуба') {
      const dur = CLUB_DURATIONS.find(d => d.minutes === pending.durationMinutes);
      serviceLabel = `Аренда клуба ${dur?.label ?? '2 часа'}`;
    }
    onAddItem({
      uid: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      service: serviceLabel,
      date: pending.date,
      time: pending.time,
      vrCount: pending.vrCount,
      durationMinutes: pending.durationMinutes,
    });
    setPending(null);
  }, [pending, onAddItem]);

  const totalNormal = getTotalPrice(items, false);
  const totalBirthday = getTotalPrice(items, true);
  const savings = totalNormal - totalBirthday;
  const total = isBirthday ? totalBirthday : totalNormal;

  const isVRpending = pending?.category === 'VR';
  const isClubPending = pending?.category === 'Аренда клуба';

  // Calculate current pending item price
  let pendingPrice = 0;
  if (pending) {
    if (isVRpending) {
      const dur = VR_DURATIONS.find(d => d.minutes === pending.durationMinutes);
      pendingPrice = (dur?.price ?? 0) * pending.vrCount;
    } else if (isClubPending) {
      const dur = CLUB_DURATIONS.find(d => d.minutes === pending.durationMinutes);
      pendingPrice = dur?.price ?? 0;
    } else {
      pendingPrice = FIXED_SERVICE_PRICES[pending.category]?.price ?? 0;
    }
  }

  return (
    <div className="space-y-4">
      {/* Order list */}
      {items.length > 0 && (
        <div className="space-y-2">
          <label className="font-mono-tech text-xs text-white/45 block" style={{ fontSize: '10px', letterSpacing: '1px' }}>ВАШ ЗАКАЗ</label>
          {items.map((item) => {
            const svc = SERVICES.find(s => item.service.startsWith(s.category === 'VR' ? 'VR' : s.category === 'Аренда клуба' ? 'Аренда' : s.category));
            const itemPrice = getItemPrice(item, isBirthday);
            const normalPrice = getItemPrice(item, false);
            return (
              <div key={item.uid} className="flex items-center gap-3 p-3 rounded-sm"
                style={{ background: 'rgba(0,245,255,0.04)', border: '1px solid rgba(0,245,255,0.15)' }}>
                <div className="w-8 h-8 flex items-center justify-center rounded-sm flex-shrink-0"
                  style={{ background: `${svc?.color ?? '#00f5ff'}15`, border: `1px solid ${svc?.color ?? '#00f5ff'}30` }}>
                  <i className={`${svc?.icon ?? 'ri-gamepad-line'} text-sm`} style={{ color: svc?.color ?? '#00f5ff' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-rajdhani font-bold text-white text-sm whitespace-nowrap overflow-hidden text-ellipsis">{item.service}</p>
                  <p className="font-mono-tech" style={{ fontSize: '10px', color: '#00f5ff' }}>
                    {item.date.split('-').reverse().slice(0, 2).join('.')} в {item.time}
                    {item.service.startsWith('VR') && ` · ${item.vrCount} ${vrLabel(item.vrCount)}`}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  {isBirthday && normalPrice !== itemPrice ? (
                    <>
                      <p className="font-mono-tech line-through" style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px' }}>{normalPrice} ₽</p>
                      <p className="font-orbitron font-bold text-sm" style={{ color: '#00f5ff' }}>{itemPrice} ₽</p>
                    </>
                  ) : (
                    <p className="font-orbitron font-bold text-sm" style={{ color: '#00f5ff' }}>{itemPrice} ₽</p>
                  )}
                </div>
                <button type="button" onClick={() => onRemoveItem(item.uid)}
                  className="text-white/20 hover:text-white/60 transition-colors cursor-pointer flex-shrink-0 w-6 h-6 flex items-center justify-center">
                  <i className="ri-close-line text-sm" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Pending item picker */}
      {pending ? (
        <div className="rounded-sm overflow-visible" style={{ border: '1px solid rgba(0,245,255,0.3)', background: 'rgba(0,245,255,0.02)' }}>
          <div className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: '1px solid rgba(0,245,255,0.15)', background: 'rgba(0,245,255,0.06)' }}>
            <div className="flex items-center gap-2">
              <i className={`${SERVICES.find(s => s.category === pending.category)?.icon ?? 'ri-gamepad-line'} text-sm`} style={{ color: '#00f5ff' }} />
              <span className="font-rajdhani font-bold text-white text-sm">
                {SERVICES.find(s => s.category === pending.category)?.label}
              </span>
              <span className="font-mono-tech" style={{ fontSize: '10px', color: 'rgba(0,245,255,0.6)' }}>
                {pendingPrice} ₽{isVRpending ? '/компл.' : ''}
              </span>
            </div>
            <button type="button" onClick={() => setPending(null)}
              className="text-white/30 hover:text-white/70 cursor-pointer transition-colors w-6 h-6 flex items-center justify-center">
              <i className="ri-close-line text-sm" />
            </button>
          </div>

          <div className="p-4 space-y-4">
            {/* VR Duration selector */}
            {isVRpending && (
              <div>
                <label className="font-mono-tech text-xs text-white/45 block mb-2" style={{ fontSize: '10px', letterSpacing: '1px' }}>
                  ДЛИТЕЛЬНОСТЬ
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {VR_DURATIONS.map(dur => {
                    const isActive = pending.durationMinutes === dur.minutes;
                    return (
                      <button key={dur.minutes} type="button"
                        onClick={() => setPending(p => p ? { ...p, durationMinutes: dur.minutes, time: '' } : p)}
                        className="py-2.5 rounded-sm flex flex-col items-center gap-0.5 transition-all cursor-pointer"
                        style={{
                          background: isActive ? 'rgba(0,245,255,0.14)' : 'rgba(0,245,255,0.03)',
                          border: `1px solid ${isActive ? 'rgba(0,245,255,0.6)' : 'rgba(0,245,255,0.15)'}`,
                          boxShadow: isActive ? '0 0 12px rgba(0,245,255,0.18)' : 'none',
                        }}>
                        <span className="font-orbitron font-bold" style={{ fontSize: '11px', color: isActive ? '#fff' : 'rgba(255,255,255,0.4)' }}>
                          {dur.label}
                        </span>
                        <span className="font-mono-tech" style={{ fontSize: '9px', color: isActive ? '#00f5ff' : 'rgba(255,255,255,0.25)' }}>
                          {dur.price} ₽
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Club Duration selector */}
            {isClubPending && (
              <div>
                <label className="font-mono-tech text-xs text-white/45 block mb-2" style={{ fontSize: '10px', letterSpacing: '1px' }}>
                  ДЛИТЕЛЬНОСТЬ АРЕНДЫ
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {CLUB_DURATIONS.map(dur => {
                    const isActive = pending.durationMinutes === dur.minutes;
                    return (
                      <button key={dur.minutes} type="button"
                        onClick={() => setPending(p => p ? { ...p, durationMinutes: dur.minutes, time: '' } : p)}
                        className="py-2.5 rounded-sm flex flex-col items-center gap-0.5 transition-all cursor-pointer"
                        style={{
                          background: isActive ? 'rgba(0,245,255,0.14)' : 'rgba(0,245,255,0.03)',
                          border: `1px solid ${isActive ? 'rgba(0,245,255,0.6)' : 'rgba(0,245,255,0.15)'}`,
                          boxShadow: isActive ? '0 0 12px rgba(0,245,255,0.18)' : 'none',
                        }}>
                        <span className="font-orbitron font-bold" style={{ fontSize: '11px', color: isActive ? '#fff' : 'rgba(255,255,255,0.4)' }}>
                          {dur.label}
                        </span>
                        <span className="font-mono-tech" style={{ fontSize: '9px', color: isActive ? '#00f5ff' : 'rgba(255,255,255,0.25)' }}>
                          {dur.price} ₽
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* VR count */}
            {isVRpending && (
              <div>
                <label className="font-mono-tech text-xs text-white/45 block mb-2" style={{ fontSize: '10px', letterSpacing: '1px' }}>
                  КОЛИЧЕСТВО КОМПЛЕКТОВ <span style={{ color: 'rgba(0,245,255,0.5)' }}>· ВСЕГО {MAX_VR} В КЛУБЕ</span>
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4].map(n => {
                    const isActive = pending.vrCount === n;
                    const dur = VR_DURATIONS.find(d => d.minutes === pending.durationMinutes);
                    const itemCost = (dur?.price ?? 0) * n;
                    return (
                      <button key={n} type="button"
                        onClick={() => setPending(p => p ? { ...p, vrCount: n, time: '' } : p)}
                        className="flex-1 py-3 rounded-sm flex flex-col items-center gap-1 transition-all cursor-pointer"
                        style={{
                          background: isActive ? 'rgba(0,245,255,0.14)' : 'rgba(0,245,255,0.03)',
                          border: `1px solid ${isActive ? 'rgba(0,245,255,0.6)' : 'rgba(0,245,255,0.15)'}`,
                          boxShadow: isActive ? '0 0 12px rgba(0,245,255,0.18)' : 'none',
                        }}>
                        <div className="flex gap-0.5 flex-wrap justify-center">
                          {Array.from({ length: n }).map((_, idx) => (
                            <i key={idx} className="ri-vr-glasses-line"
                              style={{ fontSize: '12px', color: isActive ? '#00f5ff' : 'rgba(0,245,255,0.3)' }} />
                          ))}
                        </div>
                        <span className="font-orbitron font-bold" style={{ fontSize: '13px', color: isActive ? '#fff' : 'rgba(255,255,255,0.35)' }}>{n}</span>
                        <span className="font-mono-tech" style={{ fontSize: '8px', color: isActive ? 'rgba(0,245,255,0.7)' : 'rgba(255,255,255,0.2)', letterSpacing: '0.5px' }}>
                          КОМПЛ.
                        </span>
                        <span className="font-mono-tech" style={{ fontSize: '9px', color: isActive ? '#00f5ff' : 'rgba(255,255,255,0.25)' }}>
                          {itemCost} ₽
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <TimeSlotPicker
              service={pending.category === 'VR' ? 'VR' : pending.category === 'Аренда клуба' ? 'Аренда всего клуба' : pending.category}
              vrCount={pending.vrCount}
              durationMinutes={pending.durationMinutes}
              selectedDate={pending.date}
              selectedTime={pending.time}
              onDateChange={(date) => setPending(p => p ? { ...p, date, time: '' } : p)}
              onTimeChange={(time) => setPending(p => p ? { ...p, time } : p)}
            />

            <button type="button" onClick={handleConfirmPending}
              disabled={!pending.date || !pending.time}
              className="w-full py-3 rounded-sm text-sm font-orbitron font-bold flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap"
              style={{
                background: pending.date && pending.time ? 'rgba(0,245,255,0.15)' : 'rgba(0,245,255,0.03)',
                border: `1px solid ${pending.date && pending.time ? 'rgba(0,245,255,0.5)' : 'rgba(0,245,255,0.15)'}`,
                color: pending.date && pending.time ? '#00f5ff' : 'rgba(0,245,255,0.3)',
                opacity: !pending.date || !pending.time ? 0.6 : 1,
              }}>
              {pending.date && pending.time ? (
                <><i className="ri-add-line" />Добавить · {pending.date.split('-').reverse().slice(0, 2).join('.')} в {pending.time}</>
              ) : (
                <>Выберите дату и время</>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div>
          <label className="font-mono-tech text-xs text-white/45 block mb-2" style={{ fontSize: '10px', letterSpacing: '1px' }}>
            {items.length > 0 ? '+ ДОБАВИТЬ ЕЩЁ УСЛУГУ' : 'ВЫБЕРИТЕ УСЛУГИ'}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {SERVICES.map(s => (
              <button key={s.category} type="button" onClick={() => handleSelectService(s.category)}
                className="py-3 px-3 rounded-sm text-left transition-all duration-200 cursor-pointer"
                style={{ background: 'rgba(0,245,255,0.02)', border: '1px solid rgba(0,245,255,0.12)' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = `${s.color}50`)}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(0,245,255,0.12)')}
              >
                <i className={`${s.icon} text-sm block mb-1.5`} style={{ color: s.color }} />
                <span className="font-rajdhani text-xs leading-tight block text-white/60 mb-1">{s.label}</span>
                <span className="font-orbitron" style={{ color: s.color, fontSize: '11px' }}>
                  {s.basePrice}
                </span>
                {s.hasDuration && (
                  <span className="font-mono-tech block mt-0.5" style={{ fontSize: '8px', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.5px' }}>
                    ВЫБОР ДЛИТЕЛЬНОСТИ
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Price block + birthday toggle */}
      {items.length > 0 && !pending && (
        <div className="rounded-sm" style={{ background: 'rgba(0,245,255,0.04)', border: '1px solid rgba(0,245,255,0.15)' }}>
          {/* Birthday toggle row */}
          <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: '1px solid rgba(0,245,255,0.1)' }}>
            <button type="button" onClick={() => onToggleBirthday(!isBirthday)}
              className="relative flex-shrink-0 rounded-full transition-all duration-200 cursor-pointer"
              style={{ width: '44px', height: '24px', background: isBirthday ? 'rgba(0,245,255,0.25)' : 'rgba(255,255,255,0.1)', border: `1px solid ${isBirthday ? '#00f5ff' : 'rgba(255,255,255,0.2)'}` }}
              aria-label="День рождения">
              <span className="absolute top-0.5 w-5 h-5 rounded-full transition-all duration-200"
                style={{ left: isBirthday ? '19px' : '2px', background: isBirthday ? '#00f5ff' : 'rgba(255,255,255,0.4)' }} />
            </button>
            <span className="font-rajdhani font-semibold text-sm" style={{ color: isBirthday ? '#00f5ff' : 'rgba(255,255,255,0.6)' }}>
              День рождения
            </span>
            {isBirthday && (
              <span className="px-2 py-0.5 rounded font-orbitron font-bold"
                style={{ background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.4)', color: '#4ade80', fontSize: '10px' }}>
                −20%
              </span>
            )}
            <div className="relative">
              <button type="button" onClick={() => setShowTip(v => !v)}
                className="w-5 h-5 flex items-center justify-center rounded-full cursor-pointer transition-colors flex-shrink-0"
                style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.4)' }}>
                <i className="ri-question-line" style={{ fontSize: '11px' }} />
              </button>
              {showTip && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowTip(false)} />
                  <div className="absolute top-7 left-0 w-64 p-3 rounded-sm z-50 text-xs font-rajdhani leading-relaxed"
                    style={{ background: '#0a0025', border: '1px solid rgba(0,245,255,0.35)', color: 'rgba(255,255,255,0.8)', boxShadow: '0 4px 24px rgba(0,0,0,0.7)' }}>
                    <p className="font-bold" style={{ color: '#00f5ff' }}>Скидка −20% в день рождения</p>
                    <p className="mt-1.5">Действует только в сам день рождения. Предъяви паспорт или свидетельство о рождении администратору на ресепшен.</p>
                    <p className="mt-1.5" style={{ color: 'rgba(255,200,0,0.8)' }}>Скидка не суммируется с другими акциями. Оплата по факту на месте.</p>
                    <button type="button" onClick={() => setShowTip(false)}
                      className="absolute top-1.5 right-1.5 text-white/30 hover:text-white/60 cursor-pointer w-4 h-4 flex items-center justify-center">
                      <i className="ri-close-line" style={{ fontSize: '11px' }} />
                    </button>
                  </div>
                </>
              )}
            </div>
            {isBirthday && savings > 0 && (
              <span className="ml-auto font-mono-tech text-xs" style={{ color: '#4ade80', fontSize: '11px' }}>−{savings} ₽</span>
            )}
          </div>

          {/* Price rows */}
          {items.length > 1 && (
            <div className="px-4 pt-3 space-y-1.5">
              {items.map(item => (
                <div key={item.uid} className="flex items-center justify-between">
                  <span className="font-rajdhani text-xs text-white/40 truncate max-w-[180px]">
                    {item.service}{item.service.startsWith('VR') ? ` ×${item.vrCount}` : ''}
                  </span>
                  <span className="font-mono-tech text-xs text-white/50" style={{ fontSize: '11px' }}>
                    {getItemPrice(item, isBirthday)} ₽
                  </span>
                </div>
              ))}
              <div className="h-px mt-2" style={{ background: 'rgba(0,245,255,0.1)' }} />
            </div>
          )}

          {/* Total */}
          <div className="px-4 py-3 flex items-center justify-between">
            <span className="font-mono-tech text-xs" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', letterSpacing: '1px' }}>
              ИТОГО К ОПЛАТЕ
            </span>
            <div className="flex items-baseline gap-2">
              {isBirthday && savings > 0 && (
                <span className="font-mono-tech line-through" style={{ color: 'rgba(255,255,255,0.25)', fontSize: '12px' }}>{totalNormal} ₽</span>
              )}
              <span className="font-orbitron font-bold text-xl" style={{ color: '#00f5ff' }}>{total} ₽</span>
            </div>
          </div>
        </div>
      )}

      {/* Next button */}
      {items.length > 0 && !pending && (
        <button type="button" onClick={onNext}
          className="w-full py-3.5 rounded-sm text-sm flex items-center justify-center gap-2 font-orbitron font-bold transition-all cursor-pointer whitespace-nowrap"
          style={{ background: 'rgba(0,245,255,0.12)', border: '1px solid rgba(0,245,255,0.5)', color: '#00f5ff' }}>
          <i className="ri-arrow-right-line" />
          Продолжить — {items.length} {itemsWord(items.length)} · {total} ₽
        </button>
      )}
    </div>
  );
});
BookingServiceStep.displayName = 'BookingServiceStep';

export default BookingServiceStep;