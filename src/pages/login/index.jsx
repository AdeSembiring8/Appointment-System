import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Login() {
    const [username, setUsername] = useState('');
    const router = useRouter();

    const handleLogin = async () => {
        try {
            const res = await axios.post('/api/auth/login', { username });
    
            console.log("Login Response:", res.data); 
    
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("user_id", res.data.userId); 
    
            alert("Login successful!");
            router.push("/appointments"); 
        } catch (error) {
            console.error("Login error:", error.response?.data); 
            alert(error.response?.data?.message || "Login failed. Please try again.");
        }
    };
    

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>Login</h1>
            <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={styles.input}
            />
            <button onClick={handleLogin} style={styles.button}>
                Login
            </button>
            <ToastContainer />
        </div>
    );
}

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#f0f2f5',
    },
    title: {
        fontSize: '2rem',
        marginBottom: '20px',
    },
    input: {
        padding: '10px',
        marginBottom: '10px',
        width: '300px',
        borderRadius: '5px',
        border: '1px solid #ccc',
    },
    button: {
        padding: '10px 20px',
        backgroundColor: '#0070f3',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
    },
};