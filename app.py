
import os
import logging
from flask import Flask, render_template

# Set up logging
logging.basicConfig(level=logging.INFO)

# Create Flask app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "default_secret_key")

# Disable debug mode in production
app.debug = False

@app.route('/')
def index():
    """Render the main page with the food selection interface."""
    return render_template('index.html')

@app.route('/preview')
def preview():
    """Render the preview page to view selected foods and customize details."""
    return render_template('preview.html')

if __name__ == "__main__":
    # Use production server
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
