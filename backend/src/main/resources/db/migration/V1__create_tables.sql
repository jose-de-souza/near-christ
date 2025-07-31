-- ==============================================================
-- V1__create_tables.sql
-- ==============================================================

-- 1) users Table
CREATE TABLE users (
                       user_id BIGSERIAL PRIMARY KEY,
                       user_name VARCHAR(255) NOT NULL,
                       user_email VARCHAR(255) NOT NULL UNIQUE,
                       user_role VARCHAR(20) CHECK (user_role IN ('ADMIN', 'SUPERVISOR', 'STANDARD')) NOT NULL,
                       user_password VARCHAR(255) NOT NULL
);

-- 2) states Table
CREATE TABLE states (
                        state_id BIGSERIAL PRIMARY KEY,
                        state_name VARCHAR(100) NOT NULL,
                        state_abbreviation VARCHAR(10)
);

-- 3) dioceses Table
CREATE TABLE dioceses (
                          diocese_id BIGSERIAL PRIMARY KEY,
                          diocese_name VARCHAR(255) NOT NULL,
                          diocese_street_no VARCHAR(10),
                          diocese_street_name VARCHAR(255),
                          diocese_suburb VARCHAR(255),
                          state_id BIGINT NOT NULL,
                          diocese_postcode VARCHAR(10),
                          diocese_phone VARCHAR(20),
                          diocese_email VARCHAR(255),
                          diocese_website VARCHAR(255),
                          FOREIGN KEY (state_id) REFERENCES states(state_id) ON DELETE RESTRICT
);

-- 4) parishes Table
CREATE TABLE parishes (
                          parish_id BIGSERIAL PRIMARY KEY,
                          diocese_id BIGINT NOT NULL,
                          parish_name VARCHAR(255) NOT NULL,
                          parish_st_number VARCHAR(10),
                          parish_st_name VARCHAR(255),
                          parish_suburb VARCHAR(255),
                          state_id BIGINT NOT NULL,
                          parish_postcode VARCHAR(10),
                          parish_phone VARCHAR(20),
                          parish_email VARCHAR(255),
                          parish_website VARCHAR(255),
                          FOREIGN KEY (diocese_id) REFERENCES dioceses(diocese_id) ON DELETE RESTRICT,
                          FOREIGN KEY (state_id) REFERENCES states(state_id) ON DELETE RESTRICT
);

-- 5) adorations Table
CREATE TABLE adorations (
                            adoration_id BIGSERIAL PRIMARY KEY,
                            state_id BIGINT NOT NULL,
                            diocese_id BIGINT NOT NULL,
                            parish_id BIGINT NOT NULL,
                            adoration_type VARCHAR(255) NOT NULL,
                            adoration_location VARCHAR(255),
                            adoration_location_type VARCHAR(255),
                            adoration_day VARCHAR(50),
                            adoration_start TIME,
                            adoration_end TIME,
                            FOREIGN KEY (state_id) REFERENCES states(state_id) ON DELETE RESTRICT,
                            FOREIGN KEY (diocese_id) REFERENCES dioceses(diocese_id) ON DELETE RESTRICT,
                            FOREIGN KEY (parish_id) REFERENCES parishes(parish_id) ON DELETE RESTRICT
);

-- 6) crusades Table
CREATE TABLE crusades (
                          crusade_id BIGSERIAL PRIMARY KEY,
                          state_id BIGINT NOT NULL,
                          diocese_id BIGINT NOT NULL,
                          parish_id BIGINT NOT NULL,
                          confession_start_time TIME,
                          confession_end_time TIME,
                          mass_start_time TIME,
                          mass_end_time TIME,
                          crusade_start_time TIME,
                          crusade_end_time TIME,
                          contact_name VARCHAR(255),
                          contact_phone VARCHAR(20),
                          contact_email VARCHAR(255),
                          comments TEXT,
                          FOREIGN KEY (state_id) REFERENCES states(state_id) ON DELETE RESTRICT,
                          FOREIGN KEY (diocese_id) REFERENCES dioceses(diocese_id) ON DELETE RESTRICT,
                          FOREIGN KEY (parish_id) REFERENCES parishes(parish_id) ON DELETE RESTRICT
);
