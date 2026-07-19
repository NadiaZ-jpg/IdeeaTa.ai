import Link from 'next/link';

export default function TermsPageEs() {
  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-300 py-24 px-4 sm:px-8">
      <div className="max-w-4xl mx-auto prose prose-invert prose-emerald text-justify">
        <h1>Términos y Condiciones de IdeeaTa.ai</h1>
        <p><strong>Última actualización:</strong> Junio de 2026</p>
        
        <p>¡Bienvenido a <strong>IdeeaTa.ai</strong>! Estos Términos y Condiciones regulan tu acceso y uso de la plataforma web IdeeaTa.ai y sus servicios asociados. Al acceder o utilizar nuestra plataforma, aceptas cumplir con estos Términos. Si no estás de acuerdo con ellos, por favor no utilices el servicio.</p>

        <h2>1. Descripción del Servicio</h2>
        <p>IdeeaTa.ai es una plataforma de Software como Servicio (SaaS) impulsada por Inteligencia Artificial que ayuda a los emprendedores a generar modelos de planes de negocios, estructuras, estimaciones de presupuestos y análisis SWOT.</p>

        <h2>2. Descargo de Responsabilidad y Ausencia de Garantías Comerciales o Financieras</h2>
        <div className="bg-red-950/30 border border-red-900/50 p-4 rounded-xl my-6">
          <p className="text-red-400 font-bold mt-0 mb-2">IMPORTANTE</p>
          <p className="mb-0">IdeeaTa.ai es una herramienta <strong>estrictamente informativa y educativa</strong>. No somos asesores financieros, abogados ni contables.</p>
        </div>
        <ul>
          <li><strong>Sin Garantías de Éxito:</strong> No garantizamos que la aplicación de las ideas o planes de negocios generados en esta plataforma traiga beneficios, financiación o éxito comercial.</li>
          <li><strong>Precisión de los Datos (IA):</strong> La información, las estimaciones presupuestarias y las proyecciones financieras son generadas por un algoritmo de Inteligencia Artificial basado en promedios generales del mercado. No asumimos ninguna responsabilidad por la exactitud de estas estimaciones. Es tu única responsabilidad validar el plan con expertos autorizados antes de invertir dinero o solicitar fondos.</li>
        </ul>

        <h2>3. Cuenta de Usuario</h2>
        <p>Para utilizar ciertas funciones (como guardar planes o funciones premium), debes crear una cuenta autenticada a través de Google, Facebook o Correo Electrónico.</p>
        <ul>
          <li>Eres responsable de la confidencialidad de tus datos de acceso.</li>
          <li>Nos reservamos el derecho de suspender las cuentas que abusen del sistema (por ejemplo, generación automatizada/spam de documentos para agotar los recursos de la IA).</li>
        </ul>

        <h2>4. Pagos y Política de Reembolso</h2>
        <ul>
          <li><strong>Procesamiento de Pagos:</strong> Los pagos para desbloquear funciones premium (como el "Studio de Edición AI", exportaciones especiales) se procesan de forma segura exclusivamente a través de nuestro socio <strong>Lemon Squeezy</strong>.</li>
          <li><strong>Sin Reembolsos:</strong> Debido a la naturaleza digital y consumible de nuestros servicios (costes de procesamiento de IA no recuperables para cada generación), <strong>todas las compras son definitivas</strong>. No se ofrecen reembolsos después de haber completado la compra del plan o el desbloqueo de funciones, a menos que el servicio no haya estado disponible técnicamente por nuestra culpa.</li>
        </ul>

        <h2>5. Propiedad Intelectual</h2>
        <ul>
          <li><strong>Datos Generados:</strong> Te conviertes en el propietario de los documentos (PDF, DOCX, PPTX) y textos que descargas y puedes utilizarlos para cualquier fin comercial o personal que desees.</li>
          <li><strong>Plataforma:</strong> El código fuente, diseño, interfaz gráfica y marca "IdeeaTa.ai" nos pertenecen por completo y no pueden ser copiados ni reproducidos.</li>
        </ul>

        <h2>6. Limitación de Responsabilidad</h2>
        <p>IdeeaTa.ai no será responsable de ningún daño directo, indirecto, incidental o consecuente, ni de la pérdida de beneficios, reputación o datos resultantes de:</p>
        <ul>
          <li>El uso o la imposibilidad de usar el servicio.</li>
          <li>Actuar en base a los planes financieros generados por el sistema.</li>
          <li>El acceso no autorizado a nuestros servidores donde se almacenan tus planes.</li>
        </ul>

        <h2>7. Cambios en los Términos</h2>
        <p>Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios significativos se notificarán en la plataforma. El uso continuado después del cambio representa tu aceptación.</p>

        <h2>8. Datos de Contacto</h2>
        <p>Para cualquier pregunta relativa a estos Términos, ponte en contacto con nosotros en: <a href="mailto:contact@ideeata.ai" className="text-emerald-400">contact@ideeata.ai</a>.</p>
        
        <div className="flex justify-center mt-12 mb-12">
          <Link href="/es/demo" className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg shadow-emerald-900/30 no-underline">
            Valida tu idea ahora mismo
          </Link>
        </div>
      </div>
    </div>
  );
}
