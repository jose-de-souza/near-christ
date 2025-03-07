-- Insert Data into Diocese Table
INSERT INTO Diocese (DioceseID, DioceseName, DioceseStreetNo, DioceseStreetName, DioceseSuburb, DioceseState, DiocesePostcode, DiocesePhone, DioceseEmail, DioceseWebsite)
VALUES
(1, 'Sydney Archdiocese', '38', 'Renwick St', 'Leichardt', 'NSW', '2040', '(02) 9390 5100', 'chancery@sydneycatholic.org', 'www.sydneycatholic.org.au'),
(2, 'Test Diocese1', '11', 'Test St1', 'Testville1', 'ACT', '123451', '(02) 9999 88881', 'test@test.com1', 'www.test.com1'),
(3, 'Wollongong Diocese', '38', 'Harbour St', 'Wollongong', 'NSW', '2500', '(02) 4222 2400', 'info@dow.org.au', 'dow.org.au');

-- Insert Data into Parish Table (Make sure Parish exists before referencing it in Adoration or Crusade)
INSERT INTO Parish (ParishID, DioceseID, ParishName, ParishStNumber, ParishStName, ParishSuburb, ParishState, ParishPostcode, ParishPhone, ParishEmail, ParishWebsite)
VALUES
(1, 1, 'All Hallows', '2', 'Hallow St', 'Five Dock', 'NSW', '20461', '02 9713 5172', 'admin@allhallows.org.au', 'allhallows.org.au'),
(2, 1, 'All Saints', '48', 'George St', 'Liverpool', 'NSW', '2170', '02 9573 6500', 'info@cpasl.org.au', NULL),
(6, 1, 'Blessed Sacrament', '59', 'Bradleys Head Rd', 'Clifton Gardens', 'NSW', '2088', '02 9692 3200', 'secretary@holyfammosman.org.au', NULL);

-- Insert Data into Adoration Table (Now ParishID = 6 exists, so no foreign key error)
INSERT INTO Adoration (AdorationID, DioceseID, ParishID, State, AdorationType, AdorationLocation, AdorationLocationType, AdorationDay, AdorationStart, AdorationEnd)
VALUES
(4, 1, 6, 'NSW', 'Perpetual', 'Adoration Chapel', 'Other', NULL, NULL, NULL),
(6, 1, 6, 'NSW', 'Regular', 'Blessed Sacrament 59 Bradleys Head Rd Clifton Gardens', 'Parish Church', 'Sunday', '18:00:00', '19:00:00');

-- Insert Data into Crusade Table (Ensuring ParishID exists first)
INSERT INTO Crusade (CrusadeID, DioceseID, ParishID, State, ConfessionStartTime, ConfessionEndTime, MassStartTime, MassEndTime, CrusadeStartTime, CrusadeEndTime, ContactName, ContactPhone, ContactEmail, Comments)
VALUES
(1, 1, 1, 'NSW', '17:00:00', '17:30:00', '18:00:00', '19:00:00', '19:30:00', '21:00:00', 'John Doe', '02 9390 5100', 'john.doe@example.com', 'Monthly rosary crusade for peace.');
