import { useEffect } from 'react';
import { allGames } from '../../mocks/games';

const siteUrl = 'https://paradoxvr.ru';

const webPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Библиотека игр — PARADOX VR CLUB Новосибирск',
  description:
    'Полный каталог VR-игр для Oculus Quest 2, игр PlayStation 5 и гоночных трасс симулятора MOZA R5 в VR-клубе PARADOX Новосибирск. 44 игры, постоянное пополнение библиотеки.',
  url: `${siteUrl}/games`,
  isPartOf: {
    '@type': 'WebSite',
    name: 'PARADOX VR CLUB',
    url: siteUrl,
  },
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Главная', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Игры', item: `${siteUrl}/games` },
    ],
  },
};

const itemListSchema = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Каталог игр PARADOX VR CLUB Новосибирск',
  description:
    'VR-игры Oculus Quest 2, игры PlayStation 5 и гоночные трассы MOZA Racing Simulator',
  url: `${siteUrl}/games`,
  numberOfItems: allGames.length,
  itemListElement: allGames.map((game, idx) => ({
    '@type': 'ListItem',
    position: idx + 1,
    name: game.name,
    description: game.desc,
    item: {
      '@type': 'VideoGame',
      name: game.name,
      description: game.desc,
      gamePlatform:
        game.category === 'VR'
          ? 'Oculus Quest 2'
          : game.category === 'PS5'
          ? 'PlayStation 5'
          : 'MOZA Racing Simulator',
    },
  })),
};

const vrCategorySchema = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'VR-игры Oculus Quest 2 — PARADOX VR CLUB Новосибирск',
  description:
    'Полный список VR-игр для Oculus Quest 2 в клубе PARADOX. Beat Saber, Superhot VR, Pavlov VR, Gorilla Tag, Arizona Sunshine и многие другие.',
  url: `${siteUrl}/games`,
  numberOfItems: allGames.filter((g) => g.category === 'VR').length,
  itemListElement: allGames
    .filter((g) => g.category === 'VR')
    .map((game, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: game.name,
      description: game.desc,
    })),
};

const mozaCategorySchema = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Гоночные симуляторы MOZA Racing — трассы и игры',
  description:
    'Каталог гоночных игр для симулятора MOZA R5 в клубе PARADOX: Assetto Corsa, DiRT Rally 2.0, Forza Horizon 5, BeamNG.drive. 45+ трасс.',
  url: `${siteUrl}/games`,
  numberOfItems: allGames.filter((g) => g.category === 'MOZA').length,
  itemListElement: allGames
    .filter((g) => g.category === 'MOZA')
    .map((game, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: game.name,
      description: game.desc,
    })),
};

const schemas = [webPageSchema, itemListSchema, vrCategorySchema, mozaCategorySchema];

const SchemaOrgGames = () => {
  useEffect(() => {
    const injected: HTMLScriptElement[] = [];
    schemas.forEach((schema, i) => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = `schema-games-${i}`;
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

export default SchemaOrgGames;
