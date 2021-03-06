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
        commitmentGroup: (_, { commitmentGroupID }, context) => {
            // return context.authScope().then(({ id }) => {
            //     if (!id) return { status: "unauthorized" }
            return context.db.getCommitmentGroup(commitmentGroupID)
            // })
        },
        joinedCommitmentGroups: (_, { userID }, context) => {
            return context.db.getJoinedCommitmentGroups(userID)
        },

        recommendedCommitmentGroups: (_, { userID }, context) => {
            return context.db.getRecommendedCommitmentGroups(userID)
        },

        commitmentGroupParticipants: (_, { commitmentGroupID }, context) => {
            return context.db.getCommitmentGroupMembers(commitmentGroupID)
        },

        clusterParticipants: (_, { clusterID }, context) => {
            return context.db.getClusterMembers(clusterID)
        },

        clusters: (_, { commitmentGroupID }, context) => {
            return context.db.getClusters(commitmentGroupID)
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
        createCluster: (_, details, context) => {
            return context.db.createCluster(details)
        },
        enterScore: (_, details, context) => {
            return context.db.enterScore(details)
        },
        calculateClusterScore: (_, details, context) => {
            return context.db.calculateClusterScore(details)
        },
        joinCommitmentGroup: (_, details, context) => {
            return context.db.joinCommitmentGroup(details)
        },
        joinCluster: (_, details, context) => {
            return context.db.joinCluster(details)
        },
        updateProfile: (_, details, context) => {
            return context.db.updateUserProfile(details)
        },
        giveReward: (_, details, context) => {
            return context.db.giveReward(details)
        },

    }
}