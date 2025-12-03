/*
SQLyog Trial v13.1.9 (64 bit)
MySQL - 8.4.6 : Database - articles
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
) ENGINE=InnoDB AUTO_INCREMENT=91 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `article_authors` */

insert  into `article_authors`(`id`,`id_article`,`id_author`) values 
(17,14,1),
(18,14,3),
(19,14,4),
(24,19,2),
(25,20,2),
(26,20,3),
(27,20,4),
(28,21,1),
(29,21,2),
(30,22,1),
(31,24,1),
(32,24,2),
(33,25,6),
(34,26,1),
(35,27,1),
(36,27,6),
(37,28,1),
(38,29,1),
(39,30,1),
(40,30,2),
(41,30,3),
(42,30,4),
(43,31,3),
(44,31,4),
(45,32,1),
(46,32,2),
(47,33,6),
(48,34,3),
(49,35,1),
(50,35,2),
(51,35,3),
(52,36,3),
(53,37,1),
(54,37,2),
(55,37,3),
(56,37,4),
(57,37,5),
(58,38,1),
(59,39,1),
(60,39,3),
(61,40,2),
(62,40,3),
(63,41,3),
(64,42,4),
(65,43,1),
(66,43,2),
(67,44,2),
(68,45,4),
(69,45,5),
(70,3,1),
(71,3,2),
(72,3,4),
(85,2,2),
(86,17,2),
(87,5,3),
(88,18,4),
(89,18,5),
(90,18,6);

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
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=46 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `articles` */

insert  into `articles`(`id`,`title_tj`,`title_ru`,`title_en`,`directionId`,`genreId`,`publisherId`,`publishYear`,`uid`,`pagesCount`,`typeOf`,`filePath`,`statusType`,`createAt`) values 
(2,'Самоучебник по C#',NULL,NULL,2,1,3,'2025-11-06',NULL,1043,0,'ÐÑÐ°ÑÒ³Ð¾Ð¸ ÐÑÐµÐ·Ð¸Ð´ÐµÐ½Ñ-1764749875304-420908389.pdf',NULL,NULL),
(3,'Польза ии в современном мире',NULL,NULL,1,1,1,'2025-10-02',NULL,155,1,'ÐÑÐ°ÑÒ³Ð¾Ð¸ ÐÑÐµÐ·Ð¸Ð´ÐµÐ½Ñ-1764749703349-76374254.pdf',NULL,NULL),
(5,'китоб',NULL,NULL,17,1,2,'2025-10-30',NULL,5,0,'ÐÑÐ°ÑÒ³Ð¾Ð¸ ÐÑÐµÐ·Ð¸Ð´ÐµÐ½Ñ-1764749771386-12195700.pdf',NULL,NULL),
(14,'tt',NULL,NULL,1,1,1,'2025-11-05',NULL,55,1,NULL,NULL,NULL),
(17,'ew',NULL,NULL,1,1,1,'2025-11-07',NULL,22,0,NULL,NULL,NULL),
(18,'qq',NULL,NULL,1,1,1,'2025-11-05',NULL,111,0,NULL,NULL,NULL),
(19,'ree',NULL,NULL,1,1,1,'2025-11-19',NULL,12,1,NULL,NULL,NULL),
(20,'reer',NULL,NULL,1,1,1,'2025-11-19',NULL,12,0,NULL,NULL,NULL),
(21,'12345',NULL,NULL,1,1,1,'2025-11-06',NULL,12,1,NULL,NULL,NULL),
(22,'ff',NULL,NULL,1,1,1,'2025-11-05',NULL,33,1,NULL,NULL,NULL),
(23,'Сурати студент',NULL,NULL,1,1,1,'2025-12-22',NULL,12,1,NULL,NULL,NULL),
(24,'Bobokalonov Jahongir',NULL,NULL,1,1,1,'2004-11-27',NULL,11,1,NULL,NULL,NULL),
(25,'Маколаи Нав',NULL,NULL,18,1,1,'2025-11-20',NULL,50,1,NULL,NULL,NULL),
(26,'sfdffd',NULL,NULL,18,1,3,'2005-09-26',NULL,1,1,NULL,NULL,NULL),
(27,'Маколаи Нав',NULL,NULL,1,1,1,'2000-11-20',NULL,11,1,NULL,NULL,NULL),
(28,'www',NULL,NULL,1,1,1,'2025-11-04',NULL,333,1,NULL,NULL,NULL),
(29,'www3',NULL,NULL,1,1,1,'2025-11-04',NULL,333,1,NULL,NULL,NULL),
(30,'333',NULL,NULL,1,1,1,'2025-11-06',NULL,44,1,NULL,NULL,NULL),
(31,'6666',NULL,NULL,1,1,1,'2025-11-07',NULL,77,1,NULL,NULL,NULL),
(32,'sfdffdhjgj',NULL,NULL,19,1,2,'2543-04-23',NULL,1,1,NULL,NULL,NULL),
(33,'rrrrr',NULL,NULL,1,1,1,'2025-11-05',NULL,123,1,NULL,NULL,NULL),
(34,'ppp',NULL,NULL,1,1,1,'2025-11-05',NULL,23,1,NULL,NULL,NULL),
(35,'adafdsgfhjhgfasaASDFDGFG',NULL,NULL,117,1,11,'1234-02-22',NULL,4,1,NULL,NULL,NULL),
(36,'jjj',NULL,NULL,1,1,1,'2025-11-05',NULL,123,1,NULL,NULL,NULL),
(37,'sadafasfaetwsdgdsgshdarh',NULL,NULL,9,1,2,'2001-01-01',NULL,12,1,NULL,NULL,NULL),
(38,'www22',NULL,NULL,18,1,1,'2022-02-20',NULL,15,1,NULL,NULL,NULL),
(39,'shodrukh',NULL,NULL,95,1,11,'2005-05-05',NULL,1,1,NULL,NULL,NULL),
(40,'122333',NULL,NULL,20,1,3,'2333-02-11',NULL,12,1,NULL,NULL,NULL),
(41,'kkk',NULL,NULL,1,1,1,'2025-11-22',NULL,12,1,NULL,NULL,NULL),
(42,'hhg',NULL,NULL,1,1,1,'2025-11-14',NULL,67,1,'ÐÑÐ°ÑÒ³Ð¾Ð¸ ÐÑÐµÐ·Ð¸Ð´ÐµÐ½Ñ-1764143072631-361795442.pdf',NULL,NULL),
(43,'34354',NULL,NULL,1,1,1,'2025-12-06',NULL,222,1,'ÐÑÐ°ÑÒ³Ð¾Ð¸ ÐÑÐµÐ·Ð¸Ð´ÐµÐ½Ñ-1764738384766-890862909.pdf',NULL,NULL),
(44,'1234556',NULL,NULL,1,1,1,'2025-12-04',NULL,222,1,'ÐÑÐ°ÑÒ³Ð¾Ð¸ ÐÑÐµÐ·Ð¸Ð´ÐµÐ½Ñ-1764739582113-249032959.pdf',NULL,NULL),
(45,'новая статья',NULL,NULL,20,1,1,'2025-12-13',NULL,123,1,'ph5-1764740625417-391174346.pdf',NULL,NULL);

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
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `authors` */

