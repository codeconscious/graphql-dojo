const express = require('express')
const expressGraphQL = require('express-graphql').graphqlHTTP
const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLInt,
    GraphQLNonNull
} = require('graphql')
const app = express()

const { personDb, teamDb } = require('./data');

const PersonType = new GraphQLObjectType({
    name: 'Person',
    description: 'Represents a single individual who is optionally affiliated with a team.',
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLInt) },
        civilianName: { type: GraphQLString },
        superName: { type: GraphQLNonNull(GraphQLString) },
        team: {
            type: TeamType,
            resolve: (person) => {
                return teamDb.find(t => t.id === person.teamId)
            }
        }
    })
})

const TeamType = new GraphQLObjectType({
    name: 'Team',
    description: 'Represents a team (hero or otherwise) comprised of individuals.',
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLInt) },
        name: { type: GraphQLNonNull(GraphQLString) },
    })
})

const RootQueryType = new GraphQLObjectType({
    name: 'Query',
    description: 'Root Query',
    fields: () => ({
        person: {
            type: PersonType,
            description: 'A single person.',
            args: {
                id: { type: GraphQLInt }
            },
            resolve: (parent, args) => personDb.find(p => p.id === args.id)
        },
        people: {
            type: new GraphQLList(PersonType),
            description: 'A list of all people.',
            resolve: () => personDb
        },
        teams: {
            type: new GraphQLList(TeamType),
            description: 'A list of all teams.',
            resolve: () => teamDb
        }
    })
})

const schema = new GraphQLSchema({
    query: RootQueryType,
})

app.use('/graphql', expressGraphQL({
    schema: schema,
    graphiql: true
}))

const portNo = 5000;
app.listen(portNo, () => console.log(`The server is running at http://localhost:${portNo}/graphql.`));
