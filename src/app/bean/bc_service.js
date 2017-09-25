/**
* Bean Configuration: Model responsible for storing all the
* information of the service.
**/
var BCService = (function(serviceName, serviceHttp, serviceCallback) {
    this.serviceName = serviceName;
    this.serviceHttp = serviceHttp;
    this.serviceCallback = serviceCallback;
});

exports.newBCService = BCService;