insert  into `authors`(`id`,`firstName`,`lastName`,`familyName`,`birthDate`,`mobilePhone`,`homePhone`,`workPhone`,`cityId`,`address`,`createdAt`) values 
(1,'Амиршох','Каримов',NULL,'2025-10-08',NULL,NULL,NULL,1,'ш.Москва','2025-10-22 11:31:55'),
(2,'Мҳаммадиқбол','Назарзода','А','2025-10-02',NULL,NULL,NULL,1,'Buston','2025-10-22 11:41:37'),
(3,'Самадҷон','Қулдошев','Ф','2025-10-02',NULL,NULL,NULL,1,'Buston','2025-10-22 11:42:39'),
(4,'Шаҳром','Нуров',NULL,'2025-10-02',NULL,NULL,NULL,2,'Buston','2025-10-22 11:54:14'),
(5,'Икбол','Назаров',NULL,'2025-10-08',NULL,NULL,NULL,1,'ш.Москва','2025-10-29 11:48:25'),
(6,'Машраф','Точидинов',NULL,'2006-02-20',NULL,NULL,NULL,1,'исфара','2025-11-21 12:47:23');

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
) ENGINE=InnoDB AUTO_INCREMENT=127 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `directions` */

insert  into `directions`(`id`,`title_tj`,`title_ru`,`title_en`,`udc`,`parentId`,`notes`) values 
(1,NULL,'	Наука в целом (информационные технологи)',NULL,'00',NULL,NULL),
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
(40,NULL,'Самогон',NULL,' X',NULL,NULL),
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
(124,NULL,'	Сверхчувственное переживание',NULL,'133.2',NULL,NULL),
(125,NULL,'Оккультное восприятие. Провидение (ясновидение). ',NULL,NULL,NULL,NULL),
(126,NULL,'Оккультовое воздействие. Магия. Колдовство. Теургия',NULL,NULL,NULL,NULL);

/*Table structure for table `genres` */

DROP TABLE IF EXISTS `genres`;

CREATE TABLE `genres` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) DEFAULT NULL,
  `status` int DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `genres` */

insert  into `genres`(`id`,`name`,`status`) values 
(1,'Наука',1),
(2,'Медицина',1);

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
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `publishers` */

insert  into `publishers`(`id`,`title_tj`,`title_ru`,`title_en`,`cityId`,`address`) values 
(1,'Маориф',NULL,NULL,1,'ш.Душанбе, куч. И.Сомони 25'),
(2,'Ирфон',NULL,NULL,1,'ш.Душанбе, куч. И.Сомони 25'),
(3,'Адиб',NULL,NULL,1,'Buston'),
(11,'Авасто',NULL,NULL,1,'Buston'),
(12,'ABC',NULL,NULL,2,'Buston'),
(13,'ABC',NULL,NULL,3,'Buston');

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

/*Table structure for table `users` */

DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `eMail` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `login` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `password` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `firstName` varchar(25) DEFAULT NULL,
  `lastName` varchar(25) DEFAULT NULL,
  `familyName` varchar(25) DEFAULT NULL,
  `birthDate` date DEFAULT NULL,
  `mobilePhone` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `cityId` int DEFAULT NULL,
  `address` varchar(150) DEFAULT NULL,
  `pseudonym` varchar(50) DEFAULT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `users` */

insert  into `users`(`id`,`eMail`,`login`,`password`,`firstName`,`lastName`,`familyName`,`birthDate`,`mobilePhone`,`cityId`,`address`,`pseudonym`,`createdAt`) values 
(1,'ikbolnazarov501@gmail.com','ikbolnazarov501@gmail.com','ddlc2017','Мухаммадикбол','Назарзода',NULL,'2005-07-12','+992926471247',1,'Buston','Икбол','2025-11-01 07:51:50'),
(2,'ikbolnazarov502@gmail.com','ikbolnazarov502@gmail.com','ddlc2018','Самадҷон','Кулдошев',NULL,'2025-11-06','+992926471247',1,'Buston','Самад','2025-11-12 07:51:46');

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
