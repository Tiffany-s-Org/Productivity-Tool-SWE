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