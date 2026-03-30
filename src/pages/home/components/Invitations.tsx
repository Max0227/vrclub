import { useState, useCallback, memo } from 'react';
import { jsPDF } from 'jspdf';

type Theme = 'cyber' | 'space' | 'fire';

interface InvForm {
  name: string;
  datetime: string;
  sender: string;
  phone: string;
  guests: string;
  message: string;
}

const THEMES: {
  id: Theme; label: string; desc: string;
  primary: string; secondary: string; accent: string; bg1: string; bg2: string;
}[] = [
  { id: 'cyber', label: 'Киберпанк', desc: 'Неон и технологии', primary: '#00f5ff', secondary: '#ff006e', accent: '#9b4dff', bg1: '#010014', bg2: '#0a0030' },
  { id: 'space', label: 'Космос', desc: 'Далёкие галактики', primary: '#c0b0ff', secondary: '#7040ff', accent: '#00cfff', bg1: '#010020', bg2: '#08001c' },
  { id: 'fire', label: 'Огонь', desc: 'Энергия и страсть', primary: '#ff6a00', secondary: '#ff3300', accent: '#ffcc00', bg1: '#0f0300', bg2: '#200800' },
];

const INITIAL_FORM: InvForm = { name: '', datetime: '', sender: '', phone: '', guests: '2', message: '' };

