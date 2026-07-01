import nodemailer from "nodemailer";

// Singleton transporter — reused across requests in long-running environments
let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST!, // smtp.gmail.com
    port: Number(process.env.SMTP_PORT!), // 587
    secure: process.env.SMTP_SECURE === "true", // false for STARTTLS
    auth: {
      user: process.env.SMTP_USER!,
      pass: process.env.SMTP_PASS!, // Gmail App Password
    },
  });

  return transporter;
}

// ─── Base send helper ─────────────────────────────────────────────────────────

async function sendMail(options: { to: string; subject: string; html: string; text?: string }) {
  const t = getTransporter();
  await t.sendMail({
    from: process.env.SMTP_FROM!,
    ...options,
  });
}

// ─── Email Templates ──────────────────────────────────────────────────────────

export async function sendVerificationEmail(to: string, url: string) {
  await sendMail({
    to,
    subject: "Verify your email — Fidel Tools",
    text: `Welcome to Fidel Tools! Verify your email: ${url}`,
    html: `
<!DOCTYPE html>
<html>
<body style="font-family:sans-serif;background:#f9f9f9;margin:0;padding:40px 0">
  <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:12px;padding:40px;border:1px solid #e5e5e5">
    <h1 style="font-size:22px;margin:0 0 8px">Verify your email</h1>
    <p style="color:#555;margin:0 0 24px">
      Welcome to Fidel Tools! Click below to verify your email address and activate your account.
    </p>
    <a href="${url}"
      style="background:#1a1a1a;color:#fff;padding:12px 28px;border-radius:8px;
             text-decoration:none;font-weight:600;display:inline-block">
      Verify Email
    </a>
    <p style="color:#999;font-size:12px;margin-top:32px">
      This link expires in 24 hours. If you didn't create an account, you can safely ignore this email.
    </p>
  </div>
</body>
</html>`,
  });
}

export async function sendPasswordResetEmail(to: string, url: string) {
  await sendMail({
    to,
    subject: "Reset your password — Fidel Tools",
    text: `Reset your Fidel Tools password: ${url} — This link expires in 1 hour.`,
    html: `
<!DOCTYPE html>
<html>
<body style="font-family:sans-serif;background:#f9f9f9;margin:0;padding:40px 0">
  <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:12px;padding:40px;border:1px solid #e5e5e5">
    <h1 style="font-size:22px;margin:0 0 8px">Reset your password</h1>
    <p style="color:#555;margin:0 0 24px">
      We received a request to reset your Fidel Tools password. Click below to choose a new one.
    </p>
    <a href="${url}"
      style="background:#1a1a1a;color:#fff;padding:12px 28px;border-radius:8px;
             text-decoration:none;font-weight:600;display:inline-block">
      Reset Password
    </a>
    <p style="color:#999;font-size:12px;margin-top:32px">
      This link expires in 1 hour. If you didn't request a password reset, no action is needed.
    </p>
  </div>
</body>
</html>`,
  });
}

export async function sendApiKeyCreatedEmail(to: string, keyName: string, keyPrefix: string) {
  await sendMail({
    to,
    subject: `New API key created — ${keyName}`,
    text: `A new API key "${keyName}" (${keyPrefix}...) was just created on your Fidel Tools account.`,
    html: `
<!DOCTYPE html>
<html>
<body style="font-family:sans-serif;background:#f9f9f9;margin:0;padding:40px 0">
  <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:12px;padding:40px;border:1px solid #e5e5e5">
    <h1 style="font-size:22px;margin:0 0 8px">New API key created</h1>
    <p style="color:#555;margin:0 0 16px">
      A new API key was just added to your Fidel Tools account:
    </p>
    <div style="background:#f4f4f4;border-radius:6px;padding:16px;font-family:monospace;margin-bottom:24px">
      <strong>${keyName}</strong><br/>
      <span style="color:#666">${keyPrefix}••••••••••••••••••••••••••••••••</span>
    </div>
    <p style="color:#555;margin:0 0 16px">
      If you didn't create this key, revoke it immediately from your dashboard:
    </p>
    <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/api-keys"
      style="background:#dc2626;color:#fff;padding:12px 28px;border-radius:8px;
             text-decoration:none;font-weight:600;display:inline-block">
      Review API Keys
    </a>
  </div>
</body>
</html>`,
  });
}

export async function sendApiKeyRevokedEmail(to: string, keyName: string) {
  await sendMail({
    to,
    subject: `API key revoked — ${keyName}`,
    text: `The API key "${keyName}" on your Fidel Tools account has been revoked.`,
    html: `
<!DOCTYPE html>
<html>
<body style="font-family:sans-serif;background:#f9f9f9;margin:0;padding:40px 0">
  <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:12px;padding:40px;border:1px solid #e5e5e5">
    <h1 style="font-size:22px;margin:0 0 8px">API key revoked</h1>
    <p style="color:#555;margin:0">
      The API key <strong>"${keyName}"</strong> has been revoked and can no longer be used to authenticate requests.
    </p>
  </div>
</body>
</html>`,
  });
}

export async function sendWelcomeEmail(to: string, name: string) {
  await sendMail({
    to,
    subject: "Welcome to Fidel Tools 🇪🇹",
    text: `Hi ${name}, welcome to Fidel Tools — the NLP toolkit for Amharic. Create your first API key at ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/api-keys`,
    html: `
<!DOCTYPE html>
<html>
<body style="font-family:sans-serif;background:#f9f9f9;margin:0;padding:40px 0">
  <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:12px;padding:40px;border:1px solid #e5e5e5">
    <h1 style="font-size:22px;margin:0 0 8px">Welcome, ${name}!</h1>
    <p style="color:#555;margin:0 0 16px">
      Your Fidel Tools account is active. You now have access to the most comprehensive
      NLP pre-processing framework for Amharic — normalization, tokenization, stemming,
      stopword removal, and transliteration.
    </p>
    <h2 style="font-size:16px;margin:0 0 8px">Get started in 3 steps:</h2>
    <ol style="color:#555;padding-left:20px;margin:0 0 24px">
      <li>Create an API key in your dashboard</li>
      <li>Install the SDK: <code>pnpm add @fidel-tools/core @fidel-tools/lang-am</code></li>
      <li>Make your first API call</li>
    </ol>
    <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/api-keys"
      style="background:#1a1a1a;color:#fff;padding:12px 28px;border-radius:8px;
             text-decoration:none;font-weight:600;display:inline-block">
      Go to Dashboard
    </a>
  </div>
</body>
</html>`,
  });
}
