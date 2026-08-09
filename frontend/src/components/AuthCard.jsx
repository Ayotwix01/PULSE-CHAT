export default function AuthCard({
  authMode,
  setAuthMode,
  form,
  setForm,
  status,
  loading,
  onSubmit,
  isDark,
}) {
  return (
    <div
      className={`flex min-h-screen items-center justify-center px-4 py-10 ${isDark ? "bg-slate-950 text-slate-100" : "bg-slate-100 text-slate-900"}`}
    >
      <div
        className={`w-full max-w-md rounded-[28px] border p-6 shadow-glow backdrop-blur-xl ${
          isDark
            ? "border-white/10 bg-slate-900/80 text-slate-100"
            : "border-slate-200 bg-white/90 text-slate-800"
        }`}
      >
        <div className="mb-6 text-center">
          <p className="text-xs uppercase tracking-[0.38em] text-violet-300">
            Pulse
          </p>
          <h1 className="mt-4 text-3xl font-semibold text-white">
            Start your chat
          </h1>
        </div>

        <div className="mb-6 flex rounded-2xl border border-white/10 bg-slate-800/80 p-1">
          <button
            onClick={() => setAuthMode("login")}
            className={`flex-1 rounded-xl px-4 py-2 text-sm font-medium transition ${
              authMode === "login"
                ? "bg-violet-500 text-white"
                : "text-slate-300"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setAuthMode("register")}
            className={`flex-1 rounded-xl px-4 py-2 text-sm font-medium transition ${
              authMode === "register"
                ? "bg-violet-500 text-white"
                : "text-slate-300"
            }`}
          >
            Register
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {authMode === "register" && (
            <div className="grid grid-cols-2 gap-3">
              <input
                className="rounded-xl border border-white/10 bg-slate-800 px-3 py-2.5 text-sm text-white outline-none focus:border-violet-400"
                placeholder="First name"
                value={form.first_name}
                onChange={(e) =>
                  setForm({ ...form, first_name: e.target.value })
                }
              />
              <input
                className="rounded-xl border border-white/10 bg-slate-800 px-3 py-2.5 text-sm text-white outline-none focus:border-violet-400"
                placeholder="Last name"
                value={form.last_name}
                onChange={(e) =>
                  setForm({ ...form, last_name: e.target.value })
                }
              />
            </div>
          )}

          <input
            className="w-full rounded-xl border border-white/10 bg-slate-800 px-3 py-2.5 text-sm text-white outline-none focus:border-violet-400"
            placeholder="Username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            required
          />

          {authMode === "register" && (
            <input
              className="w-full rounded-xl border border-white/10 bg-slate-800 px-3 py-2.5 text-sm text-white outline-none focus:border-violet-400"
              type="email"
              placeholder="Email address"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          )}

          <input
            className="w-full rounded-xl border border-white/10 bg-slate-800 px-3 py-2.5 text-sm text-white outline-none focus:border-violet-400"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />

          {authMode === "register" && (
            <input
              className="w-full rounded-xl border border-white/10 bg-slate-800 px-3 py-2.5 text-sm text-white outline-none focus:border-violet-400"
              type="password"
              placeholder="Confirm password"
              value={form.password2}
              onChange={(e) => setForm({ ...form, password2: e.target.value })}
              required
            />
          )}

          {status && <p className="text-sm text-rose-300">{status}</p>}

          <button
            disabled={loading}
            type="submit"
            className="w-full rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading
              ? "Please wait..."
              : authMode === "login"
                ? "Login"
                : "Create account"}
          </button>
        </form>
      </div>
    </div>
  );
}
