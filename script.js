// Food data with categories and images
const FOOD_DATA = [
    { id: 'apple', name: 'Alma', calories: 95, category: 'fruits', image: 'https://public.youware.com/users-website-assets/prod/9efba591-77dc-4b67-aa6b-2890ca486213/photo-1619066045029-5c7e8537bd8c' },
    { id: 'banana', name: 'Banana', calories: 105, category: 'fruits', image: 'https://public.youware.com/users-website-assets/prod/9efba591-77dc-4b67-aa6b-2890ca486213/photo-1619066045029-5c7e8537bd8c' },
    { id: 'burger', name: 'Burger', calories: 350, category: 'fast-food', image: 'https://public.youware.com/users-website-assets/prod/9efba591-77dc-4b67-aa6b-2890ca486213/photo-1565299624946-b28f40a0ae38' },
    { id: 'pizza', name: 'Pizza Slice', calories: 285, category: 'fast-food', image: 'https://public.youware.com/users-website-assets/prod/9efba591-77dc-4b67-aa6b-2890ca486213/photo-1565299624946-b28f40a0ae38' },
    { id: 'salad', name: 'Salad', calories: 120, category: 'healthy', image: 'https://public.youware.com/users-website-assets/prod/9efba591-77dc-4b67-aa6b-2890ca486213/photo-1512003867696-6d5ce6835040' },
    { id: 'donut', name: 'Donut', calories: 195, category: 'desserts', image: 'https://public.youware.com/users-website-assets/prod/9efba591-77dc-4b67-aa6b-2890ca486213/photo-1517433367423-c7e5b0f35086' },
    { id: 'rice', name: 'Rice (1 cup)', calories: 200, category: 'staples', image: 'https://public.youware.com/users-website-assets/prod/9efba591-77dc-4b67-aa6b-2890ca486213/photo-1484723091739-30a097e8f929' },
    { id: 'coke', name: 'Soda (12oz)', calories: 140, category: 'drinks', image: 'https://public.youware.com/users-website-assets/prod/9efba591-77dc-4b67-aa6b-2890ca486213/photo-1584464491033-06628f3a6b7b' }
];

// Constants for calorie burn rates per minute based on a 150lb person
const CALORIE_BURN_RATES = {
    walking: 4.7, // calories per minute at 3mph
    running: 11.4, // calories per minute at 6mph
    cycling: 8.0 // calories per minute at 12mph
};

// Weight adjustment factor - adjust calorie burn based on weight difference from 150lbs
function getWeightFactor(weight) {
    return weight / 150;
}

// DOM Elements
const foodSelect = document.getElementById('foodSelect');
const customCalories = document.getElementById('customCalories');
const userWeight = document.getElementById('userWeight');
const walkingTimeElement = document.getElementById('walkingTime');
const runningTimeElement = document.getElementById('runningTime');
const cyclingTimeElement = document.getElementById('cyclingTime');
const exerciseChart = document.getElementById('exerciseChart');
const foodGridElement = document.getElementById('foodGrid');
const calculateBtn = document.getElementById('calculateBtn');
const foodCategoriesElement = document.getElementById('foodCategories');
const selectedFoodDisplay = document.getElementById('selectedFoodDisplay');
const selectedFoodImg = document.getElementById('selectedFoodImg');
const selectedFoodName = document.getElementById('selectedFoodName');
const selectedFoodCalories = document.getElementById('selectedFoodCalories');
const step1Element = document.getElementById('step1');
const step2Element = document.getElementById('step2');
const step3Element = document.getElementById('step3');

// Meal builder elements
const toggleMealBuilderBtn = document.getElementById('toggleMealBuilder');
const mealBuilderSection = document.getElementById('mealBuilder');
const addToMealBtn = document.getElementById('addToMealBtn');
const mealItemsContainer = document.getElementById('mealItems');
const mealTotalCalories = document.getElementById('mealTotalCalories');
const clearMealBtn = document.getElementById('clearMealBtn');
const saveMealBtn = document.getElementById('saveMealBtn');
const savedMealsContainer = document.getElementById('savedMeals');
const compareBtn = document.getElementById('compareBtn');
const mealComparisonContainer = document.getElementById('mealComparison');
const mealNameInput = document.getElementById('mealNameInput');

