// Main script for the ARFID Safe Foods application

document.addEventListener('DOMContentLoaded', function() {
    // Initialize variables
    let selectedFoods = [];
    
    // Load selected foods from localStorage if available
    if (localStorage.getItem('arfidSelectedFoods')) {
        try {
            selectedFoods = JSON.parse(localStorage.getItem('arfidSelectedFoods'));
        } catch (e) {
            console.error('Error loading saved foods:', e);
            selectedFoods = [];
        }
    }
    
    // Check if we're on the main selection page
    if (document.getElementById('food-selection')) {
        initializeFoodSelection(selectedFoods);
    }
    
    // Check if we're on the preview page
    if (document.getElementById('preview-page')) {
        initializePreview(selectedFoods);
    }
});

function initializeFoodSelection(selectedFoods) {
    const foodContainer = document.getElementById('food-list-container');
    const searchInput = document.getElementById('food-search');
    const selectedCounter = document.getElementById('selected-counter');
    const goToPreviewBtn = document.getElementById('go-to-preview');
    
    // Update selected counter
    updateSelectedCounter(selectedFoods.length);
    
    // Create category filter buttons
    createCategoryFilters();
    
    // Render all food categories and items
    renderFoodCategories(foodContainer, selectedFoods);
    
    // Set up search functionality
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            filterFoodItems(searchTerm);
        });
    }
    
    // Set up show all categories button
    const showAllBtn = document.getElementById('show-all-categories');
    if (showAllBtn) {
        showAllBtn.addEventListener('click', function() {
            resetCategoryFilters();
            // If there's a search term, still apply that filter
            if (searchInput.value) {
                filterFoodItems(searchInput.value.toLowerCase());
            }
        });
    }
    
    // Go to preview button functionality
    if (goToPreviewBtn) {
        goToPreviewBtn.addEventListener('click', function() {
            // Save selected foods to localStorage
            localStorage.setItem('arfidSelectedFoods', JSON.stringify(selectedFoods));
            
            // Navigate to preview page
            window.location.href = '/preview';
        });
        
        // Enable/disable button based on selection
        updatePreviewButton(selectedFoods.length > 0);
    }
    
    // Function to update selected counter
    function updateSelectedCounter(count) {
        if (selectedCounter) {
            selectedCounter.textContent = count;
            
            // Update preview button state
            updatePreviewButton(count > 0);
        }
    }
    
    // Function to update preview button state
    function updatePreviewButton(enabled) {
        if (goToPreviewBtn) {
            if (enabled) {
                goToPreviewBtn.classList.remove('disabled');
                goToPreviewBtn.removeAttribute('disabled');
            } else {
                goToPreviewBtn.classList.add('disabled');
                goToPreviewBtn.setAttribute('disabled', 'disabled');
            }
        }
    }
    
    // Function to render all food categories and items
    function renderFoodCategories(container, selectedFoods) {
        if (!container) return;
        
        // Clear container
        container.innerHTML = '';
        
        // Loop through all food categories
        FOOD_DATA.forEach(category => {
            // Create category section
            const categorySection = document.createElement('div');
            categorySection.className = 'category-section mb-4';
            categorySection.setAttribute('data-category', category.name.toLowerCase());
            
            // Create category header
            const categoryHeader = document.createElement('h3');
            categoryHeader.className = 'category-header';
            categoryHeader.textContent = category.name;
            categorySection.appendChild(categoryHeader);
            
            // Create food items container
            const foodItemsContainer = document.createElement('div');
            foodItemsContainer.className = 'food-items-container';
            
            // Add food items to container
            category.items.forEach(food => {
                const foodItem = createFoodItem(food, selectedFoods.some(f => f.id === food.id));
                foodItemsContainer.appendChild(foodItem);
                
                // Add click event to toggle selection
                foodItem.addEventListener('click', function() {
                    toggleFoodSelection(food, foodItem);
                });
            });
            
            categorySection.appendChild(foodItemsContainer);
            container.appendChild(categorySection);
        });
    }
    
    // Function to create a food item element
    function createFoodItem(food, isSelected) {
        const foodItem = document.createElement('div');
        foodItem.className = `food-item d-flex align-items-center ${isSelected ? 'selected' : ''}`;
        foodItem.setAttribute('data-food-id', food.id);
        foodItem.setAttribute('data-food-name', food.name.toLowerCase());
        
        const emoji = document.createElement('span');
        emoji.className = 'food-emoji';
        emoji.textContent = food.emoji;
        
        const name = document.createElement('span');
        name.className = 'food-name';
        name.textContent = food.name;
        
        foodItem.appendChild(emoji);
        foodItem.appendChild(name);
        
        return foodItem;
    }
    
    // Function to toggle food selection
    function toggleFoodSelection(food, foodItem) {
        const index = selectedFoods.findIndex(f => f.id === food.id);
        
        if (index === -1) {
            // Add to selected foods
            selectedFoods.push(food);
            foodItem.classList.add('selected');
        } else {
            // Remove from selected foods
            selectedFoods.splice(index, 1);
            foodItem.classList.remove('selected');
        }
        
        // Update selected counter
        updateSelectedCounter(selectedFoods.length);
    }
    
    // Function to filter food items based on search
    function filterFoodItems(searchTerm) {
        const foodItems = document.querySelectorAll('.food-item');
        const categories = document.querySelectorAll('.category-section');
        
        let visibleCounts = {};
        
        // Initialize category counts
        categories.forEach(category => {
            const categoryName = category.getAttribute('data-category');
            visibleCounts[categoryName] = 0;
        });
        
        // Filter food items
        foodItems.forEach(item => {
            const foodName = item.getAttribute('data-food-name');
            const categorySection = item.closest('.category-section');
            const categoryName = categorySection.getAttribute('data-category');
            
            if (foodName.includes(searchTerm)) {
                item.style.display = '';
                visibleCounts[categoryName]++;
            } else {
                item.style.display = 'none';
            }
        });
        
        // Show/hide categories based on visible items
        categories.forEach(category => {
            const categoryName = category.getAttribute('data-category');
            if (visibleCounts[categoryName] > 0) {
                category.style.display = '';
            } else {
                category.style.display = 'none';
            }
        });
    }
    
    // Function to create category filter buttons
    function createCategoryFilters() {
        const filterContainer = document.getElementById('category-filters');
        if (!filterContainer) return;
        
        // Clear existing buttons
        filterContainer.innerHTML = '';
        
        // Add a button for each food category
        FOOD_DATA.forEach(category => {
            // Get a representative emoji for this category
            const representativeEmoji = category.items[0]?.emoji || '📋';
            
            const button = document.createElement('button');
            button.className = 'btn category-filter-btn';
            button.setAttribute('data-category', category.name.toLowerCase());
            
            const emojiSpan = document.createElement('span');
            emojiSpan.className = 'category-emoji';
            emojiSpan.textContent = representativeEmoji;
            
            const nameSpan = document.createElement('span');
            nameSpan.textContent = category.name;
            
            button.appendChild(emojiSpan);
            button.appendChild(nameSpan);
            
            // Add click event to filter by category
            button.addEventListener('click', function() {
                filterByCategory(category.name.toLowerCase(), this);
            });
            
            filterContainer.appendChild(button);
        });
    }
    
    // Function to filter foods by category
    function filterByCategory(categoryName, buttonElement) {
        const categories = document.querySelectorAll('.category-section');
        const filterButtons = document.querySelectorAll('.category-filter-btn');
        
        // Remove 'active' class from all buttons
        filterButtons.forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Add 'active' class to the clicked button
        if (buttonElement) {
            buttonElement.classList.add('active');
        }
        
        // Hide all categories except the selected one
        categories.forEach(category => {
            const thisCategoryName = category.getAttribute('data-category');
            if (thisCategoryName === categoryName) {
                category.classList.remove('category-hidden');
                category.style.display = '';
            } else {
                category.classList.add('category-hidden');
                category.style.display = 'none';
            }
        });
        
        // Clear search input when filtering by category
        const searchInput = document.getElementById('food-search');
        if (searchInput) {
            searchInput.value = '';
        }
    }
    
    // Function to reset category filters and show all categories
    function resetCategoryFilters() {
        const categories = document.querySelectorAll('.category-section');
        const filterButtons = document.querySelectorAll('.category-filter-btn');
        
        // Remove 'active' class from all buttons
        filterButtons.forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Show all categories
        categories.forEach(category => {
            category.classList.remove('category-hidden');
            category.style.display = '';
        });
        
        // Show all food items
        const foodItems = document.querySelectorAll('.food-item');
        foodItems.forEach(item => {
            item.style.display = '';
        });
    }
}

