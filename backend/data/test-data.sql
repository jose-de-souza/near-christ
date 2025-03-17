-- ------------------------------------------------------
--    INSERT INTO Diocese (5 REAL AUSTRALIAN DIOCESES)
-- ------------------------------------------------------
INSERT INTO Diocese
    (DioceseID, DioceseName, 
     DioceseStreetNo, DioceseStreetName, DioceseSuburb, 
     DioceseState, DiocesePostcode, 
     DiocesePhone, DioceseEmail, DioceseWebsite)
VALUES
    (1, 'Archdiocese of Sydney',
        '133', 'Liverpool Street', 'Sydney',
        'NSW', '2000',
        '+61 2 9390 5100',
        'info@sydneycatholic.org',
        'https://www.sydneycatholic.org/'),

    (2, 'Archdiocese of Melbourne',
        '383', 'Albert Street', 'East Melbourne',
        'VIC', '3002',
        '+61 3 9926 5677',
        'communications@cam.org.au',
        'https://melbournecatholic.org/'),

    (3, 'Archdiocese of Brisbane',
        '194', 'Charlotte Street', 'Brisbane',
        'QLD', '4000',
        '+61 7 3324 3030',
        'communications@bne.catholic.net.au',
        'https://brisbanecatholic.org.au/'),

    (4, 'Diocese of Parramatta',
        '1', 'Marist Place', 'Parramatta',
        'NSW', '2150',
        '+61 2 8838 3400',
        'communications@parracatholic.org',
        'https://parracatholic.org/'),

    (5, 'Diocese of Broken Bay',
        '2', 'Alma Road', 'Pennant Hills',
        'NSW', '2120',
        '+61 2 8379 1600',
        'communications@bbcatholic.org.au',
        'https://www.bbcatholic.org.au/');

-- ------------------------------------------------------
--    INSERT INTO Parish (5 REAL PARISHES)
--    Each references a valid DioceseID (1..5).
-- ------------------------------------------------------
INSERT INTO Parish
    (ParishID, DioceseID, ParishName,
     ParishStNumber, ParishStName, ParishSuburb,
     ParishState, ParishPostcode,
     ParishPhone, ParishEmail, ParishWebsite)
VALUES
    (1, 1, 'St Mary\'s Cathedral',
       '', 'St Mary\'s Road', 'Sydney',
       'NSW', '2000',
       '+61 2 9220 0400',
       'info@stmaryscathedral.org.au',
       'https://www.stmaryscathedral.org.au/'),

    (2, 2, 'St Patrick\'s Cathedral',
       '1', 'Cathedral Place', 'East Melbourne',
       'VIC', '3002',
       '+61 3 9662 2233',
       'info@cam.org.au',
       'https://melbournecatholic.org/about/st-patricks-cathedral'),

    (3, 3, 'Cathedral of St. Stephen',
       '249', 'Elizabeth Street', 'Brisbane City',
       'QLD', '4000',
       '+61 7 3324 3030',
       'cathedral@bne.catholic.net.au',
       'https://www.cathedralofststephen.org.au/'),

    (4, 4, 'St Patrick\'s Cathedral, Parramatta',
       '1', 'Marist Place', 'Parramatta',
       'NSW', '2150',
       '+61 2 8839 8400',
       'cathedral@parracatholic.org',
       'https://stpatscathedral.com.au/'),

    (5, 5, 'Our Lady of Dolours, Chatswood',
       '94', 'Archer Street', 'Chatswood',
       'NSW', '2067',
       '+61 2 9410 9000',
       'chatswood.parish@bbcatholic.org.au',
       'https://www.bbcatholic.org.au/chatswood');

-- ------------------------------------------------------
--    INSERT INTO Adoration (3 REAL SCHEDULES)
--    Example: known weekly Exposition times. 
--    Use the same DioceseID and ParishID references as above.
-- ------------------------------------------------------
INSERT INTO Adoration
    (AdorationID, DioceseID, ParishID,
     State, AdorationType, AdorationLocation,
     AdorationLocationType,
     AdorationDay, AdorationStart, AdorationEnd)
VALUES
    -- St Mary’s Cathedral (Sydney) - weekly Friday Adoration
    (1, 1, 1,
       'NSW', 
       'Regular',
       'St Mary\'s Cathedral Chapel', 
       'Cathedral', 
       'Friday',
       '12:30:00', 
       '15:00:00'),

    -- St Patrick’s Cathedral, Parramatta - typical Friday evening Adoration
    (2, 4, 4,
       'NSW',
       'Regular',
       'St Patrick\'s Cathedral Chapel',
       'Cathedral',
       'Friday',
       '18:30:00',
       '19:30:00'),

    -- Our Lady of Dolours, Chatswood - typical Thursday morning
    (3, 5, 5,
       'NSW',
       'Regular',
       'Church Main Altar',
       'Parish Church',
       'Thursday',
       '09:30:00',
       '10:30:00');

-- ------------------------------------------------------
--    INSERT INTO Crusade (Rosary Crusade MOCK Data)
--    Each record references a real Diocese and Parish from above.
--    Names, phone numbers, and times are purely illustrative.
-- ------------------------------------------------------
INSERT INTO Crusade
    (CrusadeID, DioceseID, ParishID, State,
     ConfessionStartTime, ConfessionEndTime,
     MassStartTime, MassEndTime,
     CrusadeStartTime, CrusadeEndTime,
     ContactName, ContactPhone, ContactEmail, Comments)
VALUES
    (1, 1, 1, 'NSW',
       '16:30:00', '17:00:00',
       '17:30:00', '18:30:00',
       '18:45:00', '20:00:00',
       'Mary Fisher', '0412 111 222', 'mary.fisher@mockserver.au',
       'Evening Rosary Crusade for Families'),

    (2, 2, 2, 'VIC',
       '07:00:00', '07:30:00',
       '08:00:00', '09:00:00',
       '09:15:00', '10:30:00',
       'John Hamilton', '0403 222 333', 'john.hamilton@mockserver.au',
       'Saturday Morning Rosary and Mass'),

    (3, 3, 3, 'QLD',
       '15:30:00', '16:00:00',
       '16:15:00', '17:00:00',
       '17:15:00', '18:45:00',
       'Anna Thompson', '0407 333 444', 'anna.thompson@mockserver.au',
       'Rosary Crusade focusing on youth fellowship'),

    (4, 4, 4, 'NSW',
       '18:00:00', '18:30:00',
       '18:45:00', '19:30:00',
       '19:45:00', '21:00:00',
       'Paul Stafford', '0411 444 555', 'paul.stafford@mockserver.au',
       'Parramatta Cathedral Rosary Vigil'),

    (5, 5, 5, 'NSW',
       '08:00:00', '08:30:00',
       '09:00:00', '09:45:00',
       '10:00:00', '11:30:00',
       'Sofia Caruso', '0405 555 666', 'sofia.caruso@mockserver.au',
       'Thursday Morning Rosary Crusade');