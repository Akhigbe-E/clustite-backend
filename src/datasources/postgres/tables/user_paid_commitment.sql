BEGIN TRANSACTION;

CREATE TABLE user_paid_commitment_ids {
    id serial PRIMARY KEY
    user_id VARCHAR
    paid_commitment_id VARCHAR
};

COMMIT;


-- Jumia takes long to pay their suppliers
-- For see return policy