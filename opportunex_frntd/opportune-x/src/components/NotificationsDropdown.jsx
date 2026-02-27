import { useStudent } from "../context/StudentContext";

export default function NotificationsDropdown() {
  const { notifications } = useStudent();

  if (!notifications.length) {
    return <p className="text-gray-500 text-sm">No notifications</p>;
  }

  return (
    <div className="space-y-2">
      {notifications.map((n, i) => (
        <div key={i} className="border-b pb-1 text-sm">
          {n.message}
        </div>
      ))}
    </div>
  );
}
