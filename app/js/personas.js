/* ══════════════════════════════
   SINCRONIZAR PERSONAS
   Convierte el Excel de "Personas" (formato interno) a la plantilla de
   importación del sistema contable, con reglas fijas de mapeo.
   Solo lógica de transformación; la interfaz vive en pestana-sync.js.
══════════════════════════════ */
(function (root) {
  'use strict';

  var ENCABEZADOS = ['Cédula', 'RUC', 'Tipo'];

  function esEncabezado(v) { return ENCABEZADOS.indexOf(v) !== -1; }

  // Reglas de mapeo: una fila de origen -> una fila de la plantilla (22+ columnas).
  function transformarFila(row, c) {
    var tipoOrig = row[c.Tipo] || '';
    var tipo = tipoOrig === 'Jurídica' ? 'Juridica' : tipoOrig;
    var esCliente = row[c.Cliente] || '';
    var rol = esCliente === 'Si' ? 'Cliente' : 'Proveedor';
    var ctaCliente = esCliente === 'Si' ? 'Clientes Comerciales' : '';
    var ctaProveedor = esCliente === 'No' ? 'Proveedores' : '';
    var email = String(row[c.Email] || '').toLowerCase();
    var dato = function (i) { return i >= 0 ? (row[i] || '') : ''; };

    return [
      tipo,                       // Tipo
      dato(c.Ruc),                // RUC
      dato(c.Cedula),             // Cédula
      dato(c.Razon),              // Nombre
      dato(c.NombreComercial),    // Nombre Comercial
      email,                      // Email
      dato(c.Extranjero),         // Extranjero
      rol,                        // Rol
      ctaCliente,                 // Cuenta Contable Cliente
      ctaProveedor,               // Cuenta Contable Proveedor
      dato(c.Contribuyente),      // Contribuyente Especial
      '', '', '', '', '', '', '', '', '', '', // Saldo Clientes ... Vendedor (vacíos)
      dato(c.Direccion),          // Dirección
      dato(c.Telefonos)           // Teléfono
    ];
  }

  // Procesa los dos libros. Devuelve { ok:true, encabezado, filas } o { ok:false, error }.
  function procesar(plantillaWB, datosWB) {
    var encabezado = ExcelIO.encabezadoPlantilla(plantillaWB);
    var datos = ExcelIO.datosConEncabezado(datosWB, esEncabezado);
    if (!datos) {
      return { ok: false, error: '❌ No se encontró la fila de encabezados (Cédula/RUC/Tipo) en el archivo de datos.' };
    }
    var idx = function (n) { return datos.header.indexOf(n); };
    var cols = {
      Tipo: idx('Tipo'), Ruc: idx('RUC'), Cedula: idx('Cédula'), Razon: idx('Razón Social'),
      NombreComercial: idx('Nombre Comercial'), Email: idx('Email'), Extranjero: idx('Es Extranjero'),
      Cliente: idx('Es Cliente'), Contribuyente: idx('Contribuyente Especial'),
      Direccion: idx('Dirección'), Telefonos: idx('Teléfonos')
    };
    if (cols.Tipo === -1 || cols.Cliente === -1) {
      return { ok: false, error: '❌ El archivo de datos no tiene las columnas esperadas (Tipo, Es Cliente).' };
    }
    return {
      ok: true,
      encabezado: encabezado,
      filas: datos.filas.map(function (row) { return transformarFila(row, cols); })
    };
  }

  root.SyncPersonas = {
    procesar: procesar,
    prefijoArchivo: 'Plantilla_importacion_persona',
    mensajeOk: function (n) { return '✅ ' + n + ' personas sincronizadas y descargadas'; }
  };
  if (typeof module !== 'undefined') module.exports = root.SyncPersonas;
})(typeof window !== 'undefined' ? window : globalThis);
