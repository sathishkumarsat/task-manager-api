


const mongoose = require('mongoose');

//Connecting to database
/* mongoose.connect('mongodb://127.0.0.1:27017/task-manager-api-u', {  //Here DB url is hard coded, it's fine when we run locally in dev mode
    useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true
});
 */

 //But to deploy in Heroku, use professional service url for prod mode

//So by using environment var's we can use dynamic url both for dev & prod

//Connecting to database using env var
mongoose.connect(process.env.MONGODB_URL, {  //Here DB url is hard coded, it's fine when we run locally in dev mode
    useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true
});







