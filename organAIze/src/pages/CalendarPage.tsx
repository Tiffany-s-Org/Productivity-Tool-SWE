/*
import { useNavigate } from "react-router-dom";

interface CalendarPageProps {
  onLogout?: () => void;
}

const CalendarPage: React.FC<CalendarPageProps> = ({ onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Call the onLogout prop if provided
    if (onLogout) {
      onLogout();
    }
    // Navigate to home page
    navigate("/");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
      <h1 className="mb-4 text-3xl font-bold text-gray-700">📅 Calendar Page</h1>
      <p className="text-gray-600">This is where your calendar will be displayed.</p>
      <button
        onClick={handleLogout}
        className="mt-4 rounded-lg bg-red-500 px-4 py-2 text-white transition hover:bg-red-600"
      >
        Logout
      </button>
    </div>
  );
};

export default CalendarPage;
*/
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

interface CalendarPageProps {
  onLogout?: () => void;
}

const CalendarPage: React.FC<CalendarPageProps> = ({ onLogout }) => {
  const navigate = useNavigate();

  // ✅ Allow single date or date range
  const [date, setDate] = useState<Date | [Date, Date]>(new Date());

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    navigate('/');
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
      <h1 style={{ color: 'red' }}>Calendar Page Loaded</h1>
      <h1 className="mb-4 text-3xl font-bold text-gray-700">📅 Calendar Page</h1>

      {/* ✅ Casting value fixes TS error */}
      <Calendar
        onChange={(value) => setDate(value as Date | [Date, Date])}
        value={date}
      />

      <p className="mt-4 text-gray-600">
        Selected Date:{' '}
        {date instanceof Date
          ? date.toDateString()
          : `${date[0].toDateString()} → ${date[1].toDateString()}`}
      </p>

      <button
        onClick={handleLogout}
        className="mt-4 rounded-lg bg-red-500 px-4 py-2 text-white transition hover:bg-red-600"
      >
        Logout
      </button>
    </div>
  ); 
  

};

export default CalendarPage;