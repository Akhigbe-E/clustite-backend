BEGIN TRANSACTION;

CREATE TABLE user_commitment_ids
(
    id serial PRIMARY KEY,
    user_id VARCHAR,
    commitment_group_id VARCHAR
);

COMMIT;