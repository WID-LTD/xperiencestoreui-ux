import { Auth } from './auth.js?v=3.3.4';

export const Gigo = {
    isOpen: false,
    streamBuffer: '',

    init() {
        this.renderTrigger();
    },

    renderTrigger() {
        const existing = document.getElementById('gigo-chat-trigger');
        if (existing) existing.remove();

        const trigger = document.createElement('div');
        trigger.id = 'gigo-chat-trigger';
        trigger.className = 'fixed bottom-32 right-6 w-14 h-14 bg-[#25d366] rounded-full shadow-2xl flex items-center justify-center cursor-pointer z-50 hover:scale-110 transition-transform';
        trigger.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-message-circle text-white w-7 h-7"><path d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719"></path></svg>`;
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

                <div id="gigo-messages" class="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
                    <div class="flex justify-start">
                        <div class="bg-white border border-slate-200 p-4 rounded-2xl rounded-tl-none shadow-sm max-w-[80%] text-slate-700">
                            Hello! I'm GIGO, your personal AI shopping assistant. How can I help you today?
                        </div>
                    </div>
                </div>

                <div class="p-6 bg-white border-t border-slate-100">
                    <div class="relative flex items-center gap-2">
                        <button id="gigo-upload-btn" onclick="document.getElementById('gigo-image-input').click()" class="p-3 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition-all" title="Upload image">
                            <i data-lucide="image-plus" class="w-5 h-5"></i>
                        </button>
                        <input type="file" id="gigo-image-input" accept="image/*" onchange="Gigo.handleImageUpload(event)" class="hidden">
                        <button id="gigo-voice-btn" onclick="Gigo.toggleVoiceInput()" class="p-3 text-slate-400 hover:text-green-600 hover:bg-slate-100 rounded-xl transition-all" title="Voice input">
                            <i data-lucide="mic" class="w-5 h-5"></i>
                        </button>
                        <button id="gigo-speaker-btn" onclick="Gigo.toggleSpeaker()" class="p-3 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition-all" title="Toggle text-to-speech">
                            <i data-lucide="volume-2" class="w-5 h-5"></i>
                        </button>
                        <input type="text" id="gigo-input" placeholder="Ask me to find products, track orders..." 
                               class="flex-1 bg-slate-100 border-none rounded-2xl py-4 pl-6 pr-14 text-slate-700 focus:ring-2 focus:ring-blue-500 transition-all outline-none">
                        <button onclick="Gigo.sendMessage()" class="absolute right-2 p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200" style="right: 0.5rem;">
                            <i data-lucide="send" class="w-5 h-5"></i>
                        </button>
                    </div>
                    <div id="gigo-image-preview" class="hidden mt-2 flex items-center gap-2 p-2 bg-slate-100 rounded-xl"></div>
                    <p class="text-[10px] text-slate-400 mt-3 text-center uppercase tracking-widest font-medium">Powered by Qwen3 30B via Cloudflare AI</p>
                </div>
            </div>
        `;
        document.body.appendChild(lightbox);
        lucide.createIcons();

        document.getElementById('gigo-input').onkeypress = (e) => {
            if (e.key === 'Enter') this.sendMessage();
        };
    },

    handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        const preview = document.getElementById('gigo-image-preview');
        preview.innerHTML = `
            <img src="${URL.createObjectURL(file)}" class="w-12 h-12 object-cover rounded-lg">
            <span class="text-sm text-slate-600">${file.name}</span>
            <button onclick="Gigo.clearImage()" class="ml-auto text-red-500 hover:text-red-700"><i data-lucide="x" class="w-4 h-4"></i></button>
        `;
        preview.classList.remove('hidden');
        lucide.createIcons();
        this.pendingImage = file;
    },

    clearImage() {
        this.pendingImage = null;
        const preview = document.getElementById('gigo-image-preview');
        preview.classList.add('hidden');
        preview.innerHTML = '';
        document.getElementById('gigo-image-input').value = '';
    },

    async sendMessage() {
        const input = document.getElementById('gigo-input');
        const query = input.value.trim();
        if (!query && !this.pendingImage) return;

        this.appendMessage(query || (this.pendingImage ? '[Image]' : ''), 'user');
        input.value = '';

        if (this.pendingImage) {
            this.appendMessage('Analyzing image...', 'bot');
            const reader = new FileReader();
            reader.onload = async (e) => {
                const base64 = e.target.result.split(',')[1];
                this.clearImage();
                try {
                    const response = await fetch('/api/chat/gigo/image', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', ...Auth.getAuthHeaders() },
                        body: JSON.stringify({ message: query, image: base64 })
                    });
                    const data = await response.json();
                    if (data.reply) this.appendMessage(data.reply, 'bot');
                } catch (err) {
                    this.appendMessage('Image analysis failed.', 'bot');
                }
            };
            reader.readAsDataURL(this.pendingImage);
            return;
        }

        const typingId = this.showTyping();
        this.streamBuffer = '';

        try {
            const response = await fetch('/api/chat/gigo/stream', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...Auth.getAuthHeaders() },
                body: JSON.stringify({ message: query })
            });

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let botMessageEl = null;

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const text = decoder.decode(value, { stream: true });
                const lines = text.split('\n');

                for (const line of lines) {
                    if (!line.startsWith('data: ')) continue;
                    const jsonStr = line.slice(6).trim();
                    if (!jsonStr) continue;

                    try {
                        const parsed = JSON.parse(jsonStr);
                        if (parsed.type === 'text') {
                            this.streamBuffer += parsed.content;
                            if (!botMessageEl) {
                                this.removeTyping(typingId);
                                botMessageEl = this.appendMessage('', 'bot', true);
                            }
                            botMessageEl.querySelector('div:last-child').textContent = this.streamBuffer;
                            botMessageEl.scrollIntoView({ block: 'end' });
                        } else if (parsed.type === 'done' || parsed.type === 'error') {
                            this.removeTyping(typingId);
                            if (this.speakerEnabled && this.streamBuffer) {
                                this.speak(this.streamBuffer);
                            }
                        }
                    } catch (e) { /* skip */ }
                }
            }
        } catch (err) {
            this.removeTyping(typingId);
            this.appendMessage("I'm sorry, I'm having trouble connecting right now.", 'bot');
        }
    },

    appendMessage(text, side, returnEl = false) {
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
        if (returnEl) return msg;
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

    toggleVoiceInput() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            this.appendMessage('Speech recognition is not supported in your browser.', 'bot');
            return;
        }
        const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.start();
        const btn = document.getElementById('gigo-voice-btn');
        btn.classList.add('text-green-600', 'bg-green-100');
        btn.querySelector('i').setAttribute('data-lucide', 'mic-off');
        lucide.createIcons();

        recognition.onresult = (e) => {
            const transcript = e.results[0][0].transcript;
            document.getElementById('gigo-input').value = transcript;
            this.sendMessage();
        };
        recognition.onend = () => {
            btn.classList.remove('text-green-600', 'bg-green-100');
            btn.querySelector('i').setAttribute('data-lucide', 'mic');
            lucide.createIcons();
        };
        recognition.onerror = () => {
            btn.classList.remove('text-green-600', 'bg-green-100');
            btn.querySelector('i').setAttribute('data-lucide', 'mic');
            lucide.createIcons();
        };
    },

    toggleSpeaker() {
        this.speakerEnabled = !this.speakerEnabled;
        const btn = document.getElementById('gigo-speaker-btn');
        const icon = btn.querySelector('i');
        if (this.speakerEnabled) {
            icon.setAttribute('data-lucide', 'volume-x');
            btn.classList.add('text-indigo-600', 'bg-indigo-100');
        } else {
            icon.setAttribute('data-lucide', 'volume-2');
            btn.classList.remove('text-indigo-600', 'bg-indigo-100');
            window.speechSynthesis.cancel();
        }
        lucide.createIcons();
    },

    speak(text) {
        if (!this.speakerEnabled || !window.speechSynthesis) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 1;
        utterance.pitch = 1;
        window.speechSynthesis.speak(utterance);
    }
};

window.Gigo = Gigo;
