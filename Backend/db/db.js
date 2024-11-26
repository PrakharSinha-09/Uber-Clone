const mongoose= require('mongoose');

function connectToDb(){
    // Connect to MongoDB
    mongoose.connect(process.env.MONGODB_URI)
   .then(() => console.log('MongoDB connected successfully'))
}

module.exports = connectToDb;