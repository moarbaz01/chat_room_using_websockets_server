// // We are just getting socket data by client usign "connection" event
// // We are using .on to get data from client
// // We are using .emit to send data to client

// io.on('connection' , (socket) => {
//     // Basic Emit : ".emit is used to send data"
//     // In this we are sending data to client by using socket object got by client side as parameter
//     // We can send any data type to the user

//     socket.emit('event' , 'data');

//     // By using .broadcast we can send data to all the users except the user who is sending data

//     socket.broadcast.emit('event', 'data');

//     // By using .room we can send data to particular room 
//     // Here room is like group of sockets where each on socket communicate with other in room
//     socket.room('room-id').emit('event', 'data');

//     // 
//     socket.to('socket.id').emit('event', 'data');
// })