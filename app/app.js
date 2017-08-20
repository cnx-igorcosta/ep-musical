import express from 'express'
import http from 'http';
import path from 'path'
import logger from 'morgan'
import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser'
import favicon from 'serve-favicon';

import dbConfig from './src/config/db'
import indexRouter from './src/routes/index'
import programacaoRouter from './src/routes/programacao'
// import corretoresRouter from './src/routes/corretor'
// import canaisRouter from './src/routes/corretor-seguradora-canal'
// import festaRouter from './src/routes/festa'


const app = express();

app.set('view engine', 'ejs');
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(dbConfig);

app.use('/public/assets', express.static('assets'));
app.use('/public/images', express.static('images'));
app.use(favicon(__dirname + '/public/images/favicon.png'));

//ROUTES
app.use('/', indexRouter);
app.use('/programacao', programacaoRouter);
//app.use('/canal', (req, res, next) => {res.sendFile('./public/canal.html', { root: __dirname  } )});
//PAGES
// app.use('/controle-programacao', (req, res, next) => {res.sendFile('./public/programacao-controle.html', { root: __dirname })});
app.use('/controle-programacao', (req, res, next) => {
  res.sendFile(path.resolve(__dirname,'./public/programacao-controle.html'))
  });
//REMOVER QUANDO TERMINAR INDEX
app.use((req, res, next) => {res.sendFile('./public/index.html', { root: __dirname  } )});

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

const port = normalizePort(process.env.PORT_APP || process.env.PORT || '3001');
const server = http.createServer(app);
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

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

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
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
//  debug('Listening on ' + bind);
}

//export default app;
module.exports = app;
