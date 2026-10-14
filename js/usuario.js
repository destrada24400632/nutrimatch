/* =========================================================================
   NutriMatch — usuario.js
   Vista del usuario (paciente): inicio, búsqueda, perfil del nutriólogo,
   agenda de citas, mis citas, calificaciones y mi perfil.
   ========================================================================= */
(function () {
  'use strict';
  if (NM.auth.rolActual() !== 'usuario') return;

  var ui = NM.ui, store = NM.store, F = NM.fechas, D = NM_DATA;
  var $ = ui.$, $$ = ui.$$, esc = ui.esc, ic = ui.icono;
  var vista = $('#vista');

  /* Estado local de la vista */
  var FILTROS_BASE = { objetivo: '', califMin: 0, zona: '', distMax: 12, precioMax: 700, soloVerificados: true, orden: 'calificacion', ubicacion: false };
  var filtros = copiar(FILTROS_BASE);
  var reserva = { nutriId: null, fecha: null, hora: null };
  var pestanaCitas = 'proximas';

  function copiar(o) { return JSON.parse(JSON.stringify(o)); }
  function primerNombre() { return store.usuario().nombre.split(' ')[0]; }

  /* ----------------------------------------------------- Cabecera y sesión */
  function pintarSesion() {
    var u = store.usuario();
    $('#u-nombre').textContent = u.nombre.split(' ').slice(0, 2).join(' ');
    $('#u-avatar').innerHTML = ui.avatar(u.nombre, 'sm', 150);
  }
  $('#btn-salir').addEventListener('click', function () {
    ui.confirmar({ titulo: 'Cerrar sesión', mensaje: 'Saldrás de tu cuenta de demo. Tus citas y reseñas se quedan guardadas en este navegador.', aceptar: 'Cerrar sesión' })
      .then(function (ok) { if (ok) NM.auth.salir(); });
  });

  function marcarNavegacion(ruta) {
    var activa = ruta.vista === 'perfil' ? 'buscar' : ruta.vista;
    $$('[data-vista]').forEach(function (a) {
      if (a.getAttribute('data-vista') === activa) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
    ui.moverIndicador($('#u-nav'), $('#nav-indicador'));
  }
  window.addEventListener('resize', function () { ui.moverIndicador($('#u-nav'), $('#nav-indicador')); });

  /* ------------------------------------------------------------- Helpers */
  function nutrisVisibles() { return store.nutriologos(); }

  function proximasCitas() {
    return store.ordenarCitas(store.citasDeUsuario().filter(function (c) {
      return (c.estado === 'pendiente' || c.estado === 'confirmada') && !F.yaPaso(c.fecha, c.hora);
    }));
  }
  function pasadasCitas() {
    return store.ordenarCitas(store.citasDeUsuario().filter(function (c) {
      return !((c.estado === 'pendiente' || c.estado === 'confirmada') && !F.yaPaso(c.fecha, c.hora));
    }), true);
  }

  function vacio(icono, titulo, texto, accion) {
    return '<div class="vacio"><span class="vacio-ico">' + ic(icono) + '</span><h3>' + esc(titulo) + '</h3><p>' + esc(texto) + '</p>' + (accion || '') + '</div>';
  }

  function etiquetaEstado(e) {
    var t = { pendiente: 'Pendiente', confirmada: 'Confirmada', completada: 'Completada', cancelada: 'Cancelada' }[e] || e;
    return '<span class="estado estado-' + e + '">' + t + '</span>';
  }

  function cajaFecha(iso) {
    var d = F.deISO(iso);
    return '<div class="cita-fecha" aria-hidden="true"><span class="mes">' + d.toLocaleDateString('es-MX', { weekday: 'short' }) + '</span>' +
      '<span class="dia-n">' + d.getDate() + '</span><span class="mes">' + d.toLocaleDateString('es-MX', { month: 'short' }) + '</span></div>';
  }

  /* =====================================================================
     1. INICIO
     ===================================================================== */
  function vistaInicio(c) {
    var u = store.usuario();
    var prox = proximasCitas()[0];
    var nProx = prox ? store.nutriologo(prox.nutriologoId) : null;
    var top = nutrisVisibles()
      .filter(function (n) { return n.verificacion.estado === 'verificado'; })
      .map(function (n) { return { n: n, c: store.calificacion(n.id) }; })
      .sort(function (a, b) { return b.c.promedio - a.c.promedio || b.c.total - a.c.total; })
      .slice(0, 3);
    var porCalificar = store.citasDeUsuario().filter(function (x) { return x.estado === 'completada' && !x.calificada; }).length;

    var textoProx = prox
      ? 'Tu próxima cita es <strong>' + esc(F.formatoLargo(prox.fecha).toLowerCase()) + ' a las ' + prox.hora + '</strong> con ' + esc(nProx.nombre) + '.'
      : 'No tienes citas próximas. Busca un nutriólogo para tu objetivo y agenda en minutos.';

    c.innerHTML =
      '<section class="saludo">' +
        '<div><h1>Hola, ' + esc(primerNombre()) + '</h1><p>' + textoProx + '</p></div>' +
        '<div class="fila">' +
          (porCalificar ? '<a class="btn btn-naranja" href="#citas?pestana=pasadas">' + ic('estrella') + 'Calificar ' + porCalificar + (porCalificar === 1 ? ' cita' : ' citas') + '</a>' : '') +
          '<a class="btn btn-primario" href="#buscar">' + ic('buscar') + 'Buscar nutriólogos</a>' +
        '</div>' +
      '</section>' +
      '<div class="inicio-rejilla" data-escalonar>' +
        '<section class="panel" aria-labelledby="t-imc">' +
          '<div class="panel-cabeza"><h2 id="t-imc">Tu IMC</h2>' + ic('bascula', 'texto-suave') + '</div>' +
          '<p class="imc-guardado" id="imc-guardado"></p>' +
          '<form class="imc-form" id="u-imc-form" novalidate>' +
            '<div class="rejilla-campos" style="grid-template-columns:1fr 1fr">' +
              '<div class="campo"><label for="u-est">Estatura</label><div class="campo-unidad"><input id="u-est" name="estatura" type="number" inputmode="decimal" step="0.1" min="100" max="250"><span class="unidad">cm</span></div></div>' +
              '<div class="campo"><label for="u-peso">Peso</label><div class="campo-unidad"><input id="u-peso" name="peso" type="number" inputmode="decimal" step="0.1" min="30" max="300"><span class="unidad">kg</span></div></div>' +
            '</div>' +
            '<button class="btn btn-primario" type="submit">Calcular y guardar</button>' +
          '</form>' +
          '<div class="imc-salida" id="u-imc-salida" hidden aria-live="polite"></div>' +
        '</section>' +
        '<div class="pila">' +
          '<section class="panel" aria-labelledby="t-top">' +
            '<div class="panel-cabeza"><h2 id="t-top">Mejor calificados</h2><a href="#buscar" class="btn btn-fantasma btn-sm">Ver todos</a></div>' +
            '<ol class="top-lista">' + top.map(function (t, i) {
              return '<li><a class="top-item" href="#perfil/' + t.n.id + '">' +
                '<span class="top-pos" aria-hidden="true">' + (i + 1) + '</span>' + ui.avatar(t.n.nombre, 'md', t.n.tono) +
                '<div><h3>' + esc(t.n.nombre) + '</h3><p>' + ui.insigniaVerificado(t.n, true) + esc(t.n.especialidades.map(function (e) { return store.objetivo(e).nombre; }).slice(0, 2).join(', ')) + '</p></div>' +
                '<span class="calif-num" aria-label="Calificación ' + ui.decimal(t.c.promedio) + ' de 5">' + ic('estrella') + ui.decimal(t.c.promedio) + '</span>' +
                '</a></li>';
            }).join('') + '</ol>' +
          '</section>' +
          '<aside class="publicidad" aria-label="Publicidad (ejemplo)">' +
            '<span class="publicidad-etiqueta">Publicidad (ejemplo)</span>' +
            '<span class="publicidad-logo">' + ic('hoja') + '</span>' +
            '<div><h3>' + esc(D.ANUNCIO.marca) + '</h3><p>' + esc(D.ANUNCIO.texto) + '</p></div>' +
            '<button type="button" class="btn btn-sm btn-secundario" id="btn-anuncio">' + esc(D.ANUNCIO.cta) + '</button>' +
          '</aside>' +
        '</div>' +
      '</div>';

    pintarImcGuardado();
    NM.imc.montar({
      form: $('#u-imc-form'),
      resultado: $('#u-imc-salida'),
      inicial: { estatura: u.estatura, peso: u.peso },
      mostrarInicial: true,
      alCalcular: function (r) {
        store.actualizarUsuario({
          estatura: r.estatura, peso: r.peso,
          ultimoImc: { valor: r.valor, fecha: F.hoyISO() }
        });
        pintarImcGuardado();
        ui.toast('Guardamos tu resultado: IMC ' + ui.decimal(r.valor) + ' (' + r.categoria.nombre.toLowerCase() + ').');
      },
      alObjetivo: function (obj) { location.hash = '#buscar?objetivo=' + obj; }
    });
    $('#btn-anuncio').addEventListener('click', function () {
      ui.toast('Es un anuncio de ejemplo: en la versión real llevaría al sitio del anunciante.', 'info');
    });
  }

  function pintarImcGuardado() {
    var el = $('#imc-guardado');
    var u = store.usuario();
    if (!el) return;
    if (!u.ultimoImc) { el.textContent = 'Aún no tienes un resultado guardado.'; return; }
    var cat = NM.imc.categoria(u.ultimoImc.valor);
    el.innerHTML = 'Último resultado guardado: <strong>' + ui.decimal(u.ultimoImc.valor) + '</strong> (' + esc(cat.nombre) + '), ' + esc(F.relativo(u.ultimoImc.fecha).toLowerCase());
  }

  /* =====================================================================
     2. BUSCAR
     ===================================================================== */
  function vistaBuscar(c, ruta) {
    if (ruta.params.objetivo !== undefined) {
      filtros.objetivo = store.objetivo(ruta.params.objetivo) ? ruta.params.objetivo : '';
    }
    var zonas = D.CONFIG.zonas;

    c.innerHTML =
      '<div class="vista-cabeza"><div><h1>Buscar nutriólogos</h1><p>Filtra por tu objetivo y compara calificación, cercanía y precio.</p></div></div>' +
      '<div class="buscar-rejilla">' +
        '<aside class="panel filtros" id="filtros" aria-label="Filtros de búsqueda">' +
          '<div class="filtros-cabeza">' +
            '<h2>' + ic('filtro') + 'Filtros</h2>' +
            '<button type="button" class="btn btn-secundario btn-sm btn-filtros-movil" id="btn-filtros" aria-expanded="false" aria-controls="filtros-cuerpo">Mostrar</button>' +
          '</div>' +
          '<form class="filtros-cuerpo" id="filtros-cuerpo" novalidate>' +
            '<fieldset class="chips-check"><legend>Objetivo o especialidad</legend>' +
              '<label class="chip-check"><input type="radio" name="objetivo" value=""' + (filtros.objetivo === '' ? ' checked' : '') + '><span>Todos</span></label>' +
              D.OBJETIVOS.map(function (o) {
                return '<label class="chip-check"><input type="radio" name="objetivo" value="' + o.id + '"' + (filtros.objetivo === o.id ? ' checked' : '') + '><span>' + ic(o.id) + esc(o.nombre) + '</span></label>';
              }).join('') +
            '</fieldset>' +
            '<div class="campo"><label for="f-calif">Calificación mínima</label><select id="f-calif" name="califMin">' +
              [[0, 'Cualquiera'], [4, '4.0 o más'], [4.5, '4.5 o más'], [4.8, '4.8 o más']].map(function (o) {
                return '<option value="' + o[0] + '"' + (filtros.califMin === o[0] ? ' selected' : '') + '>' + o[1] + '</option>';
              }).join('') + '</select></div>' +
            '<div class="campo"><label for="f-zona">Ciudad o zona</label><select id="f-zona" name="zona"><option value="">Todas</option>' +
              zonas.map(function (z) { return '<option' + (filtros.zona === z ? ' selected' : '') + '>' + esc(z) + '</option>'; }).join('') + '</select></div>' +
            '<div class="campo"><label for="f-dist" class="fila-entre"><span>Distancia máxima</span><output class="rango-valor" id="o-dist" for="f-dist"></output></label>' +
              '<input id="f-dist" name="distMax" type="range" min="1" max="12" step="0.5" value="' + filtros.distMax + '"></div>' +
            '<div class="campo"><label for="f-precio" class="fila-entre"><span>Precio máximo</span><output class="rango-valor" id="o-precio" for="f-precio"></output></label>' +
              '<input id="f-precio" name="precioMax" type="range" min="300" max="700" step="50" value="' + filtros.precioMax + '"></div>' +
            '<label class="interruptor"><input type="checkbox" name="soloVerificados"' + (filtros.soloVerificados ? ' checked' : '') + '><span class="pista"></span>Solo verificados</label>' +
            '<div class="ubicacion-caja' + (filtros.ubicacion ? ' ubicacion-activa' : '') + '" id="ubicacion-caja">' +
              '<button type="button" class="btn btn-secundario btn-sm" id="btn-ubicacion">' + ic('mira') + (filtros.ubicacion ? 'Ubicación activa' : 'Usar mi ubicación') + '</button>' +
              '<p id="ubicacion-texto">' + ic('ubicacion') + (filtros.ubicacion ? 'Ubicación de ejemplo: ' + esc(D.CONFIG.ubicacionDemo.nombre) : 'Las distancias se miden desde ' + esc(D.CONFIG.ubicacionDemo.nombre) + '.') + '</p>' +
            '</div>' +
            '<button type="button" class="btn btn-fantasma btn-sm" id="btn-limpiar">' + ic('reiniciar') + 'Limpiar filtros</button>' +
          '</form>' +
        '</aside>' +
        '<section aria-labelledby="t-resultados">' +
          '<div class="resultados-cabeza">' +
            '<p id="t-resultados" aria-live="polite"></p>' +
            '<div class="campo"><label for="f-orden">Ordenar por</label><select id="f-orden">' +
              [['calificacion', 'Mejor calificados'], ['distancia', 'Más cercanos'], ['precio', 'Menor precio']].map(function (o) {
                return '<option value="' + o[0] + '"' + (filtros.orden === o[0] ? ' selected' : '') + '>' + o[1] + '</option>';
              }).join('') + '</select></div>' +
          '</div>' +
          '<div class="filtros-activos" id="filtros-activos"></div>' +
          '<div class="rejilla-tarjetas" id="resultados"></div>' +
        '</section>' +
      '</div>';

    var form = $('#filtros-cuerpo');
    form.addEventListener('input', leerFiltros);
    form.addEventListener('change', leerFiltros);
    $('#f-orden').addEventListener('change', function () { filtros.orden = this.value; pintarResultados(); });
    $('#btn-filtros').addEventListener('click', function () {
      var abierto = $('#filtros').classList.toggle('abiertos');
      this.setAttribute('aria-expanded', abierto);
      this.textContent = abierto ? 'Ocultar' : 'Mostrar';
    });
    $('#btn-ubicacion').addEventListener('click', usarUbicacion);
    $('#btn-limpiar').addEventListener('click', function () {
      filtros = copiar(FILTROS_BASE);
      actualizarHash();
      vistaBuscar(c, { params: {} });
      ui.toast('Filtros restablecidos.', 'info');
    });
    $('#filtros-activos').addEventListener('click', function (e) {
      var b = e.target.closest('[data-quitar]');
      if (!b) return;
      var k = b.getAttribute('data-quitar');
      filtros[k] = FILTROS_BASE[k];
      if (k === 'objetivo') actualizarHash();
      vistaBuscar(c, { params: {} });
    });
    pintarSalidas();
    pintarResultados(true);
  }

  function leerFiltros() {
    var form = $('#filtros-cuerpo');
    var obj = form.querySelector('[name=objetivo]:checked');
    var antes = filtros.objetivo;
    filtros.objetivo = obj ? obj.value : '';
    filtros.califMin = parseFloat(form.querySelector('[name=califMin]').value);
    filtros.zona = form.querySelector('[name=zona]').value;
    filtros.distMax = parseFloat(form.querySelector('[name=distMax]').value);
    filtros.precioMax = parseFloat(form.querySelector('[name=precioMax]').value);
    filtros.soloVerificados = form.querySelector('[name=soloVerificados]').checked;
    if (antes !== filtros.objetivo) actualizarHash();
    pintarSalidas();
    pintarResultados();
  }

  function actualizarHash() {
    var h = '#buscar' + (filtros.objetivo ? '?objetivo=' + filtros.objetivo : '');
    history.replaceState(null, '', h);
  }

  function pintarSalidas() {
    $('#o-dist').textContent = (filtros.distMax >= 12 ? 'Sin límite' : ui.decimal(filtros.distMax) + ' km');
    $('#o-precio').textContent = filtros.precioMax >= 700 ? 'Sin límite' : ui.dinero(filtros.precioMax);
  }

  function usarUbicacion() {
    var b = $('#btn-ubicacion');
    b.disabled = true;
    b.innerHTML = ic('mira') + 'Buscando…';
    setTimeout(function () {
      filtros.ubicacion = true;
      filtros.orden = 'distancia';
      $('#f-orden').value = 'distancia';
      b.disabled = false;
      b.innerHTML = ic('mira') + 'Ubicación activa';
      $('#ubicacion-caja').classList.add('ubicacion-activa');
      $('#ubicacion-texto').innerHTML = ic('ubicacion') + 'Ubicación de ejemplo: ' + esc(D.CONFIG.ubicacionDemo.nombre);
      pintarResultados();
      ui.toast('Usamos una ubicación de ejemplo (' + D.CONFIG.ubicacionDemo.nombre + '). Ordenamos por cercanía.', 'info');
    }, ui.reducirMovimiento ? 0 : 700);
  }

  function filtrar() {
    return nutrisVisibles().filter(function (n) {
      var c = store.calificacion(n.id);
      if (filtros.soloVerificados && n.verificacion.estado !== 'verificado') return false;
      if (filtros.objetivo && n.especialidades.indexOf(filtros.objetivo) === -1) return false;
      if (filtros.califMin && c.promedio < filtros.califMin) return false;
      if (filtros.zona && n.zona !== filtros.zona) return false;
      if (filtros.distMax < 12 && n.distanciaKm > filtros.distMax) return false;
      if (filtros.precioMax < 700 && n.precio > filtros.precioMax) return false;
      return true;
    }).sort(function (a, b) {
      if (filtros.orden === 'distancia') return a.distanciaKm - b.distanciaKm;
      if (filtros.orden === 'precio') return a.precio - b.precio;
      var ca = store.calificacion(a.id), cb = store.calificacion(b.id);
      return cb.promedio - ca.promedio || cb.total - ca.total;
    });
  }

  function pintarResultados() {
    var lista = filtrar();
    var cont = $('#resultados');
    $('#t-resultados').textContent = lista.length + (lista.length === 1 ? ' nutriólogo encontrado' : ' nutriólogos encontrados');

    // Pastillas de filtros activos
    var p = [];
    if (filtros.objetivo) p.push(['objetivo', store.objetivo(filtros.objetivo).nombre]);
    if (filtros.califMin) p.push(['califMin', ui.decimal(filtros.califMin) + '+ estrellas']);
    if (filtros.zona) p.push(['zona', filtros.zona]);
    if (filtros.distMax < 12) p.push(['distMax', 'Hasta ' + ui.decimal(filtros.distMax) + ' km']);
    if (filtros.precioMax < 700) p.push(['precioMax', 'Hasta ' + ui.dinero(filtros.precioMax)]);
    if (!filtros.soloVerificados) p.push(['soloVerificados', 'Incluye en revisión']);
    $('#filtros-activos').innerHTML = p.map(function (x) {
      return '<button type="button" class="filtro-pill" data-quitar="' + x[0] + '" aria-label="Quitar filtro ' + esc(x[1]) + '">' + esc(x[1]) + ic('cerrar') + '</button>';
    }).join('');

    if (!lista.length) {
      cont.removeAttribute('data-escalonar');
      cont.innerHTML = '<div style="grid-column:1/-1">' + vacio('buscar', 'Ningún nutriólogo coincide', 'Prueba con otra zona, sube el precio máximo o quita algún filtro.',
        '<button type="button" class="btn btn-primario" id="vacio-limpiar">Limpiar filtros</button>') + '</div>';
      $('#vacio-limpiar').addEventListener('click', function () { $('#btn-limpiar').click(); });
      return;
    }
    cont.setAttribute('data-escalonar', '');
    cont.innerHTML = lista.map(function (n, i) { return ui.tarjetaNutriologo(n, { indice: i }); }).join('');
    ui.escalonar(cont.parentNode);
  }

  /* =====================================================================
     3. PERFIL DEL NUTRIÓLOGO + AGENDAR
     ===================================================================== */
  var NOMBRES_DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  function textoHorario(h) {
    var dias = h.dias.slice().sort();
    var nombres = dias.map(function (d) { return NOMBRES_DIAS[d].slice(0, 3); });
    var consecutivos = dias.every(function (d, i) { return i === 0 || d === dias[i - 1] + 1; });
    var tDias = consecutivos && dias.length > 2 ? cap(NOMBRES_DIAS[dias[0]]) + ' a ' + NOMBRES_DIAS[dias[dias.length - 1]] : nombres.map(cap).join(', ');
    var tHoras = h.bloques.map(function (b) { return b[0] + ':00 a ' + b[1] + ':00'; }).join(' y ');
    return tDias + ', ' + tHoras;
  }
  function cap(t) { return t.charAt(0).toUpperCase() + t.slice(1); }

  function vistaPerfil(c, ruta) {
    var n = store.nutriologo(ruta.id);
    if (!n) {
      c.innerHTML = '<a class="migas" href="#buscar">' + ic('izq') + 'Volver a la búsqueda</a>' +
        vacio('usuario', 'No encontramos este perfil', 'Puede que el enlace esté incompleto. Regresa a la búsqueda para ver los nutriólogos disponibles.', '<a class="btn btn-primario" href="#buscar">Buscar nutriólogos</a>');
      return;
    }
    if (reserva.nutriId !== n.id) reserva = { nutriId: n.id, fecha: null, hora: null };
    var cal = store.calificacion(n.id);
    var resenas = store.resenasDe(n.id);

    c.innerHTML =
      '<a class="migas" href="#buscar">' + ic('izq') + 'Volver a la búsqueda</a>' +
      '<section class="perfil-cabeza">' +
        ui.avatar(n.nombre, 'xl', n.tono) +
        '<div>' +
          '<h1>' + esc(n.nombre) + '</h1>' +
          '<div class="sub">' +
            '<span>' + esc(n.titulo) + '</span>' + ui.insigniaVerificado(n) +
            '<span>' + ic('escudo') + 'Cédula ' + esc(ui.cedulaOculta(n.cedula)) + '</span>' +
            '<span>' + ic('reloj') + n.experiencia + ' años de experiencia</span>' +
          '</div>' +
          '<div class="sub" style="margin-top:10px">' + ui.estrellas(cal.promedio, { clase: 'grande' }) +
            '<strong style="color:var(--tinta);font-size:1.05rem">' + ui.decimal(cal.promedio) + '</strong><span>' + cal.total + ' reseñas</span></div>' +
        '</div>' +
        '<div class="perfil-precio"><small>Consulta</small><p class="monto">' + ui.dinero(n.precio) + '</p><small>MXN por consulta</small>' +
          '<a class="btn btn-primario" href="#agendar" id="ir-agendar">' + ic('calendario') + 'Agendar cita</a></div>' +
      '</section>' +
      (n.verificacion.estado !== 'verificado' ? '<p class="nota-demo mt-2">' + ic('alerta') + '<span>La cédula de este nutriólogo está en revisión. Aparece solo cuando desactivas el filtro "Solo verificados".</span></p>' : '') +
      '<div class="perfil-rejilla">' +
        '<div class="pila">' +
          '<section class="panel" aria-labelledby="t-sobre">' +
            '<div class="panel-cabeza"><h2 id="t-sobre">Sobre mí</h2></div>' +
            '<p class="bio">' + esc(n.bio) + '</p>' +
            '<div class="tn-chips mt-2">' + n.especialidades.map(function (e) { return ui.chipObjetivo(e); }).join('') + '</div>' +
            '<dl class="datos-lista">' +
              '<div><dt>' + ic('ubicacion') + '</dt><dd><strong>Ubicación</strong>' + esc(n.direccion) + ' <span class="texto-suave">(' + esc(n.zona) + ', a ' + ui.decimal(n.distanciaKm) + ' km)</span></dd></div>' +
              '<div><dt>' + ic('reloj') + '</dt><dd><strong>Horario de atención</strong>' + esc(textoHorario(n.horario)) + '</dd></div>' +
              '<div><dt>' + ic('usuarios') + '</dt><dd><strong>Modalidad</strong>' + esc(n.modalidad) + '</dd></div>' +
              '<div><dt>' + ic('escudo') + '</dt><dd><strong>Cédula profesional</strong>' + esc(ui.cedulaOculta(n.cedula)) +
                (n.verificacion.estado === 'verificado' ? ' <span class="texto-suave">verificada el ' + esc(F.formatear(n.verificacion.fecha)) + '</span>' : ' <span class="texto-suave">en revisión</span>') + '</dd></div>' +
            '</dl>' +
          '</section>' +
          '<section class="panel" aria-labelledby="t-resenas">' +
            '<div class="panel-cabeza"><h2 id="t-resenas">Reseñas</h2></div>' +
            htmlResumenCalif(resenas) +
            '<ul class="lista-resenas mt-3">' + resenas.map(htmlResena).join('') + '</ul>' +
          '</section>' +
        '</div>' +
        '<div class="columna-agenda">' +
          '<section class="panel" id="agendar" aria-labelledby="t-agendar" tabindex="-1">' +
            '<div class="panel-cabeza"><h2 id="t-agendar">Agenda tu cita</h2><span class="texto-suave" style="font-size:.85rem">Próximos 7 días</span></div>' +
            '<div id="agenda"></div>' +
          '</section>' +
        '</div>' +
      '</div>';

    $('#ir-agendar').addEventListener('click', function (e) {
      e.preventDefault();
      var a = $('#agendar');
      a.scrollIntoView({ behavior: ui.reducirMovimiento ? 'auto' : 'smooth', block: 'start' });
      a.focus({ preventScroll: true });
    });
    pintarAgenda(n);
  }

  var htmlResumenCalif = ui.resumenCalificacion;
  var htmlResena = ui.resenaItem;

  function pintarAgenda(n) {
    var cont = $('#agenda');
    if (!cont) return;
    var dias = store.disponibilidad(n.id, 7);
    if (!reserva.fecha) {
      var primero = dias.filter(function (d) { return d.horas.some(function (h) { return !h.ocupada; }); })[0];
      reserva.fecha = primero ? primero.fecha : dias[0].fecha;
    }
    var dia = dias.filter(function (d) { return d.fecha === reserva.fecha; })[0] || dias[0];

    var htmlDias = '<div class="dias" role="group" aria-label="Elige un día">' + dias.map(function (d) {
      var libres = d.horas.filter(function (h) { return !h.ocupada; }).length;
      var f = F.deISO(d.fecha);
      var etiqueta = F.formatoLargo(d.fecha) + ', ' + (libres ? libres + ' horarios libres' : 'sin horarios');
      return '<button type="button" class="dia-btn" data-fecha="' + d.fecha + '" aria-pressed="' + (d.fecha === dia.fecha) + '"' + (libres ? '' : ' disabled') + ' aria-label="' + esc(etiqueta) + '">' +
        '<span class="ds">' + (F.diferenciaDias(F.hoyISO(), d.fecha) === 0 ? 'Hoy' : f.toLocaleDateString('es-MX', { weekday: 'short' })) + '</span>' +
        '<span class="dn">' + f.getDate() + '</span><span class="dl">' + (libres ? libres + ' libres' : 'Sin horario') + '</span></button>';
    }).join('') + '</div>';

    var htmlHoras = dia.horas.length
      ? '<div class="horas" role="group" aria-label="Horarios del ' + esc(F.formatoLargo(dia.fecha)) + '">' + dia.horas.map(function (h, i) {
          var sel = reserva.hora === h.hora && reserva.fecha === dia.fecha;
          return '<button type="button" class="hora-btn" style="--i:' + i + '" data-hora="' + h.hora + '"' + (h.ocupada ? ' disabled aria-label="' + h.hora + ', ocupado"' : ' aria-pressed="' + sel + '"') + '>' + h.hora + '</button>';
        }).join('') + '</div>'
      : '<p class="sin-horas">Sin horarios disponibles este día.</p>';

    var leyenda = '<div class="leyenda" aria-hidden="true"><span><i></i>Disponible</span><span><i class="ocup"></i>Ocupado</span><span><i class="sel"></i>Tu elección</span></div>';

    var htmlForm = '';
    if (reserva.hora) {
      htmlForm =
        '<div class="reserva-resumen">' + ic('calendario') + '<div><strong>' + esc(F.formatoLargo(reserva.fecha)) + ' a las ' + reserva.hora + '</strong><br><span class="texto-suave">Consulta de 1 hora, ' + ui.dinero(n.precio) + ' MXN</span></div></div>' +
        '<form class="form-reserva" id="form-reserva" novalidate>' +
          '<div class="campo"><label for="r-motivo">Tu objetivo o motivo de consulta</label>' +
            '<textarea id="r-motivo" name="motivo" maxlength="240" placeholder="Ej. Quiero bajar de peso sin dejar de comer con mi familia.">' + esc(reserva.motivo || '') + '</textarea>' +
            '<span class="ayuda">Lo verá solo tu nutriólogo.</span></div>' +
          '<div class="campo"><label class="check-linea"><input type="checkbox" id="r-privacidad" name="privacidad"' + (reserva.privacidad ? ' checked' : '') + '><span>Leí y acepto el <button type="button" class="enlace-btn" id="ver-aviso">aviso de privacidad</button>.</span></label></div>' +
          '<button type="submit" class="btn btn-primario btn-lg btn-bloque">' + ic('check') + 'Confirmar cita</button>' +
        '</form>';
    } else {
      htmlForm = '<p class="texto-suave mt-2" style="font-size:.9rem">Elige un horario disponible para continuar.</p>';
    }

    cont.innerHTML = htmlDias + htmlHoras + leyenda + htmlForm;

    $$('.dia-btn', cont).forEach(function (b) {
      b.addEventListener('click', function () {
        reserva.fecha = b.getAttribute('data-fecha');
        reserva.hora = null;
        pintarAgenda(n);
        var x = cont.querySelector('.dia-btn[data-fecha="' + reserva.fecha + '"]');
        if (x) x.focus();
      });
    });
    $$('.hora-btn:not([disabled])', cont).forEach(function (b) {
      b.addEventListener('click', function () {
        guardarBorrador();
        reserva.hora = b.getAttribute('data-hora');
        pintarAgenda(n);
        var x = cont.querySelector('.hora-btn[data-hora="' + reserva.hora + '"]');
        if (x) x.focus();
      });
    });
    var form = $('#form-reserva');
    if (form) {
      $('#ver-aviso').addEventListener('click', function (e) { e.preventDefault(); abrirAviso(); });
      $('#r-motivo').addEventListener('input', function () { ui.errorCampo(this, null); reserva.motivo = this.value; });
      $('#r-privacidad').addEventListener('change', function () { ui.errorCampo(this, null); reserva.privacidad = this.checked; });
      form.addEventListener('submit', function (e) { e.preventDefault(); confirmarReserva(n); });
    }
  }

  function guardarBorrador() {
    var m = $('#r-motivo'), p = $('#r-privacidad');
    if (m) reserva.motivo = m.value;
    if (p) reserva.privacidad = p.checked;
  }

  function abrirAviso() {
    var m = ui.modal({
      titulo: 'Aviso de privacidad (ejemplo)',
      clase: 'modal-ancho',
      contenido:
        '<div class="aviso-privacidad">' +
          '<p class="nota-demo">' + ic('info') + '<span>Texto de ejemplo para un prototipo escolar, inspirado en la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP). No es un aviso legal real.</span></p>' +
          '<h3>Responsable</h3><p>NutriMatch (proyecto escolar, empresa ficticia), con domicilio en Tepic, Nayarit, es responsable del tratamiento de tus datos personales.</p>' +
          '<h3>Datos que usamos</h3><ul><li>Nombre, correo y teléfono.</li><li>Edad, peso, estatura e IMC.</li><li>Tu objetivo o motivo de consulta.</li></ul>' +
          '<p class="mt-1">El peso, la estatura y el motivo de consulta son <strong>datos sensibles</strong> de salud; los tratamos solo con tu consentimiento expreso.</p>' +
          '<h3>Para qué los usamos</h3><ul><li>Agendar tu cita y compartirla con el nutriólogo que elegiste.</li><li>Que tu nutriólogo lleve tu expediente y seguimiento.</li><li>Enviarte recordatorios de tus citas.</li></ul>' +
          '<h3>Tus derechos ARCO</h3><p>Puedes acceder, rectificar, cancelar u oponerte al uso de tus datos, y revocar tu consentimiento, escribiendo a privacidad@nutrimatch.example (correo ficticio).</p>' +
        '</div>',
      pie: '<button type="button" class="btn btn-fantasma" data-cerrar>Cerrar</button><button type="button" class="btn btn-primario" id="aceptar-aviso">Acepto el aviso</button>'
    });
    $('#aceptar-aviso', m.el).addEventListener('click', function () {
      var p = $('#r-privacidad');
      if (p) { p.checked = true; reserva.privacidad = true; ui.errorCampo(p, null); }
      m.cerrar(true);
    });
  }

  function confirmarReserva(n) {
    var motivo = $('#r-motivo');
    var priv = $('#r-privacidad');
    var ok = true;
    var texto = motivo.value.trim();
    if (texto.length < 5) { ui.errorCampo(motivo, 'Cuéntale a tu nutriólogo tu objetivo (mínimo 5 caracteres).'); ok = false; }
    if (!priv.checked) { ui.errorCampo(priv, 'Acepta el aviso de privacidad para agendar.'); ok = false; }
    if (!ok) { (texto.length < 5 ? motivo : priv).focus(); return; }

    if (store.horarioOcupado(n.id, reserva.fecha, reserva.hora)) {
      ui.toast('Ese horario se acaba de ocupar. Elige otro.', 'error');
      reserva.hora = null; pintarAgenda(n); return;
    }
    var choque = store.citasDeUsuario().some(function (c) {
      return c.fecha === reserva.fecha && c.hora === reserva.hora && c.estado !== 'cancelada';
    });
    if (choque) { ui.toast('Ya tienes otra cita a esa misma hora. Elige otro horario.', 'error'); return; }

    var cita = store.agregarCita({
      nutriologoId: n.id, pacienteId: store.usuario().pacienteId,
      fecha: reserva.fecha, hora: reserva.hora, motivo: texto, estado: 'pendiente', origen: 'usuario'
    });
    var cuando = F.formatoLargo(cita.fecha) + ' a las ' + cita.hora;
    reserva = { nutriId: null, fecha: null, hora: null };

    var m = ui.modal({
      titulo: 'Cita solicitada',
      clase: 'modal-chico',
      contenido: ui.exitoAnimado('¡Listo, ' + primerNombre() + '!', 'Tu cita con <strong>' + esc(n.nombre) + '</strong> para el <strong>' + esc(cuando.toLowerCase()) + '</strong> quedó <strong>pendiente</strong> de confirmación.' +
        (n.id === 1 ? '<br><br><span class="texto-suave">Tip de demo: entra como nutriólogo para verla en la agenda.</span>' : '')),
      pie: '<button type="button" class="btn btn-fantasma" data-cerrar>Seguir buscando</button><a class="btn btn-primario" href="#citas" id="ir-citas">Ver mis citas</a>',
      alCerrar: function () {}
    });
    try { sessionStorage.setItem('nutrimatch.recien', cita.id); } catch (e) {}
    $('#ir-citas', m.el).addEventListener('click', function () { m.cerrar(true); });
    $$('[data-cerrar]', m.el).forEach(function (b) { b.addEventListener('click', function () { location.hash = '#buscar'; }); });
    pintarAgenda(n);
  }

  /* =====================================================================
     4. MIS CITAS
     ===================================================================== */
  function vistaCitas(c, ruta) {
    if (ruta.params.pestana) pestanaCitas = ruta.params.pestana === 'pasadas' ? 'pasadas' : 'proximas';
    var prox = proximasCitas();
    var pas = pasadasCitas();

    c.innerHTML =
      '<div class="vista-cabeza"><div><h1>Mis citas</h1><p>Consulta tus próximas citas, cancela si no puedes asistir y califica a tu nutriólogo después de la consulta.</p></div></div>' +
      '<div class="segmentado" role="tablist" aria-label="Tipo de citas" id="seg-citas">' +
        '<span class="seg-fondo" aria-hidden="true"></span>' +
        '<button type="button" role="tab" id="tab-proximas" aria-controls="panel-citas" aria-selected="' + (pestanaCitas === 'proximas') + '" data-p="proximas">Próximas<span class="cuenta">' + prox.length + '</span></button>' +
        '<button type="button" role="tab" id="tab-pasadas" aria-controls="panel-citas" aria-selected="' + (pestanaCitas === 'pasadas') + '" data-p="pasadas">Pasadas<span class="cuenta">' + pas.length + '</span></button>' +
      '</div>' +
      '<div id="panel-citas" role="tabpanel" class="mt-3" aria-labelledby="tab-' + pestanaCitas + '"></div>';

    var seg = $('#seg-citas');
    function moverSeg() {
      var b = seg.querySelector('[aria-selected="true"]');
      var f = seg.querySelector('.seg-fondo');
      f.style.width = b.offsetWidth + 'px';
      f.style.transform = 'translateX(' + (b.offsetLeft) + 'px)';
    }
    $$('[role=tab]', seg).forEach(function (b) {
      b.addEventListener('click', function () {
        pestanaCitas = b.getAttribute('data-p');
        $$('[role=tab]', seg).forEach(function (x) { x.setAttribute('aria-selected', x === b); });
        $('#panel-citas').setAttribute('aria-labelledby', b.id);
        moverSeg();
        pintarListaCitas(true);
      });
      b.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
          var otro = $$('[role=tab]', seg).filter(function (x) { return x !== b; })[0];
          otro.focus(); otro.click();
        }
      });
    });
    requestAnimationFrame(moverSeg);
    pintarListaCitas(false);
  }

  function pintarListaCitas(animar) {
    var panel = $('#panel-citas');
    var lista = pestanaCitas === 'proximas' ? proximasCitas() : pasadasCitas();
    var recien = null;
    try { recien = sessionStorage.getItem('nutrimatch.recien'); sessionStorage.removeItem('nutrimatch.recien'); } catch (e) {}

    if (!lista.length) {
      panel.innerHTML = pestanaCitas === 'proximas'
        ? vacio('calendario', 'No tienes citas próximas', 'Encuentra un nutriólogo para tu objetivo y elige el horario que te acomode.', '<a class="btn btn-primario" href="#buscar">Buscar nutriólogos</a>')
        : vacio('reloj', 'Aún no tienes citas pasadas', 'Aquí aparecerán tus consultas completadas para que puedas calificarlas.');
      return;
    }
    panel.innerHTML = '<ul class="lista-citas" data-escalonar>' + lista.map(function (cita) {
      var n = store.nutriologo(cita.nutriologoId);
      var acciones = '';
      if (pestanaCitas === 'proximas') {
        acciones = '<a class="btn btn-secundario btn-sm" href="#perfil/' + n.id + '">Ver perfil</a>' +
          '<button type="button" class="btn btn-fantasma btn-sm" data-cancelar="' + cita.id + '">' + ic('cerrar') + 'Cancelar</button>';
      } else if (cita.estado === 'completada' && !cita.calificada) {
        acciones = '<button type="button" class="btn btn-naranja btn-sm" data-calificar="' + cita.id + '">' + ic('estrella') + 'Calificar</button>';
      } else if (cita.calificada) {
        var r = store.estado().resenas.filter(function (x) { return x.citaId === cita.id; })[0];
        acciones = '<span class="fila texto-suave" style="font-size:.85rem;gap:6px">' + ic('check') + 'Calificada' + (r ? ' ' + ui.estrellas(r.calificacion) : '') + '</span>';
      } else if (cita.estado !== 'cancelada') {
        acciones = '<span class="texto-suave" style="font-size:.85rem">Esperando que el nutriólogo la marque como completada</span>';
      }
      return '<li class="cita' + (cita.estado === 'cancelada' ? ' es-cancelada' : '') + (cita.id === recien ? ' recien' : '') + '">' +
        cajaFecha(cita.fecha) +
        '<div class="cita-info">' +
          '<h3>' + esc(n.nombre) + ' ' + etiquetaEstado(cita.estado) + '</h3>' +
          '<div class="cita-meta"><span>' + ic('reloj') + esc(F.relativo(cita.fecha)) + ', ' + cita.hora + '</span><span>' + ic('ubicacion') + esc(n.zona) + '</span><span>' + ic('billete') + ui.dinero(n.precio) + '</span></div>' +
          '<p class="cita-motivo">' + esc(cita.motivo) + '</p>' +
        '</div>' +
        '<div class="cita-acciones">' + acciones + '</div>' +
      '</li>';
    }).join('') + '</ul>';
    ui.escalonar(panel);

    $$('[data-cancelar]', panel).forEach(function (b) {
      b.addEventListener('click', function () { cancelarCita(b.getAttribute('data-cancelar')); });
    });
    $$('[data-calificar]', panel).forEach(function (b) {
      b.addEventListener('click', function () { calificar(b.getAttribute('data-calificar')); });
    });
  }

  function cancelarCita(id) {
    var cita = store.cita(id);
    var n = store.nutriologo(cita.nutriologoId);
    ui.confirmar({
      titulo: 'Cancelar cita',
      mensaje: '¿Cancelar tu cita del ' + F.formatoLargo(cita.fecha).toLowerCase() + ' a las ' + cita.hora + ' con ' + n.nombre + '? El horario quedará libre para otra persona.',
      aceptar: 'Cancelar cita', cancelar: 'Conservar cita', peligro: true
    }).then(function (ok) {
      if (!ok) return;
      store.actualizarCita(id, { estado: 'cancelada' });
      ui.toast('Cita cancelada. Avisamos a ' + n.nombre.split(' ').slice(0, 2).join(' ') + '.');
      vistaCitas(vista, { params: {} });
    });
  }

  var TEXTOS_CALIF = ['', 'Mala', 'Regular', 'Buena', 'Muy buena', 'Excelente'];
  function calificar(id) {
    var cita = store.cita(id);
    var n = store.nutriologo(cita.nutriologoId);
    var estrellas = '';
    for (var i = 5; i >= 1; i--) {
      estrellas += '<input type="radio" name="calif" id="calif-' + i + '" value="' + i + '"><label for="calif-' + i + '" aria-label="' + i + (i === 1 ? ' estrella' : ' estrellas') + ', ' + TEXTOS_CALIF[i] + '">' + ic('estrella') + '</label>';
    }
    var m = ui.modal({
      titulo: 'Califica tu consulta',
      contenido:
        '<form id="form-calif" class="pila" novalidate style="gap:18px">' +
          '<div class="fila">' + ui.avatar(n.nombre, 'md', n.tono) + '<div><strong>' + esc(n.nombre) + '</strong><br><span class="texto-suave" style="font-size:.88rem">Consulta del ' + esc(F.formatoLargo(cita.fecha).toLowerCase()) + '</span></div></div>' +
          '<div class="campo"><fieldset class="selector-estrellas" id="sel-estrellas"><legend class="sr-only">Calificación de 1 a 5 estrellas</legend>' + estrellas + '</fieldset>' +
            '<p class="texto-calif" id="texto-calif" aria-live="polite">Elige de 1 a 5 estrellas</p></div>' +
          '<div class="campo"><label for="calif-comentario">Comentario</label><textarea id="calif-comentario" maxlength="280" placeholder="¿Qué te gustó? ¿Qué podría mejorar?"></textarea><span class="ayuda">Se publica con tu nombre abreviado. Solo puedes calificar una vez esta cita.</span></div>' +
        '</form>',
      pie: '<button type="button" class="btn btn-fantasma" data-cerrar>Ahora no</button><button type="submit" form="form-calif" class="btn btn-primario">Publicar reseña</button>'
    });
    var form = $('#form-calif', m.el);
    var sel = $('#sel-estrellas', m.el);
    sel.addEventListener('change', function () {
      var v = +(form.querySelector('[name=calif]:checked') || {}).value;
      $('#texto-calif', m.el).textContent = v ? v + (v === 1 ? ' estrella: ' : ' estrellas: ') + TEXTOS_CALIF[v] : '';
      ui.errorCampo(sel, null);
    });
    $('#calif-comentario', m.el).addEventListener('input', function () { ui.errorCampo(this, null); });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = form.querySelector('[name=calif]:checked');
      var com = $('#calif-comentario', m.el);
      var ok = true;
      if (!v) { ui.errorCampo(sel, 'Elige una calificación.'); ok = false; }
      if (com.value.trim().length < 8) { ui.errorCampo(com, 'Escribe un comentario de al menos 8 caracteres.'); ok = false; }
      if (!ok) return;
      var antes = store.calificacion(n.id).promedio;
      var r = store.calificarCita(id, +v.value, com.value.trim());
      if (!r) { ui.toast('Esta cita ya fue calificada.', 'error'); m.cerrar(); return; }
      var despues = store.calificacion(n.id).promedio;
      m.cerrar(true);
      ui.toast('Gracias. Tu reseña ya aparece en el perfil de ' + n.nombre.split(' ').slice(0, 2).join(' ') + ' (promedio ' + ui.decimal(antes) + ' → ' + ui.decimal(despues) + ').');
      vistaCitas(vista, { params: {} });
    });
  }

  /* =====================================================================
     5. MI PERFIL
     ===================================================================== */
  function vistaMiPerfil(c) {
    var u = store.usuario();
    var imc = u.peso && u.estatura ? NM.imc.calcular(u.estatura, u.peso) : null;
    var citasTot = store.citasDeUsuario().filter(function (x) { return x.estado === 'completada'; }).length;

    c.innerHTML =
      '<div class="vista-cabeza"><div><h1>Mi perfil</h1><p>Tus datos ayudan a tu nutriólogo a preparar la consulta.</p></div></div>' +
      '<div class="perfil-usuario-rejilla" data-escalonar>' +
        '<section class="panel" aria-labelledby="t-datos">' +
          '<div class="panel-cabeza"><h2 id="t-datos">Mis datos</h2></div>' +
          '<form id="form-perfil" novalidate>' +
            '<div class="rejilla-campos dos">' +
              '<div class="campo completo"><label for="p-nombre">Nombre completo</label><input id="p-nombre" name="nombre" autocomplete="name" value="' + esc(u.nombre) + '"></div>' +
              '<div class="campo"><label for="p-correo">Correo</label><input id="p-correo" value="' + esc(u.correo) + '" readonly aria-describedby="p-correo-ayuda"><span class="ayuda" id="p-correo-ayuda">Es el correo de la sesión de demo.</span></div>' +
              '<div class="campo"><label for="p-edad">Edad</label><div class="campo-unidad"><input id="p-edad" name="edad" type="number" inputmode="numeric" min="12" max="100" value="' + u.edad + '"><span class="unidad">años</span></div></div>' +
              '<div class="campo"><label for="p-peso">Peso</label><div class="campo-unidad"><input id="p-peso" name="peso" type="number" inputmode="decimal" step="0.1" min="30" max="300" value="' + u.peso + '"><span class="unidad">kg</span></div></div>' +
              '<div class="campo"><label for="p-est">Estatura</label><div class="campo-unidad"><input id="p-est" name="estatura" type="number" inputmode="decimal" step="0.1" min="100" max="250" value="' + u.estatura + '"><span class="unidad">cm</span></div></div>' +
            '</div>' +
            '<div class="fila mt-3"><button type="submit" class="btn btn-primario">' + ic('check') + 'Guardar cambios</button><span class="texto-suave" style="font-size:.86rem">Al guardar recalculamos tu IMC.</span></div>' +
          '</form>' +
        '</section>' +
        '<section class="panel tarjeta-yo" aria-labelledby="t-yo">' +
          ui.avatar(u.nombre, 'xl', 150) +
          '<h2 id="t-yo">' + esc(u.nombre) + '</h2>' +
          '<p class="texto-suave">' + citasTot + (citasTot === 1 ? ' consulta completada' : ' consultas completadas') + '</p>' +
          '<div class="mini-datos">' +
            '<div><strong>' + u.edad + '</strong><span>años</span></div>' +
            '<div><strong>' + ui.decimal(u.peso) + '</strong><span>kg</span></div>' +
            '<div><strong>' + (u.ultimoImc ? ui.decimal(u.ultimoImc.valor) : '–') + '</strong><span>último IMC</span></div>' +
          '</div>' +
          (imc ? '<div style="width:100%;text-align:left" class="mt-2">' + NM.imc.htmlResultado(imc, { sinBoton: true }) + '</div>' : '') +
        '</section>' +
      '</div>';

    var form = $('#form-perfil');
    $$('input', form).forEach(function (i) { i.addEventListener('input', function () { ui.errorCampo(i, null); }); });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var nombre = $('#p-nombre'), edad = $('#p-edad'), peso = $('#p-peso'), est = $('#p-est');
      var errores = NM.imc.validar(est.value, peso.value);
      var ok = true;
      if (nombre.value.trim().length < 3) { ui.errorCampo(nombre, 'Escribe tu nombre completo.'); ok = false; }
      var e2 = parseInt(edad.value, 10);
      if (isNaN(e2) || e2 < 12 || e2 > 100) { ui.errorCampo(edad, 'La edad debe estar entre 12 y 100 años.'); ok = false; }
      if (errores.peso) { ui.errorCampo(peso, errores.peso); ok = false; }
      if (errores.estatura) { ui.errorCampo(est, errores.estatura); ok = false; }
      if (!ok) { var primero = form.querySelector('[aria-invalid=true]'); if (primero) primero.focus(); return; }
      var r = NM.imc.calcular(parseFloat(est.value), parseFloat(peso.value));
      store.actualizarUsuario({
        nombre: nombre.value.trim(), edad: e2, peso: r.peso, estatura: r.estatura,
        ultimoImc: { valor: r.valor, fecha: F.hoyISO() }
      });
      pintarSesion();
      ui.toast('Perfil actualizado. Tu IMC ahora es ' + ui.decimal(r.valor) + '.');
      vistaMiPerfil(c);
      ui.escalonar(c);
    });
  }

  /* -------------------------------------------------------------- Arranque */
  pintarSesion();
  var router = ui.crearRouter({
    contenedor: vista,
    porDefecto: 'inicio',
    vistas: {
      'inicio': vistaInicio,
      'buscar': vistaBuscar,
      'perfil': vistaPerfil,
      'citas': vistaCitas,
      'mi-perfil': vistaMiPerfil
    },
    alCambiar: function (ruta) {
      marcarNavegacion(ruta);
      var t = { inicio: 'Inicio', buscar: 'Buscar nutriólogos', perfil: 'Perfil del nutriólogo', citas: 'Mis citas', 'mi-perfil': 'Mi perfil' }[ruta.vista] || 'Inicio';
      document.title = t + ' | NutriMatch';
    }
  });
  router.iniciar();
  // Si otra pestaña (p. ej. la vista de nutriólogo) cambia datos, refrescamos
  window.addEventListener('storage', function (e) {
    if (e.key && e.key.indexOf('nutrimatch.estado') === 0 && !document.querySelector('.modal-capa')) router.refrescar();
  });
})();
