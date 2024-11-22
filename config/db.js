const mongoose = require('mongoose');
const {DB_CONN}=process.env;
exports.connect=async(req,res,next)=>{
    try{
        await mongoose.connect(DB_CONN);
        console.log('connect to the db successfully');

    }catch(err){
        console.log(err);

    }
}