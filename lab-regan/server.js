'use strict';

const express = require('express');
const Promise = require('bluebird');
const debug = require('debug')('cfgram:server');
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

const authRouter = require('./route/auth-router.js');
const errors = require('./lib/error-middleware.js');

dotenv.load();

const PORT = process.env.PORT || 3000;
const app = express();

mongoose.connect(process.env.MONGODB_URI);

app.use(cors());
app.use(morgan('dev'));

app.use(authRouter);
app.use(errors);

app.listen(PORT,  () => {
  debug(`server up on port ${PORT}`);
});
