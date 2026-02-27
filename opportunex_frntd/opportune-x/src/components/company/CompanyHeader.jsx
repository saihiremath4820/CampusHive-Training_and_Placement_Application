<div className="flex justify-between items-center px-8 py-4 border-b">
  
  {/* LEFT: Menu + Brand */}
  <div className="flex items-center gap-3">
    <button
      onClick={() => setIsSidebarOpen(true)}
      className="p-2 rounded hover:bg-gray-100"
    >
      ≡
    </button>

    <h1 className="text-2xl font-extrabold">
      OpportuneX
    </h1>
  </div>

  {/* RIGHT: Notifications + Logout */}
  <div className="flex items-center gap-6">
    
    {/* Notification Bell */}
    <div className="relative">
      <button
        onClick={() => {
          setShowNotifications(!showNotifications);
          markNotificationsAsSeen();
        }}
        className="relative p-2 rounded hover:bg-yellow-100"
      >
        <FiBell className="text-2xl text-yellow-500" />

        {totalNewNotifications > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs px-2 rounded-full">
            {totalNewNotifications}
          </span>
        )}
      </button>

      {showNotifications && (
        <div className="absolute right-0 mt-2 w-72 bg-white border rounded-lg shadow z-50">
          <div className="px-4 py-2 font-semibold border-b">
            Notifications
          </div>

          {notifications.every((n) => n.newCount === 0) ? (
            <p className="px-4 py-3 text-sm text-gray-500">
              No new applications
            </p>
          ) : (
            notifications.map(
              (n) =>
                n.newCount > 0 && (
                  <div
                    key={n.id}
                    className="px-4 py-2 text-sm border-b"
                  >
                    <strong>{n.title}</strong>: {n.newCount} new application(s)
                  </div>
                )
            )
          )}
        </div>
      )}
    </div>

    {/* Logout */}
    <button
      onClick={onLogout}
      className="flex items-center gap-2 text-red-600 font-semibold hover:text-red-700"
    >
      Logout
    </button>
  </div>
</div>
