import { useEffect, useRef, useCallback } from 'react';

const ParticleBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const resizeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const isMobile = window.innerWidth < 768;
    const PARTICLE_COUNT = isMobile ? 10 : 60;
    const CONNECTION_DISTANCE = 120;
    const PARTICLE_SPEED = 0.4;
    const PARTICLE_SIZE_MIN = 0.5;
    const PARTICLE_SIZE_MAX = 2.5;

    type Particle = {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      alpha: number;
      pulse: number;
      pulseSpeed: number;
    };

    const colors = ['#00f5ff', '#ff006e', '#9b4dff'];

    let particles: Particle[] = [];
    let canvasWidth = canvas.width;
    let canvasHeight = canvas.height;
    let rafId: number;

    // Функция для создания новой частицы
    const createParticle = (): Particle => ({
      x: Math.random() * canvasWidth,
      y: Math.random() * canvasHeight,
      vx: (Math.random() - 0.5) * PARTICLE_SPEED,
      vy: (Math.random() - 0.5) * PARTICLE_SPEED,
      size: Math.random() * PARTICLE_SIZE_MAX + PARTICLE_SIZE_MIN,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: Math.random() * 0.6 + 0.2,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: Math.random() * 0.02 + 0.005,
    });

    // Функция для обновления размеров канваса
    const handleResize = useCallback(() => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      canvasWidth = canvas.width;
      canvasHeight = canvas.height;
      
      // Пересоздаём частицы с новыми размерами
      particles = Array.from({ length: PARTICLE_COUNT }, () => createParticle());
    }, [PARTICLE_COUNT]);

    // Throttled resize handler
    const throttledResize = useCallback(() => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      resizeTimeoutRef.current = setTimeout(handleResize, 100);
    }, [handleResize]);

    // Инициализация
    handleResize();
    window.addEventListener('resize', throttledResize);

    // Функция анимации
    const animate = () => {
      // Проверяем видимость страницы для экономии ресурсов
      if (!document.hidden) {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        particles.forEach((p) => {
          // Обновляем позицию
          p.x += p.vx;
          p.y += p.vy;
          p.pulse += p.pulseSpeed;

          // Телепортация при выходе за границы
          if (p.x < 0) p.x = canvasWidth;
          if (p.x > canvasWidth) p.x = 0;
          if (p.y < 0) p.y = canvasHeight;
          if (p.y > canvasHeight) p.y = 0;

          // Пульсирующая альфа
          const pulseAlpha = p.alpha + Math.sin(p.pulse) * 0.15;
          const finalAlpha = Math.min(Math.max(pulseAlpha, 0.1), 0.85);

          // Рисуем частицу с glow-эффектом
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          
          // Добавляем свечение
          ctx.shadowColor = p.color;
          ctx.shadowBlur = p.size * 2;
          ctx.fillStyle = p.color;
          ctx.globalAlpha = finalAlpha;
          ctx.fill();
          
          // Сбрасываем shadow для следующих частиц
          ctx.shadowBlur = 0;
        });

        // Рисуем соединения между частицами (только на десктопе)
        if (!isMobile) {
          ctx.globalAlpha = 1;
          ctx.lineWidth = 0.5;
          
          for (let i = 0; i < particles.length; i++) {
            const p1 = particles[i];
            for (let j = i + 1; j < particles.length; j++) {
              const p2 = particles[j];
              const dx = p1.x - p2.x;
              const dy = p1.y - p2.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              
              if (dist < CONNECTION_DISTANCE) {
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.strokeStyle = '#00f5ff';
                ctx.globalAlpha = (1 - dist / CONNECTION_DISTANCE) * 0.08;
                ctx.stroke();
              }
            }
          }
          ctx.globalAlpha = 1;
        }
      }

      rafId = requestAnimationFrame(animate);
    };

    // Запускаем анимацию
    animate();

    // Обработчик видимости страницы
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Страница скрыта — можно ничего не делать, анимация уже проверяет
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Очистка при размонтировании
    return () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      window.removeEventListener('resize', throttledResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="particles-canvas"
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%', 
        pointerEvents: 'none', 
        zIndex: 0,
        willChange: 'transform'
      }}
      aria-hidden="true"
    />
  );
};

export default ParticleBackground;