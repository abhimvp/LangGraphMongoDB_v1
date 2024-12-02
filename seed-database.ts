// import the necessary dependencies.
// import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import {
  ChatGoogleGenerativeAI,
  GoogleGenerativeAIEmbeddings,
} from "@langchain/google-genai";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { MongoClient } from "mongodb";
import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import { z } from "zod";
import "dotenv/config";

//  let's set up our MongoDB client and ChatGoogleGenerativeAI instance:
const client = new MongoClient(process.env.MONGODB_ATLAS_URI as string);

const llm = new ChatGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY as string,
  modelName: "gemini-1.5-pro",
  temperature: 0.7, // Adjust based on your needs - 0 means strict , 1 means very creative
});

// let's define our products schema using Zod:

const ProductSchema = z.object({
  product_name: z.string(),
  type: z.string(),
  price: z.number(),
  stock: z.number(),
  image_url: z.string().url(),
});

const ShopSchema = z.object({
  shop_name: z.string(),
  shop_owner: z.string(),
  shop_location: z.object({
    latitude: z.number(),
    longitude: z.number(),
    address: z.string(),
  }),
  shop_rating: z.number(),
  products: z.array(ProductSchema),
});

type Shop = z.infer<typeof ShopSchema>;

const parser = StructuredOutputParser.fromZodSchema(ShopSchema);

// We use Zod to ensure type safety and create a parser that will help us generate
// structured data from the AI's output.
// We can now use this schema to generate data that is both realistic and consistent.

// Next, let's implement the function to generate synthetic data:

async function generateSyntheticShopData(): Promise<Shop> {
  const prompt = `You are a helpful assistant that generates grocery store data. 
  Generate data for ONE fictional grocery store. 
  The data should include the following fields: 
    * shop_name
    * shop_owner
    * shop_location (with latitude, longitude, and address) 
    * shop_rating
    * products (an array of products with details like product_name, type, price, stock, and image_url).

  Ensure variety in the product data and realistic values.
  Provide at least 10 different products with diverse types (fruits, vegetables, dairy, etc.).

  ${parser.getFormatInstructions()}`;

  console.log("Generating synthetic shop data...");

  const response = await llm.invoke(prompt);
  return parser.parse(response.content as string);
}

// This function uses the ChatGoogleGenerativeAI instance along with some prompt engineering to generate synthetic products info data based on our schema.

// Now, let's create a function to generate a summary for each Shop and it's products
// This function generates a concise summary of the shop information, including its key details and a brief overview of its products.

async function createShopSummary(shop: Shop): Promise<string> {
  return new Promise((resolve) => {
    const location = `${shop.shop_location.address} (${shop.shop_location.latitude}, ${shop.shop_location.longitude})`;
    const productSummary = shop.products
      .map(
        (product) =>
          `${product.product_name} (${product.type}, $${product.price})`
      )
      .join(", ");

    const summary = `${shop.shop_name}, owned by ${shop.shop_owner}, located at ${location}. Rating: ${shop.shop_rating} stars. Products: ${productSummary}`;

    resolve(summary);
  });
}

// You can use this summary for various purposes, such as:
// Creating Embeddings: Generate embeddings for each shop to enable semantic search or similarity comparisons.
// Displaying Summaries: Show a quick overview of the shop to users in a search result or list view.
// Analyzing Shop Data: Use the summaries for data analysis or reporting purposes.

// let's implement the main function to seed the database:

async function seedDatabase(): Promise<void> {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );

    const db = client.db("grocery_database"); // Use an appropriate database name
    const collection = db.collection("shops");

    await collection.deleteMany({});

    const syntheticShopData = await generateSyntheticShopData();

    const shopWithSummary = {
      pageContent: await createShopSummary(syntheticShopData),
      metadata: { ...syntheticShopData },
    };

    await MongoDBAtlasVectorSearch.fromDocuments(
      [shopWithSummary],
      new GoogleGenerativeAIEmbeddings(),
      {
        collection,
        indexName: "vector_index",
        textKey: "embedding_text",
        embeddingKey: "embedding",
      }
    );

    console.log(
      "Successfully processed & saved shop data:",
      syntheticShopData.shop_name
    );
    console.log("Database seeding completed");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await client.close();
  }
}

seedDatabase().catch(console.error);

// Next, we need to set up a vector index for similarity search, which we'll use later in our AI agent.
