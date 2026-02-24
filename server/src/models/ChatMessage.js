const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: String,
    sender: String,
    message: String,
    context: mongoose.Schema.Types.Mixed,
    suggestions: [String],
    fallback: Boolean,
}, { timestamps: true });

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);
module.exports = ChatMessage;
