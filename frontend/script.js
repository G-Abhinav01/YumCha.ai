// --- Scroll Listener for Dynamic Navbar ---
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

const state = {
    inputMethod: 'text', // 'text' or 'image'
};

function switchMode(mode) {
    state.inputMethod = mode;

    // Toggle Buttons
    document.querySelectorAll('.toggle-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`btn-${mode}`).classList.add('active');

    // Toggle Forms
    document.querySelectorAll('.form-section').forEach(section => section.classList.remove('active'));
    document.getElementById(`${mode}-form`).classList.add('active');
}

async function generateRecipes() {
    const loadingOverlay = document.getElementById('loading-overlay');
    const resultsSection = document.getElementById('results-section');
    const recipeGrid = document.getElementById('recipe-grid');

    // Validate Inputs
    const formData = new FormData();
    formData.append('inputMethod', state.inputMethod);
    // Get values from hidden inputs for custom selectors
    formData.append('skillLevel', document.getElementById('skill-level').value);
    formData.append('spiceLevel', document.getElementById('spice-level').value);

    formData.append('jugaad', document.getElementById('jugaad-check').checked);
    formData.append('measurement', document.getElementById('measurement-check').checked ? 'local' : 'standard');

    // Regions
    const regionVal = document.getElementById('region-input').value;
    if (regionVal) formData.append('regions[]', regionVal);

    if (state.inputMethod === 'text') {
        const dish = document.getElementById('dish-input').value;
        const ingredients = document.getElementById('ingredients-input').value;
        if (!dish && !ingredients) {
            alert("Please enter a dish name or ingredients!");
            return;
        }
        formData.append('dishName', dish);
        formData.append('ingredients', ingredients);
    } else {
        const fileInput = document.getElementById('image-upload');
        if (!fileInput.files.length) {
            alert("Please upload an image!");
            return;
        }
        formData.append('image', fileInput.files[0]);
    }

    // UI Loading
    loadingOverlay.classList.remove('hidden');
    resultsSection.classList.add('hidden');
    recipeGrid.innerHTML = ''; // Clear previous

    try {
        let options = { method: 'POST', body: formData };
        const response = await fetch('/api/generate', options);
        const data = await response.json();

        if (data.success && data.recipes) {
            renderRecipes(data.recipes);
            resultsSection.classList.remove('hidden');
            resultsSection.scrollIntoView({ behavior: 'smooth' });
        } else {
            alert("The Maharaj got confused. Please try again or check API Key.");
        }

    } catch (error) {
        console.error("Error:", error);
        alert("Something went wrong. Check console.");
    } finally {
        loadingOverlay.classList.add('hidden');
    }
}

function renderRecipes(recipes) {
    const grid = document.getElementById('recipe-grid');

    recipes.forEach((recipe, index) => {
        const card = document.createElement('div');
        card.className = 'recipe-card';
        card.style.animationDelay = `${index * 0.1}s`; // Staggered animation

        card.innerHTML = `
            <button class="like-btn" onclick="toggleLike(this)">🤍</button>
            <h3>${recipe.name}</h3>
            <div class="recipe-tags">
                <span class="tag">⏱️ ${recipe.time || 'N/A'}</span>
                <span class="tag">🌶️ ${recipe.spice_level || 'N/A'}</span>
            </div>
            <p class="recipe_desc">${recipe.description}</p>
            
            <div class="details hidden-details">
                <h4>Ingredients:</h4>
                <ul>
                    ${recipe.ingredients ? recipe.ingredients.map(i => `<li>${i}</li>`).join('') : '<li>See instructions</li>'}
                </ul>
                <h4>Instructions:</h4>
                <p style="white-space: pre-line;">${recipe.instructions ? (Array.isArray(recipe.instructions) ? recipe.instructions.join('\n') : recipe.instructions) : ''}</p>
                ${recipe.jugaad_tips ? `<p class="jugaad-tip">💡 <strong>Jugaad Tip:</strong> ${recipe.jugaad_tips}</p>` : ''}
            </div>

            <button class="view-btn" onclick="toggleDetails(this)">View Recipe 📖</button>
        `;
        grid.appendChild(card);
    });
}

function toggleLike(btn) {
    const isLiked = btn.innerText === '❤️';
    btn.innerText = isLiked ? '🤍' : '❤️';
    if (!isLiked) btn.style.animation = 'heartBeat 0.5s';
}

function toggleDetails(btn) {
    const card = btn.closest('.recipe-card');
    const details = card.querySelector('.details');
    if (details.style.display === 'block') {
        details.style.display = 'none';
        btn.innerText = 'View Recipe 📖';
    } else {
        details.style.display = 'block';
        btn.innerText = 'Close Recipe ❌';
    }
}

// Inject Dynamic Styles (Heartbeat + Logic)
const styleSheet = document.createElement("style");
styleSheet.innerText = `
@keyframes heartBeat {
    0% { transform: scale(1); }
    50% { transform: scale(1.3); }
    100% { transform: scale(1); }
}
.hidden-details { display: none; margin-top: 15px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 10px; }
.jugaad-tip { color: #f39c12; font-style: italic; margin-top: 10px; }
`;
document.head.appendChild(styleSheet);


// --- EVENT LISTENERS ---

document.addEventListener('DOMContentLoaded', () => {

    // 1. Custom Dropdown Logic
    document.querySelectorAll('.custom-select-wrapper').forEach(wrapper => {
        const trigger = wrapper.querySelector('.custom-select-trigger');
        const options = wrapper.querySelectorAll('.custom-option');
        const hiddenInput = wrapper.querySelector('input[type="hidden"]');
        const triggerSpan = trigger.querySelector('span');

        // Toggle Dropdown
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            // Close other dropdowns
            document.querySelectorAll('.custom-select-wrapper').forEach(other => {
                if (other !== wrapper) other.classList.remove('open');
            });
            wrapper.classList.toggle('open');
        });

        // Option Selection
        options.forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                // Update Visuals
                triggerSpan.textContent = option.textContent;
                wrapper.classList.remove('open');

                // Update State
                options.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');

                // Update Hidden Input (Important for Form Data)
                hiddenInput.value = option.getAttribute('data-value');
            });
        });
    });

    // Close Dropdowns on Click Outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.custom-select-wrapper')) {
            document.querySelectorAll('.custom-select-wrapper').forEach(wrapper => {
                wrapper.classList.remove('open');
            });
        }
    });

    // 2. Social Button Interaction
    const socialButtons = document.querySelectorAll('.social-btn');
    socialButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Remove active class from all
            socialButtons.forEach(b => b.classList.remove('active'));
            // Add to clicked
            btn.classList.add('active');
        });
    });

});
