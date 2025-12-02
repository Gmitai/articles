const express = require('express');
const mysql = require('mysql2');
const urlencodedParser = express.urlencoded({extended: false});
const multer = require('multer');
const {extname} = require("node:path");
let selected_menuId=0;
let flgBook=0;
const app = express();
const storageConfig = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads');
        },
    filename:(req, file, cb) => {
        const uniSufix=Date.now()+'-'+Math.round(Math.random()*1E9);
        cb(null, file.originalname.substring(0, file.originalname.length-4)+'-'+uniSufix+extname(file.originalname));
    }
});

app.use(express.static(__dirname + '/Public'));
app.use(express.static(__dirname + '/js'))
app.use(express.static(__dirname + '/css'))
app.use(express.json());

const connection =mysql.createConnection({
host: 'localhost',
user: 'admin',
password: 'root',
database: 'articles',
port: 3306
});
app.get('/', (req, res) =>{
    res.sendFile('index.html')
});

function getDirectionIdByArtId(artId){
    connection.execute("SELECT ")
}
app.get('/articles', (req,res) => {
    connection.execute("SELECT a.id, d.id, a.title_tj AS 'Мавзӯъ', d.title_ru AS 'Самт', g.name AS 'Жанр', p.title_tj AS 'Нашриёт', DATE_FORMAT(a.publishYear, '%d.%m.%Y') AS 'Соли нашр', IF(a.typeOf=1, 'Мақола', 'Китоб') AS 'Тип' FROM articles a LEFT JOIN directions d ON a.directionId=d.id LEFT JOIN genres g ON a.genreId=g.id LEFT JOIN publishers p  ON a.publisherId=p.id WHERE a.typeOf=1", (err, result) => {
        if(err) return console.log(err);
        selected_menuId=0;
        flgBook=1;
        connection.execute("SELECT a.id AS id, CONCAT(ath.lastName,' ', ath.firstName, ' ', IFNULL(ath.familyName, '')) AS author FROM articles a JOIN article_authors au JOIN authors ath ON au.id_article=a.id AND au.id_author=ath.id", (suberr, subresult) => {
            if(suberr) return console.log(err);
            subresult.forEach(item => {
                const indx=result.findIndex(v=>v.id===item.id)
                if(indx>-1){
                    if(!('Муаллиф' in result[indx])) {
                        result[indx] = Object.assign(result[indx], {"Муаллиф": item.author});
                    }
                    else {
                        result[indx]['Муаллиф'] += ', ' + item.author;
                    }
                }
            });
            res.send([result, selected_menuId]);
        });
    })
});

app.get('/books', (req,res) => {
    connection.execute("SELECT a.id, a.title_tj AS 'Мавзӯъ', d.title_ru AS 'Самт', g.name AS 'Жанр', p.title_tj AS 'Нашриёт', DATE_FORMAT(a.publishYear, '%d.%m.%Y') AS 'Соли нашр' FROM articles a LEFT JOIN directions d ON a.directionId=d.id LEFT JOIN genres g ON a.genreId=g.id LEFT JOIN publishers p  ON a.publisherId=p.id WHERE a.typeOf=0", (err, result) => {
        if(err) return console.log(err);
        selected_menuId=0;
        flgBook=0;
        connection.execute("SELECT a.id AS id, CONCAT(ath.lastName,' ', ath.firstName, ' ', IFNULL(ath.familyName, '')) AS author FROM articles a JOIN article_authors au JOIN authors ath ON au.id_article=a.id AND au.id_author=ath.id", (suberr, subresult) => {
            if(suberr) return console.log(err);
            subresult.forEach(item => {
                const indx=result.findIndex(v=>v.id===item.id)
                if(indx>-1){
                    if(!('Муаллиф' in result[indx])) {
                        result[indx] = Object.assign(result[indx], {"Муаллиф": item.author});
                    }
                    else {
                        result[indx]['Муаллиф'] += ', ' + item.author;
                    }
                }
            });
            res.send([result, selected_menuId]);
        });
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
    connection.execute("SELECT p.id, p.title_tj as 'Номи нашриёт', c.title as 'Шаҳр', address as 'Суроға' from publishers p left join cities c on p.cityId=c.id", (err, result) => {
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
    connection.execute("SELECT title_ru as 'Самт', udc as 'УДК' FROM directions order by udc", (err, result) => {
        if(err) return console.log(err);
        selected_menuId=4;
        res.send([result, selected_menuId]);
    })
})

app.get('/genres', (req, res) => {
    connection.execute("SELECT `name` AS 'Жанр' FROM genres", (err, result) => {
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
app.get('/getArticles', (req, res) => {
    connection.execute("SELECT a.id, CONCAT(d.udc,' ', d.title_ru) AS title_ru, g.name,   FROM articles a left join article_authors aau on a.id=aau.id_article left join ", (err, result) => {
        if (err) return console.log(err);
        res.send(result);
    });
});

app.get('/getview', (req, res) => {
    connection.execute("SELECT a.id, a.title_tj, GROUP_CONCAT(CONCAT(au.lastName, ' ', au.firstName) SEPARATOR ', ') AS 'Ному насаб', a.pagesCount, a.publishYear, d.title_ru AS 'Направление', p.title_tj AS 'Издательство', a.filePath FROM articles a LEFT JOIN article_authors aa ON a.id = aa.id_article LEFT JOIN AUTHORS au ON aa.id_author = au.id LEFT JOIN directions d ON a.directionId = d.id LEFT JOIN publishers p ON a.publisherId = p.id GROUP BY a.id ORDER BY a.id;", (err, result) => {
        if (err) return console.log(err);
        res.send(result);
    });
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

/*app.get('/articleData', (req, res)=>{
    connection.execute("SELECT" from articles a left join authors au on)
}*/

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

app.use(multer({storage:storageConfig}).single('fileData'));
app.post('/addArticle', urlencodedParser, (req, res, next) => {

    const title=req.body.aricleName;
    const pageCount=req.body.pCount;
    const publishDate=req.body.publishYear;
    const direction=req.body.selDirect;
    const publisher=req.body.selPublisher;
    const authors=req.body.authors;



    connection.execute(`SELECT * FROM articles WHERE title_tj = '${title}' AND pagesCount='${pageCount}'`, function (err, result){
        if(result.length > 0){
            res.send("Чунин мақола аллакай дар БМ вуҷуд дорад!");
            res.sendFile(__dirname + '/public/index.html');
        }
        else {
            let filedata=req.file;

            if(!filedata){
                res.send('Ошибка при загрузке файла')
            }
            const sql="Insert into articles (title_tj, pagesCount, publishYear, directionId, publisherId, typeOf, filePath) VALUES (?,?,?,?,?,?,?)";
            connection.query(sql, [title, pageCount, publishDate, direction, publisher, flgBook, filedata.filename], (err, result) => {
                if (err)
                {
                    console.log(err)
                }
                else {

                    if (Array.isArray(authors)) {
                        authors.forEach((author) => {
                            connection.query("Insert into article_authors (id_article, id_author) VALUES (?,?)", [result.insertId, author], (err, res) => {
                                if (err) {
                                    console.log(err)
                                }
                            });
                        })
                    }
                    else{
                        connection.query("Insert into article_authors (id_article, id_author) VALUES (?,?)", [result.insertId, authors], (err, res) => {
                            if (err) {
                                console.log(err)
                            }
                        });
                    }
                }
            });


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

app.listen(3000, "192.168.31.103", () => {
    console.log('Сервер дар порти 3000 ҷойгир шуд');
});