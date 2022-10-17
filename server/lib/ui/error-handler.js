'use strict';

const Translation = include('ui/Translation');

function catchError(error) {
    if ( typeof(error) === 'object' && error instanceof Error ) {
        console.error(error);
        return 'The application has encountered unexpected error';
    }

    return error;
}

async function formatErrors(errors) {
    if ( typeof(errors) === 'object' ) {
        if ( errors instanceof Map ) {

            // resolve all promises with user errors
            for ( const [key, error] of errors ) {
                errors.set(key, await error.catch(e => catchError(e)));
            }

            return errors;
        } else if ( typeof(errors.then) === 'function' ) {

            // resolve user error promise
            return await errors.catch(e => catchError(e));
        }
    }

    // don't show this internal error to user
    console.error(errors);
    return await Translation.getMessage('errors.general').catch(e => catchError(e));
}

module.exports = {
    catchError,
    formatErrors
};
