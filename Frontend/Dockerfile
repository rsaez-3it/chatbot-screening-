# Etapa 1: Build
  FROM node:22-alpine AS build
 
  # Instalar git (necesario para npm install de repos git)
  RUN apk add --no-cache git
 
  WORKDIR /app
 
  # Definir el argumento para el token
  ARG TOKEN_GITHUB
 
  # Copiar archivos de dependencias
  COPY package*.json ./
 
  # Reemplazar el token en package.json antes de instalar
  RUN sed -i "s|TOKEN_GITHUB|$TOKEN_GITHUB|g" package.json && npm install
 
  # Copiar el resto del código
  COPY . .
 
  # Construir la aplicación
  RUN npm run build
 
  # Etapa 2: Producción
  FROM nginx:alpine
 
  # Copiar build desde la etapa anterior
  COPY --from=build /app/dist /usr/share/nginx/html
 
  # Copiar configuración de nginx
  # COPY nginx.conf /etc/nginx/conf.d/default.conf
 
  # Exponer puerto 80
  EXPOSE 80
 
  # Comando para ejecutar nginx
  CMD ["nginx", "-g", "daemon off;"]