const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const session = require('express-session');
const flash = require('connect-flash');
const cookieParser = require('cookie-parser')
const expressValidator = require('express-validator')
const edge = require('edge.js');
const passport = require('passport');
const csrf = require('csurf');
const overrride = require('method-override');
const upload = require('express-fileupload');
const fs = require('fs-extra');
const moment = require('moment');
const csrfProtection = csrf();
const app = express();
//Custom modules
const { isLogin, isAdmin } = require('./helper/isAuthenticated')
const LocalStrategy = require('./config/passport-local');
const mainRoute = require('./routes/main');
const userRoute = require('./routes/user');
const adminRoute = require('./routes/admin');
const City = require('./model/City');

/**
 * PORT
 */
const config = require('./config/config');
/**
 * DATABASE
 */
//Require DB
const DB = require('./database/db');
/**
 * MIDDLEWARE
 */

app.use(require('express-edge'));

//app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(`${__dirname}/public`));
app.set('views', `${__dirname}/views`);



app.use(session({
    secret: 'work hard',
    resave: true,
    saveUninitialized: true
}));

app.use(cookieParser())
app.use(flash());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.use(expressValidator());
app.use(passport.initialize());
app.use(passport.session());
app.use(upload());
app.use(overrride('_method'));
app.use((req, res, next) => {
    res.locals.user = req.user || null;
    res.locals.title = req.title || null;
    res.locals.successMessage = req.flash('successMessage') || null;
    res.locals.errorMessage = req.flash('errorMessage') || null;
    res.locals.error = req.flash('error');

    next();
})


City.find({}).then(cities => {
    app.locals.cities = cities

}).catch(err => {
    console.log(err)
})
app.use(mainRoute);
app.use('/user', isLogin, userRoute);
app.use('/admin', isAdmin, adminRoute);


//App params

/**
 * SERVER
 */

app.listen(config.port, err => {
    if (err) {
        console.log('we can not conneted to the server');
    } else {
        console.log(`connected to the server port ${config.port}`)
    }
})