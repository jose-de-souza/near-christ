-- Insert Data into State Table
INSERT INTO "STA" ("StateID", "StateName", "StateAbbreviation")
VALUES
    (1, 'New South Wales', 'NSW'),
    (2, 'Australian Capital Territory', 'ACT');

-- Insert Data into Diocese Table
INSERT INTO "DIO" ("DioceseID", "DioceseName", "DioceseStreetNo", "DioceseStreetName", "DioceseSuburb", "StateID", "DiocesePostcode", "DiocesePhone", "DioceseEmail", "DioceseWebsite")
VALUES
    (1, 'Sydney Archdiocese', '38', 'Renwick St', 'Leichardt', 1, '2040', '(02) 9390 5100', 'chancery@sydneycatholic.org', 'www.sydneycatholic.org.au'),
    (2, 'Test Diocese1', '11', 'Test St1', 'Testville1', 2, '123451', '(02) 9999 88881', 'test@test.com1', 'www.test.com1'),
    (3, 'Wollongong Diocese', '38', 'Harbour St', 'Wollongong', 1, '2500', '(02) 4222 2400', 'info@dow.org.au', 'dow.org.au');

-- Insert Data into Parish Table
INSERT INTO "PAR" ("ParishID", "DioceseID", "ParishName", "ParishStNumber", "ParishStName", "ParishSuburb", "StateID", "ParishPostcode", "ParishPhone", "ParishEmail", "ParishWebsite")
VALUES
    (1, 1, 'All Hallows', '2', 'Hallow St', 'Five Dock', 1, '20461', '02 9713 5172', 'admin@allhallows.org.au', 'allhallows.org.au'),
    (2, 1, 'All Saints', '48', 'George St', 'Liverpool', 1, '2170', '02 9573 6500', 'info@cpasl.org.au', NULL),
    (6, 1, 'Blessed Sacrament', '59', 'Bradleys Head Rd', 'Clifton Gardens', 1, '2088', '02 9692 3200', 'secretary@holyfammosman.org.au', NULL);

-- Insert Data into Adoration Table
INSERT INTO "ADO" ("AdorationID", "DioceseID", "ParishID", "StateID", "AdorationType", "AdorationLocation", "AdorationLocationType", "AdorationDay", "AdorationStart", "AdorationEnd")
VALUES
    (4, 1, 6, 1, 'Perpetual', 'Adoration Chapel', 'Other', NULL, NULL, NULL),
    (6, 1, 6, 1, 'Regular', 'Blessed Sacrament 59 Bradleys Head Rd Clifton Gardens', 'Parish Church', 'Sunday', '18:00:00', '19:00:00');

-- Insert Data into Crusade Table
INSERT INTO "CRU" ("CrusadeID", "DioceseID", "ParishID", "StateID", "ConfessionStartTime", "ConfessionEndTime", "MassStartTime", "MassEndTime", "CrusadeStartTime", "CrusadeEndTime", "ContactName", "ContactPhone", "ContactEmail", "Comments")
VALUES
    (1, 1, 1, 1, '17:00:00', '17:30:00', '18:00:00', '19:00:00', '19:30:00', '21:00:00', 'John Doe', '02 9390 5100', 'john.doe@example.com', 'Monthly rosary crusade for peace.');