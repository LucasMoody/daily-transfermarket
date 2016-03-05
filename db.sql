/* Creating the database and naming it comunio*/
create database comunio;

create table clubs (
	cid				serial primary key,
	clubname		varchar(40) not null,
	comclubid		integer not null
);

create table players (
	pid				serial primary key,
	complayerid		integer not null unique,
	name			varchar(40) not null,
	position		varchar(40) not null,
	clubid			integer references clubs (cid)
);

create table marketvalues (
	mvid			serial primary key,
	pid				integer references players (pid),
	value			integer not null,
	valdate			date
);

create table injuriers (
	injid			serial primary key,
	pid				integer references players (pid),
	status			varchar(40) not null,
	statusinfo		varchar(80)
);

create table playerNews (
	newsid			serial primary key,
	link			varchar(200),
	headline		varchar(200),
	newstext		varchar(5000),
	newsdate		date,
	pid				integer references players (pid)
);

insert into clubs (clubname, comclubid) values
	('FC Bayern München', 1),
	('VFL Wolfsburg', 12),
	('Borussia M\'Gladbach', 3),
	('Bayer 04 Leverkusen', 8),
	('FC Augsburg', 68),
	('FC Schalke 04', 10),
	('Borussia Dortmund', 5),
	('1899 Hoffenheim', 62),
	('Eintracht Frankfurt', 9),
	('SV Werder Bremen', 6),
	('1. FSV Mainz 05', 18),
	('1. FC Köln', 13),
	('VFB Stuttgart', 14),
	('Hannover 96', 17),
	('Hertha BSC Berlin', 7),
	('Hamburger SV', 4),
	('FC Ingolstadt 04', 90),
	('SV Darmstaadt 98', 89);
