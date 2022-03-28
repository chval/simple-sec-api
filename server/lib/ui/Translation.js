'use strict';

const MongoConnect = include('MongoConnect');

class Translation {
    static getMessage(code, lang) {
        return new Promise((resolve, reject) => {
            const [collectionName,codeName] = code.split('.');

            const db = MongoConnect.getInstance();

            db.collection(collectionName).findOne({key: codeName})
            .then(obj => {
                if ( !obj ) {
                    console.error(`No '${codeName}' key found in '${collectionName}' collection`);
                    resolve(`${code}`);
                }

                let key = '_value';

                const defaultKey = 'en' + key;
                let val = obj[defaultKey];

                if ( lang ) {
                    const langKey = lang + key;

                    if ( obj[langKey] ) {
                        val = obj[langKey];
                    }
                }

                val ||= codeName;

                resolve(val);
            })
            .catch(err => reject(err));
        });
    }
}

module.exports = Translation;
