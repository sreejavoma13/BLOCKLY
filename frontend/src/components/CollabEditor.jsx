// src/App.jsx
import React, { useEffect, useRef, useState } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import QuillCursors from "quill-cursors";
import { QuillBinding } from "y-quill";
import { io } from "socket.io-client";
import * as Y from "yjs";
import {
  Awareness,
  encodeAwarenessUpdate,
  applyAwarenessUpdate,
} from "y-protocols/awareness";
import { useTheme } from '../contexts/ThemeContext.jsx';
import img5 from '../assets/Screenshot5.png'
import { useNavigate } from "react-router-dom";
Quill.register("modules/cursors", QuillCursors);
import '../styles/index.css';

export default function App() {
  const { darkMode, toggleDarkMode } = useTheme();
  const [user, setUser] = useState(null); // To hold username, email, room
  const editorRef = useRef(null);
  const ydocRef = useRef(null);       // 🔥 Added
  const ytextRef = useRef(null);      // 🔥 Added
  const [users, setUsers] = useState([]); // List of connected users
  const [savedPages, setSavedPages] = useState([]);
  const navigate = useNavigate();

  const handleStart = async (e) => {
    e.preventDefault();
    const username = e.target.username.value.trim();
    const email = e.target.email.value.trim();
    const room = e.target.room.value.trim();
    const password=e.target.password.value.trim();

    if (!username || !email || !room || !password) {
      alert("Please enter username, email, and room name.");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/check-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email,password }),
      });

      const data = await res.json();
      console.log(data);
      
      if (!res.ok) {
        alert(data.message || "Something went wrong");
        return;
      }

      if (data.user) {
        setUser({ username, email, room });
      } else {
        alert("User not found. Please register first.");
      }
    } catch (err) {
      console.error("Error checking user:", err);
      alert("Failed to verify user. Please try again later.");
    }
  };
  const handleLeaveRoom=async()=>{
    console.log("leaving room");
    const localUser = JSON.parse(localStorage.getItem("user"));
    const userEmail = localUser?.email;
    if(userEmail===user.email){
      navigate('/dashboard')
    }else{
      navigate('/login')
    }
     
  }
  const handleSave = async () => {
    if (!user) return;

    const title = prompt("Enter a title for this page:");
    if (!title) return;

    const content = ytextRef.current.toDelta(); // 🔥 FIXED: use ytextRef

    try {
      const res = await fetch("http://localhost:5000/api/pages/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          title,
          content,
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert("Page saved!");
        fetchPages();
      } else {
        alert("Failed to save page");
      }
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  const loadPage = async (pageId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/pages/${user.email}/${pageId}`);
      const data = await res.json();
      if (data.success) {
        const ytext = ytextRef.current; // 🔥 FIXED: use ytextRef
        ytext.delete(0, ytext.length); // Clear current content
        ytext.applyDelta(data.page.content); // Load saved content
      } else {
        alert("Failed to load page");
      }
    } catch (err) {
      console.error("Load page error:", err);
    }
  };

  const fetchPages = async () => {
    if (!user) return;
    try {
      const res = await fetch(`http://localhost:5000/api/pages/${user.email}`);
      const data = await res.json();
      if (data.success) {
        setSavedPages(data.pages);
      }
    } catch (err) {
      console.error("Error fetching pages:", err);
    }
  };

  useEffect(() => {
    if (user) fetchPages();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const socket = io("http://localhost:5000", {
      query: { room: user.room },
    });

    const ydoc = new Y.Doc();
    const ytext = ydoc.getText("quill");

    ydocRef.current = ydoc;   // 🔥 Store ydoc in ref
    ytextRef.current = ytext; // 🔥 Store ytext in ref

    const awareness = new Awareness(ydoc);

    awareness.setLocalStateField("user", {
      name: user.username,
      email: user.email,
      color: "#" + Math.floor(Math.random() * 0xffffff).toString(16),
    });

    // const toolbarOptions = [
    //   ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
    //   ['blockquote', 'code-block'],

    //   [{ 'header': 1 }, { 'header': 2 }],               // custom button values
    //   [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    //   [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
    //   [{ 'indent': '-1'}, { 'indent': '+1' }],          // indent
    //   [{ 'direction': 'rtl' }],                         // text direction

    //   [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
    //   [{ 'header': [1, 2, 3, 4, 5, 6, false] }],

    //   [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults
    //   [{ 'font': [] }],
    //   [{ 'align': [] }],

    //   ['clean']                                         // remove formatting button
    // ];

    const quill = new Quill(editorRef.current, {
      theme: "snow",
      modules: {
        toolbar: [['bold', 'italic', 'underline', 'strike'],[{ 'list': 'ordered'}, { 'list': 'bullet' }],[{ 'header': [1, 2, 3, 4, 5, 6, false] }]],
        cursors: true,
        history: { userOnly: true },
      },
    });

    const binding = new QuillBinding(ytext, quill, awareness);

    socket.on("sync", (stateUpdate) => {
      Y.applyUpdate(ydoc, new Uint8Array(stateUpdate));
    });

    socket.on("update", (update) => {
      Y.applyUpdate(ydoc, new Uint8Array(update));
    });

    ydoc.on("update", (update) => {
      if (update && update.length > 0) {
        socket.emit("update", update);
      }
    });

    awareness.on("update", () => {
      const states = Array.from(awareness.getStates().values());
      const userList = states.map((s) => s.user).filter(Boolean);
      setUsers(userList);

      const changedClients = [...awareness.getStates().keys()];
      const awarenessUpdate = encodeAwarenessUpdate(awareness, changedClients);
      if (awarenessUpdate && awarenessUpdate.length > 0) {
        socket.emit("awareness", awarenessUpdate);
      }
    });

    socket.on("awareness", (update) => {
      try {
        const uint8Update = new Uint8Array(update);
        applyAwarenessUpdate(awareness, uint8Update, socket.id);
      } catch (err) {
        console.error("⚠️ Corrupt awareness update skipped:", err);
      }
    });

    return () => {
      binding.destroy();
      socket.disconnect();
      ydoc.destroy();
    };
  }, [user]);

  if (!user) {
    return (
  <div
    className={`h-screen flex items-center justify-center transition-colors duration-300 ${
      darkMode ? "bg-gray-900" : "bg-gray-100"
    }`}
  >
    <div
      className={`flex rounded-lg shadow-lg overflow-hidden w-full max-w-4xl`}
    >
      {/* Left Side */}
      <div
        className={`hidden md:flex flex-1 items-center justify-center p-4 ${
          darkMode ? "bg-gray-800" : "bg-gray-200"
        }`}
      >
        <img
          src={img5}
          alt="Illustration"
          className="max-w-full max-h-full object-contain"
        />
      </div>

      {/* Right Side*/}
      <div
        className={`flex-1 p-8 ${
          darkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-900"
        }`}
      >
        <h2 className="text-2xl font-bold text-center mb-4">Join a Room</h2>
        <form onSubmit={handleStart} className="space-y-4">
          <input
            type="text"
            name="username"
            placeholder="Username"
            className={`w-full px-4 py-2 rounded border focus:outline-none focus:ring-2 ${
              darkMode
                ? "bg-gray-700 border-gray-600 text-gray-100 focus:ring-orange-500"
                : "bg-gray-100 border-gray-300 text-gray-900 focus:ring-orange-400"
            }`}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            className={`w-full px-4 py-2 rounded border focus:outline-none focus:ring-2 ${
              darkMode
                ? "bg-gray-700 border-gray-600 text-gray-100 focus:ring-purple-500"
                : "bg-gray-100 border-gray-300 text-gray-900 focus:ring-purple-400"
            }`}
            required
          />
            <input
            type="password"
            name="password"
            placeholder="Password"
            className={`w-full px-4 py-2 rounded border focus:outline-none focus:ring-2 ${
              darkMode
                ? "bg-gray-700 border-gray-600 text-gray-100 focus:ring-orange-500"
                : "bg-gray-100 border-gray-300 text-gray-900 focus:ring-orange-400"
            }`}
            required
          />
          <input
            type="text"
            name="room"
            placeholder="Room Name"
            className={`w-full px-4 py-2 rounded border focus:outline-none focus:ring-2 ${
              darkMode
                ? "bg-gray-700 border-gray-600 text-gray-100 focus:ring-purple-500"
                : "bg-gray-100 border-gray-300 text-gray-900 focus:ring-purple-400"
            }`}
            required
          />
          <button
            type="submit"
            className={`w-full py-2 rounded text-white font-semibold transition-colors ${
              darkMode ? "bg-blue-600 hover:bg-purple-500" : "bg-purple-500 hover:bg-purple-400"
            }`}
          >
            Start
          </button>
        </form>
      </div>
    </div>
  </div>
);
  }

  return (
    <div
  className={`h-screen flex flex-row ${
    darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-100 text-gray-900"
  }`}
>
  {/* Sidebar */}
  <div
    className={`w-56 flex flex-col justify-between border-r ${
      darkMode
        ? "bg-gray-800 border-gray-700"
        : "bg-white border-gray-300"
    } p-4`}
  >
    <div>
      <h3 className="text-lg font-semibold">👥 Users</h3>
      <p className="text-sm text-gray-500">
        Room: <strong>{user.room}</strong>
      </p>
      <ul className="list-none mt-2">
        {users.map((u, idx) => (
          <li
            key={idx}
            className={`py-1 ${
              u.name === user.username ? "font-bold" : "font-normal"
            }`}
            style={{ color: u.color }}
          >
            {u.name}
          </li>
        ))}
      </ul>
      <h3 className="mt-4 text-lg font-semibold">📄 Saved Pages</h3>
      <ul className="list-none mt-1">
        {savedPages.map((p) => (
          <li
            key={p.id}
            className={`py-1 cursor-pointer ${
              darkMode ? "text-blue-400" : "text-blue-600"
            } hover:underline`}
            onClick={() => loadPage(p.id)}
          >
            {p.title}
          </li>
        ))}
      </ul>
    </div>

    {/* Leave Room Button */}
    <button
      onClick={handleLeaveRoom}
      className={`w-full mt-4 py-2 rounded ${
        darkMode
          ? "bg-red-600 hover:bg-red-500 text-gray-100"
          : "bg-red-500 hover:bg-red-400 text-white"
      }`}
    >
      🚪 Leave Room
    </button>
  </div>

  {/* Editor */}
  <div
    ref={editorRef}
    className={`flex-1 m-4 rounded-lg border h-full ${
      darkMode ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"
    }`}
  />

  {/* Save Page Button */}
  <button
    onClick={handleSave}
    className={`absolute top-4 right-4 px-4 py-2 rounded shadow ${
      darkMode
        ? "bg-purple-600 hover:bg-purple-500 text-gray-100"
        : "bg-purple-500 hover:bg-purple-400 text-white"
    }`}
  >
    💾 Save Page
  </button>
</div>
  );
}

const inputStyle = {
  display: "block",
  marginBottom: "1rem",
  width: "100%",
  padding: "0.5rem",
  borderRadius: "4px",
  border: "1px solid #ccc",
};

const buttonStyle = {
  padding: "0.5rem 1rem",
  background: "#007bff",
  color: "#fff",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  width: "100%",
};
