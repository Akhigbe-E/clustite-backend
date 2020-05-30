BEGIN TRANSACTION;

CREATE TABLE commitment_groups
(
    id serial PRIMARY KEY,
    owner_id VARCHAR(100),
    group_name VARCHAR(100),
    group_type VARCHAR(7) NOT NULL,
    group_joining_code VARCHAR(30),
    number_of_clusters INTEGER,
    commitment_name VARCHAR(100),
    commitment_description VARCHAR(100),
    stake INTEGER
);

COMMIT;