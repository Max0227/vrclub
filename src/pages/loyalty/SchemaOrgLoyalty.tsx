import { useEffect } from 'react';

const siteUrl = import.meta.env.VITE_SITE_URL ?? 'https://paradoxvr.ru';

const webPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Клубная карта лояльности — PARADOX VR CLUB Новосибирск',
  description:
    'Клубная карта PARADOX VR CLUB — 5 уровней скидок от 5% до 20%. Накапливайте VR-часы и получайте бонусы: каждые 5 часов VR-игры в будни = 1 час в подарок.',
  url: `${siteUrl}/loyalty`,
  isPartOf: {
    '@type': 'WebSite',
    name: 'PARADOX VR CLUB',
    url: siteUrl,
  },
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Главная',
        item: siteUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Клубная карта',
        item: `${siteUrl}/loyalty`,
      },
    ],
  },
};

const loyaltyServiceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Клубная карта PARADOX VR CLUB',
  description:
    'Программа лояльности VR-клуба PARADOX в Новосибирске. 5 уровней карты: Стандартная (−5%), Серебряная (−7%), Золотая (−10%), Платиновая (−12%), CYBER (−20%). За каждые 5 часов VR в будни — 1 час в подарок.',
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
  serviceType: 'Loyalty Program',
  offers: [
    {
      '@type': 'Offer',
      name: 'Стандартная карта',
      description: 'Скидка 5% на все услуги. Выдаётся при регистрации бесплатно.',
      price: '0',
      priceCurrency: 'RUB',
    },
    {
      '@type': 'Offer',
      name: 'Серебряная карта',
      description: 'Скидка 7% на все услуги. Открывается после 20 часов VR.',
      price: '0',
      priceCurrency: 'RUB',
    },
    {
      '@type': 'Offer',
      name: 'Золотая карта',
      description: 'Скидка 10% на все услуги. Открывается после 40 часов VR.',
      price: '0',
      priceCurrency: 'RUB',
    },
    {
      '@type': 'Offer',
      name: 'Платиновая карта',
      description: 'Скидка 12% на все услуги. Открывается после 60 часов VR.',
      price: '0',
      priceCurrency: 'RUB',
    },
    {
      '@type': 'Offer',
      name: 'CYBER карта',
      description: 'Скидка 20% на все услуги. Открывается после 100 часов VR.',
      price: '0',
      priceCurrency: 'RUB',
    },
  ],
};

const SchemaOrgLoyalty = () => {
  useEffect(() => {
    const schemas = [webPageSchema, loyaltyServiceSchema];
    const injected: HTMLScriptElement[] = [];

    schemas.forEach((schema, i) => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = `schema-loyalty-${i}`;
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);
      injected.push(script);
    });

    return () => {
      injected.forEach((s) => {
        if (document.head.contains(s)) document.head.removeChild(s);
      });
    };
  }, []);

  return null;
};

export default SchemaOrgLoyalty;