-- ==============================================================
-- data.sql
-- ==============================================================

-- 1) INSERT States

INSERT INTO State (StateID, StateName, StateAbbreviation)
VALUES
  (1, 'New South Wales', 'NSW'),
  (2, 'Victoria', 'VIC'),
  (3, 'Queensland', 'QLD'),
  (4, 'Western Australia', 'WA'),
  (5, 'South Australia', 'SA'),
  (6, 'Tasmania', 'TAS'),
  (7, 'Australian Capital Territory', 'ACT'),
  (8, 'Northern Territory', 'NT');


-- 2) INSERT Users

INSERT INTO User (UserID, UserName, UserEmail, UserRole, UserPassword)
VALUES
  -- Password "admin123"
  (1, 'admin', 'admin@nearchrist.com', 'ADMIN', 
   '$2y$10$Te7fo5Gm35yPQwlVT/smR.DVGkEMBmliii5PMTbjWz5dNuJYEczkS'),

  -- Password "super456"
  (2, 'supervisor', 'supervisor@nearchrist.com', 'SUPERVISOR', 
   '$2y$10$k286twPl.S9pmB8uckDzY.UaoWzMnQadPvhpc.LFWjnGrskqpn3r.'),

  -- Password "std789"
  (3, 'standard', 'standard@nearchrist.com', 'STANDARD', 
   '$2y$10$PjrQAFJXlKavICz.z.jnFekS2qBVQG8Q7qssqJDuo3qboG0CanhMm');


-- 3) INSERT Dioceses

INSERT INTO Diocese
  (DioceseID, DioceseName,
   DioceseStreetNo, DioceseStreetName, DioceseSuburb,
   StateID,        DiocesePostcode,
   DiocesePhone,   DioceseEmail, DioceseWebsite)
VALUES
  (1, 'Archdiocese of Sydney',
     '133', 'Liverpool Street', 'Sydney',
      1,  -- 1 => New South Wales
     '2000',
     '+61 2 9390 5100',
     'info@sydneycatholic.org',
     'https://www.sydneycatholic.org/'),

  (2, 'Archdiocese of Melbourne',
     '383', 'Albert Street', 'East Melbourne',
      2,  -- 2 => Victoria
     '3002',
     '+61 3 9926 5677',
     'communications@cam.org.au',
     'https://melbournecatholic.org/'),

  (3, 'Archdiocese of Brisbane',
     '194', 'Charlotte Street', 'Brisbane',
      3,  -- 3 => Queensland
     '4000',
     '+61 7 3324 3030',
     'communications@bne.catholic.net.au',
     'https://brisbanecatholic.org.au/'),

  (4, 'Diocese of Parramatta',
     '1', 'Marist Place', 'Parramatta',
      1,  -- 1 => New South Wales
     '2150',
     '+61 2 8838 3400',
     'communications@parracatholic.org',
     'https://parracatholic.org/'),

  (5, 'Diocese of Broken Bay',
     '2', 'Alma Road', 'Pennant Hills',
      1,  -- 1 => New South Wales
     '2120',
     '+61 2 8379 1600',
     'communications@bbcatholic.org.au',
     'https://www.bbcatholic.org.au/');


-- 4) INSERT Parishes

INSERT INTO Parish
  (ParishID, DioceseID, ParishName,
   ParishStNumber, ParishStName, ParishSuburb,
   StateID,        ParishPostcode,
   ParishPhone,    ParishEmail, ParishWebsite)
