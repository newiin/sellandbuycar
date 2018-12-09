const express = require('express');
const Router = express.Router();
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const moment = require('moment');
const path = require('path');
const fs = require('fs-extra');
const nodemailer = require('nodemailer');
const sgTransport = require('nodemailer-sendgrid-transport');
const passport = require('passport');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const algoliasearch = require('algoliasearch');
const LocalStrategy = require('passport-local').Strategy;
const Vehicle = require('../model/Vehicle');
const Make = require('../model/Make');
const Model = require('../model/Model');
const City = require('../model/City');
const User = require('../model/User');
const Feedback = require('../model/Feedback');
const client = algoliasearch('T0Q2S0R1MH', '8d1b67e13d4006724e072d0f9d0c13c3');
const index = client.initIndex('Vehiclechema');


// main page
Router.get('/', (req, res) => {

    Vehicle.find({})
        .populate({
            path: 'user',
            populate: {
                path: 'cityName'
            }
        })
        .populate('condition')
        .populate('tranmission')
        .populate({
            path: 'model',
            populate: {
                path: 'make'
            }
        }).sort({
            'date': -1
        })
        .limit(5)
        .then((vehicles) => {
            Make.find({}).then((makes) => {
                Vehicle.countDocuments({}).then((vehicleTotal) => {


                    res.render('index', {
                        vehicles: vehicles,
                        makes: makes,
                        vehicleTotal: vehicleTotal,
                        moment: moment
                    });
                }).catch((err) => {
                    console.log(err);

                })

            }).catch((err) => {
                console.log(err);

            })

        }).catch((err) => {
            console.log(err);

        })

});
//contact page
Router.get('/contact', (req, res) => {
    res.render('contact');
})

Router.post('/contact', (req, res) => {
        req.check('name', 'Invalid Name field').notEmpty().trim().escape();
        req.check('subject', 'Invalid subject field').notEmpty().trim().escape();
        req.check('message', 'Invalid message field').notEmpty().trim().escape();
        req.check('email', 'Invalid email/Email required').isEmail().trim().notEmpty().normalizeEmail();
        let errors = req.validationErrors();
        if (errors) {
            res.render('contact', {
                errors: errors
            });
        } else {
            const newFeedback = new Feedback({
                'name': req.body.name,
                'email': req.body.email,
                'subject': req.body.subject,
                'message': req.body.message
            })
            newFeedback.save().then((newFeedbackSvaed) => {

                req.flash('successMessage', 'Your message has been sent');
                res.redirect("back")
            }).catch((err) => {
                console.log(err);

            });
        }

    })
    //About us page
Router.get('/about', (req, res) => {
    res.render('about');
})
Router.get('/all-ads', (req, res) => {
        const optionsP = {
            page: req.query.page,
            limit: 5,
            populate: 'user',
            populate: 'condition',
            populate: 'tranmission',
            populate: {
                path: 'model',
                populate: {
                    path: 'make'
                }
            },
            select: '',
            sort: {
                date: -1
            },
            lean: true,

        };


        Vehicle.paginate({
            isApprouved: false
        }, optionsP).then((result) => {

            let vehicles = result.docs;
            let current = result.page;
            let totalPages = result.totalPages;
            let hasPrevPage = result.hasPrevPage;
            let hasNextPage = result.hasNextPage;
            let prevPage = result.prevPage;
            let nextPage = result.nextPage;
            let output = "";

            if (current == 1) {
                // output+=`<li class="tg-nextpage disabled" ><a href="#" ><i class="fa fa-angle-right"></i></a></li>`
                output += ` <li><a class="disabled"><i class="fa fa-chevron-left"></i></a></li>`
            } else {
                output += `<li><a href="/all-ads/?page=1">First</a></li>`
            }
            let i = (Number(current) > 5 ? Number(current) - 4 : 1);

            if (i !== 1) {
                output += `<li class="disabled"><a>...</a></li>`
            }
            for (; i < totalPages; i++) {
                if (i == current) {
                    output += ` <li class="active"><a>${i}</a></li>`

                } else {
                    output += ` <li><a href="/all-ads/?page=${i}">${i}</a></li>`
                }
                if (i == Number(current) + 4 && i < totalPages) {
                    output += ` <li class="disabled"><a>...</a></li>`
                }

            }
            if (current == totalPages) {
                output += ` <li class="disabled"><a>Last</a></li>`
            } else {
                output += ` <li><a href="/all-ads/?page=${i}">Last</a></li>`
            }
            res.render('all-ads', {
                vehicles: vehicles,
                current: current,
                totalPages: totalPages,
                hasPrevPage: hasPrevPage,
                hasNextPage: hasNextPage,
                prevPage: prevPage,
                nextPage: nextPage,
                output: output

            })



        }).catch((err) => {
            console.log(err);

        })

    })
    // Register user
