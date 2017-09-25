const http = require('http');
const url = require('url');
const queryString = require('querystring');

const BCListService = require('../bean/bc_list_service');
const BCResponse = require('../bean/bc_response');


/**
* Component: It controls all the request.
**/
var CHttp = (function() {
    let listServices = new BCListService.newBCListService();
    let configServer = null;
    let server;


    /**
    * Function: Initializes the component.
    **/
    this.init = (config, callbackProxy) => {
        configServer = config;

        server = http.createServer((request, response) => {
            let urlInfo = url.parse(request.url, true);

            if(request.method === 'OPTIONS') {

                new BCResponse.newBCResponse(200, '', {}).createResponse(response);
            } else if(callbackProxy(request, response)) {

                let arrService = listServices.get(urlInfo.pathname);
                if(arrService && arrService.length > 0) {
                    
                    let service = arrService[0];
                    let body = '';

                    request.on('data', (chunk) => {
                        body += chunk;
                    });
                    request.on('end', () => {
                        let object = null;

                        if(body.length > 0) {
                            try {

                                object = JSON.parse(body);
                            } catch(ex) {

                                object = body;
                            }
                        }

                        service.serviceCallback(request, response, object, urlInfo.query);
                    });
                } else {

                    new BCResponse.newBCResponse(404, '', {}).createResponse(response);
                }
            }
        });
    }
    /**
    * Function: It adds a new service in the list of services.
    **/
    this.addService = (service) => {
        listServices.pushService(service);
    }
    /**
    * Function: Starts the server responsible for managing services.
    **/
    this.start = () => {
        server.listen(configServer.serverPort);
    }
});


exports.newCHttp = CHttp;
