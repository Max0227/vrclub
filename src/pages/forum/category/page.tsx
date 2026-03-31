import { useEffect, useState, useRef, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useForum, ForumThread, ForumCategory } from '../hooks/useForum';
import ForumAuth from '../components/ForumAuth';
import PageMeta from '../../../components/feature/PageMeta';

const timeAgo = (d: string) => {
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'только что';
  if (mins < 60) return `${mins} мин назад`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} ч назад`;
  return `${Math.floor(hrs / 24)} дн назад`;
};

const categoryMeta: Record<string, { title: string; description: string; keywords: string }> = {
  // Существующие категории
  quest2: {
    title: 'Oculus Quest 2 в России — активация, SideQuest, игры | Форум PARADOX VR',
    description: 'Обсуждение Oculus Quest 2: активация шлема в России, установка игр через SideQuest без магазина Meta, настройка VPN, лучшие VR-игры 2026. Советы опытных пользователей.',
    keywords: 'Oculus Quest 2 активация Россия, SideQuest установка игр, Quest 2 VPN настройка, Meta аккаунт Россия, VR игры Quest 2',
  },
  ps5: {
    title: 'PlayStation 5 в России — PSN, покупка игр, обход | Форум PARADOX VR',
    description: 'Как пользоваться PS5 в России: смена региона PSN, покупка игр через турецкий и казахстанский аккаунт, VPN для PlayStation Network, актуальные рабочие методы 2026.',
    keywords: 'PS5 Россия 2026, PlayStation Network Россия, PSN турецкий аккаунт, купить игры PS5 Россия, обход блокировок PlayStation',
  },
  racing: {
    title: 'Гоночные симуляторы MOZA Racing — настройка, игры, трассы | Форум PARADOX VR',
    description: 'Форум по гоночным симуляторам MOZA R5: настройка руля и педалей, лучшие настройки FFB, Assetto Corsa, DiRT Rally, Forza Horizon 5, BeamNG. Советы реальных гонщиков.',
    keywords: 'MOZA Racing настройка, MOZA R5 FFB настройки, гоночный симулятор Новосибирск, Assetto Corsa настройки руль, DiRT Rally 2.0 MOZA',
  },
  bypass: {
    title: 'Обход блокировок Steam, PS5, Xbox в России — рабочие методы | Форум PARADOX VR',
    description: 'Актуальные рабочие методы обхода блокировок для геймеров в России: Steam VPN, смена региона PSN, Xbox Game Pass, Epic Games, скачивание игр. Обновляется постоянно.',
    keywords: 'обход блокировок Steam Россия 2026, VPN для Steam, Xbox Game Pass Россия, Epic Games Россия, скачать игры обход блокировки',
  },
  games: {
    title: 'Игры и рекомендации — VR, PS5, PC | Форум PARADOX VR Новосибирск',
    description: 'Рекомендации игр, обзоры, обсуждение новинок и секретов. VR-игры для Quest 2, топ игр PS5 2026, лучшие гонки для симулятора. Делимся впечатлениями от игр клуба PARADOX.',
    keywords: 'лучшие VR игры 2026, топ игры PS5, Quest 2 рекомендации, Beat Saber, Superhot VR, новые игры VR',
  },
  club: {
    title: 'О клубе PARADOX VR Новосибирск — отзывы, вопросы, клубная карта | Форум',
    description: 'Обсуждение VR-клуба PARADOX в Новосибирске: отзывы посетителей, вопросы об оборудовании, клубная карта и программа лояльности, организация мероприятий и дни рождения.',
    keywords: 'PARADOX VR клуб Новосибирск отзывы, VR клуб Шевелева 24, клубная карта PARADOX, день рождения VR Новосибирск',
  },

  // Новые категории (добавлены для SEO)
  'pc-hardware': {
    title: 'ПК и железо для VR — сборка, видеокарты, процессоры | Форум PARADOX VR',
    description: 'Обсуждение сборки ПК для VR: выбор видеокарты, процессора, оперативной памяти, охлаждения. Рекомендации для Half-Life: Alyx, Beat Saber, VR-симуляторов.',
    keywords: 'сборка ПК для VR, видеокарта для Quest 2, процессор для VR, охлаждение ПК, оперативная память',
  },
  streaming: {
    title: 'Стриминг и запись VR-игр — OBS, Twitch, YouTube | Форум PARADOX VR',
    description: 'Настройка OBS для стрима VR, захват экрана Oculus Quest 2, советы по монтажу, обход блокировок Twitch и YouTube.',
    keywords: 'стрим VR, OBS настройка, запись VR, стрим Quest 2, стриминг из России',
  },
  tournaments: {
    title: 'Турниры по VR и киберспорту — расписание, регистрация, результаты | PARADOX VR',
    description: 'Анонсы турниров по Beat Saber, Assetto Corsa, Dota 2 и другим играм. Результаты, фото, обсуждение соревнований в Новосибирске.',
    keywords: 'турниры VR Новосибирск, Beat Saber турнир, гоночные турниры, киберспорт',
  },
  'off-topic': {
    title: 'Общение и знакомства — форум геймеров Новосибирска | PARADOX VR',
    description: 'Свободное общение, знакомства, офтоп. Найди единомышленников для совместных игр и обсуждений.',
    keywords: 'общение геймеров, знакомства, офтоп форум, VR сообщество',
  },
  peripherals: {
    title: 'Игровая периферия — клавиатуры, мыши, геймпады, кресла | Форум PARADOX VR',
    description: 'Обзоры и сравнение игровых клавиатур, мышей, геймпадов, кресел. Советы по выбору для VR и обычных игр.',
    keywords: 'игровая клавиатура, игровая мышь, геймпад для ПК, игровое кресло',
  },
  feedback: {
    title: 'Вопросы и предложения — как улучшить PARADOX VR | Форум клуба',
    description: 'Задайте вопрос администрации, предложите новую игру или услугу, оставьте отзыв о работе клуба.',
    keywords: 'вопросы клубу, предложения VR, обратная связь PARADOX',
  },
  pcvr: {
    title: 'PC VR — Valve Index, HTC Vive, настройка SteamVR | Форум PARADOX VR',
    description: 'Настройка PC VR-шлемов (Valve Index, HTC Vive, Pimax), игры в SteamVR, калибровка базовых станций, решение проблем.',
    keywords: 'Valve Index настройка, HTC Vive Россия, SteamVR проблемы, PC VR игры',
  },
  xbox: {
    title: 'Xbox Series X/S в России — Game Pass, обход блокировок, игры | Форум PARADOX VR',
    description: 'Использование Xbox в России: Game Pass, покупка игр, VPN, обход региональных ограничений.',
    keywords: 'Xbox Series X Россия, Xbox Game Pass, обход блокировок Xbox',
  },
  nintendo: {
    title: 'Nintendo Switch — игры, аксессуары, мультиплеер | Форум PARADOX VR',
    description: 'Обсуждение Nintendo Switch: лучшие эксклюзивы, настройка онлайн-игр, аксессуары, мультиплеер.',
    keywords: 'Nintendo Switch игры, Switch онлайн, джойконы, аксессуары Switch',
  },
  mods: {
    title: 'Моды и кастомизация — установка, создание контента | Форум PARADOX VR',
    description: 'Установка модов для Skyrim VR, Cyberpunk 2077, Assetto Corsa. Создание собственного контента.',
    keywords: 'моды для VR, установка модов, кастомизация игр, Skyrim VR моды',
  },
  software: {
    title: 'Софт и утилиты для геймеров — настройка ОС, драйвера | Форум PARADOX VR',
    description: 'Программы для оптимизации игр, настройка Windows, драйвера, полезные утилиты для геймеров.',
    keywords: 'настройка Windows для игр, драйвера, утилиты геймера',
  },
  esports: {
    title: 'Киберспорт — новости, турниры, команды | Форум PARADOX VR',
    description: 'Новости киберспорта, расписание турниров, обсуждение команд и игроков.',
    keywords: 'киберспорт новости, турниры Dota 2, CS2 киберспорт',
  },
  fitness: {
    title: 'VR-фитнес — Beat Saber, Supernatural, фитнес в VR | Форум PARADOX VR',
    description: 'Использование VR для фитнеса: лучшие игры, сжигание калорий, советы по тренировкам.',
    keywords: 'VR фитнес, Beat Saber калории, Supernatural VR, фитнес в очках',
  },
  family: {
    title: 'Семейный гейминг — игры для детей, семейные развлечения | PARADOX VR',
    description: 'Игры для детей и семейного времяпрепровождения в VR и на консолях. Безопасные настройки.',
    keywords: 'детские VR игры, семейный гейминг, игры для детей на PS5',
  },
  indie: {
    title: 'Инди-игры — обзоры, новинки, поддержка разработчиков | Форум PARADOX VR',
    description: 'Обсуждение инди-проектов, новинки инди-сцены, обзоры малоизвестных игр.',
    keywords: 'инди игры, обзоры инди, новинки инди',
  },
  retro: {
    title: 'Ретрогейминг — эмуляторы, классические игры | Форум PARADOX VR',
    description: 'Вспоминаем старые игры, настройка эмуляторов, коллекционирование.',
    keywords: 'ретрогейминг, эмуляторы, классические игры',
  },
  guides: {
    title: 'Гайды и туториалы — прохождения, настройки, секреты | PARADOX VR',
    description: 'Пошаговые руководства по играм, настройке оборудования, решению проблем.',
    keywords: 'гайды по играм, туториалы, прохождения, секреты игр',
  },
  general: {
    title: 'Общее обсуждение — всё остальное | Форум PARADOX VR',
    description: 'Темы, не попавшие в другие разделы. Свободное общение на любые темы.',
    keywords: 'общее обсуждение, форум, офтоп',
  },
  jobs: {
    title: 'Вакансии и работа в игровой индустрии | Форум PARADOX VR',
    description: 'Вакансии в PARADOX VR, работа в геймдеве, стажировки.',
    keywords: 'вакансии VR, работа в геймдеве, работа в клубе',
  },
};

const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { 
    forumUser, 
    fetchCategories, 
    fetchThreads, 
    createThread,
    loginWithCard,
    loginEmail,
    registerEmail
  } = useForum();
  const [category, setCategory] = useState<ForumCategory | null>(null);
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [showNewThread, setShowNewThread] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  
  // Кэш для категорий
  const categoriesCache = useRef<ForumCategory[]>([]);
  const loadingRef = useRef(false);

  // Функция загрузки данных
  const loadData = useCallback(async () => {
    if (!slug) return;
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    
    try {
      let cats = categoriesCache.current;
      if (cats.length === 0) {
        cats = await fetchCategories();
        categoriesCache.current = cats;
      }
      
      const threadsData = await fetchThreads(slug);
      setCategory(cats.find(c => c.slug === slug) || null);
      setThreads(threadsData);
    } catch (err) {
      console.error('Ошибка загрузки:', err);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [slug, fetchCategories, fetchThreads]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateThread = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !newTitle.trim() || !newContent.trim()) return;
    setSubmitting(true);
    setMsg(null);
    
    try {
      const result = await createThread(category.id, category.slug, newTitle, newContent);
      if (result.success && result.threadId) {
        // Перезагружаем список тем
        await loadData();
        navigate(`/forum/thread/${result.threadId}`);
      } else {
        setMsg({ ok: false, text: result.message || 'Ошибка создания темы. Попробуйте позже.' });
      }
    } catch (err) {
      setMsg({ ok: false, text: 'Ошибка соединения. Проверьте интернет и попробуйте снова.' });
    } finally {
      setSubmitting(false);
      setShowNewThread(false);
      setNewTitle('');
      setNewContent('');
    }
  };

  const cat = category;
  const meta = (slug && categoryMeta[slug]) || null;

  return (
    <div style={{ background: '#010014', minHeight: '100vh' }}>
      <PageMeta
        title={meta?.title || `${cat?.name || 'Раздел'} — Форум PARADOX VR Новосибирск`}
        description={meta?.description || cat?.description || 'Форум PARADOX VR Club Новосибирск — обсуждения VR, Quest 2, PS5, гоночных симуляторов.'}
        canonical={`https://paradoxvr.ru/forum/category/${slug}`}
        keywords={meta?.keywords || `форум VR, ${cat?.name || ''}, PARADOX VR Новосибирск, Quest 2, PS5`}
      />
      <div className="fixed inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(0,245,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(0,245,255,0.025) 1px,transparent 1px)', backgroundSize: '60px 60px', zIndex: 0 }} />

      <nav className="sticky top-0 z-40 flex items-center justify-between px-4 md:px-6 h-14" style={{ background: 'rgba(1,0,20,0.97)', borderBottom: '1px solid rgba(0,245,255,0.12)', backdropFilter: 'blur(12px)' }}>
        <div className="flex items-center gap-3">
          <Link to="/forum" className="flex items-center gap-1.5 cursor-pointer group">
            <i className="ri-arrow-left-line text-sm transition-transform group-hover:-translate-x-1" style={{ color: '#00f5ff' }} />
            <span className="font-orbitron text-xs font-bold tracking-wider" style={{ color: '#00f5ff' }}>ФОРУМ</span>
          </Link>
          {cat && (
            <>
              <span className="text-white/20">/</span>
              <span className="font-orbitron text-xs text-white/60">{cat.name}</span>
            </>
          )}
        </div>
        {forumUser ? (
          <button onClick={() => setShowNewThread(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-sm text-xs font-orbitron cursor-pointer whitespace-nowrap"
            style={{ background: 'rgba(0,245,255,0.1)', border: '1px solid rgba(0,245,255,0.4)', color: '#00f5ff' }}>
            <i className="ri-add-line" />Новая тема
          </button>
        ) : (
          <button onClick={() => setShowAuth(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-sm text-xs font-orbitron cursor-pointer whitespace-nowrap"
            style={{ background: 'rgba(0,245,255,0.1)', border: '1px solid rgba(0,245,255,0.4)', color: '#00f5ff' }}>
            <i className="ri-login-box-line" />Войти
          </button>
        )}
      </nav>

      <div className="relative z-10 max-w-4xl mx-auto px-4 md:px-6 py-8">
        {cat && (
          <div className="flex items-center gap-4 mb-8 p-4 rounded-xl" style={{ background: `${cat.color}08`, border: `1px solid ${cat.color}25` }}>
            <div className="w-12 h-12 flex items-center justify-center rounded-xl flex-shrink-0" style={{ background: `${cat.color}15`, border: `1px solid ${cat.color}40` }}>
              <i className={`${cat.icon} text-2xl`} style={{ color: cat.color }} />
            </div>
            <div className="flex-1">
              <h1 className="font-orbitron font-black text-white text-lg tracking-wider">{cat.name}</h1>
              <p className="font-rajdhani text-white/50 text-sm mt-0.5">{cat.description}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="font-orbitron font-bold text-lg" style={{ color: cat.color }}>{cat.threadCount}</div>
              <div className="font-mono-tech text-white/30" style={{ fontSize: '9px' }}>тем</div>
            </div>
          </div>
        )}

        {/* New Thread Form */}
        {showNewThread && forumUser && (
          <div className="mb-6 rounded-xl p-5" style={{ background: 'rgba(0,245,255,0.04)', border: '1px solid rgba(0,245,255,0.2)' }}>
            <h3 className="font-orbitron font-bold text-white text-sm mb-4">НОВАЯ ТЕМА</h3>
            <form onSubmit={handleCreateThread} className="space-y-3">
              <input 
                value={newTitle} 
                onChange={e => setNewTitle(e.target.value)} 
                placeholder="Заголовок темы..." 
                required
                maxLength={100}
                className="w-full rounded-lg px-4 py-3 font-rajdhani text-sm text-white outline-none"
                style={{ background: 'rgba(0,245,255,0.04)', border: '1px solid rgba(0,245,255,0.2)', color: 'rgba(255,255,255,0.9)' }} 
              />
              <textarea 
                value={newContent} 
                onChange={e => setNewContent(e.target.value)} 
                placeholder="Текст вашей темы..." 
                required 
                rows={5}
                className="w-full rounded-lg px-4 py-3 font-rajdhani text-sm text-white outline-none resize-none"
                style={{ background: 'rgba(0,245,255,0.04)', border: '1px solid rgba(0,245,255,0.2)', color: 'rgba(255,255,255,0.9)' }} 
              />
              {msg && <p className="font-rajdhani text-sm" style={{ color: msg.ok ? '#4ade80' : '#ff006e' }}>{msg.text}</p>}
              <div className="flex gap-2">
                <button type="button" onClick={() => { setShowNewThread(false); setMsg(null); setNewTitle(''); setNewContent(''); }}
                  className="px-4 py-2.5 rounded-sm text-xs font-rajdhani cursor-pointer" 
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}>
                  Отмена
                </button>
                <button type="submit" disabled={submitting}
                  className="flex-1 py-2.5 rounded-sm text-xs font-orbitron font-bold cursor-pointer disabled:opacity-50 whitespace-nowrap"
                  style={{ background: 'rgba(0,245,255,0.12)', border: '1px solid rgba(0,245,255,0.4)', color: '#00f5ff' }}>
                  {submitting ? 'Публикация...' : 'Опубликовать тему'}
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: 'rgba(0,245,255,0.2)', borderTopColor: '#00f5ff' }} />
          </div>
        ) : threads.length === 0 ? (
          <div className="text-center py-16">
            <i className="ri-article-line text-3xl mb-3 block" style={{ color: 'rgba(0,245,255,0.3)' }} />
            <p className="font-rajdhani text-white/30">Пока нет тем. Будь первым!</p>
            {forumUser && (
              <button 
                onClick={() => setShowNewThread(true)}
                className="mt-4 px-5 py-2 rounded-sm text-xs font-orbitron cursor-pointer"
                style={{ background: 'rgba(0,245,255,0.1)', border: '1px solid rgba(0,245,255,0.4)', color: '#00f5ff' }}>
                + Создать первую тему
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {threads.map(t => (
              <Link key={t.id} to={`/forum/thread/${t.id}`}
                className="flex items-start gap-4 p-4 rounded-xl cursor-pointer transition-all group"
                style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${t.isPinned ? 'rgba(0,245,255,0.25)' : 'rgba(255,255,255,0.06)'}` }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,245,255,0.04)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)'; }}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center font-orbitron font-black flex-shrink-0"
                  style={{ fontSize: '12px', background: `${t.authorColor}18`, border: `1px solid ${t.authorColor}40`, color: t.authorColor }}>
                  {t.authorName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    {t.isPinned && <span className="font-mono-tech px-1.5 py-0.5 rounded" style={{ fontSize: '8px', background: 'rgba(0,245,255,0.1)', color: '#00f5ff', border: '1px solid rgba(0,245,255,0.3)' }}>📌 ЗАКРЕП</span>}
                    <span className="font-rajdhani font-bold text-white text-sm group-hover:text-white/90 transition-colors leading-tight">{t.title}</span>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-mono-tech" style={{ fontSize: '10px', color: t.authorColor }}>{t.authorName}</span>
                    <span className="font-mono-tech text-white/25" style={{ fontSize: '10px' }}>{timeAgo(t.createdAt)}</span>
                    {t.lastPostAuthor && t.lastPostAuthor !== t.authorName && (
                      <span className="font-mono-tech text-white/25" style={{ fontSize: '10px' }}>последний: {t.lastPostAuthor} {timeAgo(t.lastPostAt)}</span>
                    )}
                  </div>
                </div>
                <div className="flex-shrink-0 text-right">
                  <div className="flex items-center gap-1.5 text-white/40">
                    <i className="ri-chat-3-line" style={{ fontSize: '11px' }} />
                    <span className="font-orbitron font-bold text-xs">{t.postCount}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-white/25">
                    <i className="ri-eye-line" style={{ fontSize: '10px' }} />
                    <span className="font-mono-tech" style={{ fontSize: '10px' }}>{t.views}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {showAuth && (
        <ForumAuth 
          onClose={() => setShowAuth(false)} 
          onSuccess={() => { 
            setShowAuth(false); 
            window.location.reload(); 
          }}
          loginWithCard={loginWithCard}
          loginEmail={loginEmail}
          registerEmail={registerEmail}
        />
      )}
    </div>
  );
};

export default CategoryPage;