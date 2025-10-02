## Project Setup Guide

This guide will walk you through the process of setting up the project for local development.

### Prerequisites

*   Node.js (v14 or later)
*   npm
*   A Firebase project

### 1. Clone the Repository

First, clone the repository to your local machine:

```sh
git clone https://github.com/Anmol-TheDev/Music_app
cd Music_app
```

### 2. Install Dependencies

Install the project dependencies using npm:

```sh
npm install
```

### 3. Set Up Environment Variables

This project uses environment variables to store sensitive information like API keys and configuration. You will need to create a `.env` file in the root of the project.

**a. Create the `.env` file:**

```sh
touch .env
```

**b. Add the following environment variables to the `.env` file:**

You will need to get these values from your Firebase project settings.

*   Go to your [Firebase console](https://console.firebase.google.com/).
*   Select your project.
*   Go to **Project settings** (the gear icon).
*   In the **General** tab, under **Your apps**, you will find the Firebase configuration for your web app.

```
VITE_apiKey="your-firebase-api-key"
VITE_authDomain="your-firebase-auth-domain"
VITE_projectId="your-firebase-project-id"
VITE_storageBucket="your-firebase-storage-bucket"
VITE_messagingSenderId="your-firebase-messaging-sender-id"
VITE_appId="your-firebase-app-id"
VITE_measurementId=""
```

**Note:** The `VITE_` prefix is important for Vite projects to expose the environment variables to the client-side code.

### 4. API Documentation

The API for this project is provided by `saavn.dev`. You can find the complete API documentation here:

[https://saavn.dev/docs](https://saavn.dev/docs)

The base URL for the API is `https://saavn.dev`.

### 5. Start the Development Server

Once you have set up the environment variables, you can start the development server:

```sh
npm run dev
```

The application will be available at `http://localhost:5173` (or another port if 5173 is in use).

### 6. Firebase Setup

This project uses Firebase for user authentication and database services.

**a. Authentication:**

*   In the Firebase console, go to the **Authentication** section.
*   Enable the **Email/Password** sign-in method.

**b. Firestore Database:**

*   In the Firebase console, go to the **Firestore Database** section.
*   Create a new database.
*   Start in **test mode** for development. You can change the security rules later for production.

By following these steps, you should have a local copy of the project up and running. If you encounter any issues, please refer to the project's `README.md` file or open an issue on GitHub.
