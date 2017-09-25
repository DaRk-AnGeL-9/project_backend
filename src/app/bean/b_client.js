/**
* Bean: Model responsible for storing all the information of
* the customer.
**/
var BClient = (function(name, status, sex, age, profession) {
    this.name = name;
    this.status = status;
    this.sex = sex;
    this.age = age;
    this.profession = profession;

    this.getSchema = () => {
        return {
            name: String,
            status: Boolean,
            sex: Boolean,
            age: Number,
            profession: String
        };
    }
});

exports.newBClient = BClient;
