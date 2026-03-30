import { useState, useEffect, useRef } from 'react';

const reviews = [
  {
    id: 1,
    name: 'Алексей К.',
    avatar: 'А',
    color: '#00f5ff',
    rating: 5,
    date: 'Март 2026',
    tag: 'Корпоратив',
    text: 'Брали клуб на корпоратив — 8 человек. Всё организовали идеально, ребята помогли с выбором игр, объяснили всё новичкам. Эмоции — зашкаливают! Гречневый шутер Half-Life Alyx разнёс всем мозг. Однозначно вернёмся!',
  },
  {
    id: 2,
    name: 'Мария В.',
    avatar: 'М',
    color: '#ff006e',
    rating: 5,
    date: 'Февраль 2026',
    tag: 'День рождения',
    text: 'Подарили мужу сертификат на день рождения — он в восторге! Провели 2 часа и хотели ещё. Персонал очень дружелюбный, помогли во всём. Оборудование топовое, картинка в VR просто нереальная. Рекомендую всем!',
  },
  {
    id: 3,
    name: 'Дмитрий Л.',
    avatar: 'Д',
    color: '#9b4dff',
    rating: 5,
    date: 'Январь 2026',
    tag: 'С семьёй',
    text: 'Пришли с детьми 8 и 11 лет — обоим очень понравилось. Дети играли в Beat Saber и не хотели уходить. Хорошие условия, чисто, комфортно. Персонал терпелив и внимателен к детям. Придём снова летом!',
  },
  {
    id: 4,
    name: 'Сергей Н.',
    avatar: 'С',
    color: '#00f5ff',
    rating: 5,
    date: 'Март 2026',
    tag: 'Регулярный гость',
    text: 'Хожу уже год, почти каждый месяц. Оборудование всегда в отличном состоянии, постоянно появляются новые игры. Программа лояльности реально приятная. Paradox — лучший VR-клуб Новосибирска, без вариантов.',
  },
  {
    id: 5,
    name: 'Анна Т.',
    avatar: 'А',
    color: '#ff006e',
    rating: 5,
    date: 'Февраль 2026',
    tag: 'Первый раз',
    text: 'Первый раз в VR — и сразу влюбилась! Думала будет страшно и неудобно, но всё оказалось супер просто. Администратор терпеливо объяснил всё от А до Я. Играли в Superhot VR и Arizona Sunshine — невероятные ощущения!',
  },
  {
    id: 6,
    name: 'Игорь М.',
    avatar: 'И',
    color: '#9b4dff',
    rating: 5,
    date: 'Январь 2026',
    tag: 'Команда',
    text: 'Пришли компанией 6 человек, играли в мультиплеер Propagation. Адреналин зашкаливал — кто-то кричал, кто-то смеялся. Такого командного опыта нигде больше не получишь. Уже договорились на следующий поход!',
  },
  {
    id: 7,
    name: 'Екатерина Р.',
    avatar: 'Е',
    color: '#00f5ff',
    rating: 5,
    date: 'Декабрь 2025',
    tag: 'Подарок',
    text: 'Подарила подруге сертификат — она потом позвонила и сказала что это лучший подарок за год! Оформление на сайте простое, код пришёл быстро. Всё профессионально и приятно. Спасибо команде Paradox!',
  },
  {
    id: 8,
    name: 'Роман Б.',
    avatar: 'Р',
    color: '#ff006e',
    rating: 5,
    date: 'Ноябрь 2025',
    tag: 'Геймер',
    text: 'Я заядлый геймер — думал VR меня не удивит. Был неправ. Физическое погружение совсем другое. Half-Life Alyx на шлеме с отслеживанием рук — это вообще другой уровень. Хожу теперь раз в 2 недели.',
  },
];

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex gap-0.5">
    {[1,2,3,4,5].map(i => (
      <i key={i} className={`ri-star-${i <= rating ? 'fill' : 'line'} text-sm`} style={{ color: '#f59e0b' }} />
    ))}
  </div>
);