const drawInvitationCanvas = (form: InvForm, theme: typeof THEMES[0]): HTMLCanvasElement => {
  const W = 2480;
  const H = 1748;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;
  const midX = W / 2;

  // ── Deep background ──
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, theme.bg1);
  bg.addColorStop(0.4, theme.bg2);
  bg.addColorStop(0.8, theme.bg1);
  bg.addColorStop(1, theme.bg2);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // ── Subtle grid ──
  ctx.strokeStyle = `${theme.primary}10`;
  ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 60) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = 0; y < H; y += 60) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

  // ── Center glow ──
  const radGlow = ctx.createRadialGradient(midX, H * 0.42, 0, midX, H * 0.42, 600);
  radGlow.addColorStop(0, `${theme.primary}18`);
  radGlow.addColorStop(1, 'transparent');
  ctx.fillStyle = radGlow;
  ctx.fillRect(0, 0, W, H);

  // ── Outer border ──
  const outerGrad = ctx.createLinearGradient(0, 0, W, H);
  outerGrad.addColorStop(0, theme.primary);
  outerGrad.addColorStop(0.5, theme.secondary);
  outerGrad.addColorStop(1, theme.accent);
  ctx.strokeStyle = outerGrad;
  ctx.lineWidth = 5;
  ctx.strokeRect(18, 18, W - 36, H - 36);

  // ── Inner border ──
  ctx.strokeStyle = `${theme.primary}25`;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(35, 35, W - 70, H - 70);

  // ── Top & bottom gradient lines ──
  [[6, theme.primary, theme.secondary], [H - 6, theme.accent, theme.primary]].forEach(([y, c1, c2]) => {
    const lg = ctx.createLinearGradient(0, 0, W, 0);
    lg.addColorStop(0, 'transparent');
    lg.addColorStop(0.2, c1 as string);
    lg.addColorStop(0.8, c2 as string);
    lg.addColorStop(1, 'transparent');
    ctx.strokeStyle = lg;
    ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(0, y as number); ctx.lineTo(W, y as number); ctx.stroke();
  });

  // ── Corner L-marks ──
  const CL = 90;
  const cornerDefs: [number, number, 1 | -1, 1 | -1, string][] = [
    [24, 24, 1, 1, theme.primary], [W - 24, 24, -1, 1, theme.primary],
    [24, H - 24, 1, -1, theme.secondary], [W - 24, H - 24, -1, -1, theme.secondary],
  ];
  ctx.lineWidth = 6;
  cornerDefs.forEach(([cx, cy, dx, dy, col]) => {
    ctx.strokeStyle = col;
    ctx.shadowColor = col;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.moveTo(cx + dx * CL, cy);
    ctx.lineTo(cx, cy);
    ctx.lineTo(cx, cy + dy * CL);
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.fillStyle = col;
    ctx.beginPath(); ctx.arc(cx, cy, 7, 0, Math.PI * 2); ctx.fill();
  });

  ctx.textAlign = 'center';

  // ── "PARADOX VR CLUB" header ──
  ctx.font = '500 38px Arial';
  ctx.fillStyle = theme.primary;
  ctx.letterSpacing = '12px';
  ctx.shadowColor = theme.primary;
  ctx.shadowBlur = 18;
  ctx.fillText('PARADOX VR CLUB', midX, 130);
  ctx.shadowBlur = 0;

  // Thin header divider
  const hDiv = ctx.createLinearGradient(midX - 350, 0, midX + 350, 0);
  hDiv.addColorStop(0, 'transparent'); hDiv.addColorStop(0.5, theme.primary); hDiv.addColorStop(1, 'transparent');
  ctx.strokeStyle = hDiv; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(midX - 350, 160); ctx.lineTo(midX + 350, 160); ctx.stroke();

  // ── "ПРИГЛАШЕНИЕ" — properly centered two-color text ──
  ctx.font = 'bold 195px Arial';
  ctx.shadowColor = theme.primary; ctx.shadowBlur = 50;
  const p1 = 'ПРИГЛ';
  const p2 = 'АШЕНИЕ';
  const w1 = ctx.measureText(p1).width;
  const w2 = ctx.measureText(p2).width;
  const totalW = w1 + w2;
  const textStartX = midX - totalW / 2;
  ctx.textAlign = 'left';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(p1, textStartX, 370);
  ctx.fillStyle = theme.primary;
  ctx.fillText(p2, textStartX + w1, 370);
  ctx.shadowBlur = 0;
  ctx.textAlign = 'center';

  // ── "НА ДЕНЬ РОЖДЕНИЯ" ──
  ctx.font = 'bold 54px Arial';
  ctx.fillStyle = theme.secondary;
  ctx.letterSpacing = '8px';
  ctx.shadowColor = theme.secondary; ctx.shadowBlur = 18;
  ctx.fillText('НА ДЕНЬ РОЖДЕНИЯ', midX, 440);
  ctx.shadowBlur = 0;

  // ── Wide divider ──
  const div2 = ctx.createLinearGradient(midX - 500, 0, midX + 500, 0);
  div2.addColorStop(0, 'transparent'); div2.addColorStop(0.5, `${theme.primary}70`); div2.addColorStop(1, 'transparent');
  ctx.strokeStyle = div2; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(midX - 500, 478); ctx.lineTo(midX + 500, 478); ctx.stroke();

  // ── ИМЕНИННИК label ──
  ctx.font = '400 34px Arial';
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.letterSpacing = '6px';
  ctx.fillText('ИМЕНИННИК', midX, 548);

  // ── NAME large ──
  const nameText = form.name || 'ИМЯ ИМЕНИННИКА';
  ctx.font = 'bold 145px Arial';
  let nameFS = 145;
  ctx.letterSpacing = '2px';
  const measuredW = ctx.measureText(nameText).width;
  if (measuredW > W - 300) {
    nameFS = Math.floor(145 * ((W - 300) / measuredW));
    ctx.font = `bold ${nameFS}px Arial`;
  }
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = theme.accent; ctx.shadowBlur = 30;
  ctx.fillText(nameText, midX, 695);
  ctx.shadowBlur = 0;

  // Accent underline
  const aLine = ctx.createLinearGradient(midX - 300, 0, midX + 300, 0);
  aLine.addColorStop(0, 'transparent'); aLine.addColorStop(0.5, theme.accent); aLine.addColorStop(1, 'transparent');
  ctx.strokeStyle = aLine; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(midX - 300, 720); ctx.lineTo(midX + 300, 720); ctx.stroke();

  // ── Date / Guests / Address ──
  const dt = form.datetime
    ? new Date(form.datetime).toLocaleString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : 'дата не указана';

  ctx.font = '500 42px Arial';
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.letterSpacing = '2px';
  ctx.fillText(`${dt}`, midX, 800);

  ctx.font = '400 36px Arial';
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.letterSpacing = '1px';
  ctx.fillText(`Количество гостей: ${form.guests}  ·  г. Новосибирск, ул. Виктора Шевелева, 24`, midX, 852);

  // ── Diamond decorative divider ──
  const diamondY = 905;
  const divLine = ctx.createLinearGradient(midX - 400, 0, midX + 400, 0);
  divLine.addColorStop(0, 'transparent'); divLine.addColorStop(0.5, `${theme.primary}50`); divLine.addColorStop(1, 'transparent');
  ctx.strokeStyle = divLine; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(midX - 400, diamondY); ctx.lineTo(midX - 12, diamondY); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(midX + 12, diamondY); ctx.lineTo(midX + 400, diamondY); ctx.stroke();
  ctx.fillStyle = theme.accent;
  ctx.save(); ctx.translate(midX, diamondY); ctx.rotate(Math.PI / 4);
  ctx.fillRect(-8, -8, 16, 16); ctx.restore();

  // ── Wish / Sender ──
  let infoY = 968;
  if (form.message) {
    const shortMsg = form.message.length > 75 ? form.message.slice(0, 75) + '...' : form.message;
    ctx.font = 'italic 38px Arial';
    ctx.fillStyle = 'rgba(255,255,255,0.65)';
    ctx.letterSpacing = '0px';
    ctx.fillText(`"${shortMsg}"`, midX, infoY);
    infoY += 60;
  }
  if (form.sender || form.phone) {
    ctx.font = '400 30px Arial';
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fillText(`от: ${form.sender}${form.phone ? `  ·  ${form.phone}` : ''}`, midX, infoY);
  }

  // ── Bottom bar ──
  const barY = H - 140;
  const barGrad = ctx.createLinearGradient(0, barY, 0, H);
  barGrad.addColorStop(0, `${theme.primary}10`);
  barGrad.addColorStop(1, `${theme.primary}20`);
  ctx.fillStyle = barGrad;
  ctx.fillRect(18, barY, W - 36, H - barY - 18);
  ctx.strokeStyle = `${theme.primary}30`; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(18, barY); ctx.lineTo(W - 18, barY); ctx.stroke();

  ctx.font = 'bold 30px Arial';
  ctx.fillStyle = theme.primary;
  ctx.letterSpacing = '3px';
  ctx.fillText('Скидка 20% в День Рождения!  ·  Ежедневно 12:00–22:00  ·  +7 923 244-02-20', midX, barY + 60);
  ctx.font = '26px Arial';
  ctx.fillStyle = `${theme.primary}60`;
  ctx.letterSpacing = '2px';
  ctx.fillText('г. Новосибирск, ул. Виктора Шевелева, 24  ·  PARADOX VR CLUB', midX, barY + 102);

  return canvas;
};

