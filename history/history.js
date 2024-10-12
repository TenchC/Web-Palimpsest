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

    chrome.storage.local.get(['visitedUrls'], (result) => {
        const urls = result.visitedUrls || [];
        
        if (urls.length === 0) {
            historyContainer.textContent = 'Your palimpsest is empty.';
        } else {
            urls.forEach((entry, index) => {
                const contentElement = document.createElement('div');
                contentElement.className = 'entry';
                
                // Add margins and adjust sizing
                contentElement.style.margin = '10px';
                contentElement.style.padding = '10px';
                contentElement.style.boxSizing = 'border-box';
                contentElement.style.overflow = 'auto';
                contentElement.style.maxWidth = '80vw';
                contentElement.style.maxHeight = '80vh';
                contentElement.style.wordWrap = 'break-word';
                contentElement.style.position = 'absolute';
                
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
                
                contentElement.addEventListener('mouseleave', () => {
                    contentElement.classList.remove('entry-hover');
                });
                
                document.body.appendChild(contentElement);
            });
        }
    });
});
