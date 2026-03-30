import { useState, memo, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';

interface ClientResult {
  cardNumber: string;
  name: string;
  phone: string;
  vrTokens: number;
  autoTokens: number;
}

interface Props {
  onClose: () => void;
  onAddToken: (cardNum: string, type: 'VR' | 'AUTO', pin: string) => Promise<{ success: boolean; message: string }>;
  onChangePin: (oldPin: string, newPin: string) => Promise<{ success: boolean; message: string }>;
  validatePin: (pin: string) => Promise<boolean>;
  onSearchClients: (query: string) => Promise<ClientResult[]>;
  onGenerateResetCode: (cardNum: string, pin: string) => Promise<{ success: boolean; message: string; code?: string }>;
}

const getActivationCode = (certNum: string): string => {
  const digits = certNum.replace('PARADOX-2026-', '').replace(/\D/g, '');
  if (!digits || digits.length < 4) return '----';
  return digits.slice(-4).split('').reverse().join('');
};

type AdminTab = 'quick' | 'certcode' | 'pin' | 'reset';

const AdminPanel = memo(({ onClose, onAddToken, onChangePin, validatePin, onSearchClients, onGenerateResetCode }: Props) => {
  const [pinInput, setPinInput] = useState('');
  const [pinUnlocked, setPinUnlocked] = useState(false);
  const [pinError, setPinError] = useState('');
  const [pinCheckLoading, setPinCheckLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>('quick');

  // Quick add tab
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ClientResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ClientResult | null>(null);
  const [addType, setAddType] = useState<'VR' | 'AUTO'>('VR');
  const [addMsg, setAddMsg] = useState<{ success: boolean; text: string } | null>(null);
  const [addLoading, setAddLoading] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cert code tab
  const [certInput, setCertInput] = useState('');
  const [certCode, setCertCode] = useState('');

  // PIN change tab
  const [newPin, setNewPin] = useState('');
  const [newPinConfirm, setNewPinConfirm] = useState('');
  const [pinChangeMsg, setPinChangeMsg] = useState<{ success: boolean; text: string } | null>(null);
  const [pinChangeLoading, setPinChangeLoading] = useState(false);

  // Reset password tab
  const [resetSearchQuery, setResetSearchQuery] = useState('');
  const [resetSearchResults, setResetSearchResults] = useState<ClientResult[]>([]);
  const [resetSearchLoading, setResetSearchLoading] = useState(false);
  const [resetSelectedClient, setResetSelectedClient] = useState<ClientResult | null>(null);
  const [resetCode, setResetCode] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMsg, setResetMsg] = useState<{ success: boolean; text: string } | null>(null);
  const resetSearchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handlePinCheck = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinInput.trim()) return;
    setPinCheckLoading(true);
    const ok = await validatePin(pinInput.trim());
    setPinCheckLoading(false);
    if (ok) { setPinUnlocked(true); setPinError(''); }
    else { setPinError('Неверный PIN-код'); setTimeout(() => setPinError(''), 2000); }
  }, [pinInput, validatePin]);

  const handleSearch = useCallback((q: string) => {
    setSearchQuery(q);
    setSelectedClient(null);
    setAddMsg(null);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (q.trim().length < 2) { setSearchResults([]); return; }
    setSearchLoading(true);
    searchTimer.current = setTimeout(async () => {
      const results = await onSearchClients(q);
      setSearchResults(results);
      setSearchLoading(false);
    }, 350);
  }, [onSearchClients]);

  const handleSelectClient = useCallback((client: ClientResult) => {
    setSelectedClient(client);
    setSearchResults([]);
    setSearchQuery(client.name);
    setAddMsg(null);
  }, []);

  const handleQuickAdd = useCallback(async () => {
    if (!selectedClient || addLoading) return;
    setAddLoading(true);
    const result = await onAddToken(selectedClient.cardNumber, addType, pinInput);
    setAddLoading(false);
    setAddMsg({ success: result.success, text: result.message });
    if (result.success) {
      // Update local client token count
      setSelectedClient((prev) => prev ? {
        ...prev,
        vrTokens: addType === 'VR' ? prev.vrTokens + 1 : prev.vrTokens,
        autoTokens: addType === 'AUTO' ? prev.autoTokens + 1 : prev.autoTokens,
      } : null);
    }
    setTimeout(() => setAddMsg(null), 5000);
  }, [selectedClient, addType, pinInput, onAddToken, addLoading]);

  const handleCalcCode = useCallback(() => {
    const code = getActivationCode(certInput.trim().toUpperCase());
    setCertCode(code);
  }, [certInput]);

  const handleResetSearch = useCallback((q: string) => {
    setResetSearchQuery(q);
    setResetSelectedClient(null);
    setResetCode('');
    setResetMsg(null);
    if (resetSearchTimer.current) clearTimeout(resetSearchTimer.current);
    if (q.trim().length < 2) { setResetSearchResults([]); return; }
    setResetSearchLoading(true);
    resetSearchTimer.current = setTimeout(async () => {
      const results = await onSearchClients(q);
      setResetSearchResults(results);
      setResetSearchLoading(false);
    }, 350);
  }, [onSearchClients]);

  const handleSelectResetClient = useCallback((client: ClientResult) => {
    setResetSelectedClient(client);
    setResetSearchResults([]);
    setResetSearchQuery(client.name);
    setResetCode('');
    setResetMsg(null);
  }, []);

  const handleGenerateResetCode = useCallback(async () => {
    if (!resetSelectedClient || resetLoading) return;
    setResetLoading(true);
    const result = await onGenerateResetCode(resetSelectedClient.cardNumber, pinInput);
    setResetLoading(false);
    if (result.success && result.code) {
      setResetCode(result.code);
    }
    setResetMsg({ success: result.success, text: result.message });
  }, [resetSelectedClient, resetLoading, onGenerateResetCode, pinInput]);

  const handleChangePin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length < 4) { setPinChangeMsg({ success: false, text: 'PIN должен быть не менее 4 символов' }); return; }
    if (newPin !== newPinConfirm) { setPinChangeMsg({ success: false, text: 'PIN-коды не совпадают' }); return; }
    setPinChangeLoading(true);
    const result = await onChangePin(pinInput, newPin);
    setPinChangeLoading(false);
    setPinChangeMsg({ success: result.success, text: result.message });
    if (result.success) { setNewPin(''); setNewPinConfirm(''); }
    setTimeout(() => setPinChangeMsg(null), 4000);
  }, [newPin, newPinConfirm, pinInput, onChangePin]);

  const tabs: { id: AdminTab; label: string; icon: string }[] = [
    { id: 'quick', label: 'Жетоны', icon: 'ri-add-circle-line' },
    { id: 'reset', label: 'Пароль', icon: 'ri-lock-unlock-line' },
    { id: 'certcode', label: 'Серт.', icon: 'ri-key-2-line' },
    { id: 'pin', label: 'PIN', icon: 'ri-lock-password-line' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(1,0,20,0.96)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-sm rounded-xl overflow-hidden relative"
        style={{ background: '#06001e', border: '1px solid rgba(255,0,110,0.4)', boxShadow: '0 0 40px rgba(255,0,110,0.15)' }}
      >
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #ff006e, transparent)' }} />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(255,0,110,0.15)' }}>
          <div className="flex items-center gap-2">
            <i className="ri-shield-keyhole-line text-base" style={{ color: '#ff006e' }} />
            <div>
              <div className="font-orbitron font-bold text-white text-xs tracking-widest">АДМИНИСТРАТОР</div>
              <div className="font-mono-tech text-white/30" style={{ fontSize: '9px' }}>PARADOX VR CLUB</div>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center cursor-pointer text-white/30 hover:text-white/70 transition-colors rounded">
            <i className="ri-close-line text-lg" />
          </button>
        </div>

        <div className="p-5">
          {!pinUnlocked ? (
            <form onSubmit={handlePinCheck} className="space-y-4">
              <div className="text-center mb-2">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: 'rgba(255,0,110,0.1)', border: '2px solid rgba(255,0,110,0.4)' }}>
                  <i className="ri-lock-password-line text-xl" style={{ color: '#ff006e' }} />
                </div>
                <p className="font-rajdhani text-white/50 text-sm">Введите PIN-код для входа в панель администратора</p>
              </div>
              <div>
                <label className="font-mono-tech text-xs text-white/40 block mb-1.5" style={{ fontSize: '10px', letterSpacing: '1px' }}>PIN-КОД</label>
                <input type="password" value={pinInput} onChange={(e) => setPinInput(e.target.value)} className="cyber-input" placeholder="Введите PIN..." required autoComplete="off" />
              </div>
              {pinError && (
                <div className="px-3 py-2 rounded font-rajdhani text-sm" style={{ background: 'rgba(255,0,110,0.08)', border: '1px solid rgba(255,0,110,0.25)', color: '#ff006e' }}>{pinError}</div>
              )}
              <button type="submit" disabled={pinCheckLoading} className="btn-cyber-pink w-full py-3 rounded-sm text-xs disabled:opacity-60">
                {pinCheckLoading ? <><i className="ri-loader-4-line mr-2 animate-spin" />Проверка...</> : <><i className="ri-lock-unlock-line mr-2" />Войти</>}
              </button>
            </form>
          ) : (
            <>
              {/* Status */}
              <div className="flex items-center gap-2 px-3 py-2 rounded mb-3" style={{ background: 'rgba(0,245,255,0.06)', border: '1px solid rgba(0,245,255,0.2)' }}>
                <i className="ri-shield-check-line text-sm" style={{ color: '#00f5ff' }} />
                <span className="font-mono-tech text-xs" style={{ color: '#00f5ff' }}>Администратор авторизован</span>
              </div>

              {/* All clients link */}
              <Link to="/loyalty/admin" onClick={onClose} className="flex items-center justify-between px-3 py-2.5 rounded-lg mb-3 cursor-pointer transition-all hover:scale-[1.02]" style={{ background: 'rgba(255,0,110,0.06)', border: '1px solid rgba(255,0,110,0.25)', textDecoration: 'none' }}>
                <div className="flex items-center gap-2">
                  <i className="ri-database-2-line text-sm" style={{ color: '#ff006e' }} />
                  <span className="font-orbitron font-bold text-xs text-white tracking-wider">База клиентов</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-rajdhani text-white/40 text-xs">Все карты</span>
                  <i className="ri-arrow-right-line text-xs" style={{ color: '#ff006e' }} />
                </div>
              </Link>

              {/* Tabs */}
              <div className="flex items-center gap-1 mb-4 rounded-lg p-1" style={{ background: 'rgba(0,245,255,0.04)', border: '1px solid rgba(0,245,255,0.1)' }}>
                {tabs.map((tab) => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    className="flex-1 py-2 px-1 rounded-md font-orbitron font-bold transition-all duration-200 cursor-pointer whitespace-nowrap"
                    style={{ fontSize: '9px', letterSpacing: '0.5px', background: activeTab === tab.id ? 'rgba(0,245,255,0.12)' : 'transparent', color: activeTab === tab.id ? '#00f5ff' : 'rgba(255,255,255,0.35)', border: activeTab === tab.id ? '1px solid rgba(0,245,255,0.3)' : '1px solid transparent' }}
                  >
                    <i className={`${tab.icon} mr-1`} />{tab.label}
                  </button>
                ))}
              </div>

              {/* Tab: Quick Add */}
              {activeTab === 'quick' && (
                <div className="space-y-3">
                  <div className="rounded-lg p-3" style={{ background: 'rgba(0,245,255,0.04)', border: '1px solid rgba(0,245,255,0.1)' }}>
                    <p className="font-rajdhani text-white/50 text-xs leading-relaxed">
                      Найдите клиента по имени, телефону или номеру карты и начислите жетон одним нажатием
                    </p>
                  </div>

                  {/* Search */}
                  <div className="relative">
                    <label className="font-mono-tech text-xs text-white/40 block mb-1.5" style={{ fontSize: '10px', letterSpacing: '1px' }}>ПОИСК КЛИЕНТА</label>
                    <div className="relative">
                      <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: 'rgba(0,245,255,0.4)' }} />
                      <input
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="cyber-input pl-8"
                        placeholder="Имя, телефон или номер карты..."
                      />
                      {searchLoading && <i className="ri-loader-4-line animate-spin absolute right-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: '#00f5ff' }} />}
                    </div>

                    {/* Dropdown results */}
                    {searchResults.length > 0 && (
                      <div className="absolute z-50 left-0 right-0 mt-1 rounded-lg overflow-hidden" style={{ background: '#06001e', border: '1px solid rgba(0,245,255,0.25)', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
                        {searchResults.map((client) => (
                          <button
                            key={client.cardNumber}
                            onClick={() => handleSelectClient(client)}
                            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 transition-colors cursor-pointer text-left"
                            style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                          >
                            <div className="w-7 h-7 flex items-center justify-center rounded-sm flex-shrink-0" style={{ background: 'rgba(0,245,255,0.1)', border: '1px solid rgba(0,245,255,0.25)' }}>
                              <i className="ri-user-line text-xs" style={{ color: '#00f5ff' }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-orbitron text-white font-bold" style={{ fontSize: '10px' }}>{client.name}</div>
                              <div className="font-mono-tech text-white/35" style={{ fontSize: '9px' }}>{client.cardNumber} · {client.phone}</div>
                            </div>
                            <div className="flex gap-1.5">
                              <span className="font-mono-tech text-xs px-1.5 py-0.5 rounded-sm" style={{ background: 'rgba(0,245,255,0.1)', color: '#00f5ff', fontSize: '9px' }}>VR:{client.vrTokens}</span>
                              <span className="font-mono-tech text-xs px-1.5 py-0.5 rounded-sm" style={{ background: 'rgba(255,102,0,0.1)', color: '#ff6600', fontSize: '9px' }}>A:{client.autoTokens}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Selected client card */}
                  {selectedClient && (
                    <div className="rounded-lg p-3 relative" style={{ background: 'rgba(0,245,255,0.05)', border: '1px solid rgba(0,245,255,0.3)' }}>
                      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #00f5ff, transparent)' }} />
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-9 h-9 flex items-center justify-center rounded-sm flex-shrink-0" style={{ background: 'rgba(0,245,255,0.1)', border: '1px solid rgba(0,245,255,0.35)' }}>
                          <i className="ri-user-star-line text-sm" style={{ color: '#00f5ff' }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-orbitron font-bold text-white text-xs">{selectedClient.name}</div>
                          <div className="font-mono-tech text-white/40 mt-0.5" style={{ fontSize: '9px' }}>{selectedClient.cardNumber}</div>
                          <div className="flex gap-3 mt-1.5">
                            <span className="font-mono-tech text-xs" style={{ color: '#00f5ff' }}>VR: {selectedClient.vrTokens}/5</span>
                            <span className="font-mono-tech text-xs" style={{ color: '#ff6600' }}>Авто: {selectedClient.autoTokens}/3</span>
                          </div>
                        </div>
                        <button onClick={() => { setSelectedClient(null); setSearchQuery(''); }} className="text-white/30 hover:text-white/60 cursor-pointer">
                          <i className="ri-close-line text-sm" />
                        </button>
                      </div>

                      {/* Type selector */}
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        {(['VR', 'AUTO'] as const).map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setAddType(t)}
                            className="py-2.5 rounded-sm font-orbitron font-bold text-xs transition-all duration-200 cursor-pointer"
                            style={{
                              background: addType === t ? (t === 'VR' ? 'rgba(0,245,255,0.15)' : 'rgba(255,102,0,0.15)') : 'transparent',
                              border: `1px solid ${addType === t ? (t === 'VR' ? '#00f5ff' : '#ff6600') : 'rgba(255,255,255,0.1)'}`,
                              color: addType === t ? (t === 'VR' ? '#00f5ff' : '#ff6600') : 'rgba(255,255,255,0.35)',
                            }}
                          >
                            {t === 'VR' ? <><i className="ri-vr-line mr-1" />VR</> : <><i className="ri-steering-2-line mr-1" />Автосим</>}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={handleQuickAdd}
                        disabled={addLoading}
                        className="btn-cyber-cyan w-full py-3 rounded-sm text-xs disabled:opacity-50"
                      >
                        {addLoading
                          ? <><i className="ri-loader-4-line mr-2 animate-spin" />Начисление...</>
                          : <><i className="ri-add-circle-line mr-2" />Начислить жетон {addType}</>
                        }
                      </button>
                    </div>
                  )}

                  {addMsg && (
                    <div className="px-3 py-2 rounded font-rajdhani text-sm" style={{ background: addMsg.success ? 'rgba(0,245,255,0.08)' : 'rgba(255,0,110,0.08)', border: `1px solid ${addMsg.success ? 'rgba(0,245,255,0.25)' : 'rgba(255,0,110,0.25)'}`, color: addMsg.success ? '#00f5ff' : '#ff006e' }}>
                      {addMsg.text}
                    </div>
                  )}
                </div>
              )}

              {/* Tab: Reset Password */}
              {activeTab === 'reset' && (
                <div className="space-y-3">
                  <div className="rounded-lg p-3" style={{ background: 'rgba(255,165,0,0.06)', border: '1px solid rgba(255,165,0,0.2)' }}>
                    <div className="flex items-start gap-2">
                      <i className="ri-information-line text-sm flex-shrink-0 mt-0.5" style={{ color: '#ffa500' }} />
                      <p className="font-rajdhani text-white/60 text-xs leading-relaxed">
                        Найдите клиента → нажмите <strong className="text-white/80">«Сгенерировать код»</strong> → назовите клиенту 6-значный код.<br/>
                        Клиент вводит его на странице входа в поле «Забыл пароль» и задаёт новый пароль. Карта не теряется.
                      </p>
                    </div>
                  </div>

                  {/* Search */}
                  <div className="relative">
                    <label className="font-mono-tech text-xs text-white/40 block mb-1.5" style={{ fontSize: '10px', letterSpacing: '1px' }}>ПОИСК КЛИЕНТА</label>
                    <div className="relative">
                      <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: 'rgba(255,165,0,0.4)' }} />
                      <input
                        value={resetSearchQuery}
                        onChange={(e) => handleResetSearch(e.target.value)}
                        className="cyber-input pl-8"
                        placeholder="Имя, телефон или номер карты..."
                      />
                      {resetSearchLoading && <i className="ri-loader-4-line animate-spin absolute right-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: '#ffa500' }} />}
                    </div>
                    {resetSearchResults.length > 0 && (
                      <div className="absolute z-50 left-0 right-0 mt-1 rounded-lg overflow-hidden" style={{ background: '#06001e', border: '1px solid rgba(255,165,0,0.25)', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
                        {resetSearchResults.map((client) => (
                          <button
                            key={client.cardNumber}
                            onClick={() => handleSelectResetClient(client)}
                            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 transition-colors cursor-pointer text-left"
                            style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                          >
                            <div className="w-7 h-7 flex items-center justify-center rounded-sm flex-shrink-0" style={{ background: 'rgba(255,165,0,0.1)', border: '1px solid rgba(255,165,0,0.25)' }}>
                              <i className="ri-user-line text-xs" style={{ color: '#ffa500' }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-orbitron text-white font-bold" style={{ fontSize: '10px' }}>{client.name}</div>
                              <div className="font-mono-tech text-white/35" style={{ fontSize: '9px' }}>{client.cardNumber} · {client.phone}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Selected client */}
                  {resetSelectedClient && (
                    <div className="rounded-lg p-3 relative" style={{ background: 'rgba(255,165,0,0.05)', border: '1px solid rgba(255,165,0,0.3)' }}>
                      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #ffa500, transparent)' }} />
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 flex items-center justify-center rounded-sm flex-shrink-0" style={{ background: 'rgba(255,165,0,0.1)', border: '1px solid rgba(255,165,0,0.35)' }}>
                          <i className="ri-user-star-line text-sm" style={{ color: '#ffa500' }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-orbitron font-bold text-white text-xs">{resetSelectedClient.name}</div>
                          <div className="font-mono-tech text-white/40 mt-0.5" style={{ fontSize: '9px' }}>{resetSelectedClient.cardNumber} · {resetSelectedClient.phone}</div>
                        </div>
                        <button onClick={() => { setResetSelectedClient(null); setResetSearchQuery(''); setResetCode(''); setResetMsg(null); }} className="text-white/30 hover:text-white/60 cursor-pointer">
                          <i className="ri-close-line text-sm" />
                        </button>
                      </div>

                      <button
                        onClick={handleGenerateResetCode}
                        disabled={resetLoading}
                        className="w-full py-3 rounded-sm font-orbitron font-bold text-xs transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ background: 'rgba(255,165,0,0.12)', border: '1px solid rgba(255,165,0,0.4)', color: '#ffa500' }}
                      >
                        {resetLoading
                          ? <><i className="ri-loader-4-line mr-2 animate-spin" />Генерация...</>
                          : <><i className="ri-refresh-line mr-2" />Сгенерировать код сброса</>
                        }
                      </button>
                    </div>
                  )}

                  {/* Generated code display */}
                  {resetCode && (
                    <div className="rounded-lg p-4 text-center relative overflow-hidden" style={{ background: 'rgba(255,165,0,0.06)', border: '1px solid rgba(255,165,0,0.5)' }}>
                      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #ffa500, transparent)' }} />
                      <div className="font-mono-tech text-white/40 text-xs tracking-widest mb-1">КОД СБРОСА ПАРОЛЯ</div>
                      <div className="font-orbitron font-black text-4xl tracking-[0.3em] mb-2" style={{ color: '#ffa500', textShadow: '0 0 20px rgba(255,165,0,0.5)' }}>{resetCode}</div>
                      <div className="font-rajdhani text-white/40 text-xs mb-1">Назовите клиенту этот код</div>
                      <div className="font-rajdhani text-xs px-2 py-1.5 rounded-sm" style={{ background: 'rgba(255,165,0,0.08)', color: 'rgba(255,165,0,0.7)', fontSize: '10px' }}>
                        Клиент вводит его на странице входа → «Забыл пароль» → создаёт новый пароль
                      </div>
                    </div>
                  )}

                  {resetMsg && !resetCode && (
                    <div className="px-3 py-2 rounded font-rajdhani text-sm" style={{ background: resetMsg.success ? 'rgba(255,165,0,0.08)' : 'rgba(255,0,110,0.08)', border: `1px solid ${resetMsg.success ? 'rgba(255,165,0,0.25)' : 'rgba(255,0,110,0.25)'}`, color: resetMsg.success ? '#ffa500' : '#ff006e' }}>
                      {resetMsg.text}
                    </div>
                  )}
                </div>
              )}

              {/* Tab: Cert Code */}
              {activeTab === 'certcode' && (
                <div className="space-y-4">
                  <div className="rounded-lg p-3 mb-1" style={{ background: 'rgba(255,165,0,0.06)', border: '1px solid rgba(255,165,0,0.2)' }}>
                    <div className="flex items-start gap-2">
                      <i className="ri-information-line text-sm flex-shrink-0 mt-0.5" style={{ color: '#ffa500' }} />
                      <p className="font-rajdhani text-white/60 text-xs leading-relaxed">
                        Клиент написал номер сертификата? Введите его — получите 4-значный код активации.
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="font-mono-tech text-xs text-white/40 block mb-1.5" style={{ fontSize: '10px', letterSpacing: '1px' }}>НОМЕР СЕРТИФИКАТА</label>
                    <input value={certInput} onChange={(e) => { setCertInput(e.target.value); setCertCode(''); }} className="cyber-input font-mono" placeholder="PARADOX-2026-XXXXXX" onKeyDown={(e) => e.key === 'Enter' && handleCalcCode()} />
                  </div>
                  <button onClick={handleCalcCode} disabled={!certInput.trim()} className="btn-cyber-cyan w-full py-3 rounded-sm text-xs disabled:opacity-40 disabled:cursor-not-allowed">
                    <i className="ri-calculator-line mr-2" />Узнать код активации
                  </button>
                  {certCode && certCode !== '----' && (
                    <div className="rounded-lg p-4 text-center relative overflow-hidden" style={{ background: 'rgba(0,245,255,0.06)', border: '1px solid rgba(0,245,255,0.4)' }}>
                      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #00f5ff, transparent)' }} />
                      <div className="font-mono-tech text-white/30 text-xs tracking-widest mb-1">КОД АКТИВАЦИИ</div>
                      <div className="font-orbitron font-black text-4xl tracking-[0.3em] mb-2" style={{ color: '#00f5ff', textShadow: '0 0 20px rgba(0,245,255,0.6)' }}>{certCode}</div>
                      <div className="font-mono-tech text-white/30 text-xs">Отправьте клиенту в мессенджере MAX</div>
                    </div>
                  )}
                  {certCode === '----' && (
                    <div className="rounded-lg px-3 py-2 font-rajdhani text-sm text-center" style={{ background: 'rgba(255,0,110,0.08)', border: '1px solid rgba(255,0,110,0.25)', color: '#ff006e' }}>
                      Неверный формат. Используйте: PARADOX-2026-XXXXXX
                    </div>
                  )}
                </div>
              )}

              {/* Tab: Change PIN */}
              {activeTab === 'pin' && (
                <form onSubmit={handleChangePin} className="space-y-4">
                  <div className="rounded-lg p-3" style={{ background: 'rgba(155,77,255,0.06)', border: '1px solid rgba(155,77,255,0.2)' }}>
                    <p className="font-rajdhani text-white/60 text-xs leading-relaxed">PIN сохраняется в облаке — будет работать на любом устройстве.</p>
                  </div>
                  <div>
                    <label className="font-mono-tech text-xs text-white/40 block mb-1.5" style={{ fontSize: '10px', letterSpacing: '1px' }}>НОВЫЙ PIN-КОД</label>
                    <input type="password" value={newPin} onChange={(e) => setNewPin(e.target.value)} className="cyber-input" placeholder="Придумайте PIN..." minLength={4} required autoComplete="new-password" />
                  </div>
                  <div>
                    <label className="font-mono-tech text-xs text-white/40 block mb-1.5" style={{ fontSize: '10px', letterSpacing: '1px' }}>ПОВТОРИТЕ PIN</label>
                    <input type="password" value={newPinConfirm} onChange={(e) => setNewPinConfirm(e.target.value)} className="cyber-input" placeholder="Повторите PIN..." minLength={4} required autoComplete="new-password" />
                  </div>
                  {pinChangeMsg && (
                    <div className="px-3 py-2 rounded font-rajdhani text-sm" style={{ background: pinChangeMsg.success ? 'rgba(0,245,255,0.08)' : 'rgba(255,0,110,0.08)', border: `1px solid ${pinChangeMsg.success ? 'rgba(0,245,255,0.25)' : 'rgba(255,0,110,0.25)'}`, color: pinChangeMsg.success ? '#00f5ff' : '#ff006e' }}>
                      {pinChangeMsg.text}
                    </div>
                  )}
                  <button type="submit" disabled={newPin.length < 4 || newPin !== newPinConfirm || pinChangeLoading} className="btn-cyber-pink w-full py-3 rounded-sm text-xs disabled:opacity-40 disabled:cursor-not-allowed">
                    {pinChangeLoading ? <><i className="ri-loader-4-line mr-2 animate-spin" />Сохранение...</> : <><i className="ri-lock-password-line mr-2" />Сохранить PIN</>}
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
});

AdminPanel.displayName = 'AdminPanel';
export default AdminPanel;
