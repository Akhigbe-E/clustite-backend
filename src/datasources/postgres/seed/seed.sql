BEGIN TRANSACTION;

INSERT into users (username, matric_number, account_number, has_paid ) values ('Emmanuel', '16ch021480', '0375600459', 'true');
INSERT into commitment_groups (group_name, group_type, group_joining_code, commitment_name, commitment_description, stake ) values ('Spetnaz Squad', 'Private', 'XQ34TANGO', 'CSC 424 Test 1', 'Lorem Ipsum', 3000);
INSERT into user_commitment_IDs (user_id, commitment_group_id) values ('1', '1');
INSERT into login (password_hash, matric_number) values ('dummyHash', '16ch021480');
INSERT into clusters (commitment_group_ID, cluster_name, cluster_score, reward) values(1,'Alpha Cluster', 100, 5000);
INSERT into clusters (commitment_group_ID, cluster_name, cluster_score, reward) values(1,'Beta Cluster', 70, 2000);

COMMIT;