import { useEffect } from 'react';

interface PageMetaProps {
  title: string;
  description: string;
  canonical?: string;
  keywords?: string;
  ogImage?: string;
}

const DEFAULT_OG_IMAGE =
  'https://readdy.ai/api/search-image?query=cyberpunk%20VR%20club%20neon%20lights%20gaming%20room%20immersive%20virtual%20reality%20futuristic&width=1200&height=630&seq=og01&orientation=landscape';

const PageMeta = ({
  title,
  description,
  canonical,
  keywords,
  ogImage = DEFAULT_OG_IMAGE,
}: PageMetaProps) => {
  useEffect(() => {
    // Title
    document.title = title;

    const setMeta = (name: string, content: string, attr: 'name' | 'property' = 'name') => {
      let el = document.querySelector(
        `meta[${attr}="${name}"]`,
      ) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMeta('description', description);
    if (keywords) setMeta('keywords', keywords);

    // OG
    setMeta('og:title', title, 'property');
    setMeta('og:description', description, 'property');
    setMeta('og:image', ogImage, 'property');

    // Twitter
    setMeta('twitter:title', title);
    setMeta('twitter:description', description);
    setMeta('twitter:image', ogImage);

    // Canonical
    if (canonical) {
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
      }
      link.setAttribute('href', canonical);
    }

    // last-modified — always today
    const lm = document.querySelector('meta[name="last-modified"]') as HTMLMetaElement | null;
    if (lm) {
      const d = new Date();
      lm.content = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }

    return () => {
      // Restore default title on unmount
      document.title = 'PARADOX VR CLUB Новосибирск — VR-клуб | Oculus Quest 2, MOZA Racing, PS5';
    };
  }, [title, description, canonical, keywords, ogImage]);

  return null;
};

export default PageMeta;
