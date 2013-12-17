
exports.check_int = function (value) {
    return !isNaN(value) && value.indexOf(".") === -1;
};
