'use strict';

const { MongoClient } = require('mongodb');

class MongoConnect {
    static db = null;

    // this method must be called only once
    static init() {
        const dbUser = process.env.MONGODB_TRANSLATOR_USER;
        const dbPass = process.env.MONGODB_TRANSLATOR_PASSWORD;
        const dbName = process.env.MONGODB_TRANSLATOR_DB;

        return new Promise((resolve, reject) => {
            if ( this.db !== null ) {
                reject(this.constructor.name + " can be initialized only once");
            }

            const uri = `mongodb://${dbUser}:${dbPass}@localhost:27017/${dbName}`;

            const client = new MongoClient(uri);

            client.connect().then(() => {
                this.db = client.db();
                resolve(this.db);
            }).catch(err => reject(err));
        });
    }

    static getInstance() {
        return this.db;
    }
}

module.exports = MongoConnect;
