import { NextResponse } from "next/server";

const DEFAULT_TO_EMAIL = "hello@maiacoelho.design";

interface ContactPayload {
  name?: string;
  email?: string;
  message?: string;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ContactPayload;
    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim();
    const message = String(body.message ?? "").trim();

    if (!name || !email || !message) {
      return NextResponse.json(
        { ok: false, error: "Missing required fields (name, email, message)." },
        { status: 400 }
      );
    }

    const webhookUrl = process.env.MAKE_WEBHOOK_URL?.trim();
    const toEmail = process.env.CONTACT_TO_EMAIL?.trim() || DEFAULT_TO_EMAIL;
    const submittedAt = new Date().toISOString();
    const subject = `Novo lead MaiaCoelho — ${name}`;

    const text = [
      "Novo lead recebido pelo site MaiaCoelho (Buck)",
      "",
      `Nome: ${name}`,
      `E-mail: ${email}`,
      "Mensagem / Projeto:",
      message,
      "",
      `Enviado em: ${submittedAt}`,
    ].join("\n");

    const html = `
      <div style="background:#141414;color:#F1F0EB;font-family:system-ui,-apple-system,sans-serif;padding:32px;border-radius:8px;max-width:560px">
        <p style="font-family:monospace;font-size:12px;letter-spacing:0.16em;text-transform:uppercase;color:#A3A39E;margin:0 0 12px">
          MAIACOELHO · NEW PROJECT LEAD
        </p>
        <h2 style="font-size:24px;font-weight:700;margin:0 0 24px;color:#F1F0EB">
          ${escapeHtml(name)}
        </h2>
        <div style="background:#2E2D2A;padding:20px;border-radius:6px;border-left:3px solid #FF5A1F;margin-bottom:20px">
          <p style="margin:0 0 8px;font-size:13px;color:#A3A39E">E-MAIL DO LEAD</p>
          <p style="margin:0 0 18px;font-size:16px">
            <a href="mailto:${escapeHtml(email)}" style="color:#FF5A1F;text-decoration:none">${escapeHtml(email)}</a>
          </p>
          <p style="margin:0 0 8px;font-size:13px;color:#A3A39E">PROJETO / MENSAGEM</p>
          <p style="margin:0;font-size:15px;line-height:1.5;white-space:pre-wrap;color:#F1F0EB">${escapeHtml(message)}</p>
        </div>
        <p style="font-family:monospace;font-size:11px;color:#A3A39E;margin:0">
          Enviado em ${escapeHtml(submittedAt)}
        </p>
      </div>
    `.trim();

    const payload = {
      name,
      email,
      message,
      toEmail,
      replyTo: email,
      subject,
      text,
      html,
      source: "maiacoelho-buck",
      submittedAt,
    };

    if (!webhookUrl) {
      return NextResponse.json(
        {
          ok: false,
          error: "MAKE_WEBHOOK_URL is not configured.",
        },
        { status: 503 }
      );
    }

    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      return NextResponse.json(
        {
          ok: false,
          error: `Make webhook responded with ${res.status}`,
          details: errText.slice(0, 300),
        },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request payload." },
      { status: 400 }
    );
  }
}
