-- ==============================================================
-- V2__insert_data.sql
-- This script migrates data from the old MySQL database.
-- ==============================================================

-- 1) INSERT states
-- The state data is consistent with the old system.
INSERT INTO states (state_id, state_name, state_abbreviation)
VALUES
    (1, 'New South Wales', 'NSW'),
    (2, 'Victoria', 'VIC'),
    (3, 'Queensland', 'QLD'),
    (4, 'Western Australia', 'WA'),
    (5, 'South Australia', 'SA'),
    (6, 'Tasmania', 'TAS'),
    (7, 'Australian Capital Territory', 'ACT'),
    (8, 'Northern Territory', 'NT');

-- 2) INSERT users
-- User data and passwords have been migrated directly.
INSERT INTO users (user_id, user_name, user_email, user_role, user_password)
VALUES
    (1, 'admin', 'admin@nearchrist.com', 'ADMIN', '$2y$10$Te7fo5Gm35yPQwlVT/smR.DVGkEMBmliii5PMTbjWz5dNuJYEczkS'),
    (2, 'supervisor', 'supervisor@nearchrist.com', 'SUPERVISOR', '$2y$10$k286twPl.S9pmB8uckDzY.UaoWzMnQadPvhpc.LFWjnGrskqpn3r.'),
    (3, 'standard', 'standard@nearchrist.com', 'STANDARD', '$2y$10$PjrQAFJXlKavICz.z.jnFekS2qBVQG8Q7qssqJDuo3qboG0CanhMm');

-- 3) INSERT dioceses
-- Data migrated from the old Diocese table.
INSERT INTO dioceses (diocese_id, diocese_name, diocese_street_no, diocese_street_name, diocese_suburb, state_id, diocese_postcode, diocese_phone, diocese_email, diocese_website)
VALUES
    (1, 'Sydney Archdiocese', '38', 'Renwick St', 'Leichardt', 1, '2040', '02 9390 5100', 'chancery@sydneycatholic.org', 'www.sydneycatholic.org.au'),
    (4, 'Canberra and Goulburn Archdiocese', '55', 'Franklin St', 'Forrest', 7, '2603', '02 6239 9800', 'reception@cg.org.au', 'https://cgcatholic.org.au/');

