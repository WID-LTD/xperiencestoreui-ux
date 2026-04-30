/**
 * chat.js - Lightweight Chat System
 * Handles real-time messaging, conversation management, and UI logic
 */

const Chat = {
    socket: null,
    conversations: [],
    currentConversationId: null,
    replyTo: null,

    async init() {
        if (!Auth.isLoggedIn()) return;
        
        // Load Socket.io client if not present
        if (typeof io === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdn.socket.io/4.7.2/socket.io.min.js';
            script.onload = () => this.connect();
            document.head.appendChild(script);
        } else {
            this.connect();
        }

        this.requestNotificationPermission();
    },

    requestNotificationPermission() {
        if ("Notification" in window && Notification.permission === "default") {
            Notification.requestPermission();
        }
    },

    connect() {
        const session = Auth.getUserSession();
        if (!session || !session.token) return;

        // Connect to root namespace (strip /api if present)
        const socketUrl = window.API_BASE.replace('/api', '');
        this.socket = io(socketUrl, {
            query: { token: session.token },
            transports: ['websocket', 'polling']
        });

        this.socket.on('connect', () => {
            console.log('[CHAT] Connected to server');
        });

        this.socket.on('new_message', (message) => {
            this.handleIncomingMessage(message);
        });

        this.socket.on('message_status', ({ messageId, status }) => {
            this.updateMessageStatus(messageId, status);
        });

        this.socket.on('disconnect', () => {
            console.log('[CHAT] Disconnected');
        });
    },

    async initPage() {
        console.log('[CHAT] Initializing Chat Page UI');
        this.renderConversations();
        this.setupInputHandlers();
        await this.fetchConversations();
    },

    async fetchConversations() {
        try {
            const response = await fetch(window.apiUrl('/api/chat/conversations'), {
                headers: Auth.getAuthHeaders()
            });
            if (response.ok) {
                this.conversations = await response.json();
                this.renderConversations();
            }
        } catch (err) {
            console.error('[CHAT] Failed to fetch conversations:', err);
        }
    },

    renderConversations() {
        const listContainer = document.getElementById('chat-list');
        if (!listContainer) return;

        if (this.conversations.length === 0) {
            listContainer.innerHTML = `
                <div class="p-8 text-center text-slate-400">
                    <p class="text-xs font-bold uppercase tracking-widest mb-2">No Active Chats</p>
                    <p class="text-[10px]">Start a conversation from a product or supplier page.</p>
                </div>
            `;
            return;
        }

        listContainer.innerHTML = this.conversations.map(conv => {
            const isActive = this.currentConversationId === conv.id;
            const lastMsg = conv.last_message || { content: 'No messages yet', created_at: conv.created_at };
            const otherUser = conv.participants?.find(p => p.id !== Auth.getUserSession().id) || { name: 'Chat' };

            return `
                <div onclick="Chat.selectConversation(${conv.id})" 
                     class="p-4 rounded-2xl cursor-pointer transition-all flex gap-3 hover:bg-white hover:shadow-md ${isActive ? 'bg-white shadow-md border-l-4 border-blue-600' : 'bg-transparent'}">
                    <div class="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold shrink-0">
                        ${otherUser.name.charAt(0).toUpperCase()}
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="flex justify-between items-center mb-0.5">
                            <h4 class="font-bold text-sm text-slate-800 truncate">${otherUser.name}</h4>
                            <span class="text-[9px] text-slate-400">${this.formatTime(lastMsg.created_at)}</span>
                        </div>
                        <p class="text-[11px] text-slate-500 truncate">${lastMsg.content}</p>
                    </div>
                    ${conv.unread_count > 0 ? `<div class="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>` : ''}
                </div>
            `;
        }).join('');
    },

    async selectConversation(id) {
        this.currentConversationId = id;
        
        // UI Updates
        document.getElementById('chat-empty-state')?.classList.add('hidden');
        const mainArea = document.getElementById('chat-main');
        if (mainArea) mainArea.classList.remove('hidden');

        const conv = this.conversations.find(c => c.id === id);
        if (conv) {
            const otherUser = conv.participants?.find(p => p.id !== Auth.getUserSession().id) || { name: 'Support' };
            document.getElementById('active-chat-name').textContent = otherUser.name;
            document.getElementById('active-chat-avatar').textContent = otherUser.name.charAt(0).toUpperCase();
        }

        this.renderConversations(); // Update active state in list
        await this.loadMessages(id);
    },

    async loadMessages(conversationId) {
        const container = document.getElementById('chat-messages');
        if (!container) return;

        container.innerHTML = '<div class="flex justify-center py-10"><div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>';

        try {
            const response = await fetch(window.apiUrl(`/api/chat/conversations/${conversationId}/messages`), {
                headers: Auth.getAuthHeaders()
            });
            if (response.ok) {
                const messages = await response.json();
                this.renderMessages(messages);
                this.scrollToBottom();
            }
        } catch (err) {
            console.error('[CHAT] Failed to load messages:', err);
        }
    },

    renderMessages(messages) {
        const container = document.getElementById('chat-messages');
        if (!container) return;

        const myId = Auth.getUserSession().id;
        container.innerHTML = messages.map(msg => this.getMessageHtml(msg, myId)).join('');
        lucide.createIcons();
    },

    getMessageHtml(msg, myId) {
        const isMe = msg.sender_id === myId;
        const time = this.formatTime(msg.created_at);
        
        return `
            <div class="flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div class="max-w-[80%] ${isMe ? 'bg-blue-600 text-white rounded-l-2xl rounded-tr-2xl' : 'bg-white text-slate-800 rounded-r-2xl rounded-tl-2xl shadow-sm'} p-3 px-4">
                    ${msg.reply_to_content ? `<div class="mb-2 p-2 bg-black/10 rounded-lg text-[10px] italic border-l-2 border-white/30">${msg.reply_to_content}</div>` : ''}
                    <p class="text-sm leading-relaxed">${msg.content}</p>
                    <div class="flex items-center justify-end gap-1 mt-1 opacity-70">
                        <span class="text-[9px] font-medium">${time}</span>
                        ${isMe ? `<i data-lucide="${this.getStatusIcon(msg.status)}" class="w-3 h-3"></i>` : ''}
                    </div>
                </div>
            </div>
        `;
    },

    getStatusIcon(status) {
        if (status === 'seen') return 'check-check';
        if (status === 'delivered') return 'check';
        return 'clock';
    },

    handleIncomingMessage(msg) {
        if (this.currentConversationId === msg.conversation_id) {
            const container = document.getElementById('chat-messages');
            if (container) {
                const myId = Auth.getUserSession().id;
                container.insertAdjacentHTML('beforeend', this.getMessageHtml(msg, myId));
                this.scrollToBottom();
                lucide.createIcons();
                // Mark as read via socket
                this.socket.emit('mark_read', { conversationId: msg.conversation_id, messageId: msg.id });
            }
        } else {
            this.showNotification(msg);
        }
        this.fetchConversations(); // Refresh list to update previews
    },

    async sendMessage() {
        const input = document.getElementById('chat-input');
        const content = input.value.trim();
        if (!content || !this.currentConversationId) return;

        const payload = {
            conversation_id: this.currentConversationId,
            content,
            reply_to_id: this.replyTo?.id || null,
            reply_to_content: this.replyTo?.content || null
        };

        // Reset input
        input.value = '';
        input.style.height = 'auto';
        this.cancelReply();

        try {
            const response = await fetch(window.apiUrl('/api/chat/messages'), {
                method: 'POST',
                headers: { ...Auth.getAuthHeaders(), 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const sentMsg = await response.json();
                // We'll get it back via socket, but we can optimistically append if we want
                // For now, socket will handle the real-time update
            }
        } catch (err) {
            console.error('[CHAT] Failed to send message:', err);
            Components.showNotification('Failed to send message', 'error');
        }
    },

    setupInputHandlers() {
        const input = document.getElementById('chat-input');
        if (!input) return;

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

    cancelReply() {
        this.replyTo = null;
        document.getElementById('chat-reply-preview')?.classList.add('hidden');
    },

    scrollToBottom() {
        const container = document.getElementById('chat-messages');
        if (container) container.scrollTop = container.scrollHeight;
    },

    formatTime(date) {
        const d = new Date(date);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    },

    showNotification(msg) {
        if ("Notification" in window && Notification.permission === "granted") {
            new Notification("New Message", {
                body: msg.content,
                icon: 'assets/logo.png'
            });
        }
        Components.showNotification('New message received', 'info');
    }
};

// Global Handlers
window.handleChatSubmit = (e) => {
    e.preventDefault();
    Chat.sendMessage();
};

window.Chat = Chat;
Chat.init();
