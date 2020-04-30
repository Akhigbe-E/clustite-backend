-- Deploy fresh database tables

\i '/docker-entrypoint-initdb.d/tables/users.sql'
\i '/docker-entrypoint-initdb.d/tables/login.sql'
\i '/docker-entrypoint-initdb.d/tables/user_commitment_ids.sql'
\i '/docker-entrypoint-initdb.d/tables/user_cluster_ids.sql'
\i '/docker-entrypoint-initdb.d/tables/clusters.sql'
\i '/docker-entrypoint-initdb.d/tables/commitment_groups.sql'
\i '/docker-entrypoint-initdb.d/tables/scores.sql'


\i '/docker-entrypoint-initdb.d/seed/seed.sql'

