'use strict';

function pad(number) {
    if ( number < 10 ) {
        return '0' + number;
    }

    return number;
}

function format(date) {
    return date.getUTCFullYear() +
        '-' + pad(date.getUTCMonth() + 1) +
        '-' + pad(date.getUTCDate()) +
        '_' + pad(date.getUTCHours()) +
        '_' + pad(date.getUTCMinutes()) +
        '_' + pad(date.getUTCSeconds());
}

module.exports.date4filename = format;
