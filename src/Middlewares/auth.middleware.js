import { tokenTypeEnum } from "../Utils/enums/user.enum.js";
import { ForbidenException } from "../Utils/response/error.response.js";
import { decodedToken } from "../Utils/token/token.js";


export const authentication = ({tokenType = tokenTypeEnum.Access})=>{
    return async (req, res , next)=>{
        const {user, decoded} = await decodedToken({
            authorization: req.headers.authorization,
            tokenType,
        });
        req.user = user;
        req.decoded = decoded;

        return next();
    };
};



export const  authorization = ({accessRoles = []})=>{
    return async (req, res , next)=>{
        if(!accessRoles.includes(req.user.role)){
         throw ForbidenException({message:"Unauthorized Access"});
        };
        return next();
    };
};