-- Insert Data into Diocese Table
INSERT INTO Diocese (DioceseID, DioceseName, DioceseStreetNo, DioceseStreetName, DioceseSuburb, DioceseState, DiocesePostcode, DiocesePhone, DioceseEmail, DioceseWebsite)
VALUES
(1, 'Metropolis Diocese', '12', 'Maple Ave', 'Springfield', 'NSW', '1001', '(02) 9000 1234', 'contact@metropolisdiocese.org', 'www.metropolisdiocese.org'),
(2, 'Sample Diocese1', '22', 'Oak St', 'Sampletown', 'ACT', '2002', '(02) 9111 5678', 'info@samplediocese.org', 'www.samplediocese.org'),
(3, 'Coastline Diocese', '45', 'Seaview Rd', 'Coastal City', 'NSW', '3003', '(02) 9222 8765', 'admin@coastlinediocese.org', 'www.coastlinediocese.org');

-- Insert Data into Parish Table (Make sure Parish exists before referencing it in Adoration or Crusade)
INSERT INTO Parish (ParishID, DioceseID, ParishName, ParishStNumber, ParishStName, ParishSuburb, ParishState, ParishPostcode, ParishPhone, ParishEmail, ParishWebsite)
VALUES
(1, 1, 'St. Michael Parish', '10', 'Church St', 'Rivertown', 'NSW', '4004', '02 9555 1111', 'admin@stmichael.org.au', 'www.stmichael.org.au'),
(2, 1, 'St. Peter Parish', '99', 'Main St', 'Lakeside', 'NSW', '5005', '02 9444 2222', 'info@stpeter.org.au', NULL),
(6, 1, 'Holy Trinity', '77', 'Sunset Blvd', 'Hillside', 'NSW', '6006', '02 9333 3333', 'secretary@holytrinity.org.au', NULL);

-- Insert Data into Adoration Table (Now ParishID = 6 exists, so no foreign key error)
INSERT INTO Adoration (AdorationID, DioceseID, ParishID, State, AdorationType, AdorationLocation, AdorationLocationType, AdorationDay, AdorationStart, AdorationEnd)
VALUES
(4, 1, 6, 'NSW', 'Perpetual', 'Prayer Chapel', 'Other', NULL, NULL, NULL),
(6, 1, 6, 'NSW', 'Regular', 'Holy Trinity 77 Sunset Blvd Hillside', 'Parish Church', 'Saturday', '17:00:00', '18:00:00');

-- Insert Data into Crusade Table (Ensuring ParishID exists first)
INSERT INTO Crusade (CrusadeID, DioceseID, ParishID, State, ConfessionStartTime, ConfessionEndTime, MassStartTime, MassEndTime, CrusadeStartTime, CrusadeEndTime, ContactName, ContactPhone, ContactEmail, Comments)
VALUES
(1, 1, 1, 'NSW', '16:30:00', '17:00:00', '17:30:00', '18:30:00', '19:00:00', '20:30:00', 'Jane Smith', '02 9000 9876', 'jane.smith@example.com', 'Monthly prayer crusade for the community.');
