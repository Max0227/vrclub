import { useEffect } from 'react';

const siteUrl = import.meta.env.VITE_SITE_URL ?? 'https://paradoxvr.ru';

const webPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Цены PARADOX VR CLUB Новосибирск — VR от 800 ₽/час, MOZA, PS5, Аренда клуба',
  description:
    'Актуальные цены VR-клуба PARADOX в Новосибирске. VR 1 час — 800 ₽, 4 шлема — 3 200 ₽, MOZA Racing 30 мин — 550 ₽, PlayStation 5 — 350 ₽/ч, весь клуб — 4 750 ₽/ч. Скидка в день рождения 20%. Клубная карта от −5% до −20%.',
  url: `${siteUrl}/prices`,
  isPartOf: {
    '@type': 'WebSite',
    name: 'PARADOX VR CLUB',
    url: siteUrl,
  },
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Главная', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Цены', item: `${siteUrl}/prices` },
    ],
  },
};

const offerCatalogSchema = {
  '@context': 'https://schema.org',
  '@type': 'OfferCatalog',
  name: 'Прайс-лист PARADOX VR CLUB',
  url: `${siteUrl}/prices`,
  provider: {
    '@type': 'EntertainmentBusiness',
    name: 'PARADOX VR CLUB',
    url: siteUrl,
    telephone: '+7-923-244-02-20',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'ул. Виктора Шевелева, 24',
      addressLocality: 'Новосибирск',
      addressCountry: 'RU',
    },
  },
  itemListElement: [
    {
      '@type': 'Offer',
      name: 'VR 30 минут (1 шлем Oculus Quest 2)',
      description: 'Виртуальная реальность на 30 минут, 1 шлем Oculus Quest 2, 40+ игр',
      price: '400',
      priceCurrency: 'RUB',
      eligibleDuration: { '@type': 'QuantitativeValue', value: 30, unitCode: 'MIN' },
      availability: 'https://schema.org/InStock',
    },
    {
      '@type': 'Offer',
      name: 'VR 1 час (1 шлем Oculus Quest 2)',
      description: 'Виртуальная реальность на 1 час, 1 шлем Oculus Quest 2, 40+ игр',
      price: '800',
      priceCurrency: 'RUB',
      eligibleDuration: { '@type': 'QuantitativeValue', value: 1, unitCode: 'HUR' },
      availability: 'https://schema.org/InStock',
    },
    {
      '@type': 'Offer',
      name: 'VR 2 часа (1 шлем Oculus Quest 2)',
      description: 'Виртуальная реальность на 2 часа, 1 шлем Oculus Quest 2',
      price: '1600',
      priceCurrency: 'RUB',
      eligibleDuration: { '@type': 'QuantitativeValue', value: 2, unitCode: 'HUR' },
      availability: 'https://schema.org/InStock',
    },
    {
      '@type': 'Offer',
      name: '4 VR шлема × 1 час (Oculus Quest 2)',
      description: '4 шлема Oculus Quest 2 на 1 час — для компании до 4 человек',
      price: '3200',
      priceCurrency: 'RUB',
      eligibleDuration: { '@type': 'QuantitativeValue', value: 1, unitCode: 'HUR' },
      availability: 'https://schema.org/InStock',
    },
    {
      '@type': 'Offer',
      name: 'MOZA Racing Simulator 15 минут',
      description: 'Гоночный симулятор MOZA R5 — 15 минут, 45+ трасс',
      price: '300',
      priceCurrency: 'RUB',
      eligibleDuration: { '@type': 'QuantitativeValue', value: 15, unitCode: 'MIN' },
      availability: 'https://schema.org/InStock',
    },
    {
      '@type': 'Offer',
      name: 'MOZA Racing Simulator 30 минут',
      description: 'Гоночный симулятор MOZA R5 — 30 минут, 45+ трасс',
      price: '550',
      priceCurrency: 'RUB',
      eligibleDuration: { '@type': 'QuantitativeValue', value: 30, unitCode: 'MIN' },
      availability: 'https://schema.org/InStock',
    },
    {
      '@type': 'Offer',
      name: 'PlayStation 5 — 1 час',
      description: 'Игровая консоль PlayStation 5 в клубе PARADOX — 1 час',
      price: '350',
      priceCurrency: 'RUB',
      eligibleDuration: { '@type': 'QuantitativeValue', value: 1, unitCode: 'HUR' },
      availability: 'https://schema.org/InStock',
    },
    {
      '@type': 'Offer',
      name: 'Аренда всего клуба (до 12 человек) — 1 час',
      description: 'Весь клуб PARADOX VR CLUB — 70 м², 4 VR шлема, PS5, MOZA, до 12 человек',
      price: '4750',
      priceCurrency: 'RUB',
      eligibleDuration: { '@type': 'QuantitativeValue', value: 1, unitCode: 'HUR' },
      availability: 'https://schema.org/InStock',
    },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Сколько стоит 1 час VR в Новосибирске?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '1 шлем Oculus Quest 2 на 1 час — 800 ₽. В день рождения скидка 20%: 640 ₽.',
      },
    },
    {
      '@type': 'Question',
      name: 'Сколько стоит аренда VR-клуба на день рождения в Новосибирске?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Аренда всего клуба PARADOX (до 12 человек, 70 м²): обычная цена 4 750 ₽/час, в день рождения — 3 800 ₽/час (скидка 20%). Включает 4 VR-шлема, PlayStation 5, MOZA Racing Simulator.',
      },
    },
    {
      '@type': 'Question',
      name: 'Как получить бесплатный час VR?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'За каждые 5 часов VR-игры в будни начисляется 1 час в подарок. Также 10 часов MOZA Racing = 2 часа VR бесплатно.',
      },
    },
    {
      '@type': 'Question',
      name: 'Какие скидки даёт клубная карта?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Стандартная карта (с регистрации) — −5%, Серебряная (20ч VR) — −7%, Золотая (40ч) — −10%, Платиновая (60ч) — −12%, CYBER (100ч) — −20%.',
      },
    },
  ],
};

const SchemaOrgPrices = () => {
  useEffect(() => {
    const schemas = [webPageSchema, offerCatalogSchema, faqSchema];
    const injected: HTMLScriptElement[] = [];
    schemas.forEach((schema, i) => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = `schema-prices-${i}`;
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);
      injected.push(script);
    });
    return () => {
      injected.forEach((s) => { if (document.head.contains(s)) document.head.removeChild(s); });
    };
  }, []);

  return null;
};

export default SchemaOrgPrices;
