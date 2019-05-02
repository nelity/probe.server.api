var express = require("express");
var redis = require("redis");
var app = express();
var cors = require('cors');
var bodyParser = require("body-parser");
var session = require("express-session");
var redisStore = require('connect-redis')(session);
var fs = require("fs");
var client = redis.createClient();
var morgan = require("morgan");
var http = require('http');
//var https = require('https'); TODO
var Config = require('./_helpers/config'), conf = new Config();
const helmet = require('helmet');

var middlewares = require('./middlewares');


var whitelist = ['http://localhost:3001', 'http://localhost:4001', 'https://www.nelity.com', 'https://nelity.com', 'http://www.nelity.com', 'http://nelity.com']

app.use(cors({ origin: whitelist, credentials: true }));
app.options(whitelist, cors({ origin: whitelist, credentials: true }));
require('events').EventEmitter.defaultMaxListeners = Infinity;
var WebSocketServer = require("ws").Server;
var sessionParser = session({
    secret: '}Z$U,[G,x,@sBgDrZ5"E)j[/',
    cookie: { maxAge: 3 * 60 * 60 * 1000, httpOnly: true, secure: true, domain: 'nelity.com', },
    resave: false,
    saveUninitialized: false,
    store: new redisStore({ host: conf.redis.host, port: conf.redis.port, client: client, ttl: conf.redis.ttl })
});
app.use(helmet());
app.use(helmet.hsts({
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
}));

app.use(sessionParser);
app.set("trust proxy", 1);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

morgan.token("res", function getId(res) {
    return res;
});
var accessLogStream = fs.createWriteStream(__dirname + "/logs/access.log", { flags: "a" });
app.use(morgan("combined", { stream: accessLogStream }));

//app.use(require("./_controllers"));
app.use(function (req, res) {
    res.status(404).send("API is running...");
});
var httpServer = http.createServer(app);
//var httpsServer = https.createServer({ key: fs.readFileSync(path.join(__dirname, './crt/nelity.com.key')), cert: fs.readFileSync(path.join(__dirname, './crt/nelity.com.crt')) }, app); TODO

httpServer.listen(conf.http.port);
//httpsServer.listen(conf.https.port); TODO
var wss = new WebSocketServer({
  server: httpServer
});
middlewares.websocket.WSSOpen(wss);