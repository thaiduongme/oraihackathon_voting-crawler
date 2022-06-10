module.exports = {
  type: process.env.DB_CONNECTION || "mysql",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT ?? "3306", 10),
  username: process.env.DB_USERNAME || "root",
  password: process.env.DB_PASSWORD || "ThaiDuong@123",
  database: process.env.DB_DATABASE || "voting_crawler",
  entities: ["dist/**/*.entity{ .ts,.js}"],
  subscribers: ["dist/**/*.subscriber{ .ts,.js}"],
  synchronize: true,
  migrations: ["dist/database/migrations/*.js"],
  cli: {
    entitiesDir: "src",
    subscribersDir: "src",
    migrationsDir: "src/database/migrations",
  },
};
