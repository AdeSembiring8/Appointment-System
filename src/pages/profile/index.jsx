import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";

export default function Profile() {
    const [name, setName] = useState("");
    const [username, setUsername] = useState("");
    const [preferredTimezone, setPreferredTimezone] = useState("");
    const router = useRouter();

    const timezones = [
        "UTC", "GMT", "EST", "CST", "MST", "PST",
        "Asia/Jakarta", "Asia/Singapore", "Asia/Tokyo",
        "Europe/London", "Europe/Berlin"
    ];

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const userId = localStorage.getItem("user_id");
                if (!userId) {
                    router.push("/login");
                    return;
                }
                const res = await axios.get(`/api/users/${userId}`);
                setName(res.data.name);
                setUsername(res.data.username);
                setPreferredTimezone(res.data.preferred_timezone);
            } catch (error) {
                console.error("Failed to fetch user profile", error);
            }
        };

        fetchUserProfile();
    }, [router]);

    const handleUpdateProfile = async () => {
        try {
            const userId = localStorage.getItem("user_id");
            await axios.put("/api/profile", {
                userId,
                name,
                preferred_timezone: preferredTimezone
            });

            alert("Profile updated successfully!");
            router.push("appointments");
        } catch (error) {
            console.error("Failed to update profile", error);
            alert("Failed to update profile");
        }
    };

    return (
        <div style={styles.container}>
            <h1>Profile</h1>
            <div style={styles.formGroup}>
                <label>Name:</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={styles.input}
                />
            </div>
            <div style={styles.formGroup}>
                <label>Username:</label>
                <input
                    type="text"
                    value={username}
                    disabled
                    style={styles.inputDisabled}
                />
            </div>
            <div style={styles.formGroup}>
                <label>Preferred Timezone:</label>
                <select
                    value={preferredTimezone}
                    onChange={(e) => setPreferredTimezone(e.target.value)}
                    style={styles.select}
                >
                    {timezones.map((tz) => (
                        <option key={tz} value={tz}>{tz}</option>
                    ))}
                </select>
            </div>
            <button onClick={handleUpdateProfile} style={styles.button}>
                Update Profile
            </button>
        </div>
    );
}

const styles = {
    container: {
        padding: "20px",
        maxWidth: "400px",
        margin: "0 auto",
    },
    formGroup: {
        marginBottom: "15px",
    },
    input: {
        width: "100%",
        padding: "8px",
        border: "1px solid #ccc",
        borderRadius: "4px",
    },
    inputDisabled: {
        width: "100%",
        padding: "8px",
        border: "1px solid #ddd",
        borderRadius: "4px",
        backgroundColor: "#f5f5f5",
        cursor: "not-allowed",
    },
    select: {
        width: "100%",
        padding: "8px",
        border: "1px solid #ccc",
        borderRadius: "4px",
    },
    button: {
        padding: "10px",
        backgroundColor: "#0070f3",
        color: "#fff",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        width: "100%",
    },
};
