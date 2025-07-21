
document.addEventListener('sdk-ready', async () => {
    const { addOnSDK } = window;
    const { document: expressDocument, app, constants } = addOnSDK;
    const { ui, instance } = app;

    // --- CONFIG ---
    // Use a relative path to call API routes in the same app.
    // This works for both local development and production deployments.
    const BACKEND_URL = '';
    
    // The Project ID will be fetched from the document's metadata
    let PROJECT_ID = null;
    let DEBOUNCE_TIMER;

    // --- DOM Elements ---
    const loader = document.getElementById('loader');
    
    // Tabs
    const tabs = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    // Compliance Tab
    const resultsDiv = document.getElementById('results');
    const scoreSpan = document.getElementById('score');
    const scoreCircle = document.getElementById('score-circle');
    const feedbackSpan = document.getElementById('feedback');
    const fixesContainer = document.getElementById('fixes-container');
    const fixesList = document.getElementById('fixes-list');
    const noIssuesDiv = document.getElementById('no-issues');
    const instantBrandifyBtn = document.getElementById('instantBrandifyBtn');
    const brandifyTemplateBtn = document.getElementById('brandifyTemplateBtn');

    // Brand Kit Tab
    const brandNavigatorContent = document.getElementById('brand-navigator-content');
    const assetLibraryGrid = document.getElementById('asset-library-grid');
    const snippetLibraryGrid = document.getElementById('snippet-library-grid');
    const saveSnippetBtn = document.getElementById('saveSnippetBtn');

    // Copy Tab
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const chatSendBtn = document.getElementById('chat-send');
    const chatMessages = document.getElementById('chat-messages');
    const generateTaglinesBtn = document.getElementById('generateTaglinesBtn');
    const taglineResults = document.getElementById('tagline-results');

    // --- State ---
    let brandFingerprint = null;
    let projectAssets = [];
    let projectSnippets = []; // This would be populated from backend
    let lastFixes = [];

    // --- Utility Functions ---
    const showLoader = (text) => {
        loader.querySelector('p').textContent = text;
        loader.style.display = 'block';
    };
    const hideLoader = () => loader.style.display = 'none';
    
    const blobToDataURI = (blob) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });

    const dataUriToBlob = async (dataURI) => {
        const response = await fetch(dataURI);
        return await response.blob();
    };
    
    const hexToRgb = (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? { r: parseInt(result[1], 16) / 255, g: parseInt(result[2], 16) / 255, b: parseInt(result[3], 16) / 255 } : { r: 0, g: 0, b: 0 };
    }

    // --- API Calls ---
    const api = {
        getProjectDetails: async (projectId) => {
            const response = await fetch(`${BACKEND_URL}/api/project-details/${projectId}`);
            if (!response.ok) throw new Error('Could not fetch project details.');
            return response.json();
        },
        analyzeDesign: async (designDataUri) => {
             if (!brandFingerprint || !PROJECT_ID) throw new Error("Brand fingerprint or Project ID not loaded.");
             const response = await fetch(`${BACKEND_URL}/api/generate-compliance-score`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projectId: PROJECT_ID, designDataUri, brandFingerprint: JSON.stringify(brandFingerprint), designContext: 'Social Media Post' })
            });
            if (!response.ok) throw new Error('Analysis failed.');
            return response.json();
        },
        getFixes: async (designDataUri) => {
             if (!brandFingerprint || !PROJECT_ID) throw new Error("Brand fingerprint or Project ID not loaded.");
             const response = await fetch(`${BACKEND_URL}/api/offer-brand-fixes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projectId: PROJECT_ID, designDataUri, brandGuidelines: JSON.stringify(brandFingerprint), designContext: 'Social Media Post' })
            });
            if (!response.ok) throw new Error('Could not get fixes.');
            return response.json();
        },
        brandify: async (designDataUri, fixesToApply) => {
            if (!brandFingerprint) throw new Error("Brand fingerprint not loaded.");
            const response = await fetch(`${BACKEND_URL}/api/apply-brand-fixes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ designDataUri, brandGuidelines: JSON.stringify(brandFingerprint), fixes: fixesToApply.map(f => f.description) })
            });
            if (!response.ok) throw new Error('Brandify failed.');
            return response.json();
        },
        getBrandCopy: async (query) => {
            const response = await fetch(`${BACKEND_URL}/api/brand-assistant`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    brandGuidelines: JSON.stringify(brandFingerprint), 
                    query: query
                })
            });
            if (!response.ok) throw new Error('Assistant failed.');
            return response.json();
        }
    };

    // --- Main Logic ---

    const performLiveAnalysis = async () => {
        if (!PROJECT_ID) return;
        showLoader('Live checking...');
        try {
            const rendition = await expressDocument.createRendition({ type: 'image/png', range: 'currentPage' });
            const designDataUri = await blobToDataURI(rendition);
            
            const [analysis, fixes] = await Promise.all([
                api.analyzeDesign(designDataUri),
                api.getFixes(designDataUri)
            ]);
            
            lastFixes = fixes.fixes;
            updateComplianceUI(analysis.complianceScore, analysis.feedback);
            updateFixesUI(lastFixes);

        } catch (error) {
            console.error('Live analysis error:', error);
            ui.showToast({ message: 'Could not perform live check.', variant: 'negative' });
        } finally {
            hideLoader();
        }
    };

    const applyFix = async (fix) => {
        showLoader('Applying fix...');
        try {
            const { property, newValue, targetElement } = fix.details;
            const elements = await expressDocument.getElementsOnPage();
            
            let target;
            const lowerTarget = targetElement.toLowerCase();

            if (lowerTarget.includes('background')) {
                target = elements.find(el => el.type === 'shape' && el.name.toLowerCase().includes('background'));
            } else if (lowerTarget.includes('headline')) {
                // Find largest text element
                target = elements.filter(el => el.type === 'text').sort((a,b) => (b.styles.fontSize || 0) - (a.styles.fontSize || 0))[0];
            } else if (lowerTarget.includes('logo')) {
                 target = elements.find(el => el.name.toLowerCase().includes('logo') || (el.type === 'image' && !el.name));
            } else {
                 target = elements.find(el => el.type === 'text' || el.type === 'shape');
            }
            
            if (target) {
                if (property === 'fillColor') {
                    const color = hexToRgb(newValue);
                    await expressDocument.updateElement(target, { styles: { fillColor: { type: 'solid', color } } });
                } else if (property === 'fontWeight') {
                     await expressDocument.updateElement(target, { styles: { fontWeight: newValue } });
                }
            } else {
                 ui.showToast({ message: `Could not find target element: ${targetElement}`, variant: 'negative' });
            }

            ui.showToast({ message: `Applied fix: ${fix.description}`, variant: 'positive' });
            await performLiveAnalysis(); // Re-check after applying fix
        } catch (error) {
            console.error('Error applying fix:', error);
            ui.showToast({ message: 'Could not apply fix.', variant: 'negative' });
        } finally {
            hideLoader();
        }
    };

    const handleBrandify = async (rendition, fixesToApply) => {
         showLoader('Brandifying...');
         try {
            const designDataUri = await blobToDataURI(rendition);
            const result = await api.brandify(designDataUri, fixesToApply);
            const newImageBlob = await dataUriToBlob(result.fixedDesignDataUri);
            
            // Get all elements and replace the largest one (likely the background)
            const elements = await expressDocument.getElementsOnPage();
            if (elements.length > 0) {
                 await expressDocument.replacePageBackground(newImageBlob);
            } else {
                 await expressDocument.addImage(newImageBlob);
            }

            ui.showToast({ message: 'Design has been Brandified!', variant: 'positive' });
            await performLiveAnalysis(); // Re-check after brandify
         } catch(error) {
            console.error('Brandify error:', error);
            ui.showToast({ message: 'Could not brandify the design.', variant: 'negative' });
         } finally {
            hideLoader();
         }
    };


    // --- UI Updates ---
    const updateComplianceUI = (score, feedback) => {
        resultsDiv.style.display = 'block';
        scoreSpan.textContent = score;
        feedbackSpan.textContent = feedback;
        const deg = (score / 100) * 360;
        let color = 'var(--error-color)';
        if (score >= 80) color = 'var(--success-color)';
        else if (score >= 50) color = 'var(--warning-color)';
        scoreCircle.style.background = `conic-gradient(${color} ${deg}deg, var(--border-color) ${deg}deg)`;
    };

    const updateFixesUI = (fixes) => {
        fixesList.innerHTML = '';
        if (fixes && fixes.length > 0) {
            fixesContainer.style.display = 'block';
            noIssuesDiv.style.display = 'none';
            fixes.forEach((fix, index) => {
                const li = document.createElement('li');
                li.innerHTML = `<span>${fix.description}</span><button data-fix-index="${index}">Apply</button>`;
                fixesList.appendChild(li);
            });
        } else {
            fixesContainer.style.display = 'none';
            noIssuesDiv.style.display = 'block';
        }
    };

    const populateBrandKit = () => {
        // Brand Navigator
        const colorsHtml = `
            <div>
                <h5>Primary Colors</h5>
                <div style="display: flex; gap: 8px;">
                    ${brandFingerprint.primaryColors.map(c => `<div style="width: 24px; height: 24px; background-color: ${c}; border-radius: 50%; border: 1px solid #ccc;"></div>`).join('')}
                </div>
            </div>
            <div style="margin-top: 12px;">
                <h5>Typography</h5>
                <p style="font-size: 13px; color: var(--muted-text-color);">${brandFingerprint.typographyStyle}</p>
            </div>`;
        brandNavigatorContent.innerHTML = colorsHtml;

        // Asset Library
        assetLibraryGrid.innerHTML = '';
        projectAssets.forEach(asset => {
            const item = document.createElement('div');
            item.className = 'asset-item';
            item.innerHTML = `
                <div class="img-container"><img src="${asset.dataUri}" alt="${asset.name}" /></div>
                <p>${asset.name}</p>`;
            item.addEventListener('click', async () => {
                const imageBlob = await dataUriToBlob(asset.dataUri);
                await expressDocument.addImage(imageBlob);
            });
            assetLibraryGrid.appendChild(item);
        });

        // Snippets
        snippetLibraryGrid.innerHTML = '';
         projectSnippets.forEach(snippet => {
            const item = document.createElement('div');
            item.className = 'asset-item';
            item.innerHTML = `
                <div class="img-container"><img src="${snippet.dataUri}" alt="${snippet.name}" /></div>
                <p>${snippet.name}</p>`;
            item.addEventListener('click', async () => {
                const imageBlob = await dataUriToBlob(snippet.dataUri);
                await expressDocument.addImage(imageBlob);
            });
            snippetLibraryGrid.appendChild(item);
        });
    };
    
    // --- Event Listeners ---
    
    // SDK Events
    expressDocument.onChange((event) => {
        if (event.type === 'documentChanged' && PROJECT_ID) {
            clearTimeout(DEBOUNCE_TIMER);
            DEBOUNCE_TIMER = setTimeout(performLiveAnalysis, 1500); // Debounce for 1.5s
        }
    });
    
    // Tabbed Navigation
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const tabId = `${tab.dataset.tab}-tab`;
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === tabId) {
                    content.classList.add('active');
                }
            });
        });
    });

    // Button Clicks
    fixesList.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            const index = e.target.dataset.fixIndex;
            if (index && lastFixes[index]) {
                applyFix(lastFixes[index]);
            }
        }
    });

    instantBrandifyBtn.addEventListener('click', async () => {
        if (!lastFixes || lastFixes.length === 0) {
            ui.showToast({ message: 'No fixes to apply.', variant: 'informative' });
            return;
        }
        const rendition = await expressDocument.createRendition({ type: 'image/png', range: 'currentPage' });
        await handleBrandify(rendition, lastFixes);
    });

    brandifyTemplateBtn.addEventListener('click', async () => {
        try {
            const template = await app.browseAndGetTemplate();
            if (template) {
                await expressDocument.addPage(template);
                // After adding template, we need a moment for it to render before creating a rendition
                setTimeout(async () => {
                    const rendition = await expressDocument.createRendition({ type: 'image/png', range: 'currentPage' });
                    // A "brandified" template means applying all brand rules
                    const allFixes = [{ description: 'Apply all brand colors and typography styles to the template.' }];
                    await handleBrandify(rendition, allFixes);
                }, 500);
            }
        } catch (error) {
             console.error("Error in brandify template:", error);
             ui.showToast({ message: `Could not brandify template: ${error.message}`, variant: 'negative' });
        }
    });

    saveSnippetBtn.addEventListener('click', async () => {
        // In a real app, you'd get the selection and save it to your backend.
        ui.showToast({ message: 'Snippet saving is a demo feature.', variant: 'informative' });
    });

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const query = chatInput.value.trim();
        if (!query) return;

        chatInput.value = '';
        const userMsgDiv = document.createElement('div');
        userMsgDiv.className = 'chat-message user-message';
        userMsgDiv.textContent = query;
        chatMessages.appendChild(userMsgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        showLoader('Thinking...');
        try {
            const result = await api.getBrandCopy(query);
            const assistantMsgDiv = document.createElement('div');
            assistantMsgDiv.className = 'chat-message assistant-message';
            assistantMsgDiv.textContent = result.response;
            chatMessages.appendChild(assistantMsgDiv);
        } catch(e) {
             ui.showToast({ message: `Could not get copy: ${e.message}`, variant: 'negative' });
        } finally {
            hideLoader();
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    });

    generateTaglinesBtn.addEventListener('click', async () => {
         showLoader('Generating taglines...');
         taglineResults.innerHTML = '';
         try {
             // We can reuse the copy assistant for this
             const result = await api.getBrandCopy("Generate 3 short, snappy taglines based on the brand's overall aesthetic.");
             const taglines = result.response.split('\n').filter(t => t.trim() !== '');
             taglineResults.innerHTML = taglines.map(t => `<p style="border: 1px solid #ddd; padding: 8px; border-radius: 4px; font-size: 13px;">${t}</p>`).join('');
         } catch(e) {
             ui.showToast({ message: `Could not get taglines: ${e.message}`, variant: 'negative' });
         } finally {
            hideLoader();
         }
    });
    

    // --- Initial Load ---
    const initializeAddon = async () => {
        showLoader('Loading brand...');
        try {
            // Check if a project ID is associated with the Express document
            const docMetadata = await expressDocument.getMetadata();
            PROJECT_ID = docMetadata.brandGuardianProjectId;

            if (!PROJECT_ID) {
                // TODO: Show a UI for the user to select one of their projects
                // and then call expressDocument.setMetadata({ brandGuardianProjectId: ... });
                ui.showToast({ message: "No Brand Guardian project linked. Please link a project in the main app.", variant: 'negative' });
                throw new Error("No project linked.");
            }

            const details = await api.getProjectDetails(PROJECT_ID);
            brandFingerprint = details.brandFingerprint;
            projectAssets = [
                { name: 'Logo', type: 'logo', dataUri: details.logoDataUri },
                ...details.assets
            ];
            projectSnippets = details.snippets || [];
            populateBrandKit();
            await performLiveAnalysis(); // Initial check
        } catch (error) {
            console.error('Initialization failed:', error);
            // Don't show a toast if the only error is a missing project ID,
            // as a more helpful message is already shown above.
            if (error.message !== "No project linked.") {
                ui.showToast({ message: 'Failed to load brand data.', variant: 'negative' });
            }
        } finally {
            hideLoader();
        }
    };

    initializeAddon();
});
