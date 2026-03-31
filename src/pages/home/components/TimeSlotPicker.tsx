import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../../lib/supabase';

const TIME_SLOTS = [
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00', '19:30', '20:00', '20:30',
  '21:00', '21:30',
];

const MAX_VR = 4;
const BUFFER_MINUTES = 30; // время на уборку между сессиями

// Fallback durations for bookings stored in DB
export const SERVICE_DURATIONS: Record<string, number> = {
  'VR 30 минут': 30,
  'VR 30 мин': 30,
  'VR 1 час': 60,
  'VR 2 часа': 120,
  'VR 3 часа': 180,
  'VR 4 часа': 240,
  'MOZA 15 минут': 15,
  'MOZA 30 минут': 30,
  'PlayStation 5 — 1 час': 60,
  'Аренда всего клуба': 120,
  'Аренда клуба 1 час': 60,
  'Аренда клуба 2 часа': 120,
  'Аренда клуба 3 часа': 180,
  'Аренда клуба 4 часа': 240,
};

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

type BookingRow = {
  booking_time: string;
  service: string;
  vr_count: number | null;
  duration_minutes: number | null;
};

type SlotState =
  | { kind: 'past' }
  | { kind: 'cleanup' }
  | { kind: 'full' }
  | { kind: 'partial'; vrAvailable: number }
  | { kind: 'free'; vrAvailable?: number };

function getStoredDuration(service: string, stored: number | null): number {
  if (stored) return stored;
  return SERVICE_DURATIONS[service] ?? 60;
}

function computeSlotState(
  slot: string,
  bookings: BookingRow[],
  service: string,
  vrCount: number,
  serviceDuration: number,
  isToday: boolean,
  currentMinutes: number,
): SlotState {
  const slotMin = timeToMinutes(slot);
  if (isToday && slotMin <= currentMinutes) return { kind: 'past' };

  const isVR = service === 'VR' || service.startsWith('VR');
  const isClub = service === 'Аренда всего клуба' || service.startsWith('Аренда клуба');

  // Check if slot is inside any club rental window (+ 30 min cleanup)
  for (const b of bookings) {
    const isClubBooking = b.service === 'Аренда всего клуба' || b.service.startsWith('Аренда клуба');
    if (!isClubBooking) continue;
    const bStart = timeToMinutes(b.booking_time.slice(0, 5));
    const bEnd = bStart + getStoredDuration(b.service, b.duration_minutes) + BUFFER_MINUTES;
    if (slotMin >= bStart && slotMin < bEnd) return { kind: 'cleanup' };
  }

  // Club rental: check overlap with ALL existing bookings
  if (isClub) {
    const slotEnd = slotMin + serviceDuration + BUFFER_MINUTES;
    for (const b of bookings) {
      const bStart = timeToMinutes(b.booking_time.slice(0, 5));
      const bDur = getStoredDuration(b.service, b.duration_minutes);
      const bEnd = bStart + bDur;
      if (slotMin < bEnd && slotEnd > bStart) return { kind: 'full' };
    }
    return { kind: 'free' };
  }

  // VR: count remaining VR sets across overlapping bookings
  // ✅ ИСПРАВЛЕНО: добавлен BUFFER_MINUTES для уборки между VR-сессиями
  if (isVR) {
    let bookedVR = 0;
    for (const b of bookings) {
      const bIsVR = b.service === 'VR' || b.service.startsWith('VR');
      if (!bIsVR) continue;
      const bStart = timeToMinutes(b.booking_time.slice(0, 5));
      const bDur = getStoredDuration(b.service, b.duration_minutes);
      // Добавляем BUFFER_MINUTES к окончанию сессии
      const bEnd = bStart + bDur + BUFFER_MINUTES;
      // Проверяем пересечение с учётом буфера
      if (slotMin < bEnd && slotMin + serviceDuration > bStart) {
        bookedVR += b.vr_count ?? 1;
      }
    }
    const available = MAX_VR - bookedVR;
    if (available <= 0) return { kind: 'full' };
    if (available < vrCount) return { kind: 'full' };
    if (available < MAX_VR) return { kind: 'partial', vrAvailable: available };
    return { kind: 'free', vrAvailable: MAX_VR };
  }

  // Other services (MOZA, PS5): direct time conflict + 15 min cleanup
  for (const b of bookings) {
    if (b.service !== service) continue;
    const bStart = timeToMinutes(b.booking_time.slice(0, 5));
    const bDur = getStoredDuration(b.service, b.duration_minutes);
    // Для MOZA и PS5 добавляем 15 минут на уборку
    const bEnd = bStart + bDur + 15;
    if (slotMin < bEnd && slotMin + serviceDuration > bStart) return { kind: 'full' };
  }

  return { kind: 'free' };
}

