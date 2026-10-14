/* =========================================================================
   NutriMatch — publico.js
   Página pública: cabecera, animación "match" del hero, IMC, planes y acceso.
   ========================================================================= */
(function () {
  'use strict';

  var ui = NM.ui, store = NM.store, D = NM_DATA;
  var $ = ui.$, $$ = ui.$$;

  /* ------------------------------------------------------------ Cabecera */
  var cabecera = $('#cabecera');
  function revisarScroll() { cabecera.classList.toggle('solida', window.scrollY > 24); }
  window.addEventListener('scroll', revisarScroll, { passive: true });
  revisarScroll();

  /* Si ya hay sesión, el botón lleva directo al panel */
  var rol = NM.auth.rolActual();
  if (rol) {
    var destino = NM.auth.paginaDe(rol);
    var texto = rol === 'nutriologo' ? 'Ir a mi consultorio' : 'Ir a mi panel';
    $('#cabecera-accion').innerHTML = '<a class="btn btn-secundario btn-entrar" href="' + destino + '">' + texto + '</a>';
    var heroBtn = $('[data-hero-accion]');
    if (heroBtn) {
      var a = document.createElement('a');
      a.className = heroBtn.className;
      a.href = destino;
      a.textContent = texto;
      heroBtn.replaceWith(a);
    }
  }

  /* ---------------------------------------------------- Hero: "match" */
  var PAREJAS = { 'bajar-peso': 1, 'ganar-masa': 5, 'deportiva': 2, 'enfermedades': 3, 'general': 6 };
  var listaObj = $('#match-objetivos');
  var cuerpo = $('#match-cuerpo');
  var hilo = $('#match-hilo');
  var match = $('#match');
  var indice = 0, temporizador = null;

  listaObj.innerHTML = D.OBJETIVOS.map(function (o, i) {
    return '<li class="match-obj" data-i="' + i + '"><span class="mo-ico">' + ui.icono(o.id) + '</span>' + ui.esc(o.nombre) + '</li>';
  }).join('');

  function proximoHorario(id) {
    var dias = store.disponibilidad(id, 7);
    for (var d = 0; d < dias.length; d++) {
      for (var h = 0; h < dias[d].horas.length; h++) {
        if (!dias[d].horas[h].ocupada) return NM.fechas.relativo(dias[d].fecha) + ', ' + dias[d].horas[h].hora;
      }
    }
    return 'Consulta su agenda';
  }

  function htmlTarjeta(n) {
    var c = store.calificacion(n.id);
    return '' +
      '<div class="mt-sello">' + ui.insigniaVerificado(n) + '</div>' +
      '<div class="mt-cabeza">' + ui.avatar(n.nombre, 'lg', n.tono) +
        '<div><h3>' + ui.esc(n.nombre) + '</h3><p>' + ui.esc(n.titulo) + '</p></div></div>' +
      '<div class="mt-calif">' + ui.estrellas(c.promedio) + '<strong>' + ui.decimal(c.promedio) + '</strong><span class="texto-suave">' + c.total + ' reseñas</span></div>' +
      '<div class="tn-chips">' + n.especialidades.map(function (e) { return ui.chipObjetivo(e); }).join('') + '</div>' +
      '<div class="mt-cita">' + ui.icono('calendario') + '<div><span>Próximo horario libre</span><strong>' + ui.esc(proximoHorario(n.id)) + '</strong></div></div>' +
      '<div class="mt-pie"><span>' + ui.esc(n.zona) + ', a ' + ui.decimal(n.distanciaKm) + ' km</span><strong>' + ui.dinero(n.precio) + '</strong></div>';
  }

  function dibujarHilo(animar) {
    var activo = listaObj.children[indice];
    var tarjeta = match.querySelector('.match-tarjeta');
    if (!activo || getComputedStyle(hilo).display === 'none') return;
    var base = match.getBoundingClientRect();
    var a = activo.getBoundingClientRect();
    var t = tarjeta.getBoundingClientRect();
    var x1 = a.right - base.left + 4, y1 = a.top + a.height / 2 - base.top;
    var x2 = t.left - base.left - 2, y2 = t.top + t.height / 2 - base.top;
    var mx = (x1 + x2) / 2;
    var d = 'M' + x1 + ' ' + y1 + ' C' + mx + ' ' + y1 + ', ' + mx + ' ' + y2 + ', ' + x2 + ' ' + y2;
    var path = hilo.querySelector('path');
    var punto = hilo.querySelector('circle');
    path.setAttribute('d', d);
    punto.setAttribute('cx', x2);
    punto.setAttribute('cy', y2);
    if (animar && !ui.reducirMovimiento && path.animate) {
      var largo = path.getTotalLength();
      path.animate([{ strokeDashoffset: largo, strokeDasharray: largo + ' ' + largo }, { strokeDashoffset: 0, strokeDasharray: largo + ' ' + largo }],
        { duration: 650, easing: 'cubic-bezier(.22,.8,.24,1)' });
      punto.animate([{ r: 0 }, { r: 0, offset: .7 }, { r: 6 }, { r: 4 }], { duration: 900, easing: 'ease-out' });
    }
  }

  function seleccionar(i, animar) {
    indice = i;
    var obj = D.OBJETIVOS[i];
    var n = store.nutriologo(PAREJAS[obj.id]);
    $$('.match-obj', listaObj).forEach(function (li, k) { li.classList.toggle('activo', k === i); });
    var pintar = function () {
      cuerpo.className = 'mt-cuerpo';
      cuerpo.innerHTML = htmlTarjeta(n);
      if (animar) { void cuerpo.offsetWidth; cuerpo.classList.add('entra'); }
      dibujarHilo(animar);
    };
    if (animar && !ui.reducirMovimiento && cuerpo.innerHTML) {
      cuerpo.classList.add('sale');
      setTimeout(pintar, 300);
    } else {
      pintar();
    }
    // En móvil, la pastilla activa se mantiene visible
    var li = listaObj.children[i];
    if (li && listaObj.scrollWidth > listaObj.clientWidth) {
      listaObj.scrollTo({ left: li.offsetLeft - 12, behavior: ui.reducirMovimiento ? 'auto' : 'smooth' });
    }
  }

  function ciclo() {
    clearInterval(temporizador);
    if (ui.reducirMovimiento) return;
    temporizador = setInterval(function () {
      if (document.hidden) return;
      seleccionar((indice + 1) % D.OBJETIVOS.length, true);
    }, 4200);
  }

  listaObj.addEventListener('click', function (e) {
    var li = e.target.closest('.match-obj');
    if (!li) return;
    seleccionar(+li.getAttribute('data-i'), true);
    ciclo();
  });
  match.addEventListener('mouseenter', function () { clearInterval(temporizador); });
  match.addEventListener('mouseleave', ciclo);
  window.addEventListener('resize', function () { dibujarHilo(false); });

  setTimeout(function () { seleccionar(0, true); ciclo(); }, ui.reducirMovimiento ? 0 : 450);

  /* ---------------------------------------------------------------- IMC */
  NM.imc.montar({
    form: $('#imc-form'),
    resultado: $('#imc-salida'),
    alObjetivo: function (objetivoId) {
      var hash = '#buscar?objetivo=' + objetivoId;
      if (NM.auth.rolActual() === 'usuario') {
        window.location.href = 'usuario.html' + hash;
        return;
      }
      store.guardarPendiente({ hash: hash });
      var o = store.objetivo(objetivoId);
      abrirAcceso({
        aviso: 'Inicia sesión como usuario para ver nutriólogos de "' + o.nombre + '". Te llevamos directo a los resultados.',
        correo: 'usuario@gmail.com'
      });
    }
  });

  /* ------------------------------------------------------------- Planes */
  (function pintarPlanes() {
    var mensual = D.CONFIG.planes[0];
    var mayorAhorro = D.CONFIG.planes.reduce(function (m, p) {
      var ah = mensual.precio * p.meses - p.precio;
      return ah > m.ah ? { id: p.id, ah: ah } : m;
    }, { id: null, ah: 0 }).id;

    $('#planes').innerHTML = D.CONFIG.planes.map(function (p, i) {
      var ahorro = mensual.precio * p.meses - p.precio;
      var porMes = Math.round(p.precio / p.meses);
      var destacado = p.id === mayorAhorro;
      return '<article class="plan' + (destacado ? ' destacado' : '') + '" data-revelar style="--retraso:' + (i * 0.08) + 's">' +
        (destacado ? '<span class="plan-cinta">Mayor ahorro</span>' : '') +
        '<div><h3>' + ui.esc(p.nombre) + '</h3><p class="plan-detalle">' + p.meses + (p.meses === 1 ? ' mes' : ' meses') + ' de suscripción</p></div>' +
        '<p class="plan-precio">' + ui.dinero(p.precio) + '<small>MXN</small></p>' +
        (ahorro > 0
          ? '<span class="plan-ahorro">' + ui.icono('check') + 'Ahorras ' + ui.dinero(ahorro) + ' (' + ui.dinero(porMes) + ' al mes)</span>'
          : '<span class="plan-ahorro neutro">Pago mes a mes</span>') +
        '<ul class="plan-lista">' + D.CONFIG.incluye.map(function (t) { return '<li>' + ui.icono('check') + '<span>' + ui.esc(t) + '</span></li>'; }).join('') + '</ul>' +
        '<button type="button" class="btn ' + (destacado ? 'btn-naranja' : 'btn-secundario') + ' btn-bloque" data-abrir-acceso data-correo="nutriologo@gmail.com">Probar la vista de nutriólogo</button>' +
        '</article>';
    }).join('');
  })();

  /* ------------------------------------------------------------- Acceso */
  var acceso = $('#acceso');
  var form = $('#form-acceso');
  var campo = $('#acceso-correo');
  var zonaError = $('#acceso-error');
  var aviso = $('#acceso-aviso');
  var enviar = $('#acceso-enviar');
  var focoPrevio = null;
  var escribiendo = null;

  function abrirAcceso(opciones) {
    opciones = opciones || {};
    focoPrevio = document.activeElement;
    acceso.removeAttribute('inert');
    acceso.setAttribute('aria-hidden', 'false');
    acceso.classList.add('abierto');
    document.body.classList.add('con-modal');
    zonaError.innerHTML = '';
    campo.removeAttribute('aria-invalid');
    if (opciones.aviso) {
      aviso.innerHTML = ui.icono('info') + '<span>' + ui.esc(opciones.aviso) + '</span>';
      aviso.hidden = false;
    } else {
      aviso.hidden = true;
    }
    if (opciones.correo) escribir(opciones.correo);
    else setTimeout(function () { campo.focus(); }, 60);
    if (location.hash !== '#acceso') history.replaceState(null, '', '#acceso');
  }

  function cerrarAcceso() {
    acceso.classList.remove('abierto');
    acceso.setAttribute('aria-hidden', 'true');
    acceso.setAttribute('inert', '');
    document.body.classList.remove('con-modal');
    if (location.hash === '#acceso') history.replaceState(null, '', location.pathname + location.search);
    if (focoPrevio && focoPrevio.focus) focoPrevio.focus();
  }

  /* Los atajos "escriben" el correo con un efecto de tecleo */
  function escribir(correo) {
    clearInterval(escribiendo);
    zonaError.innerHTML = '';
    campo.removeAttribute('aria-invalid');
    if (ui.reducirMovimiento) { campo.value = correo; enviar.focus(); return; }
    campo.value = '';
    campo.focus();
    var i = 0;
    escribiendo = setInterval(function () {
      i++;
      campo.value = correo.slice(0, i);
      if (i >= correo.length) { clearInterval(escribiendo); setTimeout(function () { enviar.focus(); }, 120); }
    }, 22);
  }

  $$('[data-abrir-acceso]').forEach(function (b) {
    b.addEventListener('click', function () { abrirAcceso({ correo: b.getAttribute('data-correo') }); });
  });
  $$('[data-atajo]').forEach(function (b) {
    b.addEventListener('click', function () { escribir(b.getAttribute('data-atajo')); });
  });
  $('#acceso-cerrar').addEventListener('click', cerrarAcceso);

  acceso.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { cerrarAcceso(); return; }
    if (e.key !== 'Tab') return;
    var f = $$('button:not([disabled]), input, a[href]', acceso).filter(function (el) { return el.offsetParent !== null; });
    var primero = f[0], ultimo = f[f.length - 1];
    if (e.shiftKey && document.activeElement === primero) { e.preventDefault(); ultimo.focus(); }
    else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primero.focus(); }
  });

  campo.addEventListener('input', function () {
    if (zonaError.innerHTML) { zonaError.innerHTML = ''; campo.removeAttribute('aria-invalid'); }
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    clearInterval(escribiendo);
    var r = NM.auth.entrar(campo.value);
    if (!r.ok) {
      zonaError.innerHTML = '<div class="acceso-error">' + ui.icono('alerta') + '<span>' + ui.esc(r.error) + '</span></div>';
      campo.setAttribute('aria-invalid', 'true');
      campo.setAttribute('aria-describedby', 'acceso-error');
      var c = campo.closest('.campo');
      c.classList.remove('sacude'); void c.offsetWidth; c.classList.add('sacude');
      campo.focus();
      return;
    }
    enviar.classList.add('cargando');
    enviar.querySelector('span').textContent = r.rol === 'nutriologo' ? 'Abriendo tu consultorio…' : 'Entrando…';
    var pendiente = store.tomarPendiente();
    var url = r.pagina + (r.rol === 'usuario' && pendiente && pendiente.hash ? pendiente.hash : '');
    setTimeout(function () { window.location.href = url; }, ui.reducirMovimiento ? 0 : 550);
  });

  function revisarHash() {
    if (location.hash === '#acceso' && !acceso.classList.contains('abierto')) abrirAcceso();
  }
  window.addEventListener('hashchange', revisarHash);
  revisarHash();

  ui.revelar(document);
})();
