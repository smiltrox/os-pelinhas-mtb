/**
 * OS PELINHAS MTB & ROAD - PANEL DE ADMINISTRADOR
 * Gestión exclusiva para Antonio: Alta de quedadas, control de aforo (50 plazas),
 * tabla detallada de inscritos, cálculo de velocidad/duración y configuración.
 */

document.addEventListener('DOMContentLoaded', () => {
  initAdminModule();
});

let isAdminAuthenticated = false;

function initAdminModule() {
  setupAdminAuth();
  setupAdminTabs();
  setupQuedadaForm();
  setupInscritosControls();
  setupSettingsForm();

  // Si ya estaba autenticado en la sesión actual
  if (sessionStorage.getItem('pelina_admin_session') === 'true') {
    isAdminAuthenticated = true;
    showAdminDashboard();
  }
}

/**
 * Autenticación por PIN de Administrador
 */
function setupAdminAuth() {
  const btnAbrirAdmin = document.getElementById('btn-nav-admin');
  const modalPin = document.getElementById('modal-admin-pin');
  const formPin = document.getElementById('form-admin-pin');
  const btnCerrarPin = document.getElementById('btn-cerrar-pin-modal');
  const pinInput = document.getElementById('input-admin-pin');
  const pinError = document.getElementById('pin-error-msg');
  const btnLogout = document.getElementById('btn-admin-logout');
  const btnVolverWeb = document.getElementById('btn-volver-web');

  if (btnAbrirAdmin) {
    btnAbrirAdmin.addEventListener('click', (e) => {
      e.preventDefault();
      if (isAdminAuthenticated) {
        showAdminDashboard();
      } else {
        modalPin.classList.remove('hidden');
        pinInput.value = '';
        pinError.classList.add('hidden');
        pinInput.focus();
      }
    });
  }

  if (btnCerrarPin) {
    btnCerrarPin.addEventListener('click', () => {
      modalPin.classList.add('hidden');
    });
  }

  // Opción de Recuperar Contraseña de Administrador (Enviar a lopezsanchez.antonio@gmail.com)
  const btnRecuperarPin = document.getElementById('btn-recuperar-pin');
  const msgRecuperarPin = document.getElementById('msg-recuperar-pin');

  if (btnRecuperarPin) {
    btnRecuperarPin.addEventListener('click', async () => {
      await enviarPinPorCorreo(btnRecuperarPin, msgRecuperarPin);
    });
  }

  if (formPin) {
    formPin.addEventListener('submit', (e) => {
      e.preventDefault();
      const enteredPin = pinInput.value.trim();
      const currentPin = window.PelinaData.getState().adminPin || 'pelinhas2024';

      if (enteredPin === currentPin) {
        isAdminAuthenticated = true;
        sessionStorage.setItem('pelina_admin_session', 'true');
        modalPin.classList.add('hidden');
        showAdminDashboard();
      } else {
        pinError.classList.remove('hidden');
        pinInput.select();
      }
    });
  }

  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      isAdminAuthenticated = false;
      sessionStorage.removeItem('pelina_admin_session');
      hideAdminDashboard();
    });
  }

  if (btnVolverWeb) {
    btnVolverWeb.addEventListener('click', () => {
      hideAdminDashboard();
    });
  }
}

function showAdminDashboard() {
  document.getElementById('public-view').classList.add('hidden');
  document.getElementById('admin-view').classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Cargar datos en los formularios y tablas
  loadQuedadaFormValues();
  renderInscritosTable();
  loadSettingsValues();
}

function hideAdminDashboard() {
  document.getElementById('admin-view').classList.add('hidden');
  document.getElementById('public-view').classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  window.PelinaPublic.refresh();
}

/**
 * Pestañas del Panel de Administrador
 */
function setupAdminTabs() {
  const tabButtons = document.querySelectorAll('.admin-tab-btn');
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');

      // Botones activos
      tabButtons.forEach(b => {
        b.classList.remove('border-yellow-400', 'text-yellow-400');
        b.classList.add('border-transparent', 'text-gray-400');
      });
      btn.classList.add('border-yellow-400', 'text-yellow-400');
      btn.classList.remove('border-transparent', 'text-gray-400');

      // Contenido de pestañas
      document.querySelectorAll('.admin-tab-content').forEach(tab => {
        tab.classList.add('hidden');
      });
      const activeContent = document.getElementById(targetTab);
      if (activeContent) activeContent.classList.remove('hidden');

      if (targetTab === 'tab-inscritos') {
        renderInscritosTable();
      }
    });
  });
}

