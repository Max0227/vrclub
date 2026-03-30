import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || 're_iumj5aR6_MQNpBev6RQVLVW3e5tBrJJUW';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BookingItemPayload {
  service: string;
  date: string;
  time: string;
  vrCount?: number | null;
  price: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const {
      name,
      phone,
      items,
      guests,
      isBirthday,
      total,
      totalNormal,
      comment,
      adminEmail,
    } = await req.json();

    const bookingItems: BookingItemPayload[] = items ?? [];
    const formatDate = (d: string) => d ? d.split('-').reverse().join('.') : '—';

    const itemsTableRows = bookingItems.map(item => {
      const vrInfo = item.vrCount ? ` (${item.vrCount} компл.)` : '';
      return `
        <tr>
          <td style="padding:8px 12px;color:#ccc;font-size:13px;border-bottom:1px solid rgba(255,255,255,0.06)">${item.service}${vrInfo}</td>
          <td style="padding:8px 12px;color:#00f5ff;font-size:13px;border-bottom:1px solid rgba(255,255,255,0.06)">${formatDate(item.date)} в ${item.time}</td>
          <td style="padding:8px 12px;color:#fff;font-size:13px;font-weight:bold;border-bottom:1px solid rgba(255,255,255,0.06);text-align:right">${item.price} ₽</td>
        </tr>`;
    }).join('');

    const savingsRow = isBirthday && totalNormal > total ? `
      <tr>
        <td colspan="2" style="padding:8px 12px;color:#4ade80;font-size:12px">🎂 Скидка именинника −20%</td>
        <td style="padding:8px 12px;color:#4ade80;font-size:12px;text-align:right">−${totalNormal - total} ₽</td>
      </tr>` : '';

    const now = new Date();
    const dateTimeStr = now.toLocaleString('ru-RU', { timeZone: 'Asia/Novosibirsk', hour12: false });

    const adminBody = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;background:#010014;color:#fff;margin:0;padding:0;">
  <div style="max-width:600px;margin:0 auto;padding:30px;">
    <div style="border:1px solid rgba(0,245,255,0.3);border-radius:12px;overflow:hidden;">

      <!-- Header -->
      <div style="background:linear-gradient(135deg,#010014,#04001a);padding:28px 30px;border-bottom:1px solid rgba(0,245,255,0.2);">
        <div style="font-size:11px;color:rgba(0,245,255,0.6);letter-spacing:4px;margin-bottom:8px;">PARADOX VR CLUB · НОВОСИБИРСК</div>
        <div style="font-size:26px;font-weight:900;color:#ffffff;letter-spacing:2px;">🎮 НОВОЕ БРОНИРОВАНИЕ</div>
        <div style="font-size:12px;color:rgba(255,255,255,0.3);margin-top:6px;">${dateTimeStr} (НСК)</div>
      </div>

      <!-- Services table -->
      <div style="background:rgba(0,245,255,0.03);padding:24px 30px;border-bottom:1px solid rgba(0,245,255,0.1);">
        <div style="font-size:10px;color:rgba(0,245,255,0.5);letter-spacing:3px;margin-bottom:14px;">ЗАКАЗАННЫЕ УСЛУГИ</div>
        <table style="width:100%;border-collapse:collapse;">
          <thead>
            <tr>
              <th style="padding:6px 12px;color:rgba(255,255,255,0.3);font-size:11px;font-weight:normal;text-align:left;letter-spacing:1px;">УСЛУГА</th>
              <th style="padding:6px 12px;color:rgba(255,255,255,0.3);font-size:11px;font-weight:normal;text-align:left;letter-spacing:1px;">ДАТА / ВРЕМЯ</th>
              <th style="padding:6px 12px;color:rgba(255,255,255,0.3);font-size:11px;font-weight:normal;text-align:right;letter-spacing:1px;">СУММА</th>
            </tr>
          </thead>
          <tbody>
            ${itemsTableRows}
            ${savingsRow}
          </tbody>
          <tfoot>
            <tr style="border-top:2px solid rgba(0,245,255,0.2);">
              <td colspan="2" style="padding:12px 12px;color:#9999aa;font-size:13px;font-weight:bold;">ИТОГО К ОПЛАТЕ</td>
              <td style="padding:12px 12px;color:#00f5ff;font-size:22px;font-weight:900;text-align:right;">${total} ₽</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <!-- Client info -->
      <div style="background:rgba(1,0,20,0.97);padding:24px 30px;">
        <div style="font-size:10px;color:rgba(0,245,255,0.5);letter-spacing:3px;margin-bottom:14px;">ДАННЫЕ КЛИЕНТА</div>
        <table style="width:100%;border-collapse:collapse;">
          <tr style="border-bottom:1px solid rgba(255,255,255,0.06);">
            <td style="padding:10px 0;color:rgba(255,255,255,0.4);font-size:13px;width:140px;">Имя</td>
            <td style="padding:10px 0;color:#ffffff;font-size:15px;font-weight:bold;">${name}</td>
          </tr>
          <tr style="border-bottom:1px solid rgba(255,255,255,0.06);">
            <td style="padding:10px 0;color:rgba(255,255,255,0.4);font-size:13px;">Телефон</td>
            <td style="padding:10px 0;color:#00f5ff;font-size:15px;font-weight:bold;">${phone}</td>
          </tr>
          <tr style="border-bottom:1px solid rgba(255,255,255,0.06);">
            <td style="padding:10px 0;color:rgba(255,255,255,0.4);font-size:13px;">Кол-во гостей</td>
            <td style="padding:10px 0;color:#ffffff;font-size:13px;">${guests}</td>
          </tr>
          ${isBirthday ? `
          <tr style="border-bottom:1px solid rgba(255,255,255,0.06);">
            <td style="padding:10px 0;color:rgba(255,255,255,0.4);font-size:13px;">День рождения</td>
            <td style="padding:10px 0;color:#4ade80;font-size:13px;font-weight:bold;">✓ Да — скидка −20% применена</td>
          </tr>` : ''}
          <tr>
            <td style="padding:10px 0;color:rgba(255,255,255,0.4);font-size:13px;">Комментарий</td>
            <td style="padding:10px 0;color:rgba(255,255,255,0.7);font-size:13px;">${comment || '—'}</td>
          </tr>
        </table>
      </div>

      <!-- Action hint -->
      <div style="background:rgba(255,165,0,0.06);padding:18px 30px;border-top:1px solid rgba(255,165,0,0.2);">
        <div style="color:#ffa500;font-size:13px;font-weight:bold;margin-bottom:6px;">📞 Действие:</div>
        <p style="color:rgba(255,255,255,0.6);font-size:13px;margin:0;line-height:1.6;">
          Позвоните клиенту <strong style="color:#ffffff;">${phone}</strong> для подтверждения бронирования. 
          Заявка также сохранена в админ-панели на сайте.
        </p>
      </div>

      <!-- Footer -->
      <div style="background:#00060d;padding:14px 30px;text-align:center;">
        <div style="color:rgba(255,255,255,0.2);font-size:11px;letter-spacing:2px;">
          PARADOX VR CLUB · г. Новосибирск, ул. Виктора Шевелева, 24 · +7 923 244-02-20
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;

    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'PARADOX VR CLUB <onboarding@resend.dev>',
        to: [adminEmail || 'paradoxclub54@gmail.com'],
        subject: `🎮 Новая запись: ${name} · ${bookingItems.length} усл. · ${total} ₽`,
        html: adminBody,
      }),
    });

    const emailResult = await emailRes.json();

    if (!emailRes.ok) {
      console.error('Email send error:', JSON.stringify(emailResult));
      return new Response(JSON.stringify({ success: false, error: emailResult }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true, id: emailResult.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('Function error:', err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
