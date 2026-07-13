# intern-management-system-backend

This is the backend part of the intern management system. You can see more details about the project here https://github.com/ItsYusufDemir/intern-management-system-frontend

In the backend, Node.js is used with Express.js framework. For the database, PostgreSQL is used. Endpoints are highly secured by JWT authentication system. There are public, semiprivate and private routes. Semiprivate and private routes can only be accessed with valid access token and user role.

## How to run?

1. Create a database using PostgreSQL.
2. Install latest version of the Node.js to your system.
3. Clone this repository.
4. Run **npm install** to install all the libraries.
5. Create a uploads folder in the src directory. Inside it, create cv, photos, documents, and garbage folders since they are kept as files in the backend.
6. Create a .env file and put these values;\
  ACCESS_TOKEN_SECRET= create a 128 random hex character for JWT (you can do this in node: require("crypto").randomBytes(64).toString("hex"))\
  REFRESH_TOKEN_SECRET=  create a 128 random hex character for JWT (you can do this in node: require("crypto").randomBytes(64).toString("hex"))\
  GMAIL_APP_PASSWORD= create a gmail app password from gmail settings to send mails (Optional, but you will get errors while sending mail if you do not provide it)\
  GOOGLE_CALENDAR_API_KEY=AIzaSyChuSGkJ96STFxFGYKwEJhRLb5b1w820n4\
  DATABASE_PORT= "your_database_port" (by default 5432)\
  DATABASE_HOST= localhost\
  DATABASE_NAME= "your_database_name"\
  DATABASE_USER= "your_database_user"\
  DATABASE_PASSWORD= "your_database_password"

7.Run **npm run start** to start the server.




