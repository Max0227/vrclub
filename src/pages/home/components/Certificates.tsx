import { useState, useCallback, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { supabase } from '../../../lib/supabase';
import { certificates } from '../../../mocks/pricing';

const MAX_LINK = 'https://max.ru/u/f9LHodD0cOKWJo7eQiYHPywhtGUXtiX40o8Na8eR6jKCMNRpsNgDUk5doGg';
const MAX_ICON = 'https://storage.readdy-site.link/project_files/af3cd35d-3e8e-4232-8f1f-1d33bf236cc8/82d5ad42-8081-4413-a1d6-09b0aa2a0be7_MAX.jpg?v=ec55d078d68434f28e45c6897811f4ef';
const ADMIN_EMAIL = 'paradoxclub54@gmail.com';

const CERT_IMAGES: Record<number, string> = {
  1: '/images/certificates/cert-vr-30min.jpg',
  2: '/images/certificates/cert-vr-60min.jpg',
  3: '/images/certificates/cert-ps5.jpg',
  4: '/images/certificates/cert-moza.jpg',
};

const generateCertNumber = (): string => {
  const num = Math.floor(100000 + Math.random() * 900000).toString();
  return `PARADOX-2026-${num}`;
};

const generateActivationCode = (): string =>
  Math.floor(1000 + Math.random() * 9000).toString();

const hexToRgb = (hex: string): [number, number, number] => [
  parseInt(hex.slice(1, 3), 16),
  parseInt(hex.slice(3, 5), 16),
  parseInt(hex.slice(5, 7), 16),
];

// ── Beautiful premium certificate canvas ────────────────────────────────────────────
const drawCertCanvas = (
  certNum: string,
  title: string,
  price: number,
  recipient: string,
  sender: string,
  wish: string,
  color: string,
): HTMLCanvasElement => {
  const W = 2480;
  const H = 1748;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;
  const [r, g, b] = hexToRgb(color);

  // ── Rich multi-layer background ──
  const bgGrad = ctx.createRadialGradient(W * 0.3, H * 0.4, 0, W * 0.5, H * 0.5, W * 0.9);
  bgGrad.addColorStop(0, '#050018');
  bgGrad.addColorStop(0.3, '#080028');
  bgGrad.addColorStop(0.7, '#040015');
  bgGrad.addColorStop(1, '#010008');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // Secondary diagonal glow
  const glow2 = ctx.createLinearGradient(0, H, W, 0);
  glow2.addColorStop(0, `rgba(${r},${g},${b},0.06)`);
  glow2.addColorStop(0.4, 'transparent');
  glow2.addColorStop(0.6, `rgba(155,77,255,0.04)`);
  glow2.addColorStop(1, 'transparent');
  ctx.fillStyle = glow2;
  ctx.fillRect(0, 0, W, H);

  // ── Fine grid ──
  ctx.strokeStyle = `rgba(${r},${g},${b},0.06)`;
  ctx.lineWidth = 0.8;
  for (let x = 0; x < W; x += 70) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = 0; y < H; y += 70) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

  // ── Outer frame (double border) ──
  const outerGrad = ctx.createLinearGradient(0, 0, W, H);
  outerGrad.addColorStop(0, color);
  outerGrad.addColorStop(0.4, `rgba(${r},${g},${b},0.6)`);
  outerGrad.addColorStop(0.7, color);
  outerGrad.addColorStop(1, `rgba(${r},${g},${b},0.4)`);
  ctx.strokeStyle = outerGrad;
  ctx.lineWidth = 5;
  ctx.strokeRect(15, 15, W - 30, H - 30);

  ctx.strokeStyle = `rgba(${r},${g},${b},0.2)`;
  ctx.lineWidth = 1;
  ctx.strokeRect(26, 26, W - 52, H - 52);

  // ── Gradient side panels ──
  // Left
  const leftPanel = ctx.createLinearGradient(0, 0, 220, 0);
  leftPanel.addColorStop(0, `rgba(${r},${g},${b},0.12)`);
  leftPanel.addColorStop(0.6, `rgba(${r},${g},${b},0.05)`);
  leftPanel.addColorStop(1, 'transparent');
  ctx.fillStyle = leftPanel;
  ctx.fillRect(0, 0, 220, H);

  // ── Top & bottom accent lines ──
  [14, 22].forEach((o, i) => {
    const lg = ctx.createLinearGradient(0, 0, W, 0);
    lg.addColorStop(0, 'transparent');
    lg.addColorStop(0.08, i === 0 ? color : `rgba(${r},${g},${b},0.3)`);
    lg.addColorStop(0.92, i === 0 ? color : `rgba(${r},${g},${b},0.3)`);
    lg.addColorStop(1, 'transparent');
    ctx.strokeStyle = lg;
    ctx.lineWidth = i === 0 ? 4 : 1.5;
    ctx.beginPath(); ctx.moveTo(0, o); ctx.lineTo(W, o); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, H - o); ctx.lineTo(W, H - o); ctx.stroke();
  });

  // ── Ornamental corner accents ──
  const CL = 120;
  const CL2 = 70;
  const corners: [number, number, 1 | -1, 1 | -1][] = [
    [22, 22, 1, 1], [W - 22, 22, -1, 1],
    [22, H - 22, 1, -1], [W - 22, H - 22, -1, -1],
  ];
  corners.forEach(([cx, cy, dx, dy]) => {
    // Main L-mark
    ctx.strokeStyle = color;
    ctx.lineWidth = 5;
    ctx.shadowColor = color;
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.moveTo(cx + dx * CL, cy);
    ctx.lineTo(cx, cy);
    ctx.lineTo(cx, cy + dy * CL);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Inner L-mark (thinner)
    ctx.strokeStyle = `rgba(${r},${g},${b},0.35)`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx + dx * CL2, cy + dy * 12);
    ctx.lineTo(cx + dx * 12, cy + dy * 12);
    ctx.lineTo(cx + dx * 12, cy + dy * CL2);
    ctx.stroke();

    // Corner dot
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 16;
    ctx.beginPath();
    ctx.arc(cx, cy, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Diamond decoration along L
    ctx.fillStyle = `rgba(${r},${g},${b},0.6)`;
    ctx.save();
    ctx.translate(cx + dx * (CL * 0.5), cy);
    ctx.rotate(Math.PI / 4);
    ctx.fillRect(-5, -5, 10, 10);
    ctx.restore();
    ctx.save();
    ctx.translate(cx, cy + dy * (CL * 0.5));
    ctx.rotate(Math.PI / 4);
    ctx.fillRect(-5, -5, 10, 10);
    ctx.restore();
  });

  // ── Left sidebar vertical text ──
  ctx.save();
  ctx.translate(88, H / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.font = '600 30px Arial';
  ctx.fillStyle = `rgba(${r},${g},${b},0.45)`;
  ctx.textAlign = 'center';
  ctx.letterSpacing = '10px';
  ctx.fillText('PARADOX VR CLUB  ✦  НОВОСИБИРСК  ✦  2026', 0, 0);
  ctx.restore();

  // Sidebar divider
  const sideDiv = ctx.createLinearGradient(0, 60, 0, H - 60);
  sideDiv.addColorStop(0, 'transparent');
  sideDiv.addColorStop(0.2, `rgba(${r},${g},${b},0.4)`);
  sideDiv.addColorStop(0.8, `rgba(${r},${g},${b},0.4)`);
  sideDiv.addColorStop(1, 'transparent');
  ctx.strokeStyle = sideDiv;
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(180, 60); ctx.lineTo(180, H - 60); ctx.stroke();

  const startX = 240;
  const contentW = W - startX - 80;

  ctx.textAlign = 'left';
  ctx.shadowBlur = 0;

  // ── "ПОДАРОЧНЫЙ СЕРТИФИКАТ" label ──
  ctx.font = '400 28px Arial';
  ctx.fillStyle = `rgba(${r},${g},${b},0.55)`;
  ctx.letterSpacing = '8px';
  ctx.fillText('✦  ПОДАРОЧНЫЙ  СЕРТИФИКАТ  ✦', startX, 96);

  // Top accent line (gradient)
  const topAccent = ctx.createLinearGradient(startX, 0, startX + 1800, 0);
  topAccent.addColorStop(0, color);
  topAccent.addColorStop(0.5, `rgba(${r},${g},${b},0.3)`);
  topAccent.addColorStop(1, 'transparent');
  ctx.strokeStyle = topAccent;
  ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.moveTo(startX, 122); ctx.lineTo(startX + contentW, 122); ctx.stroke();

  // ── PARADOX watermark (ghost behind) ──
  ctx.font = 'bold 320px Arial';
  ctx.fillStyle = 'rgba(255,255,255,0.025)';
  ctx.letterSpacing = '-5px';
  ctx.fillText('PDX', startX - 20, 520);

  // ── PARADOX main text ──
  ctx.font = 'bold 210px Arial';
  ctx.fillStyle = '#ffffff';
  ctx.letterSpacing = '4px';
  ctx.shadowColor = 'rgba(255,255,255,0.1)';
  ctx.shadowBlur = 20;
  ctx.fillText('PARADOX', startX, 420);
  ctx.shadowBlur = 0;

  // ── VR CLUB with glow ──
  ctx.font = 'bold 80px Arial';
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 40;
  ctx.letterSpacing = '6px';
  ctx.fillText('VR CLUB', startX, 508);
  ctx.shadowBlur = 0;

  // ── Main divider (multi-color) ──
  const mainDiv = ctx.createLinearGradient(startX, 0, startX + contentW, 0);
  mainDiv.addColorStop(0, color);
  mainDiv.addColorStop(0.3, `rgba(255,0,110,0.7)`);
  mainDiv.addColorStop(0.7, `rgba(${r},${g},${b},0.5)`);
  mainDiv.addColorStop(1, 'transparent');
  ctx.strokeStyle = mainDiv;
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(startX, 560); ctx.lineTo(startX + contentW, 560); ctx.stroke();

  // Small diamond on divider
  ctx.fillStyle = color;
  ctx.save();
  ctx.translate(startX + 80, 560);
  ctx.rotate(Math.PI / 4);
  ctx.fillRect(-7, -7, 14, 14);
  ctx.restore();

  // ── Certificate number section ──
  ctx.font = '400 22px Arial';
  ctx.fillStyle = 'rgba(200,200,200,0.38)';
  ctx.letterSpacing = '6px';
  ctx.fillText('НОМЕР  СЕРТИФИКАТА', startX, 630);

  ctx.shadowColor = color;
  ctx.shadowBlur = 45;
  ctx.font = 'bold 86px Arial';
  ctx.fillStyle = color;
  ctx.letterSpacing = '3px';
  ctx.fillText(certNum, startX, 738);
  ctx.shadowBlur = 0;

  // Barcode-style decoration under cert number
  const barStart = startX;
  for (let i = 0; i < 60; i++) {
    const bw = 3 + Math.floor(Math.random() * 5);
    const bh = 20 + Math.floor(Math.random() * 40);
    ctx.fillStyle = i % 2 === 0 ? `rgba(${r},${g},${b},0.3)` : `rgba(${r},${g},${b},0.08)`;
    ctx.fillRect(barStart + i * 18, 762, bw, bh);
  }

  // ── Cert divider ──
  const certDiv = ctx.createLinearGradient(startX, 0, startX + 1600, 0);
  certDiv.addColorStop(0, `rgba(${r},${g},${b},0.55)`);
  certDiv.addColorStop(0.6, `rgba(${r},${g},${b},0.2)`);
  certDiv.addColorStop(1, 'transparent');
  ctx.strokeStyle = certDiv;
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(startX, 820); ctx.lineTo(startX + 1600, 820); ctx.stroke();

  // ── Service section ──
  ctx.font = '400 22px Arial';
  ctx.fillStyle = 'rgba(200,200,200,0.38)';
  ctx.letterSpacing = '6px';
  ctx.fillText('УСЛУГА  /  SERVICE', startX, 880);

  ctx.font = 'bold 82px Arial';
  ctx.fillStyle = '#ffffff';
  ctx.letterSpacing = '2px';
  ctx.shadowColor = 'rgba(255,255,255,0.1)';
  ctx.shadowBlur = 15;
  ctx.fillText(title, startX, 978);
  ctx.shadowBlur = 0;

  // ── Price (premium right-aligned with box) ──
  const priceStr = `${price} ₽`;
  ctx.font = 'bold 96px Arial';
  const priceW = ctx.measureText(priceStr).width;
  const priceBoxX = W - 120 - priceW - 40;
  const priceBoxY = 895;

  // Price box background
  ctx.fillStyle = `rgba(${r},${g},${b},0.08)`;
  const roundRectPath = (x: number, y: number, w: number, h: number, rad: number) => {
    ctx.beginPath();
    ctx.moveTo(x + rad, y);
    ctx.lineTo(x + w - rad, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + rad);
    ctx.lineTo(x + w, y + h - rad);
    ctx.quadraticCurveTo(x + w, y + h, x + w - rad, y + h);
    ctx.lineTo(x + rad, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - rad);
    ctx.lineTo(x, y + rad);
    ctx.quadraticCurveTo(x, y, x + rad, y);
    ctx.closePath();
  };
  roundRectPath(priceBoxX - 30, priceBoxY - 70, priceW + 80, 100, 8);
  ctx.fill();
  ctx.strokeStyle = `rgba(${r},${g},${b},0.5)`;
  ctx.lineWidth = 1.5;
  roundRectPath(priceBoxX - 30, priceBoxY - 70, priceW + 80, 100, 8);
  ctx.stroke();

  ctx.textAlign = 'right';
  ctx.font = 'bold 96px Arial';
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 28;
  ctx.fillText(priceStr, W - 110, 978);
  ctx.shadowBlur = 0;

  // "НОМИНАЛ" label above price
  ctx.font = '400 18px Arial';
  ctx.fillStyle = `rgba(${r},${g},${b},0.5)`;
  ctx.letterSpacing = '4px';
  ctx.fillText('НОМИНАЛ', W - 110, 902);

  ctx.textAlign = 'left';

  // ── Recipient / Sender ──
  const hasRecipient = !!recipient;
  const hasSender = !!sender;

  if (hasRecipient || hasSender) {
    const labelY = 1060;
    const valY = 1118;

    if (hasRecipient) {
      ctx.font = '400 20px Arial';
      ctx.fillStyle = 'rgba(200,200,200,0.35)';
      ctx.letterSpacing = '5px';
      ctx.fillText('КОМУ  /  TO', startX, labelY);
      ctx.font = 'bold 54px Arial';
      ctx.fillStyle = '#ffffff';
      ctx.letterSpacing = '1px';
      ctx.fillText(recipient, startX, valY);
    }

    if (hasSender) {
      const col2 = startX + 760;
      ctx.font = '400 20px Arial';
      ctx.fillStyle = 'rgba(200,200,200,0.35)';
      ctx.letterSpacing = '5px';
      ctx.fillText('ОТ  /  FROM', col2, labelY);
      ctx.font = 'bold 54px Arial';
      ctx.fillStyle = '#ffffff';
      ctx.letterSpacing = '1px';
      ctx.fillText(sender, col2, valY);
    }
  }

  // ── Wish ──
  if (wish) {
    const wishY = hasRecipient || hasSender ? 1200 : 1080;
    const shortWish = wish.length > 90 ? wish.slice(0, 90) + '...' : wish;

    // Wish box background
    ctx.fillStyle = `rgba(${r},${g},${b},0.04)`;
    roundRectPath(startX - 10, wishY - 44, contentW + 10, 70, 4);
    ctx.fill();
    ctx.strokeStyle = `rgba(${r},${g},${b},0.18)`;
    ctx.lineWidth = 1;
    roundRectPath(startX - 10, wishY - 44, contentW + 10, 70, 4);
    ctx.stroke();

    ctx.font = 'italic 36px Arial';
    ctx.fillStyle = 'rgba(210,210,210,0.55)';
    ctx.letterSpacing = '0px';
    ctx.fillText(`"${shortWish}"`, startX + 10, wishY);
  }

  // ── Holographic-style seal (right side, mid-bottom area) ──
  const sealX = W - 320;
  const sealY = hasRecipient || hasSender ? 1120 : 1020;
  const sealR = 130;

  // Outer ring
  ctx.beginPath();
  ctx.arc(sealX, sealY, sealR, 0, Math.PI * 2);
  ctx.strokeStyle = `rgba(${r},${g},${b},0.5)`;
  ctx.lineWidth = 3;
  ctx.stroke();

  // Inner rings
  [100, 76].forEach((rad, i) => {
    ctx.beginPath();
    ctx.arc(sealX, sealY, rad, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${r},${g},${b},${i === 0 ? 0.25 : 0.12})`;
    ctx.lineWidth = 1;
    ctx.stroke();
  });

  // Radiating lines
  for (let angle = 0; angle < 360; angle += 15) {
    const rad = (angle * Math.PI) / 180;
    ctx.strokeStyle = `rgba(${r},${g},${b},0.12)`;
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(sealX + Math.cos(rad) * 78, sealY + Math.sin(rad) * 78);
    ctx.lineTo(sealX + Math.cos(rad) * 126, sealY + Math.sin(rad) * 126);
    ctx.stroke();
  }

  // Seal center content
  ctx.font = 'bold 16px Arial';
  ctx.fillStyle = `rgba(${r},${g},${b},0.9)`;
  ctx.textAlign = 'center';
  ctx.letterSpacing = '3px';
  ctx.fillText('PARADOX', sealX, sealY - 22);
  ctx.font = 'bold 28px Arial';
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 15;
  ctx.fillText('✓', sealX, sealY + 14);
  ctx.shadowBlur = 0;
  ctx.font = '400 13px Arial';
  ctx.fillStyle = `rgba(${r},${g},${b},0.7)`;
  ctx.letterSpacing = '2px';
  ctx.fillText('ДЕЙСТВИТЕЛЕН', sealX, sealY + 40);
  ctx.textAlign = 'left';

  // ── Bottom bar ──
  const barY = H - 185;
  const barGrad = ctx.createLinearGradient(0, barY, 0, H);
  barGrad.addColorStop(0, `rgba(${r},${g},${b},0.07)`);
  barGrad.addColorStop(1, `rgba(${r},${g},${b},0.16)`);
  ctx.fillStyle = barGrad;
  ctx.fillRect(0, barY, W, H - barY);

  // Bar top divider (multi-color)
  const barLine = ctx.createLinearGradient(0, barY, W, barY);
  barLine.addColorStop(0, 'transparent');
  barLine.addColorStop(0.1, `rgba(${r},${g},${b},0.7)`);
  barLine.addColorStop(0.5, color);
  barLine.addColorStop(0.9, `rgba(${r},${g},${b},0.7)`);
  barLine.addColorStop(1, 'transparent');
  ctx.strokeStyle = barLine;
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, barY); ctx.lineTo(W, barY); ctx.stroke();

  const expire = new Date();
  expire.setFullYear(expire.getFullYear() + 1);

  ctx.textAlign = 'left';
  ctx.font = 'bold 36px Arial';
  ctx.fillStyle = color;
  ctx.letterSpacing = '4px';
  ctx.shadowColor = color;
  ctx.shadowBlur = 12;
  ctx.fillText('PARADOX VR CLUB', startX, barY + 68);
  ctx.shadowBlur = 0;

  ctx.font = '28px Arial';
  ctx.fillStyle = 'rgba(210,210,210,0.5)';
  ctx.letterSpacing = '1px';
  ctx.fillText(
    `Действителен до ${expire.toLocaleDateString('ru-RU')}  ✦  +7 923 244-02-20  ✦  ${ADMIN_EMAIL}`,
    startX, barY + 118,
  );
  ctx.font = '22px Arial';
  ctx.fillStyle = 'rgba(180,180,200,0.3)';
  ctx.fillText('г. Новосибирск, ул. Виктора Шевелева, 24  ✦  Ежедневно 12:00–22:00', startX, barY + 155);

  // Validity watermark
  ctx.textAlign = 'right';
  ctx.font = 'bold 110px Arial';
  ctx.fillStyle = 'rgba(255,255,255,0.025)';
  ctx.letterSpacing = '0px';
  ctx.fillText('12 МЕС', W - 60, H - 25);

  // Activated stamp (premium box)
  const stampX = W - 420;
  const stampY = barY + 14;
  const stampW = 340;
  const stampH = 130;

  ctx.fillStyle = `rgba(${r},${g},${b},0.06)`;
  roundRectPath(stampX, stampY, stampW, stampH, 6);
  ctx.fill();
  ctx.strokeStyle = `rgba(${r},${g},${b},0.55)`;
  ctx.lineWidth = 2;
  roundRectPath(stampX, stampY, stampW, stampH, 6);
  ctx.stroke();

  ctx.font = '400 14px Arial';
  ctx.fillStyle = `rgba(${r},${g},${b},0.6)`;
  ctx.textAlign = 'center';
  ctx.letterSpacing = '4px';
  ctx.fillText('ОПЛАЧЕН  ✦  АКТИВИРОВАН', stampX + stampW / 2, stampY + 36);

  ctx.font = 'bold 32px Arial';
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 10;
  ctx.fillText('✓  ДЕЙСТВИТЕЛЕН', stampX + stampW / 2, stampY + 86);
  ctx.shadowBlur = 0;

  ctx.font = '400 13px Arial';
  ctx.fillStyle = `rgba(${r},${g},${b},0.4)`;
  ctx.letterSpacing = '2px';
  ctx.fillText('PARADOX VR CLUB 2026', stampX + stampW / 2, stampY + 112);

  return canvas;
};

const downloadCertPdf = async (
  certNum: string,
  title: string,
  price: number,
  recipient: string,
  sender: string,
  wish: string,
  color: string,
): Promise<void> => {
  const canvas = drawCertCanvas(certNum, title, price, recipient, sender, wish, color);
  const imgData = canvas.toDataURL('image/jpeg', 0.96);
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  doc.addImage(imgData, 'JPEG', 0, 0, 297, 210);
  const pdfBlob = doc.output('blob');
  const url = URL.createObjectURL(pdfBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${certNum}.pdf`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 200);
};

const sendCertEmail = async (
  certNum: string,
  activationCode: string,
  certTitle: string,
  certPrice: number,
  recipient: string,
  phone: string,
  clientEmail: string,
  isRegenerated = false,
): Promise<{ clientSent: boolean }> => {
  try {
    const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL as string;
    const supabaseKey = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY as string;

    const res = await fetch(`${supabaseUrl}/functions/v1/send-cert-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({
        certNum,
        activationCode,
        certTitle,
        certPrice,
        recipient,
        phone,
        clientEmail: clientEmail || null,
        isRegenerated,
        sendToAdmin: true,
      }),
    });

    const data = await res.json();
    const clientSent = !!clientEmail && !!data?.results?.client?.success;
    return { clientSent };
  } catch {
    return { clientSent: false };
  }
};

// ── Timer component ────────────────────────────────────────────────────────
const ExpiryTimer = ({ expiresAt, onExpired }: { expiresAt: string; onExpired: () => void }) => {
  const [remaining, setRemaining] = useState('');
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const calc = () => {
      const diff = new Date(expiresAt).getTime() - Date.now();
      if (diff <= 0) { setExpired(true); onExpired(); return; }
      const m = Math.floor(diff / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setRemaining(`${m}:${s.toString().padStart(2, '0')}`);
    };
    calc();
    const iv = setInterval(calc, 1000);
    return () => clearInterval(iv);
  }, [expiresAt, onExpired]);

  if (expired) return null;
  const isLow = parseInt(remaining.split(':')[0] ?? '60') < 10;
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: isLow ? 'rgba(255,0,110,0.08)' : 'rgba(0,245,255,0.07)', border: `1px solid ${isLow ? 'rgba(255,0,110,0.3)' : 'rgba(0,245,255,0.25)'}` }}>
      <i className="ri-time-line text-xs" style={{ color: isLow ? '#ff006e' : '#00f5ff' }} />
      <span className="font-mono-tech text-xs" style={{ color: isLow ? '#ff006e' : '#00f5ff' }}>
        Код действует: {remaining}
      </span>
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────
const Certificates = () => {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [form, setForm] = useState({ recipient: '', sender: '', phone: '', email: '', wish: '' });
  const [certNum, setCertNum] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [stage, setStage] = useState<'select' | 'form' | 'generated' | 'regenerated' | 'unlocked'>('select');
  const [activationInput, setActivationInput] = useState('');
  const [activationError, setActivationError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [clientEmailSent, setClientEmailSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [timerExpired, setTimerExpired] = useState(false);

  // Restore from session
  useEffect(() => {
    const saved = sessionStorage.getItem('pdx_cert');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data && data.certNum && new Date(data.expiresAt).getTime() > Date.now()) {
          setCertNum(data.certNum);
          setExpiresAt(data.expiresAt);
          setActiveIdx(data.activeIdx);
          setForm(data.form);
          setStage('generated');
        }
      } catch { /* ignore */ }
    }
  }, []);

  const saveToCertSession = (cn: string, ea: string, ai: number, f: typeof form) => {
    sessionStorage.setItem('pdx_cert', JSON.stringify({ certNum: cn, expiresAt: ea, activeIdx: ai, form: f }));
  };

  const clearCertSession = () => sessionStorage.removeItem('pdx_cert');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleGenerate = useCallback(async () => {
    if (activeIdx === null) return;
    setLoading(true);
    try {
      const num = generateCertNumber();
      const code = generateActivationCode();
      const expires = new Date(Date.now() + 3600000).toISOString(); // 1 hour
      const cert = certificates[activeIdx];

      const { error } = await supabase.from('cert_requests').insert({
        cert_num: num,
        activation_code: code,
        cert_type: cert.id.toString(),
        cert_title: cert.title,
        price: cert.price,
        recipient: form.recipient,
        sender: form.sender,
        phone: form.phone,
        wish: form.wish,
        color: cert.color,
        expires_at: expires,
        status: 'pending',
      });

      if (error) throw error;

      setCertNum(num);
      setExpiresAt(expires);
      setStage('generated');
      setActivationInput('');
      setActivationError('');
      setAttempts(0);
      setTimerExpired(false);
      setEmailSent(false);
      setClientEmailSent(false);

      saveToCertSession(num, expires, activeIdx, form);
      const { clientSent } = await sendCertEmail(num, code, cert.title, cert.price, form.recipient, form.phone, form.email);
      setEmailSent(true);
      setClientEmailSent(clientSent);
    } catch {
      setActivationError('Ошибка соединения. Попробуйте снова.');
    } finally {
      setLoading(false);
    }
  }, [activeIdx, form]);

  const handleRegenerateExpired = useCallback(async () => {
    if (activeIdx === null) return;
    setLoading(true);
    try {
      const newNum = generateCertNumber();
      const newCode = generateActivationCode();
      const newExpires = new Date(Date.now() + 3600000).toISOString();
      const cert = certificates[activeIdx];

      const { error } = await supabase
        .from('cert_requests')
        .update({
          cert_num: newNum,
          activation_code: newCode,
          expires_at: newExpires,
          status: 'pending',
        })
        .eq('cert_num', certNum);

      if (error) throw error;

      setCertNum(newNum);
      setExpiresAt(newExpires);
      setStage('regenerated');
      setActivationInput('');
      setActivationError('');
      setAttempts(0);
      setTimerExpired(false);
      setEmailSent(false);
      setClientEmailSent(false);

      saveToCertSession(newNum, newExpires, activeIdx, form);
      const { clientSent } = await sendCertEmail(newNum, newCode, cert.title, cert.price, form.recipient, form.phone, form.email, true);
      setEmailSent(true);
      setClientEmailSent(clientSent);
    } catch {
      setActivationError('Ошибка. Попробуйте снова.');
    } finally {
      setLoading(false);
    }
  }, [activeIdx, certNum, form]);

  const handleActivate = useCallback(async () => {
    if (attempts >= 5) {
      setActivationError('Превышено количество попыток. Обратитесь к администратору.');
      return;
    }
    setVerifying(true);
    setActivationError('');
    try {
      const { data, error } = await supabase
        .from('cert_requests')
        .select('*')
        .eq('cert_num', certNum)
        .maybeSingle();

      if (error || !data) {
        setActivationError('Сертификат не найден. Попробуйте сформировать заново.');
        return;
      }

      if (data.status === 'activated') {
        setActivationError('Этот сертификат уже был активирован ранее.');
        return;
      }

      if (new Date(data.expires_at).getTime() < Date.now()) {
        setTimerExpired(true);
        setActivationError('Срок действия кода истёк. Запросите новый код.');
        return;
      }

      if (data.activation_code !== activationInput.trim()) {
        const left = 4 - attempts;
        setAttempts((p) => p + 1);
        setActivationError(`Неверный код. Осталось попыток: ${left}`);
        return;
      }

      // Correct code!
      await supabase.from('cert_requests').update({ status: 'activated' }).eq('cert_num', certNum);
      clearCertSession();
      setStage('unlocked');
    } catch {
      setActivationError('Ошибка проверки. Попробуйте ещё раз.');
    } finally {
      setVerifying(false);
    }
  }, [activationInput, certNum, attempts]);

  const handleDownload = useCallback(async () => {
    if (activeIdx === null) return;
    setDownloading(true);
    try {
      const cert = certificates[activeIdx];
      await downloadCertPdf(certNum, cert.title, cert.price, form.recipient, form.sender, form.wish, cert.color);
    } finally {
      setDownloading(false);
    }
  }, [activeIdx, certNum, form]);

  const handleReset = useCallback(() => {
    clearCertSession();
    setActiveIdx(null);
    setForm({ recipient: '', sender: '', phone: '', email: '', wish: '' });
    setCertNum('');
    setExpiresAt('');
    setStage('select');
    setActivationInput('');
    setActivationError('');
    setAttempts(0);
    setEmailSent(false);
    setClientEmailSent(false);
    setTimerExpired(false);
  }, []);

  const activeCert = activeIdx !== null ? certificates[activeIdx] : null;

  return (
    <section id="certificates" className="relative py-24 px-4">
      <div className="absolute top-1/3 left-1/2 w-96 h-96 rounded-full pointer-events-none" style={{ transform: 'translate(-50%, -50%)', background: 'radial-gradient(circle, rgba(155,77,255,0.07) 0%, transparent 70%)', filter: 'blur(40px)' }} />

      <div className="max-w-6xl mx-auto relative">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="tag-line" />
            <span className="font-mono-tech text-xs tracking-widest" style={{ color: '#00f5ff' }}>ПОДАРКИ</span>
            <span className="tag-line" />
          </div>
          <h2 className="section-title text-white mb-3">Подарочные сертификаты</h2>
          <p className="text-white/50 font-rajdhani text-lg max-w-md mx-auto">
            Уникальный номер сертификата. Скачивание разблокируется только после подтверждения оплаты администратором — ваш сертификат в безопасности.
          </p>
        </div>

        {/* Certificate cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
          {certificates.map((cert, idx) => {
            const isActive = activeIdx === idx;
            return (
              <div
                key={cert.id}
                onClick={() => { setActiveIdx(idx); setStage('form'); setEmailSent(false); clearCertSession(); }}
                className="cursor-pointer group relative rounded-lg overflow-hidden transition-all duration-400"
                style={{
                  border: `1px solid ${isActive ? cert.color : `${cert.color}30`}`,
                  boxShadow: isActive ? `0 0 30px ${cert.color}40, 0 0 60px ${cert.color}15` : 'none',
                  transform: isActive ? 'translateY(-6px) scale(1.02)' : '',
                  background: 'rgba(1,0,20,0.9)',
                }}
              >
                <div className="relative h-44 overflow-hidden">
                  <img src={CERT_IMAGES[cert.id]} alt={cert.title} className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(1,0,20,0.2) 0%, rgba(1,0,20,0.7) 100%)' }} />
                  <div className="absolute inset-0 opacity-20" style={{ background: `radial-gradient(circle at 50% 50%, ${cert.color}, transparent 70%)` }} />
                  <div className="absolute top-3 right-3 font-orbitron font-black text-lg leading-none px-3 py-1.5 rounded-sm" style={{ background: 'rgba(1,0,20,0.85)', border: `1px solid ${cert.color}`, color: cert.color, boxShadow: `0 0 12px ${cert.color}40` }}>
                    {cert.price}<span className="text-xs ml-0.5">₽</span>
                  </div>
                  {isActive && (
                    <div className="absolute top-3 left-3 w-6 h-6 rounded-full flex items-center justify-center" style={{ background: cert.color }}>
                      <i className="ri-check-line text-xs text-black font-bold" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="w-full h-px mb-3" style={{ background: `linear-gradient(90deg, ${cert.color}, transparent)`, opacity: isActive ? 1 : 0.3 }} />
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-7 h-7 flex items-center justify-center rounded-sm flex-shrink-0" style={{ background: `${cert.color}15`, border: `1px solid ${cert.color}40` }}>
                      <i className={`${cert.icon} text-sm`} style={{ color: cert.color }} />
                    </div>
                    <div>
                      <div className="font-orbitron font-bold text-white text-sm leading-tight">{cert.title}</div>
                      <div className="font-mono-tech text-xs" style={{ color: `${cert.color}99` }}>{cert.subtitle}</div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="font-mono-tech text-xs text-white/30">Срок: 12 мес.</span>
                    <span className="font-orbitron text-xs cursor-pointer" style={{ color: cert.color }}>{isActive ? 'Выбран ✓' : 'Выбрать →'}</span>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: `linear-gradient(90deg, transparent, ${cert.color}, transparent)`, opacity: isActive ? 1 : 0 }} />
              </div>
            );
          })}
        </div>

        {/* Stages */}
        {activeIdx !== null && (
          <div className="max-w-xl mx-auto">

            {/* Stage: Form */}
            {stage === 'form' && (
              <div className="rounded-lg p-7 relative overflow-hidden" style={{ background: 'rgba(1,0,20,0.92)', border: `1px solid ${certificates[activeIdx].color}40`, boxShadow: `0 0 40px ${certificates[activeIdx].color}15` }}>
                <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${certificates[activeIdx].color}, transparent)` }} />
                <h3 className="font-orbitron font-bold text-white text-sm mb-2 tracking-widest uppercase">Оформить сертификат</h3>
                <p className="font-rajdhani text-white/40 text-sm mb-5">Заполните данные — после оплаты администратор пришлёт 4-значный код. Укажите email клиента, чтобы он автоматически получил номер своего сертификата</p>
                <div className="space-y-4">
                  <div>
                    <label className="font-mono-tech text-xs text-white/40 block mb-1.5" style={{ fontSize: '10px', letterSpacing: '1px' }}>ИМЯ ПОЛУЧАТЕЛЯ *</label>
                    <input name="recipient" value={form.recipient} onChange={handleChange} className="cyber-input" placeholder="Кому подарок?" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="font-mono-tech text-xs text-white/40 block mb-1.5" style={{ fontSize: '10px', letterSpacing: '1px' }}>ИМЯ ДАРИТЕЛЯ</label>
                      <input name="sender" value={form.sender} onChange={handleChange} className="cyber-input" placeholder="От кого?" />
                    </div>
                    <div>
                      <label className="font-mono-tech text-xs text-white/40 block mb-1.5" style={{ fontSize: '10px', letterSpacing: '1px' }}>ТЕЛЕФОН</label>
                      <input name="phone" value={form.phone} onChange={handleChange} className="cyber-input" placeholder="+7..." type="tel" />
                    </div>
                  </div>
                  <div>
                    <label className="font-mono-tech text-xs text-white/40 block mb-1.5" style={{ fontSize: '10px', letterSpacing: '1px' }}>
                      EMAIL КЛИЕНТА <span style={{ color: 'rgba(0,245,255,0.5)' }}>(получит номер сертификата)</span>
                    </label>
                    <input
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      className="cyber-input"
                      placeholder="example@mail.ru"
                      type="email"
                    />
                  </div>
                  <div>
                    <label className="font-mono-tech text-xs text-white/40 block mb-1.5" style={{ fontSize: '10px', letterSpacing: '1px' }}>ПОЖЕЛАНИЕ</label>
                    <textarea name="wish" value={form.wish} onChange={handleChange} className="cyber-input resize-none" rows={2} placeholder="Пожелание получателю..." maxLength={200} />
                  </div>
                  <button onClick={handleGenerate} disabled={!form.recipient || loading} className="btn-cyber-pink w-full py-3.5 rounded-sm text-xs font-orbitron tracking-widest disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap">
                    {loading ? <><i className="ri-loader-4-line mr-2 animate-spin" />Создаём...</> : <><i className="ri-gift-line mr-2" />Сформировать сертификат</>}
                  </button>
                </div>
              </div>
            )}

            {/* Stage: Generated */}
            {(stage === 'generated' || stage === 'regenerated') && activeCert && (
              <div className="rounded-lg overflow-hidden" style={{ background: 'rgba(1,0,20,0.95)', border: '1px solid rgba(0,245,255,0.3)', boxShadow: '0 0 40px rgba(0,245,255,0.1)' }}>
                <div className="p-6 text-center" style={{ borderBottom: '1px solid rgba(0,245,255,0.1)' }}>
                  {stage === 'regenerated' && (
                    <div className="mb-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: 'rgba(255,165,0,0.08)', border: '1px solid rgba(255,165,0,0.3)' }}>
                      <i className="ri-refresh-line text-xs" style={{ color: '#ffa500' }} />
                      <span className="font-mono-tech text-xs" style={{ color: '#ffa500' }}>Сертификат перевыпущен — новый номер и код</span>
                    </div>
                  )}
                  <div className="font-mono-tech text-white/30 text-xs tracking-widest mb-2">НОМЕР СЕРТИФИКАТА</div>
                  <div className="font-orbitron font-black text-xl sm:text-2xl mb-1 break-all" style={{ color: '#00f5ff', textShadow: '0 0 20px rgba(0,245,255,0.5)' }}>{certNum}</div>
                  <div className="w-24 h-px mx-auto my-3" style={{ background: 'linear-gradient(90deg, transparent, #00f5ff, transparent)' }} />
                  <div className="font-rajdhani text-white/60 text-sm">
                    {activeCert.title} — <strong className="text-white">{activeCert.price} ₽</strong>
                  </div>
                  <div className="font-rajdhani text-white/60 text-sm mt-0.5">
                    Получатель: <strong className="text-white">{form.recipient}</strong>
                  </div>
                  <div className="mt-3 flex flex-col items-center gap-2">
                    {emailSent && (
                      <div className="flex flex-col items-center gap-2 w-full">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: 'rgba(0,245,255,0.07)', border: '1px solid rgba(0,245,255,0.25)' }}>
                          <i className="ri-mail-check-line text-xs" style={{ color: '#00f5ff' }} />
                          <span className="font-mono-tech text-xs" style={{ color: '#00f5ff' }}>Уведомление → {ADMIN_EMAIL}</span>
                        </div>
                        {clientEmailSent && form.email && (
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: 'rgba(0,200,100,0.07)', border: '1px solid rgba(0,200,100,0.3)' }}>
                            <i className="ri-mail-send-line text-xs" style={{ color: '#00e676' }} />
                            <span className="font-mono-tech text-xs" style={{ color: '#00e676' }}>Клиент уведомлён → {form.email}</span>
                          </div>
                        )}
                        {!clientEmailSent && !form.email && emailSent && (
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: 'rgba(255,165,0,0.06)', border: '1px solid rgba(255,165,0,0.2)' }}>
                            <i className="ri-mail-forbid-line text-xs" style={{ color: 'rgba(255,165,0,0.6)' }} />
                            <span className="font-mono-tech text-xs" style={{ color: 'rgba(255,165,0,0.7)' }}>Email клиента не указан — уведомление не отправлено</span>
                          </div>
                        )}
                      </div>
                    )}
                    {expiresAt && !timerExpired && (
                      <ExpiryTimer expiresAt={expiresAt} onExpired={() => setTimerExpired(true)} />
                    )}
                    {timerExpired && (
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: 'rgba(255,0,110,0.08)', border: '1px solid rgba(255,0,110,0.3)' }}>
                        <i className="ri-time-line text-xs" style={{ color: '#ff006e' }} />
                        <span className="font-mono-tech text-xs" style={{ color: '#ff006e' }}>Код истёк — запросите новый</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-6">
                  <div className="rounded-lg p-4 mb-5" style={{ background: 'rgba(255,165,0,0.06)', border: '1px solid rgba(255,165,0,0.25)' }}>
                    <div className="font-orbitron font-bold text-white text-xs mb-3">КАК ПОЛУЧИТЬ КОД</div>
                    <ol className="space-y-2 font-rajdhani text-sm text-white/60">
                      {[
                        `Оплатите ${activeCert.price} ₽ переводом или наличными в клубе`,
                        `Напишите в мессенджере MAX с номером: ${certNum}`,
                        'Мы проверим оплату и пришлём 4-значный код (действует 1 час)',
                        'Введите код ниже — сертификат разблокируется для скачивания',
                      ].map((text, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="font-bold flex-shrink-0" style={{ color: '#ffa500' }}>{i + 1}.</span>
                          <span>{text}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {timerExpired ? (
                    <div className="space-y-3">
                      <div className="rounded-lg p-4 text-center" style={{ background: 'rgba(255,0,110,0.06)', border: '1px solid rgba(255,0,110,0.25)' }}>
                        <i className="ri-alarm-warning-line text-2xl mb-2 block" style={{ color: '#ff006e' }} />
                        <div className="font-orbitron font-bold text-white text-sm mb-1">Время кода вышло</div>
                        <p className="font-rajdhani text-white/50 text-sm">
                          Если вы уже оплатили — не беспокойтесь! Нажмите кнопку ниже — сгенерируется новый номер сертификата и отправится новый код администратору.
                        </p>
                      </div>
                      <button onClick={handleRegenerateExpired} disabled={loading} className="btn-cyber-pink w-full py-3 rounded-sm text-xs whitespace-nowrap">
                        {loading ? <><i className="ri-loader-4-line mr-2 animate-spin" />Обновляем...</> : <><i className="ri-refresh-line mr-2" />Запросить новый код</>}
                      </button>
                      <button onClick={handleReset} className="w-full py-2.5 rounded-sm text-xs font-orbitron cursor-pointer text-white/30 hover:text-white/60 transition-colors whitespace-nowrap" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                        Отмена
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="mb-4">
                        <label className="font-mono-tech text-xs text-white/40 block mb-1.5" style={{ fontSize: '10px', letterSpacing: '1px' }}>КОД АКТИВАЦИИ (4 ЦИФРЫ)</label>
                        <div className="flex gap-2">
                          <input
                            value={activationInput}
                            onChange={(e) => setActivationInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
                            className="cyber-input text-center text-xl tracking-widest font-orbitron"
                            placeholder="____"
                            maxLength={4}
                            onKeyDown={(e) => e.key === 'Enter' && handleActivate()}
                            disabled={attempts >= 5}
                          />
                          <button onClick={handleActivate} disabled={activationInput.length < 4 || attempts >= 5 || verifying} className="btn-cyber-cyan px-5 py-2.5 rounded-sm text-xs flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap">
                            {verifying ? <i className="ri-loader-4-line animate-spin" /> : 'Активировать'}
                          </button>
                        </div>
                        {activationError && <div className="mt-2 font-rajdhani text-sm" style={{ color: '#ff006e' }}>{activationError}</div>}
                      </div>
                      <div className="flex gap-3">
                        <a href={MAX_LINK} target="_blank" rel="noopener noreferrer" className="flex-1 py-3 rounded-sm text-xs flex items-center justify-center gap-2 font-orbitron font-bold cursor-pointer transition-all hover:scale-105 whitespace-nowrap" style={{ background: 'rgba(255,106,0,0.12)', border: '1px solid rgba(255,106,0,0.5)', color: '#ff6a00' }}>
                          <img src={MAX_ICON} alt="MAX" className="w-4 h-4 rounded-sm object-cover" />
                          Написать в MAX
                        </a>
                        <button onClick={handleReset} className="flex-1 py-3 rounded-sm text-xs font-orbitron cursor-pointer text-white/30 hover:text-white/60 transition-colors whitespace-nowrap" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                          Отмена
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Stage: Unlocked */}
            {stage === 'unlocked' && activeCert && (
              <div className="rounded-lg p-8 text-center relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(1,0,20,0.95), rgba(10,0,40,0.95))', border: '1px solid #00f5ff', boxShadow: '0 0 40px rgba(0,245,255,0.2)' }}>
                <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #00f5ff, transparent)' }} />
                <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #ff006e, transparent)' }} />
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(0,245,255,0.08)', border: '2px solid #00f5ff' }}>
                  <i className="ri-shield-check-line text-2xl" style={{ color: '#00f5ff' }} />
                </div>
                <div className="font-mono-tech text-xs text-white/30 tracking-widest mb-2">ПОДАРОЧНЫЙ СЕРТИФИКАТ</div>
                <div className="font-orbitron font-black text-xl mb-1 break-all" style={{ color: '#00f5ff', textShadow: '0 0 20px rgba(0,245,255,0.5)' }}>{certNum}</div>
                <div className="w-24 h-px mx-auto my-3" style={{ background: 'linear-gradient(90deg, transparent, #00f5ff, transparent)' }} />
                <div className="font-rajdhani text-white/60 text-sm mb-0.5">Услуга: <strong className="text-white">{activeCert.title}</strong></div>
                <div className="font-rajdhani text-white/60 text-sm mb-4">Получатель: <strong className="text-white">{form.recipient}</strong></div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6" style={{ background: 'rgba(0,245,255,0.08)', border: '1px solid rgba(0,245,255,0.3)' }}>
                  <i className="ri-check-line text-xs" style={{ color: '#00f5ff' }} />
                  <span className="font-mono-tech text-xs" style={{ color: '#00f5ff' }}>ОПЛАЧЕН · АКТИВИРОВАН · ДЕЙСТВИТЕЛЕН 12 МЕС.</span>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button onClick={handleDownload} disabled={downloading} className="btn-cyber-cyan px-8 py-3 rounded-sm text-xs disabled:opacity-60 whitespace-nowrap">
                    <i className="ri-file-pdf-line mr-2" />{downloading ? 'Генерация PDF...' : 'Скачать PDF'}
                  </button>
                  <button onClick={handleReset} className="btn-cyber-pink px-6 py-3 rounded-sm text-xs whitespace-nowrap">Оформить другой →</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default Certificates;
