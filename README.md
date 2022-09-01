# Secure Web Api server app
Example of secure Web API server application.

## Install NodeJS and modules
It\'s better to use [nvm](https://github.com/nvm-sh/nvm) to install latest `lts` version of NodeJS.<br>
For example:
```
nvm install lts/gallium
```

Then install packages:
```
npm install
```

## Configure MongoDB
Used for errors, messages and content localization. As it's easy to add translations on a new languages into NoSQL database.<br>
Install and run [MongoDB Community Server](https://www.mongodb.com/try/download/community).
Then create user administrator who will have a permissions to create a new users and databases:
```
use admin
db.createUser(
  {
    user: "administrator",
    pwd: passwordPrompt(),
    roles: [
      { role: "userAdminAnyDatabase", db: "admin" },
      { role: "readWriteAnyDatabase", db: "admin" }
    ]
  }
)
```

To protect from unauthorized access to db, add next option to `/etc/mongod.conf`
```
security:
  authorization: enabled
```

Create a user who will manage translations:
```
use SecApi
db.createUser(
  {
    user: "translator",
    pwd:  passwordPrompt(),
    roles: [ { role: "readWrite", db: "SecApi" } ]
  }
)
```

## Configure environment variables
Create <ins>server/.env</ins> file with next variables:
```
SEC_API_PORT=8080
SEC_API_SESSION_SECRET=

# 24 hours = 1000 * 60 * 60 * 24 ms
SEC_API_SESSION_TTL_MS=86400000

# translator is a user that have read/write permissions in SecApi database
MONGODB_URI=mongodb://translator:<PASSWORD>@localhost:27017/SecApi
```

## Run migration files
SQLite3 database doesn't require any additional configurations.<br>
Just run next command and `.sqlite3` database file will be created in `db/` directory:
```
node server/bin/migrate.js up
```

MongoDB require some [configuration](#configure-mongodb) and must be running as a service.<br>
To start service in MacOS:
```
brew services start mongodb-community
```

Then execute all migration files:
```
node server/bin/migrate.js up -t mongo
```

## Run tests and start server
```
npm test
npm start
```