VALUES
  (1, 1, 'St Mary\'s Cathedral',
       '', 'St Mary\'s Road', 'Sydney',
       1,  -- 1 => NSW
       '2000',
       '+61 2 9220 0400',
       'info@stmaryscathedral.org.au',
       'https://www.stmaryscathedral.org.au/'),

  (2, 2, 'St Patrick\'s Cathedral',
       '1', 'Cathedral Place', 'East Melbourne',
       2,  -- 2 => VIC
       '3002',
       '+61 3 9662 2233',
       'info@cam.org.au',
       'https://melbournecatholic.org/about/st-patricks-cathedral'),

  (3, 3, 'Cathedral of St. Stephen',
       '249', 'Elizabeth Street', 'Brisbane City',
       3,  -- 3 => QLD
       '4000',
       '+61 7 3324 3030',
       'cathedral@bne.catholic.net.au',
       'https://www.cathedralofststephen.org.au/'),

  (4, 4, 'St Patrick\'s Cathedral, Parramatta',
       '1', 'Marist Place', 'Parramatta',
       1,  -- 1 => NSW
       '2150',
       '+61 2 8839 8400',
       'cathedral@parracatholic.org',
       'https://stpatscathedral.com.au/'),

  (5, 5, 'Our Lady of Dolours, Chatswood',
       '94', 'Archer Street', 'Chatswood',
       1,  -- 1 => NSW
       '2067',
       '+61 2 9410 9000',
       'chatswood.parish@bbcatholic.org.au',
       'https://www.bbcatholic.org.au/chatswood');


-- 5) INSERT Adorations

INSERT INTO Adoration
  (AdorationID, DioceseID, ParishID, StateID,
   AdorationType, AdorationLocation, AdorationLocationType,
   AdorationDay, AdorationStart, AdorationEnd)
VALUES
  -- #1: St Mary's Cathedral (Sydney)
  (1, 1, 1, 1,  -- Diocese=1, Parish=1, State=1(=NSW)
    'Regular',
    'St Mary\'s Cathedral Chapel',
    'Cathedral',
    'Friday',
    '12:30:00',
    '15:00:00'),

  -- #2: St Patrick's Cathedral, Parramatta
  (2, 4, 4, 1,  -- Diocese=4, Parish=4, State=1
    'Regular',
    'St Patrick\'s Cathedral Chapel',
    'Cathedral',
    'Friday',
    '18:30:00',
    '19:30:00'),

  -- #3: Our Lady of Dolours, Chatswood
  (3, 5, 5, 1,
    'Regular',
    'Church Main Altar',
    'Parish Church',
    'Thursday',
    '09:30:00',
    '10:30:00');


-- 6) INSERT Crusades
--   Refs numeric StateID, DioceseID, ParishID

INSERT INTO Crusade
  (CrusadeID, DioceseID, ParishID, StateID,
   ConfessionStartTime, ConfessionEndTime,
   MassStartTime, MassEndTime,
   CrusadeStartTime, CrusadeEndTime,
   ContactName, ContactPhone, ContactEmail, Comments)
VALUES
  -- #1: "Sydney" => StateID=1
  (1, 1, 1, 1,
    '16:30:00', '17:00:00',
    '17:30:00', '18:30:00',
    '18:45:00', '20:00:00',
    'Mary Fisher', '0412 111 222', 'mary.fisher@mockserver.au',
    'Evening Rosary Crusade for Families'),

  -- #2: "Melbourne" => StateID=2
  (2, 2, 2, 2,
    '07:00:00', '07:30:00',
    '08:00:00', '09:00:00',
    '09:15:00', '10:30:00',
    'John Hamilton', '0403 222 333', 'john.hamilton@mockserver.au',
    'Saturday Morning Rosary and Mass'),

  -- #3: "Brisbane" => StateID=3
  (3, 3, 3, 3,
    '15:30:00', '16:00:00',
    '16:15:00', '17:00:00',
    '17:15:00', '18:45:00',
    'Anna Thompson', '0407 333 444', 'anna.thompson@mockserver.au',
    'Rosary Crusade focusing on youth fellowship'),

  -- #4: Parramatta => StateID=1
  (4, 4, 4, 1,
    '18:00:00', '18:30:00',
    '18:45:00', '19:30:00',
    '19:45:00', '21:00:00',
    'Paul Stafford', '0411 444 555', 'paul.stafford@mockserver.au',
    'Parramatta Cathedral Rosary Vigil'),

  -- #5: Broken Bay => StateID=1
  (5, 5, 5, 1,
    '08:00:00', '08:30:00',
    '09:00:00', '09:45:00',
    '10:00:00', '11:30:00',
    'Sofia Caruso', '0405 555 666', 'sofia.caruso@mockserver.au',
    'Thursday Morning Rosary Crusade');
