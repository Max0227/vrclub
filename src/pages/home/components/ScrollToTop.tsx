import { useState, useEffect } from 'react';
const ScrollToTop = () => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const h = () => setVisible(window.scrollY > 300);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);
  if (!visible) return null;
  return (
    <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="fixed bottom-6 right-4 z-40 w-10 h-10 flex items-center justify-center rounded-md cursor-pointer transition-all hover:scale-110" style={{ background: 'rgba(1,0,20,0.92)', border: '1px solid rgba(0,245,255,0.4)', boxShadow: '0 0 16px rgba(0,245,255,0.3)' }}>
      <i className="ri-arrow-up-line text-lg" style={{ color: '#00f5ff' }} />
    </button>
  );
};
export default ScrollToTop;
