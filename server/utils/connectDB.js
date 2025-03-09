import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      return;
    }
    
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log(`MongoDB conectado: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Erro na conexão com MongoDB: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;