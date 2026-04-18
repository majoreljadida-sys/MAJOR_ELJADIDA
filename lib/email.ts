import nodemailer from 'nodemailer'

// ── Transporter ────────────────────────────────────────────────────────────
function createTransporter() {
  return nodemailer.createTransport({
    host:   process.env.SMTP_HOST ?? 'smtp.gmail.com',
    port:   Number(process.env.SMTP_PORT ?? 587),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

const FROM = process.env.EMAIL_FROM ?? 'Club MAJOR <noreply@clubmajor.ma>'
const BASE_URL = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'

// ── Layout commun ──────────────────────────────────────────────────────────
function layout(title: string, body: string) {
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#0d2a1e 0%,#1a4a33 100%);border-radius:16px 16px 0 0;padding:32px 40px;text-align:center;">
            <div style="display:inline-block;background:rgba(45,140,110,0.15);border:1px solid rgba(78,204,163,0.3);border-radius:12px;padding:12px 20px;">
              <span style="font-size:24px;font-weight:900;color:#4ecca3;letter-spacing:6px;text-transform:uppercase;">MAJOR</span>
              <span style="display:block;font-size:10px;color:#6b7280;letter-spacing:3px;margin-top:2px;">EL JADIDA · MAROC</span>
            </div>
            <h1 style="color:#ffffff;font-size:20px;font-weight:700;margin:20px 0 0;letter-spacing:1px;">${title}</h1>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="background:#ffffff;padding:36px 40px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;">
            ${body}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f9fafb;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 16px 16px;padding:20px 40px;text-align:center;">
            <p style="color:#9ca3af;font-size:11px;margin:0 0 6px;">Club MAJOR · El Jadida, Maroc</p>
            <p style="color:#d1d5db;font-size:11px;margin:0;">
              <a href="${BASE_URL}" style="color:#4ecca3;text-decoration:none;">clubmajor.ma</a>
              &nbsp;·&nbsp;
              <a href="${BASE_URL}/login" style="color:#4ecca3;text-decoration:none;">Accéder à mon espace</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function btn(href: string, label: string, color = '#2d8c6e') {
  return `<div style="text-align:center;margin:28px 0;">
    <a href="${href}" style="display:inline-block;background:${color};color:#ffffff;font-size:14px;font-weight:700;padding:14px 32px;border-radius:10px;text-decoration:none;letter-spacing:0.5px;">${label}</a>
  </div>`
}

function info(rows: [string, string][]) {
  const cells = rows.map(([k, v]) => `
    <tr>
      <td style="padding:10px 16px;background:#f9fafb;border-bottom:1px solid #e5e7eb;color:#6b7280;font-size:13px;width:45%;">${k}</td>
      <td style="padding:10px 16px;background:#f9fafb;border-bottom:1px solid #e5e7eb;color:#111827;font-size:13px;font-weight:600;">${v}</td>
    </tr>`).join('')
  return `<table width="100%" cellpadding="0" cellspacing="0" style="border-radius:8px;overflow:hidden;border:1px solid #e5e7eb;margin:20px 0;">${cells}</table>`
}

// ── Helpers ─────────────────────────────────────────────────────────────────
async function sendMail(to: string, subject: string, html: string) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('[EMAIL] SMTP non configuré — email ignoré:', subject, '→', to)
    return
  }
  try {
    const t = createTransporter()
    await t.sendMail({ from: FROM, to, subject, html })
    console.log('[EMAIL] Envoyé:', subject, '→', to)
  } catch (err) {
    console.error('[EMAIL] Erreur envoi:', err)
  }
}

// ── 1. Inscription reçue ───────────────────────────────────────────────────
export async function sendWelcomeEmail(to: string, firstName: string, licenseNumber: string) {
  const html = layout('Inscription reçue !', `
    <p style="color:#374151;font-size:15px;margin:0 0 16px;">Bonjour <strong>${firstName}</strong>,</p>
    <p style="color:#374151;font-size:14px;line-height:1.7;margin:0 0 20px;">
      Votre demande d'adhésion au <strong style="color:#2d8c6e;">Club MAJOR</strong> a bien été reçue.
      Un administrateur va examiner votre dossier et valider votre compte sous peu.
    </p>
    ${info([
      ['Numéro de licence', licenseNumber],
      ['Statut', 'En attente de validation'],
    ])}
    <div style="background:#fefce8;border:1px solid #fde68a;border-radius:10px;padding:16px 20px;margin:20px 0;">
      <p style="color:#92400e;font-size:13px;margin:0;">
        ⏳ Vous recevrez un email de confirmation dès que votre compte sera validé par l'équipe.
      </p>
    </div>
    ${btn(`${BASE_URL}/login`, 'Accéder à mon espace')}
  `)
  await sendMail(to, '✅ Inscription reçue — Club MAJOR', html)
}

// ── 2. Compte validé ──────────────────────────────────────────────────────
export async function sendValidationEmail(to: string, firstName: string, licenseNumber: string) {
  const html = layout('Bienvenue au Club MAJOR !', `
    <p style="color:#374151;font-size:15px;margin:0 0 16px;">Bonjour <strong>${firstName}</strong>,</p>
    <p style="color:#374151;font-size:14px;line-height:1.7;margin:0 0 20px;">
      Bonne nouvelle ! Votre adhésion au <strong style="color:#2d8c6e;">Club MAJOR</strong>
      a été <strong>validée</strong>. Vous faites désormais partie de la famille ! 🏃
    </p>
    ${info([
      ['Numéro de licence', licenseNumber],
      ['Statut', '✅ Actif'],
    ])}
    <p style="color:#374151;font-size:14px;line-height:1.7;margin:20px 0;">
      Vous pouvez maintenant accéder à votre espace membre, consulter les programmes
      d'entraînement et vous inscrire aux événements.
    </p>
    ${btn(`${BASE_URL}/member/dashboard`, 'Accéder à mon espace membre', '#2d8c6e')}
  `)
  await sendMail(to, '🎉 Compte validé — Bienvenue au Club MAJOR !', html)
}

// ── 3. Paiement confirmé ──────────────────────────────────────────────────
export async function sendPaymentConfirmationEmail(
  to: string, firstName: string,
  amount: number, description: string, paidDate: Date
) {
  const html = layout('Paiement confirmé', `
    <p style="color:#374151;font-size:15px;margin:0 0 16px;">Bonjour <strong>${firstName}</strong>,</p>
    <p style="color:#374151;font-size:14px;line-height:1.7;margin:0 0 20px;">
      Votre paiement a bien été enregistré. Merci pour votre règlement !
    </p>
    ${info([
      ['Objet', description || 'Cotisation Club MAJOR'],
      ['Montant', `${amount.toFixed(2)} MAD`],
      ['Date', paidDate.toLocaleDateString('fr-MA', { day: '2-digit', month: 'long', year: 'numeric' })],
      ['Statut', '✅ Payé'],
    ])}
    ${btn(`${BASE_URL}/member/payments`, 'Voir mes paiements')}
  `)
  await sendMail(to, '✅ Paiement confirmé — Club MAJOR', html)
}

// ── 4. Rappel paiement en retard ──────────────────────────────────────────
export async function sendPaymentReminderEmail(
  to: string, firstName: string,
  amount: number, description: string, dueDate?: Date | null
) {
  const dueLine = dueDate
    ? `<p style="color:#374151;font-size:13px;margin:4px 0 0;">Échéance : <strong>${dueDate.toLocaleDateString('fr-MA', { day: '2-digit', month: 'long', year: 'numeric' })}</strong></p>`
    : ''
  const html = layout('Rappel de paiement', `
    <p style="color:#374151;font-size:15px;margin:0 0 16px;">Bonjour <strong>${firstName}</strong>,</p>
    <p style="color:#374151;font-size:14px;line-height:1.7;margin:0 0 20px;">
      Nous vous rappelons qu'un paiement est en attente de règlement.
    </p>
    <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:16px 20px;margin:20px 0;">
      <p style="color:#991b1b;font-size:14px;font-weight:700;margin:0 0 4px;">💳 ${description || 'Cotisation Club MAJOR'}</p>
      <p style="color:#b91c1c;font-size:20px;font-weight:900;margin:4px 0 0;">${amount.toFixed(2)} MAD</p>
      ${dueLine}
    </div>
    <p style="color:#6b7280;font-size:13px;line-height:1.6;margin:0 0 20px;">
      Pour toute question, contactez l'administration du club via WhatsApp ou présentez-vous lors
      de la prochaine séance d'entraînement.
    </p>
    ${btn(`${BASE_URL}/member/payments`, 'Voir mes paiements', '#dc2626')}
  `)
  await sendMail(to, '⚠️ Rappel paiement — Club MAJOR', html)
}

// ── 5. Rappel événement ───────────────────────────────────────────────────
export async function sendEventReminderEmail(
  to: string, firstName: string,
  eventTitle: string, eventDate: Date, eventLocation: string
) {
  const dateStr = eventDate.toLocaleDateString('fr-MA', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
  })
  const timeStr = eventDate.toLocaleTimeString('fr-MA', { hour: '2-digit', minute: '2-digit' })
  const html = layout(`Rappel : ${eventTitle}`, `
    <p style="color:#374151;font-size:15px;margin:0 0 16px;">Bonjour <strong>${firstName}</strong>,</p>
    <p style="color:#374151;font-size:14px;line-height:1.7;margin:0 0 20px;">
      Rappel : vous êtes inscrit(e) à l'événement suivant qui approche !
    </p>
    <div style="background:linear-gradient(135deg,#0d2a1e,#1a4a33);border-radius:12px;padding:24px 28px;margin:20px 0;text-align:center;">
      <p style="color:#4ecca3;font-size:11px;letter-spacing:3px;text-transform:uppercase;margin:0 0 8px;">Événement</p>
      <p style="color:#ffffff;font-size:20px;font-weight:800;margin:0 0 16px;">${eventTitle}</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="text-align:center;padding:8px;">
            <p style="color:#9ca3af;font-size:11px;text-transform:uppercase;margin:0 0 4px;">Date</p>
            <p style="color:#ffffff;font-size:13px;font-weight:600;margin:0;">${dateStr}</p>
          </td>
          <td style="text-align:center;padding:8px;border-left:1px solid rgba(255,255,255,0.1);">
            <p style="color:#9ca3af;font-size:11px;text-transform:uppercase;margin:0 0 4px;">Heure</p>
            <p style="color:#ffffff;font-size:13px;font-weight:600;margin:0;">${timeStr}</p>
          </td>
          <td style="text-align:center;padding:8px;border-left:1px solid rgba(255,255,255,0.1);">
            <p style="color:#9ca3af;font-size:11px;text-transform:uppercase;margin:0 0 4px;">Lieu</p>
            <p style="color:#ffffff;font-size:13px;font-weight:600;margin:0;">${eventLocation || 'À confirmer'}</p>
          </td>
        </tr>
      </table>
    </div>
    <p style="color:#6b7280;font-size:13px;line-height:1.6;margin:0 0 20px;">
      N'oubliez pas votre tenue du club et votre dossard si besoin. Bonne chance ! 💪
    </p>
    ${btn(`${BASE_URL}/events`, 'Voir les événements')}
  `)
  await sendMail(to, `🏃 Rappel : ${eventTitle} — Club MAJOR`, html)
}
