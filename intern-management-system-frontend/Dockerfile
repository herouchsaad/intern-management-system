# ============================================================
# STAGE 1 — Builder : compile et bundle l'app React
# ============================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copier package files EN PREMIER (optimise le cache Docker)
COPY package*.json ./

# Installer toutes les dépendances
RUN npm ci

# Copier tout le code source
COPY . .

# Variables d'environnement nécessaires au BUILD React
# Puisque Nginx sert de reverse proxy, les appels API doivent se faire vers la même origine (/)
# Le navigateur enverra la requête à localhost/api/ et Nginx redirigera vers le backend.
ARG REACT_APP_PROXY=""
ARG REACT_APP_API_KEY=AIzaSyChuSGkJ96STFxFGYKwEJhRLb5b1w820n4
ENV REACT_APP_PROXY=$REACT_APP_PROXY
ENV REACT_APP_API_KEY=$REACT_APP_API_KEY

# Compiler l'application React → dossier /app/build
RUN npm run build

# ============================================================
# STAGE 2 — Production : serveur Nginx ultra-léger
# ============================================================
FROM nginx:1.25-alpine AS production

# Supprimer la configuration Nginx par défaut
RUN rm /etc/nginx/conf.d/default.conf

# Copier notre configuration Nginx personnalisée
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copier les fichiers statiques buildés par React
COPY --from=builder /app/build /usr/share/nginx/html

# Exposer le port HTTP
EXPOSE 80

# Démarrer Nginx en mode foreground (important pour Docker)
CMD ["nginx", "-g", "daemon off;"]
