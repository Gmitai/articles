const express = require('express');
const mysql = require('mysql2');
const urlencodedParser = express.urlencoded({extended: false});
let selected_menuId=0;
const app = express();
app.use(express.static(__dirname + '/Public'));
app.use(express.static(__dirname + '/js'))
app.use(express.static(__dirname + '/css'))
app.use(express.json());

const connection =mysql.createConnection({
host: 'localhost',
user: 'root',
password: 'root',
database: 'articles',
port: 3306
});
app.get('/', (req, res) =>{
    res.sendFile('index.html')
});
app.get('/articles', (req,res) => {
     connection.execute("SELECT a.id, a.title_tj AS 'Мавзӯъ', d.title_ru AS 'Самт', g.name AS 'Жанр', p.title_tj AS 'Нашриёт', DATE_FORMAT(a.publishYear, '%d.%m.%Y') AS 'Соли нашр', IF(a.typeOf=1, 'Мақола', 'Китоб') AS 'Тип', CONCAT(au.lastName,' ', au.firstName, ' ', IFNULL(au.familyName, '')) AS 'Муалиф' FROM articles a JOIN authors au ON a.author_id=au.id LEFT JOIN directions d ON a.directionId=d.id LEFT JOIN genres g ON a.genreId=g.id LEFT JOIN publishers p  ON a.publisherId=p.id WHERE a.typeOf=2", (err, result) => {
        if(err) return console.log(err);
         selected_menuId=0;
         res.send([result, selected_menuId]);

    })
});

app.get('/books', (req,res) => {
    connection.execute("SELECT a.id, a.title_tj AS 'Мавзӯъ', d.title_ru AS 'Самт', g.name AS 'Жанр', p.title_tj AS 'Нашриёт', DATE_FORMAT(a.publishYear, '%d.%m.%Y') AS 'Соли нашр', IF(a.typeOf=1, 'Мақола', 'Китоб') AS 'Тип', CONCAT(au.lastName,' ', au.firstName, ' ', IFNULL(au.familyName, '')) AS 'Муалиф' FROM articles a JOIN authors au ON a.author_id=au.id LEFT JOIN directions d ON a.directionId=d.id LEFT JOIN genres g ON a.genreId=g.id LEFT JOIN publishers p  ON a.publisherId=p.id WHERE a.typeOf=1", (err, result) => {
        if(err) return console.log(err);
        selected_menuId=0;
        res.send([result, selected_menuId]);

    })
});

app.get('/authors', (req, res) => {
    connection.execute("SELECT a.id, CONCAT(a.lastName,' ', a.firstName, ' ', IFNULL(a.familyName, '')) AS 'Ному насаб',   DATE_FORMAT(a.birthDate, '%d.%m.%Y') AS 'Санаи тавалуд', c.title AS 'Шаҳр', a.address AS 'Суроға' FROM authors a LEFT JOIN cities c ON a.cityId=c.id", (err, result) =>{
        if(err) return console.log(err);
        selected_menuId=1;
        res.send([result, selected_menuId]);
    })
});

app.get('/publishers', (req, res) => {
    connection.execute("SELECT p.title_tj as 'Номи нашриёт', c.title as 'Шаҳр', address as 'Суроға' from publishers p left join cities c on p.cityId=c.id", (err, result) => {
        if(err) return console.log(err);
        selected_menuId=2;
        res.send([result, selected_menuId]);
    })
})

app.get('/cities', (req, res) => {
    connection.execute("SELECT title as 'Шаҳр', if(typeOf=1, 'Давлат', 'Шаҳр') as 'Шаҳр/Давлат/Ноҳия' from cities", (err, result) => {
        if(err) return console.log(err);
        selected_menuId=3;
        res.send([result, selected_menuId]);
    })
})

app.get('/directions', (req, res) => {
    connection.execute("SELECT title_ru as 'Самт', udc as 'Классификатор-udc' FROM directions order by udc", (err, result) => {
        if(err) return console.log(err);
        selected_menuId=4;
        res.send([result, selected_menuId]);
    })
})

app.get('/genres', (req, res) => {
    connection.execute("SELECT `name` AS 'Жанр', `status` AS 'Статус' FROM genres", (err, result) => {
        if(err) return console.log(err);
        selected_menuId=5;
        res.send([result, selected_menuId]);
    })
})

app.get('/users', (req, res) => {
    connection.execute("SELECT u.id, CONCAT(u.lastName,' ', u.firstName, ' ', IFNULL(u.familyName, '')) AS 'Ному насаб', u.login AS 'Логин', u.eMail AS 'Эл-почта', u.mobilePhone AS 'Номери телефон', DATE_FORMAT(u.birthDate, '%d.%m.%Y') AS 'Санаи тавалуд', c.title AS 'Шаҳр', u.address AS 'Суроға', u.pseudonym AS 'Номи кутоҳ', DATE_FORMAT(u.createdAt, '%d.%m.%Y') AS 'Санаи регистратсия' FROM users u left join cities c on u.cityId=c.id", (err, result) => {
        if(err) return console.log(err);
        selected_menuId=6;
        res.send([result, selected_menuId]);
    })
})

//----------------------------------------------------------------------------------------------------------------------//
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

app.get('/Catalog', (req, res) => {
    res.sendFile(__dirname + '/public/Catalog.html');
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
            res.sendFile(__dirname + '/public/index.html');
        }
        else {
            const sql="Insert into articles (title_tj, pagesCount, publishYear, directionId, publisherId) VALUES (?,?,?,?,?)";
            connection.query(sql, [title, pageCount, publishDate, direction, publisher], (err, result) => {
                if (err) {console.log(err)}
            });
            res.sendFile(__dirname + '/public/index.html');
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
    console.log('Сервер дар порти 3000 ҷойгир шуд');
});