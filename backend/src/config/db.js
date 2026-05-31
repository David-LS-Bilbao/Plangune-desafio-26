import mongoose from 'mongoose';

/**
 * Conecta a MongoDB con Mongoose.
 * Preparado para uso futuro; en el bootstrap no hay modelos ni features.
 * @param {string} uri - URI de conexión a MongoDB.
 */
export async function connectDB(uri) {
  try {
    await mongoose.connect(uri);
    console.log('MongoDB conectado.');
    return mongoose.connection;
  } catch (err) {
    console.error('Error conectando a MongoDB:', err.message);
    throw err;
  }
}

export default connectDB;
