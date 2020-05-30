BEGIN TRANSACTION;

INSERT into users (username, email, matric_number, account_number, bank_name, cgpa) values ('Emmanuel', 'yo@gmail.com', '16ch021480', '0375600459', 'GTB', 4.8);
INSERT into users (username, email, matric_number, account_number, bank_name, cgpa) values ('John', 'yoo@gmail.com', '16ch021482', '0375600434', 'GTB', 3.2);
INSERT into commitment_groups (owner_id, group_name, group_type, group_joining_code,number_of_clusters, commitment_name, commitment_description, stake ) values ('1', 'Spetnaz Squad', 'Private', 'XQ34TANGO',2, 'CSC 424 Test 1', 'Lorem Ipsum', 3000);
INSERT into user_commitment_ids (user_id, commitment_group_id) values ('1', '1');
INSERT into user_commitment_ids (user_id, commitment_group_id) values ('2', '1');
INSERT into user_cluster_ids (user_id, cluster_id) values ('1', '1');
INSERT into user_cluster_ids (user_id, cluster_id) values ('2', '2');
INSERT into scores (user_id,commitment_group_id, cluster_id, points) values ('1','1','1',90);
INSERT into login (password_hash, matric_number) values ('dummyHash', '16ch021480');
INSERT into clusters (commitment_group_ID, cluster_name, cluster_score, reward) values(1,'Alpha Cluster', 100, 5000);
INSERT into clusters (commitment_group_ID, cluster_name, cluster_score, reward) values(1,'Beta Cluster', 70, 2000);

COMMIT;