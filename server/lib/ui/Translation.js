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
                    return resolve(`${code}`);
                }

                let key = '_value';

                const defaultKey = 'en' + key;
                let val = defaultKey in obj ? obj[defaultKey] : undefined;

                if ( lang ) {
                    const langKey = lang + key;

                    if ( langKey in obj && obj[langKey] ) {
                        val = obj[langKey];
                    } else {
                        console.error(`No ${lang} translation found for ${code}`);
                    }
                }

                if ( !val ) {
                    console.error(`No text for ${code}`);
                    val = code;
                }

                resolve(val);
            })
            .catch(err => {
                console.error(err);
                reject('Oops! Something went wrong!');
            });
        });
    }
}

module.exports = Translation;
