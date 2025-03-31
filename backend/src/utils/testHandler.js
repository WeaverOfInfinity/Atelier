const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongoServer;

const connectDB = async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
}

const closeDB = async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();

    await mongoServer.stop() // stop the memory server to allow Jest to exit
}

const clearDB = async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        await collections[key].deleteMany({});
    }
}

module.exports = { connectDB, closeDB, clearDB };