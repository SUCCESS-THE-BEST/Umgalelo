require('dotenv').config();

const app = require('./src/app');
const http = require('http');
const { Server } = require('socket.io');
const messageModel = require('./src/models/message');

const server = http.createServer(app);

const allowedOrigins = [
    'http://127.0.0.1:5500',
    'http://localhost:5500',
    'http://127.0.0.1:5501',
    'http://localhost:5501',
    'https://success-the-best.github.io',
    process.env.FRONTEND_URL
].filter(Boolean);

const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ['GET', 'POST'],
        credentials: true
    }
});

io.on('connection', socket => {
    console.log('User connected:', socket.id);

    socket.on('join_society', societyId => {
        if (!societyId) return;

        socket.join(`society_${societyId}`);
        console.log(`User joined society_${societyId}`);
    });

    socket.on('typing', data => {
        if (!data?.societyId || !data?.name) return;

        socket
            .to(`society_${data.societyId}`)
            .emit('user_typing', data.name);
    });

    socket.on('send_message', async data => {
        try {
            if (
                !data?.societyId ||
                !data?.senderId ||
                !data?.message
            ) {
                return;
            }

            await messageModel.saveMessage(
                data.societyId,
                data.senderId,
                data.message
            );

            io.to(`society_${data.societyId}`).emit('receive_message', {
                sender: data.sender,
                senderId: data.senderId,
                message: data.message,
                createdAt: new Date()
            });

        } catch (error) {
            console.error('Socket message error:', error);
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});