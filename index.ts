import { MongoClient } from "mongodb";
import "dotenv/config";

const uri = process.env.MONGODB_ATLAS_URI;
if (!uri) {
  throw new Error("MONGODB_ATLAS_URI environment variable is not set");
}
const client = new MongoClient(uri as string);

async function startServer() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );

    // ... rest of the server setup
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
}

startServer();
