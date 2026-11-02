/**
 * OS PELINHAS MTB & ROAD - GESTOR DE DATOS Y ESTADO
 * Persistencia en LocalStorage con soporte de respaldo y sincronización.
 */

const STORAGE_KEY = 'os_pelinhas_mtb_data_v1';

// Cálculo automático de la duración estimada:
// Fórmula: (KM / Velocidad media) + 30 minutos de parada/desayuno
function calcularDuracionEstimada(km, velocidadMedia) {
  const kmNum = parseFloat(km);
  const velNum = parseFloat(velocidadMedia);
  if (!kmNum || !velNum || velNum <= 0) return 'Por determinar';

  const horasPuras = kmNum / velNum;
  const minutosTotales = Math.round(horasPuras * 60) + 30; // + 30 min descanso
  const h = Math.floor(minutosTotales / 60);
  const m = minutosTotales % 60;
  return `${h}h ${m > 0 ? (m < 10 ? '0' + m : m) + 'm' : '00m'}`;
}

// Datos iniciales de demostración
const DEFAULT_DATA = {
  adminPin: 'pelinhas2024',
  adminEmail: 'lopezsanchez.antonio@gmail.com',
  supportEmail: 'soportepelinhas@gmail.com',
  emailWebhookUrl: '', // URL de Google Apps Script cuando Antonio la configure

  // Datos bancarios y Bizum por defecto
  bizumTelefonoDefecto: '612 34 56 78',
  cuentaBancariaDefecto: 'ES91 2100 0418 4502 0005 1332',

  // Quedada activa principal
  quedada: {
    id: 'quedada_01',
    nombre: 'RUTA SIERRA DE ALOR - 20º ANIVERSARIO',
    dia: 'Domingo, 15 de Noviembre de 2026 - 08:30 h',
    lugarSalida: 'Plaza de la Constitución, Olivenza (Badajoz)',
    googleMapsUrl: 'https://maps.google.com/?q=Plaza+de+la+Constitucion+Olivenza+Badajoz',
    tipoSalida: 'MTB', // 'MTB' o 'CARRETERA'
    km: 58,
    desnivel: 1150,
    velocidadMedia: 18, // Solo visible para el administrador
    duracionEstimada: '3h 45m', // Calculado automáticamente: (58 / 18 = 3.22h = 3h13m) + 30m = 3h 45m
    dificultad: 'moderada', // 'baja', 'moderada', 'dificil'
    cartelUrl: 'assets/cartel-sample.svg',
    gpxUrl: 'assets/sample-route.gpx',
    gpxNombre: 'Ruta_Sierra_de_Alor.gpx',
    cuota: 5, // Cuota opcional en euros
    bizumTelefono: '612 34 56 78',
    cuentaBancaria: 'ES91 2100 0418 4502 0005 1332',
    comida: true, // Habilita comida
    tallaCamiseta: true, // Habilita tallas
    aforoMaximo: 50
  },

  // Lista de inscritos iniciales para demostración (12 plazas ya ocupadas, quedan 38)
  inscritos: [
    {
      dorsal: 1,
      nombre: 'Antonio',
      apellidos: 'López Sánchez',
      email: 'lopezsanchez.antonio@gmail.com',
      telefono: '612 34 56 78',
      tallaCamiseta: 'L',
      comida: true,
      intolerancias: '',
      fecha: '2026-11-01 10:15',
      metodoPago: 'BIZUM',
      pagado: true
    },
    {
      dorsal: 2,
      nombre: 'Manuel',
      apellidos: 'García Pérez',
      email: 'manuel.garcia@example.com',
      telefono: '654 98 73 21',
      tallaCamiseta: 'M',
      comida: true,
      intolerancias: 'Intolerancia a la lactosa',
      fecha: '2026-11-01 11:30',
      metodoPago: 'BIZUM',
      pagado: true
    },
    {
      dorsal: 3,
      nombre: 'Carlos',
      apellidos: 'Silva Rodríguez',
      email: 'carlos.silva@example.com',
      telefono: '633 11 22 33',
      tallaCamiseta: 'XL',
      comida: true,
      intolerancias: '',
      fecha: '2026-11-01 12:45',
      metodoPago: 'TRANSFERENCIA',
      pagado: true
    },
    {
      dorsal: 4,
      nombre: 'David',
      apellidos: 'González Ramos',
      email: 'david.gonzalez@example.com',
      telefono: '677 44 55 66',
      tallaCamiseta: 'M',
      comida: false,
      intolerancias: '',
      fecha: '2026-11-01 14:20',
      metodoPago: 'BIZUM',
      pagado: false
    },
    {
      dorsal: 5,
      nombre: 'Alejandro',
      apellidos: 'Fernández Mora',
      email: 'alejandro.fernandez@example.com',
      telefono: '699 88 77 66',
      tallaCamiseta: 'L',
      comida: true,
      intolerancias: 'Alérgico a los frutos secos',
      fecha: '2026-11-01 16:05',
      metodoPago: 'BIZUM',
      pagado: true
    },
    {
      dorsal: 6,
      nombre: 'Javier',
      apellidos: 'Romero Santos',
      email: 'javier.romero@example.com',
      telefono: '611 22 33 44',
      tallaCamiseta: 'S',
      comida: true,
      intolerancias: '',
      fecha: '2026-11-01 18:10',
      metodoPago: 'BIZUM',
      pagado: true
    },
    {
      dorsal: 7,
      nombre: 'Rubén',
      apellidos: 'Vargas Díaz',
      email: 'ruben.vargas@example.com',
      telefono: '622 33 44 55',
      tallaCamiseta: 'M',
      comida: true,
      intolerancias: '',
      fecha: '2026-11-01 19:40',
      metodoPago: 'TRANSFERENCIA',
      pagado: false
    },
    {
      dorsal: 8,
      nombre: 'Alfonso',
      apellidos: 'Pinto Calzado',
      email: 'alfonso.pinto@example.com',
      telefono: '644 55 66 77',
      tallaCamiseta: 'XL',
      comida: true,
      intolerancias: 'Celíaco (sin gluten)',
      fecha: '2026-11-01 20:15',
      metodoPago: 'BIZUM',
      pagado: true
    },
    {
      dorsal: 9,
      nombre: 'Marcos',
      apellidos: 'Domínguez Gil',
      email: 'marcos.dominguez@example.com',
      telefono: '655 66 77 88',
      tallaCamiseta: 'L',
      comida: false,
      intolerancias: '',
      fecha: '2026-11-01 21:00',
      metodoPago: 'BIZUM',
      pagado: true
    },
    {
      dorsal: 10,
      nombre: 'Joaquín',
      apellidos: 'Méndez Barroso',
      email: 'joaquin.mendez@example.com',
      telefono: '666 77 88 99',
      tallaCamiseta: 'XXL',
      comida: true,
      intolerancias: '',
      fecha: '2026-11-02 08:30',
      metodoPago: 'BIZUM',
      pagado: true
    },
    {
      dorsal: 11,
      nombre: 'Pedro',
      apellidos: 'Navarro Gallego',
      email: 'pedro.navarro@example.com',
      telefono: '688 99 00 11',
      tallaCamiseta: 'M',
      comida: true,
      intolerancias: '',
      fecha: '2026-11-02 09:45',
      metodoPago: 'BIZUM',
      pagado: false
    },
    {
      dorsal: 12,
      nombre: 'Sergio',
      apellidos: 'Torres Benítez',
      email: 'sergio.torres@example.com',
      telefono: '600 11 22 33',
      tallaCamiseta: 'L',
      comida: true,
      intolerancias: '',
      fecha: '2026-11-02 11:20',
      metodoPago: 'BIZUM',
      pagado: true
    }
  ]
};

