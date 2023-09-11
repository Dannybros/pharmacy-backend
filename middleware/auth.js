import jwt from 'jsonwebtoken';

const auth = async(req, res, next)=>{
    const authHeader = req.headers['authorization'];

    const token = authHeader && authHeader.split(' ')[1];

    if(!token) return res.status(401).json({message: "A token is required for authentication"});

    jwt.verify(token, process.env.JWTAUTHKEY, (err, user)=>{
        if(err) return res.status(403).send({message: "Invalid Token"});
        req.user = user
        next();
    });
}

export default auth