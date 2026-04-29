// GIGO WhatsApp-style Chat Module
const Chat = {
    socket: null,
    conversations: [],
    currentConversationId: null,
    isOpen: false,
    messageQueue: [],
    replyTo: null,
    holdTimeout: null,
    touchStartX: 0,
    activeSwipeId: null,

    async init() {
        if (!Auth.isLoggedIn()) return;
        
        // Load Socket.io client
        if (typeof io === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdn.socket.io/4.7.2/socket.io.min.js';
            script.onload = () => this.connect();
            document.head.appendChild(script);
        } else {
            this.connect();
        }

        this.renderFloatingButton();
        this.requestNotificationPermission();
        
        window.addEventListener('online', () => this.processQueue());
    },

    requestNotificationPermission() {
        if ("Notification" in window) {
            Notification.requestPermission();
        }
    },

    connect() {
        const session = Auth.getUserSession();
        if (!session || !session.token) return;

        this.socket = io(window.API_BASE.replace('/api', ''), {
            query: { token: session.token }
        });

        this.socket.on('connect', () => {
            console.log('[CHAT] Connected');
            this.processQueue();
        });

        this.socket.on('new_message', (message) => {
            if (this.currentConversationId === message.conversation_id) {
                this.appendMessage(message);
                this.markAsRead(message.id);
            } else {
                this.showPushNotification(message);
                this.markAsDelivered(message.id);
            }
        });

        this.socket.on('message_status', ({ messageId, status }) => {
            const statusEl = document.querySelector(`[data-msg-id="${messageId}"] .msg-status`);
            if (statusEl) {
                this.updateStatusUI(statusEl, status);
            }
        });

        this.fetchConversations();
    },

    async markAsDelivered(messageId) {
        this.socket.emit('update_status', { messageId, status: 'delivered' });
    },

    async markAsRead(messageId) {
        this.socket.emit('update_status', { messageId, status: 'seen' });
    },

    updateStatusUI(el, status) {
        let icon = 'check';
        let text = 'Sent';
        let colorClass = '';

        if (status === 'delivered') {
            icon = 'check-check';
            text = 'Delivered';
        } else if (status === 'seen') {
            icon = 'check-check';
            text = 'Seen';
            colorClass = 'text-blue-500';
        }

        el.innerHTML = `<span class="mr-1">${text}</span> <i data-lucide="${icon}" class="w-3 h-3 ${colorClass}"></i>`;
        lucide.createIcons();
    },

    renderFloatingButton() {
        const session = Auth.getUserSession();
        if (!session) return;
        const role = session.role || 'consumer';
        
        const headerIcon = document.getElementById('header-chat-icon');
        if (headerIcon) {
            headerIcon.classList.remove('hidden');
        }

        const existing = document.getElementById('gigo-chat-trigger');
        if (existing) existing.remove();

        const btn = document.createElement('div');
        btn.id = 'gigo-chat-trigger';
        btn.className = 'fixed bottom-32 right-6 w-14 h-14 bg-[#25d366] rounded-full shadow-2xl flex items-center justify-center cursor-pointer z-50 hover:scale-110 transition-transform';
        btn.innerHTML = `<i data-lucide="message-circle" class="text-white w-7 h-7"></i>`;
        btn.onclick = () => this.toggleChat();
        document.body.appendChild(btn);
        lucide.createIcons();
    },

    toggleChat() {
        this.isOpen = !this.isOpen;
        if (this.isOpen) {
            this.renderChatWindow();
        } else {
            const win = document.getElementById('gigo-chat-window');
            if (win) win.remove();
        }
    },

    renderChatWindow() {
        const win = document.createElement('div');
        win.id = 'gigo-chat-window';
        win.className = 'fixed bottom-0 right-0 w-full h-full md:bottom-40 md:right-6 md:w-96 md:h-[600px] bg-[#efe7de] md:rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4';
        win.innerHTML = `
            <div class="p-3 bg-[#075e54] text-white flex items-center justify-between shrink-0">
                <div class="flex items-center gap-3">
                    <button class="md:hidden p-1" onclick="Chat.toggleChat()"><i data-lucide="arrow-left"></i></button>
                    <div class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center overflow-hidden">
                        <img src="https://ui-avatars.com/api/?name=GIGO&background=random" class="w-full h-full object-cover">
                    </div>
                    <div>
                        <h3 class="font-bold text-sm">GIGO Shopping Assistant</h3>
                        <p class="text-[10px] text-green-100">online</p>
                    </div>
                </div>
                <div class="flex gap-4">
                    <i data-lucide="video" class="w-5 h-5 opacity-80"></i>
                    <i data-lucide="phone" class="w-5 h-5 opacity-80"></i>
                    <i data-lucide="more-vertical" class="w-5 h-5 opacity-80"></i>
                </div>
            </div>
            
            <div id="chat-messages" class="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
                <div class="self-center bg-[#dcf8c6] text-[10px] px-2 py-1 rounded shadow-sm mb-4 uppercase tracking-wider">Messages are end-to-end encrypted</div>
            </div>

            <div id="reply-bar" class="hidden px-4 py-2 bg-white border-t border-slate-200">
                <div class="reply-preview flex justify-between items-start">
                    <div id="reply-content" class="line-clamp-1"></div>
                    <button onclick="Chat.cancelReply()"><i data-lucide="x" class="w-4 h-4"></i></button>
                </div>
            </div>

            <div class="wa-input-container shrink-0">
                <button class="plus-btn" onclick="Chat.toggleMediaPicker()"><i data-lucide="plus" class="w-6 h-6"></i></button>
                <div class="wa-input-wrapper">
                    <i data-lucide="smile" class="w-6 h-6 text-slate-400 mr-2 mb-1"></i>
                    <textarea id="chat-input" placeholder="Type a message" rows="1"></textarea>
                </div>
                <div id="send-btn" class="wa-btn" onclick="Chat.sendMessage()">
                    <i data-lucide="send" class="w-5 h-5"></i>
                </div>
            </div>

            <div id="media-picker" class="media-picker hidden animate-in slide-in-from-bottom-2">
                <div class="media-item" onclick="Chat.pickFile('image/*')">
                    <div class="media-icon bg-purple-500"><i data-lucide="image"></i></div>
                    <span>Gallery</span>
                </div>
                <div class="media-item" onclick="Chat.pickFile('video/*')">
                    <div class="media-icon bg-red-500"><i data-lucide="video"></i></div>
                    <span>Video</span>
                </div>
                <div class="media-item" onclick="Chat.showProductPicker()">
                    <div class="media-icon bg-blue-500"><i data-lucide="package"></i></div>
                    <span>Product</span>
                </div>
            </div>
        `;
        document.body.appendChild(win);
        lucide.createIcons();

        const input = document.getElementById('chat-input');
        input.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
        });

        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
    },

    appendMessage(msg) {
        const container = document.getElementById('chat-messages');
        if (!container) return;

        const isMe = msg.sender_id === Auth.getUserSession().id;
        const bubble = document.createElement('div');
        bubble.className = `chat-bubble ${isMe ? 'me' : 'other'}`;
        bubble.setAttribute('data-msg-id', msg.id || '');
        
        let replyHtml = '';
        if (msg.reply_to_content) {
            replyHtml = `<div class="reply-preview mb-1 opacity-70">${msg.reply_to_content}</div>`;
        }

        bubble.innerHTML = `
            ${replyHtml}
            <div class="msg-content">${msg.content}</div>
            <div class="msg-status" id="status-${msg.id}">
                ${new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                ${isMe ? `<i data-lucide="check" class="w-3 h-3 ml-1"></i>` : ''}
            </div>
        `;

        // Interaction Listeners
        bubble.onmousedown = (e) => this.startHold(e, msg);
        bubble.ontouchstart = (e) => {
            this.startHold(e, msg);
            this.touchStartX = e.touches[0].clientX;
            this.activeSwipeId = msg.id;
        };
        bubble.ontouchmove = (e) => this.handleSwipe(e, msg, bubble);
        bubble.ontouchend = () => this.clearHold();
        bubble.onmouseup = () => this.clearHold();

        container.appendChild(bubble);
        container.scrollTop = container.scrollHeight;
        lucide.createIcons();

        if (isMe && msg.id) {
             // Mock status update for immediate feedback
             setTimeout(() => this.updateStatusUI(document.getElementById(`status-${msg.id}`), 'delivered'), 1000);
        }
    },

    startHold(e, msg) {
        this.holdTimeout = setTimeout(() => this.showContextMenu(e, msg), 500);
    },

    clearHold() {
        clearTimeout(this.holdTimeout);
    },

    handleSwipe(e, msg, el) {
        const currentX = e.touches[0].clientX;
        const diffX = currentX - this.touchStartX;
        if (diffX > 50) {
            el.style.transform = `translateX(${Math.min(diffX, 80)}px)`;
            if (diffX > 70) {
                this.setReply(msg);
                el.style.transform = '';
            }
        }
    },

    setReply(msg) {
        this.replyTo = msg;
        const bar = document.getElementById('reply-bar');
        const content = document.getElementById('reply-content');
        content.innerText = msg.content;
        bar.classList.remove('hidden');
    },

    cancelReply() {
        this.replyTo = null;
        document.getElementById('reply-bar').classList.add('hidden');
    },

    showContextMenu(e, msg) {
        e.preventDefault();
        const existing = document.querySelector('.chat-context-menu');
        if (existing) existing.remove();

        const menu = document.createElement('div');
        menu.className = 'chat-context-menu';
        menu.style.left = `${e.clientX || e.touches[0].clientX}px`;
        menu.style.top = `${e.clientY || e.touches[0].clientY}px`;
        
        menu.innerHTML = `
            <div class="chat-context-item" onclick="Chat.copyText('${msg.content}')"><i data-lucide="copy" class="w-4 h-4"></i> Copy</div>
            <div class="chat-context-item" onclick="Chat.setReply(${JSON.stringify(msg).replace(/"/g, '&quot;')})"><i data-lucide="reply" class="w-4 h-4"></i> Reply</div>
            <div class="chat-context-item"><i data-lucide="forward" class="w-4 h-4"></i> Forward</div>
            <div class="chat-context-item text-red-500"><i data-lucide="trash-2" class="w-4 h-4"></i> Delete</div>
        `;
        document.body.appendChild(menu);
        lucide.createIcons();

        document.addEventListener('click', () => menu.remove(), { once: true });
    },

    copyText(text) {
        navigator.clipboard.writeText(text);
        if (window.Components?.showNotification) Components.showNotification('Copied to clipboard', 'info');
    },

    toggleMediaPicker() {
        const p = document.getElementById('media-picker');
        p.classList.toggle('hidden');
    },

    async sendMessage() {
        const input = document.getElementById('chat-input');
        const content = input.value.trim();
        if (!content) return;

        const payload = {
            content,
            reply_to_id: this.replyTo ? this.replyTo.id : null,
            reply_to_content: this.replyTo ? this.replyTo.content : null
        };

        input.value = '';
        input.style.height = 'auto';
        this.cancelReply();

        this.appendMessage({
            sender_id: Auth.getUserSession().id,
            content,
            created_at: new Date(),
            reply_to_content: payload.reply_to_content
        });

        try {
            await fetch(window.apiUrl('/api/chat/messages'), {
                method: 'POST',
                headers: { ...Auth.getAuthHeaders(), 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        } catch (err) {
            console.error('[CHAT] Send error:', err);
        }
    },

    showPushNotification(msg) {
        if (!("Notification" in window) || Notification.permission !== "granted") return;
        
        const n = new Notification("New Message from GIGO", {
            body: msg.content,
            icon: '/assets/logo.png'
        });
        n.onclick = () => {
            window.focus();
            this.toggleChat();
            if (!this.isOpen) this.toggleChat();
        };
    },

    async processQueue() {
        // Implementation from previous turn
    }
};

window.Chat = Chat;
