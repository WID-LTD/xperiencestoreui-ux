/**
 * gigo.js - GIGO AI Shopping Assistant
 * Lightbox-style agentic AI using Cloudflare Worker AI (Qwen2.5-Coder-7B)
 */

import { Auth } from './auth.js?v=3.1.6';

export const Gigo = {
    isOpen: false,

    init() {
        this.renderTrigger();
        console.log('[GIGO] Initialized');
    },

    renderTrigger() {
        const existing = document.getElementById('gigo-chat-trigger');
        if (existing) existing.remove();

        const trigger = document.createElement('div');
        trigger.id = 'gigo-chat-trigger';
        trigger.className = 'fixed bottom-32 right-6 w-14 h-14 bg-[#25d366] rounded-full shadow-2xl flex items-center justify-center cursor-pointer z-50 hover:scale-110 transition-transform';
        trigger.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-message-circle text-white w-7 h-7">
                <path d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719"></path>
            </svg>
        `;
        trigger.onclick = () => this.toggleLightbox();
        document.body.appendChild(trigger);
    },

    toggleLightbox() {
        this.isOpen = !this.isOpen;
        if (this.isOpen) {
            this.renderLightbox();
        } else {
            const el = document.getElementById('gigo-lightbox');
            if (el) el.remove();
        }
    },

    renderLightbox() {
        const lightbox = document.createElement('div');
        lightbox.id = 'gigo-lightbox';
        lightbox.className = 'fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300';
        lightbox.innerHTML = `
            <div class="bg-white w-full max-w-2xl h-[80vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-300">
                <!-- Header -->
                <div class="p-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex items-center justify-between">
                    <div class="flex items-center gap-4">
                        <div class="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                            <i data-lucide="bot" class="w-7 h-7"></i>
                        </div>
                        <div>
                            <h2 class="text-xl font-bold">GIGO Assistant</h2>
                            <p class="text-xs text-blue-100 opacity-80">Agentic Shopping Assistance</p>
                        </div>
                    </div>
                    <button onclick="Gigo.toggleLightbox()" class="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <i data-lucide="x" class="w-6 h-6"></i>
                    </button>
                </div>

                <!-- Chat Messages -->
                <div id="gigo-messages" class="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
                    <div class="flex justify-start">
                        <div class="bg-white border border-slate-200 p-4 rounded-2xl rounded-tl-none shadow-sm max-w-[80%] text-slate-700">
                            Hello! I'm GIGO, your personal shopping assistant. How can I help you today?
                        </div>
                    </div>
                </div>

                <!-- Input Area -->
                <div class="p-6 bg-white border-t border-slate-100">
                    <div class="relative flex items-center">
                        <input type="text" id="gigo-input" placeholder="Ask me to find products, track orders..." 
                               class="w-full bg-slate-100 border-none rounded-2xl py-4 pl-6 pr-14 text-slate-700 focus:ring-2 focus:ring-blue-500 transition-all outline-none">
                        <button onclick="Gigo.sendMessage()" class="absolute right-2 p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
                            <i data-lucide="send" class="w-5 h-5"></i>
                        </button>
                    </div>
                    <p class="text-[10px] text-slate-400 mt-3 text-center uppercase tracking-widest font-medium">Powered by Qwen2.5-Coder via Cloudflare AI</p>
                </div>
            </div>
        `;
        document.body.appendChild(lightbox);
        lucide.createIcons();

        document.getElementById('gigo-input').onkeypress = (e) => {
            if (e.key === 'Enter') this.sendMessage();
        };
    },

    async sendMessage() {
        const input = document.getElementById('gigo-input');
        const query = input.value.trim();
        if (!query) return;

        this.appendMessage(query, 'user');
        input.value = '';

        // Show typing indicator
        const typingId = this.showTyping();

        try {
            // Call AI endpoint (Worker AI)
            const response = await fetch('/api/chat/gigo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...Auth.getAuthHeaders() },
                body: JSON.stringify({ message: query })
            });

            const data = await response.json();
            this.removeTyping(typingId);

            if (data.reply) {
                this.appendMessage(data.reply, 'bot');
            }

            // Handle function calls (if any)
            if (data.actions) {
                this.handleActions(data.actions);
            }

        } catch (err) {
            console.error('[GIGO ERROR]', err);
            this.removeTyping(typingId);
            this.appendMessage("I'm sorry, I'm having trouble connecting right now.", 'bot');
        }
    },

    appendMessage(text, side) {
        const container = document.getElementById('gigo-messages');
        if (!container) return;

        const isUser = side === 'user';
        const msg = document.createElement('div');
        msg.className = `flex ${isUser ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`;
        msg.innerHTML = `
            <div class="${isUser ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none'} p-4 rounded-2xl shadow-sm max-w-[80%]">
                ${text}
            </div>
        `;
        container.appendChild(msg);
        container.scrollTop = container.scrollHeight;
    },

    showTyping() {
        const id = 'typing-' + Date.now();
        const container = document.getElementById('gigo-messages');
        const typing = document.createElement('div');
        typing.id = id;
        typing.className = 'flex justify-start animate-in fade-in duration-300';
        typing.innerHTML = `
            <div class="bg-slate-200 p-3 rounded-2xl rounded-tl-none flex gap-1">
                <span class="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                <span class="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span class="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </div>
        `;
        container.appendChild(typing);
        container.scrollTop = container.scrollHeight;
        return id;
    },

    removeTyping(id) {
        const el = document.getElementById(id);
        if (el) el.remove();
    },

    handleActions(actions) {
        actions.forEach(action => {
            console.log('[GIGO ACTION]', action);
            // Implementation for search_products, add_to_cart, etc.
        });
    }
};

window.Gigo = Gigo;
