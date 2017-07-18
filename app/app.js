import express from 'express'
import path from 'path'
import logger from 'morgan'
import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser'
//import favicon from 'serve-favicon';

import dbConfig from './src/config/db'
import indexRouter from './src/routes/index'
// import empresasRouter from './src/routes/empresas'
// import corretoresRouter from './src/routes/corretor'
// import canaisRouter from './src/routes/corretor-seguradora-canal'
// import festaRouter from './src/routes/festa'


const app = express();


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(dbConfig);

app.use('/public/assets', express.static('assets'));
app.use('/public/images', express.static('images'));
var favicon = require('serve-favicon');
//app.use(favicon(__dirname + '/public/images/favicon.png'));

//ROUTES
app.use('/', indexRouter);
// app.use('/empresas', empresasRouter);
// app.use('/corretores', corretoresRouter);
// app.use('/canais', canaisRouter);
// app.use('/festas', festaRouter);


// catch 404 and forward to error handler
app.use((req, res, next) => {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

//export default app;
module.exports = app;
