/*
 * Create and export configuration constiables
 *
 */

// Container for all the environments
const environments = {};

// Staging (default) object
environments.staging = {
  'httpPort' : 3000,
  'httpsPort': 3001,
  'envName' : 'staging',
};

// Production object
environments.production = {
  'httpPort' : 5000,
  'httpsPort' : 5001,
  'envName' : 'production',
};

// Determine which environment was passed in a command line argument
const currentEnvironment = typeof process.env.NODE_ENV === 'string' ? process.env.NODE_ENV.toLowerCase() :'';

// Check that the current environment is one of the environments above otherwise default to Staging
const environmentToExport = typeof environments[currentEnvironment] === 'object' ? environments[currentEnvironment] : environments.staging;

// Export the selected environment
module.exports = environmentToExport;
