import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useForum, ForumCategory, ForumThread, ForumUser } from './hooks/useForum';
import ForumAuth from './components/ForumAuth';
import PageMeta from '../../components/feature/PageMeta';
import SchemaOrgForum from './SchemaOrgForum';

const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'только что';
  if (mins < 60) return `${mins} мин назад`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} ч назад`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days} дн назад`;
  return new Date(dateStr).toLocaleDateString('ru-RU');
};

const getRankTitle = (posts: number) => {
  if (posts >= 200) return { label: 'ЛЕГЕНДА', color: '#ffd700' };
  if (posts >= 100) return { label: 'ЭКСПЕРТ', color: '#c084fc' };
  if (posts >= 50) return { label: 'АКТИВИСТ', color: '#00f5ff' };
  if (posts >= 20) return { label: 'УЧАСТНИК', color: '#4ade80' };
  return { label: 'НОВИЧОК', color: 'rgba(255,255,255,0.4)' };
};

const ForumPage = () => {
  const { forumUser, setForumUserExternal, loadingAuth, logout, fetchCategories, fetchRecentThreads, fetchTopUsers, loginWithCard, loginEmail, registerEmail } = useForum();
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [recent, setRecent] = useState<ForumThread[]>([]);
  const [topUsers, setTopUsers] = useState<ForumUser[]>([]);
  const [showAuth, setShowAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(() => {
    Promise.all([fetchCategories(), fetchRecentThreads(8), fetchTopUsers(7)]).then(([cats, rec, users]) => {
      setCategories(cats);
      setRecent(rec);
      setTopUsers(users);
      setLoading(false);
    });
  }, [fetchCategories, fetchRecentThreads, fetchTopUsers]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAuthSuccess = useCallback((user: ForumUser) => {
    setForumUserExternal(user);
    setShowAuth(false);
  }, [setForumUserExternal]);

  const totalThreads = categories.reduce((s, c) => s + c.threadCount, 0);
  const totalPosts = categories.reduce((s, c) => s + c.postCount, 0);

  return (
    <div style={{ background: '#010014', minHeight: '100vh' }}>
      <PageMeta
        title="Форум VR-клуба PARADOX — Quest 2, PS5, MOZA Racing, VPN и обход блокировок | Новосибирск"
        description="Форум VR-клуба PARADOX Новосибирск: активация Oculus Quest 2 в России, SideQuest установка игр, VPN для PS5 и PlayStation Network, настройка MOZA Racing, обход блокировок Steam. Сообщество опытных геймеров."
        canonical="https://paradoxvr.ru/forum"
        keywords="форум VR Новосибирск, Quest 2 активация Россия, SideQuest установка, VPN PS5 Россия, MOZA Racing настройка, обход блокировок PlayStation, Steam VPN Россия, VR сообщество"
      />
      <SchemaOrgForum />

      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(0,245,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(0,245,255,0.025) 1px, transparent 1px)',
        backgroundSize: '60px 60px', zIndex: 0,
      }} />

      {/* Navbar */}
      <nav className="sticky top-0 z-40 flex items-center justify-between px-4 md:px-6 h-14"
        style={{ background: 'rgba(1,0,20,0.97)', borderBottom: '1px solid rgba(0,245,255,0.12)', backdropFilter: 'blur(12px)' }}>
        <Link to="/" className="flex items-center gap-2 cursor-pointer group">
          <i className="ri-arrow-left-line text-sm transition-transform group-hover:-translate-x-1" style={{ color: '#00f5ff' }} />
          <span className="font-orbitron text-xs font-bold tracking-wider" style={{ color: '#00f5ff' }}>PARADOX VR</span>
        </Link>
        <div className="flex items-center gap-1.5">
          <i className="ri-discuss-line text-xs" style={{ color: '#00f5ff' }} />
          <span className="font-orbitron font-black text-white tracking-widest" style={{ fontSize: '10px' }}>ФОРУМ</span>
        </div>
        {forumUser ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full flex items-center justify-center font-orbitron font-black text-xs"
                style={{ background: `${forumUser.avatarColor}20`, border: `1px solid ${forumUser.avatarColor}60`, color: forumUser.avatarColor }}>
                {forumUser.username.charAt(0).toUpperCase()}
              </div>
              <span className="font-rajdhani text-sm font-bold text-white hidden sm:block">{forumUser.username}</span>
            </div>
            <button onClick={logout} className="font-rajdhani text-xs cursor-pointer whitespace-nowrap"
              style={{ color: 'rgba(255,255,255,0.35)' }}>Выйти</button>
          </div>
        ) : (
          <button onClick={() => setShowAuth(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-sm text-xs font-orbitron cursor-pointer whitespace-nowrap"
            style={{ background: 'rgba(0,245,255,0.1)', border: '1px solid rgba(0,245,255,0.4)', color: '#00f5ff' }}>
            <i className="ri-login-box-line" />Войти
          </button>
        )}
      </nav>

      <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-6 py-8">
        {/* Hero */}
        <div className="text-center mb-10 relative overflow-hidden rounded-xl py-10 px-4"
          style={{ background: 'linear-gradient(135deg, rgba(0,245,255,0.06) 0%, rgba(155,77,255,0.06) 100%)', border: '1px solid rgba(0,245,255,0.15)' }}>
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(ellipse at 50% 0%, rgba(0,245,255,0.08) 0%, transparent 70%)' }} />
          <div className="relative">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4"
              style={{ background: 'rgba(0,245,255,0.08)', border: '1px solid rgba(0,245,255,0.2)' }}>
              <i className="ri-discuss-line text-xs" style={{ color: '#00f5ff' }} />
              <span className="font-mono-tech text-xs tracking-widest" style={{ color: '#00f5ff' }}>СООБЩЕСТВО ГЕЙМЕРОВ</span>
            </div>
            <h1 className="font-orbitron font-black text-white text-3xl md:text-4xl mb-3 tracking-wider">ФОРУМ PARADOX VR</h1>
            <p className="font-rajdhani text-white/50 text-base max-w-lg mx-auto mb-6">
              Quest 2, PS5, гоночные симуляторы, VPN, обход блокировок. Задавай вопросы — отвечаем вместе.
            </p>
            <div className="flex items-center justify-center gap-6 flex-wrap">
              {[
                { label: 'Тем', value: totalThreads, icon: 'ri-article-line', color: '#00f5ff' },
                { label: 'Сообщений', value: totalPosts, icon: 'ri-chat-3-line', color: '#c084fc' },
                { label: 'Участников', value: topUsers.length + 3, icon: 'ri-group-line', color: '#4ade80' },
              ].map(stat => (
                <div key={stat.label} className="text-center">
                  <div className="font-orbitron font-black text-2xl" style={{ color: stat.color }}>{stat.value}</div>
                  <div className="font-rajdhani text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{stat.label}</div>
                </div>
              ))}
            </div>
            {!forumUser && !loadingAuth && (
              <button onClick={() => setShowAuth(true)}
                className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-sm font-orbitron font-bold text-sm cursor-pointer whitespace-nowrap transition-all hover:scale-105"
                style={{ background: 'rgba(0,245,255,0.12)', border: '1px solid rgba(0,245,255,0.5)', color: '#00f5ff' }}>
                <i className="ri-user-add-line" />Присоединиться к форуму
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Categories */}
          <div className="lg:col-span-2 space-y-3">
            <h2 className="font-orbitron font-bold text-white text-sm tracking-wider mb-4 flex items-center gap-2">
              <i className="ri-layout-grid-line" style={{ color: '#00f5ff' }} />РАЗДЕЛЫ ФОРУМА
            </h2>
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: 'rgba(0,245,255,0.2)', borderTopColor: '#00f5ff' }} />
              </div>
            ) : categories.map(cat => (
              <Link key={cat.id} to={`/forum/category/${cat.slug}`}
                className="block rounded-xl p-4 transition-all cursor-pointer group"
                style={{ background: `${cat.color}06`, border: `1px solid ${cat.color}20` }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = `${cat.color}50`; (e.currentTarget as HTMLElement).style.background = `${cat.color}0e`; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = `${cat.color}20`; (e.currentTarget as HTMLElement).style.background = `${cat.color}06`; }}>
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 flex items-center justify-center rounded-lg flex-shrink-0"
                    style={{ background: `${cat.color}12`, border: `1px solid ${cat.color}35` }}>
                    <i className={`${cat.icon} text-xl`} style={{ color: cat.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-orbitron font-bold text-white text-sm group-hover:text-white/90 transition-colors">{cat.name}</span>
                    </div>
                    <p className="font-rajdhani text-white/45 text-sm leading-relaxed line-clamp-2">{cat.description}</p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <div className="font-orbitron font-bold text-sm" style={{ color: cat.color }}>{cat.threadCount}</div>
                    <div className="font-mono-tech" style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)' }}>тем</div>
                    <div className="font-orbitron font-bold text-xs mt-1 text-white/50">{cat.postCount}</div>
                    <div className="font-mono-tech" style={{ fontSize: '9px', color: 'rgba(255,255,255,0.2)' }}>постов</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Recent activity */}
            <div className="rounded-xl p-4" style={{ background: 'rgba(0,245,255,0.04)', border: '1px solid rgba(0,245,255,0.12)' }}>
              <h3 className="font-orbitron font-bold text-white text-xs tracking-wider mb-3 flex items-center gap-2">
                <i className="ri-time-line" style={{ color: '#00f5ff' }} />ПОСЛЕДНИЕ ТЕМЫ
              </h3>
              <div className="space-y-3">
                {recent.slice(0, 6).map(t => (
                  <Link key={t.id} to={`/forum/thread/${t.id}`} className="block group cursor-pointer">
                    <div className="font-rajdhani text-sm font-bold text-white/80 group-hover:text-white transition-colors leading-tight line-clamp-1">{t.title}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-mono-tech" style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>{t.authorName}</span>
                      <span className="font-mono-tech" style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)' }}>{timeAgo(t.lastPostAt)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Top users */}
            <div className="rounded-xl p-4" style={{ background: 'rgba(155,77,255,0.04)', border: '1px solid rgba(155,77,255,0.15)' }}>
              <h3 className="font-orbitron font-bold text-white text-xs tracking-wider mb-3 flex items-center gap-2">
                <i className="ri-trophy-line" style={{ color: '#c084fc' }} />АКТИВНЫЕ УЧАСТНИКИ
              </h3>
              <div className="space-y-2">
                {topUsers.map((u, i) => {
                  const rank = getRankTitle(u.postsCount);
                  return (
                    <div key={u.id} className="flex items-center gap-2.5">
                      <span className="font-orbitron font-black text-xs w-4 flex-shrink-0" style={{ color: i === 0 ? '#ffd700' : i === 1 ? '#c8d6e5' : 'rgba(255,255,255,0.3)' }}>
                        {i + 1}
                      </span>
                      <div className="w-7 h-7 flex items-center justify-center rounded-full font-orbitron font-black flex-shrink-0"
                        style={{ fontSize: '10px', background: `${u.avatarColor}18`, border: `1px solid ${u.avatarColor}40`, color: u.avatarColor }}>
                        {u.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-rajdhani font-bold text-white text-xs leading-tight truncate">{u.username}</div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono-tech" style={{ fontSize: '9px', color: rank.color }}>{rank.label}</span>
                          <span className="font-mono-tech" style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)' }}>{u.postsCount} постов</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Join banner */}
            {!forumUser && (
              <div className="rounded-xl p-4 text-center" style={{ background: 'rgba(0,245,255,0.05)', border: '1px dashed rgba(0,245,255,0.2)' }}>
                <i className="ri-vr-line text-2xl mb-2 block" style={{ color: '#00f5ff' }} />
                <p className="font-rajdhani text-white/60 text-sm mb-3 leading-relaxed">
                  Зарегистрируйся и участвуй в обсуждениях, задавай вопросы, зарабатывай рейтинг
                </p>
                <button onClick={() => setShowAuth(true)}
                  className="w-full py-2.5 rounded-sm font-orbitron font-bold text-xs cursor-pointer whitespace-nowrap"
                  style={{ background: 'rgba(0,245,255,0.1)', border: '1px solid rgba(0,245,255,0.4)', color: '#00f5ff' }}>
                  Присоединиться
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showAuth && (
        <ForumAuth
          onClose={() => setShowAuth(false)}
          onSuccess={handleAuthSuccess}
          loginWithCard={loginWithCard}
          loginEmail={loginEmail}
          registerEmail={registerEmail}
        />
      )}
    </div>
  );
};

export default ForumPage;
