module.exports = async function(db) {
    await db.createCollection('errors', {
        validator: {
            $jsonSchema: {
                bsonType: "object",
                required: [ "key", "en_value" ],
                properties: {
                    key: {
                        bsonType: "string",
                        description: "Unique error key"
                    },
                    en_value: {
                        bsonType: "string",
                        description: "English translation of error"
                    }
                }
            }
        }
    });

    return db.collection('errors').createIndex( { "key": 1 }, { unique: true } );
}
