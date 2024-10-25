console.log('Palimpsest script loaded');

//check if element is visible
function isElementVisible(element) {
    return !!(element.offsetWidth || element.offsetHeight || element.getClientRects().length);
}

function getRandomContent() {
    return new Promise((resolve) => {
        // First, get the current URL
        const currentUrl = window.location.hostname;

        // Then, check if the current URL is in the banned list
        chrome.storage.local.get(['bannedWebsites', 'artifactWeight'], (result) => {
            const bannedWebsites = result.bannedWebsites || [];
            
            // Check if the current URL is in the banned list
            const isBanned = bannedWebsites.some(bannedUrl => {
                const isMatch = currentUrl.includes(bannedUrl);
                console.log(`Comparing ${currentUrl} with ${bannedUrl}: ${isMatch}`);
                return isMatch;
            });

            if (isBanned) {
                console.log('Current website is in the banned list. Skipping content selection.');
                resolve(null);
                return;
            }

            // If the website is not banned, proceed with the original logic
            const artifactWeight = result.artifactWeight !== undefined ? result.artifactWeight : 50;
            const imageThreshold = (100 - artifactWeight) / 100;
            
            if (Math.random() < imageThreshold) {
                content = getRandomImage();
                if (content.content === "No suitable image found on this page." && imageThreshold === 0) {
                    content = getRandomText();
                }
            } else {
                content = getRandomText();
                if (content.content === "No suitable text found on this page." && imageThreshold === 1) {
                    content = getRandomImage();
                }
            }

            if (content.content === "No suitable text found on this page." || 
                content.content === "No suitable image found on this page.") {
                resolve(null);
            } else {
                console.log('Random content selected:', content);
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

    if (textNodes.length > 0) {
        textNodes.sort((a, b) => b.textContent.trim().length - a.textContent.trim().length);
        const topNodes = textNodes.slice(0, Math.min(10, textNodes.length));
        const randomNode = topNodes[Math.floor(Math.random() * topNodes.length)];
        
        const computedStyle = window.getComputedStyle(randomNode.parentElement);
        const styles = {
            fontSize: computedStyle.fontSize,
            fontFamily: computedStyle.fontFamily,
            color: computedStyle.color,
            fontWeight: computedStyle.fontWeight,
            fontStyle: computedStyle.fontStyle,
            textDecoration: computedStyle.textDecoration,
            backgroundColor: getBackgroundColor(randomNode.parentElement),
        };

        return { 
            type: 'text', 
            content: randomNode.textContent.trim(), 
            element: randomNode.parentElement,
            styles: styles
        };
    }
    console.log('No suitable text found on this page.');
    return { type: 'text', content: "No suitable text found on this page." };
}

function getBackgroundColor(element) {
    while (element) {
        const bgColor = window.getComputedStyle(element).backgroundColor;
        if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
            return bgColor;
        }
        element = element.parentElement;
    }
    return 
}

//get random image
function getRandomImage() {
    const images = Array.from(document.getElementsByTagName('img')).filter(img => 
        isElementVisible(img) && img.src && img.naturalWidth > 100 && img.naturalHeight > 100
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
    console.log('Saving data:', { url, content });
    chrome.storage.local.get(['visitedUrls', 'maxUrls'], (result) => {
        let urls = result.visitedUrls || [];
        const maxUrls = result.maxUrls || 100;
        
        const position = {
            x: Math.random() * 90,
            y: Math.random() * 90
        };
        
        const newEntry = { 
            url: url, 
            content: {
                type: content.type,
                content: content.content,
                styles: content.styles
            },
            position: position 
        };
        
        console.log('New entry being saved:', newEntry);
        
        urls.push(newEntry);
        
        if (urls.length > maxUrls) {
            urls = urls.slice(-maxUrls);
        }
        
        chrome.storage.local.set({ visitedUrls: urls }, () => {
            console.log('URLs after saving:', urls);
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
                console.log('Sending content to background script:', randomContent);
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
