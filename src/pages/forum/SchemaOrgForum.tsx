import { useEffect } from 'react';

const siteUrl = 'https://paradoxvr.ru';

const forumSchema = {
  '@context': 'https://schema.org',
  '@type': 'DiscussionForumPosting',
  name: 'Форум PARADOX VR CLUB — сообщество геймеров Новосибирска',
  description:
    'Форум VR-клуба PARADOX в Новосибирске. Обсуждения Oculus Quest 2, активация Quest 2, SideQuest, VPN для PS5, настройка MOZA Racing, обход блокировок PlayStation и Steam в России. Сообщество опытных геймеров.',
  url: `${siteUrl}/forum`,
  datePublished: '2026-03-31',
  inLanguage: 'ru',
  isPartOf: {
    '@type': 'WebSite',
    name: 'PARADOX VR CLUB',
    url: siteUrl,
  },
};

const webPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Форум PARADOX VR — Quest 2, PS5, Racing, VPN, обход блокировок | Новосибирск',
  description:
    'Форум VR-клуба PARADOX. Активация Quest 2 в России, SideQuest установка, VPN для PS5, настройка MOZA Racing симулятора, обход блокировок PlayStation Network и Steam. Сообщество геймеров Новосибирска.',
  url: `${siteUrl}/forum`,
  dateModified: new Date().toISOString().split('T')[0],
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Главная', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Форум', item: `${siteUrl}/forum` },
    ],
  },
  potentialAction: {
    '@type': 'SearchAction',
    target: `${siteUrl}/forum?search={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
  isPartOf: {
    '@type': 'WebSite',
    name: 'PARADOX VR CLUB',
    url: siteUrl,
  },
};

const forumFaqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Как активировать Oculus Quest 2 в России?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Для активации Quest 2 в России необходимо использовать VPN при первоначальной настройке, создать аккаунт Meta с американским регионом, либо воспользоваться SideQuest для установки игр без официального магазина. Подробные инструкции в разделе форума "Oculus Quest 2".',
      },
    },
    {
      '@type': 'Question',
      name: 'Как установить игры на Quest 2 без магазина Meta через SideQuest?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'SideQuest позволяет устанавливать APK-файлы на Oculus Quest 2 через USB или беспроводно. Нужно включить режим разработчика в настройках Quest, скачать SideQuest на ПК, подключить шлем и установить нужные приложения.',
      },
    },
    {
      '@type': 'Question',
      name: 'Как использовать PS5 и PlayStation Network в России?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Для доступа к PlayStation Store в России используют смену региона аккаунта PSN на Турцию, Казахстан или другие страны. Необходим VPN при пополнении кошелька. Подробная инструкция с актуальными рабочими методами — в разделе форума "PlayStation 5 в России".',
      },
    },
    {
      '@type': 'Question',
      name: 'Как настроить руль MOZA Racing для гоночного симулятора?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Руль MOZA R5 настраивается через приложение MOZA Pit House. Рекомендуемые настройки: FFB 50-65%, чувствительность руля 900°, мёртвые зоны педалей 3-5%. Для Assetto Corsa и DiRT Rally 2.0 есть готовые пресеты в теме форума.',
      },
    },
    {
      '@type': 'Question',
      name: 'Как обойти блокировки Steam и скачать игры в России?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Steam работает в России через VPN-сервисы. Для смены региона цен используют аккаунты с Казахстаном или Аргентиной. Family Sharing позволяет играть в игры из библиотеки другого аккаунта. Актуальные рабочие методы обсуждаются на форуме.',
      },
    },
    {
      '@type': 'Question',
      name: 'Какие бесплатные VR-игры стоит попробовать на Oculus Quest 2 в 2026?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Лучшие бесплатные VR-игры: VRChat, Rec Room, Gun Raiders, Echo VR, Population: One (условно-бесплатная), Hyper Dash, Bigscreen VR. Все доступны в официальном магазине Meta Quest.',
      },
    },
    {
      '@type': 'Question',
      name: 'Как настроить BeamNG.drive для игры на MOZA Racing?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'BeamNG.drive поддерживает рули MOZA через эмуляцию контроллера. В настройках игры выберите профиль "Wheel" и назначьте оси. Для лучшего FFB используйте мод "CJD Special Tunes" и настройки из раздела форума Racing.',
      },
    },
  ],
};

const organizationForumSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Форум PARADOX VR CLUB',
  url: `${siteUrl}/forum`,
  sameAs: [`${siteUrl}`, 'https://t.me/VRClubParadox'],
  foundingDate: '2026',
  parentOrganization: {
    '@type': 'EntertainmentBusiness',
    name: 'PARADOX VR CLUB',
    url: siteUrl,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'ул. Виктора Шевелева, 24',
      addressLocality: 'Новосибирск',
      addressRegion: 'Новосибирская область',
      addressCountry: 'RU',
    },
  },
};

const schemas = [forumSchema, webPageSchema, forumFaqSchema, organizationForumSchema];

const SchemaOrgForum = () => {
  useEffect(() => {
    const injected: HTMLScriptElement[] = [];
    schemas.forEach((schema, i) => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = `schema-forum-${i}`;
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

export default SchemaOrgForum;