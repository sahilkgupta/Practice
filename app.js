const express = require('express');
const dotenv = require('dotenv').config({ path: './config/config.env' });
const colors = require('colors');
const app = express();
const path = require('path');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcrypt');
const port = process.env.PORT || 3000;

const connectDB = require('./config/DB/connection/connection');
connectDB();
const logIn = require('./config/DB/models/login');

const frontend = path.join(__dirname, 'public');
app.use(express.static(frontend));

app.engine('.hbs', exphbs.engine({ extname: '.hbs', defaultLayout: 'main' }));
app.set('view engine', '.hbs');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
}));

app.use((req, res, next) => {
    res.locals.user = req.session.user;
    next();
});


// --------------------------------Sign up route---------------------------
app.get('/', (req, res) => {
    res.render('index');
});

app.get('/signup', (req, res) => {
    res.render('signup');
});

app.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new logIn({
            username,
            email,
            password: hashedPassword,
        });

        await newUser.save();
        res.redirect('/login?message=Signup%20successful!%20You%20can%20now%20login.');
    } catch (error) {
        console.error(error);
        res.redirect('/signup?message=Signup%20faild!%20plese%20enter%20valid%20password.');
    }
});

// Login route
app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await logIn.findOne({ email });

        if (!user) {
            // return res.redirect('/');
            const errorCode = 500;
            const errorMessage = 'Something went wrong.';
            res.status(errorCode).render('error', { errorCode, errorMessage });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (passwordMatch) {
            req.session.user = user;
            res.redirect('/dashboard?message=Login%20successful!');
        } else {
            // res.redirect('/');
            const errorCode = 401;
            const errorMessage = "User not registered. Please sign up or log in.";
            res.status(errorCode).render('error', { errorCode, errorMessage });

        }
    } catch (error) {
        console.error(error);
    }
});

app.get('/dashboard', (req, res) => {
    if (req.session.user) {
        res.render('dashboard', { user: req.session.user });
    } else {
        res.redirect('/');
    }
});
// Logout route
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error(err);
        }
        res.redirect('/?message=Logout%20successful!');
    });
});

// -------------------------- end-----------------------------
app.listen(port, () => {
    console.log(`Server listening on port ${port}`.bgGreen.black);
});
