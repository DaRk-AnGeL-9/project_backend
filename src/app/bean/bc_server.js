/**
* Bean Configuration: Model responsible for storing all the
* information of the server.
**/
var BCServer = (function(serverPort) {
    this.serverPort = serverPort;
});

exports.newBCServer = BCServer;
exports.serverSecretJWT = 'illumina';
