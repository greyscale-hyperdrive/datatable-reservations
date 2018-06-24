DROP DATABASE IF EXISTS reservations;

CREATE DATABASE reservations;

USE reservations;

DROP TABLE IF EXISTS bookings;

CREATE TABLE bookings ( 
  id INT AUTO_INCREMENT,
  party_size INT NOT NULL,
  date DATE,
  party_size_max INT NOT NULL,
  time VARCHAR(50) NOT NULL,
  restaurant_id INT NOT NULL,
  PRIMARY KEY(id)
);

GRANT ALL PRIVILEGES ON reservations.* TO 'marypoppins'@'localhost';
