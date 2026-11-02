/**
 * ==============================================================================
 * OS PELINHAS MTB & ROAD - SISTEMA DE ENVÍO AUTOMÁTICO DE CORREOS Y REGISTRO
 * ==============================================================================
 * Cuenta remitente: soportepelinhas@gmail.com
 * Administrador: lopezsanchez.antonio@gmail.com
 *
 * INSTRUCCIONES DE INSTALACIÓN EN 2 MINUTOS:
 * 1. Entra en https://script.google.com con la cuenta soportepelinhas@gmail.com
 * 2. Pulsa en "Nuevo proyecto" y dale de nombre "Os Pelinhas MTB API".
 * 3. Borra el código que haya y PEGA TODO ESTE ARCHIVO.
 * 4. Pulsa en el botón azul "Implementar" (arriba a la derecha) > "Nueva implementación".
 * 5. Selecciona tipo: "Aplicación web".
 *    - Descripción: "API Inscripciones Os Pelinhas"
 *    - Ejecutar como: "Yo (soportepelinhas@gmail.com)"
 *    - Quién tiene acceso: "Cualquier persona" (IMPORTANTE: Esto permite a la web enviar inscripciones sin pedir login).
 * 6. Pulsa "Implementar", autoriza los permisos de Google.
 * 7. Copia la URL que te da (terminada en /exec) y pégala en el Panel de Administrador
 *    de la aplicación web en el campo "URL del Webhook de Correo".
 * ¡Listo! Cada inscripción guardará en Google Sheets y enviará los 2 correos al instante.
 * ==============================================================================
 */

const ADMIN_EMAIL = "lopezsanchez.antonio@gmail.com";
const CLUB_NAME = "OS PELINHAS M.T.B. OLIVENZA";

function doPost(e) {
  try {
    const rawData = e.postData ? e.postData.contents : "{}";
    const data = JSON.parse(rawData);

    // Obtener o crear la hoja de cálculo para el registro
    const sheet = getOrCreateSheet(data.quedadaNombre || "Inscripciones");

    // Registrar fila en la hoja de cálculo
    const timestamp = new Date();
    sheet.appendRow([
      data.dorsal || "-",
      timestamp.toLocaleString("es-ES", { timeZone: "Europe/Madrid" }),
      data.nombre || "-",
      data.apellidos || "-",
      data.telefono || "-",
      data.email || "-",
      data.tallaCamiseta || "No aplica",
      data.comida ? (data.intolerancias ? "Sí (" + data.intolerancias + ")" : "Sí (Sin intolerancias)") : "No",
      data.quedadaNombre || "-",
      data.cuota ? data.cuota + " €" : "Gratuita",
      data.metodoPago || "Pendiente",
      data.estadoPago || "Pendiente"
    ]);

    // 1. Enviar correo al ADMINISTRADOR (Antonio)
    enviarCorreoAdmin(data);

    // 2. Enviar correo al PARTICIPANTE
    if (data.email) {
      enviarCorreoParticipante(data);
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Inscripción registrada y correos enviados correctamente",
      dorsal: data.dorsal
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log("Error en doPost: " + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "online",
    club: CLUB_NAME,
    message: "El servicio de correo de Os Pelinhas MTB está funcionando correctamente."
  })).setMimeType(ContentService.MimeType.JSON);
}

