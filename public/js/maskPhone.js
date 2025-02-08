function sanitizeInput(input) {
    return input.replace(/[^\d*#]/g, '');
}

function maskNumber(input) {
    return input.replace(/(\d{3})(\d{3})(\d{3})/, '$1-$2-$3');
}

export default {sanitizeInput, maskNumber}