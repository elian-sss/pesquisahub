import mongoose from "mongoose";

function getMongoUri(): string {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      "MONGODB_URI nao definida. Copie .env.local.example para .env.local.",
    );
  }
  return uri;
}

// Singleton cacheado em `global` para sobreviver ao hot reload do Next.js dev.
// Sem isto cada request abre uma nova conexao e estoura o pool em segundos.
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache =
  global.mongooseCache ?? (global.mongooseCache = { conn: null, promise: null });

export async function connectMongo(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(getMongoUri(), { bufferCommands: false });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