// Modal elements
const modalOverlay = document.getElementById('modalOverlay');
const modalCloseBtn = document.getElementById('modalClose');
const saveMealModal = document.getElementById('saveMealModal');
const saveMealConfirmBtn = document.getElementById('saveMealConfirm');

// Tab elements
const mealTabs = document.querySelectorAll('.meal-tab');
const mealContents = document.querySelectorAll('.meal-content');

// Global variables
let selectedFood = null;
let currentCategory = 'all';
let currentMeal = [];
let savedMeals = [];
let isMealBuilderVisible = false;

// Initialize the chart with default values
let myChart = new Chart(exerciseChart, {
    type: 'bar',
    data: {
        labels: ['Yurish', 'Yugirsh', 'Velosport'],
        datasets: [{
            label: 'Kaloriyalarni yoqotish uchun daqiqalar',
            data: [32, 13, 19], // Example data for visual appeal on page load
            backgroundColor: [
                'rgba(76, 175, 80, 0.7)',
                'rgba(255, 152, 0, 0.7)',
                'rgba(33, 150, 243, 0.7)'
            ],
            borderColor: [
                'rgba(76, 175, 80, 1)',
                'rgba(255, 152, 0, 1)',
                'rgba(33, 150, 243, 1)'
            ],
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Minutes'
                }
            }
        },
        plugins: {
            title: {
                display: true,
                text: 'n'
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            label += formatTime(context.parsed.y);
                        }
                        return label;
                    }
                }
            }
        }
    }
});

// Initialize the food grid with all foods
function initFoodGrid() {
    // Create unique categories for filter
    const categories = ['all', ...new Set(FOOD_DATA.map(food => food.category))];
    
    // Create category buttons
    foodCategoriesElement.innerHTML = categories.map(category => 
        `<div class="food-category ${category === 'all' ? 'active' : ''}" data-category="${category}">
            ${category.charAt(0).toUpperCase() + category.slice(1)}
        </div>`
    ).join('');
    
    // Add event listeners to category buttons
    document.querySelectorAll('.food-category').forEach(button => {
        button.addEventListener('click', function() {
            const category = this.dataset.category;
            currentCategory = category;
            
            // Update active class
            document.querySelectorAll('.food-category').forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Filter foods
            updateFoodGrid(category);
        });
    });
    
    // Initialize with all foods
    updateFoodGrid('all');
}

// Update the food grid based on selected category
function updateFoodGrid(category) {
    const foods = category === 'all' 
        ? FOOD_DATA 
        : FOOD_DATA.filter(food => food.category === category);
    
    foodGridElement.innerHTML = foods.map(food => 
        `<div class="food-item ${selectedFood && selectedFood.id === food.id ? 'selected' : ''}" data-id="${food.id}">
            <img src="${food.image}" alt="${food.name}">
            <p>${food.name}</p>
            <p class="calories">${food.calories} cal</p>
        </div>`
    ).join('');
    
    // Add event listeners to food items
    document.querySelectorAll('.food-item').forEach(item => {
        item.addEventListener('click', function() {
            const foodId = this.dataset.id;
            selectFood(foodId);
        });
    });
}

// Select a food item
function selectFood(foodId) {
    // Find the food in our data
    selectedFood = FOOD_DATA.find(food => food.id === foodId);
    
    // Update visual selection in the grid
    document.querySelectorAll('.food-item').forEach(item => {
        item.classList.remove('selected');
        if (item.dataset.id === foodId) {
            item.classList.add('selected');
        }
    });
    
    // Update the selected food display
    selectedFoodDisplay.style.display = 'flex';
    selectedFoodImg.src = selectedFood.image;
    selectedFoodName.textContent = selectedFood.name;
    selectedFoodCalories.textContent = `${selectedFood.calories} calories`;
    
    // Clear custom calories input and update dropdown for compatibility
    customCalories.value = '';
    foodSelect.value = '0';
    
    // Move to next step
    updateSteps(2);
    
    // Auto-calculate if weight is already set
    if (userWeight.value) {
        calculateExerciseTime(selectedFood.calories, parseFloat(userWeight.value));
    }
    
    // Update add to meal button
    if (addToMealBtn) {
        addToMealBtn.disabled = false;
    }
}

