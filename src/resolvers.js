module.exports = {
    Query: {
        allCommitmentGroups: (_, __, { dataSources }) => {
            console.log(dataSources)
            return dataSources.db.getCommitmentGroups()
        }
    }
}