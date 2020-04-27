const gql = require('apollo-server');

const typeDefs = gql`
    type User {
        id: ID!
        name: String!
        matricNumber: String!
        password: String!
        accountNumber: String!
        commitmentGroups:[CommitmentGroup]!
        hasPaid: Boolean!
        scores: [Score]!
    }

    type CommitmentGroup {
        id: ID!
        groupName: String!
        typeOfGroup: String!
        groupEntryCode: String
        groupMembers: [User]!
        clusters: [Cluster]!
        commitment: Commitment!
    }

    type Cluster {
        id:ID!
        clusterName: String!
        clusterMembers: [User!]!
        clusterHeadMember: User!
        clusterScore: Int!
        reward: Int!
    }

    type Commitment {
        id: ID!
        commitmentName: String!
        description: String!
        stake: Int!
    }

    type Score {
        id: ID!
        clusterID: ID!
        points: Int!
    }

`

module.exports = typeDefs