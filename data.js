export const Data = {
    products: [],
    categories: [
        { name: 'Electronics', slug: 'electronics', icon: 'smartphone', count: 120 },
        { name: 'Fashion', slug: 'fashion', icon: 'shirt', count: 85 },
        { name: 'Home & Garden', slug: 'home-garden', icon: 'home', count: 45 },
        { name: 'Beauty', slug: 'beauty', icon: 'sparkles', count: 30 },
        { name: 'Automotive', slug: 'automotive', icon: 'car', count: 25 },
        { name: 'Sports', slug: 'sports', icon: 'activity', count: 40 }
    ],
    suppliers: [],
    orders: [],
    // Helpers
    init: async () => {
        // Fetch static data or initial load
        try {
           // We will rely on State loading for products
        } catch(e) { console.error(e); }
    }
};
