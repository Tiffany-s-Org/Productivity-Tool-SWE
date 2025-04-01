import React from 'react';

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
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header/Navigation */}
      <header className="bg-white shadow">
        <div className="mx-auto flex max-w-7xl items-center justify-between p-4">
          <h1 className="text-xl font-bold text-gray-800">My App</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Welcome, <span className="font-medium">{user?.username}</span>
            </span>
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
      <main className="mx-auto max-w-7xl p-6">
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-2xl font-semibold text-gray-800">
            Welcome to the Dashboard
          </h2>
          
          <div className="mb-8 rounded-lg bg-blue-50 p-4">
            <h3 className="mb-2 text-lg font-medium text-blue-800">
              Your Account Information
            </h3>
            <div className="space-y-2 text-gray-700">
              <p><span className="font-medium">Username:</span> {user?.username}</p>
              <p><span className="font-medium">Email:</span> {user?.email}</p>
              <p>
                <span className="font-medium">Account Status:</span>{' '}
                <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                  Verified
                </span>
              </p>
            </div>
          </div>
          
          <p className="text-gray-600">
            You're now logged in to your account. This is a protected page that only authenticated users can access.
          </p>
          
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
                  description: 'Keep your account secure by updating your password regularly',
                },
                {
                  title: 'Manage Settings',
                  description: 'Customize your experience and notification preferences',
                },
              ].map((item, index) => (
                <div key={index} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow">
                  <h4 className="mb-2 text-lg font-medium text-gray-800">{item.title}</h4>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;