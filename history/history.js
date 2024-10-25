document.addEventListener('DOMContentLoaded', () => {
    const historyContainer = document.getElementById('historyContainer');
    const columns = Array.from({ length: 7 }, (_, i) => document.getElementById(`column${i + 1}`));

    // Helper function to clean up URLs for display
    function tidyUrl(url) {
        try {
            const urlObj = new URL(url);
            let domain = urlObj.hostname.replace(/^www\./, '');
            const parts = domain.split('.');
            return parts.length > 2 ? parts.slice(-2).join('.') : domain;
        } catch (e) {
            return url;
        }
    }

    // Apply global styles based on user options
    // This function interacts with CSS variables defined in history.css
    function applyGlobalStyles(options) {
        document.body.style.backgroundColor = options.pageBackgroundColor;
        document.documentElement.style.setProperty('--url-color', options.urlColor);
        document.documentElement.style.setProperty('--url-background-color', options.urlBackgroundColor);
        document.documentElement.style.setProperty('--entry-border-radius', `${options.entryBorderRadius}px`);
    }

    // Arrange entries based on the selected layer order and display mode
    // This function affects the z-index of entries in palimpsest mode
    // and the order of entries in grid mode
    function applyLayerOrder(entries, layerOrder, displayMode) {
        const entriesArray = Array.from(entries);
        if (displayMode === 'grid') {
            const sortedEntries = entriesArray.sort((a, b) => {
                const indexA = parseInt(a.dataset.index);
                const indexB = parseInt(b.dataset.index);
                if (layerOrder === 'oldestOnTop') {
                    return indexA - indexB;
                } else if (layerOrder === 'newestOnTop') {
                    return indexB - indexA;
                } else {
                    return 0.5 - Math.random();
                }
            });
            
            // Clear columns
            columns.forEach(column => column.innerHTML = '');
            
            // Distribute entries among columns
            sortedEntries.forEach((entry, index) => {
                const columnIndex = index % 7;
                columns[columnIndex].appendChild(entry);
            });
        } else {
            switch (layerOrder) {
                case 'oldestOnTop':
                    entriesArray.forEach((entry, index) => {
                        entry.style.zIndex = entriesArray.length - index;
                    });
                    break;
                case 'newestOnTop':
                    entriesArray.forEach((entry, index) => {
                        entry.style.zIndex = index;
                    });
                    break;
                case 'random':
                    const shuffled = entriesArray.sort(() => 0.5 - Math.random());
                    shuffled.forEach((entry, index) => {
                        entry.style.zIndex = index;
                    });
                    break;
            }
        }
    }

    // Create and style individual history entries
    // This function creates DOM elements and applies styles based on user options
    // It interacts with various CSS classes defined in history.css
    function createAndStyleEntry(entry, index, options) {
        const contentElement = document.createElement('div');
        contentElement.className = 'entry';
        contentElement.dataset.index = index;

        const urlElement = document.createElement('a');
        urlElement.href = entry.url;
        urlElement.textContent = tidyUrl(entry.url);
        urlElement.className = 'entry-url';
        urlElement.target = '_blank';
        contentElement.appendChild(urlElement);

        const contentWrapper = document.createElement('div');
        contentWrapper.className = 'entry-content';

        if (entry.content?.type === 'text') {
            contentWrapper.innerHTML = `<p>${entry.content.content}</p>`;
        } else if (entry.content?.type === 'image') {
            contentWrapper.innerHTML = `<img src="${entry.content.content}" alt="Image">`;
        } else {
            console.error('Unknown content type:', entry.content);
        }

        contentElement.appendChild(contentWrapper);

        if (entry.content?.styles) {
            contentElement.dataset.styles = JSON.stringify(entry.content.styles);
            Object.assign(contentWrapper.style, entry.content.styles);
        }

        const maxX = 95, maxY = 90;
        contentElement.style.left = `${Math.max(0, Math.min(entry.position.x, maxX))}vw`;
        contentElement.style.top = `${Math.max(0, Math.min(entry.position.y, maxY))}vh`;

        // Apply styles
        const storedStyles = contentElement.dataset.styles ? JSON.parse(contentElement.dataset.styles) : null;
        if (storedStyles?.backgroundColor) {
            contentWrapper.style.backgroundColor = storedStyles.backgroundColor;
        } else {
            contentWrapper.style.backgroundColor = 'transparent';
        }

        contentElement.classList.toggle('rounded', options.entryBorderRadius > 0);

        urlElement.style.color = options.urlColor;
        urlElement.style.backgroundColor = options.urlBackgroundColor;
        urlElement.style.borderRadius = `${options.entryBorderRadius}px ${options.entryBorderRadius}px 0 0`;
        urlElement.textContent = options.displayEntryNumber 
            ? `${urlElement.textContent} - Artifact ${index + 1}`
            : urlElement.textContent;

        styleEntryForDisplayMode(contentElement, urlElement, options);

        return contentElement;
    }

    // Apply specific styles based on the current display mode (grid or palimpsest)
    // This function toggles CSS classes and styles to switch between modes
    function styleEntryForDisplayMode(contentElement, urlElement, options) {
        if (options.displayMode === 'grid') {
            contentElement.classList.add('grid-entry');
            urlElement.style.display = options.displayHeader ? 'block' : 'none';
            contentElement.style.position = 'static';
            contentElement.style.left = 'auto';
            contentElement.style.top = 'auto';
            contentElement.onmouseenter = null;
            contentElement.onmouseleave = null;
        } else {
            contentElement.classList.remove('grid-entry');
            urlElement.style.display = 'none';
            contentElement.style.position = 'absolute';
            contentElement.onmouseenter = () => {
                contentElement.classList.add('entry-hover');
                if (options.displayHeader) {
                    urlElement.style.display = 'block';
                    adjustUrlFontSize(urlElement);
                }
            };
            contentElement.onmouseleave = () => {
                contentElement.classList.remove('entry-hover');
                urlElement.style.display = 'none';
            };
        }
    }

    // Apply the overall layout based on the selected display mode
    // This function toggles between grid and palimpsest layouts
    // It interacts with CSS classes in history.css to change the layout
    function applyLayout(entries, options) {
        document.body.classList.toggle('grid-mode', options.displayMode === 'grid');
        document.body.style.overflow = options.displayMode === 'grid' ? 'auto' : 'hidden';
        historyContainer.style.display = options.displayMode === 'grid' ? 'flex' : 'block';

        if (options.displayMode === 'grid') {
            entries.forEach((entry, index) => {
                const columnIndex = index % columns.length;
                columns[columnIndex].appendChild(entry);
            });
        } else {
            entries.forEach(entry => document.body.appendChild(entry));
        }

        applyLayerOrder(entries, options.layerOrder, options.displayMode);
    }

    // Load user options from storage and create history entries
    // This function initializes the page layout and styles
    function loadOptionsAndCreateEntries() {
        return new Promise((resolve) => {
            chrome.storage.local.get([
                'pageBackgroundColor', 'urlColor', 'urlBackgroundColor', 'entryBorderRadius', 
                'layerOrder', 'displayEntryNumber', 'displayMode', 'displayHeader', 'visitedUrls'
            ], function(items) {
                const options = {
                    pageBackgroundColor: items.pageBackgroundColor || '#FFFFFF',
                    urlColor: items.urlColor || '#FF0000',
                    urlBackgroundColor: items.urlBackgroundColor || '#FFFFFF',
                    entryBorderRadius: items.entryBorderRadius || 0,
                    layerOrder: items.layerOrder || 'newestOnTop',
                    displayEntryNumber: items.displayEntryNumber ?? false,
                    displayMode: items.displayMode || 'palimpsest',
                    displayHeader: items.displayHeader ?? true
                };

                console.log('Loaded options:', options);

                applyGlobalStyles(options);

                const urls = items.visitedUrls || [];
                const createdEntries = urls.map((entry, index) => 
                    createAndStyleEntry(entry, index, options)
                );

                applyLayout(createdEntries, options);

                console.log('Created and styled entries:', createdEntries);
                resolve(); // Resolve the promise when done
            });
        });
    }

    // Clear all history entries from the page
    function clearHistory() {
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
        columns.forEach(column => column.innerHTML = '');
    }

    // Dynamically adjust URL font size to fit within its container
    function adjustUrlFontSize(urlElement) {
        const originalFontSize = parseFloat(getComputedStyle(urlElement).fontSize);
        let fontSize = originalFontSize;
        urlElement.style.fontSize = `${fontSize}px`;

        const padding = parseFloat(getComputedStyle(urlElement).paddingLeft) + 
                        parseFloat(getComputedStyle(urlElement).paddingRight);

        while (urlElement.scrollWidth > (urlElement.offsetWidth - padding) && fontSize > 9) {
            fontSize -= 0.5;
            urlElement.style.fontSize = `${fontSize}px`;
        }
    }

    // Remove the fade-in element after initial load
    // This function interacts with the fade-in animation defined in history.css
    function removeFadeIn() {
        const fadeIn = document.getElementById('fade-in');
        if (fadeIn) {
            setTimeout(() => {
                fadeIn.remove();
                console.log('Fade-in element removed');
            }, 1000); // 1 second
        } else {
            console.log('Fade-in element not found');
        }
    }

    // Initial load of the page
    loadOptionsAndCreateEntries().then(() => {
        console.log('Options loaded and entries created, removing fade-in');
        removeFadeIn();
    });

    // Listen for changes in storage and update the page accordingly
    chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace === 'local') {
            if (changes.visitedUrls && changes.visitedUrls.newValue.length === 0) {
                clearHistory();
            } else {
                loadOptionsAndCreateEntries();
            }
        }
    });

    // Listen for messages from popup.js to clear history
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === "clearHistory") {
            clearHistory();
        }
    });

    // Trigger the fade-out of the initial loading screen
    document.getElementById('fade-in').style.opacity = 0;
});
