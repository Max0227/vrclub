import { useState, memo, useCallback, useEffect } from 'react';
import type { LoyaltyCard, HistoryEntry, ClientBooking } from '../hooks/useLoyalty';
import { ACHIEVEMENTS, getCardTier, CARD_TIERS, STICKER_GOAL, getDaysUntilDeletion, getDaysSinceActivity, INACTIVITY_DAYS } from '../hooks/useLoyalty';
import LoyaltyCardDisplay from './LoyaltyCardDisplay';

const TIER_ICON_LIST = ['ri-shield-line', 'ri-shield-star-line', 'ri-trophy-line', 'ri-vip-crown-line', 'ri-cpu-line'];

interface Props {
  card: LoyaltyCard;
  onClaimToken: (code: string) => Promise<{ success: boolean; message: string }>;
  onRedeemVr: () => Promise<{ success: boolean; message: string }>;
  onRedeemAuto: () => Promise<{ success: boolean; message: string }>;
  onLogout: () => void;
  onShowAdmin: () => void;
  onFetchBookings: (phone: string) => Promise<ClientBooking[]>;
  onUpdateProfile: (name: string, phone: string) => Promise<{ success: boolean; message: string }>;
  onCardUpdate?: () => void;
}

// ── Booking card for client view ──────────────────────────────────────────────
const BookingItem = ({ b }: { b: ClientBooking }) => {
  const today = new Date().toISOString().split('T')[0];
  const isUpcoming = b.booking_date >= today;
  const statusColor: Record<string, string> = { pending: '#f59e0b', confirmed: '#4ade80', cancelled: '#ff006e' };
  const statusLabel: Record<string, string> = { pending: 'Ожидание', confirmed: 'Подтверждено', cancelled: 'Отменено' };
  const color = statusColor[b.status] ?? '#00f5ff';
  const [dy, dm, dd] = b.booking_date.split('-');
  const months = ['янв','фев','мар','апр','май','июн','июл','авг','сен','окт','ноя','дек'];
  const dateStr = `${parseInt(dd)} ${months[parseInt(dm) - 1]} ${dy}`;
  const timeStr = b.booking_time ? b.booking_time.slice(0, 5) : '';

  return (
    <div className="rounded-lg p-4 relative overflow-hidden"
      style={{ background: isUpcoming ? `${color}06` : 'rgba(1,0,20,0.5)', border: `1px solid ${isUpcoming ? color + '30' : 'rgba(255,255,255,0.07)'}` }}>
      {isUpcoming && <div className="absolute top-0 left-0 w-1 h-full rounded-l-lg" style={{ background: color }} />}
      <div className="flex items-start justify-between gap-3 pl-1">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            {isUpcoming && (
              <span className="font-orbitron font-bold px-2 py-0.5 rounded-sm whitespace-nowrap" style={{ fontSize: '8px', background: `${color}18`, color, border: `1px solid ${color}40` }}>
                БЛИЖАЙШАЯ
              </span>
            )}
            <span className="font-rajdhani font-bold text-white text-sm truncate">{b.service}</span>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-mono-tech text-xs flex items-center gap-1" style={{ color: isUpcoming ? color : 'rgba(255,255,255,0.5)', fontSize: '11px' }}>
              <i className="ri-calendar-line" />
              {dateStr}
            </span>
            {timeStr && (
              <span className="font-mono-tech text-xs flex items-center gap-1" style={{ color: isUpcoming ? color : 'rgba(255,255,255,0.4)', fontSize: '11px' }}>
                <i className="ri-time-line" />
                {timeStr}
              </span>
            )}
            {b.guests && (
              <span className="font-mono-tech text-xs flex items-center gap-1" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>
                <i className="ri-group-line" />
                {b.guests} чел.
              </span>
            )}
            {b.duration_minutes && (
              <span className="font-mono-tech text-xs flex items-center gap-1" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>
                <i className="ri-timer-line" />
                {b.duration_minutes >= 60 ? `${b.duration_minutes / 60}ч` : `${b.duration_minutes}мин`}
              </span>
            )}
          </div>
          {b.comment && (
            <p className="font-rajdhani text-xs mt-1 truncate" style={{ color: 'rgba(255,255,255,0.3)' }}>{b.comment}</p>
          )}
        </div>
        <div className="flex-shrink-0 text-right">
          <span className="font-orbitron font-bold px-2 py-1 rounded-sm whitespace-nowrap block" style={{ fontSize: '9px', background: `${color}12`, color, border: `1px solid ${color}30` }}>
            {statusLabel[b.status] ?? b.status}
          </span>
        </div>
      </div>
    </div>
  );
};

