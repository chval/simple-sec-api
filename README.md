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

Run tests
```
npm test
```

Start server
```
npm start
```
