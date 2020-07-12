const { gql } = require('apollo-server');

const typeDefs = gql`
    type User {
        id: ID!
        name: String!
        email: String!
        matricNumber: String!
        accountNumber: String!
        bankName: String!
        password: String!
        commitmentGroups:[CommitmentGroup]!
        scores: [Score]!
        cgpa:Float!
    }
    input UserInput {
        id: ID!
        name: String!
        email: String!
        matricNumber: String!
        accountNumber: String!
        bankName: String!
        password: String!
        commitmentGroups:[CommitmentGroupInput]!
        scores: [ScoreInput]!
        cgpa:Float!
    }

    type CommitmentGroup {
        id: ID!
        ownerID: ID!
        groupName: String!
        typeOfGroup: String!
        groupJoiningCode: String
        numberOfClusters:Int!
        groupMembers: [User]!
        clusters: [Cluster]!
        commitmentName: String!
        commitmentDescription: String!
        stake: Int!
        hasGivenReward: Boolean!

    }
    input CommitmentGroupInput {
        id: ID!
        ownerID: ID!
        groupName: String!
        typeOfGroup: String!
        groupJoiningCode: String
        numberOfClusters:Int!
        groupMembers: [UserInput]!
        clusters: [ClusterInput]!
        commitmentName: String!
        commitmentDescription: String!
        stake: Int!

    }

    type Cluster {
        id:ID!
        commitmentGroupID: ID!
        clusterName: String!
        clusterMembers: [User!]!
        clusterHeadMember: User
        clusterScore: Int!
        reward: Int!
    }
    input ClusterInput {
        id:ID!
        commitmentGroupID: ID!
        clusterName: String!
        clusterMembers: [UserInput!]!
        clusterHeadMember: UserInput!
        clusterScore: Int!
        reward: Int!
    }

    type Score {
        id: ID!
        commitmentGroupID: ID!
        clusterID: ID!
        points: Int!
    }
    input ScoreInput {
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
        commitmentGroup(commitmentGroupID: ID!): [CommitmentGroup]!
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
            accountNumber: String!
            bankName: String!
            password: String!
            cgpa:Float!
        ): Session!

        login(
            matricNumber: String! 
            password: String! 
        ): Session!

        createCluster(
            commitmentGroupID: ID!
            clusterName: String!
            # clusterMembers: [UserInput]!
            clusterHeadMemberID: ID!
            clusterScore: Int!
            reward: Int!
        ): ClusterRelatedResponse

        createCommitmentGroup(
            ownerID: ID!
            groupName: String!,
            typeOfGroup: String!,
            groupJoiningCode: String,
            numberOfClusters:Int!
            commitmentName: String!,
            commitmentDescription: String!,
            stake: Int!,
            hasGivenReward: Boolean
        ): CommitmentGroupRelatedResponse!

        updateProfile(
            userID: ID!
            name: String
            matricNumber: String!
            accountNumber: String
            password: String
            # cgpa:Int!

        ): AccountRelatedResponse!

        enterScore(
            userID: ID!
            commitmentGroupID: ID!
            clusterID: ID!
            points: Int!
        ): ScoreEnterResponse!

        calculateClusterScore(
            commitmentGroupID: ID!
            clusterID: ID!
            points: Int!
        ):ScoreEnterResponse!

        joinCommitmentGroup(
            userID: ID!
            commitmentGroupID: ID!
        ): JoinGroupResponse!

        joinCluster(
            userID: ID!
            clusterID: ID!
        ): JoinClusterResponse!

        giveReward(
            hasGivenReward: Boolean!
            reward: Int!
            clusterID: ID!
            commitmentGroupID: ID!
        ):RewardResponse!
    }

    type RewardResponse {
        success: Boolean!
        reward: Int!

    }
    type JoinGroupResponse {
        success: Boolean!
        addedID: ID
    }

    type JoinClusterResponse {
        success: Boolean!
        addedID: ID
    }

    type CommitmentGroupRelatedResponse {
        success: Boolean!
        message: String!
        commitmentGroup: CommitmentGroup
    }
    type ClusterRelatedResponse {
        success: Boolean!
        message: String!
        cluster: Cluster
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
        message: String!,
        token: String
        userID: ID,
    }

`

module.exports = typeDefs