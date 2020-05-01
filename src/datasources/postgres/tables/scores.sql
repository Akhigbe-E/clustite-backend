BEGIN TRANSACTION;

CREATE TABLE scores
(
    id serial PRIMARY KEY,
    user_id VARCHAR(100),
    commitment_group_id VARCHAR(100),
    cluster_id VARCHAR(100),
    points INTEGER
);

COMMIT;