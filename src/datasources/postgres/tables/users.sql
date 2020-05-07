BEGIN TRANSACTION;

CREATE TABLE users
(
    id serial PRIMARY KEY,
    username VARCHAR(100),
    email VARCHAR(100) UNIQUE NOT NULL,
    matric_number VARCHAR(15) UNIQUE NOT NULL,
    account_number VARCHAR(30) UNIQUE NOT NULL,
    bank_name VARCHAR(100) NOT NULL
);

COMMIT;