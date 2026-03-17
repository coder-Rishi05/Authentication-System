export const port = 3000;

export const { MongoDb_ATLAS } = process.env;

if (!MongoDb_ATLAS) {
  throw new Error("Mongo uri not available");
}