// Update the active step
function updateSteps(stepNumber) {
    [step1Element, step2Element, step3Element].forEach((step, index) => {
        if (index + 1 === stepNumber) {
            step.classList.add('active');
        } else if (index + 1 < stepNumber) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
        }
    });
}

// Calculate exercise time based on calories and weight
function calculateExerciseTime(calories, weight) {
    if (!calories || !weight) return;
    
    const weightFactor = getWeightFactor(weight);
    
    // Calculate minutes for each exercise type
    const walkingMinutes = Math.round(calories / (CALORIE_BURN_RATES.walking * weightFactor));
    const runningMinutes = Math.round(calories / (CALORIE_BURN_RATES.running * weightFactor));
    const cyclingMinutes = Math.round(calories / (CALORIE_BURN_RATES.cycling * weightFactor));
    
    // Update the display
    walkingTimeElement.textContent = formatTime(walkingMinutes);
    runningTimeElement.textContent = formatTime(runningMinutes);
    cyclingTimeElement.textContent = formatTime(cyclingMinutes);
    
    // Update the chart
    updateChart([walkingMinutes, runningMinutes, cyclingMinutes], calories);
    
    // Update the step
    updateSteps(3);
    
    // Animate the results for attention
    document.querySelectorAll('.exercise-card').forEach(card => {
        card.classList.add('highlight-pulse');
        setTimeout(() => card.classList.remove('highlight-pulse'), 2000);
    });
    
    // Show notification
    showNotification(`Calculations updated for ${calories} calories`);
    
    return {
        walkingMinutes,
        runningMinutes,
        cyclingMinutes
    };
}

// Format minutes into hours and minutes
function formatTime(minutes) {
    if (minutes < 60) {
        return `${minutes} minutes`;
    } else {
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return `${hours} hr ${remainingMinutes} min`;
    }
}

