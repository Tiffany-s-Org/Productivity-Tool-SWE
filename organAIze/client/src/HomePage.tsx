import React from 'react';
import { ContinuousCalendar } from './ContinousCalendar';

interface User {
  id: string;
  username: string;
  email: string;
}

interface HomePageProps {
  user: User | null;
  onLogout: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ user, onLogout }) => {
  const handleDateClick = (day: number, month: number, year: number) => {
    console.log(`Selected date: ${day}/${month + 1}/${year}`);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header/Navigation */}
      <header className="bg-white shadow px-6 py-6 relative">

          <img
            src="/assets/organaize logo.png" 
            alt="organAIze logo"
            className="absolute left-8 top-1/2 -translate-y-1/2 h-8 w-auto object-contain"
          />

          <div className="mx-auto max-w-7xl flex items-center justify-between px-6 py-4">

          <div className="absolute right-8 top-1/2 -translate-y-1/2 flex items-center gap-4">

          
            <button
              onClick={onLogout}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white transition hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-screen-xl p-6">
       
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Left card: Greeting */}
          <div className="rounded-2xl bg-white p-6 shadow-xl flex items-center hover-card hover:shadow-2xl transition">
            <h2 className="text-4xl pl-3 font-heading text-gray-800">
              
              <span className="font-medium">Welcome back,</span>
               
              <span className="block mt-4 font-bold">
                {user?.username}!{' '}
                <span className="hand-wave inline-block" role="img" aria-label="waving hand">
                  👋
                </span>
              </span>
            </h2>
          </div>

          {/* Right card: Account Info */}
          <div className="rounded-2xl bg-blue-50 p-6 shadow-xl hover:shadow-2xl transition">
            <h3 className="mb-4 text-lg font-bold text-blue-800">
              Your Account Information
            </h3>
            <div className="space-y-2 text-gray-700">
              <p>
                <span className="font-medium">Username:</span> {user?.username}
              </p>
              <p>
                <span className="font-medium">Email:</span> {user?.email}
              </p>
              <p>
                <span className="font-medium">Account Status:</span>{' '}
                <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                  Verified
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Second row: Calendar */}
        <div className="mt-8 rounded-2xl bg-white p-6 shadow-xl hover:shadow-2xl transition">
          <h3 className="mb-4 text-2xl pl-2 font-bold text-gray-800">Calendar</h3>
          <div className="h-screen max-h-[750px] flex justify-center">
            <div className="w-fit">
              <ContinuousCalendar onClick={handleDateClick} />
            </div>
          </div>
        </div>

        {/* Actions Grid (unchanged) */}
        <div className="mt-8">
          <h3 className="mb-4 text-xl font-medium text-gray-800">
            What you can do:
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              {
                title: 'Edit Profile',
                description: 'Update your personal information and preferences',
              },
              {
                title: 'Change Password',
                description:
                  'Keep your account secure by updating your password regularly',
              },
              {
                title: 'Manage Settings',
                description:
                  'Customize your experience and notification preferences',
              },
            ].map((item, index) => (
              <div
                key={index}
                className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow"
              >
                <h4 className="mb-2 text-lg font-medium text-gray-800">
                  {item.title}
                </h4>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;