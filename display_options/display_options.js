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
    const exampleEntriesDiv = document.querySelector('.example-entries');
    const layerOrderSelect = document.getElementById('layerOrder');
    const displayEntryNumberInput = document.getElementById('displayEntryNumber');
    const artifactWeightInput = document.getElementById('artifactWeight');
    const weightRatioSpan = document.getElementById('weightRatio');
    const displayModeSelect = document.getElementById('displayMode');
    const displayHeaderInput = document.getElementById('displayHeader');
    console.log(weightRatioSpan);
    
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
        const displayHeader = displayHeaderInput.checked;

        // Apply settings to example entries
        exampleEntriesDiv.style.backgroundColor = pageBackgroundColor;
        
        // Set CSS variables
        document.documentElement.style.setProperty('--hover-background-color', entryBackgroundColor);
        document.documentElement.style.setProperty('--url-color', urlColor);
        document.documentElement.style.setProperty('--url-background-color', urlBackgroundColor);
        document.documentElement.style.setProperty('--entry-border-radius', `${entryBorderRadius}px`);

        // Update example entries
        const entries = document.querySelectorAll('.entry');
        entries.forEach((entry, index) => {
            entry.style.color = textColor;
            entry.style.fontSize = `${fontSize}px`;
            entry.style.borderRadius = `${entryBorderRadius}px`;
            
            const urlElement = entry.querySelector('.entry-url');
            if (urlElement) {
                urlElement.style.color = urlColor;
                urlElement.style.backgroundColor = urlBackgroundColor;
                urlElement.style.borderRadius = `${entryBorderRadius}px ${entryBorderRadius}px 0 0`;
                
                // Initially hide the URL element
                urlElement.style.display = 'none';

                // Get the base URL text (without entry number)
                let baseUrlText = urlElement.textContent.split(' - ')[0];
                
                if (displayEntryNumber) {
                    urlElement.textContent = `${baseUrlText} - Artifact ${index + 1}`;
                } else {
                    urlElement.textContent = baseUrlText;
                }
            }

            // Update hover effect based on displayHeader
            entry.onmouseenter = () => {
                entry.classList.add('entry-hover');
                if (urlElement && displayHeader) {
                    urlElement.style.display = 'block';
                }
            };
            entry.onmouseleave = () => {
                entry.classList.remove('entry-hover');
                if (urlElement) {
                    urlElement.style.display = 'none';
                }
            };
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

    // Add event listener for displayEntryNumber checkbox
    displayEntryNumberInput.addEventListener('change', () => {
        updateExampleEntries();
    });

    // Function to handle artifacts to save change
    function handleArtifactsToSaveChange(event) {
        const newValue = event.target.value;
        const confirmationMessages = {
            textAndImages: "Are you sure you want to save both text and images?",
            textOnly: `Are you sure you want to save only text?
This will clear your Palimpsest of all images.`,
            imagesOnly: `Are you sure you want to save only images? 
This will clear your Palimpsest of all text.`
        };

        const confirmed = confirm(confirmationMessages[newValue]);
        
        if (confirmed) {
            chrome.storage.local.set({ artifactsToSave: newValue }, () => {
                chrome.runtime.sendMessage({ action: "clearNonMatchingEntries", artifactsToSave: newValue });
                updateArtifactWeightVisibility(newValue);
            });
        } else {
            event.target.value = event.target.dataset.previousValue;
        }
    }

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
        const artifactWeight = parseInt(artifactWeightInput.value);
        const displayMode = displayModeSelect.value;
        const displayHeader = displayHeaderInput.checked;

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
            displayEntryNumber: displayEntryNumber,
            artifactWeight: artifactWeight,
            displayMode: displayMode,
            displayHeader: displayHeader
        };

        // Save options to chrome storage
        chrome.storage.local.set(options, function() {
            console.log('Display options saved:', options);
            alert('Display options saved successfully!');
        });
    });

    // Load saved options when the page loads
    chrome.storage.local.get(['entryBackgroundColor', 'pageBackgroundColor', 'textColor', 'fontSize', 'urlColor', 'urlBackgroundColor', 'entryBorderRadius', 'layerOrder', 'displayEntryNumber', 'artifactWeight', 'displayMode', 'displayHeader'], function(items) {
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
        }
        if (items.artifactWeight !== undefined) {
            artifactWeightInput.value = items.artifactWeight;
            updateWeightRatio();
        }
        if (items.displayMode) {
            displayModeSelect.value = items.displayMode;
        } else {
            // Set default value to "palimpsest" if not set
            displayModeSelect.value = "palimpsest";
        }
        if (items.displayHeader !== undefined) {
            displayHeaderInput.checked = items.displayHeader;
        } else {
            // Set default value to true if not set
            displayHeaderInput.checked = true;
        }
        updateExampleEntries();
    });

    // Call updateExampleEntries after creating the entries
    updateExampleEntries();

    // Make sure to call updateExampleEntries when the checkbox changes
    displayEntryNumberInput.addEventListener('change', () => {
        console.log('Display Entry Number changed:', displayEntryNumberInput.checked);
        updateExampleEntries();
    });

    // Also call updateExampleEntries when the page loads
    document.addEventListener('DOMContentLoaded', () => {
        createExampleEntries();
        updateExampleEntries();
    });

    // Make sure to call updateExampleEntries when any option changes
    [entryBackgroundColorInput, backgroundOpacityInput, textColorInput, fontSizeInput, 
     urlColorInput, urlBackgroundColorInput, pageBackgroundColorInput, entryBorderRadiusInput, 
     displayEntryNumberInput].forEach(input => {
        input.addEventListener('input', updateExampleEntries);
        input.addEventListener('change', updateExampleEntries);
    });

    // Call updateExampleEntries when the page loads
    document.addEventListener('DOMContentLoaded', () => {
        updateExampleEntries();
    });

    function updateArtifactWeightVisibility(artifactsToSave) {
        if (artifactsToSave === 'textAndImages') {
            artifactWeightOption.style.display = 'block';
        } else {
            artifactWeightOption.style.display = 'none';
        }
    }

    function updateWeightRatio() {
        const weight = artifactWeightInput.value;
        const imageWeight = 100 - weight;
        const textWeight = weight;
        weightRatioSpan.textContent = `${imageWeight}/${textWeight}`;
    }

    // Update weight ratio in real-time as the slider moves
    artifactWeightInput.addEventListener('input', () => {
        updateWeightRatio();
    });

    // Save the weight when the slider stops
    artifactWeightInput.addEventListener('change', () => {
        chrome.storage.local.set({ artifactWeight: parseInt(artifactWeightInput.value) });
    });

    // Initial update of weight ratio
    updateWeightRatio();

    // Add event listener for displayHeader checkbox
    displayHeaderInput.addEventListener('change', () => {
        updateExampleEntries();
    });
});
