
/*
 * GET home page.
 */


exports.login = function(req, res){
    res.render('login', {title: 'Express'})
};

exports.index = function(req, res){
    res.render('index', { status: 'Log in' });
};

exports.map = function(req, res){
    res.render('map', { status: 'Log in' });
};

exports.ddex = function(req,res){
    
    //****YOU ARE GOING TO HAVE TO CHANGE THIS SECTION TO BE AN EMIT FROM SOCKET.IO 
    if(req.user){
        var user = req.user[0].profile.displayName
    }
    if(req.files){
        var filename = req.file.uploadfile.name
    }
    var status = "Log out";
    //console.log(user);                                                                                                     
    res.render('ddex', { user: user, status: status, filename:filename });
}
exports.signup = function(req,res){
    //console.log(req.user[0].profile.id)
    res.render('signup',{foo: 'bar'});
}

exports.dashboard = function(req,res){
    //get user details from req
    //console.log(req.user[0].profile)
    if(req.user){
        var user = req.user[0].profile.displayName
        var id = req.user[0].profile._json.id
    }
    res.render('mydash', {user:user,id:id})
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
