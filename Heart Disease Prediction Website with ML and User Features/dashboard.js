// Dashboard functionality and ML prediction integration
class DashboardManager {
    constructor() {
        this.currentUser = JSON.parse(localStorage.getItem('heartcare_current_user'));
        this.predictions = JSON.parse(localStorage.getItem('heartcare_predictions')) || [];
        this.currentSection = 'dashboard';
        
        if (!this.currentUser) {
            window.location.href = 'index.html';
            return;
        }
        
        this.initializeEventListeners();
        this.loadUserData();
        this.updateStats();
        this.loadRecentActivity();
        this.loadPredictionHistory();
    }

    initializeEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-item a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.target.closest('a').dataset.section;
                this.navigateToSection(section);
            });
        });

        // Prediction form
        const predictionForm = document.getElementById('predictionForm');
        if (predictionForm) {
            predictionForm.addEventListener('submit', (e) => this.handlePrediction(e));
        }

        // Profile form
        const profileForm = document.getElementById('profileForm');
        if (profileForm) {
            profileForm.addEventListener('submit', (e) => this.handleProfileUpdate(e));
        }

        // Chatbot
        const chatbotInput = document.getElementById('chatbotInput');
        if (chatbotInput) {
            chatbotInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendMessage();
                }
            });
        }

        // Form validation
        this.addFormValidation();
    }

    loadUserData() {
        // Update user name in header
        const userName = document.getElementById('userName');
        if (userName) {
            userName.textContent = `${this.currentUser.firstName} ${this.currentUser.lastName}`;
        }

        // Load profile form
        const profileForm = document.getElementById('profileForm');
        if (profileForm) {
            document.getElementById('profileFirstName').value = this.currentUser.firstName || '';
            document.getElementById('profileLastName').value = this.currentUser.lastName || '';
            document.getElementById('profileEmail').value = this.currentUser.email || '';
            document.getElementById('profilePhone').value = this.currentUser.phone || '';
        }
    }

    navigateToSection(section) {
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-section="${section}"]`).closest('.nav-item').classList.add('active');

        // Update content
        document.querySelectorAll('.content-section').forEach(sec => {
            sec.classList.remove('active');
        });
        document.getElementById(`${section}-section`).classList.add('active');

        // Update page title
        const pageTitle = document.querySelector('.page-title');
        const titles = {
            dashboard: 'Dashboard',
            prediction: 'Heart Prediction',
            history: 'History',
            about: 'About',
            profile: 'Profile'
        };
        pageTitle.textContent = titles[section] || 'Dashboard';

        this.currentSection = section;
    }

    updateStats() {
        const totalPredictions = this.predictions.length;
        const lastPrediction = this.predictions[this.predictions.length - 1];
        
        document.getElementById('totalPredictions').textContent = totalPredictions;
        
        if (lastPrediction) {
            document.getElementById('riskLevel').textContent = lastPrediction.risk;
            document.getElementById('lastCheck').textContent = this.formatDate(lastPrediction.date);
        }
    }

    loadRecentActivity() {
        const activityContainer = document.getElementById('recentActivity');
        if (!activityContainer) return;

        if (this.predictions.length === 0) {
            activityContainer.innerHTML = '<p class="no-activity">No recent activity</p>';
            return;
        }

        const recentPredictions = this.predictions.slice(-3).reverse();
        const activityHTML = recentPredictions.map(prediction => `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="fas fa-heartbeat"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-title">Heart Disease Prediction</div>
                    <div class="activity-time">${this.formatDate(prediction.date)}</div>
                </div>
            </div>
        `).join('');

        activityContainer.innerHTML = activityHTML;
    }

    loadPredictionHistory() {
        const historyContainer = document.getElementById('historyList');
        if (!historyContainer) return;

        if (this.predictions.length === 0) {
            historyContainer.innerHTML = `
                <div class="no-history">
                    <i class="fas fa-history"></i>
                    <h3>No Predictions Yet</h3>
                    <p>Start your first heart disease risk assessment to see your history here.</p>
                    <button class="btn-primary" onclick="dashboardManager.navigateToSection('prediction')">
                        Start Prediction
                    </button>
                </div>
            `;
            return;
        }

        const historyHTML = this.predictions.slice().reverse().map(prediction => `
            <div class="history-item">
                <div class="history-header-item">
                    <div class="history-date">${this.formatDate(prediction.date)}</div>
                    <div class="history-risk risk-${prediction.risk.toLowerCase()}">${prediction.risk} Risk</div>
                </div>
                <div class="history-details">
                    <strong>Confidence:</strong> ${prediction.confidence}% | 
                    <strong>Age:</strong> ${prediction.inputs.age} | 
                    <strong>Sex:</strong> ${prediction.inputs.sex === '1' ? 'Male' : 'Female'}
                </div>
            </div>
        `).join('');

        historyContainer.innerHTML = historyHTML;
    }

    async handlePrediction(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const inputs = {};
        
        // Collect form data
        const fields = ['age', 'sex', 'cp', 'trestbps', 'chol', 'fbs', 'restecg', 'thalach', 'exang', 'oldpeak', 'slope', 'ca', 'thal'];
        fields.forEach(field => {
            inputs[field] = parseFloat(formData.get(field)) || 0;
        });

        // Show loading state
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<div class="loading-spinner"></div><span>Analyzing...</span>';
        submitBtn.disabled = true;

        try {
            // Simulate ML prediction (in real implementation, this would call your ML model)
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const prediction = await this.predictHeartDisease(inputs);
            this.displayPredictionResult(prediction, inputs);
            
        } catch (error) {
            this.showMessage('Prediction failed. Please try again.', 'error');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    async predictHeartDisease(inputs) {
        // Simple rule-based prediction for demonstration
        // In a real implementation, you would load and use your trained ML model
        
        let riskScore = 0;
        
        // Age factor
        if (inputs.age > 60) riskScore += 2;
        else if (inputs.age > 45) riskScore += 1;
        
        // Sex factor (males generally higher risk)
        if (inputs.sex === 1) riskScore += 1;
        
        // Chest pain type
        if (inputs.cp === 0) riskScore += 2; // Typical angina
        else if (inputs.cp === 1) riskScore += 1; // Atypical angina
        
        // Blood pressure
        if (inputs.trestbps > 140) riskScore += 2;
        else if (inputs.trestbps > 120) riskScore += 1;
        
        // Cholesterol
        if (inputs.chol > 240) riskScore += 2;
        else if (inputs.chol > 200) riskScore += 1;
        
        // Fasting blood sugar
        if (inputs.fbs === 1) riskScore += 1;
        
        // Exercise induced angina
        if (inputs.exang === 1) riskScore += 2;
        
        // ST depression
        if (inputs.oldpeak > 2) riskScore += 2;
        else if (inputs.oldpeak > 1) riskScore += 1;
        
        // Number of major vessels
        riskScore += inputs.ca;
        
        // Thalassemia
        if (inputs.thal === 3) riskScore += 2; // Reversible defect
        else if (inputs.thal === 2) riskScore += 1; // Fixed defect
        
        // Determine risk level
        let risk, confidence, description;
        
        if (riskScore <= 3) {
            risk = 'Low';
            confidence = Math.floor(Math.random() * 10) + 85; // 85-95%
            description = 'Your heart disease risk appears to be low based on the provided information. Continue maintaining a healthy lifestyle.';
        } else if (riskScore <= 7) {
            risk = 'Moderate';
            confidence = Math.floor(Math.random() * 10) + 80; // 80-90%
            description = 'Your heart disease risk appears to be moderate. Consider consulting with a healthcare professional for further evaluation.';
        } else {
            risk = 'High';
            confidence = Math.floor(Math.random() * 10) + 75; // 75-85%
            description = 'Your heart disease risk appears to be high. We strongly recommend consulting with a healthcare professional immediately.';
        }
        
        return { risk, confidence, description, riskScore };
    }

    displayPredictionResult(prediction, inputs) {
        const resultContainer = document.getElementById('predictionResult');
        const resultTitle = document.getElementById('resultTitle');
        const resultDescription = document.getElementById('resultDescription');
        const resultConfidence = document.getElementById('resultConfidence');
        const resultIcon = resultContainer.querySelector('.result-icon');
        
        resultTitle.textContent = `${prediction.risk} Risk`;
        resultDescription.textContent = prediction.description;
        resultConfidence.textContent = `${prediction.confidence}%`;
        
        // Update icon and colors based on risk level
        resultIcon.className = 'result-icon';
        if (prediction.risk === 'Low') {
            resultIcon.style.background = 'linear-gradient(135deg, #27ae60, #2ecc71)';
            resultIcon.innerHTML = '<i class="fas fa-shield-alt"></i>';
        } else if (prediction.risk === 'Moderate') {
            resultIcon.style.background = 'linear-gradient(135deg, #f39c12, #e67e22)';
            resultIcon.innerHTML = '<i class="fas fa-exclamation-triangle"></i>';
        } else {
            resultIcon.style.background = 'linear-gradient(135deg, #e74c3c, #c0392b)';
            resultIcon.innerHTML = '<i class="fas fa-heart-broken"></i>';
        }
        
        // Store current prediction for saving
        this.currentPrediction = {
            ...prediction,
            inputs,
            date: new Date().toISOString()
        };
        
        // Show result
        resultContainer.style.display = 'block';
        resultContainer.scrollIntoView({ behavior: 'smooth' });
    }

    savePrediction() {
        if (!this.currentPrediction) return;
        
        this.predictions.push(this.currentPrediction);
        localStorage.setItem('heartcare_predictions', JSON.stringify(this.predictions));
        
        this.updateStats();
        this.loadRecentActivity();
        this.loadPredictionHistory();
        
        this.showMessage('Prediction saved successfully!', 'success');
        
        // Add to recent activity
        this.addActivity('Heart Disease Prediction', 'Completed risk assessment');
    }

    newPrediction() {
        document.getElementById('predictionForm').reset();
        document.getElementById('predictionResult').style.display = 'none';
        document.getElementById('predictionForm').scrollIntoView({ behavior: 'smooth' });
    }

    resetForm() {
        document.getElementById('predictionForm').reset();
        document.getElementById('predictionResult').style.display = 'none';
    }

    async handleProfileUpdate(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const updates = {
            firstName: formData.get('profileFirstName'),
            lastName: formData.get('profileLastName'),
            phone: formData.get('profilePhone')
        };

        // Show loading state
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<div class="loading-spinner"></div><span>Updating...</span>';
        submitBtn.disabled = true;

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Update user data
            Object.assign(this.currentUser, updates);
            localStorage.setItem('heartcare_current_user', JSON.stringify(this.currentUser));
            
            // Update users array
            const users = JSON.parse(localStorage.getItem('heartcare_users')) || [];
            const userIndex = users.findIndex(u => u.id === this.currentUser.id);
            if (userIndex !== -1) {
                Object.assign(users[userIndex], updates);
                localStorage.setItem('heartcare_users', JSON.stringify(users));
            }
            
            this.loadUserData();
            this.showMessage('Profile updated successfully!', 'success');
            
        } catch (error) {
            this.showMessage('Profile update failed. Please try again.', 'error');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    addFormValidation() {
        const inputs = document.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });
    }

    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        if (field.hasAttribute('required') && !value) {
            isValid = false;
            errorMessage = 'This field is required';
        } else if (field.type === 'number') {
            const min = parseFloat(field.getAttribute('min'));
            const max = parseFloat(field.getAttribute('max'));
            const numValue = parseFloat(value);
            
            if (value && (isNaN(numValue) || numValue < min || numValue > max)) {
                isValid = false;
                errorMessage = `Please enter a value between ${min} and ${max}`;
            }
        } else if (field.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid email address';
            }
        }

        if (!isValid) {
            this.showFieldError(field, errorMessage);
        } else {
            this.clearFieldError(field);
        }

        return isValid;
    }

    showFieldError(field, message) {
        this.clearFieldError(field);
        
        field.style.borderColor = 'var(--error-color)';
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            color: var(--error-color);
            font-size: 0.8rem;
            margin-top: 5px;
        `;
        
        field.parentNode.appendChild(errorDiv);
    }

    clearFieldError(field) {
        field.style.borderColor = '';
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
    }

    showMessage(text, type) {
        // Remove existing messages
        const existingMessages = document.querySelectorAll('.message');
        existingMessages.forEach(msg => msg.remove());

        // Create new message
        const message = document.createElement('div');
        message.className = `message ${type}`;
        message.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${text}</span>
        `;

        // Insert message at the top of the current section
        const activeSection = document.querySelector('.content-section.active');
        if (activeSection) {
            activeSection.insertBefore(message, activeSection.firstChild);
            
            // Show message with animation
            setTimeout(() => {
                message.classList.add('show');
            }, 10);

            // Auto-hide after 5 seconds
            setTimeout(() => {
                if (message.parentNode) {
                    message.remove();
                }
            }, 5000);
        }
    }

    addActivity(title, description) {
        const activity = {
            title,
            description,
            date: new Date().toISOString(),
            icon: 'heartbeat'
        };
        
        let activities = JSON.parse(localStorage.getItem('heartcare_activities')) || [];
        activities.unshift(activity);
        activities = activities.slice(0, 10); // Keep only last 10 activities
        
        localStorage.setItem('heartcare_activities', JSON.stringify(activities));
        this.loadRecentActivity();
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) return 'Today';
        if (diffDays === 2) return 'Yesterday';
        if (diffDays <= 7) return `${diffDays} days ago`;
        
        return date.toLocaleDateString();
    }
}

// Chatbot functionality
class ChatbotManager {
    constructor() {
        this.isOpen = false;
        this.responses = {
            greetings: [
                "Hello! I'm here to help you with heart health information. What would you like to know?",
                "Hi there! I can provide information about heart health and cardiovascular wellness. How can I assist you?",
                "Welcome! I'm your health assistant. Feel free to ask me about heart health topics."
            ],
            heartHealth: [
                "Heart health is crucial for overall wellness. Regular exercise, a balanced diet, and avoiding smoking are key factors.",
                "To maintain good heart health, consider: eating fruits and vegetables, exercising regularly, managing stress, and getting enough sleep.",
                "Some warning signs of heart problems include chest pain, shortness of breath, fatigue, and irregular heartbeat. Always consult a doctor if you experience these symptoms."
            ],
            exercise: [
                "Regular exercise strengthens your heart muscle and improves circulation. Aim for at least 150 minutes of moderate exercise per week.",
                "Good heart exercises include walking, swimming, cycling, and dancing. Start slowly and gradually increase intensity.",
                "Even light activities like gardening or taking stairs can benefit your heart health."
            ],
            diet: [
                "A heart-healthy diet includes plenty of fruits, vegetables, whole grains, lean proteins, and healthy fats like those found in fish and nuts.",
                "Limit saturated fats, trans fats, sodium, and added sugars. The Mediterranean diet is excellent for heart health.",
                "Foods rich in omega-3 fatty acids, like salmon and walnuts, are particularly beneficial for your heart."
            ],
            stress: [
                "Chronic stress can negatively impact heart health. Try relaxation techniques like deep breathing, meditation, or yoga.",
                "Regular physical activity, adequate sleep, and social connections can help manage stress levels.",
                "If stress becomes overwhelming, consider speaking with a healthcare professional or counselor."
            ],
            symptoms: [
                "Common heart disease symptoms include chest pain, shortness of breath, fatigue, and swelling in legs or feet.",
                "If you experience severe chest pain, difficulty breathing, or feel faint, seek immediate medical attention.",
                "Remember, this tool is for information only. Always consult healthcare professionals for proper diagnosis and treatment."
            ],
            default: [
                "I'm here to help with heart health information. You can ask me about exercise, diet, symptoms, or general heart wellness.",
                "I can provide information about heart health topics. What specific area would you like to learn about?",
                "Feel free to ask me about heart-healthy lifestyle choices, warning signs, or general cardiovascular wellness."
            ]
        };
    }

    getResponse(message) {
        const lowerMessage = message.toLowerCase();
        
        if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
            return this.getRandomResponse('greetings');
        } else if (lowerMessage.includes('exercise') || lowerMessage.includes('workout') || lowerMessage.includes('physical activity')) {
            return this.getRandomResponse('exercise');
        } else if (lowerMessage.includes('diet') || lowerMessage.includes('food') || lowerMessage.includes('nutrition') || lowerMessage.includes('eat')) {
            return this.getRandomResponse('diet');
        } else if (lowerMessage.includes('stress') || lowerMessage.includes('anxiety') || lowerMessage.includes('relax')) {
            return this.getRandomResponse('stress');
        } else if (lowerMessage.includes('symptom') || lowerMessage.includes('pain') || lowerMessage.includes('chest') || lowerMessage.includes('breath')) {
            return this.getRandomResponse('symptoms');
        } else if (lowerMessage.includes('heart') || lowerMessage.includes('cardiovascular') || lowerMessage.includes('health')) {
            return this.getRandomResponse('heartHealth');
        } else {
            return this.getRandomResponse('default');
        }
    }

    getRandomResponse(category) {
        const responses = this.responses[category];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    addMessage(content, isUser = false) {
        const messagesContainer = document.getElementById('chatbotMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = isUser ? 'user-message' : 'bot-message';
        
        messageDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-${isUser ? 'user' : 'robot'}"></i>
            </div>
            <div class="message-content">
                <p>${content}</p>
            </div>
        `;
        
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}

