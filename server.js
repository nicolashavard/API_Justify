// Imports
const express     = require('express');
const app         = express();
const bodyParser  = require('body-parser');
const morgan      = require('morgan');
const mongoose    = require('mongoose');

const jwt    = require('jsonwebtoken');
const config = require('./config');
const User   = require('./app/models/user');

// Configuration
const port = process.env.PORT || 3000;
mongoose.connect(config.database);
app.set('superSecret', config.secret);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(bodyParser.text());

app.use(morgan('dev'));


// Routes communes
app.get('/', function(req, res) {
    res.send('Hello! The API is at http://localhost:' + port + '/api');
});
app.get('/setup', function(req, res) {

    // On creer un user pour tester ensuite l'authentification
    const newUser = new User({
        email: 'nicolas.havard@epitech.eu',
    });

    newUser.save(function(err) {
        if (err) throw err;

        console.log('User saved successfully');
        res.json({ success: true });
    });
});

// Routes liees a l'API
const apiRoutes = express.Router();

// Route pour s'authentifier ==> POSTMAN (POST http://localhost:3000/api/token)
apiRoutes.post('/token', function(req, res) {

    User.findOne({
        email: req.body.email
    }, function(err, user) {

        if (err) throw err;

        if (!user) {
            res.json({ success: false, message: 'Authentication failed. User not found.' });
        } else {

            const payload = {
                email: user.email
            };
            const token = jwt.sign(payload, app.get('superSecret'), {
                expiresIn: '1h'
            });

            res.json({
                success: true,
                message: 'Voici le token',
                token: token
            });
        }
    });
});

// route middleware verifiant le token
apiRoutes.use(function(req, res, next) {

    const token = req.body.token || req.query.token || req.headers['x-access-token'];

    if (token) {
        jwt.verify(token, app.get('superSecret'), function(err, decoded) {
            if (err) {
                return res.json({ success: false, message: 'Failed to authenticate token.' });
            } else {
                req.decoded = decoded;
                next();
            }
        });

    } else {
        return res.status(403).send({
            success: false,
            message: 'No token provided.'
        });

    }
});

// On ne peut acceder a ces routes seulement si le token d'authentification est valide

// Index de la route API => POSTMAN (GET http://localhost:3000/api)
apiRoutes.get('/', function(req, res) {
    res.json({ message: 'Vous etes a l\'index de l\'API' });
});


// Return tout les users de la DB  (GET http://localhost:3000/api/users)
apiRoutes.get('/users', function(req, res) {
    User.find({}, function(err, users) {
        res.json(users);
    });
});


//TODO faire la justification
apiRoutes.post('/justify', function(req, res) {
    return res.send(req.body);
});


// les routes de l'API sont precedees de "/api"
app.use('/api', apiRoutes);


// Start the server
app.listen(port);
console.log('Le server ecoute sur http://localhost:' + port);
