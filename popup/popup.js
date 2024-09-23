document.addEventListener('DOMContentLoaded', () => {
    const urlCount = document.getElementById('urlCount');
    const recentUrl = document.getElementById('recentUrl');
    const randomContent = document.getElementById('randomContent');
    const clearButton = document.getElementById('clearButton');
    const showHistoryButton = document.getElementById('showHistoryButton');
    const maxUrlsInput = document.getElementById('maxUrls');
    const saveMaxUrlsButton = document.getElementById('saveMaxUrls');

    function displayUrlInfo() {
        chrome.storage.local.get(['visitedUrls', 'maxUrls'], (result) => {
            const urls = result.visitedUrls || [];
            const maxUrls = result.maxUrls || 100;
            
            if (urlCount) urlCount.textContent = urls.length;
            if (maxUrlsInput) maxUrlsInput.value = maxUrls;
            
            if (urls.length > 0) {
                const lastVisit = urls[urls.length - 1];
                if (recentUrl) recentUrl.textContent = lastVisit.url;
                if (randomContent) {
                    if (lastVisit.content.type === 'text') {
                        randomContent.textContent = lastVisit.content.content;
                    } else if (lastVisit.content.type === 'image') {
                        randomContent.innerHTML = `<img src="${lastVisit.content.content}" alt="${lastVisit.content.alt}" style="max-width: 100%; max-height: 200px;">`;
                    }
                }
            } else {
                if (recentUrl) recentUrl.textContent = 'No URLs visited yet';
                if (randomContent) randomContent.textContent = 'N/A';
            }
        });
    }

    if (clearButton) {
        clearButton.addEventListener('click', () => {
            chrome.storage.local.set({ visitedUrls: [] }, () => {
                console.log('URLs cleared');
                displayUrlInfo();
            });
        });
    }

    if (saveMaxUrlsButton) {
        saveMaxUrlsButton.addEventListener('click', () => {
            const newMaxUrls = parseInt(maxUrlsInput.value, 10);
            if (newMaxUrls > 0) {
                chrome.storage.local.set({ maxUrls: newMaxUrls }, () => {
                    console.log('Max URLs updated:', newMaxUrls);
                    // Trim the existing URLs if necessary
                    chrome.storage.local.get(['visitedUrls'], (result) => {
                        let urls = result.visitedUrls || [];
                        console.log('Current URLs:', urls.length);
                        while (urls.length > newMaxUrls) {
                            urls.shift(); // Remove the oldest URL
                        }
                        console.log('Trimmed URLs:', urls.length);
                        chrome.storage.local.set({ visitedUrls: urls }, () => {
                            console.log('URLs trimmed to new maximum');
                            displayUrlInfo();
                        });
                    });
                });
            } else {
                alert('Please enter a valid number greater than 0');
            }
        });
    }

    displayUrlInfo();
});
