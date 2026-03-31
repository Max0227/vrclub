import { useEffect, useState, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useForum, ForumThread, ForumPost, ForumUser } from '../hooks/useForum';
import ForumAuth from '../components/ForumAuth';
import PageMeta from '../../../components/feature/PageMeta';

const timeAgo = (d: string) => {
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'только что';
  if (mins < 60) return `${mins} мин. назад`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} ч. назад`;
  return new Date(d).toLocaleDateString('ru-RU');
};

const getRank = (posts: number) => {
  if (posts >= 200) return { label: 'ЛЕГЕНДА', color: '#ffd700' };
  if (posts >= 100) return { label: 'ЭКСПЕРТ', color: '#c084fc' };
  if (posts >= 50) return { label: 'АКТИВИСТ', color: '#00f5ff' };
  if (posts >= 20) return { label: 'УЧАСТНИК', color: '#4ade80' };
  return { label: 'НОВИЧОК', color: 'rgba(255,255,255,0.4)' };
};

const ThreadPage = () => {
  const { id } = useParams<{ id: string }>();
  const { 
    forumUser, 
    fetchThread, 
    replyThread, 
    toggleLike,
    loginWithCard,
    loginEmail,
    registerEmail
  } = useForum();
  const [thread, setThread] = useState<ForumThread | null>(null);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pendingApproval, setPendingApproval] = useState(false);
  const replyRef = useRef<HTMLTextAreaElement>(null);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    const result = await fetchThread(id);
    setThread(result.thread);
    setPosts(result.posts);
    setLoading(false);
  };

  useEffect(() => { load(); }, [id]);

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    if (!forumUser) { setShowAuth(true); return; }
    if (!forumUser.isApproved) {
      setMsg({ ok: false, text: 'Ваш аккаунт ожидает одобрения администратора. Пожалуйста, подождите.' });
      setTimeout(() => setMsg(null), 3000);
      return;
    }
    
    setSubmitting(true);
    setMsg(null);
    const result = await replyThread(id!, replyText);
    setSubmitting(false);
    
    if (result.success) {
      setReplyText('');
      setMsg({ ok: true, text: 'Ответ опубликован!' });
      await load();
      setTimeout(() => setMsg(null), 2000);
    } else {
      setMsg({ ok: false, text: result.message });
      setTimeout(() => setMsg(null), 3000);
    }
  };

  const handleLike = async (postId: string, likes: number, likedByMe: boolean) => {
    if (!forumUser) { setShowAuth(true); return; }
    if (!forumUser.isApproved) {
      setMsg({ ok: false, text: 'Ваш аккаунт ожидает одобрения администратора' });
      setTimeout(() => setMsg(null), 2000);
      return;
    }
    await toggleLike(postId, likes, likedByMe);
    await load();
  };

  const handleAuthSuccess = (user: ForumUser) => {
    setShowAuth(false);
    if (user.isApproved) {
      setPendingApproval(false);
    } else {
      setPendingApproval(true);
      setMsg({ ok: true, text: 'Заявка отправлена! Ожидайте одобрения администратора.' });
      setTimeout(() => setMsg(null), 4000);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#010014' }}>
      <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: 'rgba(0,245,255,0.2)', borderTopColor: '#00f5ff' }} />
    </div>
  );

  return (
    <div style={{ background: '#010014', minHeight: '100vh' }}>
      <PageMeta
        title={thread ? `${thread.title} — Форум PARADOX VR Новосибирск` : 'Тема — Форум PARADOX VR'}
        description={
          thread
            ? `${thread.content.slice(0, 140).trim()}… Обсуждение на форуме VR-клуба PARADOX Новосибирск.`
            : 'Обсуждение на форуме PARADOX VR — Quest 2, PS5, MOZA Racing, обход блокировок.'
        }
        canonical={`https://paradoxvr.ru/forum/thread/${id}`}
        keywords={`форум VR Новосибирск, Quest 2, PS5 Россия, MOZA Racing, обход блокировок, PARADOX VR, ${thread?.title || ''}`}
      />
      <div className="fixed inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(0,245,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(0,245,255,0.025) 1px,transparent 1px)', backgroundSize: '60px 60px', zIndex: 0 }} />

      <nav className="sticky top-0 z-40 flex items-center gap-3 px-4 md:px-6 h-14" style={{ background: 'rgba(1,0,20,0.97)', borderBottom: '1px solid rgba(0,245,255,0.12)', backdropFilter: 'blur(12px)' }}>
        <Link to="/forum" className="flex items-center gap-1.5 cursor-pointer group flex-shrink-0">
          <i className="ri-arrow-left-line text-sm transition-transform group-hover:-translate-x-1" style={{ color: '#00f5ff' }} />
          <span className="font-orbitron text-xs font-bold tracking-wider" style={{ color: '#00f5ff' }}>ФОРУМ</span>
        </Link>
        {thread && (
          <>
            <span className="text-white/20">/</span>
            <Link to={`/forum/category/${thread.categorySlug}`} className="font-orbitron text-xs text-white/50 hover:text-white/80 cursor-pointer truncate">
              {thread.categorySlug === 'quest2' ? 'Quest 2' : 
               thread.categorySlug === 'ps5' ? 'PS5' :
               thread.categorySlug === 'racing' ? 'Racing' :
               thread.categorySlug === 'bypass' ? 'Обход блокировок' :
               thread.categorySlug === 'games' ? 'Игры' : 'Клуб'}
            </Link>
          </>
        )}
      </nav>

      <div className="relative z-10 max-w-3xl mx-auto px-4 md:px-6 py-8">
        {thread && (
          <div className="mb-6">
            {thread.isPinned && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-3" style={{ background: 'rgba(0,245,255,0.08)', border: '1px solid rgba(0,245,255,0.2)' }}>
                <i className="ri-pushpin-line text-xs" style={{ color: '#00f5ff' }} />
                <span className="font-mono-tech" style={{ fontSize: '9px', color: '#00f5ff' }}>ЗАКРЕПЛЁННАЯ ТЕМА</span>
              </div>
            )}
            <h1 className="font-orbitron font-black text-white text-xl md:text-2xl leading-tight mb-3">{thread.title}</h1>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1.5">
                <i className="ri-eye-line text-xs" style={{ color: 'rgba(255,255,255,0.3)' }} />
                <span className="font-mono-tech text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>{thread.views} просмотров</span>
              </div>
              <div className="flex items-center gap-1.5">
                <i className="ri-chat-3-line text-xs" style={{ color: 'rgba(255,255,255,0.3)' }} />
                <span className="font-mono-tech text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>{thread.postCount} ответов</span>
              </div>
            </div>
          </div>
        )}

        {/* First post (thread content) */}
        {thread && (
          <div className="rounded-xl p-5 mb-4" style={{ background: 'rgba(0,245,255,0.04)', border: '1px solid rgba(0,245,255,0.15)' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-orbitron font-black flex-shrink-0"
                style={{ background: `${thread.authorColor}18`, border: `2px solid ${thread.authorColor}50`, color: thread.authorColor }}>
                {thread.authorName.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="font-rajdhani font-bold text-white text-sm">{thread.authorName}</div>
                <div className="font-mono-tech" style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)' }}>{timeAgo(thread.createdAt)}</div>
              </div>
            </div>
            <div className="font-rajdhani text-white/80 text-sm leading-relaxed whitespace-pre-line">{thread.content}</div>
          </div>
        )}

        {/* Posts */}
        <div className="space-y-3 mb-6">
          {posts.map((post, idx) => (
            <div key={post.id} className="rounded-xl p-5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-start gap-3">
                <div>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center font-orbitron font-black flex-shrink-0"
                    style={{ fontSize: '12px', background: `${post.authorColor}18`, border: `1px solid ${post.authorColor}40`, color: post.authorColor }}>
                    {post.authorName.charAt(0).toUpperCase()}
                  </div>
                  <div className="font-mono-tech text-center mt-1" style={{ fontSize: '8px', color: 'rgba(255,255,255,0.2)' }}>#{idx + 1}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="font-rajdhani font-bold text-white text-sm">{post.authorName}</span>
                    <span className="font-mono-tech" style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>{timeAgo(post.createdAt)}</span>
                  </div>
                  <div className="font-rajdhani text-white/75 text-sm leading-relaxed whitespace-pre-line">{post.content}</div>
                  <div className="flex items-center gap-3 mt-3">
                    <button
                      onClick={() => handleLike(post.id, post.likes, !!post.likedByMe)}
                      className="flex items-center gap-1.5 cursor-pointer transition-all hover:scale-110"
                      style={{ color: post.likedByMe ? '#ff006e' : 'rgba(255,255,255,0.3)' }}>
                      <i className={post.likedByMe ? 'ri-heart-fill' : 'ri-heart-line'} style={{ fontSize: '14px' }} />
                      <span className="font-mono-tech" style={{ fontSize: '11px' }}>{post.likes}</span>
                    </button>
                    {!forumUser && (
                      <button onClick={() => setShowAuth(true)} className="font-mono-tech cursor-pointer hover:underline" style={{ fontSize: '10px', color: 'rgba(0,245,255,0.5)' }}>
                        Войти чтобы ответить
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Reply form */}
        {thread && !thread.isLocked && (
          <div className="rounded-xl p-5" style={{ background: 'rgba(0,245,255,0.03)', border: '1px solid rgba(0,245,255,0.15)' }}>
            <h3 className="font-orbitron font-bold text-white text-xs tracking-wider mb-3 flex items-center gap-2">
              <i className="ri-chat-new-line" style={{ color: '#00f5ff' }} />ВАШ ОТВЕТ
            </h3>
            {forumUser && forumUser.isApproved ? (
              <form onSubmit={handleReply} className="space-y-3">
                <textarea
                  ref={replyRef}
                  value={replyText}
                  onChange={e => setReplyText(e.target.value.slice(0, 5000))}
                  placeholder="Напишите ваш ответ... (максимум 5000 символов)"
                  rows={4}
                  required
                  maxLength={5000}
                  className="w-full rounded-lg px-4 py-3 font-rajdhani text-sm outline-none resize-none focus:ring-1 focus:ring-cyan-500/50"
                  style={{ background: 'rgba(0,245,255,0.04)', border: '1px solid rgba(0,245,255,0.2)', color: 'rgba(255,255,255,0.9)' }}
                />
                {replyText.length > 0 && (
                  <div className="text-right font-mono-tech text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    {replyText.length}/5000
                  </div>
                )}
                {msg && <p className="font-rajdhani text-sm" style={{ color: msg.ok ? '#4ade80' : '#ff006e' }}>{msg.text}</p>}
                <button 
                  type="submit" 
                  disabled={submitting || !replyText.trim()}
                  className="px-6 py-2.5 rounded-sm font-orbitron font-bold text-xs cursor-pointer disabled:opacity-50 whitespace-nowrap transition-all hover:scale-105"
                  style={{ background: 'rgba(0,245,255,0.12)', border: '1px solid rgba(0,245,255,0.4)', color: '#00f5ff' }}>
                  {submitting ? <><i className="ri-loader-4-line animate-spin mr-1" />Публикация...</> : 'Опубликовать ответ'}
                </button>
              </form>
            ) : (
              <div className="text-center py-4">
                <p className="font-rajdhani text-white/50 text-sm mb-3">
                  {forumUser ? (
                    pendingApproval || !forumUser.isApproved ? 'Ваш аккаунт ожидает одобрения администратора' : 'Войдите чтобы оставить ответ'
                  ) : 'Войдите чтобы оставить ответ'}
                </p>
                {!forumUser && (
                  <button 
                    onClick={() => setShowAuth(true)}
                    className="px-5 py-2.5 rounded-sm font-orbitron font-bold text-xs cursor-pointer whitespace-nowrap transition-all hover:scale-105"
                    style={{ background: 'rgba(0,245,255,0.1)', border: '1px solid rgba(0,245,255,0.4)', color: '#00f5ff' }}>
                    <i className="ri-login-box-line mr-1" />Войти / Зарегистрироваться
                  </button>
                )}
              </div>
            )}
          </div>
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

export default ThreadPage;