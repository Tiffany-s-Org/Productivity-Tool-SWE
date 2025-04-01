import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import OtpVerificationPage from './OtpVerificationPage';
import HomePage from './HomePage';
import ResetPasswordPage from './ResetPasswordPage';

// Configure axios defaults
axios.defaults.baseURL = 'http://localhost:5000/api';
axios.defaults.withCredentials = true;

interface User {
  id: string;
  username: string;
  email: string;
}

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [pendingVerification, setPendingVerification] = useState<{email: string, userId: string} | null>(null);

  // Check authentication status on load
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setCurrentUser(parsedUser);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const handleLogin = async (username: string, password: string) => {
    try {
      const response = await axios.post('/login', { username, password });
      const { success, verified, user, email, userId, message } = response.data;

      if (success && verified) {
        setCurrentUser(user);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(user));
      } else if (success && !verified) {
        // User needs to verify account with OTP
        setPendingVerification({ email, userId });
      }
      
      return { success, message };
    } catch (error: any) {
      console.error('Login error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const handleRegister = async (username: string, email: string, password: string) => {
    try {
      const response = await axios.post('/signup', { username, email, password });
      const { success, message, email: userEmail, userId } = response.data;
      
      if (success) {
        setPendingVerification({ email: userEmail, userId });
      }
      
      return { success, message };
    } catch (error: any) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const handleVerifyOtp = async (email: string, otp: string) => {
    try {
      const response = await axios.post('/verify-otp', { email, otp });
      const { success, message, user } = response.data;
      
      if (success) {
        setCurrentUser(user);
        setIsAuthenticated(true);
        setPendingVerification(null);
        localStorage.setItem('user', JSON.stringify(user));
      }
      
      return { success, message };
    } catch (error: any) {
      console.error('OTP verification error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Verification failed' 
      };
    }
  };

  const handleResendOtp = async (email: string) => {
    try {
      const response = await axios.post('/resend-otp', { email });
      return { 
        success: response.data.success, 
        message: response.data.message 
      };
    } catch (error: any) {
      console.error('Resend OTP error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to resend code' 
      };
    }
  };

  const handleResetPassword = async (email: string, newPassword: string, confirmPassword: string) => {
    try {
      const response = await axios.post('/reset-password', { 
        email, 
        newPassword, 
        confirmPassword 
      });
      
      return { 
        success: response.data.success, 
        message: response.data.message 
      };
    } catch (error: any) {
      console.error('Password reset error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Password reset failed' 
      };
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem('user');
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={
            isAuthenticated ? 
              <Navigate to="/home" /> : 
              <LoginPage onLogin={handleLogin} />
          } 
        />
        <Route 
          path="/register" 
          element={
            isAuthenticated ? 
              <Navigate to="/home" /> : 
              <RegisterPage onRegister={handleRegister} />
          } 
        />
        <Route 
          path="/verify-otp" 
          element={
            pendingVerification ? 
              <OtpVerificationPage 
                email={pendingVerification.email}
                onVerify={handleVerifyOtp}
                onResend={handleResendOtp}
              /> : 
              <Navigate to="/" />
          } 
        />
        <Route 
          path="/reset-password" 
          element={
            isAuthenticated ? 
              <Navigate to="/home" /> : 
              <ResetPasswordPage onResetPassword={handleResetPassword} />
          } 
        />
        <Route 
          path="/home" 
          element={
            isAuthenticated ? 
              <HomePage user={currentUser} onLogout={handleLogout} /> : 
              <Navigate to="/" />
          } 
        />
      </Routes>
    </Router>
  );
};

export default App;