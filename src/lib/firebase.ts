import { initializeApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getDatabase, Database } from "firebase/database";

const firebaseConfig = {
	apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "demo-key",
	authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "demo.firebaseapp.com",
	databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "https://demo.firebasedatabase.app",
	projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "demo-project",
	storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "demo.appspot.com",
	messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "000000000000",
	appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:000000000000:web:0000000000000000",
	measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

let app: any;
let auth: Auth | null = null;
let database: Database | null = null;

try {
	app = initializeApp(firebaseConfig);
	auth = getAuth(app);
	database = getDatabase(app);
} catch (error) {
	console.warn("Firebase initialization warning:", error);
}

export { auth, database };
