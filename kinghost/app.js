'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _morgan = require('morgan');

var _morgan2 = _interopRequireDefault(_morgan);

var _cookieParser = require('cookie-parser');

var _cookieParser2 = _interopRequireDefault(_cookieParser);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _serveFavicon = require('serve-favicon');

var _serveFavicon2 = _interopRequireDefault(_serveFavicon);

var _db = require('./src/config/db');

var _db2 = _interopRequireDefault(_db);

var _index = require('./src/routes/index');

var _index2 = _interopRequireDefault(_index);

var _programacao = require('./src/routes/programacao');

var _programacao2 = _interopRequireDefault(_programacao);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// import corretoresRouter from './src/routes/corretor'
// import canaisRouter from './src/routes/corretor-seguradora-canal'
// import festaRouter from './src/routes/festa'


var app = (0, _express2.default)();

app.set('view engine', 'ejs');
app.use((0, _morgan2.default)('dev'));
app.use(_bodyParser2.default.json({ limit: 1024102420, type: 'application/json' }));
app.use(_bodyParser2.default.urlencoded({ extended: false }));
app.use((0, _cookieParser2.default)());
app.use(_express2.default.static(_path2.default.join(__dirname, 'public')));
app.use(_db2.default);

app.use('/public/assets', _express2.default.static('assets'));
app.use('/public/images', _express2.default.static('images'));
app.use((0, _serveFavicon2.default)(__dirname + '/public/images/favicon.png'));

//ROUTES
app.use('/', _index2.default);
app.use('/programacao', _programacao2.default);
//app.use('/canal', (req, res, next) => {res.sendFile('./public/canal.html', { root: __dirname  } )});
//PAGES
// app.use('/controle-programacao', (req, res, next) => {res.sendFile('./public/programacao-controle.html', { root: __dirname })});
app.use('/controle-programacao', function (req, res, next) {
  res.sendFile(_path2.default.resolve(__dirname, './public/programacao-controle.html'));
});
//REMOVER QUANDO TERMINAR INDEX
app.use(function (req, res, next) {
  res.sendFile('./public/index.html', { root: __dirname });
});

// app.use('/empresas', empresasRouter);
// app.use('/corretores', corretoresRouter);
// app.use('/canais', canaisRouter);
// app.use('/festas', festaRouter);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

var port = normalizePort(process.env.PORT_APP || process.env.PORT || '3001');
var server = _http2.default.createServer(app);
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);
console.log('Server running at :' + port);

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
  //  debug('Listening on ' + bind);
}

//export default app;
module.exports = app;