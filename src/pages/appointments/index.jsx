import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LogoutButton from "../../components/logout";

export default function Appointments() {
    const [appointments, setAppointments] = useState([]);
    const router = useRouter();
    const [username, setUsername] = useState("");

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userId = localStorage.getItem("user_id");
                if (!userId) {
                    router.push("/login");
                    return;
                }
                const res = await axios.get(`/api/users/${userId}`);
                setUsername(res.data.username);
                console.log("Username:", res.data.username);
            } catch (error) {
                console.error("Failed to fetch user data", error);
            }
        };

        const fetchAppointments = async () => {
            try {
                const token = localStorage.getItem("token");
                const userId = localStorage.getItem("user_id");
                if (!token || !userId) {
                    router.push("/login");
                    return;
                }

                const res = await axios.get(`/api/appointments?userId=${userId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const now = new Date();
                const validAppointments = res.data.filter((appointment) => new Date(appointment.end) > now);

                const expiredAppointments = res.data.filter((appointment) => new Date(appointment.end) <= now);
                expiredAppointments.forEach(async (appointment) => {
                    await axios.delete(`/api/appointments?id=${appointment._id}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                });

                validAppointments.sort((a, b) => new Date(a.start) - new Date(b.start));
                setAppointments(validAppointments);
            } catch (error) {
                alert("Failed to fetch appointments");
            }
        };

        fetchUserData();
        fetchAppointments();
    }, [router]);


    return (
        <div style={styles.container}>
            <div style={styles.headerContainer}>
                <h1 style={styles.title}>Appointments</h1>
                <p
                    style={{ ...styles.title, cursor: "pointer", color: "black" }}
                    onClick={() => router.push("/profile")}
                >
                    {username}
                </p>
            </div>
            <ul style={styles.list}>
                {appointments.map((appointment) => (
                    <li key={appointment._id} style={styles.listItem}>
                        <div style={styles.header}>
                            <h2>{appointment.title}</h2>
                            <div style={styles.creator}>
                                <p><strong>Created by:</strong></p>
                                <p>{appointment.creator_id.name} ({appointment.creator_id.username})</p>
                            </div>
                        </div>
                        <p>
                            <strong>Start:</strong> {new Date(appointment.start).toLocaleString()}
                        </p>
                        <p>
                            <strong>End:</strong> {new Date(appointment.end).toLocaleString()}
                        </p>
                        <div style={styles.participants}>
                            <p><strong>Participants:</strong></p>
                            <ul>
                                {appointment.participants.map((participant) => (
                                    <li key={participant._id}>
                                        {participant.name} ({participant.username})
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </li>
                ))}
            </ul>
            <button onClick={() => router.push("/create-appointment")} style={styles.button}>
                Create New Appointment
            </button>
            <ToastContainer />
        </div>
    );
}

const styles = {
    container: {
        padding: "20px",
        maxWidth: "800px",
        margin: "0 auto",
    },
    headerContainer: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "20px",
    },
    userInfo: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
    },
    username: {
        fontWeight: "bold",
    },
    profileButton: {
        padding: "5px 10px",
        backgroundColor: "#0070f3",
        color: "#fff",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
    },
    title: {
        fontSize: "2rem",
    },
    list: {
        listStyle: "none",
        padding: "0",
    },
    listItem: {
        backgroundColor: "#fff",
        padding: "15px",
        marginBottom: "10px",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    },
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
    },
    creator: {
        textAlign: "right",
    },
    participants: {
        marginTop: "10px",
    },
    button: {
        padding: "10px 20px",
        backgroundColor: "#0070f3",
        color: "#fff",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        marginTop: "20px",
    },
};

