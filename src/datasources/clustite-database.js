const { SQLDataSource } = require("datasource-sql")
const bcrypt = require('bcryptjs')

// const { clusterReducer, userReducer, commitmentGroupReducer, scoreReducer } = require('./reducers');

class ClustiteDatabase extends SQLDataSource {
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

    //Commitment => Mutation
    createCommitmentGroup(details) {
        console.log(details)
        const {
            ownerID,
            groupName,
            typeOfGroup,
            groupJoiningCode,
            commitmentName,
            commitmentDescription,
            stake } = details

        return this.knex('commitment_groups').insert({
            owner_id: ownerID,
            group_name: groupName,
            group_type: typeOfGroup,
            group_joining_code: groupJoiningCode,
            commitment_name: commitmentName,
            commitment_description: commitmentDescription,
            stake
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



    ////////////////////// USERS //////////////////////

    //// Query
    getUsers(user_ids) {
        return this.knex.select('*').from('users').whereIn('id', user_ids)
    }
    getUser(user_id) {
        return this.knex.select('*')
            .from('users')
            .where('id', user_id)
            .then(user => this.userReducer(user))
    }


    //// Mutation
    registerAccount({ name, matricNumber, password, accountNumber }) {
        if (!name || !matricNumber || !password || !accountNumber) {
            return {
                success: false,
                message: 'Incorrect account details',
                user: null
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
                            matric_number,
                            account_number: accountNumber,
                        })
                        .then(user => {
                            console.log('oo')
                            return {
                                success: true,
                                message: `Account with matric number ${matricNumber} has been created`,
                                user: () => this.userReducer({ ...user[0], password_hash })
                            }
                        })
                        .catch(err => {
                            return {
                                success: false,
                                message: `Account creation failed`,
                                user: null
                            }
                        })
                }).catch(err => {
                    return {
                        success: false,
                        message: `Account creation failed`,
                        user: null
                    }
                })
        })
    }

    logIntoAccount(details) {
        const { matricNumber, password } = details
        return this.knex
            .select('matric_number', 'password_hash')
            .from('login')
            .where('matric_number', matricNumber)
            .then(data => {
                const isValid = bcrypt.compareSync(password, data[0].password_hash);
                if (isValid) {
                    return db
                        .select("*")
                        .from("users")
                        .where("email", "=", email)
                        .then(user => {

                        })
                        .catch(err => Promise.reject("unable to find user"));
                } else {
                    Promise.reject("wrong credentials");
                }
            })
    }

    updateUserProfile(details) {
        const { userID, matricNumber, name, accountNumber, password } = details;
        const password_hash = bcrypt.hashSync(password, 10);
        return this.knex.transaction(trx => {
            trx('login')
                .where('matric_number', matricNumber)
                .update({ password_hash }, ['password_hash'])
                .then(password_hash => {
                    return trx('users')
                        .where('id', userID)
                        .update({ username: name, account_number: accountNumber }, ['*'])
                        .then(data => {
                            console.log({ ...data[0], ...password_hash[0] })
                            return {
                                success: true,
                                message: `Account updated`,
                                user: () => this.userReducer({ ...data[0], ...password_hash[0] })
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
                console.log(score)
                return {
                    success: true,
                    message: 'score entered',
                    score: () => this.scoreReducer(score)
                }
            }).catch(err => {
                return {
                    success: false,
                    message: 'score not entered',
                    score: null
                }
            })
    }



    //////////////////////////// REDUCER ////////////////////////////////

    clusterReducer({ id, commitment_group_id, cluster_name, cluster_score, reward }) {
        let clusterMembers = () => this.getClusterMembers(id)
        return {
            id,
            commitmentGroupID: commitment_group_id,
            clusterName: cluster_name,
            clusterScore: cluster_score,
            clusterMembers,
            reward
        }
    }
    userReducer({ id, username, password_hash, matric_number, account_number }) {
        let commitmentGroups = () => this.getJoinedCommitmentGroups(id)
        let scores = () => this.getScores(id)
        return {
            id,
            name: username,
            matricNumber: matric_number,
            password: password_hash,
            accountNumber: account_number,
            commitmentGroups,
            scores
        }
    }
    commitmentGroupReducer(data) {
        const { id, owner_id, group_name, group_type, group_joining_code, commitment_name, commitment_description, stake } = data;
        let groupMembers = () => this.getCommitmentGroupMembers(id)
        let clusters = () => this.getClusters(id)
        return {
            id,
            ownerID: owner_id,
            groupName: group_name,
            typeOfGroup: group_type,
            groupJoiningCode: group_joining_code,
            groupMembers,
            clusters,
            commitmentName: commitment_name,
            commitmentDescription: commitment_description,
            stake
        }
    }
    scoreReducer({ id, user_id, commitment_group_id, cluster_id, points }) {
        return {
            id,
            commitmentGroupID: commitment_group_id,
            clusterID: cluster_id,
            points
        }
    }
}


module.exports = ClustiteDatabase;