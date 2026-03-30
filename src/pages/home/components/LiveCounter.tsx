import { useState, useEffect } from 'react';

const LiveCounter = () => {
  const [count, setCount] = useState(Math.floor(Math.random() * 12) + 1);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount(Math.floor(Math.random() * 12) + 1);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="fixed bottom-6 left-4 z-40 flex items-center gap-2 px-3 py-2 rounded-md"
      style={{ background: 'rgba(1,0,20,0.92)', border: '1px solid rgba(0,245,255,0.3)', backdropFilter: 'blur(8px)' }}
    >
      <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
      <span className="font-mono-tech text-xs" style={{ color: '#00f5ff' }}>
        Сейчас в клубе: <strong>{count}</strong>
      </span>
    </div>
  );
};

export default LiveCounter;
