*************************************
Secure Web Api server app
*************************************

*Example of secure Web API server application*

### Install notes

It\'s better to use [nvm](https://github.com/nvm-sh/nvm) to install latest `lts` version of NodeJS
For example
```
nvm install lts/gallium
```

Then install packages
```
npm install
```

Create server/.env file with next variables
```
SEC_API_PORT=8080
SEC_API_SESSION_SECRET=some_secret
SEC_API_SESSION_TTL_MS=60000
```

Prepare SQLite3 database. After next command `.sqlite3` database file will be created in `db/` directory
```
node server/bin/migrate.js up
```

Install and run [MongoDB Community Server](https://www.mongodb.com/try/download/community).
Then create user administrator who will have a permissions to create a new users and databases
```
use admin
db.createUser(
  {
    user: "myUserAdmin",
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

Create a new database and collection from common translation keys
```
use translations
db.common.insertOne({
    key: "exception_general",
    en_value: "Sorry, something went wrong"
})
```

Create a user who will manage translations
```
use SecApi
db.createUser(
  {
    user: "translator",
    pwd:  passwordPrompt(),
    roles: [ { role: "readWrite", db: "translations" } ]
  }
)
```

Run tests
```
npm test
```

Start server
```
npm start
```
