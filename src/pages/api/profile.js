import User from "../../../models/User";
import connectDB from "../../../utils/connectDB";
import mongoose from "mongoose";

connectDB();

export default async function handler(req, res) {
    if (req.method !== "PUT") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    try {
        const { userId, name, preferred_timezone } = req.body;
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { name, preferred_timezone },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(updatedUser);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
}
