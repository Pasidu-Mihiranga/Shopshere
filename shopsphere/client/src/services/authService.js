// src/services/authService.js
import firebase from 'firebase/app';
import 'firebase/auth';
import axios from 'axios';

// Initialize Firebase
const firebaseConfig = {
  // Your Firebase config
};

firebase.initializeApp(firebaseConfig);

export const socialLogin = async (provider) => {
  try {
    let socialProvider;
    
    switch (provider) {
      case 'google':
        socialProvider = new firebase.auth.GoogleAuthProvider();
        break;
      case 'facebook':
        socialProvider = new firebase.auth.FacebookAuthProvider();
        break;
      case 'apple':
        socialProvider = new firebase.auth.OAuthProvider('apple.com');
        break;
      default:
        throw new Error('Invalid provider');
    }
    
    const result = await firebase.auth().signInWithPopup(socialProvider);
    const user = result.user;
    
    // Get the token from Firebase
    const idToken = await user.getIdToken();
    
    // Send the token to our backend
    const response = await axios.post('/api/auth/social-login', {
      idToken,
      provider,
      email: user.email,
      name: user.displayName,
      photoURL: user.photoURL
    });
    
    // Save our JWT token
    localStorage.setItem('token', response.data.token);
    
    return response.data.user;
  } catch (error) {
    throw error;
  }
};