// Cargar estado desde localStorage o inicializar con datos por defecto
function loadAppState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Asegurar que conserva estructura y nuevas propiedades
      return {
        ...DEFAULT_DATA,
        ...parsed,
        quedada: {
          ...DEFAULT_DATA.quedada,
          ...(parsed.quedada || {})
        }
      };
    }
  } catch (err) {
    console.error('Error cargando datos de LocalStorage:', err);
  }
  return JSON.parse(JSON.stringify(DEFAULT_DATA));
}

// Guardar estado en localStorage
function saveAppState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Error guardando en LocalStorage:', err);
  }
}

// Instancia global en memoria
let AppState = loadAppState();

// Calcular plazas restantes
function getPlazasRestantes() {
  const max = AppState.quedada.aforoMaximo || 50;
  const ocupadas = AppState.inscritos ? AppState.inscritos.length : 0;
  return Math.max(0, max - ocupadas);
}

// Obtener el siguiente número de dorsal/inscripción
function getNextDorsal() {
  if (!AppState.inscritos || AppState.inscritos.length === 0) return 1;
  const maxDorsal = Math.max(...AppState.inscritos.map(i => i.dorsal || 0));
  return maxDorsal + 1;
}

// Exportar helpers globalmente
window.PelinaData = {
  getState: () => AppState,
  saveState: (newState) => {
    AppState = newState;
    saveAppState(AppState);
  },
  resetToDefaults: () => {
    AppState = JSON.parse(JSON.stringify(DEFAULT_DATA));
    saveAppState(AppState);
    return AppState;
  },
  calcularDuracionEstimada,
  getPlazasRestantes,
  getNextDorsal
};
