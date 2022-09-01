module.exports = function(db) {
    return db.collection('messages').insertOne({key: 'registration_success', en_value: 'Registration successfully completed!'});
}
