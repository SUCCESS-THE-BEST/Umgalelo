const app = require('./src/app');
const http = require('http');

const { Server } = require('socket.io');
const messageModel = require('./src/models/message');

/* CREATE HTTP SERVER */

const server = http.createServer(app);

/* SOCKET.IO */

const io = new Server(server, {
  cors: {
    origin: [
      'http://127.0.0.1:5500',
      'http://localhost:5500',
      'http://127.0.0.1:5501',
      'http://localhost:5501'
    ],
    methods: ['GET', 'POST']
  }
});

/* SOCKET CONNECTION */

io.on('connection', (socket) => {

    console.log('User connected:', socket.id);

    /* JOIN SOCIETY ROOM */

    socket.on('join_society', (societyId) => {

        socket.join(`society_${societyId}`);

        console.log(`User joined society_${societyId}`);

    });

    socket.on('typing', (data) => {
    socket.to(`society_${data.societyId}`)
        .emit('user_typing', data.name);
    });
    

    /* RECEIVE MESSAGE */

    socket.on('send_message', async (data) => {

      try {
            // data = {
            //     societyId,
            //     senderId,
            //     sender,
            //     message
            // }

          /* SAVE TO DATABASE */

          await messageModel.saveMessage(
              data.societyId,
              data.senderId,
              data.message
          );

          /* SEND TO SOCIETY ROOM */

          io.to(`society_${data.societyId}`).emit(
              'receive_message',
              {
                  sender: data.sender,
                  senderId: data.senderId,
                  message: data.message,
                  createdAt: new Date()
              }
          );

      } catch (error) {

          console.error(error);
      }

  });

    socket.on('disconnect', () => {

        console.log('User disconnected:', socket.id);

    });

});

/* START SERVER */

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {

    console.log(`Server running on http://localhost:${PORT}`);

});