export interface MongoUrlOptions {
  mongoHost?: string;
  replicaSetNodes?: number;
  dbName: string;
  replicaSetName?: string;
}

/**
 * Builds a MongoDB connection URL based on the environment configuration.
 *
 * @param options - Configuration options for building the MongoDB URL
 * @returns A formatted MongoDB connection string
 *
 * @example
 * // Local single-node (no replica set)
 * buildMongoUrl({ dbName: 'mydb' })
 * // => 'mongodb://localhost:27017/mydb'
 *
 * @example
 * // Remote single-node with replica set
 * buildMongoUrl({
 *   mongoHost: 'mongo-server',
 *   replicaSetNodes: 1,
 *   dbName: 'mydb',
 *   replicaSetName: 'rs0'
 * })
 * // => 'mongodb://mongo-server:27017/mydb?replicaSet=rs0'
 *
 * @example
 * // Multi-node replica set
 * buildMongoUrl({
 *   mongoHost: 'mongo-server',
 *   replicaSetNodes: 3,
 *   dbName: 'mydb',
 *   replicaSetName: 'rs0'
 * })
 * // => 'mongodb://mongo-server:27017,mongo-server-2:27017,mongo-server-3:27017/mydb?replicaSet=rs0'
 */
export function buildMongoUrl(options: MongoUrlOptions): string {
  const {
    mongoHost,
    replicaSetNodes = 1,
    dbName,
    replicaSetName = 'rs0',
  } = options;

  if (replicaSetNodes === 0) {
    return `mongodb://${mongoHost || 'localhost'}:27017/${dbName}`;
  }

  const hosts = [mongoHost];
  for (let i = 2; i <= replicaSetNodes; i++) {
    hosts.push(`${mongoHost}-${i}`);
  }

  const hostsString = hosts.map((h) => `${h}:27017`).join(',');
  return `mongodb://${hostsString}/${dbName}?replicaSet=${replicaSetName}`;
}
