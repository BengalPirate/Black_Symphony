// at the project root
import 'dotenv/config'; // optional if you want to load .env
export default ({ config }) => ({
  ...config,
  extra: {
    API_BASE_URL: process.env.API_BASE_URL
  },
});
