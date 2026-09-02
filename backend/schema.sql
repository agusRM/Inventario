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

CREATE TABLE IF NOT EXISTS brands (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_brands_name (name),
    KEY ix_brands_name (name)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS vehicle_models (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    brand_id INT NOT NULL,
    PRIMARY KEY (id),
    KEY ix_vehicle_models_name (name),
    CONSTRAINT fk_vehicle_models_brand
        FOREIGN KEY (brand_id) REFERENCES brands (id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS warehouses (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    address VARCHAR(255) NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_warehouses_name (name)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS shelves (
    id INT NOT NULL AUTO_INCREMENT,
    number INT NOT NULL,
    description VARCHAR(255) NULL,
    warehouse_id INT NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_shelves_warehouse
        FOREIGN KEY (warehouse_id) REFERENCES warehouses (id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS suppliers (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(150) NOT NULL,
    phone VARCHAR(30) NULL,
    email VARCHAR(150) NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_suppliers_name (name)
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
    brand_id INT NOT NULL,
    shelf_id INT NULL,
    supplier_id INT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_parts_part_number (part_number),
    KEY ix_parts_name (name),
    KEY ix_parts_part_number (part_number),
    CONSTRAINT fk_parts_brand
        FOREIGN KEY (brand_id) REFERENCES brands (id),
    CONSTRAINT fk_parts_shelf
        FOREIGN KEY (shelf_id) REFERENCES shelves (id),
    CONSTRAINT fk_parts_supplier
        FOREIGN KEY (supplier_id) REFERENCES suppliers (id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS part_photos (
    id INT NOT NULL AUTO_INCREMENT,
    url VARCHAR(500) NOT NULL,
    part_id INT NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_part_photos_part
        FOREIGN KEY (part_id) REFERENCES parts (id)
        ON DELETE CASCADE
) ENGINE=InnoDB;
