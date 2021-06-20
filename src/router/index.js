function route(app) {
    app.use('/',function(req,res,next){
        res.render('home')
    })
}

module.exports = route;
