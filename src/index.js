const { ApolloServer } = require('apollo-server');
const typeDefs = require('./schemas/schema')
const resolvers = require('./resolvers')
const ClustiteDatabase = require('./datasources/clustite-database')
const knex = require("knex");



console.log(process.env.POSTGRES_HOST)
const knexInstance = knex({
    client: 'pg',
    connection: process.env.POSTGRES_URI
})

const db = new ClustiteDatabase(knexInstance);


const server = new ApolloServer({
    typeDefs,
    resolvers,
    dataSources: () => ({ db })
})


server.listen().then(({ url }) => {
    console.log(`🚀 Server ready at ${url}`);
});