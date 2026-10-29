import mongoose, { Schema } from "mongoose";


const tokenSchema = new Schema(
  {
    jti: {
      type: String,
      required: true,
      unique :true,
      
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref :"user",
    },
   expiresIn: {
      type: Date,
      required: true, 
    },
},
{
    timestamps: true,
  },
);

tokenSchema.index("expiresIn" , {expireAfterSeconds:0});

const TokenModel = mongoose.model("Token", tokenSchema);

export default TokenModel;
