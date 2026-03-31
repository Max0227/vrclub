import { useState, memo } from 'react';
import { useNavigate } from 'react-router-dom';

const ADMIN_LOGIN = 'admin';
const ADMIN_PASSWORD = '02191988';

interface Props {
  onRegister: (name: string, phone: string, email: string, password: string) => Promise<{ success: boolean; message: string }>;
  onLogin: (phone: string, password: string) => Promise<{ success: boolean; message: string }>;
  onResetPassword: (phone: string, code: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
}

type FormTab = 'register' | 'login' | 'reset';

const RegisterForm = memo(({ onRegister, onLogin, onResetPassword }: Props) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<FormTab>('register');

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+7 ');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  const [loginPhone, setLoginPhone] = useState('+7 ');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPass, setShowLoginPass] = useState(false);

  const [resetPhone, setResetPhone] = useState('+7 ');
  const [resetCode, setResetCode] = useState('');
  const [resetNewPass, setResetNewPass] = useState('');
  const [showResetPass, setShowResetPass] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ success: boolean; text: string } | null>(null);

  const handlePhoneChange = (val: string, setter: (v: string) => void) => {
    if (!val.startsWith('+7')) { setter('+7 '); return; }
    setter(val);
  };

  const handleTabChange = (tab: FormTab) => { setActiveTab(tab); setMsg(null); };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || phone.trim().length < 5 || password.length < 8) return;
    setLoading(true);
    const result = await onRegister(name.trim(), phone.trim(), '', password.trim());
    setLoading(false);
    if (!result.success) { setMsg({ success: false, text: result.message }); setTimeout(() => setMsg(null), 5000); }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginPhone.trim() || !loginPassword.trim()) return;
    if (loginPhone.trim().toLowerCase() === ADMIN_LOGIN && loginPassword.trim() === ADMIN_PASSWORD) { navigate('/admin'); return; }
    setLoading(true);
    const result = await onLogin(loginPhone.trim(), loginPassword.trim());
    setLoading(false);
    if (!result.success) { setMsg({ success: false, text: result.message }); setTimeout(() => setMsg(null), 4000); }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (resetPhone.trim().length < 5 || !resetCode.trim() || resetNewPass.length < 8) return;
    setLoading(true);
    const result = await onResetPassword(resetPhone.trim(), resetCode.trim(), resetNewPass.trim());
    setLoading(false);
    
    if (result.success) {
      setMsg(null);
      setResetDone(true);
      setTimeout(() => { 
        setActiveTab('login'); 
        setResetDone(false); 
        setMsg(null); 
        setResetPhone('+7 '); 
        setResetCode(''); 
        setResetNewPass(''); 
      }, 3000);
    } else {
      setMsg({ success: false, text: result.message });
      setTimeout(() => setMsg(null), 5000);
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-start pt-8 pb-16 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="h-px w-12" style={{ background: 'linear-gradient(90deg, transparent, rgba(0,245,255,0.6))' }} />
            <span className="font-mono-tech text-xs tracking-widest" style={{ color: '#00f5ff' }}>СИСТЕМА ЛОЯЛЬНОСТИ</span>
            <span className="h-px w-12" style={{ background: 'linear-gradient(90deg, rgba(0,245,255,0.6), transparent)' }} />
          </div>
          <h1 className="font-orbitron font-black text-2xl sm:text-3xl text-white mb-3 tracking-wider">
            КЛУБНАЯ <span style={{ color: '#00f5ff' }}>КАРТА</span>
          </h1>
          <p className="font-rajdhani text-white/55 text-sm sm:text-base">Копи наклейки за каждый визит и отслеживай своё время в VR</p>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-7">
          {[
            { icon: 'ri-vr-line', color: '#00f5ff', title: '5 уровней карты', desc: 'Standard → CYBER' },
            { icon: 'ri-sticky-note-line', color: '#9b4dff', title: 'Наклейки за VR', desc: '10 наклеек = карта заполнена' },
            { icon: 'ri-history-line', color: '#4ade80', title: 'История записей', desc: 'Ближайшие и прошлые' },
            { icon: 'ri-trophy-line', color: '#ff006e', title: 'Достижения', desc: 'Открывай ачивки' },
          ].map((b) => (
            <div key={b.title} className="rounded-lg p-3 text-center" style={{ background: 'rgba(1,0,20,0.8)', border: `1px solid ${b.color}25` }}>
              <div className="w-7 h-7 flex items-center justify-center rounded-sm mx-auto mb-2" style={{ background: `${b.color}15`, border: `1px solid ${b.color}40` }}>
                <i className={`${b.icon} text-xs`} style={{ color: b.color }} />
              </div>
              <div className="font-orbitron font-bold text-white mb-0.5" style={{ fontSize: '10px' }}>{b.title}</div>
              <div className="font-rajdhani text-white/45 text-xs">{b.desc}</div>
            </div>
          ))}
        </div>

        <div className="rounded-xl p-5 sm:p-7 relative overflow-hidden" style={{ background: 'rgba(1,0,20,0.92)', border: '1px solid rgba(0,245,255,0.25)', boxShadow: '0 0 40px rgba(0,245,255,0.08)' }}>
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #00f5ff, transparent)' }} />

          {/* Tabs */}
          <div className="flex items-center gap-1 mb-5 rounded-lg p-1" style={{ background: 'rgba(0,245,255,0.04)', border: '1px solid rgba(0,245,255,0.1)' }}>
            {([
              { id: 'register' as FormTab, label: 'Новая карта', icon: 'ri-vip-crown-line' },
              { id: 'login' as FormTab, label: 'Войти', icon: 'ri-login-box-line' },
            ]).map((tab) => (
              <button key={tab.id} onClick={() => handleTabChange(tab.id)}
                className="flex-1 py-2.5 rounded-md font-orbitron font-bold transition-all duration-200 cursor-pointer whitespace-nowrap"
                style={{ fontSize: '10px', letterSpacing: '0.5px', background: activeTab === tab.id ? 'rgba(0,245,255,0.12)' : 'transparent', color: activeTab === tab.id ? '#00f5ff' : 'rgba(255,255,255,0.35)', border: activeTab === tab.id ? '1px solid rgba(0,245,255,0.3)' : '1px solid transparent' }}>
                <i className={`${tab.icon} mr-1.5`} />{tab.label}
              </button>
            ))}
          </div>

          {/* REGISTER */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div className="rounded-lg p-3" style={{ background: 'rgba(0,245,255,0.04)', border: '1px solid rgba(0,245,255,0.1)' }}>
                <div className="flex items-start gap-2">
                  <i className="ri-vip-crown-2-line text-xs flex-shrink-0 mt-0.5" style={{ color: '#00f5ff' }} />
                  <p className="font-rajdhani text-white/60 text-xs leading-relaxed">Зарегистрируйтесь — получите клубную карту и доступ к личному кабинету.</p>
                </div>
              </div>
              <div>
                <label className="font-mono-tech text-xs text-white/40 block mb-1.5" style={{ fontSize: '10px', letterSpacing: '1px' }}>ИМЯ И ФАМИЛИЯ *</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className="cyber-input w-full" placeholder="Иван Иванов" required />
              </div>
              <div>
                <label className="font-mono-tech text-xs text-white/40 block mb-1.5" style={{ fontSize: '10px', letterSpacing: '1px' }}>ТЕЛЕФОН *</label>
                <input value={phone} onChange={(e) => handlePhoneChange(e.target.value, setPhone)} className="cyber-input w-full" placeholder="+7 (___) ___-__-__" type="tel" required />
                <p className="mt-1 font-rajdhani text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>Телефон нужен для входа в личный кабинет</p>
              </div>
              <div>
                <label className="font-mono-tech text-xs text-white/40 block mb-1.5" style={{ fontSize: '10px', letterSpacing: '1px' }}>ПРИДУМАЙТЕ ПАРОЛЬ * (минимум 8 символов)</label>
                <div className="relative">
                  <input value={password} onChange={(e) => setPassword(e.target.value)} className="cyber-input w-full pr-10" placeholder="Придумайте пароль для входа..." type={showPass ? 'text' : 'password'} minLength={8} maxLength={20} required />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer" style={{ color: 'rgba(255,255,255,0.35)' }}>
                    <i className={`ri-${showPass ? 'eye-off' : 'eye'}-line text-sm`} />
                  </button>
                </div>
                <div className="mt-1.5 flex gap-1">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="h-1 flex-1 rounded-full transition-all duration-200" style={{ background: i < password.length ? (password.length >= 8 ? '#4ade80' : '#00f5ff') : 'rgba(0,245,255,0.1)' }} />
                  ))}
                </div>
                <p className="mt-1 font-rajdhani text-xs" style={{ color: password.length >= 8 ? 'rgba(74,222,128,0.7)' : 'rgba(255,255,255,0.3)' }}>
                  {password.length >= 8 ? '✓ Надёжный пароль — запомните его!' : `Введено ${password.length} из 8 символов`}
                </p>
              </div>
              {msg && <div className="px-3 py-2 rounded font-rajdhani text-sm" style={{ background: msg.success ? 'rgba(0,245,255,0.08)' : 'rgba(255,0,110,0.08)', border: `1px solid ${msg.success ? 'rgba(0,245,255,0.25)' : 'rgba(255,0,110,0.25)'}`, color: msg.success ? '#00f5ff' : '#ff006e' }}>{msg.text}</div>}
              <button type="submit" disabled={!name.trim() || phone.trim().length < 5 || password.length < 8 || loading} className="btn-cyber-pink w-full py-4 rounded-sm text-xs font-orbitron disabled:opacity-40 disabled:cursor-not-allowed" style={{ marginTop: '8px' }}>
                {loading ? <><i className="ri-loader-4-line mr-2 animate-spin" />Создание карты...</> : <><i className="ri-vip-crown-line mr-2" />Получить клубную карту</>}
              </button>
            </form>
          )}

          {/* LOGIN */}
          {activeTab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="rounded-lg p-3" style={{ background: 'rgba(0,245,255,0.04)', border: '1px solid rgba(0,245,255,0.1)' }}>
                <p className="font-rajdhani text-white/60 text-xs leading-relaxed">
                  Войдите по номеру телефона и паролю.<br/>
                  <span style={{ color: 'rgba(0,245,255,0.5)' }}>Для панели управления: admin</span>
                </p>
              </div>
              <div>
                <label className="font-mono-tech text-xs text-white/40 block mb-1.5" style={{ fontSize: '10px', letterSpacing: '1px' }}>ТЕЛЕФОН / ЛОГИН</label>
                <input value={loginPhone} onChange={(e) => { const v = e.target.value; if (v.toLowerCase().startsWith('a') || v === '') { setLoginPhone(v); } else { handlePhoneChange(v, setLoginPhone); } }} className="cyber-input w-full" placeholder="+7 (___) ___-__-__ или admin" type="text" required />
              </div>
              <div>
                <label className="font-mono-tech text-xs text-white/40 block mb-1.5" style={{ fontSize: '10px', letterSpacing: '1px' }}>ПАРОЛЬ (который вы придумали при регистрации)</label>
                <div className="relative">
                  <input value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="cyber-input w-full pr-10" placeholder="Ваш пароль..." type={showLoginPass ? 'text' : 'password'} required />
                  <button type="button" onClick={() => setShowLoginPass(!showLoginPass)} className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer" style={{ color: 'rgba(255,255,255,0.35)' }}>
                    <i className={`ri-${showLoginPass ? 'eye-off' : 'eye'}-line text-sm`} />
                  </button>
                </div>
                <p className="mt-1 font-rajdhani text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>Пароль вы задали сами при оформлении карты</p>
              </div>
              {msg && <div className="px-3 py-2 rounded font-rajdhani text-sm" style={{ background: msg.success ? 'rgba(0,245,255,0.08)' : 'rgba(255,0,110,0.08)', border: `1px solid ${msg.success ? 'rgba(0,245,255,0.25)' : 'rgba(255,0,110,0.25)'}`, color: msg.success ? '#00f5ff' : '#ff006e' }}>{msg.text}</div>}
              <button type="submit" disabled={!loginPhone.trim() || !loginPassword.trim() || loading} className="btn-cyber-cyan w-full py-4 rounded-sm text-xs font-orbitron disabled:opacity-40 disabled:cursor-not-allowed">
                {loading ? <><i className="ri-loader-4-line mr-2 animate-spin" />Вход...</> : <><i className="ri-login-box-line mr-2" />Войти в личный кабинет</>}
              </button>
              {/* Forgot password link */}
              <div className="text-center pt-1">
                <button type="button" onClick={() => handleTabChange('reset')} className="font-rajdhani text-xs cursor-pointer transition-colors hover:opacity-80 whitespace-nowrap" style={{ color: 'rgba(255,165,0,0.7)', background: 'none', border: 'none' }}>
                  <i className="ri-lock-unlock-line mr-1" />Забыл пароль — восстановить доступ
                </button>
              </div>
            </form>
          )}

          {/* RESET PASSWORD */}
          {activeTab === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="rounded-lg p-3" style={{ background: 'rgba(255,165,0,0.06)', border: '1px solid rgba(255,165,0,0.25)' }}>
                <div className="flex items-start gap-2">
                  <i className="ri-information-line text-sm flex-shrink-0 mt-0.5" style={{ color: '#ffa500' }} />
                  <p className="font-rajdhani text-white/60 text-xs leading-relaxed">
                    Обратитесь к администратору клуба — он сгенерирует для вас <strong className="text-white/80">6-значный код</strong>.<br/>
                    Введите телефон, код и придумайте новый пароль. Ваша карта не потеряется.
                  </p>
                </div>
              </div>

              {resetDone ? (
                <div className="rounded-lg p-5 text-center" style={{ background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.3)' }}>
                  <i className="ri-checkbox-circle-line text-3xl mb-2 block" style={{ color: '#4ade80' }} />
                  <div className="font-orbitron font-bold text-white text-sm mb-1">Пароль изменён!</div>
                  <div className="font-rajdhani text-white/50 text-xs">Переходим на страницу входа...</div>
                </div>
              ) : (
                <>
                  <div>
                    <label className="font-mono-tech text-xs text-white/40 block mb-1.5" style={{ fontSize: '10px', letterSpacing: '1px' }}>ВАШ ТЕЛЕФОН</label>
                    <input value={resetPhone} onChange={(e) => handlePhoneChange(e.target.value, setResetPhone)} className="cyber-input w-full" placeholder="+7 (___) ___-__-__" type="tel" required />
                  </div>
                  <div>
                    <label className="font-mono-tech text-xs text-white/40 block mb-1.5" style={{ fontSize: '10px', letterSpacing: '1px' }}>КОД СБРОСА (6 цифр от администратора)</label>
                    <input value={resetCode} onChange={(e) => setResetCode(e.target.value.replace(/\D/g, '').slice(0, 6))} className="cyber-input w-full font-orbitron tracking-[0.3em] text-center" placeholder="— — — — — —" maxLength={6} required style={{ color: '#ffa500', letterSpacing: '0.4em' }} />
                  </div>
                  <div>
                    <label className="font-mono-tech text-xs text-white/40 block mb-1.5" style={{ fontSize: '10px', letterSpacing: '1px' }}>НОВЫЙ ПАРОЛЬ (минимум 8 символов)</label>
                    <div className="relative">
                      <input value={resetNewPass} onChange={(e) => setResetNewPass(e.target.value)} className="cyber-input w-full pr-10" placeholder="Придумайте новый пароль..." type={showResetPass ? 'text' : 'password'} minLength={8} maxLength={20} required />
                      <button type="button" onClick={() => setShowResetPass(!showResetPass)} className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer" style={{ color: 'rgba(255,255,255,0.35)' }}>
                        <i className={`ri-${showResetPass ? 'eye-off' : 'eye'}-line text-sm`} />
                      </button>
                    </div>
                    <div className="mt-1.5 flex gap-1">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="h-1 flex-1 rounded-full transition-all duration-200" style={{ background: i < resetNewPass.length ? (resetNewPass.length >= 8 ? '#4ade80' : '#ffa500') : 'rgba(255,165,0,0.1)' }} />
                      ))}
                    </div>
                  </div>
                  {msg && <div className="px-3 py-2 rounded font-rajdhani text-sm" style={{ background: msg.success ? 'rgba(74,222,128,0.08)' : 'rgba(255,0,110,0.08)', border: `1px solid ${msg.success ? 'rgba(74,222,128,0.3)' : 'rgba(255,0,110,0.25)'}`, color: msg.success ? '#4ade80' : '#ff006e' }}>{msg.text}</div>}
                  <button type="submit" disabled={resetPhone.trim().length < 5 || resetCode.length !== 6 || resetNewPass.length < 8 || loading} className="w-full py-4 rounded-sm text-xs font-orbitron disabled:opacity-40 disabled:cursor-not-allowed transition-all" style={{ background: 'rgba(255,165,0,0.12)', border: '1px solid rgba(255,165,0,0.4)', color: '#ffa500' }}>
                    {loading ? <><i className="ri-loader-4-line mr-2 animate-spin" />Восстановление...</> : <><i className="ri-lock-unlock-line mr-2" />Установить новый пароль</>}
                  </button>
                  <div className="text-center">
                    <button type="button" onClick={() => handleTabChange('login')} className="font-rajdhani text-xs cursor-pointer whitespace-nowrap" style={{ color: 'rgba(255,255,255,0.3)', background: 'none', border: 'none' }}>
                      <i className="ri-arrow-left-line mr-1" />Вернуться к входу
                    </button>
                  </div>
                </>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
});

RegisterForm.displayName = 'RegisterForm';
export default RegisterForm;