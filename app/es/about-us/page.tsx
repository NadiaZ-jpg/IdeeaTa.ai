import Link from 'next/link';

export default function AboutUsPageEs() {
  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-300 py-24 px-4 sm:px-8">
      <div className="max-w-4xl mx-auto prose prose-invert prose-emerald">
        <h1 className="text-center text-4xl font-black mb-8">Sobre IdeeaTa.ai</h1>
        
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 mb-12">
          <p className="text-xl text-zinc-300 leading-relaxed m-0 text-center italic">
            "Nuestra misión es democratizar el acceso a la planificación empresarial profesional. Transformamos la chispa de genio de tu mente en un plan de negocios concreto en solo 2 segundos."
          </p>
        </div>

        <h2>Cómo Empezó Todo</h2>
        <p>Nos dimos cuenta de que miles de emprendedores en fase inicial tienen ideas fantásticas pero se quedan atascados en la burocracia, los cálculos financieros complejos y la redacción formal de los planes de negocios requeridos por inversores o bancos. La consultoría clásica lleva semanas y cuesta miles de euros.</p>
        <p>Así nació <strong>IdeeaTa.ai</strong>. Combinamos la experiencia empresarial con las últimas tecnologías de Inteligencia Artificial (Google Gemini) para crear un asistente capaz de estructurar, presupuestar y redactar un plan de negocios premium al instante.</p>

        <h2>Qué Ofrecemos</h2>
        <ul>
          <li><strong>Velocidad:</strong> El tiempo desde la idea hasta el documento final se reduce a un mínimo absoluto.</li>
          <li><strong>Precisión de IA:</strong> Generamos automáticamente análisis SWOT, estrategias de marketing y presupuestos de inversión.</li>
          <li><strong>Herramientas Interactivas:</strong> Nuestra función estrella, el <em>Studio de Edición AI</em>, te permite ajustar el tono del documento, reducir costes o mejorar el plan para atraer financiación.</li>
          <li><strong>Documentos Listos para Presentar:</strong> Exportamos directamente a un espectacular PDF, Word (DOCX) editable o presentación (PPTX) con gráficos interactivos, exactamente como un Business Angel espera recibirlos.</li>
        </ul>

        <h2>Nuestra Visión</h2>
        <p>Queremos convertirnos en el socio digital número 1 para las empresas emergentes en Europa. Creemos que ninguna buena idea debe perderse solo porque el fundador no sabe cómo redactar un plan de negocios.</p>
        
        <div className="flex justify-center mt-12">
          <Link href="/es/demo" className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg shadow-emerald-900/30 no-underline">
            Valida tu idea ahora mismo
          </Link>
        </div>
      </div>
    </div>
  );
}
