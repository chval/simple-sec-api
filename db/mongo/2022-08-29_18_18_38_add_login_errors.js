module.exports = function(db) {
    return db.collection('errors').insertMany([
        {key: 'general', en_value: 'Sorry, something went wrong :('},
        {key: 'email_required', en_value: 'Email address is required'},
        {key: 'password_required', en_value: 'Password is required'},
        {key: 'login_unverified', en_value: "Can't verify user with provided credentials"},
        {key: 'user_exists', en_value: 'This user already exists'}
    ])
}
