var formidable = require('formidable');
var file = require('fs');

const PATH_IMAGES = './src/app/images/';

/**
* Function: Gets the file depending on the path.
**/
exports.getFile = (fileName, callbackAfter) => {
    let filePath = `${PATH_IMAGES}${fileName}`;

    file.readFile(filePath, (err, data) => {
        if(err) {

            console.log('Invalid File: ' + err);
            callbackAfter(null);
        } else {

            let buffer = new Buffer(data);
            let encodeImage = 'data:image/jpg;base64,' + buffer.toString('base64');

            callbackAfter(encodeImage);
        }
    });
}
/**
* Function: Saves the file depending on the path.
**/
exports.putFile = (fileName, fileData, callbackAfter) => {
    let data = new Buffer(fileData.replace(/^data:image\/\w+;base64,/, ""), 'base64');
    let buffer = new Buffer(data, 'base64');
    let filePath = `${PATH_IMAGES}${fileName}`;

    file.writeFile(filePath, buffer, (error) => {
        if(error) {
            console.log('Cant upload file: ' + error);
        }

        callbackAfter(error);
    });
}
/**
* Function: Deletes the file depending on the path.
**/
exports.removeFile = (fileName, callbackAfter) => {
    let filePath = `${PATH_IMAGES}${fileName}`;

    file.unlink(filePath, (error) => {
        if(error) {
            console.log('Cant delete file: ' + error);
        }

        callbackAfter(error);
    });
}
