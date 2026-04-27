const socket = io();
let allItems = [];

// 1. Initialize data from server
socket.on('init', (data) => {
    allItems = data;
    renderUI(allItems);
});

// 2. Real-time updates for successful bids
socket.on('update', (data) => {
    allItems = data;
    renderUI(allItems);
});

// 3. LISTEN FOR ERROR POP-UP (This is what you requested)
socket.on('errorMsg', (errorMessage) => {
    alert("🚨 BID REJECTED: " + errorMessage);
});

// 4. Update Activity Feed and User Count
socket.on('userCount', (count) => {
    document.getElementById('user-count').innerText = `Users Connected: ${count}`;
});

socket.on('activity', (data) => {
    const feed = document.getElementById('activity-feed');
    const entry = document.createElement('div');
    entry.style.marginBottom = "8px";
    entry.innerHTML = `<span style="color:#00d4ff">></span> ${data.msg}`;
    feed.prepend(entry);
});

socket.on('clearFeed', () => {
    document.getElementById('activity-feed').innerHTML = "";
});

// UI Rendering Engine
function renderUI(items) {
    const grid = document.getElementById('auction-grid');
    grid.innerHTML = items.map(item => `
        <div class="auction-card">
            <small style="color:#00d4ff">${item.category}</small>
            <h3>${item.item}</h3>
            <div class="price-box">$${item.currentBid}</div>
            <p style="font-size:12px; color:#8b949e">Leader: <strong>${item.highestBidder}</strong></p>
            <input type="number" id="input-${item.id}" placeholder="Enter bid">
            <button class="bid-btn" onclick="placeBid(${item.id})">BID NOW</button>
        </div>
    `).join('');
}

function placeBid(id) {
    const amount = document.getElementById(`input-${id}`).value;
    const user = "Aakash"; // Link this to a login session if needed
    if(!amount) return alert("Please enter an amount!");
    
    // Send bid to server
    socket.emit('placeBid', { id, amount, user });
}

function triggerReset() {
    if(confirm("Wipe all history and reset prices?")) {
        socket.emit('resetAuction');
    }
}

function filterItems(category) {
    const filtered = category === 'All' ? allItems : allItems.filter(i => i.category === category);
    renderUI(filtered);
}