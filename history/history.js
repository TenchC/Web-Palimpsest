document.addEventListener('DOMContentLoaded', () => {
    const historyContainer = document.getElementById('historyContainer');

    chrome.storage.local.get(['visitedUrls'], (result) => {
        const urls = result.visitedUrls || [];
        
        if (urls.length === 0) {
            historyContainer.textContent = 'Your palimpsest is empty.';
        } else {
            urls.forEach((entry) => {
                const contentElement = document.createElement('div');
                contentElement.className = 'entry';
                
                if (entry.content.type === 'text') {
                    contentElement.innerHTML = `<p>${entry.content.content}</p>`;
                } else if (entry.content.type === 'image') {
                    contentElement.innerHTML = `<img src="${entry.content.content}" alt="${entry.content.alt}" style="max-width: 100%; max-height: 200px;">`;
                }
                
                // Calculate z-index based on the entry's position in the array
                // Newer entries (at the end of the array) will have higher z-index
                const zIndex = urls.indexOf(entry);
                contentElement.style.zIndex = zIndex;
                contentElement.style.left = `${entry.position.x}vw`;
                contentElement.style.top = `${entry.position.y}vh`;
                
                document.body.appendChild(contentElement);
            });
        }
    });
});
