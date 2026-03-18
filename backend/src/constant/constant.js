export const port = 3000;

export const { MongoDb_ATLAS,jwt_secret,EMAIL_USER,REFRESH_TOKEN,CLIENT_SECRET,CLIENT_ID } = process.env;

if (!MongoDb_ATLAS) {
  throw new Error("Mongo uri not available");
}
