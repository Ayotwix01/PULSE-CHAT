export default function ChatWindow({
  currentUser,
  selectedUser,
  activeConversation,
  draft,
  onDraftChange,
  onSend,
  theme,
  onStartGame,
  currentGame,
}) {
  const isDark = theme === "dark";
  const mainClasses = isDark
    ? "bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950"
    : "bg-gradient-to-b from-slate-100 via-white to-slate-200";
  const inputClasses = isDark
    ? "border-white/10 bg-slate-900 text-white placeholder:text-slate-500"
    : "border-slate-200 bg-white text-slate-800 placeholder:text-slate-400";

  return (
    <main className={`flex min-w-0 flex-col ${mainClasses}`}>
      <header
        className={`flex items-center justify-between border-b px-4 py-4 sm:px-6 ${isDark ? "border-white/10" : "border-slate-200"}`}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600"
            style={{
              background: `linear-gradient(135deg, ${selectedUser?.avatar_color || "#7c3aed"}, #8b5cf6)`,
            }}
          >
            <span className="text-sm font-semibold uppercase text-white">
              {selectedUser?.username?.charAt(0) || "C"}
            </span>
          </div>
          <div>
            <h2
              className={`text-lg font-semibold ${isDark ? "text-white" : "text-slate-900"}`}
            >
              {selectedUser?.username || "Select a conversation"}
            </h2>
            <p
              className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}
            >
              {selectedUser
                ? `${selectedUser.first_name || ""} ${selectedUser.last_name || ""}`.trim() ||
                  "Online now"
                : "Choose someone to start"}
            </p>
          </div>
        </div>
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto px-3 py-4 sm:px-5 sm:py-5">
        {currentGame && (
          <div
            className={`rounded-2xl border p-3 ${isDark ? "border-violet-500/30 bg-violet-500/10" : "border-violet-200 bg-violet-50"}`}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-violet-400">
                  Mini game
                </p>
                <h3
                  className={`mt-1 text-base font-semibold ${isDark ? "text-white" : "text-slate-900"}`}
                >
                  Guess the number
                </h3>
              </div>
              <button
                onClick={onStartGame}
                className="rounded-full bg-violet-500 px-3 py-1.5 text-xs font-medium text-white"
              >
                New round
              </button>
            </div>
            <p
              className={`mt-2 text-sm ${isDark ? "text-slate-200" : "text-slate-700"}`}
            >
              {currentGame.status === "won"
                ? `${currentGame.winner} guessed it right!`
                : currentGame.last_hint}
            </p>
            <p
              className={`mt-1 text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}
            >
              Type /guess 7 to play.
            </p>
          </div>
        )}

        {activeConversation?.messages?.length ? (
          activeConversation.messages.map((message) => {
            const isMine = message.sender === currentUser?.username;
            return (
              <div
                key={message.id}
                className={`flex ${isMine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm shadow-lg ${
                    isMine
                      ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white"
                      : isDark
                        ? "border border-white/10 bg-slate-800/90 text-slate-100"
                        : "border border-slate-200 bg-white text-slate-800"
                  }`}
                >
                  <p>{message.text}</p>
                  <div
                    className={`mt-2 text-[10px] ${isMine ? "text-violet-100" : isDark ? "text-slate-400" : "text-slate-500"}`}
                  >
                    {new Date(message.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div
            className={`flex h-full items-center justify-center ${isDark ? "text-slate-400" : "text-slate-500"}`}
          >
            Choose a person to start chatting.
          </div>
        )}
      </div>

      <div
        className={`border-t p-4 ${isDark ? "border-white/10 bg-slate-950/70" : "border-slate-200 bg-slate-50"}`}
      >
        <div
          className={`flex items-center gap-3 rounded-2xl border px-3 py-3 ${inputClasses}`}
        >
          <button
            onClick={onStartGame}
            className={`rounded-xl px-2.5 py-2 text-lg ${isDark ? "bg-white/5 text-slate-200 hover:bg-white/10" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
          >
            🎮
          </button>
          <input
            value={draft}
            onChange={(e) => onDraftChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onSend();
            }}
            className="flex-1 bg-transparent text-sm focus:outline-none"
            placeholder="Type your message or /guess 7..."
            disabled={!activeConversation}
          />
          <button
            onClick={onSend}
            disabled={!activeConversation || !draft.trim()}
            className="rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-violet-500/30 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </main>
  );
}
