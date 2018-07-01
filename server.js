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
let rateLimit = {};
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
        res.status(201).json({ success: true });
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
            res.json({ success: false, message: 'Authentication failed. email not found.' });
        } else {

            const payload = {
                email: user.email
            };
            const token = jwt.sign(payload, app.get('superSecret'), {
                expiresIn: '24h'
            });
            rateLimit[token] = {words : 0, date: new Date()};
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



apiRoutes.post('/justify', function(req, res) {
    let token = req.headers['x-access-token'];

    let day = rateLimit[token].date;
    day = day.getDate();
    let currentDate = new Date();
    let currentDay = currentDate.getDate();

    if (currentDay !== day) {
        rateLimit[token].date = currentDay;
        rateLimit[token].words = 0;
    }
    const array = req.body.split(/\n|\s/);

    console.log(rateLimit);
    rateLimit[token].words += array.length;
    if(rateLimit[token].words > 80000)
        res.status(402).json({ success: false, message: '402 Payment Required.' });
    else {
        let index = 0;
        let text = [""];
        array.forEach((str) => {
            if (text[index].length + str.length <= 80) {
                text[index] += str + ' ';
            } else {
                text[index] = text[index].substr(0, text[index].length - 1);
                if (text[index].length !== 80) {
                    let fill = 80 - text[index].length;
                    const re = /\s/g;
                    let spaces = [];
                    while ((match = re.exec(text[index])) !== null) {
                        spaces.push(match.index);
                    }
                    spaces = spaces.reverse();
                    let i = 0;
                    while (fill > 0) {
                        text[index] = text[index].split('');
                        text[index].splice(spaces[i], 0, ' ');
                        text[index] = text[index].join('');
                        i++;
                        fill--;
                    }
                }
                index++;
                text[index] = "";
                text[index] += str + ' ';
            }
        });
        text[index] = text[index].substr(0, text[index].length - 1);
        text = text.join("\n");
        return res.send(text);
    }
});


// les routes de l'API sont precedees de "/api"
app.use('/api', apiRoutes);


// Start the server
app.listen(port);
console.log('Le server ecoute sur http://localhost:' + port);
