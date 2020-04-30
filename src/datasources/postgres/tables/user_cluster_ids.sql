BEGIN TRANSACTION;

CREATE TABLE user_cluster_ids
(
    id serial PRIMARY KEY,
    user_id VARCHAR,
    cluster_id VARCHAR
);

COMMIT;