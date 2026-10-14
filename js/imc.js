/* =========================================================================
   NutriMatch — imc.js
   Calculadora de Índice de Masa Corporal (categorías de la OMS).
   ========================================================================= */
(function () {
  'use strict';

  var LIMITES = { estatura: [100, 250], peso: [30, 300] };
  var ESCALA = { min: 15, max: 40 };

  var CATEGORIAS = [
    { id: 'bajo',      nombre: 'Bajo peso',  hasta: 18.5,     objetivo: 'ganar-masa',
      texto: 'Tu peso está por debajo del rango recomendado. Un nutriólogo puede ayudarte a subir de peso de forma saludable.' },
    { id: 'normal',    nombre: 'Peso normal', hasta: 25,      objetivo: 'general',
      texto: 'Tu peso está dentro del rango recomendado. Un nutriólogo puede ayudarte a mantenerlo y a comer mejor.' },
    { id: 'sobrepeso', nombre: 'Sobrepeso',  hasta: 30,       objetivo: 'bajar-peso',
      texto: 'Tu peso está por encima del rango recomendado. Un plan guiado te ayuda a bajarlo sin dietas extremas.' },
    { id: 'obesidad',  nombre: 'Obesidad',   hasta: Infinity, objetivo: 'bajar-peso',
      texto: 'Conviene una valoración profesional. Un nutriólogo puede diseñar contigo un plan seguro y sostenible.' }
  ];

  function categoria(imc) {
    for (var i = 0; i < CATEGORIAS.length; i++) {
      // Se compara con el valor ya redondeado a 1 decimal (18.5 = normal, 25.0 = sobrepeso, 30.0 = obesidad)
      if (imc < CATEGORIAS[i].hasta) return CATEGORIAS[i];
    }
    return CATEGORIAS[CATEGORIAS.length - 1];
  }

  function validar(estatura, peso) {
    var errores = {};
    var e = parseFloat(String(estatura).replace(',', '.'));
    var p = parseFloat(String(peso).replace(',', '.'));
    if (estatura === '' || estatura == null || isNaN(e)) errores.estatura = 'Escribe tu estatura en centímetros.';
    else if (e < LIMITES.estatura[0] || e > LIMITES.estatura[1]) errores.estatura = 'La estatura debe estar entre 100 y 250 cm.';
    if (peso === '' || peso == null || isNaN(p)) errores.peso = 'Escribe tu peso en kilogramos.';
    else if (p < LIMITES.peso[0] || p > LIMITES.peso[1]) errores.peso = 'El peso debe estar entre 30 y 300 kg.';
    return errores;
  }

  function calcular(estaturaCm, pesoKg) {
    var m = estaturaCm / 100;
    var valor = Math.round((pesoKg / (m * m)) * 10) / 10;
    var cat = categoria(valor);
    return {
      valor: valor,
      categoria: cat,
      objetivo: cat.objetivo,
      rango: { min: Math.round(18.5 * m * m * 10) / 10, max: Math.round(24.9 * m * m * 10) / 10 },
      estatura: estaturaCm,
      peso: pesoKg
    };
  }

  function posicion(valor) {
    var p = (valor - ESCALA.min) / (ESCALA.max - ESCALA.min);
    return Math.max(0.01, Math.min(0.99, p)) * 100;
  }

  /* HTML del resultado (con escala animada) */
  function htmlResultado(r, opciones) {
    var ui = NM.ui;
    opciones = opciones || {};
    var obj = NM.store.objetivo(r.objetivo);
    var marcas = [18.5, 25, 30].map(function (v) {
      return '<span class="imc-marca" style="left:' + posicion(v) + '%">' + ui.decimal(v) + '</span>';
    }).join('');
    return '' +
      '<div class="imc-resultado cat-' + r.categoria.id + '">' +
        '<div class="imc-fila">' +
          '<p class="imc-cifra"><span class="sr-only">Tu IMC es </span><span class="imc-num">' + ui.decimal(r.valor) + '</span></p>' +
          '<div><p class="imc-cat">' + ui.esc(r.categoria.nombre) + '</p>' +
          '<p class="imc-rango">Rango de peso normal para ' + r.estatura + ' cm: <strong>' + ui.decimal(r.rango.min) + ' a ' + ui.decimal(r.rango.max) + ' kg</strong></p></div>' +
        '</div>' +
        '<div class="imc-escala" aria-hidden="true">' +
          '<div class="imc-barra"><span class="s-bajo"></span><span class="s-normal"></span><span class="s-sobrepeso"></span><span class="s-obesidad"></span></div>' +
          '<span class="imc-aguja" style="--pos:' + posicion(r.valor) + '%"><span>' + ui.decimal(r.valor) + '</span></span>' +
          '<div class="imc-marcas">' + marcas + '</div>' +
        '</div>' +
        '<p class="imc-texto">' + ui.esc(r.categoria.texto) + '</p>' +
        '<p class="aviso-orientativo">' + ui.icono('info') + '<span>Resultado orientativo, no sustituye la valoración de un profesional.</span></p>' +
        (opciones.sinBoton ? '' :
          '<div class="imc-accion">' +
            '<p class="texto-suave">Objetivo sugerido: <strong>' + ui.esc(obj.nombre) + '</strong></p>' +
            '<button type="button" class="btn btn-primario" data-imc-objetivo="' + r.objetivo + '">' + ui.icono('buscar') + 'Ver nutriólogos para este objetivo</button>' +
          '</div>') +
      '</div>';
  }

  /* Conecta un formulario con campos [name=estatura] y [name=peso] */
  function montar(opciones) {
    var form = opciones.form;
    var salida = opciones.resultado;
    var fEst = form.querySelector('[name=estatura]');
    var fPeso = form.querySelector('[name=peso]');

    if (opciones.inicial) {
      if (opciones.inicial.estatura) fEst.value = opciones.inicial.estatura;
      if (opciones.inicial.peso) fPeso.value = opciones.inicial.peso;
    }

    [fEst, fPeso].forEach(function (f) {
      f.addEventListener('input', function () { NM.ui.errorCampo(f, null); });
    });

    function mostrar(r, animar) {
      salida.innerHTML = htmlResultado(r, opciones);
      salida.hidden = false;
      var aguja = salida.querySelector('.imc-aguja');
      var num = salida.querySelector('.imc-num');
      if (animar && !NM.ui.reducirMovimiento) {
        aguja.classList.add('desde-cero');
        void aguja.offsetWidth;
        requestAnimationFrame(function () { aguja.classList.remove('desde-cero'); });
        NM.ui.contar(num, r.valor, 1, 1100);
        salida.classList.remove('aparece'); void salida.offsetWidth; salida.classList.add('aparece');
      }
      var b = salida.querySelector('[data-imc-objetivo]');
      if (b && opciones.alObjetivo) b.addEventListener('click', function () { opciones.alObjetivo(r.objetivo, r); });
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var errores = validar(fEst.value, fPeso.value);
      NM.ui.errorCampo(fEst, errores.estatura || null);
      NM.ui.errorCampo(fPeso, errores.peso || null);
      if (errores.estatura || errores.peso) {
        (errores.estatura ? fEst : fPeso).focus();
        return;
      }
      var r = calcular(parseFloat(fEst.value.replace(',', '.')), parseFloat(fPeso.value.replace(',', '.')));
      mostrar(r, true);
      if (opciones.alCalcular) opciones.alCalcular(r);
    });

    if (opciones.mostrarInicial && opciones.inicial && opciones.inicial.estatura && opciones.inicial.peso) {
      mostrar(calcular(+opciones.inicial.estatura, +opciones.inicial.peso), false);
    }
  }

  window.NM = window.NM || {};
  window.NM.imc = {
    calcular: calcular, validar: validar, categoria: categoria, montar: montar,
    htmlResultado: htmlResultado, CATEGORIAS: CATEGORIAS, LIMITES: LIMITES
  };
})();
