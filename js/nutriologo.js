/* =========================================================================
   NutriMatch — nutriologo.js
   Vista de la nutrióloga demo (id 1): resumen, agenda, pacientes y
   expedientes, perfil público, reseñas y suscripción.
   ========================================================================= */
(function () {
  'use strict';
  if (NM.auth.rolActual() !== 'nutriologo') return;

  var ui = NM.ui, store = NM.store, F = NM.fechas, D = NM_DATA;
  var $ = ui.$, $$ = ui.$$, esc = ui.esc, ic = ui.icono;
  var ID = 1;
  var vista = $('#vista');

  var agendaEstado = { lunes: F.lunesDe(F.hoyISO()), dia: F.hoyISO() };
  var DIAS_CORTOS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  function yo() { return store.nutriologo(ID); }
  function nombreCorto() { return yo().nombre.replace(/^(Lic\.|Mtra\.)\s+/, '').split(' ')[0]; }
  function paciente(id) { return store.paciente(id) || { id: id, nombre: 'Paciente', consultas: [], estatura: 0 }; }
  function vacio(icono, titulo, texto, accion) {
    return '<div class="vacio"><span class="vacio-ico">' + ic(icono) + '</span><h3>' + esc(titulo) + '</h3><p>' + esc(texto) + '</p>' + (accion || '') + '</div>';
  }
  function etiquetaEstado(e) {
    var t = { pendiente: 'Pendiente', confirmada: 'Confirmada', completada: 'Completada', cancelada: 'Cancelada' }[e] || e;
    return '<span class="estado estado-' + e + '">' + t + '</span>';
  }
  function misCitas() { return store.citasDeNutriologo(ID); }
  function activa(c) { return c.estado === 'pendiente' || c.estado === 'confirmada'; }
  function proximas() {
    return store.ordenarCitas(misCitas().filter(function (c) { return activa(c) && !F.yaPaso(c.fecha, c.hora); }));
  }
  function pendientes() { return misCitas().filter(function (c) { return c.estado === 'pendiente' && !F.yaPaso(c.fecha, c.hora); }); }

  /* ------------------------------------------------- Lateral y sesión */
  var lateral = $('#n-lateral'), velo = $('#n-velo'), btnMenu = $('#btn-menu');
  var escritorio = window.matchMedia('(min-width: 1000px)');
  function abrirMenu(abrir) {
    lateral.classList.toggle('abierto', abrir);
    velo.classList.toggle('visible', abrir);
    btnMenu.setAttribute('aria-expanded', abrir);
    actualizarInert();
    if (abrir) { var a = lateral.querySelector('[aria-current="page"]') || lateral.querySelector('a'); a.focus(); }
  }
  /* En móvil, el menú cerrado no debe recibir foco */
  function actualizarInert() {
    if (!escritorio.matches && !lateral.classList.contains('abierto')) lateral.setAttribute('inert', '');
    else lateral.removeAttribute('inert');
  }
  actualizarInert();
  if (escritorio.addEventListener) escritorio.addEventListener('change', function () { abrirMenu(false); });
  btnMenu.addEventListener('click', function () { abrirMenu(!lateral.classList.contains('abierto')); });
  velo.addEventListener('click', function () { abrirMenu(false); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && lateral.classList.contains('abierto')) { abrirMenu(false); btnMenu.focus(); }
  });
  $$('.n-nav a').forEach(function (a) { a.addEventListener('click', function () { abrirMenu(false); }); });

  $('#btn-salir').addEventListener('click', function () {
    ui.confirmar({ titulo: 'Cerrar sesión', mensaje: 'Saldrás del panel de nutriólogo. Tus cambios se quedan guardados en este navegador.', aceptar: 'Cerrar sesión' })
      .then(function (ok) { if (ok) NM.auth.salir(); });
  });

  function pintarCuenta() {
    var n = yo();
    var ver = n.verificacion.estado === 'verificado';
    $('#n-cuenta').innerHTML = ui.avatar(n.nombre, 'md', n.tono) +
      '<div><strong>' + esc(n.nombre) + '</strong><span>' + (ver ? 'Nutrióloga verificada' : 'Cédula en revisión') + '</span></div>';
    $('#n-barra-avatar').innerHTML = ui.avatar(n.nombre, 'sm', n.tono);
    var p = pendientes().length;
    var cuenta = $('#cuenta-pendientes');
    cuenta.hidden = !p;
    cuenta.textContent = p;
    cuenta.setAttribute('aria-label', p + ' pendientes');
  }

  function marcarNavegacion(ruta) {
    $$('#n-nav [data-vista]').forEach(function (a) {
      if (a.getAttribute('data-vista') === ruta.vista) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
    ui.moverIndicador($('#n-nav'), $('#n-nav-indicador'), true);
  }
  window.addEventListener('resize', function () { ui.moverIndicador($('#n-nav'), $('#n-nav-indicador'), true); });

  /* ----------------------------------------------- Elemento de cita */
  function itemCita(c, opciones) {
    opciones = opciones || {};
    var p = paciente(c.pacienteId);
    var acciones = [];
    if (c.estado === 'pendiente') {
      acciones.push('<button type="button" class="btn btn-primario btn-sm" data-accion="confirmar" data-id="' + c.id + '">' + ic('check') + 'Confirmar</button>');
    }
    if (c.estado === 'confirmada' || (c.estado === 'pendiente' && F.yaPaso(c.fecha, c.hora))) {
      acciones.push('<button type="button" class="btn btn-secundario btn-sm" data-accion="completar" data-id="' + c.id + '">' + ic('check') + 'Marcar completada</button>');
    }
    if (c.estado !== 'cancelada') {
      acciones.push('<a class="btn btn-fantasma btn-sm" href="#pacientes/' + c.pacienteId + '">' + ic('expediente') + 'Expediente</a>');
    }
    if (activa(c)) {
      acciones.push('<button type="button" class="btn btn-fantasma btn-sm" data-accion="cancelar" data-id="' + c.id + '" aria-label="Cancelar cita de ' + esc(p.nombre) + '">' + ic('cerrar') + 'Cancelar</button>');
    }
    var caja = opciones.conFecha
      ? '<div class="cita-fecha" aria-hidden="true"><span class="mes">' + F.deISO(c.fecha).toLocaleDateString('es-MX', { weekday: 'short' }) + '</span><span class="dia-n">' + F.deISO(c.fecha).getDate() + '</span><span class="mes">' + c.hora + '</span></div>'
      : '<div class="cita-fecha hora-sola" aria-hidden="true"><span class="dia-n">' + c.hora + '</span><span class="mes">1 hora</span></div>';
    return '<li class="cita' + (c.estado === 'cancelada' ? ' es-cancelada' : '') + '" data-cita="' + c.id + '">' + caja +
      '<div class="cita-info">' +
        '<h3>' + esc(p.nombre) + ' ' + etiquetaEstado(c.estado) + (c.origen === 'usuario' ? '<span class="chip chip-bajar-peso">' + ic('hoja') + 'Agendó en NutriMatch</span>' : '') + '</h3>' +
        '<div class="cita-meta">' + (opciones.conFecha ? '<span>' + ic('calendario') + esc(F.relativo(c.fecha)) + ', ' + c.hora + '</span>' : '<span>' + ic('reloj') + c.hora + ' a ' + (parseInt(c.hora, 10) + 1) + ':00</span>') +
          (p.objetivo ? '<span>' + ic(p.objetivo) + esc(store.objetivo(p.objetivo).nombre) + '</span>' : '') + '</div>' +
        '<p class="cita-motivo">' + esc(c.motivo) + '</p>' +
      '</div>' +
      '<div class="cita-acciones">' + acciones.join('') + '</div></li>';
  }

  function enlazarAccionesCita(raiz, alTerminar) {
    raiz.addEventListener('click', function (e) {
      var b = e.target.closest('[data-accion]');
      if (!b) return;
      var c = store.cita(b.getAttribute('data-id'));
      var p = paciente(c.pacienteId);
      var accion = b.getAttribute('data-accion');
      if (accion === 'confirmar') {
        store.actualizarCita(c.id, { estado: 'confirmada' });
        ui.toast('Cita confirmada con ' + p.nombre.split(' ')[0] + '.');
        alTerminar();
      } else if (accion === 'completar') {
        store.actualizarCita(c.id, { estado: 'completada' });
        ui.toast('Cita marcada como completada. ' + p.nombre.split(' ')[0] + ' ya puede calificarte.');
        alTerminar();
      } else if (accion === 'cancelar') {
        ui.confirmar({
          titulo: 'Cancelar cita',
          mensaje: '¿Cancelar la cita de ' + p.nombre + ' del ' + F.formatoLargo(c.fecha).toLowerCase() + ' a las ' + c.hora + '? El horario quedará libre.',
          aceptar: 'Cancelar cita', cancelar: 'Conservar', peligro: true
        }).then(function (ok) {
          if (!ok) return;
          store.actualizarCita(c.id, { estado: 'cancelada' });
          ui.toast('Cita cancelada. El horario volvió a quedar disponible.');
          alTerminar();
        });
      }
    });
  }

  /* =====================================================================
     1. RESUMEN
     ===================================================================== */
  function saludo() {
    var h = new Date().getHours();
    return h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches';
  }

  function vistaResumen(c) {
    var n = yo();
    var hoy = F.hoyISO();
    var deHoy = misCitas().filter(function (x) { return x.fecha === hoy && x.estado !== 'cancelada'; });
    var pend = pendientes();
    var cal = store.calificacion(ID);
    var prox = proximas().slice(0, 5);
    var sus = store.suscripcion();
    var plan = store.plan(sus.plan);
    var total = F.diferenciaDias(sus.inicio, sus.vence);
    var usados = Math.max(0, Math.min(total, F.diferenciaDias(sus.inicio, hoy)));
    var restantes = F.diferenciaDias(hoy, sus.vence);
    var nuevas = pend.filter(function (x) { return x.origen === 'usuario'; });
    var ver = n.verificacion.estado === 'verificado';

    c.innerHTML =
      '<div class="vista-cabeza"><div><h1>' + saludo() + ', ' + esc(nombreCorto()) + '</h1><p>' + esc(F.formatoLargo(hoy)) + '. Este es el estado de tu consultorio.</p></div>' +
        '<a class="btn btn-primario" href="#agenda">' + ic('calendario') + 'Ver agenda</a></div>' +
      (nuevas.length ? '<div class="nota-demo" style="margin-bottom:20px;background:var(--azul-50);border-color:#CFE4EA;color:var(--azul-900)">' + ic('mensaje') +
        '<span><strong>' + nuevas.length + (nuevas.length === 1 ? ' solicitud nueva' : ' solicitudes nuevas') + '</strong> de pacientes que agendaron en NutriMatch. Confírmalas desde tus próximas citas o la agenda.</span></div>' : '') +
      '<div class="indicadores" data-escalonar>' +
        indicador('calendario', deHoy.length, 0, 'Citas de hoy') +
        indicador('reloj', pend.length, 0, 'Citas pendientes') +
        indicador('usuarios', store.pacientes().length, 0, 'Pacientes activos') +
        indicador('estrella', cal.promedio, 1, 'Calificación promedio') +
      '</div>' +
      '<div class="resumen-rejilla">' +
        '<section class="panel" aria-labelledby="t-prox">' +
          '<div class="panel-cabeza"><h2 id="t-prox">Próximas citas</h2><a class="btn btn-fantasma btn-sm" href="#agenda">Ver agenda completa</a></div>' +
          (prox.length ? '<ul class="lista-citas" id="lista-prox" data-escalonar>' + prox.map(function (x) { return itemCita(x, { conFecha: true }); }).join('') + '</ul>'
            : vacio('calendario', 'Sin citas próximas', 'Cuando un paciente agende contigo, la cita aparecerá aquí como pendiente.', '<button type="button" class="btn btn-primario" id="vacio-nueva">' + ic('mas') + 'Nueva cita</button>')) +
        '</section>' +
        '<section class="panel" aria-labelledby="t-cuenta">' +
          '<div class="panel-cabeza"><h2 id="t-cuenta">Tu cuenta</h2></div>' +
          '<div class="estado-cuenta">' +
            '<div class="estado-item"><span class="ei-ico ' + (ver ? 'ei-verde' : 'ei-ambar') + '">' + ic(ver ? 'sello' : 'reloj') + '</span><div>' +
              '<strong>' + (ver ? 'Verificado' : 'En revisión') + '</strong><small>' + (ver ? 'Cédula ' + esc(ui.cedulaOculta(n.cedula)) + ' verificada el ' + esc(F.formatear(n.verificacion.fecha)) : 'Estamos revisando tu cédula. Mientras tanto no apareces con el filtro "Solo verificados".') + '</small></div></div>' +
            '<div class="estado-item"><span class="ei-ico ei-azul">' + ic('tarjeta') + '</span><div style="flex:1">' +
              '<strong>Plan ' + esc(plan.nombre) + ' activo</strong><small>Vence el ' + esc(F.formatear(sus.vence)) + ' (' + restantes + ' días)</small>' +
              '<div class="progreso" role="progressbar" aria-label="Tiempo usado de la suscripción" aria-valuemin="0" aria-valuemax="' + total + '" aria-valuenow="' + usados + '"><span style="width:' + (usados / total * 100) + '%"></span></div></div></div>' +
            '<div class="estado-item"><span class="ei-ico ei-verde">' + ic('ojo') + '</span><div style="flex:1"><strong>Perfil público</strong><small>' + esc(n.zona) + ', ' + ui.dinero(n.precio) + ' por consulta</small></div><a class="btn btn-secundario btn-sm" href="#perfil">Editar</a></div>' +
          '</div>' +
        '</section>' +
      '</div>';

    var lista = $('#lista-prox');
    if (lista) enlazarAccionesCita(lista, function () { vistaResumen(c); pintarCuenta(); ui.animarContadores(c); });
    var vn = $('#vacio-nueva');
    if (vn) vn.addEventListener('click', function () { nuevaCita(); });
  }

  function indicador(icono, valor, decimales, etiqueta) {
    return '<div class="indicador"><span class="indicador-ico">' + ic(icono) + '</span>' +
      '<span class="indicador-valor" data-contar="' + valor + '" data-decimales="' + decimales + '">' + ui.decimal(valor, decimales) + '</span>' +
      '<span class="indicador-etiqueta">' + etiqueta + '</span></div>';
  }

  /* =====================================================================
     2. AGENDA
     ===================================================================== */
  function vistaAgenda(c) {
    var lunes = agendaEstado.lunes;
    var dias = [];
    for (var i = 0; i < 7; i++) dias.push(F.sumarDias(lunes, i));
    if (dias.indexOf(agendaEstado.dia) === -1) agendaEstado.dia = dias[0];
    var domingo = dias[6];
    var etiquetaSemana = F.formatear(lunes, { day: 'numeric', month: 'short' }) + ' al ' + F.formatear(domingo, { day: 'numeric', month: 'short', year: 'numeric' });
    var hoy = F.hoyISO();
    var todas = misCitas();

    c.innerHTML =
      '<div class="vista-cabeza"><div><h1>Agenda</h1><p>Confirma solicitudes, marca consultas completadas y abre el expediente de cada paciente.</p></div>' +
        '<button type="button" class="btn btn-primario" id="btn-nueva">' + ic('mas') + 'Nueva cita</button></div>' +
      '<div class="panel">' +
        '<div class="fila-entre">' +
          '<div class="semana-nav">' +
            '<button type="button" class="btn-icono" id="sem-ant" aria-label="Semana anterior">' + ic('izq') + '</button>' +
            '<h2 aria-live="polite">' + esc(etiquetaSemana) + '</h2>' +
            '<button type="button" class="btn-icono" id="sem-sig" aria-label="Semana siguiente">' + ic('der') + '</button>' +
          '</div>' +
          '<button type="button" class="btn btn-secundario btn-sm" id="sem-hoy">Hoy</button>' +
        '</div>' +
        '<div class="semana" role="group" aria-label="Días de la semana">' + dias.map(function (d) {
          var del = todas.filter(function (x) { return x.fecha === d; });
          var f = F.deISO(d);
          var puntos = del.slice(0, 5).map(function (x) { return '<i class="p-' + x.estado + '"></i>'; }).join('');
          var lbl = F.formatoLargo(d) + ', ' + (del.length ? del.length + (del.length === 1 ? ' cita' : ' citas') : 'sin citas');
          return '<button type="button" class="semana-dia' + (d === hoy ? ' es-hoy' : '') + '" data-dia="' + d + '" aria-pressed="' + (d === agendaEstado.dia) + '" aria-label="' + esc(lbl) + '">' +
            '<span class="ds">' + DIAS_CORTOS[f.getDay()] + '</span><span class="dn">' + f.getDate() + '</span><span class="puntos" aria-hidden="true">' + puntos + '</span></button>';
        }).join('') + '</div>' +
        '<div id="agenda-dia"></div>' +
      '</div>';

    $('#sem-ant').addEventListener('click', function () { moverSemana(-7); });
    $('#sem-sig').addEventListener('click', function () { moverSemana(7); });
    $('#sem-hoy').addEventListener('click', function () { agendaEstado = { lunes: F.lunesDe(hoy), dia: hoy }; vistaAgenda(c); });
    $('#btn-nueva').addEventListener('click', function () { nuevaCita(); });
    $$('.semana-dia', c).forEach(function (b) {
      b.addEventListener('click', function () {
        agendaEstado.dia = b.getAttribute('data-dia');
        $$('.semana-dia', c).forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
        pintarDia();
      });
    });
    pintarDia();

    function moverSemana(n) {
      agendaEstado.lunes = F.sumarDias(agendaEstado.lunes, n);
      agendaEstado.dia = F.sumarDias(agendaEstado.dia, n);
      vistaAgenda(c);
    }
  }

  function pintarDia() {
    var cont = $('#agenda-dia');
    if (!cont) return;
    var d = agendaEstado.dia;
    var lista = store.ordenarCitas(misCitas().filter(function (x) { return x.fecha === d; }));
    var resumen = lista.filter(function (x) { return x.estado !== 'cancelada'; }).length;
    cont.innerHTML = '<div class="agenda-dia-titulo"><h2>' + esc(F.formatoLargo(d)) + '</h2><span class="texto-suave">' +
      (resumen ? resumen + (resumen === 1 ? ' cita activa' : ' citas activas') : 'Día libre') + '</span></div>' +
      (lista.length
        ? '<ul class="lista-citas" data-escalonar>' + lista.map(function (x) { return itemCita(x); }).join('') + '</ul>'
        : vacio('calendario', 'Sin citas este día', 'Puedes registrar una cita manual para un paciente que te llamó o escribió.', '<button type="button" class="btn btn-primario" id="dia-nueva">' + ic('mas') + 'Nueva cita</button>'));
    ui.escalonar(cont);
    var ul = cont.querySelector('.lista-citas');
    if (ul) enlazarAccionesCita(ul, function () { vistaAgenda(vista); pintarCuenta(); });
    var dn = $('#dia-nueva');
    if (dn) dn.addEventListener('click', function () { nuevaCita({ fecha: d }); });
  }

  /* Modal: nueva cita manual */
  function nuevaCita(pre) {
    pre = pre || {};
    var hoy = F.hoyISO();
    var fecha = pre.fecha && pre.fecha >= hoy ? pre.fecha : hoy;
    var horas = [];
    for (var h = 7; h <= 20; h++) horas.push((h < 10 ? '0' : '') + h + ':00');
    var m = ui.modal({
      titulo: 'Nueva cita',
      contenido:
        '<form id="form-nueva" class="pila" novalidate style="gap:16px">' +
          '<div class="campo"><label for="nc-paciente">Paciente</label><select id="nc-paciente">' +
            '<option value="">Elige un paciente</option>' +
            store.pacientes().map(function (p) { return '<option value="' + p.id + '"' + (pre.pacienteId === p.id ? ' selected' : '') + '>' + esc(p.nombre) + '</option>'; }).join('') +
          '</select></div>' +
          '<div class="rejilla-campos dos">' +
            '<div class="campo"><label for="nc-fecha">Fecha</label><input id="nc-fecha" type="date" min="' + hoy + '" value="' + fecha + '"></div>' +
            '<div class="campo"><label for="nc-hora">Hora</label><select id="nc-hora">' + horas.map(function (x) { return '<option' + (x === '10:00' ? ' selected' : '') + '>' + x + '</option>'; }).join('') + '</select></div>' +
          '</div>' +
          '<div class="campo"><label for="nc-motivo">Motivo</label><input id="nc-motivo" maxlength="120" placeholder="Ej. Seguimiento mensual"></div>' +
          '<p class="texto-suave" style="font-size:.86rem">Las citas que registras tú quedan confirmadas.</p>' +
        '</form>',
      pie: '<button type="button" class="btn btn-fantasma" data-cerrar>Cancelar</button><button type="submit" form="form-nueva" class="btn btn-primario">' + ic('check') + 'Guardar cita</button>'
    });
    var form = $('#form-nueva', m.el);
    $$('input, select', form).forEach(function (el) { el.addEventListener('input', function () { ui.errorCampo(el, null); }); el.addEventListener('change', function () { ui.errorCampo(el, null); }); });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var pac = $('#nc-paciente', m.el), fe = $('#nc-fecha', m.el), ho = $('#nc-hora', m.el), mo = $('#nc-motivo', m.el);
      var ok = true;
      if (!pac.value) { ui.errorCampo(pac, 'Elige un paciente.'); ok = false; }
      if (!fe.value) { ui.errorCampo(fe, 'Elige una fecha.'); ok = false; }
      else if (F.yaPaso(fe.value, ho.value)) { ui.errorCampo(fe, 'Esa fecha y hora ya pasaron.'); ok = false; }
      else if (store.horarioOcupado(ID, fe.value, ho.value)) { ui.errorCampo(ho, 'Ya tienes una cita a esa hora.'); ok = false; }
      if (mo.value.trim().length < 3) { ui.errorCampo(mo, 'Escribe el motivo de la cita.'); ok = false; }
      if (!ok) return;
      var cita = store.agregarCita({ nutriologoId: ID, pacienteId: pac.value, fecha: fe.value, hora: ho.value, motivo: mo.value.trim(), estado: 'confirmada', origen: 'manual' });
      m.cerrar(true);
      ui.toast('Cita guardada: ' + paciente(cita.pacienteId).nombre.split(' ')[0] + ', ' + F.formatoLargo(cita.fecha).toLowerCase() + ' a las ' + cita.hora + '.');
      agendaEstado = { lunes: F.lunesDe(cita.fecha), dia: cita.fecha };
      pintarCuenta();
      if (location.hash.indexOf('#agenda') === 0) { vistaAgenda(vista); resaltar(cita.id); }
      else { location.hash = '#agenda'; setTimeout(function () { resaltar(cita.id); }, 450); }
    });
  }
  function resaltar(id) {
    var li = document.querySelector('[data-cita="' + id + '"]');
    if (li) { li.classList.add('recien'); li.scrollIntoView({ block: 'center', behavior: ui.reducirMovimiento ? 'auto' : 'smooth' }); }
  }

  /* =====================================================================
     3. PACIENTES Y EXPEDIENTES
     ===================================================================== */
  var busqueda = '';
  function vistaPacientes(c, ruta) {
    var lista = store.pacientes();
    var selId = ruta.id || (window.matchMedia('(min-width: 1000px)').matches ? lista[0].id : null);
    var movilConDetalle = !!ruta.id;

    c.innerHTML =
      '<div class="vista-cabeza"><div><h1>Pacientes</h1><p>Expediente digital con el historial de cada consulta y la evolución de peso.</p></div></div>' +
      '<div class="pacientes-rejilla">' +
        '<section class="panel" aria-labelledby="t-lista"' + (movilConDetalle ? ' data-ocultar-movil' : '') + '>' +
          '<h2 id="t-lista" class="sr-only">Lista de pacientes</h2>' +
          '<div class="campo buscador">' + ic('buscar') + '<label for="buscar-paciente" class="sr-only">Buscar paciente</label>' +
            '<input id="buscar-paciente" type="search" placeholder="Buscar por nombre u objetivo" value="' + esc(busqueda) + '" autocomplete="off"></div>' +
          '<ul class="lista-pacientes" id="lista-pacientes"></ul>' +
        '</section>' +
        '<div id="expediente">' + (selId ? '' : '<div class="vacio"><span class="vacio-ico">' + ic('expediente') + '</span><h3>Elige un paciente</h3><p>Abre su expediente para ver su historial y registrar una nueva consulta.</p></div>') + '</div>' +
      '</div>';

    if (movilConDetalle && !window.matchMedia('(min-width: 1000px)').matches) {
      c.querySelector('[data-ocultar-movil]').hidden = true;
      $('#expediente').insertAdjacentHTML('beforebegin', '<a class="migas" href="#pacientes">' + ic('izq') + 'Todos los pacientes</a>');
    }

    function pintarLista() {
      var q = busqueda.trim().toLowerCase();
      var filtrados = lista.filter(function (p) {
        var obj = store.objetivo(p.objetivo);
        return !q || p.nombre.toLowerCase().indexOf(q) !== -1 || (obj && obj.nombre.toLowerCase().indexOf(q) !== -1) || (p.nota && p.nota.toLowerCase().indexOf(q) !== -1);
      });
      $('#lista-pacientes').innerHTML = filtrados.length ? filtrados.map(function (p) {
        var peso = store.pesoActual(p);
        return '<li><a class="paciente-item" href="#pacientes/' + p.id + '"' + (p.id === selId ? ' aria-current="true"' : '') + '>' +
          ui.avatar(p.nombre, 'md') +
          '<span><strong>' + esc(p.nombre) + (p.esUsuarioDemo ? '<span class="marca-demo">Usuario demo</span>' : '') + '</strong>' +
          '<small>' + esc(store.objetivo(p.objetivo).nombre) + (peso ? ', ' + ui.decimal(peso) + ' kg' : '') + '</small></span>' +
          ic('der', 'flecha') + '</a></li>';
      }).join('') : '<li class="texto-suave" style="padding:16px;text-align:center">Ningún paciente coincide con "' + esc(busqueda) + '".</li>';
    }
    $('#buscar-paciente').addEventListener('input', function () { busqueda = this.value; pintarLista(); });
    pintarLista();
    if (selId) pintarExpediente(selId);
  }

  function imcDe(p) {
    var peso = store.pesoActual(p);
    return peso && p.estatura ? NM.imc.calcular(p.estatura, peso) : null;
  }

  function pintarExpediente(id, recienId) {
    var cont = $('#expediente');
    var p = store.paciente(id);
    if (!p) {
      cont.innerHTML = vacio('usuario', 'No encontramos este expediente', 'Elige un paciente de la lista.', '');
      return;
    }
    var obj = store.objetivo(p.objetivo);
    var peso = store.pesoActual(p);
    var inicial = p.consultas.length ? p.consultas[0].peso : peso;
    var delta = peso && inicial ? Math.round((peso - inicial) * 10) / 10 : 0;
    var imc = imcDe(p);
    var prox = proximas().filter(function (x) { return x.pacienteId === p.id; })[0];
    var historial = p.consultas.slice().reverse();

    cont.innerHTML =
      '<div class="expediente" data-escalonar>' +
        '<section class="panel">' +
          '<div class="exp-cabeza">' + ui.avatar(p.nombre, 'lg') +
            '<div><h2>' + esc(p.nombre) + '</h2>' +
              '<p class="texto-suave">' + p.edad + ' años, ' + (p.sexo === 'F' ? 'mujer' : 'hombre') + (p.esUsuarioDemo ? ' <span class="marca-demo">Usuario demo</span>' : '') + '</p></div>' +
            '<div class="acciones">' +
              '<button type="button" class="btn btn-secundario btn-sm" id="exp-agendar">' + ic('calendario') + 'Agendar cita</button>' +
              '<button type="button" class="btn btn-primario btn-sm" id="exp-consulta">' + ic('mas') + 'Registrar nueva consulta</button>' +
            '</div>' +
          '</div>' +
          '<div class="tn-chips mt-2">' + ui.chipObjetivo(p.objetivo) + (p.nota ? '<span class="chip">' + esc(p.nota) + '</span>' : '') + '</div>' +
          '<div class="exp-contacto mt-2">' +
            '<span>' + ic('telefono') + esc(p.telefono) + '</span>' +
            '<span>' + ic('correo') + esc(p.correo) + '</span>' +
            '<span>' + ic('calendario') + 'Paciente desde ' + esc(F.formatear(p.desde, { month: 'long', year: 'numeric' })) + '</span>' +
            (prox ? '<span>' + ic('reloj') + 'Próxima cita: ' + esc(F.relativo(prox.fecha).toLowerCase()) + ', ' + prox.hora + '</span>' : '') +
          '</div>' +
          '<div class="exp-datos mt-3">' +
            '<div class="exp-dato"><small>Peso actual</small><strong>' + (peso ? ui.decimal(peso) : '–') + '</strong> kg' +
              (delta ? '<span class="delta ' + (delta < 0 ? 'baja' : 'sube') + '">' + (delta > 0 ? '+' : '') + ui.decimal(delta) + '</span>' : '') + '</div>' +
            '<div class="exp-dato"><small>Estatura</small><strong>' + p.estatura + '</strong> cm</div>' +
            '<div class="exp-dato"><small>IMC</small><strong>' + (imc ? ui.decimal(imc.valor) : '–') + '</strong> <span class="texto-suave" style="font-size:.82rem">' + (imc ? esc(imc.categoria.nombre) : '') + '</span></div>' +
            '<div class="exp-dato"><small>Consultas</small><strong>' + p.consultas.length + '</strong></div>' +
          '</div>' +
          '<p class="texto-suave mt-2" style="font-size:.88rem">Objetivo: <strong style="color:var(--tinta)">' + esc(obj.nombre) + '</strong>' + (imc ? '. Rango de peso saludable para su estatura: ' + ui.decimal(imc.rango.min) + ' a ' + ui.decimal(imc.rango.max) + ' kg.' : '') + '</p>' +
        '</section>' +
        '<section class="panel" aria-labelledby="t-evol">' +
          '<div class="panel-cabeza"><h3 id="t-evol">Evolución de peso</h3><span class="texto-suave" style="font-size:.85rem">' + p.consultas.length + ' registros</span></div>' +
          graficaPeso(p) +
        '</section>' +
        '<section class="panel" aria-labelledby="t-hist">' +
          '<div class="panel-cabeza"><h3 id="t-hist">Historial de consultas</h3></div>' +
          (historial.length ? '<ol class="historial">' + historial.map(function (k, i) {
            var anterior = historial[i + 1];
            var d = anterior ? Math.round((k.peso - anterior.peso) * 10) / 10 : null;
            return '<li' + (k.id === recienId ? ' class="recien"' : '') + '><div>' +
              '<div class="hist-cabeza"><strong>' + esc(F.formatear(k.fecha)) + '</strong><span class="peso">' + ui.decimal(k.peso) + ' kg</span>' +
                (d !== null && d !== 0 ? '<span class="delta ' + (d < 0 ? 'baja' : 'sube') + '">' + (d > 0 ? '+' : '') + ui.decimal(d) + ' kg</span>' : '') + '</div>' +
              '<div class="hist-cuerpo"><p><b>Notas:</b> ' + esc(k.notas) + '</p><p><b>Indicaciones:</b> ' + esc(k.indicaciones) + '</p></div>' +
            '</div></li>';
          }).join('') + '</ol>' : '<p class="texto-suave">Aún no hay consultas registradas.</p>') +
        '</section>' +
      '</div>';

    // Largo real del trazo para la animación de dibujo
    var linea = cont.querySelector('.g-linea');
    if (linea && linea.getTotalLength) linea.style.setProperty('--largo', Math.ceil(linea.getTotalLength()));
    ui.escalonar(cont);
    $('#exp-consulta').addEventListener('click', function () { registrarConsulta(p); });
    $('#exp-agendar').addEventListener('click', function () { nuevaCita({ pacienteId: p.id }); });
  }

  /* Gráfica de evolución de peso hecha con SVG propio */
  function graficaPeso(p) {
    var datos = p.consultas;
    if (!datos.length) return '<p class="texto-suave">Registra la primera consulta para ver la gráfica.</p>';
    var W = 640, H = 240, iz = 44, de = 20, ar = 26, ab = 34;
    var pesos = datos.map(function (k) { return k.peso; });
    var min = Math.min.apply(null, pesos), max = Math.max.apply(null, pesos);
    var m = p.estatura / 100;
    var sano = Math.round(24.9 * m * m * 10) / 10;
    var lo = Math.floor(min - 1.5), hi = Math.ceil(max + 1.5);
    var mostrarMeta = sano >= lo - 4 && sano <= hi + 4;
    if (mostrarMeta) { lo = Math.min(lo, Math.floor(sano - 1)); hi = Math.max(hi, Math.ceil(sano + 1)); }
    if (hi - lo < 4) { hi += 2; lo -= 2; }
    var t0 = F.deISO(datos[0].fecha).getTime();
    var t1 = F.deISO(datos[datos.length - 1].fecha).getTime();
    var x = function (k, i) {
      if (datos.length === 1) return iz + (W - iz - de) / 2;
      return iz + ((F.deISO(k.fecha).getTime() - t0) / (t1 - t0 || 1)) * (W - iz - de);
    };
    var y = function (v) { return ar + (1 - (v - lo) / (hi - lo)) * (H - ar - ab); };

    var rejilla = '';
    var pasos = 4;
    for (var i = 0; i <= pasos; i++) {
      var v = lo + ((hi - lo) / pasos) * i;
      rejilla += '<line x1="' + iz + '" x2="' + (W - de) + '" y1="' + y(v).toFixed(1) + '" y2="' + y(v).toFixed(1) + '"/>' +
        '<text class="g-eje" x="' + (iz - 8) + '" y="' + (y(v) + 4).toFixed(1) + '" text-anchor="end">' + ui.decimal(v, 0) + '</text>';
    }
    var pts = datos.map(function (k, i) { return [x(k, i), y(k.peso)]; });
    var d = pts.map(function (q, i) { return (i ? 'L' : 'M') + q[0].toFixed(1) + ' ' + q[1].toFixed(1); }).join(' ');
    var area = d + ' L' + pts[pts.length - 1][0].toFixed(1) + ' ' + (H - ab) + ' L' + pts[0][0].toFixed(1) + ' ' + (H - ab) + ' Z';
    var etiquetasX = datos.map(function (k, i) {
      return '<text class="g-eje" x="' + pts[i][0].toFixed(1) + '" y="' + (H - 10) + '" text-anchor="middle">' + esc(F.formatear(k.fecha, { day: 'numeric', month: 'short' })) + '</text>';
    }).join('');
    var puntos = datos.map(function (k, i) {
      var ultimo = i === datos.length - 1;
      return '<circle class="g-punto' + (ultimo ? ' ultimo' : '') + '" cx="' + pts[i][0].toFixed(1) + '" cy="' + pts[i][1].toFixed(1) + '" r="5" style="animation-delay:' + (0.25 + i * 0.18) + 's"><title>' + esc(F.formatear(k.fecha)) + ': ' + ui.decimal(k.peso) + ' kg</title></circle>' +
        '<text class="g-valor" x="' + pts[i][0].toFixed(1) + '" y="' + (pts[i][1] - 12).toFixed(1) + '" text-anchor="middle" style="animation-delay:' + (0.35 + i * 0.18) + 's">' + ui.decimal(k.peso) + '</text>';
    }).join('');
    var meta = mostrarMeta
      ? '<line class="g-meta" x1="' + iz + '" x2="' + (W - de) + '" y1="' + y(sano).toFixed(1) + '" y2="' + y(sano).toFixed(1) + '"/>' +
        '<text class="g-meta-texto" x="' + (W - de) + '" y="' + (y(sano) - 6).toFixed(1) + '" text-anchor="end">Peso saludable máx. ' + ui.decimal(sano) + ' kg</text>'
      : '';
    var resumen = 'Peso de ' + ui.decimal(datos[0].peso) + ' kg el ' + F.formatear(datos[0].fecha) + ' a ' + ui.decimal(datos[datos.length - 1].peso) + ' kg el ' + F.formatear(datos[datos.length - 1].fecha) + '.';

    return '<svg class="grafica" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Gráfica de evolución de peso. ' + esc(resumen) + '">' +
      '<defs><linearGradient id="g-degradado" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#2E7C96" stop-opacity=".22"/><stop offset="1" stop-color="#2E7C96" stop-opacity="0"/></linearGradient></defs>' +
      '<g class="g-rejilla">' + rejilla + '</g>' + meta +
      (datos.length > 1 ? '<path class="g-area" d="' + area + '"/><path class="g-linea" d="' + d + '"/>' : '') +
      puntos + etiquetasX + '</svg>';
  }

  /* Modal: registrar nueva consulta */
  function registrarConsulta(p) {
    var hoy = F.hoyISO();
    var m = ui.modal({
      titulo: 'Registrar consulta',
      contenido:
        '<p class="texto-suave" style="margin-bottom:16px">Paciente: <strong style="color:var(--tinta)">' + esc(p.nombre) + '</strong></p>' +
        '<form id="form-consulta" class="pila" novalidate style="gap:16px">' +
          '<div class="rejilla-campos tres">' +
            '<div class="campo"><label for="k-fecha">Fecha</label><input id="k-fecha" type="date" max="' + hoy + '" value="' + hoy + '"></div>' +
            '<div class="campo"><label for="k-peso">Peso</label><div class="campo-unidad"><input id="k-peso" type="number" inputmode="decimal" step="0.1" min="30" max="300" value="' + (store.pesoActual(p) || '') + '"><span class="unidad">kg</span></div></div>' +
            '<div class="campo"><label for="k-est">Estatura</label><div class="campo-unidad"><input id="k-est" type="number" inputmode="decimal" step="0.1" min="100" max="250" value="' + p.estatura + '"><span class="unidad">cm</span></div></div>' +
          '</div>' +
          '<p class="texto-suave" id="k-imc" aria-live="polite" style="font-size:.9rem"></p>' +
          '<div class="campo"><label for="k-notas">Notas de la consulta</label><textarea id="k-notas" maxlength="400" placeholder="Cómo llegó, adherencia al plan, estudios…"></textarea></div>' +
          '<div class="campo"><label for="k-ind">Indicaciones</label><textarea id="k-ind" maxlength="400" placeholder="Cambios al plan, metas para la próxima cita…"></textarea></div>' +
        '</form>',
      pie: '<button type="button" class="btn btn-fantasma" data-cerrar>Cancelar</button><button type="submit" form="form-consulta" class="btn btn-primario">' + ic('check') + 'Guardar consulta</button>'
    });
    var f = $('#form-consulta', m.el);
    var campos = { fecha: $('#k-fecha', m.el), peso: $('#k-peso', m.el), est: $('#k-est', m.el), notas: $('#k-notas', m.el), ind: $('#k-ind', m.el) };
    function vistaImc() {
      var e = NM.imc.validar(campos.est.value, campos.peso.value);
      var out = $('#k-imc', m.el);
      if (e.peso || e.estatura) { out.textContent = ''; return; }
      var r = NM.imc.calcular(parseFloat(campos.est.value), parseFloat(campos.peso.value));
      out.innerHTML = 'IMC con estos datos: <strong style="color:var(--tinta)">' + ui.decimal(r.valor) + '</strong> (' + esc(r.categoria.nombre) + ')';
    }
    Object.keys(campos).forEach(function (k) { campos[k].addEventListener('input', function () { ui.errorCampo(campos[k], null); vistaImc(); }); });
    vistaImc();
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var err = NM.imc.validar(campos.est.value, campos.peso.value);
      var ok = true;
      if (!campos.fecha.value) { ui.errorCampo(campos.fecha, 'Elige la fecha de la consulta.'); ok = false; }
      else if (campos.fecha.value > hoy) { ui.errorCampo(campos.fecha, 'La fecha no puede ser futura.'); ok = false; }
      if (err.peso) { ui.errorCampo(campos.peso, err.peso); ok = false; }
      if (err.estatura) { ui.errorCampo(campos.est, err.estatura); ok = false; }
      if (campos.notas.value.trim().length < 5) { ui.errorCampo(campos.notas, 'Escribe al menos una nota breve.'); ok = false; }
      if (campos.ind.value.trim().length < 5) { ui.errorCampo(campos.ind, 'Escribe las indicaciones para el paciente.'); ok = false; }
      if (!ok) { var x = f.querySelector('[aria-invalid=true]'); if (x) x.focus(); return; }
      var k = store.agregarConsulta(p.id, {
        fecha: campos.fecha.value,
        peso: Math.round(parseFloat(campos.peso.value) * 10) / 10,
        estatura: parseFloat(campos.est.value),
        notas: campos.notas.value.trim(),
        indicaciones: campos.ind.value.trim()
      });
      m.cerrar(true);
      var r = imcDe(store.paciente(p.id));
      ui.toast('Consulta registrada. Peso ' + ui.decimal(store.pesoActual(store.paciente(p.id))) + ' kg, IMC ' + ui.decimal(r.valor) + '.');
      pintarExpediente(p.id, k.id);
      // Refresca la lista para mostrar el nuevo peso
      var item = document.querySelector('.paciente-item[aria-current="true"] small');
      if (item) item.textContent = store.objetivo(p.objetivo).nombre + ', ' + ui.decimal(store.pesoActual(store.paciente(p.id))) + ' kg';
    });
  }

  /* =====================================================================
     4. MI PERFIL PÚBLICO
     ===================================================================== */
  var NOMBRES_DIAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  function vistaPerfil(c) {
    var n = yo();
    var ver = n.verificacion.estado === 'verificado';
    var horas = [];
    for (var h = 6; h <= 22; h++) horas.push(h);
    var b1 = n.horario.bloques[0] || [9, 14];
    var b2 = n.horario.bloques[1] || null;
    var opcionesHora = function (sel) { return horas.map(function (x) { return '<option value="' + x + '"' + (x === sel ? ' selected' : '') + '>' + x + ':00</option>'; }).join(''); };

    c.innerHTML =
      '<div class="vista-cabeza"><div><h1>Mi perfil público</h1><p>Así te encuentran los pacientes. Los cambios se ven al instante en la vista previa.</p></div></div>' +
      '<div class="editor-rejilla">' +
        '<form class="panel" id="form-perfil" novalidate>' +
          '<div class="form-seccion"><h3>' + ic('usuario') + 'Presentación</h3>' +
            '<div class="campo"><label for="pp-bio">Biografía</label><textarea id="pp-bio" name="bio" maxlength="600" rows="5">' + esc(n.bio) + '</textarea><span class="ayuda" id="pp-bio-cuenta"></span></div>' +
            '<fieldset class="chips-check" id="pp-esp"><legend>Especialidades</legend>' +
              D.OBJETIVOS.map(function (o) {
                return '<label class="chip-check"><input type="checkbox" name="esp" value="' + o.id + '"' + (n.especialidades.indexOf(o.id) !== -1 ? ' checked' : '') + '><span>' + ic(o.id) + esc(o.nombre) + '</span></label>';
              }).join('') +
            '</fieldset>' +
          '</div>' +
          '<div class="form-seccion"><h3>' + ic('ubicacion') + 'Consulta y ubicación</h3>' +
            '<div class="rejilla-campos dos">' +
              '<div class="campo"><label for="pp-precio">Precio de consulta</label><div class="campo-unidad"><input id="pp-precio" type="number" inputmode="numeric" min="100" max="3000" step="10" value="' + n.precio + '"><span class="unidad">MXN</span></div></div>' +
              '<div class="campo"><label for="pp-modalidad">Modalidad</label><select id="pp-modalidad">' + ['Presencial', 'En línea', 'Presencial y en línea'].map(function (x) { return '<option' + (x === n.modalidad ? ' selected' : '') + '>' + x + '</option>'; }).join('') + '</select></div>' +
              '<div class="campo"><label for="pp-zona">Zona</label><select id="pp-zona">' + D.CONFIG.zonas.map(function (z) { return '<option' + (z === n.zona ? ' selected' : '') + '>' + esc(z) + '</option>'; }).join('') + '</select></div>' +
              '<div class="campo"><label for="pp-dir">Dirección del consultorio</label><input id="pp-dir" maxlength="120" value="' + esc(n.direccion) + '"></div>' +
            '</div>' +
          '</div>' +
          '<div class="form-seccion"><h3>' + ic('reloj') + 'Horario de atención</h3>' +
            '<fieldset class="dias-semana" id="pp-dias"><legend>Días</legend>' +
              [1, 2, 3, 4, 5, 6, 0].map(function (d) {
                return '<label class="chip-check"><input type="checkbox" name="dia" value="' + d + '"' + (n.horario.dias.indexOf(d) !== -1 ? ' checked' : '') + '><span>' + NOMBRES_DIAS[d] + '</span></label>';
              }).join('') +
            '</fieldset>' +
            '<div class="rejilla-campos dos">' +
              '<div class="campo"><label for="pp-b1i">Turno 1: desde</label><select id="pp-b1i">' + opcionesHora(b1[0]) + '</select></div>' +
              '<div class="campo"><label for="pp-b1f">Turno 1: hasta</label><select id="pp-b1f">' + opcionesHora(b1[1]) + '</select></div>' +
            '</div>' +
            '<label class="interruptor"><input type="checkbox" id="pp-b2on"' + (b2 ? ' checked' : '') + '><span class="pista"></span>Tengo un segundo turno</label>' +
            '<div class="rejilla-campos dos" id="pp-b2"' + (b2 ? '' : ' hidden') + '>' +
              '<div class="campo"><label for="pp-b2i">Turno 2: desde</label><select id="pp-b2i">' + opcionesHora(b2 ? b2[0] : 16) + '</select></div>' +
              '<div class="campo"><label for="pp-b2f">Turno 2: hasta</label><select id="pp-b2f">' + opcionesHora(b2 ? b2[1] : 19) + '</select></div>' +
            '</div>' +
          '</div>' +
          '<div class="form-seccion"><h3>' + ic('escudo') + 'Cédula profesional</h3>' +
            '<div class="fila">' + '<span class="estado estado-' + (ver ? 'verificado' : 'revision') + '">' + (ver ? 'Verificado' : 'En revisión') + '</span>' +
              '<span class="texto-suave" style="font-size:.9rem">Cédula ' + esc(ui.cedulaOculta(n.cedula)) + (ver ? ', verificada el ' + esc(F.formatear(n.verificacion.fecha)) : (n.verificacion.archivo ? ', archivo: ' + esc(n.verificacion.archivo) : '')) + '</span></div>' +
            '<label class="subir-cedula">' + ic('subir') +
              '<strong>Subir cédula profesional</strong><small>PDF, JPG o PNG. Simulado: el archivo no se envía a ningún lado.</small>' +
              '<input type="file" id="pp-cedula" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/*" aria-describedby="pp-cedula-ayuda"></label>' +
            '<p class="ayuda texto-suave" id="pp-cedula-ayuda" style="font-size:.84rem">Al subir un archivo nuevo tu perfil pasa a "En revisión" hasta validarlo.</p>' +
            '<div id="pp-archivo"></div>' +
            (!ver ? '<button type="button" class="btn btn-secundario btn-sm" id="pp-aprobar">' + ic('sello') + 'Simular aprobación de la cédula</button>' : '') +
          '</div>' +
          '<div class="fila"><button type="submit" class="btn btn-primario btn-lg">' + ic('check') + 'Guardar cambios</button><button type="button" class="btn btn-fantasma" id="pp-descartar">Descartar</button></div>' +
        '</form>' +
        '<div class="columna-preview">' +
          '<div class="preview-marco">' +
            '<p>' + ic('ojo') + 'Vista previa: así te ve un paciente en la búsqueda</p>' +
            '<div id="pp-preview"></div>' +
          '</div>' +
        '</div>' +
      '</div>';

    var form = $('#form-perfil');
    function borrador() {
      var dias = $$('[name=dia]:checked', form).map(function (x) { return +x.value; });
      var bloques = [[+$('#pp-b1i').value, +$('#pp-b1f').value]];
      if ($('#pp-b2on').checked) bloques.push([+$('#pp-b2i').value, +$('#pp-b2f').value]);
      return {
        bio: $('#pp-bio').value.trim(),
        especialidades: $$('[name=esp]:checked', form).map(function (x) { return x.value; }),
        precio: parseInt($('#pp-precio').value, 10),
        modalidad: $('#pp-modalidad').value,
        zona: $('#pp-zona').value,
        direccion: $('#pp-dir').value.trim(),
        horario: { dias: dias, bloques: bloques }
      };
    }
    function vistaPrevia() {
      var b = borrador();
      var copia = JSON.parse(JSON.stringify(yo()));
      Object.keys(b).forEach(function (k) { copia[k] = b[k]; });
      if (!copia.especialidades.length) copia.especialidades = [];
      if (isNaN(copia.precio)) copia.precio = 0;
      $('#pp-preview').innerHTML = ui.tarjetaNutriologo(copia, { vistaPrevia: true }) +
        '<div class="panel mt-2" style="box-shadow:none"><p style="font-size:.85rem;color:var(--tinta-3);margin-bottom:6px">Fragmento de tu biografía</p><p class="bio" style="font-size:.93rem">' + esc(b.bio.slice(0, 180)) + (b.bio.length > 180 ? '…' : '') + '</p></div>';
      $('#pp-bio-cuenta').textContent = b.bio.length + ' de 600 caracteres';
    }
    form.addEventListener('input', function (e) { if (e.target.id !== 'pp-cedula') { ui.errorCampo(e.target, null); vistaPrevia(); } });
    form.addEventListener('change', function (e) {
      if (e.target.id === 'pp-b2on') $('#pp-b2').hidden = !e.target.checked;
      if (e.target.name === 'esp') ui.errorCampo($('#pp-esp'), null);
      if (e.target.name === 'dia') ui.errorCampo($('#pp-dias'), null);
      if (e.target.id !== 'pp-cedula') vistaPrevia();
    });
    $('#pp-descartar').addEventListener('click', function () { vistaPerfil(c); ui.toast('Cambios descartados.', 'info'); });

    $('#pp-cedula').addEventListener('change', function () {
      var archivo = this.files && this.files[0];
      if (!archivo) return;
      var kb = Math.max(1, Math.round(archivo.size / 1024));
      store.actualizarNutriologo(ID, { verificacion: { estado: 'revision', archivo: archivo.name, enviado: F.hoyISO() } });
      pintarCuenta();
      vistaPerfil(c);
      $('#pp-archivo').innerHTML = '<div class="archivo-elegido">' + ic('expediente') + '<span><strong>' + esc(archivo.name) + '</strong> <span class="texto-suave">(' + kb + ' KB)</span></span></div>';
      ui.toast('Recibimos tu cédula (simulado). Tu perfil queda "En revisión".', 'info');
    });
    var aprobar = $('#pp-aprobar');
    if (aprobar) aprobar.addEventListener('click', function () {
      store.actualizarNutriologo(ID, { verificacion: { estado: 'verificado', fecha: F.hoyISO() } });
      pintarCuenta();
      vistaPerfil(c);
      ui.toast('Cédula aprobada (simulado). Tu perfil vuelve a mostrarse como Verificado.');
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var b = borrador();
      var ok = true;
      if (b.bio.length < 40) { ui.errorCampo($('#pp-bio'), 'Escribe una biografía de al menos 40 caracteres.'); ok = false; }
      if (!b.especialidades.length) { ui.errorCampo($('#pp-esp'), 'Elige al menos una especialidad.'); ok = false; }
      if (isNaN(b.precio) || b.precio < 100 || b.precio > 3000) { ui.errorCampo($('#pp-precio'), 'El precio debe estar entre $100 y $3,000.'); ok = false; }
      if (b.direccion.length < 5) { ui.errorCampo($('#pp-dir'), 'Escribe la dirección del consultorio.'); ok = false; }
      if (!b.horario.dias.length) { ui.errorCampo($('#pp-dias'), 'Elige al menos un día de atención.'); ok = false; }
      var malos = b.horario.bloques.some(function (x) { return x[1] <= x[0]; });
      if (malos) { ui.errorCampo($('#pp-b1f'), 'La hora de salida debe ser posterior a la de entrada.'); ok = false; }
      if (b.horario.bloques.length === 2 && b.horario.bloques[1][0] < b.horario.bloques[0][1]) { ui.errorCampo($('#pp-b2i'), 'El segundo turno debe empezar después del primero.'); ok = false; }
      if (!ok) { var x = form.querySelector('[aria-invalid=true]'); if (x) x.focus(); ui.toast('Revisa los campos marcados.', 'error'); return; }
      store.actualizarNutriologo(ID, b);
      pintarCuenta();
      ui.toast('Perfil público actualizado. Así ya te ven los pacientes.');
    });
    vistaPrevia();
  }

  /* =====================================================================
     5. RESEÑAS
     ===================================================================== */
  function vistaResenas(c) {
    var rs = store.resenasDe(ID);
    var cal = store.calificacion(ID);
    var nuevas = rs.filter(function (r) { return r.nueva; }).length;
    c.innerHTML =
      '<div class="vista-cabeza"><div><h1>Reseñas</h1><p>Lo que dicen tus pacientes después de la consulta. Tu promedio se muestra en tu perfil público.</p></div></div>' +
      '<div class="pila">' +
        '<section class="panel" aria-labelledby="t-prom"><h2 id="t-prom" class="sr-only">Promedio</h2>' + ui.resumenCalificacion(rs) +
          (nuevas ? '<p class="nota-demo mt-3">' + ic('estrella') + '<span>Tienes ' + nuevas + (nuevas === 1 ? ' reseña nueva' : ' reseñas nuevas') + ' de pacientes que agendaron en NutriMatch. Tu promedio actual es ' + ui.decimal(cal.promedio) + '.</span></p>' : '') +
        '</section>' +
        (rs.length ? '<ul class="lista-resenas" data-escalonar>' + rs.map(ui.resenaItem).join('') + '</ul>'
          : vacio('estrella', 'Aún no tienes reseñas', 'Cuando marques una cita como completada, tu paciente podrá calificarte.')) +
      '</div>';
  }

  /* =====================================================================
     6. SUSCRIPCIÓN
     ===================================================================== */
  function vistaSuscripcion(c) {
    var sus = store.suscripcion();
    var actual = store.plan(sus.plan);
    var mensual = D.CONFIG.planes[0];
    var hoy = F.hoyISO();
    var total = F.diferenciaDias(sus.inicio, sus.vence);
    var usados = Math.max(0, Math.min(total, F.diferenciaDias(sus.inicio, hoy)));
    var restantes = F.diferenciaDias(hoy, sus.vence);

    c.innerHTML =
      '<div class="vista-cabeza"><div><h1>Suscripción</h1><p>Un solo pago te da perfil verificado, agenda, expedientes y visibilidad ante pacientes nuevos.</p></div></div>' +
      '<section class="plan-actual" aria-labelledby="t-plan">' +
        '<div><p>Tu plan actual</p><h2 id="t-plan">Plan ' + esc(actual.nombre) + '</h2>' +
          '<p class="mt-1">Activo desde el ' + esc(F.formatear(sus.inicio)) + '. Vence el <strong style="color:#fff">' + esc(F.formatear(sus.vence)) + '</strong>, en ' + restantes + ' días.</p>' +
          '<div class="progreso" role="progressbar" aria-label="Tiempo usado de la suscripción" aria-valuemin="0" aria-valuemax="' + total + '" aria-valuenow="' + usados + '" style="margin-top:14px"><span style="width:' + (usados / total * 100) + '%"></span></div></div>' +
        '<div><p class="plan-precio" style="color:#fff">' + ui.dinero(actual.precio) + '<small style="color:rgba(234,242,244,.7)">MXN / ' + actual.meses + (actual.meses === 1 ? ' mes' : ' meses') + '</small></p></div>' +
      '</section>' +
      '<h2 class="mt-4" style="font-size:1.6rem;margin-bottom:16px">Planes disponibles</h2>' +
      '<div class="planes" data-escalonar>' + D.CONFIG.planes.map(function (p) {
        var ahorro = mensual.precio * p.meses - p.precio;
        var esActual = p.id === actual.id;
        return '<article class="plan' + (esActual ? ' es-actual' : '') + '">' +
          (esActual ? '<span class="plan-cinta" style="background:var(--azul);color:#fff">Plan actual</span>' : '') +
          '<div><h3>' + esc(p.nombre) + '</h3><p class="plan-detalle">' + p.meses + (p.meses === 1 ? ' mes' : ' meses') + ', ' + ui.dinero(Math.round(p.precio / p.meses)) + ' al mes</p></div>' +
          '<p class="plan-precio">' + ui.dinero(p.precio) + '<small>MXN</small></p>' +
          (ahorro > 0 ? '<span class="plan-ahorro">' + ic('check') + 'Ahorras ' + ui.dinero(ahorro) + ' frente al mensual</span>' : '<span class="plan-ahorro neutro">Precio base de referencia</span>') +
          '<ul class="plan-lista">' + D.CONFIG.incluye.slice(0, 4).map(function (t) { return '<li>' + ic('check') + '<span>' + esc(t) + '</span></li>'; }).join('') + '</ul>' +
          '<button type="button" class="btn ' + (esActual ? 'btn-secundario' : 'btn-primario') + ' btn-bloque" data-plan="' + p.id + '"' + (esActual ? ' disabled' : '') + '>' + (esActual ? 'Tu plan actual' : 'Cambiar plan') + '</button>' +
        '</article>';
      }).join('') + '</div>' +
      '<p class="nota-precios">' + ic('info') + 'Precios de ejemplo. Cambiar de plan es una simulación: no se realiza ningún pago real.</p>';

    $$('[data-plan]', c).forEach(function (b) {
      if (b.disabled) return;
      b.addEventListener('click', function () { cambiarPlan(b.getAttribute('data-plan'), c); });
    });
  }

  function cambiarPlan(id, c) {
    var p = store.plan(id);
    var vence = F.sumarMeses(F.hoyISO(), p.meses);
    var m = ui.modal({
      titulo: 'Cambiar a plan ' + p.nombre,
      clase: 'modal-chico',
      contenido:
        '<p>Tu nuevo plan <strong>' + esc(p.nombre) + '</strong> cuesta <strong>' + ui.dinero(p.precio) + ' MXN</strong> por ' + p.meses + (p.meses === 1 ? ' mes' : ' meses') + '. La vigencia empieza hoy y vence el <strong>' + esc(F.formatear(vence)) + '</strong>.</p>' +
        '<p class="nota-demo mt-2">' + ic('candado') + '<span>Simulación: no se pide tarjeta ni se realiza ningún cobro.</span></p>',
      pie: '<button type="button" class="btn btn-fantasma" data-cerrar>Volver</button><button type="button" class="btn btn-primario" id="confirmar-plan">Cambiar plan</button>'
    });
    $('#confirmar-plan', m.el).addEventListener('click', function () {
      store.cambiarPlan(id);
      var cuerpo = m.el.querySelector('.modal-cuerpo');
      cuerpo.innerHTML = ui.exitoAnimado('Plan ' + p.nombre + ' activo', 'Tu suscripción vence el ' + esc(F.formatear(vence)) + '.');
      m.el.querySelector('.modal-pie').innerHTML = '<button type="button" class="btn btn-primario" id="plan-listo">Listo</button>';
      var listo = $('#plan-listo', m.el);
      listo.focus();
      listo.addEventListener('click', function () { m.cerrar(true); });
      vistaSuscripcion(c);
      ui.escalonar(c);
      ui.toast('Cambiaste al plan ' + p.nombre + ' (simulado).');
    });
  }

  /* -------------------------------------------------------------- Arranque */
  pintarCuenta();
  var router = ui.crearRouter({
    contenedor: vista,
    porDefecto: 'resumen',
    vistas: {
      resumen: vistaResumen,
      agenda: vistaAgenda,
      pacientes: vistaPacientes,
      perfil: vistaPerfil,
      resenas: vistaResenas,
      suscripcion: vistaSuscripcion
    },
    alCambiar: function (ruta) {
      marcarNavegacion(ruta);
      pintarCuenta();
      var t = { resumen: 'Resumen', agenda: 'Agenda', pacientes: 'Pacientes', perfil: 'Mi perfil público', resenas: 'Reseñas', suscripcion: 'Suscripción' }[ruta.vista] || 'Resumen';
      document.title = t + ' | Consultorio NutriMatch';
    }
  });
  router.iniciar();
  window.addEventListener('storage', function (e) {
    if (e.key && e.key.indexOf('nutrimatch.estado') === 0 && !document.querySelector('.modal-capa')) { pintarCuenta(); router.refrescar(); }
  });
})();
