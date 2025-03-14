import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import CalendarPage from "./pages/CalendarPage";
import RegisterPage from "./pages/RegisterPage";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = (username: string, password: string) => {
    // Here, you would typically verify credentials with a backend API
    if (username === "user" && password === "password") {
      setIsAuthenticated(true);
    } else {
      //for now, just let authenticated be true
      setIsAuthenticated(true);
    }
  };

  const handleRegister = (username: string, email: string, password: string) => {
    // Here you would typically send registration data to your backend
    console.log("Registering:", username, email, password);
    
    // For now, automatically authenticate after registration
    setIsAuthenticated(true);
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={!isAuthenticated ? <LoginPage onLogin={handleLogin} /> : <Navigate to="/calendar" />}
        />
        <Route
          path="/register"
          element={!isAuthenticated ? <RegisterPage onRegister={handleRegister} /> : <Navigate to="/calendar" />}
        />
        <Route
          path="/calendar"
          element={isAuthenticated ? <CalendarPage /> : <Navigate to="/" />}
        />
      </Routes>
    </Router>
  );
}

export default App;