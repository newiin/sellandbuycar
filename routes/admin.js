const express = require('express');

const Router = express.Router();
const path = require('path')
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const slugify = require('slugify');
const moment = require('moment');
const fs = require('fs-extra');
const expressValidator = require('express-validator')
const {
    check,
    validationResult
} = require('express-validator/check');
const {
    matchedData,
    sanitize
} = require('express-validator/filter');
const User = require('../model/User');
const Vehicle = require('../model/Vehicle');
const City = require('../model/City');
const Make = require('../model/Make');
const Model = require('../model/Model');
const Condition = require('../model/Condition');
const Transmission = require('../model/Transmission');
const Feedback = require('../model/Feedback');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;


// home  page
Router.get('/my', (req, res) => {
    Vehicle.find({})
        .populate('user')
        .populate('condition')
        .populate('tranmission')
        .populate({
            path: 'model',
            populate: {
                path: 'make'
            }
        }).then((vehicles) => {
            Vehicle.countDocuments({}).then((vehicleTotal) => {
                Vehicle.countDocuments({
                    isApprouved: true
                }).then((vehicleTotalApprouved) => {
                    Vehicle.countDocuments({
                        isApprouved: false
                    }).then((vehicleTotalInapprouved) => {
                        res.render('admin/my', {
                            vehicles: vehicles,
                            vehicleTotal: vehicleTotal,
                            moment: moment,
                            vehicleTotalApprouved: vehicleTotalApprouved,
                            vehicleTotalInapprouved: vehicleTotalInapprouved

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
        }).catch((err) => {
            console.log(err);

        })


});
/**City route */
Router.get('/create-city', (req, res) => {
    res.render('admin/create-city', );
});
Router.post('/create-city', (req, res) => {

    req.check('city', 'Invalid City format').trim().notEmpty();

    let errors = req.validationErrors();
    if (errors) {
        res.render('admin/create-city', {
            errors: errors
        })
    } else {


        const newCity = new City({
            'cityName': req.body.city,

        });

        newCity.save().then((newCitySaved) => {


            req.flash('successMessage', 'New city  Has been added');
            res.redirect('/admin/my')

        }).catch((err) => {
            console.log(err);

        })
    }

});

Router.get('/all-cities', (req, res) => {
    City.find({}).then((cities) => {
        City.countDocuments({}).then((cityCount) => {
            res.render('admin/all-cities', {
                cities: cities,
                cityCount: cityCount
            });
        }).catch((err) => {

        });

    }).catch((err) => {
        console.log(err);

    })

});

// Edit city

Router.get('/city/:city/edit', (req, res) => {
        City.findById({
                _id: req.params.city
            })
            .then(city =>
                res.render("admin/edit-city", {
                    city: city
                })
            )
    })
    // /Edit  city
Router.put('/city/:city/edit', (req, res) => {
    req.check('city', 'Invalid City format').notEmpty().trim().escape();
    let errors = req.validationErrors();
    if (errors) {
        res.render('admin/edit-city', {
            errors: errors
        });
    } else {

        City.findByIdAndUpdate({
            _id: req.params.city
        }).then(city => {
            city.cityName = req.body.city;

            city.save().then(cityUpdated => {
                req.flash('successMessage', 'City has  been modified');
                res.redirect('/admin/my')
            }).catch((err) => {
                console.log(err);

            })
        })

    }
});
//Delete city
Router.get('/city/:city/delete', (req, res) => {

    City.findOneAndDelete({
        _id: req.params.city
    }).then(city => {
        req.flash('successMessage', 'City  has been deleted');

        res.redirect('/admin/my')
    })

});

/**Brand */

Router.get('/create-make', (req, res) => {
    res.render('admin/create-make', );
});
Router.post('/create-make', (req, res) => {

    req.check('make', 'Invalid Make format').trim().notEmpty();

    let errors = req.validationErrors();
    if (errors) {
        res.render('admin/create-make', {
            errors: errors
        })
    } else {


        const newMake = new Make({
            'makeName': req.body.make,
            'slug': slugify(req.body.make, {
                replacement: '-',
                lower: true
            })
        });

        newMake.save().then((newMakeSaved) => {


            req.flash('successMessage', 'New Make   Has been added');
            res.redirect('back');

        }).catch((err) => {
            console.log(err);

        })
    }

});
// All Makes
Router.get('/all-makes', (req, res) => {
    Make.find({}).then((makes) => {
        Make.countDocuments({}).then((makeCount) => {
            res.render('admin/all-makes', {
                makes: makes,
                makeCount: makeCount
            });
        }).catch((err) => {
            console.log(err);

        });

    }).catch((err) => {
        console.log(err);

    })

});

// Edit Make

Router.get('/make/:make/edit', (req, res) => {
        Make.findById({
                _id: req.params.make
            })
            .then(make =>

                res.render("admin/edit-make", {
                    make: make
                })
            ).catch((err) => {
                console.log(err);

            })
    })
    // /Edit  city
Router.put('/make/:make/edit', (req, res) => {
    req.check('make', 'Invalid Make format').notEmpty().trim().escape();
    let errors = req.validationErrors();
    if (errors) {
        res.render('admin/edit-make', {
            errors: errors
        });
    } else {

        Make.findByIdAndUpdate({
            _id: req.params.make
        }).then(make => {
            make.makeName = req.body.make;

            make.save().then(makeUpdated => {
                req.flash('successMessage', 'make has  been modified');
                res.redirect('/admin/my')
            }).catch((err) => {
                console.log(err);

            })
        })

    }
});
//Delete make
Router.get('/make/:make/delete', (req, res) => {

    Make.findOneAndDelete({
        _id: req.params.make
    }).then(make => {
        req.flash('successMessage', 'make  has been deleted');

        res.redirect('back')
    })

})

/**Model */

Router.get('/create-model', (req, res) => {
    Make.find({}).then((makes) => {
        res.render('admin/create-model', {
            makes: makes
        });
    }).catch((err) => {
        console.log(err);

    })

});
Router.post('/create-model', (req, res) => {

    req.check('model', 'Invalid Model format').trim().notEmpty();

    let errors = req.validationErrors();
    if (errors) {
        res.render('admin/create-model', {
            errors: errors
        })
    } else {


        const newModel = new Model({
            'name': req.body.model,
            'make': req.body.make,
        });

        newModel.save().then((newModelSaved) => {

            req.flash('successMessage', 'New Model   Has been added');
            res.redirect('/admin/my')

        }).catch((err) => {
            console.log(err);

        })
    }

});
// All Models
Router.get('/all-models', (req, res) => {
    Model.find({}).populate('make').then((models) => {
        Model.countDocuments({}).then((modelCount) => {
            res.render('admin/all-models', {
                models: models,
                modelCount: modelCount
            });
        }).catch((err) => {
            console.log(err);
        });
    }).catch((err) => {
        console.log(err);

    })

});

// Edit Model

Router.get('/model/:model/edit', (req, res) => {
        Model.findById({
                _id: req.params.model
            })
            .then(model =>

                res.render("admin/edit-model", {
                    model: model
                })
            ).catch((err) => {
                console.log(err);

            })
    })
    // /Edit  city
Router.put('/model/:model/edit', (req, res) => {
    req.check('model', 'Invalid Model format').notEmpty().trim().escape();
    let errors = req.validationErrors();
    if (errors) {
        res.render('admin/edit-model', {
            errors: errors
        });
    } else {

        Model.findByIdAndUpdate({
            _id: req.params.model
        }).then(model => {
            model.modelName = req.body.model;

            model.save().then(modelUpdated => {
                req.flash('successMessage', 'model has  been modified');
                res.redirect('/admin/my')
            }).catch((err) => {
                console.log(err);

            })
        })

    }
});

//Delete make
Router.get('/model/:model/delete', (req, res) => {

        Model.findOneAndDelete({
            _id: req.params.model
        }).then(model => {
            req.flash('successMessage', 'model has been deleted');

            res.redirect('/admin/my')
        })

    })
    //All Feedbacks
Router.get('/feedback', (req, res) => {
        Feedback.find({}).then((feedbacks) => {
            Feedback.countDocuments({}).then((feedbackCount) => {
                res.render('admin/all-feedbacks', {
                    feedbacks: feedbacks,
                    feedbackCount: feedbackCount
                })
            }).catch((err) => {
                console.log(err);

            });
        }).catch((err) => {
            console.log(err)
        });
    })
    // Condition
Router.get('/condition', (req, res) => {
    const newCondition = new Condition({
        'condition': 'new',
    });
    newCondition.save().then((newconditionSaved) => {
        console.log(newconditionSaved);

    }).catch((err) => {
        console.log(err);

    })
})


// / Transmission
Router.get('/transmission', (req, res) => {
    const newTransmission = new Transmission({
        'transmission': 'Automatique',
    });
    newTransmission.save().then((newtransmissionSaved) => {
        console.log(newtransmissionSaved);

    }).catch((err) => {
        console.log(err);

    })
})



// All users
Router.get('/all-users', (req, res) => {
    User.find({

    }).then((users) => {
        User.countDocuments({

        }).then((userTotal) => {
            res.render('admin/all-users', {
                users: users,
                userTotal: userTotal,
                moment: moment
            });
        }).catch((err) => {
            console.log(err);

        })
    }).catch((err) => {
        console.log(err);

    })
})


// delete ad
Router.get('/ad/:ad/delete', (req, res) => {
    Vehicle.findOneAndDelete({
        _id: req.params.ad
    }).then(vehicle => {
        fs.unlink(path.join(__dirname, '../public/images/' + vehicle.image), function(err) {
            if (err) {
                console.error(err);
            }
            req.flash('successMessage', 'Ad has been deleted');
            res.redirect("/admin/my")
        });
    })
})

// approuved the ad 



Router.get('/ad/:ad/approuved', (req, res) => {
    Vehicle.findById({
            _id: req.params.ad
        })
        .then(vehicle => {

            vehicle.isApprouved = true
            vehicle.save().then(vehicleAprouved => {
                req.flash('successMessage', 'Ad has been approuved');
                res.redirect('/admin/my')
            }).catch((err) => {
                console.log(err);

            })

        })

});
//set ruleto user
Router.get('/rule/:user/set-rule', (req, res) => {
        User.findById({
            _id: req.params.user
        }).then((user) => {
            user.rule = 'admin';
            user.save().then((userRule) => {
                console.log(userRule);

                req.flash('successMessage', 'Use rule has been set');
                res.redirect('/admin/my')
            }).catch((err) => {
                console.log(err)
            });
        }).catch((err) => {

        });
    })
    // delete user 
Router.get('/user/:user/delete', (req, res) => {
    User.findOneAndRemove({
        _id: req.params.user
    }).then((user) => {
        Vehicle.remove({
            user: req.params.user
        }).then((userDeleted) => {
            req.flash('successMessage', 'User has been deleted')
            res.redirect('/admin/my')
        })
    })
})





module.exports = Router;