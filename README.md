# NutriMatch

Prototipo web de **NutriMatch**, una plataforma que conecta a personas con nutriólogos certificados y le da al nutriólogo las herramientas de su consultorio (agenda, expediente digital y perfil verificado).

Proyecto escolar para la materia **Cultura Empresarial**, Instituto Tecnológico de Tepic.

> **Prototipo de demostración:** sesión simulada, sin base de datos. Todos los datos (nombres, cédulas, teléfonos, reseñas y precios) son ficticios.

**Demo en línea:** https://nutrimatch-demo.vercel.app

---

## Cómo correrlo

No necesita instalar nada: es HTML, CSS y JavaScript sin frameworks ni build.

- **Opción 1:** abre `index.html` con doble clic.
- **Opción 2 (recomendada):** en VS Code, clic derecho en `index.html` y luego **Open with Live Server**.

Necesita conexión a internet solo para cargar las tipografías de Google Fonts (sin internet se usan fuentes del sistema).

## Cuentas de demo

En **Iniciar sesión** escribe uno de estos correos (no hay contraseña). También puedes usar los atajos "Entrar como usuario" y "Entrar como nutriólogo".

| Correo | Rol | Qué ve |
| --- | --- | --- |
| `usuario@gmail.com` | Usuario (paciente) | Sofía Ramírez Lara. Busca, agenda y califica. Acento verde. |
| `nutriologo@gmail.com` | Nutriólogo | Lic. Carolina Méndez Rojas. Agenda, expedientes y suscripción. Acento azul verdoso. |

Cualquier otro correo muestra: *"Correo no registrado. Para la demo usa usuario@gmail.com o nutriologo@gmail.com"*. No distingue mayúsculas ni espacios sobrantes.

Cada página interna revisa el rol guardado: un usuario no puede abrir `nutriologo.html` y viceversa (te regresa al acceso).

## Qué probar

### Página pública (`index.html`)
1. Mira la animación del hero: cada objetivo se "empareja" con un nutriólogo verificado.
2. En **Calculadora IMC** escribe estatura y peso (por ejemplo 165 cm y 78 kg). Prueba también valores fuera de rango (estatura 100 a 250 cm, peso 30 a 300 kg).
3. Pulsa **Ver nutriólogos para este objetivo**: sin sesión te pide entrar y luego te lleva directo a la búsqueda filtrada.

### Usuario (`usuario@gmail.com`)
1. **Inicio:** calculadora de IMC que guarda tu último resultado, los 3 nutriólogos mejor calificados y un espacio de publicidad de ejemplo.
2. **Buscar nutriólogos:** filtra por objetivo, calificación mínima, zona, distancia, precio y "solo verificados". Desactiva "solo verificados" para ver al nutriólogo **En revisión**. Prueba **Usar mi ubicación** (ubicación de ejemplo: Tepic centro) y los tres órdenes.
3. **Perfil de Lic. Carolina Méndez Rojas:** elige día y hora, escribe tu motivo, acepta el aviso de privacidad y confirma. La cita queda **pendiente**.
4. **Mis citas:** cancela una cita próxima. En **Pasadas** califica la cita completada con Carolina (1 a 5 estrellas + comentario, una sola vez); su promedio cambia y la reseña aparece en su perfil.
5. **Mi perfil:** edita nombre, edad, peso y estatura; el IMC se recalcula.

### Nutriólogo (`nutriologo@gmail.com`)
1. **Resumen:** citas de hoy, pendientes, pacientes activos, calificación, verificación y suscripción.
2. **Agenda:** la cita que agendaste como usuario aparece como **pendiente** con la etiqueta "Agendó en NutriMatch". Confírmala, márcala completada o cancélala. Crea una **Nueva cita** manual.
3. **Pacientes:** busca pacientes y abre un expediente. **Registrar nueva consulta** agrega una entrada al historial, actualiza peso e IMC y redibuja la gráfica de evolución (SVG propio). Sofía (usuario demo) es la paciente p1, así que su peso también se actualiza en su perfil.
4. **Mi perfil público:** edita bio, especialidades, precio, ubicación y horarios con vista previa en vivo. Sube un archivo como cédula (simulado): el estado pasa a **En revisión** y desaparece de la búsqueda con "solo verificados". Usa "Simular aprobación" para volver a Verificado.
5. **Reseñas:** promedio, distribución por estrellas y la reseña nueva del usuario.
6. **Suscripción:** plan actual, vencimiento, ahorro frente al plan mensual y **Cambiar plan** (simulado, sin pagos).

### Flujo completo recomendado
Entra como usuario, agenda con Carolina, cierra sesión, entra como nutriólogo y confirma la cita en la agenda. Si tienes las dos vistas abiertas en pestañas distintas del mismo navegador, se sincronizan solas.

## Reiniciar la demo

Todo lo que haces se guarda en `localStorage` del navegador. Para volver a los datos de ejemplo usa el botón **Reiniciar demo** (pie de página público, pie de las vistas internas o menú lateral del nutriólogo). La sesión se mantiene.

Las fechas de citas, consultas y reseñas de ejemplo se generan a partir del día de hoy, así que la demo siempre se ve actual.

## Estructura

```
index.html        Página pública + pantalla de acceso
usuario.html      Vista de usuario
nutriologo.html   Vista de nutriólogo
css/styles.css    Estilos (móvil primero)
js/data.js        Datos de ejemplo y CONFIG (precios editables)
js/store.js       Fechas y ayudas de localStorage (el "backend" de la demo)
js/auth.js        Acceso simulado por rol
js/imc.js         Calculadora de IMC (categorías OMS)
js/ui.js          Componentes compartidos: íconos SVG, toasts, modales, tarjetas, router
js/publico.js     Lógica de la página pública
js/usuario.js     Lógica de la vista de usuario
js/nutriologo.js  Lógica de la vista de nutriólogo
```

### Cambiar precios
Los precios de los planes están en un solo objeto, `CONFIG.planes`, al inicio de `js/data.js`. El precio de consulta de cada nutriólogo está en su registro dentro de `NUTRIOLOGOS`.

## Decisiones técnicas

- Scripts clásicos (`<script src>`), sin `type="module"`, para que funcione con doble clic (`file://`).
- Navegación interna por hash (`#buscar`, `#perfil/3`, `#pacientes/p1`) con transiciones de vista.
- Sin imágenes externas: avatares con iniciales e íconos SVG en línea.
- Accesibilidad: etiquetas en todos los campos, foco visible, modales con trampa de foco y cierre con Esc, regiones `aria-live` para avisos, y respeto a `prefers-reduced-motion`.

## Modelo de negocio (resumen)

- El usuario usa la plataforma gratis.
- El nutriólogo paga una suscripción de 1, 6 o 12 meses.
- Ingreso adicional por publicidad dentro de la plataforma.
