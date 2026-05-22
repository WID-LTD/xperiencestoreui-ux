/**
 * seo.js - Dynamic SEO Engine
 * Handles injecting and updating meta tags for single page application routing
 */

export const SEO = {
    // Default fallback values
    defaultTitle: 'Xperiencestore | Unified eCommerce System',
    defaultDesc: 'The ultimate Unified E-commerce System (UES) built by WID LTD. Explore a seamless B2C, B2B, Dropshipping, and Supplier global marketplace.',
    defaultKeywords: 'WID LTD, Ike Wisdom Okemsinachi, UES, Unified E-commerce, B2B, B2C, Dropshipping',
    defaultImage: '/assets/logo.png',

    init() {
        console.log('[SEO Engine] Initialized');
        // Ensure default tags exist in DOM, if not create them
        this._ensureMeta('description', this.defaultDesc);
        this._ensureMeta('keywords', this.defaultKeywords, true);
        this._ensureMeta('og:title', this.defaultTitle, true);
        this._ensureMeta('og:description', this.defaultDesc, true);
        this._ensureMeta('og:image', window.location.origin + this.defaultImage, true);
        this._ensureMeta('og:type', 'website', true);
        this._ensureMeta('twitter:card', 'summary_large_image');
        this._ensureMeta('twitter:title', this.defaultTitle);
        this._ensureMeta('twitter:description', this.defaultDesc);
        this._ensureMeta('twitter:image', window.location.origin + this.defaultImage);
    },

    updateMeta(title, desc, keywords, image, type = 'website') {
        const fullTitle = title ? `${title} - Xperiencestore` : this.defaultTitle;
        const description = desc || this.defaultDesc;
        const keys = keywords || this.defaultKeywords;
        const img = image || (window.location.origin + this.defaultImage);

        document.title = fullTitle;
        
        this._setMeta('description', description);
        this._setMeta('keywords', keys, true);
        
        // Open Graph
        this._setMeta('og:title', fullTitle, true);
        this._setMeta('og:description', description, true);
        this._setMeta('og:image', img, true);
        this._setMeta('og:type', type, true);
        this._setMeta('og:url', window.location.href, true);

        // Twitter
        this._setMeta('twitter:title', fullTitle);
        this._setMeta('twitter:description', description);
        this._setMeta('twitter:image', img);
        
        // Canonical (useful for crawlers to know the true URL despite query params)
        this._setCanonical(window.location.href.split('?')[0]);
    },

    // Used specifically for product pages
    updateProductMeta(product) {
        if (!product) return this.updateMeta();
        
        const title = product.name;
        const desc = product.description ? product.description.substring(0, 160) : `Buy ${product.name} on Xperiencestore.`;
        const keywords = `${product.category}, ${product.name}, buy online, UES`;
        
        // Find best image
        let img = this.defaultImage;
        if (product.images && product.images.length > 0) {
            img = product.images[0];
        } else if (product.image) {
            img = product.image; // fallback
        }

        // If img is a relative path but we use a full URL in SEO, ensure it is absolute
        if (img && img.startsWith('/')) {
            img = window.location.origin + img;
        }

        this.updateMeta(title, desc, keywords, img, 'product');
    },

    // Internal helper to ensure meta tag exists
    _ensureMeta(nameOrProperty, content, isProperty = false) {
        const attr = isProperty ? 'property' : 'name';
        let element = document.querySelector(`meta[${attr}="${nameOrProperty}"]`);
        if (!element) {
            element = document.createElement('meta');
            element.setAttribute(attr, nameOrProperty);
            element.setAttribute('content', content);
            document.head.appendChild(element);
        }
    },

    // Internal helper to set meta content
    _setMeta(nameOrProperty, content, isProperty = false) {
        const attr = isProperty ? 'property' : 'name';
        const element = document.querySelector(`meta[${attr}="${nameOrProperty}"]`);
        if (element) {
            element.setAttribute('content', content);
        } else {
            this._ensureMeta(nameOrProperty, content, isProperty);
        }
    },
    
    _setCanonical(url) {
        let link = document.querySelector('link[rel="canonical"]');
        if (!link) {
            link = document.createElement('link');
            link.setAttribute('rel', 'canonical');
            document.head.appendChild(link);
        }
        link.setAttribute('href', url);
    }
};
