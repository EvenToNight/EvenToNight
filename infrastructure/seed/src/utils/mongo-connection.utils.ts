export function buildMongoConnectionString(
    mongoHost: string,
    database: string
): string {
    return `mongodb://${mongoHost}:27017/${database}?directConnection=true`;
}
