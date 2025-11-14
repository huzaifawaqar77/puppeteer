const express = require("express");
const router = express.Router();
const path = require("path");

/**
 * @route   GET /docs.html
 * @desc    Serve API documentation wrapper with client-side auth check
 * @access  Public (but checks subscription on client-side)
 */
router.get("/docs.html", (req, res) => {
  // Serve a wrapper HTML that checks authentication and subscription
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Loading Documentation...</title>
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: 'Inter', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .loader {
            text-align: center;
            color: white;
        }
        .spinner {
            border: 4px solid rgba(255, 255, 255, 0.3);
            border-top: 4px solid white;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            animation: spin 1s linear infinite;
            margin: 0 auto 1rem;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <div class="loader">
        <div class="spinner"></div>
        <p>Verifying access...</p>
    </div>

    <script>
        const API_BASE_URL = window.location.origin;

        async function checkAccess() {
            // Check if user is logged in
            const token = localStorage.getItem('token');

            if (!token) {
                // Not logged in - redirect to login
                window.location.href = '/login.html?redirect=' + encodeURIComponent('/docs.html');
                return;
            }

            try {
                // Check user's subscription
                const response = await fetch(API_BASE_URL + '/api/subscription/current', {
                    headers: {
                        'Authorization': 'Bearer ' + token
                    }
                });

                if (!response.ok) {
                    if (response.status === 401) {
                        // Token expired - redirect to login
                        localStorage.removeItem('token');
                        window.location.href = '/login.html?redirect=' + encodeURIComponent('/docs.html');
                        return;
                    }
                    throw new Error('Failed to check subscription');
                }

                const data = await response.json();
                const subscription = data.data.subscription;

                // Check if user is on trial plan
                if (subscription.plan_slug === 'trial') {
                    // Trial users don't have access - show upgrade page
                    showUpgradePage();
                    return;
                }

                // User has paid plan - load the actual documentation
                loadDocumentation();

            } catch (error) {
                console.error('Error checking access:', error);
                // On error, redirect to dashboard
                window.location.href = '/dashboard.html';
            }
        }

        function loadDocumentation() {
            // Load the actual documentation page
            window.location.href = '/docs-content.html';
        }

        function showUpgradePage() {
            document.body.innerHTML = \`
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body {
                        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        min-height: 100vh;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        padding: 2rem;
                    }
                    .container {
                        background: white;
                        border-radius: 20px;
                        padding: 3rem;
                        max-width: 600px;
                        text-align: center;
                        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                    }
                    .icon {
                        font-size: 4rem;
                        margin-bottom: 1.5rem;
                    }
                    h1 {
                        font-size: 2rem;
                        color: #1a202c;
                        margin-bottom: 1rem;
                    }
                    p {
                        color: #4a5568;
                        font-size: 1.1rem;
                        line-height: 1.6;
                        margin-bottom: 2rem;
                    }
                    .features {
                        background: #f7fafc;
                        border-radius: 12px;
                        padding: 1.5rem;
                        margin: 2rem 0;
                        text-align: left;
                    }
                    .features h3 {
                        color: #2d3748;
                        margin-bottom: 1rem;
                        font-size: 1.1rem;
                    }
                    .features ul {
                        list-style: none;
                    }
                    .features li {
                        padding: 0.5rem 0;
                        color: #4a5568;
                    }
                    .features li:before {
                        content: "✓ ";
                        color: #48bb78;
                        font-weight: bold;
                        margin-right: 0.5rem;
                    }
                    .btn {
                        display: inline-block;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        padding: 1rem 2rem;
                        border-radius: 10px;
                        text-decoration: none;
                        font-weight: 600;
                        font-size: 1.1rem;
                        transition: transform 0.3s, box-shadow 0.3s;
                        margin: 0.5rem;
                    }
                    .btn:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
                    }
                    .btn-secondary {
                        background: white;
                        color: #667eea;
                        border: 2px solid #667eea;
                    }
                    .btn-secondary:hover {
                        background: #f7fafc;
                    }
                </style>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
                <div class="container">
                    <div class="icon">
                        🔒
                    </div>
                    <h1>Premium Feature</h1>
                    <p>
                        The API Documentation is a premium feature available to our paid subscribers.
                        Upgrade your plan to access comprehensive API documentation, code examples, and integration guides.
                    </p>

                    <div class="features">
                        <h3>What you'll get with a paid plan:</h3>
                        <ul>
                            <li>Full API documentation access</li>
                            <li>Interactive code examples</li>
                            <li>100+ PDF conversions per month</li>
                            <li>Email support</li>
                            <li>High-quality PDF output</li>
                        </ul>
                    </div>

                    <div>
                        <a href="/dashboard.html#subscription" class="btn">
                            <i class="fas fa-arrow-up"></i> Upgrade Now
                        </a>
                        <a href="/dashboard.html" class="btn btn-secondary">
                            <i class="fas fa-arrow-left"></i> Back to Dashboard
                        </a>
                    </div>
                </div>
            \`;
        }

        // Run the access check
        checkAccess();
    </script>
</body>
</html>
    `);
});

/**
 * @route   GET /docs-content.html
 * @desc    Serve the actual documentation content (internal use only)
 * @access  Public (but only accessible after auth check)
 */
router.get("/docs-content.html", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "docs.html"));
});

module.exports = router;