/**
 * Formulario de Alta y Edición de Quedada
 */
function setupQuedadaForm() {
  const form = document.getElementById('form-quedada-admin');
  const inputKm = document.getElementById('admin-input-km');
  const inputVel = document.getElementById('admin-input-vel');
  const previewDuracion = document.getElementById('admin-preview-duracion');

  // Cálculo en vivo de la duración estimada:
  // (KM / Vel) + 30 min de parada/desayuno
  function actualizarCalculoDuracion() {
    const km = inputKm.value;
    const vel = inputVel.value;
    if (km && vel && parseFloat(vel) > 0) {
      const dur = window.PelinaData.calcularDuracionEstimada(km, vel);
      previewDuracion.innerHTML = `
        <span class="text-white font-bold text-lg">${dur}</span>
        <span class="text-xs text-yellow-400 block">Cálculo: (${km} km / ${vel} km/h) + 30m parada = ${dur} (solo visible por los invitados)</span>
      `;
    } else {
      previewDuracion.innerHTML = `<span class="text-gray-400 text-sm">Introduce KM y Velocidad media para calcular</span>`;
    }
  }

  if (inputKm) inputKm.addEventListener('input', actualizarCalculoDuracion);
  if (inputVel) inputVel.addEventListener('input', actualizarCalculoDuracion);

  // Subida de imagen de cartel
  const inputCartelFile = document.getElementById('admin-input-cartel-file');
  const inputCartelUrl = document.getElementById('admin-input-cartel-url');
  const previewCartel = document.getElementById('admin-preview-cartel-img');

  if (inputCartelFile) {
    inputCartelFile.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          previewCartel.src = event.target.result;
          inputCartelUrl.value = event.target.result; // Data URL Base64
        };
        reader.readAsDataURL(file);
      }
    });
  }

  if (inputCartelUrl) {
    inputCartelUrl.addEventListener('input', () => {
      if (inputCartelUrl.value) {
        previewCartel.src = inputCartelUrl.value;
      }
    });
  }

  // Subida de archivo GPX
  const inputGpxFile = document.getElementById('admin-input-gpx-file');
  const labelGpx = document.getElementById('admin-label-gpx-name');
  if (inputGpxFile) {
    inputGpxFile.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        labelGpx.textContent = `Archivo seleccionado: ${file.name}`;
        const reader = new FileReader();
        reader.onload = (event) => {
          // Guardar contenido GPX como Data URL descargable
          const gpxDataUrl = 'data:application/gpx+xml;charset=utf-8,' + encodeURIComponent(event.target.result);
          document.getElementById('admin-input-gpx-url').value = gpxDataUrl;
          document.getElementById('admin-input-gpx-nombre').value = file.name;
        };
        reader.readAsText(file);
      }
    });
  }

  // Botón para crear nueva carrera y restaurar todo a 0
  const btnCrearCero = document.getElementById('btn-crear-carrera-cero');
  if (btnCrearCero) {
    btnCrearCero.addEventListener('click', () => {
      const confirmar = confirm(
        '⚠️ ¿Deseas CREAR UNA NUEVA CARRERA y RESTAURAR A 0?\n\n' +
        'Esta acción:\n' +
        '1. Limpiará los campos del formulario para que introduzcas la nueva ruta.\n' +
        '2. PONE A 0 LA LISTA DE INSCRITOS (tendrás las 50 plazas libres).\n\n' +
        '¿Deseas continuar y empezar de 0?'
      );

      if (confirmar) {
        restaurarCarreraACero();
      }
    });
  }

  // Guardar formulario de la quedada
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      guardarDatosQuedada();
    });
  }
}

/**
 * Restaura toda la carrera a 0 para empezar una nueva
 */
