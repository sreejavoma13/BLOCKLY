import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../firebase';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext.jsx';
import img6 from '../assets/Screenshot6.png'
import { ChevronLeft } from "lucide-react";

function Signup() {
    console.log(" Signup component loaded");
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { darkMode } = useTheme();

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("🚀 handleSubmit called");
        setError(null);

        try {
            //  Create user in Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            //  Update Firebase user profile with name
            await updateProfile(user, { displayName: name });
            await user.reload(); 
            //  Get Firebase ID Token
            const idToken = await user.getIdToken(true);

            //  Send ID Token to backend
            const res = await fetch("http://localhost:5000/api/auth/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include", 
                body: JSON.stringify({ idToken,password })
            });

            const data = await res.json();
            if (!res.ok) {
              console.error("Signup failed:", data.message);
              toast.error("Uh-oh!!,Signup failed,please try again")
            } 
            console.log("✅ User created and JWT set by backend");
            localStorage.setItem("user", JSON.stringify(data.user));
            navigate('/dashboard'); 

        } catch (err) {
            console.error(err);
            toast.error("uh-oh!! signup failed")
            setError(err.message || "Signup failed");
        }
    };

    return (
        <div
            className={`flex items-center justify-center min-h-screen transition-colors ${
                darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-100 text-gray-800"
            }`}
        >
            <div
                className={`flex w-full max-w-4xl rounded-xl shadow-lg overflow-hidden ${
                    darkMode ? "bg-gray-800" : "bg-white"
                }`}
            >
                {/* Left Side - Image */}
                <div className="w-1/2 hidden md:block">
                    <img
                        src={img6}
                        alt="Signup"
                        className="h-full w-full object-cover"
                    />
                </div>

                {/* Right Side - Form */}
                <div className="w-full md:w-1/2 p-8">
                    <div>
                     <ChevronLeft
                        onClick={() => navigate('/')}
                        className="w-6 h-6 cursor-pointer hover:text-black transition-colors"
                    />    
                    <h2 className="text-2xl font-extrabold montserrat-1 mb-3 ml-[60px]">START YOUR JOURNEY✨</h2>
                    </div>
                    <h2 className="text-2xl  montserrat-1 mb-6 ml-[140px]">
                        SIGN UP
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Name"
                            required
                            className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 ${
                                darkMode
                                    ? "bg-gray-700 border-gray-600 text-gray-100 focus:ring-blue-400"
                                    : "bg-gray-50 border-gray-300 text-gray-800 focus:ring-blue-500"
                            }`}
                        />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email"
                            required
                            className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 ${
                                darkMode
                                    ? "bg-gray-700 border-gray-600 text-gray-100 focus:ring-purple-800"
                                    : "bg-gray-50 border-gray-300 text-gray-800 focus:ring-purple-800"
                            }`}
                        />
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            required
                            className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 ${
                                darkMode
                                   ? "bg-gray-700 border-gray-600 text-gray-100 focus:ring-purple-800"
                                   : "bg-gray-50 border-gray-300 text-gray-800 focus:ring-purple-800"
                            }`}
                        />
                        <button
                            type="submit"
                            className={`w-full montserrat-1 py-3 rounded-lg transition-colors ${
                                darkMode
                                    ? "bg-purple-700 hover:bg-purple-800 text-white"
                                    : "bg-purple-600 hover:bg-purple-700 text-white"
                            }`}
                        >
                            Sign Up
                        </button>
                        {error && (
                            <p className="text-red-500 text-sm">{error}</p>
                        )}
                        <p
                            onClick={() => navigate("/login")}
                            className="mt-4 ml-[110px]  "
                        >
                            <span className='font-bold'>ALREADY A USER:</span> <span className='cursor-pointer hover:underline'>LOGIN</span> 
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Signup;
