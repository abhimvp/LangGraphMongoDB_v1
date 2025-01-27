# LangGraphMongoDB_v1

working on a project to beat quick commerce apps and local shop owners float and make any items deliverable to users by the local delivery guys

- Building AI into web application - will be using langGraph js & mongodb
- we will be having a smart assistant that not only understands what you're saying but also remembers your previous conversations and can even utilize a number of tools to look up additional information , process data and more.
- using langGraph to handle complex stuff , if we want AI agent to make decisions or repeat tasks , langGraph can take care of it using loops and branching features and has great memory , langGraph JS saves the state of your app after each step and it plays nicely with humans you can easily add human input into your AI workflows to monitor or alter the agents approach. we will use langGraph.js to maintain context and handle complex interactions and can integrate with langChain to work with other ai tools and libraries
- By Integration LangGraph js and mongoDB , we can create AI agents that not only process and generate language but they also store and retrive information efficiently . this combination is particularly powerful for building applications that require context aware conversations and data driven decision making - perfect for building apps that need to have meaningful conversations and make smart decisions based on data.
- we build an AI agent that can assist customer shopping related queries using a database of shopping products information.
  - our agent will be able to start new conversations and continue existing ones , lookup products info using mongodb atlas vector search and persist conversation state in mongodb using langGraph checkpoints.

## Prerequisites - setting up the project

Should have the following:

- node.js and npm installed
- free mongodb atlas account - created one
- OPEN AI API Key or GEMINI API KEY - for embeddings
- ANTHROPIC API KEY - for conversations ( see if i can use GEMINI)

---

- Initialize a new node.js project with typescript and then install the required dependencies

  - `npm init -y` -> This command creates a package.json file in your current directory with default values. `-y`: This flag tells npm to skip the questions and use the default values for all the fields in package.json.
  - Install dev dependencies - `npm i -D typescript ts-node @types/express @types/node`
  - Added a new file `.gitignore` to not upload unneccesary files to our github repo
  - `npx tsc --init` -> to initialize typescript into our project that will create a `tsconfig.json`.`tsc`: This is the TypeScript compiler. It's responsible for taking your TypeScript code (.ts files) and converting it into JavaScript (.js files) that can run in browsers or Node.js.
  - Install the libraries we will be dealing with `npm i langchain @langchain/langgraph @langchain/mongodb @langchain/langgraph-checkpoint-mongodb @langchain/anthropic dotenv express mongodb zod`
  - create a .env file in the root of your project and add your GEMINI AI API keys as well as your MongoDB Atlas connection string : `GEMINI_API_KEY=your-gemini-api-key` `MONGODB_ATLAS_URI=your-mongodb-atlas-connection-string`

- Configuring Mongo DB
  - Before we do anything, we need to create some synthetic data to work with. We'll use this data to seed our MongoDB database.
  - We'll use MongoDB Atlas as our database service. If you haven't already, create a cluster in MongoDB Atlas and obtain your connection string.
  - Create an `index.ts` file in the root of your project. We'll establish a connection to MongoDB using the MongoDB driver.
  - Start the server by running `npx ts-node index.ts` in your terminal. If you see the message "Pinged your deployment. You successfully connected to MongoDB!" you're good to go. - Got it `:)`
  - `Seeding the database` - To populate your database with synthetic products data, let's create a seed-database.ts script. This script generates realistic products info records using GEMINI model and stores them in MongoDB along with their vector embeddings. - Installed google gen ai libraries to work with Gemini API keys - `npm install @langchain/google-genai @langchain/core` - We're using `LangChain` for AI-related functionality, `MongoDB` for database operations, and `Zod` for schema validation. - `npx ts-node seed-database.ts` - To seed the database.
  ```
    $ npx ts-node seed-database.ts
    Pinged your deployment. You successfully connected to MongoDB!
    Generating synthetic shop data...
    Successfully processed & saved shop data: Fresh Mart Grocers
    Database seeding completed.
  ```
- This script creates a collection of shop info records(only 1 for now) in `grocery_database`.
  `Go to your MongoDB Atlas dashboard and check out the data that has been generated. It's really amazing! You'll find the same structure as the schema we defined earlier along with the summary and vector embeddings for the summary.`
  ![alt text](Images/image.png)
  ![alt text](Images/image-1.png)

<!-- - we need to set up a vector index for similarity search, which we'll use later in our AI agent. -->
