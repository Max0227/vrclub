import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

export interface HistoryEntry {
  id: string;
  date: string;
  type: 'VR' | 'AUTO' | 'REWARD_VR' | 'REWARD_AUTO';
  description: string;
  tokens: number;
}

export interface LoyaltyCard {
  cardNumber: string;
  name: string;
  phone: string;
  email: string;
  vrTokens: number;
  autoTokens: number;
  vrSessions: number;
  autoSessions: number;
  vrHours: number;
  stickers: number;
  createdAt: string;
  history: HistoryEntry[];
}

// ── Tier System ──────────────────────────────────────────────────────────────
export interface CardTier {
  tier: number;
  name: string;
  label: string;
  color: string;
  glowColor: string;
  bgGradient: string;
  borderColor: string;
  nextAt: number | null;
  minHours: number;
  /** Discount percentage on all paid services (not stackable with birthday discount) */
  discount: number;
}

export const CARD_TIERS: CardTier[] = [
  {
    tier: 0,
    name: 'STANDARD',
    label: 'Стандартная',
    color: '#00f5ff',
    glowColor: 'rgba(0,245,255,0.4)',
    bgGradient: 'linear-gradient(135deg, #010014 0%, #0a0030 40%, #010020 100%)',
    borderColor: 'rgba(0,245,255,0.5)',
    nextAt: 20,
    minHours: 0,
    discount: 5,
  },
  {
    tier: 1,
    name: 'SILVER',
    label: 'Серебряная',
    color: '#c8d6e5',
    glowColor: 'rgba(200,214,229,0.4)',
    bgGradient: 'linear-gradient(135deg, #1a1a2e 0%, #2d2d44 50%, #1a1a2e 100%)',
    borderColor: 'rgba(200,214,229,0.6)',
    nextAt: 40,
    minHours: 20,
    discount: 7,
  },
  {
    tier: 2,
    name: 'GOLD',
    label: 'Золотая',
    color: '#ffd700',
    glowColor: 'rgba(255,215,0,0.5)',
    bgGradient: 'linear-gradient(135deg, #1a1200 0%, #2a1f00 50%, #1a1200 100%)',
    borderColor: 'rgba(255,215,0,0.6)',
    nextAt: 60,
    minHours: 40,
    discount: 10,
  },
  {
    tier: 3,
    name: 'PLATINUM',
    label: 'Платиновая',
    color: '#c084fc',
    glowColor: 'rgba(192,132,252,0.5)',
    bgGradient: 'linear-gradient(135deg, #0f0020 0%, #1a003a 50%, #0f0020 100%)',
    borderColor: 'rgba(192,132,252,0.6)',
    nextAt: 100,
    minHours: 60,
    discount: 12,
  },
  {
    tier: 4,
    name: 'CYBER',
    label: 'CYBER',
    color: '#00f5ff',
    glowColor: 'rgba(0,245,255,0.6)',
    bgGradient: 'linear-gradient(135deg, #000a20 0%, #001a30 30%, #0a0020 70%, #000a20 100%)',
    borderColor: 'rgba(0,245,255,0.9)',
    nextAt: null,
    minHours: 100,
    discount: 20,
  },
];

export const getCardTier = (vrHours: number): CardTier => {
  for (let i = CARD_TIERS.length - 1; i >= 0; i--) {
    if (vrHours >= CARD_TIERS[i].minHours) return CARD_TIERS[i];
  }
  return CARD_TIERS[0];
};

