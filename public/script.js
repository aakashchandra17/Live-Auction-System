const socket = io();
let currentUser = "";

// 1. LOGIN LOGIC
function handleLogin() {
    const input = document.getElementById('username-input');
    if (input.value.trim() !== "") {
        currentUser = input.value;
        document.getElementById('display-username').innerText = currentUser;
        document.getElementById('login-overlay').classList.add('hidden');
        document.getElementById('dashboard').classList.remove('hidden');
        
        // Let server know we joined
        socket.emit('userJoined', currentUser);
    } else {
        alert("Enter a name to access the dashboard.");
    }
}

// 2. RENDER AUCTION BOXES
socket.on('init', (auctions) => {
    const container = document.getElementById('auction-container');
    container.innerHTML = ''; 

    auctions.forEach(item => {
        const box = document.createElement('div');
        box.className = 'auction-box';
        box.innerHTML = `
            <div class="image-placeholder" style="background-image: url('${item.img}')"></div>
            <h3>${item.name}</h3>
            <p>Current Bid: <strong style="color:#00ff88">$${item.currentBid}</strong></p>
            <input type="number" id="input-${item.id}" class="bid-input" placeholder="Enter bid > $${item.currentBid}">
            <button class="bid-btn" onclick="placeBid(${item.id})">PLACE BID</button>
        `;
        container.appendChild(box);
    });
});

// 3. PLACE BID LOGIC
function placeBid(id) {
    const input = document.getElementById(`input-${id}`);
    const bidAmount = parseInt(input.value);

    if (!bidAmount) {
        alert("Enter a valid number!");
        return;
    }

    socket.emit('placeBid', { id, bidAmount, user: currentUser });
    input.value = '';
}

// 4. LIVE UPDATES
socket.on('updateBid', (data) => {
    // Refresh the view or update the specific element
    // For simplicity, we usually let the 'init' or a 'refresh' event handle this
});

socket.on('activity', (msg) => {
    const feed = document.getElementById('activity-feed');
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.innerText = msg;
    feed.prepend(entry);
});

socket.on('userCount', (count) => {
    document.getElementById('live-users').innerText = `Users Connected: ${count}`;
});

function resetAll() {
    if(confirm("Are you sure you want to reset all auction data?")) {
        socket.emit('resetData');
    }
}