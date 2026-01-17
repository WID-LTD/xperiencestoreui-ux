/**
 * pages.js - All Page Templates
 * Centralized page rendering for all user types
 */

import { Data } from './data.js';
import { State } from './state.js';
import { Router } from './router.js';
import { Components } from './components.js';

export const Pages = {
    // ==================== SHARED PAGES ====================
    
    login() {
        // Defer execution to attach event listeners after render
        setTimeout(() => {
            const form = document.getElementById('loginForm');
            if (form) {
                form.onsubmit = (e) => {
                    e.preventDefault();
                    const email = document.getElementById('loginEmail').value;
                    const password = document.getElementById('loginPassword').value;
                    
                    const result = Auth.login(email, password);
                    if (result.success) {
                        Components.showNotification(`Welcome back! Logged in as ${result.role}`, 'success');
                        // Navigate based on role
                        if (result.role === 'admin') Router.navigate('/admin/reports');
                        else if (result.role === 'consumer') Router.navigate('/products');
                        else if (result.role === 'business') Router.navigate('/business/account');
                        else if (result.role === 'dropshipper') Router.navigate('/dropshipper/storefront');
                        else if (result.role === 'supplier') Router.navigate('/supplier/reports');
                        else Router.navigate('/');
                    } else {
                        Components.showNotification(result.message, 'error');
                    }
                };
            }
        }, 0);

        return `
            <div class="flex items-center justify-center min-h-[70vh]">
                <div class="glass-card p-8 rounded-3xl w-full max-w-md border border-white">
                    <div class="text-center mb-8">
                        <img src="assets/logo.png" class="h-12 mx-auto mb-4">
                        <h2 class="text-2xl font-bold text-slate-800">Welcome Back</h2>
                        <p class="text-slate-500 text-sm">Login to access your account</p>
                    </div>
                    <form id="loginForm" class="space-y-4">
                        <div>
                            <label class="text-xs font-bold text-slate-600 ml-1">EMAIL</label>
                            <input type="email" id="loginEmail" required class="w-full p-3 rounded-xl border bg-white/50 outline-none focus:border-blue-500">
                        </div>
                        <div>
                            <label class="text-xs font-bold text-slate-600 ml-1">PASSWORD</label>
                            <input type="password" id="loginPassword" required class="w-full p-3 rounded-xl border bg-white/50 outline-none focus:border-blue-500">
                        </div>
                        <div class="flex items-center justify-between text-sm">
                            <label class="flex items-center gap-2">
                                <input type="checkbox" class="rounded">
                                <span class="text-slate-600">Remember me</span>
                            </label>
                            <a href="#/forgot-password" class="text-blue-600 hover:underline">Forgot password?</a>
                        </div>
                        <button type="submit" class="w-full bg-blue-600 text-white p-4 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all">Sign In</button>
                    </form>
                    <div class="mt-6 text-center text-sm">
                        <span class="text-slate-500">Don't have an account?</span>
                        <a onclick="Router.navigate('/register')" class="text-blue-600 font-bold hover:underline ml-1 cursor-pointer">Sign Up</a>
                    </div>
                </div>
            </div>
        `;
    },

    register() {
        // Defer execution
        setTimeout(() => {
            const form = document.getElementById('registerForm');
            if (form) {
                form.onsubmit = (e) => {
                    e.preventDefault();
                    
                    const firstName = document.getElementById('regFirstName').value;
                    const lastName = document.getElementById('regLastName').value;
                    const email = document.getElementById('regEmail').value;
                    const password = document.getElementById('regPassword').value;
                    const role = document.getElementById('regRole').value;
                    
                    const userData = { firstName, lastName, email, password, role };
                    
                    const result = Auth.register(userData);
                    if (result.success) {
                        Components.showNotification('Account created successfully!', 'success');
                        // Navigate based on role
                        if (result.role === 'admin') Router.navigate('/admin/reports');
                        else if (result.role === 'consumer') Router.navigate('/products');
                        else if (result.role === 'business') Router.navigate('/business/account');
                        else if (result.role === 'dropshipper') Router.navigate('/dropshipper/storefront');
                        else if (result.role === 'supplier') Router.navigate('/supplier/reports');
                        else Router.navigate('/');
                    } else {
                        Components.showNotification(result.message, 'error');
                    }
                };
            }
        }, 0);

        return `
            <div class="flex items-center justify-center min-h-[70vh] py-10">
                <div class="glass-card p-8 rounded-3xl w-full max-w-2xl border border-white">
                    <div class="text-center mb-8">
                        <img src="assets/logo.png" class="h-12 mx-auto mb-4">
                        <h2 class="text-2xl font-bold text-slate-800">Create Account</h2>
                        <p class="text-slate-500 text-sm">Join Xperiencestore today</p>
                    </div>
                    <form id="registerForm" class="space-y-4">
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="text-xs font-bold text-slate-600 ml-1">FIRST NAME</label>
                                <input type="text" id="regFirstName" required class="w-full p-3 rounded-xl border bg-white/50 outline-none focus:border-blue-500">
                            </div>
                            <div>
                                <label class="text-xs font-bold text-slate-600 ml-1">LAST NAME</label>
                                <input type="text" id="regLastName" required class="w-full p-3 rounded-xl border bg-white/50 outline-none focus:border-blue-500">
                            </div>
                        </div>
                        <div>
                            <label class="text-xs font-bold text-slate-600 ml-1">EMAIL</label>
                            <input type="email" id="regEmail" required class="w-full p-3 rounded-xl border bg-white/50 outline-none focus:border-blue-500">
                        </div>
                        <div>
                            <label class="text-xs font-bold text-slate-600 ml-1">PASSWORD</label>
                            <input type="password" id="regPassword" required class="w-full p-3 rounded-xl border bg-white/50 outline-none focus:border-blue-500">
                        </div>
                        <div>
                            <label class="text-xs font-bold text-slate-600 ml-1">ACCOUNT TYPE</label>
                            <select id="regRole" class="w-full p-3 rounded-xl border bg-white/50 outline-none focus:border-blue-500">
                                <option value="consumer">Consumer (B2C)</option>
                                <option value="business">Business (B2B)</option>
                                <option value="dropshipper">Dropshipper</option>
                                <option value="supplier">Supplier</option>
                            </select>
                        </div>
                        <div class="flex items-start gap-2">
                            <input type="checkbox" required class="mt-1">
                            <label class="text-xs text-slate-600">I agree to the <a href="#/terms" class="text-blue-600 hover:underline">Terms of Service</a> and <a href="#/privacy" class="text-blue-600 hover:underline">Privacy Policy</a></label>
                        </div>
                        <button type="submit" class="w-full bg-blue-600 text-white p-4 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all">Create Account</button>
                    </form>
                    <div class="mt-6 text-center text-sm">
                        <span class="text-slate-500">Already have an account?</span>
                        <a onclick="Router.navigate('/login')" class="text-blue-600 font-bold hover:underline ml-1 cursor-pointer">Sign In</a>
                    </div>
                </div>
            </div>
        `;
    },

    // ==================== CONSUMER PAGES ====================
    
    consumer: {
        home() {
            const products = Data.products.slice(0, 8);
            window.currentProducts = products;
            
            return `
                <div class="space-y-10">
                    <!-- Hero Section -->
                    <div class="glass-card bg-gradient-to-r from-blue-600 to-blue-400 rounded-[2rem] p-12 text-white flex flex-col md:flex-row justify-between items-center">
                        <div class="max-w-md mb-6 md:mb-0">
                            <h1 class="text-5xl font-bold mb-4">Shop Smarter, Live Better</h1>
                            <p class="mb-6 opacity-90 text-lg">Discover amazing products at unbeatable prices</p>
                            <div class="flex gap-4">
                                <button onclick="Router.navigate('/products')" class="bg-white text-blue-600 px-6 py-3 rounded-full font-bold hover:shadow-xl transition-all">Explore Products</button>
                                <button onclick="Router.navigate('/categories')" class="border-2 border-white px-6 py-3 rounded-full font-bold hover:bg-white/10 transition-all">Browse Categories</button>
                            </div>
                        </div>
                        <img src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400" class="h-64 rounded-2xl shadow-2xl">
                    </div>

                    <!-- Categories -->
                    <div>
                        <h2 class="text-2xl font-bold mb-6">Shop by Category</h2>
                        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            ${Data.categories.map(cat => `
                                <div onclick="Router.navigate('/category/${cat.slug}')" class="glass-card p-6 rounded-2xl text-center hover:shadow-xl transition-all cursor-pointer">
                                    <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <i data-lucide="${cat.icon}" class="w-6 h-6 text-blue-600"></i>
                                    </div>
                                    <h3 class="font-bold text-sm">${cat.name}</h3>
                                    <p class="text-xs text-slate-400 mt-1">${cat.count} items</p>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Featured Products -->
                    <div>
                        <div class="flex items-center justify-between mb-6">
                            <h2 class="text-2xl font-bold">Featured Products</h2>
                            <a href="#/products" class="text-blue-600 font-bold hover:underline">View All →</a>
                        </div>
                        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            ${products.map(product => Components.ProductCard(product)).join('')}
                        </div>
                    </div>

                    <!-- Features -->
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div class="glass-card p-6 rounded-2xl text-center">
                            <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <i data-lucide="truck" class="w-8 h-8 text-green-600"></i>
                            </div>
                            <h3 class="font-bold mb-2">Free Shipping</h3>
                            <p class="text-sm text-slate-500">On orders over $100</p>
                        </div>
                        <div class="glass-card p-6 rounded-2xl text-center">
                            <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <i data-lucide="shield-check" class="w-8 h-8 text-blue-600"></i>
                            </div>
                            <h3 class="font-bold mb-2">Secure Payment</h3>
                            <p class="text-sm text-slate-500">100% secure transactions</p>
                        </div>
                        <div class="glass-card p-6 rounded-2xl text-center">
                            <div class="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <i data-lucide="headphones" class="w-8 h-8 text-orange-600"></i>
                            </div>
                            <h3 class="font-bold mb-2">24/7 Support</h3>
                            <p class="text-sm text-slate-500">Always here to help</p>
                        </div>
                    </div>
                </div>
            `;
        },

        products(params = {}) {
            const { category, search, page = 1 } = params;
            let products = Data.products;
            
            // Filter by category
            if (category) {
                products = products.filter(p => p.slug === category || p.categoryId.toString() === category);
            }
            
            // Filter by search
            if (search) {
                products = products.filter(p => 
                    p.name.toLowerCase().includes(search.toLowerCase()) ||
                    p.description.toLowerCase().includes(search.toLowerCase())
                );
            }

            window.currentProducts = products;
            const itemsPerPage = 12;
            const totalPages = Math.ceil(products.length / itemsPerPage);
            const startIndex = (page - 1) * itemsPerPage;
            const paginatedProducts = products.slice(startIndex, startIndex + itemsPerPage);

            return `
                <div>
                    ${Components.Breadcrumbs([
                        { label: 'Home', link: '/' },
                        { label: category ? Data.categories.find(c => c.slug === category)?.name || 'Products' : 'All Products' }
                    ])}

                    <div class="flex flex-col md:flex-row gap-8">
                        <!-- Filters Sidebar -->
                        <aside class="w-full md:w-64 space-y-6">
                            <div class="glass-card p-6 rounded-2xl">
                                <h3 class="font-bold mb-4 text-slate-800">Categories</h3>
                                <div class="space-y-2 text-sm">
                                    ${Data.categories.map(cat => `
                                        <label class="flex items-center gap-2 cursor-pointer hover:text-blue-600 transition-colors">
                                            <input type="checkbox" class="rounded" ${category === cat.slug ? 'checked' : ''}>
                                            <span>${cat.name}</span>
                                            <span class="ml-auto text-slate-400">${cat.count}</span>
                                        </label>
                                    `).join('')}
                                </div>
                            </div>

                            <div class="glass-card p-6 rounded-2xl">
                                <h3 class="font-bold mb-4 text-slate-800">Price Range</h3>
                                <input type="range" min="0" max="500" class="w-full mb-2">
                                <div class="flex justify-between text-xs text-slate-400">
                                    <span>$0</span>
                                    <span>$500+</span>
                                </div>
                            </div>

                            <div class="glass-card p-6 rounded-2xl">
                                <h3 class="font-bold mb-4 text-slate-800">Rating</h3>
                                <div class="space-y-2 text-sm">
                                    ${[5, 4, 3, 2, 1].map(rating => `
                                        <label class="flex items-center gap-2 cursor-pointer">
                                            <input type="checkbox" class="rounded">
                                            <div class="flex text-orange-400">
                                                ${Components.StarRating(rating)}
                                            </div>
                                            <span class="text-slate-600">& Up</span>
                                        </label>
                                    `).join('')}
                                </div>
                            </div>
                        </aside>

                        <!-- Products Grid -->
                        <div class="flex-1">
                            <div class="flex justify-between items-center mb-6">
                                <p class="text-sm text-slate-500">Showing ${startIndex + 1}-${Math.min(startIndex + itemsPerPage, products.length)} of ${products.length} products</p>
                                <select class="bg-transparent border rounded-lg px-4 py-2 text-sm font-bold text-slate-800 outline-none">
                                    <option>Sort by: Newest</option>
                                    <option>Price: Low to High</option>
                                    <option>Price: High to Low</option>
                                    <option>Rating: High to Low</option>
                                    <option>Most Popular</option>
                                </select>
                            </div>

                            ${paginatedProducts.length > 0 ? `
                                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    ${paginatedProducts.map(product => Components.ProductCard(product)).join('')}
                                </div>
                                ${Components.Pagination(page, totalPages, 'Pages.consumer.changePage')}
                            ` : Components.EmptyState('search', 'No Products Found', 'Try adjusting your filters or search query', '<button onclick="Router.navigate(\'/products\')" class="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold">Clear Filters</button>')}
                        </div>
                    </div>
                </div>
            `;
        },

        productDetail(productId) {
            const product = Data.products.find(p => p.id === parseInt(productId));
            if (!product) return Components.EmptyState('package', 'Product Not Found', 'The product you\'re looking for doesn\'t exist');

            // Ensure images array exists and has at least the main image
            if (!product.images || product.images.length === 0) {
                product.images = product.image ? [product.image] : ['https://via.placeholder.com/600'];
            }

            window.currentProducts = [product];
            const state = State.get();
            const price = state.userRole === 'business' ? product.bulkPrice : product.price;
            const isInWishlist = State.isInWishlist(product.id);

            return `
                <div class="max-w-7xl mx-auto">
                    ${Components.Breadcrumbs([
                        { label: 'Home', link: '/' },
                        { label: 'Products', link: '/products' },
                        { label: product.name }
                    ])}

                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        <!-- Product Images -->
                        <div class="space-y-4">
                            <div class="glass-card rounded-[2rem] overflow-hidden h-[500px]">
                                <img id="mainImage" src="${product.images[0]}" class="w-full h-full object-cover">
                            </div>
                            <div class="grid grid-cols-4 gap-4">
                                ${product.images.map((img, index) => `
                                    <div onclick="document.getElementById('mainImage').src='${img}'" class="glass-card rounded-xl h-24 overflow-hidden cursor-pointer border-2 ${index === 0 ? 'border-blue-600' : 'border-transparent'} hover:border-blue-400 transition-all">
                                        <img src="${img}" class="w-full h-full object-cover">
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        <!-- Product Info -->
                        <div class="flex flex-col">
                            <span class="text-blue-600 font-bold tracking-widest text-xs uppercase mb-2">${product.category}</span>
                            <h1 class="text-4xl font-bold text-slate-800 mb-4">${product.name}</h1>
                            
                            <div class="flex items-center gap-4 mb-6">
                                <div class="flex text-orange-400">
                                    ${Components.StarRating(product.rating)}
                                </div>
                                <span class="text-slate-400 text-sm">(${product.reviews} Reviews)</span>
                                <span class="text-green-600 text-sm font-bold">✓ In Stock (${product.stock})</span>
                            </div>

                            <div class="mb-8 p-6 glass-card rounded-2xl border-blue-100 bg-blue-50/30">
                                ${state.userRole === 'business' ? `
                                    <div class="flex justify-between items-center">
                                        <div>
                                            <p class="text-xs font-bold text-blue-600 uppercase">B2B Bulk Pricing</p>
                                            <p class="text-3xl font-bold">$${product.bulkPrice.toFixed(2)} <span class="text-sm font-normal text-slate-400">/ unit</span></p>
                                        </div>
                                        <div class="text-right">
                                            <p class="text-xs text-slate-500">Min. Order: ${product.moq} Units</p>
                                            <p class="text-xs text-green-600 font-bold">In Stock: ${product.stock.toLocaleString()}</p>
                                        </div>
                                    </div>
                                ` : `
                                    <div class="flex items-center gap-4">
                                        <div>
                                            <p class="text-xs font-bold text-slate-400 uppercase line-through">$${(price * 1.3).toFixed(2)}</p>
                                            <p class="text-4xl font-bold text-slate-800">$${price.toFixed(2)}</p>
                                        </div>
                                        <span class="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">Save 30%</span>
                                    </div>
                                `}
                            </div>

                            <p class="text-slate-600 leading-relaxed mb-8">${product.description}</p>

                            <div class="mb-8">
                                <h3 class="font-bold mb-3">Key Features</h3>
                                <ul class="space-y-2">
                                    ${product.features.map(feature => `
                                        <li class="flex items-center gap-2 text-slate-600">
                                            <i data-lucide="check-circle" class="w-5 h-5 text-green-600"></i>
                                            ${feature}
                                        </li>
                                    `).join('')}
                                </ul>
                            </div>

                            <div class="flex gap-4 mb-6">
                                <div class="flex items-center border rounded-xl overflow-hidden">
                                    <button onclick="this.nextElementSibling.stepDown()" class="px-4 py-3 hover:bg-slate-100 transition-all">-</button>
                                    <input type="number" value="1" min="1" class="w-20 text-center border-x outline-none py-3">
                                    <button onclick="this.previousElementSibling.stepUp()" class="px-4 py-3 hover:bg-slate-100 transition-all">+</button>
                                </div>
                                <button onclick="Components.addToCartAction(${product.id})" class="flex-1 bg-blue-600 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all">
                                    <i data-lucide="shopping-cart" class="w-5 h-5 inline mr-2"></i>
                                    Add to Cart
                                </button>
                                <button onclick="Components.toggleWishlist(${product.id})" class="border-2 ${isInWishlist ? 'border-red-500 bg-red-50' : 'border-slate-300'} px-6 rounded-xl hover:bg-slate-50 transition-all">
                                    <i data-lucide="heart" class="w-5 h-5 ${isInWishlist ? 'fill-red-500 text-red-500' : 'text-slate-600'}"></i>
                                </button>
                            </div>

                            <button onclick="Router.navigate('/checkout')" class="w-full border-2 border-slate-800 text-slate-800 py-4 rounded-xl font-bold hover:bg-slate-800 hover:text-white transition-all">
                                Buy Now
                            </button>

                            <div class="grid grid-cols-3 gap-4 mt-8 pt-8 border-t">
                                <div class="text-center">
                                    <i data-lucide="truck" class="w-6 h-6 mx-auto mb-2 text-blue-600"></i>
                                    <p class="text-xs font-bold">Free Shipping</p>
                                </div>
                                <div class="text-center">
                                    <i data-lucide="rotate-ccw" class="w-6 h-6 mx-auto mb-2 text-blue-600"></i>
                                    <p class="text-xs font-bold">30-Day Returns</p>
                                </div>
                                <div class="text-center">
                                    <i data-lucide="shield-check" class="w-6 h-6 mx-auto mb-2 text-blue-600"></i>
                                    <p class="text-xs font-bold">2-Year Warranty</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Related Products -->
                    <div class="mt-16">
                        <h2 class="text-2xl font-bold mb-6">You May Also Like</h2>
                        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            ${Data.products.filter(p => p.categoryId === product.categoryId && p.id !== product.id).slice(0, 4).map(p => Components.ProductCard(p)).join('')}
                        </div>
                    </div>
                </div>
            `;
        },

        cart() {
            const cart = State.get().cart;
            const total = State.getCartTotal();

            if (cart.length === 0) {
                return Components.EmptyState('shopping-cart', 'Your Cart is Empty', 'Add some products to get started!', '<button onclick="Router.navigate(\'/products\')" class="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold">Browse Products</button>');
            }

            window.currentProducts = cart;

            return `
                <div class="max-w-6xl mx-auto">
                    <h1 class="text-3xl font-bold mb-8">Shopping Cart (${cart.length} items)</h1>

                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <!-- Cart Items -->
                        <div class="lg:col-span-2 space-y-4">
                            ${cart.map(item => `
                                <div class="glass-card p-6 rounded-2xl flex gap-6">
                                    <img src="${item.image}" alt="${item.name}" class="w-24 h-24 object-cover rounded-xl">
                                    <div class="flex-1">
                                        <h3 class="font-bold mb-1">${item.name}</h3>
                                        <p class="text-sm text-slate-500 mb-3">${item.category}</p>
                                        <div class="flex items-center gap-4">
                                            <div class="flex items-center border rounded-lg overflow-hidden">
                                                <button onclick="State.updateCartQuantity(${item.id}, ${item.quantity - 1}); Router.navigate('/cart')" class="px-3 py-1 hover:bg-slate-100">-</button>
                                                <span class="px-4 py-1 border-x">${item.quantity}</span>
                                                <button onclick="State.updateCartQuantity(${item.id}, ${item.quantity + 1}); Router.navigate('/cart')" class="px-3 py-1 hover:bg-slate-100">+</button>
                                            </div>
                                            <button onclick="State.removeFromCart(${item.id}); Router.navigate('/cart')" class="text-red-600 text-sm hover:underline">Remove</button>
                                        </div>
                                    </div>
                                    <div class="text-right">
                                        <p class="text-xl font-bold text-blue-600">$${(item.price * item.quantity).toFixed(2)}</p>
                                        <p class="text-xs text-slate-400 mt-1">$${item.price.toFixed(2)} each</p>
                                    </div>
                                </div>
                            `).join('')}
                        </div>

                        <!-- Order Summary -->
                        <div class="glass-card p-6 rounded-2xl h-fit sticky top-24">
                            <h3 class="font-bold text-lg mb-4">Order Summary</h3>
                            <div class="space-y-3 text-sm border-b pb-4 mb-4">
                                <div class="flex justify-between">
                                    <span class="text-slate-600">Subtotal</span>
                                    <span class="font-bold">$${total.toFixed(2)}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-slate-600">Shipping</span>
                                    <span class="text-green-600 font-bold">FREE</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-slate-600">Tax (estimated)</span>
                                    <span class="font-bold">$${(total * 0.08).toFixed(2)}</span>
                                </div>
                            </div>
                            <div class="flex justify-between text-xl font-bold mb-6">
                                <span>Total</span>
                                <span class="text-blue-600">$${(total * 1.08).toFixed(2)}</span>
                            </div>
                            <button onclick="Router.navigate('/checkout')" class="w-full bg-blue-600 text-white p-4 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all mb-3">
                                Proceed to Checkout
                            </button>
                            <button onclick="Router.navigate('/products')" class="w-full border-2 border-slate-300 p-4 rounded-xl font-bold hover:bg-slate-50 transition-all">
                                Continue Shopping
                            </button>
                        </div>
                    </div>
                </div>
            `;
        },

        checkout() {
            const cart = State.get().cart;
            const total = State.getCartTotal();

            if (cart.length === 0) {
                Router.navigate('/cart');
                return '';
            }

            return `
                <div class="max-w-6xl mx-auto">
                    <h1 class="text-3xl font-bold mb-8">Checkout</h1>

                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <!-- Checkout Form -->
                        <div class="lg:col-span-2 space-y-6">
                            <!-- Shipping Address -->
                            <div class="glass-card p-6 rounded-2xl">
                                <h3 class="font-bold mb-4 flex items-center gap-2">
                                    <i data-lucide="map-pin" class="w-5 h-5 text-blue-600"></i>
                                    Shipping Address
                                </h3>
                                <div class="grid grid-cols-2 gap-4">
                                    <input type="text" placeholder="First Name" class="p-3 border rounded-xl outline-none focus:border-blue-500">
                                    <input type="text" placeholder="Last Name" class="p-3 border rounded-xl outline-none focus:border-blue-500">
                                    <input type="email" placeholder="Email" class="p-3 border rounded-xl outline-none focus:border-blue-500 col-span-2">
                                    <input type="tel" placeholder="Phone" class="p-3 border rounded-xl outline-none focus:border-blue-500 col-span-2">
                                    <input type="text" placeholder="Address" class="p-3 border rounded-xl outline-none focus:border-blue-500 col-span-2">
                                    <input type="text" placeholder="City" class="p-3 border rounded-xl outline-none focus:border-blue-500">
                                    <input type="text" placeholder="State/Province" class="p-3 border rounded-xl outline-none focus:border-blue-500">
                                    <input type="text" placeholder="ZIP/Postal Code" class="p-3 border rounded-xl outline-none focus:border-blue-500">
                                    <select class="p-3 border rounded-xl outline-none focus:border-blue-500">
                                        <option>United States</option>
                                        <option>Canada</option>
                                        <option>United Kingdom</option>
                                    </select>
                                </div>
                            </div>

                            <!-- Payment Method -->
                            <div class="glass-card p-6 rounded-2xl">
                                <h3 class="font-bold mb-4 flex items-center gap-2">
                                    <i data-lucide="credit-card" class="w-5 h-5 text-blue-600"></i>
                                    Payment Method
                                </h3>
                                <div class="grid grid-cols-3 gap-4 mb-6">
                                    <button class="p-4 border-2 border-blue-600 rounded-xl bg-blue-50 font-bold text-blue-600 transition-all">
                                        <i data-lucide="credit-card" class="w-6 h-6 mx-auto mb-2"></i>
                                        Card
                                    </button>
                                    <button class="p-4 border rounded-xl hover:bg-slate-50 font-bold text-slate-400 transition-all">
                                        <i data-lucide="smartphone" class="w-6 h-6 mx-auto mb-2"></i>
                                        PayPal
                                    </button>
                                    <button class="p-4 border rounded-xl hover:bg-slate-50 font-bold text-slate-400 transition-all">
                                        <i data-lucide="wallet" class="w-6 h-6 mx-auto mb-2"></i>
                                        Wallet
                                    </button>
                                </div>
                                <div class="space-y-4">
                                    <input type="text" placeholder="Card Number" class="w-full p-3 border rounded-xl outline-none focus:border-blue-500">
                                    <input type="text" placeholder="Cardholder Name" class="w-full p-3 border rounded-xl outline-none focus:border-blue-500">
                                    <div class="grid grid-cols-2 gap-4">
                                        <input type="text" placeholder="MM/YY" class="p-3 border rounded-xl outline-none focus:border-blue-500">
                                        <input type="text" placeholder="CVV" class="p-3 border rounded-xl outline-none focus:border-blue-500">
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Order Summary -->
                        <div class="space-y-6">
                            <div class="glass-card p-6 rounded-2xl">
                                <h3 class="font-bold mb-4">Order Summary</h3>
                                <div class="space-y-3 mb-4 max-h-64 overflow-y-auto">
                                    ${cart.map(item => `
                                        <div class="flex gap-3">
                                            <img src="${item.image}" class="w-16 h-16 rounded-lg object-cover">
                                            <div class="flex-1">
                                                <p class="font-bold text-sm">${item.name}</p>
                                                <p class="text-xs text-slate-400">Qty: ${item.quantity}</p>
                                            </div>
                                            <p class="font-bold">$${(item.price * item.quantity).toFixed(2)}</p>
                                        </div>
                                    `).join('')}
                                </div>
                                <div class="space-y-2 text-sm border-t pt-4">
                                    <div class="flex justify-between">
                                        <span class="text-slate-600">Subtotal</span>
                                        <span class="font-bold">$${total.toFixed(2)}</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-slate-600">Shipping</span>
                                        <span class="text-green-600 font-bold">FREE</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-slate-600">Tax</span>
                                        <span class="font-bold">$${(total * 0.08).toFixed(2)}</span>
                                    </div>
                                </div>
                                <div class="flex justify-between text-xl font-bold mt-4 pt-4 border-t">
                                    <span>Total</span>
                                    <span class="text-blue-600">$${(total * 1.08).toFixed(2)}</span>
                                </div>
                            </div>

                            <button onclick="Pages.consumer.placeOrder()" class="w-full bg-blue-600 text-white p-4 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all">
                                Place Order
                            </button>
                            
                            <div class="flex items-center justify-center gap-2 text-xs text-slate-500">
                                <i data-lucide="lock" class="w-4 h-4"></i>
                                <span>Secure checkout powered by Stripe</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        },

        placeOrder() {
            const orderId = 'XP-' + Math.floor(Math.random() * 1000000);
            State.clearCart();
            Router.navigate(`/order-confirmation/${orderId}`);
            State.notify('Order placed successfully!', 'success');
        },

        orderConfirmation(orderId) {
            return `
                <div class="max-w-3xl mx-auto text-center py-12">
                    <div class="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <i data-lucide="check-circle" class="w-12 h-12 text-green-600"></i>
                    </div>
                    <h1 class="text-4xl font-bold mb-4">Order Confirmed!</h1>
                    <p class="text-slate-600 mb-8">Thank you for your purchase. Your order has been received and is being processed.</p>
                    
                    <div class="glass-card p-8 rounded-2xl mb-8 text-left">
                        <div class="grid grid-cols-2 gap-6 mb-6">
                            <div>
                                <p class="text-xs text-slate-400 uppercase font-bold mb-1">Order Number</p>
                                <p class="font-bold text-lg">${orderId}</p>
                            </div>
                            <div>
                                <p class="text-xs text-slate-400 uppercase font-bold mb-1">Order Date</p>
                                <p class="font-bold text-lg">${new Date().toLocaleDateString()}</p>
                            </div>
                            <div>
                                <p class="text-xs text-slate-400 uppercase font-bold mb-1">Estimated Delivery</p>
                                <p class="font-bold text-lg">${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <p class="text-xs text-slate-400 uppercase font-bold mb-1">Payment Method</p>
                                <p class="font-bold text-lg">Credit Card ****1234</p>
                            </div>
                        </div>
                        
                        <div class="border-t pt-6">
                            <p class="text-sm text-slate-600 mb-4">A confirmation email has been sent to your email address with order details and tracking information.</p>
                            <div class="flex gap-4">
                                <button onclick="Router.navigate('/account/orders')" class="flex-1 bg-blue-600 text-white p-3 rounded-xl font-bold hover:bg-blue-700 transition-all">
                                    Track Order
                                </button>
                                <button onclick="Router.navigate('/products')" class="flex-1 border-2 border-slate-300 p-3 rounded-xl font-bold hover:bg-slate-50 transition-all">
                                    Continue Shopping
                                </button>
                            </div>
                        </div>
                    </div>

                    <div class="grid grid-cols-3 gap-6 text-sm">
                        <div class="glass-card p-6 rounded-xl">
                            <i data-lucide="truck" class="w-8 h-8 mx-auto mb-3 text-blue-600"></i>
                            <p class="font-bold mb-1">Free Shipping</p>
                            <p class="text-slate-500 text-xs">Delivered in 5-7 days</p>
                        </div>
                        <div class="glass-card p-6 rounded-xl">
                            <i data-lucide="rotate-ccw" class="w-8 h-8 mx-auto mb-3 text-blue-600"></i>
                            <p class="font-bold mb-1">Easy Returns</p>
                            <p class="text-slate-500 text-xs">30-day return policy</p>
                        </div>
                        <div class="glass-card p-6 rounded-xl">
                            <i data-lucide="headphones" class="w-8 h-8 mx-auto mb-3 text-blue-600"></i>
                            <p class="font-bold mb-1">24/7 Support</p>
                            <p class="text-slate-500 text-xs">We're here to help</p>
                        </div>
                    </div>
                </div>
            `;
        },

        account() {
            const user = State.getUser() || { name: 'John Doe', email: 'john@example.com' };
            const orders = Data.orders.slice(0, 3);

            return `
                <div class="max-w-6xl mx-auto">
                    <h1 class="text-3xl font-bold mb-8">My Account</h1>

                    <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        <!-- Sidebar -->
                        <div class="space-y-2">
                            <button onclick="Router.navigate('/account')" class="w-full p-4 bg-blue-600 text-white rounded-xl font-bold text-left">
                                <i data-lucide="user" class="w-5 h-5 inline mr-2"></i>
                                Dashboard
                            </button>
                            <button onclick="Router.navigate('/account/orders')" class="w-full p-4 glass-card rounded-xl font-bold text-left hover:bg-slate-50 transition-all">
                                <i data-lucide="package" class="w-5 h-5 inline mr-2"></i>
                                Orders
                            </button>
                            <button onclick="Router.navigate('/account/wishlist')" class="w-full p-4 glass-card rounded-xl font-bold text-left hover:bg-slate-50 transition-all">
                                <i data-lucide="heart" class="w-5 h-5 inline mr-2"></i>
                                Wishlist
                            </button>
                            <button onclick="Router.navigate('/account/profile')" class="w-full p-4 glass-card rounded-xl font-bold text-left hover:bg-slate-50 transition-all">
                                <i data-lucide="settings" class="w-5 h-5 inline mr-2"></i>
                                Settings
                            </button>
                            <button onclick="Auth.logout()" class="w-full p-4 glass-card rounded-xl font-bold text-left text-red-600 hover:bg-red-50 transition-all">
                                <i data-lucide="log-out" class="w-5 h-5 inline mr-2"></i>
                                Logout
                            </button>
                        </div>

                        <!-- Main Content -->
                        <div class="lg:col-span-3 space-y-6">
                            <!-- Welcome Card -->
                            <div class="glass-card p-8 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-400 text-white">
                                <h2 class="text-2xl font-bold mb-2">Welcome back, ${user.name}!</h2>
                                <p class="opacity-90">${user.email}</p>
                            </div>

                            <!-- Stats -->
                            <div class="grid grid-cols-3 gap-6">
                                ${Components.StatCard('Total Orders', '12', 'package', 'blue', 15)}
                                ${Components.StatCard('Wishlist Items', '8', 'heart', 'red')}
                                ${Components.StatCard('Total Spent', '$1,245', 'dollar-sign', 'green', 23)}
                            </div>

                            <!-- Recent Orders -->
                            <div>
                                <div class="flex items-center justify-between mb-4">
                                    <h3 class="text-xl font-bold">Recent Orders</h3>
                                    <a href="#/account/orders" class="text-blue-600 font-bold hover:underline">View All →</a>
                                </div>
                                <div class="space-y-4">
                                    ${orders.map(order => Components.OrderCard(order)).join('')}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        },

        orders() {
            const orders = Data.orders;

            return `
                <div class="max-w-6xl mx-auto">
                    <h1 class="text-3xl font-bold mb-8">My Orders</h1>

                    <div class="space-y-4">
                        ${orders.map(order => Components.OrderCard(order)).join('')}
                    </div>

                    ${orders.length === 0 ? Components.EmptyState('package', 'No Orders Yet', 'Start shopping to see your orders here', '<button onclick="Router.navigate(\'/products\')" class="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold">Browse Products</button>') : ''}
                </div>
            `;
        },

        wishlist() {
            const wishlist = State.get().wishlist;
            window.currentProducts = wishlist;

            return `
                <div class="max-w-6xl mx-auto">
                    <h1 class="text-3xl font-bold mb-8">My Wishlist (${wishlist.length} items)</h1>

                    ${wishlist.length > 0 ? `
                        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            ${wishlist.map(product => Components.ProductCard(product)).join('')}
                        </div>
                    ` : Components.EmptyState('heart', 'Your Wishlist is Empty', 'Save products you love for later', '<button onclick="Router.navigate(\'/products\')" class="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold">Browse Products</button>')}
                </div>
            `;
        },

        profile() {
            const user = State.getUser() || { name: 'John Doe', email: 'john@example.com', phone: '+1 234 567 8900' };

            return `
                <div class="max-w-4xl mx-auto">
                    <h1 class="text-3xl font-bold mb-8">Profile Settings</h1>

                    <div class="space-y-6">
                        <!-- Personal Information -->
                        <div class="glass-card p-6 rounded-2xl">
                            <h3 class="font-bold text-lg mb-4">Personal Information</h3>
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="text-xs font-bold text-slate-600 ml-1">FIRST NAME</label>
                                    <input type="text" value="John" class="w-full p-3 rounded-xl border bg-white/50 outline-none focus:border-blue-500">
                                </div>
                                <div>
                                    <label class="text-xs font-bold text-slate-600 ml-1">LAST NAME</label>
                                    <input type="text" value="Doe" class="w-full p-3 rounded-xl border bg-white/50 outline-none focus:border-blue-500">
                                </div>
                                <div class="col-span-2">
                                    <label class="text-xs font-bold text-slate-600 ml-1">EMAIL</label>
                                    <input type="email" value="${user.email}" class="w-full p-3 rounded-xl border bg-white/50 outline-none focus:border-blue-500">
                                </div>
                                <div class="col-span-2">
                                    <label class="text-xs font-bold text-slate-600 ml-1">PHONE</label>
                                    <input type="tel" value="${user.phone}" class="w-full p-3 rounded-xl border bg-white/50 outline-none focus:border-blue-500">
                                </div>
                            </div>
                            <button class="mt-4 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all">
                                Save Changes
                            </button>
                        </div>

                        <!-- Change Password -->
                        <div class="glass-card p-6 rounded-2xl">
                            <h3 class="font-bold text-lg mb-4">Change Password</h3>
                            <div class="space-y-4">
                                <div>
                                    <label class="text-xs font-bold text-slate-600 ml-1">CURRENT PASSWORD</label>
                                    <input type="password" class="w-full p-3 rounded-xl border bg-white/50 outline-none focus:border-blue-500">
                                </div>
                                <div>
                                    <label class="text-xs font-bold text-slate-600 ml-1">NEW PASSWORD</label>
                                    <input type="password" class="w-full p-3 rounded-xl border bg-white/50 outline-none focus:border-blue-500">
                                </div>
                                <div>
                                    <label class="text-xs font-bold text-slate-600 ml-1">CONFIRM NEW PASSWORD</label>
                                    <input type="password" class="w-full p-3 rounded-xl border bg-white/50 outline-none focus:border-blue-500">
                                </div>
                            </div>
                            <button class="mt-4 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all">
                                Update Password
                            </button>
                        </div>

                        <!-- Saved Addresses -->
                        <div class="glass-card p-6 rounded-2xl">
                            <div class="flex items-center justify-between mb-4">
                                <h3 class="font-bold text-lg">Saved Addresses</h3>
                                <button class="text-blue-600 font-bold hover:underline">+ Add New</button>
                            </div>
                            <div class="space-y-3">
                                <div class="p-4 border rounded-xl">
                                    <div class="flex items-start justify-between">
                                        <div>
                                            <p class="font-bold">Home</p>
                                            <p class="text-sm text-slate-600">123 Main St, New York, NY 10001</p>
                                        </div>
                                        <button class="text-blue-600 text-sm hover:underline">Edit</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        },

        changePage(page) {
            Router.navigate(`/products?page=${page}`);
        },

        supplierDetail(supplierId) {
            const supplier = Data.suppliers.find(s => s.id === parseInt(supplierId));
            if (!supplier) return Components.EmptyState('building', 'Supplier Not Found', 'This supplier does not exist');

            const supplierProducts = Data.products.filter(p => p.supplierId === supplier.id);
            window.currentProducts = supplierProducts;

            return `
                <div class="max-w-7xl mx-auto">
                    ${Components.Breadcrumbs([
                        { label: 'Home', link: '/' },
                        { label: 'Suppliers', link: '/business/suppliers' },
                        { label: supplier.name }
                    ])}

                    <!-- Supplier Header -->
                    <div class="glass-card p-8 rounded-2xl mb-8">
                        <div class="flex flex-col md:flex-row gap-6 items-start">
                            <img src="${supplier.logo}" alt="${supplier.name}" class="w-24 h-24 rounded-xl shadow-lg">
                            <div class="flex-1">
                                <div class="flex items-center gap-3 mb-2">
                                    <h1 class="text-3xl font-bold">${supplier.name}</h1>
                                    ${supplier.verified ? '<i data-lucide="badge-check" class="w-6 h-6 text-blue-600"></i>' : ''}
                                </div>
                                <div class="flex items-center gap-4 text-sm text-slate-600 mb-4">
                                    <div class="flex items-center gap-1">
                                        <i data-lucide="map-pin" class="w-4 h-4"></i>
                                        <span>${supplier.location}</span>
                                    </div>
                                    <div class="flex items-center gap-1">
                                        <i data-lucide="star" class="w-4 h-4 text-orange-400 fill-orange-400"></i>
                                        <span class="font-bold">${supplier.rating}</span>
                                        <span class="text-slate-400">(${supplier.reviews} reviews)</span>
                                    </div>
                                    <div class="flex items-center gap-1">
                                        <i data-lucide="clock" class="w-4 h-4"></i>
                                        <span>Responds in ${supplier.responseTime}</span>
                                    </div>
                                </div>
                                <div class="flex flex-wrap gap-2 mb-4">
                                    ${supplier.categories.map(cat => `
                                        <span class="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-bold">${cat}</span>
                                    `).join('')}
                                </div>
                                <div class="flex flex-wrap gap-2">
                                    ${supplier.certifications.map(cert => `
                                        <span class="px-3 py-1 bg-green-100 text-green-600 rounded-full text-xs font-bold flex items-center gap-1">
                                            <i data-lucide="shield-check" class="w-3 h-3"></i>${cert}
                                        </span>
                                    `).join('')}
                                </div>
                            </div>
                            <div class="text-right">
                                <p class="text-xs text-slate-500 uppercase font-bold mb-1">Min. Order</p>
                                <p class="text-2xl font-bold text-blue-600">${supplier.minOrder}</p>
                                <button onclick="Router.navigate('/contact')" class="mt-4 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all">
                                    Contact Supplier
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Supplier Products -->
                    <div>
                        <h2 class="text-2xl font-bold mb-6">Products from ${supplier.name} (${supplierProducts.length})</h2>
                        ${supplierProducts.length > 0 ? `
                            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                ${supplierProducts.map(product => Components.ProductCard(product)).join('')}
                            </div>
                        ` : Components.EmptyState('package', 'No Products', 'This supplier has no products listed yet')}
                    </div>
                </div>
            `;
        }
    },

    // ==================== SEARCH PAGE ====================
    
    search(params = {}) {
        const { q = '', page = 1 } = params;
        let products = Data.products;
        
        // Filter by search query
        if (q) {
            const query = q.toLowerCase();
            products = products.filter(p => 
                p.name.toLowerCase().includes(query) ||
                p.description.toLowerCase().includes(query) ||
                p.category.toLowerCase().includes(query)
            );
        }

        window.currentProducts = products;
        const itemsPerPage = 12;
        const totalPages = Math.ceil(products.length / itemsPerPage);
        const startIndex = (page - 1) * itemsPerPage;
        const paginatedProducts = products.slice(startIndex, startIndex + itemsPerPage);

        return `
            <div>
                <h1 class="text-3xl font-bold mb-6">Search Results for "${q}"</h1>
                <p class="text-slate-600 mb-8">Found ${products.length} products</p>

                ${paginatedProducts.length > 0 ? `
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        ${paginatedProducts.map(product => Components.ProductCard(product)).join('')}
                    </div>
                    ${Components.Pagination(page, totalPages, 'Pages.searchChangePage')}
                ` : Components.EmptyState('search', 'No Results Found', `No products match "${q}". Try a different search term.`, '<button onclick="Router.navigate(\'/products\')" class="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold">Browse All Products</button>')}
            </div>
        `;
    },

    searchChangePage(page) {
        const url = new URL(window.location.href);
        const query = url.searchParams.get('q') || '';
        Router.navigate(`/search?q=${query}&page=${page}`);
    },

    // ==================== SUPPORT PAGES ====================
    
    support: {
        about() {
            return `
                <div class="max-w-4xl mx-auto py-12">
                    <h1 class="text-4xl font-bold mb-8 text-center">About Xperiencestore</h1>
                    
                    <div class="glass-card p-8 rounded-2xl mb-8">
                        <h2 class="text-2xl font-bold mb-4">Our Mission</h2>
                        <p class="text-slate-600 leading-relaxed mb-6">
                            Xperiencestore is revolutionizing e-commerce by creating the world's first truly unified multi-tier commerce platform. We connect consumers, businesses, dropshippers, warehouses, and suppliers in one seamless ecosystem.
                        </p>
                        <p class="text-slate-600 leading-relaxed">
                            Our mission is to democratize global trade, making it accessible and efficient for everyone from individual shoppers to large enterprises.
                        </p>
                    </div>

                    <div class="grid grid-cols-3 gap-6 mb-8">
                        ${Components.StatCard('Active Users', '50K+', 'users', 'blue')}
                        ${Components.StatCard('Products', '1M+', 'package', 'green')}
                        ${Components.StatCard('Countries', '150+', 'globe', 'orange')}
                    </div>
                </div>
            `;
        },

        contact() {
            return `
                <div class="max-w-4xl mx-auto py-12">
                    <h1 class="text-4xl font-bold mb-8 text-center">Contact Us</h1>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div class="glass-card p-8 rounded-2xl">
                            <h2 class="text-2xl font-bold mb-6">Get in Touch</h2>
                            <form class="space-y-4">
                                <div>
                                    <label class="text-xs font-bold text-slate-600 ml-1">NAME</label>
                                    <input type="text" required class="w-full p-3 rounded-xl border bg-white/50 outline-none focus:border-blue-500">
                                </div>
                                <div>
                                    <label class="text-xs font-bold text-slate-600 ml-1">EMAIL</label>
                                    <input type="email" required class="w-full p-3 rounded-xl border bg-white/50 outline-none focus:border-blue-500">
                                </div>
                                <div>
                                    <label class="text-xs font-bold text-slate-600 ml-1">MESSAGE</label>
                                    <textarea rows="5" required class="w-full p-3 rounded-xl border bg-white/50 outline-none focus:border-blue-500"></textarea>
                                </div>
                                <button type="submit" class="w-full bg-blue-600 text-white p-4 rounded-xl font-bold hover:bg-blue-700 transition-all">
                                    Send Message
                                </button>
                            </form>
                        </div>

                        <div class="space-y-6">
                            <div class="glass-card p-6 rounded-2xl">
                                <div class="flex items-center gap-4">
                                    <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                        <i data-lucide="mail" class="w-6 h-6 text-blue-600"></i>
                                    </div>
                                    <div>
                                        <h3 class="font-bold">Email</h3>
                                        <p class="text-sm text-slate-600">support@xperiencestore.com</p>
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
                <div class="max-w-4xl mx-auto py-12">
                    <h1 class="text-4xl font-bold mb-8 text-center">Frequently Asked Questions</h1>
                    
                    ${Data.faqs.map((category) => `
                        <div class="mb-8">
                            <h2 class="text-2xl font-bold mb-4">${category.category}</h2>
                            <div class="space-y-3">
                                ${category.questions.map((faq) => `
                                    <div class="glass-card rounded-2xl overflow-hidden">
                                        <button onclick="this.nextElementSibling.classList.toggle('hidden')" class="w-full p-6 text-left flex items-center justify-between hover:bg-slate-50 transition-all">
                                            <span class="font-bold">${faq.q}</span>
                                            <i data-lucide="chevron-down" class="w-5 h-5 text-slate-400"></i>
                                        </button>
                                        <div class="hidden p-6 pt-0 text-slate-600">
                                            ${faq.a}
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        },

        shipping() {
            return `
                <div class="max-w-4xl mx-auto py-12">
                    <h1 class="text-4xl font-bold mb-8 text-center">Shipping & Returns</h1>
                    
                    <div class="glass-card p-8 rounded-2xl mb-8">
                        <h2 class="text-2xl font-bold mb-4">Shipping Policy</h2>
                        <div class="space-y-4 text-slate-600">
                            <p>Standard shipping: 5-7 business days. Free on orders over $100.</p>
                            <p>Express shipping: 2-3 business days. Additional $15 fee.</p>
                        </div>
                    </div>

                    <div class="glass-card p-8 rounded-2xl">
                        <h2 class="text-2xl font-bold mb-4">Returns Policy</h2>
                        <p class="text-slate-600">We offer a 30-day return policy for most items. Products must be unused and in original packaging.</p>
                    </div>
                </div>
            `;
        },

        privacy() {
            return `
                <div class="max-w-4xl mx-auto py-12">
                    <h1 class="text-4xl font-bold mb-8 text-center">Privacy Policy</h1>
                    
                    <div class="glass-card p-8 rounded-2xl space-y-6 text-slate-600">
                        <div>
                            <h2 class="text-xl font-bold text-slate-800 mb-3">Information We Collect</h2>
                            <p>We collect information you provide directly to us, including name, email address, shipping address, and payment information.</p>
                        </div>

                        <div>
                            <h2 class="text-xl font-bold text-slate-800 mb-3">How We Use Your Information</h2>
                            <p>We use your information to process orders, send updates, respond to questions, and improve our services.</p>
                        </div>

                        <p class="text-sm italic">Last updated: January 16, 2026</p>
                    </div>
                </div>
            `;
        },

        terms() {
            return `
                <div class="max-w-4xl mx-auto py-12">
                    <h1 class="text-4xl font-bold mb-8 text-center">Terms of Service</h1>
                    
                    <div class="glass-card p-8 rounded-2xl space-y-6 text-slate-600">
                        <div>
                            <h2 class="text-xl font-bold text-slate-800 mb-3">1. Acceptance of Terms</h2>
                            <p>By accessing and using Xperiencestore, you accept and agree to be bound by these terms.</p>
                        </div>

                        <div>
                            <h2 class="text-xl font-bold text-slate-800 mb-3">2. User Accounts</h2>
                            <p>You must provide accurate information and maintain account security.</p>
                        </div>

                        <p class="text-sm italic">Last updated: January 16, 2026</p>
                    </div>
                </div>
            `;
        }
    },

    // ==================== BUSINESS (B2B) PAGES ====================
    
    business: {
        home() {
            const suppliers = Data.suppliers.slice(0, 4);
            const rfqs = Data.rfqs.slice(0, 3);
            
            return `
                <div class="space-y-10">
                    <!-- Hero Section -->
                    <div class="glass-card bg-gradient-to-r from-purple-600 to-blue-600 rounded-[2rem] p-12 text-white flex flex-col md:flex-row justify-between items-center">
                        <div class="max-w-lg mb-6 md:mb-0">
                            <h1 class="text-5xl font-bold mb-4">B2B Marketplace</h1>
                            <p class="mb-6 opacity-90 text-lg">Connect with suppliers, request quotes, and streamline your procurement process</p>
                            <div class="flex gap-4">
                                <button onclick="Router.navigate('/business/suppliers')" class="bg-white text-purple-600 px-6 py-3 rounded-full font-bold hover:shadow-xl transition-all">Find Suppliers</button>
                                <button onclick="Router.navigate('/business/rfq/create')" class="border-2 border-white px-6 py-3 rounded-full font-bold hover:bg-white/10 transition-all">Create RFQ</button>
                            </div>
                        </div>
                        <img src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400" class="h-64 rounded-2xl shadow-2xl">
                    </div>

                    <!-- Quick Stats -->
                    <div class="grid grid-cols-4 gap-6">
                        ${Components.StatCard('Active RFQs', '${rfqs.length}', 'file-text', 'purple')}
                        ${Components.StatCard('Suppliers', '${suppliers.length}', 'building', 'blue')}
                        ${Components.StatCard('Pending Quotes', '8', 'clipboard-list', 'orange')}
                        ${Components.StatCard('This Month', '$45.2K', 'dollar-sign', 'green', 12)}
                    </div>

                    <!-- Active RFQs -->
                    <div>
                        <div class="flex items-center justify-between mb-6">
                            <h2 class="text-2xl font-bold">Active RFQs</h2>
                            <a href="#/business/rfq" class="text-blue-600 font-bold hover:underline">View All →</a>
                        </div>
                        <div class="grid grid-cols-1 gap-4">
                            ${rfqs.map(rfq => `
                                <div class="glass-card p-6 rounded-2xl flex items-center justify-between hover:shadow-lg transition-all">
                                    <div class="flex-1">
                                        <div class="flex items-center gap-3 mb-2">
                                            <h3 class="font-bold text-lg">${rfq.title}</h3>
                                            <span class="badge-${rfq.status === 'open' ? 'blue' : rfq.status === 'quoted' ? 'orange' : 'green'} px-3 py-1 rounded-full text-xs font-bold capitalize">${rfq.status}</span>
                                        </div>
                                        <p class="text-sm text-slate-600 mb-2">${rfq.description}</p>
                                        <div class="flex items-center gap-4 text-xs text-slate-500">
                                            <span><i data-lucide="calendar" class="w-4 h-4 inline mr-1"></i>Due: ${rfq.deadline}</span>
                                            <span><i data-lucide="package" class="w-4 h-4 inline mr-1"></i>Qty: ${rfq.quantity}</span>
                                            ${rfq.responses ? `<span><i data-lucide="message-square" class="w-4 h-4 inline mr-1"></i>${rfq.responses} Responses</span>` : ''}
                                        </div>
                                    </div>
                                    <button onclick="Router.navigate('/business/rfq/${rfq.id}')" class="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all">
                                        View Details
                                    </button>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Featured Suppliers -->
                    <div>
                        <div class="flex items-center justify-between mb-6">
                            <h2 class="text-2xl font-bold">Featured Suppliers</h2>
                            <a href="#/business/suppliers" class="text-blue-600 font-bold hover:underline">View All →</a>
                        </div>
                        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            ${suppliers.map(supplier => Components.SupplierCard(supplier)).join('')}
                        </div>
                    </div>

                    <!-- B2B Features -->
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div class="glass-card p-6 rounded-2xl text-center">
                            <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <i data-lucide="percent" class="w-8 h-8 text-purple-600"></i>
                            </div>
                            <h3 class="font-bold mb-2">Bulk Pricing</h3>
                            <p class="text-sm text-slate-500">Up to 40% off on bulk orders</p>
                        </div>
                        <div class="glass-card p-6 rounded-2xl text-center">
                            <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <i data-lucide="headphones" class="w-8 h-8 text-blue-600"></i>
                            </div>
                            <h3 class="font-bold mb-2">Dedicated Support</h3>
                            <p class="text-sm text-slate-500">Personal account manager</p>
                        </div>
                        <div class="glass-card p-6 rounded-2xl text-center">
                            <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <i data-lucide="clock" class="w-8 h-8 text-green-600"></i>
                            </div>
                            <h3 class="font-bold mb-2">Fast Fulfillment</h3>
                            <p class="text-sm text-slate-500">Priority processing</p>
                        </div>
                    </div>
                </div>
            `;
        },

        suppliers() {
            const suppliers = Data.suppliers;
            window.currentSuppliers = suppliers;
            
            return `
                <div>
                    ${Components.Breadcrumbs([
                        { label: 'Home', link: '/' },
                        { label: 'Supplier Directory' }
                    ])}

                    <div class="flex flex-col md:flex-row gap-8">
                        <!-- Filters Sidebar -->
                        <aside class="w-full md:w-64 space-y-6">
                            <div class="glass-card p-6 rounded-2xl">
                                <h3 class="font-bold mb-4 text-slate-800">Location</h3>
                                <div class="space-y-2 text-sm">
                                    ${['China', 'USA', 'India', 'Germany', 'Vietnam'].map(location => `
                                        <label class="flex items-center gap-2 cursor-pointer hover:text-blue-600 transition-colors">
                                            <input type="checkbox" class="rounded">
                                            <span>${location}</span>
                                        </label>
                                    `).join('')}
                                </div>
                            </div>

                            <div class="glass-card p-6 rounded-2xl">
                                <h3 class="font-bold mb-4 text-slate-800">Certifications</h3>
                                <div class="space-y-2 text-sm">
                                    ${['ISO 9001', 'ISO 14001', 'BSCI', 'FDA', 'CE'].map(cert => `
                                        <label class="flex items-center gap-2 cursor-pointer hover:text-blue-600 transition-colors">
                                            <input type="checkbox" class="rounded">
                                            <span>${cert}</span>
                                        </label>
                                    `).join('')}
                                </div>
                            </div>

                            <div class="glass-card p-6 rounded-2xl">
                                <h3 class="font-bold mb-4 text-slate-800">Minimum Order</h3>
                                <select class="w-full p-3 rounded-xl border bg-white/50 outline-none text-sm">
                                    <option>Any</option>
                                    <option>Under 100 units</option>
                                    <option>100-500 units</option>
                                    <option>500+ units</option>
                                </select>
                            </div>
                        </aside>

                        <!-- Suppliers Grid -->
                        <div class="flex-1">
                            <div class="flex justify-between items-center mb-6">
                                <p class="text-sm text-slate-500">${suppliers.length} suppliers found</p>
                                <select class="bg-transparent border rounded-lg px-4 py-2 text-sm font-bold text-slate-800 outline-none">
                                    <option>Sort by: Recommended</option>
                                    <option>Rating: High to Low</option>
                                    <option>Response Time</option>
                                    <option>Transaction Level</option>
                                </select>
                            </div>

                            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                ${suppliers.map(supplier => Components.SupplierCard(supplier)).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        },

        supplierDetail(supplierId) {
            const supplier = Data.suppliers.find(s => s.id === parseInt(supplierId));
            if (!supplier) return Components.EmptyState('building', 'Supplier Not Found', 'The supplier you\'re looking for doesn\'t exist');

            const products = Data.products.filter(p => p.supplierId === supplier.id);
            window.currentProducts = products;

            return `
                <div class="max-w-7xl mx-auto">
                    ${Components.Breadcrumbs([
                        { label: 'Home', link: '/' },
                        { label: 'Suppliers', link: '/business/suppliers' },
                        { label: supplier.name }
                    ])}

                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <!-- Supplier Info -->
                        <div class="lg:col-span-1 space-y-6">
                            <div class="glass-card p-6 rounded-2xl text-center">
                                <div class="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <i data-lucide="building" class="w-12 h-12 text-blue-600"></i>
                                </div>
                                <h1 class="text-2xl font-bold mb-2">${supplier.name}</h1>
                                <div class="flex items-center justify-center gap-2 mb-4">
                                    <div class="flex text-orange-400">
                                        ${Components.StarRating(supplier.rating)}
                                    </div>
                                    <span class="text-sm text-slate-400">(${supplier.reviews} reviews)</span>
                                </div>
                                <p class="text-sm text-slate-600 mb-4">${supplier.location}</p>
                                
                                <div class="flex gap-2">
                                    <button onclick="Router.navigate('/business/rfq/create?supplier=${supplier.id}')" class="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all">
                                        Request Quote
                                    </button>
                                    <button class="border-2 border-slate-300 px-4 rounded-xl hover:bg-slate-50 transition-all">
                                        <i data-lucide="message-circle" class="w-5 h-5 text-slate-600"></i>
                                    </button>
                                </div>
                            </div>

                            <div class="glass-card p-6 rounded-2xl">
                                <h3 class="font-bold mb-4">Company Details</h3>
                                <div class="space-y-3 text-sm">
                                    <div class="flex justify-between">
                                        <span class="text-slate-600">Transaction Level</span>
                                        <span class="font-bold text-green-600">${supplier.transactionLevel}</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-slate-600">Response Time</span>
                                        <span class="font-bold">${supplier.responseTime}</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-slate-600">Minimum Order</span>
                                        <span class="font-bold">${supplier.moq} units</span>
                                    </div>
                                </div>
                            </div>

                            <div class="glass-card p-6 rounded-2xl">
                                <h3 class="font-bold mb-4">Certifications</h3>
                                <div class="flex flex-wrap gap-2">
                                    ${supplier.certifications.map(cert => `
                                        <span class="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-bold">${cert}</span>
                                    `).join('')}
                                </div>
                            </div>
                        </div>

                        <!-- Products -->
                        <div class="lg:col-span-2">
                            <div class="mb-6">
                                <h2 class="text-2xl font-bold mb-2">Products from ${supplier.name}</h2>
                                <p class="text-slate-600">${products.length} products available</p>
                            </div>
                            
                            ${products.length > 0 ? `
                                <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    ${products.map(product => Components.ProductCard(product, { showBulkPrice: true })).join('')}
                                </div>
                            ` : Components.EmptyState('package', 'No Products Yet', 'This supplier hasn\'t listed any products')}
                        </div>
                    </div>
                </div>
            `;
        },

        rfqCreate(params = {}) {
            const supplierId = params.supplier;
            const supplier = supplierId ? Data.suppliers.find(s => s.id === parseInt(supplierId)) : null;

            return `
                <div class="max-w-4xl mx-auto">
                    <h1 class="text-3xl font-bold mb-8">Create RFQ (Request for Quotation)</h1>

                    <form id="rfqForm" class="space-y-6">
                        <div class="glass-card p-6 rounded-2xl">
                            <h3 class="font-bold mb-4 flex items-center gap-2">
                                <i data-lucide="file-text" class="w-5 h-5 text-blue-600"></i>
                                Basic Information
                            </h3>
                            <div class="space-y-4">
                                <div>
                                    <label class="text-xs font-bold text-slate-600 ml-1">RFQ TITLE *</label>
                                    <input type="text" required placeholder="e.g., 1000 Units of Wireless Headphones" class="w-full p-3 rounded-xl border bg-white/50 outline-none focus:border-blue-500">
                                </div>
                                <div>
                                    <label class="text-xs font-bold text-slate-600 ml-1">PRODUCT CATEGORY *</label>
                                    <select required class="w-full p-3 rounded-xl border bg-white/50 outline-none focus:border-blue-500">
                                        <option value="">Select category...</option>
                                        ${Data.categories.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join('')}
                                    </select>
                                </div>
                                <div>
                                    <label class="text-xs font-bold text-slate-600 ml-1">DETAILED DESCRIPTION *</label>
                                    <textarea rows="4" required placeholder="Provide detailed specifications and requirements..." class="w-full p-3 rounded-xl border bg-white/50 outline-none focus:border-blue-500"></textarea>
                                </div>
                            </div>
                        </div>

                        <div class="glass-card p-6 rounded-2xl">
                            <h3 class="font-bold mb-4 flex items-center gap-2">
                                <i data-lucide="package" class="w-5 h-5 text-blue-600"></i>
                                Quantity & Specifications
                            </h3>
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="text-xs font-bold text-slate-600 ml-1">QUANTITY *</label>
                                    <input type="number" required min="1" placeholder="1000" class="w-full p-3 rounded-xl border bg-white/50 outline-none focus:border-blue-500">
                                </div>
                                <div>
                                    <label class="text-xs font-bold text-slate-600 ml-1">UNIT</label>
                                    <select class="w-full p-3 rounded-xl border bg-white/50 outline-none focus:border-blue-500">
                                        <option>Pieces</option>
                                        <option>Cartons</option>
                                        <option>Pallets</option>
                                        <option>Containers</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="text-xs font-bold text-slate-600 ml-1">TARGET PRICE (per unit)</label>
                                    <input type="number" step="0.01" placeholder="10.00" class="w-full p-3 rounded-xl border bg-white/50 outline-none focus:border-blue-500">
                                </div>
                                <div>
                                    <label class="text-xs font-bold text-slate-600 ml-1">CURRENCY</label>
                                    <select class="w-full p-3 rounded-xl border bg-white/50 outline-none focus:border-blue-500">
                                        <option>USD</option>
                                        <option>EUR</option>
                                        <option>GBP</option>
                                        <option>CNY</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div class="glass-card p-6 rounded-2xl">
                            <h3 class="font-bold mb-4 flex items-center gap-2">
                                <i data-lucide="calendar" class="w-5 h-5 text-blue-600"></i>
                                Timeline & Delivery
                            </h3>
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="text-xs font-bold text-slate-600 ml-1">QUOTE DEADLINE *</label>
                                    <input type="date" required class="w-full p-3 rounded-xl border bg-white/50 outline-none focus:border-blue-500">
                                </div>
                                <div>
                                    <label class="text-xs font-bold text-slate-600 ml-1">DELIVERY DEADLINE</label>
                                    <input type="date" class="w-full p-3 rounded-xl border bg-white/50 outline-none focus:border-blue-500">
                                </div>
                                <div class="col-span-2">
                                    <label class="text-xs font-bold text-slate-600 ml-1">SHIPPING TERMS</label>
                                    <select class="w-full p-3 rounded-xl border bg-white/50 outline-none focus:border-blue-500">
                                        <option>FOB (Free On Board)</option>
                                        <option>CIF (Cost, Insurance & Freight)</option>
                                        <option>EXW (Ex Works)</option>
                                        <option>DDP (Delivered Duty Paid)</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        ${supplier ? `
                            <div class="glass-card p-6 rounded-2xl bg-blue-50">
                                <div class="flex items-center gap-3">
                                    <i data-lucide="info" class="w-5 h-5 text-blue-600"></i>
                                    <div>
                                        <p class="font-bold">Sending to: ${supplier.name}</p>
                                        <p class="text-sm text-slate-600">${supplier.location}</p>
                                    </div>
                                </div>
                            </div>
                        ` : `
                            <div class="glass-card p-6 rounded-2xl">
                                <h3 class="font-bold mb-4">Send to Suppliers</h3>
                                <div class="space-y-2">
                                    <label class="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" class="rounded">
                                        <span class="text-sm">Send to all verified suppliers</span>
                                    </label>
                                    <p class="text-xs text-slate-500 ml-6">Your RFQ will be sent to ${Data.suppliers.length} verified suppliers matching your category</p>
                                </div>
                            </div>
                        `}

                        <div class="flex gap-4">
                            <button type="submit" class="flex-1 bg-blue-600 text-white p-4 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all">
                                Submit RFQ
                            </button>
                            <button type="button" onclick="Router.navigate('/business/rfq')" class="border-2 border-slate-300 px-6 rounded-xl font-bold hover:bg-slate-50 transition-all">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            `;
        },

        rfq() {
            const rfqs = Data.rfqs;
            
            return `
                <div class="max-w-6xl mx-auto">
                    <div class="flex items-center justify-between mb-8">
                        <h1 class="text-3xl font-bold">My RFQs</h1>
                        <button onclick="Router.navigate('/business/rfq/create')" class="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all">
                            <i data-lucide="plus" class="w-5 h-5 inline mr-2"></i>
                            Create RFQ
                        </button>
                    </div>

                    <!-- Status Tabs -->
                    <div class="flex gap-2 mb-6">
                        <button class="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold">All (${rfqs.length})</button>
                        <button class="px-6 py-3 glass-card rounded-xl font-bold hover:bg-slate-50 transition-all">Open (${rfqs.filter(r => r.status === 'open').length})</button>
                        <button class="px-6 py-3 glass-card rounded-xl font-bold hover:bg-slate-50 transition-all">Quoted (${rfqs.filter(r => r.status === 'quoted').length})</button>
                        <button class="px-6 py-3 glass-card rounded-xl font-bold hover:bg-slate-50 transition-all">Closed (${rfqs.filter(r => r.status === 'closed').length})</button>
                    </div>

                    <!-- RFQ List -->
                    <div class="space-y-4">
                        ${rfqs.map(rfq => `
                            <div class="glass-card p-6 rounded-2xl hover:shadow-lg transition-all">
                                <div class="flex items-start justify-between mb-4">
                                    <div class="flex-1">
                                        <div class="flex items-center gap-3 mb-2">
                                            <h3 class="text-xl font-bold">${rfq.title}</h3>
                                            <span class="badge-${rfq.status === 'open' ? 'blue' : rfq.status === 'quoted' ? 'orange' : 'green'} px-3 py-1 rounded-full text-xs font-bold capitalize">${rfq.status}</span>
                                        </div>
                                        <p class="text-slate-600 mb-3">${rfq.description}</p>
                                        <div class="flex items-center gap-6 text-sm text-slate-500">
                                            <span><i data-lucide="package" class="w-4 h-4 inline mr-1"></i>Qty: ${rfq.quantity}</span>
                                            <span><i data-lucide="calendar" class="w-4 h-4 inline mr-1"></i>Deadline: ${rfq.deadline}</span>
                                            ${rfq.responses ? `<span><i data-lucide="message-square" class="w-4 h-4 inline mr-1"></i>${rfq.responses} Quotes Received</span>` : ''}
                                        </div>
                                    </div>
                                    <div class="flex gap-2">
                                        <button onclick="Router.navigate('/business/rfq/${rfq.id}')" class="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all">
                                            View Quotes
                                        </button>
                                        <button class="border-2 border-slate-300 px-4 rounded-xl hover:bg-slate-50 transition-all">
                                            <i data-lucide="more-vertical" class="w-5 h-5 text-slate-600"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>

                    ${rfqs.length === 0 ? Components.EmptyState('file-text', 'No RFQs Yet', 'Create your first RFQ to get quotes from suppliers', '<button onclick="Router.navigate(\'/business/rfq/create\')" class="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold">Create RFQ</button>') : ''}
                </div>
            `;
        },

        quotes() {
            return `
                <div class="max-w-6xl mx-auto">
                    <h1 class="text-3xl font-bold mb-8">Quote Management</h1>

                    <div class="grid grid-cols-1 gap-6">
                        ${[1, 2, 3].map(i => `
                            <div class="glass-card p-6 rounded-2xl">
                                <div class="flex items-start justify-between mb-4">
                                    <div class="flex items-center gap-4">
                                        <div class="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center">
                                            <i data-lucide="building" class="w-8 h-8 text-blue-600"></i>
                                        </div>
                                        <div>
                                            <h3 class="font-bold text-lg">Acme Manufacturing Co.</h3>
                                            <div class="flex text-orange-400 text-sm">
                                                ${Components.StarRating(4.5)}
                                            </div>
                                        </div>
                                    </div>
                                    <div class="text-right">
                                        <p class="text-3xl font-bold text-blue-600">$${(8.50 + i * 0.5).toFixed(2)}</p>
                                        <p class="text-xs text-slate-400">per unit</p>
                                    </div>
                                </div>

                                <div class="grid grid-cols-4 gap-4 mb-4 text-sm">
                                    <div>
                                        <p class="text-slate-500">Quantity</p>
                                        <p class="font-bold">1,000 units</p>
                                    </div>
                                    <div>
                                        <p class="text-slate-500">Total</p>
                                        <p class="font-bold">$${((8.50 + i * 0.5) * 1000).toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p class="text-slate-500">Lead Time</p>
                                        <p class="font-bold">${15 + i * 5} days</p>
                                    </div>
                                    <div>
                                        <p class="text-slate-500">Valid Until</p>
                                        <p class="font-bold">Jan ${20 + i}, 2026</p>
                                    </div>
                                </div>

                                <div class="flex gap-3">
                                    <button class="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all">
                                        Accept Quote
                                    </button>
                                    <button class="border-2 border-slate-300 px-6 rounded-xl font-bold hover:bg-slate-50 transition-all">
                                        Message Supplier
                                    </button>
                                    <button class="border-2 border-slate-300 px-6 rounded-xl font-bold hover:bg-slate-50 transition-all">
                                        Compare
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        },

        account() {
            const user = State.getUser() || { name: 'Business Account', email: 'business@company.com' };
            
            return `
                <div class="max-w-6xl mx-auto">
                    <h1 class="text-3xl font-bold mb-8">Business Account</h1>

                    <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        <!-- Sidebar -->
                        <div class="space-y-2">
                            <button onclick="Router.navigate('/business/account')" class="w-full p-4 bg-blue-600 text-white rounded-xl font-bold text-left">
                                <i data-lucide="building" class="w-5 h-5 inline mr-2"></i>
                                Dashboard
                            </button>
                            <button onclick="Router.navigate('/business/rfq')" class="w-full p-4 glass-card rounded-xl font-bold text-left hover:bg-slate-50 transition-all">
                                <i data-lucide="file-text" class="w-5 h-5 inline mr-2"></i>
                                My RFQs
                            </button>
                            <button onclick="Router.navigate('/business/quotes')" class="w-full p-4 glass-card rounded-xl font-bold text-left hover:bg-slate-50 transition-all">
                                <i data-lucide="clipboard-list" class="w-5 h-5 inline mr-2"></i>
                                Quotes
                            </button>
                            <button onclick="Router.navigate('/account/orders')" class="w-full p-4 glass-card rounded-xl font-bold text-left hover:bg-slate-50 transition-all">
                                <i data-lucide="package" class="w-5 h-5 inline mr-2"></i>
                                Orders
                            </button>
                            <button onclick="Router.navigate('/business/suppliers')" class="w-full p-4 glass-card rounded-xl font-bold text-left hover:bg-slate-50 transition-all">
                                <i data-lucide="users" class="w-5 h-5 inline mr-2"></i>
                                Suppliers
                            </button>
                            <button onclick="Auth.logout()" class="w-full p-4 glass-card rounded-xl font-bold text-left text-red-600 hover:bg-red-50 transition-all">
                                <i data-lucide="log-out" class="w-5 h-5 inline mr-2"></i>
                                Logout
                            </button>
                        </div>

                        <!-- Main Content -->
                        <div class="lg:col-span-3 space-y-6">
                            <!-- Welcome Card -->
                            <div class="glass-card p-8 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                                <h2 class="text-2xl font-bold mb-2">Welcome back, ${user.name}!</h2>
                                <p class="opacity-90">${user.email}</p>
                            </div>

                            <!-- Stats -->
                            <div class="grid grid-cols-3 gap-6">
                                ${Components.StatCard('Active RFQs', '3', 'file-text', 'purple')}
                                ${Components.StatCard('Pending Quotes', '8', 'clipboard-list', 'blue')}
                                ${Components.StatCard('This Month', '$45.2K', 'dollar-sign', 'green', 12)}
                            </div>

                            <!-- Recent Activity -->
                            <div>
                                <h3 class="text-xl font-bold mb-4">Recent Activity</h3>
                                <div class="space-y-3">
                                    ${[
                                        { action: 'New quote received', detail: 'Wireless Headphones - $8.50/unit', time: '2 hours ago', icon: 'message-square', color: 'blue' },
                                        { action: 'RFQ created', detail: '500 Units of Smart Watches', time: '1 day ago', icon: 'file-plus', color: 'green' },
                                        { action: 'Quote accepted', detail: 'USB Cables - Order placed', time: '2 days ago', icon: 'check-circle', color: 'purple' }
                                    ].map(activity => `
                                        <div class="glass-card p-4 rounded-xl flex items-center gap-4">
                                            <div class="w-10 h-10 bg-${activity.color}-100 rounded-full flex items-center justify-center">
                                                <i data-lucide="${activity.icon}" class="w-5 h-5 text-${activity.color}-600"></i>
                                            </div>
                                            <div class="flex-1">
                                                <p class="font-bold">${activity.action}</p>
                                                <p class="text-sm text-slate-600">${activity.detail}</p>
                                            </div>
                                            <p class="text-xs text-slate-400">${activity.time}</p>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
    },

    // ==================== DROPSHIPPER PAGES ====================
    
    dropshipper: {
        home() {
            const products = Data.products.slice(0, 4);
            
            return `
                <div class="space-y-10">
                    <!-- Hero Section -->
                    <div class="glass-card bg-gradient-to-r from-green-600 to-teal-600 rounded-[2rem] p-12 text-white flex flex-col md:flex-row justify-between items-center">
                        <div class="max-w-lg mb-6 md:mb-0">
                            <h1 class="text-5xl font-bold mb-4">Dropship & Earn</h1>
                            <p class="mb-6 opacity-90 text-lg">Build your online store without inventory. Source products and sell with zero upfront costs.</p>
                            <div class="flex gap-4">
                                <button onclick="Router.navigate('/dropshipper/storefront')" class="bg-white text-green-600 px-6 py-3 rounded-full font-bold hover:shadow-xl transition-all">Manage Store</button>
                                <button onclick="Router.navigate('/dropshipper/catalog')" class="border-2 border-white px-6 py-3 rounded-full font-bold hover:bg-white/10 transition-all">Source Products</button>
                            </div>
                        </div>
                        <img src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400" class="h-64 rounded-2xl shadow-2xl">
                    </div>

                    <!-- Quick Stats -->
                    <div class="grid grid-cols-4 gap-6">
                        ${Components.StatCard('Store Products', '24', 'package', 'green')}
                        ${Components.StatCard('Active Orders', '12', 'shopping-bag', 'blue')}
                        ${Components.StatCard('Avg Profit', '35%', 'trending-up', 'orange')}
                        ${Components.StatCard('This Month', '$2,450', 'dollar-sign', 'purple', 18)}
                    </div>

                    <!-- Store Performance -->
                    <div class="grid grid-cols-2 gap-6">
                        <div class="glass-card p-6 rounded-2xl">
                            <h3 class="font-bold mb-4 flex items-center gap-2">
                                <i data-lucide="trending-up" class="w-5 h-5 text-green-600"></i>
                                Sales This Week
                            </h3>
                            <div class="space-y-3">
                                ${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => `
                                    <div class="flex items-center gap-3">
                                        <span class="text-sm text-slate-600 w-12">${day}</span>
                                        <div class="flex-1 bg-slate-200 rounded-full h-2">
                                            <div class="bg-green-500 h-2 rounded-full" style="width: ${20 + Math.random() * 60}%"></div>
                                        </div>
                                        <span class="text-sm font-bold">$${(Math.random() * 500 + 100).toFixed(0)}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        <div class="glass-card p-6 rounded-2xl">
                            <h3 class="font-bold mb-4 flex items-center gap-2">
                                <i data-lucide="star" class="w-5 h-5 text-orange-600"></i>
                                Top Selling Products
                            </h3>
                            <div class="space-y-3">
                                ${products.map((product, i) => `
                                    <div class="flex items-center gap-3">
                                        <img src="${product.image}" class="w-12 h-12 rounded-lg object-cover">
                                        <div class="flex-1">
                                            <p class="font-bold text-sm">${product.name}</p>
                                            <p class="text-xs text-slate-500">${5 + i * 2} sold</p>
                                        </div>
                                        <span class="text-sm font-bold text-green-600">$${(product.price * 1.35).toFixed(2)}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>

                    <!-- Recent Orders -->
                    <div>
                        <div class="flex items-center justify-between mb-6">
                            <h2 class="text-2xl font-bold">Recent Orders</h2>
                            <a href="#/dropshipper/orders" class="text-blue-600 font-bold hover:underline">View All →</a>
                        </div>
                        <div class="space-y-3">
                            ${Data.orders.slice(0, 5).map(order => Components.OrderCard(order)).join('')}
                        </div>
                    </div>

                    <!-- Dropshipper Features -->
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div class="glass-card p-6 rounded-2xl text-center">
                            <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <i data-lucide="package-x" class="w-8 h-8 text-green-600"></i>
                            </div>
                            <h3 class="font-bold mb-2">Zero Inventory</h3>
                            <p class="text-sm text-slate-500">No upfront costs or storage</p>
                        </div>
                        <div class="glass-card p-6 rounded-2xl text-center">
                            <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <i data-lucide="zap" class="w-8 h-8 text-blue-600"></i>
                            </div>
                            <h3 class="font-bold mb-2">Auto Fulfillment</h3>
                            <p class="text-sm text-slate-500">Orders shipped directly</p>
                        </div>
                        <div class="glass-card p-6 rounded-2xl text-center">
                            <div class="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <i data-lucide="trending-up" class="w-8 h-8 text-orange-600"></i>
                            </div>
                            <h3 class="font-bold mb-2">Track Profits</h3>
                            <p class="text-sm text-slate-500">Real-time margin calculator</p>
                        </div>
                    </div>
                </div>
            `;
        },

        storefront() {
            const storeProducts = Data.products.slice(0, 12);
            
            return `
                <div class="max-w-7xl mx-auto">
                    <div class="flex items-center justify-between mb-8">
                        <div>
                            <h1 class="text-3xl font-bold">Storefront Management</h1>
                            <p class="text-slate-600">Manage your online store and products</p>
                        </div>
                        <div class="flex gap-3">
                            <button onclick="window.open('#/dropshipper/store/mystore', '_blank')" class="border-2 border-slate-300 px-6 py-3 rounded-xl font-bold hover:bg-slate-50 transition-all">
                                <i data-lucide="eye" class="w-5 h-5 inline mr-2"></i>
                                View Store
                            </button>
                            <button onclick="Router.navigate('/dropshipper/catalog')" class="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all">
                                <i data-lucide="plus" class="w-5 h-5 inline mr-2"></i>
                                Add Products
                            </button>
                        </div>
                    </div>

                    <!-- Store Settings -->
                    <div class="glass-card p-6 rounded-2xl mb-8">
                        <h3 class="font-bold mb-4">Store Information</h3>
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="text-xs font-bold text-slate-600 ml-1">STORE NAME</label>
                                <input type="text" value="My Awesome Store" class="w-full p-3 rounded-xl border bg-white/50 outline-none focus:border-blue-500">
                            </div>
                            <div>
                                <label class="text-xs font-bold text-slate-600 ml-1">STORE URL</label>
                                <input type="text" value="mystore" class="w-full p-3 rounded-xl border bg-white/50 outline-none focus:border-blue-500">
                            </div>
                            <div class="col-span-2">
                                <label class="text-xs font-bold text-slate-600 ml-1">DESCRIPTION</label>
                                <textarea rows="2" class="w-full p-3 rounded-xl border bg-white/50 outline-none focus:border-blue-500">Your one-stop shop for amazing products</textarea>
                            </div>
                        </div>
                        <button class="mt-4 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all">
                            Save Changes
                        </button>
                    </div>

                    <!-- Products in Store -->
                    <div class="mb-6">
                        <h2 class="text-2xl font-bold mb-1">Store Products (${storeProducts.length})</h2>
                        <p class="text-slate-600 text-sm">Products currently listed in your store</p>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        ${storeProducts.map(product => `
                            <div class="glass-card rounded-2xl overflow-hidden group">
                                <div class="relative">
                                    <img src="${product.image}" alt="${product.name}" class="h-48 w-full object-cover">
                                    <div class="absolute top-2 right-2 flex gap-2">
                                        <button class="bg-white p-2 rounded-lg shadow hover:bg-red-50 transition-all">
                                            <i data-lucide="trash-2" class="w-4 h-4 text-red-600"></i>
                                        </button>
                                        <button class="bg-white p-2 rounded-lg shadow hover:bg-blue-50 transition-all">
                                            <i data-lucide="edit" class="w-4 h-4 text-blue-600"></i>
                                        </button>
                                    </div>
                                </div>
                                <div class="p-4">
                                    <h3 class="font-bold mb-2">${product.name}</h3>
                                    <div class="flex justify-between items-center mb-3">
                                        <div>
                                            <p class="text-xs text-slate-500">Cost</p>
                                            <p class="font-bold text-sm">$${product.price.toFixed(2)}</p>
                                        </div>
                                        <div>
                                            <p class="text-xs text-slate-500">Your Price</p>
                                            <p class="font-bold text-green-600">$${(product.price * 1.35).toFixed(2)}</p>
                                        </div>
                                        <div>
                                            <p class="text-xs text-slate-500">Profit</p>
                                            <p class="font-bold text-blue-600">$${(product.price * 0.35).toFixed(2)}</p>
                                        </div>
                                    </div>
                                    <div class="flex items-center justify-between text-xs text-slate-500">
                                        <span>Stock: ${product.stock}</span>
                                        <span class="text-green-600 font-bold">35% margin</span>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        },

        publicStore() {
            const products = Data.products.slice(0, 8);
            window.currentProducts = products;
            
            return `
                <div class="max-w-7xl mx-auto">
                    <!-- Store Header -->
                    <div class="glass-card p-8 rounded-2xl mb-8 bg-gradient-to-r from-green-600 to-teal-600 text-white text-center">
                        <h1 class="text-4xl font-bold mb-2">My Awesome Store</h1>
                        <p class="opacity-90 mb-4">Your one-stop shop for amazing products</p>
                        <div class="flex items-center justify-center gap-6 text-sm">
                            <span><i data-lucide="package" class="w-4 h-4 inline mr-1"></i>${products.length}+ Products</span>
                            <span><i data-lucide="star" class="w-4 h-4 inline mr-1"></i>4.8 Rating</span>
                            <span><i data-lucide="truck" class="w-4 h-4 inline mr-1"></i>Free Shipping</span>
                        </div>
                    </div>

                    <!-- Categories -->
                    <div class="mb-8">
                        <h2 class="text-2xl font-bold mb-4">Shop by Category</h2>
                        <div class="flex gap-3 overflow-x-auto pb-2">
                            ${Data.categories.map(cat => `
                                <button class="glass-card px-6 py-3 rounded-xl font-bold whitespace-nowrap hover:bg-blue-50 transition-all">
                                    ${cat.name}
                                </button>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Products -->
                    <div>
                        <h2 class="text-2xl font-bold mb-6">Featured Products</h2>
                        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            ${products.map(product => Components.ProductCard({
                                ...product,
                                price: product.price * 1.35 // Dropshipper markup
                            })).join('')}
                        </div>
                    </div>

                    <!-- Store Footer -->
                    <div class="glass-card p-8 rounded-2xl mt-12 text-center">
                        <h3 class="text-xl font-bold mb-4">Why Shop With Us?</h3>
                        <div class="grid grid-cols-3 gap-6">
                            <div>
                                <i data-lucide="shield-check" class="w-12 h-12 mx-auto mb-3 text-blue-600"></i>
                                <p class="font-bold">Secure Checkout</p>
                            </div>
                            <div>
                                <i data-lucide="truck" class="w-12 h-12 mx-auto mb-3 text-green-600"></i>
                                <p class="font-bold">Fast Delivery</p>
                            </div>
                            <div>
                                <i data-lucide="headphones" class="w-12 h-12 mx-auto mb-3 text-orange-600"></i>
                                <p class="font-bold">24/7 Support</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        },

        catalog() {
            const products = Data.products;
            window.currentProducts = products;
            
            return `
                <div>
                    ${Components.Breadcrumbs([
                        { label: 'Home', link: '/' },
                        { label: 'Product Sourcing' }
                    ])}

                    <div class="flex flex-col md:flex-row gap-8">
                        <!-- Filters -->
                        <aside class="w-full md:w-64 space-y-6">
                            <div class="glass-card p-6 rounded-2xl">
                                <h3 class="font-bold mb-4">Profit Margin</h3>
                                <div class="space-y-2 text-sm">
                                    ${['20%+', '30%+', '40%+', '50%+'].map(margin => `
                                        <label class="flex items-center gap-2 cursor-pointer">
                                            <input type="checkbox" class="rounded">
                                            <span>${margin}</span>
                                        </label>
                                    `).join('')}
                                </div>
                            </div>

                            <div class="glass-card p-6 rounded-2xl">
                                <h3 class="font-bold mb-4">Shipping Cost</h3>
                                <div class="space-y-2 text-sm">
                                    ${['Free', 'Under $5', 'Under $10', 'Any'].map(cost => `
                                        <label class="flex items-center gap-2 cursor-pointer">
                                            <input type="radio" name="shipping" class="rounded">
                                            <span>${cost}</span>
                                        </label>
                                    `).join('')}
                                </div>
                            </div>

                            <div class="glass-card p-6 rounded-2xl">
                                <h3 class="font-bold mb-4">In My Store</h3>
                                <div class="space-y-2 text-sm">
                                    <label class="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" class="rounded">
                                        <span>Hide added products</span>
                                    </label>
                                </div>
                            </div>
                        </aside>

                        <!-- Product Grid -->
                        <div class="flex-1">
                            <div class="flex justify-between items-center mb-6">
                                <p class="text-sm text-slate-500">${products.length} products available to dropship</p>
                                <select class="bg-transparent border rounded-lg px-4 py-2 text-sm font-bold outline-none">
                                    <option>Sort by: Best Margin</option>
                                    <option>Price: Low to High</option>
                                    <option>Price: High to Low</option>
                                    <option>Most Popular</option>
                                </select>
                            </div>

                            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                ${products.map(product => {
                                    const cost = product.price;
                                    const suggestedPrice = cost * 1.35;
                                    const profit = suggestedPrice - cost;
                                    const margin = ((profit / suggestedPrice) * 100).toFixed(0);
                                    
                                    return `
                                        <div class="glass-card rounded-2xl overflow-hidden">
                                            <img src="${product.image}" alt="${product.name}" class="h-48 w-full object-cover">
                                            <div class="p-4">
                                                <h3 class="font-bold mb-2 line-clamp-2">${product.name}</h3>
                                                <div class="grid grid-cols-2 gap-3 mb-4 text-sm">
                                                    <div>
                                                        <p class="text-xs text-slate-500">Your Cost</p>
                                                        <p class="font-bold">$${cost.toFixed(2)}</p>
                                                    </div>
                                                    <div>
                                                        <p class="text-xs text-slate-500">Suggested Price</p>
                                                        <p class="font-bold text-green-600">$${suggestedPrice.toFixed(2)}</p>
                                                    </div>
                                                    <div>
                                                        <p class="text-xs text-slate-500">Profit</p>
                                                        <p class="font-bold text-blue-600">$${profit.toFixed(2)}</p>
                                                    </div>
                                                    <div>
                                                        <p class="text-xs text-slate-500">Margin</p>
                                                        <p class="font-bold text-orange-600">${margin}%</p>
                                                    </div>
                                                </div>
                                                <button onclick="Router.navigate('/dropshipper/profit-calculator?product=${product.id}')" class="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all mb-2">
                                                    <i data-lucide="calculator" class="w-4 h-4 inline mr-2"></i>
                                                    Calculate Profit
                                                </button>
                                                <button class="w-full border-2 border-blue-600 text-blue-600 py-3 rounded-xl font-bold hover:bg-blue-50 transition-all">
                                                    <i data-lucide="plus" class="w-4 h-4 inline mr-2"></i>
                                                    Add to Store
                                                </button>
                                            </div>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        },

        profitCalculator(params = {}) {
            const productId = params.product || 1;
            const product = Data.products.find(p => p.id === parseInt(productId)) || Data.products[0];
            
            return `
                <div class="max-w-4xl mx-auto">
                    <h1 class="text-3xl font-bold mb-8">Profit Calculator</h1>

                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <!-- Product Info -->
                        <div class="glass-card p-6 rounded-2xl">
                            <img src="${product.image}" class="w-full h-48 object-cover rounded-xl mb-4">
                            <h2 class="text-xl font-bold mb-2">${product.name}</h2>
                            <p class="text-sm text-slate-600 mb-4">${product.description}</p>
                            <div class="flex items-center gap-2">
                                <span class="bg-green-100 text-green-600 px-3 py-1 rounded-full text-xs font-bold">In Stock</span>
                                <span class="text-sm text-slate-500">Available: ${product.stock}</span>
                            </div>
                        </div>

                        <!-- Calculator -->
                        <div class="glass-card p-6 rounded-2xl">
                            <h3 class="font-bold mb-4">Pricing Calculator</h3>
                            <div class="space-y-4">
                                <div>
                                    <label class="text-xs font-bold text-slate-600 ml-1">PRODUCT COST</label>
                                    <input type="number" id="costPrice" value="${product.price.toFixed(2)}" step="0.01" class="w-full p-3 rounded-xl border bg-white/50 outline-none focus:border-blue-500" oninput="updateProfitCalc()">
                                </div>
                                <div>
                                    <label class="text-xs font-bold text-slate-600 ml-1">SHIPPING COST</label>
                                    <input type="number" id="shippingCost" value="5.00" step="0.01" class="w-full p-3 rounded-xl border bg-white/50 outline-none focus:border-blue-500" oninput="updateProfitCalc()">
                                </div>
                                <div>
                                    <label class="text-xs font-bold text-slate-600 ml-1">YOUR SELLING PRICE</label>
                                    <input type="number" id="sellingPrice" value="${(product.price * 1.35).toFixed(2)}" step="0.01" class="w-full p-3 rounded-xl border bg-white/50 outline-none focus:border-blue-500" oninput="updateProfitCalc()">
                                </div>
                                <div>
                                    <label class="text-xs font-bold text-slate-600 ml-1">QUANTITY</label>
                                    <input type="number" id="quantity" value="1" min="1" class="w-full p-3 rounded-xl border bg-white/50 outline-none focus:border-blue-500" oninput="updateProfitCalc()">
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Results -->
                    <div class="glass-card p-8 rounded-2xl mt-8 bg-gradient-to-r from-green-50 to-blue-50">
                        <h3 class="text-xl font-bold mb-6 text-center">Profit Analysis</h3>
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div class="text-center">
                                <p class="text-sm text-slate-600 mb-1">Total Cost</p>
                                <p id="totalCost" class="text-2xl font-bold text-slate-800">$${(product.price + 5).toFixed(2)}</p>
                            </div>
                            <div class="text-center">
                                <p class="text-sm text-slate-600 mb-1">Revenue</p>
                                <p id="revenue" class="text-2xl font-bold text-blue-600">$${(product.price * 1.35).toFixed(2)}</p>
                            </div>
                            <div class="text-center">
                                <p class="text-sm text-slate-600 mb-1">Profit per Unit</p>
                                <p id="profitPerUnit" class="text-2xl font-bold text-green-600">$${(product.price * 0.35 - 5).toFixed(2)}</p>
                            </div>
                            <div class="text-center">
                                <p class="text-sm text-slate-600 mb-1">Profit Margin</p>
                                <p id="profitMargin" class="text-2xl font-bold text-orange-600">26%</p>
                            </div>
                        </div>

                        <div class="mt-6 pt-6 border-t text-center">
                            <p class="text-sm text-slate-600 mb-2">Total Profit (Quantity × Profit per Unit)</p>
                            <p id="totalProfit" class="text-4xl font-bold text-green-600">$${(product.price * 0.35 - 5).toFixed(2)}</p>
                        </div>
                    </div>

                    <script>
                        function updateProfitCalc() {
                            const cost = parseFloat(document.getElementById('costPrice').value) || 0;
                            const shipping = parseFloat(document.getElementById('shippingCost').value) || 0;
                            const selling = parseFloat(document.getElementById('sellingPrice').value) || 0;
                            const qty = parseInt(document.getElementById('quantity').value) || 1;
                            
                            const totalCost = cost + shipping;
                            const revenue = selling;
                            const profitPerUnit = selling - totalCost;
                            const margin = totalCost > 0 ? ((profitPerUnit / selling) * 100).toFixed(0) : 0;
                            const totalProfit = profitPerUnit * qty;
                            
                            document.getElementById('totalCost').textContent = '$' + totalCost.toFixed(2);
                            document.getElementById('revenue').textContent = '$' + revenue.toFixed(2);
                            document.getElementById('profitPerUnit').textContent = '$' + profitPerUnit.toFixed(2);
                            document.getElementById('profitMargin').textContent = margin + '%';
                            document.getElementById('totalProfit').textContent = '$' + totalProfit.toFixed(2);
                        }
                    </script>

                    <div class="flex gap-4 mt-8">
                        <button class="flex-1 bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-all">
                            Add to Store with This Pricing
                        </button>
                        <button onclick="Router.navigate('/dropshipper/catalog')" class="border-2 border-slate-300 px-6 rounded-xl font-bold hover:bg-slate-50 transition-all">
                            Back to Catalog
                        </button>
                    </div>
                </div>
            `;
        },

        analytics() {
            return `
                <div class="max-w-7xl mx-auto">
                    <h1 class="text-3xl font-bold mb-8">Store Analytics</h1>

                    <!-- Summary Stats -->
                    <div class="grid grid-cols-4 gap-6 mb-8">
                        ${Components.StatCard('Total Sales', '$12,450', 'dollar-sign', 'green', 24)}
                        ${Components.StatCard('Orders', '156', 'shopping-bag', 'blue', 12)}
                        ${Components.StatCard('Conversion', '3.2%', 'trending-up', 'orange', 8)}
                        ${Components.StatCard('Avg Order', '$79.81', 'receipt', 'purple')}
                    </div>

                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <!-- Revenue Chart -->
                        <div class="glass-card p-6 rounded-2xl">
                            <h3 class="font-bold mb-6">Revenue Over Time</h3>
                            <div class="space-y-4">
                                ${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, i) => {
                                    const value = 20 + Math.random() * 70;
                                    const revenue = (800 + Math.random() * 2000).toFixed(0);
                                    return `
                                        <div>
                                            <div class="flex items-center justify-between mb-2">
                                                <span class="text-sm font-bold">${month}</span>
                                                <span class="text-sm font-bold text-green-600">$${revenue}</span>
                                            </div>
                                            <div class="w-full bg-slate-200 rounded-full h-3">
                                                <div class="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all" style="width: ${value}%"></div>
                                            </div>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>

                        <!-- Traffic Sources -->
                        <div class="glass-card p-6 rounded-2xl">
                            <h3 class="font-bold mb-6">Traffic Sources</h3>
                            <div class="space-y-4">
                                ${[
                                    { source: 'Direct', visitors: 1245, color: 'blue', percentage: 45 },
                                    { source: 'Social Media', visitors: 892, color: 'purple', percentage: 32 },
                                    { source: 'Search', visitors: 445, color: 'green', percentage: 16 },
                                    { source: 'Referral', visitors: 198, color: 'orange', percentage: 7 }
                                ].map(item => `
                                    <div>
                                        <div class="flex items-center justify-between mb-2">
                                            <div class="flex items-center gap-2">
                                                <div class="w-3 h-3 bg-${item.color}-500 rounded-full"></div>
                                                <span class="font-bold">${item.source}</span>
                                            </div>
                                            <span class="text-sm text-slate-600">${item.visitors} visits</span>
                                        </div>
                                        <div class="w-full bg-slate-200 rounded-full h-2">
                                            <div class="bg-${item.color}-500 h-2 rounded-full" style="width: ${item.percentage}%"></div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        <!-- Top Products -->
                        <div class="glass-card p-6 rounded-2xl">
                            <h3 class="font-bold mb-6">Best Selling Products</h3>
                            <div class="space-y-3">
                                ${Data.products.slice(0, 5).map((product, i) => `
                                    <div class="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-xl transition-all">
                                        <span class="text-2xl font-bold text-slate-300">${i + 1}</span>
                                        <img src="${product.image}" class="w-12 h-12 rounded-lg object-cover">
                                        <div class="flex-1">
                                            <p class="font-bold text-sm">${product.name}</p>
                                            <p class="text-xs text-slate-500">${15 + i * 3} sales</p>
                                        </div>
                                        <div class="text-right">
                                            <p class="font-bold text-green-600">$${(product.price * (15 + i * 3) * 1.35).toFixed(0)}</p>
                                            <p class="text-xs text-slate-500">revenue</p>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        <!-- Recent Activity -->
                        <div class="glass-card p-6 rounded-2xl">
                            <h3 class="font-bold mb-6">Recent Activity</h3>
                            <div class="space-y-3">
                                ${[
                                    { icon: 'shopping-bag', color: 'blue', text: 'New order received', time: '5 min ago' },
                                    { icon: 'eye', color: 'green', text: 'Product viewed 12 times', time: '1 hour ago' },
                                    { icon: 'heart', color: 'red', text: 'Product added to wishlist', time: '2 hours ago' },
                                    { icon: 'share-2', color: 'purple', text: 'Store shared on social', time: '5 hours ago' },
                                    { icon: 'star', color: 'orange', text: 'New 5-star review', time: '1 day ago' }
                                ].map(activity => `
                                    <div class="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition-all">
                                        <div class="w-10 h-10 bg-${activity.color}-100 rounded-full flex items-center justify-center">
                                            <i data-lucide="${activity.icon}" class="w-5 h-5 text-${activity.color}-600"></i>
                                        </div>
                                        <div class="flex-1">
                                            <p class="font-bold text-sm">${activity.text}</p>
                                            <p class="text-xs text-slate-500">${activity.time}</p>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        },

        orders() {
            const orders = Data.orders;
            
            return `
                <div class="max-w-6xl mx-auto">
                    <h1 class="text-3xl font-bold mb-8">Order Fulfillment</h1>

                    <!-- Status Tabs -->
                    <div class="flex gap-2 mb-6">
                        <button class="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold">All (${orders.length})</button>
                        <button class="px-6 py-3 glass-card rounded-xl font-bold hover:bg-slate-50">Pending (${orders.filter(o => o.status === 'processing').length})</button>
                        <button class="px-6 py-3 glass-card rounded-xl font-bold hover:bg-slate-50">Shipped (${orders.filter(o => o.status === 'shipped').length})</button>
                        <button class="px-6 py-3 glass-card rounded-xl font-bold hover:bg-slate-50">Delivered (${orders.filter(o => o.status === 'delivered').length})</button>
                    </div>

                    <!-- Orders List -->
                    <div class="space-y-4">
                        ${orders.map(order => `
                            <div class="glass-card p-6 rounded-2xl">
                                <div class="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 class="font-bold text-lg mb-1">Order #${order.id}</h3>
                                        <p class="text-sm text-slate-600">${order.date}</p>
                                    </div>
                                    <div class="text-right">
                                        <span class="badge-${order.status === 'delivered' ? 'green' : order.status === 'shipped' ? 'blue' : 'orange'} px-3 py-1 rounded-full text-xs font-bold capitalize">${order.status}</span>
                                        <p class="text-xl font-bold mt-2">$${order.total.toFixed(2)}</p>
                                    </div>
                                </div>
                                
                                ${order.items.map(item => `
                                    <div class="flex items-center gap-4 p-3 bg-slate-50 rounded-xl mb-3">
                                        <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <i data-lucide="package" class="w-6 h-6 text-blue-600"></i>
                                        </div>
                                        <div class="flex-1">
                                            <p class="font-bold">${item.name}</p>
                                            <p class="text-sm text-slate-600">Qty: ${item.quantity}</p>
                                        </div>
                                        <p class="font-bold">$${item.price.toFixed(2)}</p>
                                    </div>
                                `).join('')}

                                <div class="flex gap-3 mt-4">
                                    ${order.status === 'processing' ? `
                                        <button class="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all">
                                            Process Order
                                        </button>
                                    ` : ''}
                                    <button class="border-2 border-slate-300 px-6 rounded-xl font-bold hover:bg-slate-50 transition-all">
                                        View Details
                                    </button>
                                    <button class="border-2 border-slate-300 px-6 rounded-xl font-bold hover:bg-slate-50 transition-all">
                                        Track Shipment
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
    },

    // ==================== WAREHOUSE (WMS) PAGES ====================
    
    warehouse: {
        home() {
            const inventory = Data.warehouseInventory.slice(0, 5);
            const orders = Data.orders.filter(o => o.status === 'processing').slice(0, 4);
            
            return `
                <div class="space-y-10">
                    <!-- Hero Section -->
                    <div class="glass-card bg-gradient-to-r from-orange-600 to-red-600 rounded-[2rem] p-12 text-white flex flex-col md:flex-row justify-between items-center">
                        <div class="max-w-lg mb-6 md:mb-0">
                            <h1 class="text-5xl font-bold mb-4">Warehouse Management</h1>
                            <p class="mb-6 opacity-90 text-lg">Streamline operations with real-time inventory tracking and order fulfillment</p>
                            <div class="flex gap-4">
                                <button onclick="Router.navigate('/warehouse/receiving')" class="bg-white text-orange-600 px-6 py-3 rounded-full font-bold hover:shadow-xl transition-all">Receiving</button>
                                <button onclick="Router.navigate('/warehouse/fulfillment')" class="border-2 border-white px-6 py-3 rounded-full font-bold hover:bg-white/10 transition-all">Fulfillment</button>
                            </div>
                        </div>
                        <img src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400" class="h-64 rounded-2xl shadow-2xl">
                    </div>

                    <!-- Quick Stats -->
                    <div class="grid grid-cols-4 gap-6">
                        ${Components.StatCard('Total SKUs', '1,247', 'package', 'orange')}
                        ${Components.StatCard('Pending Orders', orders.length.toString(), 'shopping-cart', 'blue')}
                        ${Components.StatCard('In Transit', '23', 'truck', 'purple')}
                        ${Components.StatCard('Capacity', '78%', 'warehouse', 'green')}
                    </div>

                    <!-- Today's Activities -->
                    <div class="grid grid-cols-2 gap-6">
                        <div class="glass-card p-6 rounded-2xl">
                            <h3 class="font-bold mb-4 flex items-center gap-2">
                                <i data-lucide="inbox" class="w-5 h-5 text-orange-600"></i>
                                Receiving Queue
                            </h3>
                            <div class="space-y-3">
                                ${[1, 2, 3].map((_, i) => `
                                    <div class="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                        <div class="flex items-center gap-3">
                                            <div class="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                                <i data-lucide="box" class="w-5 h-5 text-orange-600"></i>
                                            </div>
                                            <div>
                                                <p class="font-bold text-sm">PO-${1000 + i}</p>
                                                <p class="text-xs text-slate-500">${50 + i * 20} units</p>
                                            </div>
                                        </div>
                                        <button class="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-orange-700 transition-all">
                                            Process
                                        </button>
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        <div class="glass-card p-6 rounded-2xl">
                            <h3 class="font-bold mb-4 flex items-center gap-2">
                                <i data-lucide="alert-triangle" class="w-5 h-5 text-red-600"></i>
                                Low Stock Alerts
                            </h3>
                            <div class="space-y-3">
                                ${inventory.filter(item => item.quantity < 50).map(item => `
                                    <div class="flex items-center justify-between p-3 bg-red-50 rounded-xl border border-red-200">
                                        <div>
                                            <p class="font-bold text-sm">${item.sku}</p>
                                            <p class="text-xs text-slate-500">${item.location}</p>
                                        </div>
                                        <div class="text-right">
                                            <p class="text-red-600 font-bold">${item.quantity} units</p>
                                            <p class="text-xs text-slate-500">Min: ${item.minStock}</p>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>

                    <!-- Pending Orders -->
                    <div>
                        <div class="flex items-center justify-between mb-6">
                            <h2 class="text-2xl font-bold">Orders to Fulfill</h2>
                            <a href="#/warehouse/fulfillment" class="text-blue-600 font-bold hover:underline">View All →</a>
                        </div>
                        <div class="grid grid-cols-1 gap-4">
                            ${orders.map(order => Components.OrderCard(order)).join('')}
                        </div>
                    </div>

                    <!-- WMS Features -->
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div class="glass-card p-6 rounded-2xl text-center">
                            <div class="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <i data-lucide="zap" class="w-8 h-8 text-orange-600"></i>
                            </div>
                            <h3 class="font-bold mb-2">Real-Time Tracking</h3>
                            <p class="text-sm text-slate-500">Live inventory updates</p>
                        </div>
                        <div class="glass-card p-6 rounded-2xl text-center">
                            <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <i data-lucide="scan" class="w-8 h-8 text-blue-600"></i>
                            </div>
                            <h3 class="font-bold mb-2">Barcode Scanning</h3>
                            <p class="text-sm text-slate-500">Quick item lookup</p>
                        </div>
                        <div class="glass-card p-6 rounded-2xl text-center">
                            <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <i data-lucide="bar-chart-2" class="w-8 h-8 text-green-600"></i>
                            </div>
                            <h3 class="font-bold mb-2">Analytics</h3>
                            <p class="text-sm text-slate-500">Performance insights</p>
                        </div>
                    </div>
                </div>
            `;
        },

        receiving() {
            return `
                <div class="max-w-7xl mx-auto">
                    <div class="flex items-center justify-between mb-8">
                        <h1 class="text-3xl font-bold">Receiving Dashboard</h1>
                        <button class="bg-orange-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-700 transition-all">
                            <i data-lucide="plus" class="w-5 h-5 inline mr-2"></i>
                            New Receipt
                        </button>
                    </div>

                    <!-- Incoming Shipments -->
                    <div class="space-y-4">
                        ${[1, 2, 3, 4].map(i => `
                            <div class="glass-card p-6 rounded-2xl">
                                <div class="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 class="text-xl font-bold mb-1">PO-${1000 + i}</h3>
                                        <p class="text-sm text-slate-600">Expected: Jan ${18 + i}, 2026</p>
                                    </div>
                                    <span class="badge-${i === 1 ? 'green' : 'orange'} px-3 py-1 rounded-full text-xs font-bold">
                                        ${i === 1 ? 'Arrived' : 'In Transit'}
                                    </span>
                                </div>

                                <div class="grid grid-cols-4 gap-4 mb-4 text-sm">
                                    <div>
                                        <p class="text-slate-500">Supplier</p>
                                        <p class="font-bold">Supplier ${i}</p>
                                    </div>
                                    <div>
                                        <p class="text-slate-500">Items</p>
                                        <p class="font-bold">${50 + i * 20} units</p>
                                    </div>
                                    <div>
                                        <p class="text-slate-500">Tracking</p>
                                        <p class="font-bold">TRK${Math.random().toString().slice(2, 14)}</p>
                                    </div>
                                    <div>
                                        <p class="text-slate-500">Priority</p>
                                        <p class="font-bold ${i <= 2 ? 'text-red-600' : 'text-blue-600'}">${i <= 2 ? 'High' : 'Normal'}</p>
                                    </div>
                                </div>

                                ${i === 1 ? `
                                    <div class="border-t pt-4">
                                        <h4 class="font-bold mb-3">Receiving Checklist</h4>
                                        <div class="space-y-2 mb-4">
                                            ${['Verify quantities', 'Inspect quality', 'Update inventory', 'Generate labels'].map((task, idx) => `
                                                <label class="flex items-center gap-2 cursor-pointer">
                                                    <input type="checkbox" ${idx === 0 ? 'checked' : ''} class="rounded">
                                                    <span class="text-sm">${task}</span>
                                                </label>
                                            `).join('')}
                                        </div>
                                        <div class="flex gap-3">
                                            <button class="flex-1 bg-orange-600 text-white py-3 rounded-xl font-bold hover:bg-orange-700 transition-all">
                                                Complete Receipt
                                            </button>
                                            <button class="border-2 border-slate-300 px-6 rounded-xl font-bold hover:bg-slate-50 transition-all">
                                                Report Issue
                                            </button>
                                        </div>
                                    </div>
                                ` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        },

        inventory() {
            const inventory = Data.warehouseInventory;
            
            return `
                <div class="max-w-7xl mx-auto">
                    <div class="flex items-center justify-between mb-8">
                        <h1 class="text-3xl font-bold">Inventory Management</h1>
                        <div class="flex gap-3">
                            <button class="border-2 border-slate-300 px-6 py-3 rounded-xl font-bold hover:bg-slate-50 transition-all">
                                <i data-lucide="download" class="w-5 h-5 inline mr-2"></i>
                                Export
                            </button>
                            <button class="bg-orange-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-700 transition-all">
                                <i data-lucide="plus" class="w-5 h-5 inline mr-2"></i>
                                Add Item
                            </button>
                        </div>
                    </div>

                    <!-- Filters -->
                    <div class="glass-card p-4 rounded-2xl mb-6 flex gap-4">
                        <input type="text" placeholder="Search SKU or name..." class="flex-1 p-3 rounded-xl border bg-white/50 outline-none focus:border-orange-500">
                        <select class="px-4 py-3 rounded-xl border bg-white/50 outline-none">
                            <option>All Locations</option>
                            <option>Zone A</option>
                            <option>Zone B</option>
                            <option>Zone C</option>
                        </select>
                        <select class="px-4 py-3 rounded-xl border bg-white/50 outline-none">
                            <option>All Status</option>
                            <option>In Stock</option>
                            <option>Low Stock</option>
                            <option>Out of Stock</option>
                        </select>
                    </div>

                    <!-- Inventory Table -->
                    <div class="glass-card rounded-2xl overflow-hidden">
                        <table class="w-full">
                            <thead class="bg-slate-100">
                                <tr>
                                    <th class="text-left p-4 font-bold">SKU</th>
                                    <th class="text-left p-4 font-bold">Product</th>
                                    <th class="text-left p-4 font-bold">Location</th>
                                    <th class="text-right p-4 font-bold">Quantity</th>
                                    <th class="text-right p-4 font-bold">Min Stock</th>
                                    <th class="text-center p-4 font-bold">Status</th>
                                    <th class="text-center p-4 font-bold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${inventory.map(item => {
                                    const status = item.quantity === 0 ? 'out' : item.quantity < item.minStock ? 'low' : 'ok';
                                    const statusColor = status === 'out' ? 'red' : status === 'low' ? 'orange' : 'green';
                                    const statusText = status === 'out' ? 'Out of Stock' : status === 'low' ? 'Low Stock' : 'In Stock';
                                    
                                    return `
                                        <tr class="border-t hover:bg-slate-50 transition-all">
                                            <td class="p-4 font-mono font-bold text-sm">${item.sku}</td>
                                            <td class="p-4">${item.productName}</td>
                                            <td class="p-4 text-sm text-slate-600">${item.location}</td>
                                            <td class="p-4 text-right font-bold ${status !== 'ok' ? 'text-' + statusColor + '-600' : ''}">${item.quantity}</td>
                                            <td class="p-4 text-right text-sm text-slate-600">${item.minStock}</td>
                                            <td class="p-4 text-center">
                                                <span class="badge-${statusColor} px-3 py-1 rounded-full text-xs font-bold">${statusText}</span>
                                            </td>
                                            <td class="p-4">
                                                <div class="flex gap-2 justify-center">
                                                    <button class="p-2 hover:bg-blue-50 rounded-lg transition-all">
                                                        <i data-lucide="edit" class="w-4 h-4 text-blue-600"></i>
                                                    </button>
                                                    <button class="p-2 hover:bg-orange-50 rounded-lg transition-all">
                                                        <i data-lucide="package" class="w-4 h-4 text-orange-600"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        },

        fulfillment() {
            const orders = Data.orders.filter(o => o.status === 'processing');
            
            return `
                <div class="max-w-7xl mx-auto">
                    <h1 class="text-3xl font-bold mb-8">Order Fulfillment</h1>

                    <!-- Status Tabs -->
                    <div class="flex gap-2 mb-6">
                        <button class="px-6 py-3 bg-orange-600 text-white rounded-xl font-bold">To Pick (${orders.length})</button>
                        <button class="px-6 py-3 glass-card rounded-xl font-bold hover:bg-slate-50">Packing (0)</button>
                        <button class="px-6 py-3 glass-card rounded-xl font-bold hover:bg-slate-50">Ready to Ship (0)</button>
                        <button class="px-6 py-3 glass-card rounded-xl font-bold hover:bg-slate-50">Completed (${Data.orders.filter(o => o.status === 'shipped').length})</button>
                    </div>

                    <!-- Orders to Fulfill -->
                    <div class="space-y-4">
                        ${orders.map(order => `
                            <div class="glass-card p-6 rounded-2xl">
                                <div class="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 class="text-xl font-bold mb-1">Order #${order.id}</h3>
                                        <p class="text-sm text-slate-600">Ordered: ${order.date}</p>
                                    </div>
                                    <div class="text-right">
                                        <span class="badge-orange px-3 py-1 rounded-full text-xs font-bold mb-2 inline-block">Priority: Normal</span>
                                        <p class="text-sm text-slate-600">Promised: ${order.date}</p>
                                    </div>
                                </div>

                                <div class="bg-slate-50 rounded-xl p-4 mb-4">
                                    <h4 class="font-bold mb-3">Pick List</h4>
                                    ${order.items.map((item, idx) => `
                                        <div class="flex items-center justify-between py-2 ${idx > 0 ? 'border-t' : ''}">
                                            <div class="flex items-center gap-3">
                                                <input type="checkbox" class="rounded w-5 h-5">
                                                <div>
                                                    <p class="font-bold text-sm">${item.name}</p>
                                                    <p class="text-xs text-slate-500">SKU: ${item.sku || 'WH-' + (item.id * 100)}</p>
                                                </div>
                                            </div>
                                            <div class="text-right">
                                                <p class="font-bold">Qty: ${item.quantity}</p>
                                                <p class="text-xs text-slate-500">Loc: A-${Math.floor(Math.random() * 20) + 1}-${Math.floor(Math.random() * 10) + 1}</p>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>

                                <div class="flex gap-3">
                                    <button class="flex-1 bg-orange-600 text-white py-3 rounded-xl font-bold hover:bg-orange-700 transition-all">
                                        <i data-lucide="check-circle" class="w-5 h-5 inline mr-2"></i>
                                        Start Picking
                                    </button>
                                    <button class="border-2 border-slate-300 px-6 rounded-xl font-bold hover:bg-slate-50 transition-all">
                                        Print Pick List
                                    </button>
                                    <button class="border-2 border-slate-300 px-6 rounded-xl font-bold hover:bg-slate-50 transition-all">
                                        Details
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        },

        shipping() {
            const readyToShip = Data.orders.filter(o => o.status === 'shipped').slice(0, 5);
            
            return `
                <div class="max-w-7xl mx-auto">
                    <h1 class="text-3xl font-bold mb-8">Shipping Management</h1>

                    <!-- Quick Actions -->
                    <div class="grid grid-cols-3 gap-6 mb-8">
                        ${Components.StatCard('Ready to Ship', readyToShip.length.toString(), 'package', 'orange')}
                        ${Components.StatCard('In Transit', '23', 'truck', 'blue')}
                        ${Components.StatCard('Delivered Today', '45', 'check-circle', 'green')}
                    </div>

                    <!-- Ready to Ship -->
                    <div class="mb-8">
                        <h2 class="text-2xl font-bold mb-4">Ready for Dispatch</h2>
                        <div class="space-y-4">
                            ${readyToShip.map(order => `
                                <div class="glass-card p-6 rounded-2xl">
                                    <div class="flex items-start justify-between mb-4">
                                        <div class="flex items-center gap-4">
                                            <input type="checkbox" class="rounded w-5 h-5">
                                            <div>
                                                <h3 class="font-bold text-lg">Order #${order.id}</h3>
                                                <p class="text-sm text-slate-600">${order.items.length} items • $${order.total.toFixed(2)}</p>
                                            </div>
                                        </div>
                                        <span class="badge-green px-3 py-1 rounded-full text-xs font-bold">Packed</span>
                                    </div>

                                    <div class="grid grid-cols-2 gap-4 mb-4 p-4 bg-slate-50 rounded-xl">
                                        <div>
                                            <p class="text-xs text-slate-500 mb-1">Shipping Method</p>
                                            <select class="w-full p-2 rounded-lg border text-sm font-bold">
                                                <option>Standard Shipping</option>
                                                <option>Express Shipping</option>
                                                <option>Overnight</option>
                                            </select>
                                        </div>
                                        <div>
                                            <p class="text-xs text-slate-500 mb-1">Carrier</p>
                                            <select class="w-full p-2 rounded-lg border text-sm font-bold">
                                                <option>USPS</option>
                                                <option>FedEx</option>
                                                <option>UPS</option>
                                                <option>DHL</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div class="flex gap-3">
                                        <button class="flex-1 bg-orange-600 text-white py-3 rounded-xl font-bold hover:bg-orange-700 transition-all">
                                            <i data-lucide="printer" class="w-5 h-5 inline mr-2"></i>
                                            Print Label
                                        </button>
                                        <button class="border-2 border-orange-600 text-orange-600 px-6 rounded-xl font-bold hover:bg-orange-50 transition-all">
                                            Mark as Shipped
                                        </button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Bulk Actions -->
                    <div class="glass-card p-6 rounded-2xl bg-blue-50">
                        <div class="flex items-center justify-between">
                            <div>
                                <h3 class="font-bold mb-1">Bulk Shipping</h3>
                                <p class="text-sm text-slate-600">Process multiple orders at once</p>
                            </div>
                            <button class="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all">
                                Process Selected Orders
                            </button>
                        </div>
                    </div>
                </div>
            `;
        },

        returns() {
            return `
                <div class="max-w-7xl mx-auto">
                    <h1 class="text-3xl font-bold mb-8">Returns Processing</h1>

                    <div class="space-y-4">
                        ${[1, 2, 3].map(i => `
                            <div class="glass-card p-6 rounded-2xl">
                                <div class="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 class="text-xl font-bold mb-1">Return #RET-${1000 + i}</h3>
                                        <p class="text-sm text-slate-600">Original Order: #${i + 100}</p>
                                    </div>
                                    <span class="badge-${i === 1 ? 'orange' : 'blue'} px-3 py-1 rounded-full text-xs font-bold">
                                        ${i === 1 ? 'Pending Inspection' : 'Approved'}
                                    </span>
                                </div>

                                <div class="bg-slate-50 rounded-xl p-4 mb-4">
                                    <div class="flex items-center gap-4 mb-3">
                                        <div class="w-16 h-16 bg-slate-200 rounded-lg flex items-center justify-center">
                                            <i data-lucide="package" class="w-8 h-8 text-slate-600"></i>
                                        </div>
                                        <div class="flex-1">
                                            <p class="font-bold">Wireless Headphones</p>
                                            <p class="text-sm text-slate-600">Reason: Defective</p>
                                        </div>
                                        <div class="text-right">
                                            <p class="font-bold">$49.99</p>
                                            <p class="text-xs text-slate-500">Qty: 1</p>
                                        </div>
                                    </div>
                                </div>

                                <div class="grid grid-cols-3 gap-4 mb-4">
                                    <div>
                                        <p class="text-xs text-slate-500">Return Method</p>
                                        <p class="font-bold text-sm">${i === 1 ? 'Refund' : 'Exchange'}</p>
                                    </div>
                                    <div>
                                        <p class="text-xs text-slate-500">Received</p>
                                        <p class="font-bold text-sm">Jan ${15 + i}, 2026</p>
                                    </div>
                                    <div>
                                        <p class="text-xs text-slate-500">Condition</p>
                                        <p class="font-bold text-sm">${i === 1 ? 'Pending' : 'Good'}</p>
                                    </div>
                                </div>

                                ${i === 1 ? `
                                    <div class="flex gap-3">
                                        <button class="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition-all">
                                            Approve & Restock
                                        </button>
                                        <button class="flex-1 bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition-all">
                                            Reject Return
                                        </button>
                                    </div>
                                ` : `
                                    <div class="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-2">
                                        <i data-lucide="check-circle" class="w-5 h-5 text-green-600"></i>
                                        <span class="text-sm font-bold text-green-600">Return processed and item restocked to ${Data.warehouseInventory[0].location}</span>
                                    </div>
                                `}
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        },

        reports() {
            return `
                <div class="max-w-7xl mx-auto">
                    <h1 class="text-3xl font-bold mb-8">WMS Reports & Analytics</h1>

                    <!-- Summary Stats -->
                    <div class="grid grid-cols-4 gap-6 mb-8">
                        ${Components.StatCard('Inventory Value', '$245K', 'dollar-sign', 'green')}
                        ${Components.StatCard('Orders Fulfilled', '1,234', 'check-circle', 'blue', 15)}
                        ${Components.StatCard('Accuracy Rate', '99.2%', 'target', 'orange')}
                        ${Components.StatCard('Avg Pick Time', '3.2 min', 'clock', 'purple')}
                    </div>

                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <!-- Inventory Turnover -->
                        <div class="glass-card p-6 rounded-2xl">
                            <h3 class="font-bold mb-6">Inventory Turnover</h3>
                            <div class="space-y-4">
                                ${Data.categories.slice(0, 6).map((cat, i) => {
                                    const value = 20 + Math.random() * 70;
                                    return `
                                        <div>
                                            <div class="flex items-center justify-between mb-2">
                                                <span class="font-bold text-sm">${cat.name}</span>
                                                <span class="text-sm text-slate-600">${(2 + Math.random() * 3).toFixed(1)}x</span>
                                            </div>
                                            <div class="w-full bg-slate-200 rounded-full h-2">
                                                <div class="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full" style="width: ${value}%"></div>
                                            </div>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>

                        <!-- Fulfillment Performance -->
                        <div class="glass-card p-6 rounded-2xl">
                            <h3 class="font-bold mb-6">Fulfillment Performance</h3>
                            <div class="space-y-4">
                                ${['Orders Picked', 'Orders Packed', 'Orders Shipped', 'Same Day Ship'].map((metric, i) => `
                                    <div class="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                        <span class="font-bold">${metric}</span>
                                        <span class="text-2xl font-bold text-orange-600">${[156, 142, 138, 89][i]}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        <!-- Top SKUs by Volume -->
                        <div class="glass-card p-6 rounded-2xl">
                            <h3 class="font-bold mb-6">Top SKUs by Volume</h3>
                            <div class="space-y-3">
                                ${Data.warehouseInventory.slice(0, 5).map((item, i) => `
                                    <div class="flex items-center gap-4">
                                        <span class="text-2xl font-bold text-slate-300">${i + 1}</span>
                                        <div class="flex-1">
                                            <p class="font-bold text-sm">${item.productName}</p>
                                            <p class="text-xs text-slate-500">${item.sku}</p>
                                        </div>
                                        <div class="text-right">
                                            <p class="font-bold">${(Math.random() * 200 + 100).toFixed(0)} picks</p>
                                            <p class="text-xs text-slate-500">${item.location}</p>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        <!-- Space Utilization -->
                        <div class="glass-card p-6 rounded-2xl">
                            <h3 class="font-bold mb-6">Warehouse Space Utilization</h3>
                            <div class="space-y-4">
                                ${['Zone A', 'Zone B', 'Zone C'].map((zone, i) => {
                                    const utilization = 60 + Math.random() * 30;
                                    return `
                                        <div>
                                            <div class="flex items-center justify-between mb-2">
                                                <span class="font-bold">${zone}</span>
                                                <span class="text-sm font-bold ${utilization > 85 ? 'text-red-600' : 'text-green-600'}">${utilization.toFixed(0)}%</span>
                                            </div>
                                            <div class="w-full bg-slate-200 rounded-full h-3">
                                                <div class="bg-gradient-to-r from-orange-500 to-red-500 h-3 rounded-full" style="width: ${utilization}%"></div>
                                            </div>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
    },

    // ==================== SUPPLIER PAGES ====================
    
    supplier: {
        home() {
            const products = Data.products.slice(0, 4);
            const rfqRequests = Data.rfqs.filter(r => r.status === 'open').slice(0, 3);
            
            return `
                <div class="space-y-10">
                    <!-- Hero Section -->
                    <div class="glass-card bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[2rem] p-12 text-white flex flex-col md:flex-row justify-between items-center">
                        <div class="max-w-lg mb-6 md:mb-0">
                            <h1 class="text-5xl font-bold mb-4">Supplier Portal</h1>
                            <p class="mb-6 opacity-90 text-lg">Manage your catalog, respond to RFQs, and fulfill bulk orders efficiently.</p>
                            <div class="flex gap-4">
                                <button onclick="Router.navigate('/supplier/products')" class="bg-white text-blue-600 px-6 py-3 rounded-full font-bold hover:shadow-xl transition-all">Manage Catalog</button>
                                <button onclick="Router.navigate('/supplier/rfq')" class="border-2 border-white px-6 py-3 rounded-full font-bold hover:bg-white/10 transition-all">View RFQs</button>
                            </div>
                        </div>
                        <img src="https://images.unsplash.com/photo-1556740758-90de374c12ad?w=400" class="h-64 rounded-2xl shadow-2xl">
                    </div>

                    <!-- Quick Stats -->
                    <div class="grid grid-cols-4 gap-6">
                        ${Components.StatCard('Total Revenue', '$142K', 'dollar-sign', 'green', 12)}
                        ${Components.StatCard('Confirm Orders', '45', 'shopping-cart', 'blue')}
                        ${Components.StatCard('Open RFQs', rfqRequests.length.toString(), 'file-text', 'orange')}
                        ${Components.StatCard('Rating', '4.8', 'star', 'purple')}
                    </div>

                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <!-- Active RFQs -->
                        <div class="glass-card p-6 rounded-2xl">
                            <h3 class="font-bold mb-6 flex items-center gap-2">
                                <i data-lucide="crosshair" class="w-5 h-5 text-orange-600"></i>
                                Urgent RFQ Requests
                            </h3>
                            <div class="space-y-4">
                                ${rfqRequests.map(rfq => `
                                    <div class="bg-slate-50 p-4 rounded-xl hover:bg-slate-100 transition-all cursor-pointer" onclick="Router.navigate('/supplier/rfq')">
                                        <div class="flex justify-between items-start mb-2">
                                            <h4 class="font-bold text-lg">${rfq.title}</h4>
                                            <span class="badge-orange text-xs px-2 py-1 rounded-full font-bold">New</span>
                                        </div>
                                        <p class="text-sm text-slate-600 mb-3 line-clamp-2">${rfq.description}</p>
                                        <div class="flex items-center gap-4 text-xs text-slate-500 font-bold">
                                            <span class="flex items-center gap-1"><i data-lucide="package" class="w-3 h-3"></i> ${rfq.quantity} units</span>
                                            <span class="flex items-center gap-1"><i data-lucide="calendar" class="w-3 h-3"></i> Due: ${rfq.deadline}</span>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        <!-- Top Selling Products -->
                        <div class="glass-card p-6 rounded-2xl">
                            <h3 class="font-bold mb-6 flex items-center gap-2">
                                <i data-lucide="trending-up" class="w-5 h-5 text-green-600"></i>
                                Top Performing Products
                            </h3>
                            <div class="space-y-3">
                                ${products.map((product, i) => `
                                    <div class="flex items-center gap-4 p-2 rounded-xl hover:bg-slate-50 transition-all">
                                        <span class="text-2xl font-bold text-slate-200">0${i + 1}</span>
                                        <img src="${product.image}" class="w-12 h-12 rounded-lg object-cover">
                                        <div class="flex-1">
                                            <p class="font-bold text-sm text-slate-800">${product.name}</p>
                                            <p class="text-xs text-slate-500">${product.stock} units in stock</p>
                                        </div>
                                        <div class="text-right">
                                            <p class="font-bold text-green-600">$${product.bulkPrice}</p>
                                            <p class="text-xs text-slate-400">Bulk Price</p>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>

                    <!-- Performance Overview -->
                    <div class="glass-card p-8 rounded-2xl bg-slate-900 text-white">
                        <div class="flex items-center justify-between mb-8">
                            <div>
                                <h3 class="text-xl font-bold">Performance Overview</h3>
                                <p class="text-slate-400 text-sm">Last 30 days breakdown</p>
                            </div>
                            <button onclick="Router.navigate('/supplier/reports')" class="px-4 py-2 border border-slate-600 hover:bg-slate-800 rounded-lg text-sm transition-all">View Detailed Report</button>
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div class="text-center">
                                <div class="w-20 h-20 rounded-full border-4 border-green-500 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">98%</div>
                                <p class="font-bold">Order Fulfillment</p>
                                <p class="text-xs text-slate-400">On-time delivery rate</p>
                            </div>
                            <div class="text-center">
                                <div class="w-20 h-20 rounded-full border-4 border-blue-500 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">2hr</div>
                                <p class="font-bold">Response Time</p>
                                <p class="text-xs text-slate-400">Average RFQ reply time</p>
                            </div>
                            <div class="text-center">
                                <div class="w-20 h-20 rounded-full border-4 border-orange-500 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">4.8</div>
                                <p class="font-bold">Customer Rating</p>
                                <p class="text-xs text-slate-400">Based on 156 reviews</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        },

        products() {
            const products = Data.products;
            
            return `
                <div class="max-w-7xl mx-auto">
                    <div class="flex items-center justify-between mb-8">
                        <div>
                            <h1 class="text-3xl font-bold">Product Catalog</h1>
                            <p class="text-slate-600">Manage your items, pricing, and bulk quantities</p>
                        </div>
                        <button class="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
                            <i data-lucide="plus" class="w-5 h-5 inline mr-2"></i>
                            Add New Product
                        </button>
                    </div>

                    <!-- Products Table -->
                    <div class="glass-card rounded-2xl overflow-hidden">
                        <table class="w-full">
                            <thead class="bg-slate-50">
                                <tr>
                                    <th class="text-left p-6 text-sm text-slate-500 font-bold uppercase tracking-wider">Product</th>
                                    <th class="text-left p-6 text-sm text-slate-500 font-bold uppercase tracking-wider">Category</th>
                                    <th class="text-right p-6 text-sm text-slate-500 font-bold uppercase tracking-wider">Unit Price</th>
                                    <th class="text-right p-6 text-sm text-slate-500 font-bold uppercase tracking-wider">Bulk Price</th>
                                    <th class="text-right p-6 text-sm text-slate-500 font-bold uppercase tracking-wider">MOQ</th>
                                    <th class="text-right p-6 text-sm text-slate-500 font-bold uppercase tracking-wider">Stock</th>
                                    <th class="text-center p-6 text-sm text-slate-500 font-bold uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-100">
                                ${products.map(product => `
                                    <tr class="hover:bg-slate-50/80 transition-colors group">
                                        <td class="p-6">
                                            <div class="flex items-center gap-4">
                                                <img src="${product.image}" class="w-12 h-12 rounded-lg object-cover shadow-sm">
                                                <div>
                                                    <p class="font-bold text-slate-800">${product.name}</p>
                                                    <p class="text-xs text-slate-400">SKU: SUP-${1000 + product.id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td class="p-6 text-sm font-medium text-slate-600">${product.category}</td>
                                        <td class="p-6 text-right font-medium text-slate-600">$${product.price}</td>
                                        <td class="p-6 text-right font-bold text-green-600">$${product.bulkPrice}</td>
                                        <td class="p-6 text-right text-sm font-bold text-blue-600">${product.moq} units</td>
                                        <td class="p-6">
                                            <div class="flex items-center justify-end gap-2">
                                                <div class="w-20 bg-slate-200 rounded-full h-1.5">
                                                    <div class="bg-${product.stock < 20 ? 'red' : 'green'}-500 h-1.5 rounded-full" style="width: ${Math.min(100, (product.stock / 100) * 100)}%"></div>
                                                </div>
                                                <span class="text-xs font-bold ${product.stock < 20 ? 'text-red-500' : 'text-slate-600'}">${product.stock}</span>
                                            </div>
                                        </td>
                                        <td class="p-6 text-center">
                                            <div class="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button class="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors">
                                                    <i data-lucide="edit-2" class="w-4 h-4"></i>
                                                </button>
                                                <button class="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors">
                                                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        },

        orders() {
            const orders = Data.orders.filter(o => o.status !== 'cancelled');
            
            return `
                <div class="max-w-7xl mx-auto">
                    <h1 class="text-3xl font-bold mb-8">Order Management</h1>

                    <div class="flex gap-4 mb-8 overflow-x-auto pb-2">
                        <button class="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 whitespace-nowrap">All Orders (${orders.length})</button>
                        <button class="px-6 py-3 bg-white text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all border border-slate-200 whitespace-nowrap">Pending Approval (5)</button>
                        <button class="px-6 py-3 bg-white text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all border border-slate-200 whitespace-nowrap">Processing (12)</button>
                        <button class="px-6 py-3 bg-white text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all border border-slate-200 whitespace-nowrap">Ready to Ship (8)</button>
                    </div>

                    <div class="space-y-4">
                        ${orders.map(order => `
                            <div class="glass-card p-6 rounded-2xl hover:shadow-lg transition-shadow">
                                <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
                                    <div class="flex items-center gap-4">
                                        <div class="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 font-bold">
                                            #${order.id}
                                        </div>
                                        <div>
                                            <h3 class="font-bold text-lg">Business Order</h3>
                                            <p class="text-sm text-slate-500">Placed on ${order.date} • via Marketplace</p>
                                        </div>
                                    </div>
                                    <div class="flex items-center gap-6">
                                        <div class="text-right">
                                            <p class="text-xs text-slate-400 font-bold uppercase">Total Amount</p>
                                            <p class="text-xl font-bold text-slate-800">$${order.total.toFixed(2)}</p>
                                        </div>
                                        <span class="px-4 py-2 bg-${order.status === 'delivered' ? 'green' : 'orange'}-100 text-${order.status === 'delivered' ? 'green' : 'orange'}-600 rounded-full font-bold text-sm capitalize">
                                            ${order.status}
                                        </span>
                                    </div>
                                </div>
                                
                                <div class="bg-slate-50 rounded-xl p-4 mb-4">
                                    <div class="space-y-2">
                                        ${order.items.map(item => `
                                            <div class="flex justify-between items-center text-sm">
                                                <span class="flex items-center gap-2 font-medium text-slate-700">
                                                    <span class="w-6 text-slate-400">x${item.quantity}</span>
                                                    ${item.name}
                                                </span>
                                                <span class="font-bold text-slate-800">$${(item.price * item.quantity).toFixed(2)}</span>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>

                                <div class="flex justify-end gap-3">
                                    <button class="px-6 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 font-bold text-sm text-slate-600 transition-all">Print Invoice</button>
                                    <button class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold text-sm transition-all shadow-lg shadow-blue-200">Process Order</button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        },

        rfq() {
            const rfqs = Data.rfqs;
            
            return `
                <div class="max-w-7xl mx-auto">
                    <div class="flex items-center justify-between mb-8">
                        <div>
                            <h1 class="text-3xl font-bold">RFQ Requests</h1>
                            <p class="text-slate-600">Respond to quote requests from business buyers</p>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <!-- RFQ List -->
                        <div class="lg:col-span-1 space-y-4">
                            ${rfqs.map((rfq, i) => `
                                <div class="glass-card p-5 rounded-2xl cursor-pointer hover:border-blue-400 border-2 ${i === 0 ? 'border-blue-500 bg-blue-50/50' : 'border-transparent'} transition-all">
                                    <div class="flex justify-between items-start mb-2">
                                        <span class="bg-white text-blue-600 text-xs px-2 py-1 rounded border border-blue-100 font-bold">RFQ #${1024 + i}</span>
                                        <span class="text-xs text-slate-400 font-medium">2h ago</span>
                                    </div>
                                    <h3 class="font-bold text-slate-800 mb-2">${rfq.title}</h3>
                                    <p class="text-sm text-slate-600 line-clamp-2 mb-3">${rfq.description}</p>
                                    <div class="flex items-center justify-between text-xs font-bold text-slate-500">
                                        <span>${rfq.quantity} units</span>
                                        <span>Budget: $${(rfq.quantity * 50).toLocaleString()}</span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>

                        <!-- RFQ Detail View -->
                        <div class="lg:col-span-2">
                            <div class="glass-card p-8 rounded-3xl sticky top-24">
                                <div class="flex justify-between items-start mb-6">
                                    <div>
                                        <h2 class="text-2xl font-bold mb-2">${rfqs[0].title}</h2>
                                        <div class="flex items-center gap-4 text-sm text-slate-500">
                                            <span class="flex items-center gap-1"><i data-lucide="building" class="w-4 h-4"></i> Tech Giant Inc.</span>
                                            <span class="flex items-center gap-1"><i data-lucide="map-pin" class="w-4 h-4"></i> New York, USA</span>
                                        </div>
                                    </div>
                                    <button class="p-2 hover:bg-slate-100 rounded-full transition-colors"><i data-lucide="more-horizontal" class="w-5 h-5"></i></button>
                                </div>

                                <div class="grid grid-cols-3 gap-4 mb-8">
                                    <div class="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                        <p class="text-xs text-slate-400 font-bold uppercase mb-1">Quantity</p>
                                        <p class="text-lg font-bold text-slate-800">${rfqs[0].quantity} Units</p>
                                    </div>
                                    <div class="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                        <p class="text-xs text-slate-400 font-bold uppercase mb-1">Target Price</p>
                                        <p class="text-lg font-bold text-slate-800">$45.00 / unit</p>
                                    </div>
                                    <div class="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                        <p class="text-xs text-slate-400 font-bold uppercase mb-1">Deadline</p>
                                        <p class="text-lg font-bold text-red-500">${rfqs[0].deadline}</p>
                                    </div>
                                </div>

                                <div class="mb-8">
                                    <h3 class="font-bold text-lg mb-3">Specifications</h3>
                                    <p class="text-slate-600 leading-relaxed mb-4">
                                        We are looking for high-quality components matching the specifications listed below. 
                                        Please ensure compliance with ISO standards. Needed by Q3 for our new product line launch.
                                    </p>
                                    <ul class="list-disc list-inside space-y-2 text-slate-600">
                                        <li>Material: High-grade Aluminum Alloy</li>
                                        <li>Finish: Matte Black Powder Coat</li>
                                        <li>Tolerance: ±0.05mm</li>
                                        <li>Packaging: Individual protective wrap</li>
                                    </ul>
                                </div>

                                <div class="border-t pt-6">
                                    <h3 class="font-bold text-lg mb-4">Submit Quote</h3>
                                    <div class="grid grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <label class="block text-xs font-bold text-slate-500 mb-1 pl-1">PRICE PER UNIT ($)</label>
                                            <input type="number" class="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-bold" placeholder="0.00">
                                        </div>
                                        <div>
                                            <label class="block text-xs font-bold text-slate-500 mb-1 pl-1">LEAD TIME (DAYS)</label>
                                            <input type="number" class="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-bold" placeholder="14">
                                        </div>
                                    </div>
                                    <textarea class="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 min-h-[100px] mb-4" placeholder="Add additional notes or terms..."></textarea>
                                    
                                    <button class="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-100">Send Quotation</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        },

        reports() {
            return `
                <div class="max-w-7xl mx-auto">
                    <h1 class="text-3xl font-bold mb-8">Analytics & Reports</h1>

                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        ${Components.StatCard('Total Sales', '$142,394', 'dollar-sign', 'green', 15)}
                        ${Components.StatCard('Avg Order Value', '$3,150', 'shopping-bag', 'blue', 8)}
                        ${Components.StatCard('Total Orders', '156', 'package', 'purple')}
                        ${Components.StatCard('Conversion Rate', '4.2%', 'activity', 'orange', -2)}
                    </div>

                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                        <div class="lg:col-span-2 glass-card p-6 rounded-2xl">
                            <h3 class="font-bold mb-6">Revenue Trend</h3>
                            <div class="h-64 flex items-end justify-between gap-2">
                                ${[35, 45, 30, 60, 75, 50, 65, 80, 70, 90, 85, 95].map(h => `
                                    <div class="w-full bg-blue-100 rounded-t-lg relative group h-full">
                                        <div class="absolute bottom-0 w-full bg-blue-500 rounded-t-lg transition-all group-hover:bg-blue-600" style="height: ${h}%"></div>
                                        <div class="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">$${h}k</div>
                                    </div>
                                `).join('')}
                            </div>
                            <div class="flex justify-between mt-4 text-xs text-slate-400 font-bold uppercase">
                                <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
                                <span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
                            </div>
                        </div>

                        <div class="glass-card p-6 rounded-2xl">
                            <h3 class="font-bold mb-6">Sales by Category</h3>
                            <div class="space-y-6">
                                ${[
                                    { label: 'Electronics', val: 75, color: 'blue' },
                                    { label: 'Accessories', val: 55, color: 'purple' },
                                    { label: 'Wearables', val: 35, color: 'green' },
                                    { label: 'Home Tech', val: 20, color: 'orange' }
                                ].map(item => `
                                    <div>
                                        <div class="flex justify-between text-sm font-bold mb-2">
                                            <span>${item.label}</span>
                                            <span>${item.val}%</span>
                                        </div>
                                        <div class="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                                            <div class="h-full bg-${item.color}-500 rounded-full" style="width: ${item.val}%"></div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>

                    <div class="glass-card p-6 rounded-2xl">
                        <h3 class="font-bold mb-6">Recent Transactions</h3>
                        <table class="w-full">
                            <thead>
                                <tr class="text-left text-xs font-bold text-slate-400 uppercase border-b border-slate-100">
                                    <th class="pb-4">Transaction ID</th>
                                    <th class="pb-4">Customer</th>
                                    <th class="pb-4">Date</th>
                                    <th class="pb-4">Amount</th>
                                    <th class="pb-4">Status</th>
                                </tr>
                            </thead>
                            <tbody class="text-sm">
                                ${Array(5).fill(0).map((_, i) => `
                                    <tr class="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                                        <td class="py-4 font-mono">TRX-${Math.random().toString(36).substr(2, 8).toUpperCase()}</td>
                                        <td class="py-4 font-bold">Client Company ${i + 1}</td>
                                        <td class="py-4 text-slate-500">Jan ${15 - i}, 2026</td>
                                        <td class="py-4 font-bold">$${(Math.random() * 5000).toFixed(2)}</td>
                                        <td class="py-4"><span class="text-green-600 font-bold text-xs bg-green-100 px-2 py-1 rounded-full">Completed</span></td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        }
    },

    // ==================== ADMIN PAGES ====================
    
    admin: {
        home() {
            return `
                <div class="space-y-10">
                    <!-- Hero Section -->
                    <div class="glass-card bg-gradient-to-r from-slate-800 to-slate-900 rounded-[2rem] p-12 text-white flex flex-col md:flex-row justify-between items-center">
                        <div class="max-w-lg mb-6 md:mb-0">
                            <h1 class="text-5xl font-bold mb-4">Admin Console</h1>
                            <p class="mb-6 opacity-90 text-lg">Oversee platform operations, manage users, and monitor system performance.</p>
                            <div class="flex gap-4">
                                <button onclick="Router.navigate('/admin/users')" class="bg-white text-slate-900 px-6 py-3 rounded-full font-bold hover:shadow-xl transition-all">Manage Users</button>
                                <button onclick="Router.navigate('/admin/reports')" class="border-2 border-white px-6 py-3 rounded-full font-bold hover:bg-white/10 transition-all">System Reports</button>
                            </div>
                        </div>
                        <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400" class="h-64 rounded-2xl shadow-2xl opacity-80">
                    </div>

                    <!-- Platform Stats -->
                    <div class="grid grid-cols-4 gap-6">
                        ${Components.StatCard('Total Revenue', '$2.4M', 'dollar-sign', 'green', 18)}
                        ${Components.StatCard('Total Users', '12,450', 'users', 'blue', 5)}
                        ${Components.StatCard('Active Orders', '342', 'shopping-cart', 'orange')}
                        ${Components.StatCard('Server Load', '24%', 'server', 'purple')}
                    </div>

                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <!-- Recent Activity -->
                        <div class="glass-card p-6 rounded-2xl">
                            <div class="flex justify-between items-center mb-6">
                                <h3 class="font-bold flex items-center gap-2">
                                    <i data-lucide="activity" class="w-5 h-5 text-blue-600"></i>
                                    Recent System Activity
                                </h3>
                                <button class="text-xs font-bold text-blue-600 hover:underline">View Log</button>
                            </div>
                            <div class="space-y-4">
                                ${Array(5).fill(0).map((_, i) => `
                                    <div class="flex items-start gap-4 p-3 hover:bg-slate-50 rounded-xl transition-all">
                                        <div class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                                            <i data-lucide="${['user-plus', 'shopping-bag', 'alert-circle', 'settings', 'dollar-sign'][i]}" class="w-5 h-5 text-slate-500"></i>
                                        </div>
                                        <div class="flex-1">
                                            <p class="text-sm font-bold text-slate-800">
                                                ${['New User Registration', 'Large Order Placed', 'Stock Warning', 'System Update', 'Payment Processed'][i]}
                                            </p>
                                            <p class="text-xs text-slate-500">
                                                ${['John Doe registered as Business', 'Order #1234 over $5k', 'iPhone 15 Low Stock', 'v2.4.1 Deployed', '$1,200 from Stripe'][i]}
                                            </p>
                                        </div>
                                        <span class="text-xs text-slate-400 font-bold">${i * 15 + 2}m ago</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        <!-- User Distribution -->
                        <div class="glass-card p-6 rounded-2xl">
                            <h3 class="font-bold mb-6 flex items-center gap-2">
                                <i data-lucide="pie-chart" class="w-5 h-5 text-purple-600"></i>
                                User Distribution
                            </h3>
                            <div class="space-y-6">
                                ${[
                                    { label: 'Consumers', val: 65, color: 'blue', count: '8,092' },
                                    { label: 'Business Accounts', val: 20, color: 'purple', count: '2,490' },
                                    { label: 'Dropshippers', val: 10, color: 'green', count: '1,245' },
                                    { label: 'Suppliers', val: 5, color: 'orange', count: '623' }
                                ].map(item => `
                                    <div>
                                        <div class="flex justify-between text-sm font-bold mb-2">
                                            <span>${item.label}</span>
                                            <span class="text-slate-500">${item.count}</span>
                                        </div>
                                        <div class="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                                            <div class="h-full bg-${item.color}-500 rounded-full" style="width: ${item.val}%"></div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                            <div class="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-center gap-4">
                                <i data-lucide="info" class="w-6 h-6 text-blue-600"></i>
                                <div class="flex-1">
                                    <p class="text-sm font-bold text-blue-800">Growth Insight</p>
                                    <p class="text-xs text-blue-600">Business accounts grew by 15% this month, outpacing consumers.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        },

        users() {
            return `
                <div class="max-w-7xl mx-auto">
                    <div class="flex items-center justify-between mb-8">
                        <div>
                            <h1 class="text-3xl font-bold">User Management</h1>
                            <p class="text-slate-600">Manage accounts across all platform roles</p>
                        </div>
                        <div class="flex gap-2">
                            <div class="relative">
                                <i data-lucide="search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"></i>
                                <input type="text" placeholder="Search users..." class="pl-10 pr-4 py-2 border border-slate-200 rounded-xl outline-none focus:border-blue-500 w-64">
                            </div>
                            <button class="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center gap-2">
                                <i data-lucide="user-plus" class="w-4 h-4"></i> Add User
                            </button>
                        </div>
                    </div>

                    <div class="glass-card rounded-2xl overflow-hidden">
                        <div class="border-b border-slate-100 bg-slate-50/50 p-2 flex gap-2 overflow-x-auto">
                            <button class="px-4 py-2 bg-white shadow-sm rounded-lg text-sm font-bold text-blue-600 border border-slate-200">All Users</button>
                            <button class="px-4 py-2 hover:bg-slate-100 rounded-lg text-sm font-medium text-slate-600">Consumers</button>
                            <button class="px-4 py-2 hover:bg-slate-100 rounded-lg text-sm font-medium text-slate-600">Business</button>
                            <button class="px-4 py-2 hover:bg-slate-100 rounded-lg text-sm font-medium text-slate-600">Dropshippers</button>
                            <button class="px-4 py-2 hover:bg-slate-100 rounded-lg text-sm font-medium text-slate-600">Suppliers</button>
                            <button class="px-4 py-2 hover:bg-slate-100 rounded-lg text-sm font-medium text-slate-600">Admins</button>
                        </div>
                        
                        <table class="w-full">
                            <thead class="bg-slate-50">
                                <tr>
                                    <th class="text-left p-6 text-sm text-slate-500 font-bold uppercase tracking-wider">User</th>
                                    <th class="text-left p-6 text-sm text-slate-500 font-bold uppercase tracking-wider">Role</th>
                                    <th class="text-left p-6 text-sm text-slate-500 font-bold uppercase tracking-wider">Status</th>
                                    <th class="text-right p-6 text-sm text-slate-500 font-bold uppercase tracking-wider">Spent</th>
                                    <th class="text-center p-6 text-sm text-slate-500 font-bold uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-100">
                                ${Array(8).fill(0).map((_, i) => {
                                    const roles = ['consumer', 'business', 'dropshipper', 'supplier', 'admin'];
                                    const role = roles[Math.floor(Math.random() * roles.length)];
                                    const status = Math.random() > 0.1 ? 'Active' : 'Suspended';
                                    
                                    return `
                                    <tr class="hover:bg-slate-50/80 transition-colors group">
                                        <td class="p-6">
                                            <div class="flex items-center gap-4">
                                                <div class="w-10 h-10 rounded-full bg-${['blue','purple','green','orange','red'][Math.floor(Math.random()*5)]}-100 flex items-center justify-center font-bold text-slate-700">
                                                    ${String.fromCharCode(65 + i)}
                                                </div>
                                                <div>
                                                    <p class="font-bold text-slate-800">User ${i + 1}</p>
                                                    <p class="text-xs text-slate-400">user${i+1}@example.com</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td class="p-6">
                                            <span class="px-3 py-1 rounded-full text-xs font-bold uppercase border bg-white text-slate-600">
                                                ${role}
                                            </span>
                                        </td>
                                        <td class="p-6">
                                            <span class="text-xs font-bold flex items-center gap-1 ${status === 'Active' ? 'text-green-600' : 'text-red-500'}">
                                                <div class="w-2 h-2 rounded-full ${status === 'Active' ? 'bg-green-500' : 'bg-red-500'}"></div>
                                                ${status}
                                            </span>
                                        </td>
                                        <td class="p-6 text-right font-medium text-slate-600">$${(Math.random() * 5000).toFixed(2)}</td>
                                        <td class="p-6 text-center">
                                            <button class="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-blue-600 transition-colors">
                                                <i data-lucide="more-horizontal" class="w-5 h-5"></i>
                                            </button>
                                        </td>
                                    </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                        
                        <div class="p-6 border-t border-slate-100 flex justify-between items-center">
                            <p class="text-sm text-slate-500">Showing 8 of 12,450 users</p>
                            <div class="flex gap-2">
                                <button class="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-sm font-bold">Previous</button>
                                <button class="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-sm font-bold">Next</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        },

        marketing() {
            return `
                <div class="max-w-7xl mx-auto">
                    <h1 class="text-3xl font-bold mb-8">Marketing & Promotions</h1>

                    <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                        <div class="md:col-span-2 glass-card p-6 rounded-2xl">
                            <div class="flex justify-between items-center mb-6">
                                <h3 class="font-bold text-lg">Active Campaigns</h3>
                                <button class="text-blue-600 font-bold text-sm hover:underline">+ Create New</button>
                            </div>
                            <div class="space-y-4">
                                ${['Summer Sale 2026', 'New Customer Welcome', 'Black Friday Early Access'].map(campaign => `
                                    <div class="border border-slate-100 rounded-xl p-4 flex items-center justify-between hover:shadow-md transition-all bg-white">
                                        <div class="flex items-center gap-4">
                                            <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                                <i data-lucide="megaphone" class="w-6 h-6 text-purple-600"></i>
                                            </div>
                                            <div>
                                                <h4 class="font-bold text-slate-800">${campaign}</h4>
                                                <p class="text-xs text-slate-400">Ends in 5 days • 12k reach</p>
                                            </div>
                                        </div>
                                        <div class="text-right">
                                            <div class="flex items-center gap-2 mb-1">
                                                <span class="text-xs font-bold text-slate-500">ROI</span>
                                                <span class="text-sm font-bold text-green-600">450%</span>
                                            </div>
                                            <div class="w-24 bg-slate-100 rounded-full h-1.5 ml-auto">
                                                <div class="bg-green-500 h-1.5 rounded-full" style="width: 75%"></div>
                                            </div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        <div class="glass-card p-6 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
                            <h3 class="font-bold text-lg mb-4">Quick Stats</h3>
                            <div class="space-y-6">
                                <div>
                                    <p class="text-blue-200 text-sm">Total Campaign Reach</p>
                                    <p class="text-3xl font-bold">1.2M</p>
                                </div>
                                <div>
                                    <p class="text-blue-200 text-sm">Conversion Rate</p>
                                    <p class="text-3xl font-bold">2.4%</p>
                                </div>
                                <div>
                                    <p class="text-blue-200 text-sm">Marketing Spend</p>
                                    <p class="text-3xl font-bold">$45,000</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="glass-card p-6 rounded-2xl">
                        <div class="flex justify-between items-center mb-6">
                            <h3 class="font-bold text-lg">Coupons & Vouchers</h3>
                            <button class="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg">Add Coupon</button>
                        </div>
                        <table class="w-full text-sm">
                            <thead class="bg-slate-50 text-slate-500">
                                <tr>
                                    <th class="text-left p-4 rounded-l-lg">Code</th>
                                    <th class="text-left p-4">Discount</th>
                                    <th class="text-left p-4">Usage</th>
                                    <th class="text-left p-4">Status</th>
                                    <th class="text-right p-4 rounded-r-lg">Expiry</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${[
                                    { code: 'WELCOME10', disc: '10%', use: '1,240', status: 'Active', exp: 'Never' },
                                    { code: 'SUMMER25', disc: '25%', use: '450', status: 'Scheduled', exp: 'Jul 30' },
                                    { code: 'FLASH50', disc: '$50 Off', use: '89', status: 'Expired', exp: 'Jan 10' },
                                    { code: 'SHIPFREE', disc: 'Free Ship', use: '3,102', status: 'Active', exp: 'Dec 31' }
                                ].map(c => `
                                    <tr class="border-b border-slate-50 last:border-0">
                                        <td class="p-4 font-mono font-bold text-slate-800">${c.code}</td>
                                        <td class="p-4">${c.disc}</td>
                                        <td class="p-4 text-slate-600">${c.use}</td>
                                        <td class="p-4">
                                            <span class="px-2 py-1 rounded text-xs font-bold ${c.status === 'Active' ? 'bg-green-100 text-green-600' : c.status === 'expired' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}">
                                                ${c.status}
                                            </span>
                                        </td>
                                        <td class="p-4 text-right text-slate-500">${c.exp}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        },

        settings() {
            return `
                <div class="max-w-4xl mx-auto">
                    <h1 class="text-3xl font-bold mb-8">Platform Settings</h1>
                    
                    <div class="flex gap-2 p-1 bg-white rounded-xl shadow-sm border border-slate-200 mb-8 w-fit">
                        <button class="px-4 py-2 bg-slate-900 text-white rounded-lg font-bold shadow-md">General</button>
                        <button class="px-4 py-2 text-slate-500 hover:bg-slate-50 rounded-lg font-bold transition-all">Payment</button>
                        <button class="px-4 py-2 text-slate-500 hover:bg-slate-50 rounded-lg font-bold transition-all">Security</button>
                        <button class="px-4 py-2 text-slate-500 hover:bg-slate-50 rounded-lg font-bold transition-all">Notifications</button>
                    </div>

                    <div class="space-y-6">
                        <!-- General Info -->
                        <div class="glass-card p-8 rounded-2xl">
                            <h3 class="font-bold text-xl mb-6 border-b pb-4">General Information</h3>
                            <div class="grid grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label class="block text-sm font-bold text-slate-700 mb-2">Platform Name</label>
                                    <input type="text" value="Xperiencestore" class="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500">
                                </div>
                                <div>
                                    <label class="block text-sm font-bold text-slate-700 mb-2">Support Email</label>
                                    <input type="email" value="support@xperiencestore.com" class="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500">
                                </div>
                            </div>
                            <div>
                                <label class="block text-sm font-bold text-slate-700 mb-2">Platform Description</label>
                                <textarea class="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 h-24">The ultimate multi-vendor e-commerce platform connecting consumers, businesses, and suppliers.</textarea>
                            </div>
                        </div>

                        <!-- Maintenance Mode -->
                        <div class="glass-card p-8 rounded-2xl flex items-center justify-between border-l-4 border-orange-500">
                            <div>
                                <h3 class="font-bold text-lg">Maintenance Mode</h3>
                                <p class="text-slate-500 text-sm">Take the site offline for updates. Only admins can access.</p>
                            </div>
                            <label class="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" value="" class="sr-only peer">
                                <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                            </label>
                        </div>

                        <!-- Features -->
                        <div class="glass-card p-8 rounded-2xl">
                            <h3 class="font-bold text-xl mb-6 border-b pb-4">Feature Toggles</h3>
                            <div class="space-y-4">
                                ${['User Registration', 'Vendor Signup', 'Reviews System', 'Live Chat Support'].map(f => `
                                    <div class="flex items-center justify-between">
                                        <span class="font-bold text-slate-700">${f}</span>
                                        <label class="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" value="" class="sr-only peer" checked>
                                            <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        
                        <div class="flex justify-end pt-4">
                            <button class="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all">Save Changes</button>
                        </div>
                    </div>
                </div>
            `;
        }
    }
};

// Make Pages globally available
window.Pages = Pages;