// ── Achievements ─────────────────────────────────────────────────────────────
export interface Achievement {
  id: string;
  icon: string;
  title: string;
  desc: string;
  color: string;
  check: (card: LoyaltyCard) => boolean;
  secret?: boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_visit', icon: 'ri-vr-line', title: 'Первый шаг', desc: 'Первая VR-сессия', color: '#00f5ff', check: (c) => c.vrSessions >= 1 },
  { id: 'five_hours', icon: 'ri-time-line', title: '5 часов VR', desc: 'Налетал 5 часов в виртуальности', color: '#4ade80', check: (c) => c.vrHours >= 5 },
  { id: 'free_hour_1', icon: 'ri-gift-line', title: 'Первый подарок', desc: 'Заработан 1-й бесплатный час VR', color: '#00f5ff', check: (c) => c.vrHours >= 5 },
  { id: 'ten_sessions', icon: 'ri-shield-star-line', title: 'Постоянный клиент', desc: '10 VR-сессий', color: '#ffd700', check: (c) => c.vrSessions >= 10 },
  { id: 'silver_tier', icon: 'ri-medal-line', title: 'Серебряный', desc: 'Открыта Серебряная карта (+7% скидка)', color: '#c8d6e5', check: (c) => c.vrHours >= 20 },
  { id: 'first_stamp', icon: 'ri-checkbox-circle-line', title: 'Первая марка', desc: 'Заполнена карточка наклеек', color: '#a78bfa', check: (c) => (c.vrSessions >= 10) },
  { id: 'gold_tier', icon: 'ri-trophy-line', title: 'Золотой', desc: 'Открыта Золотая карта (+10% скидка)', color: '#ffd700', check: (c) => c.vrHours >= 40 },
  { id: 'twenty_sessions', icon: 'ri-rocket-line', title: 'Ветеран VR', desc: '20 VR-сессий', color: '#c084fc', check: (c) => c.vrSessions >= 20 },
  { id: 'platinum_tier', icon: 'ri-vip-crown-line', title: 'Платина', desc: 'Открыта Платиновая карта (+12% скидка)', color: '#c084fc', check: (c) => c.vrHours >= 60 },
  { id: 'cyber_tier', icon: 'ri-cpu-line', title: 'CYBER LEGEND', desc: '100 часов в VR — легенда клуба! (+20% скидка)', color: '#00f5ff', check: (c) => c.vrHours >= 100 },
];

export const STICKER_GOAL = 10;

export const INACTIVITY_DAYS = 90;

/** Returns last activity date: last history entry OR card created_at */
export const getLastActivityDate = (card: LoyaltyCard): Date => {
  if (card.history && card.history.length > 0) {
    return new Date(card.history[0].date);
  }
  return new Date(card.createdAt);
};

/** Returns days since last activity */
export const getDaysSinceActivity = (card: LoyaltyCard): number => {
  const last = getLastActivityDate(card);
  const now = new Date();
  return Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
};

/** Returns days remaining before deletion (negative = already overdue) */
export const getDaysUntilDeletion = (card: LoyaltyCard): number => {
  return INACTIVITY_DAYS - getDaysSinceActivity(card);
};

// ── Client Booking ────────────────────────────────────────────────────────────
export interface ClientBooking {
  id: string;
  name: string;
  phone: string;
  service: string;
  booking_date: string;
  booking_time: string;
  guests: number;
  status: string;
  vr_count: number | null;
  duration_minutes: number | null;
  comment: string | null;
}

const CARD_NUMBER_KEY = 'paradox_card_ref_v4';
const SUPABASE_URL = import.meta.env.VITE_PUBLIC_SUPABASE_URL as string;

const generateCardNumber = (): string => {
  const num = Math.floor(10000 + Math.random() * 90000);
  return `PDX-CLUB-${num}`;
};

export const getVrTokenCode = (cardNumber: string): string => {
  const digits = cardNumber.replace('PDX-CLUB-', '');
  const last4 = digits.slice(-4).split('').reverse().join('');
  return `VR${last4}`;
};

export const getAutoTokenCode = (cardNumber: string): string => {
  const digits = cardNumber.replace('PDX-CLUB-', '');
  const last4 = digits.slice(-4).split('').reverse().join('');
  return `AS${last4}`;
};

const mapRow = (row: Record<string, unknown>, history: HistoryEntry[]): LoyaltyCard => ({
  cardNumber: row.card_number as string,
  name: row.name as string,
  phone: row.phone as string,
  email: (row.email as string) || '',
  vrTokens: (row.vr_tokens as number) ?? 0,
  autoTokens: (row.auto_tokens as number) ?? 0,
  vrSessions: (row.vr_sessions as number) ?? 0,
  autoSessions: (row.auto_sessions as number) ?? 0,
  vrHours: (row.vr_hours as number) ?? 0,
  stickers: (row.stickers as number) ?? 0,
  createdAt: row.created_at as string,
  history,
});