// ── Bookings Tab ──────────────────────────────────────────────────────────────
const BookingsTab = ({ phone, onFetch }: { phone: string; onFetch: (p: string) => Promise<ClientBooking[]> }) => {
  const [bookings, setBookings] = useState<ClientBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    onFetch(phone).then(res => {
      setBookings(res);
      setLoading(false);
    });
  }, [phone, onFetch]);

  const today = new Date().toISOString().split('T')[0];
  const upcoming = bookings.filter(b => b.booking_date >= today && b.status !== 'cancelled');
  const past = bookings.filter(b => b.booking_date < today || b.status === 'cancelled');

  if (loading) return (
    <div className="flex items-center justify-center py-16">
      <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: 'rgba(0,245,255,0.2)', borderTopColor: '#00f5ff' }} />
    </div>
  );

  if (bookings.length === 0) return (
    <div className="rounded-lg p-8 text-center" style={{ background: 'rgba(1,0,20,0.9)', border: '1px dashed rgba(0,245,255,0.15)' }}>
      <i className="ri-calendar-line text-3xl mb-3 block" style={{ color: 'rgba(0,245,255,0.3)' }} />
      <h3 className="font-orbitron font-bold text-white text-sm mb-2">Нет записей</h3>
      <p className="font-rajdhani text-white/40 text-sm">Записи появятся здесь после бронирования на сайте по этому номеру телефона</p>
    </div>
  );

  return (
    <div className="space-y-4">
      {upcoming.length > 0 && (
        <div className="rounded-lg p-5 relative overflow-hidden" style={{ background: 'rgba(1,0,20,0.9)', border: '1px solid rgba(74,222,128,0.2)' }}>
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #4ade80, transparent)' }} />
          <h3 className="font-orbitron font-bold text-white text-xs tracking-widest mb-3 flex items-center gap-2">
            <i className="ri-calendar-check-line" style={{ color: '#4ade80' }} />
            БЛИЖАЙШИЕ ЗАПИСИ
            <span className="font-mono-tech text-sm" style={{ color: '#4ade80' }}>{upcoming.length}</span>
          </h3>
          <div className="space-y-2">
            {upcoming.map(b => <BookingItem key={b.id} b={b} />)}
          </div>
        </div>
      )}
      {past.length > 0 && (
        <div className="rounded-lg p-5 relative overflow-hidden" style={{ background: 'rgba(1,0,20,0.9)', border: '1px solid rgba(0,245,255,0.12)' }}>
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(0,245,255,0.4), transparent)' }} />
          <h3 className="font-orbitron font-bold text-white/50 text-xs tracking-widest mb-3 flex items-center gap-2">
            <i className="ri-history-line" style={{ color: 'rgba(0,245,255,0.4)' }} />
            ИСТОРИЯ ПОСЕЩЕНИЙ
            <span className="font-mono-tech text-sm" style={{ color: 'rgba(0,245,255,0.4)' }}>{past.length}</span>
          </h3>
          <div className="space-y-2">
            {past.slice(0, 10).map(b => <BookingItem key={b.id} b={b} />)}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Inactivity Status Banner ──────────────────────────────────────────────────
const InactivityBanner = ({ card }: { card: LoyaltyCard }) => {
  const daysLeft = getDaysUntilDeletion(card);
  const daysInactive = getDaysSinceActivity(card);

  if (daysInactive < 30) {
    return (
      <div className="rounded-lg p-4 flex items-center gap-3 relative overflow-hidden" style={{ background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.25)' }}>
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #4ade80, transparent)' }} />
        <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(74,222,128,0.12)', border: '2px solid rgba(74,222,128,0.4)' }}>
          <i className="ri-shield-check-line text-lg" style={{ color: '#4ade80' }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-orbitron font-bold text-xs mb-0.5" style={{ color: '#4ade80' }}>КАРТА АКТИВНА</div>
          <div className="font-rajdhani text-white/55 text-xs">Вы были у нас {daysInactive} дн. назад. До автоудаления: <span style={{ color: '#4ade80' }}>{daysLeft} дн.</span></div>
        </div>
        <div className="font-orbitron font-black text-2xl flex-shrink-0" style={{ color: '#4ade80' }}>{daysLeft}<span className="text-xs font-rajdhani ml-0.5">д</span></div>
      </div>
    );
  }

  if (daysLeft > 30) {
    return (
      <div className="rounded-lg p-4 flex items-center gap-3 relative overflow-hidden" style={{ background: 'rgba(0,245,255,0.05)', border: '1px solid rgba(0,245,255,0.2)' }}>
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #00f5ff, transparent)' }} />
        <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(0,245,255,0.1)', border: '2px solid rgba(0,245,255,0.35)' }}>
          <i className="ri-time-line text-lg" style={{ color: '#00f5ff' }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-orbitron font-bold text-xs mb-0.5" style={{ color: '#00f5ff' }}>КАРТА В ПОРЯДКЕ</div>
          <div className="font-rajdhani text-white/55 text-xs">Последний визит {daysInactive} дн. назад. До автоудаления: <span style={{ color: '#00f5ff' }}>{daysLeft} дн.</span></div>
        </div>
        <div className="font-orbitron font-black text-2xl flex-shrink-0" style={{ color: '#00f5ff' }}>{daysLeft}<span className="text-xs font-rajdhani ml-0.5">д</span></div>
      </div>
    );
  }

  if (daysLeft > 0) {
    return (
      <div className="rounded-lg p-4 relative overflow-hidden" style={{ background: 'rgba(255,165,0,0.07)', border: '2px solid rgba(255,165,0,0.45)' }}>
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #ffa500, transparent)' }} />
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 animate-pulse" style={{ background: 'rgba(255,165,0,0.15)', border: '2px solid rgba(255,165,0,0.6)' }}>
            <i className="ri-alarm-warning-line text-lg" style={{ color: '#ffa500' }} />
          </div>
          <div>
            <div className="font-orbitron font-black text-sm" style={{ color: '#ffa500' }}>ВНИМАНИЕ: КАРТА СКОРО УДАЛИТСЯ</div>
            <div className="font-rajdhani text-white/50 text-xs">Осталось <span className="font-bold" style={{ color: '#ffa500' }}>{daysLeft} дн.</span> до автоматического удаления</div>
          </div>
          <div className="ml-auto font-orbitron font-black text-3xl" style={{ color: '#ffa500', textShadow: '0 0 20px rgba(255,165,0,0.5)' }}>{daysLeft}<span className="text-sm">д</span></div>
        </div>
        <p className="font-rajdhani text-white/55 text-xs leading-relaxed pl-1">Посетите клуб, чтобы карта оставалась активной. Если карта будет удалена — придётся регистрироваться заново и начинать с нуля.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg p-4 relative overflow-hidden" style={{ background: 'rgba(255,0,110,0.08)', border: '2px solid rgba(255,0,110,0.5)' }}>
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #ff006e, transparent)' }} />
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(255,0,110,0.2)', border: '2px solid #ff006e' }}>
          <i className="ri-error-warning-fill text-lg" style={{ color: '#ff006e' }} />
        </div>
        <div>
          <div className="font-orbitron font-black text-sm" style={{ color: '#ff006e' }}>КАРТА ПРОСРОЧЕНА</div>
          <div className="font-rajdhani text-white/50 text-xs">Неактивна уже <span className="font-bold" style={{ color: '#ff006e' }}>{daysInactive} дн.</span> — превышен лимит {INACTIVITY_DAYS} дней</div>
        </div>
      </div>
      <p className="font-rajdhani text-white/55 text-xs leading-relaxed">Посетите клуб как можно скорее или обратитесь к администратору. При следующем входе карта может быть удалена.</p>
    </div>
  );
};

// ── Card Policy Info ──────────────────────────────────────────────────────────
const CardPolicyInfo = () => (
  <div className="rounded-xl overflow-hidden relative" style={{ background: '#06001e', border: '1px solid rgba(0,245,255,0.15)' }}>
    <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #00f5ff, transparent)' }} />
    {/* Header */}
    <div className="px-5 py-4 flex items-center gap-3" style={{ background: 'rgba(0,245,255,0.04)', borderBottom: '1px solid rgba(0,245,255,0.1)' }}>
      <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(0,245,255,0.1)', border: '1px solid rgba(0,245,255,0.3)' }}>
        <i className="ri-information-line text-base" style={{ color: '#00f5ff' }} />
      </div>
      <div>
        <div className="font-orbitron font-black text-white text-xs tracking-widest">ПОЛИТИКА АКТИВНОСТИ КАРТЫ</div>
        <div className="font-mono-tech text-white/30 mt-0.5" style={{ fontSize: '9px' }}>PDX CLUB LOYALTY PROGRAM</div>
      </div>
    </div>

    {/* Policy items */}
    <div className="p-4 space-y-3">
      {[
        {
          icon: 'ri-calendar-check-line',
          color: '#4ade80',
          title: 'Карта активна',
          desc: 'Пока вы посещаете клуб хотя бы раз в 3 месяца — карта остаётся активной и все накопленные бонусы сохраняются.',
        },
        {
          icon: 'ri-alarm-warning-line',
          color: '#ffa500',
          title: '60 дней без посещений',
          desc: 'Если с момента последнего визита прошло 60+ дней — в личном кабинете появится предупреждение о скором удалении.',
        },
        {
          icon: 'ri-delete-bin-2-line',
          color: '#ff006e',
          title: 'Автоудаление через 90 дней',
          desc: 'Карта автоматически удаляется из базы данных, если нет ни одного посещения за 90 дней. Все жетоны, наклейки и история будут утеряны.',
        },
        {
          icon: 'ri-refresh-line',
          color: '#c084fc',
          title: 'Восстановление',
          desc: 'После удаления необходимо заново зарегистрировать клубную карту. Восстановление старых данных невозможно — начинаете с нуля.',
        },
        {
          icon: 'ri-shield-check-line',
          color: '#00f5ff',
          title: 'Как не потерять карту',
          desc: 'Просто приходите к нам хотя бы раз в 3 месяца! После каждого визита администратор обновляет вашу статистику.',
        },
      ].map((item) => (
        <div key={item.title} className="flex items-start gap-3 p-3 rounded-lg" style={{ background: `${item.color}06`, border: `1px solid ${item.color}18` }}>
          <div className="w-8 h-8 flex items-center justify-center rounded-md flex-shrink-0" style={{ background: `${item.color}12`, border: `1px solid ${item.color}30` }}>
            <i className={`${item.icon} text-sm`} style={{ color: item.color }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-orbitron font-bold text-white mb-0.5" style={{ fontSize: '10px' }}>{item.title}</div>
            <div className="font-rajdhani text-white/50 text-xs leading-relaxed">{item.desc}</div>
          </div>
        </div>
      ))}
    </div>

    {/* Bottom countdown bar */}
    <div className="px-4 pb-4">
      <div className="rounded-lg p-3" style={{ background: 'rgba(255,0,110,0.06)', border: '1px solid rgba(255,0,110,0.2)' }}>
        <div className="flex items-center justify-between mb-2">
          <span className="font-orbitron font-bold text-xs" style={{ color: '#ff006e', fontSize: '9px', letterSpacing: '1px' }}>ШКАЛА НЕАКТИВНОСТИ</span>
          <span className="font-mono-tech text-xs" style={{ color: 'rgba(255,255,255,0.3)', fontSize: '9px' }}>0 → {INACTIVITY_DAYS} дней → УДАЛЕНИЕ</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 flex-1 rounded-full overflow-hidden flex" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <div className="h-full rounded-l-full" style={{ width: '33%', background: '#4ade80' }} />
            <div className="h-full" style={{ width: '33%', background: '#ffa500' }} />
            <div className="h-full rounded-r-full" style={{ width: '34%', background: '#ff006e' }} />
          </div>
        </div>
        <div className="flex justify-between mt-1">
          <span className="font-mono-tech" style={{ fontSize: '8px', color: '#4ade80' }}>Активна</span>
          <span className="font-mono-tech" style={{ fontSize: '8px', color: '#ffa500' }}>Предупреждение</span>
          <span className="font-mono-tech" style={{ fontSize: '8px', color: '#ff006e' }}>Удаление</span>
        </div>
      </div>
    </div>
  </div>
);

// ProfileTab – с добавленным onCardUpdate
const ProfileTab = ({ card, onUpdate, onCardUpdate }: { card: LoyaltyCard; onUpdate: (n: string, p: string) => Promise<{ success: boolean; message: string }>; onCardUpdate?: () => void }) => {
  const [name, setName] = useState(card.name);
  const [phone, setPhone] = useState(card.phone);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ success: boolean; text: string } | null>(null);
  const tier = getCardTier(card.vrHours);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    setLoading(true);
    const res = await onUpdate(name.trim(), phone.trim());
    setLoading(false);
    setMsg({ success: res.success, text: res.message });
    if (res.success && onCardUpdate) {
      onCardUpdate(); // Обновляем карту после успешного сохранения
    }
    setTimeout(() => setMsg(null), 3000);
  };

  return (
    <div className="space-y-4">
          {/* Inactivity status banner */}
          <InactivityBanner card={card} />
          {/* Card info panel */}
      <div className="rounded-lg p-5 relative overflow-hidden" style={{ background: 'rgba(1,0,20,0.9)', border: `1px solid ${tier.color}25` }}>
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${tier.color}, transparent)` }} />
        <h3 className="font-orbitron font-bold text-white text-xs tracking-widest mb-4">ДАННЫЕ КЛУБНОЙ КАРТЫ</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
            <span className="font-mono-tech text-xs" style={{ color: 'rgba(255,255,255,0.35)', letterSpacing: '0.5px' }}>НОМЕР КАРТЫ</span>
            <span className="font-orbitron font-bold text-xs" style={{ color: tier.color }}>{card.cardNumber}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
            <span className="font-mono-tech text-xs" style={{ color: 'rgba(255,255,255,0.35)', letterSpacing: '0.5px' }}>УРОВЕНЬ</span>
            <span className="font-orbitron font-bold text-xs" style={{ color: tier.color }}>{tier.label}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
            <span className="font-mono-tech text-xs" style={{ color: 'rgba(255,255,255,0.35)', letterSpacing: '0.5px' }}>VR ЧАСОВ</span>
            <span className="font-orbitron font-bold text-xs" style={{ color: tier.color }}>{card.vrHours} ч</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
            <span className="font-mono-tech text-xs" style={{ color: 'rgba(255,255,255,0.35)', letterSpacing: '0.5px' }}>VR СЕССИЙ</span>
            <span className="font-orbitron font-bold text-xs" style={{ color: tier.color }}>{card.vrSessions}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
            <span className="font-mono-tech text-xs" style={{ color: 'rgba(255,255,255,0.35)', letterSpacing: '0.5px' }}>НАКЛЕЙКИ</span>
            <span className="font-orbitron font-bold text-xs" style={{ color: '#9b4dff' }}>{card.stickers} / {STICKER_GOAL}</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="font-mono-tech text-xs" style={{ color: 'rgba(255,255,255,0.35)', letterSpacing: '0.5px' }}>ДАТА РЕГИСТРАЦИИ</span>
            <span className="font-mono-tech text-xs" style={{ color: 'rgba(255,255,255,0.55)' }}>
              {new Date(card.createdAt).toLocaleDateString('ru-RU')}
            </span>
          </div>
        </div>
        {tier.nextAt && (
          <div className="mt-4 pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-rajdhani text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>До {CARD_TIERS[tier.tier + 1].label}</span>
              <span className="font-orbitron font-bold text-xs" style={{ color: CARD_TIERS[tier.tier + 1].color }}>{tier.nextAt - card.vrHours}ч осталось</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${Math.min(100, (card.vrHours / tier.nextAt) * 100)}%`, background: `linear-gradient(90deg, ${tier.color}, ${CARD_TIERS[tier.tier + 1].color})` }} />
            </div>
          </div>
        )}
      </div>

      {/* Edit profile */}
      <div className="rounded-lg p-5 relative overflow-hidden" style={{ background: 'rgba(1,0,20,0.9)', border: '1px solid rgba(0,245,255,0.15)' }}>
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #00f5ff, transparent)' }} />
        <h3 className="font-orbitron font-bold text-white text-xs tracking-widest mb-4">РЕДАКТИРОВАТЬ ПРОФИЛЬ</h3>
        <form onSubmit={handleSave} className="space-y-3.5">
          <div>
            <label className="font-mono-tech text-xs text-white/40 block mb-1.5" style={{ fontSize: '10px', letterSpacing: '1px' }}>ИМЯ И ФАМИЛИЯ</label>
            <input value={name} onChange={e => setName(e.target.value)} className="cyber-input w-full" placeholder="Иван Иванов" required />
          </div>
          <div>
            <label className="font-mono-tech text-xs text-white/40 block mb-1.5" style={{ fontSize: '10px', letterSpacing: '1px' }}>ТЕЛЕФОН</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} className="cyber-input w-full" placeholder="+7 (___) ___-__-__" type="tel" required />
          </div>
          {msg && (
            <div className="px-3 py-2 rounded font-rajdhani text-sm" style={{ background: msg.success ? 'rgba(74,222,128,0.08)' : 'rgba(255,0,110,0.08)', border: `1px solid ${msg.success ? 'rgba(74,222,128,0.25)' : 'rgba(255,0,110,0.25)'}`, color: msg.success ? '#4ade80' : '#ff006e' }}>
              {msg.text}
            </div>
          )}
          <button type="submit" disabled={loading || !name.trim() || !phone.trim()}
            className="w-full py-3 rounded-sm text-xs font-orbitron cursor-pointer disabled:opacity-40 flex items-center justify-center gap-2 whitespace-nowrap transition-all"
            style={{ background: 'rgba(0,245,255,0.1)', border: '1px solid rgba(0,245,255,0.35)', color: '#00f5ff' }}>
            {loading ? <i className="ri-loader-4-line animate-spin" /> : <i className="ri-save-line" />}
            Сохранить изменения
          </button>
        </form>
      </div>
    </div>
  );
};

