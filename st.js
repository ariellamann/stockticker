const { MongoClient } = require('mongodb');
const fs = require('fs'); // File system module for reading files
const readline = require('readline'); // Readline module to read files line by line


// Replace <db_password> with your actual password
const uri = "mongodb+srv://ariellamann:abc@cluster0.uzio5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const filePath = 'companies-1.csv'; // Path to your CSV file

// Function to connect to MongoDB
async function run() {
    const client = new MongoClient(uri);

    try {
        // Connect to the MongoDB cluster
        await client.connect();
        const db = client.db("Stock");
        const collection = db.collection('PublicCompanies');
        console.log("Connected successfully to MongoDB");


        // Create a readline interface for reading the CSV file
        const rl = readline.createInterface({
            input: fs.createReadStream(filePath),
            output: process.stdout,
            terminal: false
        });


        rl.on('line', async (line) => {
            console.log("Processing line:", line);

            const [companyName, stockTicker, stockPrice] = line.split(',');
            console.log("companyName:", companyName);
            console.log("stockTicker:", stockTicker);
            console.log("stockPrice:", stockPrice);

            const price = parseFloat(stockPrice);

            const companyDoc = {
                name: companyName.trim(),
                stockTicker: stockTicker.trim(),
                latestPrice: price
            };

            try {
                collection.insertOne(companyDoc);
                console.log("Inserted: ", companyName);
            } catch (err) {
                console.error("Error inserting document:", err);
            }
        });

        rl.on('close', async () => {
            console.log('CSV processing complete.');
            await client.close(); // Close the connection after processing
            console.log('closed');
        });

        // You can now access databases and collections here
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
}

run().catch(console.dir);