const mapHistoryRow = (row: Record<string, unknown>): HistoryEntry => ({
  id: row.id as string,
  date: row.date as string,
  type: row.type as HistoryEntry['type'],
  description: row.description as string,
  tokens: row.tokens as number,
});

const sendWelcomeEmail = async (email: string, name: string, cardNumber: string, password: string): Promise<void> => {
  try {
    await fetch(`${SUPABASE_URL}/functions/v1/send-welcome-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, cardNumber, password }),
    });
  } catch {
    // silent
  }
};

export const useLoyalty = () => {
  const [card, setCard] = useState<LoyaltyCard | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCard = useCallback(async (cardNumber: string): Promise<LoyaltyCard | null> => {
    const { data: cardRow } = await supabase
      .from('loyalty_cards')
      .select('*')
      .eq('card_number', cardNumber)
      .maybeSingle();

    if (!cardRow) return null;

    const { data: historyRows } = await supabase
      .from('loyalty_history')
      .select('*')
      .eq('card_number', cardNumber)
      .order('date', { ascending: false });

    return mapRow(cardRow as Record<string, unknown>, (historyRows || []).map(mapHistoryRow));
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem(CARD_NUMBER_KEY);
    if (!stored) { setLoading(false); return; }
    fetchCard(stored).then((result) => {
      if (result) {
        setCard(result);
      } else {
        localStorage.removeItem(CARD_NUMBER_KEY);
      }
      setLoading(false);
    });
  }, [fetchCard]);

  /** Normalize phone: strip all spaces/dashes, keep only digits and leading + */
  const normalizePhone = (phone: string): string => {
    return phone.replace(/[\s\-\(\)]/g, '');
  };

  const register = useCallback(async (
    name: string,
    phone: string,
    email: string,
    password: string,
  ): Promise<{ success: boolean; message: string }> => {
    const normalizedPhone = normalizePhone(phone);
    // Check if phone already registered
    const { data: existingPhone } = await supabase
      .from('loyalty_cards')
      .select('card_number')
      .eq('phone', normalizedPhone)
      .maybeSingle();

    if (existingPhone) {
      return { success: false, message: 'Этот телефон уже зарегистрирован. Войдите через вкладку «Войти».' };
    }

    if (email) {
      const { data: existingEmail } = await supabase
        .from('loyalty_cards')
        .select('card_number')
        .eq('email', email.toLowerCase())
        .maybeSingle();
      if (existingEmail) {
        return { success: false, message: 'Этот email уже зарегистрирован.' };
      }
    }

    const cardNumber = generateCardNumber();
    const { error } = await supabase.from('loyalty_cards').insert({
      card_number: cardNumber,
      name: name.trim(),
      phone: normalizedPhone,
      email: email ? email.toLowerCase().trim() : null,
      password: password,
      vr_tokens: 0,
      auto_tokens: 0,
      vr_sessions: 0,
      auto_sessions: 0,
      vr_hours: 0,
      stickers: 0,
    });
    if (error) return { success: false, message: 'Ошибка создания карты. Попробуйте ещё раз.' };

    localStorage.setItem(CARD_NUMBER_KEY, cardNumber);
    const newCard = await fetchCard(cardNumber);
    if (newCard) setCard(newCard);
    if (email) sendWelcomeEmail(email, name, cardNumber, password);
    return { success: true, message: cardNumber };
  }, [fetchCard]);

  const login = useCallback(async (phone: string, password: string): Promise<{ success: boolean; message: string }> => {
    const normalizePhone = (p: string) => p.replace(/[\s\-\(\)]/g, '');
    const normalizedPhone = normalizePhone(phone);

    // Try phone login first (try normalized and original)
    let cardRow: { card_number: string } | null = null;
    const { data: byPhone } = await supabase
      .from('loyalty_cards')
      .select('card_number')
      .eq('phone', normalizedPhone)
      .eq('password', password)
      .maybeSingle();
    cardRow = byPhone;

    // Fallback: try original phone format (for old accounts)
    if (!cardRow && normalizedPhone !== phone.trim()) {
      const { data: byPhoneOriginal } = await supabase
        .from('loyalty_cards')
        .select('card_number')
        .eq('phone', phone.trim())
        .eq('password', password)
        .maybeSingle();
      cardRow = byPhoneOriginal;
    }

    // Fallback: try email login
    if (!cardRow) {
      const { data: byEmail } = await supabase
        .from('loyalty_cards')
        .select('card_number')
        .eq('email', phone.toLowerCase().trim())
        .eq('password', password)
        .maybeSingle();
      cardRow = byEmail;
    }

    if (!cardRow) {
      return { success: false, message: 'Неверный телефон или пароль. Проверьте данные или зарегистрируйтесь.' };
    }

    const found = await fetchCard(cardRow.card_number as string);
    if (!found) return { success: false, message: 'Ошибка загрузки карты. Попробуйте ещё раз.' };

    // Check inactivity auto-deletion
    const daysInactive = getDaysSinceActivity(found);
    if (daysInactive >= INACTIVITY_DAYS) {
      await supabase.from('loyalty_history').delete().eq('card_number', found.cardNumber);
      await supabase.from('loyalty_cards').delete().eq('card_number', found.cardNumber);
      return {
        success: false,
        message: `Ваша карта была автоматически удалена из-за ${daysInactive} дней неактивности (лимит: ${INACTIVITY_DAYS} дней). Пожалуйста, зарегистрируйтесь заново.`,
      };
    }

    localStorage.setItem(CARD_NUMBER_KEY, found.cardNumber);
    setCard(found);
    return { success: true, message: 'Добро пожаловать!' };
  }, [fetchCard]);

  const findCard = useCallback(async (cardNumber: string): Promise<{ success: boolean; message: string }> => {
    const found = await fetchCard(cardNumber.toUpperCase().trim());
    if (!found) return { success: false, message: 'Карта не найдена. Проверьте номер.' };
    localStorage.setItem(CARD_NUMBER_KEY, found.cardNumber);
    setCard(found);
    return { success: true, message: 'Карта найдена!' };
  }, [fetchCard]);

  const claimToken = useCallback(async (code: string): Promise<{ success: boolean; message: string }> => {
    if (!card) return { success: false, message: 'Нет карты' };
    const upper = code.toUpperCase().replace(/\s/g, '');
    const vrCode = getVrTokenCode(card.cardNumber).toUpperCase();
    const asCode = getAutoTokenCode(card.cardNumber).toUpperCase();

    let tokenType: 'VR' | 'AUTO' | null = null;
    if (upper === vrCode) tokenType = 'VR';
    else if (upper === asCode) tokenType = 'AUTO';
    else return { success: false, message: 'Неверный код сессии. Обратитесь к администратору.' };

    const isVr = tokenType === 'VR';
    const updateFields = isVr
      ? { vr_tokens: card.vrTokens + 1, vr_sessions: card.vrSessions + 1 }
      : { auto_tokens: card.autoTokens + 1, auto_sessions: card.autoSessions + 1 };

    const { error: updateErr } = await supabase
      .from('loyalty_cards')
      .update(updateFields)
      .eq('card_number', card.cardNumber);
    if (updateErr) return { success: false, message: 'Ошибка обновления. Попробуйте ещё раз.' };

    await supabase.from('loyalty_history').insert({
      card_number: card.cardNumber,
      type: tokenType,
      description: isVr ? 'VR-сессия 2 часа — жетон начислен' : 'Автосимулятор 30 мин — жетон начислен',
      tokens: 1,
    });

    const updated = await fetchCard(card.cardNumber);
    if (updated) setCard(updated);
    return { success: true, message: `+1 ${isVr ? 'VR-жетон' : 'жетон Автосима'} начислен!` };
  }, [card, fetchCard]);

  const redeemVr = useCallback(async (): Promise<{ success: boolean; message: string }> => {
    if (!card) return { success: false, message: 'Нет карты' };
    if (card.vrTokens < 5) return { success: false, message: `Нужно ещё ${5 - card.vrTokens} жетонов` };

    const { error } = await supabase
      .from('loyalty_cards')
      .update({ vr_tokens: card.vrTokens - 5 })
      .eq('card_number', card.cardNumber);
    if (error) return { success: false, message: 'Ошибка. Попробуйте ещё раз.' };

    await supabase.from('loyalty_history').insert({
      card_number: card.cardNumber,
      type: 'REWARD_VR',
      description: 'Использовано: 1 час VR бесплатно',
      tokens: -5,
    });

    const updated = await fetchCard(card.cardNumber);
    if (updated) setCard(updated);
    return { success: true, message: '1 час VR активирован! Покажите экран администратору.' };
  }, [card, fetchCard]);

  const redeemAuto = useCallback(async (): Promise<{ success: boolean; message: string }> => {
    if (!card) return { success: false, message: 'Нет карты' };
    if (card.autoTokens < 3) return { success: false, message: `Нужно ещё ${3 - card.autoTokens} жетонов` };

    const { error } = await supabase
      .from('loyalty_cards')
      .update({ auto_tokens: card.autoTokens - 3 })
      .eq('card_number', card.cardNumber);
    if (error) return { success: false, message: 'Ошибка. Попробуйте ещё раз.' };

    await supabase.from('loyalty_history').insert({
      card_number: card.cardNumber,
      type: 'REWARD_AUTO',
      description: 'Использовано: 1 час Автосима бесплатно',
      tokens: -3,
    });

    const updated = await fetchCard(card.cardNumber);
    if (updated) setCard(updated);
    return { success: true, message: '1 час Автосима активирован! Покажите экран администратору.' };
  }, [card, fetchCard]);

  const validatePin = useCallback(async (pin: string): Promise<boolean> => {
    const { data } = await supabase
      .from('admin_settings')
      .select('pin')
      .eq('id', 1)
      .maybeSingle();
    return data?.pin === pin;
  }, []);

  const adminAddToken = useCallback(async (
    cardNum: string,
    type: 'VR' | 'AUTO',
    pin: string,
  ): Promise<{ success: boolean; message: string }> => {
    const pinOk = await validatePin(pin);
    if (!pinOk) return { success: false, message: 'Неверный PIN-код' };

    const target = await fetchCard(cardNum.toUpperCase().trim());
    if (!target) return { success: false, message: 'Карта не найдена в базе данных' };

    const isVr = type === 'VR';
    const updateFields = isVr
      ? { vr_tokens: target.vrTokens + 1, vr_sessions: target.vrSessions + 1 }
      : { auto_tokens: target.autoTokens + 1, auto_sessions: target.autoSessions + 1 };

    const { error } = await supabase
      .from('loyalty_cards')
      .update(updateFields)
      .eq('card_number', target.cardNumber);
    if (error) return { success: false, message: 'Ошибка обновления.' };

    await supabase.from('loyalty_history').insert({
      card_number: target.cardNumber,
      type,
      description: isVr ? 'VR-сессия [Администратор]' : 'Автосимулятор [Администратор]',
      tokens: 1,
    });

    if (card && card.cardNumber === target.cardNumber) {
      const updated = await fetchCard(target.cardNumber);
      if (updated) setCard(updated);
    }
    return { success: true, message: `Жетон ${type} начислен: ${target.name} (${target.cardNumber})` };
  }, [validatePin, fetchCard, card]);

  // Add VR sticker + hours to a loyalty card
  const adminAddSticker = useCallback(async (
    cardNum: string,
    hours: number,
  ): Promise<{ success: boolean; message: string; cardCompleted?: boolean }> => {
    const target = await fetchCard(cardNum.toUpperCase().trim());
    if (!target) return { success: false, message: 'Карта не найдена' };

    const newStickers = target.stickers + 1;
    const cardCompleted = newStickers >= STICKER_GOAL;
    const finalStickers = cardCompleted ? 0 : newStickers;
    const newVrHours = target.vrHours + hours;
    const newVrSessions = target.vrSessions + 1;

    const { error } = await supabase
      .from('loyalty_cards')
      .update({
        stickers: finalStickers,
        vr_hours: newVrHours,
        vr_sessions: newVrSessions,
      })
      .eq('card_number', target.cardNumber);
    if (error) return { success: false, message: 'Ошибка обновления' };

    await supabase.from('loyalty_history').insert({
      card_number: target.cardNumber,
      type: 'VR',
      description: cardCompleted
        ? `VR ${hours}ч — наклейка добавлена, карта заполнена! [Администратор]`
        : `VR ${hours}ч — наклейка добавлена [Администратор]`,
      tokens: 1,
    });

    if (card && card.cardNumber === target.cardNumber) {
      const updated = await fetchCard(target.cardNumber);
      if (updated) setCard(updated);
    }

    const newTier = getCardTier(newVrHours);
    const msg = cardCompleted
      ? `Карточка заполнена! Поздравьте клиента. Уровень: ${newTier.label}`
      : `Наклейка добавлена: ${target.name} (${finalStickers}/${STICKER_GOAL})`;
    return { success: true, message: msg, cardCompleted };
  }, [fetchCard, card]);

  const adminSearchClients = useCallback(async (query: string): Promise<{ cardNumber: string; name: string; phone: string; vrTokens: number; autoTokens: number }[]> => {
    if (!query.trim() || query.trim().length < 2) return [];
    const q = query.trim().toLowerCase();
    const { data } = await supabase
      .from('loyalty_cards')
      .select('card_number, name, phone, vr_tokens, auto_tokens')
      .or(`name.ilike.%${q}%,phone.ilike.%${q}%,card_number.ilike.%${q}%`)
      .limit(8);
    if (!data) return [];
    return (data as Record<string, unknown>[]).map((row) => ({
      cardNumber: row.card_number as string,
      name: row.name as string,
      phone: row.phone as string,
      vrTokens: row.vr_tokens as number,
      autoTokens: row.auto_tokens as number,
    }));
  }, []);

  // ── Password Reset (Admin generates code, client uses it) ─────────────────
  const adminGenerateResetCode = useCallback(async (
    cardNum: string,
    pin: string,
  ): Promise<{ success: boolean; message: string; code?: string }> => {
    const pinOk = await validatePin(pin);
    if (!pinOk) return { success: false, message: 'Неверный PIN-код' };

    const target = await fetchCard(cardNum.toUpperCase().trim());
    if (!target) return { success: false, message: 'Карта не найдена' };

    // Generate random 6-digit code
    const code = String(Math.floor(100000 + Math.random() * 900000));

    const { error } = await supabase
      .from('loyalty_cards')
      .update({ reset_code: code })
      .eq('card_number', target.cardNumber);

    if (error) return { success: false, message: 'Ошибка генерации кода' };

    return { success: true, message: `Код сброса для ${target.name}: ${code}`, code };
  }, [validatePin, fetchCard]);

  const resetPasswordWithCode = useCallback(async (
    phone: string,
    code: string,
    newPassword: string,
  ): Promise<{ success: boolean; message: string }> => {
    if (newPassword.length < 8) return { success: false, message: 'Пароль должен быть не менее 8 символов' };

    const normalizePhone = (p: string) => p.replace(/[\s\-\(\)]/g, '');
    const normalizedPhone = normalizePhone(phone);

    // Try normalized phone first, then original
    let cardRow: Record<string, unknown> | null = null;
    const { data: byNormalized } = await supabase
      .from('loyalty_cards')
      .select('card_number, reset_code, name')
      .eq('phone', normalizedPhone)
      .maybeSingle();
    if (byNormalized) cardRow = byNormalized as Record<string, unknown>;

    if (!cardRow && normalizedPhone !== phone.trim()) {
      const { data: byOriginal } = await supabase
        .from('loyalty_cards')
        .select('card_number, reset_code, name')
        .eq('phone', phone.trim())
        .maybeSingle();
      if (byOriginal) cardRow = byOriginal as Record<string, unknown>;
    }

    if (!cardRow) return { success: false, message: 'Телефон не найден. Проверьте номер.' };

    if (!cardRow.reset_code || cardRow.reset_code !== code.trim()) {
      return { success: false, message: 'Неверный код сброса. Обратитесь к администратору.' };
    }

    const { error } = await supabase
      .from('loyalty_cards')
      .update({ password: newPassword.trim(), reset_code: null })
      .eq('card_number', cardRow.card_number as string);

    if (error) return { success: false, message: 'Ошибка обновления пароля' };

    return { success: true, message: 'Пароль успешно изменён! Теперь войдите с новым паролем.' };
  }, []);

  const adminUpdateCardFull = useCallback(async (
    cardNum: string,
    updates: {
      name?: string;
      phone?: string;
      email?: string;
      vr_tokens?: number;
      auto_tokens?: number;
      vr_sessions?: number;
      auto_sessions?: number;
      vr_hours?: number;
      stickers?: number;
    },
    pin: string,
  ): Promise<{ success: boolean; message: string }> => {
    const pinOk = await validatePin(pin);
    if (!pinOk) return { success: false, message: 'Неверный PIN-код' };

    const { error } = await supabase
      .from('loyalty_cards')
      .update(updates)
      .eq('card_number', cardNum.toUpperCase().trim());

    if (error) return { success: false, message: 'Ошибка обновления данных' };

    if (card && card.cardNumber === cardNum.toUpperCase().trim()) {
      const updated = await fetchCard(cardNum.toUpperCase().trim());
      if (updated) setCard(updated);
    }

    return { success: true, message: 'Данные успешно обновлены' };
  }, [validatePin, fetchCard, card]);

  const changePin = useCallback(async (oldPin: string, newPin: string): Promise<{ success: boolean; message: string }> => {
    const pinOk = await validatePin(oldPin);
    if (!pinOk) return { success: false, message: 'Текущий PIN неверный' };
    if (!newPin || newPin.trim().length < 4) return { success: false, message: 'PIN должен быть не менее 4 символов' };

    const { error } = await supabase
      .from('admin_settings')
      .update({ pin: newPin.trim() })
      .eq('id', 1);
    if (error) return { success: false, message: 'Ошибка сохранения' };
    return { success: true, message: 'PIN успешно изменён!' };
  }, [validatePin]);

  const refreshCard = useCallback(async () => {
    const stored = localStorage.getItem(CARD_NUMBER_KEY);
    if (!stored) return;
    const result = await fetchCard(stored);
    if (result) setCard(result);
  }, [fetchCard]);

  const logout = useCallback(() => {
    localStorage.removeItem(CARD_NUMBER_KEY);
    setCard(null);
  }, []);

  // ── Client bookings ───────────────────────────────────────────────────────
  const fetchClientBookings = useCallback(async (phone: string) => {
    if (!phone) return [];
    const { data } = await supabase
      .from('bookings')
      .select('id, name, phone, service, booking_date, booking_time, guests, status, vr_count, duration_minutes, comment')
      .eq('phone', phone)
      .order('booking_date', { ascending: false });
    return (data || []) as ClientBooking[];
  }, []);

  const updateProfile = useCallback(async (
    name: string,
    phone: string,
  ): Promise<{ success: boolean; message: string }> => {
    if (!card) return { success: false, message: 'Нет карты' };
    const { error } = await supabase
      .from('loyalty_cards')
      .update({ name: name.trim(), phone: phone.trim() })
      .eq('card_number', card.cardNumber);
    if (error) return { success: false, message: 'Ошибка сохранения' };
    const updated = await fetchCard(card.cardNumber);
    if (updated) setCard(updated);
    return { success: true, message: 'Данные обновлены!' };
  }, [card, fetchCard]);

  return {
    card, loading,
    register, login, findCard,
    claimToken, redeemVr, redeemAuto,
    adminAddToken, adminAddSticker, adminSearchClients,
    adminGenerateResetCode, adminUpdateCardFull, resetPasswordWithCode,
    changePin, validatePin, logout, refreshCard,
    fetchClientBookings, updateProfile,
  };
};
