
/**
 * Checks to see of a value is a valid integer in a string
 */
exports.check_int = function (value) {
    return !isNaN(value) && value.indexOf(".") === -1;
};