const downloadInvitationPdf = async (form: InvForm, theme: typeof THEMES[0]): Promise<void> => {
  const canvas = drawInvitationCanvas(form, theme);
  const imgData = canvas.toDataURL('image/jpeg', 0.96);
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  doc.addImage(imgData, 'JPEG', 0, 0, 297, 210);
  const pdfBlob = doc.output('blob');
  const url = URL.createObjectURL(pdfBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Priglashenie_${form.name || 'PARADOX'}.pdf`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 200);
};

// ─── Preview (visual only, not used for PDF) ───────────────────────────────────

const InvitationPreview = memo(({ form, theme }: { form: InvForm; theme: typeof THEMES[0] }) => {
  const dt = form.datetime
    ? new Date(form.datetime).toLocaleString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '—';

  return (
    <div
      className="relative rounded-xl overflow-hidden p-6"
      style={{
        background: `linear-gradient(135deg, ${theme.bg1} 0%, ${theme.bg2} 100%)`,
        border: `2px solid ${theme.primary}60`,
        boxShadow: `0 0 40px ${theme.primary}20`,
        minHeight: '280px',
      }}
    >
      <div className="absolute inset-0" style={{ backgroundImage: `linear-gradient(${theme.primary}15 1px, transparent 1px), linear-gradient(90deg, ${theme.primary}15 1px, transparent 1px)`, backgroundSize: '20px 20px', opacity: 0.5 }} />
      <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: `linear-gradient(90deg, transparent, ${theme.primary}, ${theme.secondary}, transparent)` }} />
      <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: `linear-gradient(90deg, transparent, ${theme.accent}, ${theme.primary}, transparent)` }} />
      <div className="absolute top-3 left-3 w-5 h-5" style={{ borderTop: `2px solid ${theme.primary}`, borderLeft: `2px solid ${theme.primary}` }} />
      <div className="absolute top-3 right-3 w-5 h-5" style={{ borderTop: `2px solid ${theme.primary}`, borderRight: `2px solid ${theme.primary}` }} />
      <div className="absolute bottom-3 left-3 w-5 h-5" style={{ borderBottom: `2px solid ${theme.secondary}`, borderLeft: `2px solid ${theme.secondary}` }} />
      <div className="absolute bottom-3 right-3 w-5 h-5" style={{ borderBottom: `2px solid ${theme.secondary}`, borderRight: `2px solid ${theme.secondary}` }} />

      <div className="relative text-center">
        <div style={{ color: theme.primary, fontSize: '9px', letterSpacing: '3px', fontWeight: 'bold', marginBottom: '4px' }}>PARADOX VR CLUB</div>
        <div className="w-20 h-px mx-auto mb-3" style={{ background: `linear-gradient(90deg, transparent, ${theme.primary}, transparent)` }} />
        <div style={{ fontWeight: 'bold', fontSize: '24px', color: '#fff', textShadow: `0 0 20px ${theme.primary}60`, letterSpacing: '3px', marginBottom: '4px', lineHeight: 1.1 }}>
          ПРИГЛ<span style={{ color: theme.primary }}>АШЕНИЕ</span>
        </div>
        <div style={{ color: theme.secondary, fontSize: '10px', letterSpacing: '2px', marginBottom: '16px' }}>НА ДЕНЬ РОЖДЕНИЯ</div>

        <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '13px', marginBottom: '4px' }}>Именинник:</div>
        <div style={{ fontWeight: 'bold', fontSize: '20px', color: '#fff', textShadow: `0 0 15px ${theme.accent}80`, marginBottom: '4px' }}>
          {form.name || 'ИМЯ ИМЕНИННИКА'}
        </div>
        <div className="w-24 h-0.5 mx-auto mb-4" style={{ background: theme.accent }} />

        <div className="flex flex-col gap-1.5 mb-3">
          {[
            `Дата: ${dt}`,
            `Гостей: ${form.guests}`,
            'г. Новосибирск, ул. Виктора Шевелева, 24',
          ].map((text, i) => (
            <div key={i} className="text-sm text-white/70 text-center">{text}</div>
          ))}
        </div>

        {form.message && (
          <div style={{ marginTop: '8px', padding: '8px 16px', borderRadius: '8px', background: `${theme.primary}10`, border: `1px solid ${theme.primary}25`, color: 'rgba(255,255,255,0.7)', fontStyle: 'italic', fontSize: '12px' }}>
            &ldquo;{form.message}&rdquo;
          </div>
        )}
        {form.sender && (
          <div style={{ marginTop: '10px', color: 'rgba(255,255,255,0.4)', fontSize: '10px' }}>
            от: {form.sender}{form.phone ? ` · ${form.phone}` : ''}
          </div>
        )}
        <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: `1px solid ${theme.primary}20`, color: theme.primary, fontSize: '9px', letterSpacing: '2px' }}>
          Скидка 20% в День Рождения! · Ежедневно 12:00–22:00 · +7 923 244-02-20
        </div>
      </div>
    </div>
  );
});
InvitationPreview.displayName = 'InvitationPreview';

// ─── Theme Card ────────────────────────────────────────────────────────────────

const ThemeCard = memo(({ theme, selected, onSelect }: { theme: typeof THEMES[0]; selected: boolean; onSelect: () => void }) => (
  <button
    type="button"
    onClick={onSelect}
    className="relative rounded-xl overflow-hidden transition-all duration-300 cursor-pointer text-left"
    style={{
      background: `linear-gradient(135deg, ${theme.bg1}, ${theme.bg2})`,
      border: `2px solid ${selected ? theme.primary : `${theme.primary}30`}`,
      boxShadow: selected ? `0 0 20px ${theme.primary}40` : 'none',
      transform: selected ? 'scale(1.03)' : 'scale(1)',
    }}
  >
    <div className="p-4 h-20">
      <div className="w-full h-px mb-2" style={{ background: `linear-gradient(90deg, transparent, ${theme.primary}, transparent)` }} />
      <div className="font-orbitron font-black" style={{ color: theme.primary, fontSize: '9px', letterSpacing: '2px' }}>PARADOX VR CLUB</div>
      <div className="mt-1 font-orbitron font-bold text-white" style={{ fontSize: '13px' }}>ПРИГЛ.</div>
      <div className="mt-1.5 flex gap-1">
        {[theme.primary, theme.secondary, theme.accent].map((c) => (
          <div key={c} className="h-1 flex-1 rounded-full" style={{ background: c }} />
        ))}
      </div>
    </div>
    <div className="px-4 py-2.5" style={{ background: `${theme.primary}12`, borderTop: `1px solid ${theme.primary}30` }}>
      <div className="font-orbitron font-bold text-white text-xs">{theme.label}</div>
      <div className="font-rajdhani text-white/40 text-xs">{theme.desc}</div>
    </div>
    {selected && (
      <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: theme.primary }}>
        <i className="ri-check-line text-xs text-black font-bold" />
      </div>
    )}
  </button>
));
ThemeCard.displayName = 'ThemeCard';

// ─── Main Component ────────────────────────────────────────────────────────────

const Invitations = () => {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<'theme' | 'form' | 'preview'>('theme');
  const [selectedTheme, setSelectedTheme] = useState<Theme>('cyber');
  const [form, setForm] = useState<InvForm>(INITIAL_FORM);
  const [generated, setGenerated] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const theme = THEMES.find((t) => t.id === selectedTheme) ?? THEMES[0];

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);

  const handleDownload = useCallback(async () => {
    setDownloading(true);
    try {
      await downloadInvitationPdf(form, theme);
      setGenerated(true);
    } finally {
      setDownloading(false);
    }
  }, [form, theme]);

  const handleReset = useCallback(() => {
    setOpen(false);
    setStep('theme');
    setForm(INITIAL_FORM);
    setGenerated(false);
  }, []);

  return (
    <section id="invitations" className="relative py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <div
          className="rounded-xl overflow-hidden relative"
          style={{ border: '1px solid rgba(255,0,110,0.4)', background: 'linear-gradient(135deg, rgba(255,0,110,0.08), rgba(155,77,255,0.08))' }}
        >
          <div
            className="absolute inset-0 opacity-15"
            style={{ backgroundImage: `url(https://readdy.ai/api/search-image?query=birthday%20party%20celebration%20cyberpunk%20neon%20lights%20dark%20room%20pink%20purple%20glow%20futuristic%20festive%20confetti%20streamers%20luxury%20vip%20event%20hall%20dark%20atmosphere&width=1200&height=400&seq=inv_banner01&orientation=landscape)`, backgroundSize: 'cover', backgroundPosition: 'center' }}
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(1,0,20,0.7), rgba(10,0,40,0.5))' }} />
          <div className="relative p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <span className="tag-line" style={{ background: '#ff006e' }} />
                <span className="font-mono-tech text-xs tracking-widest" style={{ color: '#ff006e' }}>ДЕНЬ РОЖДЕНИЯ</span>
              </div>
              <h2 className="section-title text-white mb-3">Пригласительные</h2>
              <p className="text-white/60 font-rajdhani text-base leading-relaxed mb-5">
                Создай уникальное пригласительное для гостей. Выбери тему, заполни данные
                и скачай <strong className="text-white">красивый PDF на русском</strong> для печати.
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                {THEMES.map((t) => (
                  <span key={t.id} className="px-3 py-1 rounded-full font-orbitron text-xs" style={{ background: `${t.primary}15`, border: `1px solid ${t.primary}40`, color: t.primary }}>
                    {t.label}
                  </span>
                ))}
              </div>
              <ul className="space-y-1.5 mb-6">
                {[
                  '3 эксклюзивных темы оформления',
                  'PDF на русском языке для печати',
                  'Скидка −20% в день рождения',
                  'Аренда всего клуба',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-white/70 font-rajdhani">
                    <i className="ri-check-line text-sm" style={{ color: '#ff006e' }} />
                    {item}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => { setOpen(true); setStep('theme'); }}
                className="btn-cyber-pink px-8 py-3 rounded-sm text-xs whitespace-nowrap"
              >
                <i className="ri-gift-2-line mr-2" />
                Создать пригласительное
              </button>
            </div>
            <div className="flex-shrink-0 grid grid-cols-2 gap-2 w-44">
              {THEMES.map((t) => (
                <div key={t.id} className="rounded-lg overflow-hidden" style={{ background: `linear-gradient(135deg, ${t.bg1}, ${t.bg2})`, border: `1px solid ${t.primary}50`, aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div className="text-center p-2">
                    <div className="font-orbitron font-black" style={{ fontSize: '10px', color: t.primary }}>PDX</div>
                    <div className="font-rajdhani text-white/50 mt-0.5" style={{ fontSize: '8px' }}>{t.label}</div>
                  </div>
                </div>
              ))}
              <div className="rounded-lg flex items-center justify-center" style={{ aspectRatio: '1', background: 'rgba(255,0,110,0.1)', border: '1px solid rgba(255,0,110,0.3)' }}>
                <i className="ri-add-line text-white/30 text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Modal wizard */}
        {open && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ background: 'rgba(1,0,20,0.95)' }}
            onClick={(e) => { if (e.target === e.currentTarget && !generated) handleReset(); }}
          >
            <div
              className="w-full max-w-2xl rounded-xl overflow-hidden"
              style={{ background: '#06001e', border: '1px solid rgba(255,0,110,0.35)', maxHeight: '95vh', overflowY: 'auto' }}
            >
              {/* Header */}
              <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4" style={{ background: '#06001e', borderBottom: '1px solid rgba(255,0,110,0.15)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 flex items-center justify-center rounded-sm" style={{ border: '1px solid rgba(255,0,110,0.4)', background: 'rgba(255,0,110,0.08)' }}>
                    <i className="ri-gift-2-line text-sm" style={{ color: '#ff006e' }} />
                  </div>
                  <div>
                    <div className="font-orbitron font-bold text-white text-sm tracking-wider">ПРИГЛАСИТЕЛЬНОЕ</div>
                    <div className="font-mono-tech text-xs text-white/40" style={{ fontSize: '10px' }}>
                      {step === 'theme' && 'Шаг 1: Выбор темы'}
                      {step === 'form' && 'Шаг 2: Данные праздника'}
                      {step === 'preview' && 'Шаг 3: Предпросмотр'}
                    </div>
                  </div>
                </div>
                <button onClick={handleReset} className="w-8 h-8 flex items-center justify-center cursor-pointer text-white/40 hover:text-white transition-colors rounded">
                  <i className="ri-close-line text-lg" />
                </button>
              </div>

              {/* Step indicators */}
              <div className="flex items-center px-6 pt-5 pb-3 gap-2">
                {(['theme', 'form', 'preview'] as const).map((s, i) => (
                  <div key={s} className="flex items-center gap-2 flex-1">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center font-orbitron font-bold text-xs flex-shrink-0"
                      style={{
                        background: step === s ? '#ff006e' : (['theme', 'form', 'preview'].indexOf(step) > i ? 'rgba(0,245,255,0.2)' : 'rgba(255,255,255,0.05)'),
                        border: `1px solid ${step === s ? '#ff006e' : 'rgba(255,255,255,0.1)'}`,
                        color: step === s ? '#fff' : 'rgba(255,255,255,0.3)',
                      }}
                    >
                      {i + 1}
                    </div>
                    {i < 2 && <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.1)' }} />}
                  </div>
                ))}
              </div>

              <div className="px-6 pb-6">
                {/* Step 1 */}
                {step === 'theme' && (
                  <div className="space-y-4">
                    <h3 className="font-orbitron font-bold text-white text-sm tracking-widest">ВЫБЕРИ ТЕМУ ОФОРМЛЕНИЯ</h3>
                    <div className="grid grid-cols-3 gap-3">
                      {THEMES.map((t) => (
                        <ThemeCard key={t.id} theme={t} selected={selectedTheme === t.id} onSelect={() => setSelectedTheme(t.id)} />
                      ))}
                    </div>
                    <button onClick={() => setStep('form')} className="btn-cyber-pink w-full py-3 rounded-sm text-xs mt-2 whitespace-nowrap">
                      Далее →
                    </button>
                  </div>
                )}

                {/* Step 2 */}
                {step === 'form' && (
                  <div className="space-y-4">
                    <h3 className="font-orbitron font-bold text-white text-sm tracking-widest">ДАННЫЕ ПРАЗДНИКА</h3>
                    <div>
                      <label className="font-mono-tech text-xs text-white/40 block mb-1.5" style={{ fontSize: '10px', letterSpacing: '1px' }}>ИМЯ ИМЕНИННИКА *</label>
                      <input name="name" value={form.name} onChange={handleChange} className="cyber-input" placeholder="Кто именинник?" required />
                    </div>
                    <div>
                      <label className="font-mono-tech text-xs text-white/40 block mb-1.5" style={{ fontSize: '10px', letterSpacing: '1px' }}>ДАТА И ВРЕМЯ ПРАЗДНИКА</label>
                      <input name="datetime" type="datetime-local" value={form.datetime} onChange={handleChange} className="cyber-input" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="font-mono-tech text-xs text-white/40 block mb-1.5" style={{ fontSize: '10px', letterSpacing: '1px' }}>ВАШ ТЕЛЕФОН</label>
                        <input name="phone" type="tel" value={form.phone} onChange={handleChange} className="cyber-input" placeholder="+7..." />
                      </div>
                      <div>
                        <label className="font-mono-tech text-xs text-white/40 block mb-1.5" style={{ fontSize: '10px', letterSpacing: '1px' }}>КОЛ-ВО ГОСТЕЙ</label>
                        <select name="guests" value={form.guests} onChange={handleChange} className="cyber-input cursor-pointer">
                          {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => (
                            <option key={n} value={String(n)}>{n}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="font-mono-tech text-xs text-white/40 block mb-1.5" style={{ fontSize: '10px', letterSpacing: '1px' }}>КТО ОТПРАВИТЕЛЬ</label>
                      <input name="sender" value={form.sender} onChange={handleChange} className="cyber-input" placeholder="Имя отправителя" />
                    </div>
                    <div>
                      <label className="font-mono-tech text-xs text-white/40 block mb-1.5" style={{ fontSize: '10px', letterSpacing: '1px' }}>ЛИЧНОЕ ПОЖЕЛАНИЕ</label>
                      <textarea name="message" value={form.message} onChange={handleChange} className="cyber-input resize-none" rows={2} placeholder="Напиши что-то особенное..." maxLength={200} />
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => setStep('theme')} className="btn-cyber-cyan flex-1 py-3 rounded-sm text-xs whitespace-nowrap">← Назад</button>
                      <button onClick={() => setStep('preview')} disabled={!form.name.trim()} className="btn-cyber-pink flex-1 py-3 rounded-sm text-xs disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap">
                        Предпросмотр →
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3 */}
                {step === 'preview' && (
                  <div className="space-y-4">
                    <h3 className="font-orbitron font-bold text-white text-sm tracking-widest">ПРЕДПРОСМОТР</h3>
                    <InvitationPreview form={form} theme={theme} />

                    {generated ? (
                      <div className="text-center py-4 rounded-lg" style={{ background: 'rgba(0,245,255,0.06)', border: '1px solid rgba(0,245,255,0.25)' }}>
                        <i className="ri-check-line text-2xl block mb-1" style={{ color: '#00f5ff' }} />
                        <div className="font-orbitron font-bold text-white text-sm mb-1">PDF скачан!</div>
                        <div className="font-rajdhani text-white/50 text-sm mb-3">Откройте файл и распечатайте на любом принтере</div>
                        <div className="flex justify-center gap-3">
                          <button onClick={handleDownload} disabled={downloading} className="btn-cyber-cyan px-5 py-2 rounded-sm text-xs whitespace-nowrap">
                            <i className="ri-download-line mr-1" />
                            {downloading ? 'Генерация...' : 'Скачать ещё раз'}
                          </button>
                          <button onClick={handleReset} className="btn-cyber-pink px-5 py-2 rounded-sm text-xs whitespace-nowrap">Новое →</button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-3">
                        <button onClick={() => setStep('form')} className="btn-cyber-cyan flex-1 py-3 rounded-sm text-xs whitespace-nowrap">← Изменить</button>
                        <button onClick={handleDownload} disabled={downloading} className="btn-cyber-pink flex-1 py-3 rounded-sm text-xs disabled:opacity-60 whitespace-nowrap">
                          <i className="ri-file-pdf-line mr-2" />
                          {downloading ? 'Генерация PDF...' : 'Скачать PDF'}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Invitations;
