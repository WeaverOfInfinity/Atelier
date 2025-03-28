const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');


const connectDB = async () => {
    const mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    console.log('MongoDB connected to memory server');
}

const closeDB = async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
}

const clearDB = async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        await collections[key].deleteMany({});
    }
    console.log('MongoDB database cleared');
}

module.exports = { connectDB, closeDB, clearDB };