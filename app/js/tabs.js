/* ══════════════════════════════
   PESTAÑAS
   Muestra el panel de la pestaña elegida y oculta el otro.
   Cada botón .tab-btn tiene data-panel con el id de su panel.
══════════════════════════════ */
(function () {
  'use strict';

  var botones = document.querySelectorAll('.tab-btn');

  function activar(panelId) {
    botones.forEach(function (b) {
      var activo = b.dataset.panel === panelId;
      b.classList.toggle('activa', activo);
      document.getElementById(b.dataset.panel).style.display = activo ? 'block' : 'none';
    });
  }

  botones.forEach(function (b) {
    b.addEventListener('click', function () { activar(b.dataset.panel); });
  });

  activar(botones[0].dataset.panel);
})();
