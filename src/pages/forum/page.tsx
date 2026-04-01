import { useEffect, useState, useCallback, useMemo, useDeferredValue } from 'react';
import { Link } from 'react-router-dom';
import { useForum, ForumCategory, ForumThread, ForumUser } from './hooks/useForum';
import ForumAuth from './components/ForumAuth';
import PageMeta from '../../components/feature/PageMeta';
import SchemaOrgForum from './SchemaOrgForum';
import { supabase } from '../../lib/supabase';

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
  if (posts >= 500) return { label: 'ГУРУ', color: '#ffd700', icon: 'ri-crown-line' };
  if (posts >= 200) return { label: 'ЛЕГЕНДА', color: '#ffd700', icon: 'ri-medal-line' };
  if (posts >= 100) return { label: 'ЭКСПЕРТ', color: '#c084fc', icon: 'ri-star-line' };
  if (posts >= 50) return { label: 'АКТИВИСТ', color: '#00f5ff', icon: 'ri-flashlight-line' };
  if (posts >= 20) return { label: 'УЧАСТНИК', color: '#4ade80', icon: 'ri-user-smile-line' };
  return { label: 'НОВИЧОК', color: 'rgba(255,255,255,0.4)', icon: 'ri-user-line' };
};

type SortOption = 'latest' | 'popular' | 'most_commented';
type FilterOption = 'all' | 'unanswered' | 'popular';