// Update the chart with new data
function updateChart(data, calories) {
    myChart.data.datasets[0].data = data;
    myChart.options.plugins.title.text = ` ${calories} Kaloriya`;
    myChart.update();
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Force reflow
    notification.offsetHeight;
    
    // Show the notification
    notification.classList.add('show');
    
    // Hide after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Toggle meal builder visibility
function toggleMealBuilder() {
    isMealBuilderVisible = !isMealBuilderVisible;
    
    if (isMealBuilderVisible) {
        mealBuilderSection.style.display = 'block';
        toggleMealBuilderBtn.innerHTML = '<i class="fas fa-minus"></i> Hide Meal Builder';
        // Scroll to meal builder
        mealBuilderSection.scrollIntoView({ behavior: 'smooth' });
    } else {
        mealBuilderSection.style.display = 'none';
        toggleMealBuilderBtn.innerHTML = '<i class="fas fa-plus"></i> Build a Meal';
    }
}

// Add current food to the meal
function addFoodToMeal() {
    if (!selectedFood) {
        showNotification('Please select a food first');
        return;
    }
    
    // Check if food is already in the meal
    const existingFoodIndex = currentMeal.findIndex(item => item.id === selectedFood.id);
    
    if (existingFoodIndex >= 0) {
        // Increment quantity if food already exists
        currentMeal[existingFoodIndex].quantity += 1;
    } else {
        // Add new food with quantity 1
        currentMeal.push({
            ...selectedFood,
            quantity: 1
        });
    }
    
    // Update the meal items display
    updateMealItems();
    
    // Show notification
    showNotification(`Added ${selectedFood.name} to your meal`);
    
    // Make sure meal builder is visible
    if (!isMealBuilderVisible) {
        toggleMealBuilder();
    }
}

// Update the meal items display
function updateMealItems() {
    if (mealItemsContainer) {
        if (currentMeal.length === 0) {
            mealItemsContainer.innerHTML = '<p>No items in your meal yet. Add foods to build your meal.</p>';
            mealTotalCalories.textContent = '0';
            
            // Disable buttons
            if (clearMealBtn) clearMealBtn.disabled = true;
            if (saveMealBtn) saveMealBtn.disabled = true;
            if (compareBtn) compareBtn.disabled = true;
            
            return;
        }
        
        // Enable buttons
        if (clearMealBtn) clearMealBtn.disabled = false;
        if (saveMealBtn) saveMealBtn.disabled = false;
        if (compareBtn) compareBtn.disabled = false;
        
        // Calculate total calories
        const totalCalories = currentMeal.reduce((sum, item) => sum + (item.calories * item.quantity), 0);
        
        // Update meal items HTML
        mealItemsContainer.innerHTML = currentMeal.map((item, index) => `
            <div class="meal-item">
                <div class="meal-item-left">
                    <img src="${item.image}" alt="${item.name}">
                    <div class="meal-item-info">
                        <h5>${item.name} ${item.quantity > 1 ? `(${item.quantity})` : ''}</h5>
                        <p>${item.calories * item.quantity} calories</p>
                    </div>
                </div>
                <div class="meal-item-actions">
                    <button class="btn-small btn-secondary" onclick="adjustQuantity(${index}, 1)">+</button>
                    <button class="btn-small btn-danger" onclick="adjustQuantity(${index}, -1)">-</button>
                    <button class="btn-small btn-danger" onclick="removeFromMeal(${index})">Г—</button>
                </div>
            </div>
        `).join('');
        
        // Update total calories
        mealTotalCalories.textContent = totalCalories.toString();
        
        // Calculate exercise times for the meal
        if (userWeight.value) {
            const exerciseTimes = calculateExerciseTime(totalCalories, parseFloat(userWeight.value));
            
            // Update the exercise times in the meal summary
            if (document.getElementById('mealWalkingTime')) {
                document.getElementById('mealWalkingTime').textContent = formatTime(exerciseTimes.walkingMinutes);
            }
            
            if (document.getElementById('mealRunningTime')) {
                document.getElementById('mealRunningTime').textContent = formatTime(exerciseTimes.runningMinutes);
            }
            
            if (document.getElementById('mealCyclingTime')) {
                document.getElementById('mealCyclingTime').textContent = formatTime(exerciseTimes.cyclingMinutes);
            }
        }
    }
}

// Adjust the quantity of a meal item
function adjustQuantity(index, change) {
    if (currentMeal[index]) {
        currentMeal[index].quantity += change;
        
        // Remove item if quantity is 0 or less
        if (currentMeal[index].quantity <= 0) {
            currentMeal.splice(index, 1);
        }
        
        updateMealItems();
    }
}

// Remove an item from the meal
function removeFromMeal(index) {
    if (currentMeal[index]) {
        const foodName = currentMeal[index].name;
        currentMeal.splice(index, 1);
        updateMealItems();
        showNotification(`Removed ${foodName} from your meal`);
    }
}

// Clear the current meal
function clearMeal() {
    if (currentMeal.length === 0) return;
    
    currentMeal = [];
    updateMealItems();
    showNotification('Meal cleared');
}

// Open the save meal modal
function openSaveMealModal() {
    if (currentMeal.length === 0) {
        showNotification('Add foods to your meal first');
        return;
    }
    
    // Calculate total calories
    const totalCalories = currentMeal.reduce((sum, item) => sum + (item.calories * item.quantity), 0);
    
    // Update modal content
    document.getElementById('modalMealCalories').textContent = totalCalories;
    document.getElementById('modalMealItems').textContent = currentMeal.length;
    
    // Show modal
    modalOverlay.classList.add('active');
}

// Close the modal
function closeModal() {
    modalOverlay.classList.remove('active');
}

// Save the current meal
function saveMeal() {
    const mealName = mealNameInput.value.trim() || `Meal ${savedMeals.length + 1}`;
    
    // Calculate total calories
    const totalCalories = currentMeal.reduce((sum, item) => sum + (item.calories * item.quantity), 0);
    
    // Create meal object
    const meal = {
        id: Date.now(),
        name: mealName,
        items: [...currentMeal],
        totalCalories,
        date: new Date().toISOString()
    };
    
    // Add to saved meals
    savedMeals.push(meal);
    
    // Save to local storage
    localStorage.setItem('greenLifeSavedMeals', JSON.stringify(savedMeals));
    
    // Update saved meals display
    updateSavedMeals();
    
    // Close modal
    closeModal();
    
    // Clear meal name input
    mealNameInput.value = '';
    
    // Show notification
    showNotification(`Saved "${mealName}" to your meals`);
    
    // Switch to saved meals tab
    switchTab(1);
}

// Update the saved meals display
function updateSavedMeals() {
    if (savedMealsContainer) {
        if (savedMeals.length === 0) {
            savedMealsContainer.innerHTML = '<p>No saved meals yet. Create and save a meal to see it here.</p>';
            return;
        }
        
        savedMealsContainer.innerHTML = savedMeals.map((meal, index) => `
            <div class="saved-meal">
                <div class="saved-meal-info">
                    <h5>${meal.name}</h5>
                    <p>${meal.totalCalories} calories | ${meal.items.length} items</p>
                </div>
                <div class="saved-meal-actions">
                    <button class="btn-small btn-secondary" onclick="loadSavedMeal(${index})">Load</button>
                    <button class="btn-small btn-secondary" onclick="addToComparison(${index})">Compare</button>
                    <button class="btn-small btn-danger" onclick="deleteSavedMeal(${index})">Delete</button>
                </div>
            </div>
        `).join('');
    }
}

// Load a saved meal
function loadSavedMeal(index) {
    if (savedMeals[index]) {
        currentMeal = JSON.parse(JSON.stringify(savedMeals[index].items)); // Deep copy
        updateMealItems();
        showNotification(`Loaded "${savedMeals[index].name}"`);
        
        // Switch to current meal tab
        switchTab(0);
    }
}

// Delete a saved meal
function deleteSavedMeal(index) {
    if (savedMeals[index]) {
        const mealName = savedMeals[index].name;
        savedMeals.splice(index, 1);
        
        // Update local storage
        localStorage.setItem('greenLifeSavedMeals', JSON.stringify(savedMeals));
        
        // Update saved meals display
        updateSavedMeals();
        
        showNotification(`Deleted "${mealName}"`);
    }
}

// Add a meal to the comparison
function addToComparison(index) {
    if (savedMeals[index]) {
        const meal = savedMeals[index];
        
        // Calculate exercise times
        const weight = parseFloat(userWeight.value) || 150;
        const weightFactor = getWeightFactor(weight);
        
        const walkingMinutes = Math.round(meal.totalCalories / (CALORIE_BURN_RATES.walking * weightFactor));
        const runningMinutes = Math.round(meal.totalCalories / (CALORIE_BURN_RATES.running * weightFactor));
        const cyclingMinutes = Math.round(meal.totalCalories / (CALORIE_BURN_RATES.cycling * weightFactor));
        
        // Create comparison element
        const comparisonHtml = `
            <div class="comparison-meal">
                <h5>${meal.name} (${meal.totalCalories} calories)</h5>
                <div class="comparison-exercise">
                    <img src="https://public.youware.com/users-website-assets/prod/9efba591-77dc-4b67-aa6b-2890ca486213/woman-1822459_150.jpg" alt="Walking">
                    <div class="comparison-exercise-info">
                        <h6>Walking (3 mph)</h6>
                        <p>${formatTime(walkingMinutes)}</p>
                    </div>
                </div>
                <div class="comparison-exercise">
                    <img src="https://public.youware.com/users-website-assets/prod/9efba591-77dc-4b67-aa6b-2890ca486213/man-8293794_150.jpg" alt="Running">
                    <div class="comparison-exercise-info">
                        <h6>Running (6 mph)</h6>
                        <p>${formatTime(runningMinutes)}</p>
                    </div>
                </div>
                <div class="comparison-exercise">
                    <img src="https://public.youware.com/users-website-assets/prod/9efba591-77dc-4b67-aa6b-2890ca486213/silhouette-683751_150.jpg" alt="Cycling">
                    <div class="comparison-exercise-info">
                        <h6>Cycling (12 mph)</h6>
                        <p>${formatTime(cyclingMinutes)}</p>
                    </div>
                </div>
                <div class="comparison-actions">
                    <button class="btn-small btn-danger" onclick="this.parentNode.parentNode.remove()">Remove</button>
                </div>
            </div>
        `;
        
        // Add to comparison container
        mealComparisonContainer.innerHTML += comparisonHtml;
        
        // Make sure the comparison container is visible
        mealComparisonContainer.style.display = 'grid';
        
        // Switch to comparison tab
        switchTab(2);
        
        showNotification(`Added "${meal.name}" to comparison`);
    }
}

// Clear the comparison
function clearComparison() {
    mealComparisonContainer.innerHTML = '';
    mealComparisonContainer.style.display = 'none';
    showNotification('Comparison cleared');
}

// Switch between tabs
function switchTab(tabIndex) {
    // Update tab active states
    mealTabs.forEach((tab, index) => {
        if (index === tabIndex) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
    
    // Update content visibility
    mealContents.forEach((content, index) => {
        if (index === tabIndex) {
            content.classList.add('active');
        } else {
            content.classList.remove('active');
        }
    });
}

// Event listeners
foodSelect.addEventListener('change', function() {
    if (this.value !== '0') {
        // Clear selected food
        selectedFood = null;
        document.querySelectorAll('.food-item').forEach(item => item.classList.remove('selected'));
        selectedFoodDisplay.style.display = 'none';
        
        customCalories.value = '';
        calculateExerciseTime(parseInt(this.value), parseFloat(userWeight.value));
    }
});

customCalories.addEventListener('input', function() {
    if (this.value) {
        // Clear selected food
        selectedFood = null;
        document.querySelectorAll('.food-item').forEach(item => item.classList.remove('selected'));
        selectedFoodDisplay.style.display = 'none';
        
        foodSelect.value = '0';
        updateSteps(2);
    }
});

userWeight.addEventListener('input', function() {
    updateSteps(2);
    
    const calories = selectedFood ? selectedFood.calories : 
                    customCalories.value ? parseFloat(customCalories.value) : 
                    (foodSelect.value !== '0' ? parseFloat(foodSelect.value) : 0);
    
    if (calories > 0 && this.value) {
        calculateExerciseTime(calories, parseFloat(this.value));
        
        // Update meal exercise times if there are items in the meal
        if (currentMeal.length > 0) {
            updateMealItems();
        }
    }
});

calculateBtn.addEventListener('click', function() {
    const calories = selectedFood ? selectedFood.calories : 
                    customCalories.value ? parseFloat(customCalories.value) : 
                    (foodSelect.value !== '0' ? parseFloat(foodSelect.value) : 0);
    
    if (!calories) {
        showNotification('Please select a food or enter calories');
        return;
    }
    
    if (!userWeight.value) {
        showNotification('Please enter your weight');
        return;
    }
    
    calculateExerciseTime(calories, parseFloat(userWeight.value));
});

// Meal builder event listeners
if (toggleMealBuilderBtn) {
    toggleMealBuilderBtn.addEventListener('click', toggleMealBuilder);
}

if (addToMealBtn) {
    addToMealBtn.addEventListener('click', addFoodToMeal);
}

if (clearMealBtn) {
    clearMealBtn.addEventListener('click', clearMeal);
}

if (saveMealBtn) {
    saveMealBtn.addEventListener('click', openSaveMealModal);
}

if (compareBtn) {
    compareBtn.addEventListener('click', function() {
        // If current meal has items, add it to comparison
        if (currentMeal.length > 0) {
            // Calculate total calories
            const totalCalories = currentMeal.reduce((sum, item) => sum + (item.calories * item.quantity), 0);
            
            // Create a temporary meal object
            const tempMeal = {
                name: 'Current Meal',
                totalCalories
            };
            
            // Calculate exercise times
            const weight = parseFloat(userWeight.value) || 150;
            const weightFactor = getWeightFactor(weight);
            
            const walkingMinutes = Math.round(totalCalories / (CALORIE_BURN_RATES.walking * weightFactor));
            const runningMinutes = Math.round(totalCalories / (CALORIE_BURN_RATES.running * weightFactor));
            const cyclingMinutes = Math.round(totalCalories / (CALORIE_BURN_RATES.cycling * weightFactor));
            
            // Create comparison element
            const comparisonHtml = `
                <div class="comparison-meal">
                    <h5>${tempMeal.name} (${tempMeal.totalCalories} calories)</h5>
                    <div class="comparison-exercise">
                        <img src="https://public.youware.com/users-website-assets/prod/9efba591-77dc-4b67-aa6b-2890ca486213/woman-1822459_150.jpg" alt="Walking">
                        <div class="comparison-exercise-info">
                            <h6>Walking (3 mph)</h6>
                            <p>${formatTime(walkingMinutes)}</p>
                        </div>
                    </div>
                    <div class="comparison-exercise">
                        <img src="https://public.youware.com/users-website-assets/prod/9efba591-77dc-4b67-aa6b-2890ca486213/man-8293794_150.jpg" alt="Running">
                        <div class="comparison-exercise-info">
                            <h6>Running (6 mph)</h6>
                            <p>${formatTime(runningMinutes)}</p>
                        </div>
                    </div>
                    <div class="comparison-exercise">
                        <img src="https://public.youware.com/users-website-assets/prod/9efba591-77dc-4b67-aa6b-2890ca486213/silhouette-683751_150.jpg" alt="Cycling">
                        <div class="comparison-exercise-info">
                            <h6>Cycling (12 mph)</h6>
                            <p>${formatTime(cyclingMinutes)}</p>
                        </div>
                    </div>
                    <div class="comparison-actions">
                        <button class="btn-small btn-danger" onclick="this.parentNode.parentNode.remove()">Remove</button>
                    </div>
                </div>
            `;
            
            // Add to comparison container
            mealComparisonContainer.innerHTML += comparisonHtml;
            
            // Make sure the comparison container is visible
            mealComparisonContainer.style.display = 'grid';
        }
        
        // Switch to comparison tab
        switchTab(2);
    });
}

// Modal event listeners
if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeModal);
}

if (saveMealConfirmBtn) {
    saveMealConfirmBtn.addEventListener('click', saveMeal);
}

// Tab event listeners
mealTabs.forEach((tab, index) => {
    tab.addEventListener('click', () => switchTab(index));
});

// Click outside modal to close
if (modalOverlay) {
    modalOverlay.addEventListener('click', function(e) {
        if (e.target === modalOverlay) {
            closeModal();
        }
    });
}

// Load saved meals from local storage
function loadSavedMeals() {
    const savedMealsData = localStorage.getItem('greenLifeSavedMeals');
    if (savedMealsData) {
        savedMeals = JSON.parse(savedMealsData);
        updateSavedMeals();
    }
}

// Initialize with default values and setup
window.addEventListener('load', function() {
    userWeight.value = 150;
    foodSelect.value = '0';
    customCalories.value = '';
    
    // Initialize food grid
    initFoodGrid();
    
    // Start with step 1 active
    updateSteps(1);
    
    // Add example data to the chart for visual appeal
    updateChart([32, 13, 19], 150);
    
    // Initialize meal builder if it exists
    if (mealBuilderSection) {
        mealBuilderSection.style.display = 'none';
    }
    
    // Load saved meals
    loadSavedMeals();
    
    // Set default tab
    switchTab(0);
});
