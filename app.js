let currentUser = null;
let selectedPain = null;

// Check for logged in user on page load
window.onload = () => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showRatingSection();
        loadHistory();
    }
    createPainScale();
};

// Create pain scale buttons
function createPainScale() {
    const painScale = document.getElementById('painScale');
    for (let i = 0; i <= 10; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        button.style.backgroundColor = getColor(i);
        
        button.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('.pain-scale button').forEach(btn => {
                btn.classList.remove('selected');
            });
            button.classList.add('selected');
            selectedPain = i;
        });
        
        painScale.appendChild(button);
    }
}

function login() {
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    
    if (!username || !email) {
        alert('Please enter both username and email');
        return;
    }

    // Check if user exists
    const userData = JSON.parse(localStorage.getItem(`user_${username}`)) || {
        username,
        email,
        ratings: []
    };

    // Update email if different
    userData.email = email;
    localStorage.setItem(`user_${username}`, JSON.stringify(userData));

    // Set current user
    currentUser = { username, email };
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    showRatingSection();
    loadHistory();
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    document.getElementById('loginSection').classList.remove('hidden');
    document.getElementById('ratingSection').classList.add('hidden');
    document.getElementById('historySection').classList.add('hidden');
    document.getElementById('username').value = '';
    document.getElementById('email').value = '';
}

function showRatingSection() {
    document.getElementById('loginSection').classList.add('hidden');
    document.getElementById('ratingSection').classList.remove('hidden');
    document.getElementById('historySection').classList.remove('hidden');
    document.getElementById('userDisplay').textContent = currentUser.username;
}

function submitRating() {
    if (!currentUser || selectedPain === null) {
        alert('Please select a pain level');
        return;
    }

    const userData = JSON.parse(localStorage.getItem(`user_${currentUser.username}`));
    
    userData.ratings.push({
        painLevel: selectedPain,
        timestamp: new Date().toISOString()
    });

    localStorage.setItem(`user_${currentUser.username}`, JSON.stringify(userData));

    // Reset pain selection
    selectedPain = null;
    document.querySelectorAll('.pain-scale button').forEach(btn => {
        btn.classList.remove('selected');
    });

    loadHistory();
}

function loadHistory() {
    if (!currentUser) return;

    const userData = JSON.parse(localStorage.getItem(`user_${currentUser.username}`));
    const historyContainer = document.getElementById('historyContainer');
    historyContainer.innerHTML = '';

    userData.ratings.slice().reverse().forEach(entry => {
        const entryDiv = document.createElement('div');
        entryDiv.className = 'entry';
        entryDiv.innerHTML = `
            <p><strong>Pain Level:</strong> ${entry.painLevel}</p>
            <p><strong>Time:</strong> ${new Date(entry.timestamp).toLocaleString()}</p>
        `;
        historyContainer.appendChild(entryDiv);
    });
}

function exportToJson() {
    if (!currentUser) return;

    const userData = JSON.parse(localStorage.getItem(`user_${currentUser.username}`));
    const dataStr = JSON.stringify(userData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `pain_ratings_${currentUser.username}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function getColor(level) {
    if (level <= 3) return '#4CAF50';
    if (level <= 6) return '#FFC107';
    return '#F44336';
}