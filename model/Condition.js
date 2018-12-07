const mongoose = require('mongoose');
const timestamps = require('mongoose-timestamp');

const Schema=mongoose.Schema;

const ConditionSchema=new Schema({
   
    condition:{
        type:String,
        required:true,
    }
    
  
});

ConditionSchema.plugin(timestamps);
const Condition = module.exports = mongoose.model('conditions', ConditionSchema);