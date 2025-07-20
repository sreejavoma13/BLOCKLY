import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';

const ProtectedRoute = ({ children }) => {
    const [user, setUser] = useState(undefined); // undefined means "not checked yet"

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser); // currentUser is null if not logged in
        });
        return unsubscribe;
    }, []);

    if (user === undefined) {
        // Still loading Firebase user
        return <div className="text-center mt-10">Loading...</div>;
    }

    if (!user) {
        // User not logged in
        return <Navigate to="/login" replace />;
    }

    return children; // User logged in
};

export default ProtectedRoute;
