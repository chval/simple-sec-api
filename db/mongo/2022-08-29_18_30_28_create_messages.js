module.exports = async function(db) {
    await db.createCollection('messages', {
        validator: {
            $jsonSchema: {
                bsonType: "object",
                required: [ "key", "en_value" ],
                properties: {
                    key: {
                        bsonType: "string",
                        description: "Unique message key"
                    },
                    en_value: {
                        bsonType: "string",
                        description: "English translation of message"
                    }
                }
            }
        }
    });

    return db.collection('messages').createIndex( { "key": 1 }, { unique: true } );
}
