const acorn = require('acorn');

exports.validateSyntax = function(code) {
    try {
        // Intenta parsear el código
        acorn.parse(code, {
            ecmaVersion: 2022, // Soporta sintaxis moderna (async/await, optional chaining, etc.)
            sourceType: 'module', // Permite import/export
            allowHashBang: true 
        });

        return { valid: true };

    } catch (error) {
        return {
            valid: false,
            error: {
                type: 'syntax-error',
                message: `Error de sintaxis en línea ${error.loc?.line || '?'}: ${error.message}`,
                line: error.loc?.line,
                column: error.loc?.column
            }
        };
    }
};
