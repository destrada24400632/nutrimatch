/* =========================================================================
   NutriMatch — ui.js
   Componentes compartidos: íconos SVG, avatares, estrellas, toasts, modales,
   tarjetas de nutriólogo, router por hash y animaciones.
   ========================================================================= */
(function () {
  'use strict';

  var reducirMovimiento = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ----------------------------------------------------------- Utilidades */
  function esc(t) {
    return String(t == null ? '' : t)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function $(sel, raiz) { return (raiz || document).querySelector(sel); }
  function $$(sel, raiz) { return Array.prototype.slice.call((raiz || document).querySelectorAll(sel)); }
  function dinero(n) { return '$' + Number(n).toLocaleString('es-MX'); }
  function decimal(n, d) { return Number(n).toLocaleString('es-MX', { minimumFractionDigits: d == null ? 1 : d, maximumFractionDigits: d == null ? 1 : d }); }
  function cedulaOculta(c) { return String(c || '').slice(0, 4) + '••••'; }

  /* --------------------------------------------------------------- Íconos */
  var P = {
    inicio: '<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>',
    buscar: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
    calendario: '<rect x="3" y="5" width="18" height="16" rx="2.5"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    usuario: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-6 8-6s8 2 8 6"/>',
    usuarios: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.5 2.9-5.5 6.5-5.5s6.5 2 6.5 5.5M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.6c2.3.6 3.6 2.4 3.6 5.4"/>',
    estrella: '<path d="M12 3l2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 16.8l-5.4 2.9 1.1-6.1-4.5-4.2 6.1-.8z"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7"/>',
    sello: '<path d="M12 2.5l2.3 1.7 2.9-.1 1 2.7 2.4 1.7-.9 2.8.9 2.8-2.4 1.7-1 2.7-2.9-.1L12 21.5l-2.3-1.7-2.9.1-1-2.7-2.4-1.7.9-2.8-.9-2.8 2.4-1.7 1-2.7 2.9.1z"/><path d="M8.5 12.2l2.4 2.3 4.6-4.8"/>',
    ubicacion: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
    mira: '<circle cx="12" cy="12" r="7"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/><circle cx="12" cy="12" r="2" fill="currentColor" stroke="none"/>',
    reloj: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    cerrar: '<path d="M6 6l12 12M18 6L6 18"/>',
    salir: '<path d="M9 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h4M16 16l4-4-4-4M20 12H10"/>',
    reiniciar: '<path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 4v7h-7"/>',
    izq: '<path d="M15 5l-7 7 7 7"/>',
    der: '<path d="M9 5l7 7-7 7"/>',
    abajo: '<path d="M5 9l7 7 7-7"/>',
    mas: '<path d="M12 5v14M5 12h14"/>',
    expediente: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/>',
    grafica: '<path d="M4 4v16h16"/><path d="M7.5 14.5l3.5-4 3 2.5 5-6"/>',
    tarjeta: '<rect x="3" y="5.5" width="18" height="13" rx="2.5"/><path d="M3 10h18M7 15h4"/>',
    escudo: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>',
    bascula: '<rect x="4" y="4" width="16" height="16" rx="4"/><path d="M8.5 10.5a3.5 3.5 0 0 1 7 0M12 10.5l1.6-2"/>',
    hoja: '<path d="M5 19C5 10 10 5 19 5c0 9-5 14-14 14z"/><path d="M5 19l7-7"/>',
    'bajar-peso': '<path d="M3 7l6 6 4-4 8 8"/><path d="M21 11v6h-6"/>',
    'ganar-masa': '<path d="M6.5 7v10M17.5 7v10M3.5 10v4M20.5 10v4M6.5 12h11"/>',
    deportiva: '<path d="M13 3L5 14h6l-1 7 8-11h-6z"/>',
    enfermedades: '<path d="M3 12h4l2-4.5 3.5 9 2.2-4.5H21"/>',
    general: '<path d="M12 7.5c-2-2-6.5-1.5-6.5 3.2C5.5 15 8.6 20 12 20s6.5-5 6.5-9.3C18.5 6 14 5.5 12 7.5z"/><path d="M12 7.5c0-2 1-3.6 3-4.4"/>',
    subir: '<path d="M12 15V4M7 9l5-5 5 5M4 15v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4"/>',
    ojo: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    mensaje: '<path d="M4 5h16v11H9.5L4 20z"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
    alerta: '<path d="M12 3.5l9.5 17h-19z"/><path d="M12 10v4.5M12 17.5h.01"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    anuncio: '<path d="M4 10.5v3a1 1 0 0 0 1 1h2.5l6.5 4.5v-14L7.5 9.5H5a1 1 0 0 0-1 1z"/><path d="M17.5 9a4 4 0 0 1 0 6"/>',
    filtro: '<path d="M4 5h16l-6.2 7.2V18l-3.6 2v-7.8z"/>',
    lapiz: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>',
    candado: '<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>',
    telefono: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1z"/>',
    correo: '<rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="M3.5 7l8.5 6 8.5-6"/>',
    regla: '<path d="M4 16.5L16.5 4 20 7.5 7.5 20z"/><path d="M8 13l1.5 1.5M10.5 10.5L12 12M13 8l1.5 1.5"/>',
    pulso: '<path d="M3 12h4l2-4.5 3.5 9 2.2-4.5H21"/>',
    billete: '<rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6.5 9.5v.01M17.5 14.5v.01"/>',
    corona: '<path d="M4 18h16M4.5 15L3 7l5 3.5L12 5l4 5.5L21 7l-1.5 8z"/>'
  };

  function icono(nombre, clase) {
    var cuerpo = P[nombre] || P.info;
    var relleno = nombre === 'estrella' ? 'currentColor' : 'none';
    return '<svg class="ico ' + (clase || '') + '" viewBox="0 0 24 24" width="24" height="24" fill="' + relleno +
      '" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' +
      cuerpo + '</svg>';
  }

  /* Logo de NutriMatch: manzana en dos mitades (paciente y nutriólogo) que se
     encuentran. Mismo dibujo que brand/nutrimatch-icono.svg */
  var MANZANA = 'M24 16.2C20.3 13.4 12.6 13.3 11.4 21.4C10.3 29.8 15.8 38.2 20.3 38.2C21.9 38.2 22.9 37.4 24 37.4C25.1 37.4 26.1 38.2 27.7 38.2C32.2 38.2 37.7 29.8 36.6 21.4C35.4 13.3 27.7 13.4 24 16.2Z';
  var logosPintados = 0;
  function logo(conTexto) {
    var n = ++logosPintados;
    var marca = '<svg class="logo-marca" viewBox="0 0 48 48" width="36" height="36" aria-hidden="true" focusable="false">' +
      '<defs><linearGradient id="nm-f' + n + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#155234"/><stop offset="1" stop-color="#0C3322"/></linearGradient>' +
        '<clipPath id="nm-i' + n + '"><rect width="23.1" height="48"/></clipPath><clipPath id="nm-d' + n + '"><rect x="24.9" width="24" height="48"/></clipPath></defs>' +
      '<rect width="48" height="48" rx="14" fill="url(#nm-f' + n + ')"/>' +
      '<g transform="translate(0 1.2)">' +
        '<g class="mitad-a"><path d="' + MANZANA + '" fill="#F6F4EC" clip-path="url(#nm-i' + n + ')"/></g>' +
        '<g class="mitad-b"><path d="' + MANZANA + '" fill="#6DBE8E" clip-path="url(#nm-d' + n + ')"/></g>' +
        '<path d="M24 15.4C24 12.6 24.8 10.6 26.2 9.2" fill="none" stroke="#F6F4EC" stroke-width="1.9" stroke-linecap="round"/>' +
        '<path class="logo-hoja" d="M25.6 11.6C26.9 8.2 30.4 7 33.2 7.7C32.5 10.9 29.1 12.6 25.6 11.6Z" fill="#E8913A"/>' +
      '</g></svg>';
    if (!conTexto) return marca;
    return '<span class="logo">' + marca + '<span class="logo-texto">Nutri<span>Match</span></span></span>';
  }

  /* ---------------------------------------------------- Avatar e insignias */
  function iniciales(nombre) {
    var partes = String(nombre).replace(/^(Lic\.|Mtra\.|Mtro\.|Dra\.|Dr\.)\s+/i, '').split(/\s+/);
    return ((partes[0] || '').charAt(0) + (partes[1] || '').charAt(0)).toUpperCase();
  }
  function tonoDe(texto) {
    var h = 0;
    for (var i = 0; i < texto.length; i++) h = (h * 31 + texto.charCodeAt(i)) % 360;
    return h;
  }
  function avatar(nombre, tamano, tono) {
    var t = tono == null ? tonoDe(String(nombre)) : tono;
    return '<span class="avatar avatar-' + (tamano || 'md') + '" style="--t:' + t + '" aria-hidden="true">' + esc(iniciales(nombre)) + '</span>';
  }
  function insigniaVerificado(n, compacta) {
    if (!n.verificacion || n.verificacion.estado !== 'verificado') {
      return '<span class="insignia insignia-revision" title="Cédula en revisión">' + icono('reloj') + (compacta ? '' : '<span>En revisión</span>') + '</span>';
    }
    return '<span class="insignia insignia-verificado" title="Cédula profesional verificada">' + icono('sello') + (compacta ? '<span class="sr-only">Verificado</span>' : '<span>Verificado</span>') + '</span>';
  }

  function estrellas(valor, opciones) {
    opciones = opciones || {};
    var pct = Math.max(0, Math.min(100, (valor / 5) * 100));
    var una = icono('estrella');
    var cinco = una + una + una + una + una;
    return '<span class="estrellas ' + (opciones.clase || '') + '" role="img" aria-label="' + decimal(valor) + ' de 5 estrellas">' +
      '<span class="estrellas-base">' + cinco + '</span>' +
      '<span class="estrellas-llenas" style="width:' + pct + '%">' + cinco + '</span></span>';
  }

  function chipObjetivo(id, conIcono) {
    var o = NM.store.objetivo(id);
    if (!o) return '';
    return '<span class="chip chip-' + id + '">' + (conIcono === false ? '' : icono(id)) + esc(o.nombre) + '</span>';
  }

  /* Tarjeta de nutriólogo (se usa en búsqueda, inicio y vista previa) */
  function tarjetaNutriologo(n, opciones) {
    opciones = opciones || {};
    var c = NM.store.calificacion(n.id);
    var accion = opciones.vistaPrevia
      ? '<span class="btn btn-secundario btn-sm" aria-hidden="true">Ver perfil</span>'
      : '<a class="btn btn-secundario btn-sm" href="#perfil/' + n.id + '" aria-label="Ver perfil de ' + esc(n.nombre) + '">Ver perfil</a>';
    return '' +
      '<article class="tarjeta-nutri' + (opciones.vistaPrevia ? ' es-preview' : '') + '" style="--i:' + (opciones.indice || 0) + '">' +
        '<div class="tn-cabeza">' +
          avatar(n.nombre, 'lg', n.tono) +
          '<div class="tn-identidad">' +
            '<h3 class="tn-nombre">' + esc(n.nombre) + '</h3>' +
            '<p class="tn-titulo">' + esc(n.titulo) + '</p>' +
            '<div class="tn-calif">' + estrellas(c.promedio) +
              '<strong>' + (c.total ? decimal(c.promedio) : 'Nuevo') + '</strong>' +
              '<span class="texto-suave">(' + c.total + ' ' + (c.total === 1 ? 'reseña' : 'reseñas') + ')</span>' +
            '</div>' +
          '</div>' +
          insigniaVerificado(n) +
        '</div>' +
        '<div class="tn-chips">' + n.especialidades.map(function (e) { return chipObjetivo(e); }).join('') + '</div>' +
        '<dl class="tn-datos">' +
          '<div><dt>' + icono('ubicacion') + '<span class="sr-only">Ubicación</span></dt><dd>' + esc(n.zona) + ' <span class="texto-suave">a ' + decimal(n.distanciaKm) + ' km</span></dd></div>' +
          '<div><dt>' + icono('billete') + '<span class="sr-only">Precio</span></dt><dd><strong>' + dinero(n.precio) + '</strong> <span class="texto-suave">por consulta</span></dd></div>' +
        '</dl>' +
        '<div class="tn-pie">' + accion + '</div>' +
      '</article>';
  }

  /* Resumen de calificaciones (número grande + barras por estrella) */
  function resumenCalificacion(resenas) {
    if (!resenas.length) return '<p class="texto-suave">Aún no hay reseñas.</p>';
    var cuenta = [0, 0, 0, 0, 0, 0];
    var suma = 0;
    resenas.forEach(function (r) { cuenta[r.calificacion]++; suma += r.calificacion; });
    var prom = Math.round((suma / resenas.length) * 10) / 10;
    var filas = '';
    for (var i = 5; i >= 1; i--) {
      var pct = (cuenta[i] / resenas.length) * 100;
      filas += '<div class="barra-fila"><span>' + i + ' ' + icono('estrella') + '</span><div class="barra" role="img" aria-label="' + cuenta[i] + ' reseñas de ' + i + ' estrellas"><span style="width:' + pct + '%"></span></div><span>' + cuenta[i] + '</span></div>';
    }
    return '<div class="resumen-calif"><div class="rc-grande"><span class="num">' + decimal(prom) + '</span>' + estrellas(prom) +
      '<span class="texto-suave" style="font-size:.85rem">' + resenas.length + ' reseñas</span></div><div class="barras">' + filas + '</div></div>';
  }
  function resenaItem(r) {
    return '<li class="resena' + (r.nueva ? ' nueva' : '') + '">' +
      '<div class="resena-cabeza">' + avatar(r.autor, 'sm') + '<strong>' + esc(r.autor) + '</strong>' + estrellas(r.calificacion) +
      (r.nueva ? '<span class="etiqueta-nueva">Nueva</span>' : '') +
      '<time datetime="' + r.fecha + '">' + esc(NM.fechas.relativo(r.fecha)) + '</time></div>' +
      '<p>' + esc(r.comentario) + '</p></li>';
  }

  /* ---------------------------------------------------------------- Toasts */
  var zonaToasts = null;
  function toast(mensaje, tipo, duracion) {
    tipo = tipo || 'exito';
    if (!zonaToasts) {
      zonaToasts = document.createElement('div');
      zonaToasts.className = 'toasts';
      zonaToasts.setAttribute('aria-live', 'polite');
      zonaToasts.setAttribute('aria-atomic', 'false');
      document.body.appendChild(zonaToasts);
    }
    var t = document.createElement('div');
    t.className = 'toast toast-' + tipo;
    t.setAttribute('role', tipo === 'error' ? 'alert' : 'status');
    var ic = tipo === 'error' ? 'alerta' : tipo === 'info' ? 'info' : 'check';
    t.innerHTML = '<span class="toast-ico">' + icono(ic) + '</span><span class="toast-texto">' + esc(mensaje) + '</span>' +
      '<button type="button" class="toast-cerrar" aria-label="Cerrar aviso">' + icono('cerrar') + '</button>' +
      '<span class="toast-barra" style="animation-duration:' + (duracion || 4200) + 'ms"></span>';
    zonaToasts.appendChild(t);
    var quitar = function () {
      if (t.classList.contains('sale')) return;
      t.classList.add('sale');
      setTimeout(function () { t.remove(); }, 320);
    };
    t.querySelector('.toast-cerrar').addEventListener('click', quitar);
    setTimeout(quitar, duracion || 4200);
    return t;
  }

  /* ---------------------------------------------------------------- Modales */
  var ENFOCABLES = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  function modal(opciones) {
    var previo = document.activeElement;
    var capa = document.createElement('div');
    capa.className = 'modal-capa';
    var idTitulo = 'm-' + Math.random().toString(36).slice(2, 8);
    capa.innerHTML =
      '<div class="modal ' + (opciones.clase || '') + '" role="dialog" aria-modal="true" aria-labelledby="' + idTitulo + '">' +
        '<header class="modal-cabeza">' +
          '<h2 id="' + idTitulo + '">' + esc(opciones.titulo) + '</h2>' +
          '<button type="button" class="btn-icono modal-cerrar" aria-label="Cerrar">' + icono('cerrar') + '</button>' +
        '</header>' +
        '<div class="modal-cuerpo">' + (opciones.contenido || '') + '</div>' +
        (opciones.pie ? '<footer class="modal-pie">' + opciones.pie + '</footer>' : '') +
      '</div>';
    document.body.appendChild(capa);
    document.body.classList.add('con-modal');
    var caja = capa.querySelector('.modal');

    function cerrar(valor) {
      if (capa.classList.contains('sale')) return;
      capa.classList.add('sale');
      document.removeEventListener('keydown', teclas, true);
      setTimeout(function () {
        capa.remove();
        if (!document.querySelector('.modal-capa')) document.body.classList.remove('con-modal');
        if (previo && previo.focus) previo.focus();
      }, reducirMovimiento ? 0 : 220);
      if (opciones.alCerrar) opciones.alCerrar(valor);
    }
    function teclas(e) {
      if (capa !== $$('.modal-capa').pop()) return;
      if (e.key === 'Escape') { e.preventDefault(); cerrar(false); return; }
      if (e.key === 'Tab') {
        var f = $$(ENFOCABLES, caja).filter(function (el) { return el.offsetParent !== null; });
        if (!f.length) return;
        var primero = f[0], ultimo = f[f.length - 1];
        if (e.shiftKey && document.activeElement === primero) { e.preventDefault(); ultimo.focus(); }
        else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primero.focus(); }
      }
    }
    document.addEventListener('keydown', teclas, true);
    capa.addEventListener('mousedown', function (e) { if (e.target === capa) cerrar(false); });
    capa.querySelector('.modal-cerrar').addEventListener('click', function () { cerrar(false); });
    $$('[data-cerrar]', caja).forEach(function (b) { b.addEventListener('click', function () { cerrar(false); }); });

    requestAnimationFrame(function () {
      var foco = caja.querySelector('[autofocus]') || $$(ENFOCABLES, caja.querySelector('.modal-cuerpo'))[0] || caja.querySelector('.modal-cerrar');
      if (foco) foco.focus();
    });
    if (opciones.alAbrir) opciones.alAbrir(caja, cerrar);
    return { el: caja, cerrar: cerrar };
  }

  function confirmar(opciones) {
    return new Promise(function (resolver) {
      var resuelto = false;
      var m = modal({
        titulo: opciones.titulo,
        clase: 'modal-chico',
        contenido: '<p>' + esc(opciones.mensaje) + '</p>',
        pie: '<button type="button" class="btn btn-fantasma" data-cerrar>' + esc(opciones.cancelar || 'Volver') + '</button>' +
             '<button type="button" class="btn ' + (opciones.peligro ? 'btn-peligro' : 'btn-primario') + '" data-ok>' + esc(opciones.aceptar || 'Confirmar') + '</button>',
        alCerrar: function () { if (!resuelto) { resuelto = true; resolver(false); } }
      });
      var ok = m.el.querySelector('[data-ok]');
      ok.addEventListener('click', function () { resuelto = true; resolver(true); m.cerrar(true); });
      setTimeout(function () { ok.focus(); }, 30);
    });
  }

  /* Animación de "listo" (palomita que se dibuja) */
  function exitoAnimado(titulo, texto) {
    return '<div class="exito-anim">' +
      '<svg viewBox="0 0 52 52" width="72" height="72" aria-hidden="true"><circle class="ea-circulo" cx="26" cy="26" r="24"/><path class="ea-check" d="M15 27l7.5 7.5L38 19"/></svg>' +
      '<h3>' + esc(titulo) + '</h3><p>' + texto + '</p></div>';
  }

  /* ------------------------------------------------------ Formularios */
  function errorCampo(campo, mensaje) {
    var envoltura = campo.closest('.campo') || campo.parentNode;
    var err = envoltura.querySelector('.campo-error');
    if (!err) {
      err = document.createElement('p');
      err.className = 'campo-error';
      err.id = (campo.id || 'c' + Math.random().toString(36).slice(2, 7)) + '-error';
      envoltura.appendChild(err);
    }
    if (mensaje) {
      err.innerHTML = icono('alerta') + '<span>' + esc(mensaje) + '</span>';
      campo.setAttribute('aria-invalid', 'true');
      campo.setAttribute('aria-describedby', err.id);
      envoltura.classList.add('con-error');
      envoltura.classList.remove('sacude');
      void envoltura.offsetWidth;
      envoltura.classList.add('sacude');
    } else {
      err.innerHTML = '';
      campo.removeAttribute('aria-invalid');
      envoltura.classList.remove('con-error');
    }
  }

  /* ----------------------------------------------------------- Animaciones */
  function contar(el, hasta, decimales, duracion) {
    decimales = decimales || 0;
    if (reducirMovimiento) { el.textContent = decimal(hasta, decimales); return; }
    var inicio = performance.now();
    duracion = duracion || 900;
    function paso(t) {
      var p = Math.min(1, (t - inicio) / duracion);
      var e = 1 - Math.pow(1 - p, 4);
      el.textContent = decimal(hasta * e, decimales);
      if (p < 1) requestAnimationFrame(paso);
    }
    requestAnimationFrame(paso);
  }
  function animarContadores(raiz) {
    $$('[data-contar]', raiz).forEach(function (el) {
      contar(el, parseFloat(el.getAttribute('data-contar')), +(el.getAttribute('data-decimales') || 0));
    });
  }

  var observador = null;
  function revelar(raiz) {
    var els = $$('[data-revelar]', raiz);
    if (reducirMovimiento || !('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('visible'); });
      return;
    }
    if (!observador) {
      observador = new IntersectionObserver(function (entradas) {
        entradas.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add('visible'); observador.unobserve(en.target); }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    }
    els.forEach(function (el) { observador.observe(el); });
  }

  /* Asigna --i a los hijos de [data-escalonar] para animarlos en cascada */
  function escalonar(raiz) {
    $$('[data-escalonar]', raiz).forEach(function (c) {
      Array.prototype.forEach.call(c.children, function (el, i) { el.style.setProperty('--i', Math.min(i, 12)); });
    });
  }

  /* Indicador deslizante para navegaciones (pastilla que sigue al enlace activo) */
  function moverIndicador(nav, indicador, vertical) {
    var activo = nav.querySelector('[aria-current="page"]');
    if (!activo || activo.offsetParent === null) { indicador.style.opacity = '0'; return; }
    indicador.style.opacity = '1';
    if (vertical) {
      indicador.style.height = activo.offsetHeight + 'px';
      indicador.style.transform = 'translateY(' + activo.offsetTop + 'px)';
    } else {
      indicador.style.width = activo.offsetWidth + 'px';
      indicador.style.transform = 'translateX(' + activo.offsetLeft + 'px)';
    }
  }

  /* ---------------------------------------------------------- Router hash */
  function leerRuta() {
    var h = decodeURIComponent(location.hash.replace(/^#/, ''));
    var partes = h.split('?');
    var segmentos = partes[0].split('/').filter(Boolean);
    var params = {};
    (partes[1] || '').split('&').forEach(function (kv) {
      if (!kv) return;
      var p = kv.split('=');
      params[p[0]] = p[1] == null ? '' : p[1];
    });
    return { vista: segmentos[0] || '', id: segmentos[1] || null, params: params };
  }

  function crearRouter(config) {
    var contenedor = config.contenedor;
    var actual = null;
    function pintar(conTransicion) {
      var ruta = leerRuta();
      if (!config.vistas[ruta.vista]) ruta = { vista: config.porDefecto, id: null, params: {} };
      var cambiaVista = !actual || actual.vista !== ruta.vista || actual.id !== ruta.id;
      actual = ruta;
      var hacer = function () {
        config.vistas[ruta.vista](contenedor, ruta);
        if (config.alCambiar) config.alCambiar(ruta);
        escalonar(contenedor);
        revelar(contenedor);
        animarContadores(contenedor);
      };
      if (conTransicion && cambiaVista && !reducirMovimiento) {
        if (document.startViewTransition) {
          document.startViewTransition(hacer);
        } else {
          hacer();
          contenedor.classList.remove('vista-entra');
          void contenedor.offsetWidth;
          contenedor.classList.add('vista-entra');
        }
      } else {
        hacer();
      }
      if (cambiaVista && conTransicion) {
        window.scrollTo({ top: 0, behavior: reducirMovimiento ? 'auto' : 'smooth' });
        var titulo = contenedor.querySelector('h1');
        if (titulo) { titulo.setAttribute('tabindex', '-1'); titulo.focus({ preventScroll: true }); }
      }
    }
    window.addEventListener('hashchange', function () { pintar(true); });
    return {
      iniciar: function () { pintar(false); },
      refrescar: function () { actual = null; pintar(false); },
      ruta: function () { return actual; },
      ir: function (hash) { if (location.hash === hash) pintar(true); else location.hash = hash; }
    };
  }

  /* ----------------------------------------------------- Reinicio de demo */
  function enlazarReinicio(raiz) {
    $$('[data-reiniciar-demo]', raiz).forEach(function (b) {
      if (b.dataset.enlazado) return;
      b.dataset.enlazado = '1';
      b.addEventListener('click', function () {
        confirmar({
          titulo: 'Reiniciar la demo',
          mensaje: 'Se borrarán las citas, reseñas, consultas y cambios que hiciste, y volverán los datos de ejemplo. Tu sesión se mantiene.',
          aceptar: 'Reiniciar demo',
          peligro: true
        }).then(function (ok) {
          if (!ok) return;
          NM.store.reiniciar();
          try { sessionStorage.setItem('nutrimatch.aviso', 'Demo reiniciada: volvieron los datos de ejemplo.'); } catch (e) {}
          location.reload();
        });
      });
    });
  }
  function avisoPendiente() {
    try {
      var a = sessionStorage.getItem('nutrimatch.aviso');
      if (a) { sessionStorage.removeItem('nutrimatch.aviso'); setTimeout(function () { toast(a, 'info'); }, 400); }
    } catch (e) {}
  }

  /* Marca el año en los pies de página */
  document.addEventListener('DOMContentLoaded', function () {
    $$('[data-anio]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
    $$('[data-logo]').forEach(function (el) { el.innerHTML = logo(true); });
    enlazarReinicio(document);
    avisoPendiente();
  });

  window.NM = window.NM || {};
  window.NM.ui = {
    esc: esc, $: $, $$: $$, dinero: dinero, decimal: decimal, cedulaOculta: cedulaOculta,
    icono: icono, logo: logo, iniciales: iniciales, avatar: avatar, tonoDe: tonoDe,
    insigniaVerificado: insigniaVerificado, estrellas: estrellas, chipObjetivo: chipObjetivo,
    tarjetaNutriologo: tarjetaNutriologo, resumenCalificacion: resumenCalificacion, resenaItem: resenaItem, toast: toast, modal: modal, confirmar: confirmar,
    exitoAnimado: exitoAnimado, errorCampo: errorCampo, contar: contar, animarContadores: animarContadores,
    revelar: revelar, escalonar: escalonar, moverIndicador: moverIndicador, crearRouter: crearRouter, leerRuta: leerRuta, enlazarReinicio: enlazarReinicio,
    reducirMovimiento: reducirMovimiento
  };
})();
