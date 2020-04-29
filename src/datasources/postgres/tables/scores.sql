BEGIN TRANSACTION;

CREATE TABLE scores
(
    id serial PRIMARY KEY,
    cluster_id VARCHAR(100) NOT NULL,
    score INTEGER
);

COMMIT;