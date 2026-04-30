const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

// THE DATA (The 9 boxes your Mam wants to see)
let auctions = [
    { id: 1, name: "McLaren P1", currentBid: 5000, img: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=500" },
    { id: 2, name: "Rolex Daytona", currentBid: 1200, img: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=500" },
    { id: 3, name: "iPhone 15 Pro", currentBid: 800, img: "https://images.unsplash.com/photo-1696446701796-da61225697cc?w=500" },
    { id: 4, name: "Gaming PC RTX 4090", currentBid: 2500, img: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=500" },
    { id: 5, name: "MacBook Pro M3", currentBid: 1800, img: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500" },
    { id: 6, name: "Sony A7IV Camera", currentBid: 2100, img: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500" },
    { id: 7, name: "Jordan 1 Retro", currentBid: 300, img: "https://images.unsplash.com/photo-1584735175315-9d5df23860e6?w=500" },
    { id: 8, name: "Tesla Powerwall", currentBid: 4500, img: "https://images.unsplash.com/photo-1620714223084-8fcacc6dfd8d?w=500" },
    { id: 9, name: "Diamond Ring", currentBid: 9000, img: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500" }
];

let connectedUsers = 0;

io.on('connection', (socket) => {
    connectedUsers++;
    io.emit('userCount', connectedUsers);
    
    // Send initial items to the new user
    socket.emit('init', auctions);

    // Handle user login event
    socket.on('userJoined', (username) => {
        io.emit('activity', `${username} joined the auction room`);
    });

    // Handle bidding
    socket.on('placeBid', (data) => {
        const item = auctions.find(a => a.id === data.id);
        if (item && data.bidAmount > item.currentBid) {
            item.currentBid = data.bidAmount;
            // Tell everyone about the new bid
            io.emit('init', auctions); 
            io.emit('activity', `${data.user} bid $${data.bidAmount} on ${item.name}`);
        }
    });

    // Handle reset
    socket.on('resetData', () => {
        auctions.forEach(a => a.currentBid = Math.floor(Math.random() * 1000) + 100);
        io.emit('init', auctions);
        io.emit('activity', "System Admin reset all auction data.");
    });

    socket.on('disconnect', () => {
        connectedUsers--;
        io.emit('userCount', connectedUsers);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});