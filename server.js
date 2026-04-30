const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

// Items preserved exactly from your list/image
let auctions = [
    { id: 1, name: "McLaren P1", currentBid: 5000, img: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=500" },
    { id: 2, name: "Rolex Daytona", currentBid: 1200, img: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=500" },
    { id: 3, name: "iPhone 17 Pro Max", currentBid: 800, img: "iphone.avif" },
    { id: 4, name: "Gaming PC RTX 4090", currentBid: 2500, img: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=500" },
    { id: 5, name: "MacBook Pro M3", currentBid: 1800, img: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500" },
    { id: 6, name: "Sony A7IV Camera", currentBid: 2100, img: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500" },
    { id: 7, name: "Jordan 1 Retro", currentBid: 300, img: "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=500" },
    { id: 8, name: "Tesla Powerwall", currentBid: 4500, img: "Tesla.webp" },
    { id: 9, name: "Diamond Ring", currentBid: 9000, img: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500" }
];

let connectedUsers = 0;

io.on('connection', (socket) => {
    connectedUsers++;
    io.emit('userCount', connectedUsers);
    socket.emit('init', auctions);

    socket.on('userJoined', (username) => {
        io.emit('activity', `${username} joined the auction room`);
    });

    // UPDATED PLACE BID LISTENER
    socket.on('placeBid', (data) => {
        const item = auctions.find(a => a.id === data.id);
        if (item && data.bidAmount > item.currentBid) {
            item.currentBid = data.bidAmount;
            
            // Sync new bid across all clients
            io.emit('init', auctions); 
            
            // Format: "Username placed Amount bid on ItemName"
            const activityMsg = `${data.user} placed ${data.bidAmount} bid on ${item.name}`;
            io.emit('activity', activityMsg);
        }
    });

    socket.on('resetData', () => {
        auctions.forEach(a => a.currentBid = 100);
        io.emit('init', auctions);
        io.emit('activity', "System Admin reset all auction data.");
    });

    socket.on('disconnect', () => {
        connectedUsers--;
        io.emit('userCount', connectedUsers);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));