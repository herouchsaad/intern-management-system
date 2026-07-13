CREATE TABLE applications (
    application_id BIGSERIAL NOT NULL PRIMARY KEY,
    application_status VARCHAR(15) NOT NULL,
    application_date INTEGER NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    id_no VARCHAR(20) UNIQUE NOT NULL,
    phone_number VARCHAR(20),
    email VARCHAR(150) NOT NULL,
    uni VARCHAR(150),
    major VARCHAR(150),
    grade INTEGER,
    gpa NUMERIC(5,2),
    team_id INTEGER,
    birthday INTEGER,
    internship_starting_date INTEGER NOT NULL,
    internship_ending_date INTEGER NOT NULL,
    cv_url VARCHAR(500),
    photo_url VARCHAR(500),
    overall_success INTEGER
);

CREATE TABLE document_requests (
  id BIGSERIAL NOT NULL PRIMARY KEY,
  document_name VARCHAR(50) NOT NULL
);

CREATE TABLE documents (
  document_id BIGSERIAL NOT NULL PRIMARY KEY,
  document_name VARCHAR(50) NOT NULL,
  intern_id INTEGER NOT NULL,
  document_url VARCHAR(500) NOT NULL
);


CREATE TABLE notifications (
  notification_id BIGSERIAL NOT NULL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  intern_id INTEGER,
  notification_date INTEGER NOT NULL,
  type_code INTEGER NOT NULL,
  content VARCHAR(250) NOT NULL,
  timestamp INTEGER,
  is_seen BOOLEAN NOT NULL
);


CREATE TABLE attendances (
  attendance_id BIGSERIAL NOT NULL PRIMARY KEY,
  intern_id INTEGER NOT NULL,
  attendance_date INTEGER NOT NULL,
  status VARCHAR(15) NOT NULL,
  note VARCHAR(250)
);

CREATE TABLE assignments (
  assignment_id BIGSERIAL NOT NULL PRIMARY KEY,
  intern_id INTEGER,
  description VARCHAR(250) NOT NULL,
  deadline INTEGER,
  grade INTEGER,
  weight INTEGER,
  complete BOOLEAN NOT NULL
);

CREATE TABLE supervisors (
  supervisor_id BIGSERIAL NOT NULL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  team_id INTEGER NOT NULL
);

CREATE TABLE users (
  user_id BIGSERIAL NOT NULL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  refresh_token VARCHAR(800),
  email VARCHAR(255),
  password VARCHAR(100) NOT NULL,
  role INTEGER NOT NULL
);


CREATE TABLE teams (
    team_id BIGSERIAL NOT NULL PRIMARY KEY,
    team_name VARCHAR(50) NOT NULL
);


CREATE TABLE interns (
    intern_id BIGSERIAL NOT NULL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    id_no VARCHAR(20) UNIQUE NOT NULL,
    phone_number VARCHAR(20),
    email VARCHAR(150) NOT NULL,
    uni VARCHAR(150),
    major VARCHAR(150),
    grade INTEGER,
    gpa NUMERIC(5,2),
    team_id BIGINT,
    birthday DATE,
    internship_starting_date DATE NOT NULL,
    internship_ending_date DATE NOT NULL,
    cv_url VARCHAR(500),
    photo_url VARCHAR(500),
    assignment_grades INTEGER[],
    overall_success INTEGER
);

-- ─── Seed: Default admin account ──────────────────────────────────────────────
-- Password: Admin1234!  (bcrypt hash, cost 10)
-- Change the password after first login!
INSERT INTO users (username, password, role, email)
VALUES (
    'admin',
    '$2b$10$K741o1Ppm5cTmspsS8viCeTOK.Z2oynD2xfvqUI6dOEkZXReMef3O',
    5150,
    'admin@ims.local'
);