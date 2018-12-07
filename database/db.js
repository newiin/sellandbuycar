const mongoose = require('mongoose');
require('dotenv-extended').load();
mongoose.Promise = global.Promise;

mongoose.connect('mongodb://sellandbuycar:sellandbuycar2018@ds117311.mlab.com:17311/sellandbuycar',{ useNewUrlParser: true },function(err,db){
if (err) {
    console.log("we can not connect to the database"+ err);
    

}else{
    console.log('connected to the database');

}
})
