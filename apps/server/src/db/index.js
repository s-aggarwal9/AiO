import mongoose from "mongoose";

const connectDB = async () => {
  const DB_NAME = "AiO";
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );
    console.log(
      `\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`
    );
  } catch (err) {
    console.log("MONGODB connection failed", err);
    process.exit(1);
  }
};

export default connectDB;
