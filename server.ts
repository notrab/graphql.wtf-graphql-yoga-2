import {
  createServer,
  createPubSub,
  // GraphQLYogaError,
} from "@graphql-yoga/node";
import { useResponseCache } from "@envelop/response-cache";

const pubSub = createPubSub();

const server = createServer({
  plugins: [
    useResponseCache({
      includeExtensionMetadata: true,
    }),
  ],
  schema: {
    typeDefs: /* GraphQL */ `
      type Query {
        hello: String!
      }
      type Mutation {
        speak(word: String!): String!
      }
      type Subscription {
        speaking: String!
      }
    `,
    resolvers: {
      Query: {
        hello: () => "Hello world!",
      },
      Mutation: {
        speak: (_, { word }) => {
          // throw new GraphQLYogaError("Something went wrong!");

          pubSub.publish("speak", word);

          return word;
        },
      },
      Subscription: {
        speaking: {
          subscribe: () => pubSub.subscribe("speak"),
          resolve: (payload) => payload,
        },
      },
    },
  },
});

server.start();
