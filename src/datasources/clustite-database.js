const { SQLDataSource } = require("datasource-sql");

const MINUTE = 60;

class ClustiteDatabase extends SQLDataSource {
    getCommitmentGroups() {
        return this.knex
            .select('*')
            .from("commitment_groups").then(data => {
                return Array.isArray(data) ? data.map(group => this.commitmentGroupReducer(group)) : []
            })
    }
    getIDOfMembersOfCommitment(commitmentGroupID) {
        return this.knex.select('user_id').from('user_commitment_ids').where({ commitment_group_id: commitmentGroupID })
    }
    getUsers({ user_id }) {
        console.log(user_id)
        return this.knex.select('*').from('users').whereIn('id', [user_id])
    }
    getCommitmentGroupMembers(commitmentGroupID) {
        console.log(commitmentGroupID)
        return this.getIDOfMembersOfCommitment(commitmentGroupID)
            .then(userIDs => this.getUsers(...userIDs))
            .then(data => {
                return Array.isArray(data) ? data.map(data => this.userReducer(data)) : []
            })
    }

    getClusters(commitmentID) {
        return this.knex.select('*')
            .from('clusters')
            .where({ commitment_group_id: commitmentID })
            .then(data => Array.isArray(data) ? data.map(data => this.clusterReducer(data)) : [])
    }

    clusterReducer({ id, commitment_group_id, cluster_name, cluster_score, reward }) {
        return {
            id,
            clusterName: cluster_name,
            clusterScore: cluster_score,
            reward
            // Stopped HERE!!
        }
    }

    userReducer({ id, username, matric_number, account_number, has_paid }) {
        return {
            id,
            name: username,
            matricNumber: matric_number,
            accountNumber: account_number,
            hasPaid: has_paid
        }
    }

    commitmentGroupReducer({ id, group_name, group_type, group_joining_code, commitment_name, commitment_description, stake }) {
        return {
            id,
            groupName: group_name,
            typeOfGroup: group_type,
            groupJoiningCode: group_joining_code,
            groupMembers: this.getCommitmentGroupMembers(id),
            clusters: this.getClusters(id),
            commitmentName: commitment_name,
            commitmentDescription: commitment_description,
            stake
        }
    }
}

module.exports = ClustiteDatabase;