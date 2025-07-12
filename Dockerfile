# Usar una imagen oficial de Node.js como base.
# La versión 18.x.x es estable y recomendada para Expo.
FROM node:18

# Establecer el directorio de trabajo dentro del contenedor
WORKDIR /usr/src/app

# Copiar los archivos de definición de dependencias
COPY package*.json ./

# Instalar las dependencias del proyecto
RUN npm install

# Copiar el resto del código fuente del proyecto al contenedor
COPY . .

# Exponer los puertos necesarios para Expo
EXPOSE 8081

# El comando que se ejecutará al iniciar el contenedor.
# Ahora incluye --tunnel para iniciar siempre en modo túnel.
CMD [ "npx", "expo", "start", "--tunnel" ]
