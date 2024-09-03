document.addEventListener('DOMContentLoaded', () => {
    const historyContainer = document.getElementById('historyContainer');

    chrome.storage.local.get(['visitedUrls'], (result) => {
        const urls = result.visitedUrls || [];
        
        if (urls.length === 0) {
            historyContainer.textContent = 'No URLs visited yet.';
        } else {
            urls.forEach((entry, index) => {
                const entryDiv = document.createElement('div');
                entryDiv.className = 'entry';
                let contentHtml = '';
                if (entry.content.type === 'text') {
                    contentHtml = `<p>${entry.content.content}</p>`;
                } else if (entry.content.type === 'image') {
                    contentHtml = `<img src="${entry.content.content}" alt="${entry.content.alt}" style="max-width: 100%; max-height: 200px;">`;
                }
                entryDiv.innerHTML = `
                    <p><span class="url">${index + 1}. ${entry.url}</span></p>
                    ${contentHtml}
                `;
                historyContainer.appendChild(entryDiv);
            });
        }
    });
});
