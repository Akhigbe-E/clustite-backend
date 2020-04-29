BEGIN TRANSACTION;

CREATE TABLE login
(
    id serial PRIMARY KEY,
    password_hash VARCHAR(100) NOT NULL,
    matric_number text UNIQUE NOT NULL
);

COMMIT;