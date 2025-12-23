# Usa una imagen oficial de Node.js basada en Alpine para reducir superficie de ataque
FROM node:22-alpine

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia los archivos de dependencias
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Copia el resto del código fuente
COPY . .

# Expone el puerto (ajusta si tu app usa otro)
EXPOSE 4000

# Comando para iniciar la aplicación
CMD ["node", "src/server.js"]