function getNextDays(count: number): { date: string; label: string; weekday: string }[] {
  const days: { date: string; label: string; weekday: string }[] = [];
  const weekdays = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
  const months = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
  for (let i = 0; i < count; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    days.push({
      date: `${yyyy}-${mm}-${dd}`,
      label: `${d.getDate()} ${months[d.getMonth()]}`,
      weekday: i === 0 ? 'Сегодня' : i === 1 ? 'Завтра' : weekdays[d.getDay()],
    });
  }
  return days;
}

interface TimeSlotPickerProps {
  service: string;
  vrCount: number;
  durationMinutes: number;
  selectedDate: string;
  selectedTime: string;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
}

const TimeSlotPicker = ({
  service,
  vrCount,
  durationMinutes,
  selectedDate,
  selectedTime,
  onDateChange,
  onTimeChange,
}: TimeSlotPickerProps) => {
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(false);
  const daysRef = useRef<HTMLDivElement>(null);
  const days = getNextDays(30);

  useEffect(() => {
    if (!selectedDate) return;
    setLoading(true);
    const fetchBookings = async () => {
      const { data } = await supabase
        .from('bookings')
        .select('booking_time, service, vr_count, duration_minutes')
        .eq('booking_date', selectedDate)
        .in('status', ['pending', 'confirmed']);
      setBookings((data as BookingRow[]) ?? []);
      setLoading(false);
    };
    fetchBookings();
  }, [selectedDate]);

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const isVR = service === 'VR' || service.startsWith('VR');

  const slotStates = TIME_SLOTS.map(slot => ({
    slot,
    state: computeSlotState(slot, bookings, service, vrCount, durationMinutes, selectedDate === todayStr, currentMinutes),
  }));

  return (
    <div>
      {/* Date scroll */}
      <div className="mb-4">
        <label className="font-mono-tech text-xs text-white/45 block mb-2" style={{ fontSize: '10px', letterSpacing: '1px' }}>
          ВЫБЕРИТЕ ДАТУ
        </label>
        <div ref={daysRef} className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {days.map(d => {
            const isActive = selectedDate === d.date;
            return (
              <button key={d.date} type="button"
                onClick={() => { onDateChange(d.date); onTimeChange(''); }}
                className="flex-shrink-0 flex flex-col items-center px-3 py-2 rounded-md transition-all duration-200 cursor-pointer"
                style={{
                  minWidth: '64px',
                  background: isActive ? 'rgba(0,245,255,0.12)' : 'rgba(0,245,255,0.03)',
                  border: `1px solid ${isActive ? 'rgba(0,245,255,0.6)' : 'rgba(0,245,255,0.12)'}`,
                  boxShadow: isActive ? '0 0 12px rgba(0,245,255,0.2)' : 'none',
                }}>
                <span className="font-mono-tech text-xs mb-0.5" style={{ fontSize: '9px', color: isActive ? '#00f5ff' : 'rgba(0,245,255,0.4)', letterSpacing: '0.5px' }}>
                  {d.weekday}
                </span>
                <span className="font-rajdhani font-bold text-sm" style={{ color: isActive ? '#fff' : 'rgba(255,255,255,0.55)' }}>
                  {d.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Time slots */}
      {selectedDate && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="font-mono-tech text-xs text-white/45" style={{ fontSize: '10px', letterSpacing: '1px' }}>
              ВЫБЕРИТЕ ВРЕМЯ
            </label>
            <div className="flex items-center gap-3 font-mono-tech" style={{ fontSize: '9px' }}>
              {isVR ? (
                <>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-sm inline-block" style={{ background: 'rgba(0,245,255,0.2)', border: '1px solid rgba(0,245,255,0.4)' }} />
                    Свободно
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-sm inline-block" style={{ background: 'rgba(0,245,255,0.08)', border: '1px solid rgba(255,165,0,0.5)' }} />
                    Частично
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-sm inline-block" style={{ background: 'rgba(255,0,110,0.15)', border: '1px solid rgba(255,0,110,0.3)' }} />
                    Занято
                  </span>
                </>
              ) : (
                <>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-sm inline-block" style={{ background: 'rgba(0,245,255,0.2)', border: '1px solid rgba(0,245,255,0.4)' }} />
                    Свободно
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-sm inline-block" style={{ background: 'rgba(255,0,110,0.15)', border: '1px solid rgba(255,0,110,0.3)' }} />
                    Занято
                  </span>
                </>
              )}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-6">
              <div className="w-5 h-5 rounded-full border-2 animate-spin" style={{ borderColor: 'rgba(0,245,255,0.3)', borderTopColor: '#00f5ff' }} />
            </div>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
              {slotStates.map(({ slot, state }) => {
                const isSelected = selectedTime === slot;
                const isDisabled = state.kind !== 'free' && state.kind !== 'partial';
                const isPartial = state.kind === 'partial';
                const isCleanup = state.kind === 'cleanup';
                const isFull = state.kind === 'full';
                const isPast = state.kind === 'past';

                let bg = 'rgba(0,245,255,0.05)';
                let border = '1px solid rgba(0,245,255,0.15)';
                let color = 'rgba(255,255,255,0.7)';

                if (isSelected) {
                  bg = 'rgba(0,245,255,0.2)';
                  border = '1px solid rgba(0,245,255,0.7)';
                  color = '#00f5ff';
                } else if (isFull) {
                  bg = 'rgba(255,0,110,0.08)';
                  border = '1px solid rgba(255,0,110,0.25)';
                  color = 'rgba(255,0,110,0.5)';
                } else if (isCleanup) {
                  bg = 'rgba(255,165,0,0.06)';
                  border = '1px solid rgba(255,165,0,0.2)';
                  color = 'rgba(255,165,0,0.4)';
                } else if (isPast) {
                  bg = 'rgba(255,255,255,0.03)';
                  border = '1px solid rgba(255,255,255,0.06)';
                  color = 'rgba(255,255,255,0.15)';
                } else if (isPartial) {
                  bg = 'rgba(0,245,255,0.06)';
                  border = '1px solid rgba(255,165,0,0.45)';
                  color = 'rgba(255,255,255,0.7)';
                }

                const vrAvailable = state.kind === 'partial' ? state.vrAvailable : state.kind === 'free' && isVR ? (state.vrAvailable ?? MAX_VR) : null;

                return (
                  <button key={slot} type="button"
                    onClick={() => !isDisabled && onTimeChange(slot)}
                    disabled={isDisabled}
                    className="py-2 rounded-sm font-mono-tech transition-all duration-200 relative flex flex-col items-center justify-center"
                    style={{
                      fontSize: '11px',
                      cursor: isDisabled ? 'not-allowed' : 'pointer',
                      background: bg, border, color,
                      boxShadow: isSelected ? '0 0 8px rgba(0,245,255,0.25)' : 'none',
                      minHeight: isVR ? '48px' : '36px',
                    }}>
                    <span style={{ textDecoration: isFull ? 'line-through' : 'none' }}>{slot}</span>
                    {isCleanup && <span style={{ fontSize: '8px', color: 'rgba(255,165,0,0.55)', letterSpacing: '0.5px' }}>уборка</span>}
                    {isVR && !isDisabled && vrAvailable !== null && vrAvailable < MAX_VR && (
                      <span style={{ fontSize: '8px', color: 'rgba(255,165,0,0.9)', letterSpacing: '0.5px' }}>{vrAvailable} своб.</span>
                    )}
                    {isVR && !isDisabled && vrAvailable === MAX_VR && !isSelected && (
                      <span style={{ fontSize: '8px', color: 'rgba(0,245,255,0.5)', letterSpacing: '0.5px' }}>4 своб.</span>
                    )}
                    {isVR && !isDisabled && isSelected && (
                      <span style={{ fontSize: '8px', color: '#00f5ff', letterSpacing: '0.5px' }}>✓</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TimeSlotPicker;