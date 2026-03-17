export const port = 3000;

export const { MongoDb_ATLAS,jwt_secret } = process.env;

if (!MongoDb_ATLAS) {
  throw new Error("Mongo uri not available");
}
