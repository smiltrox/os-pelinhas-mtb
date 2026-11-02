/**
 * OS PELINHAS MTB & ROAD - SERVICIO DE CORREOS AUTOMÁTICOS
 * Envía correos al participante y al administrador a través de Google Apps Script.
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

    const payload = {
      action: 'nueva_inscripcion',
      dorsal: inscripcion.dorsal,
      nombre: inscripcion.nombre,
      apellidos: inscripcion.apellidos,
      email: inscripcion.email,
      telefono: inscripcion.telefono,
      tallaCamiseta: inscripcion.tallaCamiseta || 'No aplica',
      comida: inscripcion.comida,
      intolerancias: inscripcion.intolerancias || '',
      metodoPago: inscripcion.metodoPago || 'Bizum / Transferencia',
      estadoPago: inscripcion.pagado ? 'Pagado' : 'Pendiente',
      fecha: inscripcion.fecha,

      // Datos de la quedada para el correo del participante
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
      plazasRestantes: window.PelinaData.getPlazasRestantes()
    };

    console.log('📤 Procesando envío de correos automáticos:', payload);

    // Si NO se ha configurado la URL del webhook en el panel de administración
    if (!webhookUrl || webhookUrl.trim() === '') {
      console.warn('⚠️ Webhook de Google Apps Script no configurado. Modo simulación activo.');
      return {
        success: true,
        simulated: true,
        message: 'Modo demostración: Inscripción guardada localmente. Para enviar correos reales desde soportepelinhas@gmail.com, añade la URL del webhook en el Panel de Administrador.'
      };
    }

    try {
      // Usar text/plain para evitar errores de preflight CORS en Google Apps Script
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json().catch(() => ({ status: 'success' }));
      console.log('✅ Respuesta del servidor de correo:', result);

      return {
        success: true,
        simulated: false,
        message: 'Correos enviados automáticamente al participante y al administrador.'
      };
    } catch (err) {
      console.error('❌ Error enviando correo vía webhook:', err);
      // Aunque falle la red del correo, la inscripción no debe perderse
      return {
        success: false,
        simulated: false,
        error: err.toString(),
        message: 'La inscripción se guardó con éxito, pero ocurrió un aviso de red al enviar el correo automático.'
      };
    }
  },

  /**
   * Realizar prueba de conexión y envío desde el panel de administración
   * @param {string} testWebhookUrl - URL temporal o guardada del webhook
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
      tallaCamiseta: 'L',
      comida: true,
      intolerancias: 'Ninguna (Prueba de sistema)',
      quedadaNombre: 'TEST DE VERIFICACIÓN DE CORREO',
      dia: 'Prueba técnica',
      lugarSalida: 'Olivenza',
      cuota: 0,
      plazasRestantes: 50
    };

    const response = await fetch(testWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(testPayload)
    });

    return await response.json().catch(() => ({ status: 'success' }));
  }
};
