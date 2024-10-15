//check if element is visible
function isElementVisible(element) {
    return !!(element.offsetWidth || element.offsetHeight || element.getClientRects().length);
}

function getRandomContent() {
    return new Promise((resolve) => {
        chrome.storage.local.get(['artifactWeight'], (result) => {
            const artifactWeight = result.artifactWeight !== undefined ? result.artifactWeight : 50;
            const imageThreshold = (100 - artifactWeight) / 100;
            
            if (Math.random() < imageThreshold) {
                content = getRandomImage();
                if (content.content === "No suitable image found on this page.") {
                    content = getRandomText();
                }
            } else {
                content = getRandomText();
                if (content.content === "No suitable text found on this page.") {
                    content = getRandomImage();
                }
            }

            if (content.content === "No suitable text found on this page." || 
                content.content === "No suitable image found on this page.") {
                resolve(null);
            } else {
                // Add red border to the selected content
                if (content.element) {
                    content.element.style.border = '2px solid red';
                }
                resolve(content);
            }
        });
    });
}

//get random text
function getRandomText() {
    const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        {
            //only accept nodes that are visible, not in script, style, no script, iframe, and are longer than 50 characters
            acceptNode: function(node) {
                if (node.parentElement &&
                    isElementVisible(node.parentElement) &&
                    !['SCRIPT', 'STYLE', 'NOSCRIPT', 'IFRAME'].includes(node.parentElement.tagName) &&
                    node.textContent.trim().length > 50) {
                    return NodeFilter.FILTER_ACCEPT;
                }
                return NodeFilter.FILTER_REJECT;
            }
        }
    );

    const textNodes = [];
    while (walker.nextNode()) {
        textNodes.push(walker.currentNode);
    }
    //if there's no text nodes, return "No suitable text found on this page."
    if (textNodes.length > 0) {
        // Sort text nodes by length in descending order
        textNodes.sort((a, b) => b.textContent.trim().length - a.textContent.trim().length);
        
        // Get the top 10 longest strings (or all if less than 10)
        const topNodes = textNodes.slice(0, Math.min(10, textNodes.length));
        
        // Select a random node from the top nodes
        const randomNode = topNodes[Math.floor(Math.random() * topNodes.length)];
        return { type: 'text', content: randomNode.textContent.trim(), element: randomNode.parentElement };
    }
    return { type: 'text', content: "No suitable text found on this page." };
}

//get random image
function getRandomImage() {
    const images = Array.from(document.getElementsByTagName('img')).filter(img => 
        isElementVisible(img) && img.src && img.naturalWidth > 50 && img.naturalHeight > 50
    );

    if (images.length > 0) {
        const randomImage = images[Math.floor(Math.random() * images.length)];
        return { 
            type: 'image', 
            content: randomImage.src, 
            alt: randomImage.alt || 'No alt text available', 
            element: randomImage 
        };
    }
    return { type: 'text', content: "No suitable image found on this page." };
}

//save data to chrome storage
function saveData(url, content) {
    chrome.storage.local.get(['visitedUrls', 'maxUrls'], (result) => {
        let urls = result.visitedUrls || [];
        const maxUrls = result.maxUrls || 100;
        
        // Generate random position
        const position = {
            x: Math.random() * 90,
            y: Math.random() * 90
        };
        
        // Add new entry with position
        urls.push({ url: url, content: content, position: position });
        
        // If we have more than maxUrls entries, remove the oldest ones
        if (urls.length > maxUrls) {
            urls = urls.slice(-maxUrls);
        }
        
        chrome.storage.local.set({ visitedUrls: urls }, () => {
            console.log('URL, content, and position added to storage:', url, content, position);
            if (urls.length === maxUrls) {
                console.log(`Reached maximum of ${maxUrls} entries. Oldest entry removed.`);
            }
        });
    });
}

// Content script functionality
if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
        getRandomContent().then(randomContent => {
            if (randomContent !== null) {
                chrome.runtime.sendMessage({ action: "saveData", url: window.location.href, content: randomContent });
            } else {
                console.log('No suitable content found. URL not saved.');
            }
        });
    });
}

// Background script functionality
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "saveData") {
        saveData(message.url, message.content);
    }
});