// ── Main Dashboard ────────────────────────────────────────────────────────────
const Dashboard = memo(({ card, onClaimToken, onRedeemVr, onRedeemAuto, onLogout, onShowAdmin, onFetchBookings, onUpdateProfile, onCardUpdate }: Props) => {
  const [claimCode, setClaimCode] = useState('');
  const [claimMsg, setClaimMsg] = useState<{ success: boolean; text: string } | null>(null);
  const [redeemMsg, setRedeemMsg] = useState<{ success: boolean; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'tokens' | 'bookings' | 'achievements' | 'benefits' | 'profile'>('tokens');
  const [showClaimInfo, setShowClaimInfo] = useState(false);
  const [claimLoading, setClaimLoading] = useState(false);
  const [redeemLoading, setRedeemLoading] = useState<'vr' | 'auto' | null>(null);

  const tier = getCardTier(card.vrHours);

  const handleClaim = useCallback(async () => {
    if (!claimCode.trim() || claimLoading) return;
    setClaimLoading(true);
    const result = await onClaimToken(claimCode.trim());
    setClaimLoading(false);
    setClaimMsg({ success: result.success, text: result.message });
    if (result.success) setClaimCode('');
    setTimeout(() => setClaimMsg(null), 4000);
  }, [claimCode, onClaimToken, claimLoading]);

  const handleRedeemVr = useCallback(async () => {
    if (redeemLoading) return;
    setRedeemLoading('vr');
    const result = await onRedeemVr();
    setRedeemLoading(null);
    setRedeemMsg({ success: result.success, text: result.message });
    setTimeout(() => setRedeemMsg(null), 5000);
  }, [onRedeemVr, redeemLoading]);

  const handleRedeemAuto = useCallback(async () => {
    if (redeemLoading) return;
    setRedeemLoading('auto');
    const result = await onRedeemAuto();
    setRedeemLoading(null);
    setRedeemMsg({ success: result.success, text: result.message });
    setTimeout(() => setRedeemMsg(null), 5000);
  }, [onRedeemAuto, redeemLoading]);

  const unlockedAchievements = ACHIEVEMENTS.filter(a => a.check(card));
  const lockedAchievements = ACHIEVEMENTS.filter(a => !a.check(card));

  const tabs = [
    { key: 'tokens', label: 'Жетоны', icon: 'ri-coin-line' },
    { key: 'bookings', label: 'Записи', icon: 'ri-calendar-check-line' },
    { key: 'achievements', label: 'Достижения', icon: 'ri-trophy-line' },
    { key: 'benefits', label: 'Привилегии', icon: 'ri-vip-crown-line' },
    { key: 'profile', label: 'Профиль', icon: 'ri-user-settings-line' },
  ] as const;

  return (
    <div className="w-full max-w-2xl mx-auto px-3 sm:px-4 py-6 sm:py-8 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="font-mono-tech text-xs text-white/30 mb-1" style={{ letterSpacing: '1px' }}>ЛИЧНЫЙ КАБИНЕТ</div>
          <h1 className="font-orbitron font-black text-xl text-white">
            Привет, <span style={{ color: tier.color }}>{card.name.split(' ')[0]}</span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onShowAdmin}
            className="w-9 h-9 flex items-center justify-center rounded-sm cursor-pointer text-white/30 hover:text-white/70 transition-colors"
            style={{ border: '1px solid rgba(255,255,255,0.1)' }} title="Панель администратора">
            <i className="ri-shield-keyhole-line text-base" />
          </button>
          <button onClick={onLogout}
            className="w-9 h-9 flex items-center justify-center rounded-sm cursor-pointer text-white/30 hover:text-white/70 transition-colors"
            style={{ border: '1px solid rgba(255,255,255,0.1)' }} title="Выйти">
            <i className="ri-logout-box-line text-base" />
          </button>
        </div>
      </div>

      {/* Card display */}
      <div className="w-full overflow-hidden">
        <LoyaltyCardDisplay card={card} onCardUpdate={onCardUpdate} />
      </div>

      {/* Tabs */}
      <div className="flex items-center mt-6 mb-4 rounded-lg p-1 overflow-x-auto gap-1" style={{ background: 'rgba(0,245,255,0.04)', border: '1px solid rgba(0,245,255,0.1)' }}>
        {tabs.map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className="flex-1 py-2 rounded-md font-orbitron font-bold text-xs transition-all duration-200 cursor-pointer whitespace-nowrap flex items-center justify-center gap-1"
            style={{
              background: activeTab === tab.key ? 'rgba(0,245,255,0.12)' : 'transparent',
              color: activeTab === tab.key ? '#00f5ff' : 'rgba(255,255,255,0.35)',
              border: activeTab === tab.key ? '1px solid rgba(0,245,255,0.3)' : '1px solid transparent',
              fontSize: '10px', minWidth: '60px',
            }}>
            <i className={tab.icon} style={{ fontSize: '11px' }} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tokens tab ── */}
      {activeTab === 'tokens' && (
        <div className="space-y-4">
          {/* How tokens work */}
          <div className="rounded-lg p-5 relative overflow-hidden" style={{ background: 'rgba(1,0,20,0.9)', border: '1px solid rgba(155,77,255,0.2)' }}>
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #9b4dff, transparent)' }} />
            <h3 className="font-orbitron font-bold text-white text-xs tracking-widest mb-3 flex items-center gap-2">
              <i className="ri-question-line" style={{ color: '#9b4dff' }} />
              КАК РАБОТАЮТ ЖЕТОНЫ
            </h3>
            <div className="space-y-2.5">
              {[
                { icon: 'ri-vr-line', color: '#00f5ff', title: 'Как получить VR жетон', desc: 'За каждую VR-сессию от 2 часов — 1 жетон. Администратор начисляет его на ресепшен.' },
                { icon: 'ri-steering-2-line', color: '#ff6600', title: 'Как получить Авто жетон', desc: 'За каждую сессию на автосимуляторе — 1 жетон. Скажите администратору свой номер карты.' },
                { icon: 'ri-gift-line', color: '#4ade80', title: 'Как потратить VR жетоны', desc: 'Накопи 5 VR жетонов → получи 1 час VR бесплатно! Нажми кнопку ниже и покажи экран.' },
                { icon: 'ri-trophy-line', color: '#ffd700', title: 'Как потратить Авто жетоны', desc: 'Накопи 3 Авто жетона → получи 1 час на автосимуляторе бесплатно!' },
                { icon: 'ri-ban-line', color: '#ff006e', title: 'Важно про день рождения', desc: 'В день рождения скидка 20%, но жетоны и наклейки в этот день не начисляются.' },
              ].map(item => (
                <div key={item.title} className="flex items-start gap-3 p-3 rounded-lg"
                  style={{ background: `${item.color}06`, border: `1px solid ${item.color}18` }}>
                  <div className="w-8 h-8 flex items-center justify-center rounded-sm flex-shrink-0"
                    style={{ background: `${item.color}12`, border: `1px solid ${item.color}30` }}>
                    <i className={`${item.icon} text-sm`} style={{ color: item.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-orbitron font-bold text-white mb-0.5" style={{ fontSize: '10px' }}>{item.title}</div>
                    <div className="font-rajdhani text-white/55 text-xs leading-relaxed">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Current balance */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg p-4 text-center relative overflow-hidden"
              style={{ background: 'rgba(0,245,255,0.06)', border: '1px solid rgba(0,245,255,0.2)' }}>
              <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #00f5ff, transparent)' }} />
              <i className="ri-vr-line text-xl mb-1 block" style={{ color: '#00f5ff' }} />
              <div className="font-orbitron font-black text-3xl" style={{ color: '#00f5ff' }}>{card.vrTokens}</div>
              <div className="font-mono-tech text-white/40 mt-0.5" style={{ fontSize: '10px' }}>VR ЖЕТОНОВ</div>
              <div className="font-rajdhani text-xs mt-1" style={{ color: card.vrTokens >= 5 ? '#4ade80' : 'rgba(255,255,255,0.3)' }}>
                {card.vrTokens >= 5 ? '✓ Можно использовать!' : `До награды: ${5 - card.vrTokens}`}
              </div>
            </div>
            <div className="rounded-lg p-4 text-center relative overflow-hidden"
              style={{ background: 'rgba(255,102,0,0.06)', border: '1px solid rgba(255,102,0,0.2)' }}>
              <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #ff6600, transparent)' }} />
              <i className="ri-steering-2-line text-xl mb-1 block" style={{ color: '#ff6600' }} />
              <div className="font-orbitron font-black text-3xl" style={{ color: '#ff6600' }}>{card.autoTokens}</div>
              <div className="font-mono-tech text-white/40 mt-0.5" style={{ fontSize: '10px' }}>АВТО ЖЕТОНОВ</div>
              <div className="font-rajdhani text-xs mt-1" style={{ color: card.autoTokens >= 3 ? '#4ade80' : 'rgba(255,255,255,0.3)' }}>
                {card.autoTokens >= 3 ? '✓ Можно использовать!' : `До награды: ${3 - card.autoTokens}`}
              </div>
            </div>
          </div>

          <div className="rounded-lg p-5 relative overflow-hidden" style={{ background: 'rgba(1,0,20,0.9)', border: '1px solid rgba(0,245,255,0.15)' }}>
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #00f5ff, transparent)' }} />
            <h3 className="font-orbitron font-bold text-white text-xs tracking-widest mb-4">ИСПОЛЬЗОВАТЬ НАГРАДУ</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button onClick={handleRedeemVr} disabled={card.vrTokens < 5 || redeemLoading !== null}
                className="rounded-lg p-4 text-left transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: card.vrTokens >= 5 ? 'rgba(0,245,255,0.08)' : 'rgba(0,245,255,0.03)', border: `1px solid ${card.vrTokens >= 5 ? 'rgba(0,245,255,0.5)' : 'rgba(0,245,255,0.1)'}` }}>
                <div className="flex items-center gap-2 mb-1">
                  {redeemLoading === 'vr' ? <i className="ri-loader-4-line animate-spin" style={{ color: '#00f5ff' }} /> : <i className="ri-vr-line" style={{ color: '#00f5ff' }} />}
                  <span className="font-orbitron font-bold text-white text-xs">VR 1 час</span>
                </div>
                <div className="font-rajdhani text-white/50 text-xs">Бесплатно при 5 жетонах</div>
                <div className="mt-2 flex gap-0.5">
                  {Array.from({length:5}).map((_,i) => (
                    <div key={i} className="h-1.5 flex-1 rounded-full"
                      style={{ background: i < card.vrTokens ? '#00f5ff' : 'rgba(0,245,255,0.1)' }} />
                  ))}
                </div>
              </button>
              <button onClick={handleRedeemAuto} disabled={card.autoTokens < 3 || redeemLoading !== null}
                className="rounded-lg p-4 text-left transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: card.autoTokens >= 3 ? 'rgba(255,102,0,0.08)' : 'rgba(255,102,0,0.03)', border: `1px solid ${card.autoTokens >= 3 ? 'rgba(255,102,0,0.5)' : 'rgba(255,102,0,0.1)'}` }}>
                <div className="flex items-center gap-2 mb-1">
                  {redeemLoading === 'auto' ? <i className="ri-loader-4-line animate-spin" style={{ color: '#ff6600' }} /> : <i className="ri-steering-2-line" style={{ color: '#ff6600' }} />}
                  <span className="font-orbitron font-bold text-white text-xs">Автосим 1 час</span>
                </div>
                <div className="font-rajdhani text-white/50 text-xs">Бесплатно при 3 жетонах</div>
                <div className="mt-2 flex gap-0.5">
                  {Array.from({length:3}).map((_,i) => (
                    <div key={i} className="h-1.5 flex-1 rounded-full"
                      style={{ background: i < card.autoTokens ? '#ff6600' : 'rgba(255,102,0,0.1)' }} />
                  ))}
                </div>
              </button>
            </div>
            {redeemMsg && (
              <div className="mt-3 px-4 py-3 rounded-lg font-rajdhani text-sm"
                style={{ background: redeemMsg.success ? 'rgba(0,245,255,0.1)' : 'rgba(255,0,110,0.1)', border: `1px solid ${redeemMsg.success ? 'rgba(0,245,255,0.3)' : 'rgba(255,0,110,0.3)'}`, color: redeemMsg.success ? '#00f5ff' : '#ff006e' }}>
                {redeemMsg.text}
              </div>
            )}
          </div>

          <div className="rounded-lg p-5 relative overflow-hidden" style={{ background: 'rgba(1,0,20,0.9)', border: '1px solid rgba(155,77,255,0.2)' }}>
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #9b4dff, transparent)' }} />
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-orbitron font-bold text-white text-xs tracking-widest">ВВЕСТИ КОД СЕССИИ</h3>
              <button onClick={() => setShowClaimInfo(!showClaimInfo)}
                className="w-6 h-6 flex items-center justify-center rounded-full cursor-pointer text-white/30 hover:text-white/60"
                style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                <i className="ri-question-line text-xs" />
              </button>
            </div>
            {showClaimInfo && (
              <div className="mb-3 px-3 py-2.5 rounded-lg font-rajdhani text-xs text-white/60"
                style={{ background: 'rgba(155,77,255,0.08)', border: '1px solid rgba(155,77,255,0.2)' }}>
                Код сессии выдаёт администратор после каждого визита. Запросите код на ресепшен при оплате.
              </div>
            )}
            <div className="flex gap-2">
              <input value={claimCode} onChange={(e) => setClaimCode(e.target.value)}
                className="cyber-input flex-1" placeholder="Введите код сессии..."
                onKeyDown={(e) => e.key === 'Enter' && handleClaim()} disabled={claimLoading} />
              <button onClick={handleClaim} disabled={!claimCode.trim() || claimLoading}
                className="btn-cyber-cyan px-5 py-2.5 rounded-sm text-xs flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed">
                {claimLoading ? <i className="ri-loader-4-line animate-spin" /> : <><i className="ri-add-line mr-1" />Добавить</>}
              </button>
            </div>
            {claimMsg && (
              <div className="mt-3 px-4 py-3 rounded-lg font-rajdhani text-sm"
                style={{ background: claimMsg.success ? 'rgba(0,245,255,0.1)' : 'rgba(255,0,110,0.1)', border: `1px solid ${claimMsg.success ? 'rgba(0,245,255,0.3)' : 'rgba(255,0,110,0.3)'}`, color: claimMsg.success ? '#00f5ff' : '#ff006e' }}>
                {claimMsg.text}
              </div>
            )}
          </div>

          {/* History */}
          <div className="rounded-lg p-5 relative overflow-hidden" style={{ background: 'rgba(1,0,20,0.9)', border: '1px solid rgba(0,245,255,0.1)' }}>
            <h3 className="font-orbitron font-bold text-white/50 text-xs tracking-widest mb-4">ИСТОРИЯ ЖЕТОНОВ</h3>
            {card.history.length === 0 ? (
              <div className="text-center py-6">
                <i className="ri-history-line text-2xl text-white/15 block mb-2" />
                <p className="font-rajdhani text-white/30 text-sm">История пока пуста</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {card.history.slice(0, 8).map((entry: HistoryEntry) => {
                  const isReward = entry.type === 'REWARD_VR' || entry.type === 'REWARD_AUTO';
                  const isVr = entry.type === 'VR' || entry.type === 'REWARD_VR';
                  const color = isReward ? '#ff006e' : isVr ? '#00f5ff' : '#ff6600';
                  const icon = isReward ? 'ri-gift-line' : isVr ? 'ri-vr-line' : 'ri-steering-2-line';
                  const dateStr = new Date(entry.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
                  return (
                    <div key={entry.id} className="flex items-center gap-3 py-2 px-3 rounded-lg"
                      style={{ background: 'rgba(1,0,20,0.6)', border: `1px solid ${color}12` }}>
                      <div className="w-7 h-7 flex items-center justify-center rounded-sm flex-shrink-0"
                        style={{ background: `${color}10`, border: `1px solid ${color}25` }}>
                        <i className={`${icon} text-xs`} style={{ color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-rajdhani text-white/70 text-xs truncate">{entry.description}</div>
                        <div className="font-mono-tech text-white/25" style={{ fontSize: '10px' }}>{dateStr}</div>
                      </div>
                      <div className="font-orbitron font-bold text-xs flex-shrink-0" style={{ color: entry.tokens > 0 ? '#00f5ff' : '#ff006e' }}>
                        {entry.tokens > 0 ? `+${entry.tokens}` : entry.tokens}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Bookings tab ── */}
      {activeTab === 'bookings' && (
        <BookingsTab phone={card.phone} onFetch={onFetchBookings} />
      )}

      {/* ── Achievements tab ── */}
      {activeTab === 'achievements' && (
        <div className="space-y-4">
          <div className="rounded-lg p-5 relative overflow-hidden" style={{ background: 'rgba(1,0,20,0.9)', border: `1px solid ${tier.color}25` }}>
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${tier.color}, transparent)` }} />
            <h3 className="font-orbitron font-bold text-white text-xs tracking-widest mb-4">ПУТЬ УРОВНЕЙ</h3>
            <div className="flex items-center gap-1 overflow-x-auto pb-2">
              {CARD_TIERS.map((t, idx) => {
                const unlocked = card.vrHours >= t.minHours;
                const isCurrent = tier.tier === idx;
                return (
                  <div key={t.name} className="flex items-center gap-1 flex-shrink-0">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-10 h-10 flex items-center justify-center rounded-lg transition-all"
                        style={{ background: unlocked ? `${t.color}18` : 'rgba(255,255,255,0.03)', border: `2px solid ${unlocked ? t.color : 'rgba(255,255,255,0.1)'}`, boxShadow: isCurrent ? `0 0 15px ${t.glowColor}` : 'none' }}>
                        <i className={TIER_ICON_LIST[idx]} style={{ color: unlocked ? t.color : 'rgba(255,255,255,0.2)', fontSize: '16px' }} />
                      </div>
                      <span className="font-orbitron font-bold whitespace-nowrap" style={{ fontSize: '8px', color: unlocked ? t.color : 'rgba(255,255,255,0.2)' }}>{t.label}</span>
                      <span className="font-mono-tech whitespace-nowrap" style={{ fontSize: '7px', color: 'rgba(255,255,255,0.3)' }}>{t.minHours}ч</span>
                    </div>
                    {idx < CARD_TIERS.length - 1 && (
                      <div className="w-6 h-px flex-shrink-0 mb-5" style={{ background: card.vrHours >= CARD_TIERS[idx + 1].minHours ? CARD_TIERS[idx + 1].color : 'rgba(255,255,255,0.1)' }} />
                    )}
                  </div>
                );
              })}
            </div>
            <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
              <span className="font-mono-tech text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Всего VR часов: <span style={{ color: tier.color }}>{card.vrHours}</span></span>
              <span className="font-mono-tech text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Сессий: <span style={{ color: tier.color }}>{card.vrSessions}</span></span>
            </div>
          </div>

          <div className="rounded-lg p-5 relative overflow-hidden" style={{ background: 'rgba(1,0,20,0.9)', border: '1px solid rgba(155,77,255,0.2)' }}>
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #9b4dff, transparent)' }} />
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-orbitron font-bold text-white text-xs tracking-widest">КАРТОЧКА НАКЛЕЕК</h3>
              <span className="font-orbitron font-bold text-xs" style={{ color: '#9b4dff' }}>{card.stickers}/{STICKER_GOAL}</span>
            </div>
            <div className="grid grid-cols-10 gap-1 mb-3">
              {Array.from({ length: STICKER_GOAL }).map((_, i) => {
                const filled = i < card.stickers;
                return (
                  <div key={i} className="rounded-md flex items-center justify-center transition-all"
                    style={{ aspectRatio: '1', background: filled ? 'rgba(155,77,255,0.2)' : 'rgba(155,77,255,0.04)', border: `1px solid ${filled ? 'rgba(155,77,255,0.7)' : 'rgba(155,77,255,0.15)'}`, boxShadow: filled ? '0 0 8px rgba(155,77,255,0.4)' : 'none' }}>
                    <i className="ri-vr-line" style={{ fontSize: '10px', color: filled ? '#9b4dff' : 'rgba(155,77,255,0.2)' }} />
                  </div>
                );
              })}
            </div>
            <div className="h-1.5 rounded-full overflow-hidden mb-2" style={{ background: 'rgba(155,77,255,0.08)' }}>
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${(card.stickers / STICKER_GOAL) * 100}%`, background: 'linear-gradient(90deg, #9b4dff, #c084fc)' }} />
            </div>
            <p className="font-rajdhani text-white/40 text-xs">Наклейки добавляет администратор за каждую VR-сессию</p>
          </div>

          {unlockedAchievements.length > 0 && (
            <div className="rounded-lg p-5 relative overflow-hidden" style={{ background: 'rgba(1,0,20,0.9)', border: '1px solid rgba(0,245,255,0.15)' }}>
              <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #00f5ff, transparent)' }} />
              <h3 className="font-orbitron font-bold text-white text-xs tracking-widest mb-4">
                ДОСТИЖЕНИЯ <span className="font-mono-tech text-sm" style={{ color: '#00f5ff' }}>{unlockedAchievements.length}/{ACHIEVEMENTS.length}</span>
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {unlockedAchievements.map(a => (
                  <div key={a.id} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: `${a.color}08`, border: `1px solid ${a.color}30` }}>
                    <div className="w-10 h-10 flex items-center justify-center rounded-lg flex-shrink-0" style={{ background: `${a.color}15`, border: `1px solid ${a.color}40`, boxShadow: `0 0 10px ${a.color}30` }}>
                      <i className={`${a.icon} text-base`} style={{ color: a.color }} />
                    </div>
                    <div className="min-w-0">
                      <div className="font-orbitron font-bold text-white truncate" style={{ fontSize: '10px' }}>{a.title}</div>
                      <div className="font-rajdhani text-white/40 truncate" style={{ fontSize: '10px' }}>{a.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {lockedAchievements.length > 0 && (
            <div className="rounded-lg p-5" style={{ background: 'rgba(1,0,20,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <h3 className="font-orbitron font-bold text-white/30 text-xs tracking-widest mb-4">ЕЩЁ НУЖНО ОТКРЫТЬ</h3>
              <div className="grid grid-cols-2 gap-2">
                {lockedAchievements.map(a => (
                  <div key={a.id} className="flex items-center gap-3 p-3 rounded-lg opacity-40" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="w-10 h-10 flex items-center justify-center rounded-lg flex-shrink-0" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <i className="ri-lock-line text-base text-white/20" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-orbitron font-bold text-white/40 truncate" style={{ fontSize: '10px' }}>{a.title}</div>
                      <div className="font-rajdhani text-white/25 truncate" style={{ fontSize: '10px' }}>{a.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Benefits tab ── */}
      {activeTab === 'benefits' && (
        <div className="space-y-4">
          {/* Current card discount highlight */}
          <div className="rounded-xl p-5 relative overflow-hidden" style={{ background: `${tier.color}08`, border: `2px solid ${tier.color}40` }}>
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${tier.color}, transparent)` }} />
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${tier.color}15`, border: `2px solid ${tier.color}60` }}>
                <i className={`${TIER_ICON_LIST[tier.tier]} text-2xl`} style={{ color: tier.color }} />
              </div>
              <div>
                <div className="font-mono-tech text-white/40 mb-0.5" style={{ fontSize: '9px', letterSpacing: '1px' }}>ВАША ТЕКУЩАЯ КАРТА</div>
                <div className="font-orbitron font-black text-xl text-white">{tier.label}</div>
                <div className="font-orbitron font-bold mt-1" style={{ color: '#4ade80', fontSize: '13px' }}>−{tier.discount}% на все услуги клуба</div>
              </div>
              <div className="ml-auto text-right">
                <div className="font-orbitron font-black text-3xl" style={{ color: tier.color }}>{tier.discount}<span className="text-lg">%</span></div>
                <div className="font-mono-tech text-white/30 mt-0.5" style={{ fontSize: '9px' }}>СКИДКА</div>
              </div>
            </div>
          </div>

          {/* All 5 levels */}
          <div className="rounded-xl overflow-hidden" style={{ background: '#06001e', border: '1px solid rgba(0,245,255,0.15)' }}>
            <div className="px-4 py-3 flex items-center gap-2" style={{ background: 'rgba(0,245,255,0.05)', borderBottom: '1px solid rgba(0,245,255,0.1)' }}>
              <i className="ri-award-line text-sm" style={{ color: '#00f5ff' }} />
              <span className="font-orbitron font-bold text-xs tracking-widest text-white">5 УРОВНЕЙ КЛУБНОЙ КАРТЫ</span>
            </div>
            <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
              {CARD_TIERS.map((t, idx) => {
                const isActive = tier.tier === idx;
                const isUnlocked = card.vrHours >= t.minHours;
                return (
                  <div key={t.name} className="flex items-center gap-3 px-4 py-3 transition-all" style={{ background: isActive ? `${t.color}08` : 'transparent' }}>
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: isUnlocked ? `${t.color}15` : 'rgba(255,255,255,0.03)', border: `1.5px solid ${isUnlocked ? t.color : 'rgba(255,255,255,0.1)'}` }}>
                      <i className={`${TIER_ICON_LIST[idx]} text-sm`} style={{ color: isUnlocked ? t.color : 'rgba(255,255,255,0.2)' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-orbitron font-bold text-xs" style={{ color: isUnlocked ? t.color : 'rgba(255,255,255,0.3)' }}>{t.label}</span>
                        {isActive && <span className="font-orbitron font-bold px-1.5 py-0.5 rounded-full" style={{ fontSize: '7px', background: `${t.color}20`, color: t.color, border: `1px solid ${t.color}40` }}>ТЕКУЩАЯ</span>}
                      </div>
                      <div className="font-mono-tech mt-0.5" style={{ fontSize: '9px', color: 'rgba(255,255,255,0.35)' }}>
                        {t.minHours === 0 ? 'Выдаётся при регистрации' : `Открывается с ${t.minHours} часов VR`}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="font-orbitron font-black text-lg" style={{ color: isUnlocked ? '#4ade80' : 'rgba(255,255,255,0.2)' }}>−{t.discount}%</div>
                      {!isUnlocked && t.minHours > card.vrHours && (
                        <div className="font-mono-tech" style={{ fontSize: '8px', color: 'rgba(255,255,255,0.25)' }}>ещё {t.minHours - card.vrHours}ч</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bonus rules */}
          <div className="rounded-xl overflow-hidden" style={{ background: '#06001e', border: '1px solid rgba(0,245,255,0.12)' }}>
            <div className="px-4 py-3 flex items-center gap-2" style={{ background: 'rgba(0,245,255,0.04)', borderBottom: '1px solid rgba(0,245,255,0.08)' }}>
              <i className="ri-gift-line text-sm" style={{ color: '#00f5ff' }} />
              <span className="font-orbitron font-bold text-xs tracking-widest text-white">БОНУСНАЯ СИСТЕМА</span>
            </div>
            <div className="p-4 space-y-3">
              {[
                { icon: 'ri-vr-line', color: '#00f5ff', title: 'Бесплатный час VR (будни)', desc: 'Каждые 5 часов VR-игры → 1 бесплатный час VR. Засчитывается только в будние дни.' },
                { icon: 'ri-steering-2-line', color: '#ff6600', title: 'Бесплатный автосим', desc: '3 жетона автосима → 1 час автосимулятора бесплатно. Жетон за каждую сессию.' },
                { icon: 'ri-car-line', color: '#ff6600', title: 'Бонус Стандартной карты', desc: '10 часов на автосиме → 2 часа VR бесплатно (разовый бонус). Скажите администратору.' },
                { icon: 'ri-price-tag-3-line', color: '#4ade80', title: 'Скидка карты', desc: 'Скидка применяется ко всем услугам: VR (800₽/час), Автосим, PlayStation 5. 4 VR × 1 час = 3 200₽ — скидка применяется к итогу.' },
              ].map(item => (
                <div key={item.title} className="flex items-start gap-3 p-3 rounded-lg" style={{ background: `${item.color}06`, border: `1px solid ${item.color}18` }}>
                  <div className="w-8 h-8 flex items-center justify-center rounded-md flex-shrink-0" style={{ background: `${item.color}12`, border: `1px solid ${item.color}30` }}>
                    <i className={`${item.icon} text-sm`} style={{ color: item.color }} />
                  </div>
                  <div>
                    <div className="font-orbitron font-bold text-white mb-0.5" style={{ fontSize: '10px' }}>{item.title}</div>
                    <div className="font-rajdhani text-white/50 text-xs leading-relaxed">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Birthday & discount rules */}
          <div className="rounded-xl overflow-hidden" style={{ background: '#06001e', border: '1px solid rgba(255,0,110,0.2)' }}>
            <div className="px-4 py-3 flex items-center gap-2" style={{ background: 'rgba(255,0,110,0.05)', borderBottom: '1px solid rgba(255,0,110,0.1)' }}>
              <i className="ri-cake-line text-sm" style={{ color: '#ff006e' }} />
              <span className="font-orbitron font-bold text-xs tracking-widest text-white">СКИДКА НА ДЕНЬ РОЖДЕНИЯ</span>
            </div>
            <div className="p-4 space-y-3">
              {[
                { icon: 'ri-percent-line', color: '#ff006e', title: 'Скидка ДР — 20%', desc: 'Действует ±3 дня от даты рождения при предъявлении документа. Аренда всего клуба: 3 800₽/час.' },
                { icon: 'ri-close-circle-line', color: '#ffa500', title: 'Скидки не суммируются', desc: 'В день рождения применяется только скидка ДР (20%), скидка клубной карты не добавляется. Используется одна — большая.' },
                { icon: 'ri-time-line', color: '#4ade80', title: 'Часы всё равно копятся', desc: 'В день рождения часы VR засчитываются в карту как обычно. Жетоны и наклейки в этот день не начисляются.' },
                { icon: 'ri-group-line', color: '#00f5ff', title: 'Важно: подсчёт часов', desc: 'Время засчитывается по длительности сессии, а не количеству шлемов. 4 шлема × 3 часа = 3 часа в карту (не 12).' },
              ].map(item => (
                <div key={item.title} className="flex items-start gap-3 p-3 rounded-lg" style={{ background: `${item.color}06`, border: `1px solid ${item.color}18` }}>
                  <div className="w-8 h-8 flex items-center justify-center rounded-md flex-shrink-0" style={{ background: `${item.color}12`, border: `1px solid ${item.color}30` }}>
                    <i className={`${item.icon} text-sm`} style={{ color: item.color }} />
                  </div>
                  <div>
                    <div className="font-orbitron font-bold text-white mb-0.5" style={{ fontSize: '10px' }}>{item.title}</div>
                    <div className="font-rajdhani text-white/50 text-xs leading-relaxed">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing table */}
          <div className="rounded-xl overflow-hidden" style={{ background: '#06001e', border: '1px solid rgba(255,215,0,0.15)' }}>
            <div className="px-4 py-3 flex items-center gap-2" style={{ background: 'rgba(255,215,0,0.04)', borderBottom: '1px solid rgba(255,215,0,0.1)' }}>
              <i className="ri-price-tag-3-line text-sm" style={{ color: '#ffd700' }} />
              <span className="font-orbitron font-bold text-xs tracking-widest text-white">ПРАЙС ДЛЯ ВАШЕЙ КАРТЫ</span>
            </div>
            <div className="p-4">
              <div className="rounded-lg overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="grid grid-cols-3 px-3 py-2" style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <span className="font-mono-tech text-white/40" style={{ fontSize: '9px' }}>УСЛУГА</span>
                  <span className="font-mono-tech text-white/40 text-center" style={{ fontSize: '9px' }}>ЦЕНА</span>
                  <span className="font-mono-tech text-right" style={{ fontSize: '9px', color: '#4ade80' }}>−{tier.discount}% ВАМ</span>
                </div>
                {[
                  { name: 'VR 30 минут', base: 400 },
                  { name: 'VR 1 час', base: 800 },
                  { name: '4 VR 1 час', base: 3200 },
                  { name: 'Автосим 15 мин', base: 300 },
                  { name: 'Автосим 30 мин', base: 550 },
                  { name: 'PlayStation 5 1ч', base: 350 },
                ].map((row) => {
                  const discounted = Math.round(row.base * (1 - tier.discount / 100));
                  return (
                    <div key={row.name} className="grid grid-cols-3 px-3 py-2.5 border-b last:border-b-0" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                      <span className="font-rajdhani text-white/60 text-xs">{row.name}</span>
                      <span className="font-mono-tech text-white/40 text-center text-xs">{row.base} ₽</span>
                      <span className="font-orbitron font-bold text-right text-xs" style={{ color: '#4ade80' }}>{discounted} ₽</span>
                    </div>
                  );
                })}
              </div>
              <p className="font-rajdhani text-white/30 text-xs mt-3 text-center">* Скидка карты не суммируется со скидкой дня рождения</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Profile tab ── */}
      {activeTab === 'profile' && (
        <>
          <ProfileTab card={card} onUpdate={onUpdateProfile} onCardUpdate={onCardUpdate} />
          <CardPolicyInfo />
        </>
      )}
    </div>
  );
});

Dashboard.displayName = 'Dashboard';
export default Dashboard;