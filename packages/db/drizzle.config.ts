import { defineConfig } from 'drizzle-kit';
import { join } from 'path';

export default defineConfig({
  schema: './src/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  dbCredentials: {
    url: process.env['DB_PATH'] ?? join(process.cwd(), 'tristhana.db'),
  },
});
