BEGIN TRANSACTION;

CREATE TABLE clusters
(
    id serial PRIMARY KEY,
    commitment_group_id VARCHAR,
    cluster_name VARCHAR(100) NOT NULL,
    cluster_score INTEGER,
    cluster_head_member_id VARCHAR,
    reward INTEGER
);

COMMIT;