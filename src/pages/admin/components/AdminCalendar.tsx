import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';

export interface Booking {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  service: string;
  booking_date: string;
  booking_time: string;
  guests: number;
  vr_count: number | null;
  duration_minutes: number | null;
  comment: string | null;
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at: string;
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Ожидание',
  confirmed: 'Подтверждено',
  cancelled: 'Отменено',
};

const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b',
  confirmed: '#4ade80',
  cancelled: '#ff006e',
};

const SERVICE_ICONS: Record<string, string> = {
  VR: 'ri-vr-glasses-line',
  MOZA: 'ri-steering-2-line',
  PlayStation: 'ri-gamepad-line',
  Аренда: 'ri-building-line',
};

function getServiceIcon(service: string): string {
  for (const [key, icon] of Object.entries(SERVICE_ICONS)) {
    if (service.startsWith(key)) return icon;
  }
  return 'ri-calendar-line';
}

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-');
  return `${d}.${m}.${y}`;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1; // Mon=0
}

interface Props {
  bookings: Booking[];
  onSelectDate: (date: string) => void;
  selectedDate: string;
}

const MONTH_NAMES = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
const WEEKDAY_NAMES = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

export const AdminCalendar = ({ bookings, onSelectDate, selectedDate }: Props) => {
  const today = new Date();
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  // Build a set of dates with bookings
  const bookingDates = new Map<string, number>();
  for (const b of bookings) {
    if (b.status === 'cancelled') continue;
    bookingDates.set(b.booking_date, (bookingDates.get(b.booking_date) ?? 0) + 1);
  }

  const daysInMonth = getDaysInMonth(calYear, calMonth);
  const firstDay = getFirstDayOfMonth(calYear, calMonth);

  const prevMonth = () => {
    if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11); }
    else setCalMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0); }
    else setCalMonth(m => m + 1);
  };

  return (
    <div className="rounded-lg overflow-hidden" style={{ background: 'rgba(1,0,20,0.95)', border: '1px solid rgba(0,245,255,0.2)' }}>
      {/* Calendar header */}
      <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(0,245,255,0.15)', background: 'rgba(0,245,255,0.04)' }}>
        <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center cursor-pointer rounded-sm transition-colors hover:bg-white/10"
          style={{ color: 'rgba(0,245,255,0.7)' }}>
          <i className="ri-arrow-left-s-line text-lg" />
        </button>
        <h3 className="font-orbitron font-bold text-white text-sm tracking-wider">
          {MONTH_NAMES[calMonth]} {calYear}
        </h3>
        <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center cursor-pointer rounded-sm transition-colors hover:bg-white/10"
          style={{ color: 'rgba(0,245,255,0.7)' }}>
          <i className="ri-arrow-right-s-line text-lg" />
        </button>
      </div>

      {/* Weekdays */}
      <div className="grid grid-cols-7 px-3 pt-3">
        {WEEKDAY_NAMES.map(d => (
          <div key={d} className="text-center font-mono-tech text-xs py-1" style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.5px' }}>
            {d}
          </div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 gap-1 px-3 pb-4">
        {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isToday = dateStr === todayStr;
          const isSelected = dateStr === selectedDate;
          const bookingCount = bookingDates.get(dateStr) ?? 0;

          return (
            <button key={day} type="button" onClick={() => onSelectDate(dateStr)}
              className="relative aspect-square flex flex-col items-center justify-center rounded-md transition-all duration-150 cursor-pointer text-xs"
              style={{
                background: isSelected ? 'rgba(0,245,255,0.18)' : isToday ? 'rgba(0,245,255,0.06)' : 'transparent',
                border: isSelected ? '1px solid rgba(0,245,255,0.7)' : isToday ? '1px solid rgba(0,245,255,0.3)' : '1px solid transparent',
                color: isSelected ? '#00f5ff' : isToday ? '#fff' : 'rgba(255,255,255,0.65)',
                fontFamily: 'Rajdhani, sans-serif',
                fontWeight: isToday || isSelected ? 700 : 400,
              }}>
              <span>{day}</span>
              {bookingCount > 0 && (
                <div className="absolute bottom-0.5 flex gap-0.5 justify-center">
                  {Array.from({ length: Math.min(bookingCount, 3) }).map((_, idx) => (
                    <div key={idx} className="w-1 h-1 rounded-full" style={{ background: '#00f5ff', opacity: 0.9 }} />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

interface BookingCardProps {
  booking: Booking;
  onEdit: (b: Booking) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: 'pending' | 'confirmed' | 'cancelled') => void;
}

export const BookingCard = ({ booking, onEdit, onDelete, onStatusChange }: BookingCardProps) => {
  const icon = getServiceIcon(booking.service);
  const statusColor = STATUS_COLORS[booking.status] ?? '#fff';

  return (
    <div className="rounded-lg p-4" style={{ background: 'rgba(0,245,255,0.03)', border: '1px solid rgba(0,245,255,0.15)' }}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 flex items-center justify-center rounded-lg flex-shrink-0"
          style={{ background: 'rgba(0,245,255,0.08)', border: '1px solid rgba(0,245,255,0.2)' }}>
          <i className={`${icon} text-base`} style={{ color: '#00f5ff' }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-rajdhani font-bold text-white text-sm">{booking.service}</span>
            {booking.service.startsWith('VR') && booking.vr_count && (
              <span className="font-mono-tech text-xs px-1.5 py-0.5 rounded-sm"
                style={{ background: 'rgba(0,245,255,0.1)', color: '#00f5ff', fontSize: '9px' }}>
                ×{booking.vr_count} компл.
              </span>
            )}
            <span className="font-mono-tech text-xs px-2 py-0.5 rounded-full ml-auto"
              style={{ background: `${statusColor}15`, border: `1px solid ${statusColor}40`, color: statusColor, fontSize: '9px' }}>
              {STATUS_LABELS[booking.status]}
            </span>
          </div>
          <div className="font-mono-tech text-xs mb-2" style={{ color: '#00f5ff', fontSize: '11px' }}>
            {formatDate(booking.booking_date)} в {booking.booking_time}
            {booking.duration_minutes && ` · ${booking.duration_minutes} мин`}
          </div>
          <div className="text-white/60 font-rajdhani text-sm">{booking.name} · {booking.phone}</div>
          {booking.comment && (
            <div className="mt-1 text-white/35 font-rajdhani text-xs">{booking.comment}</div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 mt-3 pt-3" style={{ borderTop: '1px solid rgba(0,245,255,0.08)' }}>
        {/* Status quick change */}
        <select
          value={booking.status}
          onChange={e => onStatusChange(booking.id, e.target.value as 'pending' | 'confirmed' | 'cancelled')}
          className="flex-1 text-xs rounded-sm cursor-pointer font-rajdhani"
          style={{ background: 'rgba(0,245,255,0.06)', border: '1px solid rgba(0,245,255,0.2)', color: statusColor, padding: '4px 8px' }}>
          <option value="pending" style={{ background: '#06001e', color: '#f59e0b' }}>Ожидание</option>
          <option value="confirmed" style={{ background: '#06001e', color: '#4ade80' }}>Подтверждено</option>
          <option value="cancelled" style={{ background: '#06001e', color: '#ff006e' }}>Отменено</option>
        </select>
        <button onClick={() => onEdit(booking)}
          className="px-3 py-1.5 rounded-sm text-xs font-rajdhani font-bold cursor-pointer transition-colors whitespace-nowrap"
          style={{ background: 'rgba(0,245,255,0.08)', border: '1px solid rgba(0,245,255,0.25)', color: '#00f5ff' }}>
          <i className="ri-edit-line mr-1" />Изменить
        </button>
        <button onClick={() => onDelete(booking.id)}
          className="px-3 py-1.5 rounded-sm text-xs font-rajdhani font-bold cursor-pointer transition-colors whitespace-nowrap"
          style={{ background: 'rgba(255,0,110,0.06)', border: '1px solid rgba(255,0,110,0.25)', color: '#ff006e' }}>
          <i className="ri-delete-bin-line" />
        </button>
      </div>
    </div>
  );
};

interface UseBookingsReturn {
  bookings: Booking[];
  loading: boolean;
  refresh: () => Promise<void>;
  updateStatus: (id: string, status: string) => Promise<void>;
  deleteBooking: (id: string) => Promise<void>;
  updateBooking: (id: string, data: Partial<Booking>) => Promise<void>;
}

export function useBookings(): UseBookingsReturn {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('bookings')
      .select('*')
      .order('booking_date', { ascending: true })
      .order('booking_time', { ascending: true });
    setBookings((data as Booking[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const updateStatus = useCallback(async (id: string, status: string) => {
    await supabase.from('bookings').update({ status }).eq('id', id);
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: status as Booking['status'] } : b));
  }, []);

  const deleteBooking = useCallback(async (id: string) => {
    await supabase.from('bookings').delete().eq('id', id);
    setBookings(prev => prev.filter(b => b.id !== id));
  }, []);

  const updateBooking = useCallback(async (id: string, data: Partial<Booking>) => {
    await supabase.from('bookings').update(data).eq('id', id);
    setBookings(prev => prev.map(b => b.id === id ? { ...b, ...data } : b));
  }, []);

  return { bookings, loading, refresh, updateStatus, deleteBooking, updateBooking };
}