function restaurarCarreraACero() {
  const state = window.PelinaData.getState();

  // 1. Vaciar completamente la lista de inscritos
  state.inscritos = [];

  // 2. Limpiar datos de la carrera para una nueva
  state.quedada = {
    id: 'quedada_' + Date.now(),
    nombre: 'NUEVA QUEDADA CICLISTA',
    dia: '',
    lugarSalida: 'Olivenza (Badajoz)',
    googleMapsUrl: '',
    tipoSalida: 'MTB',
    km: 0,
    desnivel: 0,
    velocidadMedia: 18,
    duracionEstimada: 'Por determinar',
    dificultad: 'baja',
    cartelUrl: 'assets/cartel-sample.svg',
    gpxUrl: '',
    gpxNombre: 'Ruta.gpx',
    cuota: 0,
    bizumTelefono: state.bizumTelefonoDefecto || '612 34 56 78',
    cuentaBancaria: state.cuentaBancariaDefecto || 'ES91 2100 0418 4502 0005 1332',
    comida: false,
    tallaCamiseta: false,
    aforoMaximo: 50
  };

  // 3. Guardar en memoria y persistencia
  window.PelinaData.saveState(state);

  // 4. Actualizar todos los campos visuales
  loadQuedadaFormValues();
  renderInscritosTable();
  window.PelinaPublic.refresh();

  // 5. Scroll suave y confirmación
  window.scrollTo({ top: 0, behavior: 'smooth' });
  alert('✅ ¡Carrera restaurada a 0 con éxito!\n\nSe han limpiado los datos y tienes las 50 plazas libres para la nueva salida.');
}

/**
 * Envía la contraseña del administrador por correo a lopezsanchez.antonio@gmail.com
 */
