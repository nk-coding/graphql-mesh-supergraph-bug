import { parse } from "graphql";
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { buildSubgraphSchema } from "@apollo/subgraph";

const typeDefs = parse(/* GraphQL */ `
    schema @link(import : ["@key"], url : "https://specs.apollo.dev/federation/v2.5") {
        query: Query
    }

    type Query {
        discounts(first: Int = 5): [Discount]
    }

    type Product @key(fields: "id") {
        id: ID!
        discounts: [Discount!]!
    }

    type Category @key(fields: "id") {
        id: ID!
        discounts: [Discount!]!
    }

    type Discount @key(fields: "id") {
        id: ID!
        discount: Int!
    }
`);

const resolvers = {
    Product: {
        __resolveReference(object) {
            return {
                ...object,
                discounts
            };
        },
    },
    Category: {
        __resolveReference(object) {
            return {
                ...object,
                discounts
            };
        },
    },
    Discount: {
        __resolveReference(object) {
            return {
                ...object,
                ...discounts.find((discount) => discount.id === object.id),
            };
        },
    },
    Query: {
        discounts(_, args) {
            return discounts.slice(0, args.first);
        },
    },
};

const server = new ApolloServer({
    schema: buildSubgraphSchema([
        {
            typeDefs,
            resolvers,
        },
    ]),
});

export const productsServer = () =>
    startStandaloneServer(server, { listen: { port: 9081 } }).then(
        ({ url }) => {
            if (!process.env.CI) {
                console.log(`🚀 Server ready at ${url}`);
            }
            return server;
        }
    );

const discounts = [
    { id: "1", discount: 10 },
    { id: "2", discount: 20 },
    { id: "3", discount: 30 },
];
