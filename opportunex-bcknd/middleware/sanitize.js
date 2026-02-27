/**
 * Comprehensive Sanitization Middleware for Express 5+
 * 
 * Provides protection against:
 * - NoSQL Injection (removes $ and . from keys)
 * - XSS attacks (sanitizes HTML/script content)
 * 
 * Compatible with Express 5's read-only property descriptors (req.query, req.params)
 */

const xssFilters = require('xss-filters');

// Regex patterns for detection
const NOSQL_INJECTION_REGEX = /^\$|\./;
const NOSQL_REPLACE_REGEX = /^\$|\./g;

/**
 * Check if value is a plain object
 */
function isPlainObject(obj) {
    return typeof obj === 'object' && obj !== null && !Array.isArray(obj);
}

/**
 * Sanitize a string value against XSS
 */
function sanitizeString(str) {
    if (typeof str !== 'string') {
        return str;
    }

    // Use xss-filters for XSS protection
    // This library is more lightweight and doesn't try to modify req properties
    return xssFilters.inHTMLData(str);
}

/**
 * Recursively sanitize an object/array
 * - Removes NoSQL injection attempts ($ and . in keys)
 * - Sanitizes string values against XSS
 * 
 * @param {*} input - The input to sanitize
 * @param {string} replaceChar - Character to replace prohibited chars with
 * @returns {*} - Sanitized version of the input
 */
function sanitizeValue(input, replaceChar = '_') {
    // Handle arrays
    if (Array.isArray(input)) {
        return input.map(item => sanitizeValue(item, replaceChar));
    }

    //Handle plain objects
    if (isPlainObject(input)) {
        const sanitized = {};

        for (const key in input) {
            if (Object.prototype.hasOwnProperty.call(input, key)) {
                let sanitizedKey = key;

                // Check for NoSQL injection in key names
                if (NOSQL_INJECTION_REGEX.test(key)) {
                    sanitizedKey = key.replace(NOSQL_REPLACE_REGEX, replaceChar);
                    console.warn(`[Security] Sanitized NoSQL injection attempt: "${key}" -> "${sanitizedKey}"`);
                }

                // Avoid dangerous prototype pollution keys
                if (
                    sanitizedKey === '__proto__' ||
                    sanitizedKey === 'constructor' ||
                    sanitizedKey === 'prototype'
                ) {
                    console.warn(`[Security] Blocked dangerous key: "${sanitizedKey}"`);
                    continue; // Skip this key entirely
                }

                // Recursively sanitize the value
                sanitized[sanitizedKey] = sanitizeValue(input[key], replaceChar);
            }
        }

        return sanitized;
    }

    // Handle strings - sanitize for XSS
    if (typeof input === 'string') {
        const sanitized = sanitizeString(input);
        if (sanitized !== input) {
            console.warn('[Security] Sanitized XSS attempt in string value');
        }
        return sanitized;
    }

    // Return other types as-is (numbers, booleans, null, etc.)
    return input;
}

/**
 * Express middleware for comprehensive request sanitization
 * Compatible with Express 5+
 */
function sanitizeMiddleware(options = {}) {
    const replaceChar = options.replaceWith || '_';

    return function (req, res, next) {
        try {
            // Sanitize req.body (writable, can be replaced)
            if (req.body && typeof req.body === 'object') {
                req.body = sanitizeValue(req.body, replaceChar);
            }

            // For req.query and req.params, we need a different approach since they're read-only in Express 5
            // We'll create a sanitized version and then copy properties back

            if (req.query && Object.keys(req.query).length > 0) {
                const sanitizedQuery = sanitizeValue(req.query, replaceChar);

                // Only modify if different
                if (JSON.stringify(req.query) !== JSON.stringify(sanitizedQuery)) {
                    // Try to modify in place
                    // This might work or might not depending on Express configuration
                    try {
                        Object.keys(req.query).forEach(key => delete req.query[key]);
                        Object.assign(req.query, sanitizedQuery);
                    } catch (error) {
                        // If we can't modify req.query, log a warning
                        console.warn('[Security] Could not sanitize req.query (read-only). Consider sanitizing at route level.');
                    }
                }
            }

            if (req.params && Object.keys(req.params).length > 0) {
                const sanitizedParams = sanitizeValue(req.params, replaceChar);

                if (JSON.stringify(req.params) !== JSON.stringify(sanitizedParams)) {
                    try {
                        Object.keys(req.params).forEach(key => delete req.params[key]);
                        Object.assign(req.params, sanitizedParams);
                    } catch (error) {
                        console.warn('[Security] Could not sanitize req.params (read-only). Consider sanitizing at route level.');
                    }
                }
            }

            // Sanitize cookies if present
            if (req.cookies && typeof req.cookies === 'object') {
                req.cookies = sanitizeValue(req.cookies, replaceChar);
            }

        } catch (error) {
            console.error('[Security] Error during request sanitization:', error);
            // Don't block the request, just log the error
        }

        next();
    };
}

// Export the middleware and utility functions
module.exports = sanitizeMiddleware;
module.exports.sanitize = sanitizeValue;
module.exports.sanitizeString = sanitizeString;
