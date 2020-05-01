module.exports = {
    clusterReducer({ id, commitment_group_id, cluster_name, cluster_score, reward }, getClusterMembers) {
        let clusterMembers = () => getClusterMembers(id)
        return {
            id,
            commitmentGroupID: commitment_group_id,
            clusterName: cluster_name,
            clusterScore: cluster_score,
            clusterMembers,
            reward
        }
    },
    userReducer({ id, username, matric_number, account_number }, getJoinedCommitmentGroups, getScore) {
        let commitmentGroups = () => getJoinedCommitmentGroups(id)
        let scores = () => getScores(id)
        return {
            id,
            name: username,
            matricNumber: matric_number,
            accountNumber: account_number,
            commitmentGroups,
            scores
        }
    },
    commitmentGroupReducer(data, getCommitmentGroupMembers, getClusters) {
        const { id, owner_id, group_name, group_type, group_joining_code, commitment_name, commitment_description, stake } = data;
        // let groupMembers = () => () => getCommitmentGroupMembers(id)
        // let clusters = () => getClusters(id)
        return {
            id,
            ownerID: owner_id,
            groupName: group_name,
            typeOfGroup: group_type,
            groupJoiningCode: group_joining_code,
            groupMembers: function () {
                return getCommitmentGroupMembers(id)
            },
            clusters: function () {
                return getClusters(id)
            },
            commitmentName: commitment_name,
            commitmentDescription: commitment_description,
            stake
        }
    },
    scoreReducer({ id, user_id, cluster_id, points }) {
        return {
            id,
            clusterID: cluster_id,
            points
        }
    }
}