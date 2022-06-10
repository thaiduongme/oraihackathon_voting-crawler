import { createConnection } from "typeorm";

export const connectDB = async () => {
  const connection = await createConnection();
};
