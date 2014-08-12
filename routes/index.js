
/*
 * GET home page.
 */

exports.index = function(req, res){
    res.render('index', { title: 'Express' });
};

exports.reports = function(req, res){
    res.render('report', { title: 'Express' });
};

/** serve jade enabled partials */
exports.partials = function(req, res) {
    //console.log(req.params);
    res.render('partials/' + req.params.name);
};