// Obtiene o crea la hoja con cabeceras formateadas
function getOrCreateSheet(nombreQuedada) {
  const ss = SpreadsheetApp.getActiveSpreadsheet() || SpreadsheetApp.create("Inscripciones Os Pelinhas MTB");
  let sheet = ss.getSheetByName(nombreQuedada);
  
  if (!sheet) {
    sheet = ss.insertSheet(nombreQuedada);
    // Cabeceras
    const headers = [
      "Nº Inscripción",
      "Fecha Registro",
      "Nombre",
      "Apellidos",
      "Teléfono",
      "Email",
      "Talla Camiseta",
      "Comida / Intolerancias",
      "Quedada",
      "Cuota",
      "Método Pago",
      "Estado Pago"
    ];
    sheet.appendRow(headers);
    
    // Dar formato a las cabeceras (Amarillo Os Pelinhas y texto en negrita)
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground("#FFE500");
    headerRange.setFontColor("#111827");
    headerRange.setFontWeight("bold");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

// Correo para el administrador (Antonio)
function enviarCorreoAdmin(data) {
  const asunto = `🚴 Nueva Inscripción [#${data.dorsal}] - ${data.nombre} ${data.apellidos} - ${data.quedadaNombre}`;
  
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0f1115; color: #f3f4f6; border-radius: 12px; overflow: hidden; border: 1px solid #374151;">
      <div style="background-color: #ffe500; color: #111827; padding: 24px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 1px;">OS PELINHAS M.T.B.</h1>
        <p style="margin: 4px 0 0 0; font-size: 13px; font-weight: 600; text-transform: uppercase;">Olivenza • 20º Aniversario (2007-2027)</p>
      </div>

      <div style="padding: 24px;">
        <div style="background-color: #1f2937; border-left: 4px solid #ffe500; padding: 12px 16px; margin-bottom: 20px; border-radius: 4px;">
          <h2 style="margin: 0; color: #ffe500; font-size: 18px;">¡Nueva inscripción registrada!</h2>
          <p style="margin: 4px 0 0 0; font-size: 14px; color: #9ca3af;">Se ha recibido una nueva solicitud para <strong>${data.quedadaNombre}</strong>.</p>
        </div>

        <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 20px;">
          <tr style="border-bottom: 1px solid #374151;">
            <td style="padding: 10px 0; color: #9ca3af; font-weight: bold;">Nº Inscripción (Dorsal):</td>
            <td style="padding: 10px 0; color: #ffe500; font-size: 18px; font-weight: 800; text-align: right;">#${data.dorsal}</td>
          </tr>
          <tr style="border-bottom: 1px solid #374151;">
            <td style="padding: 10px 0; color: #9ca3af;">Nombre completo:</td>
            <td style="padding: 10px 0; color: #ffffff; text-align: right; font-weight: 600;">${data.nombre} ${data.apellidos}</td>
          </tr>
          <tr style="border-bottom: 1px solid #374151;">
            <td style="padding: 10px 0; color: #9ca3af;">Teléfono:</td>
            <td style="padding: 10px 0; color: #ffffff; text-align: right;">
              <a href="tel:${data.telefono}" style="color: #60a5fa; text-decoration: none;">${data.telefono}</a> 
              (<a href="https://wa.me/34${data.telefono.replace(/\\D/g, '')}" style="color: #34d399; text-decoration: none;">WhatsApp</a>)
            </td>
          </tr>
          <tr style="border-bottom: 1px solid #374151;">
            <td style="padding: 10px 0; color: #9ca3af;">Email:</td>
            <td style="padding: 10px 0; color: #ffffff; text-align: right;">
              <a href="mailto:${data.email}" style="color: #60a5fa; text-decoration: none;">${data.email}</a>
            </td>
          </tr>
          <tr style="border-bottom: 1px solid #374151;">
            <td style="padding: 10px 0; color: #9ca3af;">Talla Camiseta:</td>
            <td style="padding: 10px 0; color: #ffffff; text-align: right; font-weight: 600;">${data.tallaCamiseta || "No requerida"}</td>
          </tr>
          <tr style="border-bottom: 1px solid #374151;">
            <td style="padding: 10px 0; color: #9ca3af;">Comida de convivencia:</td>
            <td style="padding: 10px 0; color: #ffffff; text-align: right;">${data.comida ? "SÍ" : "NO"}</td>
          </tr>
          ${data.intolerancias ? `
          <tr style="border-bottom: 1px solid #374151;">
            <td style="padding: 10px 0; color: #f87171; font-weight: bold;">Alergias / Intolerancias:</td>
            <td style="padding: 10px 0; color: #fca5a5; text-align: right; font-weight: 600;">${data.intolerancias}</td>
          </tr>
          ` : ""}
          <tr style="border-bottom: 1px solid #374151;">
            <td style="padding: 10px 0; color: #9ca3af;">Cuota de inscripción:</td>
            <td style="padding: 10px 0; color: #ffffff; text-align: right; font-weight: 600;">${data.cuota ? data.cuota + " €" : "Gratuita"}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #9ca3af;">Plazas restantes:</td>
            <td style="padding: 10px 0; color: #ffe500; text-align: right; font-weight: 700;">${data.plazasRestantes || "-"} de 50</td>
          </tr>
        </table>

        <div style="text-align: center; margin-top: 24px; padding-top: 16px; border-top: 1px solid #374151;">
          <p style="margin: 0; font-size: 12px; color: #9ca3af;">
            Este aviso fue generado automáticamente por el sistema de inscripciones de Os Pelinhas MTB.
          </p>
        </div>
      </div>
    </div>
  `;

  GmailApp.sendEmail(ADMIN_EMAIL, asunto, "", {
    htmlBody: htmlBody,
    name: "Os Pelinhas MTB - Sistema"
  });
}

// Correo de confirmación para el participante
function enviarCorreoParticipante(data) {
  const asunto = `🚴 Confirmación de Inscripción [#${data.dorsal}] - ${data.quedadaNombre} (${CLUB_NAME})`;
  
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0f1115; color: #f3f4f6; border-radius: 12px; overflow: hidden; border: 1px solid #374151;">
      <!-- Cabecera Club -->
      <div style="background-color: #ffe500; color: #111827; padding: 26px 20px; text-align: center;">
        <h1 style="margin: 0; font-size: 26px; font-weight: 900; letter-spacing: 1px;">OS PELINHAS M.T.B.</h1>
        <p style="margin: 4px 0 0 0; font-size: 13px; font-weight: 700; text-transform: uppercase;">Club Ciclista Olivenza • 2007-2027</p>
      </div>

      <div style="padding: 26px 20px;">
        <h2 style="margin: 0 0 8px 0; color: #ffffff; font-size: 20px;">¡Hola, ${data.nombre}! 👋</h2>
        <p style="margin: 0 0 20px 0; color: #d1d5db; font-size: 15px; line-height: 1.5;">
          Tu inscripción para la quedada <strong>${data.quedadaNombre}</strong> ha sido confirmada con éxito.
        </p>

        <!-- Tarjeta de Dorsal -->
        <div style="background: linear-gradient(135deg, #1f2937, #111827); border: 2px solid #ffe500; border-radius: 10px; padding: 20px; text-align: center; margin-bottom: 24px;">
          <p style="margin: 0; font-size: 12px; font-weight: bold; color: #9ca3af; text-transform: uppercase; letter-spacing: 2px;">Tu Número de Inscripción</p>
          <div style="font-size: 48px; font-weight: 900; color: #ffe500; margin: 8px 0; text-shadow: 0 2px 8px rgba(255, 229, 0, 0.3);">
            #${data.dorsal}
          </div>
          <p style="margin: 0; font-size: 13px; color: #e5e7eb;">Guarda este número para el día de la quedada.</p>
        </div>

        <!-- Ficha Técnica de la Quedada -->
        <div style="background-color: #1f2937; border-radius: 8px; padding: 18px; margin-bottom: 24px;">
          <h3 style="margin: 0 0 14px 0; color: #ffe500; font-size: 16px; border-bottom: 1px solid #374151; padding-bottom: 8px;">
            📍 Datos de la Quedada
          </h3>
          <p style="margin: 6px 0; font-size: 14px; color: #e5e7eb;"><strong>Modalidad:</strong> ${data.tipoSalida || "MTB"}</p>
          <p style="margin: 6px 0; font-size: 14px; color: #e5e7eb;"><strong>Fecha y Hora:</strong> ${data.dia || "Ver cartel oficial"}</p>
          <p style="margin: 6px 0; font-size: 14px; color: #e5e7eb;"><strong>Lugar de Salida:</strong> ${data.lugarSalida || "Olivenza"}</p>
          ${data.googleMapsUrl ? `<p style="margin: 6px 0; font-size: 14px;"><a href="${data.googleMapsUrl}" style="color: #60a5fa; text-decoration: underline;" target="_blank">🗺️ Ver punto de encuentro en Google Maps</a></p>` : ""}
          <p style="margin: 6px 0; font-size: 14px; color: #e5e7eb;"><strong>Distancia:</strong> ${data.km ? data.km + " km" : "-"}</p>
          <p style="margin: 6px 0; font-size: 14px; color: #e5e7eb;"><strong>Desnivel positivo:</strong> ${data.desnivel ? "+" + data.desnivel + " m" : "-"}</p>
          <p style="margin: 6px 0; font-size: 14px; color: #e5e7eb;"><strong>Duración estimada:</strong> ${data.duracionEstimada || "-"}</p>
        </div>

        <!-- Pago Bizum / Transferencia si procede -->
        ${data.cuota && parseFloat(data.cuota) > 0 ? `
        <div style="background-color: #1c1917; border: 1px dashed #f59e0b; border-radius: 8px; padding: 18px; margin-bottom: 24px;">
          <h3 style="margin: 0 0 10px 0; color: #f59e0b; font-size: 16px;">
            💳 Información para el Abono de la Cuota (${data.cuota} €)
          </h3>
          <p style="margin: 4px 0 12px 0; font-size: 13px; color: #d6d3d1;">
            Por favor, completa el abono antes del día de la salida para garantizar tu plaza:
          </p>
          ${data.bizumTelefono ? `
          <div style="background-color: #292524; padding: 10px 14px; border-radius: 6px; margin-bottom: 8px;">
            <p style="margin: 0; font-size: 13px; color: #fed7aa;"><strong>OPCIÓN 1 - BIZUM:</strong></p>
            <p style="margin: 4px 0 0 0; font-size: 16px; font-weight: bold; color: #ffffff;">📱 Teléfono: ${data.bizumTelefono}</p>
            <p style="margin: 2px 0 0 0; font-size: 12px; color: #a8a29e;">Concepto: Inscripción #${data.dorsal} - ${data.nombre} ${data.apellidos}</p>
          </div>
          ` : ""}
          ${data.cuentaBancaria ? `
          <div style="background-color: #292524; padding: 10px 14px; border-radius: 6px;">
            <p style="margin: 0; font-size: 13px; color: #fed7aa;"><strong>OPCIÓN 2 - TRANSFERENCIA BANCARIA:</strong></p>
            <p style="margin: 4px 0 0 0; font-size: 14px; font-family: monospace; font-weight: bold; color: #ffffff;">🏦 IBAN: ${data.cuentaBancaria}</p>
            <p style="margin: 2px 0 0 0; font-size: 12px; color: #a8a29e;">Concepto: Inscripción #${data.dorsal} - ${data.nombre} ${data.apellidos}</p>
          </div>
          ` : ""}
        </div>
        ` : ""}

        <!-- Consejos de seguridad -->
        <div style="font-size: 13px; color: #9ca3af; line-height: 1.5; margin-bottom: 20px;">
          <p style="margin: 4px 0;">⚠️ <strong>Recuerda:</strong> El uso del casco homologado es obligatorio en todas nuestras salidas.</p>
          <p style="margin: 4px 0;">🚴 Lleva tu bicicleta revisada, repuestos básicos y avituallamiento líquido/sólido.</p>
        </div>

        <!-- Pie de página -->
        <div style="border-top: 1px solid #374151; padding-top: 18px; text-align: center;">
          <p style="margin: 0 0 6px 0; font-size: 14px; font-weight: bold; color: #ffe500;">¡Nos vemos en los caminos / en el asfalto!</p>
          <p style="margin: 0; font-size: 12px; color: #6b7280;">
            Club Ciclista Os Pelinhas M.T.B. Olivenza • <a href="mailto:soportepelinhas@gmail.com" style="color: #9ca3af; text-decoration: underline;">soportepelinhas@gmail.com</a>
          </p>
        </div>
      </div>
    </div>
  `;

  GmailApp.sendEmail(data.email, asunto, "", {
    htmlBody: htmlBody,
    name: "Club Ciclista Os Pelinhas MTB"
  });
}
