import { useStudent } from "../../context/StudentContext";

export default function Notifications() {
  const { notifications, setNotifications } = useStudent();

  const clearNotifications = () => {
    setNotifications([]);
    localStorage.setItem("notifications", JSON.stringify([]));
  };

  if (!notifications || notifications.length === 0) {
    return (
      <div className="text-sm text-gray-500">
        No notifications
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold text-sm">Notifications</h3>
        <button
          onClick={clearNotifications}
          className="text-xs text-red-500 hover:underline"
        >
          Clear
        </button>
      </div>

      {notifications.map((n, i) => (
        <div
          key={i}
          className="border-b pb-1 text-sm text-gray-700"
        >
          {n.message}
        </div>
      ))}
    </div>
  );
}
