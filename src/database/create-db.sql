drop table if exists mods;
create table mods(
	id varchar(100) primary key,
	latest_download_link varchar(255),
	latest_hash varchar(255),
	latest_hash256 varchar(255),
	version varchar(65)
);