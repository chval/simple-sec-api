module.exports = function(db) {
    return db.collection('errors').insertOne({key: 'not_implemented', en_value: 'Sorry, this feature is not yet implemented'});
}
