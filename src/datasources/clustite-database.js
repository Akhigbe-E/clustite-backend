const { SQLDataSource } = require("datasource-sql")
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')


// const { clusterReducer, userReducer, commitmentGroupReducer, scoreReducer } = require('./reducers');

class ClustiteDatabase extends SQLDataSource {

    constructor(knex, asyncRedisClient) {
        super(knex)
        this.redisClient = asyncRedisClient
    }
    ////////////////////// COMMITMENT //////////////////////

    //// Commitment => Query
    getAllCommitmentGroups() {
        return this.knex
            .select('*')
            .from("commitment_groups").then(data => {
                return Array.isArray(data) ? data.map(group => this.commitmentGroupReducer(group)) : []
            })
    }
    getCommitmentGroups(commitmentGroupIDs) {
        return this.knex
            .select('*')
            .from("commitment_groups")
            .whereIn('id', [...commitmentGroupIDs])
            .then(data => {
                return Array.isArray(data) ? data.map(group => {
                    return this.commitmentGroupReducer(group)
                }) : []
            })
    }
    getCommitmentGroup(commitmentGroupID) {
        return this.knex
            .select('*')
            .from("commitment_groups")
            .where('id', commitmentGroupID)
            .then(data => {
                console.log(data)
                return Array.isArray(data) ? data.map(group => {
                    return this.commitmentGroupReducer(group)
                }) : []
            })
    }
    getCommitmentGroupMembers(commitmentGroupID) {
        return this.getIDOfMembersOfCommitment(commitmentGroupID)
            .then(userIDsObjs => {
                let userIDs = userIDsObjs.map(({ user_id }) => user_id)
                return this.getUsers(userIDs)
            })
            .then(data => {
                return Array.isArray(data) ? data.map(data => this.userReducer(data)) : []
            }).catch(err => { console.log(err) })
    }
    getJoinedCommitmentGroups(userID) {
        return this.getIDOfJoinedCommitmentGroup(userID).then(commitmentGroupIDObjs => {
            let commitmentGroupIDs = commitmentGroupIDObjs.map(({ commitment_group_id }) => {
                return commitment_group_id
            })
            return this.getCommitmentGroups(commitmentGroupIDs)
        })
    }
    getRecommendedCommitmentGroups(userID) {
        return this.getIDOfJoinedCommitmentGroup(userID).then(commitmentGroupIDObjs => {
            let joinedCommitmentGroupIDs = commitmentGroupIDObjs.map(({ commitment_group_id }) => {
                return commitment_group_id
            })
            // console.log(joinedCommitmentGroupIDs)
            return this.getCommitmentGroupWhereNotID(joinedCommitmentGroupIDs)
        })
    }
    getCommitmentGroupWhereNotID(IDs) {
        if (IDs.length === 0) {
            return this.getAllCommitmentGroups()
        }
        // return this.knex.select('*').from("commitment_groups").whereNotIn('id', [...IDs]).andWhere('group_type', 'public').then(data => {
        return this.knex.select('*').from("commitment_groups").whereNotIn('id', [...IDs]).then(data => {
            return Array.isArray(data) ? data.map(group => {
                return this.commitmentGroupReducer(group)
            }) : []
        })
    }

    //Commitment => Mutation
    createCommitmentGroup(details) {
        const {
            ownerID,
            groupName,
            typeOfGroup,
            groupJoiningCode,
            numberOfClusters,
            commitmentName,
            commitmentDescription,
            stake,
            hasGivenReward } = details

        return this.knex('commitment_groups').insert({
            owner_id: ownerID,
            group_name: groupName,
            group_type: typeOfGroup,
            group_joining_code: groupJoiningCode,
            number_of_clusters: numberOfClusters,
            commitment_name: commitmentName,
            commitment_description: commitmentDescription,
            stake,
            has_given_reward: hasGivenReward
        }, ['*'])
            .then(commitmentGroup => {
                return {
                    success: true,
                    message: "Commitment group successfully created",
                    commitmentGroup: this.commitmentGroupReducer(commitmentGroup[0])
                }
            }).catch(err => {
                return {
                    success: false,
                    message: "Commitment group creation unsuccessful",
                    commitmentGroup: null
                }
            })

    }
    joinCommitmentGroup(details) {
        const { userID, commitmentGroupID } = details;
        return this.knex('user_commitment_ids')
            .insert({ user_id: userID, commitment_group_id: commitmentGroupID })
            .returning('commitment_group_id')
            .then(data => {
                return {
                    success: true,
                    addedID: data[0]
                }
            }).catch(err => {
                return {
                    success: false,
                    addedID: null
                }
            })
    }

