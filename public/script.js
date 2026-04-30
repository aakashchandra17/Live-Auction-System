const socket = io();
let currentUser = "";

function handleLogin() {
    const input = document.getElementById('username-input');
    if (input.value.trim() !== "") {
        currentUser = input.value;
        document.getElementById('display-username').innerText = currentUser;
        document.getElementById('login-overlay').classList.add('hidden');
        document.getElementById('dashboard').classList.remove('hidden');
        socket.emit('userJoined', currentUser);
    } else {
        alert("Please enter your name.");
    }
}

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
            <input type="number" id="input-${item.id}" style="width:100%; padding:8px; margin:10px 0; background:#000; border:1px solid #444; color:white;" placeholder="Bid > $${item.currentBid}">
            <button class="bid-btn" onclick="placeBid(${item.id})">PLACE BID</button>
        `;
        container.appendChild(box);
    });
});

function placeBid(id) {
    const input = document.getElementById(`input-${id}`);
    const bidAmount = parseInt(input.value);
    if (bidAmount) {
        socket.emit('placeBid', { id, bidAmount, user: currentUser });
        input.value = '';
    }
}

socket.on('activity', (msg) => {
    const feed = document.getElementById('activity-feed');
    const entry = document.createElement('div');
    entry.style.cssText = "font-size: 13px; color: #888; margin-bottom: 5px; border-bottom: 1px solid #222;";
    entry.innerText = msg;
    feed.prepend(entry);
});

socket.on('userCount', (count) => {
    const userDisplay = document.getElementById('live-users');
    if(userDisplay) userDisplay.innerText = `Users Connected: ${count}`;
});

function resetAll() {
    if(confirm("Reset all bids?")) socket.emit('resetData');
}