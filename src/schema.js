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
    }

    type Commitment {
        id: ID!
        commitmentName: String!
        description: String!
        stake: Int!
    }

`