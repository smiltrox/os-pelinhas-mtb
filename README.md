# 🚴 OS PELINHAS M.T.B. & CARRETERA - Aplicación Web de Quedadas Ciclistas

Aplicación web moderna y adaptada a dispositivos móviles diseñada para el club ciclista **OS PELINHAS M.T.B. (Olivenza - Badajoz)** en su **20º Aniversario (2007 - 2027)**.
Permite gestionar y publicar quedadas de **Bicicleta de Montaña (MTB)** y **Carretera** con aforo estricto de **50 plazas**, inscripciones automáticas con dorsal correlativo (#1 a #50), descarga de rutas en GPX, y envío automático de correos electrónicos.

---

## 🌟 Características Principales

### 🚴‍♂️ Vista de Invitados (Pública)
- **Cartel de la Quedada**: El elemento con mayor visibilidad de la web.
- **Nombre de la Quedada**: Destacado obligatoriamente justo **encima del cartel**.
- **Semáforo de Dificultad**:
  - 🟢 **Baja** (Verde)
  - 🟡 **Moderada** (Amarillo)
  - 🔴 **Difícil** (Rojo)
- **Tipo de Salida**: Distintivo visual claro entre **MTB** y **CARRETERA**.
- **Ficha Técnica Completa**:
  - Día y hora de salida.
  - Dirección del punto de encuentro con enlace directo a **Google Maps**.
  - Kilómetros (KM) y Desnivel positivo acumulado (+ m).
  - **Duración Estimada**: Calculada automáticamente por la fórmula: `(KM / Velocidad media) + 30 min de descanso/desayuno`. *(El invitado solo ve la duración final, la velocidad media es privada del administrador)*.
  - Botón de descarga directa del **Track GPX** para Garmin, Wahoo, Strava, etc.
- **Contador de PLAZAS**:
  - Muestra claramente `PLAZAS: X` (empieza en 50 y va restando).
  - Barra de aforo visual con cambio de color según urgencia.
  - Al llegar a 0 plazas: Se bloquea automáticamente el botón y cambia a `🚫 INSCRIPCIONES CERRADAS`.
- **Ventana Emergente (Modal de "¡APÚNTATE!")**:
  - Campos obligatorios: Nombre, Apellidos, Email y Teléfono de contacto.
  - **Cuota de Inscripción**: Si está configurada, muestra el importe, datos de **BIZUM** con el teléfono del club y botón para copiarlo, e **IBAN de cuenta corriente** para transferencia bancaria.
  - **Comida de Convivencia**: Si está habilitada, incluye checkbox de asistencia y casilla de intolerancias / alergias alimentarias con campo de observaciones libre.
  - **Talla de Camiseta**: Si está habilitada, desplegable de tallas: XS, S, M, L, XL, XXL, XXXL.
  - **Comprobante instantáneo**: Asigna el dorsal secuencial (#1, #2... #50), lanza confeti y permite imprimir o guardar el resguardo.

---

### 🔒 Panel de Administrador (Exclusivo para Antonio)
- **Acceso Protegido por PIN / Contraseña** (Por defecto: `pelinhas2024`, modificable en ajustes).
- **Gestión de Quedadas**:
  - Alta y edición completa de quedadas.
  - Subida directa de foto de cartel (archivo o enlace) con previsualización.
  - Subida de archivo GPX descargable.
  - Campo exclusivo de **Velocidad Media (km/h)** que calcula en tiempo real la duración estimada + 30 min.
  - Interruptores para activar o desactivar comida, camiseta y cuotas de pago.
- **Apartado de INSCRITOS**:
  - Métricas en tiempo real: Plazas ocupadas, plazas libres, total comensales y recaudación.
  - Buscador dinámico por nombre, apellidos, teléfono o dorsal.
  - Filtro por estado de pago (Pagado / Pendiente).
  - Botón con 1 clic para marcar pagos recibidos (Bizum o transferencia).
  - Botón para eliminar inscritos (lo que **libera automáticamente la plaza** en el contador público).
  - **Botón "Añadir Manual"**: Para registrar a socios que avisen por WhatsApp o llamada.
  - **Exportación a Excel / CSV**: Descarga instantánea compatible con Microsoft Excel.
  - **Impresión de Listado**: Formato limpio para imprimir la lista de dorsales el día de la ruta.

---

## 📧 Sistema de Envío Automático de Correos (100% Gratuito)

Cada inscripción envía **2 correos automáticos**:
1. **Al Administrador (`lopezsanchez.antonio@gmail.com`)**: Notificación instantánea con todos los datos del participante (teléfono con enlace directo a WhatsApp, email, comida, alergias, talla, cuota).
2. **Al Participante**: Correo de confirmación desde `soportepelinhas@gmail.com` con su **Número de Inscripción / Dorsal (#X)**, ficha de la ruta, punto de encuentro en Google Maps y datos de Bizum / cuenta si procede.

### 🚀 Instalación del Webhook de Correo en 2 minutos:
1. Inicia sesión en [https://script.google.com](https://script.google.com) con la cuenta `soportepelinhas@gmail.com`.
2. Pulsa en **"Nuevo proyecto"** y nómbralo `Os Pelinhas MTB API`.
3. Abre el archivo [`backend/GoogleAppsScript.js`](backend/GoogleAppsScript.js) de este proyecto, copia todo su contenido y pégalo en el editor de Google.
4. Haz clic en el botón azul superior **Implementar > Nueva implementación**.
5. Selecciona tipo **"Aplicación web"**:
   - **Descripción**: `API Correos Os Pelinhas`
   - **Ejecutar como**: `Yo (soportepelinhas@gmail.com)`
   - **Quién tiene acceso**: `Cualquier persona`
6. Pulsa **Implementar**, acepta los permisos de Google.
7. Copia la **URL de la aplicación web** (termina en `/exec`).
8. Entra en tu web > **Panel Admin** > pestaña **Configuración y Correos**, pega la URL en el campo correspondiente y pulsa **Probar Conexión de Correo**.

*¡Y listo! Además de enviar los correos, creará automáticamente una hoja de cálculo en Google Sheets con todos los inscritos en tiempo real.*

---

## 🌐 Cómo Alojar la Web en GitHub Pages

Esta aplicación está creada con estándares web puros (HTML5, Tailwind CSS y JavaScript modular). **No requiere Node.js, compilación ni servidores de pago.**

### Pasos para subir a GitHub:
1. Crea un nuevo repositorio en tu cuenta de GitHub (por ejemplo, `os-pelinhas-mtb`).
2. Sube todos los archivos y carpetas de este proyecto:
   - `index.html`
   - `assets/` (con el logo y las imágenes)
   - `css/`
   - `js/`
   - `backend/`
3. En GitHub, entra en tu repositorio y ve a **Settings (Configuración)** > pestaña **Pages** (en el menú lateral izquierdo).
4. En **Build and deployment > Source**, selecciona **Deploy from a branch**.
5. En **Branch**, selecciona `main` (o `master`) y carpeta `/ (root)`, luego pulsa **Save**.
6. En 1-2 minutos, GitHub te dará la URL pública oficial de tu web (ejemplo: `https://tuusuario.github.io/os-pelinhas-mtb/`).

---

## 🎨 Identidad Visual del Club
- **Colores Oficiales**:
  - Amarillo Competición: `#FFE500`
  - Negro Carbono: `#0D0F14` / `#151821`
  - Acentos: `#232836` y blanco
- **Logo Oficial**: Emblema 20º Aniversario (2007 - 2027) integrado en cabecera, favicons y comprobantes.
- **Tipografía**: Chakra Petch & Inter.

---

## 🚲 Club Ciclista Os Pelinhas M.T.B. Olivenza
*Veinte años pedaleando juntos por las sierras y caminos de Extremadura y Portugal.*
