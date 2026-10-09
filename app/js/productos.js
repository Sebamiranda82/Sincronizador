/* ══════════════════════════════
   SINCRONIZAR PRODUCTOS
   Convierte el Excel de "Productos" (formato interno) a la plantilla de
   importación del sistema contable (29 columnas).
   Cuenta compra, Cuenta Costo, PVP DIST, ICE, Mínimo y Código de Barra son
   SIEMPRE valores fijos: no se toman del archivo de origen.
   Solo lógica de transformación; la interfaz vive en pestana-sync.js.
══════════════════════════════ */
(function (root) {
  'use strict';

  var ENCABEZADOS = ['Código', 'Nombre', 'Categoría'];

  function esEncabezado(v) { return ENCABEZADOS.indexOf(v) !== -1; }

  // Valor de la columna i, o `def` si la columna no existe o la celda está vacía.
  function val(row, i, def) {
    return (i >= 0 && row[i] !== '' && row[i] != null) ? row[i] : def;
  }

  function transformarFila(row, c) {
    return [
      val(row, c.Codigo, ''),     // Código
      val(row, c.CodAux, ''),     // Código Auxiliar
      val(row, c.Categoria, ''),  // Categoría
      val(row, c.Nombre, ''),     // Nombre
      '',                         // Descripción (siempre vacía)
      '',                         // Código Catálogo (siempre vacío)
      'UNIDAD',                   // Unidad
      'PRODUCTO',                 // Tipo
      '',                         // Tipo gasto personal
      'SI',                       // Para la venta
      'VENTA DE BIENES',          // Cuenta Venta
      'NO',                       // Para la compra
      'Productos terminados y mercadería comprados a terceros', // Cuenta compra
      'NO',                       // Inventariable
      '',                         // Cuenta Costo
      'NO',                       // Seriado
      val(row, c.Pvp1, 0),        // PVP1 (Sin IVA)
      val(row, c.Pvp2, 0),        // PVP2 (Sin IVA)
      val(row, c.Pvp3, 0),        // PVP3 (Sin IVA)
      '0',                        // PVP DIST
      val(row, c.Iva, 0),         // IVA
      '0',                        // ICE
      '0',                        // Mínimo
      '',                         // Código de Barra
      'SI',                       // Para Pos
      '',                         // Tipo Producto
      '',                         // Marca
      'SI',                       // PVP Manual
      'No',                       // Porcentaje Servicio
      'No'                        // Maneja Nombre Manual
    ];
  }

  // Procesa los dos libros. Devuelve { ok:true, encabezado, filas } o { ok:false, error }.
  function procesar(plantillaWB, datosWB) {
    var encabezado = ExcelIO.encabezadoPlantilla(plantillaWB);
    var datos = ExcelIO.datosConEncabezado(datosWB, esEncabezado);
    if (!datos) {
      return { ok: false, error: '❌ No se encontró la fila de encabezados (Código/Nombre/Categoría) en el archivo.' };
    }
    var idx = function (n) { return datos.header.indexOf(n); };
    var cols = {
      Codigo: idx('Código'), CodAux: idx('Código Auxiliar'), Categoria: idx('Categoría'),
      Nombre: idx('Nombre'), Pvp1: idx('PVP1'), Pvp2: idx('PVP2'), Pvp3: idx('PVP3'),
      Iva: idx('Porcentaje IVA')
    };
    if (cols.Codigo === -1 || cols.Nombre === -1) {
      return { ok: false, error: '❌ El archivo no tiene las columnas esperadas (Código, Nombre).' };
    }
    return {
      ok: true,
      encabezado: encabezado,
      filas: datos.filas.map(function (row) { return transformarFila(row, cols); })
    };
  }

  root.SyncProductos = {
    procesar: procesar,
    prefijoArchivo: 'Plantilla_importacion_productos',
    mensajeOk: function (n) { return '✅ ' + n + ' productos sincronizados y descargados'; }
  };
  if (typeof module !== 'undefined') module.exports = root.SyncProductos;
})(typeof window !== 'undefined' ? window : globalThis);
