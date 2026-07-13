# 🚀 Intern Management System (IMS)

Une application complète de gestion des stagiaires avec backend Express, frontend React (servi par Nginx) et base de données PostgreSQL, entièrement dockerisée.

---

## 🛠️ Prérequis

- **Docker** et **Docker Compose** installés sur votre machine.

---

## 🏃 Démarrage Rapide

### 1. Cloner/Récupérer le projet
Assurez-vous d'avoir tous les fichiers du projet dans votre dossier de travail.

### 2. Configurer les variables d'environnement
Le fichier `.env` est ignoré par Git pour des raisons de sécurité. Copiez le fichier d'exemple et renommez-le :
```bash
cp .env.example .env
```
*(Vous pouvez modifier les mots de passe et les secrets JWT dans ce nouveau fichier `.env` si vous le souhaitez).*

### 3. Lancer l'application
Exécutez la commande suivante à la racine du projet pour construire et lancer les conteneurs en arrière-plan :
```bash
docker-compose up -d --build
```

L'application va :
1. Démarrer la base de données PostgreSQL (`ims_db`).
2. Exécuter automatiquement le script d'initialisation SQL (`ims-tables.sql`) pour créer les tables et insérer le compte administrateur par défaut.
3. Démarrer le backend Express (`ims_backend`).
4. Compiler l'application React et lancer le serveur Nginx (`ims_frontend`).

---

## 🔑 Identifiants de connexion par défaut

Une fois l'application démarrée, rendez-vous sur [http://localhost/ims/login](http://localhost/ims/login) et connectez-vous :

- **Nom d'utilisateur :** `admin`
- **Mot de passe :** `Admin1234!`

> ⚠️ **Important :** N'oubliez pas de modifier ce mot de passe ou de supprimer ce compte dans un environnement de production.

---

## 📡 Ports et Accès

- 💻 **Application Web (Frontend) :** [http://localhost](http://localhost) (Port `80`)
- ⚙️ **API (Backend) :** [http://localhost:5000](http://localhost:5000) (Port `5000`)
- 🗄️ **Base de données (PostgreSQL) :** `localhost:5433` (Exposée sur le port `5433` en local pour pgAdmin/DBeaver)

---

## 🛠️ Commandes Utiles

### Arrêter l'application
```bash
docker-compose down
```

### Voir les logs
```bash
# Pour tous les services
docker-compose logs -f

# Pour un service spécifique
docker-compose logs -f frontend
docker-compose logs -f backend
```

### Reconstruire les conteneurs (après modification du code)
```bash
docker-compose up -d --build
```
