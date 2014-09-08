
/*
 * GET home page.
 */


exports.login = function(req, res){
    res.render('login', {title: 'Express'})
};

exports.index = function(req, res){
    res.render('index', { status: 'Log in' });
};

exports.signup = function(req,res){
    //console.log(req.user[0].profile.id)
    res.render('signup',{foo: 'bar'});
}

exports.reports = function(req, res){
    if(req.user){
        var user = req.user[0].profile.displayName   
    }
    var status = "Log out";
    //console.log(user);
    res.render('report', { user: user, status: status });
};

/** serve jade enabled partials */
exports.partials = function(req, res) {
    //console.log(req.params);
    res.render('partials/' + req.params.name);
};
