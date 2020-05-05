const { ApolloServer } = require('apollo-server');
const typeDefs = require('./schemas/schema')
const resolvers = require('./resolvers')
const knex = require("knex");
const express = require('express')
// const redis = require('redis')
const redis = require("async-redis");

const ClustiteDatabase = require('./datasources/clustite-database')

const app = express();

const redisClient = redis.createClient(process.env.REDIS_URI)

// const asyncRedisClient = asyncRedis.decorate(client);

const knexInstance = knex({
    client: 'pg',
    connection: process.env.POSTGRES_URI
})

const db = new ClustiteDatabase(knexInstance, redisClient);

const corsOption = {
    origin: '*',
    credentials: true
}

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => ({
        authScope: async () => {
            const { authorization } = req.headers
            const value = await redisClient.get(authorization)
            return { id: value }
        },
        db
    })
})

server.applyMiddleware({ app, cors: corsOption })

server.listen().then(({ url }) => {
    console.log(`🚀 Server ready at ${url}`);
});