    giveReward({ hasGivenReward, reward, clusterID, commitmentGroupID }) {
        return this.knex.transaction(trx => {
            trx('commitment_groups')
                .where({ id: commitmentGroupID })
                .update({ has_given_reward: hasGivenReward })
                .then(data => {
                    return trx('clusters')
                        .where({ id: clusterID })
                        .update({ reward }, ['reward'])
                        .then(data => {
                            return {
                                success: true,
                                ...data[0]
                            }
                        })
                        .then(trx.commit)
                        .catch(trx.rollback)
                }).catch(err => {
                    return {
                        success: false
                    }
                })
        })
    }


    ////////////////////// ID //////////////////////

    getIDOfMembersOfCommitment(commitmentGroupID) {
        return this.knex.select('user_id').from('user_commitment_ids').where({ commitment_group_id: commitmentGroupID })
    }

    getIDOfMembersOfCluster(clusterID) {
        return this.knex.select('user_id').from('user_cluster_ids').where({ cluster_id: clusterID })
    }
    getIDOfJoinedCommitmentGroup(userID) {
        return this.knex.select('commitment_group_id').from("user_commitment_ids").where({ user_id: userID })
    }


    createSession(redisClient, user) {
        const { id, matric_number } = user
        const token = this.signToken(matric_number)
        return this.setToken(redisClient, token, id)
            .then(() => {
                return {
                    success: true,
                    message: "Login successful",
                    userID: id,
                    token
                }
            }).catch(err => Promise.reject('Error while saving token'))
    }



    ////////////////////// USERS //////////////////////

    //// Query
    getUsers(user_ids) {
        return this.knex.select('*').from('users').whereIn('id', user_ids)
    }
    getUser(userID) {
        if (!userID) return undefined;
        return this.knex.select('*')
            .from('users')
            .where('id', userID)
            .then(user => { return this.userReducer(user[0]) })
    }


    //// Mutation
    registerAccount({ name, email, matricNumber, accountNumber, bankName, cgpa, password }) {
        if (!name || !matricNumber || !password || !accountNumber || !cgpa) {
            return {
                success: false,
                message: 'Kindly fill all fields',
                token: null,
                userID: null
            }
        }
        const password_hash = bcrypt.hashSync(password, 10)

        return this.knex.transaction(trx => {
            return trx.insert({
                password_hash,
                matric_number: matricNumber
            }).into('login')
                .returning('*')
                .then(data => {
                    const { id, password_hash, matric_number } = data[0]
                    return trx('users')
                        .returning('*')
                        .insert({
                            username: name,
                            email,
                            matric_number,
                            account_number: accountNumber,
                            bank_name: bankName,
                            cgpa: cgpa
                        })
                        .then(user => {
                            return this.createSession(this.redisClient, user[0])
                                .then(session => session)
                        })
                        .catch(err => {
                            return {
                                success: false,
                                message: 'Account creation failed',
                                token: null,
                                userID: null
                            }
                        })
                }).catch(err => {
                    return {
                        success: false,
                        message: 'Account creation failed',
                        token: null,
                        userID: null
                    }
                })
        })
    }

    signToken(matricNumber) {
        return jwt.sign({ matricNumber }, `${process.env.JWT_SECRET}`, {
            expiresIn: "2 days"
        })
    }

    setToken(redisClient, key, value) {
        return Promise.resolve(redisClient.set(key, value));
    };

    logIntoAccount(details) {
        const { matricNumber, password } = details
        return this.knex
            .select('matric_number', 'password_hash')
            .from('login')
            .where('matric_number', matricNumber)
            .then(data => {
                const isValid = bcrypt.compareSync(password, data[0].password_hash);
                if (isValid) {
                    return this.knex
                        .select("*")
                        .from("users")
                        .where("matric_number", matricNumber)
                        .then((user) => {
                            return this.createSession(this.redisClient, user[0])
                                .then(session => session)
                        })
                        .catch(err => {
                            return {
                                success: false,
                                message: "Login failed",
                                // token: null,
                                // userID: null
                            }
                        });
                } else {
                    return {
                        success: false,
                        message: "Login Failed",
                        // token: null,
                        // userID: null
                    }
                }
            }).catch(e => {
                return {
                    success: false,
                    message: "Login Failed",
                    // token: null,
                    // userID: null
                }
            })
    }

    updateUserProfile(details) {
        const { userID, matricNumber, name, accountNumber, password } = details;
        // const password_hash = bcrypt.hashSync(password, 10);
        return this.knex.transaction(trx => {
            trx('login')
                .where('matric_number', matricNumber)
                // .update({ password_hash }, ['password_hash'])
                .then(password_hash => {
                    return trx('users')
                        .where('id', userID)
                        .update({ username: name, account_number: accountNumber }, ['*'])
                        .then(data => {
                            return {
                                success: true,
                                message: `Account updated`,
                                user: () => this.userReducer({ ...data[0] })
                                // user: () => this.userReducer({ ...data[0], ...password_hash[0] })
                            }
                        })
                        .then(trx.commit)
                        .catch(trx.rollback)
                }).catch(err => {
                    return {
                        success: false,
                        message: `Account not updated`,
                        user: null
                    }
                })
        })
    }