-- 4) INSERT parishes
-- Data migrated from the old Parish table. Note the escaping of single quotes (e.g., St Anne''s).
INSERT INTO parishes (parish_id, diocese_id, parish_name, parish_st_number, parish_st_name, parish_suburb, state_id, parish_postcode, parish_phone, parish_email, parish_website)
VALUES
    (3, 1, 'All Saints Liverpool', '48', 'George Street', 'Liverpool', 1, '2170', '(02) 9753 6500', 'info@cpasl.org.au', 'http://cpasl.org.au'),
    (4, 1, 'Blessed Sacrament Clifton Gardens', '59', 'Bradleys Head Rd', 'Clifton Gardens', 1, '2088', '(02) 8969 3200', 'secretary@holyfamilymosman.org.au', 'http://www.holyfamilymosman.org.au'),
    (5, 1, 'Christ the King Yagoona', '3', 'Cantrell Street', 'Yagoona', 1, '2199', '(02) 9644 5191', 'admin@ctk.org.au', 'https://www.ctk.org.au'),
    (6, 1, 'Good Shepherd Hoxton Park', '21', 'Twentieth Avenue', 'Hoxton Park', 1, '2171', '(02) 9825 8154', 'catholicparish@hoxtonpark.org.au', 'http://www.hoxtonpark.org.au'),
    (7, 1, 'Holy Cross Bondi Junction', '15', 'Adelaide Street', ' Bondi Junction', 1, '2022', '(02) 9389 3156', 'holycrossbj@gmail.com', ''),
    (8, 1, 'Holy Family Maroubra', '214', 'Maroubra Rd', 'Maroubra', 1, '2035', '(02) 9349 1198', 'holyfamilymaroubra@outlook.com', 'http://www.holyfamilymaroubra.org.au'),
    (9, 1, 'Holy Family Menai', '1D', 'Anzac Road', 'Menai', 1, '2234', '(02) 9543 2677', 'admin@holyfamilymenai.org.au', 'https://www.holyfamilymenai.org.au/'),
    (10, 1, 'Holy Family Mosman', '23', 'Cardinal St', 'Mosman', 1, '2088', '(02) 8969 3200', 'secretary@holyfamilymosman.org.au', 'http://www.holyfamilymosman.org.au'),
    (11, 1, 'Holy Family Mosman', '23', 'Cardinal St', 'Mosman', 1, '2088', '(02) 8969 3200', 'secretary@holyfamilymosman.org.au', 'http://www.holyfamilymosman.org.au'),
    (13, 1, 'Holy Innocents Croydon', '1A', 'Webb Street', 'Croydon', 1, '2132', '(02) 9747 4291', 'holyinn100@gmail.com', 'http://www.holyinnocentscroydon.org.au'),
    (14, 1, 'Holy Name of Mary Hunters Hill', '3A', 'Mary St', 'Hunters Hill', 1, '2110', '(02) 9817 5325', 'villamar@bigpond.net.au', 'http://www.hnom.com.au'),
    (15, 1, 'Holy Spirit Carnes Hill', '25', 'Main St', 'Carnes Hill', 1, '2171', '(02) 9826 8977', 'admin@hspch.org.au', 'https://hspch.org.au/'),
    (16, 1, 'Holy Spirit - North Ryde', '191', 'Coxs Rd', 'North Ryde', 1, '2113', '(02) 9888 2569', 'parish@holyspiritnorthryde.org.au', 'http://www.holyspiritnorthryde.org.au/'),
    (17, 1, 'All Hallows Five Dock', '2', 'Halley St', 'Five Dock', 1, '2046', '(02) 9713 7960', 'admin@allhallows.org.au', 'http://allhallows.org.au/'),
    (18, 1, 'Immaculate Heart of Mary  Sefton', '6', 'Kerrinea Road', 'Sefton', 1, '2162', '(02) 9644-4026', 'office@ihmsefton.org.au', 'https://www.seftoncatholicchurch.org.au/%20(under%20construction'),
    (19, 1, 'John the Baptist Bonnyrigg/Edensor Park', '45', 'Mount Street', 'Bonnyrigg', 1, '2177', '(02) 9823 2572', 'info@johnthebaptist.org.au', 'http://www.johnthebaptist.org.au/'),
    (20, 1, 'Lourdes Earlwood', '280', 'Homer Street', 'Earlwood', 1, '2206', '(02) 9558 1254', 'secretary@lourdesparish.com.au', 'http://www.lourdesparish.com.au'),
    (21, 1, 'Mary Immaculate & St Charles Borromeo Waverley', '45a', 'Victoria Lane', 'Waverley', 1, '2024', '(02) 9369 9399', 'office@waverleycatholic.org.au', 'http://www.waverleycatholic.org.au'),
    (22, 1, 'Mary Immaculate Bossley Park', '110', 'Mimosa Road', 'Bossley Park', 1, '2176', '(02) 9604 8927', 'admin@mibp.org.au', 'http://www.mibp.org.au'),
    (23, 1, 'Mater Dei Blakehurst', '1008', 'King Georges Road', 'Blakehurst', 1, '(02) 9546 ', '(02) 9546 2605', 'admin@materdei-straphael.org.au', 'http://www.materdei-straphael.org.au/'),
    (24, 1, 'Maternal Heart of Mary Lewisham', '', 'Charles O''Neill Way (off Thomas St)', 'Lewisham', 1, '2049', '02 95729694', 'sydney@fssp.net', 'http://maternalheart.org/'),
    (25, 1, 'Our Lady of Fatima Kingsgrove', '89', 'Shaw Street', 'Kingsgrove', 1, '2208', '(02) 9150 9665', 'info@olfkingsgrove.org.au', 'http://www.olfkingsgrove.org.au'),
    (26, 1, 'Our Lady of Fatima Caringbah', '389', 'Port Hacking Road', 'Caringbah', 1, '2229', '(02) 9524 7283', 'admin@olofcaringbah.org.au', 'http://www.olofcaringbah.org.au'),
    (27, 1, 'Our Lady of Fatima Peakhurst', '825', 'Forest Road', 'Peakhurst', 1, '2210', '02 9533 2594', 'office@ourladyoffatima.com.au', 'http://www.ourladyoffatima.com.au'),
    (28, 1, 'Our Lady of Mt Carmel Mt Pritchard', '230', 'Humphries Road', 'Bonnyrigg', 1, '2177', '(02) 9610 1025', 'info@olmcmtpritchard.org.au', 'http://www.olmcmtpritchard.org.au'),
    (29, 1, 'Our Lady of Perpetual Succour Erskineville', '21', 'Swanson Street', 'Erskineville', 1, '2043', '(02) 9516 3542', 'admin@stmaryserskineville.org.au', 'http://www.stmaryserskineville.org.au/'),
    (30, 1, 'Our Lady of the Annunciation Pagewood', '25', 'Donovan Avenue', 'Maroubra', 1, '2035', '(02) 9344 7914', 'olapagewood@gmail.com', 'https://www.olapagewood.org.au/'),
    (31, 1, 'Our Lady of the Assumption Homebush', '74', 'Underwood Road', 'Homebush', 1, '2140', '02) 9706 7651', 'HomebushParish@gmail.com', 'https://www.youtube.com/channel/UCIPe3Bh38v4T9z0bk2cGRGw'),
    (32, 1, 'Our Lady of the Rosary Kensington', '4', 'Roma Avenue', 'Kensington', 1, '2033', '(02) 9663 1070', 'olrkensoparish@gmail.com', 'http://www.olrkensington.org.au/'),
    (33, 1, 'Our Lady of the Rosary Fairfield', '18', 'Vine Street', 'Fairfield', 1, '2165', '(02) 9724 5997', 'admin@olrfairfield.org.au', 'http://www.olrfairfield.org.au'),
    (34, 1, 'Our Lady of the Sacred Heart Randwick', '193', 'Avoca Street', 'Randwick', 1, '2031', '(02) 9399 6775', 'parishoffice@sacredheart.org.au', 'http://www.sacredheart.org.au/'),
    (35, 1, 'Our Lady of the Southern Cross - Enmore', '256', 'Edgeware Road', 'Enmore', 1, '2042', '(02) 9557 1815', 'admin@enmoreparish.org.au', 'http://www.enmoreparish.org.au'),
    (36, 1, 'Our Lady of the Way Sylvania', '191', 'Princes Highway', 'Sylvania', 1, '2224', '(02) 9525 1448', 'office@olssmiranda.org.au', '.'),
    (37, 1, 'Our Lady of the Way North Sydney, Lavender Bay, Kirribilli', 'cnr', 'Miller & Ridge Sts', 'North Sydney', 1, '2060', '(02) 8918 4101', 'communications@northsydneycatholics.com', 'http://www.northsydneycatholics.com'),
    (38, 1, 'Our Lady of Victories Horsley Park', '1788', 'The Horsley Drive', 'Horsley Park', 1, '2175', '(02) 9620 1242', 'parish@ourladyofvictories.org.au', 'http://www.ourladyofvictories.org.au'),
    (39, 1, 'Our Lady Queen of Peace Gladesville', 'cnr', 'Victoria Rd & Westminster Rd', 'Gladesville', 1, '2111', '(02) 9807 2966', 'office@rgcp.org.au', 'http://rgcp.org.au'),
    (40, 1, 'Our Lady Star of the Sea Watsons Bay', '341', 'Old South Head Road', 'Watsons Bay', 1, '2030', '(02) 9337 2033', 'Parish@olss.org.au', 'http://www.olss.org.au'),
    (41, 1, 'Our Lady Star of the Sea Miranda', '50', 'Kiora Road', 'Miranda', 1, '2228', '(02) 9525 1448', 'office@olssmiranda.org.au', 'http://www.olssmiranda.org.au'),
    (42, 1, 'Regina Coeli Beverly Hills', '5', 'Tarrilli Street', 'Beverly Hills', 1, '2209', '(02) 9554 8155', 'reginaparish@gmail.com', 'http://www.reginacoeliparish.org.au/'),
    (44, 1, 'Sacred Heart - Darlinghurst', '180', 'Darlinghurst Road', 'Darlinghurst', 1, '2010', '0484 380 188', 'admin@sacredheartdarlo.org.au', ''),
    (45, 1, 'Sacred Heart - Cabramatta', '13', 'Park Road', 'Cabramatta', 1, '2166', '(02) 9724 2151', 'office@sacredheartcabramatta.org.au', 'http://www.sacredheartcabramatta.org.au'),
    (46, 1, 'Sacred Heart - Villawood', '122', 'Carawatha Street', 'Villawood', 1, '2163', '(02) 9644-4026', 'office@ihmsefton.org.au', ''),
    (47, 1, 'St Agnes'' - Matraville', '509', 'Bunnerong Road', 'Matraville', 1, '2036', '(02) 9311 2062', 'stagnesmatra@bigpond.com', 'https://www.stagnesmatraville.org.au/'),
    (48, 1, 'St Aloysius of Gonzaga - Cronulla', '18', 'Giddings Avenue', 'Cronulla', 1, '2230', '61 2 8522 0300', 'admin@cronullacatholic.org.au', 'http://www.cronullacatholic.org.au'),
    (49, 1, 'St Ambrose - Concord West', '2', 'Burke Street', 'Concord West', 1, '2138', '(02) 9743 1023', 'admin@stambrose.org.au', 'http://www.stambrose.org.au/'),
    (50, 1, 'St Andrew - Malabar', '6', 'Prince Edward Street', 'Malabar', 1, '2036', '(02) 9311 2062', 'standrewmal@gmail.com', 'https://www.standrewsmalabar.org.au/'),
    (51, 1, 'St Anne - Bondi Beach', '47', 'Mitchell Street', 'Bondi Beach', 1, '2026', '(02) 9365 1195', 'admin@bondicatholic.org.au', 'http://www.bondicatholic.org.au'),
    (52, 1, 'St Anne - Strathfield South', '11', 'St Anne''s Square', 'Strathfield South', 1, '2136', '(02) 9642 1523', 'stannesstrathfieldsouth@outlook.com', 'https://www.stannestrathfieldsouth.org.au/'),
    (53, 1, 'St Anthony - Marsfield', '54', 'Agincourt Road', 'Marsfield', 1, '2122', '(02) 9888 5222', 'office@saintanthonys.org.au', 'http://www.saintanthonys.org.au'),
    (54, 1, 'St Anthony of Padua - Clovelly', '58', 'Arden Street', 'Clovelly', 1, '2031', '(02) 9037 3938', 'parish@stanthonyclovelly.org.au', 'http://www.stanthonyclovelly.org.au'),
    (55, 1, 'St Anthony of Padua - Austral', '105', 'Eleventh Ave', 'Austral', 1, '2179', '(02) 9606 0206 ', 'admin@stanthonysaustral.org', 'http://www.stanthonysaustral.org'),
    (56, 1, 'St Augustine of Hippo - Balmain', '', 'Eaton Street', 'Balmain', 1, '2041', '(02) 9810 1157', 'office@staugbalmain.org.au', 'http://www.staugbalmain.org.au'),
    (57, 1, 'St Bede - Pyrmont', '43', 'Pyrmont Street', 'Pyrmont', 1, '2009', '(02) 9660 1407', 'info@bbjcatholicparishes.org.au', 'http://www.stjames-stbede.org.au'),
    (58, 1, 'St Benedict - Broadway', '104', 'Broadway (Corner Abercrombie Street & Broadway)', 'Broadway', 1, '2007', '(02) 9660 1407', 'info@bbjcatholicparishes.org.au', 'http://www.stbenedicts.org.au'),
    (59, 1, 'St Bernadette - Carlton', '12', 'Argyle Street', 'Carlton', 1, '2218', '(02) 9587 4246', 'admin@carltonparish.org.au', ''),
    (60, 1, 'St Bernard - Botany', '4', 'Ramsgate Street', 'Botany', 1, '2019', '(02) 9316 8303', 'stbernardsparishbotany@gmail.com', 'http://www.stbernards-botany.org.au/'),
    (61, 1, 'St Brendan - Annandale', '34', 'Collins Street', 'Annandale', 1, '2038', '02 9550 3707', 'admin@stbrendan.org.au', 'http://www.stbrendan.org.au'),
    (62, 1, 'St Brendan - Bankstown, Central', '54', 'Northam Avenue', 'Bankstown', 1, '2200', '(02) 97902859', 'admin@stbrendans.org.au', 'https://www.stbrendanscb.com/'),
    (63, 1, 'St Brigid- Coogee', 'cnr', 'Brook & Waltham Streets', 'Coogee', 1, '2034', '(02) 9315 7562', 'parishoffice@stbrigidscoogee.org.au', 'http://www.stbrigidscoogee.org.au/'),
    (64, 1, 'St Brigid - Marrickville', '392', 'Marrickville Rd (cnr Livingstone Rd)', 'Marrickville', 1, '2204', '(02) 8577 5670', 'parish@stbrigid.org.au', 'http://www.stbrigid.org.au'),
    (65, 1, 'St Canice - Elizabeth Bay', '28', 'Roslyn Street', 'Elizabeth Bay', 1, '2011', '(02) 9358 5229', 'contactus@stcanice.org.au', 'http://www.stcanice.org.au'),
    (66, 1, 'St Catherine Laboure - Gymea', '123', 'Gymea Bay Road', 'Gymea', 1, '2227', '(02) 9525 1138', 'office@stcaths.org.au', 'http://www.stcaths.org.au/'),
    (67, 1, 'St Charles Borromeo and Our Lady Queen of Peace - Ryde / Gladesville', '562', 'Victoria Rd', 'Ryde', 1, '2112', '(02) 9807 2966', 'office@rgcp.org.au', 'http://www.rgcp.org.au'),
    (68, 1, 'St Christopher - Holsworthy', '195', 'Heathcote Rd', 'Holsworthy', 1, '2173', '(02) 9825 1679', 'stchristophersparishholsworthy@gmail.com', 'http://www.stchristophers.org.au'),
    (69, 1, 'St Christopher - Panania', '233', 'Tower Street', 'Panania', 1, '2213', '(02) 9774 3662', 'stcpanania@hotmail.com', 'https://www.stchristopherpanania.org.au'),
    (70, 1, 'St Columba & the Holy Souls - Leichhardt North', '213', 'Elswick Street', 'Leichhardt North', 1, '2040', '(02) 9569 2267', 'admin@stcolumba.org.au', 'http://www.stcolumba.org.au/'),
    (71, 1, 'St Declan - Penshurst', '92', 'Penshurst Street', 'Penshurst', 1, '2222', '(02) 9580 1310', 'office@stdeclansparish.org', 'https://www.stdeclansparish.org/'),
    (72, 1, 'St Dominic - Flemington', 'Cnr', 'Hornsey Rd & The Crescent', 'Flemington', 1, '2140', '(02) 9746 7245', 'info@stdominic.au', 'https://stdominic.au'),
    (73, 1, 'St Joan of Arc (1909) - Haberfield', '97', 'Dalhousie Street', 'Haberfield', 1, '2045', '(02) 9798 6657', 'admin@stjoanofarc.org.au', 'http://www.stjoanofarc.org.au/'),
    (74, 1, 'St John Bosco - Engadine', '46', 'Waratah Road', 'Engadine', 1, '(02) 9520 ', '(02) 9520 8277', 'boscosecretary@gmail.com', 'http://www.bosco.org.au'),
    (75, 1, 'St John of God - Auburn', '2', 'Alice Street', 'Auburn', 1, '2144', '(02) 9649 3855', 'auburncatholicchurch@gmail.com', 'http://www.stjohnofgod.com.au'),
    (76, 1, 'St John Vianney & St Thomas More - GREENACRE', '31a', 'Rawson Road', 'GREENACRE', 1, '2190', '(02) 9759 6263', 'secretary@sjv.org.au', 'http://www.stjohnvianneygreenacre.org.au'),
    (77, 1, 'St Joseph - Newtown', 'cnr', 'Bedford and Station Sts', 'Newtown', 1, '2042', '(02) 9557 3197', 'newtownfaith@gmail.com', ''),
    (78, 1, 'St Joseph - Rozelle', 'cnr', 'Victoria Road & Gordon Street', 'Rozelle', 1, '2039', '(02) 9810 1157', 'office@staugbalmain.org.au', 'http://www.stjosephrozelle.org.au'),
    (79, 1, 'St Joseph - Camperdown', '2', 'Missenden Rd', 'Camperdown', 1, '2050', '(02) 9557 1181', 'stjocamper@gmail.com', 'http://stjosephscamperdown.org.au'),
    (80, 1, 'St Joseph - Neutral Bay', '16', 'Lindsay Street', 'Neutral Bay', 1, '2089', '(02) 8969 3200', 'secretary@holyfamilymosman.org.au', 'http://www.holyfamilymosman.org.au'),
    (81, 1, 'St Joseph - Enfield', '126', 'Liverpool Road', 'Enfield', 1, '2136', '(02) 9747 4884', 'admin@stjosephenfield.org.au', 'http://stjosephenfield.org.au'),
    (82, 1, 'St Joseph - Belmore', '763', 'Canterbury Road', 'Belmore', 1, '2192', '(02) 9759 1280', 'admin@stjosephbelmore.org.au', 'https://www.facebook.com/stjosephbelmore/'),
    (83, 1, 'St Joseph - Riverwood', '26', 'Thurlow Street', 'Riverwood', 1, '2210', '0490 754 963', 'stjosephriverwood@outlook.com', 'https://www.stjosephriverwood.org.au'),
    (84, 1, 'St Joseph - Rosebery (Parish of Sydney City South)', '74', 'Rosebery Ave', 'Rosebery', 1, '2018', '(02) 9353 6300', 'secretary@citysouthcatholic.org.au', 'https://www.citysouthcatholic.org.au/'),
    (85, 1, 'St Joseph - Oatley', '21B', 'Frederick Street', 'Oatley', 1, '2223', '(02) 9580 1310', 'oatleycc@bigpond.net.au', 'https://www.stjosephschurch.com.au'),
    (86, 1, 'St Joseph - Como / Oyster Bay', '210', 'Oyster Bay Road', 'Como', 1, '2226', '(02) 9528 0205', 'stjoscomo@bigpond.com', 'http://stjosephscomo.org.au/'),
    (87, 1, 'St Joseph - Moorebank', '231', 'Newbridge Road', 'Moorebank', 1, '2170', '(02) 9602 1083', 'admin@stjosephmoorebank.org.au', 'http://www.stjosephmoorebank.org.au/'),
    (88, 1, 'St Joseph (Franciscans - Edgecliff', '14', 'Albert Street', 'Edgecliff', 1, '2027', '(02) 9331 4043', 'office@stf-stj.com', 'http://www.stfrancis-stjoseph.com'),
    (89, 1, 'St Kevin - Eastwood', '36', 'Hillview Road', 'Eastwood', 1, '2122', '(02) 9874 2533', 'parish@stkevinseastwood.org.au', 'http://www.stkevinseastwood.org.au'),
    (90, 1, 'St Luke the Evangelist - Revesby', '1', 'Beaconsfield Street', 'Revesby', 1, '2112', '(02) 9773 9065', 'admin@stlukerevesby.com', 'http://stlukerevesby.com'),
    (91, 1, 'St Margaret Mary - Randwick North', '58A', 'Clovelly Road', 'Randwick North', 1, '2031', '(02) 9399 6775', 'parishoffice@sacredheart.org.au', 'http://www.sacredheart.org.au/'),
    (92, 1, 'St Mark - Drummoyne', '33', 'Tranmere Street', 'Drummoyne', 1, '2047', '(02) 9181 1795', 'admin@stmarksdrummoyne.org.au', 'http://www.stmarksdrummoyne.org.au'),
    (93, 1, 'St Martha - Strathfield', '70', 'Homebush Road', 'Strathfield', 1, '2135', '(02) 9746 6131', 'office@stmarthas.org.au', 'http://www.stmarthas.org.au'),
    (94, 1, 'St Mary & Joseph - Maroubra Bay-Beach', '246', 'Malabar Road', 'Maroubra', 1, '2035', '(02) 9349 2793', 'admin@smsj.org.au', 'http://www.smsj.org.au'),
    (95, 1, 'St Mary - Concord', '56', 'Burton Street', 'Concord', 1, '2137', '(02) 9747 4210', 'parish@stmarysconcord.org.au', 'parish@stmarysconcord.org.au'),
    (96, 1, 'St Mary MacKillop - Rockdale City / Arncliffe', '13', 'Parker Street', 'Rockdale', 1, '2216', '(02) 9567 1558', 'admin@mmrc.org.au', 'http://www.mmrc.org.au'),
    (97, 1, 'St Mary Magdalene - Rose Bay', '13', 'Ian Street', 'Rose Bay', 1, '2029', '(02) 9371 7112', 'admin@magdalene.org.au', 'https://www.magdalene.org.au'),
    (98, 1, 'St Mary Queen of Heaven - Georges Hall', '15', 'Georges Crescent', 'Georges Hall', 1, '2198', '(02) 9727 3759', 'parishoffice.smgh@bigpond.com', 'http://www.smgh.org.au'),
    (99, 1, 'St Mary''s Cathedral - Sydney', '2', 'St Marys Rd', 'Sydney', 1, '2000', '(02) 9220 0400', 'info@stmaryscathedral.org.au', 'http://www.stmaryscathedral.org.au'),
    (100, 1, 'St Mel - Campsie', '7', 'Evaline Street', 'Campsie', 1, '2194', '(02) 9787 1582', 'stmelscampsie@bigpond.com', 'https://www.stmelscampsie.org.au/'),
    (101, 1, 'St Michael - Hurstville', '10', 'Croydon Road', 'Hurstville', 1, '2220', '(02) 7252 3966', 'stmichaelhurstville@gmail.com', 'https://www.stmichaelhurst.org.au'),
    (102, 1, 'St Michael - Lane Cove', '204', 'Longueville Road', 'Lane Cove', 1, '2066', '(02) 9427 2034', 'frsam@lanecoveparish.org.au', 'http://lanecoveparish.org.au'),
    (103, 1, 'St Michael - Meadowbank', '45', 'Maxim Street', 'Meadowbank', 1, '2114', '(02) 9809 3536', 'office@stmichaelsmeadowbank.org.au', 'http://www.stmichaelsmeadowbank.org.au/'),
    (104, 1, 'St Michael - War Memorial Catholic Church - Daceyville', '29', 'Banks Avenue', 'Daceyville', 1, '2032', '(02) 9349 1292', 'angelsville@bigpond.com', 'http://www.stmichaeldaceyville.org.au'),
    (105, 1, 'St Michael the Archangel - Stanmore', '69', 'Clarendon Road', 'Stanmore', 1, '2048', '(02) 9550 3707', 'admin@stbrendan.org.au', 'http://www.stbrendan.org.au'),
    (106, 1, 'St Michael the Archangel - Belfield', '26', 'Margaret Street', 'Belfield', 1, '2191', '(02) 9642 2736', 'secretarystmichaelsbelfield@gmail.com', ''),
    (107, 1, 'St Patrick - Kogarah', '143', 'Princes Highway', 'Kogarah', 1, '2217', '02 9587 8064', 'stpatrickschurchkogarah@gmail.com', 'https://www.stpatrickskogarah.org/'),
    (108, 1, 'St Patrick - Bondi', '2', ' Wellington Street', 'Bondi', 1, '2026', '(02) 9365 1195', 'admin@bondicatholic.org.au', 'http://www.bondicatholic.org.au'),
    (109, 1, 'St Patrick - Sutherland', '136', 'Flora Street', 'Sutherland', 1, '2232', '(02) 9524 0590', 'info@stpatssutherland.org.au', 'http://www.stpatssutherland.org.au/'),
    (110, 1, 'St Patrick (1943) - Mortlake', '33', 'Gale Street', 'Mortlake', 1, '2137', '(02) 9743 1017', 'parish@stpatsmortlake.org.au', 'http://www.stpatsmortlake.org.au'),
    (111, 1, 'St Patrick - Summer Hill', '5', 'Drynan Street', 'Summer Hill', 1, '2130', '(02) 9798 6016', 'office@thomaspatrick.org.au', 'https://www.thomaspatrick.org.au'),
    (112, 1, 'St Patrick - Revesby Heights', '294', 'The River Road', 'Revesby Heights', 1, '2212', '(02) 9774 3662', 'stcpanania@hotmail.com', 'https://www.stpatrickrevesbyheights.org.au'),
    (113, 1, 'St Patrick - Church Hill (Sydney)', '20', 'Grosvenor Street', 'Sydney', 1, '2000', '(02) 9254 9855', 'office@stpatschurchhill.org', 'http://www.stpatschurchhill.org'),
    (114, 1, 'St Paul of the Cross - Dulwich Hill', '532', 'New Canterbury Road', 'Dulwich Hill', 1, '2203', '(02) 9558 3257', 'church@dulwichhillparish.org.au', 'http://www.dulwichhillparish.org.au'),
    (115, 1, 'St Peter - Surry Hills', '235', 'Devonshire Street (near Crown St)', 'Surry Hills', 1, '2010', '(02) 9698 1948', 'admin@stpeterssh.org.au', 'https://www.stpeterssurryhills.org.au'),
    (116, 1, 'St Peter Chanel & St Joseph - Berala', '62', 'Kingsland Rd', 'Berala', 1, '2141', '(02) 9644 7787', 'info@stpeter-stjoseph.org.au', 'http://www.stpeter-stjoseph.org.au/'),
    (117, 1, 'St Peter Julian (Blessed Sacrament) - Haymarket (Sydney)', '641', 'George Street', 'Haymarket', 1, '2000', '(02) 9270 6900 or  (', 'haymarket@blessedsacrament.com.au', 'http://www.stpeterjuliansydney.com'),
    (118, 1, 'St Raphael  - South Hurstville', '82', 'George Street', 'South Hurstville', 1, '2221', '(02) 9546 2605', 'admin@materdei-straphael.org.au', 'http://www.materdei-straphael.org.au/'),
    (120, 1, 'St Therese - Lakemba', '15', 'Garrong Road', 'Lakemba', 1, '2195', '(02) 9759 1441', 'sttlak@bigpond.com', ''),
    (121, 1, 'St Therese - Denistone', '440', 'Blaxland Road', 'Denistone', 1, '2114', '(02) 9809 2925', 'admin@denistonecatholic.org', 'https://www.denistonecatholic.org'),
    (122, 1, 'St Therese - Dover Heights', '20', 'Napier Street', 'Dover Heights', 1, '2030', '(02) 9371 7112', 'admin@magdalene.org.au', ''),
    (123, 1, 'St Therese - Padstow', '11', 'Harvey Avenue', 'Padstow', 1, '2211', '(02) 9774 1864', 'sdebono@optusnet.com.au', 'http://www.sttherese.net'),
    (124, 1, 'St Therese - Sadleir-Miller', '125', 'Cartwright Avenue', 'Sadleir', 1, '2168', '(02) 9753 6500', 'st.therese@cpasl.org.au', 'http://sttherese.cpasl.org.au'),
    (125, 1, 'St Therese - Mascot', '51', 'Sutherland Street', 'Rosebery', 1, '2018', '(02) 9667 3040', 'sttherese@ozemail.com.au', 'http://www.sttheresemascot.org.au'),
    (126, 1, 'St Thomas More - Brighton-le-Sands', '298', 'Bay Street', 'Brighton-le-Sands', 1, '2216', '(02) 9567 3589', 'office@thomasmorebrighton.org.au', 'https://www.thomasmorebrighton.org.au'),
    (127, 1, 'St Thomas of Canterbury - Lewisham', '3', 'Thomas Street', 'Lewisham', 1, '2049', '(02) 9798 6016', 'office@thomaspatrick.org.au', 'https://www.thomaspatrick.org.au'),
    (128, 1, 'St Vincent de Paul - Redfern', '111', 'Redfern St', 'Redfern', 1, '2016', '(02) 9353 6300', 'secretary@citysouthcatholic.org.au', 'https://www.citysouthcatholic.org.au/'),
    (129, 1, 'St Vincent de Paul - Ashfield', '9-13', 'Bland Street', 'Ashfield', 1, '2131', '(02) 9798 2501', 'vinstaff@vinash.org.au', 'http://www.vinash.org.au'),
    (130, 1, 'The Shrine of Our Lady of Mount Carmel - Waterloo', '2', 'Kellick Street', 'Waterloo', 1, '2017', '(02) 9353 6300', 'secretary@citysouthcatholic.org.au', 'https://www.citysouthcatholic.org.au/'),
    (131, 1, 'St Felix de Valois - Bankstown', '550', 'Chapel Road', 'Bankstown', 1, '2200', '(02) 9790 1933', 'admin@stfelixparish.org.au', 'http://www.stfelixparish.org.au'),
    (132, 1, 'St Fiacre - Leichhardt', '96', 'Catherine Street', 'Leichhardt', 1, '2040', '02 9550 9448', 'admin@stfiacre.org.au', ''),
    (133, 1, 'St Finbar - Sans Souci', '106', 'The Promenade', 'Sans Souci', 1, '2219', '0295299392', 'office@stfinbarsanssouci.org.au', 'https://stfinbarsanssouci.org.au'),
    (134, 1, 'St Francis of Assisi - Paddington', '463', 'Oxford Street', 'Paddington', 1, '2021', '(02) 9331 4043', 'office@stf-stj.com', 'http://www.stfrancis-stjoseph.com'),
    (135, 1, 'St Francis Xavier - Arncliffe', '', 'Forest Road, Arncliffe (near the corner of Wardell Street)', 'Arncliffe', 1, '2205', '(02) 9567 1558', 'admin@mmrc.org.au', 'https://www.mmrc.org.au/'),
    (136, 1, 'St Francis Xavier - Ashbury', '54', 'Leopold Street', 'Ashbury', 1, '2133', '(02) 9798 3924', 'parish@sfxashbury.org.au', 'http://sfxashbury.org.au'),
    (137, 1, 'St Francis Xavier - Lurnea', '71', 'Webster Road', 'Lurnea', 1, '2170', '(02) 9607 8760', 'admin@sfxlurnea.org.au', 'http://www.stfrancisxavierlurnea.org.au'),
    (138, 1, 'St Francis Xavier Church - Lavender Bay', '17', 'Mackenzie Street', 'Lavender Bay', 1, '2060', '89 18 4101', 'communications@northsydneycatholics.com', 'http://www.northsydneycatholics.com'),
    (139, 1, 'St Gabriel (1940) - Bexley', '53', 'Stoney Creek Road', 'Bexley', 1, '2207', '(02) 9567-1558', 'admin@mmrc.org.au', 'http://www.mmrc.org.au'),
    (140, 1, 'St Gertrude''s, inc the Shrine of St Benedict - Smithfield', '6', 'Justin Street', 'Smithfield', 1, '2164', '(02) 9604 1199', 'office@stgertrude.org.au', 'http://www.stgertrude.org.au'),
    (141, 1, 'St James - Forest Lodge', '2', 'Woolley Street', 'Glebe', 1, '2037', '(02) 9660 1407', 'info@bbjcatholicparishes.org.au', 'http://www.stjames-stbede.org.au'),
    (142, 1, 'St Jerome - Punchbowl', '2', 'Turner Street', 'Punchbowl', 1, '2196', '(02) 9709 3223', 'admin@stjerome.org.au', 'http://stjerome.org.au/'),
    (143, 1, 'St Joachim - Lidcombe', '2', 'Mills Street', 'Lidcombe', 1, '2141', '(02) 9649 7030', 'office@stjoachimsparish.org', 'http://www.stjoachimsparish.org');

-- 5) INSERT crusades
-- Data migrated from the old Crusade table.
INSERT INTO crusades (crusade_id, state_id, diocese_id, parish_id, confession_start_time, confession_end_time, mass_start_time, mass_end_time, crusade_start_time, crusade_end_time, contact_name, contact_phone, contact_email, comments)
VALUES
    (3, 1, 1, 99, '11:00:00', '12:00:00', '12:00:00', '13:00:00', '13:00:00', '14:00:00', '', '', '', '');

-- 6) No data for Adorations in the MySQL dump.

-- ==============================================================
-- Reset sequences to avoid primary key conflicts with new data.
-- ==============================================================
SELECT setval('users_user_id_seq', (SELECT MAX(user_id) FROM users));
SELECT setval('states_state_id_seq', (SELECT MAX(state_id) FROM states));
SELECT setval('dioceses_diocese_id_seq', (SELECT MAX(diocese_id) FROM dioceses));
SELECT setval('parishes_parish_id_seq', (SELECT MAX(parish_id) FROM parishes));
SELECT setval('crusades_crusade_id_seq', (SELECT MAX(crusade_id) FROM crusades));
-- Adorations table is empty, so we set the sequence to start at 1.
SELECT setval('adorations_adoration_id_seq', 1, false);
