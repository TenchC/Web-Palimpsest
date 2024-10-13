document.addEventListener('DOMContentLoaded', function() {
    // Get all necessary DOM elements
    const saveButton = document.getElementById('saveOptions');
    const entryBackgroundColorInput = document.getElementById('entryBackgroundColor');
    const backgroundOpacityInput = document.getElementById('backgroundOpacity');
    const opacityValueSpan = document.getElementById('opacityValue');
    const textColorInput = document.getElementById('textColor');
    const fontSizeInput = document.getElementById('fontSize');
    const urlColorInput = document.getElementById('urlColor');
    const urlBackgroundColorInput = document.getElementById('urlBackgroundColor');
    const entryBorderRadiusInput = document.getElementById('entryBorderRadius');
    const borderRadiusValueSpan = document.getElementById('borderRadiusValue');
    const fontSizeValueSpan = document.getElementById('fontSizeValue');
    const pageBackgroundColorInput = document.getElementById('pageBackgroundColor');
    const exampleEntries = document.querySelectorAll('.entry');
    const exampleEntriesDiv = document.querySelector('.example-entries');
    const layerOrderSelect = document.getElementById('layerOrder');
    const displayEntryNumberInput = document.getElementById('displayEntryNumber');
    
    // Function to update opacity value display
    function updateOpacityValue() {
        opacityValueSpan.textContent = backgroundOpacityInput.value;
    }

    // Function to convert hex color to RGB
    function hexToRgb(hex) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return [r, g, b];
    }

    // Function to update example entries with current settings
    function updateExampleEntries() {
        // Get current values
        const [r, g, b] = hexToRgb(entryBackgroundColorInput.value);
        const a = parseFloat(backgroundOpacityInput.value);
        const entryBackgroundColor = `rgba(${r}, ${g}, ${b}, ${a})`;
        const pageBackgroundColor = pageBackgroundColorInput.value;
        const textColor = textColorInput.value;
        const fontSize = fontSizeInput.value;
        const urlColor = urlColorInput.value;
        const urlBackgroundColor = urlBackgroundColorInput.value;
        const entryBorderRadius = entryBorderRadiusInput.value;
        const displayEntryNumber = displayEntryNumberInput.checked;

        // Apply settings to example entries
        exampleEntriesDiv.style.backgroundColor = pageBackgroundColor;
        
        // Set CSS variables
        document.documentElement.style.setProperty('--hover-background-color', entryBackgroundColor);
        document.documentElement.style.setProperty('--url-color', urlColor);
        document.documentElement.style.setProperty('--url-background-color', urlBackgroundColor);
        document.documentElement.style.setProperty('--entry-border-radius', `${entryBorderRadius}px`);

        // Update example entries
        exampleEntries.forEach((entry, index) => {
            entry.style.color = textColor;
            entry.style.fontSize = `${fontSize}px`;
            entry.style.borderRadius = `${entryBorderRadius}px`;
            const contentElement = entry.querySelector('.entry-content');
            if (contentElement) {
                contentElement.style.backgroundColor = entryBackgroundColor;
            }
            const urlElement = entry.querySelector('.entry-url');
            if (urlElement) {
                urlElement.style.color = urlColor;
                urlElement.style.backgroundColor = urlBackgroundColor;
                if (displayEntryNumber) {
                    urlElement.textContent = `${urlElement.textContent} - Entry ${index + 1}`;
                } else {
                    urlElement.textContent = urlElement.textContent.split(' - ')[0];
                }
            }
        });
    }

    // Function to update border radius value display
    function updateBorderRadiusValue() {
        borderRadiusValueSpan.textContent = entryBorderRadiusInput.value;
    }

    // Function to update font size value display
    function updateFontSizeValue() {
        fontSizeValueSpan.textContent = fontSizeInput.value;
    }

    // Add event listeners to inputs
    [entryBackgroundColorInput, backgroundOpacityInput, textColorInput, fontSizeInput, urlColorInput, urlBackgroundColorInput, pageBackgroundColorInput].forEach(input => {
        if (input) {
            input.addEventListener('input', () => {
                updateExampleEntries();
                if (input === backgroundOpacityInput) {
                    updateOpacityValue();
                }
            });
        } else {
            console.error('Missing input element:', input);
        }
    });

    entryBorderRadiusInput.addEventListener('input', () => {
        updateExampleEntries();
        updateBorderRadiusValue();
    });

    fontSizeInput.addEventListener('input', () => {
        updateExampleEntries();
        updateFontSizeValue();
    });

    // Save options when save button is clicked
    saveButton.addEventListener('click', function() {
        // Get current values
        const [r, g, b] = hexToRgb(entryBackgroundColorInput.value);
        const a = parseFloat(backgroundOpacityInput.value);
        const entryBackgroundColor = `rgba(${r}, ${g}, ${b}, ${a})`;
        const pageBackgroundColor = pageBackgroundColorInput.value;
        const textColor = textColorInput.value;
        const fontSize = fontSizeInput.value;
        const urlColor = urlColorInput.value;
        const urlBackgroundColor = urlBackgroundColorInput.value;
        const entryBorderRadius = entryBorderRadiusInput.value;
        const layerOrder = layerOrderSelect.value;
        const displayEntryNumber = displayEntryNumberInput.checked;

        // Create options object
        const options = {
            entryBackgroundColor: entryBackgroundColor,
            pageBackgroundColor: pageBackgroundColor,
            textColor: textColor,
            fontSize: parseInt(fontSize),
            urlColor: urlColor,
            urlBackgroundColor: urlBackgroundColor,
            entryBorderRadius: parseInt(entryBorderRadius),
            layerOrder: layerOrder,
            displayEntryNumber: displayEntryNumber
        };

        // Save options to chrome storage
        chrome.storage.local.set(options, function() {
            console.log('Display options saved:', options); // Add this line for debugging
            alert('Display options saved successfully!');
        });
    });

    // Load saved options when the page loads
    chrome.storage.local.get(['entryBackgroundColor', 'pageBackgroundColor', 'textColor', 'fontSize', 'urlColor', 'urlBackgroundColor', 'entryBorderRadius', 'layerOrder', 'displayEntryNumber'], function(items) {
        // Set input values based on saved options
        if (items.entryBackgroundColor) {
            const match = items.entryBackgroundColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)/);
            if (match) {
                const [, r, g, b, a] = match;
                entryBackgroundColorInput.value = `#${parseInt(r).toString(16).padStart(2, '0')}${parseInt(g).toString(16).padStart(2, '0')}${parseInt(b).toString(16).padStart(2, '0')}`;
                backgroundOpacityInput.value = a || '1';
                updateOpacityValue();
            }
        }
        if (items.pageBackgroundColor) {
            pageBackgroundColorInput.value = items.pageBackgroundColor;
            exampleEntriesDiv.style.backgroundColor = items.pageBackgroundColor;
        }
        if (items.textColor) textColorInput.value = items.textColor;
        if (items.fontSize) fontSizeInput.value = items.fontSize;
        if (items.urlColor) urlColorInput.value = items.urlColor;
        if (items.urlBackgroundColor) urlBackgroundColorInput.value = items.urlBackgroundColor;
        if (items.entryBorderRadius) {
            entryBorderRadiusInput.value = items.entryBorderRadius;
            updateBorderRadiusValue();
        }
        if (items.layerOrder) layerOrderSelect.value = items.layerOrder;
        if (items.displayEntryNumber !== undefined) {
            displayEntryNumberInput.checked = items.displayEntryNumber;
            console.log('Loaded Display Entry Number:', items.displayEntryNumber); // Add this line for debugging
        }
        updateExampleEntries();
    });

    // Function to create example entries
    function createExampleEntries() {
        const exampleEntriesContainer = document.querySelector('.example-entries');
        exampleEntriesContainer.innerHTML = ''; // Clear existing entries

        // Create text entry
        const textEntry = document.createElement('div');
        textEntry.className = 'entry';
        textEntry.innerHTML = `
            <a href="#" class="entry-url">example-1.com</a>
            <div class="entry-content">
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
            </div>
        `;

        // Create image entry
        const imageEntry = document.createElement('div');
        imageEntry.className = 'entry';
        imageEntry.innerHTML = `
            <a href="#" class="entry-url">example-2.com</a>
            <div class="entry-content">
                <img src="../images/example-image.jpg" alt="Example Image" style="max-width: 100px; height: auto;">
            </div>
        `;

        // Add entries to container
        exampleEntriesContainer.appendChild(textEntry);
        exampleEntriesContainer.appendChild(imageEntry);
    }

    // Create example entries when the page loads
    createExampleEntries();
});
