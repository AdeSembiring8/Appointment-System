import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function CreateAppointment() {
    const [title, setTitle] = useState("");
    const [start, setStart] = useState("");
    const [end, setEnd] = useState("");
    const [participants, setParticipants] = useState("");
    const [userList, setUserList] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const router = useRouter();
    const [existingAppointments, setExistingAppointments] = useState([]);

    useEffect(() => {
        if (participants.length > 1) {
            const fetchUsers = async () => {
                try {
                    const res = await axios.get(`/api/users/search?query=${participants}`);
                    setUserList(res.data);
                } catch (error) {
                    console.error("Error fetching users:", error);
                }
            };

            const debounce = setTimeout(fetchUsers, 300);
            return () => clearTimeout(debounce);
        } else {
            setUserList([]);
        }
    }, [participants]);

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const token = localStorage.getItem("token");
                const userId = localStorage.getItem("user_id");

                if (!token || !userId) {
                    console.error("User not authenticated");
                    return;
                }

                const res = await axios.get("/api/appointments", {
                    params: { userId },
                    headers: { Authorization: `Bearer ${token}` },
                });

                setExistingAppointments(res.data);
            } catch (error) {
                console.error("Error fetching existing appointments:", error.response?.data || error.message);
            }
        };

        if (selectedUsers.length > 0) {
            fetchAppointments();
        }
    }, [selectedUsers]);
    const isValidTimeRange = (dateTime) => {
        const localTime = new Date(dateTime);
        const hours = localTime.getHours();

        return hours >= 8 && hours < 17;
    };

    const isTimeConflicting = (newStart, newEnd) => {
        const startDate = new Date(newStart);
        const endDate = new Date(newEnd);

        return existingAppointments.some(({ start, end }) => {
            const existingStart = new Date(start);
            const existingEnd = new Date(end);

            return (
                (startDate >= existingStart && startDate < existingEnd) ||
                (endDate > existingStart && endDate <= existingEnd) ||
                (startDate <= existingStart && endDate >= existingEnd)
            );
        });
    };
    const handleStartChange = (e) => {
        const newStart = e.target.value;

        if (!isValidTimeRange(newStart)) {
            alert("Waktu mulai harus antara 08:00 dan 17:00!");
            return;
        }

        if (isTimeConflicting(newStart, end)) {
            alert("Waktu bertabrakan dengan janji temu yang sudah ada!");
            return;
        }

        setStart(newStart);
    };

    const handleEndChange = (e) => {
        const newEnd = e.target.value;

        if (!isValidTimeRange(newEnd)) {
            alert("Waktu selesai harus antara 08:00 dan 17:00!");
            return;
        }

        if (isTimeConflicting(start, newEnd)) {
            alert("Waktu bertabrakan dengan janji temu yang sudah ada!");
            return;
        }

        setEnd(newEnd);
    };


    const handleSelectUser = (user) => {
        setSelectedUsers((prev) => {
            if (!prev.includes(user._id)) {
                return [...prev, user._id];
            }
            return prev;
        });

        setParticipants("");
        setUserList([]);
    };

    const getLocalDateTime = () => {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        return now.toISOString().slice(0, 16);
    };

    const removeUser = (userId) => {
        setSelectedUsers((prev) => prev.filter((id) => id !== userId));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isValidTimeRange(start) || !isValidTimeRange(end)) {
            alert("Waktu appointment harus antara 08:00 dan 17:00!");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            const creator_id = localStorage.getItem("user_id");

            if (!token || !creator_id) {
                router.push("/login");
                return;
            }

            const participantIds = selectedUsers.map((user) => user);
            const startUTC = new Date(start).toISOString();
            const endUTC = new Date(end).toISOString();

            console.log("Data being sent:", {
                title,
                creator_id,
                start: startUTC,
                end: endUTC,
                participants: selectedUsers
            });

            const response = await axios.post(
                "/api/appointments",
                {
                    title,
                    creator_id,
                    start: startUTC,
                    end: endUTC,
                    participants: [...selectedUsers]
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            console.log("Appointment created:", response.data);
            alert("Appointment created successfully!");
            router.push("/appointments");
        } catch (error) {
            console.error("Error creating appointment:", error.response?.data);
            if (error.response?.data?.message === "Token expired, please login again") {
                alert("Token expired, please login again");
                router.push("/login");
            } else {
                alert(error.response?.data?.message || "Failed to create appointment");
            }
        }
    };


    return (
        <div style={styles.container}>
            <h1 style={styles.title}>Create Appointment</h1>
            <form onSubmit={handleSubmit} style={styles.form}>
                <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} style={styles.input} required />
                <div style={styles.participantContainer}>
                    <input type="text" placeholder="Search username" value={participants} onChange={(e) => setParticipants(e.target.value)} style={styles.input} />
                    {userList.length > 0 && (
                        <ul style={styles.dropdown}>
                            {userList.map((user) => (
                                <li key={user._id} onClick={() => handleSelectUser(user)} style={styles.dropdownItem}>
                                    {user.name} ({user.username})
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div style={styles.selectedUsers}>
                    {selectedUsers.map((userId) => (
                        <span key={userId} style={styles.tag}>
                            {userId} <button onClick={() => removeUser(userId)} style={styles.removeButton}>x</button>
                        </span>
                    ))}
                </div>
                <input
                    type="datetime-local"
                    value={start}
                    onChange={handleStartChange}
                    min={new Date().toISOString().slice(0, 16)}
                    required
                    style={styles.input}
                />
                <input
                    type="datetime-local"
                    value={end}
                    onChange={handleEndChange}
                    min={start || new Date().toISOString().slice(0, 16)}
                    required
                    style={styles.input}
                />


                <button type="submit" style={styles.button}>Create Appointment</button>
            </form>
            <ToastContainer />
        </div>
    );
}
const styles = {
    container: {
        padding: '20px',
        maxWidth: '800px',
        margin: '0 auto',
    },
    title: {
        fontSize: '2rem',
        marginBottom: '20px',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
    },
    input: {
        padding: '10px',
        marginBottom: '10px',
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
    participantContainer: {
        position: 'relative',
    },
    dropdown: {
        position: 'absolute',
        backgroundColor: '#fff',
        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
        borderRadius: '5px',
        width: '100%',
        maxHeight: '150px',
        overflowY: 'auto',
        marginTop: '5px',
        zIndex: 10,
        listStyle: 'none',
        padding: 0,
    },
    dropdownItem: {
        padding: '10px',
        cursor: 'pointer',
        borderBottom: '1px solid #eee',
    },
    dropdownItemHover: {
        backgroundColor: '#f0f0f0',
    },
    selectedUsers: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '5px',
        marginBottom: '10px',
    },
    tag: {
        backgroundColor: '#0070f3',
        color: '#fff',
        padding: '5px 10px',
        borderRadius: '15px',
        display: 'flex',
        alignItems: 'center',
    },
    removeButton: {
        marginLeft: '5px',
        background: 'none',
        border: 'none',
        color: '#fff',
        cursor: 'pointer',
    },
};
