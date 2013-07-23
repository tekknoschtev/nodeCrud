var mongoose = require('mongoose')
    , Schema = mongoose.Schema
    , crypto = require('crypto')
    , _ = require('underscore');
    
var UserSchema = new Schema({
    name: {type: String, default: ''},
    email: {type: String, default: ''},
    username: {type: String, default: ''},
    provider: {type: String, default: ''},
    hashed_password: {type: String, default: ''},
    salt: {type: String, default: ''},
    authToken: { type: String, default: '' },
    facebook: {},
    twitter: {},
    github: {},
    google: {}   
});