    ////////////////////// CLUSTER //////////////////////

    getClusterMembers(clusterID) {
        return this.getIDOfMembersOfCluster(clusterID)
            .then(userIDsObjs => {
                let userIDs = userIDsObjs.map(({ user_id }) => user_id)
                return this.getUsers(userIDs)
                    .then(data => {
                        return Array.isArray(data) ? data.map(data => this.userReducer(data)) : []
                    })
            })
    }
    getClusters(commitmentID) {
        return this.knex.select('*')
            .from('clusters')
            .where({ commitment_group_id: commitmentID })
            .then(data => Array.isArray(data) ? data.map(data => this.clusterReducer(data)) : [])
    }

    createCluster(details) {
        console.log(details)
        const { commitmentGroupID, clusterName, clusterScore, reward, clusterHeadMemberID } = details
        return this.knex('clusters')
            .insert({ commitment_group_id: commitmentGroupID, cluster_name: clusterName, cluster_score: clusterScore, reward, cluster_head_member_id: clusterHeadMemberID })
            .returning('*')
            .then(data => {
                return {
                    success: true,
                    message: 'Cluster created',
                    cluster: () => this.clusterReducer({ ...data[0] })
                }
            }).catch(err => {
                return {
                    success: false,
                    message: 'Cluster not created',
                    cluster: null
                }
            })
    }

    joinCluster(details) {
        const { userID, clusterID } = details;
        return this.knex('user_cluster_ids')
            .insert({ user_id: userID, cluster_id: clusterID })
            .returning('cluster_id')
            .then(data => {
                return {
                    success: true,
                    addedID: data[0]
                }
            }).catch(err => {
                return {
                    success: false,
                    addedID: null
                }
            })
    }


    ////////////////////// SCORE //////////////////////

    //// Query
    getScores(userID) {
        return this.knex.select('*')
            .from('scores')
            .where({ user_id: userID })
            .then(scores => scores.map(score => this.scoreReducer(score)))
    }

    //// Mutation
    enterScore({ userID, commitmentGroupID, clusterID, points }) {
        return this.knex('scores')
            .insert({ user_id: userID, commitment_group_id: commitmentGroupID, cluster_id: clusterID, points })
            .returning('*')
            .then(score => {
                return {
                    success: true,
                    message: 'score entered',
                    score: () => this.scoreReducer(score[0])
                }
            }).catch(err => {
                return {
                    success: false,
                    message: 'score not entered',
                    score: null
                }
            })
    }
    calculateClusterScore({ commitmentGroupID, clusterID, points }) {
        return this.knex('clusters')
            .where({ commitment_group_id: commitmentGroupID, id: clusterID })
            .update({
                cluster_score: points
            }, ['*'])
            .then(score => {
                console.log(score)
                return {
                    success: true,
                    message: 'score calculated',
                    score: () => this.scoreReducer(score[0])
                }
            }).catch(err => {
                return {
                    success: false,
                    message: 'score not calculated',
                    score: null
                }
            })
    }



    //////////////////////////// REDUCER ////////////////////////////////

    clusterReducer({ id, commitment_group_id, cluster_name, cluster_score, reward, cluster_head_member_id }) {
        let clusterMembers = () => this.getClusterMembers(id);
        let clusterHeadMember = () => this.getUser(cluster_head_member_id)
        return {
            id,
            commitmentGroupID: commitment_group_id,
            clusterName: cluster_name,
            clusterScore: cluster_score,
            clusterMembers,
            clusterHeadMember,
            reward
        }
    }
    userReducer({ id, username, email, password_hash, matric_number, account_number, bank_name, cgpa }) {
        let commitmentGroups = () => this.getJoinedCommitmentGroups(id)
        let scores = () => this.getScores(id)
        return {
            id,
            name: username,
            email,
            matricNumber: matric_number,
            // password: password_hash,
            accountNumber: account_number,
            bankName: bank_name,
            cgpa,
            commitmentGroups,
            scores
        }
    }
    commitmentGroupReducer(data) {
        const { id, owner_id, group_name, group_type, group_joining_code, number_of_clusters, commitment_name, commitment_description, stake, has_given_reward } = data;
        let groupMembers = () => this.getCommitmentGroupMembers(id)
        let clusters = () => this.getClusters(id)
        return {
            id,
            ownerID: owner_id,
            groupName: group_name,
            typeOfGroup: group_type,
            groupJoiningCode: group_joining_code,
            numberOfClusters: number_of_clusters,
            groupMembers,
            clusters,
            commitmentName: commitment_name,
            commitmentDescription: commitment_description,
            stake,
            hasGivenReward: has_given_reward
        }
    }
    scoreReducer({ id, user_id, commitment_group_id, cluster_id, points, cluster_score }) {
        return {
            id,
            commitmentGroupID: commitment_group_id,
            clusterID: cluster_id,
            points: points || cluster_score
        }
    }
}


module.exports = ClustiteDatabase;