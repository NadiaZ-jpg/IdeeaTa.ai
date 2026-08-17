import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import { consumeRateLimit, clientIpFromRequest } from '@/lib/apiRateLimit';

const HOUR_MS = 60 * 60 * 1000;

type Locale = 'ro' | 'en' | 'es';

function dashboardPath(locale: Locale): string {
  if (locale === 'en') return '/en/dashboard';
  if (locale === 'es') return '/es/dashboard';
  return '/dashboard';
}

function authActionPath(locale: Locale): string {
  if (locale === 'en') return '/en/auth/action';
  if (locale === 'es') return '/es/auth/action';
  return '/auth/action';
}

/** Rewrite Firebase hosted UI link → branded IdeeaTa page (localized). */
function toLocalizedActionLink(
  firebaseLink: string,
  locale: Locale,
  baseUrl: string
): string {
  try {
    const u = new URL(firebaseLink);
    const oobCode = u.searchParams.get('oobCode');
    const mode = u.searchParams.get('mode') || 'verifyEmail';
    const apiKey = u.searchParams.get('apiKey');
    const continueUrl = u.searchParams.get('continueUrl');

    const out = new URL(authActionPath(locale), baseUrl);
    out.searchParams.set('mode', mode);
    if (oobCode) out.searchParams.set('oobCode', oobCode);
    if (apiKey) out.searchParams.set('apiKey', apiKey);
    if (continueUrl) out.searchParams.set('continueUrl', continueUrl);
    out.searchParams.set('lang', locale);
    return out.toString();
  } catch {
    // Fallback: keep Firebase link but force lang for hosted UI
    const sep = firebaseLink.includes('?') ? '&' : '?';
    return `${firebaseLink}${sep}lang=${locale}`;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = body?.email;
    const locale: Locale =
      body?.locale === 'en' || body?.locale === 'es' ? body.locale : 'ro';

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // ── Rate Limiting: max 5 req/h per IP, max 3 req/h per email ──────────────
    const ip = clientIpFromRequest(request);
    const emailKey = `send-verif:email:${email.toLowerCase().trim()}`;
    const ipKey = `send-verif:ip:${ip}`;

    const [ipOk, emailOk] = await Promise.all([
      consumeRateLimit(ipKey, 5, HOUR_MS),
      consumeRateLimit(emailKey, 3, HOUR_MS),
    ]);

    if (!ipOk || !emailOk) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }
    // ─────────────────────────────────────────────────────────────────────────

    const origin = request.headers.get('origin') || request.headers.get('referer') || '';
    const baseUrl = origin.includes('localhost') ? 'http://localhost:3000' : 'https://ideeata.ai';
    const redirectUrl = `${baseUrl}${dashboardPath(locale)}`;

    const actionCodeSettings = {
      url: redirectUrl,
      handleCodeInApp: false,
    };

    const firebaseLink = await adminAuth.generateEmailVerificationLink(
      email,
      actionCodeSettings
    );
    const verificationLink = toLocalizedActionLink(firebaseLink, locale, baseUrl);

    let subject = '';
    let htmlBody = '';

    if (locale === 'en') {
      subject = 'Activate your account on IdeeaTa.ai 🚀';
      htmlBody = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #09090b; color: #ffffff; border-radius: 20px; border: 1px solid #27272a;">
          <h1 style="color: #10b981; text-align: center; margin-bottom: 20px;">Welcome to IdeeaTa.ai!</h1>
          <p style="font-size: 16px; line-height: 1.6; color: #d4d4d8;">Hello,</p>
          <p style="font-size: 16px; line-height: 1.6; color: #d4d4d8;">Thank you for registering on IdeeaTa.ai – your intelligent business assistant. To complete your signup and activate your account, please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" style="background-color: #10b981; color: #ffffff; text-decoration: none; padding: 14px 30px; font-size: 16px; font-weight: bold; border-radius: 12px; display: inline-block;">Verify Email Address</a>
          </div>
          <p style="font-size: 14px; line-height: 1.6; color: #71717a; text-align: center;">If you cannot click the button above, copy and paste this link into your browser:<br/>
          <a href="${verificationLink}" style="color: #34d399; word-break: break-all;">${verificationLink}</a></p>
          <hr style="border: 0; border-top: 1px solid #27272a; margin: 30px 0;" />
          <p style="font-size: 14px; line-height: 1.6; color: #71717a; text-align: center;">If you did not request this registration, you can safely ignore this email.</p>
          <p style="font-size: 14px; font-weight: bold; color: #a1a1aa; text-align: center; margin-top: 20px;">The IdeeaTa.ai Team</p>
        </div>
      `;
    } else if (locale === 'es') {
      subject = 'Activa tu cuenta en IdeeaTa.ai 🚀';
      htmlBody = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #09090b; color: #ffffff; border-radius: 20px; border: 1px solid #27272a;">
          <h1 style="color: #10b981; text-align: center; margin-bottom: 20px;">¡Bienvenido a IdeeaTa.ai!</h1>
          <p style="font-size: 16px; line-height: 1.6; color: #d4d4d8;">Hola,</p>
          <p style="font-size: 16px; line-height: 1.6; color: #d4d4d8;">Gracias por registrarte en IdeeaTa.ai – tu asistente de negocios inteligente. Para completar tu registro y activar tu cuenta, confirma tu dirección de correo electrónico haciendo clic en el siguiente botón:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" style="background-color: #10b981; color: #ffffff; text-decoration: none; padding: 14px 30px; font-size: 16px; font-weight: bold; border-radius: 12px; display: inline-block;">Confirmar Correo Electrónico</a>
          </div>
          <p style="font-size: 14px; line-height: 1.6; color: #71717a; text-align: center;">Si no puedes hacer clic en el botón de arriba, copia y pega este enlace en tu navegador:<br/>
          <a href="${verificationLink}" style="color: #34d399; word-break: break-all;">${verificationLink}</a></p>
          <hr style="border: 0; border-top: 1px solid #27272a; margin: 30px 0;" />
          <p style="font-size: 14px; line-height: 1.6; color: #71717a; text-align: center;">Si no solicitaste este registro, puedes ignorar este correo de forma segura.</p>
          <p style="font-size: 14px; font-weight: bold; color: #a1a1aa; text-align: center; margin-top: 20px;">El Equipo de IdeeaTa.ai</p>
        </div>
      `;
    } else {
      subject = 'Activează-ți contul pe IdeeaTa.ai 🚀';
      htmlBody = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #09090b; color: #ffffff; border-radius: 20px; border: 1px solid #27272a;">
          <h1 style="color: #10b981; text-align: center; margin-bottom: 20px;">Bun venit pe IdeeaTa.ai!</h1>
          <p style="font-size: 16px; line-height: 1.6; color: #d4d4d8;">Salutare,</p>
          <p style="font-size: 16px; line-height: 1.6; color: #d4d4d8;">Îți mulțumim că te-ai înregistrat pe IdeeaTa.ai – asistentul tău inteligent pentru planuri de afaceri. Pentru a finaliza înregistrarea și a-ți activa contul, te rugăm să îți confirmi adresa de email apăsând pe butonul de mai jos:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" style="background-color: #10b981; color: #ffffff; text-decoration: none; padding: 14px 30px; font-size: 16px; font-weight: bold; border-radius: 12px; display: inline-block;">Activează Contul</a>
          </div>
          <p style="font-size: 14px; line-height: 1.6; color: #71717a; text-align: center;">Dacă nu poți apăsa butonul de mai sus, copiază și lipește acest link în browserul tău:<br/>
          <a href="${verificationLink}" style="color: #34d399; word-break: break-all;">${verificationLink}</a></p>
          <hr style="border: 0; border-top: 1px solid #27272a; margin: 30px 0;" />
          <p style="font-size: 14px; line-height: 1.6; color: #71717a; text-align: center;">Dacă nu tu ai solicitat crearea acestui cont, poți ignora acest email în siguranță.</p>
          <p style="font-size: 14px; font-weight: bold; color: #a1a1aa; text-align: center; margin-top: 20px;">Echipa IdeeaTa.ai</p>
        </div>
      `;
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.error('RESEND_API_KEY is not defined in environment variables');
      return NextResponse.json({ error: 'Email configuration error' }, { status: 500 });
    }

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'IdeeaTa.ai <contact@ideeata.ai>',
        to: [email],
        subject: subject,
        html: htmlBody,
      }),
    });

    if (!resendResponse.ok) {
      const errorText = await resendResponse.text();
      console.error('Resend API error:', errorText);
      return NextResponse.json({ error: 'Failed to send verification email' }, { status: 500 });
    }

    const resendData = await resendResponse.json();
    return NextResponse.json({ success: true, id: resendData.id });
  } catch (error: any) {
    console.error('Verification email API error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