const Reviews = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const visibleCount = 3;
  const total = reviews.length;

  const goTo = (index: number) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setActiveIndex(index);
    setTimeout(() => setIsAnimating(false), 400);
  };

  const next = () => goTo((activeIndex + 1) % total);
  const prev = () => goTo((activeIndex - 1 + total) % total);

  useEffect(() => {
    if (paused) return;
    timerRef.current = setInterval(next, 4500);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [activeIndex, paused]);

  const getVisible = () => {
    const result = [];
    for (let i = 0; i < visibleCount; i++) {
      result.push(reviews[(activeIndex + i) % total]);
    }
    return result;
  };

  return (
    <section id="reviews" className="relative py-20 px-4 overflow-hidden">
      {/* bg glow */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 50% at 50% 50%, rgba(155,77,255,0.06) 0%, transparent 70%)' }} />

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="tag-line" />
            <span className="font-mono-tech text-xs tracking-widest" style={{ color: '#9b4dff' }}>ОТЗЫВЫ</span>
            <span className="tag-line" />
          </div>
          <h2 className="section-title text-white mb-3">Что говорят наши гости</h2>
          <p className="text-white/50 font-rajdhani text-lg mb-6">Реальные впечатления реальных людей</p>

          {/* Stats */}
          <div className="inline-flex flex-wrap justify-center items-center gap-4 md:gap-6 px-5 md:px-8 py-4 rounded-lg" style={{ background: 'rgba(155,77,255,0.08)', border: '1px solid rgba(155,77,255,0.25)' }}>
            <div className="text-center">
              <div className="font-orbitron font-black text-3xl" style={{ color: '#f59e0b' }}>4.8</div>
              <div className="flex justify-center mt-1">
                <StarRating rating={5} />
              </div>
              <div className="font-mono-tech text-xs text-white/40 mt-1">Рейтинг на 2ГИС</div>
            </div>
            <div className="w-px h-12 bg-white/10 hidden sm:block" />
            <div className="text-center">
              <div className="font-orbitron font-black text-3xl" style={{ color: '#00f5ff' }}>119+</div>
              <div className="font-mono-tech text-xs text-white/40 mt-2">Отзывов на 2ГИС</div>
            </div>
            <div className="w-px h-12 bg-white/10 hidden sm:block" />
            <div className="text-center">
              <div className="font-orbitron font-black text-3xl" style={{ color: '#ff006e' }}>500+</div>
              <div className="font-mono-tech text-xs text-white/40 mt-2">Довольных гостей</div>
            </div>
          </div>
        </div>

        {/* Cards */}
        <div
          className="relative"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className={`grid grid-cols-1 md:grid-cols-3 gap-5 transition-opacity duration-400 ${isAnimating ? 'opacity-60' : 'opacity-100'}`}>
            {getVisible().map((review, idx) => (
              <article
                key={`${review.id}-${activeIndex}`}
                className="cyber-card rounded-lg p-6 relative overflow-hidden flex flex-col"
                style={{
                  borderColor: `${review.color}25`,
                  transform: idx === 1 ? 'translateY(-6px)' : 'none',
                  transition: 'transform 0.3s ease',
                }}
              >
                {/* Quote icon */}
                <div className="absolute top-4 right-5 font-orbitron text-5xl font-black leading-none select-none" style={{ color: `${review.color}15` }}>"</div>

                {/* Tag */}
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm mb-4 w-fit" style={{ background: `${review.color}15`, border: `1px solid ${review.color}30` }}>
                  <i className="ri-price-tag-3-line text-xs" style={{ color: review.color }} />
                  <span className="font-mono-tech text-xs" style={{ color: review.color }}>{review.tag}</span>
                </div>

                {/* Stars */}
                <div className="mb-3">
                  <StarRating rating={review.rating} />
                </div>

                {/* Text */}
                <p className="font-rajdhani text-white/70 text-base leading-relaxed flex-1 mb-5">
                  "{review.text}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-3 pt-4" style={{ borderTop: `1px solid ${review.color}15` }}>
                  <div className="w-9 h-9 flex items-center justify-center rounded-full font-orbitron font-black text-sm flex-shrink-0" style={{ background: `${review.color}20`, border: `1px solid ${review.color}40`, color: review.color }}>
                    {review.avatar}
                  </div>
                  <div>
                    <div className="font-orbitron text-xs font-bold text-white/80">{review.name}</div>
                    <div className="font-mono-tech text-xs text-white/30">{review.date}</div>
                  </div>
                  <div className="ml-auto w-5 h-5 flex items-center justify-center">
                    <i className="ri-verified-badge-fill text-base" style={{ color: review.color }} />
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${review.color}50, transparent)` }} />
              </article>
            ))}
          </div>

          {/* Nav arrows */}
          <button
            onClick={prev}
            className="absolute -left-5 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full transition-all hover:scale-110 cursor-pointer hidden lg:flex"
            style={{ background: 'rgba(155,77,255,0.15)', border: '1px solid rgba(155,77,255,0.35)', color: '#9b4dff' }}
          >
            <i className="ri-arrow-left-s-line text-xl" />
          </button>
          <button
            onClick={next}
            className="absolute -right-5 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full transition-all hover:scale-110 cursor-pointer hidden lg:flex"
            style={{ background: 'rgba(155,77,255,0.15)', border: '1px solid rgba(155,77,255,0.35)', color: '#9b4dff' }}
          >
            <i className="ri-arrow-right-s-line text-xl" />
          </button>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-8">
          {reviews.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className="transition-all duration-300 rounded-full cursor-pointer"
              style={{
                width: i === activeIndex ? '24px' : '8px',
                height: '8px',
                background: i === activeIndex ? '#9b4dff' : 'rgba(255,255,255,0.2)',
              }}
            />
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-10">
          <p className="font-rajdhani text-white/40 text-sm">
            119 отзывов на 2ГИС · Рейтинг 4.8 ★ · Присоединяйся!
          </p>
        </div>
      </div>
    </section>
  );
};

export default Reviews;
