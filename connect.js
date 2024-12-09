const { MongoClient } = require('mongodb');
const fs = require('fs'); 
const readline = require('readline'); 

const uri = "mongodb+srv://ariellamann:abc@cluster0.uzio5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const filePath = 'companies-1.csv'; 

async function run() {
    const client = new MongoClient(uri);

    try {
        // Connect to the MongoDB cluster
        await client.connect();
        const db = client.db("Stock");
        const collection = db.collection('PublicCompanies');
        console.log("Connected successfully to MongoDB");

        const rl = readline.createInterface({
            input: fs.createReadStream(filePath),
            output: process.stdout,
            terminal: false
        });

        const pendingInserts = []; 

        rl.on('line', async (line) => {
            console.log("Processing line:", line);

            const [companyName, stockTicker, stockPrice] = line.split(',');
            // console.log("companyName:", companyName);
            // console.log("stockTicker:", stockTicker);
            // console.log("stockPrice:", stockPrice);

            const price = parseFloat(stockPrice);

            const companyDoc = {
                name: companyName.trim(),
                stockTicker: stockTicker.trim(),
                latestPrice: isNaN(price) ? 0 : price, 
            };

            try {
                const insertPromise = collection.insertOne(companyDoc);
                pendingInserts.push(insertPromise); 
                await insertPromise;
                console.log("Inserted: ", companyName);
            } catch (err) {
                console.error("Error inserting document:", err);
            }
        });

        rl.on('close', async () => {
            await Promise.all(pendingInserts); 
            console.log('All insert operations complete.');
            await client.close(); 
            console.log('Connection closed.');
        });
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
}

run().catch(console.dir);
