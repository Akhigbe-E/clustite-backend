const { SQLDataSource } = require("datasource-sql")
const { clusterReducer, userReducer, commitmentGroupReducer } = require('./reducers');

class ClustiteDatabase extends SQLDataSource {

    ////////////////////// COMMITMENT //////////////////////

    //// Commitment => Query
    getAllCommitmentGroups() {
        return this.knex
            .select('*')
            .from("commitment_groups").then(data => {
                return Array.isArray(data) ? data.map(group => commitmentGroupReducer(group)) : []
            })
    }
    getCommitmentGroups(commitmentGroupIDs) {
        return this.knex
            .select('*')
            .from("commitment_groups")
            .whereIn('id', commitmentGroupIDs)
            .then(data => {
                return Array.isArray(data) ? data.map(group => commitmentGroupReducer(group)) : []
            })
    }
    getCommitmentGroupMembers(commitmentGroupID) {
        return this.getIDOfMembersOfCommitment(commitmentGroupID)
            .then(userIDsObjs => {
                let userIDs = userIDsObjs.map(({ user_id }) => user_id)
                return this.getUsers(userIDs)
            })
            .then(data => {
                return Array.isArray(data) ? data.map(data => userReducer(data)) : []
            })
    }
    getJoinedCommitmentGroups(userID) {
        return this.getIDOfJoinedCommitmentGroup(userID).then(commitmentGroupIDObjs => {
            let commitmentGroupIDs = commitmentGroupIDObjs.map(({ commitment_group_id }) => commitment_group_id)
            return this.getCommitmentGroups(commitmentGroupIDs)
        })
    }

    //Commitment => Mutation



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

    getUsers(user_ids) {
        return this.knex.select('*').from('users').whereIn('id', user_ids)
    }



    ////////////////////// CLUSTER //////////////////////

    getClusterMembers(clusterID) {
        return this.getIDOfMembersOfCluster(clusterID)
            .then(userIDsObjs => {
                let userIDs = userIDsObjs.map(({ user_id }) => user_id)
                return this.getUsers(userIDs)
                    .then(data => {
                        return Array.isArray(data) ? data.map(data => userReducer(data)) : []
                    })
            })
    }
    getClusters(commitmentID) {
        return this.knex.select('*')
            .from('clusters')
            .where({ commitment_group_id: commitmentID })
            .then(data => Array.isArray(data) ? data.map(data => clusterReducer(data)) : [])
    }

}

module.exports = ClustiteDatabase;