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

/*Table structure for table `admin_trash` */

DROP TABLE IF EXISTS `admin_trash`;

CREATE TABLE `admin_trash` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `recordType` varchar(32) NOT NULL,
  `recordId` int NOT NULL,
  `label` varchar(500) NOT NULL,
  `payload` json NOT NULL,
  `deletedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_admin_trash_deletedAt` (`deletedAt`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `admin_trash` */

/*Table structure for table `article_authors` */

DROP TABLE IF EXISTS `article_authors`;

CREATE TABLE `article_authors` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_article` int NOT NULL,
  `id_author` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=282 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
  `createAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `coverPath` varchar(255) DEFAULT NULL,
  `bbk` varchar(50) DEFAULT NULL,
  `isbn` varchar(32) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=91 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `articles` */

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
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `authors` */

/*Table structure for table `bbk_classifiers` */

DROP TABLE IF EXISTS `bbk_classifiers`;

CREATE TABLE `bbk_classifiers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(50) NOT NULL,
  `title` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_bbk_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `bbk_classifiers` */

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
) ENGINE=InnoDB AUTO_INCREMENT=2725 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `directions` */

insert  into `directions`(`id`,`title_tj`,`title_ru`,`title_en`,`udc`,`parentId`,`notes`) values 
(1,NULL,'Наука в целом (информационные технологи)',NULL,'00',NULL,NULL),
(2,NULL,'Наука в целом. Науковедение. Организация умственного труда',NULL,'001',1,'см. 167/168 Методология и логика науки. Здесь собираются документы по вопросам, общим для многих отраслей науки, а также по вопросам организации умственного труда. Документы, посвященные одной отрасли знания или одному вопросу, обозначаются соответствующими индексами. Документы по организации научной работы в отдельных отраслях науки и техники классифицируются со знаком отношения к индексу отрасли. При необходимости собрать документы по отраслевому принципу, индекс инверсируется. 001:061.1(100) Международные организации по научной деятельности, например ЮНЕСКО\r\n\r\nсм. 341.16:001 ЮНЕСКО Организация Объединенных Наций по вопросам просвещения, науки и культуры'),
(3,NULL,'Печать в целом. Документация. Научно-техническая информация (НТИ)',NULL,'002',1,NULL),
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
(42,NULL,'Метафизика',NULL,'11',6,NULL),
(43,NULL,'Сущность и задачи философии',NULL,'101',6,NULL),
(44,NULL,'	Причинность (каузальность). Первопричинность. Принципы. Causa efficiens. ',NULL,'122',6,NULL),
(45,NULL,'Свобода и необходимость',NULL,'123',6,NULL),
(46,NULL,'Телеология',NULL,'124',6,NULL),
(47,NULL,'Конечность. Бесконечность. Бесконечное и безграничное.',NULL,'125',6,NULL),
(49,NULL,'Душа. Смысл жизни и смерти',NULL,'128',6,NULL),
(50,NULL,'Информационные технологии. Компьютерные технологии.',NULL,'004',6,NULL),
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
(2724,NULL,NULL,NULL,'1235',NULL,NULL);

/*Table structure for table `favorite_authors` */

DROP TABLE IF EXISTS `favorite_authors`;

CREATE TABLE `favorite_authors` (
  `userId` int NOT NULL,
  `authorId` int NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`userId`,`authorId`),
  KEY `idx_favorite_authors_author` (`authorId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `favorite_authors` */

/*Table structure for table `favorites` */

DROP TABLE IF EXISTS `favorites`;

CREATE TABLE `favorites` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `articleId` int NOT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_favorite` (`userId`,`articleId`),
  KEY `fk_favorite_article` (`articleId`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `favorites` */

/*Table structure for table `genres` */

DROP TABLE IF EXISTS `genres`;

CREATE TABLE `genres` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) DEFAULT NULL,
  `status` int DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `genres` */

insert  into `genres`(`id`,`name`,`status`) values 
(2,'Медицина',1);

/*Table structure for table `isbn_classifiers` */

DROP TABLE IF EXISTS `isbn_classifiers`;

CREATE TABLE `isbn_classifiers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(32) NOT NULL,
  `title` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_isbn_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `isbn_classifiers` */

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
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `publishers` */

/*Table structure for table `ratings` */

DROP TABLE IF EXISTS `ratings`;

CREATE TABLE `ratings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `targetType` varchar(16) NOT NULL,
  `targetId` int NOT NULL,
  `score` tinyint unsigned NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_rating_user_target` (`userId`,`targetType`,`targetId`),
  KEY `idx_rating_target` (`targetType`,`targetId`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `ratings` */

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
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `users` */

insert  into `users`(`id`,`eMail`,`login`,`password`,`firstName`,`lastName`,`familyName`,`birthDate`,`mobilePhone`,`pseudonym`,`createdAt`,`profilePhoto`,`authToken`,`role`) values 
(3,'nazarovikbol@gmail.com','Admin','$2b$12$yhZG1YY3gJCztwG6RFhXBuyZ0MfMxD6Ib/b36RI93.yDI3/zi.2Hm','Икбол','Назаров','Айвазович','2026-07-01','+992926471247','IQBOL','2026-09-12 16:43:04','1. Ð§ÐµÑÐ½ÑÐ¹ ÐºÐ¾Ñ Ñ ÑÑÐ±ÐºÐ¾Ð¹-1789303032340-818905269.jpg','e17a1d527db4ae3273bfa6e40a31b101be4d85c7c72b8febb6a372664a56c657','admin');

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
