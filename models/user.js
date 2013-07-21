var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/nodeTutorial');

var Scham = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var User = new Schema({
    name: String,
    password: String,
    email: String
});

mongoose.model('User', User);