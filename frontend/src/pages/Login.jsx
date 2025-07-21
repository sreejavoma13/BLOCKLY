// src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { useTheme } from '../contexts/ThemeContext.jsx';
import img4 from '../assets/Screenshot4.png'
import { ChevronLeft } from "lucide-react";
import { toast } from 'react-hot-toast';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { darkMode } = useTheme();


    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const idToken = await userCredential.user.getIdToken();
            const res = await fetch('http://localhost:5000/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include', // 🔥 include cookies
                body: JSON.stringify({ idToken,password})
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.message);
            localStorage.setItem("user", JSON.stringify(data.user));
            //
            //const params = new URLSearchParams(location.search);
            //
            //const redirectTo = params.get("redirectTo") || "/dashboard";
            
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
            toast.error("Failed to log in. Check your email and password.")
            setError("Failed to log in. Check your email and password.");
        }
    };

    return (
        <div
            className={`flex items-center justify-center montserrat-1 min-h-screen transition-colors ${
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
                        src={img4}
                        alt="Login"
                        className="h-full w-full object-cover"
                    />
                </div>

                {/* Right Side - Form */}
                <div className="w-full md:w-1/2 p-8">
                    <div className='flex '>
                     <ChevronLeft
                        onClick={() => navigate('/')}
                        className="w-6 h-6 cursor-pointer hover:text-black transition-colors"
                        />   
                    <h2 className="text-2xl font-extrabold montserrat-1 mb-3 ml-[60px]">WELCOME BACK!!</h2>
                    </div>
                    
                    <h2 className="text-2xl montserrat-1 font-bold mb-6 ml-[130px]">
                       LOG IN
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email"
                            required
                            className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 ${
                                darkMode
                                    ? "bg-gray-700 border-gray-600 text-gray-100 focus:ring-blue-400"
                                    : "bg-gray-50 border-gray-300 text-gray-800 focus:ring-blue-500"
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
                                    ? "bg-gray-700 border-gray-600 text-gray-100 focus:ring-blue-400"
                                    : "bg-gray-50 border-gray-300 text-gray-800 focus:ring-blue-500"
                            }`}
                        />
                        <button
                            type="submit"
                            className={`w-full py-3 rounded-lg transition-colors ${
                                darkMode
                                    ? "bg-purple-700 hover:bg-purple-800 text-white"
                                    : "bg-purple-700 hover:bg-purple-800 text-white"
                            }`}
                        >
                            Log In
                        </button>
                        {error && (
                            <p className="text-red-500 text-sm">{error}</p>
                        )}
                        <p
                            onClick={() => navigate("/signup")}
                            className="mt-4 ml-[120px]  "
                        >
                            <span className='font-bold'>NEW USER:</span> <span className='cursor-pointer hover:underline'>SIGN UP</span> 
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}
export default Login;
