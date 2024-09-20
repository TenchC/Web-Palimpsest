//tidy the url so it's just the hostname without protocol or www
function trimUrl(url) {
    try {
        const urlObject = new URL(url);
        let hostname = urlObject.hostname;
        // Remove 'www.' if present
        hostname = hostname.replace(/^www\./, '');
        return hostname;
    } catch (e) {
        // If URL parsing fails, attempt to remove common prefixes
        return url.replace(/^(https?:\/\/)?(www\.)?/, '');
    }
}

//check if element is visible
function isElementVisible(element) {
    return !!(element.offsetWidth || element.offsetHeight || element.getClientRects().length);
}

function getRandomContent() {
    const isText = Math.random() < 0.5;
    let content;

    //if isText is true, run getRandomText
    if (isText) {
        content = getRandomText();
        if (content.content === "No suitable text found on this page.") {
            //if there's no text, run getRandomImage
            content = getRandomImage();
        }

    } else {
        content = getRandomImage();
        if (content.content === "No suitable image found on this page.") {
            //if there's no image, run getRandomText
            content = getRandomText();
        }
    }

    // If no suitable content is found, return null
    if (content.content === "No suitable text found on this page." || 
        content.content === "No suitable image found on this page.") {
        return null;
    }

    // Add red border to the selected content
    if (content.type === 'text' && content.element) {
        content.element.style.border = '2px solid red';
    } else if (content.type === 'image' && content.element) {
        content.element.style.border = '2px solid red';
    }

    return content;
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
    //search for images with src and width and height greater than 50
    const images = Array.from(document.getElementsByTagName('img')).filter(img => 
        isElementVisible(img) && img.src && img.naturalWidth > 50 && img.naturalHeight > 50
    );
//if there's no images, run getRandomText
    if (images.length > 0) {
        const randomImage = images[Math.floor(Math.random() * images.length)];
        return { type: 'image', content: randomImage.src, alt: randomImage.alt || 'No alt text available', element: randomImage };
    }
    return { type: 'text', content: "No suitable image found on this page." };
}

//save data to chrome storage
function saveData(url, content) {
    const trimmedUrl = trimUrl(url);
    chrome.storage.local.get(['visitedUrls', 'maxUrls'], (result) => {
        let urls = result.visitedUrls || [];
        const maxUrls = result.maxUrls || 100;
        
        // Generate random position
        const position = {
            x: Math.random() * 90, // Random value between 0 and 90 for vw
            y: Math.random() * 90  // Random value between 0 and 90 for vh
        };
        
        // Add new entry with position
        urls.push({ url: trimmedUrl, content: content, position: position });
        
        // If we have more than maxUrls entries, remove the oldest ones
        if (urls.length > maxUrls) {
            urls = urls.slice(-maxUrls);
        }
        
        chrome.storage.local.set({ visitedUrls: urls }, () => {
            console.log('URL, content, and position added to storage:', trimmedUrl, content, position);
            if (urls.length === maxUrls) {
                console.log(`Reached maximum of ${maxUrls} entries. Oldest entry removed.`);
            }
        });
    });
}

// Content script functionality
if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
        const randomContent = getRandomContent();
        if (randomContent !== null) {
            chrome.runtime.sendMessage({ action: "saveData", url: window.location.href, content: randomContent });
        } else {
            console.log('No suitable content found. URL not saved.');
        }
    });
}

// Background script functionality
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "saveData") {
        saveData(message.url, message.content);
    }
});

// Only run this code on the history page

