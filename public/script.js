const socket = (typeof io === 'function') ? io() : null;
let currentUser = "";

// In-memory user store: { username -> { email, password } }
let registeredUsers = {};

function emitSocket(event, payload) {
    if (socket) {
        socket.emit(event, payload);
    }
}

function onSocket(event, handler) {
    if (socket) {
        socket.on(event, handler);
    }
}

// DIRECT PAGE SHOW/HIDE LOGIC
function showPage(pageId) {
    document.getElementById('page-dash').classList.add('hidden');
    document.getElementById('page-trends').classList.add('hidden');
    document.getElementById('page-security').classList.add('hidden');

    document.getElementById('page-' + pageId).classList.remove('hidden');

    document.querySelectorAll('.nav-links a').forEach(link => link.classList.remove('active'));
    const activeLink = document.getElementById('link-' + pageId);
    if (activeLink) activeLink.classList.add('active');
}

function switchAuth(type) {
    const isSignIn = (type === 'signin');
    document.getElementById('signin-form').classList.toggle('hidden', !isSignIn);
    document.getElementById('signup-form').classList.toggle('hidden', isSignIn);
    document.getElementById('tab-signin').classList.toggle('active', isSignIn);
    document.getElementById('tab-signup').classList.toggle('active', !isSignIn);
}

function handleSignUp() {
    const user  = document.getElementById('signup-new-user').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const pass  = document.getElementById('signup-new-pass').value.trim();

    if (!user) {
        alert("Please enter a username.");
        return;
    }
    if (!email.toLowerCase().endsWith("@gmail.com")) {
        alert("Please use a valid @gmail.com address.");
        return;
    }
    if (!pass) {
        alert("Please enter a password.");
        return;
    }
    if (registeredUsers[user]) {
        alert("Username already taken. Please choose another.");
        return;
    }

    // Register the user
    registeredUsers[user] = { email, password: pass };

    // Pre-fill sign in fields for convenience
    document.getElementById('signin-user').value = user;
    document.getElementById('signin-pass').value = pass;

    // Notify user and switch to Sign In so they must authenticate explicitly
    alert("Account created! Please sign in to continue.");
    switchAuth('signin');
}

function handleSignIn() {
    const user = document.getElementById('signin-user').value.trim();
    const pass = document.getElementById('signin-pass').value.trim();

    if (!user || !pass) {
        alert("Please enter both username and password.");
        return;
    }

    const record = registeredUsers[user];
    if (!record) {
        alert("Username not found. Please Sign Up first.");
        return;
    }
    if (record.password !== pass) {
        alert("Incorrect password. Please try again.");
        return;
    }

    loginUser(user);
}

function loginUser(user) {
    currentUser = user;
    document.getElementById('display-username').innerText = currentUser;

    // Remove login overlay completely
    const overlay = document.getElementById('login-overlay');
    overlay.remove();

    document.getElementById('dashboard').classList.remove('hidden');
    emitSocket('userJoined', currentUser);
}

// CONTACT SUPPORT FUNCTIONS
function openContact()  { document.getElementById('contact-modal').classList.remove('hidden'); }
function closeContact() { document.getElementById('contact-modal').classList.add('hidden'); }
function sendContact()  {
    alert("Message sent to Aakash!");
    closeContact();
}

// RESET ALL
function resetAll() {
    emitSocket('resetData');
}

// AUCTION CORE LOGIC
onSocket('init', (auctions) => {
    const container = document.getElementById('auction-container');
    container.innerHTML = '';
    auctions.forEach(item => {
        const box = document.createElement('div');
        box.className = 'auction-box';
        box.id = 'auction-' + item.id;
        box.innerHTML = `
            <div class="image-placeholder" style="background-image: url('${item.img}')"></div>
            <h3>${item.name}</h3>
            <p>Current Bid: <strong id="bid-${item.id}">$${item.currentBid}</strong></p>
            <input type="number" id="input-${item.id}" placeholder="Enter your bid...">
            <button class="bid-btn" onclick="placeBid(${item.id}, '${item.name}')">BID NOW</button>
        `;
        container.appendChild(box);
    });
});

function placeBid(id, itemName) {
    const input = document.getElementById(`input-${id}`);
    const bidAmount = parseInt(input.value);
    
    if (!bidAmount || bidAmount <= 0) {
        alert("Please enter a valid bid amount.");
        return;
    }
    
    // Get the current bid value
    const currentBidElement = document.getElementById(`bid-${id}`);
    const currentBidText = currentBidElement.innerText;
    const currentBid = parseInt(currentBidText.replace('$', ''));
    
    // Check if bid is higher than current bid
    if (bidAmount <= currentBid) {
        alert(`Your bid is too low! Current bid is $${currentBid}. Please place a bid higher than $${currentBid}.`);
        return;
    }
    
    emitSocket('placeBid', { id, bidAmount, user: currentUser, itemName });
    input.value = '';
}

onSocket('activity', (msg) => {
    const feed = document.getElementById('activity-feed');
    const entry = document.createElement('div');
    entry.style.cssText = "padding: 8px 0; border-bottom: 1px solid #222; font-size: 13px; color: #aaa;";
    entry.innerText = msg;
    feed.prepend(entry);
});

onSocket('userCount', (count) => {
    const el = document.getElementById('live-users');
    if (el) el.innerText = `Users Connected: ${count}`;
});