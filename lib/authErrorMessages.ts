/**
 * Localized Firebase Auth error messages (RO / EN / ES).
 * Demo/Studio Desktop (C1) — aligned with LoginContent / DemoMobile copy.
 */

export type AuthLocale = "ro" | "en" | "es";

type Msg = { ro: string; en: string; es: string };

const M = {
  googleFailed: {
    ro: "Nu s-a putut conecta cu Google. Încearcă din nou.",
    en: "Could not sign in with Google. Please try again.",
    es: "No se pudo iniciar sesión con Google. Inténtalo de nuevo.",
  },
  facebookFailed: {
    ro: "Nu s-a putut conecta cu Facebook. Încearcă din nou.",
    en: "Could not sign in with Facebook. Please try again.",
    es: "No se pudo iniciar sesión con Facebook. Inténtalo de nuevo.",
  },
  socialFailed: {
    ro: "Eroare la autentificare. Încearcă din nou.",
    en: "Authentication error. Please try again.",
    es: "Error de autenticación. Por favor, inténtalo de nuevo.",
  },
  accountExistsDifferent: {
    ro: "Există deja un cont cu acest email. Încearcă cu altă metodă de login.",
    en: "An account already exists with this email. Try logging in with a different method.",
    es: "Ya existe una cuenta con este correo electrónico. Intenta iniciar sesión con un método diferente.",
  },
  forgotNeedEmail: {
    ro: "Introdu adresa de email pentru a primi link-ul de resetare.",
    en: "Enter your email address to receive the reset link.",
    es: "Introduce tu dirección de correo electrónico para recibir el enlace de restablecimiento.",
  },
  userNotFound: {
    ro: "Nu există niciun cont cu această adresă de email.",
    en: "There is no account with this email address.",
    es: "No existe ninguna cuenta con esta dirección de correo electrónico.",
  },
  genericRetry: {
    ro: "A apărut o eroare. Încearcă din nou.",
    en: "An error occurred. Please try again.",
    es: "Ocurrió un error. Por favor, inténtalo de nuevo.",
  },
  invalidCredential: {
    ro: "Email sau parolă incorectă.",
    en: "Incorrect email or password.",
    es: "Correo electrónico o contraseña incorrectos.",
  },
  emailInUse: {
    ro: "Există deja un cont cu acest email. Te rugăm să te loghezi.",
    en: "An account already exists with this email. Please log in.",
    es: "Ya existe una cuenta con este correo electrónico. Por favor, inicia sesión.",
  },
  weakPassword: {
    ro: "Parola trebuie să aibă cel puțin 6 caractere.",
    en: "Password must be at least 6 characters long.",
    es: "La contraseña debe tener al menos 6 caracteres.",
  },
  invalidEmail: {
    ro: "Adresă de email invalidă.",
    en: "Invalid email address.",
    es: "Correo electrónico no válido.",
  },
  unknownAuth: {
    ro: "A apărut o eroare necunoscută la autentificare.",
    en: "An unknown authentication error occurred.",
    es: "Ocurrió un error de autenticación desconocido.",
  },
} as const satisfies Record<string, Msg>;

function pick(locale: AuthLocale, msg: Msg): string {
  if (locale === "en") return msg.en;
  if (locale === "es") return msg.es;
  return msg.ro;
}

export function authMsg(locale: AuthLocale, key: keyof typeof M): string {
  return pick(locale, M[key]);
}

export function mapEmailAuthError(
  locale: AuthLocale,
  error: { code?: string; message?: string }
): string {
  const code = error?.code || "";
  if (
    code === "auth/invalid-credential" ||
    code === "auth/user-not-found" ||
    code === "auth/wrong-password"
  ) {
    return authMsg(locale, "invalidCredential");
  }
  if (code === "auth/email-already-in-use") return authMsg(locale, "emailInUse");
  if (code === "auth/weak-password") return authMsg(locale, "weakPassword");
  if (code === "auth/invalid-email") return authMsg(locale, "invalidEmail");
  return error?.message || authMsg(locale, "unknownAuth");
}

export function mapResetAuthError(
  locale: AuthLocale,
  error: { code?: string; message?: string }
): string {
  if (error?.code === "auth/user-not-found") return authMsg(locale, "userNotFound");
  return error?.message || authMsg(locale, "genericRetry");
}

/** Returns null when the user closed the popup (ignore). */
export function mapSocialAuthError(
  locale: AuthLocale,
  error: { code?: string; message?: string },
  provider: "google" | "facebook" | "social" = "social"
): string | null {
  const code = error?.code || "";
  if (code === "auth/popup-closed-by-user") return null;
  if (code === "auth/account-exists-with-different-credential") {
    return authMsg(locale, "accountExistsDifferent");
  }
  if (provider === "google") return authMsg(locale, "googleFailed");
  if (provider === "facebook") return authMsg(locale, "facebookFailed");
  return authMsg(locale, "socialFailed");
}
