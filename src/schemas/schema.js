const { gql } = require('apollo-server');

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
        groupJoiningCode: String
        groupMembers: [User]!
        clusters: [Cluster]!
        commitmentName: String!
        commitmentDescription: String!
        stake: Int!

    }

    type Cluster {
        id:ID!
        commitmentGroupID: ID!
        clusterName: String!
        clusterMembers: [User!]!
        clusterHeadMember: User!
        clusterScore: Int!
        reward: Int!
    }

    type Score {
        id: ID!
        clusterID: ID!
        points: Int!
    }

    type Query {
        allCommitmentGroups: [CommitmentGroup]!
        joinedCommitmentGroups(participantId: ID): [CommitmentGroup]!
        commitmentGroupParticipants(commitmentGroupId: ID!): [User]!
        clusterParticipants(clusterId: ID!): [User]
        clusters(commitmentGroupId: ID!): [Cluster]!
    }

    type Mutation {
        registerAccount(
            name: String! 
            matricNumber: String! 
            password: String! 
            accountNumber: String!
        ): AccountRelatedResponse

        login(
            matricNumber: String! 
            password: String! 
        ): String!

        createCommitmentGroup(
            groupName: String!,
            typeOfGroup: String!,
            groupJoiningCode: String,
            commitmentName: String!,
            commitmentDescription: String!,
            stake: Int!
        ): CommitmentGroupRelatedResponse!

        updateProfile(
            accountId: ID!
            name: String
            accountNumber: String
            password: String
        ): AccountRelatedResponse!

        enterScore(
            clusterID: ID!
            score: Int!
        ): ScoreEnterResponse!

        joinCommitmentGroup(
            joiningCode: String
        ): CommitmentGroupRelatedResponse
    }

    type CommitmentGroupRelatedResponse {
        success: Boolean!
        message: String!
        commitmentGroup: CommitmentGroup
    }

    type AccountRelatedResponse {
        success: Boolean!
        message: String!
        user: User
    }

    type ScoreEnterResponse {
        success: Boolean!
        message: String!
        score: Score
    }

`

module.exports = typeDefs