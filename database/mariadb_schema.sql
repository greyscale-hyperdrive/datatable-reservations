DROP DATABASE IF EXISTS datatable_reservations;

CREATE DATABASE datatable_reservations;

USE datatable_reservations;

DROP TABLE IF EXISTS users;
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(140) NOT NULL,
  email VARCHAR(140) NOT NULL
);

DROP TABLE IF EXISTS restaurants;
CREATE TABLE restaurants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  restaurant_name VARCHAR(200) NOT NULL,
  cuisine VARCHAR(140) NOT NULL,
  phone_number VARCHAR(30) NOT NULL,
  address VARCHAR(512) NOT NULL,
  website VARCHAR(140),
  dining_style VARCHAR(140)
);

DROP TABLE IF EXISTS reservations;
CREATE TABLE reservations ( 
  id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id INT(11) NOT NULL,
  restaurant_id INT(11) NOT NULL,
  party_size INT(11) NOT NULL,
  party_size_max INT(11) NOT NULL,
  date DATE DEFAULT NULL,
  time VARCHAR(12) NOT NULL,
  CONSTRAINT `fk_reservation_user`
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE
    ON UPDATE RESTRICT,
  CONSTRAINT `fk_reservation_restaurant`
    FOREIGN KEY (restaurant_id) REFERENCES restaurants (id)
    ON DELETE CASCADE
    ON UPDATE RESTRICT,
  KEY `user_id_restaurant_id_idx` (`user_id`,`restaurant_id`)
);