async function enviarPinPorCorreo(btn, msgEl) {
  const state = window.PelinaData.getState();
  const pin = state.adminPin || 'pelinhas2024';
  const emailDestino = 'lopezsanchez.antonio@gmail.com';

  const originalText = btn.textContent;
  btn.disabled = true;
  btn.textContent = 'Enviando contraseña al correo...';

  try {
    const payload = {
      _subject: '🔐 Clave de Acceso del Administrador - Os Pelinhas MTB',
      _replyto: emailDestino,
      'Mensaje': 'Hola Antonio, has solicitado recordar tu clave de acceso al Panel de Administrador de la web de Os Pelinhas MTB.',
      'Tu Contraseña Actual de Administrador': pin,
      'Dirección de la Web': 'https://smiltrox.github.io/os-pelinhas-mtb/',
      'Fecha y Hora': new Date().toLocaleString('es-ES')
    };

    await fetch(`https://formsubmit.co/ajax/${emailDestino}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (msgEl) {
      msgEl.className = 'text-xs mt-2.5 p-2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-left';
      msgEl.innerHTML = `✅ <strong>Contraseña enviada</strong> con éxito a <code>${emailDestino}</code>. Revisa tu bandeja de entrada o spam.`;
      msgEl.classList.remove('hidden');
    }
  } catch (err) {
    if (msgEl) {
      msgEl.className = 'text-xs mt-2.5 p-2 rounded bg-red-500/10 text-red-400 border border-red-500/30 text-left';
      msgEl.innerHTML = `⚠️ No se pudo enviar el correo en este momento. Tu clave actual es: <strong>${pin}</strong>`;
      msgEl.classList.remove('hidden');
    }
  } finally {
    btn.disabled = false;
    btn.textContent = originalText;
  }
}

function loadQuedadaFormValues() {
  const q = window.PelinaData.getState().quedada;

  setInputValue('admin-input-nombre', q.nombre);
  setInputValue('admin-input-dia', q.dia);
  setInputValue('admin-input-lugar', q.lugarSalida);
  setInputValue('admin-input-maps', q.googleMapsUrl);
  setInputValue('admin-input-km', q.km);
  setInputValue('admin-input-desnivel', q.desnivel);
  setInputValue('admin-input-vel', q.velocidadMedia);
  setInputValue('admin-input-dificultad', q.dificultad || 'moderada');
  setInputValue('admin-input-tipo', q.tipoSalida || 'MTB');
  setInputValue('admin-input-cartel-url', q.cartelUrl);
  setInputValue('admin-input-gpx-url', q.gpxUrl);
  setInputValue('admin-input-gpx-nombre', q.gpxNombre || 'Ruta_Os_Pelinhas.gpx');
  setInputValue('admin-input-cuota', q.cuota || 0);
  setInputValue('admin-input-bizum', q.bizumTelefono || '');
  setInputValue('admin-input-iban', q.cuentaBancaria || '');
  setInputValue('admin-input-aforo', q.aforoMaximo || 50);

  const checkComida = document.getElementById('admin-check-comida');
  if (checkComida) checkComida.checked = !!q.comida;

  const checkCamiseta = document.getElementById('admin-check-camiseta');
  if (checkCamiseta) checkCamiseta.checked = !!q.tallaCamiseta;

  const previewCartel = document.getElementById('admin-preview-cartel-img');
  if (previewCartel) previewCartel.src = q.cartelUrl || 'assets/cartel-sample.svg';

  // Disparar cálculo de duración
  const inputKm = document.getElementById('admin-input-km');
  if (inputKm) inputKm.dispatchEvent(new Event('input'));
}

function guardarDatosQuedada() {
  const state = window.PelinaData.getState();

  const km = parseFloat(document.getElementById('admin-input-km').value) || 0;
  const vel = parseFloat(document.getElementById('admin-input-vel').value) || 18;
  const duracion = window.PelinaData.calcularDuracionEstimada(km, vel);

  state.quedada = {
    ...state.quedada,
    nombre: document.getElementById('admin-input-nombre').value.trim(),
    dia: document.getElementById('admin-input-dia').value.trim(),
    lugarSalida: document.getElementById('admin-input-lugar').value.trim(),
    googleMapsUrl: document.getElementById('admin-input-maps').value.trim(),
    tipoSalida: document.getElementById('admin-input-tipo').value,
    km: km,
    desnivel: parseFloat(document.getElementById('admin-input-desnivel').value) || 0,
    velocidadMedia: vel,
    duracionEstimada: duracion, // Cálculo automático: (KM / vel) + 30 min
    dificultad: document.getElementById('admin-input-dificultad').value,
    cartelUrl: document.getElementById('admin-input-cartel-url').value.trim() || 'assets/cartel-sample.svg',
    gpxUrl: document.getElementById('admin-input-gpx-url').value.trim(),
    gpxNombre: document.getElementById('admin-input-gpx-nombre').value.trim() || 'Ruta_Os_Pelinhas.gpx',
    cuota: parseFloat(document.getElementById('admin-input-cuota').value) || 0,
    bizumTelefono: document.getElementById('admin-input-bizum').value.trim(),
    cuentaBancaria: document.getElementById('admin-input-iban').value.trim(),
    comida: document.getElementById('admin-check-comida').checked,
    tallaCamiseta: document.getElementById('admin-check-camiseta').checked,
    aforoMaximo: parseInt(document.getElementById('admin-input-aforo').value) || 50
  };

  window.PelinaData.saveState(state);

  // Notificación de éxito
  const alertBox = document.getElementById('admin-save-alert');
  if (alertBox) {
    alertBox.classList.remove('hidden');
    setTimeout(() => {
      alertBox.classList.add('hidden');
    }, 3500);
  }
}

/**
 * Apartado de INSCRITOS: Tabla completa, búsqueda, estado de pago, CSV e impresión
 */
function setupInscritosControls() {
  const searchInput = document.getElementById('admin-search-inscritos');
  const filterPago = document.getElementById('admin-filter-pago');
  const btnExportCsv = document.getElementById('btn-export-csv');
  const btnPrintTable = document.getElementById('btn-print-table');
  const btnAddManual = document.getElementById('btn-add-manual-inscrito');

  if (searchInput) searchInput.addEventListener('input', () => renderInscritosTable());
  if (filterPago) filterPago.addEventListener('change', () => renderInscritosTable());

  if (btnExportCsv) {
    btnExportCsv.addEventListener('click', () => exportarInscritosCSV());
  }

  if (btnPrintTable) {
    btnPrintTable.addEventListener('click', () => {
      window.print();
    });
  }

  if (btnAddManual) {
    btnAddManual.addEventListener('click', () => abrirModalInscritoManual());
  }

  // Formulario manual
  const formManual = document.getElementById('form-manual-inscrito');
  if (formManual) {
    formManual.addEventListener('submit', (e) => {
      e.preventDefault();
      guardarInscritoManual();
    });
  }

  const btnCerrarManual = document.getElementById('btn-cerrar-manual-modal');
  if (btnCerrarManual) {
    btnCerrarManual.addEventListener('click', () => {
      document.getElementById('modal-manual-inscrito').classList.add('hidden');
    });
  }
}

function renderInscritosTable() {
  const state = window.PelinaData.getState();
  const inscritos = state.inscritos || [];
  const aforoMax = state.quedada.aforoMaximo || 50;

  // Actualizar estadísticas de cabecera
  const ocupadas = inscritos.length;
  const libres = Math.max(0, aforoMax - ocupadas);
  const totalComida = inscritos.filter(i => i.comida).length;
  const cuota = parseFloat(state.quedada.cuota) || 0;
  const totalPagado = inscritos.filter(i => i.pagado).length * cuota;

  setText('admin-stat-ocupadas', `${ocupadas} / ${aforoMax}`);
  setText('admin-stat-libres', libres);
  setText('admin-stat-comida', totalComida);
  setText('admin-stat-recaudado', `${totalPagado.toFixed(2)} €`);

  // Filtros de búsqueda
  const query = (document.getElementById('admin-search-inscritos')?.value || '').toLowerCase().trim();
  const filterPago = document.getElementById('admin-filter-pago')?.value || 'todos';

  const tbody = document.getElementById('admin-tbody-inscritos');
  if (!tbody) return;

  const filtrados = inscritos.filter(item => {
    // Filtro por texto
    const matchText = (
      (item.nombre || '').toLowerCase().includes(query) ||
      (item.apellidos || '').toLowerCase().includes(query) ||
      (item.email || '').toLowerCase().includes(query) ||
      (item.telefono || '').toLowerCase().includes(query) ||
      String(item.dorsal || '').includes(query)
    );

    // Filtro por pago
    let matchPago = true;
    if (filterPago === 'pagado') matchPago = item.pagado === true;
    if (filterPago === 'pendiente') matchPago = !item.pagado;

    return matchText && matchPago;
  });

  if (filtrados.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="text-center py-8 text-gray-400">
          No se encontraron inscripciones con los criterios seleccionados.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtrados.map(item => `
    <tr class="border-b border-gray-800 hover:bg-gray-800/40 transition-colors">
      <td class="py-3 px-4 font-mono font-bold text-yellow-400 text-base">
        #${item.dorsal}
      </td>
      <td class="py-3 px-4 font-semibold text-white">
        ${escapeHtml(item.nombre)} ${escapeHtml(item.apellidos)}
      </td>
      <td class="py-3 px-4 text-sm text-gray-300">
        <div><a href="tel:${escapeHtml(item.telefono)}" class="text-blue-400 hover:underline">📞 ${escapeHtml(item.telefono)}</a></div>
        <div><a href="mailto:${escapeHtml(item.email)}" class="text-gray-400 text-xs hover:underline">${escapeHtml(item.email)}</a></div>
      </td>
      <td class="py-3 px-4 text-center">
        <span class="inline-block px-2.5 py-0.5 rounded text-xs font-bold ${item.tallaCamiseta ? 'bg-gray-700 text-yellow-300' : 'text-gray-500'}">
          ${item.tallaCamiseta || '-'}
        </span>
      </td>
      <td class="py-3 px-4 text-sm">
        ${item.comida ? `
          <span class="inline-flex items-center gap-1 text-emerald-400 font-semibold text-xs bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            🍽️ SÍ
          </span>
          ${item.intolerancias ? `
            <div class="mt-1 text-xs text-red-300 font-medium bg-red-950/40 p-1.5 rounded border border-red-800/30 max-w-xs">
              ⚠️ ${escapeHtml(item.intolerancias)}
            </div>
          ` : ''}
        ` : `
          <span class="text-gray-500 text-xs">No</span>
        `}
      </td>
      <td class="py-3 px-4 text-xs text-gray-400">
        ${item.fecha || '-'}
      </td>
      <td class="py-3 px-4 text-center">
        <button onclick="window.PelinaAdmin.togglePago(${item.dorsal})" 
                title="Pulsar para cambiar estado de pago"
                class="px-2.5 py-1 rounded text-xs font-bold transition-transform active:scale-95 ${item.pagado ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'}">
          ${item.pagado ? '✅ PAGADO' : '⏳ PENDIENTE'}
        </button>
      </td>
      <td class="py-3 px-4 text-right no-print">
        <button onclick="window.PelinaAdmin.eliminarInscrito(${item.dorsal})" 
                title="Eliminar inscrito y liberar plaza" 
                class="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
          </svg>
        </button>
      </td>
    </tr>
  `).join('');
}

/**
 * Cambiar el estado de pago de un participante con 1 clic
 */
function togglePago(dorsal) {
  const state = window.PelinaData.getState();
  const inscrito = state.inscritos.find(i => i.dorsal === dorsal);
  if (inscrito) {
    inscrito.pagado = !inscrito.pagado;
    window.PelinaData.saveState(state);
    renderInscritosTable();
  }
}

/**
 * Eliminar a un participante y liberar su plaza
 */
function eliminarInscrito(dorsal) {
  const state = window.PelinaData.getState();
  const inscrito = state.inscritos.find(i => i.dorsal === dorsal);
  if (!inscrito) return;

  const confirmar = confirm(`¿Estás seguro de que deseas eliminar la inscripción de #${dorsal} - ${inscrito.nombre} ${inscrito.apellidos}? Esta acción liberará una plaza en el contador.`);
  if (confirmar) {
    state.inscritos = state.inscritos.filter(i => i.dorsal !== dorsal);
    window.PelinaData.saveState(state);
    renderInscritosTable();
    window.PelinaPublic.actualizarContador();
  }
}

/**
 * Modal para añadir un participante de forma manual
 */
function abrirModalInscritoManual() {
  const state = window.PelinaData.getState();
  const plazasLibres = window.PelinaData.getPlazasRestantes();
  if (plazasLibres <= 0) {
    const continuar = confirm('El aforo de 50 plazas ya está completo. ¿Deseas añadir este participante de todas formas como excepción?');
    if (!continuar) return;
  }

  document.getElementById('form-manual-inscrito').reset();
  document.getElementById('modal-manual-inscrito').classList.remove('hidden');
}

function guardarInscritoManual() {
  const state = window.PelinaData.getState();
  const dorsal = window.PelinaData.getNextDorsal();

  const nuevo = {
    dorsal,
    nombre: document.getElementById('manual-input-nombre').value.trim(),
    apellidos: document.getElementById('manual-input-apellidos').value.trim(),
    telefono: document.getElementById('manual-input-telefono').value.trim(),
    email: document.getElementById('manual-input-email').value.trim(),
    tallaCamiseta: document.getElementById('manual-input-talla').value,
    comida: document.getElementById('manual-check-comida').checked,
    intolerancias: document.getElementById('manual-input-intolerancias').value.trim(),
    metodoPago: document.getElementById('manual-select-pago').value,
    pagado: document.getElementById('manual-check-pagado').checked,
    fecha: new Date().toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })
  };

  state.inscritos.push(nuevo);
  window.PelinaData.saveState(state);

  document.getElementById('modal-manual-inscrito').classList.add('hidden');
  renderInscritosTable();
  window.PelinaPublic.actualizarContador();
}