Router.get('/register', (req, res) => {

    res.render('register');
});
//nodemailer options
let options = {
    auth: {
        api_key: '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'
    }
}
var mailer = nodemailer.createTransport(sgTransport(options));
Router.post('/register', (req, res) => {
    req.check('name', 'Invalid Name/Email required').notEmpty().trim().escape();
    req.check('phone', 'Invalid Phone Number').matches(/\d/)
    req.check('phone', 'Phone number nust be 10 Digits').isLength({
        min: 10
    });
    req.check('email', 'Invalid email/Email required').isEmail().trim().notEmpty().normalizeEmail();
    req.check('password', 'password must be at least 6 caracteres').isLength({
        min: 6
    });
    req.check('password', "Passwords don't match").custom((value) => {
        if (value !== req.body.confirm) {
            return false;
        } else {
            return value;
        }
    });
    let errors = req.validationErrors();
    if (errors) {
        res.render('register', {
            errors: errors
        })
    } else {
        User.findOne({
            'email': req.body.email
        }).then(user => {
            if (user) {
                req.flash('errorMessage', 'Ooops this email is taken');
                res.redirect('/register');
            } else {
                const NewUser = new User({
                    'email': req.body.email,
                    'name': req.body.name,
                    'phone': req.body.phone,
                    'city': req.body.city,
                    'password': req.body.password

                });
                User.createUser(NewUser, (err, user) => {
                    if (user) {
                        res.redirect('/');
                        let email = {
                            to: user.email,
                            from: 'info@sellandbuy.com',
                            subject: 'Registration to buyandsellcar',

                            html: `<b>Thanks you ${user.name}  to register</b>`
                        };

                        mailer.sendMail(email, function(err, res) {
                            if (err) {
                                console.log(err)
                            }
                            console.log(res);
                        });
                    }
                });
            }
        })

    }


});
// login
Router.get('/login', (req, res) => {
    res.render('login');
})

Router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true
    })(req, res, next);


});
//reset password
Router.get('/reset', (req, res) => {
    res.render('reset');
});

Router.post('/reset', (req, res) => {
    req.check('email', 'Invalid email/Email required').isEmail().trim().notEmpty().normalizeEmail();
    let errors = req.validationErrors();
    if (errors) {
        res.render('reset', {
            errors: errors
        })
    } else {
        crypto.randomBytes(32, (err, buffer) => {
            if (err) {
                console.log(err);
                res.redirect('/reset')
            } else {
                const token = buffer.toString('hex');
                User.findOne({
                    email: req.body.email
                }).then((user) => {
                    if (!user) {
                        req.flash('errorMessage', 'Ooops this email does not exist');
                        res.redirect('/reset');
                    } else {
                        user.userToken = token;
                        user.expireToken = Date.now() + 3600000;
                        user.save().then((userSaved) => {

                            let email = {
                                to: req.body.email,
                                from: 'info@sellandbuy.com',
                                subject: 'Password request',
                                html: `
                                <p>You requested a password reset</p>
                                <p>please Click <a href="https://sellandbuycar.herokuapp.com/reset/${token}">here</a> a password reset</p>
                                `
                            };

                            mailer.sendMail(email, function(err, res) {
                                if (err) {
                                    console.log(err)
                                }
                                res.redirect('/login')
                            });
                        }).catch((err) => {
                            console.log(err);

                        })
                    }
                }).catch((err) => {
                    console.log(err);

                })
            }
        })
    }


})

