

exports.hello = function(req,res) {
    res.render("login", {user: req.user});
}

exports.goodbye = function(req,res) {
    res.render("index", {user: req.user});
}