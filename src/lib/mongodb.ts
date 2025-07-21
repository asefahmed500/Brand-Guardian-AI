import mongoose, { Model } from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env'
  );
}

// In development mode, use a global variable so that the value
// is preserved across module reloads caused by HMR (Hot Module Replacement).
// In production mode, it's best to not use a global variable.
let cached: {
  conn: any;
  promise: any;
  models: { [key: string]: Model<any> };
} = (global as any)._mongoose || { conn: null, promise: null, models: {} };

async function connectDB() {
  if (cached.conn) {
    return cached;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      return mongooseInstance;
    });
  }

  try {
    const mongooseInstance = await cached.promise;
    cached.conn = mongooseInstance;
    // Store models in the cached object
    Object.assign(cached.models, mongooseInstance.models);
    return cached;
  } catch (e) {
    cached.promise = null;
    throw e;
  }
}

// Helper to get a model, ensures connection is established
export async function getModel<T>(name: string, schema: mongoose.Schema<T>): Promise<Model<T>> {
  const { conn, models } = await connectDB();
  if (models[name]) {
    return models[name] as Model<T>;
  }
  const model = conn.model<T>(name, schema);
  models[name] = model;
  return model;
}

export default connectDB;
