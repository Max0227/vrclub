import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

export interface ForumUser {
  id: string;
  email: string;
  username: string;
  isApproved: boolean;
  postsCount: number;
  threadsCount: number;
  likesReceived: number;
  avatarColor: string;
  bio: string | null;
  role: string;
  cardNumber: string | null;
  createdAt: string;
}

export interface ForumCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  threadCount: number;
  postCount: number;
}

export interface ForumThread {
  id: string;
  categoryId: number;
  categorySlug: string;
  title: string;
  content: string;
  authorId: string | null;
  authorName: string;
  authorColor: string;
  views: number;
  postCount: number;
  isPinned: boolean;
  isLocked: boolean;
  lastPostAt: string;
  lastPostAuthor: string | null;
  createdAt: string;
}

export interface ForumPost {
  id: string;
  threadId: string;
  authorId: string | null;
  authorName: string;
  authorColor: string;
  content: string;
  likes: number;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  likedByMe?: boolean;
}

const FORUM_USER_KEY = 'paradox_forum_user_v1';

const mapForumUser = (row: Record<string, unknown>): ForumUser => ({
  id: row.id as string,
  email: row.email as string,
  username: row.username as string,
  isApproved: row.is_approved as boolean,
  postsCount: (row.posts_count as number) ?? 0,
  threadsCount: (row.threads_count as number) ?? 0,
  likesReceived: (row.likes_received as number) ?? 0,
  avatarColor: (row.avatar_color as string) ?? '#00f5ff',
  bio: row.bio as string | null,
  role: (row.role as string) ?? 'member',
  cardNumber: row.card_number as string | null,
  createdAt: row.created_at as string,
});

const SUPABASE_URL = import.meta.env.VITE_PUBLIC_SUPABASE_URL as string;

