const Support = require('../models/Support');

const createSupportTicket = async (req, res) => {
    try {
        const { subject, message, category } = req.body;

        if (!subject || !message || !category) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const ticket = await Support.create({
            parentUserId: req.user._id,
            subject,
            message,
            category
        });

        res.status(201).json({ message: "Support ticket created successfully", ticket });
    } catch (error) {
        console.error("Support Ticket Error:", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = {
    createSupportTicket
};
