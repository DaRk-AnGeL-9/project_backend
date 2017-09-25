const _ = require('lodash');

/**
* Bean Configuration: Model responsible for storing all the
* information of the service list.
**/
var BCListService = (function() {
    let arrServices = [];

    this.setServices = (services) => {
        arrServices = services;
    }

    this.pushService = (service) => {
        arrServices.push(service);
    }

    this.get = (serviceName) => {

        return _.filter(arrServices, (service) => {
            return (service.serviceName === serviceName);
        });
    }
});

exports.newBCListService = BCListService;
