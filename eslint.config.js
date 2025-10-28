// eslint.config.js

const nextEslint = require('eslint-config-next/core-web-vitals');

module.exports = [
    nextEslint,
    // You can add your custom rules here if you have any.
    // This is the rule you had in your old config:
    {
        rules: {
            "react/no-unescaped-entities": "warn"
        }
    }
];