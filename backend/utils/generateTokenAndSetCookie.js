import jwt from 'jsonwebtoken'
export const generateTokenAndSetCookie=(res,user)=>{
    const payload={
        userId:user.firebaseUid,
        email:user.email,
        role:user.role
    }
    const token=jwt.sign(payload,process.env.JWT_SECRET,{
        expiresIn:"7d",
    });
    res.cookie("token",token,{
        httpOnly:true,//cookie cannot be accessed by client side js like XSS attacks
        secure:process.env.NODE_ENV==="production",
        sameSite:"strict" ,// prevents CSRF attacks
        maxAge:7*24*60*60*1000,

    })
    return token;

};