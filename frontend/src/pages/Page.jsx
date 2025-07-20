import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setActivePage, fetchPageById } from "../redux/pagesSlice";
import { fetchUserInfo } from "../redux/userSlice.js";
import MainArea from "../components/MainArea";
import { useSelector } from "react-redux";
import { useTheme } from "../contexts/ThemeContext.jsx";

const Page = () => {
  const { user, loading, error } = useSelector((state) => state.user);
  const userid=user?.userId;
  console.log("inside page",userid);
  const { darkMode } = useTheme();
  const { pageId } = useParams();
  const dispatch = useDispatch();

  useEffect(() => {
    // Set current page as active
    dispatch(setActivePage(pageId));
    dispatch(fetchPageById({userid,pageId}));
  }, [pageId, dispatch]);

  return (
    <div className={`h-screen transition-colors duration-300 ${
        darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-100 text-gray-900"
      }`}>
      <MainArea />
    </div>
  );
};

export default Page;
