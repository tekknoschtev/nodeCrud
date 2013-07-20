var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var mongoose = require('mongoose');
//var passport = require('passport');
//var LocalStrategy = require('passport-local').Strategy;

var app = express();

// all environments
app.configure(function() {
    app.set('port', process.env.PORT || 3000);
//    app.set('views', __dirname + '/views');
//    app.set('view engine', 'ejs');
    app.engine('.html', require('ejs').__express);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'html');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use('/public', express.static(__dirname + '/public'));
});   


// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// Dummy users
var users = [
  { name: 'tobi', email: 'tobi@learnboost.com' },
  { name: 'loki', email: 'loki@learnboost.com' },
  { name: 'jane', email: 'jane@learnboost.com' }
];

app.get('/', routes.index);
app.get('/users', user.list);
app.get('/users/:name', function(req,res) {
    res.send(req.params.name);
})
app.get('/ejs', function(req,res) {
    res.render('users', {
        users: users,
        title: "EJS example",
        header: "Some users"
    });
});

app.get('/login', function(req,res) {
    res.render('login', {
        message: "",
        title: "EJS example",
        header: "Some users"
    });
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
