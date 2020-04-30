module.exports = {
    Query: {
        allCommitmentGroups: async (_, __, { dataSources }) => {
            return await dataSources.db.getAllCommitmentGroups()
        },

        joinedCommitmentGroups: (_, { participantId }, { dataSources }) => {
            return dataSources.db.getJoinedCommitmentGroups(participantId)
        },

        commitmentGroupParticipants: (_, { commitmentGroupId }, { dataSources }) => {
            return dataSources.db.getCommitmentGroupMembers(commitmentGroupId)
        },

        clusterParticipants: (_, { clusterId }, { dataSources }) => {
            return dataSources.db.getClusterMembers(clusterId)
        },

        clusters: (_, { commitmentGroupId }, { dataSources }) => {
            return dataSources.db.getClusters(commitmentGroupId)
        },
    },

    Mutation: {
        registerAccount: (_, details, { dataSources }) => {
            return dataSources.db.registerAccount(details)
        },
        login: (_, details, { dataSources }) => {
            return dataSources.db.logIntoAccount(details)
        },
        createCommitmentGroup: (_, details, { dataSources }) => {
            return dataSources.db.createCommitmentGroup(details)
        },
    }
}