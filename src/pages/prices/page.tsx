import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ServicePriceCard from './components/ServicePriceCard';
import LoyaltyTable from './components/LoyaltyTable';
import PricesFAQ from './components/PricesFAQ';
import SchemaOrgPrices from './SchemaOrgPrices';
import PageMeta from '../../components/feature/PageMeta';

const PricesPage = () => {
  const [birthdayMode, setBirthdayMode] = useState(false);
  const navigate = useNavigate();

  const handleBook = (service?: string) => {
    navigate('/', { state: { openBooking: true, service } });
  };

  const services = [
    {
      icon: 'ri-vr-glasses-line',
      title: 'VR — Oculus Quest 2',
      subtitle: '40+ игр · 1 шлем',
      color: '#00f5ff',
      badge: 'ХИТ',
      bonus: '5 часов = 1 час в подарок (будни)',
      image:
        'https://readdy.ai/api/search-image?query=two%20players%20wearing%20Oculus%20Quest%202%20VR%20headsets%20in%20dark%20neon%20gaming%20room%20cyan%20blue%20ambient%20light%20smiling%20immersive%20virtual%20reality%20experience%20friends&width=600&height=320&seq=prices_vr01&orientation=landscape',
      rows: [
        { label: 'VR 30 минут', price: 400 },
        { label: 'VR 1 час', price: 800 },
        { label: 'VR 2 часа', price: 1600 },
        { label: 'VR 3 часа', price: 2400 },
        { label: 'VR 4 часа', price: 3200 },
      ],
      service: 'VR 1 час',
    },
    {
      icon: 'ri-vr-glasses-line',
      title: 'VR × 4 шлема',
      subtitle: 'Oculus Quest 2 · 4 шлема',
      color: '#00f5ff',
      bonus: '5 часов = 1 час в подарок (будни)',
      image:
        'https://readdy.ai/api/search-image?query=group%20four%20friends%20wearing%20VR%20headsets%20together%20dark%20neon%20gaming%20club%20room%20cyan%20blue%20neon%20lights%20laughing%20excited%20enjoying%20virtual%20reality%20experience%20party&width=600&height=320&seq=prices_vr4_02&orientation=landscape',
      rows: [
        { label: '4 шлема × 30 мин', price: 1600 },
        { label: '4 шлема × 1 час', price: 3200 },
        { label: '4 шлема × 2 часа', price: 6400 },
        { label: '4 шлема × 3 часа', price: 9600 },
      ],
      service: 'VR 1 час',
    },
    {
      icon: 'ri-steering-2-line',
      title: 'MOZA Racing',
      subtitle: 'Racing Simulator · 45+ трасс',
      color: '#ff006e',
      image:
        'https://readdy.ai/api/search-image?query=professional%20MOZA%20racing%20simulator%20cockpit%20seat%20steering%20wheel%20pedals%20dark%20room%20dramatic%20pink%20magenta%20neon%20lighting%20race%20track%20on%20monitor%20screen%20speed&width=600&height=320&seq=prices_moza03&orientation=landscape',
      rows: [
        { label: 'MOZA 15 минут', price: 300 },
        { label: 'MOZA 30 минут', price: 550 },
        { label: 'MOZA 1 час', price: 1000, note: '≈ 550 ₽ × 2 сессии' },
      ],
      service: 'MOZA 30 минут',
    },
    {
      icon: 'ri-gamepad-line',
      title: 'PlayStation 5',
      subtitle: '4K Gaming · 1 час',
      color: '#9b4dff',
      image:
        'https://readdy.ai/api/search-image?query=friends%20playing%20PlayStation%205%20video%20games%20on%20big%20screen%20TV%20dark%20lounge%20sofa%20purple%20violet%20neon%20ambient%20light%20laughing%20excited%20modern%20gaming%20room%20entertainment&width=600&height=320&seq=prices_ps5_04&orientation=landscape',
      rows: [
        { label: 'PlayStation 5 × 1 час', price: 350 },
        { label: 'PlayStation 5 × 2 часа', price: 700 },
        { label: 'PlayStation 5 × 3 часа', price: 1050 },
      ],
      service: 'PlayStation 5 — 1 час',
    },
    {
      icon: 'ri-building-2-line',
      title: 'Весь клуб',
      subtitle: '70 м² · до 12 человек',
      color: '#00f5ff',
      image:
        'https://readdy.ai/api/search-image?query=spacious%20modern%20VR%20gaming%20club%20interior%20wide%20angle%20view%20multiple%20stations%20dark%20room%20colorful%20neon%20lights%20premium%20entertainment%20venue%20full%20room%20party%20birthday&width=600&height=320&seq=prices_club05&orientation=landscape',
      rows: [
        { label: 'Аренда клуба × 1 час', price: 4750, note: '4 VR + PS5 + MOZA' },
        { label: 'Аренда клуба × 2 часа', price: 9500 },
        { label: 'Аренда клуба × 3 часа', price: 14250 },
      ],
      service: 'Аренда всего клуба',
    },
  ];

  return (
    <div style={{ background: '#010014', minHeight: '100vh' }}>
      <PageMeta
        title="Цены PARADOX VR CLUB Новосибирск — VR от 800 ₽/час, MOZA, PS5, Аренда клуба"
        description="Актуальные цены VR-клуба PARADOX в Новосибирске. VR 1 час — 800 ₽, 4 шлема — 3 200 ₽, MOZA Racing 30 мин — 550 ₽, PlayStation 5 — 350 ₽/ч, весь клуб — 4 750 ₽/ч. Скидка в день рождения −20%. Клубная карта от −5% до −20%."
        canonical="https://paradoxvr.ru/prices"
        keywords="цены VR клуб Новосибирск, стоимость VR Новосибирск, аренда VR шлем цена, MOZA Racing цена Новосибирск, день рождения VR цена"
      />
      <SchemaOrgPrices />

      {/* ── GLOBAL BG IMAGE (blurred) ── */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: 0 }}
      >
        <img
          src="https://readdy.ai/api/search-image?query=dark%20futuristic%20cyberpunk%20VR%20gaming%20room%20interior%20wide%20angle%20neon%20cyan%20magenta%20lights%20glowing%20panels%20immersive%20virtual%20reality%20club%20night%20atmosphere%20moody%20dramatic%20lighting&width=1920&height=1080&seq=prices_bg_hero_v3&orientation=landscape"
          alt=""
          className="w-full h-full object-cover object-center"
          style={{ filter: 'blur(14px) brightness(0.22) saturate(1.4)', transform: 'scale(1.06)' }}
        />
        {/* Deep overlay so text always readable */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg, rgba(1,0,20,0.72) 0%, rgba(0,10,30,0.6) 50%, rgba(1,0,20,0.82) 100%)' }} />
        {/* Subtle grid */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'linear-gradient(rgba(0,245,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(0,245,255,0.025) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Top nav */}
      <div
        className="sticky top-0 z-40 flex items-center justify-between px-4 md:px-8 h-16"
        style={{ background: 'rgba(1,0,20,0.98)', borderBottom: '1px solid rgba(0,245,255,0.12)', backdropFilter: 'blur(12px)' }}
      >
        <Link to="/" className="flex items-center gap-2 cursor-pointer group">
          <i className="ri-arrow-left-line text-sm transition-transform group-hover:-translate-x-1" style={{ color: '#00f5ff' }} />
          <span className="font-orbitron text-xs font-bold tracking-wider" style={{ color: '#00f5ff' }}>PARADOX VR CLUB</span>
        </Link>
        <div className="flex items-center gap-2">
          <i className="ri-price-tag-3-line text-xs" style={{ color: '#ff006e' }} />
          <span className="font-orbitron font-bold text-white tracking-widest" style={{ fontSize: '10px' }}>ПРАЙС-ЛИСТ</span>
        </div>
        <button
          onClick={() => handleBook()}
          className="btn-cyber-pink px-4 py-2 text-xs rounded-sm whitespace-nowrap hidden sm:block"
        >
          Записаться
        </button>
      </div>

      {/* Content */}
      <div className="relative z-10">

        {/* ─── HERO ─── */}
        <section className="relative py-16 md:py-24 px-4 overflow-hidden">
          {/* Glow blobs */}
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(0,245,255,0.06) 0%, transparent 70%)', transform: 'translate(-50%, -30%)' }} />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(255,0,110,0.06) 0%, transparent 70%)' }} />

          <div className="max-w-6xl mx-auto text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="h-px w-16" style={{ background: 'linear-gradient(90deg, transparent, rgba(0,245,255,0.6))' }} />
              <span className="font-mono-tech text-xs tracking-widest" style={{ color: '#00f5ff' }}>НОВОСИБИРСК · VR КЛУБ</span>
              <span className="h-px w-16" style={{ background: 'linear-gradient(90deg, rgba(0,245,255,0.6), transparent)' }} />
            </div>

            <h1
              className="font-orbitron font-black text-white mb-4 leading-tight"
              style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', textShadow: '0 0 60px rgba(0,245,255,0.15)' }}
            >
              Цены{' '}
              <span style={{ color: '#00f5ff' }}>PARADOX</span>{' '}
              VR CLUB
            </h1>
            <p className="font-rajdhani text-white/55 text-lg md:text-xl max-w-2xl mx-auto mb-2">
              VR Oculus Quest 2 от <strong className="text-white">800 ₽/час</strong> · MOZA Racing · PlayStation 5 · Аренда клуба до 12 человек
            </p>
            <p className="font-mono-tech text-xs mb-10" style={{ color: 'rgba(0,245,255,0.5)' }}>
              Новосибирск · ул. Виктора Шевелева, 24 · Ежедневно 12:00–22:00
            </p>

            {/* Stats row */}
            <div className="flex flex-wrap justify-center gap-4 mb-10">
              {[
                { value: '800 ₽', label: 'VR 1 час', color: '#00f5ff' },
                { value: '3 200 ₽', label: '4 шлема × 1 час', color: '#00f5ff' },
                { value: '−20%', label: 'скидка на ДР', color: '#ff006e' },
                { value: '5 уровней', label: 'клубной карты', color: '#f0c040' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="px-5 py-3 rounded-lg"
                  style={{ background: `${stat.color}08`, border: `1px solid ${stat.color}25` }}
                >
                  <div className="font-orbitron font-black text-xl" style={{ color: stat.color }}>{stat.value}</div>
                  <div className="font-rajdhani text-white/40 text-xs mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Birthday toggle */}
            <div
              className="inline-flex items-center gap-3 px-5 py-3 rounded-md cursor-pointer select-none transition-all duration-300 hover:scale-[1.02]"
              style={{
                border: `1px solid ${birthdayMode ? 'rgba(255,0,110,0.5)' : 'rgba(255,0,110,0.25)'}`,
                background: birthdayMode ? 'rgba(255,0,110,0.1)' : 'rgba(255,0,110,0.04)',
              }}
              onClick={() => setBirthdayMode(!birthdayMode)}
            >
              <div
                className="relative w-10 h-5 rounded-full transition-all duration-300 flex-shrink-0"
                style={{ background: birthdayMode ? '#ff006e' : 'rgba(255,255,255,0.1)' }}
              >
                <div
                  className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all duration-300"
                  style={{ left: birthdayMode ? '22px' : '2px' }}
                />
              </div>
              <span className="font-orbitron text-xs font-semibold whitespace-nowrap" style={{ color: birthdayMode ? '#ff006e' : 'rgba(255,255,255,0.5)' }}>
                🎂 Включить скидку на день рождения −20%
              </span>
              {birthdayMode && (
                <span
                  className="font-orbitron font-black text-xs px-2 py-0.5 rounded-sm"
                  style={{ background: '#ff006e', color: 'white' }}
                >
                  −20%
                </span>
              )}
            </div>
          </div>
        </section>

        {/* ─── SERVICE CARDS ─── */}
        <section className="px-4 pb-10">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-3">
                <span className="h-px w-12" style={{ background: 'linear-gradient(90deg, transparent, rgba(0,245,255,0.5))' }} />
                <span className="font-mono-tech text-xs tracking-widest" style={{ color: '#00f5ff' }}>УСЛУГИ И СТОИМОСТЬ</span>
                <span className="h-px w-12" style={{ background: 'linear-gradient(90deg, rgba(0,245,255,0.5), transparent)' }} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {services.map((s) => (
                <ServicePriceCard
                  key={s.title}
                  icon={s.icon}
                  title={s.title}
                  subtitle={s.subtitle}
                  color={s.color}
                  badge={s.badge}
                  bonus={s.bonus}
                  image={s.image}
                  rows={s.rows}
                  birthdayMode={birthdayMode}
                  onBook={() => handleBook(s.service)}
                />
              ))}
            </div>

            <div className="mt-8 text-center">
              <p className="font-mono-tech text-xs text-white/25">
                * Скидка на день рождения 20% действует ±3 дня от даты рождения при предъявлении документа · Не суммируется со скидкой клубной карты
              </p>
              <p className="font-rajdhani text-sm text-white/35 mt-2">
                Можно приходить со своей едой и напитками · Возраст от 6 лет (самостоятельно с 10 лет) · Бесплатная парковка
              </p>
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="max-w-6xl mx-auto px-4">
          <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(0,245,255,0.2), transparent)' }} />
        </div>

        {/* ─── LOYALTY TABLE ─── */}
        <LoyaltyTable vrPricePerHour={800} />

        {/* Divider */}
        <div className="max-w-6xl mx-auto px-4">
          <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(0,245,255,0.2), transparent)' }} />
        </div>

        {/* ─── FAQ ─── */}
        <PricesFAQ />

        {/* ─── CTA ─── */}
        <section className="py-16 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div
              className="relative rounded-lg px-8 py-12 overflow-hidden"
              style={{ background: 'rgba(0,245,255,0.04)', border: '1px solid rgba(0,245,255,0.2)' }}
            >
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(0,245,255,0.08) 0%, transparent 70%)' }}
              />
              <div className="relative z-10">
                <div className="w-14 h-14 flex items-center justify-center rounded-sm mx-auto mb-6" style={{ background: 'rgba(0,245,255,0.12)', border: '1px solid rgba(0,245,255,0.35)' }}>
                  <i className="ri-calendar-check-line text-2xl" style={{ color: '#00f5ff' }} />
                </div>
                <h2 className="font-orbitron font-black text-white text-2xl mb-3">Готовы к игре?</h2>
                <p className="font-rajdhani text-white/50 text-lg mb-8">
                  Запишитесь онлайн за пару минут — мы подтвердим время и ответим на любые вопросы
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => handleBook()}
                    className="btn-cyber-pink px-8 py-3 text-sm rounded-sm whitespace-nowrap font-orbitron font-bold"
                  >
                    Записаться онлайн
                  </button>
                  <a
                    href="https://t.me/VRClubParadox"
                    target="_blank"
                    rel="noopener nofollow"
                    className="flex items-center justify-center gap-2 px-8 py-3 text-sm rounded-sm whitespace-nowrap font-orbitron font-bold transition-all hover:scale-[1.02] cursor-pointer"
                    style={{ border: '1px solid rgba(0,245,255,0.3)', color: '#00f5ff', background: 'rgba(0,245,255,0.05)' }}
                  >
                    <i className="ri-telegram-line" />
                    Написать в Telegram
                  </a>
                </div>
                <p className="font-mono-tech text-xs mt-6 text-white/25">
                  +7 923 244-02-20 · Ежедневно 12:00–22:00
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer nav */}
        <div className="px-4 pb-12">
          <div className="max-w-6xl mx-auto flex flex-wrap justify-center gap-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2 font-orbitron text-xs px-6 py-2.5 rounded-sm cursor-pointer transition-all hover:scale-105 whitespace-nowrap"
              style={{ border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)' }}
            >
              <i className="ri-home-3-line" />
              Главная
            </Link>
            <Link
              to="/games"
              className="inline-flex items-center gap-2 font-orbitron text-xs px-6 py-2.5 rounded-sm cursor-pointer transition-all hover:scale-105 whitespace-nowrap"
              style={{ border: '1px solid rgba(155,77,255,0.3)', color: '#9b4dff' }}
            >
              <i className="ri-gamepad-line" />
              Игры
            </Link>
            <Link
              to="/loyalty"
              className="inline-flex items-center gap-2 font-orbitron text-xs px-6 py-2.5 rounded-sm cursor-pointer transition-all hover:scale-105 whitespace-nowrap"
              style={{ border: '1px solid rgba(0,245,255,0.3)', color: '#00f5ff' }}
            >
              <i className="ri-vip-crown-line" />
              Клубная карта
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricesPage;
