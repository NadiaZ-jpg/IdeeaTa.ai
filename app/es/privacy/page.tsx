import Link from 'next/link';

export default function PrivacyPageEs() {
  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-300 py-24 px-4 sm:px-8">
      <div className="max-w-4xl mx-auto prose prose-invert prose-emerald text-justify">
        <h1>Política de Privacidad</h1>
        <p><strong>Última actualización:</strong> Junio de 2026</p>

        <p>En <strong>IdeeaTa.ai</strong>, tu privacidad y la seguridad de tus datos son nuestras máximas prioridades. Esta Política de Privacidad explica cómo recopilamos, utilizamos, protegemos y, en su caso, compartimos tus datos personales de acuerdo con el Reglamento General de Protección de Datos (GDPR).</p>

        <h2>1. ¿Qué Datos Recopilamos?</h2>
        <p>Al utilizar IdeeaTa.ai, podemos recopilar las siguientes categorías de datos:</p>
        <ul>
          <li><strong>Datos de Autenticación y Perfil:</strong> Nombre, dirección de correo electrónico, foto de perfil (cuando inicias sesión a través de Google o Facebook usando Firebase Auth).</li>
          <li><strong>Contenido Generado por el Usuario:</strong> Ideas de negocios introducidas, planes de negocios generados, opciones de presupuesto y enlaces compartidos. Estos se guardan de forma segura en nuestra base de datos Firestore para que puedas acceder a ellos desde tu panel de control.</li>
          <li><strong>Datos de Transacción:</strong> Si actualizas a funciones premium, nosotros no recopilamos ni almacenamos directamente los datos de tu tarjeta. Todo el procesamiento de pagos lo realiza de forma segura <strong>Lemon Squeezy</strong>. Solo recibimos la confirmación del pago y un ID de transacción.</li>
          <li><strong>Datos Técnicos y de Uso:</strong> Dirección IP, tipo de navegador, dispositivo utilizado y datos analíticos básicos recopilados para optimizar la plataforma y prevenir abusos (por ejemplo, limitación de velocidad).</li>
        </ul>

        <h2>2. ¿Cómo Utilizamos los Datos Recopilados?</h2>
        <ul>
          <li><strong>Para proporcionar el servicio:</strong> Procesar tu idea a través de las APIs de IA (Google Gemini) para devolverte tu plan de negocios.</li>
          <li><strong>Para guardar el historial:</strong> Almacenar los planes en Firebase para que puedas acceder a ellos y editarlos más tarde.</li>
          <li><strong>Para procesar pagos:</strong> Validar el acceso al "Studio de Edición AI" tras el pago a través de Lemon Squeezy.</li>
          <li><strong>Para soporte y seguridad:</strong> Prevenir fraudes, investigar errores (seguimiento de fallos) y proporcionar soporte técnico si nos contactas.</li>
          <li><strong>Comunicación:</strong> Enviarte correos electrónicos transaccionales (recibos, restablecimiento de contraseñas) y, ocasionalmente, correos electrónicos informativos de los que puedes darte de baja en cualquier momento.</li>
        </ul>

        <h2>3. Compartir Datos con Terceros</h2>
        <p>Nosotros no vendemos tus datos personales. Los datos se comparten exclusivamente con proveedores de servicios (subencargados) estrictamente necesarios para el funcionamiento de la plataforma:</p>
        <ul>
          <li><strong>Google (Firebase / Firestore):</strong> Para alojamiento de bases de datos, autenticación y almacenamiento de planes.</li>
          <li><strong>Google (Gemini AI):</strong> Para generar el texto. Ten en cuenta que solo enviamos los fragmentos de texto (prompts) que tú introduces. No enviamos tus datos de identificación personal al modelo de IA.</li>
          <li><strong>Lemon Squeezy:</strong> Para procesar tus pagos de forma segura.</li>
          <li><strong>Google AdSense:</strong> Si se muestran anuncios, los proveedores de publicidad pueden utilizar sus propias tecnologías para anuncios personalizados (ver Política de Cookies).</li>
        </ul>

        <h2>4. Tus Derechos (GDPR)</h2>
        <p>Si eres residente del Espacio Económico Europeo (EEE), tienes los siguientes derechos:</p>
        <ol>
          <li><strong>Derecho de Acceso:</strong> Puedes solicitar una copia de los datos que conservamos.</li>
          <li><strong>Derecho de Supresión ("Derecho al olvido"):</strong> Puedes solicitar la eliminación permanente de tu cuenta y de todos los planes de nuestra base de datos enviando un correo electrónico a la dirección que figura más abajo. Los datos se eliminarán en un plazo de 30 días.</li>
          <li><strong>Derecho de Rectificación:</strong> Puedes pedirnos que corrijamos datos incorrectos.</li>
          <li><strong>Derecho a Retirar el Consentimiento:</strong> Puedes revocar tu consentimiento para las cookies o las comunicaciones de marketing en cualquier momento.</li>
        </ol>

        <h2>5. Seguridad de los Datos</h2>
        <ul>
          <li><strong>Cifrado:</strong> Los datos transmitidos entre tu navegador y nuestros servidores, así como la base de datos Firestore, se cifran en tránsito y en reposo.</li>
          <li><strong>Enlaces Compartidos:</strong> Si utilizas la función "Compartir" de un plan de negocios, la URL generada será pública para cualquiera que tenga el enlace, así que trátalo con responsabilidad.</li>
        </ul>

        <h2>6. Contacto</h2>
        <p>Para ejercer tus derechos GDPR o para otras dudas sobre privacidad, puedes contactarnos en: <a href="mailto:contact@ideeata.ai" className="text-emerald-400">contact@ideeata.ai</a>.</p>
        
        <div className="flex justify-center mt-12 mb-12">
          <Link href="/es/demo" className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg shadow-emerald-900/30 no-underline">
            Valida tu idea ahora mismo
          </Link>
        </div>
      </div>
    </div>
  );
}
