module.exports = {
    isLogin: function(req, res, next) {

        if (req.isAuthenticated()) {
            return next();
        } else {
            res.redirect('/login')
        }



    },
    isAdmin: function(req, res, next) {

        if (req.isAuthenticated() && req.user.rule == "admin") {
            return next();
        } else {
            res.redirect('/login')
        }



    }
}