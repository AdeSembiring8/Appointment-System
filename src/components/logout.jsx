import { useRouter } from "next/router";

export default function LogoutButton() {
    const router = useRouter();

    const handleLogout = () => {
        localStorage.clear(); // Hapus semua data di localStorage
        alert("Logout successful!");
        router.push("/login"); // Redirect ke halaman login
    };

    return (
        <button onClick={handleLogout} style={styles.button}>
            Logout
        </button>
    );
}

const styles = {
    button: {
        padding: "10px 20px",
        backgroundColor: "#ff4d4d",
        color: "#fff",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        marginTop: "20px"
    }
};
