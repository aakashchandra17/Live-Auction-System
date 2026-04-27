const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

let activeUsers = 0;

// Data for 9 items to create a full 3x3 scrollable grid
const getInitialData = () => [
    { id: 1, category: 'Supercars', item: "McLaren P1 Concept", currentBid: 1600, highestBidder: "Genesis", endTime: Date.now() + 600000 },
    { id: 2, category: 'Tech', item: "RTX 5090 GPU", currentBid: 2200, highestBidder: "Admin", endTime: Date.now() + 1200000 },
    { id: 3, category: 'Art', item: "Neon Cyberpunk Canvas", currentBid: 450, highestBidder: "User_99", endTime: Date.now() + 300000 },
    { id: 4, category: 'Supercars', item: "Bugatti Mistral", currentBid: 5000, highestBidder: "Collector_A", endTime: Date.now() + 800000 },
    { id: 5, category: 'Tech', item: "MacBook Pro M4 Max", currentBid: 3500, highestBidder: "Dev_Aakash", endTime: Date.now() + 1500000 },
    { id: 6, category: 'Art', item: "Space Station VR Art", currentBid: 700, highestBidder: "Astronaut_1", endTime: Date.now() + 450000 },
    { id: 7, category: 'Supercars', item: "Koenigsegg Jesko", currentBid: 4200, highestBidder: "Speedster", endTime: Date.now() + 900000 },
    { id: 8, category: 'Tech', item: "Holographic Display V1", currentBid: 1200, highestBidder: "TechGuru", endTime: Date.now() + 2000000 },
    { id: 9, category: 'Art', item: "Abstract Void Sculpture", currentBid: 300, highestBidder: "Gallery_X", endTime: Date.now() + 100000 }
];

let auctions = getInitialData();

io.on('connection', (socket) => {
    activeUsers++;
    io.emit('userCount', activeUsers);
    socket.emit('init', auctions);

    socket.on('placeBid', (data) => {
        const id = parseInt(data.id);
        const bid = parseFloat(data.amount);
        const index = auctions.findIndex(a => a.id === id);

        if (index !== -1) {
            // ENGINEERING LOGIC: Check if bid is actually higher
            if (bid > auctions[index].currentBid) {
                auctions[index].currentBid = bid;
                auctions[index].highestBidder = data.user;
                
                io.emit('update', auctions);
                io.emit('activity', { msg: `${data.user} bid $${bid} on Item #${id}` });
            } else {
                // FAIL STATE: Send a targeted error message back to the sender only
                socket.emit('errorMsg', `Your bid of $${bid} is too low! It must be higher than $${auctions[index].currentBid}.`);
            }
        }
    });

    socket.on('resetAuction', () => {
        auctions = getInitialData();
        io.emit('update', auctions);
        io.emit('clearFeed');
        io.emit('activity', { msg: "--- ADMIN RESET: SYSTEM REBOOTED ---" });
    });

    socket.on('disconnect', () => {
        activeUsers--;
        io.emit('userCount', activeUsers);
    });
});

server.listen(3000, () => console.log("Server running on http://localhost:3000"));