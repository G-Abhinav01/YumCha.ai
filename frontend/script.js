// ==========================================================================
// YumCha.ai — Interactive Client Script
// ==========================================================================

// --- Dynamic Navbar Scroll Effect ---
const navbar = document.getElementById('navbar');
const mobileToggle = document.getElementById('mobile-toggle');
const mobileDrawer = document.getElementById('mobile-drawer');

window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
        navbar?.classList.add('scrolled');
    } else {
        navbar?.classList.remove('scrolled');
    }
});

// Mobile menu toggle
if (mobileToggle && mobileDrawer) {
    mobileToggle.addEventListener('click', () => {
        const isOpen = mobileDrawer.classList.toggle('open');
        mobileToggle.classList.toggle('open');
        mobileToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
        if (!navbar.contains(e.target)) {
            closeMobileMenu();
        }
    });
}

function closeMobileMenu() {
    if (mobileDrawer) mobileDrawer.classList.remove('open');
    if (mobileToggle) {
        mobileToggle.classList.remove('open');
        mobileToggle.setAttribute('aria-expanded', 'false');
    }
}

const state = {
    inputMethod: 'text', // 'text' or 'image'
};

// --- Audio Effects ---
const cookingAudio = new Audio('./audio/CookingSound.mp3');
cookingAudio.loop = true;
cookingAudio.addEventListener('canplaythrough', () => console.log("Audio loaded successfully"));
cookingAudio.addEventListener('error', (e) => console.warn("Audio Load Note:", e.message));

// --- Typewriter Animation Logic ---
const phrases = [
    "Relax. The stove knows what it's doing...",
    "Trust the process. Let it simmer...",
    "Bro said 'let him cook' so we did.",
    "Stand back. This Maharaj blend might slap 🔥",
    "Calibrating tempering, spices, and regional nuances..."
];

window.typerInfo = {
    timer: null,
    pIdx: 0,
    cIdx: 0,
    deleting: false
};

function typeLoop() {
    const el = document.getElementById('typing-text');
    if (!el) return;

    try {
        const p = phrases[window.typerInfo.pIdx];

        if (window.typerInfo.deleting) {
            window.typerInfo.cIdx--;
        } else {
            window.typerInfo.cIdx++;
        }

        el.textContent = p.substring(0, window.typerInfo.cIdx);

        let speed = window.typerInfo.deleting ? 25 : 45;

        if (!window.typerInfo.deleting && window.typerInfo.cIdx === p.length) {
            speed = 2200;
            window.typerInfo.deleting = true;
        } else if (window.typerInfo.deleting && window.typerInfo.cIdx === 0) {
            window.typerInfo.deleting = false;
            window.typerInfo.pIdx = (window.typerInfo.pIdx + 1) % phrases.length;
            speed = 400;
        }

        window.typerInfo.timer = setTimeout(typeLoop, speed);

    } catch (err) {
        el.textContent = "Error: " + err.message;
        el.style.color = "#ff4444";
        console.error(err);
    }
}

function startTyper() {
    stopTyper();
    window.typerInfo.pIdx = 0;
    window.typerInfo.cIdx = 0;
    window.typerInfo.deleting = false;

    const el = document.getElementById('typing-text');
    if (el) {
        el.textContent = "";
        el.style.color = "#ffffff";
    }

    typeLoop();
}

function stopTyper() {
    if (window.typerInfo.timer) clearTimeout(window.typerInfo.timer);
}

// --- Mode Switcher ---
function switchMode(mode) {
    state.inputMethod = mode;

    document.querySelectorAll('.toggle-btn').forEach(btn => btn.classList.remove('active'));
    const targetBtn = document.getElementById(`btn-${mode}`);
    if (targetBtn) targetBtn.classList.add('active');

    document.querySelectorAll('.form-section').forEach(section => section.classList.remove('active'));
    const targetForm = document.getElementById(`${mode}-form`);
    if (targetForm) targetForm.classList.add('active');
}

