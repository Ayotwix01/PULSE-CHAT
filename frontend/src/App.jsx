import { useEffect, useMemo, useRef, useState } from "react";

import AuthCard from "./components/AuthCard";
import ChatSidebar from "./components/ChatSidebar";
import ChatWindow from "./components/ChatWindow";
import ProfileEditor from "./components/ProfileEditor";

const API_BASE = (
  import.meta.env.VITE_API_URL || "https://pulse-chat-backend-ug5h.onrender.com"
).replace(/\/$/, "");
const WS_BASE = (
  import.meta.env.VITE_WS_URL || API_BASE.replace(/^http/, "ws")
).replace(/\/$/, "");

function App() {
  const [authMode, setAuthMode] = useState("login");
  const [token, setToken] = useState(localStorage.getItem("chat_token") || "");
  const [currentUser, setCurrentUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [draft, setDraft] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState("dark");
  const [search, setSearch] = useState("");
  const [gameState, setGameState] = useState({});
  const [profileOpen, setProfileOpen] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const socketRef = useRef(null);
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    password2: "",
    first_name: "",
    last_name: "",
  });
  const [profileForm, setProfileForm] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    bio: "",
    avatar_color: "#7c3aed",
    password: "",
    password2: "",
  });

  const activeConversation = useMemo(() => {
    return (
      conversations.find((conv) => conv.id === selectedConversationId) || null
    );
  }, [conversations, selectedConversationId]);

  const selectedUser = useMemo(() => {
    if (!activeConversation || !currentUser) return null;
    const otherParticipant = activeConversation.participants.find(
      (person) => person !== currentUser.username,
    );
    return allUsers.find((user) => user.username === otherParticipant) || null;
  }, [activeConversation, allUsers, currentUser]);

  const visibleUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return allUsers;
    return allUsers.filter((user) =>
      `${user.first_name} ${user.last_name} ${user.username}`
        .toLowerCase()
        .includes(query),
    );
  }, [allUsers, search]);

  const loadCurrentUser = async (jwt) => {
    const res = await fetch(`${API_BASE}/api/auth/me/`, {
      headers: { Authorization: `Bearer ${jwt}` },
    });

    if (!res.ok) throw new Error("Session expired");

    const user = await res.json();
    setCurrentUser(user);
    return user;
  };

  const loadUsers = async (jwt, userId) => {
    const res = await fetch(`${API_BASE}/api/auth/users/`, {
      headers: { Authorization: `Bearer ${jwt}` },
    });
    if (!res.ok) return;
    const users = await res.json();
    setAllUsers(users.filter((user) => user.id !== userId));
  };

  const loadConversations = async (jwt) => {
    const res = await fetch(`${API_BASE}/api/chat/conversations/`, {
      headers: { Authorization: `Bearer ${jwt}` },
    });

    if (!res.ok) return;

    const data = await res.json();
    setConversations(data);

    const nextSelectedId = data.some(
      (conversation) => conversation.id === selectedConversationId,
    )
      ? selectedConversationId
      : (data[0]?.id ?? null);

    if (nextSelectedId !== selectedConversationId) {
      setSelectedConversationId(nextSelectedId);
    }
  };

  useEffect(() => {
    if (currentUser) {
      setProfileForm({
        username: currentUser.username || "",
        email: currentUser.email || "",
        first_name: currentUser.first_name || "",
        last_name: currentUser.last_name || "",
        bio: currentUser.bio || "",
        avatar_color: currentUser.avatar_color || "#7c3aed",
        password: "",
        password2: "",
      });
    }
  }, [currentUser]);

  useEffect(() => {
    if (!token) return;

    const init = async () => {
      try {
        setLoading(true);
        const user = await loadCurrentUser(token);
        setCurrentUser(user);
        await loadUsers(token, user.id);
        await loadConversations(token);
      } catch (err) {
        setToken("");
        localStorage.removeItem("chat_token");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [token]);

  useEffect(() => {
    if (!token || !selectedConversationId) return;

    if (socketRef.current) {
      socketRef.current.close();
    }

    const ws = new WebSocket(
      `${WS_BASE}/ws/chat/${selectedConversationId}/?token=${token}`,
    );
    socketRef.current = ws;

    ws.onmessage = (event) => {
      const payload = JSON.parse(event.data);

      if (payload.type === "game_event") {
        const conversationId =
          payload.conversation_id ?? selectedConversationId;
        setGameState((prev) => ({
          ...prev,
          [conversationId]: payload.game,
        }));
        return;
      }

      if (payload.type !== "chat_message") return;

      const incomingMessage = payload.message;
      setConversations((prev) =>
        prev.map((conversation) => {
          if (conversation.id !== selectedConversationId) return conversation;
          return {
            ...conversation,
            messages: [...(conversation.messages || []), incomingMessage],
          };
        }),
      );
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) ws.close();
    };
  }, [selectedConversationId, token]);

  const submitAuth = async (event) => {
    event.preventDefault();
    setStatus("");

    try {
      setLoading(true);

      if (authMode === "register") {
        const registerRes = await fetch(`${API_BASE}/api/auth/register/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: form.username,
            email: form.email,
            password: form.password,
            password2: form.password2,
            first_name: form.first_name,
            last_name: form.last_name,
          }),
        });

        const registerData = await registerRes.json();
        if (!registerRes.ok) {
          throw new Error(
            Object.values(registerData)[0]?.[0] || "Registration failed",
          );
        }
      }

      const authRes = await fetch(`${API_BASE}/api/token/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username,
          password: form.password,
        }),
      });

      const authData = await authRes.json();
      if (!authRes.ok) {
        throw new Error(authData.detail || "Authentication failed");
      }

      const nextToken = authData.access;
      localStorage.setItem("chat_token", nextToken);
      setToken(nextToken);
      setAuthMode("login");
      setForm({
        username: "",
        email: "",
        password: "",
        password2: "",
        first_name: "",
        last_name: "",
      });
      setStatus(
        authMode === "register"
          ? "Account created successfully."
          : "Welcome back!",
      );
    } catch (error) {
      setStatus(error.message);
    } finally {
      setLoading(false);
    }
  };

  const createConversation = async (userId) => {
    if (!token) return;

    const res = await fetch(`${API_BASE}/api/chat/conversations/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ other_user_id: userId }),
    });

    if (res.ok) {
      const nextConversation = await res.json();

      setConversations((prev) => {
        if (
          prev.some((conversation) => conversation.id === nextConversation.id)
        ) {
          return prev.map((conversation) =>
            conversation.id === nextConversation.id
              ? nextConversation
              : conversation,
          );
        }

        return [nextConversation, ...prev];
      });

      setSelectedConversationId(nextConversation.id);
      await loadConversations(token);
    }
  };

  const startMiniGame = (nextType = "guess_number") => {
    if (
      !selectedConversationId ||
      !socketRef.current ||
      socketRef.current.readyState !== WebSocket.OPEN
    )
      return;

    const username = currentUser?.username || "Player";

    if (nextType === "alphabet_sprint") {
      const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      const target = alphabet[Math.floor(Math.random() * alphabet.length)];
      const nextGame = {
        game: "alphabet_sprint",
        status: "playing",
        target,
        started_by: username,
        last_hint: "Guess the hidden letter from A to Z.",
        winner: null,
      };

      socketRef.current.send(
        JSON.stringify({
          kind: "game_start",
          game: "alphabet_sprint",
          target,
          started_by: username,
        }),
      );

      setGameState((prev) => ({
        ...prev,
        [selectedConversationId]: nextGame,
      }));
      return;
    }

    const target = Math.floor(Math.random() * 20) + 1;
    const nextGame = {
      game: "guess_number",
      status: "playing",
      target,
      started_by: username,
      last_hint: "Make your first guess between 1 and 20.",
      winner: null,
    };

    socketRef.current.send(
      JSON.stringify({
        kind: "game_start",
        game: "guess_number",
        target,
        started_by: username,
      }),
    );

    setGameState((prev) => ({
      ...prev,
      [selectedConversationId]: nextGame,
    }));
  };

  const sendMessage = () => {
    const trimmedDraft = draft.trim();
    if (!trimmedDraft || !selectedConversationId) return;

    const currentGame = gameState[selectedConversationId];
    const numberMatch = trimmedDraft.match(/^\/?guess\s+(\d+)$/i);
    const letterMatch = trimmedDraft.match(
      /^\/?(?:letter|alphabet|guess)\s*([a-zA-Z])$/i,
    );

    if (currentGame?.status === "playing") {
      if (currentGame.game === "guess_number" && numberMatch) {
        const guess = Number(numberMatch[1]);
        if (
          socketRef.current &&
          socketRef.current.readyState === WebSocket.OPEN &&
          !Number.isNaN(guess)
        ) {
          socketRef.current.send(
            JSON.stringify({
              kind: "game_guess",
              game: "guess_number",
              guess,
              target: currentGame.target,
            }),
          );
          setDraft("");
          return;
        }
      }

      if (currentGame.game === "alphabet_sprint" && letterMatch) {
        const guess = letterMatch[1].toUpperCase();
        if (
          socketRef.current &&
          socketRef.current.readyState === WebSocket.OPEN
        ) {
          socketRef.current.send(
            JSON.stringify({
              kind: "game_guess",
              game: "alphabet_sprint",
              guess,
              target: currentGame.target,
            }),
          );
          setDraft("");
          return;
        }
      }
    }

    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN)
      return;

    socketRef.current.send(JSON.stringify({ message: trimmedDraft }));
    setDraft("");
  };

  const saveProfile = async () => {
    if (!token) return;

    if (profileForm.password || profileForm.password2) {
      if (profileForm.password !== profileForm.password2) {
        setStatus("Passwords do not match.");
        return;
      }
    }

    try {
      setSavingProfile(true);
      setStatus("");

      const payload = {
        username: profileForm.username,
        email: profileForm.email,
        first_name: profileForm.first_name,
        last_name: profileForm.last_name,
        bio: profileForm.bio,
        avatar_color: profileForm.avatar_color,
      };

      if (profileForm.password) {
        payload.password = profileForm.password;
        payload.password2 = profileForm.password2;
      }

      const res = await fetch(`${API_BASE}/api/auth/me/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          data?.detail ||
            data?.password?.[0] ||
            data?.username?.[0] ||
            "Profile update failed",
        );
      }

      setCurrentUser(data);
      setProfileOpen(false);
      setStatus("Profile updated successfully.");
    } catch (error) {
      setStatus(error.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const logout = () => {
    if (socketRef.current) socketRef.current.close();
    localStorage.removeItem("chat_token");
    setToken("");
    setCurrentUser(null);
    setAllUsers([]);
    setConversations([]);
    setSelectedConversationId(null);
    setProfileOpen(false);
  };

  const isDark = theme === "dark";
  const shellClasses = isDark
    ? "bg-slate-950 text-slate-100"
    : "bg-slate-100 text-slate-900";
  const panelClasses = isDark
    ? "border-white/10 bg-slate-900/80 text-slate-100"
    : "border-slate-200 bg-white/90 text-slate-800";

  if (!token) {
    return (
      <AuthCard
        authMode={authMode}
        setAuthMode={setAuthMode}
        form={form}
        setForm={setForm}
        status={status}
        loading={loading}
        onSubmit={submitAuth}
        isDark={theme === "dark"}
      />
    );
  }

  return (
    <div className={`min-h-screen px-4 py-8 md:px-8 ${shellClasses}`}>
      <div
        className={`mx-auto max-w-7xl overflow-hidden rounded-[28px] border shadow-glow backdrop-blur-xl ${panelClasses}`}
      >
        <div className="grid min-h-[820px] lg:grid-cols-[360px_minmax(0,1fr)]">
          <ChatSidebar
            currentUser={currentUser}
            visibleUsers={visibleUsers}
            search={search}
            onSearch={setSearch}
            onSelectUser={createConversation}
            onLogout={logout}
            theme={theme}
            onToggleTheme={() => setTheme(isDark ? "light" : "dark")}
            onOpenProfile={() => setProfileOpen(true)}
          />

          <ChatWindow
            currentUser={currentUser}
            selectedUser={selectedUser}
            activeConversation={activeConversation}
            draft={draft}
            onDraftChange={setDraft}
            onSend={sendMessage}
            theme={theme}
            onStartGame={() => startMiniGame()}
            currentGame={gameState[selectedConversationId]}
          />
        </div>
      </div>

      <ProfileEditor
        open={profileOpen}
        form={profileForm}
        setForm={setProfileForm}
        onClose={() => setProfileOpen(false)}
        onSave={saveProfile}
        saving={savingProfile}
        theme={theme}
      />
    </div>
  );
}

export default App;