/**
 * Exportar el listado completo a CSV para Excel
 */
function exportarInscritosCSV() {
  const state = window.PelinaData.getState();
  const inscritos = state.inscritos || [];
  const q = state.quedada;

  if (inscritos.length === 0) {
    alert('No hay inscritos para exportar.');
    return;
  }

  // Formato CSV con BOM para compatibilidad con Microsoft Excel
  const bom = '\uFEFF';
  const headers = ['Dorsal', 'Nombre', 'Apellidos', 'Teléfono', 'Email', 'Talla Camiseta', 'Comida', 'Intolerancias', 'Fecha Inscripción', 'Método Pago', 'Estado Pago'];
  
  const rows = inscritos.map(i => [
    i.dorsal,
    `"${(i.nombre || '').replace(/"/g, '""')}"`,
    `"${(i.apellidos || '').replace(/"/g, '""')}"`,
    `"${i.telefono || ''}"`,
    `"${i.email || ''}"`,
    `"${i.tallaCamiseta || ''}"`,
    i.comida ? 'SÍ' : 'NO',
    `"${(i.intolerancias || '').replace(/"/g, '""')}"`,
    `"${i.fecha || ''}"`,
    `"${i.metodoPago || ''}"`,
    i.pagado ? 'PAGADO' : 'PENDIENTE'
  ]);

  const csvContent = bom + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  const fileName = `Inscritos_${(q.nombre || 'Quedada').replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Pestaña de Configuración y Correo
 */
function setupSettingsForm() {
  const form = document.getElementById('form-admin-settings');
  const btnTestEmail = document.getElementById('btn-test-email');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const state = window.PelinaData.getState();
      
      const newPin = document.getElementById('settings-input-pin').value.trim();
      if (newPin) state.adminPin = newPin;

      state.emailWebhookUrl = document.getElementById('settings-input-webhook').value.trim();
      state.adminEmail = document.getElementById('settings-input-admin-email').value.trim();
      state.supportEmail = document.getElementById('settings-input-support-email').value.trim();
      state.bizumTelefonoDefecto = document.getElementById('settings-input-bizum-def').value.trim();
      state.cuentaBancariaDefecto = document.getElementById('settings-input-iban-def').value.trim();

      window.PelinaData.saveState(state);
      alert('Configuración guardada correctamente.');
    });
  }

  if (btnTestEmail) {
    btnTestEmail.addEventListener('click', async () => {
      const url = document.getElementById('settings-input-webhook').value.trim();
      if (!url) {
        alert('Por favor, introduce la URL del Webhook de Google Apps Script antes de probar.');
        return;
      }

      btnTestEmail.disabled = true;
      btnTestEmail.textContent = 'Enviando prueba...';

      try {
        await window.PelinaEmail.probarConexion(url);
        alert('✅ Conexión con Google Apps Script exitosa. Se ha enviado una prueba al correo soportepelinhas@gmail.com');
      } catch (err) {
        alert('❌ Error al conectar con el Webhook: ' + err.message);
      } finally {
        btnTestEmail.disabled = false;
        btnTestEmail.textContent = 'Probar Conexión de Correo';
      }
    });
  }

  // Botón para enviar la contraseña actual al correo desde configuración
  const btnEnviarPinSettings = document.getElementById('btn-enviar-pin-desde-settings');
  if (btnEnviarPinSettings) {
    btnEnviarPinSettings.addEventListener('click', async () => {
      await enviarPinPorCorreo(btnEnviarPinSettings, null);
      alert('✅ Tu contraseña de acceso ha sido enviada a lopezsanchez.antonio@gmail.com.');
    });
  }

  // Botón reset demo
  const btnResetDemo = document.getElementById('btn-reset-demo-data');
  if (btnResetDemo) {
    btnResetDemo.addEventListener('click', () => {
      if (confirm('¿Restablecer datos de prueba iniciales de la Sierra de Alor?')) {
        window.PelinaData.resetToDefaults();
        loadQuedadaFormValues();
        renderInscritosTable();
        loadSettingsValues();
        window.PelinaPublic.refresh();
        alert('Datos iniciales restablecidos.');
      }
    });
  }
}

function loadSettingsValues() {
  const state = window.PelinaData.getState();
  setInputValue('settings-input-pin', state.adminPin || 'pelinhas2024');
  setInputValue('settings-input-webhook', state.emailWebhookUrl || '');
  setInputValue('settings-input-admin-email', state.adminEmail || 'lopezsanchez.antonio@gmail.com');
  setInputValue('settings-input-support-email', state.supportEmail || 'soportepelinhas@gmail.com');
  setInputValue('settings-input-bizum-def', state.bizumTelefonoDefecto || '612 34 56 78');
  setInputValue('settings-input-iban-def', state.cuentaBancariaDefecto || 'ES91 2100 0418 4502 0005 1332');
}

// Helpers
function setInputValue(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val !== undefined ? val : '';
}

function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

window.PelinaAdmin = {
  renderInscritosTable,
  togglePago,
  eliminarInscrito
};
