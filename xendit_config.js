/**
 * Xendit API Configuration Helper
 * 
 * This helper provides secure access to Xendit API credentials from environment variables.
 * All API keys must be configured in environment variables - never hardcode them!
 * 
 * Usage:
 *   const { getXenditApiKey, getXenditSecretKey } = require('./xendit_config');
 *   const apiKey = getXenditApiKey();
 */

/**
 * Get Xendit API Key from environment variables
 * @returns {string} The Xendit API key
 * @throws {Error} If the API key is not configured
 */
function getXenditApiKey() {
  const apiKey = process.env.XENDIT_API_KEY || process.env.XENDIT_SECRET_KEY;
  
  if (!apiKey) {
    throw new Error(
      'XENDIT_API_KEY is not configured in environment variables. ' +
      'Please set XENDIT_API_KEY in your .env file or environment. ' +
      'Never commit API keys to version control!'
    );
  }
  
  return apiKey;
}

/**
 * Get Xendit Secret Key from environment variables
 * @returns {string} The Xendit secret key
 * @throws {Error} If the secret key is not configured
 */
function getXenditSecretKey() {
  const secretKey = process.env.XENDIT_SECRET_KEY;
  
  if (!secretKey) {
    throw new Error(
      'XENDIT_SECRET_KEY is not configured in environment variables. ' +
      'Please set XENDIT_SECRET_KEY in your .env file or environment. ' +
      'Never commit API keys to version control!'
    );
  }
  
  return secretKey;
}

/**
 * Get Xendit Public Key from environment variables
 * @returns {string} The Xendit public key
 * @throws {Error} If the public key is not configured
 */
function getXenditPublicKey() {
  const publicKey = process.env.REACT_APP_XENDIT_PUBLIC_KEY;
  
  if (!publicKey) {
    throw new Error(
      'REACT_APP_XENDIT_PUBLIC_KEY is not configured in environment variables. ' +
      'Please set REACT_APP_XENDIT_PUBLIC_KEY in your .env file or environment. ' +
      'Never commit API keys to version control!'
    );
  }
  
  return publicKey;
}

/**
 * Get Xendit Callback Token from environment variables
 * @returns {string|null} The Xendit callback token or null if not configured
 */
function getXenditCallbackToken() {
  return process.env.XENDIT_CALLBACK_TOKEN || null;
}

/**
 * Validate that all required Xendit environment variables are configured
 * @returns {Object} Validation result with success status and any missing variables
 */
function validateXenditConfig() {
  const missing = [];
  const warnings = [];
  
  if (!process.env.XENDIT_SECRET_KEY) {
    missing.push('XENDIT_SECRET_KEY');
  }
  
  if (!process.env.REACT_APP_XENDIT_PUBLIC_KEY) {
    missing.push('REACT_APP_XENDIT_PUBLIC_KEY');
  }
  
  if (!process.env.XENDIT_CALLBACK_TOKEN) {
    warnings.push('XENDIT_CALLBACK_TOKEN (recommended for webhook security)');
  }
  
  return {
    isValid: missing.length === 0,
    missing,
    warnings,
    message: missing.length > 0 
      ? `Missing required Xendit environment variables: ${missing.join(', ')}`
      : 'All required Xendit environment variables are configured'
  };
}

module.exports = {
  getXenditApiKey,
  getXenditSecretKey,
  getXenditPublicKey,
  getXenditCallbackToken,
  validateXenditConfig
};