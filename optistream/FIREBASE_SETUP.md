# Firebase Authentication Setup Guide

This guide will help you set up Firebase authentication for the OptiStream application.

## Prerequisites

- A Google account
- Node.js and npm installed

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Enter a project name (e.g., "optistream")
4. Configure Google Analytics (optional)
5. Click "Create project"

## Step 2: Register Your Web App

1. In the Firebase Console, click the **web icon** (</>)
2. Register your app with a nickname (e.g., "OptiStream Web")
3. You don't need to set up Firebase Hosting for now
4. Click "Register app"
5. **Copy the firebaseConfig object** - you'll need these values next

## Step 3: Enable Authentication Methods

1. In Firebase Console, go to **Authentication** > **Sign-in method**
2. Click on **Email/Password**
3. Enable it and click **Save**

## Step 4: Configure Your Environment Variables

1. Open the `.env` file in the `optistream` folder
2. Replace the placeholder values with your actual Firebase config values:

```env
VITE_FIREBASE_API_KEY=your_actual_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

## Step 5: Install Dependencies

Run the following command in the `optistream` directory:

```bash
npm install
```

This will install:
- `firebase` - Firebase SDK
- `react-firebase-hooks` - React hooks for Firebase

## Step 6: Start the Development Server

```bash
npm run dev
```

## Features Implemented

### Login Page
- Email and password authentication
- Role selection (Public/Government Officer)
- Firebase error handling with user-friendly messages
- Auto-redirect to home after successful login

### Signup Page
- User registration with name, email, password
- Password strength indicator
- Password confirmation validation
- Terms of service agreement
- Role selection (Public/Government Officer)
- Firebase error handling
- Auto-redirect after successful signup

### User Store
- Centralized authentication state management
- Automatic Firebase auth state listener
- User ID (UID) storage
- User context available throughout the app

## Testing Authentication

1. **Sign Up**: Navigate to the signup page and create a new account
2. **Check Firebase Console**: Go to Authentication > Users to see registered users
3. **Log In**: Use the login page to sign in with your credentials
4. **Check Browser Console**: You'll see login/signup success messages with UID

## Troubleshooting

### "Firebase not initialized" error
- Make sure you've added your Firebase config to `.env`
- Restart the dev server after updating `.env`

### "Email already in use" error
- This email is already registered
- Try logging in instead or use a different email

### "Invalid email" error
- Check email format
- Make sure there are no spaces

### "Weak password" error
- Firebase requires passwords to be at least 6 characters
- Use stronger passwords (8+ characters with letters, numbers, symbols)

## Security Notes

⚠️ **Important**: 
- Never commit your `.env` file to version control
- Add `.env` to your `.gitignore` file
- The `.env.example` file is safe to commit (it has no real credentials)

## Optional: Save User Data to Database

The SignupPage has commented code for sending user data to a backend API:

```javascript
// Optional: Send user data to your backend/database
fetch('/api/user', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    uid: firebaseUid, 
    email: form.email, 
    name: form.name, 
    role: form.role 
  })
})
```

Uncomment and modify this code to integrate with your backend (AWS Lambda, MongoDB, etc.).

## File Structure

```
optistream/
├── src/
│   ├── components/
│   │   ├── LoginPage.jsx          # Login component with Firebase
│   │   └── SignupPage.jsx         # Signup component with Firebase
│   ├── config/
│   │   └── firebase.js            # Firebase configuration
│   ├── store/
│   │   └── userStore.js           # User authentication store
│   └── main.jsx                   # App entry with UserProvider
├── .env                           # Your Firebase credentials (not committed)
└── .env.example                   # Template for .env file
```

## Next Steps

- Implement password reset functionality
- Add profile page to display user information
- Integrate with backend API to store user profiles
- Add protected routes that require authentication
- Implement logout functionality

## Support

For Firebase documentation, visit:
- [Firebase Authentication Docs](https://firebase.google.com/docs/auth)
- [React Firebase Hooks](https://github.com/CSFrequency/react-firebase-hooks)
