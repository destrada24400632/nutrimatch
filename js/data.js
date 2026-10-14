/* =========================================================================
   NutriMatch — Datos de ejemplo
   Todo lo que hay aquí es FICTICIO: nombres, cédulas, teléfonos y reseñas.
   Las fechas de citas y consultas se generan a partir de la fecha de hoy,
   para que la demo siempre se vea "viva".
   ========================================================================= */
(function () {
  'use strict';

  /* -----------------------------------------------------------------------
     CONFIGURACIÓN EDITABLE
     Precios de ejemplo de la suscripción del nutriólogo. Cambia aquí y se
     actualiza en la página pública y en la vista del nutriólogo.
     ----------------------------------------------------------------------- */
  var CONFIG = {
    moneda: 'MXN',
    planes: [
      { id: 'mensual',   nombre: 'Mensual',   meses: 1,  precio: 449 },
      { id: 'semestral', nombre: 'Semestral', meses: 6,  precio: 2290 },
      { id: 'anual',     nombre: 'Anual',     meses: 12, precio: 3990 }
    ],
    // Lo que incluye cualquier plan (la diferencia es el precio y la duración)
    incluye: [
      'Perfil público con insignia Verificado',
      'Agenda de citas en línea',
      'Expediente digital por paciente',
      'Seguimiento de peso e IMC cita por cita',
      'Reseñas de tus pacientes',
      'Visibilidad ante nuevos pacientes por objetivo'
    ],
    ubicacionDemo: { nombre: 'Tepic centro', ciudad: 'Tepic, Nayarit' },
    zonas: ['Tepic centro', 'Cd. del Valle', 'La Loma', 'Xalisco']
  };

  /* Objetivos del usuario = especialidades del nutriólogo */
  var OBJETIVOS = [
    { id: 'bajar-peso',   nombre: 'Bajar de peso',            corto: 'Bajar de peso' },
    { id: 'ganar-masa',   nombre: 'Ganar masa muscular',      corto: 'Masa muscular' },
    { id: 'deportiva',    nombre: 'Nutrición deportiva',      corto: 'Deportiva' },
    { id: 'enfermedades', nombre: 'Control de enfermedades',  corto: 'Diabetes e hipertensión', detalle: 'Diabetes, hipertensión y otras' },
    { id: 'general',      nombre: 'Alimentación general',     corto: 'Alimentación general' }
  ];

  var HORARIO_BASE = { dias: [1, 2, 3, 4, 5, 6], bloques: [[9, 14], [16, 19]] };

  var NUTRIOLOGOS = [
    {
      id: 1,
      nombre: 'Lic. Carolina Méndez Rojas',
      titulo: 'Licenciada en Nutrición',
      correo: 'nutriologo@gmail.com',
      especialidades: ['bajar-peso', 'enfermedades', 'general'],
      zona: 'Tepic centro',
      direccion: 'Calle Hidalgo 118, consultorio 4, Tepic',
      distanciaKm: 0.8,
      precio: 550,
      cedula: '12873456',
      verificacion: { estado: 'verificado', fecha: '2026-03-12' },
      experiencia: 9,
      modalidad: 'Presencial y en línea',
      telefono: '311 555 0101',
      tono: 152,
      bio: 'Acompaño a personas que quieren bajar de peso sin dietas extremas y a pacientes con diabetes o hipertensión que necesitan un plan que sí puedan sostener. Trabajo con planes flexibles, porciones con medidas caseras y metas cortas que revisamos en cada cita.',
      horario: { dias: [1, 2, 3, 4, 5, 6], bloques: [[9, 14], [16, 19]] }
    },
    {
      id: 2,
      nombre: 'Lic. Rodrigo Aguilar Peña',
      titulo: 'Licenciado en Nutrición Deportiva',
      especialidades: ['deportiva', 'ganar-masa'],
      zona: 'Cd. del Valle',
      direccion: 'Av. del Valle 52, local 2, Tepic',
      distanciaKm: 3.4,
      precio: 600,
      cedula: '10458213',
      verificacion: { estado: 'verificado', fecha: '2025-11-04' },
      experiencia: 7,
      modalidad: 'Presencial',
      telefono: '311 555 0102',
      tono: 200,
      bio: 'Trabajo con corredores, ciclistas y personas que entrenan fuerza. Ajusto tu alimentación a tus días de entrenamiento y competencia, con mediciones de composición corporal en cada consulta.',
      horario: { dias: [1, 2, 3, 4, 5], bloques: [[8, 13], [17, 20]] }
    },
    {
      id: 3,
      nombre: 'Mtra. Daniela Ochoa Ibarra',
      titulo: 'Maestra en Nutrición Clínica',
      especialidades: ['enfermedades', 'general'],
      zona: 'La Loma',
      direccion: 'Paseo de la Loma 310, Tepic',
      distanciaKm: 2.1,
      precio: 700,
      cedula: '09631187',
      verificacion: { estado: 'verificado', fecha: '2025-08-21' },
      experiencia: 12,
      modalidad: 'Presencial y en línea',
      telefono: '311 555 0103',
      tono: 28,
      bio: 'Me especializo en diabetes tipo 2, prediabetes y colesterol alto. Te explico tus estudios de laboratorio en lenguaje claro y diseñamos juntos un plan que cuide tu glucosa sin dejar de comer rico.',
      horario: { dias: [1, 2, 3, 4, 5], bloques: [[10, 14], [16, 18]] }
    },
    {
      id: 4,
      nombre: 'Lic. Fernando Salas Cortés',
      titulo: 'Licenciado en Nutrición',
      especialidades: ['bajar-peso', 'general'],
      zona: 'Xalisco',
      direccion: 'Calle Morelos 27, Xalisco',
      distanciaKm: 9.6,
      precio: 350,
      cedula: '11204579',
      verificacion: { estado: 'verificado', fecha: '2026-01-15' },
      experiencia: 4,
      modalidad: 'Presencial',
      telefono: '311 555 0104',
      tono: 95,
      bio: 'Consulta accesible para empezar a comer mejor. Planes sencillos con alimentos que encuentras en el mercado y en la tiendita, pensados para toda la familia.',
      horario: { dias: [1, 2, 3, 4, 5, 6], bloques: [[9, 15]] }
    },
    {
      id: 5,
      nombre: 'Lic. Mariana Robles Tapia',
      titulo: 'Licenciada en Nutrición',
      especialidades: ['ganar-masa', 'deportiva', 'bajar-peso'],
      zona: 'Tepic centro',
      direccion: 'Av. Allende 405, piso 2, Tepic',
      distanciaKm: 1.5,
      precio: 480,
      cedula: '11873042',
      verificacion: { estado: 'verificado', fecha: '2025-12-02' },
      experiencia: 6,
      modalidad: 'Presencial y en línea',
      telefono: '311 555 0105',
      tono: 330,
      bio: 'Recomposición corporal: bajar grasa y ganar músculo al mismo tiempo. Si vas al gimnasio y no ves cambios, revisamos tu proteína, tus horarios y tu descanso.',
      horario: { dias: [1, 2, 3, 4, 5, 6], bloques: [[8, 12], [15, 19]] }
    },
    {
      id: 6,
      nombre: 'Lic. Javier Lozano Medina',
      titulo: 'Licenciado en Nutrición',
      especialidades: ['general', 'bajar-peso'],
      zona: 'Cd. del Valle',
      direccion: 'Blvd. Tepic-Xalisco 1820, Tepic',
      distanciaKm: 4.2,
      precio: 300,
      cedula: '12340981',
      verificacion: { estado: 'verificado', fecha: '2026-05-30' },
      experiencia: 3,
      modalidad: 'En línea',
      telefono: '311 555 0106',
      tono: 250,
      bio: 'Consultas en línea para personas con poco tiempo. Te mando tu plan y una lista del súper por semana, y damos seguimiento por videollamada.',
      horario: { dias: [1, 2, 3, 4, 5], bloques: [[12, 15], [18, 21]] }
    },
    {
      id: 7,
      nombre: 'Lic. Paola Ríos Navarro',
      titulo: 'Licenciada en Nutrición',
      especialidades: ['enfermedades', 'bajar-peso'],
      zona: 'La Loma',
      direccion: 'Calle Lerdo 211, Tepic',
      distanciaKm: 2.7,
      precio: 520,
      cedula: '10992874',
      verificacion: { estado: 'verificado', fecha: '2025-10-09' },
      experiencia: 8,
      modalidad: 'Presencial',
      telefono: '311 555 0107',
      tono: 10,
      bio: 'Atiendo hipertensión, hígado graso y sobrepeso. Me gusta trabajar con metas pequeñas y medibles, y revisar contigo qué sí funcionó en la semana.',
      horario: { dias: [2, 3, 4, 5, 6], bloques: [[9, 13], [16, 19]] }
    },
    {
      id: 8,
      nombre: 'Lic. Esteban Garza Villa',
      titulo: 'Licenciado en Nutrición Deportiva',
      especialidades: ['deportiva', 'ganar-masa'],
      zona: 'Xalisco',
      direccion: 'Av. Juárez 64, Xalisco',
      distanciaKm: 10.3,
      precio: 400,
      cedula: '13105526',
      verificacion: { estado: 'revision' },
      experiencia: 2,
      modalidad: 'Presencial',
      telefono: '311 555 0108',
      tono: 170,
      bio: 'Nutrición para fútbol, básquetbol y deportes de equipo. Planes para antes y después del partido y estrategias de hidratación para el calor de Nayarit.',
      horario: { dias: [1, 2, 3, 4, 5, 6], bloques: [[7, 11], [17, 20]] }
    }
  ];

  /* Reseñas: el promedio de cada nutriólogo se calcula a partir de estas */
  var RESENAS = [
    // 1 · Carolina (4.8)
    { nutriologoId: 1, autor: 'Luis H.',    calificacion: 5, dias: -12, comentario: 'Me explicó mis resultados de glucosa con calma. Por fin entiendo qué comer y en qué cantidad.' },
    { nutriologoId: 1, autor: 'Renata F.',  calificacion: 5, dias: -26, comentario: 'Muy puntual y el plan es fácil de seguir. Ya bajé mi presión con los cambios.' },
    { nutriologoId: 1, autor: 'Jorge M.',   calificacion: 4, dias: -41, comentario: 'Buen seguimiento. A veces es difícil conseguir cita en la tarde.' },
    { nutriologoId: 1, autor: 'Valeria C.', calificacion: 5, dias: -63, comentario: 'Nada de dietas raras, comida normal con porciones claras.' },
    { nutriologoId: 1, autor: 'Marco P.',   calificacion: 5, dias: -90, comentario: 'Llevo cuatro meses y voy -7 kg. Se nota que le importa tu avance.' },
    // 2 · Rodrigo (4.5)
    { nutriologoId: 2, autor: 'Óscar V.',   calificacion: 5, dias: -8,  comentario: 'Mejoré mis tiempos en el medio maratón con su plan de carga.' },
    { nutriologoId: 2, autor: 'Karla S.',   calificacion: 4, dias: -30, comentario: 'Muy profesional. El consultorio es algo difícil de encontrar.' },
    { nutriologoId: 2, autor: 'Iván R.',    calificacion: 5, dias: -55, comentario: 'Gané 3 kg de músculo en cuatro meses midiendo todo.' },
    { nutriologoId: 2, autor: 'Diana T.',   calificacion: 4, dias: -80, comentario: 'Buenas recomendaciones, me hubiera gustado un plan más variado.' },
    // 3 · Daniela (5.0)
    { nutriologoId: 3, autor: 'Patricia L.', calificacion: 5, dias: -5,  comentario: 'Mi hemoglobina glucosilada bajó en tres meses. Excelente trato.' },
    { nutriologoId: 3, autor: 'Ernesto G.',  calificacion: 5, dias: -34, comentario: 'Explica todo con paciencia y te da opciones reales.' },
    { nutriologoId: 3, autor: 'Silvia N.',   calificacion: 5, dias: -70, comentario: 'La recomiendo a cualquier persona con prediabetes.' },
    // 4 · Fernando (3.8)
    { nutriologoId: 4, autor: 'Ana B.',     calificacion: 4, dias: -15, comentario: 'Precio accesible y plan sencillo.' },
    { nutriologoId: 4, autor: 'Raúl D.',    calificacion: 4, dias: -38, comentario: 'Cumple, aunque las consultas son algo cortas.' },
    { nutriologoId: 4, autor: 'Mónica E.',  calificacion: 3, dias: -52, comentario: 'Tuve que esperar 30 minutos para entrar a la cita.' },
    { nutriologoId: 4, autor: 'Hugo A.',    calificacion: 5, dias: -77, comentario: 'Mi familia completa come mejor gracias a sus recetas.' },
    { nutriologoId: 4, autor: 'Lorena Q.',  calificacion: 3, dias: -101, comentario: 'Bien, pero esperaba más seguimiento entre citas.' },
    // 5 · Mariana (4.8)
    { nutriologoId: 5, autor: 'Sofía R.',   calificacion: 5, dias: -19, comentario: 'Me ayudó a organizar mis comidas con el gimnasio. Súper clara.', citaId: 'c-seed-u2' },
    { nutriologoId: 5, autor: 'Daniel F.',  calificacion: 5, dias: -44, comentario: 'Bajé grasa sin perder fuerza.' },
    { nutriologoId: 5, autor: 'Carmen J.',  calificacion: 4, dias: -66, comentario: 'Muy buena, solo que la agenda se llena rápido.' },
    { nutriologoId: 5, autor: 'Tomás Y.',   calificacion: 5, dias: -88, comentario: 'Por fin entendí cuánta proteína necesito.' },
    // 6 · Javier (4.3)
    { nutriologoId: 6, autor: 'Gabriela M.', calificacion: 4, dias: -10, comentario: 'Práctico para mí que trabajo todo el día.' },
    { nutriologoId: 6, autor: 'Alberto K.',  calificacion: 4, dias: -29, comentario: 'La lista del súper me ahorra tiempo.' },
    { nutriologoId: 6, autor: 'Fernanda O.', calificacion: 5, dias: -47, comentario: 'Muy atento por videollamada.' },
    { nutriologoId: 6, autor: 'Ricardo U.',  calificacion: 4, dias: -73, comentario: 'Bien, aunque prefiero consultas presenciales.' },
    // 7 · Paola (4.6)
    { nutriologoId: 7, autor: 'Beatriz Z.', calificacion: 5, dias: -6,  comentario: 'Mejoraron mis estudios de hígado. Muy recomendable.' },
    { nutriologoId: 7, autor: 'Manuel C.',  calificacion: 4, dias: -27, comentario: 'Buen plan, me costó adaptarme al principio.' },
    { nutriologoId: 7, autor: 'Elena P.',   calificacion: 5, dias: -49, comentario: 'Me escucha y ajusta el plan a mi trabajo de turnos.' },
    { nutriologoId: 7, autor: 'Rafael S.',  calificacion: 5, dias: -71, comentario: 'Bajé 5 kg y mi presión está controlada.' },
    { nutriologoId: 7, autor: 'Irene V.',   calificacion: 4, dias: -95, comentario: 'Muy profesional y amable.' },
    // 8 · Esteban (4.5)
    { nutriologoId: 8, autor: 'Kevin L.',   calificacion: 4, dias: -21, comentario: 'Buenas ideas para el día de partido.' },
    { nutriologoId: 8, autor: 'Andrés T.',  calificacion: 5, dias: -58, comentario: 'Me ayudó con los calambres en los entrenamientos.' }
  ];

  /* Usuario demo (usuario@gmail.com). También es paciente p1 de Carolina. */
  var USUARIO_DEMO = {
    nombre: 'Sofía Ramírez Lara',
    correo: 'usuario@gmail.com',
    edad: 27,
    peso: 75.8,
    estatura: 165,
    pacienteId: 'p1'
  };

  /* Pacientes de la nutrióloga demo (id 1). `consultas` usa días relativos a hoy. */
  var PACIENTES = [
    {
      id: 'p1', nombre: 'Sofía Ramírez Lara', edad: 27, sexo: 'F', estatura: 165,
      telefono: '311 555 0201', correo: 'usuario@gmail.com', objetivo: 'bajar-peso',
      desde: -75, esUsuarioDemo: true,
      consultas: [
        { dias: -60, peso: 78.4, notas: 'Primera consulta. Cena tarde y come fuera entre semana.', indicaciones: 'Desayuno con proteína, cenar antes de las 9 pm, 2 L de agua al día.' },
        { dias: -33, peso: 76.9, notas: 'Buena adherencia. Antojos por la tarde.', indicaciones: 'Colación de fruta con nueces a las 5 pm. Caminar 30 min, 4 días.' },
        { dias: -6,  peso: 75.8, notas: 'Avance constante, -2.6 kg desde el inicio.', indicaciones: 'Mantener plan. Agregar verdura en la comida principal.' }
      ]
    },
    {
      id: 'p2', nombre: 'Luis Hernández Ponce', edad: 41, sexo: 'M', estatura: 178,
      telefono: '311 555 0202', correo: 'luis.hp@ejemplo.mx', objetivo: 'enfermedades',
      nota: 'Diabetes tipo 2', desde: -120,
      consultas: [
        { dias: -112, peso: 98.2, notas: 'Glucosa en ayuno 168 mg/dL. Mucho refresco.', indicaciones: 'Eliminar bebidas azucaradas. Método del plato.' },
        { dias: -84,  peso: 96.5, notas: 'Dejó el refresco. Glucosa 142 mg/dL.', indicaciones: 'Distribuir carbohidratos en 3 comidas.' },
        { dias: -56,  peso: 95.1, notas: 'Camina por las mañanas.', indicaciones: 'Aumentar fibra: avena y leguminosas.' },
        { dias: -28,  peso: 94.0, notas: 'Glucosa 121 mg/dL. Motivado.', indicaciones: 'Mantener. Revisar laboratorio en 2 meses.' }
      ]
    },
    {
      id: 'p3', nombre: 'Valeria Cruz Montes', edad: 23, sexo: 'F', estatura: 160,
      telefono: '311 555 0203', correo: 'vale.cruz@ejemplo.mx', objetivo: 'general',
      desde: -70,
      consultas: [
        { dias: -63, peso: 52.0, notas: 'Se salta el desayuno por la escuela.', indicaciones: 'Desayunos rápidos: licuado de avena o sándwich integral.' },
        { dias: -35, peso: 52.6, notas: 'Más energía en la mañana.', indicaciones: 'Incluir leguminosas 3 veces por semana.' },
        { dias: -7,  peso: 53.1, notas: 'Peso estable y saludable.', indicaciones: 'Seguimiento mensual.' }
      ]
    },
    {
      id: 'p4', nombre: 'Jorge Medina Arce', edad: 35, sexo: 'M', estatura: 172,
      telefono: '311 555 0204', correo: 'jorge.medina@ejemplo.mx', objetivo: 'bajar-peso',
      desde: -150,
      consultas: [
        { dias: -140, peso: 91.0, notas: 'Trabajo de oficina, sedentario.', indicaciones: 'Plan de 1,800 kcal. Pausas activas.' },
        { dias: -112, peso: 89.2, notas: 'Buen inicio.', indicaciones: 'Agregar caminata diaria de 20 min.' },
        { dias: -84,  peso: 87.5, notas: 'Fines de semana difíciles.', indicaciones: 'Planear comidas del sábado.' },
        { dias: -49,  peso: 86.3, notas: 'Se inscribió al gimnasio.', indicaciones: 'Proteína en cada comida.' },
        { dias: -21,  peso: 85.0, notas: '-6 kg desde el inicio.', indicaciones: 'Mantener y medir cintura.' }
      ]
    },
    {
      id: 'p5', nombre: 'Renata Flores Guzmán', edad: 52, sexo: 'F', estatura: 158,
      telefono: '311 555 0205', correo: 'renata.fg@ejemplo.mx', objetivo: 'enfermedades',
      nota: 'Hipertensión', desde: -90,
      consultas: [
        { dias: -84, peso: 70.5, notas: 'Presión 145/92. Consume mucha sal.', indicaciones: 'Reducir embutidos y sal de mesa. Plan DASH.' },
        { dias: -42, peso: 69.8, notas: 'Presión 134/86.', indicaciones: 'Más verdura y fruta. Sazonar con hierbas.' },
        { dias: -2,  peso: 69.0, notas: 'Presión 128/82. Muy constante.', indicaciones: 'Mantener plan y caminar diario.' }
      ]
    }
  ];

  /* Citas de ejemplo (días relativos a hoy). */
  var CITAS = [
    // Usuario demo
    { id: 'c-seed-u1', nutriologoId: 1, pacienteId: 'p1', dias: -6, hora: '10:00', motivo: 'Seguimiento de plan para bajar de peso', estado: 'completada' },
    { id: 'c-seed-u2', nutriologoId: 5, pacienteId: 'p1', dias: -19, hora: '17:00', motivo: 'Organizar comidas con el gimnasio', estado: 'completada', calificada: true },
    { id: 'c-seed-u3', nutriologoId: 1, pacienteId: 'p1', dias: 5, hora: '11:00', motivo: 'Revisión mensual de avance', estado: 'confirmada' },
    // Agenda de Carolina con otros pacientes
    { id: 'c-seed-1', nutriologoId: 1, pacienteId: 'p2', dias: 0, hora: '10:00', motivo: 'Control de glucosa', estado: 'confirmada' },
    { id: 'c-seed-2', nutriologoId: 1, pacienteId: 'p4', dias: 0, hora: '12:00', motivo: 'Seguimiento de peso', estado: 'pendiente' },
    { id: 'c-seed-3', nutriologoId: 1, pacienteId: 'p5', dias: 0, hora: '17:00', motivo: 'Revisión de presión arterial', estado: 'confirmada' },
    { id: 'c-seed-4', nutriologoId: 1, pacienteId: 'p3', dias: 1, hora: '09:00', motivo: 'Plan de alimentación para exámenes', estado: 'pendiente' },
    { id: 'c-seed-5', nutriologoId: 1, pacienteId: 'p4', dias: 2, hora: '16:00', motivo: 'Medición de cintura y peso', estado: 'confirmada' },
    { id: 'c-seed-6', nutriologoId: 1, pacienteId: 'p3', dias: 3, hora: '10:00', motivo: 'Seguimiento mensual', estado: 'confirmada' },
    { id: 'c-seed-7', nutriologoId: 1, pacienteId: 'p5', dias: -2, hora: '11:00', motivo: 'Revisión de presión arterial', estado: 'completada' },
    { id: 'c-seed-8', nutriologoId: 1, pacienteId: 'p2', dias: -1, hora: '18:00', motivo: 'Revisión de laboratorio', estado: 'cancelada' }
  ];

  /* Suscripción de la nutrióloga demo */
  var SUSCRIPCION = { plan: 'semestral', iniciaDias: -40 };

  /* Espacio publicitario de ejemplo (marca ficticia) */
  var ANUNCIO = {
    marca: 'Huerta del Nayar',
    texto: 'Canasta semanal de verduras y fruta de temporada, cultivada en la región.',
    cta: 'Conocer la canasta'
  };

  window.NM_DATA = {
    CONFIG: CONFIG,
    OBJETIVOS: OBJETIVOS,
    HORARIO_BASE: HORARIO_BASE,
    NUTRIOLOGOS: NUTRIOLOGOS,
    RESENAS: RESENAS,
    USUARIO_DEMO: USUARIO_DEMO,
    PACIENTES: PACIENTES,
    CITAS: CITAS,
    SUSCRIPCION: SUSCRIPCION,
    ANUNCIO: ANUNCIO
  };
})();
