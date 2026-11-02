/**
 * OS PELINHAS MTB & ROAD - LÓGICA DE LA INTERFAZ PÚBLICA Y REGISTRO
 */

document.addEventListener('DOMContentLoaded', () => {
  initPublicView();
  setupModalEvents();
  setupCopyButtons();
});

/**
 * Inicializar y renderizar la vista pública con los datos de la quedada
 */
function initPublicView() {
  const state = window.PelinaData.getState();
  const q = state.quedada;

  // 1. Nombre de la quedada (ENCIMA del cartel y con gran visibilidad)
  const elNombre = document.getElementById('public-quedada-nombre');
  if (elNombre) elNombre.textContent = q.nombre || 'QUEDADA CICLISTA OS PELINHAS';

  // 2. Badges de modalidad y dificultad
  renderModalidadBadge(q.tipoSalida);
  renderDificultadBadge(q.dificultad);

  // 3. Cartel de la quedada
  const elCartel = document.getElementById('public-cartel-img');
  if (elCartel) {
    elCartel.src = q.cartelUrl || 'assets/cartel-sample.svg';
    elCartel.alt = `Cartel oficial - ${q.nombre}`;
  }

  // 4. Datos clave
  setText('public-dia', q.dia || 'Por confirmar');
  setText('public-lugar', q.lugarSalida || 'Olivenza (Badajoz)');
  
  const elMapsBtn = document.getElementById('public-maps-link');
  if (elMapsBtn) {
    if (q.googleMapsUrl && q.googleMapsUrl.trim() !== '') {
      elMapsBtn.href = q.googleMapsUrl;
      elMapsBtn.classList.remove('hidden');
    } else {
      elMapsBtn.classList.add('hidden');
    }
  }

  setText('public-km', `${q.km || 0} KM`);
  setText('public-desnivel', `+${q.desnivel || 0} m`);
  
  // Duración estimada (El invitado solo ve la duración estimada, la velocidad media es privada del admin)
  const duracion = q.duracionEstimada || window.PelinaData.calcularDuracionEstimada(q.km, q.velocidadMedia);
  setText('public-duracion', duracion);

  // 5. Botón de descarga GPX
  setupGpxDownload(q);

  // 6. Actualizar contador de PLAZAS y estado del botón de inscripción
  actualizarContadorPlazas();
}

/**
 * Renderiza el badge de modalidad (MTB o CARRETERA)
 */
function renderModalidadBadge(tipo) {
  const container = document.getElementById('public-modalidad-badge');
  if (!container) return;

  const esMtb = (tipo || 'MTB').toUpperCase().includes('MTB');
  if (esMtb) {
    container.className = 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30';
    container.innerHTML = `
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
      </svg>
      <span>MONTAÑA (MTB)</span>
    `;
  } else {
    container.className = 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-sky-500/10 text-sky-400 border border-sky-500/30';
    container.innerHTML = `
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
      </svg>
      <span>CARRETERA</span>
    `;
  }
}

/**
 * Renderiza el Semáforo de dificultad: Baja (Verde), Moderada (Amarillo), Difícil (Rojo)
 */
function renderDificultadBadge(dificultad) {
  const container = document.getElementById('public-dificultad-badge');
  if (!container) return;

  const dif = (dificultad || 'moderada').toLowerCase();
  
  if (dif === 'baja') {
    container.className = 'inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-green-500/10 text-green-400 border border-green-500/30';
    container.innerHTML = `
      <span class="w-2.5 h-2.5 rounded-full bg-green-500 pulse-badge shadow-sm shadow-green-500/50"></span>
      <span>DIFICULTAD BAJA</span>
    `;
  } else if (dif === 'dificil' || dif === 'difícil' || dif === 'alta') {
    container.className = 'inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-red-500/10 text-red-400 border border-red-500/30';
    container.innerHTML = `
      <span class="w-2.5 h-2.5 rounded-full bg-red-500 pulse-badge shadow-sm shadow-red-500/50"></span>
      <span>DIFICULTAD DIFÍCIL</span>
    `;
  } else {
    // Moderada por defecto
    container.className = 'inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-amber-500/10 text-amber-300 border border-amber-500/30';
    container.innerHTML = `
      <span class="w-2.5 h-2.5 rounded-full bg-amber-400 pulse-badge shadow-sm shadow-amber-400/50"></span>
      <span>DIFICULTAD MODERADA</span>
    `;
  }
}

