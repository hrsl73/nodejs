const mongoose = require('mongoose')
const User = mongoose.Schema(
    {
        username:{
            type : String,
            required:true,
            unique : true
        },
        
        email:{
            type:String,
            required:true,
            unique:true
        
        },
        password:{
            type:String,
            required:true,
            
        }  

    }
)
const user = mongoose.model('user',User)
module.exports=user