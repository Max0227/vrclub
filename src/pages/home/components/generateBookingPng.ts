import { BookingItem, getTotalPrice, getItemPrice } from './BookingServiceStep';

interface PngParams {
  items: BookingItem[];
  name: string;
  phone: string;
  guests: string;
  comment: string;
  isBirthday: boolean;
  loyaltyCardNumber?: string | null;
}

const vrLabel = (n: number) => (n === 1 ? 'комплект' : n < 5 ? 'комплекта' : 'комплектов');

function formatDate(d: string): string {
  return d ? d.split('-').reverse().join('.') : '—';
}

async function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function hLine(ctx: CanvasRenderingContext2D, y: number, W: number) {
  ctx.strokeStyle = 'rgba(0,245,255,0.12)';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(20, y);
  ctx.lineTo(W - 20, y);
  ctx.stroke();
}

export async function generateBookingPng(params: PngParams): Promise<void> {
  const { items, name, phone, guests, comment, isBirthday, loyaltyCardNumber } = params;
  const total = getTotalPrice(items, isBirthday);
  const totalNormal = getTotalPrice(items, false);
  const savings = totalNormal - total;
  const hasQr = !!loyaltyCardNumber;

  const SCALE = 2;
  const W = 560;
  const PAD = 24;
  const COL_W = W - PAD * 2;
  const commentLines = comment ? Math.ceil(comment.length / 58) : 0;

  const H =
    310 +
    items.length * 44 +
    (isBirthday ? 60 : 0) +
    80 +
    commentLines * 18 +
    (hasQr ? 220 : 0) +
    80;

  const canvas = document.createElement('canvas');
  canvas.width = W * SCALE;
  canvas.height = H * SCALE;

  const ctx = canvas.getContext('2d')!;
  ctx.scale(SCALE, SCALE);

  // ── Background ──────────────────────────────────────────────────
  ctx.fillStyle = '#010014';
  ctx.fillRect(0, 0, W, H);

  // Grid pattern
  ctx.strokeStyle = 'rgba(0,245,255,0.025)';
  ctx.lineWidth = 0.5;
  for (let gx = 0; gx <= W; gx += 30) {
    ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke();
  }
  for (let gy = 0; gy <= H; gy += 30) {
    ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke();
  }

  // ── Top accent gradient bar ──────────────────────────────────────
  const topGrad = ctx.createLinearGradient(0, 0, W, 0);
  topGrad.addColorStop(0, 'rgba(0,245,255,0)');
  topGrad.addColorStop(0.25, 'rgba(0,245,255,1)');
  topGrad.addColorStop(0.75, 'rgba(0,245,255,1)');
  topGrad.addColorStop(1, 'rgba(0,245,255,0)');
  ctx.fillStyle = topGrad;
  ctx.fillRect(0, 0, W, 3);

  let y = 32;

  // ── Logo ─────────────────────────────────────────────────────────
  ctx.fillStyle = '#00f5ff';
  ctx.font = 'bold 22px "Courier New", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('PARADOX VR CLUB', W / 2, y);
  y += 16;

  ctx.fillStyle = 'rgba(100,100,140,1)';
  ctx.font = '10px "Courier New", monospace';
  ctx.fillText('Новосибирск  ·  +7 923 244-02-20  ·  paradoxclub54@gmail.com', W / 2, y);
  y += 22;

  hLine(ctx, y, W);
  y += 24;

  // ── Success circle ───────────────────────────────────────────────
  ctx.beginPath();
  ctx.arc(W / 2, y + 16, 22, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0,245,255,0.08)';
  ctx.fill();
  ctx.strokeStyle = '#00f5ff';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = '#00f5ff';
  ctx.font = 'bold 20px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('✓', W / 2, y + 22);
  y += 50;

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 17px "Courier New", monospace';
  ctx.fillText('БРОНИРОВАНИЕ ПРИНЯТО', W / 2, y);
  y += 14;

  ctx.fillStyle = 'rgba(160,160,190,1)';
  ctx.font = '12px Arial';
  ctx.fillText('Мы свяжемся с вами для подтверждения', W / 2, y);
  y += 24;

  hLine(ctx, y, W);
  y += 18;

  // ── Services header ──────────────────────────────────────────────
  ctx.fillStyle = 'rgba(0,245,255,0.07)';
  roundRectPath(ctx, PAD, y, COL_W, 24, 4);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,245,255,0.2)';
  ctx.lineWidth = 0.5;
  roundRectPath(ctx, PAD, y, COL_W, 24, 4);
  ctx.stroke();

  ctx.fillStyle = '#00f5ff';
  ctx.font = 'bold 9px "Courier New", monospace';
  ctx.textAlign = 'left';
  ctx.fillText('УСЛУГА', PAD + 10, y + 15);
  ctx.textAlign = 'center';
  ctx.fillText('ДАТА / ВРЕМЯ', W / 2, y + 15);
  ctx.textAlign = 'right';
  ctx.fillText('СУММА', PAD + COL_W - 10, y + 15);
  y += 30;

  // ── Service rows ─────────────────────────────────────────────────
  items.forEach((item, idx) => {
    ctx.fillStyle = idx % 2 === 0 ? 'rgba(8,2,30,0.85)' : 'rgba(4,1,18,0.85)';
    ctx.fillRect(PAD, y, COL_W, 38);

    const svcLabel = item.service.startsWith('VR')
      ? `${item.service} · ${item.vrCount} ${vrLabel(item.vrCount)}`
      : item.service;

    ctx.fillStyle = 'rgba(230,230,250,1)';
    ctx.font = 'bold 13px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(svcLabel, PAD + 10, y + 15);

    ctx.fillStyle = 'rgba(180,180,200,0.65)';
    ctx.font = '9px "Courier New", monospace';
    ctx.fillText(`${guests} гост.`, PAD + 10, y + 29);

    ctx.fillStyle = '#00f5ff';
    ctx.font = '11px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${formatDate(item.date)} в ${item.time}`, W / 2, y + 21);

    const price = getItemPrice(item, isBirthday);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px "Courier New", monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`${price} ₽`, PAD + COL_W - 10, y + 21);

    y += 40;
  });

  y += 6;

  // ── Total block ──────────────────────────────────────────────────
  ctx.fillStyle = 'rgba(0,245,255,0.06)';
  roundRectPath(ctx, PAD, y, COL_W, 48, 6);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,245,255,0.5)';
  ctx.lineWidth = 1;
  roundRectPath(ctx, PAD, y, COL_W, 48, 6);
  ctx.stroke();

  ctx.fillStyle = 'rgba(140,140,170,1)';
  ctx.font = '10px "Courier New", monospace';
  ctx.textAlign = 'left';
  ctx.fillText('ИТОГО К ОПЛАТЕ', PAD + 12, y + 20);

  if (isBirthday && savings > 0) {
    ctx.fillStyle = '#4ade80';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`🎂 скидка именинника: −${savings} ₽`, W / 2, y + 36);
  }

  ctx.fillStyle = '#00f5ff';
  ctx.font = 'bold 22px "Courier New", monospace';
  ctx.textAlign = 'right';
  ctx.fillText(`${total} ₽`, PAD + COL_W - 12, y + 36);
  y += 58;

  // ── Birthday note ────────────────────────────────────────────────
  if (isBirthday) {
    ctx.fillStyle = 'rgba(10,55,28,0.85)';
    roundRectPath(ctx, PAD, y, COL_W, 40, 4);
    ctx.fill();
    ctx.strokeStyle = 'rgba(74,222,128,0.4)';
    ctx.lineWidth = 0.5;
    roundRectPath(ctx, PAD, y, COL_W, 40, 4);
    ctx.stroke();

    ctx.fillStyle = '#4ade80';
    ctx.font = '10px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('🎂 День рождения: предъяви документ администратору.', PAD + 10, y + 16);
    ctx.fillText('Скидка именинника применена. Оплата по факту на месте.', PAD + 10, y + 30);
    y += 52;
  }

  hLine(ctx, y, W);
  y += 16;

  // ── Client info ──────────────────────────────────────────────────
  ctx.fillStyle = '#00f5ff';
  ctx.font = 'bold 9px "Courier New", monospace';
  ctx.textAlign = 'left';
  ctx.fillText('ДАННЫЕ КЛИЕНТА', PAD, y);
  y += 14;

  const infoRows: [string, string][] = [
    ['Имя', name],
    ['Телефон', phone],
    ['Гостей', guests],
  ];
  if (comment) infoRows.push(['Комментарий', comment]);

  infoRows.forEach(([label, value]) => {
    ctx.fillStyle = 'rgba(110,110,145,1)';
    ctx.font = '10px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(label, PAD + 4, y);

    ctx.fillStyle = 'rgba(225,225,245,0.9)';
    ctx.font = '11px Arial';
    const labelOffset = 90;
    const maxTextW = COL_W - labelOffset - 4;
    // Word-wrap value
    const words = value.split(' ');
    let line = '';
    let lineY = y;
    words.forEach((word) => {
      const test = line + word + ' ';
      if (ctx.measureText(test).width > maxTextW && line !== '') {
        ctx.fillText(line.trim(), PAD + labelOffset, lineY);
        line = word + ' ';
        lineY += 15;
      } else {
        line = test;
      }
    });
    ctx.fillText(line.trim(), PAD + labelOffset, lineY);
    y = lineY + 18;
  });

  // ── QR section if loyalty card ────────────────────────────────────
  if (hasQr && loyaltyCardNumber) {
    y += 4;
    hLine(ctx, y, W);
    y += 16;

    // Section background
    ctx.fillStyle = 'rgba(0,245,255,0.04)';
    roundRectPath(ctx, PAD, y, COL_W, 185, 8);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,245,255,0.22)';
    ctx.lineWidth = 1;
    roundRectPath(ctx, PAD, y, COL_W, 185, 8);
    ctx.stroke();

    // Top shimmer line inside box
    const shimmer = ctx.createLinearGradient(PAD, 0, PAD + COL_W, 0);
    shimmer.addColorStop(0, 'rgba(0,245,255,0)');
    shimmer.addColorStop(0.5, 'rgba(0,245,255,0.4)');
    shimmer.addColorStop(1, 'rgba(0,245,255,0)');
    ctx.fillStyle = shimmer;
    ctx.fillRect(PAD, y, COL_W, 1.5);

    ctx.fillStyle = '#00f5ff';
    ctx.font = 'bold 11px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('КАРТА КЛУБА PARADOX', W / 2, y + 22);

    ctx.fillStyle = 'rgba(180,180,210,0.8)';
    ctx.font = '10px Arial';
    ctx.fillText('Покажи QR-код администратору на ресепшен', W / 2, y + 36);

    // QR image
    const adminLink = `${window.location.origin}/loyalty/admin?client=${encodeURIComponent(loyaltyCardNumber)}`;
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(adminLink)}&format=png&margin=6`;

    const qrSize = 120;
    const qrX = W / 2 - qrSize / 2;
    const qrY = y + 48;

    try {
      const qrImg = await loadImage(qrApiUrl);
      // White rounded background
      ctx.fillStyle = '#ffffff';
      roundRectPath(ctx, qrX - 8, qrY - 8, qrSize + 16, qrSize + 16, 6);
      ctx.fill();
      ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
    } catch {
      ctx.fillStyle = 'rgba(0,245,255,0.3)';
      ctx.font = '10px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('[QR-код недоступен]', W / 2, y + 100);
    }

    // Card number below QR
    ctx.fillStyle = 'rgba(0,245,255,0.55)';
    ctx.font = '10px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(loyaltyCardNumber, W / 2, y + 175);

    y += 200;
  }

  y += 10;

  // ── Footer ────────────────────────────────────────────────────────
  hLine(ctx, y, W);
  y += 14;

  ctx.fillStyle = 'rgba(70,70,105,0.9)';
  ctx.font = '9px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Мы свяжемся с вами для подтверждения бронирования.', W / 2, y);
  y += 13;
  ctx.fillText('Не планируете приходить? Пожалуйста, предупредите нас заранее.', W / 2, y);
  y += 20;

  // ── Bottom accent bar ─────────────────────────────────────────────
  ctx.fillStyle = topGrad;
  ctx.fillRect(0, H - 3, W, 3);

  // ── Download ──────────────────────────────────────────────────────
  const link = document.createElement('a');
  link.download = `PARADOX_booking_${name.replace(/\s+/g, '_')}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}
