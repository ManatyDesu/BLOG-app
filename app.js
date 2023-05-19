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
    // req.session.userIdがundefinedである場合、そのユーザはログインしていない。
    if (req.session.userId === undefined) {
        res.locals.username = 'ゲスト';
        res.locals.isLoggedIn = false;
    } else {
        res.locals.uername = req.session.username;
        res.locals.isLoggedIn = true;
    }
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

// past_list.ejsから'/argicle_past/:id'をリクエストされた時に、ariticle.ejsをレスポンス
app.get('/article_past/:id', (req, res) => {
    const id = req.params.id;
    connection.query(
        'select * from past_articles where id=?',
        [id],
        (error, results) => {
            res.render('article.ejs', { article: results[0] });
        }
    )
})

// current_list.ejsから'/argicle_current/:id'をリクエストされた時に、ariticle.ejsをレスポンス
app.get('/article_current/:id', (req, res) => {
    const id = req.params.id;
    connection.query(
        'select * from current_articles where id=?',
        [id],
        (error, results) => {
            res.render('article.ejs', { article: results[0] });
        }
    )
})

// future_list.ejsから'/argicle_future/:id'をリクエストされた時に、ariticle.ejsをレスポンス
app.get('/article_future/:id', (req, res) => {
    const id = req.params.id;
    connection.query(
        'select * from future_articles where id=?',
        [id],
        (error, results) => {
            res.render('article.ejs', { article: results[0] });
        }
    )
})

// '/login'がリクエストされたらlogin.ejsをレスポンス
app.get('/login', (req, res) => {
    res.render('login.ejs', {errors:[]});
})

// '/login' (post)がリクエストされたら、ユーザのログイン処理を行う。
// ミドルウェア関数1 -> リクエストされたフォームが空でないか確かめる
// ミドルウェア関数2 -> ユーザのアカウントがデータベースに登録されているか確認し、ログインの可否を判断する
app.post('/login',
    (req, res, next) => {
        const email = req.body.email;
        const password = req.body.password;
        const errors = [];

        if(email==='') {
            errors.push('メールアドレスが空です');
        }
        if(password==='') {
            errors.push('パスワードが空です');
        }

        if(errors.length > 0) {
            res.render('login.ejs', {errors:errors});
        } else {
            next();
        }
    },

    (req, res) => {
        const email = req.body.email;
        const errors = [];

        connection.query(
            'select * from users where email = ?',
            [email],
            (error, results) => {
                if(results.length > 0) {
                    const plain = req.body.password
                    const hash = results[0].password

                    bcrypt.compare(plain, hash, (error, isEqual) => {
                        if(isEqual) {
                            req.session.userId = results[0].id;
                            req.session.username = results[0].username;
                            res.redirect('/list');
                        } else {
                            errors.push('パスワードが違います')
                            res.render('login.ejs', {errors:errors})
                        }
                    })
                } else {
                    errors.push('ログインに失敗しました');
                    res.render('login.ejs', {errors:errors});
                }
            }
        )
    }
)

// '/logout'がリクエストされたら、そのユーザのセッション情報を削除する
app.get('/logout', (req, res) => {
    req.session.destroy((error) => {
        res.redirect('/list');
    })
})

app.listen(4000)