import express from 'express';

const app = express();

// Allow any method from any host and log requests
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');

    if ('OPTIONS' === req.method) res.sendStatus(200);
    else {
        console.log(`${req.ip} ${req.method} ${req.url}`);
        next();
    }
});

// Handle POST requests that come in formatted as JSON
app.use(express.json());

// A default hello word route
app.get('/', (req, res) => {
    res.send({ hello: 'world' });
});

// start our server on port 4201
app.listen(4201, '127.0.0.1', () => {
    console.log('Server now listening on 127.0.0.1:4201');
});
