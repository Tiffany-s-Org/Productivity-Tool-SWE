import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import axios from 'axios';

interface CalendarPageProps {
  onLogout?: () => void;
}

const CalendarPage: React.FC<CalendarPageProps> = ({ onLogout }) => {
  const navigate = useNavigate();
  const [date, setDate] = useState<Date | [Date, Date]>(new Date());

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    navigate('/');
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
      <h1 style={{ color: 'gray' }}>Calendar View</h1>
      <h1 className="mb-4 text-3xl font-bold text-gray-700">📅 Calendar Page</h1>

      {/* 🟥 Make all dates red using Tailwind */}
      <Calendar
        onChange={(value) => setDate(value as Date | [Date, Date])}
        value={date}
        //tileClassName={() => 'text-red-700'} // Applies red text to all dates
        /*tileClassName={({ date }) => {
          const day = date.getDay();
          if (day === 0 || day === 6) return 'text-blue-500'; // Weekends
          return 'text-gray-700'; // Weekdays (or blue if you want)
        }}
        */
        tileClassName={({ date }) => {
          const day = date.getDay();
          if (day === 0 || day === 6) return '!text-blue-500'; // Force Tailwind to override red
          return 'text-blue-500'; // Weekdays (or blue if you want)
        }}

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
