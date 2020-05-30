const { ApolloServer } = require('apollo-server');
const typeDefs = require('./schemas/schema')
const resolvers = require('./resolvers')
const knex = require("knex");
// const redis = require('redis')
const redis = require("async-redis");

const ClustiteDatabase = require('./datasources/clustite-database')


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
    cors: corsOption,
    typeDefs,
    resolvers,
    context: ({ req }) => ({
        authScope: async () => {
            const { authorization } = req.headers
            if (authorization.substring(0, 6) === "Bearer") {
                token = authorization.substring(7, authorization.length)
                const value = await redisClient.get(token)
                console.log(value)
                return { id: value }
            }
        },
        db
    })
})

server.listen({ port: process.env.PORT || 4000 }).then(({ url }) => {
    console.log(`🚀 Server ready at ${url}`);
});