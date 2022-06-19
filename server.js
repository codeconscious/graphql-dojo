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
const people = [
    { id: 1, civilianName: 'Scott Summers', superName: 'Cyclops', teamAffiliation: 1 },
    { id: 2, civilianName: 'Ororo Munroe', superName: 'Storm', teamAffiliation: 1 },
    { id: 3, civilianName: 'Steven Rogers', superName: 'Captain America', teamAffiliation: 2 },
    { id: 4, civilianName: 'Reed Richards', superName: 'Mister Fantastic', teamAffiliation: 3 }
]

const teams = [
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
        teamAffiliation: {
            type: TeamType,
            resolve: (person) => {
                return teams.find(t => t.id === person.teamAffiliation)
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
            resolve: (parent, args) => people.find(p => p.id === args.id)
        },
        people: {
            type: new GraphQLList(PersonType),
            description: 'A list of all people.',
            resolve: () => people
        },
        teams: {
            type: new GraphQLList(TeamType),
            description: 'A list of all teams.',
            resolve: () => teams
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
