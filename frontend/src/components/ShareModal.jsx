import { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { useTheme } from '../contexts/ThemeContext.jsx';

const ShareModal = ({ pageId, onClose }) => {
  const [links, setLinks] = useState({ viewLink: "", editLink: "" });
  const [copied, setCopied] = useState("");
  const [loading, setLoading] = useState(true);
  const { darkMode } = useTheme();

  useEffect(() => {
    const fetchLinks = async () => {
      try {
        const res = await axios.post(`/api/share/${pageId}`);
        console.log("Fetched links:", res.data);
        setLinks(res.data);
      } catch (error) {
        console.error("Error fetching share links:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLinks();
  }, [pageId]);

  const handleCopy = async (text, type) => {
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(""), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div
      className={`fixed inset-0 ${
        darkMode ? "bg-black bg-opacity-70" : "bg-gray-200 bg-opacity-50"
      } flex justify-center items-center font-montserrat`}
    >
      <div
        className={`rounded-lg shadow-lg p-4 w-80 ${
          darkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-800"
        }`}
      >
        <h2 className="text-lg font-bold mb-4">Share Page</h2>

        {loading ? (
          <p className="text-gray-400">Loading links...</p>
        ) : (
          <>
            {/* View Link */}
            <div className="mb-4">
              <p className="font-semibold mb-1">View Link</p>
              <button
                onClick={() => handleCopy(links.viewLink, "View")}
                disabled={!links.viewLink}
                className={`${
                  links.viewLink
                    ? darkMode
                      ? "bg-purple-600 hover:bg-purple-700"
                      : "bg-purple-500 hover:bg-purple-600"
                    : "bg-gray-500 cursor-not-allowed"
                } text-white px-3 py-1 rounded font-montserrat`}
              >
                Copy View Link
              </button>
            </div>

            {/* Edit Link */}
            <div className="mb-4">
              <p className="font-semibold mb-1">Edit Link</p>
              <button
                onClick={() => handleCopy(links.editLink, "Edit")}
                disabled={!links.editLink}
                className={`${
                  links.editLink
                    ? darkMode
                      ? "bg-purple-600 hover:bg-purple-700"
                      : "bg-purple-500 hover:bg-purple-600"
                    : "bg-gray-500 cursor-not-allowed"
                } text-white px-3 py-1 rounded font-montserrat`}
              >
                Copy Edit Link
              </button>
            </div>

            {/* Copied Message */}
            {copied && (
              <p className="text-green-400">{copied} link copied!</p>
            )}
          </>
        )}

        {/* Close Button */}
        <button
          onClick={onClose}
          className="mt-2 bg-purple-800 text-white px-3 py-1 rounded hover:bg-purple-900 font-montserrat"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ShareModal;
