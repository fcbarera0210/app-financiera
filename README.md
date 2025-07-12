# App de Control Financiero 💰

![Imagen de la pantalla principal de la aplicación](https://i.imgur.com/3f6072b.png)

Una aplicación móvil personal y multiplataforma, construida con React Native y Expo, para llevar un control detallado de los ingresos y gastos mensuales. La app utiliza Firebase para la autenticación y el almacenamiento de datos en tiempo real, y su entorno de desarrollo está containerizado con Docker para una fácil configuración.

---

## ✨ Características Principales

* **Autenticación de Usuarios:** Sistema de registro e inicio de sesión seguro con Firebase Authentication.
* **Gestión de Transacciones:** Añade, edita y elimina ingresos o gastos de forma intuitiva.
* **Análisis Visual:** Un dashboard interactivo con un gráfico de pastel que desglosa los gastos por categoría.
* **Metas de Ahorro:** Define una meta de ahorro mensual y sigue tu progreso con una barra visual.
* **Recordatorios Inteligentes:** Configura recordatorios para pagos y cobros recurrentes.
* **Historial por Meses:** Navega fácilmente entre diferentes meses para analizar tus finanzas pasadas.
* **Modo Oscuro:** Interfaz adaptable para una mejor experiencia visual.
* **Personalización:** Edita tu perfil de usuario y configura la aplicación a tu gusto.

---

## 🛠️ Tecnologías Utilizadas

<div>
  <img src="https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React Native" />
  <img src="https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white" alt="Expo" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase" />
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
</div>

* **Framework:** React Native con Expo
* **Lenguaje:** TypeScript
* **Base de Datos:** Google Firestore
* **Autenticación:** Firebase Authentication
* **Navegación:** Expo Router
* **Gráficos:** `react-native-svg`
* **Containerización:** Docker

---

## 🚀 Cómo Empezar

Sigue estos pasos para levantar el proyecto en tu máquina.

### Método 1: Usando Docker (Recomendado)

Este método es el más sencillo, ya que encapsula todo el entorno de desarrollo en un contenedor.

**Prerrequisitos:**
* Git
* Docker Desktop

**1. Clonar el Repositorio**
```bash
git clone [https://github.com/fcbarera0210/app-financiera.git](https://github.com/fcbarera0210/app-financiera.git)
cd app-financiera
```

**2. Configurar Firebase**
* Crea un archivo `firebaseConfig.ts` en la raíz del proyecto.
* Pega tu configuración de Firebase en este archivo.

**3. Construir y Levantar el Contenedor**
```bash
# Construye la imagen de Docker (solo es lento la primera vez)
docker-compose build

# Levanta el contenedor y el servidor de desarrollo
docker-compose up
```

**4. Abrir la Aplicación**
* El servidor de Expo se iniciará automáticamente en modo túnel.
* Escanea el código QR que aparece en la terminal con la aplicación Expo Go en tu celular.

### Método 2: Entorno Local (Sin Docker)

**Prerrequisitos:**
* Node.js (versión LTS recomendada)
* Git
* Una cuenta de Firebase
* La aplicación Expo Go en tu dispositivo móvil (iOS o Android)

**1. Clonar e Instalar**
```bash
git clone [https://github.com/fcbarera0210/app-financiera.git](https://github.com/fcbarera0210/app-financiera.git)
cd app-financiera
npm install
```

**2. Configurar Firebase**
* Crea y configura tu archivo `firebaseConfig.ts`.

**3. Iniciar el Servidor de Desarrollo**
```bash
npx expo start --tunnel
```

---

### 🔮 Fase Actual: Funcionalidades Avanzadas

* **Notificaciones y Recordatorios v2:** `➡️ Próximo Paso` - Implementar notificaciones push y el registro rápido de transacciones desde un recordatorio.

### Próximas Fases

* **Soporte Multi-Cuenta:** Permitir la gestión de múltiples billeteras (Cuentas Corrientes, Tarjetas de Crédito, etc.).
* **Presupuestos y Análisis Avanzado:** Añadir presupuestos por categoría y herramientas de exportación de datos (CSV/PDF).
* **Personalización y Asistente IA:** Permitir reordenar el dashboard e integrar Gemini para ofrecer insights sobre los patrones de gasto.
