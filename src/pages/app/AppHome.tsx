/**
 * App Home Screen - ZIVO Minimal Design
 * Clean, fast-loading dark interface
 */
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import ZivoMobileNav from "@/components/app/ZivoMobileNav";

// Services configuration
const services = [
  { id: "rides", name: "Rides", path: "/rides" },
  { id: "eats", name: "Eats", path: "/eats" },
  { id: "move", name: "Move", path: "/move" },
  { id: "flights", name: "Flights", path: "/search?tab=flights" },
  { id: "hotels", name: "Hotels", path: "/search?tab=hotels" },
  { id: "cars", name: "Cars", path: "/rent-car" },
];

const AppHome = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const userName = user?.email?.split('@')[0] || "Traveler";

  return (
    <div className="bg-black text-white min-h-screen p-4 pb-24">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <p className="text-gray-400 text-sm">{getGreeting()}</p>
          <h1 className="text-xl font-semibold">{userName}</h1>
        </div>
        <div className="w-10 h-10 rounded-full bg-gray-800" />
      </div>

      {/* Search */}
      <button
        onClick={() => navigate("/search")}
        className="w-full p-4 rounded-xl bg-gray-800 mb-6 text-left text-gray-400 touch-manipulation active:bg-gray-700 transition-colors"
      >
        Where to?
      </button>

      {/* Services Grid */}
      <div className="grid grid-cols-2 gap-4">
        {services.map((item) => (
          <button
            key={item.id}
            onClick={() => navigate(item.path)}
            className="bg-gray-900 p-6 rounded-2xl text-left font-medium touch-manipulation active:bg-gray-800 transition-colors"
          >
            {item.name}
          </button>
        ))}
      </div>

      {/* Bottom Navigation */}
      <ZivoMobileNav />
    </div>
  );
};

export default AppHome;
