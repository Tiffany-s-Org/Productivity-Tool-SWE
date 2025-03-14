import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import CalendarPage from "./pages/CalendarPage";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = (username: string, password: string) => {
    // Here, you would typically verify credentials with a backend API
    if (username === "user" && password === "password") {
      setIsAuthenticated(true);
    } else {
      alert("Invalid username or password");
    }
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={!isAuthenticated ? <LoginPage onLogin={handleLogin} /> : <Navigate to="/calendar" />}
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
