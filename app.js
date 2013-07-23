var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var flash = require('connect-flash');

var app = express();

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

Schema = mongoose.Schema;
mongoose.connect('mongodb://localhost/nodeCrud');

var UserSchema = new Schema({
    name: String,
    email: String,
    password: String
});

UserSchema.methods.validPassword = function(password) {
    if (password === this.password) {
        return true;
    }
    else {
        return false;
    }
}

mongoose.model('User', UserSchema);
var UserModel = mongoose.model('User', UserSchema);

// all environments
app.configure(function() {
    app.set('port', process.env.PORT || 3000);
    app.engine('.html', require('ejs').__express);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'html');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.cookieParser());
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.session({ secret: 'keyboard cat' }));
    app.use(flash());
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(app.router);
    app.use('/public', express.static(__dirname + '/public'));
});   

app.get('/', function(req,res) {
    console.log("Test " + req.user);
    res.render('index', { title: 'Express', user: req.user });
});

app.get('/api/users', function(req,res) {
    return UserModel.find(function(err, users) {
        if(!err) {
            res.render('users', {user: users, title: 'Userlist'});
        }
        else {
            console.log(err);
        }
    });
});

app.get('/api/users/:id', function(req,res) {
    return UserModel.findById(req.params.id, function(err, user_data) {
        if(!err){
            res.send({
                name:user_data.name,
                email:user_data.email
            });
        }
    });
});

app.post('/api/users', function(req,res) {
    console.log(req.body);
    
    user = new UserModel({
        name: req.body.name
    });
    
    user.save(function(err){
        if(!err) {
            console.log("created")
        }
        else {
            return console.log(err)
        }
    });
});

app.delete('/api/users/delete/:id', function(req,res) {
    return UserModel.findById(req.params.id, function(err, user) {
        if(!err) {
            user.remove(function(err) {
                if(!err) {
                    console.log("Deleted user: " + req.params.id);
                    return res.send();
                }
            })
        }
    })
})

app.get('/users/:name', function(req,res) {
    res.send(req.params.name);
});

app.get('/login', function(req,res) {
    res.render('login', {user: req.user, message: req.flash('error'), title: "EJS example", header: "Some users"});
});

app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
}); 

app.get('/account', ensureAuthenticated, function(req,res) {
    res.render('account', {user: req.user});
});

app.post('/login', 
    passport.authenticate('local', {failureRedirect: '/login', failureFlash: true}),
    function(req,res) {
        res.redirect('/');
    }
);

app.get('/register', function(req,res) {
    res.render('register', {title: "Register for an Account", user: '', message: ''});
});

app.post('/register', function(req,res){
    console.log(req.body);
    user = new UserModel({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password
    });
    user.save(function(err){
        if(!err) {
            console.log("created")
            res.redirect('/');
        }
        else {
            return console.log(err)
        }
    });
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

function findById(id, fn) {
//    var idx = id -1;
    if(users[idx]) {
        fn(null, users[idx]);
    }
    else {
        fn(new Error('User ' + id + ' does not exist'));
    }
};

function findByUsername(username, fn) {
    for (var i = 0, len = users.length; i < len; i++) {
        var user = users[i];
        if (user.username === username) {
            return fn(null, user);
        }
    }
    return fn(null, null);
}

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  UserModel.findById(id, function (err, user) {
    done(err, user);
  });
});

// Use the LocalStrategy within Passport.
//   Strategies in passport require a `verify` function, which accept
//   credentials (in this case, a username and password), and invoke a callback
//   with a user object.  In the real world, this would query a database;
//   however, in this example we are using a baked-in set of users.
//passport.use(new LocalStrategy(
//  function(username, password, done) {
//    // asynchronous verification, for effect...
//    process.nextTick(function () {
//      
//      // Find the user by username.  If there is no user with the given
//      // username, or the password is not correct, set the user to `false` to
//      // indicate failure and set a flash message.  Otherwise, return the
//      // authenticated `user`.
//      findByUsername(username, function(err, user) {
//        if (err) { return done(err); }
//        if (!user) { return done(null, false, { message: 'Unknown user ' + username }); }
//        if (user.password != password) { return done(null, false, { message: 'Invalid password' }); }
//        return done(null, user);
//      })
//    });
//  }
//));

passport.use(new LocalStrategy(function(name, password, done) {
    UserModel.findOne({name: name}, function(err, user){
        if(err) {
            return done(err);
        }
        if(!user) {
            return done(null, false, {message: 'Incorrect username.'});
        }
        if(!user.validPassword(password)) {
            return done(null, false, {message: 'Incorrect password.'});
        }
        return done(null, user);
    });
}));

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
};