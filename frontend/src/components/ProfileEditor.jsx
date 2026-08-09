export default function ProfileEditor({
  open,
  form,
  setForm,
  onClose,
  onSave,
  saving,
  theme,
}) {
  if (!open) return null;

  const isDark = theme === "dark";
  const palette = [
    "#7c3aed",
    "#8b5cf6",
    "#ec4899",
    "#f97316",
    "#22c55e",
    "#0ea5e9",
    "#facc15",
    "#ef4444",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <div
        className={`w-full max-w-2xl rounded-[28px] border p-5 shadow-2xl ${
          isDark
            ? "border-white/10 bg-slate-900 text-slate-100"
            : "border-slate-200 bg-white text-slate-900"
        }`}
      >
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-violet-400">
              Profile
            </p>
            <h2 className="mt-2 text-2xl font-semibold">Edit your profile</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full border border-white/10 px-3 py-1.5 text-sm text-slate-300 transition hover:bg-white/5"
          >
            Close
          </button>
        </div>

        <div className="grid gap-5 md:grid-cols-[180px_minmax(0,1fr)]">
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-violet-400/20 bg-violet-500/5 p-4 text-center">
            <div
              className="flex h-24 w-24 items-center justify-center rounded-3xl text-2xl font-bold text-white shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${form.avatar_color || "#7c3aed"}, #8b5cf6)`,
              }}
            >
              {(form.username || "U").charAt(0).toUpperCase()}
            </div>
            <div className="w-full text-xs text-slate-400">Avatar color</div>
            <div className="flex flex-wrap justify-center gap-2">
              {palette.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setForm({ ...form, avatar_color: color })}
                  className={`h-8 w-8 rounded-full border-2 transition ${
                    form.avatar_color === color
                      ? "scale-110 border-white"
                      : "border-transparent"
                  }`}
                  style={{ background: color }}
                  aria-label={`Select avatar color ${color}`}
                />
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                value={form.first_name}
                onChange={(e) =>
                  setForm({ ...form, first_name: e.target.value })
                }
                placeholder="First name"
                className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:border-violet-400 ${
                  isDark
                    ? "border-white/10 bg-slate-800 text-white placeholder:text-slate-500"
                    : "border-slate-200 bg-slate-50 text-slate-800 placeholder:text-slate-400"
                }`}
              />
              <input
                value={form.last_name}
                onChange={(e) =>
                  setForm({ ...form, last_name: e.target.value })
                }
                placeholder="Last name"
                className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:border-violet-400 ${
                  isDark
                    ? "border-white/10 bg-slate-800 text-white placeholder:text-slate-500"
                    : "border-slate-200 bg-slate-50 text-slate-800 placeholder:text-slate-400"
                }`}
              />
            </div>

            <input
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              placeholder="Username"
              className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:border-violet-400 ${
                isDark
                  ? "border-white/10 bg-slate-800 text-white placeholder:text-slate-500"
                  : "border-slate-200 bg-slate-50 text-slate-800 placeholder:text-slate-400"
              }`}
            />

            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="Email address"
              className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:border-violet-400 ${
                isDark
                  ? "border-white/10 bg-slate-800 text-white placeholder:text-slate-500"
                  : "border-slate-200 bg-slate-50 text-slate-800 placeholder:text-slate-400"
              }`}
            />

            <textarea
              rows={3}
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              placeholder="Tell people a little about yourself..."
              className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:border-violet-400 ${
                isDark
                  ? "border-white/10 bg-slate-800 text-white placeholder:text-slate-500"
                  : "border-slate-200 bg-slate-50 text-slate-800 placeholder:text-slate-400"
              }`}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="New password"
                className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:border-violet-400 ${
                  isDark
                    ? "border-white/10 bg-slate-800 text-white placeholder:text-slate-500"
                    : "border-slate-200 bg-slate-50 text-slate-800 placeholder:text-slate-400"
                }`}
              />
              <input
                type="password"
                value={form.password2}
                onChange={(e) =>
                  setForm({ ...form, password2: e.target.value })
                }
                placeholder="Confirm password"
                className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:border-violet-400 ${
                  isDark
                    ? "border-white/10 bg-slate-800 text-white placeholder:text-slate-500"
                    : "border-slate-200 bg-slate-50 text-slate-800 placeholder:text-slate-400"
                }`}
              />
            </div>

            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onSave}
                disabled={saving}
                className="rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {saving ? "Saving..." : "Save profile"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
