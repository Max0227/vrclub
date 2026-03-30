
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const ADMIN_EMAIL = "paradoxclub54@gmail.com";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Content-Type" } });
  }
  try {
    const { username, email, cardNumber, phone } = await req.json();
    const html = `
      <div style="font-family:Arial,sans-serif;background:#010014;color:#fff;padding:24px;border-radius:12px;max-width:480px">
        <h2 style="color:#00f5ff;font-size:18px;margin-bottom:16px">🎮 Новая заявка на форум PARADOX VR</h2>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:8px;color:rgba(255,255,255,0.5);font-size:13px">Имя:</td><td style="padding:8px;color:#fff;font-size:13px">${username}</td></tr>
          <tr><td style="padding:8px;color:rgba(255,255,255,0.5);font-size:13px">Email:</td><td style="padding:8px;color:#fff;font-size:13px">${email}</td></tr>
          ${cardNumber ? `<tr><td style="padding:8px;color:rgba(255,255,255,0.5);font-size:13px">Клубная карта:</td><td style="padding:8px;color:#00f5ff;font-size:13px">${cardNumber}</td></tr>` : ""}
          ${phone ? `<tr><td style="padding:8px;color:rgba(255,255,255,0.5);font-size:13px">Телефон:</td><td style="padding:8px;color:#fff;font-size:13px">${phone}</td></tr>` : ""}
        </table>
        <p style="margin-top:16px;color:rgba(255,255,255,0.6);font-size:13px">Перейдите в <strong style="color:#00f5ff">Админ-панель → Вкладка Форум</strong> чтобы активировать пользователя.</p>
        <a href="https://paradoxvr.ru/admin" style="display:inline-block;margin-top:12px;padding:10px 20px;background:rgba(0,245,255,0.15);border:1px solid rgba(0,245,255,0.5);color:#00f5ff;text-decoration:none;border-radius:4px;font-size:13px">Открыть Админ-панель</a>
      </div>`;
    if (RESEND_API_KEY) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Authorization": `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from: "PARADOX VR Forum <noreply@paradoxvr.ru>", to: [ADMIN_EMAIL], subject: `Новая заявка на форум: ${username}`, html }),
      });
    }
    return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), { status: 500, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } });
  }
});
