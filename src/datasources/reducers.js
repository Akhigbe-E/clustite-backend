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
    userReducer({ id, username, matric_number, account_number, has_paid }, getJoinedCommitmentGroups) {
        let commitmentGroups = () => getJoinedCommitmentGroups(id)
        return {
            id,
            name: username,
            matricNumber: matric_number,
            accountNumber: account_number,
            commitmentGroups,
            hasPaid: has_paid
        }
    },
    commitmentGroupReducer({ id, owner_id, group_name, group_type, group_joining_code, commitment_name, commitment_description, stake }, getCommitmentGroupMembers, getClusters) {
        let groupMembers = () => getCommitmentGroupMembers(id)
        let clusters = () => getClusters(id)
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
}