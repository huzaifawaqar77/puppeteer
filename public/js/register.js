const API_BASE_URL = window.location.origin;

document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitBtn = document.getElementById('submitBtn');
    const alert = document.getElementById('alert');
    
    // Get form values
    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Validate passwords match
    if (password !== confirmPassword) {
        showAlert('Passwords do not match!', 'error');
        return;
    }
    
    // Validate password strength
    if (password.length < 8) {
        showAlert('Password must be at least 8 characters long!', 'error');
        return;
    }
    
    if (!/[A-Z]/.test(password)) {
        showAlert('Password must contain at least one uppercase letter!', 'error');
        return;
    }
    
    if (!/[a-z]/.test(password)) {
        showAlert('Password must contain at least one lowercase letter!', 'error');
        return;
    }
    
    if (!/[0-9]/.test(password)) {
        showAlert('Password must contain at least one number!', 'error');
        return;
    }
    
    // Disable button and show loading
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating Account...';
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                full_name: fullName,
                email: email,
                password: password
            })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            showAlert('Registration successful! Please check your email to verify your account.', 'success');
            
            // Clear form
            document.getElementById('registerForm').reset();
            
            // Redirect to login after 3 seconds
            setTimeout(() => {
                window.location.href = '/login.html';
            }, 3000);
        } else {
            showAlert(data.message || 'Registration failed. Please try again.', 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Create Account';
        }
    } catch (error) {
        console.error('Registration error:', error);
        showAlert('An error occurred. Please try again later.', 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Create Account';
    }
});

function showAlert(message, type) {
    const alert = document.getElementById('alert');
    alert.textContent = message;
    alert.className = `alert ${type} show`;
    
    // Auto-hide error alerts after 5 seconds
    if (type === 'error') {
        setTimeout(() => {
            alert.classList.remove('show');
        }, 5000);
    }
}

