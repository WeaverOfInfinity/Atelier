import { app } from './app.js'; // Import the app instance
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables

const PORT = process.env.PORT || 5000; // Default to port 3000 if not specified in .env

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
});