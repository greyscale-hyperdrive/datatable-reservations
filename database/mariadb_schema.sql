DROP DATABASE IF EXISTS reservations;

CREATE DATABASE datatable_reservations;

USE datatable_reservations;

DROP TABLE IF EXISTS cuisines;
CREATE TABLE cuisines (
  id INT AUTO_INCREMENT PRIMARY KEY,
  label VARCHAR(64) NOT NULL,
  region VARCHAR(140)
);

DROP TABLE IF EXISTS restaurants;
CREATE TABLE restaurants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  restaurant_name VARCHAR(200) NOT NULL,
  cuisine_id INT,
  dining_style VARCHAR(140),
  phone_number VARCHAR(14),
  website VARCHAR(140),
  address VARCHAR(512),
  CONSTRAINT `fk_restaurant_cuisine`
    FOREIGN KEY (cuisine_id) REFERENCES cuisines (id)
    ON UPDATE RESTRICT
);

DROP TABLE IF EXISTS users;
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(30) NOT NULL,
  email VARCHAR(30) NOT NULL
);

DROP TABLE IF EXISTS reservations;
CREATE TABLE reservations ( 
  id INT AUTO_INCREMENT PRIMARY KEY,
  party_size INT NOT NULL,
  date DATE,
  party_size_max INT NOT NULL,
  time VARCHAR(50) NOT NULL,
  user_id INT NOT NULL,
  restaurant_id INT NOT NULL,
  CONSTRAINT `fk_reservation_user`
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE
    ON UPDATE RESTRICT,
  CONSTRAINT `fk_reservation_restaurant`
    FOREIGN KEY (restaurant_id) REFERENCES restaurants (id)
    ON DELETE CASCADE
    ON UPDATE RESTRICT
);
