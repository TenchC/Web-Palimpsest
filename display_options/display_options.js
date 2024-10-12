document.addEventListener('DOMContentLoaded', function() {
    const saveButton = document.getElementById('saveOptions');
    const backgroundColorInput = document.getElementById('backgroundColor');
    const backgroundOpacityInput = document.getElementById('backgroundOpacity');
    const opacityValueSpan = document.getElementById('opacityValue');
    const textColorInput = document.getElementById('textColor');
    const fontSizeInput = document.getElementById('fontSize');
    const urlColorInput = document.getElementById('urlColor');
    const urlBackgroundColorInput = document.getElementById('urlBackgroundColor');
    
    const exampleEntries = document.querySelectorAll('.entry');
    const exampleUrls = document.querySelectorAll('.entry-url');
    
    function updateOpacityValue() {
        opacityValueSpan.textContent = backgroundOpacityInput.value;
    }

    function hexToRgb(hex) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return [r, g, b];
    }

    function updateExampleEntries() {
        const [r, g, b] = hexToRgb(backgroundColorInput.value);
        const a = parseFloat(backgroundOpacityInput.value);
        const backgroundColor = `rgba(${r}, ${g}, ${b}, ${a})`;
        const textColor = textColorInput.value;
        const fontSize = fontSizeInput.value;
        const urlColor = urlColorInput.value;
        const urlBackgroundColor = urlBackgroundColorInput.value;

        document.documentElement.style.setProperty('--hover-background-color', backgroundColor);
        document.documentElement.style.setProperty('--url-color', urlColor);
        document.documentElement.style.setProperty('--url-background-color', urlBackgroundColor);

        exampleEntries.forEach(entry => {
            entry.style.color = textColor;
            entry.style.fontSize = `${fontSize}px`;
            const contentElement = entry.querySelector('.entry-content');
            if (contentElement) {
                contentElement.style.backgroundColor = backgroundColor;
            }
        });

        exampleUrls.forEach(url => {
            url.style.color = urlColor;
            url.style.backgroundColor = urlBackgroundColor;
        });

        // Add hover effect to example entries
        exampleEntries.forEach(entry => {
            entry.addEventListener('mouseenter', () => {
                entry.style.backgroundColor = backgroundColor;
                const urlElement = entry.querySelector('.entry-url');
                if (urlElement) {
                    urlElement.style.display = 'block';
                }
            });
            entry.addEventListener('mouseleave', () => {
                entry.style.backgroundColor = 'transparent';
                const urlElement = entry.querySelector('.entry-url');
                if (urlElement) {
                    urlElement.style.display = 'none';
                }
            });
        });
    }

    [backgroundColorInput, backgroundOpacityInput, textColorInput, fontSizeInput, urlColorInput, urlBackgroundColorInput].forEach(input => {
        input.addEventListener('input', () => {
            updateExampleEntries();
            updateOpacityValue();
        });
    });

    saveButton.addEventListener('click', function() {
        const [r, g, b] = hexToRgb(backgroundColorInput.value);
        const a = parseFloat(backgroundOpacityInput.value);
        const backgroundColor = `rgba(${r}, ${g}, ${b}, ${a})`;
        const textColor = textColorInput.value;
        const fontSize = fontSizeInput.value;
        const urlColor = urlColorInput.value;
        const urlBackgroundColor = urlBackgroundColorInput.value;

        const options = {
            backgroundColor: backgroundColor,
            textColor: textColor,
            fontSize: parseInt(fontSize),
            urlColor: urlColor,
            urlBackgroundColor: urlBackgroundColor
        };

        chrome.storage.local.set(options, function() {
            alert('Display options saved successfully!');
        });
    });

    // Load saved options when the page loads
    chrome.storage.local.get(['backgroundColor', 'textColor', 'fontSize', 'urlColor', 'urlBackgroundColor'], function(items) {
        if (items.backgroundColor) {
            const match = items.backgroundColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)/);
            if (match) {
                const [, r, g, b, a] = match;
                backgroundColorInput.value = `#${parseInt(r).toString(16).padStart(2, '0')}${parseInt(g).toString(16).padStart(2, '0')}${parseInt(b).toString(16).padStart(2, '0')}`;
                backgroundOpacityInput.value = a || '1';
                updateOpacityValue();
            }
        }
        if (items.textColor) textColorInput.value = items.textColor;
        if (items.fontSize) fontSizeInput.value = items.fontSize;
        if (items.urlColor) urlColorInput.value = items.urlColor;
        if (items.urlBackgroundColor) urlBackgroundColorInput.value = items.urlBackgroundColor;

        updateExampleEntries();
    });
});
