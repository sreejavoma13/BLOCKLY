import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  updatePageContent,
  updatePage,
  fetchPageById,
  addOrUpdatePage,
} from "../redux/pagesSlice";
import { Share, Save } from "lucide-react";
import Editor from "./Editor";
import ShareModal from "./ShareModal";
import { useTheme } from "../contexts/ThemeContext.jsx";
import { MessageCircle,Bookmark} from "lucide-react";
import CommentBox from "./CommentBox";
import GeminiChatbot from "./GeminiChatbot";
import axios from "axios";
import { toast } from 'react-hot-toast';

const MainArea = () => {
  const { darkMode } = useTheme(); // Get dark mode
  const [showShare, setShowShare] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const latestContentRef = useRef(null);
  const [showComments, setShowComments] = useState(false);
  const [showSavePopup, setShowSavePopup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const activePageId = useSelector((state) => state.pages.activePageId);
  const page = useSelector((state) =>
    state.pages.pages.find((p) => p.id === activePageId)
  );
  const { user } = useSelector((state) => state.user);
  const userid = user?.userId;
  const access = searchParams.get("access"); // view or edit
  const isEditable = (!access || access === "edit") && user;
  const [titleInput, setTitleInput] = useState(page?.title || "");

  useEffect(() => {
    if ( activePageId && userid) {
      dispatch(fetchPageById({userid:userid,pageId:activePageId})).then((res) => {
        if (res.payload && user) {
          dispatch(addOrUpdatePage(res.payload));
        }
      });
    }
  }, [activePageId,userid, dispatch]);


  useEffect(() => {
    setTitleInput(page?.title || "");
  }, [page?.title]);

  const handleTitleChange = (e) => setTitleInput(e.target.value);

  const handleTitleBlur = () => {
    if (!isEditable || !page || titleInput === page.title) return;
    dispatch(
      updatePage({
        userId: userid,
        pageId: page.id,
        updates: { title: titleInput },
      })
    );
  };

  const handleContentChange = (content) => {
    latestContentRef.current = content;
    if (!page || !isEditable) return;
    dispatch(updatePageContent({ id: page.id, content }));
  };

  const handleSave = () => {
    if (!page) return;
    const latestContent = latestContentRef.current;
    dispatch(
      updatePage({
        userId: userid,
        pageId: page.id,
        updates: {
          title: page.title,
          content: latestContent,
        },
      })
    );
    toast.success("saved successfully")
  };

  const handleBookmarkSubmit =async (e) => {
    e.preventDefault();
    if (!page || !email || !password) return;
    try {
    // POST to your backend API
        const response = await axios.post("/api/pages/saveToUser", {
          sourceUserId: userid, // current user's ID as source
          email,                // target user's email
          password,             // target user's password (optional – depends on your backend auth)
          pageId: page.id,      // the page to save
        });

        console.log("Save successful:", response.data);
        alert("Page saved to your profile successfully!");

        setShowSavePopup(false); // Close popup
        setEmail("");            // Reset form
        setPassword("");
      } catch (error) {
        console.error("Error saving page:", error);
        alert("Failed to save page to profile. Try again!");
      }
  };

  if (!page) return <div className="p-4">Loading page...</div>;

  return (
    <div
      className={`flex flex-col h-full transition-colors duration-300 ${
        darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
      }`}
    >
      {/* TopBar */}
      <div
        className={`flex justify-between items-center p-2 border-b ${
          darkMode ? "border-gray-700" : "border-gray-300"
        }`}
      >
        <h2 className="text-lg font-bold">
          {isEditable ? "Editing" : "Viewing"}: {page.title}
        </h2>
        <div className="flex space-x-2">
          <GeminiChatbot />
          {isEditable && (
            <MessageCircle
              size={20}
              className={`cursor-pointer mt-1`}
              onClick={() => setShowComments(true)}
            />
          )}
          {(access==="edit")&& (
            <Bookmark
              size={20}
              className={`cursor-pointer mt-1`}
              onClick={() =>setShowSavePopup(true)}
            />
          )}
          {isEditable && (
            <Share
              size={20}
              className="cursor-pointer mt-1"
              onClick={() => setShowShare(true)}
            />
          )}
          
          {isEditable && (
            <button
              onClick={handleSave}
              className={`flex items-center px-3 py-1 rounded hover:opacity-90 ${
                darkMode
                  ? "bg-purple-600 text-white"
                  : "bg-purple-500 text-white"
              }`}
            >
              <Save size={16} className="mr-1" />
              Save
            </button>
          )}
        </div>
      </div>

      {/* Editable Title */}
      <input
        value={titleInput}
        onChange={handleTitleChange}
        onBlur={handleTitleBlur}
        disabled={!isEditable}
        className={`text-2xl font-semibold border-b p-1 outline-none transition-colors duration-200 ${
          darkMode
            ? "bg-gray-800 border-gray-600 text-gray-100"
            : "bg-gray-100 border-gray-300 text-gray-900"
        } ${!isEditable ? "cursor-not-allowed" : ""}`}
      />

      {/* Rich Text Editor */}
      <div className={`flex-1 overflow-y-auto p-2 ${darkMode?"bg-gray-800": "bg-gray-100"}`}>
        <Editor
          key={page.id}
          content={page.content}
          onContentChange={handleContentChange}
          readOnly={!isEditable}
        />
      </div>


      {/* Share Modal */}
      {showShare && (
        <ShareModal pageId={page.id} onClose={() => setShowShare(false)} />
      )}
      {showComments && (
        <CommentBox
          pageId={page.id}
          onClose={() => setShowComments(false)}
        />
      )}
      {showSavePopup && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          onClick={() => setShowSavePopup(false)}
        >
          <div
            className={`p-4 rounded shadow-lg w-80 ${
              darkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-900"
            }`}
            onClick={(e) => e.stopPropagation()} // Prevent close on popup click
          >
            <h3 className="text-lg font-bold mb-2">Save to your profile</h3>
            <form onSubmit={handleBookmarkSubmit} className="space-y-3">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={`w-full p-2 border rounded ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-gray-100"
                    : "bg-gray-100 border-gray-300 text-gray-900"
                }`}
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={`w-full p-2 border rounded ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-gray-100"
                    : "bg-gray-100 border-gray-300 text-gray-900"
                }`}
              />
              <button
                type="submit"
                className="w-full py-2 rounded bg-purple-500 text-white hover:bg-purple-600"
              >
                Save
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default MainArea;
