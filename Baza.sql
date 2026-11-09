/*
SQLyog Community v13.3.1 (64 bit)
MySQL - 9.6.0 : Database - articles
*********************************************************************
*/

/*!40101 SET NAMES utf8 */;

/*!40101 SET SQL_MODE=''*/;

/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
CREATE DATABASE /*!32312 IF NOT EXISTS*/`articles` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `articles`;

/*Table structure for table `article_authors` */

DROP TABLE IF EXISTS `article_authors`;

CREATE TABLE `article_authors` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_article` int NOT NULL,
  `id_author` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=235 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `article_authors` */

insert  into `article_authors`(`id`,`id_article`,`id_author`) values 
(151,61,8),
(164,53,8),
(168,62,10),
(177,65,8),
(178,65,9),
(179,65,10),
(182,60,11),
(184,58,16),
(185,58,17),
(187,59,16),
(188,55,13),
(189,63,19),
(190,64,20),
(195,66,9),
(196,66,18),
(198,68,10),
(200,52,10),
(202,69,9),
(203,54,15),
(210,57,16),
(211,67,11),
(212,70,10),
(213,71,12),
(214,71,13),
(217,56,15),
(220,51,9),
(221,72,9),
(222,73,10),
(223,74,11),
(224,74,12),
(225,75,11),
(227,77,10),
(228,77,11),
(229,78,11),
(231,79,12),
(233,80,9),
(234,76,9);

/*Table structure for table `articles` */

DROP TABLE IF EXISTS `articles`;

CREATE TABLE `articles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title_tj` varchar(150) DEFAULT NULL,
  `title_ru` varchar(150) DEFAULT NULL,
  `title_en` varchar(150) DEFAULT NULL,
  `directionId` int DEFAULT NULL,
  `genreId` int DEFAULT '1',
  `publisherId` int DEFAULT NULL,
  `publishYear` date DEFAULT NULL,
  `uid` int DEFAULT NULL,
  `pagesCount` int DEFAULT NULL,
  `typeOf` int DEFAULT NULL COMMENT '0-book, 1-article',
  `filePath` varchar(150) DEFAULT NULL,
  `statusType` int DEFAULT NULL COMMENT '0-nomuayan, 1-VAK, 2-international, 3-Jumhuriyavi, 4-dokhili',
  `createAt` datetime DEFAULT NULL,
  `coverPath` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=81 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `articles` */

insert  into `articles`(`id`,`title_tj`,`title_ru`,`title_en`,`directionId`,`genreId`,`publisherId`,`publishYear`,`uid`,`pagesCount`,`typeOf`,`filePath`,`statusType`,`createAt`,`coverPath`) values 
(51,'Ҳасани арӯс',NULL,NULL,8,1,14,'2026-03-14',NULL,123777,0,'Article-1779417341914-784094549.pdf',NULL,NULL,'cover-1789299484865-221498370.png'),
(52,'Илҳом аз Ватан',NULL,NULL,7,1,1,'2026-05-14',NULL,234,0,'Article-1779417369508-168761129.pdf',NULL,NULL,NULL),
(53,'Зодрӯзи Ватан',NULL,NULL,7,1,1,'2026-05-11',NULL,2348,0,'Article-1779417409484-485849455.pdf',NULL,NULL,'21. ÐÐ¾ÑÑ-1789296920322-624728022.jpg'),
(54,'Структуры данных и алгоритмы в Java (второе издание )',NULL,NULL,1,1,14,'2026-05-21',NULL,8014,0,'data_structures_and_algorithms_in_java-1779419835036-644503849.pdf',NULL,NULL,'3. ÐÐµÐ¾Ð¿Ð°ÑÐ´-1789296888525-461833118.jpg'),
(55,'Thinking in Java',NULL,NULL,1,1,1,'2026-05-21',NULL,1079,0,'ThinkingInJava-1779419844715-393871219.pdf',NULL,NULL,NULL),
(56,'Introducing Python: Modern Computing in Simple Packages',NULL,NULL,5,1,1,'2024-01-10',NULL,1234,1,'introducing-python-modern-computing-in-simple-packages-1779419822092-507451259.pdf',NULL,NULL,NULL),
(57,'Java Concurrency in Practice',NULL,NULL,1,1,2,'2024-04-30',NULL,345,1,'java_concurrency_in_practice-1779420037451-887825029.pdf',NULL,NULL,NULL),
(58,'Решеник рутинных задач с помощью Python: практическое руководство для начинающих (ENG)',NULL,NULL,42,1,1,'2026-05-08',NULL,1090,1,'sweigart_a_automate_the_boring_s-1779420234269-666770956.pdf',NULL,NULL,NULL),
(59,'Польза ии в современном мире',NULL,NULL,42,1,1,'2026-05-14',NULL,123,0,'Article-1779442551139-787717084.pdf',NULL,NULL,NULL),
(60,'Бӯи нон',NULL,NULL,6,1,1,'2026-09-02',NULL,678,0,'10.-1789227252807-440714006.docx',NULL,NULL,NULL),
(61,'Падида',NULL,NULL,7,1,2,'2026-09-18',NULL,2323,0,'Ð¢ÐµÐºÑÑÐ¾Ð²ÑÐ¹ Ð´Ð¾ÐºÑÐ¼ÐµÐ½Ñ-1789292344154-327662706.txt',NULL,NULL,NULL),
(62,'Садои дил',NULL,NULL,12,1,3,'2026-09-02',NULL,123,0,'1-1789302855240-589210729.docx',NULL,NULL,NULL),
(63,'Қиссаҳои кӯдакӣ',NULL,NULL,7,1,1,'2026-09-02',3,344,0,'1-1789312230642-182785744.docx',NULL,NULL,'cover-1789312230643-659168804.jpg'),
(64,'Санг дар бағал',NULL,NULL,7,1,1,'2026-09-09',3,22323,0,'1-1789312410486-784335446.docx',NULL,NULL,NULL),
(65,'Шукуфаи умед',NULL,NULL,7,1,1,'2026-09-03',NULL,344,0,'ÐÐ°Ð²Ð·ÑÑ Ð­Ð»ÐµÐ¼ÐµÐ½ÑÒ³Ð¾Ð¸ Ð¸Ð´Ð¾ÑÐ°ÐºÑÐ½Ð¸Ð¸ RadioButton Ð²Ð°                     CheckBox-1789313004912-564837873.docx',NULL,NULL,NULL),
(66,'Роҳи зиндагӣ',NULL,NULL,7,1,1,'2026-09-03',NULL,5656,0,'ð¼-1789313036835-280078983.docx',NULL,NULL,NULL),
(67,'Мақолаи тести',NULL,NULL,8,1,17,'2021-02-03',NULL,123,1,'1-1789360574426-439618082.docx',NULL,NULL,NULL),
(68,'Мақолаи тестии-2',NULL,NULL,7,1,18,'2026-09-02',NULL,123,1,'3-1789363050987-331218547.pdf',NULL,NULL,NULL),
(69,'китоб',NULL,NULL,7,1,1,'2026-09-02',NULL,123,0,'3-1789363131118-140926760.pdf',NULL,NULL,NULL),
(70,'китоб1',NULL,NULL,9,1,1,'2026-09-10',NULL,123,0,'1-1789475964357-90284464.docx',NULL,NULL,NULL),
(71,'Мақолаи тестии-3',NULL,NULL,10,1,1,'2026-09-03',NULL,123,1,'1-1789476002866-136375572.docx',NULL,NULL,NULL),
(72,'Мақолаи тестии-4',NULL,NULL,8,1,1,'2026-09-03',NULL,123,1,'1-1789478330919-291447589.docx',NULL,NULL,NULL),
(73,'китоб2',NULL,NULL,6,1,1,'2026-09-10',NULL,123,0,'1-1789478370885-156164767.docx',NULL,NULL,NULL),
(74,'Мақолаи тестии-5',NULL,NULL,8,1,1,'2026-09-02',NULL,123,1,'ÐÐ½ÑÐµÑÐ¿ÑÐµÑÐ°ÑÐ¸Ñ ÑÐµÐ·ÑÐ»ÑÑÐ°ÑÐ¾Ð²-1789478662421-16042334.docx',NULL,NULL,NULL),
(75,'Мақолаи тестии-6',NULL,NULL,10,1,1,'2026-09-08',NULL,123,1,'1-1789479117277-500446868.docx',NULL,NULL,NULL),
(76,'Мақолаи тестии-7',NULL,NULL,7,1,1,'2026-09-08',NULL,123,1,'1-1789479475931-826035319.docx',NULL,NULL,NULL),
(77,'Мақолаи тестии-8',NULL,NULL,10,1,2,'2026-09-08',NULL,123,1,'1-1789479508656-602267743.docx',NULL,NULL,NULL),
(78,'китоб3',NULL,NULL,7,1,14,'2026-09-02',NULL,1234,0,'1-1789479545793-888910135.docx',NULL,NULL,NULL),
(79,'Мақолаи тестии 9',NULL,NULL,7,1,1,'2026-09-02',NULL,123,1,'1-1789481731381-157934835.docx',NULL,NULL,NULL),
(80,'китоб 4',NULL,NULL,8,1,3,'2026-09-10',NULL,1234,0,'1-1789481794235-415267075.docx',NULL,NULL,NULL);

/*Table structure for table `authors` */

DROP TABLE IF EXISTS `authors`;

CREATE TABLE `authors` (
  `id` int NOT NULL AUTO_INCREMENT,
  `firstName` varchar(25) DEFAULT NULL,
  `lastName` varchar(25) DEFAULT NULL,
  `familyName` varchar(25) DEFAULT NULL,
  `birthDate` date DEFAULT NULL,
  `mobilePhone` varchar(15) DEFAULT NULL,
  `homePhone` varchar(15) DEFAULT NULL,
  `workPhone` varchar(15) DEFAULT NULL,
  `cityId` int DEFAULT NULL,
  `address` varchar(150) DEFAULT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `authors` */

insert  into `authors`(`id`,`firstName`,`lastName`,`familyName`,`birthDate`,`mobilePhone`,`homePhone`,`workPhone`,`cityId`,`address`,`createdAt`) values 
(8,'Мирзо','Турсунзаде',NULL,'2004-05-08','929926754',NULL,NULL,1,NULL,'2026-05-22 07:33:53'),
(9,'Лоик','Шерали',NULL,'2026-05-08','926471247',NULL,NULL,1,NULL,'2026-05-22 07:34:13'),
(10,'Гулрухсор','Сафиева',NULL,'2026-05-16','926471247',NULL,NULL,1,NULL,'2026-05-22 07:34:30'),
(11,'Абдулхамид','Самадов',NULL,'2026-05-01','926471247',NULL,NULL,1,NULL,'2026-05-22 07:34:39'),
(12,'Давлат','Сафар',NULL,'2026-05-07','926471247',NULL,NULL,1,NULL,'2026-05-22 07:34:57'),
(13,'Лафоре','Роберт','','1984-11-24','+000000000',NULL,NULL,13,'Indianapolis, Indiana','2026-05-22 08:10:33'),
(14,'Эккель','Брюс','','1980-06-04','+000000000',NULL,NULL,13,'Crested Butte, Colorado','2026-05-22 08:13:13'),
(15,'Билл','','Любанович','1983-06-16','+000000000',NULL,NULL,13,'Minneapolis, Minnesota','2026-05-22 08:15:10'),
(16,'Goetz','Brian','','2026-05-03','+000000000',NULL,NULL,13,'Williston, Vermont','2026-05-22 08:18:31'),
(17,'Sweigart','Al','','2026-05-08','+000000000',NULL,NULL,13,'San Francisco, California','2026-05-22 08:21:17'),
(18,'Ашур','Сафар','','2026-09-23','+000000000',NULL,NULL,1,NULL,'2026-09-18 08:46:21'),
(19,'Али','Бободжон','','2026-09-17','+000000000',NULL,NULL,1,NULL,'2026-09-09 08:52:09'),
(20,'Саттор','Турсун',NULL,'2026-09-10','+000000000',NULL,NULL,1,NULL,'2026-09-12 08:53:55'),
(21,'Назарзода','М','А','2026-09-08','926471247',NULL,NULL,1,'Buston','2026-09-14 10:21:18'),
(22,'Шахром','Нуров',NULL,'2005-01-04','+000000000',NULL,NULL,1,'Buston','2026-09-15 17:40:42'),
(23,'Искандар','Назаров',NULL,'2026-09-09','+000000000',NULL,NULL,1,'Buston','2026-09-15 19:01:31'),
(24,'Машраф','Точиддинов',NULL,'2026-09-09','+000000000',NULL,NULL,1,'Buston','2026-09-15 19:01:59'),
(25,'Самадчон','Кулдошев',NULL,'2026-09-02','+000000000',NULL,NULL,1,'Buston','2026-09-15 19:05:29'),
(26,'Чахонгир','Бобокалонов',NULL,'2026-09-03','+000000000',NULL,NULL,1,'Buston','2026-09-15 19:06:13'),
(27,'Мехрубон','Холиқов',NULL,'2026-09-02','929926754',NULL,NULL,1,'Buston','2026-09-15 19:07:35'),
(28,'Амир','Абдурахмонов',NULL,'2026-09-03','929926754',NULL,NULL,1,'Buston','2026-09-15 19:10:07'),
(29,'Абдурауф','Қодиров',NULL,'2026-09-01','929926754',NULL,NULL,1,'Buston','2026-09-15 19:10:36'),
(30,'Шодрух','Сидиқзода',NULL,'2026-09-02','+000000000',NULL,NULL,1,'г. Душанбе, ул. Ахмади Дониш, 50','2026-09-15 19:14:29');

/*Table structure for table `cities` */

DROP TABLE IF EXISTS `cities`;

CREATE TABLE `cities` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `typeOf` int DEFAULT NULL COMMENT '1-Country, 2-Region, 3-City/District',
  `parentId` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `cities` */

insert  into `cities`(`id`,`title`,`typeOf`,`parentId`) values 
(1,'Тоҷикистон',1,NULL),
(2,'Россия',1,NULL),
(3,'Узбекистон',1,NULL),
(4,'Хатлон',2,1),
(5,'Худмухтори Бадахшони Кӯҳӣ',2,1),
(6,'Душанбе',3,1),
(7,'Хуҷанд',3,3),
(8,'Конибодом',3,3),
(9,'Исфара',3,3),
(10,'Бохтар',3,4),
(11,'Хоруғ',3,5),
(12,'Суғд',2,1),
(13,'США',1,NULL),
(14,'Қазоқистон',1,NULL);

/*Table structure for table `directions` */

DROP TABLE IF EXISTS `directions`;

CREATE TABLE `directions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title_tj` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `title_ru` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `title_en` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `udc` varchar(25) DEFAULT NULL,
  `parentId` int DEFAULT NULL,
  `notes` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2723 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `directions` */

insert  into `directions`(`id`,`title_tj`,`title_ru`,`title_en`,`udc`,`parentId`,`notes`) values 
(1,NULL,'Наука в целом (информационные технологи)',NULL,'00',NULL,NULL),
(2,NULL,'Наука в целом. Науковедение. Организация умственного труда',NULL,'001',1,'см. 167/168 Методология и логика науки. Здесь собираются документы по вопросам, общим для многих отраслей науки, а также по вопросам организации умственного труда. Документы, посвященные одной отрасли знания или одному вопросу, обозначаются соответствующими индексами. Документы по организации научной работы в отдельных отраслях науки и техники классифицируются со знаком отношения к индексу отрасли. При необходимости собрать документы по отраслевому принципу, индекс инверсируется. 001:061.1(100) Международные организации по научной деятельности, например ЮНЕСКО\r\n\r\nсм. 341.16:001 ЮНЕСКО Организация Объединенных Наций по вопросам просвещения, науки и культуры'),
(3,NULL,'Печать в целом. Документация. Научно-техническая информация (НТИ)',NULL,'002',1,NULL),
(4,NULL,'Общее понятие о науке',NULL,'001.1',2,NULL),
(5,NULL,'Определение, предмет, цель, сущность науки',NULL,'001.11',4,NULL),
(6,NULL,'Философия. Психология',NULL,'1',NULL,NULL),
(7,NULL,'Религия. Теология',NULL,'2',NULL,NULL),
(8,NULL,'Теория и методы общественных наук',NULL,'30',NULL,NULL),
(9,NULL,'Демография. Социология. Статистика',NULL,'31',NULL,NULL),
(10,NULL,'Политика',NULL,'32',NULL,NULL),
(11,NULL,'Экономика. Народное хозяйство. Экономические науки',NULL,'33',NULL,NULL),
(12,NULL,'Право. Юридические науки',NULL,'34',NULL,NULL),
(13,NULL,'Государственное административное управление. Военное искусство. Военные науки',NULL,'35',NULL,NULL),
(14,NULL,'Обеспечение духовных и материальных жизненных потребностей',NULL,'36',NULL,NULL),
(15,NULL,'	Народное образование. Воспитание. Обучение. Организация досуга',NULL,'37',NULL,NULL),
(16,NULL,'Этнография. Нравы. Обычаи. Жизнь народа. Фольклора',NULL,'38',NULL,NULL),
(17,NULL,'Общие вопросы математических и естественных наук',NULL,'39',NULL,NULL),
(18,NULL,'Математика',NULL,'50',NULL,NULL),
(19,NULL,'	Астрономия. Геодезия',NULL,'51',NULL,NULL),
(20,NULL,'Физика',NULL,'52',NULL,NULL),
(21,NULL,'	Химия. Кристаллография. Минералогия',NULL,'53',NULL,NULL),
(22,NULL,'	Химия. Кристаллография. Минералогия',NULL,'54',NULL,NULL),
(23,NULL,'Палеонтология',NULL,'55',NULL,NULL),
(24,NULL,'Биологические науки',NULL,'56',NULL,NULL),
(25,NULL,'	Ботаника',NULL,'57',NULL,NULL),
(26,NULL,'	Зоология',NULL,'59',NULL,NULL),
(27,NULL,'	Прикладные науки. Общие вопросы',NULL,'60',NULL,NULL),
(28,NULL,'	Медицина. Охрана здоровья. Пожарное дело',NULL,'61',NULL,NULL),
(29,NULL,'Инженерное дело. Техника в целом',NULL,'62',NULL,NULL),
(30,NULL,'	Сельское хозяйство. Лесное хозяйство. Охота. Рыбное хозяйство',NULL,'63',NULL,NULL),
(31,NULL,'Домоводство. Коммунальное хозяйство. Служба быта',NULL,'64',NULL,NULL),
(32,NULL,'Управление предприятиями. Организация производства, торговли и транспорта',NULL,'65',NULL,NULL),
(33,NULL,'Химическая технология. Химическая промышленность.',NULL,'66',NULL,NULL),
(34,NULL,'	Различные отрасли промышленности и ремесла. Механическая технология',NULL,'67',NULL,NULL),
(35,NULL,'	Различные отрасли промышленности и ремесла, производящие конечную продукцию.',NULL,'68',NULL,NULL),
(36,NULL,'	Строительство. Строительные материалы. Строительно-монтажные работы',NULL,'69',NULL,NULL),
(37,NULL,'	Искусство. Декоративно-прикладное искусство. Фотография. Музыка. Игры. Спорт',NULL,'7',NULL,NULL),
(38,NULL,'Языкознание. Филология. Художественная литература. Литературоведение',NULL,'8',NULL,NULL),
(39,NULL,'	География. Биография. История',NULL,'9',NULL,NULL),
(40,NULL,'Самогон 2',NULL,'001.12',5,NULL),
(42,NULL,'Метафизика',NULL,'11',6,NULL),
(43,NULL,'Сущность и задачи философии',NULL,'101',6,NULL),
(44,NULL,'	Причинность (каузальность). Первопричинность. Принципы. Causa efficiens. ',NULL,'122',6,NULL),
(45,NULL,'Свобода и необходимость',NULL,'123',6,NULL),
(46,NULL,'Телеология',NULL,'124',6,NULL),
(47,NULL,'Конечность. Бесконечность. Бесконечное и безграничное.',NULL,'125',6,NULL),
(48,NULL,'Системы письма и письменности. Знаки и символы.',NULL,'003',6,NULL),
(49,NULL,'Душа. Смысл жизни и смерти',NULL,'128',6,NULL),
(50,NULL,'Информационные технологии. Компьютерные технологии.',NULL,'004',6,NULL),
(51,NULL,'Изучение проблемы организации:',NULL,'005',6,NULL),
(52,NULL,'	Стандартизация и стандарты',NULL,'006',6,NULL),
(53,NULL,'Происхождение и судьба индивидуальных душ. ',NULL,'129',6,NULL),
(54,NULL,'Философия духа. Метафизика духовной жизни',NULL,'13',6,NULL),
(55,NULL,'Философские системы. Метафизико-онтологические концепции	',NULL,'14',6,NULL),
(56,NULL,'Психология',NULL,'159.9',6,NULL),
(57,NULL,'Логика. Теория познания. Методология и логика науки',NULL,'16',6,NULL),
(59,NULL,'Этика. Учение о морали. Практическая философия',NULL,'17',6,NULL),
(60,NULL,'Эстетика',NULL,'18',6,NULL),
(61,NULL,'Сущность философии. Философия как наука. Философия как искусство.',NULL,'101.1',43,NULL),
(62,NULL,'Возможности философии. Возможна ли философия?',NULL,'101.2',43,NULL),
(63,NULL,'Предмет философии',NULL,'101.3',43,NULL),
(64,NULL,'Философские методы. [Диалектический материализм]',NULL,'101.8',43,NULL),
(65,NULL,'Личность и призвание (назначение) философов',NULL,'101.9',43,NULL),
(66,NULL,'Метафизика в целом. Учение о бытии. Онтология',NULL,'111',42,NULL),
(67,NULL,'Общие законы природы: изменчивость и непостоянство материи. ',NULL,'113',42,NULL),
(68,NULL,'Пространство: внутреннее и внешнее место. Размеры.',NULL,'114',42,NULL),
(69,NULL,'Время: длительность. Составная часть временной длительности.',NULL,'115',42,NULL),
(70,NULL,'Движение: развитие. Изменчивость.',NULL,'116',42,NULL),
(71,NULL,'Материя: изменение форм материи. ',NULL,'117',42,NULL),
(72,NULL,'Сила. Энергия. Определение акциденции ',NULL,'118',42,NULL),
(73,NULL,'Количество. Число. Постоянное количества сосуществования ',NULL,'119',42,NULL),
(74,NULL,'Свобода. Индетерминизм. Случайность',NULL,'123.1',45,NULL),
(75,NULL,'Необходимость. Фатализм',NULL,'123.2',45,NULL),
(76,NULL,'Порядок. Хаос',NULL,'124.1',46,NULL),
(77,NULL,'Смысл. Значение',NULL,'124.2',46,NULL),
(79,NULL,'Цель. Целенаправленность. Энтелехия',NULL,'124.3',46,NULL),
(80,NULL,'Causa exemplaris. Творческая идея. Тип. Идеал',NULL,'124.4',46,NULL),
(81,NULL,'Ценность. Норма',NULL,'124.5',46,NULL),
(82,NULL,'Предопределение. Судьба',NULL,'124.6',46,NULL),
(83,NULL,'Общие понятия и законы',NULL,'130.1',54,NULL),
(84,NULL,'Философия культуры. Системы культуры. Культурологические учения',NULL,'130.2',54,NULL),
(85,NULL,'Метафизика духовной жизни',NULL,'130.3',54,NULL),
(86,NULL,'Оккультизм',NULL,'133',54,NULL),
(87,NULL,'Мировоззрение',NULL,'140.8',55,NULL),
(88,NULL,'Отдельные системы и концепции',NULL,'141',55,NULL),
(89,NULL,'Философия, теории, законы психологии. ',NULL,'159.9.01',56,NULL),
(90,NULL,'Психологические исследования',NULL,'159.9.07',56,NULL),
(91,NULL,'Психофизиология',NULL,'159.91',56,NULL),
(92,NULL,'Развитие и формирование психики. ',NULL,'159.92',56,NULL),
(93,NULL,'Сенсорные процессы. Ощущения',NULL,'159.93',56,NULL),
(94,NULL,'Исполнительные функции. Моторные функции',NULL,'159.94',56,NULL),
(95,NULL,'Высшие психические процессы',NULL,'159.95',56,NULL),
(96,NULL,'Особые психические состояния и явления',NULL,'159.96',56,NULL),
(97,NULL,'Аномалии психики (психопатология)',NULL,'159.97',56,NULL),
(98,NULL,'Психотехника',NULL,'159.98',56,NULL),
(99,NULL,'Прочие вопросы психологии',NULL,'159.99',56,NULL),
(100,NULL,'Сущность и задачи логики',NULL,'160.1',57,NULL),
(101,NULL,'Категории логики',NULL,'161',57,NULL),
(102,NULL,'Умозаключение',NULL,'162',57,NULL),
(103,NULL,'Логистика. Логические исчисления',NULL,'164',57,NULL),
(104,NULL,'Теория познания',NULL,'165',57,NULL),
(105,NULL,'Методология научного исследования',NULL,'167',57,NULL),
(106,NULL,'Методология и логика науки',NULL,'168',57,NULL),
(107,NULL,'Направления и концепции в этике',NULL,'17.0',59,NULL),
(108,NULL,'Индивидуальная мораль',NULL,'171',59,NULL),
(109,NULL,'Социальная этика',NULL,'172',59,NULL),
(110,NULL,'Семейная этика',NULL,'173',59,NULL),
(111,NULL,'Профессиональная этика',NULL,'174',59,NULL),
(112,NULL,'Этика развлечений и досуга',NULL,'175',59,NULL),
(113,NULL,'Сексуальная этика',NULL,'176',59,NULL),
(114,NULL,'Мораль и общество. Человеческие отношения.',NULL,'177',59,NULL),
(115,NULL,'Мораль и умеренность (воздержание). ',NULL,'178',59,NULL),
(116,NULL,'Различные вопросы морали',NULL,'179',59,NULL),
(117,NULL,'Континуум пространства-времени',NULL,'115.4',69,NULL),
(118,NULL,'Индивидуальный дух',NULL,'130.31',83,NULL),
(119,NULL,'Объективный дух (Гегель, Зиммель, Зомбарт)',NULL,'130.32',83,NULL),
(120,NULL,'Абсолютный дух. Мировой дух',NULL,'130.33',83,NULL),
(121,NULL,'Сущность духа',NULL,'130.11',85,NULL),
(122,NULL,'Законы духовной жизни	\r\n ',NULL,'130.12',85,NULL),
(123,NULL,'Понятие и сущность оккультизма',NULL,'133.1',NULL,NULL),
(124,NULL,'	Сверхчувственное переживание',NULL,'133.2',NULL,NULL);

/*Table structure for table `favorites` */

DROP TABLE IF EXISTS `favorites`;

CREATE TABLE `favorites` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `articleId` int NOT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_favorite` (`userId`,`articleId`),
  KEY `fk_favorite_article` (`articleId`),
  CONSTRAINT `fk_favorite_article` FOREIGN KEY (`articleId`) REFERENCES `articles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_favorite_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `favorites` */

insert  into `favorites`(`id`,`userId`,`articleId`,`createdAt`) values 
(10,3,57,'2026-09-13 19:56:20'),
(11,3,51,'2026-09-13 19:56:23'),
(13,3,66,'2026-09-13 20:25:24'),
(14,3,60,'2026-09-13 20:25:28'),
(15,3,59,'2026-09-13 20:25:31'),
(18,1,66,'2026-09-13 20:28:53'),
(19,1,56,'2026-09-13 20:28:54'),
(24,3,55,'2026-09-15 08:38:54'),
(25,1,59,'2026-09-15 08:57:55'),
(26,1,61,'2026-09-15 08:57:56'),
(27,3,53,'2026-09-15 09:02:24'),
(28,3,58,'2026-09-16 07:01:33');

/*Table structure for table `genres` */

DROP TABLE IF EXISTS `genres`;

CREATE TABLE `genres` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) DEFAULT NULL,
  `status` int DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `genres` */

insert  into `genres`(`id`,`name`,`status`) values 
(1,'Наука',1),
(2,'Медицина',1),
(3,'1',1),
(4,'2',1),
(5,'3',1),
(6,'4',1),
(7,'5',1),
(8,'6',1),
(9,'7',1),
(10,'8',1),
(11,'9',1);

/*Table structure for table `publishers` */

DROP TABLE IF EXISTS `publishers`;

CREATE TABLE `publishers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title_tj` varchar(50) DEFAULT NULL,
  `title_ru` varchar(50) DEFAULT NULL,
  `title_en` varchar(50) DEFAULT NULL,
  `cityId` int DEFAULT NULL,
  `address` varchar(150) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `publishers` */

insert  into `publishers`(`id`,`title_tj`,`title_ru`,`title_en`,`cityId`,`address`) values 
(1,'Ирфон',NULL,NULL,1,'г. Душанбе, просп. Негмата Карабаева, 17'),
(2,'Адиб',NULL,NULL,1,'г. Душанбе, просп. Негмата Карабаева, 17'),
(3,'Дониш',NULL,NULL,1,'г. Душанбе, ул. Ахмади Дониш, 50'),
(11,'Шарқи Озод',NULL,NULL,1,'г. Душанбе, просп. Рудаки, 93'),
(14,'Матбуот',NULL,NULL,13,'г. Душанбе, просп. Рудаки'),
(15,'Маориф ва фарҳанг',NULL,NULL,2,'г. Душанбе, просп. Рудаки'),
(16,'Ганҷ нашриёт',NULL,NULL,1,'г. Душанбе'),
(17,'Авесто',NULL,NULL,1,'г. Душанбе'),
(18,'Деваштич',NULL,NULL,1,'г. Душанбе'),
(21,'Ирфон 1',NULL,NULL,1,'г. Душанбе, просп. Негмата Карабаева, 17'),
(22,'Ирфон 2',NULL,NULL,1,'г. Душанбе, просп. Негмата Карабаева, 17'),
(23,'Ирфон 3',NULL,NULL,1,'г. Душанбе, просп. Негмата Карабаева, 17');

/*Table structure for table `typeof` */

DROP TABLE IF EXISTS `typeof`;

CREATE TABLE `typeof` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `typeof` */

insert  into `typeof`(`id`,`title`) values 
(1,'Китоб'),
(2,'Мақола');

/*Table structure for table `user_genres` */

DROP TABLE IF EXISTS `user_genres`;

CREATE TABLE `user_genres` (
  `userId` int NOT NULL,
  `genreId` int NOT NULL,
  PRIMARY KEY (`userId`,`genreId`),
  KEY `idx_user_genres_genreId` (`genreId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `user_genres` */

