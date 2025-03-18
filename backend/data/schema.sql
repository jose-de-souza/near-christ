-- CREATE DATABASE NEAR_CHRIST;
-- USE NEAR_CHRIST;

-- Drop tables in the correct order to avoid foreign key constraint issues
DROP TABLE IF EXISTS User;
DROP TABLE IF EXISTS Crusade;
DROP TABLE IF EXISTS Adoration;
DROP TABLE IF EXISTS Parish;
DROP TABLE IF EXISTS Diocese;

-- Table: User
-- 'ADMIN': can do anything.
-- 'SUPERVISOR': can do anything but manage Users.
-- 'STANDARD': can do anything but delete records.
CREATE TABLE User (
    UserID INT AUTO_INCREMENT PRIMARY KEY,
    UserName VARCHAR(255) NOT NULL,
    UserEmail VARCHAR(255) NOT NULL,
    UserRole ENUM('ADMIN', 'SUPERVISOR', 'STANDARD') NOT NULL,
    UserPassword VARCHAR(255) NOT NULL
);

-- Table: Diocese
CREATE TABLE Diocese (
    DioceseID INT AUTO_INCREMENT PRIMARY KEY,
    DioceseName VARCHAR(255) NOT NULL,
    DioceseStreetNo VARCHAR(10),
    DioceseStreetName VARCHAR(255),
    DioceseSuburb VARCHAR(255),
    DioceseState VARCHAR(100),
    DiocesePostcode VARCHAR(10),
    DiocesePhone VARCHAR(20),
    DioceseEmail VARCHAR(255),
    DioceseWebsite VARCHAR(255)
);

-- Table: Parish
CREATE TABLE Parish (
    ParishID INT AUTO_INCREMENT PRIMARY KEY,
    DioceseID INT,
    ParishName VARCHAR(255) NOT NULL,
    ParishStNumber VARCHAR(10),
    ParishStName VARCHAR(255),
    ParishSuburb VARCHAR(255),
    ParishState VARCHAR(100),
    ParishPostcode VARCHAR(10),
    ParishPhone VARCHAR(20),
    ParishEmail VARCHAR(255),
    ParishWebsite VARCHAR(255),
    FOREIGN KEY (DioceseID) REFERENCES Diocese(DioceseID) ON DELETE CASCADE
);

-- Table: Adoration
CREATE TABLE Adoration (
    AdorationID INT AUTO_INCREMENT PRIMARY KEY,
    State VARCHAR(100),
    DioceseID INT,
    ParishID INT,
    AdorationType VARCHAR(255),
    AdorationLocation VARCHAR(255),
    AdorationLocationType VARCHAR(255),
    AdorationDay VARCHAR(50),
    AdorationStart TIME,
    AdorationEnd TIME,
    FOREIGN KEY (DioceseID) REFERENCES Diocese(DioceseID) ON DELETE CASCADE,
    FOREIGN KEY (ParishID) REFERENCES Parish(ParishID) ON DELETE CASCADE
);

-- Table: Crusade
CREATE TABLE Crusade (
    CrusadeID INT AUTO_INCREMENT PRIMARY KEY,
    State VARCHAR(100),
    DioceseID INT,
    ParishID INT,
    ConfessionStartTime TIME,
    ConfessionEndTime TIME,
    MassStartTime TIME,
    MassEndTime TIME,
    CrusadeStartTime TIME,
    CrusadeEndTime TIME,
    ContactName VARCHAR(255),
    ContactPhone VARCHAR(20),
    ContactEmail VARCHAR(255),
    Comments TEXT,
    FOREIGN KEY (DioceseID) REFERENCES Diocese(DioceseID) ON DELETE CASCADE,
    FOREIGN KEY (ParishID) REFERENCES Parish(ParishID) ON DELETE CASCADE
);
