/* =========================================================================
   NutriMatch — auth.js
   Acceso SIMULADO: no hay contraseñas ni servidor. Solo dos correos de demo.
   ========================================================================= */
(function () {
  'use strict';

  var CUENTAS = {
    'usuario@gmail.com': { rol: 'usuario', pagina: 'usuario.html' },
    'nutriologo@gmail.com': { rol: 'nutriologo', pagina: 'nutriologo.html' }
  };

  var MENSAJE_NO_REGISTRADO = 'Correo no registrado. Para la demo usa usuario@gmail.com o nutriologo@gmail.com';

  function normalizar(correo) {
    return String(correo || '').trim().toLowerCase();
  }

  /* Devuelve { ok, rol, pagina } o { ok:false, error } */
  function entrar(correo) {
    var c = normalizar(correo);
    if (!c) return { ok: false, error: 'Escribe tu correo para continuar.' };
    var cuenta = CUENTAS[c];
    if (!cuenta) return { ok: false, error: MENSAJE_NO_REGISTRADO };
    NM.store.guardarSesion({ rol: cuenta.rol, correo: c, desde: new Date().toISOString() });
    return { ok: true, rol: cuenta.rol, pagina: cuenta.pagina };
  }

  function salir() {
    NM.store.borrarSesion();
    window.location.replace('index.html');
  }

  function rolActual() {
    var s = NM.store.sesion();
    return s && s.rol ? s.rol : null;
  }

  function paginaDe(rol) {
    return rol === 'nutriologo' ? 'nutriologo.html' : 'usuario.html';
  }

  /* Se llama en el <head> de cada vista interna, antes de pintar nada.
     Si el rol no corresponde, regresa al acceso. */
  function requerir(rol) {
    var actual = rolActual();
    if (actual !== rol) {
      window.location.replace('index.html#acceso');
      return false;
    }
    return true;
  }

  window.NM = window.NM || {};
  window.NM.auth = {
    entrar: entrar, salir: salir, rolActual: rolActual, requerir: requerir,
    paginaDe: paginaDe, normalizar: normalizar, MENSAJE_NO_REGISTRADO: MENSAJE_NO_REGISTRADO
  };
})();
