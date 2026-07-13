# ============================================================
# STAGE 1 — Builder : compile TypeScript → JavaScript
# ============================================================
FROM node:20-alpine AS builder

# Installer les outils nécessaires pour bcrypt (nécessite python + make + g++)
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copier package files EN PREMIER (optimise le cache Docker)
COPY package*.json ./

# Installer TOUTES les dépendances (y compris devDeps pour tsc)
RUN npm ci

# Copier le tsconfig et le code source
COPY tsconfig.json ./
COPY roles_list.ts ./
COPY src/ ./src/

# Compiler src/ → dist/ selon le tsconfig (include: src/**)
RUN npx tsc

# Compiler roles_list.ts SÉPARÉMENT car il est hors du dossier src/
# → génère roles_list.js dans le même répertoire /app/roles_list.js
# (dist/server.js l'importe via "../roles_list.js" = /app/roles_list.js)
RUN node -e "\
const ts = require('typescript');\
const src = require('fs').readFileSync('roles_list.ts', 'utf8');\
const result = ts.transpileModule(src, {\
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 }\
});\
require('fs').writeFileSync('roles_list.js', result.outputText);\
"

# ============================================================
# STAGE 2 — Production : image légère sans devDependencies
# ============================================================
FROM node:20-alpine AS production

# Installer uniquement les outils runtime nécessaires pour bcrypt
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copier uniquement package.json pour installer les deps de prod
COPY package*.json ./

# Installer uniquement les dépendances de production
RUN npm ci --omit=dev

# Copier le code compilé depuis le builder
COPY --from=builder /app/dist ./dist

# Copier roles_list.js compilé séparément depuis le builder
# (nécessaire car dist/server.js l'importe via "../roles_list.js")
COPY --from=builder /app/roles_list.js ./roles_list.js

# Créer les dossiers uploads nécessaires (cv, photos, documents, garbage)
RUN mkdir -p dist/src/uploads/cv \
             dist/src/uploads/photos \
             dist/src/uploads/documents \
             dist/src/uploads/garbage

# Exposer le port du serveur Express
EXPOSE 5000

# Démarrer le serveur compilé — dist/src/server.js car tsconfig compile src/ → dist/src/
CMD ["node", "dist/src/server.js"]