// --- File Upload & Drag-and-Drop ---
const imageUpload = document.getElementById('image-upload');
const fileNameLabel = document.getElementById('file-name');
const dropZone = document.getElementById('drop-zone');

if (imageUpload && fileNameLabel) {
    imageUpload.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            fileNameLabel.textContent = `Selected: ${e.target.files[0].name}`;
        }
    });
}

if (dropZone) {
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.style.borderColor = 'var(--accent-saffron)';
            dropZone.style.background = 'rgba(245, 158, 11, 0.08)';
        });
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.style.borderColor = '';
            dropZone.style.background = '';
        });
    });

    dropZone.addEventListener('drop', (e) => {
        const files = e.dataTransfer?.files;
        if (files && files.length > 0 && imageUpload) {
            imageUpload.files = files;
            fileNameLabel.textContent = `Selected: ${files[0].name}`;
        }
    });
}

// --- Recipe Generation ---
async function generateRecipes() {
    const loadingOverlay = document.getElementById('loading-overlay');
    const resultsSection = document.getElementById('results-section');
    const recipeGrid = document.getElementById('recipe-grid');

    const formData = new FormData();
    formData.append('inputMethod', state.inputMethod);
    formData.append('skillLevel', document.getElementById('skill-level')?.value || 'intermediate');
    formData.append('spiceLevel', document.getElementById('spice-level')?.value || 'moderate');
    formData.append('jugaad', document.getElementById('jugaad-check')?.checked ? 'true' : 'false');
    formData.append('measurement', document.getElementById('measurement-check')?.checked ? 'local' : 'standard');
    formData.append('language', document.getElementById('language-check')?.checked ? 'hinglish' : 'english');

    const regionVal = document.getElementById('region-input')?.value;
    if (regionVal) formData.append('regions[]', regionVal);

    if (state.inputMethod === 'text') {
        const dish = document.getElementById('dish-input')?.value.trim();
        const ingredients = document.getElementById('ingredients-input')?.value.trim();
        if (!dish && !ingredients) {
            alert("Please provide either a dish craving or ingredients you have!");
            return;
        }
        formData.append('dishName', dish || '');
        formData.append('ingredients', ingredients || '');
    } else {
        const fileInput = document.getElementById('image-upload');
        if (!fileInput || !fileInput.files.length) {
            alert("Please choose or drop an ingredients photo!");
            return;
        }
        formData.append('image', fileInput.files[0]);
    }

    loadingOverlay.classList.remove('hidden');
    resultsSection.classList.add('hidden');
    recipeGrid.innerHTML = '';

    startTyper();

    cookingAudio.currentTime = 0;
    cookingAudio.play().catch(e => console.warn("Audio autoplay blocked by browser:", e));

    try {
        const response = await fetch('/api/generate', {
            method: 'POST',
            body: formData
        });
        const data = await response.json();

        if (data.success && data.recipes && data.recipes.length > 0) {
            renderRecipes(data.recipes);
            resultsSection.classList.remove('hidden');
            resultsSection.scrollIntoView({ behavior: 'smooth' });
            loadingOverlay.classList.add('hidden');
            cookingAudio.pause();
            stopTyper();
        } else {
            throw new Error(data.message || "The Maharaj encountered an issue. Please try again.");
        }

    } catch (error) {
        console.error("Recipe Generation Error:", error);
        const textElement = document.getElementById('typing-text');
        if (textElement) {
            textElement.textContent = "Error: " + (error.message || "Something went wrong");
            textElement.style.color = "#ff4444";
        }
        cookingAudio.pause();
        stopTyper();
        setTimeout(() => {
            loadingOverlay.classList.add('hidden');
            alert(error.message || "Recipe generation failed. Please check connection and try again.");
        }, 3500);
    } finally {
        cookingAudio.currentTime = 0;
    }
}

