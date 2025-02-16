import Appointment from "../../../models/Appointment";
import User from "../../../models/User";
import connectDB from "../../../utils/connectDB";
import jwt from "jsonwebtoken";
import mongoose from 'mongoose';
import moment from 'moment-timezone';

connectDB();

export default async function handler(req, res) {
    if (req.method === "GET") {
        try {
            const { userId } = req.query;
            if (!userId) return res.status(400).json({ message: "User ID is required" });

            // Ambil user dan timezone
            const user = await User.findById(userId);
            if (!user) return res.status(404).json({ message: "User not found" });

            const userTimezone = user.preferred_timezone || "UTC"; // Default UTC jika tidak ada preferensi

            const now = new Date();
            await Appointment.deleteMany({ end: { $lt: now } });

            let appointments = await Appointment.find({
                $or: [{ creator_id: userId }, { participants: userId }],
            })
                .populate("creator_id", "name username preferred_timezone")
                .populate("participants", "name username preferred_timezone")
                .sort({ start: 1 });

            // Konversi waktu ke zona waktu user yang login
            appointments = appointments.map(appt => ({
                ...appt._doc,
                start: moment.utc(appt.start).tz(userTimezone).format("YYYY-MM-DD HH:mm:ss"),
                end: moment.utc(appt.end).tz(userTimezone).format("YYYY-MM-DD HH:mm:ss"),
            }));

            res.status(200).json(appointments);
        } catch (error) {
            console.error("Error fetching appointments:", error);
            res.status(500).json({ message: "Server error" });
        }
    }
    else if (req.method === "POST") {
        const { title, start, end, participants, creator_id } = req.body;
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) return res.status(401).json({ message: "Unauthorized" });

        try {
            if (!creator_id) {
                return res.status(400).json({ message: "creator_id tidak ditemukan di request body" });
            }

            if (!mongoose.Types.ObjectId.isValid(creator_id)) {
                return res.status(400).json({ message: "creator_id tidak valid" });
            }

            // Ambil zona waktu pengguna dari database
            const creator = await User.findById(creator_id);
            if (!creator) return res.status(404).json({ message: "Creator tidak ditemukan" });

            const userTimezone = creator.preferred_timezone || "UTC"; // Default ke UTC jika tidak ada

            // Konversi waktu UTC ke zona waktu pengguna
            const startLocal = moment.utc(start).tz(userTimezone);
            const endLocal = moment.utc(end).tz(userTimezone);

            // Validasi hanya boleh antara jam 08:00 - 17:00 di zona waktu pengguna
            const startHour = startLocal.hour();
            const endHour = endLocal.hour();

            if (startHour < 8 || startHour >= 17 || endHour < 8 || endHour > 17) {
                return res.status(400).json({ message: "Waktu janji temu harus antara 08:00 - 17:00 di zona waktu pengguna." });
            }

            // Cek konflik jadwal
            const participantDocs = await User.find({ _id: { $in: participants } }).select("_id");
            const participantIds = participantDocs.map((user) => user._id);

            const conflictingAppointments = await Appointment.find({
                $and: [
                    {
                        $or: [{ creator_id }, { participants: { $in: [...participantIds, creator_id] } }]
                    },
                    { start: { $lt: new Date(end) } },
                    { end: { $gt: new Date(start) } }
                ]
            });

            if (conflictingAppointments.length > 0) {
                return res.status(400).json({ message: "Jadwal bertabrakan dengan janji temu yang sudah ada." });
            }

            if (participantIds.length === 0) {
                return res.status(400).json({ message: "No valid participants found" });
            }

            // Simpan janji temu (tetap dalam UTC)
            const appointment = new Appointment({
                title,
                creator_id,
                start: moment.utc(start).toDate(),
                end: moment.utc(end).toDate(),
                participants: participantIds,
            });

            await appointment.save();
            res.status(201).json(appointment);

        } catch (error) {
            console.error("Error creating appointment:", error);

            if (error instanceof jwt.TokenExpiredError) {
                return res.status(401).json({ message: "Token expired, please login again" });
            }

            res.status(500).json({ message: "Terjadi kesalahan di server" });
        }
    } else {
        res.status(405).json({ message: "Method not allowed" });
    }
}
