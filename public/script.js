const socket = io();
let currentUser = "";

function switchAuth(type) {
    const signInForm = document.getElementById('signin-form');
    const signUpForm = document.getElementById('signup-form');
    const tabSignIn = document.getElementById('tab-signin');
    const tabSignUp = document.getElementById('tab-signup');

    if (type === 'signin') {
        signInForm.classList.remove('hidden');
        signUpForm.classList.add('hidden');
        tabSignIn.classList.add('active');
        tabSignUp.classList.remove('active');
    } else {
        signInForm.classList.add('hidden');
        signUpForm.classList.remove('hidden');
        tabSignIn.classList.remove('active');
        tabSignUp.classList.add('active');
    }
}

function handleAuth(type) {
    const userField = type === 'signin' ? 'signin-user' : 'signup-user';
    const username = document.getElementById(userField).value;

    if (username.trim() !== "") {
        currentUser = username;
        document.getElementById('display-username').innerText = currentUser;
        document.getElementById('login-overlay').classList.add('hidden');
        document.getElementById('dashboard').classList.remove('hidden');
        socket.emit('userJoined', currentUser);
    } else {
        alert("Please enter a username.");
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
            <p>Bid: <span style="color:#00ff88">$${item.currentBid}</span></p>
        `;
        container.appendChild(box);
    });
});

socket.on('userCount', (count) => {
    document.getElementById('live-users').innerText = `Users Connected: ${count}`;
});