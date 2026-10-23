import mongoose, { Schema } from "mongoose";
import {genderEnum , roleEnum , providerEnum} from "../../Utils/enums/user.enum.js";

const userSchema = new Schema(
    {
        firstName:{
            type:String,
            required:[true,"first name is mandatory"],
            minLength:2,
            maxLength:25,
            trim:true,
        },
         lastName:{
            type:String,
            required:[true,"last name is mandatory"],
            minLength:2,
            maxLength:25,
            trim:true,
        },
        email:{
            type:String,
            unique:true,
            require:true,
        },
        password:{
          type:String,
          require:function(){
            return this.provider == providerEnum.System;
          },  
        },
        DOB:Date,
        age:Number,
        phone:String,
        gender:{
            type:Number,
            enum:Object.values(genderEnum),
            default:genderEnum.Male,
           
        },
         role:{
            type:Number,
            enum:Object.values(roleEnum),
            default:roleEnum.Admin,
         },
         provider:{
            type:Number,
            enum:Object.values(providerEnum),
            default:providerEnum.System,
         },
         confirmEmail:String,
         profilePic:String,
        },
        {
        timestamps:true,
        toJSON:{virtuals:true},
        toObject:{virtuals:true},
    },
           
);

userSchema.virtual("username").set(function(value){
    const [firstName , lastName] = value.split(" ") || [];
    this.set({firstName , lastName});
}).get(function(){
    return `${this.firstName} ${this.lastName}`
});

userSchema.virtual("id").get(function () {
    return this._id.toString();
});


const UserModel = mongoose.model("User" , userSchema);

export default UserModel;