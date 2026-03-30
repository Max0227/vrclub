import { serve } from "https://deno.land/std@0.208.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY") || "re_iumj5aR6_MQNpBev6RQVLVW3e5tBrJJUW";

    const {
      certNum,
      activationCode,
      certTitle,
      certPrice,
      recipient,
      phone,
      clientEmail,
      isRegenerated,
      sendToAdmin,
    } = await req.json();

    const results: Record<string, unknown> = {};

    // ── 1. Admin email (with activation code) ─────────────────────────────
    if (sendToAdmin) {
      const adminSubject = isRegenerated
        ? `PARADOX: ПЕРЕВЫПУСК — Сертификат ${certNum} — КОД: ${activationCode}`
        : `PARADOX: Новый сертификат ${certNum} — КОД: ${activationCode}`;

      const adminHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="background:#010014; margin:0; padding:0; font-family:Arial,sans-serif;">
  <div style="max-width:600px; margin:0 auto; padding:30px;">
    <div style="border:1px solid rgba(0,245,255,0.3); border-radius:12px; overflow:hidden;">
      <div style="background:linear-gradient(135deg,#010014,#04001a); padding:28px 30px; border-bottom:1px solid rgba(0,245,255,0.2);">
        <div style="font-size:11px; color:rgba(0,245,255,0.6); letter-spacing:4px; margin-bottom:8px;">PARADOX VR CLUB · НОВОСИБИРСК</div>
        <div style="font-size:24px; font-weight:900; color:#ffffff; letter-spacing:2px;">
          ${isRegenerated ? '⚠️ ПЕРЕВЫПУСК СЕРТИФИКАТА' : '🆕 НОВЫЙ СЕРТИФИКАТ'}
        </div>
      </div>
      <div style="background:rgba(255,0,110,0.05); padding:28px 30px; text-align:center; border-bottom:1px solid rgba(255,0,110,0.15);">
        <div style="font-size:12px; color:rgba(255,255,255,0.4); letter-spacing:3px; margin-bottom:10px;">КОД АКТИВАЦИИ</div>
        <div style="font-size:52px; font-weight:900; color:#ff006e; letter-spacing:16px; text-shadow:0 0 20px rgba(255,0,110,0.5);">${activationCode}</div>
        <div style="margin-top:12px; padding:8px 20px; display:inline-block; border:1px solid rgba(255,165,0,0.4); border-radius:20px; background:rgba(255,165,0,0.08);">
          <span style="color:#ffa500; font-size:13px; font-weight:bold;">⏰ Код действует 1 час!</span>
        </div>
      </div>
      <div style="background:rgba(1,0,20,0.95); padding:24px 30px;">
        <table style="width:100%; border-collapse:collapse;">
          <tr style="border-bottom:1px solid rgba(0,245,255,0.08);">
            <td style="padding:10px 0; color:rgba(255,255,255,0.4); font-size:12px; width:40%;">Номер сертификата</td>
            <td style="padding:10px 0; color:#00f5ff; font-weight:bold; font-size:14px;">${certNum}</td>
          </tr>
          <tr style="border-bottom:1px solid rgba(0,245,255,0.08);">
            <td style="padding:10px 0; color:rgba(255,255,255,0.4); font-size:12px;">Услуга</td>
            <td style="padding:10px 0; color:#ffffff; font-size:14px;">${certTitle}</td>
          </tr>
          <tr style="border-bottom:1px solid rgba(0,245,255,0.08);">
            <td style="padding:10px 0; color:rgba(255,255,255,0.4); font-size:12px;">Получатель</td>
            <td style="padding:10px 0; color:#ffffff; font-size:14px;">${recipient || 'не указан'}</td>
          </tr>
          <tr style="border-bottom:1px solid rgba(0,245,255,0.08);">
            <td style="padding:10px 0; color:rgba(255,255,255,0.4); font-size:12px;">Телефон</td>
            <td style="padding:10px 0; color:#ffffff; font-size:14px;">${phone || 'не указан'}</td>
          </tr>
          <tr style="border-bottom:1px solid rgba(0,245,255,0.08);">
            <td style="padding:10px 0; color:rgba(255,255,255,0.4); font-size:12px;">Email клиента</td>
            <td style="padding:10px 0; color:#ffffff; font-size:14px;">${clientEmail || 'не указан'}</td>
          </tr>
          <tr>
            <td style="padding:10px 0; color:rgba(255,255,255,0.4); font-size:12px;">Статус</td>
            <td style="padding:10px 0; color:#ffa500; font-size:14px; font-weight:bold;">
              ${isRegenerated ? '⚠️ ПЕРЕВЫПУСК — старый код истёк' : '🆕 Ожидает оплаты'}
            </td>
          </tr>
        </table>
      </div>
      <div style="background:rgba(255,165,0,0.06); padding:18px 30px; border-top:1px solid rgba(255,165,0,0.2);">
        <div style="color:#ffa500; font-size:13px; font-weight:bold; margin-bottom:6px;">Что делать:</div>
        <ol style="color:rgba(255,255,255,0.6); font-size:13px; margin:0; padding-left:18px; line-height:2;">
          <li>Проверьте оплату от клиента</li>
          <li>Сообщите клиенту 4-значный код выше</li>
          <li>Клиент вводит код на сайте и скачивает PDF</li>
        </ol>
      </div>
      <div style="background:#00060d; padding:16px 30px; text-align:center;">
        <div style="color:rgba(255,255,255,0.2); font-size:11px; letter-spacing:2px;">
          PARADOX VR CLUB · г. Новосибирск, ул. Виктора Шевелева, 24 · +7 923 244-02-20
        </div>
      </div>
    </div>
  </div>
</body>
</html>`.trim();

      const adminRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "PARADOX VR CLUB <onboarding@resend.dev>",
          to: ["paradoxclub54@gmail.com"],
          subject: adminSubject,
          html: adminHtml,
        }),
      });
      const adminResult = await adminRes.json();
      results.admin = adminRes.ok ? { success: true, id: adminResult.id } : { error: adminResult };
    }

    // ── 2. Client email (with cert number, no activation code) ────────────
    if (clientEmail) {
      const clientSubject = isRegenerated
        ? `Ваш сертификат PARADOX VR CLUB — новый номер ${certNum}`
        : `Ваш подарочный сертификат PARADOX VR CLUB — ${certNum}`;

      const expire = new Date();
      expire.setFullYear(expire.getFullYear() + 1);
      const expireStr = expire.toLocaleDateString("ru-RU");

      const clientHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="background:#010014; margin:0; padding:0; font-family:Arial,sans-serif;">
  <div style="max-width:600px; margin:0 auto; padding:30px;">
    <div style="border:1px solid rgba(0,245,255,0.35); border-radius:14px; overflow:hidden;">

      <!-- Header -->
      <div style="background:linear-gradient(135deg,#010014 0%,#040028 50%,#010014 100%); padding:36px 30px 28px; text-align:center; position:relative;">
        <div style="position:absolute; top:0; left:0; right:0; height:2px; background:linear-gradient(90deg,transparent,#00f5ff,transparent);"></div>
        <div style="font-size:11px; color:rgba(0,245,255,0.55); letter-spacing:5px; text-transform:uppercase; margin-bottom:12px;">Подарочный сертификат</div>
        <div style="font-size:42px; font-weight:900; color:#ffffff; letter-spacing:3px; text-shadow:0 0 30px rgba(0,245,255,0.25); margin-bottom:4px;">PARADOX</div>
        <div style="font-size:18px; font-weight:700; color:#00f5ff; letter-spacing:4px;">VR CLUB</div>
      </div>

      <!-- Cert number block -->
      <div style="background:linear-gradient(180deg, rgba(0,245,255,0.06) 0%, rgba(0,245,255,0.02) 100%); padding:32px 30px; text-align:center; border-top:1px solid rgba(0,245,255,0.15); border-bottom:1px solid rgba(0,245,255,0.15);">
        <div style="font-size:11px; color:rgba(255,255,255,0.35); letter-spacing:4px; margin-bottom:14px; text-transform:uppercase;">Номер вашего сертификата</div>
        <div style="font-size:22px; font-weight:900; color:#00f5ff; letter-spacing:3px; word-break:break-all; text-shadow:0 0 25px rgba(0,245,255,0.6); background:rgba(0,245,255,0.05); border:1px solid rgba(0,245,255,0.25); border-radius:8px; padding:16px 24px; display:inline-block;">${certNum}</div>
        <div style="margin-top:16px; font-size:13px; color:rgba(255,255,255,0.45);">Сохраните этот номер — он понадобится для активации</div>
      </div>

      <!-- Info -->
      <div style="background:rgba(1,0,20,0.97); padding:26px 30px;">
        <div style="margin-bottom:20px;">
          <div style="font-size:12px; color:rgba(255,255,255,0.35); letter-spacing:3px; text-transform:uppercase; margin-bottom:6px;">Услуга</div>
          <div style="font-size:20px; font-weight:700; color:#ffffff;">${certTitle}</div>
          ${certPrice ? `<div style="font-size:16px; color:#00f5ff; margin-top:4px;">${certPrice} ₽</div>` : ''}
        </div>
        ${recipient ? `
        <div style="margin-bottom:20px;">
          <div style="font-size:12px; color:rgba(255,255,255,0.35); letter-spacing:3px; text-transform:uppercase; margin-bottom:6px;">Получатель</div>
          <div style="font-size:18px; font-weight:600; color:#ffffff;">${recipient}</div>
        </div>` : ''}
        <div style="margin-bottom:0;">
          <div style="font-size:12px; color:rgba(255,255,255,0.35); letter-spacing:3px; text-transform:uppercase; margin-bottom:6px;">Действителен до</div>
          <div style="font-size:16px; font-weight:600; color:rgba(255,255,255,0.7);">${expireStr}</div>
        </div>
      </div>

      <!-- How to activate -->
      <div style="background:rgba(255,165,0,0.05); padding:24px 30px; border-top:1px solid rgba(255,165,0,0.2);">
        <div style="font-size:13px; font-weight:700; color:#ffa500; margin-bottom:14px; text-transform:uppercase; letter-spacing:2px;">Как активировать сертификат</div>
        <div style="display:table; width:100%;">
          ${[
            ['1', 'Оплатите сертификат переводом или наличными в клубе'],
            ['2', `Напишите администратору в MAX с номером: ${certNum}`],
            ['3', 'Администратор проверит оплату и пришлёт 4-значный код'],
            ['4', 'Введите код на сайте — сертификат разблокируется для скачивания PDF'],
          ].map(([num, text]) => `
          <div style="display:table-row; margin-bottom:10px;">
            <div style="display:table-cell; width:32px; vertical-align:top; padding-bottom:10px;">
              <div style="width:26px; height:26px; border-radius:50%; background:rgba(255,165,0,0.15); border:1px solid rgba(255,165,0,0.4); text-align:center; line-height:26px; font-size:13px; font-weight:700; color:#ffa500;">${num}</div>
            </div>
            <div style="display:table-cell; vertical-align:middle; padding-left:12px; padding-bottom:10px; color:rgba(255,255,255,0.65); font-size:14px; line-height:1.5;">${text}</div>
          </div>`).join('')}
        </div>
      </div>

      <!-- Contact -->
      <div style="background:rgba(0,245,255,0.04); padding:20px 30px; border-top:1px solid rgba(0,245,255,0.12); text-align:center;">
        <div style="font-size:13px; color:rgba(255,255,255,0.5); margin-bottom:8px;">Есть вопросы? Мы на связи:</div>
        <div style="font-size:16px; font-weight:700; color:#00f5ff;">+7 923 244-02-20</div>
        <div style="font-size:13px; color:rgba(255,255,255,0.35); margin-top:4px;">г. Новосибирск, ул. Виктора Шевелева, 24</div>
      </div>

      <!-- Footer -->
      <div style="background:#00060d; padding:16px 30px; text-align:center; position:relative;">
        <div style="position:absolute; bottom:0; left:0; right:0; height:2px; background:linear-gradient(90deg,transparent,#ff006e,transparent);"></div>
        <div style="color:rgba(255,255,255,0.18); font-size:11px; letter-spacing:2px; text-transform:uppercase;">PARADOX VR CLUB · НОВОСИБИРСК · 2026</div>
      </div>
    </div>
  </div>
</body>
</html>`.trim();

      const clientRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "PARADOX VR CLUB <onboarding@resend.dev>",
          to: [clientEmail],
          subject: clientSubject,
          html: clientHtml,
        }),
      });
      const clientResult = await clientRes.json();
      results.client = clientRes.ok ? { success: true, id: clientResult.id } : { error: clientResult };
    }

    return new Response(
      JSON.stringify({ success: true, results }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