insert  into `user_genres`(`userId`,`genreId`) values 
(3,1),
(3,2),
(3,4);

/*Table structure for table `users` */

DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `eMail` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `login` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `firstName` varchar(25) DEFAULT NULL,
  `lastName` varchar(25) DEFAULT NULL,
  `familyName` varchar(25) DEFAULT NULL,
  `birthDate` date DEFAULT NULL,
  `mobilePhone` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `pseudonym` varchar(50) DEFAULT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `profilePhoto` varchar(255) DEFAULT NULL,
  `authToken` char(64) DEFAULT NULL,
  `role` varchar(20) NOT NULL DEFAULT 'user',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_users_login` (`login`),
  UNIQUE KEY `uq_users_email` (`eMail`),
  UNIQUE KEY `uq_users_authToken` (`authToken`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `users` */

insert  into `users`(`id`,`eMail`,`login`,`password`,`firstName`,`lastName`,`familyName`,`birthDate`,`mobilePhone`,`pseudonym`,`createdAt`,`profilePhoto`,`authToken`,`role`) values 
(1,'ikbolnazarov501@gmail.com','ikbolnazarov501@gmail.com','$2b$12$G4D5dvdRrdnM/zzO3OIqBO0kJapL9WpDKWLiJI0m7CNp585kFYM8S','Мухаммадикбол','Назарзода','Айвазмахмад','2005-07-11','+992926471247','Икбол','2025-11-01 07:51:50','Ð¡Ð½Ð¸Ð¼Ð¾Ðº ÑÐºÑÐ°Ð½Ð° 2025-10-09 225729-1789235625683-311680644.png',NULL,'user'),
(2,'ikbolnazarov502@gmail.com','ikbolnazarov502@gmail.com','ddlc2018','Самадҷон','Кулдошев',NULL,'2025-11-06','+992926471247','Самад','2025-11-12 07:51:46',NULL,NULL,'user'),
(3,'nazarovikbol@gmail.com','Admin','$2b$12$yhZG1YY3gJCztwG6RFhXBuyZ0MfMxD6Ib/b36RI93.yDI3/zi.2Hm','Икбол','Назаров','Айвазович','2026-07-02','+992926471247','IQBOL','2026-09-12 21:43:04','1. Ð§ÐµÑÐ½ÑÐ¹ ÐºÐ¾Ñ Ñ ÑÑÐ±ÐºÐ¾Ð¹-1789303032340-818905269.jpg','83b45e47928a729de7848ffb6e4dacf4e50bfd4610911e7f73cbc332f0dfe0b9','admin'),
(4,'ikbolnazarov5065@gmail.com','1234qwerty','7fe293643ae3c9bc575afc7a25b77437:916e0c69d37c894d97ab22595bdcc046e0dfdd65351d32830844f2362f673cae6f31c729402569fda5014fa88fc8a247ec67bc42ed873b46cd8d769865625fb0','Икбол','Назаров','Айвазович','2026-09-02','+992926471247','IQBOL','2026-09-13 15:09:32','7. ÐÐ°Ð±Ð¾ÑÐºÐ°-1789294188863-781790796.jpg',NULL,'user'),
(6,'ikbolnazarov2501@gmail.com','123qwerty22','$2b$12$LTJEIWPelWXBcdCBWsAALe7MD.6drmZUQKaloDOfQ.7sXBnbbc/S2','Икбол','Назаровв','Айвазович',NULL,NULL,NULL,'2026-11-09 12:10:02',NULL,NULL,'admin');

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
