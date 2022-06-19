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

// These arrays represent data that would come from the database in a real application.
const personDb = [
    { id: 1, civilianName: 'Scott Summers', superName: 'Cyclops', teamId: 1 },
    { id: 2, civilianName: 'Ororo Munroe', superName: 'Storm', teamId: 1 },
    { id: 3, civilianName: 'Steven Rogers', superName: 'Captain America', teamId: 2 },
    { id: 4, civilianName: 'Reed Richards', superName: 'Mister Fantastic', teamId: 3 }
]

const teamDb = [
    { id: 1, name: 'X-Men' },
    { id: 2, name: 'Avengers' },
    { id: 3, name: 'Fantastic Four' }
]

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
app.listen(portNo, () => console.log(`The server is running on port ${portNo}.`));
