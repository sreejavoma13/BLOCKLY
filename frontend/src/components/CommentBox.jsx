import { useEffect, useState } from "react";
import { X } from "lucide-react";
import axios from "axios";
import { useSelector } from "react-redux";

const CommentBox = ({ pageId, onClose }) => {
  const [comments, setComments] = useState([]);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useSelector((state) => state.user);
  const userId = user?.userId;

  const fetchComments = async () => {
    try {
      const res = await axios.get(`/api/pages/${userId}/${pageId}/comments`);
      setComments(res.data);
    } catch (err) {
      console.error("Failed to fetch comments", err);
    }
  };

  const postComment = async () => {
    if (!name.trim() || !text.trim()) return;
    setLoading(true);
    try {
      await axios.post(`/api/pages/${userId}/${pageId}/comments`, {
        name,
        text,
      });
      setName("");
      setText("");
      fetchComments(); // refresh list
    } catch (err) {
      console.error("Failed to post comment", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchComments();
  }, [pageId]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg w-96 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
        >
          <X size={20} />
        </button>
        <h3 className="text-lg font-bold mb-2 dark:text-gray-100">
          Comments
        </h3>
        <div className="space-y-2 max-h-60 overflow-y-auto mb-3">
          {comments.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-300">No comments yet.</p>
          ) : (
            comments.map((c, idx) => (
              <div
                key={idx}
                className="border rounded p-2 dark:border-gray-600"
              >
                <p className="font-semibold dark:text-gray-100">{c.name}</p>
                <p className="text-sm dark:text-gray-300">{c.text}</p>
              </div>
            ))
          )}
        </div>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your Name"
          className="w-full border rounded mb-2 p-1 dark:bg-gray-700 dark:text-gray-100"
        />
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a comment..."
          className="w-full border rounded mb-2 p-1 h-20 dark:bg-gray-700 dark:text-gray-100"
        />
        <button
          onClick={postComment}
          disabled={loading}
          className={`w-full py-1 rounded text-white ${
            loading
              ? "bg-gray-400"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {loading ? "Posting..." : "Post Comment"}
        </button>
      </div>
    </div>
  );
};

export default CommentBox;
