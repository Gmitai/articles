const express = require('express');
const app = express();
const mysql=require("mysql2");
const urlencodedParser = express.urlencoded({extended: false});

const connection=mysql.createConnection({
    host: "192.168.31.103",
    user: "admin",
    password: "root",
    database: "articles"
});


connection.connect(function(err){
    if (err) {
        return console.error("Ошибка: " + err.message);
    }
    else{
        console.log("Подключение к серверу MySQL успешно установлено");
    }
});
app.use(express.static(__dirname + "/public"));
app.use(express.static(__dirname + "/js"));
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});



app.get('/addArticle', (req, res) => {
    res.sendFile(__dirname + '/public//addArticle.html');
});

app.get('/addPublisher', (req, res) => {
    res.sendFile(__dirname + '/public/addPublisher.html');
});

app.get('/addAuthor', (req, res) => {
    res.sendFile(__dirname + '/public/addAuthors.html');
});

app.get('/register', (req, res) => {
    res.sendFile(__dirname + '/public/register.html');
});

app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/public/login.html');
});

app.get('/getCities', (req, res) => {
    connection.execute("SELECT id, title FROM cities WHERE typeOf = 1", (err, result) => {
        if (err) return console.log(err);
        res.send(result);
    });
});

app.get('/getDirections', (req, res) => {
    connection.execute("SELECT id, CONCAT(udc,' ', title_ru) AS title_ru FROM directions", (err, result) => {
        if (err) return console.log(err);
        res.send(result);
    });
});

app.get('/getPublishers', (req, res) => {
    connection.execute("SELECT id, title_tj FROM publishers", (err, result) => {
        if (err) return console.log(err);
        res.send(result);
    });
});

app.get('/getAuthors', (req, res) => {
    connection.execute("SELECT id, CONCAT(lastName, ' ', firstName) AS lastName FROM authors", (err, result) => {
        if (err) return console.log(err);
        res.send(result);
    });
});


app.post('/addAuthor', urlencodedParser, (req, res) => {
    const fullName = req.body.authorsName.split(' ');
    const birthDate=req.body.birthDate;
    const phoneNumber=req.body.phone;
    const homePhoneNumber=req.body.homePhoneNum;
    const workPhoneNumber=req.body.workPhoneNum;
    const selCity=req.body.selCity;
    const address=req.body.address;
    const lastName=fullName[0].charAt(0).toUpperCase() + fullName[0].substring(1).toLowerCase();
    const firstName=fullName[1].charAt(0).toUpperCase() + fullName[1].substring(1).toLowerCase();
    let familyName=null;
    if (fullName.length>2) {
        familyName=fullName[2].charAt(0).toUpperCase() + fullName[2].substring(1).toLowerCase();
    }

    connection.execute(`SELECT * FROM authors WHERE firstName = '${firstName}' AND lastName='${lastName}'`, function (err, result, fields){
        if(result.length > 0){
            res.sendFile(__dirname + '/public/addAuthors.html');
        }
        else {
            const sql="Insert into authors (firstName, lastName, familyName, birthDate, mobilePhone, cityId, address) VALUES (?,?,?,?,?,?,?)";
            connection.query(sql, [firstName, lastName, familyName, birthDate, phoneNumber, selCity, address], (err, result) => {
                if (err) {console.log(err)}
            });
        }
    });

})

app.post('/addPublisher', urlencodedParser, (req, res) => {
    const publisher = req.body.publisherName;
    const selCity=req.body.selCity;
    const address=req.body.address;
    connection.execute(`SELECT * FROM publishers WHERE title_tj = '${publisher}' AND cityId='${selCity}'`, function (err, result){
        if(result.length > 0){
            res.send("Чунин нашриёт аллакай дар БМ вуҷуд  дорад!");
            res.sendFile(__dirname + '/public/addPublisher.html');
        }
        else {
            const sql="Insert into publishers (title_tj, cityId, address) VALUES (?,?,?)";
            connection.query(sql, [publisher, selCity, address], (err, result) => {
                if (err) {console.log(err)}
            });
            res.sendFile(__dirname + '/public/addPublisher.html');
        }
    });

})

app.post('/addArticle', urlencodedParser, (req, res) => {
   const title=req.body.aricleName;
   const pageCount=req.body.pCount;
   const publishDate=req.body.publishYear;
   const direction=req.body.selDirect;
   const publisher=req.body.selPublisher;

    connection.execute(`SELECT * FROM articles WHERE title_tj = '${title}' AND pagesCount='${pageCount}'`, function (err, result){
        if(result.length > 0){
            res.send("Чунин мақола аллакай дар БМ вуҷуд дорад!");
            res.sendFile(__dirname + '/public/addArticle.html');
        }
        else {
            const sql="Insert into articles (title_tj, pagesCount, publishYear, directionId, publisherId) VALUES (?,?,?,?,?)";
            connection.query(sql, [title, pageCount, publishDate, direction, publisher], (err, result) => {
                if (err) {console.log(err)}
            });
            res.sendFile(__dirname + '/public/addArticle.html');
        }
    });
})

app.post('/register', urlencodedParser, (req, res) => {
    const fullName = req.body.fName.split(' ');
    const birthDate=req.body.bDate;
    const phoneNumber=req.body.pNumber;
    const selCity=req.body.selCity;
    const address=req.body.address;
    const email=req.body.userMail;
    const password=req.body.userPassword;
    const pseudonym=req.body.PName;
    const lastName=fullName[0].charAt(0).toUpperCase() + fullName[0].substring(1).toLowerCase();
    const firstName=fullName[1].charAt(0).toUpperCase() + fullName[1].substring(1).toLowerCase();
    let familyName=null;
    if (fullName.length>2) {
        familyName=fullName[2].charAt(0).toUpperCase() + fullName[2].substring(1).toLowerCase();
    }

    connection.execute(`SELECT * FROM users WHERE password = '${password}' AND login='${email}'`, function (err, result, fields){
        if(result.length > 0){
            res.sendFile(__dirname + '/public/register.html');
        }
        else {
            const sql="Insert into users (eMail, login, password, firstName, lastName, familyName, birthDate, mobilePhone, cityId, address, pseudonym) VALUES (?,?,?,?,?,?,?,?,?,?,?)";
            connection.query(sql, [email, email, password, firstName, lastName, familyName, birthDate, phoneNumber, selCity, address, pseudonym], (err, result) => {
                if (err) {console.log(err)}
            });
        }
    });

})


app.listen(3000, "localhost", () => {
    console.log('Сервер дар порти 3000 ҷойгир шудааст');

app.listen(3000, "192.168.31.103", () => {
    console.log('Сервер дар порти 3000 ҷойгир шуд');
});