export const useForum = () => {
  const [forumUser, setForumUser] = useState<ForumUser | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(FORUM_USER_KEY);
    if (!stored) { setLoadingAuth(false); return; }
    try {
      setForumUser(JSON.parse(stored) as ForumUser);
    } catch {
      localStorage.removeItem(FORUM_USER_KEY);
    }
    setLoadingAuth(false);
  }, []);

  const refreshForumUser = useCallback(async (id: string) => {
    const { data } = await supabase.from('forum_users').select('*').eq('id', id).maybeSingle();
    if (data) {
      const user = mapForumUser(data as Record<string, unknown>);
      setForumUser(user);
      localStorage.setItem(FORUM_USER_KEY, JSON.stringify(user));
    }
  }, []);

  // Login with loyalty card credentials (phone + password)
  const loginWithCard = useCallback(async (
    phone: string,
    password: string,
  ): Promise<{ success: boolean; message: string; status?: 'pending' | 'approved'; user?: ForumUser }> => {
    const normalizedPhone = phone.replace(/[\s\-\(\)]/g, '');
    // Check loyalty card — fetch by phone or email first, then compare password client-side
    let cardRow: Record<string, unknown> | null = null;
    const { data: byPhone } = await supabase
      .from('loyalty_cards')
      .select('card_number, name, email, phone, password')
      .eq('phone', normalizedPhone)
      .maybeSingle();
    if (byPhone && (byPhone as Record<string, unknown>).password === password) {
      cardRow = byPhone as Record<string, unknown>;
    }

    if (!cardRow) {
      const { data: byEmail } = await supabase
        .from('loyalty_cards')
        .select('card_number, name, email, phone, password')
        .eq('email', phone.toLowerCase().trim())
        .maybeSingle();
      if (byEmail && (byEmail as Record<string, unknown>).password === password) {
        cardRow = byEmail as Record<string, unknown>;
      }
    }

    if (!cardRow) return { success: false, message: 'Неверный телефон/email или пароль клубной карты' };

    // Check if forum user exists for this card
    const { data: existingForumUser } = await supabase
      .from('forum_users')
      .select('*')
      .eq('card_number', cardRow.card_number as string)
      .maybeSingle();

    if (existingForumUser) {
      const user = mapForumUser(existingForumUser as Record<string, unknown>);
      if (!user.isApproved) {
        return { success: false, message: 'Ваша заявка ожидает одобрения администратора', status: 'pending' };
      }
      setForumUser(user);
      localStorage.setItem(FORUM_USER_KEY, JSON.stringify(user));
      return { success: true, message: `Добро пожаловать, ${user.username}!`, user };
    }

    // Create pending forum user
    const email = (cardRow.email as string) || `${(cardRow.card_number as string).toLowerCase()}@paradoxvr.ru`;
    const username = cardRow.name as string;
    const avatarColors = ['#00f5ff', '#c084fc', '#f59e0b', '#4ade80', '#ff006e', '#ffd700'];
    const avatarColor = avatarColors[Math.floor(Math.random() * avatarColors.length)];

    const { data: newUser, error } = await supabase
      .from('forum_users')
      .insert({
        card_number: cardRow.card_number as string,
        email,
        username,
        is_approved: false,
        avatar_color: avatarColor,
      })
      .select('*')
      .maybeSingle();

    if (error) return { success: false, message: 'Ошибка создания аккаунта форума' };

    // Notify admin
    try {
      await fetch(`${SUPABASE_URL}/functions/v1/send-forum-registration`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          email,
          cardNumber: cardRow.card_number as string,
          phone: cardRow.phone as string,
        }),
      });
    } catch { /* silent */ }

    if (newUser) {
      const user = mapForumUser(newUser as Record<string, unknown>);
      localStorage.setItem(FORUM_USER_KEY, JSON.stringify(user));
    }

    return { success: true, message: 'Заявка отправлена! Ожидайте одобрения администратора', status: 'pending' };
  }, []);

  // Register with email (not loyalty card)
  const registerEmail = useCallback(async (
    username: string,
    email: string,
    password: string,
  ): Promise<{ success: boolean; message: string }> => {
    const { data: existing } = await supabase
      .from('forum_users')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle();
    if (existing) return { success: false, message: 'Этот email уже зарегистрирован' };

    const avatarColors = ['#00f5ff', '#c084fc', '#f59e0b', '#4ade80', '#ff006e'];
    const avatarColor = avatarColors[Math.floor(Math.random() * avatarColors.length)];

    const { error } = await supabase.from('forum_users').insert({
      email: email.toLowerCase().trim(),
      username: username.trim(),
      password,
      is_approved: false,
      avatar_color: avatarColor,
    });

    if (error) return { success: false, message: 'Ошибка регистрации. Попробуйте ещё раз.' };

    try {
      await fetch(`${SUPABASE_URL}/functions/v1/send-forum-registration`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, cardNumber: null, phone: null }),
      });
    } catch { /* silent */ }

    return { success: true, message: 'Заявка отправлена! Ожидайте одобрения администратора.' };
  }, []);

  // Login with email+password (for non-card users)
  const loginEmail = useCallback(async (
    email: string,
    password: string,
  ): Promise<{ success: boolean; message: string; status?: 'pending'; user?: ForumUser }> => {
    // Fetch user by email first, then compare password client-side
    // (Supabase anon key may block server-side password filtering)
    const { data } = await supabase
      .from('forum_users')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle();
    if (!data) return { success: false, message: 'Неверный email или пароль' };

    // Compare password client-side
    const storedPassword = (data as Record<string, unknown>).password as string | null;
    if (!storedPassword || storedPassword !== password) {
      return { success: false, message: 'Неверный email или пароль' };
    }

    const user = mapForumUser(data as Record<string, unknown>);
    if (!user.isApproved) {
      return { success: false, message: 'Ваша заявка ожидает одобрения администратора', status: 'pending' };
    }
    setForumUser(user);
    localStorage.setItem(FORUM_USER_KEY, JSON.stringify(user));
    return { success: true, message: `Добро пожаловать, ${user.username}!`, user };
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(FORUM_USER_KEY);
    setForumUser(null);
  }, []);

  const setForumUserExternal = useCallback((user: ForumUser) => {
    setForumUser(user);
    localStorage.setItem(FORUM_USER_KEY, JSON.stringify(user));
  }, []);

  // Fetch categories
  const fetchCategories = useCallback(async (): Promise<ForumCategory[]> => {
    const { data } = await supabase
      .from('forum_categories')
      .select('*')
      .order('sort_order');
    return (data || []).map((r) => ({
      id: r.id as number,
      name: r.name as string,
      slug: r.slug as string,
      description: r.description as string,
      icon: r.icon as string,
      color: r.color as string,
      threadCount: (r.thread_count as number) ?? 0,
      postCount: (r.post_count as number) ?? 0,
    }));
  }, []);

  // Fetch threads for a category
  const fetchThreads = useCallback(async (categorySlug: string): Promise<ForumThread[]> => {
    const { data } = await supabase
      .from('forum_threads')
      .select('*')
      .eq('category_slug', categorySlug)
      .order('is_pinned', { ascending: false })
      .order('last_post_at', { ascending: false });
    return (data || []).map((r) => ({
      id: r.id as string,
      categoryId: r.category_id as number,
      categorySlug: r.category_slug as string,
      title: r.title as string,
      content: r.content as string,
      authorId: r.author_id as string | null,
      authorName: r.author_name as string,
      authorColor: r.author_color as string,
      views: (r.views as number) ?? 0,
      postCount: (r.post_count as number) ?? 1,
      isPinned: r.is_pinned as boolean,
      isLocked: r.is_locked as boolean,
      lastPostAt: r.last_post_at as string,
      lastPostAuthor: r.last_post_author as string | null,
      createdAt: r.created_at as string,
    }));
  }, []);

  // Fetch recent threads across all categories
  const fetchRecentThreads = useCallback(async (limit = 10): Promise<ForumThread[]> => {
    const { data } = await supabase
      .from('forum_threads')
      .select('*')
      .order('last_post_at', { ascending: false })
      .limit(limit);
    return (data || []).map((r) => ({
      id: r.id as string,
      categoryId: r.category_id as number,
      categorySlug: r.category_slug as string,
      title: r.title as string,
      content: r.content as string,
      authorId: r.author_id as string | null,
      authorName: r.author_name as string,
      authorColor: (r.author_color as string) ?? '#00f5ff',
      views: (r.views as number) ?? 0,
      postCount: (r.post_count as number) ?? 1,
      isPinned: r.is_pinned as boolean,
      isLocked: r.is_locked as boolean,
      lastPostAt: r.last_post_at as string,
      lastPostAuthor: r.last_post_author as string | null,
      createdAt: r.created_at as string,
    }));
  }, []);

  // Fetch single thread with posts
  const fetchThread = useCallback(async (threadId: string): Promise<{
    thread: ForumThread | null;
    posts: ForumPost[];
  }> => {
    const [{ data: threadData }, { data: postsData }] = await Promise.all([
      supabase.from('forum_threads').select('*').eq('id', threadId).maybeSingle(),
      supabase.from('forum_posts').select('*').eq('thread_id', threadId).eq('is_deleted', false).order('created_at'),
    ]);

    if (!threadData) return { thread: null, posts: [] };

    // Increment views
    supabase.from('forum_threads').update({ views: ((threadData.views as number) ?? 0) + 1 }).eq('id', threadId).then(() => {});

    const thread: ForumThread = {
      id: threadData.id as string,
      categoryId: threadData.category_id as number,
      categorySlug: threadData.category_slug as string,
      title: threadData.title as string,
      content: threadData.content as string,
      authorId: threadData.author_id as string | null,
      authorName: threadData.author_name as string,
      authorColor: (threadData.author_color as string) ?? '#00f5ff',
      views: (threadData.views as number) ?? 0,
      postCount: (threadData.post_count as number) ?? 1,
      isPinned: threadData.is_pinned as boolean,
      isLocked: threadData.is_locked as boolean,
      lastPostAt: threadData.last_post_at as string,
      lastPostAuthor: threadData.last_post_author as string | null,
      createdAt: threadData.created_at as string,
    };

    // Get likes by current user
    let likedPostIds: string[] = [];
    if (forumUser) {
      const { data: likesData } = await supabase
        .from('forum_post_likes')
        .select('post_id')
        .eq('user_id', forumUser.id);
      likedPostIds = (likesData || []).map((l) => l.post_id as string);
    }

    const posts: ForumPost[] = (postsData || []).map((r) => ({
      id: r.id as string,
      threadId: r.thread_id as string,
      authorId: r.author_id as string | null,
      authorName: r.author_name as string,
      authorColor: (r.author_color as string) ?? '#00f5ff',
      content: r.content as string,
      likes: (r.likes as number) ?? 0,
      isDeleted: r.is_deleted as boolean,
      createdAt: r.created_at as string,
      updatedAt: r.updated_at as string,
      likedByMe: likedPostIds.includes(r.id as string),
    }));

    return { thread, posts };
  }, [forumUser]);

  // Create new thread
  const createThread = useCallback(async (
    categoryId: number,
    categorySlug: string,
    title: string,
    content: string,
  ): Promise<{ success: boolean; message: string; threadId?: string }> => {
    if (!forumUser || !forumUser.isApproved) {
      return { success: false, message: 'Нет доступа' };
    }
    const { data, error } = await supabase.from('forum_threads').insert({
      category_id: categoryId,
      category_slug: categorySlug,
      title: title.trim(),
      content: content.trim(),
      author_id: forumUser.id,
      author_name: forumUser.username,
      author_color: forumUser.avatarColor,
      last_post_author: forumUser.username,
    }).select('id').maybeSingle();

    if (error || !data) return { success: false, message: 'Ошибка создания темы' };

    // Update user stats
    await supabase.from('forum_users').update({ threads_count: forumUser.threadsCount + 1 }).eq('id', forumUser.id);
    await refreshForumUser(forumUser.id);

    // Update category counter
    await supabase.rpc('increment_category_thread', { cat_slug: categorySlug }).catch(() => {});

    return { success: true, message: 'Тема создана!', threadId: data.id as string };
  }, [forumUser, refreshForumUser]);

  // Reply to thread
  const replyThread = useCallback(async (
    threadId: string,
    content: string,
  ): Promise<{ success: boolean; message: string }> => {
    if (!forumUser || !forumUser.isApproved) {
      return { success: false, message: 'Нет доступа' };
    }
    const { error } = await supabase.from('forum_posts').insert({
      thread_id: threadId,
      author_id: forumUser.id,
      author_name: forumUser.username,
      author_color: forumUser.avatarColor,
      content: content.trim(),
    });

    if (error) return { success: false, message: 'Ошибка публикации' };

    // Update thread
    const { data: threadData } = await supabase.from('forum_threads').select('post_count').eq('id', threadId).maybeSingle();
    const currentCount = (threadData?.post_count as number) ?? 1;
    await supabase.from('forum_threads').update({
      post_count: currentCount + 1,
      last_post_at: new Date().toISOString(),
      last_post_author: forumUser.username,
    }).eq('id', threadId);

    // Update user stats
    await supabase.from('forum_users').update({ posts_count: forumUser.postsCount + 1 }).eq('id', forumUser.id);
    await refreshForumUser(forumUser.id);

    return { success: true, message: 'Ответ добавлен!' };
  }, [forumUser, refreshForumUser]);

  // Toggle like on post
  const toggleLike = useCallback(async (postId: string, currentLikes: number, likedByMe: boolean): Promise<boolean> => {
    if (!forumUser || !forumUser.isApproved) return false;
    if (likedByMe) {
      await supabase.from('forum_post_likes').delete().eq('post_id', postId).eq('user_id', forumUser.id);
      await supabase.from('forum_posts').update({ likes: Math.max(0, currentLikes - 1) }).eq('id', postId);
    } else {
      await supabase.from('forum_post_likes').insert({ post_id: postId, user_id: forumUser.id });
      await supabase.from('forum_posts').update({ likes: currentLikes + 1 }).eq('id', postId);

      // Update author likes
      const { data: postData } = await supabase.from('forum_posts').select('author_id').eq('id', postId).maybeSingle();
      if (postData?.author_id) {
        const { data: authorData } = await supabase.from('forum_users').select('likes_received').eq('id', postData.author_id as string).maybeSingle();
        const currentLikesReceived = (authorData?.likes_received as number) ?? 0;
        await supabase.from('forum_users').update({ likes_received: currentLikesReceived + 1 }).eq('id', postData.author_id as string);
      }
    }
    return true;
  }, [forumUser]);

  // Get top users
  const fetchTopUsers = useCallback(async (limit = 10): Promise<ForumUser[]> => {
    const { data } = await supabase
      .from('forum_users')
      .select('*')
      .eq('is_approved', true)
      .order('posts_count', { ascending: false })
      .limit(limit);
    return (data || []).map((r) => mapForumUser(r as Record<string, unknown>));
  }, []);

  return {
    forumUser,
    loadingAuth,
    setForumUserExternal,
    loginWithCard,
    loginEmail,
    registerEmail,
    logout,
    fetchCategories,
    fetchThreads,
    fetchRecentThreads,
    fetchThread,
    createThread,
    replyThread,
    toggleLike,
    fetchTopUsers,
    refreshForumUser,
  };
};
