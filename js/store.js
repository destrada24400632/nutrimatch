/* =========================================================================
   NutriMatch — store.js
   Ayudas de fechas y de localStorage. Todo el "backend" de la demo vive aquí.
   ========================================================================= */
(function () {
  'use strict';

  var D = window.NM_DATA;
  var CLAVE_ESTADO = 'nutrimatch.estado.v1';
  var CLAVE_SESION = 'nutrimatch.sesion.v1';
  var CLAVE_PENDIENTE = 'nutrimatch.pendiente.v1';

  /* ---------------------------------------------------------------- Fechas */
  function pad(n) { return (n < 10 ? '0' : '') + n; }

  function aISO(fecha) {
    return fecha.getFullYear() + '-' + pad(fecha.getMonth() + 1) + '-' + pad(fecha.getDate());
  }
  function deISO(iso) {
    var p = iso.split('-');
    return new Date(+p[0], +p[1] - 1, +p[2]);
  }
  function hoyISO() { return aISO(new Date()); }
  function sumarDias(iso, n) {
    var f = deISO(iso);
    f.setDate(f.getDate() + n);
    return aISO(f);
  }
  function sumarMeses(iso, n) {
    var f = deISO(iso);
    f.setMonth(f.getMonth() + n);
    return aISO(f);
  }
  function diferenciaDias(isoA, isoB) {
    return Math.round((deISO(isoB) - deISO(isoA)) / 86400000);
  }
  function formatear(iso, opciones) {
    return deISO(iso).toLocaleDateString('es-MX', opciones || { day: 'numeric', month: 'long', year: 'numeric' });
  }
  function formatoCorto(iso) {
    return formatear(iso, { weekday: 'short', day: 'numeric', month: 'short' });
  }
  function formatoLargo(iso) {
    var t = formatear(iso, { weekday: 'long', day: 'numeric', month: 'long' });
    return t.charAt(0).toUpperCase() + t.slice(1);
  }
  function relativo(iso) {
    var d = diferenciaDias(hoyISO(), iso);
    if (d === 0) return 'Hoy';
    if (d === 1) return 'Mañana';
    if (d === -1) return 'Ayer';
    if (d > 1 && d < 7) return 'En ' + d + ' días';
    if (d < -1 && d > -31) return 'Hace ' + (-d) + ' días';
    return formatear(iso, { day: 'numeric', month: 'short', year: 'numeric' });
  }
  /* ¿La fecha + hora ya pasó? */
  function yaPaso(iso, hora) {
    var f = deISO(iso);
    var h = (hora || '00:00').split(':');
    f.setHours(+h[0], +h[1], 0, 0);
    return f.getTime() < Date.now();
  }
  function lunesDe(iso) {
    var f = deISO(iso);
    var dia = (f.getDay() + 6) % 7; // 0 = lunes
    f.setDate(f.getDate() - dia);
    return aISO(f);
  }

  var fechas = {
    aISO: aISO, deISO: deISO, hoyISO: hoyISO, sumarDias: sumarDias, sumarMeses: sumarMeses,
    diferenciaDias: diferenciaDias, formatear: formatear, formatoCorto: formatoCorto,
    formatoLargo: formatoLargo, relativo: relativo, yaPaso: yaPaso, lunesDe: lunesDe
  };

  /* ------------------------------------------------------ Estado inicial */
  function copiar(o) { return JSON.parse(JSON.stringify(o)); }

  function crearEstadoInicial() {
    var hoy = hoyISO();

    var resenas = D.RESENAS.map(function (r, i) {
      return {
        id: 'r-seed-' + (i + 1),
        nutriologoId: r.nutriologoId,
        autor: r.autor,
        calificacion: r.calificacion,
        comentario: r.comentario,
        fecha: sumarDias(hoy, r.dias),
        citaId: r.citaId || null
      };
    });

    var pacientes = D.PACIENTES.map(function (p) {
      var c = copiar(p);
      c.desde = sumarDias(hoy, p.desde);
      c.consultas = p.consultas.map(function (k, i) {
        return { id: p.id + '-k' + (i + 1), fecha: sumarDias(hoy, k.dias), peso: k.peso, notas: k.notas, indicaciones: k.indicaciones };
      });
      c.nutriologoId = 1;
      return c;
    });

    // Las citas de ejemplo (excepto las de hoy) no caen en domingo: se recorren un día
    function sinDomingo(dias) {
      var f = sumarDias(hoy, dias);
      if (dias !== 0 && deISO(f).getDay() === 0) f = sumarDias(f, dias > 0 ? 1 : -1);
      return f;
    }
    var citas = D.CITAS.map(function (c) {
      return {
        id: c.id, nutriologoId: c.nutriologoId, pacienteId: c.pacienteId,
        fecha: sinDomingo(c.dias), hora: c.hora, motivo: c.motivo,
        estado: c.estado, calificada: !!c.calificada, origen: 'ejemplo',
        creada: sumarDias(hoy, Math.min(c.dias, 0) - 3)
      };
    });

    var u = copiar(D.USUARIO_DEMO);
    var imc = +(u.peso / Math.pow(u.estatura / 100, 2)).toFixed(1);
    u.ultimoImc = { valor: imc, fecha: sumarDias(hoy, -6) };

    var inicio = sumarDias(hoy, D.SUSCRIPCION.iniciaDias);
    var plan = D.CONFIG.planes.filter(function (p) { return p.id === D.SUSCRIPCION.plan; })[0];

    return {
      version: 1,
      creado: hoy,
      nutriologos: copiar(D.NUTRIOLOGOS),
      resenas: resenas,
      pacientes: pacientes,
      citas: citas,
      usuario: u,
      suscripcion: { plan: plan.id, inicio: inicio, vence: sumarMeses(inicio, plan.meses) }
    };
  }

  /* ---------------------------------------------------- Lectura/escritura */
  var cache = null;

  function leerJSON(clave) {
    try {
      var t = localStorage.getItem(clave);
      return t ? JSON.parse(t) : null;
    } catch (e) { return null; }
  }
  function escribirJSON(clave, valor) {
    try { localStorage.setItem(clave, JSON.stringify(valor)); return true; }
    catch (e) { return false; }
  }

  function estado() {
    if (cache) return cache;
    var guardado = leerJSON(CLAVE_ESTADO);
    if (guardado && guardado.version === 1) {
      cache = guardado;
    } else {
      cache = crearEstadoInicial();
      escribirJSON(CLAVE_ESTADO, cache);
    }
    return cache;
  }
  function guardar() { escribirJSON(CLAVE_ESTADO, estado()); emitir(); }

  /* Reinicia los datos de la demo (la sesión se mantiene) */
  function reiniciar() {
    try { localStorage.removeItem(CLAVE_ESTADO); localStorage.removeItem(CLAVE_PENDIENTE); } catch (e) {}
    cache = null;
    estado();
    emitir();
  }

  /* Pequeño sistema de suscripción para refrescar vistas */
  var oyentes = [];
  function alCambiar(fn) { oyentes.push(fn); }
  function emitir() { oyentes.forEach(function (fn) { try { fn(); } catch (e) { console.error(e); } }); }

  // Si otra pestaña cambia los datos, sincronizamos
  window.addEventListener('storage', function (e) {
    if (e.key === CLAVE_ESTADO) { cache = null; emitir(); }
  });

  function nuevoId(prefijo) {
    return prefijo + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  /* ------------------------------------------------------- Nutriólogos */
  function nutriologos() { return estado().nutriologos; }
  function nutriologo(id) {
    id = +id;
    return nutriologos().filter(function (n) { return n.id === id; })[0] || null;
  }
  function actualizarNutriologo(id, cambios) {
    var n = nutriologo(id);
    if (!n) return null;
    Object.keys(cambios).forEach(function (k) { n[k] = cambios[k]; });
    guardar();
    return n;
  }

  function resenasDe(id) {
    id = +id;
    return estado().resenas
      .filter(function (r) { return r.nutriologoId === id; })
      .sort(function (a, b) { return a.fecha < b.fecha ? 1 : -1; });
  }
  function calificacion(id) {
    var rs = resenasDe(id);
    if (!rs.length) return { promedio: 0, total: 0 };
    var suma = rs.reduce(function (s, r) { return s + r.calificacion; }, 0);
    return { promedio: Math.round((suma / rs.length) * 10) / 10, total: rs.length };
  }

  /* --------------------------------------------------------- Pacientes */
  function pacientes() { return estado().pacientes; }
  function paciente(id) {
    return pacientes().filter(function (p) { return p.id === id; })[0] || null;
  }
  function pesoActual(p) {
    if (!p.consultas.length) return p.pesoInicial || null;
    return p.consultas[p.consultas.length - 1].peso;
  }
  function agregarConsulta(pacienteId, consulta) {
    var p = paciente(pacienteId);
    if (!p) return null;
    consulta.id = nuevoId('k');
    p.consultas.push(consulta);
    p.consultas.sort(function (a, b) { return a.fecha < b.fecha ? -1 : 1; });
    if (consulta.estatura) { p.estatura = consulta.estatura; delete consulta.estatura; }
    // Si es el usuario demo, su perfil también refleja el nuevo peso
    if (p.esUsuarioDemo) {
      var u = estado().usuario;
      u.peso = pesoActual(p);
      u.estatura = p.estatura;
    }
    guardar();
    return consulta;
  }

  /* ------------------------------------------------------------- Citas */
  function citas() { return estado().citas; }
  function cita(id) { return citas().filter(function (c) { return c.id === id; })[0] || null; }
  function ordenarCitas(lista, desc) {
    return lista.slice().sort(function (a, b) {
      var ka = a.fecha + a.hora, kb = b.fecha + b.hora;
      return (ka < kb ? -1 : ka > kb ? 1 : 0) * (desc ? -1 : 1);
    });
  }
  function citasDeUsuario() {
    var pid = estado().usuario.pacienteId;
    return citas().filter(function (c) { return c.pacienteId === pid; });
  }
  function citasDeNutriologo(id) {
    id = +id;
    return citas().filter(function (c) { return c.nutriologoId === id; });
  }
  function agregarCita(datos) {
    var c = {
      id: nuevoId('c'),
      nutriologoId: +datos.nutriologoId,
      pacienteId: datos.pacienteId,
      fecha: datos.fecha,
      hora: datos.hora,
      motivo: datos.motivo,
      estado: datos.estado || 'pendiente',
      calificada: false,
      origen: datos.origen || 'usuario',
      creada: hoyISO()
    };
    citas().push(c);
    guardar();
    return c;
  }
  function actualizarCita(id, cambios) {
    var c = cita(id);
    if (!c) return null;
    Object.keys(cambios).forEach(function (k) { c[k] = cambios[k]; });
    guardar();
    return c;
  }
  /* ¿Ese horario está tomado por una cita activa? */
  function horarioOcupado(nutriologoId, fecha, hora) {
    return citas().some(function (c) {
      return c.nutriologoId === +nutriologoId && c.fecha === fecha && c.hora === hora && c.estado !== 'cancelada';
    });
  }

  function calificarCita(citaId, calif, comentario) {
    var c = cita(citaId);
    if (!c || c.calificada || c.estado !== 'completada') return null;
    var u = estado().usuario;
    var partes = u.nombre.split(' ');
    var r = {
      id: nuevoId('r'),
      nutriologoId: c.nutriologoId,
      autor: partes[0] + ' ' + (partes[1] ? partes[1].charAt(0) + '.' : ''),
      calificacion: calif,
      comentario: comentario,
      fecha: hoyISO(),
      citaId: c.id,
      nueva: true
    };
    estado().resenas.push(r);
    c.calificada = true;
    guardar();
    return r;
  }

  /* --------------------------------------------------- Disponibilidad
     Próximos N días en bloques de 1 hora. Para la cuenta demo (id 1) solo se
     ocupan los horarios con cita real; para el resto se simula ocupación
     de forma determinista a partir de la fecha. */
  function hash(texto) {
    var h = 2166136261;
    for (var i = 0; i < texto.length; i++) { h ^= texto.charCodeAt(i); h = Math.imul(h, 16777619); }
    return Math.abs(h);
  }
  function disponibilidad(nutriologoId, dias) {
    var n = nutriologo(nutriologoId);
    var hoy = hoyISO();
    var salida = [];
    for (var d = 0; d < (dias || 7); d++) {
      var fecha = sumarDias(hoy, d);
      var diaSemana = deISO(fecha).getDay();
      var horas = [];
      if (n.horario.dias.indexOf(diaSemana) !== -1) {
        n.horario.bloques.forEach(function (b) {
          for (var h = b[0]; h < b[1]; h++) {
            var hora = pad(h) + ':00';
            if (d === 0 && yaPaso(fecha, hora)) continue;
            var ocupada = horarioOcupado(n.id, fecha, hora) ||
              (n.id !== 1 && hash(n.id + '|' + fecha + '|' + hora) % 100 < 32);
            horas.push({ hora: hora, ocupada: ocupada });
          }
        });
      }
      salida.push({ fecha: fecha, horas: horas });
    }
    return salida;
  }

  /* ----------------------------------------------------------- Usuario */
  function usuario() { return estado().usuario; }
  function actualizarUsuario(cambios) {
    var u = usuario();
    Object.keys(cambios).forEach(function (k) { u[k] = cambios[k]; });
    // El paciente vinculado (p1) comparte nombre, edad y estatura
    var p = paciente(u.pacienteId);
    if (p) { p.nombre = u.nombre; p.edad = u.edad; p.estatura = u.estatura; }
    guardar();
    return u;
  }

  /* ------------------------------------------------------- Suscripción */
  function suscripcion() { return estado().suscripcion; }
  function cambiarPlan(planId) {
    var plan = D.CONFIG.planes.filter(function (p) { return p.id === planId; })[0];
    if (!plan) return null;
    var hoy = hoyISO();
    estado().suscripcion = { plan: plan.id, inicio: hoy, vence: sumarMeses(hoy, plan.meses) };
    guardar();
    return estado().suscripcion;
  }

  /* ------------------------------------------------------------ Sesión */
  function sesion() { return leerJSON(CLAVE_SESION); }
  function guardarSesion(s) { escribirJSON(CLAVE_SESION, s); }
  function borrarSesion() { try { localStorage.removeItem(CLAVE_SESION); } catch (e) {} }

  /* Destino pendiente (p. ej. "ver nutriólogos para este objetivo" sin sesión) */
  function guardarPendiente(destino) { escribirJSON(CLAVE_PENDIENTE, destino); }
  function tomarPendiente() {
    var p = leerJSON(CLAVE_PENDIENTE);
    try { localStorage.removeItem(CLAVE_PENDIENTE); } catch (e) {}
    return p;
  }

  /* ---------------------------------------------------------- Catálogos */
  function objetivo(id) {
    return D.OBJETIVOS.filter(function (o) { return o.id === id; })[0] || null;
  }
  function plan(id) {
    return D.CONFIG.planes.filter(function (p) { return p.id === id; })[0] || null;
  }

  window.NM = window.NM || {};
  window.NM.fechas = fechas;
  window.NM.store = {
    estado: estado, guardar: guardar, reiniciar: reiniciar, alCambiar: alCambiar, nuevoId: nuevoId,
    nutriologos: nutriologos, nutriologo: nutriologo, actualizarNutriologo: actualizarNutriologo,
    resenasDe: resenasDe, calificacion: calificacion,
    pacientes: pacientes, paciente: paciente, pesoActual: pesoActual, agregarConsulta: agregarConsulta,
    citas: citas, cita: cita, ordenarCitas: ordenarCitas, citasDeUsuario: citasDeUsuario,
    citasDeNutriologo: citasDeNutriologo, agregarCita: agregarCita, actualizarCita: actualizarCita,
    horarioOcupado: horarioOcupado, calificarCita: calificarCita, disponibilidad: disponibilidad,
    usuario: usuario, actualizarUsuario: actualizarUsuario,
    suscripcion: suscripcion, cambiarPlan: cambiarPlan,
    sesion: sesion, guardarSesion: guardarSesion, borrarSesion: borrarSesion,
    guardarPendiente: guardarPendiente, tomarPendiente: tomarPendiente,
    objetivo: objetivo, plan: plan
  };
})();
