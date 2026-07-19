import Link from 'next/link';

export default function CookiesPageEs() {
  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-300 py-24 px-4 sm:px-8">
      <div className="max-w-4xl mx-auto prose prose-invert prose-emerald text-justify">
        <h1>Política de Cookies</h1>
        <p><strong>Última actualización:</strong> Junio de 2026</p>

        <p>Para garantizar el correcto funcionamiento de la plataforma <strong>IdeeaTa.ai</strong> y ofrecerte una experiencia de usuario óptima, utilizamos cookies y tecnologías similares. Al acceder al sitio, aceptas el uso de cookies de acuerdo con esta política.</p>

        <h2>1. ¿Qué son las cookies?</h2>
        <p>Las cookies son pequeños archivos de texto que el navegador almacena en el dispositivo desde el que navegas, los cuales ayudan al sitio web a recordar tus acciones y preferencias (como el inicio de sesión o los ajustes de idioma) durante un periodo de tiempo.</p>

        <h2>2. Tipos de Cookies que utilizamos</h2>
        
        <h3>A. Cookies Estrictamente Necesarias (Obligatorias)</h3>
        <p>Estas cookies son esenciales para que la aplicación IdeeaTa.ai funcione correctamente. No se pueden desactivar.</p>
        <ul>
          <li><strong>Autenticación (Firebase):</strong> Mantiene activa tu sesión después de iniciar sesión con Google o Facebook. Sin ellas, tendrías que volver a iniciar sesión con cada clic.</li>
          <li><strong>Procesamiento de Pagos (Lemon Squeezy):</strong> Lemon Squeezy utiliza cookies y almacenamiento local para detectar fraudes y garantizar la seguridad de los datos de la transacción durante el pago.</li>
          <li><strong>Guardado Temporal del Plan (Almacenamiento Local):</strong> Guardamos temporalmente el plan que escribes en la memoria del navegador (Almacenamiento Local) para que, si cierras la ventana accidentalmente, no pierdas tu trabajo.</li>
        </ul>

        <h3>B. Cookies Analíticas y de Rendimiento</h3>
        <p>Nos ayudan a comprender cómo interactúan los usuarios con nuestra aplicación (por ejemplo, cuáles son los tipos de gráficos más utilizados o dónde se atascan los usuarios) para poder mejorar la interfaz.</p>
        <ul>
          <li>Los datos recopilados suelen ser anónimos.</li>
        </ul>

        <h3>C. Cookies Publicitarias y de Segmentación (Google AdSense)</h3>
        <p>Dado que utilizamos Google AdSense para apoyar parcialmente el desarrollo de la plataforma:</p>
        <ul>
          <li>Los proveedores externos, incluido Google, utilizan cookies para mostrar anuncios basados en tus visitas anteriores a este sitio o a otros sitios web.</li>
          <li>El uso de cookies publicitarias por parte de Google les permite a ellos y a sus socios mostrarte anuncios basados en tu visita a este sitio y/u otros sitios en Internet.</li>
          <li>Puedes optar por excluirte de la publicidad personalizada visitando los <a href="https://adssettings.google.com/" target="_blank" rel="noreferrer" className="text-emerald-400">Ajustes de Anuncios de Google</a>.</li>
        </ul>

        <h2>3. ¿Cómo Puedes Gestionar las Cookies?</h2>
        <ul>
          <li><strong>Desde tu navegador:</strong> La mayoría de los navegadores te permiten ver, eliminar o bloquear cookies de todos los sitios o solo de sitios específicos. Ten en cuenta que bloquear las cookies Estrictamente Necesarias imposibilitará el inicio de sesión en tu cuenta de IdeeaTa.ai.</li>
          <li><strong>Exclusión de AdSense:</strong> Además del enlace mencionado anteriormente, puedes utilizar sitios como www.aboutads.info para excluirte de ciertas cookies de seguimiento utilizadas por diversos proveedores.</li>
        </ul>

        <h2>4. Cambios</h2>
        <p>Actualizaremos periódicamente esta Política de Cookies. Cualquier cambio será efectivo inmediatamente tras la publicación de la versión revisada en el sitio.</p>

        <p><em>Si tienes alguna otra pregunta, contáctanos en: <a href="mailto:contact@ideeata.ai" className="text-emerald-400">contact@ideeata.ai</a>.</em></p>
        
        <div className="flex justify-center mt-12 mb-12">
          <Link href="/es/demo" className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg shadow-emerald-900/30 no-underline">
            Valida tu idea ahora mismo
          </Link>
        </div>
      </div>
    </div>
  );
}
