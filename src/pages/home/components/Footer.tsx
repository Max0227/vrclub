const MAX_LINK = 'https://max.ru/u/f9LHodD0cOKWJo7eQiYHPywhtGUXtiX40o8Na8eR6jKCMNRpsNgDUk5doGg';
const MAX_ICON = 'https://storage.readdy-site.link/project_files/af3cd35d-3e8e-4232-8f1f-1d33bf236cc8/82d5ad42-8081-4413-a1d6-09b0aa2a0be7_MAX.jpg?v=ec55d078d68434f28e45c6897811f4ef';

const Footer = ({ onBooking }: { onBooking: () => void }) => (
  <footer style={{ background: '#00060d', borderTop: '1px solid rgba(0,245,255,0.15)' }} className="relative py-10 px-4">
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
        <div>
          <img src="/images/logo.png" alt="PARADOX VR CLUB" className="h-12 w-auto mb-3" />
          <p className="text-white/40 font-rajdhani text-sm leading-relaxed">VR-клуб нового поколения в Новосибирске. 4 года вдохновляем!</p>
        </div>
        <div>
          <div className="font-orbitron text-xs font-bold text-white/60 mb-4 tracking-widest">НАВИГАЦИЯ</div>
          <div className="space-y-2">
            {[['#equipment','Оборудование'],['#games','Игры'],['#pricing','Цены'],['#reviews','Отзывы'],['#certificates','Сертификаты'],['#contacts','Контакты']].map(([href, label]) => (
              <button key={href} onClick={() => { const el = document.querySelector(href); if (el) el.scrollIntoView({ behavior: 'smooth' }); }} className="block font-rajdhani text-sm text-white/40 hover:text-cyan-400 transition-colors cursor-pointer whitespace-nowrap">
                {label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="font-orbitron text-xs font-bold text-white/60 mb-4 tracking-widest">КОНТАКТЫ</div>
          <div className="space-y-2 text-sm font-rajdhani text-white/50">
            <p><i className="ri-map-pin-line mr-2" style={{ color: '#00f5ff' }} />ул. Виктора Шевелева, 24</p>
            <p><i className="ri-phone-line mr-2" style={{ color: '#ff006e' }} />+7 923 244-02-20</p>
            <p><i className="ri-time-line mr-2" style={{ color: '#9b4dff' }} />Ежедневно 12:00–22:00</p>
            <a href="mailto:paradoxclub54@gmail.com" className="flex items-center gap-2 hover:text-cyan-400 transition-colors">
              <i className="ri-mail-line" style={{ color: '#9b4dff' }} />paradoxclub54@gmail.com
            </a>
            <a href={MAX_LINK} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-orange-400 transition-colors">
              <img src={MAX_ICON} alt="MAX" className="w-4 h-4 rounded-sm object-cover flex-shrink-0" />
              Написать в MAX
            </a>
          </div>
          <button onClick={onBooking} className="btn-cyber-pink mt-4 px-5 py-2 rounded-sm text-xs whitespace-nowrap">Записаться</button>
        </div>
      </div>
      <div style={{ borderTop: '1px solid rgba(0,245,255,0.1)' }} className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="font-mono-tech text-xs text-white/25">© 2022–2026 PARADOX VR CLUB. Новосибирск.</p>
        <div className="flex items-center gap-3">
          <a href={MAX_LINK} target="_blank" rel="noopener noreferrer" className="w-8 h-8 flex items-center justify-center rounded-md overflow-hidden transition-all hover:scale-110" style={{ border: '1px solid rgba(255,106,0,0.4)' }}>
            <img src={MAX_ICON} alt="MAX" className="w-full h-full object-cover" />
          </a>
          <a href="mailto:paradoxclub54@gmail.com" className="w-8 h-8 flex items-center justify-center rounded-md transition-all hover:scale-110" style={{ border: '1px solid rgba(155,77,255,0.3)', color: '#9b4dff' }}>
            <i className="ri-mail-line text-sm" />
          </a>
          <a href="tel:+79232440220" className="w-8 h-8 flex items-center justify-center rounded-md transition-all hover:scale-110" style={{ border: '1px solid rgba(255,0,110,0.3)', color: '#ff006e' }}>
            <i className="ri-phone-line text-sm" />
          </a>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;