// --- Render Recipe Cards ---
function renderRecipes(recipes) {
    const grid = document.getElementById('recipe-grid');
    if (!grid) return;
    grid.innerHTML = '';

    recipes.forEach((recipe, index) => {
        const card = document.createElement('div');
        card.className = 'recipe-card';
        card.style.animationDelay = `${index * 0.12}s`;

        const regionBadge = recipe.region ? `<span class="tag"><i class="fa-solid fa-map-pin"></i> ${recipe.region}</span>` : '';
        const timeBadge = recipe.time ? `<span class="tag"><i class="fa-regular fa-clock"></i> ${recipe.time}</span>` : '';
        const spiceBadge = recipe.spice_level ? `<span class="tag"><i class="fa-solid fa-pepper-hot"></i> ${recipe.spice_level}</span>` : '';

        card.innerHTML = `
            <button class="like-btn" onclick="toggleLike(this)" aria-label="Favorite recipe">❤️</button>
            <h3>${recipe.name}</h3>
            <div class="recipe-tags">
                ${timeBadge}
                ${spiceBadge}
                ${regionBadge}
            </div>
            <p class="recipe_desc">${recipe.description}</p>
            
            <div class="details hidden-details">
                <h4>Ingredients:</h4>
                <ul>
                    ${recipe.ingredients ? recipe.ingredients.map(i => `<li>${i}</li>`).join('') : '<li>Check instructions below</li>'}
                </ul>
                <h4>Preparation Steps:</h4>
                <p style="white-space: pre-line;">${
                    recipe.instructions
                        ? (Array.isArray(recipe.instructions) ? recipe.instructions.join('\n\n') : recipe.instructions)
                        : ''
                }</p>
                ${recipe.jugaad_tips ? `<p class="jugaad-tip">💡 <strong>Jugaad / Pro Tip:</strong> ${recipe.jugaad_tips}</p>` : ''}
            </div>

            <button class="view-btn" onclick="toggleDetails(this)">
                <span>View Recipe & Steps</span>
                <i class="fa-solid fa-chevron-down" style="margin-left: 6px; font-size: 0.8rem;"></i>
            </button>
        `;
        grid.appendChild(card);
    });
}

function toggleLike(btn) {
    const isLiked = btn.classList.toggle('liked');
    btn.style.transform = 'scale(1.25)';
    setTimeout(() => { btn.style.transform = ''; }, 250);
}

function toggleDetails(btn) {
    const card = btn.closest('.recipe-card');
    const details = card.querySelector('.details');
    if (details.style.display === 'block') {
        details.style.display = 'none';
        btn.innerHTML = `<span>View Recipe & Steps</span> <i class="fa-solid fa-chevron-down" style="margin-left: 6px; font-size: 0.8rem;"></i>`;
    } else {
        details.style.display = 'block';
        btn.innerHTML = `<span>Collapse Recipe</span> <i class="fa-solid fa-chevron-up" style="margin-left: 6px; font-size: 0.8rem;"></i>`;
    }
}

// --- DOM Ready Event Listeners ---
document.addEventListener('DOMContentLoaded', () => {

    // Custom Dropdown Selection
    document.querySelectorAll('.custom-select-wrapper').forEach(wrapper => {
        const trigger = wrapper.querySelector('.custom-select-trigger');
        const options = wrapper.querySelectorAll('.custom-option');
        const hiddenInput = wrapper.querySelector('input[type="hidden"]');
        const triggerSpan = trigger?.querySelector('span');

        trigger?.addEventListener('click', (e) => {
            e.stopPropagation();
            document.querySelectorAll('.custom-select-wrapper').forEach(other => {
                if (other !== wrapper) other.classList.remove('open');
            });
            wrapper.classList.toggle('open');
        });

        options.forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                if (triggerSpan) triggerSpan.textContent = option.textContent;
                wrapper.classList.remove('open');

                options.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');

                if (hiddenInput) {
                    hiddenInput.value = option.getAttribute('data-value');
                }
            });
        });
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.custom-select-wrapper')) {
            document.querySelectorAll('.custom-select-wrapper').forEach(wrapper => {
                wrapper.classList.remove('open');
            });
        }
    });

    // Social Button Interactions
    document.querySelectorAll('.social-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.social-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

});
