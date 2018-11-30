/*
 * Primary file for the API
 * Based on code by Pirple
 *
 */

// Dependencies
const http = require('http');
const https = require('https');
const url = require('url');
const stringDecoder = require('string_decoder').StringDecoder;
const config = require('./config');
const fs = require('fs');


// Instantiate HTTP server
const httpServer = http.createServer( (req,res) => {
  unifiedServer(req,res);
});

// Start the HTTP server
httpServer.listen(config.httpPort, () => {
 console.log(`The server is listening on port ${config.httpPort} in the ${config.envName} mode`);
});

// Set HTTPS server key and cert
const httpsServerOptions = {
  'key' : fs.readFileSync('./https/key.pem'),
  'cert' : fs.readFileSync('./https/cert.pem'),
};

// Instantiate HTTPS server
const httpsServer = https.createServer(httpsServerOptions,(req,res)=>{
  unifiedServer(req,res);
});

// Start HTTPS server
httpsServer.listen(config.httpsPort, () => {
 console.log(`The server is listening on port ${config.httpsPort} in the ${config.envName} mode`);
});

// All the server logic
const unifiedServer = (req,res) => {

  // Get URL and parse it
  const parsedUrl = url.parse(req.url,true);

  // Get the path
  const path = parsedUrl.pathname;
  const trimmedPath = path.replace(/^\/+|\/+$/g,'');

  // Get the query string as an object
  const queryStringObject = parsedUrl.query;

  // Get the HTTP method
  const method = req.method.toUpperCase();

  // Get the headers as an object
  const headers = req.headers;

  // Get the payload
  const decoder = new stringDecoder('utf-8');
  let buffer ='';

  // Collect payload data from the data event
  req.on('data',(data) => {
    buffer = buffer + decoder.write(data);
  });

  // End payload data collection on the end event
  req.on('end', () => {

    buffer = buffer + decoder.end();

    // Choose the handler this request should go to
    const chosenHandler = typeof(router[trimmedPath]) !=='undefined' ? router[trimmedPath] : handlers.notFound;

    const data = {
      'trimmedPath': trimmedPath,
      'queryStringObject': queryStringObject,
      'method': method,
      'headers': headers,
      'payload':buffer,
    }

    // Get the right response from the chosen handler
    chosenHandler(data)
      .then( (response) => {

        // Use the status code from the handler or default
        const statusCode = typeof response.statusCode === 'number' ? response.statusCode : 200;
        const payload = typeof response.payload === 'object' ? response.payload : {};

        // Convert the payload to a string
        const payloadString = JSON.stringify(payload);

        // Return response
        res.setHeader('Content-Type','application/json');
        res.writeHead(statusCode);
        res.end(payloadString);

        // Log the response
        console.log(`Response: ${statusCode} ${payloadString}`);

    })
    .catch((error) => console.log(error));

  });

};


// Define the handlers
const handlers = {};

// Ping handler
handlers.ping = (data) => {
  // Return a promise of statusCode and payload
  return new Promise((resolve,reject) => {
    resolve({ 'statusCode' : 200 });
  });
}

// Hello handler
handlers.hello = (data) => {
  // Return a promise of statusCode and payload
  return new Promise((resolve,reject) => {
    // Get name from query or default to 'you'
    const name = typeof data.queryStringObject.name === 'string' ? data.queryStringObject.name : 'you';
    resolve({ 'statusCode' : 200, 'payload' : { 'msg': `Hey ${name}!` } });
  });
}

// Not found handler
handlers.notFound = (data) => {
  // return the promise of statuscode and payload
  return new Promise ((resolve,reject) => {
    resolve({'statusCode' : 404});
  });
};

// Define a request router
const router = {
  'ping' : handlers.ping,
  'hello' : handlers.hello,
};
