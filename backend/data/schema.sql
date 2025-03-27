-- ==============================================================
-- schema.sql
-- ==============================================================

-- ==============================================================
-- DROP OLD TABLES (in an order that won't cause FK violations)
-- ==============================================================

DROP TABLE IF EXISTS User;
DROP TABLE IF EXISTS Crusade;
DROP TABLE IF EXISTS Adoration;
DROP TABLE IF EXISTS Parish;
DROP TABLE IF EXISTS Diocese;
DROP TABLE IF EXISTS State;

-- ==============================================================
-- CREATE NEW TABLES
-- ==============================================================

-- 1) User Table
CREATE TABLE User (
    UserID INT AUTO_INCREMENT PRIMARY KEY,
    UserName VARCHAR(255) NOT NULL,
    UserEmail VARCHAR(255) NOT NULL,
    -- 'ADMIN': can do anything
    -- 'SUPERVISOR': can do anything but manage Users
    -- 'STANDARD': can do anything but cannot delete records
    UserRole ENUM('ADMIN', 'SUPERVISOR', 'STANDARD') NOT NULL,
    UserPassword VARCHAR(255) NOT NULL
);


-- 2) State Table
CREATE TABLE State (
    StateID INT AUTO_INCREMENT PRIMARY KEY,
    StateName VARCHAR(100) NOT NULL,
    StateAbbreviation VARCHAR(10) NOT NULL
);


-- 3) Diocese Table
CREATE TABLE Diocese (
    DioceseID INT AUTO_INCREMENT PRIMARY KEY,
    DioceseName VARCHAR(255) NOT NULL,
    DioceseStreetNo VARCHAR(10),
    DioceseStreetName VARCHAR(255),
    DioceseSuburb VARCHAR(255),
    -- Old: DioceseState (string)
    -- New: numeric StateID -> references State
    StateID INT,
    DiocesePostcode VARCHAR(10),
    DiocesePhone VARCHAR(20),
    DioceseEmail VARCHAR(255),
    DioceseWebsite VARCHAR(255),
    FOREIGN KEY (StateID) REFERENCES State(StateID) ON DELETE SET NULL
    -- or ON DELETE CASCADE / NO ACTION, depending on your design
);


-- 4) Parish Table
CREATE TABLE Parish (
    ParishID INT AUTO_INCREMENT PRIMARY KEY,
    DioceseID INT,
    ParishName VARCHAR(255) NOT NULL,
    ParishStNumber VARCHAR(10),
    ParishStName VARCHAR(255),
    ParishSuburb VARCHAR(255),
    -- Old: ParishState (string)
    -- New: numeric StateID -> references State
    StateID INT,
    ParishPostcode VARCHAR(10),
    ParishPhone VARCHAR(20),
    ParishEmail VARCHAR(255),
    ParishWebsite VARCHAR(255),

    FOREIGN KEY (DioceseID) REFERENCES Diocese(DioceseID) ON DELETE CASCADE,
    FOREIGN KEY (StateID)   REFERENCES State(StateID)     ON DELETE SET NULL
);


-- 5) Adoration Table
CREATE TABLE Adoration (
    AdorationID INT AUTO_INCREMENT PRIMARY KEY,
    -- Old: State (string)
    -- New: numeric StateID -> references State
    StateID INT,
    DioceseID INT,
    ParishID INT,
    AdorationType VARCHAR(255),
    AdorationLocation VARCHAR(255),
    AdorationLocationType VARCHAR(255),
    AdorationDay VARCHAR(50),
    AdorationStart TIME,
    AdorationEnd TIME,

    FOREIGN KEY (StateID)   REFERENCES State(StateID)       ON DELETE SET NULL,
    FOREIGN KEY (DioceseID) REFERENCES Diocese(DioceseID)   ON DELETE CASCADE,
    FOREIGN KEY (ParishID)  REFERENCES Parish(ParishID)     ON DELETE CASCADE
);


-- 6) Crusade Table
CREATE TABLE Crusade (
    CrusadeID INT AUTO_INCREMENT PRIMARY KEY,
    -- Old: State (string)
    -- New: numeric StateID -> references State
    StateID INT,
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

    FOREIGN KEY (StateID)   REFERENCES State(StateID)       ON DELETE SET NULL,
    FOREIGN KEY (DioceseID) REFERENCES Diocese(DioceseID)   ON DELETE CASCADE,
    FOREIGN KEY (ParishID)  REFERENCES Parish(ParishID)     ON DELETE CASCADE
);