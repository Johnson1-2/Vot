function loadUsers() {
  const chats = getChats();
  const list = document.getElementById("userList");
  list.innerHTML = "";
  let totalUnread = 0;
  
  Object.keys(chats).forEach(name => {
    const unreadCount = chats[name].filter(m => m.from === "user" && m.read === false).length;
    totalUnread += unreadCount;
    
    // Improved badge and name layout for better visibility when zooming
    const badgeHtml = unreadCount > 0 ? `<span class="unread-badge">${unreadCount}</span>` : "";
    const initial = name.charAt(0);
    const div = document.createElement("div");
    div.className = "user-list-item" + (selectedUser === name ? " active" : "");
    
    // We use a flex container here so zoom doesn't break the alignment
    div.innerHTML = `
        <div onclick="openChat('${name}')" style="flex:1; display:flex; align-items:center; overflow:hidden;">
            <div class="admin-user-icon">${initial}</div>
            <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${name}</span>
            ${badgeHtml}
        </div>
        <span class="delete-user" onclick="deleteCustomer('${name}')" style="padding: 10px;">✕</span>`;
    list.appendChild(div);
  });
  
  document.title = totalUnread > 0 ? `(${totalUnread}) Support Chat` : "Support Chat | Admin Dashboard";
}

function loadAdminMessages() {
  const chats = getChats();
  const box = document.getElementById("messages");
  box.innerHTML = "";
  if (!selectedUser || !chats[selectedUser]) return;

  chats[selectedUser].forEach((m, i) => {
    const div = document.createElement("div");
    // This ensures bubbles don't shrink weirdly when you zoom in
    div.className = "message " + (m.from === "admin" ? "user-bubble" : "admin-bubble");
    
    let content = m.text ? `<div style="word-break: break-word;">${m.text}</div>` : `<img src="${m.image}" class="chat-image">`;
    
    div.innerHTML = `
        <div>
            ${content} 
            <span class="delete-msg" onclick="deleteMessage(${i})" style="margin-left: 10px; cursor: pointer;">×</span>
        </div>
        <span class="time">${m.time}</span>`;
    box.appendChild(div);
  });
  box.scrollTop = box.scrollHeight;
}
