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

// list.ejsから'/past'をリクエストされた時に、past_list.ejsをレスポンス
app.get('/past', (req, res) => {
    connection.query(
        // past_articles Databaseから全ての情報を取得
        'select * from past_articles',
        (error, results) => {
            res.render('past_list.ejs', {articles: results});
        }
    )
})

// list.ejsから'/current'をリクエストされた時に、current_list.ejsをレスポンス
app.get('/current', (req, res) => {
    connection.query(
        // current_articles Databaseから全ての情報を取得
        'select * from current_articles',
        (error, results) => {
            res.render('current_list.ejs', {articles: results});
        }
    )
})

// list.ejsから'/future'をリクエストされた時に、future_list.ejsをレスポンス
app.get('/future', (req, res) => {
    connection.query(
        // future_articles Databaseから全ての情報を取得
        'select * from future_articles',
        (error, results) => {
            res.render('future_list.ejs', {articles: results});
        }
    )
})

app.listen(4000)