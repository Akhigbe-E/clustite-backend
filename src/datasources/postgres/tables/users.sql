BEGIN TRANSACTION;

CREATE TABLE users
(
    id serial PRIMARY KEY,
    username VARCHAR(100),
    matric_number VARCHAR(15) UNIQUE NOT NULL,
    account_number VARCHAR(30) UNIQUE NOT NULL
);

COMMIT;