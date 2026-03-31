import { useState } from 'react';
import { ForumUser } from '../hooks/useForum';

interface ForumAuthProps {
  onClose?: () => void;
  onSuccess?: (user: ForumUser) => void;
  loginWithCard: (phone: string, password: string) => Promise<{ success: boolean; message: string; status?: string }>;
  loginEmail: (email: string, password: string) => Promise<{ success: boolean; message: string; status?: string }>;
  registerEmail: (username: string, email: string, password: string) => Promise<{ success: boolean; message: string }>;
}

const ForumAuth = ({ onClose, onSuccess, loginWithCard, loginEmail, registerEmail }: ForumAuthProps) => {
  const [mode, setMode] = useState<'login-card' | 'login-email' | 'register'>('login-card');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [showPass, setShowPass] = useState(false);

  // Валидация телефона
  const validatePhone = (phoneStr: string): boolean => {
    const cleaned = phoneStr.replace(/[\s\-\(\)]/g, '');
    return cleaned.startsWith('+7') && cleaned.length >= 11 && cleaned.length <= 12;
  };

  // Валидация email
  const validateEmail = (emailStr: string): boolean => {
    const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
    return emailRegex.test(emailStr);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    // Валидация перед отправкой
    if (mode === 'login-card') {
      if (!validatePhone(phone)) {
        setMsg({ ok: false, text: 'Введите корректный номер телефона в формате +7 XXX XXX-XX-XX' });
        setLoading(false);
        return;
      }
    } else if (mode === 'login-email') {
      if (!validateEmail(email)) {
        setMsg({ ok: false, text: 'Введите корректный email адрес' });
        setLoading(false);
        return;
      }
    } else if (mode === 'register') {
      if (!username.trim() || username.trim().length < 2) {
        setMsg({ ok: false, text: 'Имя пользователя должно быть не менее 2 символов' });
        setLoading(false);
        return;
      }
      if (username.trim().length > 30) {
        setMsg({ ok: false, text: 'Имя пользователя не должно превышать 30 символов' });
        setLoading(false);
        return;
      }
      if (!validateEmail(email)) {
        setMsg({ ok: false, text: 'Введите корректный email адрес' });
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        setMsg({ ok: false, text: 'Пароль должен быть не менее 6 символов' });
        setLoading(false);
        return;
      }
    }

    let result: { success: boolean; message: string; status?: string; user?: ForumUser };
    
    try {
      if (mode === 'login-card') {
        const cleanedPhone = phone.replace(/[\s\-\(\)]/g, '');
        result = await loginWithCard(cleanedPhone, password);
      } else if (mode === 'login-email') {
        result = await loginEmail(email.toLowerCase().trim(), password);
      } else {
        result = await registerEmail(username.trim(), email.toLowerCase().trim(), password);
      }
    } catch (err) {
      setMsg({ ok: false, text: 'Ошибка соединения. Проверьте интернет и попробуйте снова.' });
      setLoading(false);
      return;
    }

    setLoading(false);
    setMsg({ ok: result.success, text: result.message });

    // Очистка формы и закрытие при успешном входе
    if (result.success && !result.status) {
      setPhone('');
      setEmail('');
      setPassword('');
      setUsername('');
      
      setTimeout(() => {
        if (result.user) {
          onSuccess?.(result.user);
        } else {
          onClose?.();
        }
      }, 800);
    }
  };

  const handleModeChange = (newMode: 'login-card' | 'login-email' | 'register') => {
    setMode(newMode);
    setMsg(null);
    // Очищаем поля при смене режима
    setPhone('');
    setEmail('');
    setPassword('');
    setUsername('');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(1,0,20,0.96)', backdropFilter: 'blur(8px)' }}
      onClick={e => e.target === e.currentTarget && onClose?.()}
    >
      <div
        className="w-full max-w-md rounded-xl overflow-hidden relative"
        style={{ background: '#06001e', border: '1px solid rgba(0,245,255,0.3)', boxShadow: '0 0 60px rgba(0,245,255,0.1)' }}
      >
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #00f5ff, transparent)' }} />

        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <div>
            <h2 className="font-orbitron font-black text-white text-base tracking-wider">ФОРУМ PARADOX</h2>
            <p className="font-rajdhani text-white/40 text-xs mt-0.5">Вход или регистрация</p>
          </div>
          {onClose && (
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center cursor-pointer text-white/30 hover:text-white/70 transition-colors">
              <i className="ri-close-line text-lg" />
            </button>
          )}
        </div>

        {/* Mode switcher */}
        <div className="flex gap-1 mx-6 mb-5 p-1 rounded-full" style={{ background: 'rgba(0,245,255,0.05)', border: '1px solid rgba(0,245,255,0.12)' }}>
          {[
            { key: 'login-card', label: 'Клубная карта', icon: 'ri-vip-crown-2-line' },
            { key: 'login-email', label: 'Email', icon: 'ri-mail-line' },
            { key: 'register', label: 'Регистрация', icon: 'ri-user-add-line' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => handleModeChange(tab.key as typeof mode)}
              className="flex-1 py-2 rounded-full text-xs font-orbitron cursor-pointer transition-all whitespace-nowrap flex items-center justify-center gap-1"
              style={{
                background: mode === tab.key ? 'rgba(0,245,255,0.15)' : 'transparent',
                color: mode === tab.key ? '#00f5ff' : 'rgba(255,255,255,0.4)',
                border: mode === tab.key ? '1px solid rgba(0,245,255,0.4)' : '1px solid transparent',
                fontSize: '9px',
              }}
            >
              <i className={tab.icon} />
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
          {mode === 'login-card' && (
            <div className="rounded-lg p-3 mb-2" style={{ background: 'rgba(0,245,255,0.05)', border: '1px solid rgba(0,245,255,0.15)' }}>
              <div className="flex items-start gap-2">
                <i className="ri-information-line text-xs flex-shrink-0 mt-0.5" style={{ color: '#00f5ff' }} />
                <p className="font-rajdhani text-white/60 text-xs leading-relaxed">
                  Используйте данные вашей <strong className="text-white/80">клубной карты PARADOX</strong> (телефон и пароль). После входа заявка уйдёт администратору на одобрение.
                </p>
              </div>
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label className="forum-label">ИМЯ НА ФОРУМЕ *</label>
              <input
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="cyber-input"
                placeholder="Ваш никнейм (2-30 символов)"
                required
                minLength={2}
                maxLength={30}
              />
              <p className="font-rajdhani text-xs mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
                Отображается в темах и ответах. Можно изменить позже.
              </p>
            </div>
          )}

          {mode === 'login-card' ? (
            <div>
              <label className="forum-label">ТЕЛЕФОН *</label>
              <input
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="cyber-input"
                placeholder="+7 (999) 000-00-00"
                required
              />
              <p className="font-rajdhani text-xs mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
                Тот же номер, который вы указывали при регистрации клубной карты
              </p>
            </div>
          ) : (
            <div>
              <label className="forum-label">EMAIL *</label>
              <input
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="cyber-input"
                placeholder="email@example.com"
                type="email"
                required
              />
            </div>
          )}

          <div>
            <label className="forum-label">ПАРОЛЬ *</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="cyber-input pr-10"
                placeholder={mode === 'register' ? 'Минимум 6 символов' : 'Ваш пароль'}
                required
                minLength={mode === 'register' ? 6 : 1}
              />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-white/30 hover:text-white/60"
              >
                <i className={showPass ? 'ri-eye-off-line' : 'ri-eye-line'} style={{ fontSize: '14px' }} />
              </button>
            </div>
            {mode === 'register' && password.length > 0 && (
              <div className="mt-1.5 flex gap-1">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-1 flex-1 rounded-full transition-all duration-200"
                    style={{
                      background: i < password.length
                        ? (password.length >= 6 ? '#4ade80' : '#00f5ff')
                        : 'rgba(0,245,255,0.1)'
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {msg && (
            <div
              className="px-3 py-2.5 rounded-lg font-rajdhani text-sm"
              style={{
                background: msg.ok ? 'rgba(74,222,128,0.08)' : 'rgba(255,0,110,0.08)',
                border: `1px solid ${msg.ok ? 'rgba(74,222,128,0.3)' : 'rgba(255,0,110,0.3)'}`,
                color: msg.ok ? '#4ade80' : '#ff006e',
              }}
            >
              {msg.text}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-sm font-orbitron font-bold text-sm cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 whitespace-nowrap transition-all"
            style={{ background: 'rgba(0,245,255,0.12)', border: '1px solid rgba(0,245,255,0.5)', color: '#00f5ff' }}
          >
            {loading ? <i className="ri-loader-4-line animate-spin" /> : <i className={mode === 'register' ? 'ri-user-add-line' : 'ri-login-box-line'} />}
            {mode === 'register' ? 'Подать заявку' : 'Войти на форум'}
          </button>

          {mode === 'login-card' && (
            <p className="text-center font-rajdhani text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
              Нет клубной карты?{' '}
              <button
                type="button"
                onClick={() => handleModeChange('register')}
                className="cursor-pointer hover:underline"
                style={{ color: '#00f5ff' }}
              >
                Зарегистрироваться
              </button>
            </p>
          )}
        </form>

        <style>{`
          .forum-label {
            display: block;
            font-family: 'Rajdhani', sans-serif;
            font-size: 10px;
            letter-spacing: 1px;
            color: rgba(255,255,255,0.4);
            margin-bottom: 6px;
            text-transform: uppercase;
          }
          .cyber-input {
            width: 100%;
            background: rgba(0,245,255,0.03);
            border: 1px solid rgba(0,245,255,0.2);
            border-radius: 4px;
            padding: 10px 14px;
            font-size: 13px;
            color: rgba(255,255,255,0.9);
            outline: none;
            font-family: 'Rajdhani', sans-serif;
            transition: border-color 0.2s;
          }
          .cyber-input:focus {
            border-color: rgba(0,245,255,0.5);
            box-shadow: 0 0 0 3px rgba(0,245,255,0.06);
          }
        `}</style>
      </div>
    </div>
  );
};

export default ForumAuth;