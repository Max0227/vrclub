import { useState, useEffect, useCallback, useRef } from 'react';

const ScrollToTop = () => {
  const [visible, setVisible] = useState(false);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleScroll = useCallback(() => {
    // Throttle для оптимизации производительности
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = setTimeout(() => {
      setVisible(window.scrollY > 300);
    }, 100);
  }, []);

  useEffect(() => {
    // Добавляем слушатель события прокрутки
    window.addEventListener('scroll', handleScroll);
    
    // Проверяем начальное положение
    setVisible(window.scrollY > 300);

    // Очистка при размонтировании
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [handleScroll]);

  const handleClick = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-4 z-40 w-10 h-10 flex items-center justify-center rounded-md cursor-pointer transition-all duration-300 hover:scale-110 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
      style={{ 
        background: 'rgba(1,0,20,0.92)', 
        border: '1px solid rgba(0,245,255,0.4)', 
        boxShadow: '0 0 16px rgba(0,245,255,0.3)',
        backdropFilter: 'blur(4px)',
      }}
      aria-label="Прокрутить наверх"
      title="Наверх"
    >
      <i className="ri-arrow-up-line text-lg" style={{ color: '#00f5ff' }} />
    </button>
  );
};

export default ScrollToTop;