/* ══════════════════════════════
   EXCEL-IO
   Lectura y escritura de Excel compartida por las dos pestañas.
   Depende de: XLSX (SheetJS, local en js/vendor/xlsx.full.min.js)
══════════════════════════════ */
(function (root) {
  'use strict';

  // Lee un archivo (.xls/.xlsx) seleccionado por el usuario y devuelve el libro de SheetJS.
  function leerLibro(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function (e) {
        try {
          resolve(XLSX.read(new Uint8Array(e.target.result), { type: 'array' }));
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = function () { reject(reader.error); };
      reader.readAsArrayBuffer(file);
    });
  }

  // Convierte la hoja indicada de un libro en una matriz de filas.
  function filasDeHoja(libro, nombreHoja) {
    return XLSX.utils.sheet_to_json(libro.Sheets[nombreHoja], { header: 1, defval: '' });
  }

  // Encabezado de la plantilla vacía: hoja cuyo nombre contiene "importaci", o la primera hoja.
  function encabezadoPlantilla(libro) {
    var nombre = libro.SheetNames.find(function (n) { return n.toLowerCase().includes('importaci'); }) || libro.SheetNames[0];
    return filasDeHoja(libro, nombre)[0];
  }

  // Lee la primera hoja del archivo de datos. El archivo de origen trae 2-3 filas de título
  // antes del encabezado real; `esEncabezado(celdaTexto)` identifica la fila correcta.
  // Devuelve { header, filas } o null si no encuentra el encabezado.
  function datosConEncabezado(libro, esEncabezado) {
    var crudo = filasDeHoja(libro, libro.SheetNames[0]);
    var idx = crudo.findIndex(function (row) {
      return row.some(function (c) { return esEncabezado(String(c || '').trim()); });
    });
    if (idx === -1) return null;
    return {
      header: crudo[idx].map(function (h) { return String(h).trim(); }),
      filas: crudo.slice(idx + 1).filter(function (r) {
        return r.some(function (c) { return String(c).trim() !== ''; });
      })
    };
  }

  // Arma el libro de salida (encabezado + filas) y lo descarga como .xlsx con la fecha de hoy.
  function descargar(encabezado, filasSalida, prefijoNombre) {
    var ws = XLSX.utils.aoa_to_sheet([encabezado].concat(filasSalida));
    var wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Importación');
    var fecha = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, prefijoNombre + '_COMPLETADA_' + fecha + '.xlsx');
  }

  root.ExcelIO = { leerLibro: leerLibro, filasDeHoja: filasDeHoja, encabezadoPlantilla: encabezadoPlantilla, datosConEncabezado: datosConEncabezado, descargar: descargar };
  if (typeof module !== 'undefined') module.exports = root.ExcelIO;
})(typeof window !== 'undefined' ? window : globalThis);
