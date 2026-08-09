export default function ChatSidebar({
  currentUser,
  visibleUsers,
  search,
  onSearch,
  onSelectUser,
  onLogout,
  theme,
  onToggleTheme,
  onOpenProfile,
}) {
  const isDark = theme === "dark";
  const softPanelClasses = isDark
    ? "border-white/10 bg-slate-800/80 text-slate-300"
    : "border-slate-200 bg-slate-100 text-slate-600";
  const sidebarClasses = isDark
    ? "border-white/10 bg-slate-950/60"
    : "border-slate-200 bg-slate-50";

  return (
    <aside className={`border-b lg:border-b-0 lg:border-r ${sidebarClasses}`}>
      <div
        className={`flex items-center justify-between border-b px-6 py-5 ${sidebarClasses}`}
      >
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-violet-400">
            Pulse
          </p>
          <h1
            className={`mt-2 text-2xl font-semibold ${isDark ? "text-white" : "text-slate-900"}`}
          >
            Messages
          </h1>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <button
            onClick={onToggleTheme}
            className="rounded-full border border-violet-400/40 bg-violet-500/10 px-3 py-2 text-xs font-medium text-violet-200 transition hover:bg-violet-500/20"
          >
            {isDark ? "Light" : "Dark"}
          </button>
          <button
            onClick={onOpenProfile}
            className="rounded-full border border-violet-400/40 bg-violet-500/10 px-3 py-2 text-xs font-medium text-violet-200 transition hover:bg-violet-500/20"
          >
            Profile
          </button>
          <button
            onClick={onLogout}
            className="rounded-full border border-violet-400/40 bg-violet-500/10 px-3 py-2 text-sm font-medium text-violet-200 transition hover:bg-violet-500/20"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="px-3 py-4 sm:px-4">
        <div className={`rounded-2xl border px-3 py-3 ${softPanelClasses}`}>
          <div className="flex items-center gap-3">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600"
              style={{
                background: `linear-gradient(135deg, ${currentUser?.avatar_color || "#7c3aed"}, #8b5cf6)`,
              }}
            >
              <span className="text-sm font-semibold uppercase text-white">
                {currentUser?.username?.charAt(0) || "U"}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p
                className={`truncate text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}
              >
                {currentUser?.username}
              </p>
              <p
                className={`truncate text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}
              >
                {currentUser?.email || "Available now"}
              </p>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className={isDark ? "text-slate-400" : "text-slate-500"}>
              Profile
            </span>
            <span className="rounded-full bg-emerald-500/20 px-2 py-1 text-emerald-400">
              Online
            </span>
          </div>
        </div>
      </div>

      <div className="px-3 pb-4">
        <div
          className={`mb-3 rounded-2xl border px-3 py-2 ${softPanelClasses}`}
        >
          <input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search people..."
            className={`w-full bg-transparent text-sm outline-none ${isDark ? "text-white placeholder:text-slate-500" : "text-slate-700 placeholder:text-slate-400"}`}
          />
        </div>

        <div className="space-y-3">
          {visibleUsers.length === 0 && (
            <p
              className={`px-2 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}
            >
              No people match your search.
            </p>
          )}

          {visibleUsers.map((person) => (
            <button
              key={person.id}
              onClick={() => onSelectUser(person.id)}
              className={`flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left transition ${isDark ? "border-transparent bg-transparent hover:border-white/10 hover:bg-white/5" : "border-slate-200 bg-transparent hover:border-violet-200 hover:bg-violet-50"}`}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600">
                <span className="text-sm font-semibold uppercase text-white">
                  {person.username.charAt(0)}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className={`truncate text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}
                >
                  {person.username}
                </p>
                <p
                  className={`truncate text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}
                >
                  {person.first_name && person.last_name
                    ? `${person.first_name} ${person.last_name}`
                    : person.email || "Available now"}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
