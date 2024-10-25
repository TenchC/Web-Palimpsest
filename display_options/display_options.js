document.addEventListener('DOMContentLoaded', function() {
    // Get all necessary DOM elements
    const saveButton = document.getElementById('saveOptions');
    const urlColorInput = document.getElementById('urlColor');
    const urlBackgroundColorInput = document.getElementById('urlBackgroundColor');
    const entryBorderRadiusInput = document.getElementById('entryBorderRadius');
    const borderRadiusValueSpan = document.getElementById('borderRadiusValue');
    const pageBackgroundColorInput = document.getElementById('pageBackgroundColor');
    const exampleEntriesDiv = document.querySelector('.example-entries');
    const layerOrderSelect = document.getElementById('layerOrder');
    const displayEntryNumberInput = document.getElementById('displayEntryNumber');
    const artifactWeightInput = document.getElementById('artifactWeight');
    const weightRatioSpan = document.getElementById('weightRatio');
    const displayModeSelect = document.getElementById('displayMode');
    const displayHeaderInput = document.getElementById('displayHeader');

    // New code for banned websites functionality
    const addBannedWebsiteButton = document.getElementById('addBannedWebsite');
    const banWebsiteInput = document.getElementById('banWebsite');
    const bannedWebsitesList = document.getElementById('bannedWebsitesList');

    // Function to update example entries with current settings
    function updateExampleEntries() {
        // Get current values
        const pageBackgroundColor = pageBackgroundColorInput.value;
        const urlColor = urlColorInput.value;
        const urlBackgroundColor = urlBackgroundColorInput.value;
        const entryBorderRadius = entryBorderRadiusInput.value;
        const displayEntryNumber = displayEntryNumberInput.checked;
        const displayHeader = displayHeaderInput.checked;

        // Apply settings to example entries
        exampleEntriesDiv.style.backgroundColor = pageBackgroundColor;
        
        // Set CSS variables
        document.documentElement.style.setProperty('--url-color', urlColor);
        document.documentElement.style.setProperty('--url-background-color', urlBackgroundColor);
        document.documentElement.style.setProperty('--entry-border-radius', `${entryBorderRadius}px`);

        // Update example entries
        const entries = document.querySelectorAll('.entry');
        entries.forEach((entry, index) => {
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

        // Call updateExampleEntries after creating the entries
        updateExampleEntries();
    // Function to update border radius value display
    function updateBorderRadiusValue() {
        borderRadiusValueSpan.textContent = entryBorderRadiusInput.value;
    }

    // Add event listeners to inputs
    [urlColorInput, urlBackgroundColorInput, pageBackgroundColorInput].forEach(input => {
        if (input) {
            input.addEventListener('input', () => {
                updateExampleEntries();
            });
        } else {
            console.error('Missing input element:', input);
        }
    });

    entryBorderRadiusInput.addEventListener('input', () => {
        updateExampleEntries();
        updateBorderRadiusValue();
    });

    // Add event listener for displayEntryNumber checkbox
    displayEntryNumberInput.addEventListener('change', () => {
        updateExampleEntries();
    });

    // Save options when save button is clicked
    saveButton.addEventListener('click', function() {
        // Get current values
        const pageBackgroundColor = pageBackgroundColorInput.value;
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
            pageBackgroundColor: pageBackgroundColor,
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
    chrome.storage.local.get(['pageBackgroundColor', 'urlColor', 'urlBackgroundColor', 'entryBorderRadius', 'layerOrder', 'displayEntryNumber', 'artifactWeight', 'displayMode', 'displayHeader'], function(items) {
        // Set input values based on saved options
        if (items.pageBackgroundColor) {
            pageBackgroundColorInput.value = items.pageBackgroundColor;
            exampleEntriesDiv.style.backgroundColor = items.pageBackgroundColor;
        }
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
    [urlColorInput, urlBackgroundColorInput, pageBackgroundColorInput, entryBorderRadiusInput, displayEntryNumberInput].forEach(input => {
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

    // Function to add a website to the banned list
    function addBannedWebsite() {
        const website = banWebsiteInput.value.trim();
        if (website) {
            chrome.storage.local.get({bannedWebsites: []}, function(result) {
                let bannedWebsites = result.bannedWebsites;
                if (!bannedWebsites.includes(website)) {
                    bannedWebsites.push(website);
                    chrome.storage.local.set({bannedWebsites: bannedWebsites}, function() {
                        console.log('Website added to banned list:', website);
                        updateBannedWebsitesList();
                        banWebsiteInput.value = ''; // Clear the input field
                    });
                } else {
                    alert('This website is already in the banned list.');
                }
            });
        }
    }

    // Function to update the displayed list of banned websites
    function updateBannedWebsitesList() {
        chrome.storage.local.get({bannedWebsites: []}, function(result) {
            const bannedWebsites = result.bannedWebsites;
            bannedWebsitesList.innerHTML = '';
            bannedWebsites.forEach(function(website) {
                const li = document.createElement('li');
                li.textContent = website;
                const removeButton = document.createElement('button');
                removeButton.textContent = 'Remove';
                removeButton.onclick = function() {
                    removeBannedWebsite(website);
                };
                li.appendChild(removeButton);
                bannedWebsitesList.appendChild(li);
            });
        });
    }

    // Function to remove a website from the banned list
    function removeBannedWebsite(website) {
        chrome.storage.local.get({bannedWebsites: []}, function(result) {
            let bannedWebsites = result.bannedWebsites;
            const index = bannedWebsites.indexOf(website);
            if (index > -1) {
                bannedWebsites.splice(index, 1);
                chrome.storage.local.set({bannedWebsites: bannedWebsites}, function() {
                    console.log('Website removed from banned list:', website);
                    updateBannedWebsitesList();
                });
            }
        });
    }

    // Add event listener for the add button
    addBannedWebsiteButton.addEventListener('click', addBannedWebsite);

    // Add event listener for the Enter key in the input field
    banWebsiteInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addBannedWebsite();
        }
    });

    // Initial update of the banned websites list
    updateBannedWebsitesList();
});
