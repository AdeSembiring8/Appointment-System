import User from '../../../../models/User';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import connectDB from '../../../../utils/connectDB';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        await connectDB(); 

        const { username } = req.body;

        try {
            const user = await User.findOne({ username });

            if (!user) {
                console.log('User not found');
                return res.status(404).json({ message: 'User not found' });
            }

            const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
                expiresIn: '1h',
            });

            res.status(200).json({ token,userId: user._id });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
}
