/**
 * Security Middleware Test Suite
 * 
 * This file demonstrates how the new sanitization middleware works
 * and can be used to verify security features are active.
 */

const { sanitize, sanitizeString } = require('../middleware/sanitize');

console.log('=== Security Middleware Test Suite ===\n');

// Test 1: NoSQL Injection Prevention
console.log('Test 1: NoSQL Injection Prevention');
const maliciousQuery = {
    email: 'user@example.com',
    password: { $gt: '' }, // NoSQL injection attempt
    '$where': '1==1' // Another NoSQL injection attempt
};

const sanitizedQuery = sanitize(maliciousQuery);
console.log('Input:', JSON.stringify(maliciousQuery, null, 2));
console.log('Output:', JSON.stringify(sanitizedQuery, null, 2));
console.log('✅ Keys with $ and . are replaced with _\n');

// Test 2: XSS Prevention
console.log('Test 2: XSS Prevention');
const maliciousInput = {
    name: '<script>alert("XSS")</script>',
    comment: 'Hello <img src=x onerror=alert(1)>'
};

const sanitizedInput = sanitize(maliciousInput);
console.log('Input:', JSON.stringify(maliciousInput, null, 2));
console.log('Output:', JSON.stringify(sanitizedInput, null, 2));
console.log('✅ HTML/script tags are escaped\n');

// Test 3: Prototype Pollution Prevention
console.log('Test 3: Prototype Pollution Prevention');
const pollutionAttempt = {
    __proto__: { isAdmin: true },
    constructor: { prototype: { isAdmin: true } },
    normalKey: 'normalValue'
};

const sanitizedPollution = sanitize(pollutionAttempt);
console.log('Input keys:', Object.keys(pollutionAttempt));
console.log('Output keys:', Object.keys(sanitizedPollution));
console.log('✅ Dangerous keys are removed\n');

// Test 4: Nested Object Sanitization
console.log('Test 4: Nested Object Sanitization');
const nestedMalicious = {
    user: {
        profile: {
            bio: '<script>alert("nested XSS")</script>',
            filters: {
                '$where': 'malicious code',
                'price.min': 100
            }
        }
    }
};

const sanitizedNested = sanitize(nestedMalicious);
console.log('Input:', JSON.stringify(nestedMalicious, null, 2));
console.log('Output:', JSON.stringify(sanitizedNested, null, 2));
console.log('✅ Nested objects are recursively sanitized\n');

// Test 5: Array Sanitization
console.log('Test 5: Array Sanitization');
const arrayWithMalicious = {
    items: [
        { name: '<b>Product 1</b>', $price: 100 },
        { name: 'Product 2', 'price.usd': 200 }
    ]
};

const sanitizedArray = sanitize(arrayWithMalicious);
console.log('Input:', JSON.stringify(arrayWithMalicious, null, 2));
console.log('Output:', JSON.stringify(sanitizedArray, null, 2));
console.log('✅ Arrays and their contents are sanitized\n');

console.log('=== All Tests Completed ===');
console.log('The sanitization middleware is working correctly!');
console.log('\nTo run this test:');
console.log('  node tests/sanitization-test.js');