/**
 * Configurar el botón de descarga del Track GPX
 */
function setupGpxDownload(q) {
  const btn = document.getElementById('public-gpx-btn');
  if (!btn) return;

  btn.onclick = (e) => {
    e.preventDefault();
    if (q.gpxUrl) {
      const a = document.createElement('a');
      a.href = q.gpxUrl;
      a.download = q.gpxNombre || 'Ruta_Os_Pelinhas.gpx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      alert('Track GPX no disponible todavía para esta ruta.');
    }
  };
}

/**
 * Actualiza el contador de PLAZAS (empieza en 50 y va restando)
 * Bloquea el botón y muestra "INSCRIPCIONES CERRADAS" si plazas == 0
 */
function actualizarContadorPlazas() {
  const state = window.PelinaData.getState();
  const aforoMax = state.quedada.aforoMaximo || 50;
  const inscritosCount = state.inscritos ? state.inscritos.length : 0;
  const plazasRestantes = Math.max(0, aforoMax - inscritosCount);

  // Texto del contador: debe poner PLAZAS
  const elPlazas = document.getElementById('public-plazas-count');
  if (elPlazas) {
    elPlazas.textContent = plazasRestantes;
  }

  const elAforoTotal = document.getElementById('public-aforo-total');
  if (elAforoTotal) {
    elAforoTotal.textContent = aforoMax;
  }

  // Barra de progreso visual
  const elMeter = document.getElementById('public-plazas-bar');
  if (elMeter) {
    const porcentajeOcupado = Math.min(100, Math.round((inscritosCount / aforoMax) * 100));
    const porcentajeLibre = 100 - porcentajeOcupado;
    elMeter.style.width = `${porcentajeLibre}%`;

    // Cambiar color de la barra según urgencia
    if (plazasRestantes <= 5) {
      elMeter.className = 'meter-fill bg-red-500';
    } else if (plazasRestantes <= 15) {
      elMeter.className = 'meter-fill bg-amber-400';
    } else {
      elMeter.className = 'meter-fill bg-yellow-400';
    }
  }

  // Botón de Apúntate
  const btn = document.getElementById('btn-abrir-inscripcion');
  if (btn) {
    if (plazasRestantes <= 0) {
      btn.disabled = true;
      btn.innerHTML = `
        <span class="flex items-center justify-center gap-2">
          <svg class="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m0 0v2m0-2h2m-2 0H10m4-8a4 4 0 11-8 0 4 4 0 018 0z"/>
          </svg>
          INSCRIPCIONES CERRADAS
        </span>
      `;
      btn.classList.add('cursor-not-allowed', 'opacity-70');
    } else {
      btn.disabled = false;
      btn.innerHTML = `
        <span class="flex items-center justify-center gap-2">
          <svg class="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
          </svg>
          ¡APÚNTATE! (QUEDAN ${plazasRestantes} PLAZAS)
        </span>
      `;
      btn.classList.remove('cursor-not-allowed', 'opacity-70');
    }
  }
}

/**
 * Configurar eventos del Modal de Inscripción (Ventana emergente)
 */
function setupModalEvents() {
  const modal = document.getElementById('modal-registro');
  const btnAbrir = document.getElementById('btn-abrir-inscripcion');
  const btnCerrar = document.getElementById('btn-cerrar-modal');
  const form = document.getElementById('form-inscripcion');

  if (btnAbrir) {
    btnAbrir.addEventListener('click', () => {
      abrirModalInscripcion();
    });
  }

  if (btnCerrar) {
    btnCerrar.addEventListener('click', () => {
      cerrarModalInscripcion();
    });
  }

  // Cerrar al pulsar escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && !modal.classList.contains('hidden')) {
      cerrarModalInscripcion();
    }
  });

  // Checkbox de intolerancias dinámico
  const checkIntolerancias = document.getElementById('input-tiene-intolerancias');
  const contIntolerancias = document.getElementById('contenedor-observaciones-intolerancias');
  if (checkIntolerancias && contIntolerancias) {
    checkIntolerancias.addEventListener('change', (e) => {
      if (e.target.checked) {
        contIntolerancias.classList.remove('hidden');
      } else {
        contIntolerancias.classList.add('hidden');
      }
    });
  }

  // Manejo del formulario de inscripción
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await procesarInscripcion();
    });
  }
}

