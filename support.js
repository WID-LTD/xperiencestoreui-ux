/**
 * support.js - Support & Information Pages
 * Contains deeply detailed, comprehensive information about WID LTD, UES, Global Shipping, RFQ Process, and Legal terms.
 */

export const SupportPages = {
    _heroSection(title, subtitle) {
        return `
            <div class="bg-blue-900 text-white py-24 px-4 text-center">
                <div class="max-w-5xl mx-auto">
                    <h1 class="text-4xl md:text-6xl font-black mb-6 leading-tight">${title}</h1>
                    <p class="text-blue-200 text-lg md:text-2xl font-light">${subtitle}</p>
                </div>
            </div>
        `;
    },

    about() {
        return `
            ${this._heroSection('About WID LTD', 'Pioneering the Future of Unified E-commerce through Visionary Architecture')}
            <div class="max-w-6xl mx-auto px-6 py-20 space-y-20 text-slate-700 leading-loose text-lg">
                
                <section>
                    <h2 class="text-4xl font-bold text-slate-900 mb-8 border-b-2 border-blue-100 pb-4">Our Vision & Leadership</h2>
                    <p class="mb-6">
                        WID LTD is a premier, forward-thinking technology and e-commerce enterprise founded by visionary leader <strong>Ike Wisdom Okemsinachi</strong>. As the CEO and Principal Founder, Ike Wisdom Okemsinachi stands as the sole inventor and mastermind behind the revolutionary <strong>Unified E-commerce System (UES)</strong> architecture. Under his guidance, WID LTD has transcended traditional retail boundaries, engineering a digital ecosystem that flawlessly integrates Consumer (B2C), Business-to-Business (B2B), Dropshipping, and global Supply Chain operations into a singular, cohesive platform.
                    </p>
                    <p class="mb-6">
                        The inception of WID LTD was driven by a profound recognition of the massive inefficiencies plaguing modern global trade. Traditional e-commerce platforms force businesses to operate in silos. A manufacturer in Asia, a wholesaler in Europe, a dropshipper in North America, and a consumer in Africa historically had to navigate a labyrinth of disconnected systems, exorbitant fees, and opaque logistical networks to conduct business. Ike Wisdom Okemsinachi envisioned a world where this friction is eliminated. WID LTD was built to be the bridge. By unifying these typically fragmented markets into a single, high-performance platform, we empower businesses and consumers alike with unparalleled reach, efficiency, and cost savings.
                    </p>
                    <p class="mb-6">
                        Our leadership team is composed of industry veterans, logistics experts, and software engineers who share a singular mandate: to democratize global commerce. We believe that whether you are a multi-national conglomerate looking to source raw materials by the ton, or an individual consumer searching for a unique artisanal product, the underlying technology should serve you with equal dedication, speed, and security.
                    </p>
                </section>

                <section>
                    <h2 class="text-4xl font-bold text-slate-900 mb-8 border-b-2 border-blue-100 pb-4">The Unified E-commerce System (UES) Architecture</h2>
                    <p class="mb-6">
                        At the heart of WID LTD’s operational superiority is the Unified E-commerce System (UES). Unlike conventional platforms that bolt on B2B or dropshipping functionalities as afterthoughts, the UES was architected from day one to natively support the complex matrices of multi-tier commerce. This means that a single product listing can dynamically adjust its pricing, visibility, and shipping options based on who is viewing it—a retail consumer, a registered wholesale buyer, or a dropshipper evaluating profit margins.
                    </p>
                    <p class="mb-6">
                        The UES leverages advanced microservices, distributed cloud computing, and real-time data synchronization to ensure that inventory levels are universally accurate to the millisecond. When a warehouse in Shenzhen updates its stock, a dropshipper’s storefront in New York reflects that change instantly, completely mitigating the risk of overselling. Furthermore, the UES incorporates a sophisticated, AI-driven routing engine that calculates the most efficient logistical paths for any given order, dynamically analyzing freight costs, customs regulations, and delivery timelines across multiple international carriers.
                    </p>
                    <p class="mb-6">
                        Security and compliance are baked into the foundational code of the UES. We utilize state-of-the-art encryption protocols, multi-factor authentication, and continuous vulnerability scanning to protect user data. Our financial ledger systems are designed to handle complex, multi-currency transactions, split payments between suppliers and dropshippers, and automated tax calculations across thousands of jurisdictions worldwide, ensuring that WID LTD remains a fortress of reliability and legal compliance.
                    </p>
                </section>

                <section>
                    <h2 class="text-4xl font-bold text-slate-900 mb-8 border-b-2 border-blue-100 pb-4">Empowering the Multi-Tier Ecosystem</h2>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-12 mt-8">
                        <div class="glass-card p-8 rounded-3xl bg-white shadow-xl hover:shadow-2xl transition-shadow border border-slate-100">
                            <div class="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                                <i data-lucide="users" class="w-8 h-8 text-blue-600"></i>
                            </div>
                            <h3 class="text-2xl font-bold mb-4">Consumer Centric (B2C)</h3>
                            <p class="text-slate-600">
                                For the everyday shopper, Xperiencestore offers a frictionless, immersive shopping experience. Consumers enjoy access to a globally sourced catalog that would typically require navigating multiple international sites. Our intuitive interface provides real-time currency conversion, localized payment gateways, and transparent Landed Cost calculations—meaning the price you see at checkout is exactly what you pay, with no hidden customs fees upon delivery. We back this with a robust dispute resolution system and 24/7 customer support, ensuring absolute peace of mind.
                            </p>
                        </div>
                        <div class="glass-card p-8 rounded-3xl bg-white shadow-xl hover:shadow-2xl transition-shadow border border-slate-100">
                            <div class="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-6">
                                <i data-lucide="building-2" class="w-8 h-8 text-purple-600"></i>
                            </div>
                            <h3 class="text-2xl font-bold mb-4">Business Power (B2B)</h3>
                            <p class="text-slate-600">
                                Enterprise buyers require fundamentally different tools than retail consumers. The UES provides B2B users with a suite of professional procurement tools, including the ability to issue formal Requests for Quote (RFQs), negotiate terms directly with manufacturers, set up automated recurring orders, and manage net-payment terms. Our system supports bulk catalog uploads, custom contract pricing matrices, and deep ERP integrations, allowing large corporations to streamline their supply chains entirely through the Xperiencestore ecosystem.
                            </p>
                        </div>
                        <div class="glass-card p-8 rounded-3xl bg-white shadow-xl hover:shadow-2xl transition-shadow border border-slate-100">
                            <div class="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6">
                                <i data-lucide="store" class="w-8 h-8 text-green-600"></i>
                            </div>
                            <h3 class="text-2xl font-bold mb-4">Dropshipping Innovation</h3>
                            <p class="text-slate-600">
                                WID LTD is democratizing entrepreneurship by providing the most advanced dropshipping infrastructure on the market. Users can spin up branded storefronts instantly, curating products directly from our verified supplier network. The UES handles all the heavy lifting—from payment processing and fraud detection to automated order routing and blind-shipment fulfillment. Dropshippers have access to comprehensive analytics, profit margin calculators, and automated marketing integrations, allowing them to focus entirely on growth while we handle the logistics.
                            </p>
                        </div>
                        <div class="glass-card p-8 rounded-3xl bg-white shadow-xl hover:shadow-2xl transition-shadow border border-slate-100">
                            <div class="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mb-6">
                                <i data-lucide="truck" class="w-8 h-8 text-orange-600"></i>
                            </div>
                            <h3 class="text-2xl font-bold mb-4">Supplier Ecosystem</h3>
                            <p class="text-slate-600">
                                Manufacturers and wholesalers gain unprecedented global reach by plugging into the UES. We provide suppliers with a unified dashboard to manage inventory across B2C, B2B, and Dropshipping channels simultaneously. Our proprietary logistics network offers heavily discounted freight rates, simplified customs clearance tools, and guaranteed payment protection. Suppliers can focus on what they do best—producing quality goods—while WID LTD connects them to millions of buyers worldwide.
                            </p>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 class="text-4xl font-bold text-slate-900 mb-8 border-b-2 border-blue-100 pb-4">Our Commitment to the Future</h2>
                    <p class="mb-6">
                        As we look to the horizon, WID LTD remains unyielding in its commitment to innovation. We are actively developing next-generation technologies, including blockchain-verified supply chain tracking to guarantee product authenticity, and augmented reality (AR) shopping experiences that will redefine digital retail. Ike Wisdom Okemsinachi’s vision extends beyond mere commerce; it is about building a sustainable, inclusive global economy where technology serves humanity, breaks down borders, and fosters prosperity on a planetary scale.
                    </p>
                    <p class="mb-6">
                        Thank you for choosing WID LTD and the Xperiencestore platform. Whether you are buying, selling, or building an empire, you are in the right place. Welcome to the future of commerce.
                    </p>
                </section>

                <section>
                    <h2 class="text-4xl font-bold text-slate-900 mb-8 border-b-2 border-blue-100 pb-4">Global Infrastructure & Localization</h2>
                    <p class="mb-6">
                        True globalization requires more than just translating a website; it demands a fundamental restructuring of digital architecture to accommodate local nuances. WID LTD has invested heavily in a decentralized, edge-computing infrastructure powered by Oracle Cloud and AWS. This ensures that a user in Tokyo experiences the same ultra-low latency (< 50ms) as a user in London. Our Content Delivery Networks (CDNs) are strategically positioned across 150+ edge locations globally.
                    </p>
                    <p class="mb-6">
                        Beyond speed, our platform is deeply localized. The UES automatically detects a user’s geolocation and instantly adapts the entire interface. This includes dynamic currency conversion using real-time foreign exchange rates, localized payment gateways (e.g., Alipay in China, SEPA in Europe, Paystack in Africa), and culturally adapted product catalogs. We don't just sell to the world; we speak its language, respect its customs, and integrate with its local financial ecosystems.
                    </p>
                </section>

                <section>
                    <h2 class="text-4xl font-bold text-slate-900 mb-8 border-b-2 border-blue-100 pb-4">Ironclad Compliance & Security Standards</h2>
                    <p class="mb-6">
                        Operating a multi-tier, global commerce platform necessitates adherence to the world’s most stringent regulatory frameworks. WID LTD is fully compliant with the General Data Protection Regulation (GDPR) in Europe, the California Consumer Privacy Act (CCPA) in the US, and the Personal Information Protection Law (PIPL) in China. Our data sovereignty policies ensure that user data is stored and processed within the legal boundaries of their respective jurisdictions.
                    </p>
                    <p class="mb-6">
                        Financially, our payment processing engines are PCI-DSS Level 1 certified, representing the highest standard of security in the payments industry. We employ continuous, AI-driven fraud detection algorithms that analyze hundreds of data points per transaction to prevent chargebacks and protect both our suppliers and dropshippers. At WID LTD, security is not a feature; it is the foundational bedrock upon which the entire UES is built.
                    </p>
                </section>
            </div>
        `;
    },

    contact() {
        return `
            ${this._heroSection('Contact WID LTD', 'Comprehensive Support, Global Reach, 24/7 Availability')}
            <div class="max-w-7xl mx-auto px-6 py-20">
                <div class="mb-16 text-center max-w-4xl mx-auto">
                    <p class="text-xl text-slate-600 leading-relaxed">
                        At WID LTD, we believe that world-class technology must be backed by world-class support. The Unified E-commerce System (UES) facilitates thousands of transactions per minute across borders, time zones, and user roles. Whether you are a consumer with a tracking inquiry, a B2B buyer negotiating a million-dollar RFQ, a dropshipper scaling your storefront, or a supplier integrating your warehouse, our dedicated global support teams are equipped to assist you. We offer tiered, role-specific support channels to ensure that your request is routed immediately to the specialists who understand your unique business needs.
                    </p>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    
                    <!-- Extensive Contact Form -->
                    <div class="glass-card p-10 rounded-3xl bg-white shadow-2xl border border-slate-100">
                        <h2 class="text-3xl font-bold mb-2">Submit a detailed request</h2>
                        <p class="text-slate-500 mb-8">Please provide as much information as possible so we can route your ticket to the correct department.</p>
                        
                        <form class="space-y-6" onsubmit="event.preventDefault(); Components.showNotification('Your comprehensive request has been securely transmitted. A specialist will contact you within 24 hours.', 'success'); this.reset();">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label class="block text-sm font-bold text-slate-700 mb-2">FIRST NAME</label>
                                    <input type="text" required class="w-full p-4 rounded-xl border border-slate-200 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all bg-slate-50">
                                </div>
                                <div>
                                    <label class="block text-sm font-bold text-slate-700 mb-2">LAST NAME</label>
                                    <input type="text" required class="w-full p-4 rounded-xl border border-slate-200 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all bg-slate-50">
                                </div>
                            </div>
                            
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label class="block text-sm font-bold text-slate-700 mb-2">BUSINESS EMAIL</label>
                                    <input type="email" required class="w-full p-4 rounded-xl border border-slate-200 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all bg-slate-50">
                                </div>
                                <div>
                                    <label class="block text-sm font-bold text-slate-700 mb-2">PHONE NUMBER (OPTIONAL)</label>
                                    <input type="tel" class="w-full p-4 rounded-xl border border-slate-200 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all bg-slate-50">
                                </div>
                            </div>

                            <div>
                                <label class="block text-sm font-bold text-slate-700 mb-2">PRIMARY ACCOUNT ROLE</label>
                                <select class="w-full p-4 rounded-xl border border-slate-200 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all bg-slate-50">
                                    <option>Consumer (B2C) - Order tracking, product inquiries, returns</option>
                                    <option>Business (B2B) - RFQs, bulk orders, enterprise procurement</option>
                                    <option>Dropshipper - Storefront management, profit tools, integrations</option>
                                    <option>Supplier - Inventory sync, fulfillment, payout issues</option>
                                    <option>Logistics Partner - Carrier integration, warehouse operations</option>
                                    <option>Legal/Corporate - Partnerships, press, compliance</option>
                                </select>
                            </div>

                            <div>
                                <label class="block text-sm font-bold text-slate-700 mb-2">SUBJECT</label>
                                <input type="text" required class="w-full p-4 rounded-xl border border-slate-200 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all bg-slate-50">
                            </div>

                            <div>
                                <label class="block text-sm font-bold text-slate-700 mb-2">DETAILED MESSAGE</label>
                                <p class="text-xs text-slate-500 mb-2">If applicable, please include Order IDs, RFQ Numbers, or specific SKU codes to expedite your request.</p>
                                <textarea required rows="6" class="w-full p-4 rounded-xl border border-slate-200 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all bg-slate-50"></textarea>
                            </div>
                            
                            <button type="submit" class="w-full bg-blue-600 text-white font-bold text-lg py-5 rounded-xl hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all transform active:scale-95">Submit Secure Request</button>
                        </form>
                    </div>

                    <!-- Deep Corporate Info -->
                    <div class="space-y-12 text-slate-600">
                        
                        <div>
                            <h2 class="text-4xl font-bold mb-6 text-slate-900">Global Operations & Corporate Affairs</h2>
                            <p class="leading-relaxed mb-6">
                                WID LTD is a borderless technology enterprise. The Xperiencestore platform and the underlying UES architecture are maintained by distributed teams operating across key global hubs. This decentralization allows us to provide true 24/7/365 coverage and ensures that our systems remain resilient, compliant with localized data sovereignty laws, and intimately connected to the nuances of regional markets.
                            </p>
                            <p class="leading-relaxed">
                                For formal corporate inquiries, legal notices, strategic partnerships, or investment relations regarding WID LTD or Ike Wisdom Okemsinachi’s projects, please utilize the specialized contact vectors detailed below.
                            </p>
                        </div>

                        <div class="grid grid-cols-1 gap-8">
                            
                            <div class="flex items-start gap-6 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                <div class="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center shrink-0 shadow-inner">
                                    <i data-lucide="headset" class="w-7 h-7 text-blue-600"></i>
                                </div>
                                <div>
                                    <h4 class="text-xl font-bold text-slate-900 mb-2">Consumer Support Division</h4>
                                    <p class="text-sm leading-relaxed mb-3">Dedicated to ensuring a flawless retail experience. Handles order tracking, returns processing, product inquiries, and payment disputes.</p>
                                    <p class="font-mono text-blue-600 font-bold">support@xperiencestore.store</p>
                                    <p class="text-xs text-slate-400 mt-1">Average Response Time: < 2 Hours</p>
                                </div>
                            </div>

                            <div class="flex items-start gap-6 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                <div class="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center shrink-0 shadow-inner">
                                    <i data-lucide="building" class="w-7 h-7 text-purple-600"></i>
                                </div>
                                <div>
                                    <h4 class="text-xl font-bold text-slate-900 mb-2">B2B & Enterprise Procurement</h4>
                                    <p class="text-sm leading-relaxed mb-3">Assists corporate buyers with RFQ negotiations, custom catalog integrations, tax-exempt purchasing, and high-volume freight logistics.</p>
                                    <p class="font-mono text-purple-600 font-bold">enterprise@wid-ltd.com</p>
                                    <p class="text-xs text-slate-400 mt-1">Dedicated Account Managers Available</p>
                                </div>
                            </div>

                            <div class="flex items-start gap-6 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                <div class="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center shrink-0 shadow-inner">
                                    <i data-lucide="store" class="w-7 h-7 text-green-600"></i>
                                </div>
                                <div>
                                    <h4 class="text-xl font-bold text-slate-900 mb-2">Dropshipper Success Team</h4>
                                    <p class="text-sm leading-relaxed mb-3">Expert guidance on storefront optimization, profit margin calculations, API integrations, and scaling your e-commerce business on the UES.</p>
                                    <p class="font-mono text-green-600 font-bold">partners@xperiencestore.store</p>
                                </div>
                            </div>

                            <div class="flex items-start gap-6 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                <div class="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center shrink-0 shadow-inner">
                                    <i data-lucide="scale" class="w-7 h-7 text-red-600"></i>
                                </div>
                                <div>
                                    <h4 class="text-xl font-bold text-slate-900 mb-2">Legal & Compliance</h4>
                                    <p class="text-sm leading-relaxed mb-3">For matters concerning intellectual property rights, DMCA takedown notices, GDPR/CCPA data privacy requests, and regulatory compliance.</p>
                                    <p class="font-mono text-red-600 font-bold">legal@wid-ltd.com</p>
                                </div>
                            </div>

                        </div>

                    </div>
                </div>
            </div>
        `;
    },

    faq() {
        return `
            ${this._heroSection('Comprehensive Knowledge Base', 'In-depth answers to navigate the Unified E-commerce System')}
            <div class="max-w-5xl mx-auto px-6 py-20">
                <p class="text-xl text-slate-600 text-center mb-16 max-w-3xl mx-auto leading-relaxed">
                    The WID LTD ecosystem is vast and feature-rich. We have compiled this extensive knowledge base to address the intricate mechanics of our platform. Below, you will find detailed guides separated by user roles, explaining exactly how to leverage the UES for maximum efficiency, profitability, and compliance.
                </p>

                <div class="space-y-16">
                    
                    <!-- Consumer FAQ -->
                    <section>
                        <div class="flex items-center gap-4 mb-8 border-b-2 border-blue-100 pb-4">
                            <div class="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white"><i data-lucide="users"></i></div>
                            <h2 class="text-3xl font-bold text-slate-900">Consumer Support (B2C)</h2>
                        </div>
                        <div class="space-y-6">
                            <details class="glass-card p-6 rounded-2xl group cursor-pointer bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all">
                                <summary class="text-xl font-bold outline-none select-none flex justify-between items-center text-slate-800">
                                    How does the global order tracking system function?
                                    <i data-lucide="chevron-down" class="w-6 h-6 text-slate-400 group-open:rotate-180 transition-transform"></i>
                                </summary>
                                <div class="mt-6 text-slate-600 leading-loose">
                                    <p class="mb-4">
                                        WID LTD utilizes a proprietary, low-latency tracking engine hosted on dedicated Oracle VPS infrastructure, integrated closely with global logistics aggregators like Karrio. When you place an order, the UES immediately generates a unique tracking identifier.
                                    </p>
                                    <p>
                                        This system provides micro-status updates. Unlike traditional platforms where tracking remains stagnant for days, our system polls carrier databases globally—from the origin warehouse scan, through international customs clearance checkpoints, to the final mile delivery via your local postal service. You can access this real-time map and event log simply by entering your ID on our <a href="#/track" class="text-blue-600 font-bold hover:underline">Track Order page</a>. Furthermore, push notifications are automatically dispatched to your account dashboard the moment a significant logistical event occurs.
                                    </p>
                                </div>
                            </details>

                            <details class="glass-card p-6 rounded-2xl group cursor-pointer bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all">
                                <summary class="text-xl font-bold outline-none select-none flex justify-between items-center text-slate-800">
                                    Are duties, import taxes, and VAT included in the final price?
                                    <i data-lucide="chevron-down" class="w-6 h-6 text-slate-400 group-open:rotate-180 transition-transform"></i>
                                </summary>
                                <div class="mt-6 text-slate-600 leading-loose">
                                    <p class="mb-4">
                                        Cross-border e-commerce often suffers from hidden costs, but the UES is built on total transparency via our Landed Cost Engine. During checkout, our system analyzes the Harmonized System (HS) codes of your items, the origin country, and your exact delivery address to calculate required duties and taxes.
                                    </p>
                                    <p>
                                        In most cases, we offer <strong>Delivered Duty Paid (DDP)</strong> shipping. This means you pay the taxes at checkout, and WID LTD remits them directly to the customs authorities on your behalf. When the package arrives, it skips customs holds and is delivered straight to your door with absolutely no surprise fees. If DDP is unavailable for a specific route, the system will explicitly warn you that the shipment is <strong>Delivered At Place (DAP)</strong>, meaning you will be responsible for paying local customs agencies before final delivery.
                                    </p>
                                </div>
                            </details>
                            
                            <details class="glass-card p-6 rounded-2xl group cursor-pointer bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all">
                                <summary class="text-xl font-bold outline-none select-none flex justify-between items-center text-slate-800">
                                    What is the detailed process for initiating a return or refund?
                                    <i data-lucide="chevron-down" class="w-6 h-6 text-slate-400 group-open:rotate-180 transition-transform"></i>
                                </summary>
                                <div class="mt-6 text-slate-600 leading-loose">
                                    <p class="mb-4">
                                        We offer a comprehensive 14-day return window starting from the confirmed date of delivery. To initiate a return, navigate to your Account Dashboard, select the specific order, and click "Request Return." You will be prompted to select a reason and, if the item arrived damaged or materially different than described, upload photographic evidence.
                                    </p>
                                    <p>
                                        If the return is due to an error on the part of the supplier or damage during transit, WID LTD will instantly issue a prepaid return shipping label. If the return is due to buyer's remorse, the cost of the return shipping label will be deducted from your final refund amount. Once the returned item is scanned into our regional consolidation warehouse, the UES automatically triggers the refund process via our payment gateways, which typically reflects in your bank account within 3 to 7 business days, depending on your financial institution.
                                    </p>
                                </div>
                            </details>
                        </div>
                    </section>

                    <!-- Dropshipper FAQ -->
                    <section>
                        <div class="flex items-center gap-4 mb-8 border-b-2 border-purple-100 pb-4">
                            <div class="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center text-white"><i data-lucide="store"></i></div>
                            <h2 class="text-3xl font-bold text-slate-900">Dropshipper & Merchant Guides</h2>
                        </div>
                        <div class="space-y-6">
                            <details class="glass-card p-6 rounded-2xl group cursor-pointer bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all">
                                <summary class="text-xl font-bold outline-none select-none flex justify-between items-center text-slate-800">
                                    How do I curate products and set profit margins?
                                    <i data-lucide="chevron-down" class="w-6 h-6 text-slate-400 group-open:rotate-180 transition-transform"></i>
                                </summary>
                                <div class="mt-6 text-slate-600 leading-loose">
                                    <p class="mb-4">
                                        As a registered dropshipper, you have unfettered access to the WID LTD global supplier catalog. Navigate to your Dropshipper Dashboard and open the Catalog module. Here, you can search for products using advanced filters like shipping origin, supplier rating, and base wholesale price.
                                    </p>
                                    <p>
                                        When you find a product you wish to sell, click "Import to Store." This action invokes our <strong>Dynamic Profit Calculator</strong>. You can choose to set a fixed dollar amount markup, or a percentage-based markup. The UES is intelligent enough to factor in estimated shipping costs and payment gateway processing fees, showing you the exact net profit you will make per sale. Once confirmed, the product is instantly live on your personalized Xperiencestore storefront with your custom pricing applied.
                                    </p>
                                </div>
                            </details>

                            <details class="glass-card p-6 rounded-2xl group cursor-pointer bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all">
                                <summary class="text-xl font-bold outline-none select-none flex justify-between items-center text-slate-800">
                                    How are payouts and financial settlements handled?
                                    <i data-lucide="chevron-down" class="w-6 h-6 text-slate-400 group-open:rotate-180 transition-transform"></i>
                                </summary>
                                <div class="mt-6 text-slate-600 leading-loose">
                                    <p class="mb-4">
                                        The UES operates a sophisticated split-payment ledger. When a consumer purchases an item from your dropshipping store, their payment is securely held in escrow. The system automatically splits the funds: the base cost of the item and shipping is routed to the Supplier to initiate fulfillment, the platform fee is routed to WID LTD, and your profit margin is immediately credited to your Dropshipper Wallet.
                                    </p>
                                    <p>
                                        Your funds become available for withdrawal as soon as the order's tracking status updates to "Delivered," plus a mandatory 3-day holding period to account for potential immediate disputes. You can then withdraw your accumulated balance via bank transfer, PayPal, or crypto-currency payouts depending on your configured finance settings.
                                    </p>
                                </div>
                            </details>
                        </div>
                    </section>

                </div>
            </div>
        `;
    },

    rfq() {
        return `
            ${this._heroSection('The B2B RFQ Guide', 'Mastering Enterprise Procurement on the UES')}
            <div class="max-w-5xl mx-auto px-6 py-20 text-slate-700 leading-loose text-lg">
                <section>
                    <h2 class="text-4xl font-bold text-slate-900 mb-8 border-b-2 border-blue-100 pb-4">Understanding the Request for Quote (RFQ) Process</h2>
                    <p class="mb-6">
                        The Request for Quote (RFQ) process is the cornerstone of B2B e-commerce within the WID LTD ecosystem. For enterprise buyers, rigid retail pricing is often insufficient. When purchasing in bulk, seeking customized manufacturing, or establishing long-term supply contracts, flexibility and negotiation are paramount. The UES transforms the traditional, email-heavy, and error-prone RFQ process into a streamlined, fully digitized, and transparent workflow.
                    </p>
                    <p class="mb-6">
                        By digitizing the RFQ process, we eliminate the friction of manual data entry, provide real-time visibility into negotiations, and allow for instantaneous conversion of agreed quotes into legally binding Purchase Orders (POs). This guide details the best practices and operational mechanics for utilizing the RFQ engine on Xperiencestore.
                    </p>
                </section>

                <section class="mt-16">
                    <h2 class="text-3xl font-bold text-slate-900 mb-8">The RFQ Lifecycle on UES</h2>
                    
                    <div class="space-y-12">
                        <div class="flex gap-6">
                            <div class="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white font-black text-2xl shrink-0 mt-1">1</div>
                            <div>
                                <h3 class="text-2xl font-bold text-slate-800 mb-3">Initiation & Drafting</h3>
                                <p>
                                    A verified Business user initiates an RFQ directly from a supplier's catalog or by creating a custom request from their dashboard. The buyer fills out an intuitive, structured form specifying exact requirements: desired quantities, target price points, critical delivery deadlines, product specifications, and preferred Incoterms (e.g., FOB, EXW, CIF). This structured data ensures suppliers have all necessary information to provide an accurate quote without endless back-and-forth emails.
                                </p>
                            </div>
                        </div>

                        <div class="flex gap-6">
                            <div class="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white font-black text-2xl shrink-0 mt-1">2</div>
                            <div>
                                <h3 class="text-2xl font-bold text-slate-800 mb-3">Submission & Intelligent Routing</h3>
                                <p>
                                    Once submitted, the UES intelligent routing engine takes over. The RFQ is instantly delivered to the designated supplier's dashboard with push notifications. If the buyer opted for an "Open Market RFQ," the system algorithmically matches the request with multiple verified suppliers capable of fulfilling the order, generating a competitive bidding environment that ensures the buyer receives the best possible market rate.
                                </p>
                            </div>
                        </div>

                        <div class="flex gap-6">
                            <div class="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white font-black text-2xl shrink-0 mt-1">3</div>
                            <div>
                                <h3 class="text-2xl font-bold text-slate-800 mb-3">Evaluation & Live Negotiation</h3>
                                <p>
                                    Suppliers review the RFQ and use the UES Configure, Price, Quote (CPQ) tools to generate a formal response. They can apply volume discounts, adjust lead times, and add shipping estimates. If the buyer is not satisfied with the initial quote, they can initiate a counter-offer directly within the platform. This live negotiation happens in a secure, logged chat interface attached to the specific RFQ document, ensuring a perfect audit trail of all agreed-upon terms.
                                </p>
                            </div>
                        </div>

                        <div class="flex gap-6">
                            <div class="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white font-black text-2xl shrink-0 mt-1">4</div>
                            <div>
                                <h3 class="text-2xl font-bold text-slate-800 mb-3">Approval & One-Click Conversion</h3>
                                <p>
                                    Once both parties reach an agreement, the buyer approves the quote. The UES employs a "One-Click Conversion" mechanism. The approved quote is instantly transformed into a formal, actionable Purchase Order. The required funds can be captured via escrow, Net-30 invoicing (for approved accounts), or wire transfer instructions generated by the system.
                                </p>
                            </div>
                        </div>

                        <div class="flex gap-6">
                            <div class="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white font-black text-2xl shrink-0 mt-1">5</div>
                            <div>
                                <h3 class="text-2xl font-bold text-slate-800 mb-3">Fulfillment & ERP Integration</h3>
                                <p>
                                    Upon PO generation, the order flows seamlessly into the supplier's fulfillment queue. For enterprise users, the UES API automatically syncs this data back to their internal ERP or procurement software, updating inventory forecasting and financial ledgers in real-time. The global tracking engine then monitors the bulk shipment until final delivery.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <section class="mt-16">
                    <h2 class="text-3xl font-bold text-slate-900 mb-6">Best Practices for Buyers</h2>
                    <ul class="list-disc pl-8 space-y-4 text-slate-700">
                        <li><strong>Be Exhaustively Specific:</strong> Vague RFQs result in inflated quotes as suppliers pad prices to account for uncertainty. Upload technical schematics, specify exact material grades, and clearly define acceptable tolerances.</li>
                        <li><strong>Understand Incoterms:</strong> Clearly state your preferred shipping terms. Requesting FOB (Free on Board) means the supplier only pays to get the goods on a ship; you handle the rest. Requesting DDP (Delivered Duty Paid) means the supplier handles all freight and customs up to your warehouse door.</li>
                        <li><strong>Leverage Tiered Pricing:</strong> Ask suppliers to provide quotes for multiple volume tiers (e.g., 1,000 units, 5,000 units, 10,000 units) within the same RFQ to understand their economy of scale and plan future procurement.</li>
                        <li><strong>Monitor Supplier SLAs:</strong> WID LTD tracks supplier responsiveness. Prefer suppliers who maintain high Service Level Agreement (SLA) scores for quote turnaround times to ensure reliable communication.</li>
                    </ul>
                </section>
            </div>
        `;
    },

    shipping() {
        return `
            ${this._heroSection('Global Shipping & Compliance', 'Navigating the complexities of international logistics')}
            <div class="max-w-6xl mx-auto px-6 py-20 text-slate-700 leading-loose text-lg">
                
                <section>
                    <h2 class="text-4xl font-bold text-slate-900 mb-8 border-b-2 border-blue-100 pb-4">The Pillars of Global Shipping Compliance</h2>
                    <p class="mb-6">
                        In the modern era of interconnected global trade, moving a physical product from a manufacturing hub in Asia to a consumer in Europe or North America is a marvel of logistical engineering. However, it is fraught with regulatory peril. At WID LTD, we have engineered the Unified E-commerce System (UES) to not merely facilitate shipping, but to act as a rigorous compliance engine that protects buyers, sellers, and dropshippers from the legal and financial pitfalls of international logistics.
                    </p>
                    <p class="mb-6">
                        Navigating global shipping regulations is a critical component of cross-border e-commerce. Because rules vary significantly by destination—dictated by shifting geopolitical trade agreements, environmental standards, and national security policies—compliance is essential to avoid shipment delays, crippling fines, seized goods, and irreparably damaged customer relationships. Our architecture automates this complexity.
                    </p>
                </section>

                <section class="mt-16">
                    <h2 class="text-3xl font-bold text-slate-900 mb-8">1. Algorithmic Customs Documentation</h2>
                    <p class="mb-6">
                        Accurate documentation is the bedrock of cross-border trade. A single missing field on a customs declaration can result in a pallet of goods sitting in a port for weeks, incurring exorbitant demurrage fees. The UES automates the generation of flawless shipping documentation for every transaction.
                    </p>
                    <ul class="list-disc pl-8 space-y-4 mb-6">
                        <li><strong>Commercial Invoices:</strong> Automatically generated detailing exact contents, declared transactional value, currency, and the specific Incoterms governing the shipment.</li>
                        <li><strong>Harmonized System (HS) Codes:</strong> These standardized 6-to-10 digit numerical codes are utilized by customs authorities worldwide to classify products and determine tariff rates. The UES mandates HS code mapping for all supplier products, ensuring automated, accurate classification and preventing costly misdeclaration penalties.</li>
                        <li><strong>Country-of-Origin Declarations:</strong> Essential for verifying where goods were manufactured. This data is dynamically pulled to determine eligibility for preferential tariff rates under treaties like USMCA or the EU-UK Trade and Cooperation Agreement.</li>
                        <li><strong>Automated Permit Checks:</strong> Based on the product category (e.g., FDA regulations for cosmetics, FCC certifications for electronics), the system prompts suppliers to attach necessary digital compliance certificates before a shipping label can even be generated.</li>
                    </ul>
                </section>

                <section class="mt-16">
                    <h2 class="text-3xl font-bold text-slate-900 mb-8">2. Duties, Taxes, and the Landed Cost Engine</h2>
                    <p class="mb-6">
                        Nothing destroys consumer trust faster than a "ransom package"—an order that arrives requiring unexpected cash payment for import duties before the courier will release it. To solve this, WID LTD developed the <strong>Landed Cost Engine</strong>.
                    </p>
                    <p class="mb-6">
                        During the checkout phase, the UES cross-references the buyer's shipping address with the origin of the goods and the item's HS code. It queries live databases of global tax regimes, calculating exactly what the import duties, Value Added Tax (VAT), or Goods and Services Tax (GST) will be.
                    </p>
                    <ul class="list-disc pl-8 space-y-4 mb-6">
                        <li><strong>DDP (Delivered Duty Paid):</strong> We heavily prioritize DDP routing. The buyer pays the calculated duties at checkout. WID LTD utilizes our logistics partners' brokerages to remit these taxes directly to the destination country's government. The package sails through customs via the "green channel" and arrives directly at the consumer's door.</li>
                        <li><strong>DAP (Delivered At Place):</strong> If DDP is not supported for a highly obscure route, the system clearly alerts the buyer that the transaction is DAP, meaning they are explicitly responsible for settling customs fees prior to final delivery.</li>
                        <li><strong>De Minimis Optimization:</strong> Every country has a "De Minimis" threshold—a value below which imported items are entirely exempt from duties or taxes (e.g., $800 in the USA, £135 for VAT in the UK). Our system intelligently routes and sometimes splits shipments to legally optimize for these thresholds, saving consumers money.</li>
                    </ul>
                </section>

                <section class="mt-16">
                    <h2 class="text-3xl font-bold text-slate-900 mb-8">3. Restricted Items & Prohibited Goods Sanctions</h2>
                    <p class="mb-6">
                        Shipping prohibited items can lead to severe legal penalties and permanent bans from carrier networks. Each country maintains extensive lists of forbidden goods (e.g., specific lithium-ion battery configurations, agricultural products, or dual-use technologies). 
                    </p>
                    <p class="mb-6">
                        The UES incorporates a real-time sanction screening and restricted items database. If a consumer in Australia attempts to purchase a wooden product that does not have the required fumigation certificates, the platform will block the transaction at checkout, preventing the supplier from inadvertently committing a customs violation. We constantly update these rulesets to reflect changing global embargoes and aviation security regulations.
                    </p>
                </section>

                <section class="mt-16 border-t-2 border-slate-200 pt-16">
                    <h2 class="text-4xl font-bold text-slate-900 mb-8">Comprehensive Return & Refund Policy</h2>
                    <p class="mb-6">
                        To maintain a healthy ecosystem, WID LTD enforces a standardized, fair return policy across all vendors on the platform, providing security for consumers while protecting sellers from fraudulent claims.
                    </p>
                    <div class="space-y-6">
                        <div>
                            <h3 class="text-2xl font-bold text-slate-800 mb-2">1. Eligibility and Initiation Window</h3>
                            <p>Consumers have a strict 14-day window, commencing on the timestamp of delivery as reported by the carrier, to initiate a return request. To be eligible, the item must be unused, unwashed, unaltered, and in the exact same condition that you received it. It must also be in the original packaging with all tags, manuals, and accessories included.</p>
                        </div>
                        <div>
                            <h3 class="text-2xl font-bold text-slate-800 mb-2">2. The Return Process</h3>
                            <p>To start a return, log into your account, locate the order, and submit a "Return Request." You must specify the reason. If the item is defective, damaged in transit, or incorrect, you are required to upload clear photographic evidence. Upon review by our automated systems or support staff, a Return Merchandise Authorization (RMA) number and instructions will be generated.</p>
                        </div>
                        <div>
                            <h3 class="text-2xl font-bold text-slate-800 mb-2">3. Shipping Costs</h3>
                            <p>If the return is necessitated by a supplier error (wrong item, defective product), WID LTD will provide a prepaid return shipping label at zero cost to the consumer. If the return is due to buyer's remorse (e.g., changed mind, ordered wrong size), the consumer is responsible for the return shipping costs. In cases where we provide a label for buyer's remorse, the exact cost of that label will be deducted from the final refund amount.</p>
                        </div>
                        <div>
                            <h3 class="text-2xl font-bold text-slate-800 mb-2">4. Inspection and Refund Issuance</h3>
                            <p>Once your return is received at our designated warehouse, it undergoes a meticulous inspection process, usually completed within 48 hours. If the item passes inspection, the refund is immediately authorized. Funds are returned to the original method of payment. Depending on your credit card issuer or bank, it may take an additional 3 to 7 business days for the credit to officially post to your account. We do not offer store credit alternatives unless explicitly requested.</p>
                        </div>
                    </div>
                </section>
            </div>
        `;
    },

    privacy() {
        return `
            ${this._heroSection('Privacy Policy & Data Security', 'Your data is a liability to others; to us, it is a sacred trust.')}
            <div class="max-w-5xl mx-auto px-6 py-20 text-slate-700 leading-loose text-lg">
                <p class="font-bold text-slate-900 mb-12 border-l-4 border-blue-600 pl-4 bg-blue-50 py-4">Effective Date: January 1, 2026<br>Last Updated: May 21, 2026</p>
                
                <section>
                    <h2 class="text-3xl font-bold text-slate-900 mb-6">1. Introduction and Core Philosophy</h2>
                    <p class="mb-6">
                        WID LTD ("we," "our," or "us") operates the Xperiencestore platform and the Unified E-commerce System (UES). We recognize that in the digital age, data privacy is not merely a regulatory hurdle; it is a fundamental human right. This Privacy Policy is exhaustively detailed to provide you with absolute transparency regarding how we collect, use, process, encrypt, and ultimately destroy your personal data. 
                    </p>
                    <p class="mb-6">
                        When you engage in international e-commerce, your data crosses borders. Therefore, our compliance architecture is designed to meet or exceed the most stringent global data protection standards, including the European Union’s General Data Protection Regulation (GDPR), the California Consumer Privacy Act (CCPA), and Brazil’s Lei Geral de Proteção de Dados (LGPD). When utilizing our platform, you are protected by the laws of your jurisdiction.
                    </p>
                </section>

                <section class="mt-12">
                    <h2 class="text-3xl font-bold text-slate-900 mb-6">2. Information We Collect</h2>
                    <p class="mb-4">We collect information systematically to provide a secure, personalized, and efficient platform experience. The data we collect falls into three primary categories:</p>
                    
                    <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">A. Data You Provide Directly</h3>
                    <ul class="list-disc pl-8 space-y-2 mb-6">
                        <li><strong>Identity Data:</strong> First name, last name, username, and organizational role (e.g., dropshipper, supplier).</li>
                        <li><strong>Contact Data:</strong> Billing addresses, shipping coordinates, email addresses, and telephone numbers.</li>
                        <li><strong>Financial Data:</strong> While we do not store raw credit card numbers on our servers (this is handled directly by PCI-DSS Level 1 compliant processors like Stripe and Paystack), we store payment tokens, partial card numbers for identification, and bank account details for supplier payouts.</li>
                        <li><strong>Corporate Data:</strong> For B2B and Supplier accounts, we collect business registration numbers, tax identification numbers (VAT/EIN), and beneficial ownership information required for strict KYC (Know Your Customer) and AML (Anti-Money Laundering) compliance.</li>
                    </ul>

                    <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">B. Data We Collect Automatically</h3>
                    <ul class="list-disc pl-8 space-y-2 mb-6">
                        <li><strong>Technical Data:</strong> IP addresses, browser types, operating systems, time zone settings, and geolocation data.</li>
                        <li><strong>Usage Data:</strong> Detailed analytics on how you navigate the UES, products viewed, RFQs submitted, time spent on pages, and interaction heatmaps to optimize UX.</li>
                        <li><strong>Log Data:</strong> Diagnostic information related to errors, crashes, and security events generated by our servers.</li>
                    </ul>

                    <h3 class="text-xl font-bold text-slate-800 mt-6 mb-3">C. Data from Third Parties</h3>
                    <p class="mb-6">
                        We may receive information about you from our logistics partners (e.g., delivery status updates, customs clearance issues), fraud prevention networks, and identity verification services.
                    </p>
                </section>

                <section class="mt-12">
                    <h2 class="text-3xl font-bold text-slate-900 mb-6">3. Lawful Basis for Processing (GDPR Compliance)</h2>
                    <p class="mb-4">For users residing in the European Economic Area (EEA) and the UK, we only process your personal data when we have a valid legal foundation to do so:</p>
                    <ul class="list-disc pl-8 space-y-4 mb-6">
                        <li><strong>Contractual Necessity:</strong> To fulfill our obligations under the Terms of Service. For example, we must process your address and payment details to deliver the product you purchased.</li>
                        <li><strong>Legitimate Interests:</strong> To improve our platform, conduct security monitoring, prevent fraud, and perform marketing (provided it does not override your fundamental rights).</li>
                        <li><strong>Legal Obligation:</strong> To comply with tax laws, international trade sanctions, and law enforcement requests.</li>
                        <li><strong>Consent:</strong> When you have explicitly opted-in to receive promotional newsletters or allow non-essential tracking cookies. You may withdraw this consent at any time.</li>
                    </ul>
                </section>

                <section class="mt-12">
                    <h2 class="text-3xl font-bold text-slate-900 mb-6">4. Data Sharing and International Transfers</h2>
                    <p class="mb-4">
                        WID LTD does not and will never sell your personal data to data brokers. However, executing global commerce requires sharing specific data with trusted third parties:
                    </p>
                    <ul class="list-disc pl-8 space-y-4 mb-6">
                        <li><strong>Suppliers & Dropshippers:</strong> If you are a consumer, the seller only receives the data strictly necessary to fulfill your order (name, shipping address). They do not receive your payment information.</li>
                        <li><strong>Logistics Providers:</strong> Carriers (e.g., DHL, FedEx, local postal services) and customs brokerages require your contact details and order manifest to clear customs and deliver the package.</li>
                        <li><strong>Service Providers:</strong> Cloud hosting infrastructure (AWS, Oracle), payment gateways, and cybersecurity auditors who are bound by stringent Data Processing Agreements (DPAs).</li>
                    </ul>
                    <p class="mb-6">
                        <strong>International Transfers:</strong> Because the UES operates globally, your data may be transferred to and processed in countries outside of your residence. When transferring data from the EEA to jurisdictions lacking an adequacy decision, we utilize Standard Contractual Clauses (SCCs) approved by the European Commission to ensure your data remains legally protected.
                    </p>
                </section>

                <section class="mt-12">
                    <h2 class="text-3xl font-bold text-slate-900 mb-6">5. Your Privacy Rights</h2>
                    <p class="mb-4">Depending on your jurisdiction, you possess sweeping rights over your personal data:</p>
                    <ul class="list-disc pl-8 space-y-4 mb-6">
                        <li><strong>Right to Access:</strong> You may request a comprehensive export of all personal data we hold about you.</li>
                        <li><strong>Right to Rectification:</strong> You can demand correction of inaccurate or incomplete data.</li>
                        <li><strong>Right to Erasure ("Right to be Forgotten"):</strong> You may request the total deletion of your data. Note that we may be legally required to retain certain transactional data for tax and fraud prevention purposes.</li>
                        <li><strong>Right to Portability:</strong> You can request your data in a structured, machine-readable format to transfer to another service.</li>
                    </ul>
                    <p>To exercise any of these rights, please submit a request to our Data Protection Officer (DPO) at <strong>privacy@wid-ltd.com</strong>. We are legally bound to respond within 30 days.</p>
                </section>
                
                <section class="mt-12">
                    <h2 class="text-3xl font-bold text-slate-900 mb-6">6. Data Security and Retention</h2>
                    <p class="mb-6">
                        The UES utilizes military-grade AES-256 encryption for data at rest and TLS 1.3 for data in transit. We employ rigorous access controls, ensuring that our own engineers can only access anonymized or obfuscated data unless explicitly required for troubleshooting. We retain your personal data only for as long as necessary to fulfill the purposes outlined in this policy, or to comply with statutory retention periods.
                    </p>
                </section>
            </div>
        `;
    },

    terms() {
        return `
            ${this._heroSection('Terms of Service', 'The legally binding rules governing the Xperiencestore Ecosystem')}
            <div class="max-w-5xl mx-auto px-6 py-20 text-slate-700 leading-loose text-lg">
                <p class="font-bold text-slate-900 mb-12 border-l-4 border-blue-600 pl-4 bg-blue-50 py-4">Effective Date: January 1, 2026<br>Please read these terms carefully before accessing or utilizing our platform.</p>

                <section>
                    <h2 class="text-3xl font-bold text-slate-900 mb-6">1. Legally Binding Agreement</h2>
                    <p class="mb-6">
                        These Terms of Service ("Terms") constitute a legally binding contract between you (whether an individual consumer, a registered corporate entity, a dropshipper, or a supplier) and WID LTD ("Company," "we," "us"). By registering an account, accessing the Xperiencestore website, interacting with our APIs, or utilizing the Unified E-commerce System (UES) in any capacity, you acknowledge that you have read, understood, and unequivocally agree to be bound by these Terms.
                    </p>
                    <p class="mb-6">
                        If you are accepting these Terms on behalf of a company or other legal entity, you represent and warrant that you possess the explicit legal authority to bind that entity to these Terms. If you do not agree with all of these Terms, you are expressly prohibited from using the platform and must discontinue use immediately.
                    </p>
                </section>

                <section class="mt-12">
                    <h2 class="text-3xl font-bold text-slate-900 mb-6">2. Account Registration and Security</h2>
                    <p class="mb-6">
                        To access the full functionality of the UES, you must register for an account. You agree to provide true, accurate, current, and complete information during the registration process and to update such information to keep it accurate. 
                    </p>
                    <p class="mb-6">
                        You are entirely responsible for maintaining the confidentiality of your account credentials (password, API keys, 2FA tokens). WID LTD accepts no liability for any loss or damage arising from your failure to secure your account. Any activity occurring under your account is deemed to be authorized by you, and you accept full legal and financial responsibility for such activity.
                    </p>
                </section>

                <section class="mt-12">
                    <h2 class="text-3xl font-bold text-slate-900 mb-6">3. Specific User Role Obligations</h2>
                    <p class="mb-4">The UES is a multi-tier platform. Your rights and obligations are determined by the specific role of your account:</p>
                    
                    <h3 class="text-xl font-bold text-slate-800 mt-6 mb-2">3.1 Consumers (B2C)</h3>
                    <p class="mb-4">
                        Consumers agree to use the platform for lawful personal purchasing. You agree not to exploit payment gateways, file fraudulent chargebacks, or attempt to manipulate the review system. You acknowledge that WID LTD acts as a platform facilitating the transaction between you and third-party suppliers, and while we enforce strict quality standards, WID LTD does not take legal title to the goods at any point.
                    </p>

                    <h3 class="text-xl font-bold text-slate-800 mt-6 mb-2">3.2 Business Buyers (B2B)</h3>
                    <p class="mb-4">
                        B2B accounts participating in the Request for Quote (RFQ) process must act in good faith. Generating excessive, frivolous RFQs with no intent to purchase may result in account suspension. A finalized Purchase Order (PO) generated from an approved quote constitutes a binding contract between the Buyer and the Supplier. 
                    </p>

                    <h3 class="text-xl font-bold text-slate-800 mt-6 mb-2">3.3 Dropshippers</h3>
                    <p class="mb-4">
                        Dropshippers utilize the UES to curate products and sell them through personalized storefronts. You are strictly prohibited from misrepresenting the capabilities, origins, or brand affiliations of the products you curate. While WID LTD handles the back-end fulfillment, you remain the merchant of record for marketing purposes. You must not engage in deceptive advertising practices, and you assume full liability for any regulatory fines incurred due to your marketing materials.
                    </p>

                    <h3 class="text-xl font-bold text-slate-800 mt-6 mb-2">3.4 Suppliers and Manufacturers</h3>
                    <p class="mb-4">
                        Suppliers are bound by a separate, extensive Vendor Agreement. However, under these general terms, Suppliers warrant that all uploaded catalog data (including HS codes, dimensions, and materials) is meticulously accurate. Suppliers bear absolute legal responsibility for ensuring their products do not infringe on intellectual property rights and comply with all safety regulations in the destination markets they opt to serve.
                    </p>
                </section>

                <section class="mt-12">
                    <h2 class="text-3xl font-bold text-slate-900 mb-6">4. Intellectual Property Rights</h2>
                    <p class="mb-6">
                        The Xperiencestore platform, the UES architecture, algorithms, UI/UX designs, source code, logos, and all associated intellectual property are the exclusive property of WID LTD and its founder, Ike Wisdom Okemsinachi. These Terms do not convey to you any rights of ownership in or related to the platform. 
                    </p>
                    <p class="mb-6">
                        You are granted a limited, non-exclusive, non-transferable, and revocable license to access and use the platform strictly in accordance with these Terms. You may not reverse engineer, decompile, disassemble, or attempt to derive the source code of the UES. Scraping data, utilizing automated bots to harvest pricing information, or attempting to bypass rate limits will result in immediate permanent banning and potential legal action under the Computer Fraud and Abuse Act (CFAA) or equivalent international laws.
                    </p>
                </section>

                <section class="mt-12">
                    <h2 class="text-3xl font-bold text-slate-900 mb-6">5. Disclaimers and Limitation of Liability</h2>
                    <p class="mb-6 font-bold uppercase tracking-wide text-slate-900">Please read this section carefully as it limits the liability of WID LTD.</p>
                    <p class="mb-6">
                        The platform is provided on an "AS IS" and "AS AVAILABLE" basis. WID LTD expressly disclaims all warranties of any kind, whether express or implied, including but not limited to the implied warranties of merchantability, fitness for a particular purpose, and non-infringement. We do not warrant that the platform will be uninterrupted, timely, secure, or error-free, nor do we guarantee the quality, safety, or legality of items advertised by third-party suppliers.
                    </p>
                    <p class="mb-6">
                        To the maximum extent permitted by applicable law, in no event shall WID LTD, its founder, directors, employees, or agents be liable for any indirect, incidental, special, consequential, or punitive damages. This includes, without limitation, loss of profits, data, goodwill, or business interruption arising out of or in connection with your use or inability to use the platform, even if we have been advised of the possibility of such damages. In no event shall our total aggregate liability exceed the total fees paid by you to WID LTD in the twelve (12) months preceding the event giving rise to the claim.
                    </p>
                </section>

                <section class="mt-12">
                    <h2 class="text-3xl font-bold text-slate-900 mb-6">6. Governing Law and Dispute Resolution</h2>
                    <p class="mb-6">
                        These Terms shall be governed by and construed in accordance with international commercial law, with specific jurisdiction falling under the courts where WID LTD holds its primary corporate registration, without regard to its conflict of law provisions.
                    </p>
                    <p class="mb-6">
                        Any dispute arising out of or in connection with these Terms, including any question regarding its existence, validity, or termination, shall first be attempted to be resolved through good faith negotiation. If negotiation fails, the dispute shall be referred to and finally resolved by binding arbitration under the Rules of Arbitration of the International Chamber of Commerce (ICC).
                    </p>
                </section>

                <section class="mt-12">
                    <h2 class="text-3xl font-bold text-slate-900 mb-6">7. Modifications to the Terms</h2>
                    <p class="mb-6">
                        WID LTD reserves the right to modify, amend, or replace these Terms at any time. We will provide reasonable notice of any material changes (e.g., via email or a prominent notice on the platform dashboard). Your continued use of the platform following the effective date of such modifications constitutes your legally binding acceptance of the new Terms.
                    </p>
                </section>
            </div>
        `;
    }
};
