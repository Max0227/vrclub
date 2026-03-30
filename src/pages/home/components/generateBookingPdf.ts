import jsPDF from 'jspdf';
import { BookingItem, getTotalPrice, getItemPrice } from './BookingServiceStep';

interface PdfParams {
  items: BookingItem[];
  name: string;
  phone: string;
  guests: string;
  comment: string;
  isBirthday: boolean;
}

const vrLabel = (n: number) => n === 1 ? 'комплект' : n < 5 ? 'комплекта' : 'комплектов';

function formatDate(d: string): string {
  return d ? d.split('-').reverse().join('.') : '—';
}

export function generateBookingPdf(params: PdfParams): void {
  const { items, name, phone, guests, comment, isBirthday } = params;
  const total = getTotalPrice(items, isBirthday);
  const totalNormal = getTotalPrice(items, false);
  const savings = totalNormal - total;

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a5' });
  const W = doc.internal.pageSize.getWidth();

  // ── Background ──
  doc.setFillColor(1, 0, 20);
  doc.rect(0, 0, W, doc.internal.pageSize.getHeight(), 'F');

  // ── Top accent bar ──
  doc.setFillColor(0, 245, 255);
  doc.rect(0, 0, W, 1.2, 'F');

  // ── Logo / title ──
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(0, 245, 255);
  doc.text('PARADOX VR CLUB', W / 2, 18, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 130);
  doc.text('Новосибирск  ·  +7 923 244-02-20  ·  paradoxclub54@gmail.com', W / 2, 25, { align: 'center' });

  // ── Divider ──
  doc.setDrawColor(0, 245, 255, 30);
  doc.setLineWidth(0.3);
  doc.line(12, 30, W - 12, 30);

  // ── Booking accepted label ──
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text('БРОНИРОВАНИЕ ПРИНЯТО', W / 2, 38, { align: 'center' });

  // ── Services block ──
  let y = 47;
  const colW = W - 24;

  // header row
  doc.setFillColor(0, 245, 255, 20);
  doc.roundedRect(12, y - 5, colW, 8, 1, 1, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(0, 245, 255);
  doc.text('УСЛУГА', 16, y);
  doc.text('ДАТА / ВРЕМЯ', 90, y, { align: 'center' });
  doc.text('СУММА', W - 16, y, { align: 'right' });
  y += 9;

  items.forEach((item, idx) => {
    const bg = idx % 2 === 0 ? [8, 2, 30] : [4, 1, 18];
    doc.setFillColor(bg[0], bg[1], bg[2]);
    doc.rect(12, y - 5, colW, 9, 'F');

    const svcLabel = item.service.startsWith('VR')
      ? `${item.service} · ${item.vrCount} ${vrLabel(item.vrCount)}`
      : item.service;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(220, 220, 240);
    doc.text(svcLabel, 16, y);

    doc.setTextColor(0, 245, 255);
    doc.text(`${formatDate(item.date)} в ${item.time}`, 90, y, { align: 'center' });

    const price = getItemPrice(item, isBirthday);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(`${price} ₽`, W - 16, y, { align: 'right' });

    y += 10;
  });

  // ── Total ──
  y += 3;
  doc.setFillColor(0, 245, 255, 15);
  doc.roundedRect(12, y - 5, colW, 10, 1.5, 1.5, 'F');
  doc.setDrawColor(0, 245, 255);
  doc.setLineWidth(0.4);
  doc.roundedRect(12, y - 5, colW, 10, 1.5, 1.5, 'D');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 180);
  doc.text('ИТОГО К ОПЛАТЕ', 16, y + 1);

  if (isBirthday && savings > 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(74, 222, 128);
    doc.text(`экономия ${savings} ₽`, W - 16 - 28, y + 1);
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(0, 245, 255);
  doc.text(`${total} ₽`, W - 16, y + 1.5, { align: 'right' });
  y += 18;

  // ── Birthday note ──
  if (isBirthday) {
    doc.setFillColor(10, 60, 30);
    doc.roundedRect(12, y - 4, colW, 11, 1.5, 1.5, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(74, 222, 128);
    doc.text('День рождения: предъяви документ администратору. Оплата по факту на месте.', 16, y);
    doc.text('Скидка именинника применена к заказу.', 16, y + 5);
    y += 16;
  }

  // ── Client info ──
  const infoItems: [string, string][] = [
    ['Имя', name],
    ['Телефон', phone],
    ['Гостей', guests],
  ];
  if (comment) infoItems.push(['Комментарий', comment]);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(0, 245, 255);
  doc.text('ДАННЫЕ КЛИЕНТА', 12, y);
  y += 5;

  infoItems.forEach(([label, value]) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 150);
    doc.text(label, 16, y);
    doc.setTextColor(220, 220, 240);
    doc.text(value, 52, y);
    y += 6;
  });

  // ── Bottom note ──
  y += 5;
  doc.setDrawColor(0, 245, 255, 20);
  doc.setLineWidth(0.2);
  doc.line(12, y, W - 12, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(70, 70, 100);
  doc.text('Мы свяжемся с вами для подтверждения бронирования.', W / 2, y, { align: 'center' });
  doc.text('Не планируете приходить? Пожалуйста, предупредите нас заранее.', W / 2, y + 5, { align: 'center' });

  // ── Bottom accent ──
  doc.setFillColor(0, 245, 255);
  doc.rect(0, doc.internal.pageSize.getHeight() - 1.2, W, 1.2, 'F');

  doc.save(`PARADOX_booking_${name.replace(/\s+/g, '_')}.pdf`);
}
