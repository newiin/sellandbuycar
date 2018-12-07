const mongoose = require('mongoose');
const timestamps = require('mongoose-timestamp');

const Schema=mongoose.Schema;

const CitySchema=new Schema({
   
    cityName:{
        type:String,
        required:true,
    }
    
  
});

CitySchema.plugin(timestamps);
const City = module.exports = mongoose.model('cities', CitySchema);
