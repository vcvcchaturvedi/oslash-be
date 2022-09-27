import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import dotenv from "dotenv";
dotenv.config();
// Your web app's Firebase configuration
const firebaseConfigEncodedString:string = process.env.FB_CONFIG as string;
const bufferConfig:Buffer = Buffer.from(firebaseConfigEncodedString, 'base64');
const textConfig:string = bufferConfig.toString('ascii');
const firebaseConfig:object = JSON.parse(textConfig);

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database and get a reference to the service
const db = getDatabase(app);

export default db;
