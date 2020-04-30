const express = require('express');//Import express library to use it
const router = new express.Router();//creating a new router, using express.Router() we can create new router
const auth = require('../middleware/auth');
const User = require('../models/user');
const multer = require('multer');//library for uploading files
const sharp = require('sharp');

//Below is creating new router using express.Router() or its instance(router) 
//Save new user
router.post('/users', async (req, res) => {    //fn definition chaged to async fn def
    const user = new User(req.body);//Creating new instance of user & req.body - fileds data will be come from postman

    //save new user with await in try-catch block
    try {    //checks for errors

        await user.save();

        const token = await user.generateAuthToken();//generate token after user saved successfully

        res.status(201).send({ user, token });
    } catch (e) {  //handles errors
        res.status(400).send(e);
    }
});


//Logging in User
router.post('/users/login', async (req, res) => {
    try {
        const userLogged = await User.findByCredentials(req.body.email, req.body.password);
        //findByCredentials- our own created option in model, but has to be presented in statics of userSchema

        const token = await userLogged.generateAuthToken();
        //Here not User collection, bcz we r generating token for specific user so 'user.' not 'User.'
        //generateAuthToken()- our own created fn(method in model) to generate token

        res.status(200).send({ userLogged, token });//if multiple values need to send, should declare in 'object{}'
        //send user data along with token to client/user

    } catch (e) {
        res.status(400).send();
    }
});

//Upload profile picture
const upload = multer({
    //dest: 'avatars',
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Please upload an image'));
        }
        cb(undefined, true);
    }
});

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {//make it async fn route handler
    //add auth before file uploaded bcz to upload user needs to be authenticated
    //multer middleware executes before route handler so image saves in 'avatars' destination
    //So remove dest in upload multer to store image in DB

    //format & resize image
    //req.user.avatar = req.file.buffer;//contains binary data of file
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
    //converts all images into png, we can resize on server side using above methods
    req.user.avatar = buffer;
    await req.user.save();//in old way
    res.send();
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message });
});

//Delete profile picture
router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined;
    await req.user.save();
    res.send();
});


//Fetch user avatar
router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        console.log(user);
        if (!user || !user.avatar) {
            throw new Error();
        }
        //To tell the requester what type(jpg, png) of data he is getting, set the response header with key, value
        res.set('Content-Type', 'image/jpg');//'application/json' is default content-type

        res.send(user.avatar);//sending data back

    } catch (e) {
        res.status(400).send();
    }
});

//Logging out User
router.post('/users/logout', auth, async (req, res) => {
    try {
        //remove present token(req.item) from array of tokens(objects wiht {_id, token} keys)
        //tokens array will set up with all tokens except the present array using filter method
        req.user.tokens = req.user.tokens.filter((token) => {//token = {_id, token} keys
            return token.token != req.token;//if returns true, stored in tokens array, if false, token will be removed
        });
        await req.user.save();
        res.send();
    } catch (e) {
        res.status(500).send();
    }
});


//Logging out all Users
router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = [];//to remove all tokens at a time

        await req.user.save();

        res.send('Logged out from all devices successfully');

    } catch (e) {
        res.status(500).send();
    }
});















//Get all users data changed to ->
//Get my data
router.get('/users/me', auth, async (req, res) => {   //Get handler

    res.send(req.user);//returns user data came from auth.js middleware

});


//Update user by id -> changed to -> Update my account
router.patch('/users/me', auth, async (req, res) => {

    const updates = Object.keys(req.body);
    const allowedUpdates = ["age", "name", "email", "password"];
    const isValidOperation = updates.every((update) => {
        return allowedUpdates.includes(update);
    });

    if (!isValidOperation) {//if false returned
        return res.status(400).send({ error: 'Invalid updates!' })
    }
    try {
        //const updateUser = await User.findById(req.user._id);
        //change updateUser to req.user
        updates.forEach((update) => { //updates - array of strings
            req.user[update] = req.body[update];//To store sent values dynamically 
            console.log(update + ' - ' + req.user[update] + ' - ' + req.body[update]);
        });
        await req.user.save();//Here middleware actually going to execute

        res.send(req.user);

    } catch (e) {
        res.status(400).send(e);//For validation errors
    }
});

//Delete a user by id -> changed to -> Delete my account
//Old -> router.delete('/users/:id', async (req, res) => {
router.delete('/users/me', auth, async (req, res) => {
    try {

        //old ->
        /*      const deleteUser = await User.findByIdAndDelete(req.params.id);
     
             if (!deleteUser) {
                 return res.status(404).send();
             }
             res.send(deleteUser);
      */

        //New ->
        await req.user.remove();
        res.send(req.user);

    } catch (e) {
        res.status(500).send(e);
    }
});













//To register, export it
module.exports = router;