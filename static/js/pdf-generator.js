// PDF Generator for ARFID Safe Foods List

/**
 * Generates and downloads a PDF of the selected safe foods using html2canvas for better emoji support
 * @param {Array} selectedFoods - Array of selected food objects
 */
function generateAndDownloadPdf(selectedFoods) {
    if (!selectedFoods || selectedFoods.length === 0) {
        alert('Please select at least one food to generate a PDF.');
        return;
    }
    
    // Show loading message
    const loadingToast = document.createElement('div');
    loadingToast.className = 'position-fixed top-50 start-50 translate-middle p-3 bg-dark text-white rounded shadow';
    loadingToast.style.zIndex = '9999';
    loadingToast.innerHTML = `
        <div class="d-flex align-items-center">
            <div class="spinner-border spinner-border-sm me-2" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <div>Generating PDF...</div>
        </div>
    `;
    document.body.appendChild(loadingToast);
    
    // Create a container for the content to be captured
    const container = document.createElement('div');
    container.className = 'pdf-export-container';
    container.style.width = '800px';
    container.style.backgroundColor = '#ffffff';
    container.style.padding = '30px';
    container.style.boxSizing = 'border-box';
    container.style.fontFamily = 'Arial, sans-serif';
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    
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
    
    // Add user name if provided
    const userName = document.getElementById('user-name')?.value;
    
    // Always add title and date
    header.appendChild(title);
    header.appendChild(date);
    
    // Add username if provided
    if (userName && userName.trim() !== '') {
        const userNameElement = document.createElement('p');
        userNameElement.textContent = `Created by: ${userName}`;
        userNameElement.style.margin = '0';
        userNameElement.style.fontSize = '14px';
        userNameElement.style.fontStyle = 'italic';
        header.appendChild(userNameElement);
    }
    container.appendChild(header);
    
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
        container.appendChild(categorySection);
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
    
    container.appendChild(footer);
    document.body.appendChild(container);
    
    // Use html2canvas to capture the container as an image
    html2canvas(container, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
    }).then(canvas => {
        // Create PDF with jsPDF
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jspdf.jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });
        
        // Calculate dimensions to fit on A4
        const imgWidth = 210; // A4 width in mm
        const pageHeight = 297; // A4 height in mm
        const imgHeight = canvas.height * imgWidth / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;
        
        // Add first page
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        
        // Add additional pages if needed for long content
        while (heightLeft > 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }
        
        // Set document properties
        pdf.setProperties({
            title: 'All My Safe Foods',
            subject: 'ARFID Safe Foods List',
            creator: 'ARFID Safe Foods App'
        });
        
        // Save the PDF
        pdf.save('All-My-Safe-Foods.pdf');
        
        // Clean up
        document.body.removeChild(container);
        document.body.removeChild(loadingToast);
        
        // Show success message
        const successToast = document.createElement('div');
        successToast.className = 'position-fixed bottom-0 end-0 p-3';
        successToast.style.zIndex = '9999';
        successToast.innerHTML = `
            <div class="toast show" role="alert">
                <div class="toast-header bg-success text-white">
                    <i class="fas fa-check-circle me-2"></i>
                    <strong class="me-auto">Success</strong>
                    <button type="button" class="btn-close btn-close-white" onclick="this.parentElement.parentElement.parentElement.remove()"></button>
                </div>
                <div class="toast-body">
                    PDF downloaded successfully!
                </div>
            </div>
        `;
        document.body.appendChild(successToast);
        
        // Auto-remove the success message after 3 seconds
        setTimeout(() => {
            if (document.body.contains(successToast)) {
                document.body.removeChild(successToast);
            }
        }, 3000);
    }).catch(error => {
        console.error('Error generating PDF:', error);
        document.body.removeChild(container);
        document.body.removeChild(loadingToast);
        
        // Show error message
        alert('There was an error generating the PDF. Please try again.');
    });
}
