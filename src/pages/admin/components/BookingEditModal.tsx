import { useState, useEffect, memo } from 'react';
import { Booking } from './AdminCalendar';

interface BookingEditModalProps {
  booking: Booking | null;
  isNew?: boolean;
  onClose: () => void;
  onSave: (id: string, data: Partial<Booking>) => Promise<void>;
  onCreate?: (data: Partial<Booking>) => Promise<void>;
}

const TIME_SLOTS = [
  '12:00','12:30','13:00','13:30','14:00','14:30',
  '15:00','15:30','16:00','16:30','17:00','17:30',
  '18:00','18:30','19:00','19:30','20:00','20:30',
  '21:00','21:30',
];

const SERVICES = [
  'VR 30 мин', 'VR 1 час', 'VR 2 часа', 'VR 3 часа',
  'MOZA 15 минут', 'MOZA 30 минут',
  'PlayStation 5 — 1 час',
  'Аренда клуба 1 час', 'Аренда клуба 2 часа', 'Аренда клуба 3 часа', 'Аренда клуба 4 часа',
];

const BookingEditModal = memo(({ booking, isNew, onClose, onSave, onCreate }: BookingEditModalProps) => {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    service: 'VR 1 час',
    booking_date: '',
    booking_time: '12:00',
    guests: '1',
    vr_count: '1',
    duration_minutes: '60',
    comment: '',
    status: 'pending' as 'pending' | 'confirmed' | 'cancelled',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (booking) {
      setForm({
        name: booking.name || '',
        phone: booking.phone || '',
        service: booking.service || 'VR 1 час',
        booking_date: booking.booking_date || '',
        booking_time: booking.booking_time?.slice(0, 5) || '12:00',
        guests: String(booking.guests || 1),
        vr_count: String(booking.vr_count || 1),
        duration_minutes: String(booking.duration_minutes || 60),
        comment: booking.comment || '',
        status: booking.status || 'pending',
      });
    }
  }, [booking]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const data: Partial<Booking> = {
      name: form.name,
      phone: form.phone,
      service: form.service,
      booking_date: form.booking_date,
      booking_time: form.booking_time,
      guests: parseInt(form.guests, 10),
      vr_count: parseInt(form.vr_count, 10),
      duration_minutes: parseInt(form.duration_minutes, 10),
      comment: form.comment || null,
      status: form.status,
    };
    try {
      if (isNew && onCreate) {
        await onCreate(data);
      } else if (booking) {
        await onSave(booking.id, data);
      }
      onClose();
    } finally {
      setSaving(false);
    }
  };

  if (!booking && !isNew) return null;

  const isVR = form.service.startsWith('VR');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(1,0,20,0.94)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="relative w-full max-w-lg rounded-lg overflow-hidden"
        style={{ background: '#06001e', border: '1px solid rgba(0,245,255,0.35)', maxHeight: '90vh', overflowY: 'auto' }}>
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4"
          style={{ background: '#06001e', borderBottom: '1px solid rgba(0,245,255,0.15)' }}>
          <h2 className="font-orbitron font-bold text-white text-sm tracking-wider">
            {isNew ? 'НОВАЯ ЗАПИСЬ' : 'РЕДАКТИРОВАТЬ ЗАПИСЬ'}
          </h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center cursor-pointer text-white/40 hover:text-white transition-colors rounded hover:bg-white/10">
            <i className="ri-close-line text-lg" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="admin-label">ИМЯ *</label>
              <input required name="name" value={form.name} onChange={handleChange} className="cyber-input" placeholder="Имя клиента" />
            </div>
            <div>
              <label className="admin-label">ТЕЛЕФОН *</label>
              <input required name="phone" value={form.phone} onChange={handleChange} className="cyber-input" placeholder="+7..." type="tel" />
            </div>
          </div>

          <div>
            <label className="admin-label">УСЛУГА *</label>
            <select required name="service" value={form.service} onChange={handleChange} className="cyber-input cursor-pointer">
              {SERVICES.map(s => <option key={s} value={s} style={{ background: '#06001e' }}>{s}</option>)}
            </select>
          </div>

          {isVR && (
            <div>
              <label className="admin-label">КОЛИЧЕСТВО КОМПЛЕКТОВ VR</label>
              <select name="vr_count" value={form.vr_count} onChange={handleChange} className="cyber-input cursor-pointer">
                {[1, 2, 3, 4].map(n => <option key={n} value={n} style={{ background: '#06001e' }}>{n} компл.</option>)}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="admin-label">ДАТА *</label>
              <input required name="booking_date" type="date" value={form.booking_date} onChange={handleChange} className="cyber-input" />
            </div>
            <div>
              <label className="admin-label">ВРЕМЯ *</label>
              <select required name="booking_time" value={form.booking_time} onChange={handleChange} className="cyber-input cursor-pointer">
                {TIME_SLOTS.map(t => <option key={t} value={t} style={{ background: '#06001e' }}>{t}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="admin-label">ГОСТЕЙ</label>
              <input name="guests" type="number" min="1" max="12" value={form.guests} onChange={handleChange} className="cyber-input" />
            </div>
            <div>
              <label className="admin-label">ДЛИТЕЛЬНОСТЬ (МИН)</label>
              <input name="duration_minutes" type="number" min="15" step="15" value={form.duration_minutes} onChange={handleChange} className="cyber-input" />
            </div>
          </div>

          <div>
            <label className="admin-label">СТАТУС</label>
            <select name="status" value={form.status} onChange={handleChange} className="cyber-input cursor-pointer">
              <option value="pending" style={{ background: '#06001e' }}>Ожидание</option>
              <option value="confirmed" style={{ background: '#06001e' }}>Подтверждено</option>
              <option value="cancelled" style={{ background: '#06001e' }}>Отменено</option>
            </select>
          </div>

          <div>
            <label className="admin-label">КОММЕНТАРИЙ</label>
            <textarea name="comment" value={form.comment} onChange={handleChange} className="cyber-input resize-none" rows={2}
              placeholder="Комментарий..." maxLength={500} />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="px-4 py-3 rounded-sm text-sm cursor-pointer transition-colors whitespace-nowrap font-rajdhani"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}>
              Отмена
            </button>
            <button type="submit" disabled={saving}
              className="btn-cyber-pink flex-1 py-3 rounded-sm text-sm flex items-center justify-center gap-2 whitespace-nowrap"
              style={{ opacity: saving ? 0.7 : 1 }}>
              {saving
                ? <><i className="ri-loader-4-line animate-spin" />Сохранение...</>
                : <><i className="ri-save-line" />{isNew ? 'Создать запись' : 'Сохранить'}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});
BookingEditModal.displayName = 'BookingEditModal';

export default BookingEditModal;