// Global functions
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.toggle('active');
}

function logout() {
    localStorage.removeItem('heartcare_current_user');
    localStorage.removeItem('heartcare_remember');
    window.location.href = 'index.html';
}

function toggleChatbot() {
    const chatbotWindow = document.getElementById('chatbotWindow');
    chatbotWindow.classList.toggle('active');
}

function sendMessage() {
    const input = document.getElementById('chatbotInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Add user message
    window.chatbotManager.addMessage(message, true);
    
    // Clear input
    input.value = '';
    
    // Add bot response after a short delay
    setTimeout(() => {
        const response = window.chatbotManager.getResponse(message);
        window.chatbotManager.addMessage(response);
    }, 1000);
}

function resetForm() {
    if (window.dashboardManager) {
        window.dashboardManager.resetForm();
    }
}

function savePrediction() {
    if (window.dashboardManager) {
        window.dashboardManager.savePrediction();
    }
}

function newPrediction() {
    if (window.dashboardManager) {
        window.dashboardManager.newPrediction();
    }
}

function navigateToSection(section) {
    if (window.dashboardManager) {
        window.dashboardManager.navigateToSection(section);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.dashboardManager = new DashboardManager();
    window.chatbotManager = new ChatbotManager();
    
    // Add responsive sidebar toggle
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            document.querySelector('.sidebar').classList.remove('active');
        }
    });
    
    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', function(e) {
        const sidebar = document.querySelector('.sidebar');
        const menuToggle = document.querySelector('.menu-toggle');
        
        if (window.innerWidth <= 768 && 
            sidebar.classList.contains('active') && 
            !sidebar.contains(e.target) && 
            !menuToggle.contains(e.target)) {
            sidebar.classList.remove('active');
        }
    });
});

