/**
* Bean: Model responsible for storing all the information of
* the user.
**/
var BUser = (function(username, name, password, type, image) {
    this.username = username;
    this.name = name;
    this.password = password;
    this.type = type;
    this.image = image;

    this.getSchema = () => {
        return {
            username: String,
            name: String,
            password: String,
            type: Number,
            image: String
        };
    }
});


exports.newBUser = BUser;