/**
 * Abre el modal y prepara los campos opcionales según la configuración de la quedada
 */
function abrirModalInscripcion() {
  const modal = document.getElementById('modal-registro');
  if (!modal) return;

  const state = window.PelinaData.getState();
  const q = state.quedada;

  // Reset de pantallas del modal
  document.getElementById('modal-step-form').classList.remove('hidden');
  document.getElementById('modal-step-success').classList.add('hidden');
  document.getElementById('form-inscripcion').reset();

  // Reset del contenedor de intolerancias
  const contIntolerancias = document.getElementById('contenedor-observaciones-intolerancias');
  if (contIntolerancias) contIntolerancias.classList.add('hidden');

  // Configuración de Cuota de Pago (Bizum y Cuenta Corriente)
  const contPago = document.getElementById('modal-seccion-pago');
  const tieneCuota = q.cuota && parseFloat(q.cuota) > 0;
  if (contPago) {
    if (tieneCuota) {
      contPago.classList.remove('hidden');
      setText('modal-cuota-importe', `${parseFloat(q.cuota).toFixed(2)} €`);
      setText('modal-bizum-telefono', q.bizumTelefono || state.bizumTelefonoDefecto || '612 34 56 78');
      setText('modal-cuenta-iban', q.cuentaBancaria || state.cuentaBancariaDefecto || 'ES91 2100 0418 4502 0005 1332');
    } else {
      contPago.classList.add('hidden');
    }
  }

  // Configuración de Comida
  const contComida = document.getElementById('modal-seccion-comida');
  if (contComida) {
    if (q.comida) {
      contComida.classList.remove('hidden');
    } else {
      contComida.classList.add('hidden');
    }
  }

  // Configuración de Talla de Camiseta
  const contCamiseta = document.getElementById('modal-seccion-camiseta');
  if (contCamiseta) {
    if (q.tallaCamiseta) {
      contCamiseta.classList.remove('hidden');
      const selectCamiseta = document.getElementById('input-talla-camiseta');
      if (selectCamiseta) selectCamiseta.required = true;
    } else {
      contCamiseta.classList.add('hidden');
      const selectCamiseta = document.getElementById('input-talla-camiseta');
      if (selectCamiseta) selectCamiseta.required = false;
    }
  }

  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function cerrarModalInscripcion() {
  const modal = document.getElementById('modal-registro');
  if (modal) {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
  }
}

/**
 * Procesa la inscripción del participante
 */
async function procesarInscripcion() {
  const state = window.PelinaData.getState();
  const q = state.quedada;

  // Comprobar aforo
  const plazasLibres = window.PelinaData.getPlazasRestantes();
  if (plazasLibres <= 0) {
    alert('Lo sentimos, ¡las plazas se han agotado justo ahora!');
    cerrarModalInscripcion();
    actualizarContadorPlazas();
    return;
  }

  // Capturar campos del formulario
  const nombre = document.getElementById('input-nombre').value.trim();
  const apellidos = document.getElementById('input-apellidos').value.trim();
  const email = document.getElementById('input-email').value.trim();
  const telefono = document.getElementById('input-telefono').value.trim();

  // Campos opcionales
  let tallaCamiseta = '';
  if (q.tallaCamiseta) {
    const elTalla = document.getElementById('input-talla-camiseta');
    if (elTalla) tallaCamiseta = elTalla.value;
  }

  let asistiraComida = false;
  let intolerancias = '';
  if (q.comida) {
    const elComidaCheck = document.getElementById('input-asistir-comida');
    asistiraComida = elComidaCheck ? elComidaCheck.checked : true;
    const elTieneIntol = document.getElementById('input-tiene-intolerancias');
    if (elTieneIntol && elTieneIntol.checked) {
      const elObs = document.getElementById('input-observaciones-intolerancias');
      intolerancias = elObs ? elObs.value.trim() : '';
    }
  }

  // Método de pago si aplica cuota
  let metodoPago = 'Gratuita';
  if (q.cuota && parseFloat(q.cuota) > 0) {
    const elMetodo = document.querySelector('input[name="modal_metodo_pago"]:checked');
    metodoPago = elMetodo ? elMetodo.value : 'BIZUM';
  }

  // Obtener número de dorsal
  const dorsal = window.PelinaData.getNextDorsal();

  const fechaRegistro = new Date().toLocaleString('es-ES', {
    dateStyle: 'short',
    timeStyle: 'short'
  });

  const nuevaInscripcion = {
    dorsal,
    nombre,
    apellidos,
    email,
    telefono,
    tallaCamiseta,
    comida: asistiraComida,
    intolerancias,
    fecha: fechaRegistro,
    metodoPago,
    pagado: false
  };

  // Botón cargando
  const btnSubmit = document.getElementById('btn-submit-inscripcion');
  const oldText = btnSubmit.innerHTML;
  btnSubmit.disabled = true;
  btnSubmit.innerHTML = `
    <span class="flex items-center justify-center gap-2">
      <svg class="animate-spin -ml-1 mr-2 h-5 w-5 text-black" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
      </svg>
      Enviando inscripción y generando comprobante...
    </span>
  `;

  try {
    // 1. Guardar en memoria y LocalStorage
    state.inscritos.push(nuevaInscripcion);
    window.PelinaData.saveState(state);

    // 2. Enviar correos automáticos
    const emailResult = await window.PelinaEmail.enviarInscripcion(nuevaInscripcion, q);

    // 3. Lanzar confeti de celebración
    lanzarConfeti();

    // 4. Mostrar pantalla de éxito
    mostrarPantallaExito(nuevaInscripcion, q, emailResult);

    // 5. Actualizar contador público
    actualizarContadorPlazas();

    // 6. Actualizar panel de admin si está abierto
    if (window.PelinaAdmin && window.PelinaAdmin.renderInscritosTable) {
      window.PelinaAdmin.renderInscritosTable();
    }

  } catch (err) {
    console.error('Error al procesar inscripción:', err);
    alert('Ocurrió un error guardando la inscripción. Inténtalo de nuevo.');
  } finally {
    btnSubmit.disabled = false;
    btnSubmit.innerHTML = oldText;
  }
}

/**
 * Muestra el recibo / dorsal en pantalla
 */
function mostrarPantallaExito(inscripcion, quedada, emailResult) {
  document.getElementById('modal-step-form').classList.add('hidden');
  document.getElementById('modal-step-success').classList.remove('hidden');

  setText('success-dorsal-num', `#${inscripcion.dorsal}`);
  setText('success-participante-nombre', `${inscripcion.nombre} ${inscripcion.apellidos}`);
  setText('success-participante-email', inscripcion.email);
  setText('success-participante-telefono', inscripcion.telefono);
  setText('success-quedada-titulo', quedada.nombre);

  const elAvisoEmail = document.getElementById('success-aviso-email');
  if (elAvisoEmail) {
    if (emailResult.simulated) {
      elAvisoEmail.innerHTML = `
        <span class="text-amber-400 font-semibold">ℹ️ Modo Demostración:</span> La inscripción ha quedado registrada.
        Para recibir correos automáticos reales desde <strong>soportepelinhas@gmail.com</strong>, enlaza el Webhook en el Panel de Administrador.
      `;
    } else {
      elAvisoEmail.innerHTML = `
        <span class="text-emerald-400 font-semibold">✅ Correos automáticos enviados:</span> Se ha enviado confirmación a <strong>${inscripcion.email}</strong> y aviso al administrador <strong>${window.PelinaData.getState().adminEmail}</strong>.
      `;
    }
  }

  // Botón para imprimir comprobante
  const btnImprimir = document.getElementById('btn-imprimir-comprobante');
  if (btnImprimir) {
    btnImprimir.onclick = () => {
      window.print();
    };
  }
}

/**
 * Efecto de confeti visual
 */
function lanzarConfeti() {
  if (typeof confetti === 'function') {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FFE500', '#FFFFFF', '#10B981', '#F59E0B']
    });
  }
}

/**
 * Botones para copiar Bizum e IBAN al portapapeles
 */
function setupCopyButtons() {
  document.querySelectorAll('[data-copy-target]').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-copy-target');
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        const text = targetEl.textContent.trim();
        navigator.clipboard.writeText(text).then(() => {
          const original = btn.innerHTML;
          btn.innerHTML = `<span class="text-emerald-400 text-xs font-bold">¡Copiado!</span>`;
          setTimeout(() => {
            btn.innerHTML = original;
          }, 1800);
        });
      }
    });
  });
}

// Helper para asignar texto
function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

// Exportar helper para refrescar vista desde admin
window.PelinaPublic = {
  refresh: initPublicView,
  actualizarContador: actualizarContadorPlazas
};
