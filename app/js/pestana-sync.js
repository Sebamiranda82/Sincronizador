/* ══════════════════════════════
   PESTAÑA DE SINCRONIZACIÓN (interfaz)
   Conecta un panel del HTML con un módulo de transformación
   (SyncPersonas o SyncProductos). Los dos paneles comparten esta lógica:
   guardan los 2 archivos cargados, habilitan "Ejecutar" cuando están ambos,
   procesan y descargan el resultado.
   El panel se identifica por id; sus elementos por atributo data-role.
══════════════════════════════ */
(function (root) {
  'use strict';

  function montar(panelId, modulo) {
    var panel = document.getElementById(panelId);
    var q = function (rol) { return panel.querySelector('[data-role="' + rol + '"]'); };
    var estado = { plantilla: null, datos: null };

    function mostrar(texto, esError) {
      var el = q('status');
      el.textContent = texto;
      el.style.color = esError ? 'var(--danger)' : 'var(--accent)';
    }

    function actualizarBoton() {
      q('ejecutar').disabled = !(estado.plantilla && estado.datos);
    }

    // Conecta un <input type=file> con su etiqueta y su lugar en `estado`.
    function conectarArchivo(rol, clave, nombreError) {
      q('input-' + rol).addEventListener('change', function (event) {
        var file = event.target.files[0];
        if (!file) return;
        ExcelIO.leerLibro(file).then(function (libro) {
          estado[clave] = libro;
          q('label-' + rol).textContent = '✅ ' + file.name;
          actualizarBoton();
        }).catch(function (err) {
          mostrar('❌ Error leyendo ' + nombreError + ': ' + err.message, true);
        });
      });
      q('boton-' + rol).addEventListener('click', function () { q('input-' + rol).click(); });
    }

    conectarArchivo('plantilla', 'plantilla', 'plantilla');
    conectarArchivo('datos', 'datos', 'datos');

    q('ejecutar').addEventListener('click', function () {
      if (!estado.plantilla || !estado.datos) {
        alert('Cargá los dos archivos primero.');
        return;
      }
      try {
        var r = modulo.procesar(estado.plantilla, estado.datos);
        if (!r.ok) return mostrar(r.error, true);
        ExcelIO.descargar(r.encabezado, r.filas, modulo.prefijoArchivo);
        mostrar(modulo.mensajeOk(r.filas.length), false);
      } catch (err) {
        mostrar('❌ Error: ' + err.message, true);
      }
    });
  }

  root.PestanaSync = { montar: montar };
})(window);
