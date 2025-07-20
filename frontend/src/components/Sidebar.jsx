import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addPage,
  updatePage,
  fetchPages,
  resetPages,
  clearFavorites,
} from "../redux/pagesSlice";
import { fetchUserInfo, resetUser } from "../redux/userSlice";
import { emptyTrash } from "../redux/trashSlice";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  LogOut,
  Star,
  Sun,
  Moon,
  Trash2,
} from "lucide-react";
import Avatar from "react-avatar";
import PageItem from "./PageItem";
// import { toggleTheme } from "../redux/themeSlice";
import { useTheme } from "../contexts/ThemeContext.jsx";

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [showTrash, setShowTrash] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); // 🌟 NEW: Search state
  const trashRef = useRef(null);

  const pages = useSelector((state) => state.pages.pages);
  const favorites = useSelector((state) => state.pages.favorites);
  const { user, loading, error } = useSelector((state) => state.user);
  const userId = user?.userId;

  const dispatch = useDispatch();
  const { darkMode, toggleTheme } = useTheme();

  const localUser = JSON.parse(localStorage.getItem("user"));

  const rootPages = pages.filter((p) => p.parent === null && !p.isTrashed);

  // 🌟 Filter pages based on search query
  const filteredPages = rootPages.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    dispatch(fetchUserInfo());
  }, [dispatch]);

  useEffect(() => {
    if (userId) {
      dispatch(fetchPages({ userId }));
    }
  }, [dispatch, userId]);

  const handleAddPage = async () => {
    const resultAction = await dispatch(
      addPage({ parentId: null, title: "New Page" })
    );
    if (addPage.fulfilled.match(resultAction)) {
      dispatch(fetchPages({ userId }));
    } else {
      console.error("Failed to add page:", resultAction.error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    dispatch(resetPages());
    dispatch(resetUser());
    window.location.reload();
  };

  const handleEmptyTrash = async () => {
    const resultAction = await dispatch(emptyTrash({ userid: userId }));
    if (emptyTrash.fulfilled.match(resultAction)) {
      dispatch(fetchPages({ userId }));
    } else {
      console.error("Failed to empty trash:", resultAction.payload);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (trashRef.current && !trashRef.current.contains(event.target)) {
        setShowTrash(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      className={`${
        darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-300 text-gray-900"
      } flex flex-col justify-between h-screen transition-all duration-300 ${
        collapsed ? "w-16" : "w-64"
      } border-r border-gray-300 dark:border-gray-700 montserrat-1`}
    >
      {/* Top Section */}
      <div className="p-2">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="mb-1 flex items-center justify-center"
        >
          {collapsed ? <ChevronRight /> : <ChevronLeft />}
        </button>

        <div className="flex mt-2 mb-2">
          <Avatar name={user?.name} size="30" round={true} />
          <p className="font-bold text-lg ml-3">{!collapsed && user?.name}</p>
        </div>

        {/* 🌟 Search Bar */}
        {!collapsed && (
          <div className="mb-3">
            <input
              type="text"
              placeholder="Search pages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full px-2 py-1 rounded-md border ${
                darkMode
                  ? "bg-gray-800 border-gray-600 text-gray-100"
                  : "bg-white border-gray-400 text-gray-900"
              }`}
            />
          </div>
        )}

        {/* Pages */}
        <div>
          {!collapsed && <h2 className="font-bold text-md mb-2">PAGES📄</h2>}
          <div className="overflow-y-auto max-h-[calc(100vh-250px)] pr-2">
            {!collapsed && filteredPages.map((page) => (
              <PageItem key={page.id} page={page} level={0} />
            ))}
          </div>
          <button
            className="flex items-center mt-2 text-blue-600"
            onClick={handleAddPage}
          >
            {!collapsed && <Plus size={16} className="mr-1" />}
            {!collapsed && "Add Page"}
          </button>
        </div>

        {/* Favorites */}
        <div className="mt-4">
          <div className="flex justify-between items-center">
            {!collapsed && (
              <h2 className="font-bold text-md mb-2">FAVORITES ⭐</h2>
            )}
            {!collapsed && (
              <button
                onClick={() => dispatch(clearFavorites())}
                className="text-sm text-red-500"
              >
                Clear
              </button>
            )}
          </div>
          {favorites.length === 0 && !collapsed && (
            <p className="text-sm text-gray-500">No favorites yet.</p>
          )}
          <div className="overflow-y-auto max-h-48 pr-2">
            {favorites.map((favId) => {
              const favPage = pages.find(
                (p) => p.id === favId && !p.isTrashed
              );
              return (
                <div
                  key={favId}
                  className="flex justify-between items-center py-1 ml-2"
                >
                  <span>{favPage?.title}</span>
                  <Star size={16} className="text-yellow-400" />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="flex flex-row space-x-6 p-2 border-t border-gray-300 dark:border-gray-700">
        <button onClick={toggleTheme} className="flex">
          {!collapsed && (
            <span className="ml-2 p-1">
              {darkMode ? (
                <Sun size={22} className="relative top-1 text-yellow-400" />
              ) : (
                <Moon size={22} className="relative top-1 text-gray-600" />
              )}
            </span>
          )}
        </button>
        <button onClick={handleLogout} className="flex text-red-500">
          <LogOut size={20} className="mt-2" />
        </button>

        {/* Trash Icon */}
        <div className="relative">
          <button
            onClick={() => setShowTrash(!showTrash)}
            className="flex text-gray-600 dark:text-gray-300"
          >
            {!collapsed && <Trash2 size={20} className="mt-2" />}
          </button>

          {/* Trash Popup */}
          {showTrash && (
            <div
              ref={trashRef}
              className={`absolute bottom-12 left-0 w-64 p-3 rounded-lg shadow-lg border ${
                darkMode
                  ? "bg-gray-800 text-gray-100 border-gray-600"
                  : "bg-white text-gray-900 border-gray-300"
              } z-50`}
            >
              <h2 className="font-bold text-lg mb-2">Trash</h2>
              { pages.filter((p) => p.isTrashed).length === 0 ? (
                <p className="text-sm text-gray-500">Trash is empty.</p>
              ) : (
                <div className="overflow-y-auto max-h-40">
                  {pages
                    .filter((p) => p.isTrashed)
                    .map((trashPage) => (
                      <div
                        key={trashPage.id}
                        className="flex justify-between items-center py-1"
                      >
                        <span>{trashPage.title}</span>
                        <button
                          className="text-green-500 text-sm ml-2"
                          onClick={() =>
                            dispatch(
                              updatePage({
                                userId: userId,
                                pageId: trashPage.id,
                                updates: { isTrashed: false },
                              })
                            )
                          }
                        >
                          Restore
                        </button>
                      </div>
                    ))}
                </div>
              )}
              <button
                onClick={handleEmptyTrash}
                className={`mt-2 text-red-600 text-sm ${
                  darkMode ? "text-gray-100" : "text-gray-900"
                }`}
              >
                Empty Trash
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
