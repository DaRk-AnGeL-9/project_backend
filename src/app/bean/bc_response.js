/**
* Bean Configuration: Model responsible for storing all the
* information of the response.
**/
var BCResponse = (function(code, message, body) {
    this.code = code;
    this.message = message;
    this.body = body;

    this.createResponse = (response) => {
        response.writeHead(this.code, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
            'Access-Control-Allow-Headers': 'content-type, token-x, enctype'
        });
        response.write(JSON.stringify(this));
        response.end();
    }

    this.createResponseCode = (response, code) => {
        response.writeHead(code, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
            'Access-Control-Allow-Headers': 'content-type, token-x, enctype'
        });
        response.write(JSON.stringify(this));
        response.end();
    }
});

exports.newBCResponse = BCResponse;
