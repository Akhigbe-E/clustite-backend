const { gql } = require('apollo-server');

const typeDefs = gql`
    type User {
        id: ID!
        name: String!
        email: String!
        matricNumber: String!
        accountNumber: Int!
        bankName: String!
        password: String!
        commitmentGroups:[CommitmentGroup]!
        scores: [Score]!
    }

    type CommitmentGroup {
        id: ID!
        ownerID: ID!
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
        commitmentGroupID: ID!
        clusterID: ID!
        points: Int!
    }

    type AuthenticationFailed{
        status: String
    }
    type CommitmentGroups{
        commitmentGroups: [CommitmentGroup]!
    }

    union CommitmentGrouporString = CommitmentGroups | AuthenticationFailed

    type Query {
        allCommitmentGroups: CommitmentGrouporString
        joinedCommitmentGroups(userID: ID): [CommitmentGroup]!
        recommendedCommitmentGroups(userID: ID): [CommitmentGroup]!
        commitmentGroupParticipants(commitmentGroupID: ID!): [User]!
        clusterParticipants(clusterID: ID!): [User]
        clusters(commitmentGroupID: ID!): [Cluster]!
        getUser(userID: ID!): User
    }

    type Mutation {
        registerAccount(
            name: String!
            email: String!
            matricNumber: String!
            accountNumber: Int!
            bankName: String!
            password: String!
        ): AccountRelatedResponse

        login(
            matricNumber: String! 
            password: String! 
        ): Session!


        createCommitmentGroup(
            ownerID: ID!
            groupName: String!,
            typeOfGroup: String!,
            groupJoiningCode: String,
            commitmentName: String!,
            commitmentDescription: String!,
            stake: Int!
        ): CommitmentGroupRelatedResponse!

        updateProfile(
            userID: ID!
            name: String
            matricNumber: String!
            accountNumber: String
            password: String
        ): AccountRelatedResponse!

        enterScore(
            userID: ID!
            commitmentGroupID: ID!
            clusterID: ID!
            points: Int!
        ): ScoreEnterResponse!

        joinCommitmentGroup(
            userID: ID!
            commitmentGroupID: ID!
        ): JoinGroupResponse!
    }

    type JoinGroupResponse {
        success: Boolean!
        addedID: ID
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

    type Session {
        success: Boolean!,
        userID: ID,
        token: String
    }

`

module.exports = typeDefs