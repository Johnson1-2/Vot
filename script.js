// SIDEBAR TOGGLE LOGIC
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

// CONFIG & STORAGE
const TELEGRAM_BOT_TOKEN = '8557391650:AAFMcTDp0I8uXxCV4TGZZyjYWHwAKTcqxFQ';
const TELEGRAM_CHAT_ID = '8419125080';
let currentUser = "", selectedUser = "", pendingImageData = "";

const getChats = () => JSON.parse(localStorage.getItem("chats") || "{}");
const saveChats = (c) => localStorage.setItem("chats", JSON.stringify(c));
const getUsers = () => JSON.parse(localStorage.getItem("users") || "{}");
const saveUsers = (u) => localStorage.setItem("users", JSON.stringify(u));

// AUTH
window.login = function() {
    const name = document.getElementById("nameInput").value.trim();
    const pass = document.getElementById("passwordInput").value;
    const pwdContainer = document.getElementById("pwdContainer");

    if (!name) return;
    if (name.toLowerCase() === "akwan") {
        document.getElementById("login").classList.add("hidden");
        document.getElementById("adminPanel").classList.remove("hidden");
        loadUsers(); return;
    }

    if (pwdContainer.classList.contains("hidden")) {
        pwdContainer.classList.remove("hidden");
        return;
    }

    const users = getUsers();
    if (!users[name]) {
        users[name] = { password: pass };
        saveUsers(users);
        const chats = getChats();
        chats[name] = [{ from: "admin", text: "Welcome! How can we help?", time: new Date().toLocaleTimeString() }];
        saveChats(chats);
    }
    
    currentUser = name;
    document.getElementById("login").classList.add("hidden");
    document.getElementById("customerPanel").classList.remove("hidden");
    loadCustomerMessages();
};

window.logout = function() {
    location.reload();
};

// ADMIN USER LIST & CHAT SELECT
function loadUsers() {
    const chats = getChats();
    const list = document.getElementById("userList");
    list.innerHTML = "";
    Object.keys(chats).forEach(name => {
        const div = document.createElement("div");
        div.className = "user-list-item " + (selectedUser === name ? "active" : "");
        div.innerHTML = `<div onclick="openChat('${name}')" style="display:flex; align-items:center;">
                            <div class="admin-user-icon">${name[0].toUpperCase()}</div>
                            <span>${name}</span>
                         </div>`;
        list.appendChild(div);
    });
}

window.openChat = function(name) {
    selectedUser = name;
    // Auto-close sidebar on mobile after selecting user
    const sidebar = document.getElementById("sidebar");
    if(sidebar.classList.contains("expanded")) sidebar.classList.remove("expanded");
    
    document.getElementById("chatHeader").textContent = "Chatting with " + name;
    loadAdminMessages();
    loadUsers();
};

// MESSAGE LOADING
function loadAdminMessages() {
    const chats = getChats();
    const box = document.getElementById("messages");
    box.innerHTML = "";
    if(!chats[selectedUser]) return;
    chats[selectedUser].forEach(m => {
        const div = document.createElement("div");
        div.className = "message " + (m.from === "admin" ? "user-bubble" : "admin-bubble");
        div.innerHTML = `<div>${m.text || `<img src="${m.image}" style="max-width:100%">`}</div>`;
        box.appendChild(div);
    });
    box.scrollTop = box.scrollHeight;
}

function loadCustomerMessages() {
    const chats = getChats();
    const box = document.getElementById("customerMessages");
    box.innerHTML = "";
    (chats[currentUser] || []).forEach(m => {
        const div = document.createElement("div");
        div.className = "message " + (m.from === "user" ? "user-bubble" : "admin-bubble");
        div.innerHTML = `<div>${m.text || `<img src="${m.image}" style="max-width:100%">`}</div>`;
        box.appendChild(div);
    });
    box.scrollTop = box.scrollHeight;
}

// MESSAGE SENDING
window.sendAdminMessage = function() {
    const input = document.getElementById("messageInput");
    if(!input.value.trim() || !selectedUser) return;
    const chats = getChats();
    chats[selectedUser].push({ from: "admin", text: input.value, time: new Date().toLocaleTimeString() });
    saveChats(chats); input.value = ""; loadAdminMessages();
};

window.sendCustomerMessage = function() {
    const input = document.getElementById("customerInput");
    if(!input.value.trim()) return;
    const chats = getChats();
    chats[currentUser].push({ from: "user", text: input.value, time: new Date().toLocaleTimeString() });
    saveChats(chats); input.value = ""; loadCustomerMessages();
};
