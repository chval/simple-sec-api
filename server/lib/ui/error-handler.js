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
    const userErrors = [];

    if ( typeof(errors) !== 'object' || errors.constructor.name !== 'Array' ) {
        errors = [ errors ];
    }

    for ( let i = 0; i < errors.length; i++ ) {
        const err = errors[i];

        if ( typeof(err) === 'object' && typeof(err.then) === 'function' ) {
            userErrors.push(await err.catch(e => catchError(e)));
        } else {
            console.error(err);
        }
    }

    // show general error if something unexpected happened
    if ( !userErrors.length ) {
        const errMsg = await Translation.getMessage('errors.general').catch(e => catchError(e));

        userErrors.push(errMsg);
    }

    return userErrors;
}

module.exports = {
    catchError,
    formatErrors
};
