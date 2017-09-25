const mongoose = require('mongoose');
const _ = require('lodash');


mongoose.connect('mongodb://illumina:illumina@ds135514.mlab.com:35514/test_illumina');
let arrSchema = [];


/**
* Component: It controls all the database queries.
**/
var CDatabase = (function() {

    /**
    * Function: Initializes the component.
    **/
    this.init = (arrayBean) => {
        _.each(arrayBean, (object, index) => {
            let element = {
                key: object.constructor.name,
                value: mongoose.model(object.constructor.name, object.getSchema())
            };

            arrSchema.push(element);
        });
    }
    /**
    * Function: Responsible for inserting documents in the collection
    * depending on the type of document.
    **/
    this.insertBean = (bean, callback) => {
        cleanObject(bean);

        Schema(bean).save((errorDB) => {
            if(errorDB) {
                console.log('Cant insert.');
                callback([]);
            } else {
                console.log('Inserted.');
                callback([true]);
            }
        });
    }
    /**
    * Function: In charge of search for documents in the collection
    * depending on the type of document.
    **/
    this.findBean = (bean, numPag, limPag, callback) => {
        let Bean = typeSchema(bean);
        let nPag = parseInt(numPag);
        cleanObject(bean);

        Bean.find(bean, (errorDB, users) => {
            if(errorDB) {

                console.log('Cant find.');
                callback([]);
            } else {

                console.log('find.' + users.length);
                callback(users);
            }
        }).skip(nPag).limit(limPag);
    }
    /**
    * Function: Responsible for updating the documents in the collection
    * depending on the type of document.
    **/
    this.updateBean = (beanSource, beanTarget, callback) => {
        let Bean = typeSchema(beanSource);
        cleanObject(beanSource);
        cleanObject(beanTarget);

        Bean.findOneAndUpdate(beanSource, beanTarget, (errorDB) => {
            if(errorDB) {
                console.log('Cant update.');
                callback([]);
            }

            console.log('update.');
            callback([true]);
        });
    }
    /**
    * Function: Responsible for removing the documents in the
    * collection depending on the type of document.
    **/
    this.removeBean = (bean, callback) => {
        let Bean = typeSchema(bean);
        cleanObject(bean);

        Bean.findOneAndRemove(bean, (errorDB) => {
            if(errorDB) {
                console.log('Cant remove.');
                callback([]);
            }

            console.log('remove.');
            callback([true]);
        });
    }
});

/**
* Function that obtain the schema of the bean.
**/
typeSchema = (bean) => {
    let index = -1;

    arrSchema.forEach((object, i) => {
        if(bean.constructor.name === object.key) {
            index = i;
        }
    });
    return arrSchema[index].value;
}
/**
* Function that assign the values of the bean to the object of mongoose.
**/
Schema = (bean) => {
    let Bean = typeSchema(bean);
    let dbBean = new Bean();

    Object.assign(dbBean, bean);

    return dbBean;
}
/**
* Function that remove the information with value undefined or null.
**/
cleanObject = (bean) => {
    for(let key in bean) {
        if(!bean[key]) {
            delete bean[key];
        }
    }
}

exports.newCDatabase = CDatabase;
