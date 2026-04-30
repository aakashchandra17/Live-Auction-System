const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

let auctions = [
    { id: 1, name: "McLaren P1", currentBid: 5000, img: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=500" },
    { id: 2, name: "Rolex Daytona", currentBid: 1200, img: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=500" },
    { id: 3, name: "iPhone 17 Pro Max", currentBid: 1199, img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR6A7_z7E-Y0rV3RshQhB6pA7h-Y9Y6p7E7gA&s" },
    { id: 4, name: "Gaming PC", currentBid: 2500, img: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=500" },
    { id: 5, name: "MacBook Pro", currentBid: 1800, img: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500" },
    { id: 6, name: "Sony Camera", currentBid: 2100, img: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500" },
    { id: 7, name: "Jordan 1 Retro", currentBid: 300, img: "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=500" },
    { id: 8, name: "Powerwall", currentBid: 4500, img: "https://images.unsplash.com/photo-1620714223084-8fcacc6dfd8d?w=500" },
    { id: 9, name: "Diamond Ring", currentBid: 9000, img: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500" }
];

io.on('connection', (socket) => {
    socket.emit('init', auctions);
});

server.listen(3000, () => console.log("Server running on port 3000"));