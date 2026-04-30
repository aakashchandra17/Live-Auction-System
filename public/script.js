const socket = io();
let currentUser = "";
let registeredUsers = []; // Session memory for mandatory signup check

/**
 * AUTHENTICATION LOGIC
 * Mandatory flow: Sign Up -> Sign In -> Dashboard
 */

// Toggle between Sign In and Sign Up tabs
function switchAuth(type) {
    const isSignIn = (type === 'signin');
    
    // Toggle Form Visibility
    document.getElementById('signin-form').classList.toggle('hidden', !isSignIn);
    document.getElementById('signup-form').classList.toggle('hidden', isSignIn);
    
    // Toggle Tab Styling
    document.getElementById('tab-signin').classList.toggle('active', isSignIn);
    document.getElementById('tab-signup').classList.toggle('active', !isSignIn);
}

// STEP 1: COMPULSORY SIGN UP WITH GMAIL VALIDATION
function handleSignUp() {
    const user = document.getElementById('signup-new-user').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const pass = document.getElementById('signup-new-pass').value.trim();

    // Check if all fields are filled
    if (!user || !email || !pass) {
        alert("Registration is mandatory. Please fill all fields.");
        return;
    }

    // MANDATORY: Check for @gmail.com suffix
    if (!email.toLowerCase().endsWith("@gmail.com")) {
        alert("Invalid Email! You must use a @gmail.com address to register.");
        return;
    }

    // Save to session memory
    registeredUsers.push(user); 
    alert("Account Created Successfully! Please Sign In with your credentials.");
    
    // Clear sign-up fields
    document.getElementById('signup-new-user').value = "";
    document.getElementById('signup-email').value = "";
    document.getElementById('signup-new-pass').value = "";
    
    // Force switch to Sign In tab
    switchAuth('signin');
}

// STEP 2: SIGN IN WITH MANDATORY CHECK
function handleSignIn() {
    const user = document.getElementById('signin-user').value.trim();
    const pass = document.getElementById('signin-pass').value.trim();

    if (user && pass) {
        // Validation: User must have registered during this session
        if (!registeredUsers.includes(user)) {
            alert("Error: Username not found. Signup is mandatory before signing in!");
            switchAuth('signup'); 
            return;
        }

        // Proceed to the Auction Dashboard
        currentUser = user;
        document.getElementById('display-username').innerText = currentUser;
        document.getElementById('login-overlay').classList.add('hidden');
        document.getElementById('dashboard').classList.remove('hidden');
        
        socket.emit('userJoined', currentUser);
    } else {
        alert("Please enter credentials to enter the auction.");
    }
}

/**
 * DASHBOARD & BIDDING LOGIC
 * Preserves the interface seen in your screenshots
 */

// Initialize auction items from server
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
            <input type="number" id="input-${item.id}" 
                   style="width:100%; padding:8px; margin:10px 0; background:#000; border:1px solid #444; color:white;" 
                   placeholder="Bid > $${item.currentBid}">
            <button class="bid-btn" onclick="placeBid(${item.id}, '${item.name}')">PLACE BID</button>
        `;
        container.appendChild(box);
    });
});

// Logic to place a bid with low-bid popup alert
function placeBid(id, itemName) {
    const input = document.getElementById(`input-${id}`);
    const bidAmount = parseInt(input.value);
    
    // Get the current bid value from the UI
    const currentBidElement = document.querySelector(`.auction-box:nth-child(${id}) strong`);
    const currentBidValue = parseInt(currentBidElement.innerText.replace('$', ''));

    if (!bidAmount) {
        alert("Please enter a bid amount.");
        return;
    }

    // ALERT: If bid is less than or equal to current bid
    if (bidAmount <= currentBidValue) {
        alert(`Your bid of $${bidAmount} is too low! You must bid more than $${currentBidValue}.`);
        return;
    }

    // Sends specific format: "Username placed Amount bid on Item"
    socket.emit('placeBid', { id, bidAmount, user: currentUser, itemName: itemName });
    input.value = '';
}

// Update the Live Activity Feed
socket.on('activity', (msg) => {
    const feed = document.getElementById('activity-feed');
    const entry = document.createElement('div');
    entry.style.cssText = "font-size: 13px; color: #888; margin-bottom: 5px; border-bottom: 1px solid #222;";
    entry.innerText = msg;
    feed.prepend(entry);
});

// Update the connection counter
socket.on('userCount', (count) => {
    const userDisplay = document.getElementById('live-users');
    if(userDisplay) userDisplay.innerText = `Users Connected: ${count}`;
});

// Admin Reset Function
function resetAll() {
    if(confirm("Reset all bids?")) socket.emit('resetData');
}