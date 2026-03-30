
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email, name, cardNumber, password } = await req.json();

    if (!email || !name || !cardNumber) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

    const htmlBody = `
<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Добро пожаловать в PARADOX VR CLUB</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Arial', sans-serif; background: #010014; color: #ffffff; }
  .container { max-width: 600px; margin: 0 auto; background: #010014; }
  .header { background: linear-gradient(135deg, #010014 0%, #0a0030 100%); padding: 40px 32px; text-align: center; border-bottom: 2px solid #00f5ff; position: relative; overflow: hidden; }
  .header::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent, #00f5ff, #9b4dff, #ff006e, transparent); }
  .logo-text { font-size: 32px; font-weight: 900; letter-spacing: 0.15em; color: #ffffff; text-shadow: 0 0 20px #00f5ff, 0 0 40px rgba(0,245,255,0.5); line-height: 1.1; }
  .logo-sub { font-size: 16px; font-weight: 700; letter-spacing: 0.3em; color: #ff006e; text-shadow: 0 0 15px #ff006e; margin-top: 4px; }
  .tag { display: inline-block; background: rgba(0,245,255,0.1); border: 1px solid rgba(0,245,255,0.4); color: #00f5ff; font-size: 11px; letter-spacing: 2px; padding: 4px 12px; margin-top: 16px; border-radius: 2px; }
  .body { padding: 36px 32px; }
  .greeting { font-size: 22px; font-weight: 700; margin-bottom: 8px; }
  .greeting span { color: #00f5ff; }
  .intro { color: rgba(255,255,255,0.65); font-size: 15px; line-height: 1.6; margin-bottom: 32px; }
  .card-block { background: linear-gradient(135deg, #06001e 0%, #0d0035 100%); border: 1px solid rgba(0,245,255,0.35); border-radius: 12px; padding: 28px; margin-bottom: 28px; position: relative; overflow: hidden; }
  .card-block::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, #00f5ff, transparent); }
  .card-label { font-size: 10px; letter-spacing: 2px; color: rgba(0,245,255,0.5); margin-bottom: 6px; font-weight: 600; }
  .card-number { font-size: 26px; font-weight: 900; letter-spacing: 0.15em; color: #00f5ff; text-shadow: 0 0 15px rgba(0,245,255,0.6); margin-bottom: 20px; }
  .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .detail-item { background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 12px; }
  .detail-item-label { font-size: 10px; letter-spacing: 1px; color: rgba(255,255,255,0.35); margin-bottom: 4px; }
  .detail-item-value { font-size: 14px; font-weight: 700; color: #ffffff; word-break: break-all; }
  .password-block { background: rgba(255,0,110,0.06); border: 1px solid rgba(255,0,110,0.3); border-radius: 8px; padding: 16px; margin-top: 20px; }
  .password-label { font-size: 10px; letter-spacing: 2px; color: rgba(255,0,110,0.6); margin-bottom: 6px; }
  .password-value { font-size: 22px; font-weight: 900; letter-spacing: 0.2em; color: #ff006e; text-shadow: 0 0 10px rgba(255,0,110,0.4); }
  .benefits { margin-bottom: 28px; }
  .benefit-title { font-size: 13px; letter-spacing: 1px; color: rgba(255,255,255,0.4); margin-bottom: 14px; font-weight: 600; }
  .benefit-item { display: flex; align-items: flex-start; gap: 12px; padding: 12px; background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; margin-bottom: 8px; }
  .benefit-icon { width: 32px; height: 32px; border-radius: 6px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 14px; }
  .benefit-text { font-size: 13px; color: rgba(255,255,255,0.7); line-height: 1.5; }
  .benefit-text strong { color: #ffffff; display: block; margin-bottom: 2px; }
  .cta { text-align: center; margin-bottom: 28px; }
  .cta-btn { display: inline-block; background: linear-gradient(135deg, #ff006e, #cc0057); color: #ffffff; text-decoration: none; font-weight: 900; letter-spacing: 2px; font-size: 13px; padding: 16px 40px; border-radius: 3px; text-transform: uppercase; }
  .footer { padding: 24px 32px; border-top: 1px solid rgba(0,245,255,0.1); text-align: center; }
  .footer-text { font-size: 12px; color: rgba(255,255,255,0.25); line-height: 1.7; }
  .footer-text a { color: #00f5ff; text-decoration: none; }
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <div class="logo-text">PARADOX</div>
    <div class="logo-sub">VR CLUB</div>
    <div class="tag">НОВОСИБИРСК · С 2022</div>
  </div>

  <div class="body">
    <div class="greeting">Добро пожаловать, <span>${name.split(' ')[0]}</span>! 🎮</div>
    <div class="intro">
      Вы успешно зарегистрированы в PARADOX VR CLUB. Ваша персональная клубная карта создана — 
      теперь за каждый визит вы получаете жетоны и обмениваете их на бесплатные часы игры!
    </div>

    <div class="card-block">
      <div class="card-label">ВАША КЛУБНАЯ КАРТА</div>
      <div class="card-number">${cardNumber}</div>
      <div class="detail-grid">
        <div class="detail-item">
          <div class="detail-item-label">ИМЯ</div>
          <div class="detail-item-value">${name}</div>
        </div>
        <div class="detail-item">
          <div class="detail-item-label">EMAIL</div>
          <div class="detail-item-value">${email}</div>
        </div>
      </div>
      ${password ? `
      <div class="password-block">
        <div class="password-label">ВАШ ПАРОЛЬ</div>
        <div class="password-value">${password}</div>
        <div style="font-size:11px; color:rgba(255,255,255,0.35); margin-top:8px;">Сохраните этот пароль — он нужен для входа на сайте</div>
      </div>
      ` : ''}
    </div>

    <div class="benefits">
      <div class="benefit-title">КАК РАБОТАЕТ ПРОГРАММА ЛОЯЛЬНОСТИ</div>
      <div class="benefit-item">
        <div class="benefit-icon" style="background:rgba(0,245,255,0.12); border:1px solid rgba(0,245,255,0.3);">🥽</div>
        <div class="benefit-text"><strong>VR: 2 часа = 1 жетон</strong>Накопи 5 жетонов — получи 1 час VR бесплатно!</div>
      </div>
      <div class="benefit-item">
        <div class="benefit-icon" style="background:rgba(255,102,0,0.12); border:1px solid rgba(255,102,0,0.3);">🏎️</div>
        <div class="benefit-text"><strong>Автосим: 30 мин = 1 жетон</strong>Накопи 3 жетона — получи 1 час автосимулятора бесплатно!</div>
      </div>
      <div class="benefit-item">
        <div class="benefit-icon" style="background:rgba(155,77,255,0.12); border:1px solid rgba(155,77,255,0.3);">☁️</div>
        <div class="benefit-text"><strong>Карта в облаке</strong>Открывайте личный кабинет с любого устройства через paradox54.ru/loyalty</div>
      </div>
    </div>

    <div class="cta">
      <a href="https://paradox54.ru/loyalty" class="cta-btn">Открыть личный кабинет</a>
    </div>
  </div>

  <div class="footer">
    <div class="footer-text">
      PARADOX VR CLUB · Новосибирск<br>
      Режим работы: ежедневно 12:00 – 22:00<br>
      <a href="https://paradox54.ru">paradox54.ru</a> · Телефон: +7 (913) 944-24-09
    </div>
  </div>
</div>
</body>
</html>`;

    if (RESEND_API_KEY) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "PARADOX VR CLUB <noreply@paradox54.ru>",
          to: [email],
          subject: `Добро пожаловать! Ваша клубная карта ${cardNumber}`,
          html: htmlBody,
        }),
      });
      const data = await res.json();
      return new Response(JSON.stringify({ success: true, data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fallback: formsubmit
    const formBody = new URLSearchParams({
      _subject: `PARADOX CLUB: Новый участник ${name} — ${cardNumber}`,
      _template: "table",
      "Имя": name,
      "Email": email,
      "Номер карты": cardNumber,
      "Пароль": password || "не установлен",
      "Статус": "Карта создана",
    });
    await fetch("https://formsubmit.co/ajax/paradoxclub54@gmail.com", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
      body: formBody.toString(),
    });

    return new Response(JSON.stringify({ success: true, fallback: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
