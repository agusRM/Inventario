CREATE DATABASE IF NOT EXISTS surepuesto
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE surepuesto;

CREATE TABLE IF NOT EXISTS users (
    id INT NOT NULL AUTO_INCREMENT,
    username VARCHAR(80) NOT NULL,
    email VARCHAR(150) NOT NULL,
    password_hash VARCHAR(128) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user',
    PRIMARY KEY (id),
    UNIQUE KEY uq_users_username (username),
    UNIQUE KEY uq_users_email (email),
    KEY ix_users_username (username),
    KEY ix_users_email (email)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS parts (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(180) NOT NULL,
    part_number VARCHAR(80) NOT NULL,
    years VARCHAR(30) NULL,
    compatible_models TEXT NULL,
    entry_date DATE NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    minimum_stock INT NOT NULL DEFAULT 0,
    price DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    brand_name VARCHAR(100) NOT NULL,
    shelf VARCHAR(100) NULL,
    supplier VARCHAR(150) NULL,
    photos JSON NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_parts_part_number (part_number),
    KEY ix_parts_name (name),
    KEY ix_parts_part_number (part_number)
) ENGINE=InnoDB;
