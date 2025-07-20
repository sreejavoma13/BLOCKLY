import React from "react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addPage,softDeletePage,toggleFavorite } from "../redux/pagesSlice";
import { Plus, Trash2, Star,Pencil,Check } from "lucide-react";
import {
  updatePageTitle,
  updatePageContent,
  updatePage,
  setActivePage,
} from "../redux/pagesSlice";

const PageItem = ({ page, level }) => {
  const dispatch = useDispatch();
  const pages = useSelector((state) => state.pages.pages);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(page.title);
  const childPages = pages.filter((p) => p.parentId === page.id && !p.isTrashed);
  const { user, loading, error } = useSelector((state) => state.user);
  const userid=user?.userId;

  const handleSave = () => {
    if (title.trim() !== "") {
      dispatch(updatePageTitle({ id: page.id, title }));
      dispatch(updatePage({
          userId: userid,
          pageId: page.id,
          updates: {
            title:title,
          },
      }));
          
      setIsEditing(false);
    }
  };

  return (
    <div className={`ml-${level * 2} py-1`}>
      <div className="flex justify-between items-center">
        <span onClick={() => dispatch(setActivePage(page.id))}
            className="cursor-pointer hover:font-semibold">{!isEditing && page.title}</span>
        <div className="flex space-x-1">
          {/* Favorite Button */}
          <div className="flex items-center space-x-2 ml-2">
            {isEditing ? (
                <>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSave()}
                    onBlur={handleSave}
                    className="border border-gray-700 rounded px-1 py-0.5 text-black"
                    autoFocus
                />
                <Check
                    size={16}
                    onClick={handleSave}
                    className="cursor-pointer text-green-500"
                />
                </>
            ) : (
                <>
                <Pencil
                    size={16}
                    onClick={() => setIsEditing(true)}
                    className="cursor-pointer text-gray-500 hover:text-gray-700"
                />
                </>
            )}
            </div>
          <button onClick={() => dispatch(toggleFavorite(page))}>
            <Star
              size={16}
              className={page.isFavorite ? "text-yellow-400" : ""}
            />
          </button>

          {/* Delete Button */}
          <button onClick={() => dispatch(softDeletePage({userId:userid,pageId:page.id}))}>
            <Trash2 size={16} />
          </button>

          {/* Add Child Page Button */}
          <button
            onClick={() =>
              dispatch(addPage({ parentId: page.id, title: "New Child Page" }))
            }
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* Render Child Pages */}
      {childPages.map((child) => (
        <PageItem key={child.id} page={child} level={level + 1} />
      ))}
    </div>
  );
};

export default PageItem;
