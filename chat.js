/**
 * chat.js - Support Chat Module
 * Handles direct messaging with Admin/Support
 */

import { Auth } from './auth.js?v=3.2.0';
import { Components } from './components.js?v=3.2.0';

export const Chat = {
    socket: null,
    conversations: [],
    currentConversationId: null,
    messageQueue: [],
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

        console.log('[CHAT] Support module initialized');
    },

    connect() {
        const session = Auth.getUserSession();
        if (!session || !session.token) return;

        // Connect to socket server (API_BASE usually has /api, we want the root)
        const socketUrl = window.API_BASE.replace('/api', '');
        this.socket = io(socketUrl, {
            query: { token: session.token }
        });

        this.socket.on('connect', () => {
            console.log('[CHAT] Socket connected');
            this.fetchConversations();
        });

        this.socket.on('new_message', (message) => {
            if (this.currentConversationId === message.conversation_id) {
                this.appendMessage(message);
                this.socket.emit('mark_read', { messageId: message.id });
            } else {
                this.fetchConversations(); // Refresh list to show badge
                Components.showNotification(`New message from ${message.sender_name || 'Support'}`, 'info');
            }
        });

        this.socket.on('message_status', ({ messageId, status }) => {
            const el = document.querySelector(`[data-msg-id="${messageId}"] .status-icon`);
            if (el) this.updateStatusUI(el, status);
        });
    },

    async fetchConversations() {
        try {
            const response = await fetch(window.apiUrl('/api/chat/conversations'), {
                headers: Auth.getAuthHeaders()
            });
            if (response.ok) {
                this.conversations = await response.json();
                this.renderConversationList();
            }
        } catch (err) {
            console.error('[CHAT] Fetch error:', err);
        }
    },

    renderConversationList() {
        const list = document.getElementById('chat-sidebar-list');
        if (!list) return;

        if (this.conversations.length === 0) {
            list.innerHTML = '<div class="p-8 text-center text-slate-400">No active support tickets</div>';
            return;
        }

        list.innerHTML = this.conversations.map(conv => `
            <div onclick="Chat.openConversation('${conv.id}')" 
                 class="p-4 flex items-center gap-4 cursor-pointer hover:bg-slate-50 transition-colors border-b border-slate-100 ${this.currentConversationId === conv.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''}">
                <div class="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-500 uppercase">
                    ${conv.name ? conv.name[0] : 'S'}
                </div>
                <div class="flex-1 min-w-0">
                    <div class="flex justify-between items-center mb-1">
                        <h4 class="font-bold text-slate-800 truncate">${conv.name || 'Support Ticket'}</h4>
                        <span class="text-[10px] text-slate-400">${this.formatTime(conv.updated_at)}</span>
                    </div>
                    <p class="text-xs text-slate-500 truncate">${conv.last_message || 'No messages yet'}</p>
                </div>
                ${conv.unread_count > 0 ? `<span class="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full">${conv.unread_count}</span>` : ''}
            </div>
        `).join('');
    },

    async openConversation(id) {
        this.currentConversationId = id;
        this.renderConversationList(); // Update active state

        const container = document.getElementById('chat-messages-container');
        if (!container) return;

        container.innerHTML = '<div class="flex-1 flex items-center justify-center"><div class="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div></div>';

        try {
            const response = await fetch(window.apiUrl(`/api/chat/messages/${id}`), {
                headers: Auth.getAuthHeaders()
            });
            if (response.ok) {
                const messages = await response.json();
                this.renderMessages(messages);
            }
        } catch (err) {
            console.error('[CHAT] Load error:', err);
        }
    },

    renderMessages(messages) {
        const container = document.getElementById('chat-messages-container');
        if (!container) return;

        const myId = Auth.getUserSession().id;
        container.innerHTML = `
            <div id="chat-scroller" class="flex-1 overflow-y-auto p-6 space-y-4">
                ${messages.map(msg => this.getMessageHtml(msg, myId)).join('')}
            </div>
            <div class="p-4 bg-white border-t border-slate-100 flex items-center gap-4">
                <input type="text" id="chat-input" placeholder="Type your message..." 
                       class="flex-1 bg-slate-100 border-none rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500">
                <button onclick="Chat.sendMessage()" class="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all">
                    <i data-lucide="send" class="w-5 h-5"></i>
                </button>
            </div>
        `;
        lucide.createIcons();
        this.scrollToBottom();

        document.getElementById('chat-input').onkeypress = (e) => {
            if (e.key === 'Enter') this.sendMessage();
        };
    },

    getMessageHtml(msg, myId) {
        const isMe = msg.sender_id === myId;
        return `
            <div class="flex ${isMe ? 'justify-end' : 'justify-start'}">
                <div class="${isMe ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none'} p-3 px-4 rounded-2xl shadow-sm max-w-[80%]">
                    <p class="text-sm">${msg.content}</p>
                    <div class="flex items-center justify-end gap-1 mt-1 opacity-60">
                        <span class="text-[9px]">${this.formatTime(msg.created_at)}</span>
                        ${isMe ? `<i data-lucide="check" class="status-icon w-3 h-3" data-msg-id="${msg.id}"></i>` : ''}
                    </div>
                </div>
            </div>
        `;
    },

    async sendMessage() {
        const input = document.getElementById('chat-input');
        const content = input.value.trim();
        if (!content || !this.currentConversationId) return;

        const payload = {
            conversation_id: this.currentConversationId,
            content
        };

        input.value = '';

        try {
            const response = await fetch(window.apiUrl('/api/chat/messages'), {
                method: 'POST',
                headers: { ...Auth.getAuthHeaders(), 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (response.ok) {
                const sentMsg = await response.json();
                this.appendMessage(sentMsg);
            }
        } catch (err) {
            console.error('[CHAT] Send error:', err);
        }
    },

    appendMessage(msg) {
        const scroller = document.getElementById('chat-scroller');
        if (!scroller) return;

        const myId = Auth.getUserSession().id;
        const html = this.getMessageHtml(msg, myId);
        scroller.insertAdjacentHTML('beforeend', html);
        this.scrollToBottom();
        lucide.createIcons();
    },

    scrollToBottom() {
        const scroller = document.getElementById('chat-scroller');
        if (scroller) scroller.scrollTop = scroller.scrollHeight;
    },

    formatTime(date) {
        return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
};

window.Chat = Chat;
