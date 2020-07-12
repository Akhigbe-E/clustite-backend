BEGIN TRANSACTION;

CREATE TABLE commitment_groups
(
    id serial PRIMARY KEY,
    owner_id VARCHAR(100) NOT NULL,
    group_name VARCHAR(100) NOT NULL,
    group_type VARCHAR(7) NOT NULL,
    group_joining_code VARCHAR(30),
    number_of_clusters INTEGER NOT NULL,
    commitment_name VARCHAR(100),
    commitment_description VARCHAR(100),
    stake INTEGER,
    has_given_reward BOOLEAN
);

COMMIT;