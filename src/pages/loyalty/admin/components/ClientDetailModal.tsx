import { useState, useCallback, memo, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';
import { getCardTier } from '../../hooks/useLoyalty';

interface CardFull {
  card_number: string;
  name: string;
  phone: string;
  email: string;
  birth_date: string;
  vr_tokens: number;
  auto_tokens: number;
  vr_sessions: number;
  auto_sessions: number;
  vr_hours: number;
  stickers: number;
  created_at: string;
}

interface Props {
  cardNumber: string;
  adminPin: string;
  onClose: () => void;
  onRefresh: () => void;
  validatePin: (pin: string) => Promise<boolean>;
}

type Tab = 'profile' | 'stats' | 'actions' | 'reset' | 'delete';

const ClientDetailModal = memo(({ cardNumber, adminPin, onClose, onRefresh, validatePin }: Props) => {
  const [card, setCard] = useState<CardFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  // Profile tab
  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // Stats tab
  const [stats, setStats] = useState({ vr_tokens: 0, auto_tokens: 0, vr_sessions: 0, auto_sessions: 0, vr_hours: 0, stickers: 0 });
  const [statsSaving, setStatsSaving] = useState(false);
  const [statsMsg, setStatsMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // Actions tab
  const [addType, setAddType] = useState<'VR' | 'AUTO'>('VR');
  const [stickerHours, setStickerHours] = useState('1');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // Reset tab
  const [resetCode, setResetCode] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMsg, setResetMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // Delete tab
  const [deleteStep, setDeleteStep] = useState<0 | 1 | 2>(0);
  const [deleteConfirmName, setDeleteConfirmName] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteMsg, setDeleteMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const loadCard = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('loyalty_cards')
      .select('card_number, name, phone, email, birth_date, vr_tokens, auto_tokens, vr_sessions, auto_sessions, vr_hours, stickers, created_at')
      .eq('card_number', cardNumber)
      .maybeSingle();
    setLoading(false);
    if (data) {
      const d = data as CardFull;
      setCard(d);
      setProfileName(d.name || '');
      setProfilePhone(d.phone || '');
      setProfileEmail(d.email || '');
      setStats({
        vr_tokens: d.vr_tokens,
        auto_tokens: d.auto_tokens,
        vr_sessions: d.vr_sessions,
        auto_sessions: d.auto_sessions,
        vr_hours: d.vr_hours,
        stickers: d.stickers,
      });
    }
  }, [cardNumber]);

  useEffect(() => { loadCard(); }, [loadCard]);

  const handleSaveProfile = useCallback(async () => {
    if (!card || profileSaving) return;
    setProfileSaving(true);
    const ok = await validatePin(adminPin);
    if (!ok) { setProfileSaving(false); setProfileMsg({ ok: false, text: 'Неверный PIN' }); return; }
    const { error } = await supabase
      .from('loyalty_cards')
      .update({ name: profileName.trim(), phone: profilePhone.trim(), email: profileEmail.toLowerCase().trim() || null })
      .eq('card_number', cardNumber);
    setProfileSaving(false);
    setProfileMsg({ ok: !error, text: error ? 'Ошибка сохранения' : 'Профиль обновлён' });
    if (!error) { await loadCard(); onRefresh(); }
    setTimeout(() => setProfileMsg(null), 3000);
  }, [card, profileSaving, adminPin, profileName, profilePhone, profileEmail, cardNumber, validatePin, loadCard, onRefresh]);

  const STAT_LABELS: Record<string, string> = {
    vr_tokens: 'VR-жетоны',
    auto_tokens: 'Авто-жетоны',
    vr_sessions: 'VR-сессий',
    auto_sessions: 'Авто-сессий',
    vr_hours: 'Часов VR',
    stickers: 'Наклейки',
  };

  const statDiff = card
    ? (Object.keys(stats) as Array<keyof typeof stats>).reduce<
        { key: string; label: string; oldVal: number; newVal: number; diff: number }[]
      >((acc, key) => {
        const oldVal = (card[key as keyof CardFull] as number) ?? 0;
        const newVal = stats[key];
        if (oldVal !== newVal) acc.push({ key, label: STAT_LABELS[key], oldVal, newVal, diff: newVal - oldVal });
        return acc;
      }, [])
    : [];

  const handleSaveStats = useCallback(async () => {
    if (!card || statsSaving) return;
    setStatsSaving(true);
    const ok = await validatePin(adminPin);
    if (!ok) { setStatsSaving(false); setStatsMsg({ ok: false, text: 'Неверный PIN' }); return; }

    const changes = (Object.keys(stats) as Array<keyof typeof stats>).reduce<string[]>((acc, key) => {
      const oldVal = (card[key as keyof CardFull] as number) ?? 0;
      const newVal = stats[key];
      if (oldVal !== newVal) {
        const diff = newVal - oldVal;
        acc.push(`${STAT_LABELS[key]}: ${oldVal}→${newVal} (${diff > 0 ? '+' : ''}${diff})`);
      }
      return acc;
    }, []);

    const { error } = await supabase
      .from('loyalty_cards')
      .update(stats)
      .eq('card_number', cardNumber);

    if (!error && changes.length > 0) {
      await supabase.from('loyalty_history').insert({
        card_number: cardNumber,
        type: 'VR',
        description: `Ручная правка [Администратор]: ${changes.join('; ')}`,
        tokens: 0,
      });
    }

    setStatsSaving(false);
    const changesCount = changes.length;
    setStatsMsg({
      ok: !error,
      text: error
        ? 'Ошибка сохранения'
        : changesCount > 0
          ? `Счётчики обновлены — ${changesCount} изм. записаны в историю`
          : 'Изменений нет',
    });
    if (!error) { await loadCard(); onRefresh(); }
    setTimeout(() => setStatsMsg(null), 4000);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [card, statsSaving, adminPin, stats, cardNumber, validatePin, loadCard, onRefresh]);

  const handleAddToken = useCallback(async () => {
    if (!card || actionLoading) return;
    setActionLoading(true);
    const ok = await validatePin(adminPin);
    if (!ok) { setActionLoading(false); setActionMsg({ ok: false, text: 'Неверный PIN' }); return; }
    const isVr = addType === 'VR';
    const fields = isVr
      ? { vr_tokens: (card.vr_tokens || 0) + 1, vr_sessions: (card.vr_sessions || 0) + 1 }
      : { auto_tokens: (card.auto_tokens || 0) + 1, auto_sessions: (card.auto_sessions || 0) + 1 };
    const { error } = await supabase.from('loyalty_cards').update(fields).eq('card_number', cardNumber);
    await supabase.from('loyalty_history').insert({
      card_number: cardNumber,
      type: addType,
      description: isVr ? 'VR-сессия [Администратор]' : 'Автосимулятор [Администратор]',
      tokens: 1,
    });
    setActionLoading(false);
    setActionMsg({ ok: !error, text: error ? 'Ошибка' : `+1 жетон ${addType} начислен` });
    if (!error) { await loadCard(); onRefresh(); }
    setTimeout(() => setActionMsg(null), 3500);
  }, [card, actionLoading, adminPin, addType, cardNumber, validatePin, loadCard, onRefresh]);

  const handleAddSticker = useCallback(async () => {
    if (!card || actionLoading) return;
    const hours = parseFloat(stickerHours) || 1;
    setActionLoading(true);
    const ok = await validatePin(adminPin);
    if (!ok) { setActionLoading(false); setActionMsg({ ok: false, text: 'Неверный PIN' }); return; }
    const STICKER_GOAL = 10;
    const newStickers = (card.stickers || 0) + 1;
    const cardCompleted = newStickers >= STICKER_GOAL;
    const { error } = await supabase.from('loyalty_cards').update({
      stickers: cardCompleted ? 0 : newStickers,
      vr_hours: (card.vr_hours || 0) + hours,
      vr_sessions: (card.vr_sessions || 0) + 1,
    }).eq('card_number', cardNumber);
    await supabase.from('loyalty_history').insert({
      card_number: cardNumber,
      type: 'VR',
      description: cardCompleted
        ? `VR ${hours}ч — карта заполнена! [Администратор]`
        : `VR ${hours}ч — наклейка добавлена [Администратор]`,
      tokens: 1,
    });
    setActionLoading(false);
    const msg = cardCompleted ? 'Карточка заполнена! Поздравьте клиента 🎉' : `Наклейка добавлена (${newStickers}/${STICKER_GOAL})`;
    setActionMsg({ ok: !error, text: error ? 'Ошибка' : msg });
    if (!error) { await loadCard(); onRefresh(); }
    setTimeout(() => setActionMsg(null), 4000);
  }, [card, actionLoading, adminPin, stickerHours, cardNumber, validatePin, loadCard, onRefresh]);

  const handleGenerateResetCode = useCallback(async () => {
    if (!card || resetLoading) return;
    setResetLoading(true);
    const ok = await validatePin(adminPin);
    if (!ok) { setResetLoading(false); setResetMsg({ ok: false, text: 'Неверный PIN' }); return; }
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const { error } = await supabase.from('loyalty_cards').update({ reset_code: code }).eq('card_number', cardNumber);
    setResetLoading(false);
    if (error) { setResetMsg({ ok: false, text: 'Ошибка генерации кода' }); return; }
    setResetCode(code);
    setResetMsg({ ok: true, text: 'Код сгенерирован — назовите клиенту' });
  }, [card, resetLoading, adminPin, cardNumber, validatePin]);

  const handleDeleteCard = useCallback(async () => {
    if (!card || deleteLoading) return;
    if (deleteStep === 0) { setDeleteStep(1); return; }
    if (deleteStep === 1) {
      if (deleteConfirmName.trim().toLowerCase() !== card.name.toLowerCase()) {
        setDeleteMsg({ ok: false, text: 'Имя не совпадает. Попробуйте ещё раз.' });
        setTimeout(() => setDeleteMsg(null), 3000);
        return;
      }
      setDeleteStep(2);
      return;
    }
    // Step 2 — final delete
    setDeleteLoading(true);
    const ok = await validatePin(adminPin);
    if (!ok) { setDeleteLoading(false); setDeleteMsg({ ok: false, text: 'Неверный PIN' }); return; }
    // Delete history first, then card
    await supabase.from('loyalty_history').delete().eq('card_number', cardNumber);
    const { error } = await supabase.from('loyalty_cards').delete().eq('card_number', cardNumber);
    setDeleteLoading(false);
    if (error) {
      setDeleteMsg({ ok: false, text: 'Ошибка удаления. Попробуйте ещё раз.' });
    } else {
      onRefresh();
      onClose();
    }
  }, [card, deleteLoading, deleteStep, deleteConfirmName, adminPin, cardNumber, validatePin, onRefresh, onClose]);

  const tier = card ? getCardTier(card.vr_hours || 0) : null;

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'profile', label: 'Профиль', icon: 'ri-user-line' },
    { id: 'stats', label: 'Счётчики', icon: 'ri-bar-chart-line' },
    { id: 'actions', label: 'Действия', icon: 'ri-add-circle-line' },
    { id: 'reset', label: 'Пароль', icon: 'ri-lock-unlock-line' },
    { id: 'delete', label: 'Удалить', icon: 'ri-delete-bin-line' },
  ];

  const statFields: { key: keyof typeof stats; label: string; color: string }[] = [
    { key: 'vr_tokens', label: 'VR-жетоны', color: '#00f5ff' },
    { key: 'auto_tokens', label: 'Авто-жетоны', color: '#ff6600' },
    { key: 'vr_sessions', label: 'VR-сессий', color: '#00f5ff' },
    { key: 'auto_sessions', label: 'Авто-сессий', color: '#ff6600' },
    { key: 'vr_hours', label: 'Часов VR', color: '#4ade80' },
    { key: 'stickers', label: 'Наклейки', color: '#ffd700' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-3 py-4"
      style={{ background: 'rgba(1,0,20,0.97)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-md rounded-xl overflow-hidden relative flex flex-col"
        style={{ background: '#06001e', border: '1px solid rgba(0,245,255,0.3)', maxHeight: '92vh' }}
      >
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #00f5ff, transparent)' }} />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 flex-shrink-0" style={{ borderBottom: '1px solid rgba(0,245,255,0.1)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center rounded-full font-orbitron font-black text-sm" style={{ background: 'rgba(0,245,255,0.08)', border: '1px solid rgba(0,245,255,0.3)', color: '#00f5ff' }}>
              {loading ? '?' : (card?.name?.charAt(0).toUpperCase() || '?')}
            </div>
            <div>
              <div className="font-orbitron font-bold text-white text-sm">{loading ? '...' : card?.name}</div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="font-mono-tech text-white/30" style={{ fontSize: '9px' }}>{cardNumber}</span>
                {tier && <span className="font-mono-tech px-1.5 py-0.5 rounded-full" style={{ fontSize: '8px', background: `${tier.color}15`, color: tier.color, border: `1px solid ${tier.color}30` }}>{tier.name}</span>}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center cursor-pointer text-white/30 hover:text-white/70 transition-colors rounded">
            <i className="ri-close-line text-lg" />
          </button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center py-12">
            <i className="ri-loader-4-line text-3xl animate-spin" style={{ color: '#00f5ff' }} />
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex items-center gap-1 mx-5 mt-4 mb-0 rounded-lg p-1 flex-shrink-0" style={{ background: 'rgba(0,245,255,0.04)', border: '1px solid rgba(0,245,255,0.1)' }}>
              {tabs.map((tab) => {
                const isDanger = tab.id === 'delete';
                const activeColor = isDanger ? '#ff006e' : '#00f5ff';
                const activeBg = isDanger ? 'rgba(255,0,110,0.12)' : 'rgba(0,245,255,0.12)';
                const activeBorder = isDanger ? 'rgba(255,0,110,0.3)' : 'rgba(0,245,255,0.3)';
                return (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    className="flex-1 py-2 rounded-md font-orbitron font-bold transition-all duration-200 cursor-pointer whitespace-nowrap"
                    style={{ fontSize: '8px', letterSpacing: '0.4px', background: activeTab === tab.id ? activeBg : 'transparent', color: activeTab === tab.id ? activeColor : isDanger ? 'rgba(255,0,110,0.4)' : 'rgba(255,255,255,0.3)', border: activeTab === tab.id ? `1px solid ${activeBorder}` : '1px solid transparent' }}
                  >
                    <i className={`${tab.icon} mr-1`} />{tab.label}
                  </button>
                );
              })}
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">

              {/* PROFILE TAB */}
              {activeTab === 'profile' && (
                <>
                  {[
                    { label: 'ИМЯ', value: profileName, onChange: setProfileName, placeholder: 'Имя клиента', type: 'text' },
                    { label: 'ТЕЛЕФОН', value: profilePhone, onChange: setProfilePhone, placeholder: '+7 (___) ___-__-__', type: 'tel' },
                    { label: 'EMAIL', value: profileEmail, onChange: setProfileEmail, placeholder: 'email@example.com', type: 'email' },
                  ].map((f) => (
                    <div key={f.label}>
                      <label className="font-mono-tech text-xs text-white/40 block mb-1.5" style={{ fontSize: '10px', letterSpacing: '1px' }}>{f.label}</label>
                      <input value={f.value} onChange={(e) => f.onChange(e.target.value)} placeholder={f.placeholder} type={f.type} className="cyber-input w-full text-sm" />
                    </div>
                  ))}
                  {card?.birth_date && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <i className="ri-cake-line text-sm" style={{ color: '#ffd700' }} />
                      <span className="font-rajdhani text-white/50 text-sm">Дата рождения: {new Date(card.birth_date).toLocaleDateString('ru-RU')}</span>
                    </div>
                  )}
                  {profileMsg && (
                    <div className="px-3 py-2 rounded font-rajdhani text-sm" style={{ background: profileMsg.ok ? 'rgba(74,222,128,0.08)' : 'rgba(255,0,110,0.08)', border: `1px solid ${profileMsg.ok ? 'rgba(74,222,128,0.3)' : 'rgba(255,0,110,0.3)'}`, color: profileMsg.ok ? '#4ade80' : '#ff006e' }}>
                      {profileMsg.text}
                    </div>
                  )}
                  <button onClick={handleSaveProfile} disabled={profileSaving} className="btn-cyber-cyan w-full py-3 rounded-sm text-xs font-orbitron disabled:opacity-50">
                    {profileSaving ? <><i className="ri-loader-4-line mr-2 animate-spin" />Сохранение...</> : <><i className="ri-save-line mr-2" />Сохранить профиль</>}
                  </button>
                </>
              )}

              {/* STATS TAB */}
              {activeTab === 'stats' && (
                <>
                  <div className="rounded-lg p-3" style={{ background: 'rgba(0,245,255,0.04)', border: '1px solid rgba(0,245,255,0.1)' }}>
                    <p className="font-rajdhani text-white/50 text-xs">Прямое редактирование счётчиков. Все изменения автоматически записываются в историю клиента.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {statFields.map((f) => (
                      <div key={f.key}>
                        <label className="font-mono-tech text-xs text-white/40 block mb-1" style={{ fontSize: '9px', letterSpacing: '1px', color: f.color }}>{f.label.toUpperCase()}</label>
                        <input
                          type="number"
                          min="0"
                          value={stats[f.key]}
                          onChange={(e) => setStats((prev) => ({ ...prev, [f.key]: parseInt(e.target.value) || 0 }))}
                          className="cyber-input w-full text-sm"
                          style={{ color: f.color }}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Diff preview */}
                  {statDiff.length > 0 && (
                    <div className="rounded-lg overflow-hidden" style={{ border: '1px solid rgba(255,165,0,0.3)' }}>
                      <div className="flex items-center gap-2 px-3 py-2" style={{ background: 'rgba(255,165,0,0.08)', borderBottom: '1px solid rgba(255,165,0,0.15)' }}>
                        <i className="ri-edit-line text-xs" style={{ color: '#ffa500' }} />
                        <span className="font-orbitron font-bold text-xs" style={{ color: '#ffa500' }}>ИЗМЕНЕНИЯ ({statDiff.length})</span>
                      </div>
                      <div className="divide-y" style={{ background: 'rgba(255,165,0,0.04)', borderColor: 'rgba(255,165,0,0.08)' }}>
                        {statDiff.map((d) => (
                          <div key={d.key} className="flex items-center justify-between px-3 py-2">
                            <span className="font-rajdhani text-white/50 text-xs">{d.label}</span>
                            <div className="flex items-center gap-2">
                              <span className="font-mono-tech text-white/30" style={{ fontSize: '10px' }}>{d.oldVal}</span>
                              <i className="ri-arrow-right-line text-white/20" style={{ fontSize: '10px' }} />
                              <span className="font-orbitron font-bold text-sm" style={{ color: d.diff > 0 ? '#4ade80' : '#ff006e' }}>{d.newVal}</span>
                              <span className="font-mono-tech px-1.5 py-0.5 rounded-full" style={{ fontSize: '9px', background: d.diff > 0 ? 'rgba(74,222,128,0.1)' : 'rgba(255,0,110,0.1)', color: d.diff > 0 ? '#4ade80' : '#ff006e' }}>
                                {d.diff > 0 ? `+${d.diff}` : d.diff}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {statDiff.length === 0 && card && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <i className="ri-check-line text-sm" style={{ color: 'rgba(255,255,255,0.2)' }} />
                      <span className="font-rajdhani text-white/25 text-xs">Значения не изменены</span>
                    </div>
                  )}

                  {statsMsg && (
                    <div className="px-3 py-2 rounded font-rajdhani text-sm" style={{ background: statsMsg.ok ? 'rgba(74,222,128,0.08)' : 'rgba(255,0,110,0.08)', border: `1px solid ${statsMsg.ok ? 'rgba(74,222,128,0.3)' : 'rgba(255,0,110,0.3)'}`, color: statsMsg.ok ? '#4ade80' : '#ff006e' }}>
                      <i className={`${statsMsg.ok ? 'ri-checkbox-circle-line' : 'ri-error-warning-line'} mr-1.5`} />
                      {statsMsg.text}
                    </div>
                  )}
                  <button onClick={handleSaveStats} disabled={statsSaving || statDiff.length === 0} className="btn-cyber-cyan w-full py-3 rounded-sm text-xs font-orbitron disabled:opacity-40">
                    {statsSaving
                      ? <><i className="ri-loader-4-line mr-2 animate-spin" />Сохранение...</>
                      : statDiff.length > 0
                        ? <><i className="ri-save-line mr-2" />Сохранить {statDiff.length} изменение{statDiff.length > 1 ? 'я' : ''} в историю</>
                        : <><i className="ri-save-line mr-2" />Нет изменений</>
                    }
                  </button>
                </>
              )}

              {/* ACTIONS TAB */}
              {activeTab === 'actions' && (
                <>
                  {/* Add sticker */}
                  <div className="rounded-lg p-4 space-y-3" style={{ background: 'rgba(255,215,0,0.05)', border: '1px solid rgba(255,215,0,0.2)' }}>
                    <div className="flex items-center gap-2 mb-1">
                      <i className="ri-bookmark-fill text-sm" style={{ color: '#ffd700' }} />
                      <span className="font-orbitron font-bold text-xs text-white">Добавить наклейку VR</span>
                    </div>
                    <p className="font-rajdhani text-white/40 text-xs">Добавит наклейку на карточку и запишет часы в статистику</p>
                    <div>
                      <label className="font-mono-tech text-xs text-white/40 block mb-1" style={{ fontSize: '9px', letterSpacing: '1px' }}>ЧАСОВ ОТЫГРАНО</label>
                      <input type="number" min="0.5" step="0.5" value={stickerHours} onChange={(e) => setStickerHours(e.target.value)} className="cyber-input w-full text-sm" />
                    </div>
                    <div className="flex items-center gap-2 text-xs font-mono-tech" style={{ color: 'rgba(255,215,0,0.5)' }}>
                      <i className="ri-bookmark-line" />
                      <span>Текущие наклейки: {card?.stickers ?? 0} / 10</span>
                    </div>
                    <button onClick={handleAddSticker} disabled={actionLoading} className="w-full py-3 rounded-sm font-orbitron font-bold text-xs transition-all cursor-pointer disabled:opacity-50" style={{ background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.4)', color: '#ffd700' }}>
                      {actionLoading ? <><i className="ri-loader-4-line mr-2 animate-spin" />Добавление...</> : <><i className="ri-bookmark-fill mr-2" />Добавить наклейку</>}
                    </button>
                  </div>

                  {/* Add token */}
                  <div className="rounded-lg p-4 space-y-3" style={{ background: 'rgba(0,245,255,0.05)', border: '1px solid rgba(0,245,255,0.15)' }}>
                    <div className="flex items-center gap-2 mb-1">
                      <i className="ri-coin-line text-sm" style={{ color: '#00f5ff' }} />
                      <span className="font-orbitron font-bold text-xs text-white">Начислить жетон</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {(['VR', 'AUTO'] as const).map((t) => (
                        <button key={t} type="button" onClick={() => setAddType(t)}
                          className="py-2.5 rounded-sm font-orbitron font-bold text-xs transition-all cursor-pointer"
                          style={{ background: addType === t ? (t === 'VR' ? 'rgba(0,245,255,0.15)' : 'rgba(255,102,0,0.15)') : 'transparent', border: `1px solid ${addType === t ? (t === 'VR' ? '#00f5ff' : '#ff6600') : 'rgba(255,255,255,0.1)'}`, color: addType === t ? (t === 'VR' ? '#00f5ff' : '#ff6600') : 'rgba(255,255,255,0.35)' }}
                        >
                          {t === 'VR' ? <><i className="ri-vr-line mr-1" />VR ({card?.vr_tokens ?? 0}/5)</> : <><i className="ri-steering-2-line mr-1" />Авто ({card?.auto_tokens ?? 0}/3)</>}
                        </button>
                      ))}
                    </div>
                    <button onClick={handleAddToken} disabled={actionLoading} className="btn-cyber-cyan w-full py-3 rounded-sm text-xs font-orbitron disabled:opacity-50">
                      {actionLoading ? <><i className="ri-loader-4-line mr-2 animate-spin" />Начисление...</> : <><i className="ri-add-circle-line mr-2" />Начислить жетон {addType}</>}
                    </button>
                  </div>

                  {actionMsg && (
                    <div className="px-3 py-2 rounded font-rajdhani text-sm" style={{ background: actionMsg.ok ? 'rgba(74,222,128,0.08)' : 'rgba(255,0,110,0.08)', border: `1px solid ${actionMsg.ok ? 'rgba(74,222,128,0.3)' : 'rgba(255,0,110,0.3)'}`, color: actionMsg.ok ? '#4ade80' : '#ff006e' }}>
                      {actionMsg.text}
                    </div>
                  )}
                </>
              )}

              {/* RESET TAB */}
              {activeTab === 'reset' && (
                <>
                  <div className="rounded-lg p-3" style={{ background: 'rgba(255,165,0,0.06)', border: '1px solid rgba(255,165,0,0.2)' }}>
                    <div className="flex items-start gap-2">
                      <i className="ri-information-line text-sm flex-shrink-0 mt-0.5" style={{ color: '#ffa500' }} />
                      <p className="font-rajdhani text-white/60 text-xs leading-relaxed">
                        Нажмите кнопку → назовите клиенту <strong className="text-white/80">4-значный код</strong>. Клиент вводит его в разделе «Забыл пароль» → создаёт новый пароль. Код одноразовый.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-lg p-4 flex items-center gap-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="w-12 h-12 flex items-center justify-center rounded-full flex-shrink-0" style={{ background: 'rgba(255,165,0,0.1)', border: '2px solid rgba(255,165,0,0.4)' }}>
                      <i className="ri-user-line text-xl" style={{ color: '#ffa500' }} />
                    </div>
                    <div>
                      <div className="font-orbitron font-bold text-white text-sm">{card?.name}</div>
                      <div className="font-mono-tech text-white/40 mt-0.5" style={{ fontSize: '10px' }}>{card?.phone}</div>
                      <div className="font-mono-tech text-white/25 mt-0.5" style={{ fontSize: '9px' }}>{cardNumber}</div>
                    </div>
                  </div>

                  <button onClick={handleGenerateResetCode} disabled={resetLoading}
                    className="w-full py-4 rounded-sm font-orbitron font-bold text-xs transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ background: 'rgba(255,165,0,0.12)', border: '1px solid rgba(255,165,0,0.45)', color: '#ffa500' }}
                  >
                    {resetLoading
                      ? <><i className="ri-loader-4-line mr-2 animate-spin" />Генерация...</>
                      : <><i className="ri-refresh-line mr-2" />Сгенерировать код сброса</>
                    }
                  </button>

                  {resetCode && (
                    <div className="rounded-lg p-5 text-center relative overflow-hidden" style={{ background: 'rgba(255,165,0,0.06)', border: '2px solid rgba(255,165,0,0.6)' }}>
                      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #ffa500, transparent)' }} />
                      <div className="font-mono-tech text-white/35 text-xs tracking-widest mb-2">КОД СБРОСА ПАРОЛЯ</div>
                      <div className="font-orbitron font-black tracking-[0.4em] mb-2" style={{ fontSize: '48px', color: '#ffa500', textShadow: '0 0 30px rgba(255,165,0,0.6)' }}>{resetCode}</div>
                      <div className="font-rajdhani text-white/45 text-sm">Назовите клиенту этот код вслух</div>
                    </div>
                  )}

                  {resetMsg && (
                    <div className="px-3 py-2 rounded font-rajdhani text-sm" style={{ background: resetMsg.ok ? 'rgba(255,165,0,0.08)' : 'rgba(255,0,110,0.08)', border: `1px solid ${resetMsg.ok ? 'rgba(255,165,0,0.3)' : 'rgba(255,0,110,0.3)'}`, color: resetMsg.ok ? '#ffa500' : '#ff006e' }}>
                      {resetMsg.text}
                    </div>
                  )}
                </>
              )}

              {/* DELETE TAB */}
              {activeTab === 'delete' && (
                <>
                  {/* Warning header */}
                  <div className="rounded-lg p-4 relative overflow-hidden" style={{ background: 'rgba(255,0,110,0.06)', border: '2px solid rgba(255,0,110,0.35)' }}>
                    <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #ff006e, transparent)' }} />
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(255,0,110,0.15)', border: '2px solid rgba(255,0,110,0.5)' }}>
                        <i className="ri-error-warning-line text-xl" style={{ color: '#ff006e' }} />
                      </div>
                      <div>
                        <div className="font-orbitron font-black text-sm mb-1" style={{ color: '#ff006e' }}>НЕОБРАТИМОЕ ДЕЙСТВИЕ</div>
                        <p className="font-rajdhani text-white/60 text-xs leading-relaxed">
                          Карта <strong className="text-white/80">{cardNumber}</strong> и вся история посещений будут удалены навсегда.
                          Клиенту придётся заново регистрироваться.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Client card preview */}
                  <div className="rounded-lg p-4 flex items-center gap-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 font-orbitron font-black text-lg" style={{ background: 'rgba(255,0,110,0.08)', border: '2px solid rgba(255,0,110,0.3)', color: '#ff006e' }}>
                      {card?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-orbitron font-bold text-white text-sm">{card?.name}</div>
                      <div className="font-mono-tech text-white/40 mt-0.5" style={{ fontSize: '10px' }}>{card?.phone}</div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="font-mono-tech text-xs" style={{ color: 'rgba(0,245,255,0.5)', fontSize: '9px' }}>VR: {card?.vr_tokens ?? 0}</span>
                        <span className="font-mono-tech text-xs" style={{ color: 'rgba(255,102,0,0.5)', fontSize: '9px' }}>Авто: {card?.auto_tokens ?? 0}</span>
                        <span className="font-mono-tech text-xs" style={{ color: 'rgba(255,215,0,0.5)', fontSize: '9px' }}>Наклейки: {card?.stickers ?? 0}</span>
                      </div>
                    </div>
                  </div>

                  {/* Step 0 — initial button */}
                  {deleteStep === 0 && (
                    <button onClick={handleDeleteCard}
                      className="w-full py-3.5 rounded-sm font-orbitron font-bold text-xs transition-all cursor-pointer"
                      style={{ background: 'rgba(255,0,110,0.1)', border: '1px solid rgba(255,0,110,0.4)', color: '#ff006e' }}
                    >
                      <i className="ri-delete-bin-line mr-2" />Удалить клиента и карту
                    </button>
                  )}

                  {/* Step 1 — type name confirm */}
                  {deleteStep === 1 && (
                    <div className="space-y-3">
                      <div className="rounded-lg px-3 py-2.5" style={{ background: 'rgba(255,165,0,0.08)', border: '1px solid rgba(255,165,0,0.3)' }}>
                        <p className="font-rajdhani text-xs leading-relaxed" style={{ color: '#ffa500' }}>
                          <i className="ri-keyboard-line mr-1" />
                          Введите имя клиента точно как написано, чтобы подтвердить удаление:
                          <strong className="block mt-1 text-white/80">«{card?.name}»</strong>
                        </p>
                      </div>
                      <input
                        value={deleteConfirmName}
                        onChange={(e) => setDeleteConfirmName(e.target.value)}
                        placeholder={`Введите: ${card?.name}`}
                        className="cyber-input w-full text-sm"
                        style={{ borderColor: 'rgba(255,165,0,0.4)', color: '#ffa500' }}
                      />
                      {deleteMsg && (
                        <div className="px-3 py-2 rounded font-rajdhani text-sm" style={{ background: 'rgba(255,0,110,0.08)', border: '1px solid rgba(255,0,110,0.3)', color: '#ff006e' }}>
                          {deleteMsg.text}
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => { setDeleteStep(0); setDeleteConfirmName(''); }}
                          className="py-3 rounded-sm font-orbitron font-bold text-xs cursor-pointer transition-all whitespace-nowrap"
                          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.5)' }}>
                          <i className="ri-arrow-left-line mr-1" />Отмена
                        </button>
                        <button onClick={handleDeleteCard}
                          disabled={!deleteConfirmName.trim()}
                          className="py-3 rounded-sm font-orbitron font-bold text-xs cursor-pointer transition-all disabled:opacity-40 whitespace-nowrap"
                          style={{ background: 'rgba(255,0,110,0.12)', border: '1px solid rgba(255,0,110,0.4)', color: '#ff006e' }}>
                          Продолжить <i className="ri-arrow-right-line ml-1" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 2 — final PIN confirm */}
                  {deleteStep === 2 && (
                    <div className="space-y-3">
                      <div className="rounded-lg p-4 text-center" style={{ background: 'rgba(255,0,110,0.06)', border: '2px dashed rgba(255,0,110,0.4)' }}>
                        <i className="ri-shield-keyhole-line text-2xl mb-2 block" style={{ color: '#ff006e' }} />
                        <p className="font-orbitron font-bold text-xs text-white mb-1">ПОСЛЕДНЕЕ ПОДТВЕРЖДЕНИЕ</p>
                        <p className="font-rajdhani text-white/50 text-xs">Нажмите кнопку удаления ниже — это действие нельзя отменить</p>
                      </div>
                      {deleteMsg && (
                        <div className="px-3 py-2 rounded font-rajdhani text-sm" style={{ background: 'rgba(255,0,110,0.08)', border: '1px solid rgba(255,0,110,0.3)', color: '#ff006e' }}>
                          {deleteMsg.text}
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => { setDeleteStep(0); setDeleteConfirmName(''); }}
                          className="py-3 rounded-sm font-orbitron font-bold text-xs cursor-pointer transition-all whitespace-nowrap"
                          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.5)' }}>
                          <i className="ri-close-line mr-1" />Отмена
                        </button>
                        <button onClick={handleDeleteCard} disabled={deleteLoading}
                          className="py-3 rounded-sm font-orbitron font-black text-xs cursor-pointer transition-all disabled:opacity-50 whitespace-nowrap"
                          style={{ background: 'rgba(255,0,110,0.2)', border: '2px solid #ff006e', color: '#ff006e' }}>
                          {deleteLoading
                            ? <><i className="ri-loader-4-line mr-1 animate-spin" />Удаление...</>
                            : <><i className="ri-delete-bin-fill mr-1" />УДАЛИТЬ НАВСЕГДА</>
                          }
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
});

ClientDetailModal.displayName = 'ClientDetailModal';
export default ClientDetailModal;
