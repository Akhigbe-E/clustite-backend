module.exports = {
    CommitmentGrouporString: {
        __resolveType(id, context, info) {
            return context.authScope().then(({ id }) => {
                if (id) {
                    return 'CommitmentGroups';
                }
                return 'AuthenticationFailed';
            })
        },
    },
    Query: {
        allCommitmentGroups: (_, __, context) => {
            return context.authScope().then(({ id }) => {
                if (!id) return { status: "unauthorized" }
                return { commitmentGroups: () => context.db.getAllCommitmentGroups() }
            })
        },

        joinedCommitmentGroups: (_, { participantId }, context) => {
            return context.db.getJoinedCommitmentGroups(participantId)
        },

        commitmentGroupParticipants: (_, { commitmentGroupId }, context) => {
            return context.db.getCommitmentGroupMembers(commitmentGroupId)
        },

        clusterParticipants: (_, { clusterId }, context) => {
            return context.db.getClusterMembers(clusterId)
        },

        clusters: (_, { commitmentGroupId }, context) => {
            return context.db.getClusters(commitmentGroupId)
        },
        getUser: (_, { userID }, context) => {
            return context.db.getUser(userID)
        },
    },

    Mutation: {
        registerAccount: async (_, details, context) => {
            return await context.db.registerAccount(details)
        },
        login: (_, details, context) => {
            return context.db.logIntoAccount(details)
        },
        createCommitmentGroup: (_, details, context) => {
            return context.db.createCommitmentGroup(details)
        },
        enterScore: (_, details, context) => {
            return context.db.enterScore(details)
        },
        joinCommitmentGroup: (_, details, context) => {
            return context.db.joinCommitmentGroup(details)
        },
        updateProfile: (_, details, context) => {
            return context.db.updateUserProfile(details)
        },
    }
}