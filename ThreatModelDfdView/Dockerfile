# --- Estágio 1: Build ---
FROM node:22-alpine AS build
WORKDIR /app

# Copia apenas os arquivos de dependência primeiro (para cachear o npm install)
COPY package*.json ./
RUN npm install

# Copia o resto do projeto e faz o build
COPY . .

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_UR

RUN npm run build

# --- Estágio 2: Servir com Nginx ---
FROM nginx:alpine

# Copia a configuração do Nginx que criamos
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia os arquivos gerados no build para a pasta do Nginx
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
