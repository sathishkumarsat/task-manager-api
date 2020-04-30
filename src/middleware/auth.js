
const jwt = require('jsonwebtoken');    //To validate token
const User = require('../models/user'); //To work on the user model

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        //bcz we provided the token value in the request header - key:value
        console.log(token);//Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaW............
        //Bearer - is to know that it is bearer token

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log(decoded);//{ _id: '5e9fd6774629c910f8306ab5', iat: 1587621240 }//payload/data contains user id

        const user = await User.findOne({ _id: decoded._id, 'tokens.token': token });//get user with the _id from payload
        //2nd arg- when user logs out we will delete that token, so make sure token exists along with the id

        if (!user) {  //if user doesn't exist with above properties
            throw new Error();  //automatically triggers catch block
        }
        req.token = token;//if we logged in lap token will be generated, we need to remove that token only while logout
        req.user = user;//We already fetched user by id, so again no need to fetch the user from DB, send to route along with req 
        next();//if authenticated calls next()

    } catch (e) {
        res.status(401).send({ Error: 'Plese authenticate.' });
    }
}

module.exports = auth;