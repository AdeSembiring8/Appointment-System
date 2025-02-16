import User from '../models/User.js';
import Appointment from '../models/Appointment.js';
import connectDB from './connectDB.js';

connectDB();

const seedData = async () => {
    // Tambahkan contoh user
    const user1 = new User({
        name: 'John Doe',
        username: 'johndoe',
        preferred_timezone: 'Asia/Jakarta',
    });
    await user1.save();

    const user2 = new User({
        name: 'Jane Smith',
        username: 'janesmith',
        preferred_timezone: 'Pacific/Auckland',
    });
    await user2.save();

    const user3 = new User({
        name: 'Ade Sembiring',
        username: 'ade',
        preferred_timezone: 'Pacific/Auckland',
    });
    await user2.save();

    // Tambahkan contoh appointment
    const appointment1 = new Appointment({
        title: 'Team Meeting',
        creator_id: user1._id,
        start: new Date('2023-10-15T09:00:00Z'),
        end: new Date('2023-10-15T10:00:00Z'),
        participants: [user2._id],
    });
    await appointment1.save();

    const appointment2 = new Appointment({
        title: 'Team Meeting',
        creator_id: user2._id,
        start: new Date('2023-10-15T09:00:00Z'),
        end: new Date('2023-10-15T10:00:00Z'),
        participants: [user3._id],
    });
    await appointment2.save();

    console.log('Data seeded successfully');
};

seedData().catch((error) => {
    console.error('Error seeding data:', error);
});