const ForumPage = () => {
  const { 
    forumUser, 
    setForumUserExternal, 
    loadingAuth, 
    logout, 
    fetchCategories, 
    fetchRecentThreads, 
    fetchTopUsers, 
    loginWithCard, 
    loginEmail, 
    registerEmail 
  } = useForum();
  
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [allThreads, setAllThreads] = useState<ForumThread[]>([]);
  const [recent, setRecent] = useState<ForumThread[]>([]);
  const [topUsers, setTopUsers] = useState<ForumUser[]>([]);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [totalPosts, setTotalPosts] = useState<number>(0);
  const [showAuth, setShowAuth] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Поиск и фильтры
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('latest');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  
  // Пагинация
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  
  const deferredSearchQuery = useDeferredValue(searchQuery);
  
  // Загрузка данных
  const loadData = useCallback(async () => {
    try {
      const [cats, rec, users] = await Promise.all([
        fetchCategories(),
        fetchRecentThreads(10),
        fetchTopUsers(10)
      ]);
      
      // Загружаем все темы для поиска
      const { data: threadsData, count: threadsCount } = await supabase
        .from('forum_threads')
        .select('*, forum_users!author_id(username, avatar_color)', { count: 'exact' })
        .order('last_post_at', { ascending: false });
      
      // Загружаем общую статистику
      const { count: usersCount } = await supabase
        .from('forum_users')
        .select('*', { count: 'exact', head: true })
        .eq('is_approved', true);
      
      const { count: postsCount } = await supabase
        .from('forum_posts')
        .select('*', { count: 'exact', head: true });
      
      const formattedThreads = (threadsData || []).map(t => ({
        ...t,
        authorName: (t.forum_users as any)?.username || 'Unknown',
        authorColor: (t.forum_users as any)?.avatar_color || '#00f5ff',
        postCount: t.post_count || 1,
      })) as ForumThread[];
      
      setCategories(cats);
      setAllThreads(formattedThreads);
      setRecent(rec);
      setTopUsers(users);
      setTotalUsers(usersCount || 0);
      setTotalPosts(postsCount || 0);
      setLoading(false);
    } catch (err) {
      console.error('Ошибка загрузки данных форума:', err);
      setLoading(false);
    }
  }, [fetchCategories, fetchRecentThreads, fetchTopUsers]);
  
  useEffect(() => {
    loadData();
  }, [loadData]);
  
  // Фильтрация и поиск
  const filteredThreads = useMemo(() => {
    let threads = [...allThreads];
    
    // Поиск по заголовку и контенту
    if (deferredSearchQuery.trim()) {
      const query = deferredSearchQuery.toLowerCase();
      threads = threads.filter(t => 
        t.title.toLowerCase().includes(query) || 
        t.content?.toLowerCase().includes(query)
      );
    }
    
    // Фильтр по категории
    if (selectedCategory !== 'all') {
      threads = threads.filter(t => t.categorySlug === selectedCategory);
    }
    
    // Дополнительные фильтры
    if (filterBy === 'unanswered') {
      threads = threads.filter(t => t.postCount <= 1);
    }
    
    // Сортировка
    switch (sortBy) {
      case 'popular':
        threads.sort((a, b) => b.views - a.views);
        break;
      case 'most_commented':
        threads.sort((a, b) => b.postCount - a.postCount);
        break;
      case 'latest':
      default:
        threads.sort((a, b) => new Date(b.lastPostAt).getTime() - new Date(a.lastPostAt).getTime());
        break;
    }
    
    return threads;
  }, [allThreads, deferredSearchQuery, selectedCategory, sortBy, filterBy]);
  
  // Пагинация
  const totalPages = Math.ceil(filteredThreads.length / itemsPerPage);
  const paginatedThreads = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredThreads.slice(start, start + itemsPerPage);
  }, [filteredThreads, currentPage]);
  
  // Сброс страницы при изменении фильтров
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, sortBy, filterBy]);
  
  const handleAuthSuccess = useCallback((user: ForumUser) => {
    setForumUserExternal(user);
    setShowAuth(false);
    loadData();
  }, [setForumUserExternal, loadData]);
  
  const totalThreads = allThreads.length;
  
  // Статистика за сегодня
  const todayThreads = allThreads.filter(t => {
    const today = new Date();
    const threadDate = new Date(t.createdAt);
    return threadDate.toDateString() === today.toDateString();
  }).length;
  
  const todayPosts = allThreads.reduce((acc, t) => {
    const postDate = new Date(t.lastPostAt);
    if (postDate.toDateString() === new Date().toDateString()) {
      return acc + (t.postCount || 0);
    }
    return acc;
  }, 0);
  
  return (
    <div style={{ background: '#010014', minHeight: '100vh' }}>
      <PageMeta
        title="Форум VR-клуба PARADOX — Quest 2, PS5, MOZA Racing, VPN и обход блокировок | Новосибирск"
        description="Форум VR-клуба PARADOX Новосибирск: активация Oculus Quest 2 в России, SideQuest установка игр, VPN для PS5 и PlayStation Network, настройка MOZA Racing, обход блокировок Steam. Сообщество опытных геймеров."
        canonical="https://paradoxvr.ru/forum"
        keywords="форум VR Новосибирск, Quest 2 активация Россия, SideQuest установка, VPN PS5 Россия, MOZA Racing настройка, обход блокировок PlayStation, Steam VPN Россия, VR сообщество"
      />
      <SchemaOrgForum />

      {/* Фоновый грид */}
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
        <div className="flex items-center gap-3">
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
            <button onClick={logout} className="font-rajdhani text-xs cursor-pointer whitespace-nowrap hover:text-white/60 transition-colors"
              style={{ color: 'rgba(255,255,255,0.5)' }}>Выйти</button>
          </div>
        ) : (
          <button onClick={() => setShowAuth(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-sm text-xs font-orbitron cursor-pointer whitespace-nowrap transition-all hover:scale-105"
            style={{ background: 'rgba(0,245,255,0.1)', border: '1px solid rgba(0,245,255,0.4)', color: '#00f5ff' }}>
            <i className="ri-login-box-line" />Войти
          </button>
        )}
      </nav>

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* Hero Section с поиском */}
        <div className="text-center mb-8 relative overflow-hidden rounded-2xl py-8 px-4"
          style={{ background: 'linear-gradient(135deg, rgba(0,245,255,0.08) 0%, rgba(155,77,255,0.08) 100%)', border: '1px solid rgba(0,245,255,0.2)' }}>
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(ellipse at 50% 0%, rgba(0,245,255,0.1) 0%, transparent 70%)' }} />
          <div className="relative">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4"
              style={{ background: 'rgba(0,245,255,0.1)', border: '1px solid rgba(0,245,255,0.3)' }}>
              <i className="ri-discuss-line text-xs" style={{ color: '#00f5ff' }} />
              <span className="font-mono-tech text-xs tracking-widest" style={{ color: '#00f5ff' }}>СООБЩЕСТВО ГЕЙМЕРОВ</span>
            </div>
            <h1 className="font-orbitron font-black text-white text-3xl md:text-4xl mb-3 tracking-wider">ФОРУМ PARADOX VR</h1>
            <p className="font-rajdhani text-white/50 text-base max-w-xl mx-auto mb-6">
              Quest 2, PS5, гоночные симуляторы, VPN, обход блокировок. Задавай вопросы — отвечаем вместе.
            </p>
            
            {/* Статистика */}
            <div className="flex items-center justify-center gap-8 flex-wrap mb-6">
              {[
                { label: 'Тем', value: totalThreads, icon: 'ri-article-line', color: '#00f5ff' },
                { label: 'Сообщений', value: totalPosts, icon: 'ri-chat-3-line', color: '#c084fc' },
                { label: 'Участников', value: totalUsers, icon: 'ri-group-line', color: '#4ade80' },
                { label: 'Сегодня', value: `${todayThreads} тем / ${todayPosts} постов`, icon: 'ri-fire-line', color: '#ff9e40' },
              ].map(stat => (
                <div key={stat.label} className="text-center">
                  <div className="font-orbitron font-black text-xl md:text-2xl" style={{ color: stat.color }}>
                    {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                  </div>
                  <div className="font-rajdhani text-xs flex items-center gap-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    <i className={stat.icon} style={{ fontSize: '10px' }} />
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Поисковая строка */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <i className="ri-search-line absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Поиск по темам форума..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl font-rajdhani text-sm outline-none transition-all"
                  style={{
                    background: 'rgba(0,245,255,0.05)',
                    border: '1px solid rgba(0,245,255,0.2)',
                    color: 'white',
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#00f5ff'}
                  onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(0,245,255,0.2)'}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                  >
                    <i className="ri-close-line" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Фильтры и сортировка */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex flex-wrap items-center gap-3">
            {/* Категории */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 rounded-full text-xs font-orbitron transition-all ${
                  selectedCategory === 'all' ? 'text-white' : 'text-white/40 hover:text-white/60'
                }`}
                style={{
                  background: selectedCategory === 'all' ? 'rgba(0,245,255,0.15)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${selectedCategory === 'all' ? 'rgba(0,245,255,0.4)' : 'rgba(255,255,255,0.1)'}`
                }}
              >
                Все
              </button>
              {categories.slice(0, 6).map(cat => (
                <button
                  key={cat.slug}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`px-3 py-1.5 rounded-full text-xs font-orbitron transition-all ${
                    selectedCategory === cat.slug ? 'text-white' : 'text-white/40 hover:text-white/60'
                  }`}
                  style={{
                    background: selectedCategory === cat.slug ? `${cat.color}20` : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${selectedCategory === cat.slug ? `${cat.color}50` : 'rgba(255,255,255,0.1)'}`
                  }}
                >
                  {cat.name.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Сортировка */}
            <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
              {[
                { value: 'latest', label: 'Новые', icon: 'ri-time-line' },
                { value: 'popular', label: 'Популярные', icon: 'ri-fire-line' },
                { value: 'most_commented', label: 'Обсуждаемые', icon: 'ri-chat-3-line' },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setSortBy(opt.value as SortOption)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-orbitron transition-all ${
                    sortBy === opt.value ? 'text-white' : 'text-white/40'
                  }`}
                  style={{
                    background: sortBy === opt.value ? 'rgba(0,245,255,0.1)' : 'transparent'
                  }}
                >
                  <i className={opt.icon} style={{ fontSize: '10px' }} />
                  {opt.label}
                </button>
              ))}
            </div>
            
            {/* Фильтр ответов */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setFilterBy(filterBy === 'all' ? 'unanswered' : 'all')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-orbitron transition-all ${
                  filterBy === 'unanswered' ? 'text-white' : 'text-white/40'
                }`}
                style={{
                  background: filterBy === 'unanswered' ? 'rgba(0,245,255,0.1)' : 'transparent'
                }}
              >
                <i className="ri-question-line" style={{ fontSize: '10px' }} />
                {filterBy === 'unanswered' ? 'Без ответов' : 'Все темы'}
              </button>
            </div>
          </div>
        </div>

        {/* Результаты поиска */}
        {searchQuery && (
          <div className="mb-4 text-white/50 text-sm font-rajdhani">
            Найдено <span className="text-[#00f5ff]">{filteredThreads.length}</span> тем по запросу "{searchQuery}"
          </div>
        )}

        {/* Список тем */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: 'rgba(0,245,255,0.2)', borderTopColor: '#00f5ff' }} />
          </div>
        ) : paginatedThreads.length === 0 ? (
          <div className="text-center py-16">
            <i className="ri-inbox-line text-4xl mb-3 block" style={{ color: 'rgba(0,245,255,0.3)' }} />
            <p className="font-rajdhani text-white/40">
              {searchQuery ? 'Ничего не найдено. Попробуйте другой запрос.' : 'Пока нет тем. Будь первым!'}
            </p>
            {!searchQuery && forumUser && (
              <Link to="/forum/category/quest2" className="inline-block mt-4 px-5 py-2 rounded-sm text-xs font-orbitron"
                style={{ background: 'rgba(0,245,255,0.1)', border: '1px solid rgba(0,245,255,0.4)', color: '#00f5ff' }}>
                Создать тему
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {paginatedThreads.map((t, index) => {
                const rank = getRankTitle(t.postCount);
                return (
                  <Link
                    key={t.id}
                    to={`/forum/thread/${t.id}`}
                    className="block rounded-xl cursor-pointer transition-all duration-200 animate-fadeIn"
                    style={{
                      background: 'rgba(255,255,255,0.02)',
                      border: `1px solid ${t.isPinned ? 'rgba(0,245,255,0.25)' : 'rgba(255,255,255,0.06)'}`,
                      animationDelay: `${index * 30}ms`,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,245,255,0.04)'; e.currentTarget.style.transform = 'translateX(4px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.transform = 'translateX(0)'; }}
                  >
                    <div className="flex items-start gap-4 p-4">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center font-orbitron font-black flex-shrink-0"
                        style={{ fontSize: '13px', background: `${t.authorColor}18`, border: `2px solid ${t.authorColor}40`, color: t.authorColor }}>
                        {t.authorName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          {t.isPinned && (
                            <span className="font-mono-tech px-1.5 py-0.5 rounded" style={{ fontSize: '8px', background: 'rgba(0,245,255,0.1)', color: '#00f5ff', border: '1px solid rgba(0,245,255,0.3)' }}>
                              📌 ЗАКРЕП
                            </span>
                          )}
                          <span className="font-rajdhani font-bold text-white text-sm group-hover:text-white/90 transition-colors leading-tight line-clamp-1">
                            {t.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 flex-wrap text-xs">
                          <span className="font-mono-tech" style={{ color: t.authorColor }}>{t.authorName}</span>
                          <span className="font-mono-tech text-white/30">{timeAgo(t.createdAt)}</span>
                          {t.lastPostAuthor && t.lastPostAuthor !== t.authorName && (
                            <span className="font-mono-tech text-white/25">
                              последний: {t.lastPostAuthor} {timeAgo(t.lastPostAt)}
                            </span>
                          )}
                          <span className={`font-mono-tech px-1.5 py-0.5 rounded ${t.postCount > 1 ? 'text-[#00f5ff]' : 'text-white/30'}`} 
                            style={{ background: t.postCount > 1 ? 'rgba(0,245,255,0.08)' : 'transparent' }}>
                            {rank.label}
                          </span>
                        </div>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <div className="flex items-center gap-1.5 text-white/40">
                          <i className="ri-chat-3-line" style={{ fontSize: '11px' }} />
                          <span className="font-orbitron font-bold text-xs">{t.postCount}</span>
                        </div>
                        <div className="flex items-center gap-1 mt-1 text-white/25">
                          <i className="ri-eye-line" style={{ fontSize: '10px' }} />
                          <span className="font-mono-tech" style={{ fontSize: '10px' }}>{t.views.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
            
            {/* Пагинация */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="w-8 h-8 rounded flex items-center justify-center transition-all disabled:opacity-30"
                  style={{ background: 'rgba(0,245,255,0.05)', border: '1px solid rgba(0,245,255,0.2)' }}
                >
                  <i className="ri-arrow-left-s-line text-sm" style={{ color: '#00f5ff' }} />
                </button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) pageNum = i + 1;
                  else if (currentPage <= 3) pageNum = i + 1;
                  else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                  else pageNum = currentPage - 2 + i;
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 rounded text-xs font-orbitron transition-all ${
                        currentPage === pageNum ? 'text-white' : 'text-white/50'
                      }`}
                      style={{
                        background: currentPage === pageNum ? 'rgba(0,245,255,0.15)' : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${currentPage === pageNum ? 'rgba(0,245,255,0.4)' : 'rgba(255,255,255,0.1)'}`
                      }}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="w-8 h-8 rounded flex items-center justify-center transition-all disabled:opacity-30"
                  style={{ background: 'rgba(0,245,255,0.05)', border: '1px solid rgba(0,245,255,0.2)' }}
                >
                  <i className="ri-arrow-right-s-line text-sm" style={{ color: '#00f5ff' }} />
                </button>
              </div>
            )}
          </>
        )}
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