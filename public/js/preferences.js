// Handle user preferences with localStorage
const Preferences = {
    // Keys for localStorage
    keys: {
        theme: 'resume_magic_theme',
        language: 'resume_magic_language',
        format: 'resume_magic_format'
    },

    // Save preferences to localStorage
    save: function(theme, language, format) {
        if (theme) localStorage.setItem(this.keys.theme, theme);
        if (language) localStorage.setItem(this.keys.language, language);
        if (format) localStorage.setItem(this.keys.format, format);
    },

    // Load preferences from localStorage
    load: function() {
        return {
            theme: localStorage.getItem(this.keys.theme),
            language: localStorage.getItem(this.keys.language),
            format: localStorage.getItem(this.keys.format)
        };
    },

    // Apply preferences to current URL
    apply: function() {
        const prefs = this.load();
        const currentUrl = new URL(window.location.href);
        const pathParts = currentUrl.pathname.split('/');
        
        // Handle format in URL path
        if (prefs.format && pathParts.length >= 3) {
            if (prefs.format === 'modern' && pathParts[3] !== 'modern') {
                pathParts[3] = 'modern';
            } else if (prefs.format === 'mit' && pathParts[3] === 'modern') {
                pathParts.splice(3, 1);
            }
            currentUrl.pathname = pathParts.join('/');
        }

        // Add query parameters
        if (prefs.theme) currentUrl.searchParams.set('theme', prefs.theme);
        if (prefs.language) currentUrl.searchParams.set('lang', prefs.language);

        // Update URL if different from current
        if (window.location.href !== currentUrl.href) {
            window.location.href = currentUrl.href;
        }
    },

    // Update preferences from current URL
    updateFromUrl: function() {
        const currentUrl = new URL(window.location.href);
        const pathParts = currentUrl.pathname.split('/');
        
        // Get format from URL path
        const format = pathParts[3] === 'modern' ? 'modern' : 'mit';
        
        // Get theme and language from query parameters
        const theme = currentUrl.searchParams.get('theme');
        const language = currentUrl.searchParams.get('lang');

        this.save(theme, language, format);
    }
};

// Update preferences when URL changes
window.addEventListener('load', () => {
    Preferences.updateFromUrl();
});

// Add click handlers for theme and language dropdowns
document.addEventListener('DOMContentLoaded', () => {
    // Theme dropdown handler
    document.querySelectorAll('.theme-select').forEach(link => {
        link.addEventListener('click', (e) => {
            const theme = e.target.dataset.theme;
            Preferences.save(theme, null, null);
        });
    });

    // Language dropdown handler
    document.querySelectorAll('.lang-select').forEach(link => {
        link.addEventListener('click', (e) => {
            const lang = e.target.dataset.lang;
            Preferences.save(null, lang, null);
        });
    });

    // Format handler
    document.querySelectorAll('.format-select').forEach(link => {
        link.addEventListener('click', (e) => {
            const format = e.target.dataset.format;
            Preferences.save(null, null, format);
        });
    });

    // Apply saved preferences if on homepage or no query params
    const currentUrl = new URL(window.location.href);
    if (currentUrl.pathname === '/' || (!currentUrl.searchParams.get('theme') && !currentUrl.searchParams.get('lang'))) {
        Preferences.apply();
    }
});
