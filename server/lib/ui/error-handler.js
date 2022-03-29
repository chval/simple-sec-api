'use strict';

const Translation = include('ui/Translation');

module.exports.processError = async function(err) {
    const userErrors = [];

    if ( typeof(err) !== 'object' || err.constructor.name !== 'Array' ) {
        err = [ err ];
    }

    for ( let i = 0; i < err.length; i++ ) {
        const e = err[i];

        if ( typeof(e) === 'object' && typeof(e.then) === 'function' ) {
            userErrors.push(await e.catch(err => {
                console.error(err);
                return 'Oops! Something went wrong!';
            }));
        } else {
            console.error(e);
        }
    }

    // show general error if something unexpected happened
    if ( !userErrors.length ) {
        userErrors.push(await Translation.getMessage('errors.general').catch(err => {
            console.log(err);
            return 'The application has encountered an unknown error';
        }));
    }

    return userErrors;
}
