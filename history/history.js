document.addEventListener('DOMContentLoaded', () => {
    const historyContainer = document.getElementById('historyContainer');
    const columns = [
        document.getElementById('column1'),
        document.getElementById('column2'),
        document.getElementById('column3'),
        document.getElementById('column4'),
        document.getElementById('column5'),
        document.getElementById('column6'),
        document.getElementById('column7')
    ];

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
        document.documentElement.style.setProperty('--hover-background-color', options.entryBackgroundColor);
        document.body.style.backgroundColor = options.pageBackgroundColor;
        document.documentElement.style.setProperty('--url-color', options.urlColor);
        document.documentElement.style.setProperty('--url-background-color', options.urlBackgroundColor);
        document.documentElement.style.setProperty('--entry-border-radius', `${options.entryBorderRadius}px`);

        console.log('Applying Display Entry Number:', options.displayEntryNumber);
        console.log('Display Header:', options.displayHeader);

        const entries = document.querySelectorAll('.entry');
        entries.forEach((entry, index) => {
            entry.style.color = options.textColor;
            entry.style.fontSize = `${options.fontSize}px`;
            
            entry.classList.remove('rounded');
            if (options.entryBorderRadius > 0) {
                entry.classList.add('rounded');
            }

            const urlElement = entry.querySelector('.entry-url');
            if (urlElement) {
                urlElement.style.color = options.urlColor;
                urlElement.style.backgroundColor = options.urlBackgroundColor;
                urlElement.style.borderRadius = `${options.entryBorderRadius}px ${options.entryBorderRadius}px 0 0`;
                if (options.displayEntryNumber) {
                    urlElement.textContent = `${urlElement.textContent.split(' - ')[0]} - Artifact ${index + 1}`;
                } else {
                    urlElement.textContent = urlElement.textContent.split(' - ')[0];
                }
            }

            if (options.displayMode === 'grid') {
                entry.classList.add('grid-entry');
                if (urlElement) {
                    urlElement.style.display = options.displayHeader ? 'block' : 'none';
                }
                // Remove hover effects for grid mode
                entry.onmouseenter = null;
                entry.onmouseleave = null;
            } else {
                entry.classList.remove('grid-entry');
                if (urlElement) {
                    urlElement.style.display = 'none';
                }
                // Add hover effects for palimpsest mode
                entry.onmouseenter = () => {
                    entry.classList.add('entry-hover');
                    if (urlElement && options.displayHeader) {
                        urlElement.style.display = 'block';
                        adjustUrlFontSize(urlElement);
                    }
                };
                entry.onmouseleave = () => {
                    entry.classList.remove('entry-hover');
                    if (urlElement) {
                        urlElement.style.display = 'none';
                    }
                };
            }
        });

        if (options.displayMode === 'grid') {
            document.body.classList.add('grid-mode');
            document.body.style.overflow = 'auto';
            entries.forEach(entry => {
                entry.style.position = 'static';
                entry.style.left = 'auto';
                entry.style.top = 'auto';
            });
            historyContainer.style.display = 'flex';
        } else {
            document.body.classList.remove('grid-mode');
            document.body.style.overflow = 'hidden';
            entries.forEach(entry => {
                entry.style.position = 'absolute';
            });
            historyContainer.style.display = 'block';
        }

        applyLayerOrder(entries, options.layerOrder, options.displayMode);
    }

    // Function to apply layer order
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

    // Load display options and apply them
    function loadAndApplyOptions() {
        chrome.storage.local.get([
            'entryBackgroundColor', 'pageBackgroundColor', 'textColor', 'urlColor', 
            'urlBackgroundColor', 'entryBorderRadius', 'fontSize', 'layerOrder', 
            'displayEntryNumber', 'displayMode', 'displayHeader'
        ], function(items) {
            const options = {
                entryBackgroundColor: items.entryBackgroundColor || 'rgba(255, 255, 255, 1)',
                pageBackgroundColor: items.pageBackgroundColor || '#FFFFFF',
                textColor: items.textColor || '#000000',
                urlColor: items.urlColor || '#FF0000',
                urlBackgroundColor: items.urlBackgroundColor || '#FFFFFF',
                entryBorderRadius: items.entryBorderRadius || 0,
                fontSize: items.fontSize || 14,
                layerOrder: items.layerOrder || 'newestOnTop',
                displayEntryNumber: items.displayEntryNumber !== undefined ? items.displayEntryNumber : false,
                displayMode: items.displayMode || 'palimpsest',
                displayHeader: items.displayHeader !== undefined ? items.displayHeader : true
            };
            console.log('Loaded options:', options); // Debug log
            applyDisplayOptions(options);
        });
    }

    // Function to create new entries
    function createEntry(entry, index) {
        const contentElement = document.createElement('div');
        contentElement.className = 'entry';
        contentElement.dataset.index = index;
        
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
        
        // Add hover effects
        contentElement.addEventListener('mouseenter', () => {
            contentElement.classList.add('entry-hover');
            if (document.body.classList.contains('grid-mode')) {
                contentElement.style.transform = 'scale(1.1)';
            }
        });
        
        contentElement.addEventListener('mouseleave', () => {
            contentElement.classList.remove('entry-hover');
            if (document.body.classList.contains('grid-mode')) {
                contentElement.style.transform = 'scale(1)';
            }
        });
        
        return contentElement;
    }

    function clearHistory() {
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    }

    // Initial load of options
    loadAndApplyOptions();

    chrome.storage.local.get(['visitedUrls'], (result) => {
        const urls = result.visitedUrls || [];
        
        urls.forEach((entry, index) => {
            const contentElement = createEntry(entry, index);
            document.body.appendChild(contentElement);
        });

        // Apply sort order and display options after all entries are created
        loadAndApplyOptions();
    });

    // Listen for changes in storage and reapply styles
    chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace === 'local') {
            if (changes.visitedUrls && changes.visitedUrls.newValue.length === 0) {
                clearHistory();
            } else {
                loadAndApplyOptions();
            }
        }
    });

    // Listen for messages from popup.js
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === "clearHistory") {
            clearHistory();
        }
    });

    function adjustUrlFontSize(urlElement) {
        const originalFontSize = parseFloat(getComputedStyle(urlElement).fontSize);
        let fontSize = originalFontSize;
        urlElement.style.fontSize = `${fontSize}px`;

        // Account for padding in width calculation
        const padding = parseFloat(getComputedStyle(urlElement).paddingLeft) + 
                        parseFloat(getComputedStyle(urlElement).paddingRight);

        while (urlElement.scrollWidth > (urlElement.offsetWidth - padding) && fontSize > 9) {
            fontSize -= 0.5;
            urlElement.style.fontSize = `${fontSize}px`;
        }
    }
});
