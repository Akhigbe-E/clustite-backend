const { SQLDataSource } = require("datasource-sql")
const bcrypt = require('bcrypt')

const { clusterReducer, userReducer, commitmentGroupReducer } = require('./reducers');

class ClustiteDatabase extends SQLDataSource {

    ////////////////////// COMMITMENT //////////////////////

    //// Commitment => Query
    getAllCommitmentGroups() {
        return this.knex
            .select('*')
            .from("commitment_groups").then(data => {
                return Array.isArray(data) ? data.map(group => commitmentGroupReducer(group, this.getClusterMembers)) : []
            })
    }
    getCommitmentGroups(commitmentGroupIDs) {
        return this.knex
            .select('*')
            .from("commitment_groups")
            .whereIn('id', commitmentGroupIDs)
            .then(data => {
                return Array.isArray(data) ? data.map(group => commitmentGroupReducer(group, this.getClusterMembers)) : []
            })
    }
    getCommitmentGroupMembers(commitmentGroupID) {
        return this.getIDOfMembersOfCommitment(commitmentGroupID)
            .then(userIDsObjs => {
                let userIDs = userIDsObjs.map(({ user_id }) => user_id)
                return this.getUsers(userIDs)
            })
            .then(data => {
                return Array.isArray(data) ? data.map(data => userReducer(data, this.getJoinedCommitmentGroups)) : []
            })
    }
    getJoinedCommitmentGroups(userID) {
        return this.getIDOfJoinedCommitmentGroup(userID).then(commitmentGroupIDObjs => {
            let commitmentGroupIDs = commitmentGroupIDObjs.map(({ commitment_group_id }) => commitment_group_id)
            return this.getCommitmentGroups(commitmentGroupIDs)
        })
    }

    //Commitment => Mutation
    createCommitmentGroup(details) {
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
        }).then(commitmentGroup => {
            console.log(commitmentGroup)
            return {
                success: true,
                message: "Commitment group successfully created",
                commitmentGroup: commitmentGroupReducer(commitmentGroup, this.getCommitmentGroupMembers, this.getClusters)
            }
        }).catch(err => {
            return {
                success: false,
                message: "Commitment group creation unsuccessful",
                commitmentGroup: null
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
            .then(user => userReducer(user, this.getJoinedCommitmentGroups))
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
            trx.insert({
                password_hash,
                matric_number: matricNumber
            }).into('login')
                .returning('matric_number')
                .then(matricNumber => {
                    return trx('users')
                        .returning('*')
                        .insert({
                            username: name,
                            matric_number: matricNumber,
                            account_number: accountNumber,
                        })
                        .then(user => {
                            return {
                                success: true,
                                message: `Account with matric number ${matricNumber} has been created`,
                                user: () => userReducer(user, this.getJoinedCommitmentGroups)
                            }
                        })
                        .then(trx.commit)
                        .catch(err => {
                            return {
                                success: false,
                                message: `Account creation failed`,
                                user: null
                            }
                        })
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


    ////////////////////// CLUSTER //////////////////////

    getClusterMembers(clusterID) {
        return this.getIDOfMembersOfCluster(clusterID)
            .then(userIDsObjs => {
                let userIDs = userIDsObjs.map(({ user_id }) => user_id)
                return this.getUsers(userIDs)
                    .then(data => {
                        return Array.isArray(data) ? data.map(data => userReducer(data, this.getJoinedCommitmentGroups)) : []
                    })
            })
    }
    getClusters(commitmentID) {
        return this.knex.select('*')
            .from('clusters')
            .where({ commitment_group_id: commitmentID })
            .then(data => Array.isArray(data) ? data.map(data => clusterReducer(data, this.getCommitmentGroupMembers, this.getClusters)) : [])
    }

}

module.exports = ClustiteDatabase;