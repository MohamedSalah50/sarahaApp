import mongoose from "mongoose";

export const connectDb = async () => {
  try {
    const uri = process.env.DB_URI;
    const result = await mongoose.connect(uri);
    console.log("connected to db 🚀");
    console.log(result.models);
  } catch (error) {
    console.log("fail to connect to db");
    console.log(error);
  }
};

export default connectDb;
