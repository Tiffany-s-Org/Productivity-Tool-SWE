import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

type CalendarValue = Date | [Date, Date] | null;

interface CalendarPageProps {
  onLogout?: () => void;
}

const CalendarPage: React.FC<CalendarPageProps> = ({ onLogout }) => {
  const navigate = useNavigate();
  const [date, setDate] = useState<CalendarValue>(new Date());

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    navigate('/');
  };

  const handleDateChange = (
    value: CalendarValue,
    _event?: React.MouseEvent<HTMLButtonElement>
  ) => {
    setDate(value);
  };
  

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
      <h1 className="mb-4 text-3xl font-bold text-gray-700">📅 Calendar Page</h1>
      
      {/* Calendar component */}
      <Calendar onChange={handleDateChange} value={date} />
      
      {/* Show selected date */}
      <p className="mt-4 text-gray-600">
        Selected Date:{' '}
        {date instanceof Date
          ? date.toDateString()
          : Array.isArray(date)
          ? `${date[0].toDateString()} → ${date[1].toDateString()}`
          : 'None'}
      </p>

      {/* Logout button */}
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