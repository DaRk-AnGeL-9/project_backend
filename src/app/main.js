const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const moment = require('moment');
const _ = require('lodash');

const CHttp = require('./component/c_http');
const CDatabase = require('./component/c_database');
const CFile = require('./component/c_file');

const BCServer = require('./bean/bc_server');
const BCService = require('./bean/bc_service');
const BCResponse = require('./bean/bc_response');
const BUser = require('./bean/b_user');
const BClient = require('./bean/b_client');


(function() {
    let server = new CHttp.newCHttp();
    let database = new CDatabase.newCDatabase();

    database.init([new BUser.newBUser(), new BClient.newBClient()]);


    //---------------------
    //|       PROXY       |
    //---------------------
    server.init(new BCServer.newBCServer(8080), (req, resp) => {
        let match = /^(\/user*)/.test(req.url) || /^(\/client*)/.test(req.url);

        if(match) {
            let headerToken = req.headers['token-x'];
            let cResponse;

            if(headerToken) {

                try {

                    let decode = jwt.verify(headerToken, BCServer.serverSecretJWT);
                } catch(error) {

                    cResponse = new BCResponse.newBCResponse(401, 'you are not login.', {"login":0});
                }
            } else {

                cResponse = new BCResponse.newBCResponse(401, 'you are not login.', {"login":0});
            }

            if(cResponse) {

                cResponse.createResponseCode(resp, 200);
                return false;
            }
        }

        return true;
    });


    //--------------------
    //|       LOGIN      |
    //--------------------
    server.addService(new BCService.newBCService('/login', 'POST', (request, response, body, query) => {
        let user = new BUser.newBUser(body.username, null, null, null, null);

        database.findBean(user, 0, 1, (arrResult) => {
            let cResponse = new BCResponse.newBCResponse(404, 'you are not login.', {"login":0});

            if(arrResult.length > 0) {
                bcrypt.compare(body.password, arrResult[0].password, (error, res) => {
                	
                    if(res) {

                        let keyToken = jwt.sign({
                            exp: Math.floor(Date.now() / 1000) + (60 * 60 * 12),
                            data: arrResult[0]
                        }, BCServer.serverSecretJWT);

                        cResponse = new BCResponse.newBCResponse(200, 'you are login.', {
                            login: arrResult[0].type,
                            token: keyToken
                        });
                    }

                    cResponse.createResponse(response);
                });
            } else {
                cResponse.createResponse(response);
            }
        });
    }));


    //--------------------
    //|       USER       |
    //--------------------
    //getAll: Obtain all the users that exist.
    server.addService(new BCService.newBCService('/user/getAll', 'GET', (request, response, body, query) => {
        let user = new BUser.newBUser(null, null, null, null, null);

        database.findBean(user, query.pag, 5, (arrResult) => {
            let sizeImage = 0;

            _.each(arrResult, (item, i) => {
                CFile.getFile(item.image, (data) => {
                    sizeImage++;

                    arrResult[i].username = item.username;
                    arrResult[i].name = item.name;
                    arrResult[i].password = '';
                    arrResult[i].type = item.type;
                    arrResult[i].image = data;

                    if(sizeImage === arrResult.length) {

                        let cResponse = new BCResponse.newBCResponse(200, '', arrResult);
                        cResponse.createResponse(response);
                    }
                });
            });
        });
    }));

    //getByNick: Obtain all the users that exists with the username name specified by the query.
    server.addService(new BCService.newBCService('/user/getByUsername', 'GET', (request, response, body, query) => {
        let user = new BUser.newBUser(query.username, null, null, null, null);

        database.findBean(user, 0, 1, (arrResult) => {

            if(arrResult.length > 0) {
                CFile.getFile(arrResult[0].image, (data) => {
                    arrResult[0].image = data;
                    arrResult[0].password = '';

                    let cResponse = new BCResponse.newBCResponse(200, '', arrResult);
                    cResponse.createResponse(response);
                });
            }
        });
    }));

    //add: Add new document.
    server.addService(new BCService.newBCService('/user/add', 'POST', (request, response, body, query) => {
        let fileName = `${body.username}${moment()}.jpg`;
        fileName = fileName.replace(new RegExp(":", "g"), "");
        let user = new BUser.newBUser(body.username, body.name, null, body.type, fileName);

        bcrypt.hash('12345', 10, (error, hash) => {

            user.password = hash;
            database.insertBean(user, (arrResult) => {
                let cResponse = null;

                if(arrResult.length > 0) {

                    CFile.putFile(fileName, body.image, (error) => {});

                    cResponse = new BCResponse.newBCResponse(200, '', arrResult);
                } else {
                    cResponse = new BCResponse.newBCResponse(400, 'cant insert the user.', {});
                }

                cResponse.createResponse(response);
            });
        });

    }));

    //updateByUsername: Modify all the users that exist with the username name specified by the query.
    server.addService(new BCService.newBCService('/user/updateByUsername', 'POST', (request, response, body, query) => {
        let userTarget = new BUser.newBUser(body.username, null, null, null, null);
        let userUpdate = new BUser.newBUser(body.username, body.name, null, body.type, null);

        database.findBean(userTarget, 0, 1, (arrResult) => {
            let cResponse = new BCResponse.newBCResponse(400, 'cant update the user.', {});
            let fileName = arrResult[0].image;
            let password = arrResult[0].password;

            userUpdate.password = password;
            database.updateBean(userTarget, userUpdate, (arrResult) => {

                if(arrResult.length > 0) {

                    CFile.removeFile(fileName, (error) => {
                        CFile.putFile(fileName, body.image, (error) => {
                            cResponse = new BCResponse.newBCResponse(200, '', {});
                            cResponse.createResponse(response);
                        });
                    });

                } else {
                    cResponse.createResponse(response);
                }

            });
        });
    }));

    //updatePasswordByUsername: Modify all the users that exist with the username name specified by the query.
    server.addService(new BCService.newBCService('/user/updatePasswordByUsername', 'POST', (request, response, body, query) => {
        let headerToken = request.headers['token-x'];
        let decode = jwt.verify(headerToken, BCServer.serverSecretJWT);
        let userTarget = new BUser.newBUser(decode.data.username, null, null, null, null);

        database.findBean(userTarget, 0, 1, (arrResult) => {
            let cResponse = new BCResponse.newBCResponse(400, 'cant update the user.', {});
            let userUpdate = arrResult[0];

            bcrypt.hash(body.password, 10, (error, hash) => {

                userUpdate.password = hash;
                database.updateBean(userTarget, userUpdate, (arrResult) => {

                    if(arrResult.length > 0) {

                        cResponse = new BCResponse.newBCResponse(200, '', {});
                        cResponse.createResponse(response);
                    } else {
                        
                        cResponse.createResponse(response);
                    }
                });
            });
        });
    }));

    //deleteByUsername: Delete all the users that exists with the username name specified by the query.
    server.addService(new BCService.newBCService('/user/deleteByUsername', 'DELETE', (request, response, body, query) => {
        let user = new BUser.newBUser(query.username, null, null, null, null);

        database.findBean(user, 0, 1, (arrResult) => {
            let cResponse = new BCResponse.newBCResponse(200, '', {});
            let fileName = arrResult[0].image;

            if(arrResult.length > 0) {
                user = new BUser.newBUser(arrResult[0].username, null, null, null, arrResult[0].image);

                database.removeBean(user, (arrResult2) => {
                    CFile.removeFile(fileName, (data) => {

                        cResponse.createResponse(response);
                    });
                });
            } else {
                cResponse.createResponse(response);
            }
        });
    }));


    //--------------------
    //|      CLIENT      |
    //--------------------
    //getAll: Obtain all the clients that exists.
    server.addService(new BCService.newBCService('/client/getAll', 'GET', (request, response, body, query) => {
        let client = new BClient.newBClient(null, null, null, null, null);

        database.findBean(client, query.pag, 5, (arrResult) => {
            let cResponse = new BCResponse.newBCResponse(200, '', arrResult);
            cResponse.createResponse(response);
        });
    }));

    //getByName: Obtain all the clients that exists with the name specified by the query.
    server.addService(new BCService.newBCService('/client/getByName', 'GET', (request, response, body, query) => {
        let client = new BClient.newBClient(query.name, null, null, null, null);

        database.findBean(client, 0, 1, (arrResult) => {
            let cResponse = new BCResponse.newBCResponse(200, '', arrResult);
            cResponse.createResponse(response);
        });
    }));

    //add: Add new document.
    server.addService(new BCService.newBCService('/client/add', 'POST', (request, response, body, query) => {
        let client = new BClient.newBClient(body.name, body.status, body.sex, body.age, body.profession);

        database.insertBean(client, (arrResult) => {
            let cResponse = null;

            if(arrResult.length > 0) {
                cResponse = new BCResponse.newBCResponse(200, '', arrResult);
            } else {
                cResponse = new BCResponse.newBCResponse(400, 'cant insert the client.', {});
            }

            cResponse.createResponse(response);
        });
    }));

    //updateByName: Modify all the clients that exists with the name specified by the query.
    server.addService(new BCService.newBCService('/client/updateByName', 'POST', (request, response, body, query) => {
        let clientTarget = new BClient.newBClient(body.name, null, null, null, null);
        let clientUpdate = new BClient.newBClient(body.name, body.status, body.sex, body.age, body.profession);

        database.updateBean(clientTarget, clientUpdate, (arrResult) => {
            let cResponse = null;

            if(arrResult.length > 0) {
                cResponse = new BCResponse.newBCResponse(200, '', arrResult);
            } else {
                cResponse = new BCResponse.newBCResponse(400, 'cant update the client.', {});
            }

            cResponse.createResponse(response);
        });
    }));

    //deleteByName: Delete all the clients that exists with the name specified by the query.
    server.addService(new BCService.newBCService('/client/deleteByName', 'DELETE', (request, response, body, query) => {
        let client = new BClient.newBClient(query.name, null, null, null, null);

        database.removeBean(client, (arrResult) => {
            let cResponse = new BCResponse.newBCResponse(200, '', {});
            cResponse.createResponse(response);
        });
    }));




    server.start();
})();
