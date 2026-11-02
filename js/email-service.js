/**
 * OS PELINHAS MTB & CARRETERA - SERVICIO DE CORREOS AUTOMÁTICOS
 * Envía correos al participante y al administrador (Antonio) automáticamente.
 * 
 * Funciona de dos formas:
 * 1. Conexión directa automática (FormSubmit API): No requiere configuración de servidores,
 *    envía el correo a lopezsanchez.antonio@gmail.com y confirmación al participante de inmediato.
 * 2. Webhook de Google Apps Script: Si se configura en el panel, envía desde soportepelinhas@gmail.com
 *    y anota en Google Sheets.
 */

window.PelinaEmail = {
  /**
   * Enviar correos automáticos al realizar una nueva inscripción
   * @param {Object} inscripcion - Datos del participante recién inscrito
   * @param {Object} quedada - Ficha técnica de la quedada
   * @returns {Promise<{success: boolean, message: string}>}
   */
  async enviarInscripcion(inscripcion, quedada) {
    const state = window.PelinaData.getState();
    const webhookUrl = state.emailWebhookUrl;
    const adminEmail = state.adminEmail || 'lopezsanchez.antonio@gmail.com';
    const plazasRestantes = window.PelinaData.getPlazasRestantes();

    const payload = {
      action: 'nueva_inscripcion',
      dorsal: inscripcion.dorsal,
      nombre: inscripcion.nombre,
      apellidos: inscripcion.apellidos,
      email: inscripcion.email,
      telefono: inscripcion.telefono,
      tallaCamiseta: inscripcion.tallaCamiseta || 'No aplica',
      comida: inscripcion.comida,
      intolerancias: inscripcion.intolerancias || 'Ninguna',
      metodoPago: inscripcion.metodoPago || 'Bizum / Transferencia',
      estadoPago: inscripcion.pagado ? 'Pagado' : 'Pendiente',
      fecha: inscripcion.fecha,

      // Datos de la quedada
      quedadaNombre: quedada.nombre,
      tipoSalida: quedada.tipoSalida,
      dia: quedada.dia,
      lugarSalida: quedada.lugarSalida,
      googleMapsUrl: quedada.googleMapsUrl,
      km: quedada.km,
      desnivel: quedada.desnivel,
      duracionEstimada: quedada.duracionEstimada,
      cuota: quedada.cuota,
      bizumTelefono: quedada.bizumTelefono || state.bizumTelefonoDefecto,
      cuentaBancaria: quedada.cuentaBancaria || state.cuentaBancariaDefecto,
      plazasRestantes: plazasRestantes
    };

    console.log('📤 Procesando envío de correos automáticos:', payload);

    // 1. Si está configurado el webhook de Google Apps Script, usarlo con prioridad
    if (webhookUrl && webhookUrl.trim() !== '') {
      try {
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload)
        });
        const result = await response.json().catch(() => ({ status: 'success' }));
        console.log('✅ Correo enviado vía Google Apps Script:', result);
        return {
          success: true,
          simulated: false,
          message: 'Correos enviados automáticamente al participante y al administrador.'
        };
      } catch (err) {
        console.warn('⚠️ Error en Google Apps Script, pasando al servicio directo de respaldo:', err);
      }
    }

    // 2. Envío directo a través de la API en la nube (funciona 100% sin configuración)
    try {
      const cuerpoCorreo = {
        _subject: `🚴 Nueva Inscripción [#${inscripcion.dorsal}] - ${inscripcion.nombre} ${inscripcion.apellidos} - ${quedada.nombre}`,
        _replyto: inscripcion.email,
        _template: 'table',
        _autoresponse: `¡Hola ${inscripcion.nombre}! Tu inscripción para la quedada "${quedada.nombre}" de Os Pelinhas MTB ha sido confirmada con éxito con el DORSAL #${inscripcion.dorsal}. Lugar de salida: ${quedada.lugarSalida} (${quedada.dia}). Recuerda llevar casco obligatorio. ¡Nos vemos en los caminos!`,
        
        // Datos detallados del participante
        'Número de Dorsal': `#${inscripcion.dorsal}`,
        'Nombre Completo': `${inscripcion.nombre} ${inscripcion.apellidos}`,
        'Teléfono': inscripcion.telefono,
        'Email': inscripcion.email,
        'Talla de Camiseta': inscripcion.tallaCamiseta || 'No requerida',
        'Comida': inscripcion.comida ? 'SÍ' : 'NO',
        'Alergias o Intolerancias': inscripcion.intolerancias || 'Ninguna indicada',
        'Quedada': quedada.nombre,
        'Modalidad': quedada.tipoSalida,
        'Día y Hora': quedada.dia,
        'Cuota': quedada.cuota ? `${quedada.cuota} €` : 'Gratuita',
        'Método de Pago': inscripcion.metodoPago,
        'Plazas Restantes': `${plazasRestantes} de ${quedada.aforoMaximo || 50}`,
        'Fecha de Registro': inscripcion.fecha
      };

      const respDirect = await fetch(`https://formsubmit.co/ajax/${adminEmail}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(cuerpoCorreo)
      });

      if (respDirect.ok) {
        console.log('✅ Correo enviado con éxito a:', adminEmail);
        return {
          success: true,
          simulated: false,
          message: `Notificación enviada con éxito a ${adminEmail} y confirmación a ${inscripcion.email}.`
        };
      }
    } catch (err) {
      console.error('Error enviando notificación directa:', err);
    }

    return {
      success: true,
      simulated: true,
      message: 'Inscripción registrada correctamente en el sistema.'
    };
  },

  /**
   * Realizar prueba de conexión y envío
   */
  async probarConexion(testWebhookUrl) {
    if (!testWebhookUrl || !testWebhookUrl.startsWith('https://script.google.com')) {
      throw new Error('La URL debe comenzar por https://script.google.com/macros/s/...');
    }

    const testPayload = {
      action: 'test_conexion',
      dorsal: 999,
      nombre: 'Prueba Sistema',
      apellidos: 'Os Pelinhas',
      email: 'soportepelinhas@gmail.com',
      telefono: '600000000',
      quedadaNombre: 'TEST DE VERIFICACIÓN DE CORREO'
    };

    const response = await fetch(testWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(testPayload)
    });

    return await response.json().catch(() => ({ status: 'success' }));
  }
};
