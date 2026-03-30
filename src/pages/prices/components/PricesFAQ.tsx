import { useState } from 'react';

const faqs = [
  {
    q: 'Сколько стоит 1 час VR в Новосибирске?',
    a: '1 шлем Oculus Quest 2 на 1 час — 800 ₽. Если берёте 4 шлема на 1 час — 3 200 ₽ (800 ₽ × 4). В день рождения скидка 20%: 1 час VR — 640 ₽.',
  },
  {
    q: 'Что входит в аренду VR-шлема?',
    a: 'В стоимость включён инструктаж, доступ к 40+ играм, дезинфекция оборудования. Помогаем подобрать игры под ваши предпочтения и уровень подготовки.',
  },
  {
    q: 'Можно ли взять несколько часов подряд?',
    a: 'Да, можно бронировать несколько часов. 1 ч = 800 ₽, 2 ч = 1 600 ₽, 3 ч = 2 400 ₽, 4 ч = 3 200 ₽. Чем больше берёте, тем выгоднее выходит по времени.',
  },
  {
    q: 'Как работает скидка на день рождения?',
    a: 'Скидка 20% действует ±3 дня от даты рождения при предъявлении документа. Она не суммируется со скидкой клубной карты — применяется лучшая из двух. При этом часы игры всё равно засчитываются в клубную карту.',
  },
  {
    q: 'Как накапливаются часы для клубной карты?',
    a: 'Часы считаются по длительности сессии, а не по числу шлемов. Например, 4 шлема × 1 час = 1 час в карту. Это сделано для честного прогресса. Для перехода на Серебряную карту нужно 20 часов VR-игры.',
  },
  {
    q: 'Сколько стоит аренда всего клуба на день рождения?',
    a: 'Весь клуб (до 12 человек, 70 м²): обычная цена 4 750 ₽/час, в день рождения — 3 800 ₽/час (−20%). Включает 4 VR-шлема, PlayStation 5, MOZA Racing Simulator.',
  },
  {
    q: 'Как получить бесплатный час VR?',
    a: 'За каждые 5 часов VR-игры в будни начисляется 1 час в подарок. Также: 10 часов на автосимуляторе MOZA = 2 часа VR в подарок. Бонусные часы можно использовать в любой будний день.',
  },
  {
    q: 'С какого возраста можно играть в VR?',
    a: 'Принимаем с 6 лет. Дети до 10 лет — только в сопровождении взрослого. С 10 лет — самостоятельно. Возрастные ограничения на отдельные игры могут различаться.',
  },
];

const PricesFAQ = () => {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-3">
            <span className="h-px w-12" style={{ background: 'linear-gradient(90deg, transparent, rgba(0,245,255,0.5))' }} />
            <span className="font-mono-tech text-xs tracking-widest" style={{ color: '#00f5ff' }}>ЧАСТО СПРАШИВАЮТ</span>
            <span className="h-px w-12" style={{ background: 'linear-gradient(90deg, rgba(0,245,255,0.5), transparent)' }} />
          </div>
          <h2 className="font-orbitron font-black text-white text-2xl md:text-3xl">Вопросы о ценах</h2>
        </div>

        <div className="flex flex-col gap-2">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="rounded-lg overflow-hidden transition-all duration-300"
              style={{
                background: open === i ? 'rgba(0,245,255,0.05)' : 'rgba(1,0,20,0.6)',
                border: `1px solid ${open === i ? 'rgba(0,245,255,0.3)' : 'rgba(255,255,255,0.07)'}`,
              }}
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left cursor-pointer group"
              >
                <span
                  className="font-orbitron font-semibold text-sm pr-4 leading-snug"
                  style={{ color: open === i ? '#00f5ff' : 'rgba(255,255,255,0.85)', fontSize: '12px' }}
                >
                  {faq.q}
                </span>
                <div
                  className="w-7 h-7 flex items-center justify-center rounded-sm flex-shrink-0 transition-transform duration-300"
                  style={{
                    background: open === i ? 'rgba(0,245,255,0.15)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${open === i ? 'rgba(0,245,255,0.4)' : 'rgba(255,255,255,0.1)'}`,
                    transform: open === i ? 'rotate(45deg)' : 'rotate(0deg)',
                  }}
                >
                  <i className="ri-add-line text-sm" style={{ color: open === i ? '#00f5ff' : 'rgba(255,255,255,0.4)' }} />
                </div>
              </button>
              {open === i && (
                <div className="px-5 pb-5">
                  <p className="font-rajdhani text-white/60 text-base leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricesFAQ;
