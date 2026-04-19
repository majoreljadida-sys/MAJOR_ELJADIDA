import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import nodemailer from 'nodemailer'

export async function POST(req: Request) {
  const session = await auth()
  if (!session || session.user.role?.toLowerCase() !== 'admin')
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  try {
    const { email, name } = await req.json()
    if (!email) return NextResponse.json({ error: 'Email manquant' }, { status: 400 })

    const transporter = nodemailer.createTransport({
      host:   process.env.SMTP_HOST,
      port:   Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    const prenom = name?.split(' ')[0] ?? 'cher membre'

    await transporter.sendMail({
      from:    process.env.EMAIL_FROM,
      to:      email,
      subject: '🎉 Bienvenue au Club MAJOR — Votre adhésion est activée !',
      html: `
        <!DOCTYPE html>
        <html lang="fr">
        <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
        <body style="margin:0;padding:0;background:#0F0F1A;font-family:'Helvetica Neue',Arial,sans-serif;">
          <div style="max-width:600px;margin:0 auto;padding:40px 20px;">

            <!-- Header -->
            <div style="text-align:center;margin-bottom:32px;">
              <h1 style="color:#2D8C6E;font-size:36px;letter-spacing:6px;margin:0;font-weight:900;">MAJOR</h1>
              <p style="color:#888;font-size:12px;letter-spacing:3px;margin:4px 0 0;">MAZAGAN ATHLÉTISME JOGGING AND ORGANISATION</p>
            </div>

            <!-- Card -->
            <div style="background:#1A1A2E;border-radius:16px;padding:40px;border:1px solid #2D2D4A;">

              <!-- Slogan arabe -->
              <div style="text-align:center;margin-bottom:28px;">
                <p style="color:#2D8C6E;font-size:22px;font-weight:700;margin:0;direction:rtl;">ماجووور بالفرح و السرور</p>
                <p style="color:#888;font-size:13px;margin:6px 0 0;font-style:italic;">MAJOR — avec joie et allégresse</p>
              </div>

              <!-- Message -->
              <h2 style="color:#ffffff;font-size:20px;font-weight:600;margin:0 0 16px;">
                Bienvenue ${prenom} ! 🎉
              </h2>

              <p style="color:#B0B0C0;font-size:15px;line-height:1.7;margin:0 0 16px;">
                Nous avons le plaisir de vous informer que votre adhésion au <strong style="color:#2D8C6E;">Club MAJOR El Jadida</strong> est désormais <strong style="color:#22c55e;">activée</strong> !
              </p>

              <p style="color:#B0B0C0;font-size:15px;line-height:1.7;margin:0 0 24px;">
                Vous faites maintenant partie d'une belle famille de coureurs passionnés. Rejoignez-nous pour les entraînements, les événements et partagez la joie de courir ensemble à Mazagan !
              </p>

              <!-- Points forts -->
              <div style="background:#0F0F1A;border-radius:12px;padding:20px;margin-bottom:28px;">
                <p style="color:#2D8C6E;font-size:13px;font-weight:600;letter-spacing:2px;margin:0 0 12px;">VOTRE ESPACE MEMBRE</p>
                <p style="color:#B0B0C0;font-size:14px;margin:6px 0;">✅ Accès à votre espace personnel</p>
                <p style="color:#B0B0C0;font-size:14px;margin:6px 0;">✅ Inscription aux événements et sorties</p>
                <p style="color:#B0B0C0;font-size:14px;margin:6px 0;">✅ Programmes d'entraînement mensuels</p>
                <p style="color:#B0B0C0;font-size:14px;margin:6px 0;">✅ Coach MAJOR IA disponible 24h/24</p>
              </div>

              <!-- CTA -->
              <div style="text-align:center;margin-bottom:28px;">
                <a href="https://major-eljadida.vercel.app/member/dashboard"
                  style="display:inline-block;background:#2D8C6E;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:600;font-size:15px;letter-spacing:1px;">
                  ACCÉDER À MON ESPACE →
                </a>
              </div>

              <!-- Message encouragement -->
              <div style="border-top:1px solid #2D2D4A;padding-top:24px;text-align:center;">
                <p style="color:#888;font-size:14px;line-height:1.6;margin:0;">
                  <em>"La meilleure ordonnance qu'un médecin puisse écrire,<br>c'est une sortie running avec des amis."</em>
                </p>
                <p style="color:#2D8C6E;font-size:16px;font-weight:700;margin:12px 0 0;direction:rtl;">ماجووور بالفرح و السرور 🏃‍♂️</p>
              </div>
            </div>

            <!-- Footer -->
            <div style="text-align:center;margin-top:24px;">
              <p style="color:#555;font-size:12px;margin:0;">Club MAJOR · El Jadida (Mazagan), Maroc</p>
              <p style="color:#555;font-size:12px;margin:4px 0 0;">
                <a href="https://major-eljadida.vercel.app" style="color:#2D8C6E;text-decoration:none;">major-eljadida.vercel.app</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[NOTIFY ACTIVE]', err)
    return NextResponse.json({ error: 'Erreur envoi email' }, { status: 500 })
  }
}
