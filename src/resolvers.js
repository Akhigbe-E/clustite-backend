module.exports = {
    Query: {
        allCommitmentGroups: (_, __, { dataSources }) => {
            return dataSources.db.getAllCommitmentGroups()
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
        registerAccount: async (_, details, { dataSources }) => {
            return await dataSources.db.registerAccount(details)
        },
        login: (_, details, { dataSources }) => {
            return dataSources.db.logIntoAccount(details)
        },
        createCommitmentGroup: (_, details, { dataSources }) => {
            return dataSources.db.createCommitmentGroup(details)
        },
        enterScore: (_, details, { dataSources }) => {
            return dataSources.db.enterScore(details)
        },
        joinCommitmentGroup: (_, details, { dataSources }) => {
            return dataSources.db.joinCommitmentGroup(details)
        },
        updateProfile: (_, details, { dataSources }) => {
            return dataSources.db.updateUserProfile(details)
        },
    }
}