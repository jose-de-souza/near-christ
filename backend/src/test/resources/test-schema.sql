-- ==============================================================
-- test-schema.sql
-- ==============================================================

-- 1) User Table
CREATE TABLE "USR" (
                       "UserID" SERIAL PRIMARY KEY,
                       "UserName" VARCHAR(255) NOT NULL,
                       "UserEmail" VARCHAR(255) NOT NULL UNIQUE,
                       "UserRole" VARCHAR(20) CHECK ("UserRole" IN ('ADMIN', 'SUPERVISOR', 'STANDARD')) NOT NULL,
                       "UserPassword" VARCHAR(255) NOT NULL
);

-- 2) State Table
CREATE TABLE "STA" (
                       "StateID" SERIAL PRIMARY KEY,
                       "StateName" VARCHAR(100) NOT NULL,
                       "StateAbbreviation" VARCHAR(10)
);

-- 3) Diocese Table
CREATE TABLE "DIO" (
                       "DioceseID" SERIAL PRIMARY KEY,
                       "DioceseName" VARCHAR(255) NOT NULL,
                       "DioceseStreetNo" VARCHAR(10),
                       "DioceseStreetName" VARCHAR(255),
                       "DioceseSuburb" VARCHAR(255),
                       "StateID" INTEGER NOT NULL,
                       "DiocesePostcode" VARCHAR(10),
                       "DiocesePhone" VARCHAR(20),
                       "DioceseEmail" VARCHAR(255),
                       "DioceseWebsite" VARCHAR(255),
                       FOREIGN KEY ("StateID") REFERENCES "STA"("StateID") ON DELETE RESTRICT
);

-- 4) Parish Table
CREATE TABLE "PAR" (
                       "ParishID" SERIAL PRIMARY KEY,
                       "DioceseID" INTEGER NOT NULL,
                       "ParishName" VARCHAR(255) NOT NULL,
                       "ParishStNumber" VARCHAR(10),
                       "ParishStName" VARCHAR(255),
                       "ParishSuburb" VARCHAR(255),
                       "StateID" INTEGER NOT NULL,
                       "ParishPostcode" VARCHAR(10),
                       "ParishPhone" VARCHAR(20),
                       "ParishEmail" VARCHAR(255),
                       "ParishWebsite" VARCHAR(255),
                       FOREIGN KEY ("DioceseID") REFERENCES "DIO"("DioceseID") ON DELETE RESTRICT,
                       FOREIGN KEY ("StateID") REFERENCES "STA"("StateID") ON DELETE RESTRICT
);

-- 5) Adoration Table
CREATE TABLE "ADO" (
                       "AdorationID" SERIAL PRIMARY KEY,
                       "StateID" INTEGER NOT NULL,
                       "DioceseID" INTEGER NOT NULL,
                       "ParishID" INTEGER NOT NULL,
                       "AdorationType" VARCHAR(255) NOT NULL,
                       "AdorationLocation" VARCHAR(255),
                       "AdorationLocationType" VARCHAR(255),
                       "AdorationDay" VARCHAR(50),
                       "AdorationStart" TIME,
                       "AdorationEnd" TIME,
                       FOREIGN KEY ("StateID") REFERENCES "STA"("StateID") ON DELETE RESTRICT,
                       FOREIGN KEY ("DioceseID") REFERENCES "DIO"("DioceseID") ON DELETE RESTRICT,
                       FOREIGN KEY ("ParishID") REFERENCES "PAR"("ParishID") ON DELETE RESTRICT
);

-- 6) Crusade Table
CREATE TABLE "CRU" (
                       "CrusadeID" SERIAL PRIMARY KEY,
                       "StateID" INTEGER NOT NULL,
                       "DioceseID" INTEGER NOT NULL,
                       "ParishID" INTEGER NOT NULL,
                       "ConfessionStartTime" TIME,
                       "ConfessionEndTime" TIME,
                       "MassStartTime" TIME,
                       "MassEndTime" TIME,
                       "CrusadeStartTime" TIME,
                       "CrusadeEndTime" TIME,
                       "ContactName" VARCHAR(255),
                       "ContactPhone" VARCHAR(20),
                       "ContactEmail" VARCHAR(255),
                       "Comments" TEXT,
                       FOREIGN KEY ("StateID") REFERENCES "STA"("StateID") ON DELETE RESTRICT,
                       FOREIGN KEY ("DioceseID") REFERENCES "DIO"("DioceseID") ON DELETE RESTRICT,
                       FOREIGN KEY ("ParishID") REFERENCES "PAR"("ParishID") ON DELETE RESTRICT
);