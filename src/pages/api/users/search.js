import User from "../../../../models/User";
import connectDB from "../../../../utils/connectDB";

connectDB();

export default async function handler(req, res) {
    if (req.method === "GET") {
        const { query } = req.query;

        if (!query) {
            return res.status(400).json({ message: "Query is required" });
        }

        try {
            const users = await User.find(
                { username: { $regex: query, $options: "i" } },
                "_id name username" // Hanya ambil _id, name, dan username
            ).limit(10);

            res.status(200).json(users);
        } catch (error) {
            res.status(500).json({ message: "Server error" });
        }
    } else {
        res.status(405).json({ message: "Method not allowed" });
    }
}
