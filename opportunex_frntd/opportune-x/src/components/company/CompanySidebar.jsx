export default function CompanySidebar({ active, setActive, closeSidebar }) {
  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white border-r p-4 z-20">
      <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
        🎓 Company
      </h2>

      <nav className="space-y-2">
        <SidebarItem
          label="Opportunities"
          active={active === "opportunities"}
          onClick={() => {
            setActive("opportunities");
            closeSidebar();
          }}
        />
        <SidebarItem
          label="Create Opportunity"
          active={active === "create"}
          onClick={() => {
            setActive("create");
            closeSidebar();
          }}
        />
        <SidebarItem
          label="Profile"
          active={active === "profile"}
          onClick={() => {
            setActive("profile");
            closeSidebar();
          }}
        />
      </nav>
    </div>
  );
}

function SidebarItem({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-2 rounded ${
        active
          ? "bg-purple-600 text-white"
          : "text-gray-700 hover:bg-gray-100"
      }`}
    >
      {label}
    </button>
  );
}