// Route new password
Router.get('/reset/:token', (req, res) => {
        User.findOne({
            userToken: req.params.token,
            expireToken: {
                $gt: Date.now()
            }
        }).then((userFound) => {

            res.render('new-password', {
                userId: userFound._id,
                userToken: userFound.userToken
            });
        }).catch((err) => {
            console.log(err);

        })

    })
    ///New password
Router.post('/reset/:token', (req, res) => {
        req.check('password', 'password must be at least 6 caracteres').isLength({
            min: 6
        });
        req.check('password', "Passwords don't match").custom((value) => {
            if (value !== req.body.confirm) {
                return false;
            } else {
                return value;
            }
        });
        let errors = req.validationErrors();
        if (errors) {
            User.findOne({
                userToken: req.params.token,
                expireToken: {
                    $gt: Date.now()
                }
            }).then((userFound) => {

                res.render('new-password', {
                    userId: userFound._id,
                    userToken: userFound.userToken,
                    errors: errors
                });
            }).catch((err) => {
                console.log(err);

            })

        } else {
            User.findOne({
                userToken: req.params.token,
                expireToken: {
                    $gt: Date.now()
                },
                _id: req.body.userId
            }).then((user) => {
                console.log(user);

                bcrypt.hash(req.body.password, 10, function(err, hash) {
                    if (err) {
                        console.log(err);

                    } else {
                        user.password = hash;
                        user.userToken = undefined;
                        expireToken = undefined;
                        user.save().then((result) => {
                            res.redirect('/login')
                        }).catch((err) => {
                            console.log(err);

                        });
                    }
                });

            }).catch((err) => {
                console.log(err);

            });
        }
    })
    ///Route logout
Router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

// /details page
Router.get('/details/:ad', function(req, res) {
    Vehicle.find({
            _id: req.params.ad
        }).populate('user')
        .populate('condition')
        .populate('tranmission')
        .populate({
            path: 'model',
            populate: {
                path: 'make'
            }
        }).then((vehicle) => {
            res.render('details', {
                vehicle: vehicle,
                moment: moment
            })
        }).catch((err) => {
            console.log(err);

        })
});

//Make

Router.get('/:makeSlug', (req, res) => {
        Make.find({
            slug: req.params.makeSlug
        }).then(make => {
            let makeId
            make.forEach(make => {
                makeId = make._id;
            });

            Model.find({
                    make: makeId
                })
                .populate('make')
                .then(makes => {

                    Vehicle.find({
                            model: makes
                        })
                        .populate('user')
                        .populate('condition')
                        .populate('tranmission')
                        .populate({
                            path: 'model',
                            populate: {
                                path: 'make'
                            }
                        })
                        .then(vehicles => {


                            res.render('ads-by-make', {

                                vehicles: vehicles
                            })


                        }).catch(err => {
                            console.log(err);

                        })

                }).catch(err => {
                    console.log(err);

                })
        }).catch(err => {
            console.log(err);
        })

    })
    //   search

//Article search
Router.get('/search', (req, res, next) => {
    if (req.query.q) {
        console.log(req.query.q);

        // only query string
        index.search({
                query: req.query.q
            },
            function searchDone(err, content) {
                if (err) throw err;
                console.log(content.hits);

                res.send(content.hits);
                res.render('search', {
                    vehicles: content.hits

                })

            }
        );
    }


})

Router.post('/search', (req, res, next) => {


    res.redirect('/search/?q=' + req.body.search)


})




module.exports = Router;