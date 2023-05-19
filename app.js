const express = require('express');
const mysql = require('mysql');
const session = require('express-session');
const bcrypt = require('bcrypt');
const app = express();

app.use(express.static('public'));
app.use(express.urlencoded({extended: false}));

const connection = mysql.createConnection({
    host: "127.0.0.1",
    user: 'root',
    password: 'Manaty14',
    database: 'blog'
})

connection.connect((err) => {
    if (err) {
        console.log('error connection: ' + err.stack);
        return;
    }
    console.log('success')
});

app.use(
    session({
        secret: 'my_secret_key',
        resave: false,
        saveUninitialized: false,
    })
);

app.use((req, res, next) => {
    next()
})

// '/'がリクエストされたら、home.ejsをレスポンス
app.get('/', (req, res) => {
    res.render('home.ejs');
})

// '/list'がリクエストされたら、list.ejsをレスポンス
app.get('/list', (req, res) => {
    res.render('list.ejs');
})

app.listen(4000)