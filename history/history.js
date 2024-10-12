document.addEventListener('DOMContentLoaded', () => {
    const historyContainer = document.getElementById('historyContainer');

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
                
                if (entry.content.type === 'text') {
                    contentElement.style.width = '200px'; // Fixed width for text entries
                    contentElement.innerHTML = `<p style="margin: 0;">${entry.content.content}</p>`;
                } else if (entry.content.type === 'image') {
                    contentElement.style.width = 'auto'; // Allow width to adjust for images
                    contentElement.style.maxWidth = '200px'; // Maximum width for images
                    contentElement.innerHTML = `<img src="${entry.content.content}" alt="${entry.content.alt}" style="width: 100%; height: auto; max-height: 100px; object-fit: contain;">`;
                }
                
                // Add URL text element (initially hidden)
                const urlElement = document.createElement('div');
                urlElement.textContent = entry.url;
                urlElement.style.color = 'red';
                urlElement.style.position = 'absolute';
                urlElement.style.bottom = '0';
                urlElement.style.left = '0';
                urlElement.style.right = '0';
                urlElement.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
                urlElement.style.padding = '5px';
                urlElement.style.display = 'none';
                contentElement.appendChild(urlElement);
                
                // Calculate position within viewport
                const maxX = 95; // 95vw to leave some margin
                const maxY = 90; // 90vh to leave some margin
                const x = Math.max(0, Math.min(entry.position.x, maxX));
                const y = Math.max(0, Math.min(entry.position.y, maxY));
                
                contentElement.style.left = `${x}vw`;
                contentElement.style.top = `${y}vh`;
                contentElement.style.zIndex = index;
                contentElement.style.transition = 'all 0.3s ease';
                
                // Add hover effects
                contentElement.addEventListener('mouseenter', () => {
                    contentElement.style.zIndex = urls.length; // Bring to front
                    contentElement.style.backgroundColor = 'white'; // White background
                    contentElement.style.transform = 'scale(1.2)'; // 20% larger
                    contentElement.style.border = '1px solid black'; // Add black border
                    urlElement.style.display = 'block'; // Show URL text
                });
                
                contentElement.addEventListener('mouseleave', () => {
                    contentElement.style.zIndex = index; // Restore original z-index
                    contentElement.style.backgroundColor = ''; // Remove white background
                    contentElement.style.transform = 'scale(1)'; // Return to original size
                    contentElement.style.border = 'none'; // Remove border
                    urlElement.style.display = 'none'; // Hide URL text
                });
                
                document.body.appendChild(contentElement);
            });
        }
    });
});
