document.addEventListener('DOMContentLoaded', () => {
    const historyContainer = document.getElementById('historyContainer');

    // Function to clean and tidy URLs
    function tidyUrl(url) {
        try {
            const urlObj = new URL(url);
            let domain = urlObj.hostname;
            
            // Remove 'www.' if present
            if (domain.startsWith('www.')) {
                domain = domain.slice(4);
            }
            
            // Split the domain and keep only the last two parts (or one if it's a top-level domain)
            const parts = domain.split('.');
            if (parts.length > 2) {
                domain = parts.slice(-2).join('.');
            }
            
            return domain;
        } catch (e) {
            // If URL parsing fails, return the original URL
            return url;
        }
    }

    // Function to apply display options
    function applyDisplayOptions(options) {
        document.documentElement.style.setProperty('--hover-background-color', options.backgroundColor);
        document.documentElement.style.setProperty('--url-color', options.urlColor);
        document.documentElement.style.setProperty('--url-background-color', options.urlBackgroundColor);
        document.body.style.color = options.textColor;
        document.body.style.fontSize = `${options.fontSize}px`;

        const entries = document.querySelectorAll('.entry');
        entries.forEach(entry => {
            entry.style.color = options.textColor;
            entry.style.fontSize = `${options.fontSize}px`;
            const urlElement = entry.querySelector('.entry-url');
            if (urlElement) {
                urlElement.style.color = options.urlColor;
                urlElement.style.backgroundColor = options.urlBackgroundColor;
            }
        });
    }

    // Load display options and apply them
    function loadAndApplyOptions() {
        chrome.storage.local.get(['backgroundColor', 'textColor', 'fontSize', 'urlColor', 'urlBackgroundColor'], function(items) {
            const options = {
                backgroundColor: items.backgroundColor || 'rgba(255, 255, 255, 1)',
                textColor: items.textColor || '#000000',
                fontSize: items.fontSize || 14,
                urlColor: items.urlColor || '#FF0000',
                urlBackgroundColor: items.urlBackgroundColor || '#FFFFFF'
            };
            applyDisplayOptions(options);
        });
    }

    // Initial load of options
    loadAndApplyOptions();

    chrome.storage.local.get(['visitedUrls'], (result) => {
        const urls = result.visitedUrls || [];
        
        if (urls.length === 0) {
            historyContainer.textContent = 'Your palimpsest is empty.';
        } else {
            urls.forEach((entry, index) => {
                const contentElement = document.createElement('div');
                contentElement.className = 'entry';
                
                // Add URL text element (initially hidden)
                const urlElement = document.createElement('a');
                urlElement.href = entry.url;
                urlElement.textContent = tidyUrl(entry.url);
                urlElement.className = 'entry-url';
                urlElement.target = '_blank'; // Open link in new tab
                contentElement.appendChild(urlElement);
                
                // Create a wrapper for the content
                const contentWrapper = document.createElement('div');
                contentWrapper.className = 'entry-content';
                
                if (entry.content.type === 'text') {
                    contentWrapper.innerHTML = `<p>${entry.content.content}</p>`;
                } else if (entry.content.type === 'image') {
                    contentWrapper.innerHTML = `<img src="${entry.content.content}" alt="${entry.content.alt}">`;
                }
                
                contentElement.appendChild(contentWrapper);
                
                // Calculate position within viewport
                const maxX = 95; // 95vw to leave some margin
                const maxY = 90; // 90vh to leave some margin
                const x = Math.max(0, Math.min(entry.position.x, maxX));
                const y = Math.max(0, Math.min(entry.position.y, maxY));
                
                contentElement.style.left = `${x}vw`;
                contentElement.style.top = `${y}vh`;
                contentElement.style.zIndex = index;
                
                // Add hover effects
                contentElement.addEventListener('mouseenter', () => {
                    contentElement.classList.add('entry-hover');
                });
                
                // contentElement.addEventListener('mouseleave', () => {
                //     contentElement.classList.remove('entry-hover');
                // });
                
                // Apply display options to the new element
                chrome.storage.local.get(['backgroundOpacity', 'textColor', 'fontSize'], function(items) {
                    contentElement.style.backgroundColor = `rgba(255, 255, 255, ${items.backgroundOpacity || 0.5})`;
                    contentElement.style.color = items.textColor || '#000000';
                    contentElement.style.fontSize = `${items.fontSize || 14}px`;
                });
                
                document.body.appendChild(contentElement);
            });
        }
    });

    // Listen for changes in storage and reapply styles
    chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace === 'local') {
            loadAndApplyOptions();
        }
    });
});
