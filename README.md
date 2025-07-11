App de Control Financiero
Una aplicación móvil personal, construida con React Native y Expo, para llevar un control detallado de los ingresos y gastos mensuales. La app utiliza Firebase para la autenticación y el almacenamiento de datos en tiempo real.

✨ Características Principales
Autenticación de Usuarios: Sistema de registro e inicio de sesión seguro con Firebase Auth.

Gestión de Transacciones: Añade, edita y elimina ingresos o gastos.

Análisis Visual: Un dashboard interactivo con un gráfico de pastel que desglosa los gastos por categoría.

Metas de Ahorro: Define una meta de ahorro mensual y sigue tu progreso con una barra visual.

Recordatorios Inteligentes: Configura recordatorios para pagos y cobros recurrentes para no olvidar nunca un movimiento.

Historial por Meses: Navega fácilmente entre diferentes meses para analizar tus finanzas pasadas.

Modo Oscuro: Interfaz adaptable para una mejor experiencia visual en cualquier condición de luz.

Personalización: Edita tu perfil de usuario y configura la aplicación a tu gusto.

🛠️ Tecnologías Utilizadas
Framework: React Native con Expo

Lenguaje: TypeScript

Base de Datos: Google Firestore (NoSQL en tiempo real)

Autenticación: Firebase Authentication

Navegación: Expo Router

Gráficos: react-native-svg para un componente de gráfico de pastel personalizado.

🚀 Cómo Empezar
Sigue estos pasos para levantar el proyecto en un entorno de desarrollo local.

Prerrequisitos:

Node.js (versión LTS recomendada)

Git

Una cuenta de Firebase

La aplicación Expo Go en tu dispositivo móvil (iOS o Android)

1. Clonar el Repositorio

git clone https://github.com/fcbarera0210/app-financiera.git
cd app-financiera

2. Instalar Dependencias

npm install

3. Configurar Firebase

Crea un archivo firebaseConfig.ts en la raíz del proyecto.

Pega tu configuración de Firebase en este archivo, asegurándote de que exporte las variables auth y db correctamente.

4. Iniciar el Servidor de Desarrollo
Para una conexión más estable con el dispositivo móvil, se recomienda usar el modo túnel.

npx expo start --tunnel

5. Abrir la Aplicación
Escanea el código QR que aparece en la terminal con la aplicación Expo Go en tu celular.

🔮 Próximas Mejoras
Puedes revisar nuestra hoja de ruta actualizada aquí. (Nota: Este enlace es un placeholder, ya que nuestro documento actual es privado. En un proyecto real, podrías enlazar a la sección de "Projects" o "Issues" de GitHub).

Notificaciones Push para Recordatorios

Soporte Multi-Cuenta

Presupuestos por Categoría

Exportar Datos a CSV/PDF

Análisis con IA (Integración con Gemini)