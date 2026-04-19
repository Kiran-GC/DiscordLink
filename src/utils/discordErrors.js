function isMissingPermissionsError(error) {
    return error?.code === 50013 || error?.status === 403;
}

function isUnknownMessageError(error) {
    return error?.code === 10008;
}

module.exports = {
    isMissingPermissionsError,
    isUnknownMessageError
};