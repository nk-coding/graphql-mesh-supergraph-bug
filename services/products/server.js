import { parse } from "graphql";
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { buildSubgraphSchema } from "@apollo/subgraph";

const typeDefs = parse(/* GraphQL */ `
    schema @link(import : ["@key"], url : "https://specs.apollo.dev/federation/v2.5") {
        query: Query
    }

    type Query {
        products(first: Int = 5): [Product]
    }

    type Product @key(fields: "id") {
        id: ID!
        name: String!
        categories: [Category!]!
    }

    type Category @key(fields: "id") {
        id: ID!
        name: String!
    }
`);

const resolvers = {
    Product: {
        __resolveReference(object) {
            return {
                ...object,
                ...products.find((product) => product.id === object.id),
            };
        },
    },
    Category: {
        __resolveReference(object) {
            return {
                ...object,
                ...categories.find((category) => category.id === object.id),
            };
        },
    },
    Query: {
        products(_, args) {
            return products.slice(0, args.first);
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
    startStandaloneServer(server, { listen: { port: 9080 } }).then(
        ({ url }) => {
            if (!process.env.CI) {
                console.log(`🚀 Server ready at ${url}`);
            }
            return server;
        }
    );

const categories = [
    {
        id: "c_1",
        name: "Furniture",
    },
    {
        id: "c_2",
        name: "Kitchen",
    },
];

const products = [
    {
        id: "p_1",
        name: "Table",
        categories: [categories[0]],
    },
    {
        id: "p_2",
        name: "Chair",
        categories: [categories[0]],
    },
    {
        id: "p_3",
        name: "Fork",
        categories: [categories[1]],
    },
    {
        id: "p_4",
        name: "Knife",
        categories: [categories[1]],
    },
    {
        id: "p_5",
        name: "Spoon",
        categories: [categories[1]],
    },
];
