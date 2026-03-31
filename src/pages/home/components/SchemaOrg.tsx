import { useEffect } from 'react';

const siteUrl = import.meta.env.VITE_SITE_URL ?? 'https://paradoxvr.ru';

const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'EntertainmentBusiness',
  name: 'PARADOX VR CLUB',
  description:
    'Лучший VR-клуб в Новосибирске. Oculus Quest 2, PlayStation 5, MOZA Racing симулятор. 40+ VR игр, 45+ гоночных трасс, до 12 человек. Записаться онлайн.',
  url: siteUrl,
  telephone: '+7-923-244-02-20',
  email: 'paradoxclub54@gmail.com',
  foundingDate: '2022',
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    reviewCount: '119',
    bestRating: '5',
    worstRating: '1',
  },
  hasMap: 'https://yandex.ru/maps/org/paradoks/162318477180/',
  image: `${siteUrl}/images/og-image.jpg`,
  currenciesAccepted: 'RUB',
  paymentAccepted: 'Cash, Credit Card',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'ул. Виктора Шевелева, 24',
    addressLocality: 'Новосибирск',
    addressRegion: 'Новосибирская область',
    postalCode: '630000',
    addressCountry: 'RU',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: '54.9922',
    longitude: '82.8993',
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday',
      ],
      opens: '12:00',
      closes: '22:00',
    },
  ],
  amenityFeature: [
    {
      '@type': 'LocationFeatureSpecification',
      name: 'Oculus Quest 2 VR',
      value: true,
    },
    {
      '@type': 'LocationFeatureSpecification',
      name: 'PlayStation 5',
      value: true,
    },
    {
      '@type': 'LocationFeatureSpecification',
      name: 'MOZA Racing Simulator',
      value: true,
    },
    {
      '@type': 'LocationFeatureSpecification',
      name: 'Бесплатная парковка',
      value: true,
    },
    {
      '@type': 'LocationFeatureSpecification',
      name: 'Можно со своей едой',
      value: true,
    },
  ],
  sameAs: [
    'https://t.me/VRClubParadox',
    'https://yandex.ru/maps/org/paradoks/162318477180/',
    'https://2gis.ru/novosibirsk/firm/70000001059437844',
  ],
  priceRange: '800–4750 ₽',
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'С какого возраста можно посещать VR-клуб PARADOX в Новосибирске?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Принимаем посетителей от 6 лет. Дети до 10 лет — только в сопровождении взрослого. С 10 лет — самостоятельно.',
      },
    },
    {
      '@type': 'Question',
      name: 'Можно ли прийти со своей едой и напитками?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Да, в PARADOX VR CLUB разрешено приходить со своей едой и напитками без ограничений.',
      },
    },
    {
      '@type': 'Question',
      name: 'Сколько человек можно арендовать весь клуб?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Аренда всего клуба рассчитана на компанию до 12 человек. Площадь 70 м². Стоимость — 4750 ₽/час (3800 ₽ в день рождения).',
      },
    },
    {
      '@type': 'Question',
      name: 'Как записаться в VR-клуб PARADOX в Новосибирске?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Записаться можно онлайн через форму на сайте, по телефону +7 923 244-02-20 или через Telegram @VRClubParadox.',
      },
    },
    {
      '@type': 'Question',
      name: 'Есть ли скидка на день рождения?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Да! В день рождения действует скидка 20% на все услуги, включая аренду всего клуба: вместо 4750 ₽ — 3800 ₽/час.',
      },
    },
    {
      '@type': 'Question',
      name: 'Есть ли парковка рядом с VR-клубом?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Да, рядом с клубом есть бесплатная парковка для гостей.',
      },
    },
    {
      '@type': 'Question',
      name: 'Что такое клубная карта PARADOX и какие скидки она даёт?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Клубная карта — программа лояльности с 5 уровнями. Стандартная карта даёт −5%, Серебряная (20 ч VR) — −7%, Золотая (40 ч) — −10%, Платиновая (60 ч) — −12%, CYBER карта (100 ч) — −20%. За каждые 5 часов VR-игры в будни начисляется 1 час в подарок.',
      },
    },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Главная',
      item: siteUrl,
    },
  ],
};

const webSiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'PARADOX VR CLUB',
  url: siteUrl,
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${siteUrl}/?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
};

const schemas = [localBusinessSchema, faqSchema, breadcrumbSchema, webSiteSchema];

const SchemaOrg = () => {
  useEffect(() => {
    const injected: HTMLScriptElement[] = [];

    schemas.forEach((schema, i) => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = `schema-org-${i}`;
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);
      injected.push(script);
    });

    return () => {
      injected.forEach((s) => {
        if (document.head.contains(s)) {
          document.head.removeChild(s);
        }
      });
    };
  }, []);

  return null;
};

export default SchemaOrg;