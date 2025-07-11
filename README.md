# App de Control Financiero 💰

![Imagen de la pantalla principal de la aplicación](https://i.imgur.com/3f6072b.png)

Una aplicación móvil personal y multiplataforma, construida con React Native y Expo, para llevar un control detallado de los ingresos y gastos mensuales. La app utiliza Firebase para la autenticación y el almacenamiento de datos en tiempo real.

---

## ✨ Características Principales

* **Autenticación de Usuarios:** Sistema de registro e inicio de sesión seguro con Firebase Authentication, con opción para recordar credenciales.
* **Gestión de Transacciones:** Añade, edita y elimina ingresos o gastos de forma intuitiva.
* **Análisis Visual:** Un dashboard interactivo con un gráfico de pastel que desglosa los gastos por categoría.
* **Metas de Ahorro:** Define una meta de ahorro mensual y sigue tu progreso con una barra visual que cambia de color según tu rendimiento.
* **Recordatorios Inteligentes:** Configura recordatorios para pagos y cobros recurrentes. Marca los recordatorios como completados para cada mes.
* **Historial por Meses:** Navega fácilmente entre diferentes meses para analizar tus finanzas pasadas.
* **Modo Oscuro:** Interfaz adaptable para una mejor experiencia visual en cualquier condición de luz. La preferencia se guarda en el dispositivo.
* **Personalización:** Edita tu perfil de usuario y configura la aplicación a tu gusto.

---

## 🛠️ Tecnologías Utilizadas

<div>
  <img src="https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React Native" />
  <img src="https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white" alt="Expo" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase" />
</div>

* **Framework:** React Native con Expo
* **Lenguaje:** TypeScript
* **Base de Datos:** Google Firestore (NoSQL en tiempo real)
* **Autenticación:** Firebase Authentication
* **Navegación:** Expo Router
* **Gráficos:** `react-native-svg` para un componente de gráfico de pastel personalizado.

---

## 🚀 Cómo Empezar

Sigue estos pasos para levantar el proyecto en un entorno de desarrollo local.

**Prerrequisitos:**
* Node.js (versión LTS recomendada)
* Git
* Una cuenta de Firebase
* La aplicación Expo Go en tu dispositivo móvil (iOS o Android)

**1. Clonar el Repositorio**
```bash
git clone [https://github.com/fcbarera0210/app-financiera.git](https://github.com/fcbarera0210/app-financiera.git)
cd app-financiera
```

**2. Instalar Dependencias**
```bash
npm install
```

**3. Configurar Firebase**
* Crea un archivo `firebaseConfig.ts` en la raíz del proyecto.
* Pega tu configuración de Firebase en este archivo, asegurándote de que exporte las variables `auth` y `db` correctamente.

**4. Iniciar el Servidor de Desarrollo**
Para una conexión más estable con el dispositivo móvil, se recomienda usar el modo túnel.
```bash
npx expo start --tunnel
```

**5. Abrir la Aplicación**
Escanea el código QR que aparece en la terminal con la aplicación Expo Go en tu celular.

---

## 🔮 Próximas Mejoras

La hoja de ruta del proyecto incluye las siguientes grandes funcionalidades:

* **Notificaciones Push para Recordatorios:** Enviar alertas nativas al dispositivo.
* **Soporte Multi-Cuenta:** Gestionar diferentes billeteras (ej. Tarjeta de Crédito, Ahorros).
* **Presupuestos por Categoría:** Establecer límites de gasto mensuales por categoría.
* **Exportar Datos a CSV/PDF:** Permitir al usuario ser dueño de su información.
* **Análisis con IA (Integración con Gemini):** Un asistente financiero que ofrezca insights sobre los patrones de gasto.