function initializePreview(selectedFoods) {
    const previewContainer = document.getElementById('preview-foods-container');
    const previewPdfBtn = document.getElementById('preview-pdf-btn');
    const downloadPdfBtn = document.getElementById('download-pdf-btn');
    const backToSelectionBtn = document.getElementById('back-to-selection');
    const notesContainer = document.getElementById('notes-container');
    
    // Render selected foods in preview
    if (previewContainer) {
        renderSelectedFoods(previewContainer, selectedFoods);
    }
    
    // Set up PDF preview and download buttons
    if (previewPdfBtn) {
        previewPdfBtn.addEventListener('click', function() {
            // Show PDF preview in a modal
            generatePdfPreview();
        });
    }
    
    if (downloadPdfBtn) {
        downloadPdfBtn.addEventListener('click', function(e) {
            e.preventDefault();
            // Download PDF
            generateAndDownloadPdf(selectedFoods);
        });
    }
    
    // Image download button functionality
    const downloadImageBtn = document.getElementById('download-image-btn');
    if (downloadImageBtn) {
        downloadImageBtn.addEventListener('click', function(e) {
            e.preventDefault();
            // Download as image
            generateAndDownloadImage(selectedFoods);
        });
    }
    
    // Back button functionality
    if (backToSelectionBtn) {
        backToSelectionBtn.addEventListener('click', function() {
            // Go back to selection page
            window.location.href = '/';
        });
    }
    
    // Function to render selected foods in preview
    function renderSelectedFoods(container, foods) {
        if (!container) return;
        
        // Clear container
        container.innerHTML = '';
        
        if (foods.length === 0) {
            // No foods selected message
            const noFoodsMsg = document.createElement('div');
            noFoodsMsg.className = 'alert alert-info';
            noFoodsMsg.textContent = 'No foods selected. Go back to add some safe foods to your list.';
            container.appendChild(noFoodsMsg);
            
            // Disable buttons
            if (previewPdfBtn) previewPdfBtn.classList.add('disabled');
            const downloadBtn = document.getElementById('downloadOptions');
            if (downloadBtn) downloadBtn.classList.add('disabled');
            
            return;
        }
        
        // Enable buttons
        if (previewPdfBtn) previewPdfBtn.classList.remove('disabled');
        const downloadBtn = document.getElementById('downloadOptions');
        if (downloadBtn) downloadBtn.classList.remove('disabled');
        
        // Group foods by category
        const foodsByCategory = {};
        
        foods.forEach(food => {
            const category = food.category;
            if (!foodsByCategory[category]) {
                foodsByCategory[category] = [];
            }
            foodsByCategory[category].push(food);
        });
        
        // Create food items by category
        for (const category in foodsByCategory) {
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'food-category mb-3';
            
            const categoryHeader = document.createElement('h4');
            categoryHeader.className = 'preview-category-header';
            categoryHeader.textContent = category;
            categoryDiv.appendChild(categoryHeader);
            
            foodsByCategory[category].forEach(food => {
                const foodDetail = createFoodDetailItem(food);
                categoryDiv.appendChild(foodDetail);
            });
            
            container.appendChild(categoryDiv);
        }
        
        // Add notes functionality for each food item
        setupNotesFunction();
    }
    
    // Function to create a food detail item with notes
    function createFoodDetailItem(food) {
        const foodDetail = document.createElement('div');
        foodDetail.className = 'food-detail';
        foodDetail.setAttribute('data-food-id', food.id);
        
        const emoji = document.createElement('span');
        emoji.className = 'food-detail-emoji';
        emoji.textContent = food.emoji;
        
        const detailContent = document.createElement('div');
        detailContent.className = 'food-detail-content w-100';
        
        const nameRow = document.createElement('div');
        nameRow.className = 'd-flex justify-content-between align-items-center';
        
        const name = document.createElement('span');
        name.className = 'food-name';
        name.textContent = food.name;
        
        const buttonGroup = document.createElement('div');
        buttonGroup.className = 'btn-group';
        
        const addNoteBtn = document.createElement('button');
        addNoteBtn.className = 'btn btn-sm btn-outline-secondary add-note-btn';
        addNoteBtn.textContent = 'Add Note';
        addNoteBtn.setAttribute('data-food-id', food.id);
        
        const addBrandBtn = document.createElement('button');
        addBrandBtn.className = 'btn btn-sm btn-outline-primary add-brand-btn';
        addBrandBtn.textContent = 'Add Brand';
        addBrandBtn.setAttribute('data-food-id', food.id);
        
        buttonGroup.appendChild(addNoteBtn);
        buttonGroup.appendChild(addBrandBtn);
        
        nameRow.appendChild(name);
        nameRow.appendChild(buttonGroup);
        
        // Get saved note if exists
        const savedNote = localStorage.getItem(`food-note-${food.id}`);
        
        // If there's a saved note, display it
        if (savedNote) {
            const noteDisplay = document.createElement('div');
            noteDisplay.className = 'food-notes mt-1';
            noteDisplay.textContent = savedNote;
            detailContent.appendChild(nameRow);
            detailContent.appendChild(noteDisplay);
        } else {
            detailContent.appendChild(nameRow);
        }
        
        foodDetail.appendChild(emoji);
        foodDetail.appendChild(detailContent);
        
        return foodDetail;
    }
    
    // Setup notes and brand functionality
    function setupNotesFunction() {
        // Add note buttons
        const addNoteBtns = document.querySelectorAll('.add-note-btn');
        
        addNoteBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const foodId = this.getAttribute('data-food-id');
                const foodDetail = this.closest('.food-detail');
                const foodName = foodDetail.querySelector('.food-name').textContent;
                
                // Get existing note if any
                const existingNote = localStorage.getItem(`food-note-${foodId}`) || '';
                
                // Create modal for note input
                createNoteModal(foodId, foodName, existingNote);
            });
        });
        
        // Add brand buttons
        const addBrandBtns = document.querySelectorAll('.add-brand-btn');
        
        addBrandBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const foodId = this.getAttribute('data-food-id');
                const foodDetail = this.closest('.food-detail');
                const foodName = foodDetail.querySelector('.food-name').textContent;
                
                // Get existing brand if any
                const existingBrand = localStorage.getItem(`food-brand-${foodId}`) || '';
                
                // Create modal for brand input
                createBrandModal(foodId, foodName, existingBrand);
            });
        });
    }
    
    // Create modal for note input
    function createNoteModal(foodId, foodName, existingNote) {
        // Create modal elements
        const modalBackdrop = document.createElement('div');
        modalBackdrop.className = 'modal-backdrop fade show';
        document.body.appendChild(modalBackdrop);
        
        const modalHTML = `
            <div class="modal fade show" style="display: block;" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Add Note for ${foodName}</h5>
                            <button type="button" class="btn-close close-note-modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="form-group">
                                <label for="food-note">Add details like brand preferences or preparation methods:</label>
                                <textarea class="form-control" id="food-note" rows="3">${existingNote}</textarea>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary close-note-modal">Cancel</button>
                            <button type="button" class="btn btn-primary save-note" data-food-id="${foodId}">Save Note</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHTML;
        document.body.appendChild(modalContainer);
        
        // Add event listeners for modal actions
        const closeButtons = document.querySelectorAll('.close-note-modal');
        closeButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                modalContainer.remove();
                modalBackdrop.remove();
            });
        });
        
        const saveButton = document.querySelector('.save-note');
        saveButton.addEventListener('click', function() {
            const noteText = document.getElementById('food-note').value.trim();
            const foodId = this.getAttribute('data-food-id');
            
            // Save note to localStorage
            if (noteText) {
                localStorage.setItem(`food-note-${foodId}`, noteText);
            } else {
                localStorage.removeItem(`food-note-${foodId}`);
            }
            
            // Update the UI
            updateNoteDisplay(foodId, noteText);
            
            // Close modal
            modalContainer.remove();
            modalBackdrop.remove();
        });
    }
    
    // Create modal for brand input
    function createBrandModal(foodId, foodName, existingBrand) {
        // Create modal elements
        const modalBackdrop = document.createElement('div');
        modalBackdrop.className = 'modal-backdrop fade show';
        document.body.appendChild(modalBackdrop);
        
        const modalHTML = `
            <div class="modal fade show" style="display: block;" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Add Brand for ${foodName}</h5>
                            <button type="button" class="btn-close close-brand-modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="form-group">
                                <label for="food-brand">Specify your preferred brand:</label>
                                <input type="text" class="form-control" id="food-brand" value="${existingBrand}" placeholder="E.g., Brand name or specific product type">
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary close-brand-modal">Cancel</button>
                            <button type="button" class="btn btn-primary save-brand" data-food-id="${foodId}">Save Brand</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHTML;
        document.body.appendChild(modalContainer);
        
        // Add event listeners for modal actions
        const closeButtons = document.querySelectorAll('.close-brand-modal');
        closeButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                modalContainer.remove();
                modalBackdrop.remove();
            });
        });
        
        const saveButton = document.querySelector('.save-brand');
        saveButton.addEventListener('click', function() {
            const brandText = document.getElementById('food-brand').value.trim();
            const foodId = this.getAttribute('data-food-id');
            
            // Save brand to localStorage
            if (brandText) {
                localStorage.setItem(`food-brand-${foodId}`, brandText);
            } else {
                localStorage.removeItem(`food-brand-${foodId}`);
            }
            
            // Update the UI
            updateBrandDisplay(foodId, brandText);
            
            // Close modal
            modalContainer.remove();
            modalBackdrop.remove();
        });
    }
    
    // Update note display in the UI
    function updateNoteDisplay(foodId, noteText) {
        const foodDetail = document.querySelector(`.food-detail[data-food-id="${foodId}"]`);
        if (!foodDetail) return;
        
        const detailContent = foodDetail.querySelector('.food-detail-content');
        
        // Remove existing note if any
        const existingNote = detailContent.querySelector('.food-notes');
        if (existingNote) {
            existingNote.remove();
        }
        
        // Add new note if provided
        if (noteText) {
            const noteDisplay = document.createElement('div');
            noteDisplay.className = 'food-notes mt-1';
            noteDisplay.textContent = noteText;
            detailContent.appendChild(noteDisplay);
        }
    }
    
    // Update brand display in the UI
    function updateBrandDisplay(foodId, brandText) {
        const foodDetail = document.querySelector(`.food-detail[data-food-id="${foodId}"]`);
        if (!foodDetail) return;
        
        const detailContent = foodDetail.querySelector('.food-detail-content');
        
        // Remove existing brand if any
        const existingBrand = detailContent.querySelector('.food-brand');
        if (existingBrand) {
            existingBrand.remove();
        }
        
        // Add new brand if provided
        if (brandText) {
            const brandDisplay = document.createElement('div');
            brandDisplay.className = 'food-brand mt-1 badge bg-primary';
            brandDisplay.textContent = `Brand: ${brandText}`;
            
            // Insert brand after the food name but before notes
            const nameRow = detailContent.querySelector('.d-flex');
            nameRow.insertAdjacentElement('afterend', brandDisplay);
        }
    }
    
    // Function to show PDF/Document preview
    function generatePdfPreview() {
        // Show loading message
        const loadingToast = document.createElement('div');
        loadingToast.className = 'position-fixed top-50 start-50 translate-middle p-3 bg-dark text-white rounded shadow';
        loadingToast.style.zIndex = '9999';
        loadingToast.innerHTML = `
            <div class="d-flex align-items-center">
                <div class="spinner-border spinner-border-sm me-2" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <div>Preparing preview...</div>
            </div>
        `;
        document.body.appendChild(loadingToast);
        
        // Generate the content in the same way as the PDF
        // Create a container for the content to be captured
        const previewContainer = document.createElement('div');
        previewContainer.className = 'pdf-export-container';
        previewContainer.style.width = '100%';
        previewContainer.style.backgroundColor = '#ffffff';
        previewContainer.style.padding = '30px';
        previewContainer.style.boxSizing = 'border-box';
        previewContainer.style.fontFamily = 'Arial, sans-serif';
        previewContainer.style.borderRadius = '8px';
        previewContainer.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
        
        // Create header section
        const header = document.createElement('div');
        header.style.backgroundColor = '#2980b9';
        header.style.color = 'white';
        header.style.padding = '20px';
        header.style.borderRadius = '8px';
        header.style.marginBottom = '20px';
        header.style.textAlign = 'center';
        
        const title = document.createElement('h1');
        title.textContent = 'All My Safe Foods';
        title.style.margin = '0 0 10px 0';
        title.style.fontSize = '28px';
        
        const date = document.createElement('p');
        date.textContent = `Created on ${new Date().toLocaleDateString()}`;
        date.style.margin = '0 0 5px 0';
        date.style.fontSize = '14px';
        
        // Always add title and date
        header.appendChild(title);
        header.appendChild(date);
        
        // Add user name if provided
        const userName = document.getElementById('user-name')?.value;
        if (userName && userName.trim() !== '') {
            const userNameElement = document.createElement('p');
            userNameElement.textContent = `Created by: ${userName}`;
            userNameElement.style.margin = '0';
            userNameElement.style.fontSize = '14px';
            userNameElement.style.fontStyle = 'italic';
            header.appendChild(userNameElement);
        }
        previewContainer.appendChild(header);
        
        // Group foods by category
        const foodsByCategory = {};
        
        selectedFoods.forEach(food => {
            const category = food.category;
            if (!foodsByCategory[category]) {
                foodsByCategory[category] = [];
            }
            foodsByCategory[category].push(food);
        });
        
        // Add foods by category
        for (const category in foodsByCategory) {
            // Create category section
            const categorySection = document.createElement('div');
            categorySection.style.marginBottom = '20px';
            
            const categoryHeader = document.createElement('div');
            categoryHeader.style.backgroundColor = 'rgba(41, 128, 185, 0.1)';
            categoryHeader.style.borderLeft = '4px solid #2980b9';
            categoryHeader.style.padding = '8px 15px';
            categoryHeader.style.borderRadius = '4px';
            categoryHeader.style.marginBottom = '10px';
            
            const categoryTitle = document.createElement('h3');
            categoryTitle.textContent = category;
            categoryTitle.style.margin = '0';
            categoryTitle.style.color = '#2980b9';
            categoryTitle.style.fontSize = '18px';
            
            categoryHeader.appendChild(categoryTitle);
            categorySection.appendChild(categoryHeader);
            
            // Add foods in this category
            const foodsList = document.createElement('div');
            foodsList.style.paddingLeft = '10px';
            
            foodsByCategory[category].forEach(food => {
                const foodItem = document.createElement('div');
                foodItem.style.display = 'flex';
                foodItem.style.alignItems = 'flex-start';
                foodItem.style.padding = '8px 0';
                foodItem.style.borderBottom = '1px solid #eee';
                
                const emoji = document.createElement('div');
                emoji.textContent = food.emoji;
                emoji.style.fontSize = '24px';
                emoji.style.marginRight = '15px';
                emoji.style.width = '30px';
                emoji.style.textAlign = 'center';
                
                const foodContent = document.createElement('div');
                foodContent.style.flex = '1';
                
                const foodName = document.createElement('div');
                foodName.textContent = food.name;
                foodName.style.fontWeight = 'bold';
                foodName.style.fontSize = '16px';
                foodName.style.color = '#333';
                
                foodContent.appendChild(foodName);
                
                // Add brand if exists
                const brand = localStorage.getItem(`food-brand-${food.id}`);
                if (brand && brand.trim() !== '') {
                    const brandContainer = document.createElement('div');
                    brandContainer.style.marginTop = '5px';
                    brandContainer.style.display = 'inline-block';
                    brandContainer.style.padding = '2px 6px';
                    brandContainer.style.backgroundColor = '#2980b9';
                    brandContainer.style.color = 'white';
                    brandContainer.style.borderRadius = '4px';
                    brandContainer.style.fontSize = '12px';
                    brandContainer.style.fontWeight = 'bold';
                    brandContainer.textContent = `Brand: ${brand}`;
                    
                    foodContent.appendChild(brandContainer);
                }
                
                // Add note if exists
                const note = localStorage.getItem(`food-note-${food.id}`);
                if (note && note.trim() !== '') {
                    const noteContainer = document.createElement('div');
                    noteContainer.style.marginTop = '5px';
                    noteContainer.style.marginLeft = '10px';
                    noteContainer.style.paddingLeft = '10px';
                    noteContainer.style.borderLeft = '2px solid #ccc';
                    
                    const noteLabel = document.createElement('div');
                    noteLabel.textContent = 'NOTES:';
                    noteLabel.style.fontSize = '10px';
                    noteLabel.style.fontWeight = 'bold';
                    noteLabel.style.color = '#777';
                    noteLabel.style.marginBottom = '3px';
                    
                    const noteText = document.createElement('div');
                    noteText.textContent = note;
                    noteText.style.fontSize = '13px';
                    noteText.style.fontStyle = 'italic';
                    noteText.style.color = '#555';
                    
                    noteContainer.appendChild(noteLabel);
                    noteContainer.appendChild(noteText);
                    foodContent.appendChild(noteContainer);
                }
                
                foodItem.appendChild(emoji);
                foodItem.appendChild(foodContent);
                foodsList.appendChild(foodItem);
            });
            
            categorySection.appendChild(foodsList);
            previewContainer.appendChild(categorySection);
        }
        
        // Add footer
        const footer = document.createElement('div');
        footer.style.textAlign = 'center';
        footer.style.marginTop = '20px';
        footer.style.paddingTop = '10px';
        footer.style.borderTop = '1px solid #eee';
        footer.style.color = '#777';
        footer.style.fontSize = '12px';
        footer.textContent = 'ARFID Safe Foods List';
        
        previewContainer.appendChild(footer);
        
        // Now create the modal to display this preview
        const modalBackdrop = document.createElement('div');
        modalBackdrop.className = 'modal-backdrop fade show';
        
        const modalHTML = `
            <div class="modal fade show" style="display: block;" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header bg-primary text-white">
                            <h5 class="modal-title">Document Preview</h5>
                            <button type="button" class="btn-close btn-close-white close-pdf-modal"></button>
                        </div>
                        <div class="modal-body p-3">
                            <div id="preview-container" class="overflow-auto" style="max-height: 70vh;"></div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary close-pdf-modal">
                                <i class="fas fa-times me-1"></i> Close
                            </button>
                            <div class="dropdown">
                                <button class="btn btn-primary dropdown-toggle" type="button" id="previewDownloadOptions" data-bs-toggle="dropdown" aria-expanded="false">
                                    <i class="fas fa-download me-1"></i> Download
                                </button>
                                <ul class="dropdown-menu" aria-labelledby="previewDownloadOptions">
                                    <li><a class="dropdown-item preview-download-pdf" href="#"><i class="fas fa-file-pdf me-2"></i> PDF Document</a></li>
                                    <li><a class="dropdown-item preview-download-image" href="#"><i class="fas fa-file-image me-2"></i> Image (PNG)</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHTML;
        
        // Remove loading message
        document.body.removeChild(loadingToast);
        
        // Add modal and backdrop to the document
        document.body.appendChild(modalBackdrop);
        document.body.appendChild(modalContainer);
        
        // Add the preview content to the modal
        const previewContainerElement = document.getElementById('preview-container');
        previewContainerElement.appendChild(previewContainer);
        
        // Add event listeners for modal actions
        const closeButtons = document.querySelectorAll('.close-pdf-modal');
        closeButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                modalContainer.remove();
                modalBackdrop.remove();
            });
        });
        
        // Add event listeners for download options
        const pdfDownloadButton = document.querySelector('.preview-download-pdf');
        pdfDownloadButton.addEventListener('click', function() {
            generateAndDownloadPdf(selectedFoods);
        });
        
        const imageDownloadButton = document.querySelector('.preview-download-image');
        imageDownloadButton.addEventListener('click', function() {
            generateAndDownloadImage(selectedFoods);
        });
    }
}
