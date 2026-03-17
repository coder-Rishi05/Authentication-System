import "dotenv/config";
import app from "./src/app.js";
import { port } from "./src/constant/constant.js";
import { connectDb } from "./src/db/db.js";

connectDb()
  .then(() => {
    console.log("database connected successfully ");
    app.listen(port, () => {
      console.log("server listning on port : ", port);
    });
  })
  .catch((err) => {
    console.log("error connecting to database");
  });
