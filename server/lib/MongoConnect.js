'use strict';

const { MongoClient } = require('mongodb');

const settings = include('settings');

class MongoConnect {
    static db = null;

    // this method must be called only once
    static init() {
        return new Promise((resolve, reject) => {
            if ( this.db !== null ) {
                reject(this.constructor.name + ' can be initialized only once');
            }

            const client = new MongoClient(process.env.MONGODB_URI);

            client.connect().then(() => {
                const db = client.db();

                db.listCollections({ name: settings.MIGRATIONS_STORAGE_NAME }).hasNext().then(cExists => {
                    if ( cExists ) {
                        resolve(this.db = db);
                    }

                    db.createCollection(settings.MIGRATIONS_STORAGE_NAME, {
                        validator: {
                            $jsonSchema: {
                                bsonType: "object",
                                required: [ "file" ],
                                properties: {
                                    file: {
                                        bsonType: "string",
                                        description: "Migrated filename"
                                    },
                                    created_at: {
                                        bsonType: "date",
                                        description: "When filename was migrated"
                                    }
                                }
                            }
                        }
                    }).then(() => {
                        resolve(this.db = db);
                    })
                    .catch(err => reject(err));
                })
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    }

    static getInstance() {
        return this.db;
    }
}

module.exports = MongoConnect;
