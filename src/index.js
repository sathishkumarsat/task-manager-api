const express = require('express');
require('./db/mongoose');//To connect to database

const User = require('./models/user');//To import model so we can give field values
const Task = require('./models/task');

const userRouter = require('./routers/user');//To import router so we can register/call it here
const taskRouter = require('./routers/task');

const app = express();
const port = process.env.PORT; //heroku provided port || local development port





//To add 'file upload' to express
const multer = require('multer');//for ex sake writing here
//configure multer & upload file by restricting type & size
const upload = multer({
    dest: 'images',  //destination : folder name
    limits: {
        fileSize: 1000000   //in bytes
    },
    fileFilter(req, file, cb) {   //fn with 3 args ->
        // -> () req being made, info about uploaded file, call back to acknowledge/tell the multer after filtering done )

        if (!file.originalname.endsWith('.pdf')) {    //or .jpg or .txt - based on our requirement
            return cb(new Error('Please upload a PDF'));//if not display error
        }

        //OR we can check for doc/docx files with regular expression inside forward slashes(/regex/) (delcare any one if condition)
        //if (!file.originalname.match(/.(doc|docx)$/)) {    // compares extensions with regular expressions
        //return cb(new Error('Please upload a Word Document'));
        //}

        cb(undefined, true);
        //we can call callbacks 3 diff ways
        //cb(new Error('Please upload a PDF')); -> if something goes wrong n need to throw that error to callback(cb arg) fn
        //cb(undefined, true) -> if things go well, we send 'undefined'(no error) as 1st arg, boolean(true - allow upload) as 2nd arg
        //cb(undefined, false) -> not used much, we send 'undefined' as 1st arg, boolean(false - reject upload) as 2nd arg
    }
});

//router/endpoint for uploading image files
//3 args (string url, middleware from multer library, route handler) + 4th arg fn
app.post('/upload', upload.single('upload'), (req, res) => { //look for file 'upload' when req comes in
    res.send();
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message });
});


//Our own middlware fn for handling errors
/* const errorMiddleware = (req, res, next) => {
    throw new Error('From errorMiddleware');
}
app.post('/upload', errorMiddleware, (req, res) => {//Now with 4 args
    res.send();
}, (error, req, res, next) => {//4 arg to send error message
    res.status(400).send({ error: error.message });
}); */






app.use(express.json());//should be above using routers

app.use(userRouter);//Here we registered to work with express appn -> app. or express().use()
app.use(taskRouter);

app.listen(port, () => {
    console.log('Server is running on port ' + port);
});












