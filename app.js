const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const cors = require('cors');
const mongoose = require('mongoose');
const errorHandler = require('errorhandler');

require('dotenv').config();

//Configure mongoose's promise to global promise
mongoose.promise = global.Promise;

//Configure isProduction variable
const isProduction = process.env.NODE_ENV === 'production';

//Initiate our app
const app = express();

//Configure our app
app.use(cors());
app.use(require('morgan')('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({ secret: process.env.PASSPORT_SECRET, cookie: { maxAge: 60000 }, resave: false, saveUninitialized: false }));

if(!isProduction) {
  app.use(errorHandler());
}

//Configure Mongoose
const mongoDB = process.env.MONGO_DB;
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true, }).catch(err => {
  console.log(`DB Connection Error: ${err.message}`);
})

//Models & routes
require('./models/Users');

require('./config/passport');
app.use(require('./routes'));

//Error handlers & middlewares
if(!isProduction) {
  app.use((err, req, res, next) => {
    res.status(err.status || 500).json({
      errors: {
        message: err.message,
        error: err,
      },
    });
  });
}

app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    errors: {
      message: err.message,
      error: {},
    },
  });
});

let port = process.env.PORT || 8000;

app.listen(port, () => {
    console.log('Server is up and running on port: ' + port);
});