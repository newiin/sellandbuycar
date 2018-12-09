const express = require('express');
const Router = express.Router();
const path = require('path')
    //const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator')
const {
    check,
    validationResult
} = require('express-validator/check');
const {
    matchedData,
    sanitize
} = require('express-validator/filter');
const fs = require('fs-extra');
const moment = require('moment');
const User = require('../model/User');
const City = require('../model/City');
const Make = require('../model/Make');
const Model = require('../model/Model');
const Vehicle = require('../model/Vehicle');
const Condition = require('../model/Condition');
const Transmission = require('../model/Transmission');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

Router.get('/post-ad', (req, res) => {
    Model.find({}).then((models) => {
        Condition.find({}).then((conditions) => {
            Transmission.find({}).then((transmissions) => {
                res.render('user/post-ad', {
                    models: models,
                    conditions: conditions,
                    transmissions: transmissions
                });
            }).catch((err) => {
                console.log(err);

            })

        }).catch((err) => {
            console.log(err);

        })

    })

});


Router.post('/post-ad', (req, res) => {
    req.check('title', 'Invalid title format').trim().notEmpty();
    req.check('model', 'Invalid model format').trim().notEmpty();
    req.check('year', 'Invalid Year format').trim().notEmpty();
    req.check('color', 'Invalid Color format').trim().notEmpty();
    req.check('transmission', 'Invalid transmission format').trim().notEmpty();
    req.check('speed', 'Invalid speed format').trim().notEmpty();
    req.check('price', 'Invalid price format').trim().notEmpty();
    req.check('fuel', 'Invalid Fuel format').trim().notEmpty();
    req.check('mileage', 'Invalid Fuel format').trim().notEmpty();
    let errors = req.validationErrors();

    if (errors) {
        Model.find({}).then((models) => {
            res.render('user/post-ad', {
                errors: errors,
                models: models
            })
        }).then((err) => {
            console.log(err);

        })
    } else {


        let file = req.files.file.name;
        if (req.files.file) {
            let filename = req.files.file
            filename.mv('./image/' + filename.name, function(err) {
                if (err) {
                    return res.status(500).send(err);
                } else {
                    console.log('file uploaded');

                    const newVehicle = new Vehicle({
                        title: req.body.title,
                        model: req.body.model,
                        year: req.body.year,
                        color: req.body.color,
                        transmission: req.body.transmission,
                        speed: req.body.speed,
                        price: req.body.price,
                        fuel: req.body.fuel,
                        mileage: req.body.mileage,
                        condition: req.body.condition,
                        user: req.user._id,
                        image: file
                    })
                    newVehicle.save().then(vehicleSaved => {
                        req.flash('successMessage', 'Ad has been created');
                        res.redirect("back")

                    }).catch((err) => {
                        console.log(err);

                    })
                }


            });
        }
    }

});
// users ads
Router.get('/my-ads', (req, res) => {
    Vehicle.find({
        user: req.user._id
    })

    .populate({
        path: 'model',
        populate: {
            path: 'make'
        }
    }).then((vehicles) => {
        Vehicle.countDocuments({ user: req.user._id }).then((userVehicleTotal) => {
            res.render('user/my-ads', {
                vehicles: vehicles,
                moment: moment,
                userVehicleTotal: userVehicleTotal
            });
        }).catch((err) => {
            console.log(err);

        })

    }).then((err) => {
        console.log(err);

    });

});
Router.get('/edit-ad/:ad', (req, res) => {
    Vehicle.findById({
        _id: req.params.ad
    }).then((vehicle) => {
        res.render('user/edit-ad', {
            vehicle: vehicle
        });
    }).catch((err) => {
        console.log(err);

    })

});



Router.put('/edit-ad/:ad', (req, res) => {
    req.check('title', 'Invalid title format').trim().notEmpty();
    req.check('year', 'Invalid Year format').trim().notEmpty();
    req.check('color', 'Invalid Color format').trim().notEmpty();
    req.check('speed', 'Invalid speed format').trim().notEmpty();
    req.check('price', 'Invalid price format').trim().notEmpty();
    req.check('fuel', 'Invalid Fuel format').trim().notEmpty();
    let errors = req.validationErrors();
    if (errors) {
        Vehicle.findById({
                _id: req.params.ad
            })
            .populate({
                path: 'model',
                populate: {
                    path: 'make'
                }
            }).then((vehicle) => {
                res.render('user/edit-ads', {
                    vehicle: vehicle,
                    errors: errors
                });
            }).catch((err) => {
                console.log(err);

            });

    } else {
        Vehicle.findByIdAndUpdate({
            _id: req.params.ad
        }).then((vehicle) => {

            vehicle.title = req.body.title,
                vehicle.year = req.body.year,
                vehicle.color = req.body.color,
                vehicle.speed = req.body.speed,
                vehicle.price = req.body.price,
                vehicle.fuel = req.body.fuel,

                vehicle.save().then(vehicleUpdated => {


                    req.flash('successMessage', 'Ad has been modified');
                    res.redirect("/user/my-ads")
                }).catch((err) => {
                    console.log(err);

                })
        }).catch((err) => {
            console.log(err);

        })
    }

});
// delete ad
Router.get('/delete-ad/:ad', (req, res) => {

    Vehicle.findOneAndDelete({
        _id: req.params.ad
    }).then(vehicle => {
        fs.unlink(path.join('./public/images/' + vehicle.image), function(err) {
            if (err) {
                console.error(err);
            }
            req.flash('successMessage', 'Ad has been deleted');
            res.redirect("/user/my-ads")
        });
    })

});
//user profile
Router.get('/profile', (req, res) => {
    res.render('user/profile', { moment: moment })
});
module.exports = Router;