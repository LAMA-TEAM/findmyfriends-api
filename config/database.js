import mongoose from "mongoose";

const connectDB = async () => {
    mongoose.set('strictQuery', false);

    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true
        });
    
        console.log(`✅ MongoDB Connected`);
    } catch (error) {
        console.error(`⛔ Error: ${error.message}`);
    }
}

export default connectDB;