document.addEventListener('DOMContentLoaded', function() {
    const refreshButton = document.getElementById('refresh-time');
    
    if (refreshButton) {
        refreshButton.addEventListener('click', async function() {
            const button = this;
            const originalHTML = button.innerHTML;
            
            // Show loading state
            button.innerHTML = '<span class="loading"></span> Refreshing...';
            button.disabled = true;
            
            try {
                // Fetch new time from API
                const response = await fetch('/api/time');
                const data = await response.json();
                
                // Update time displays
                const timeFormatted = document.querySelector('.time-formatted');
                const timeISO = document.querySelector('.time-iso');
                const timeTimestamp = document.querySelector('.time-timestamp');
                
                if (timeFormatted) {
                    timeFormatted.textContent = formatTime(data.serverTime, 'formatted');
                }
                
                if (timeISO) {
                    timeISO.textContent = data.serverTime;
                }
                
                if (timeTimestamp) {
                    timeTimestamp.textContent = data.timestamp;
                }
                
                // Add a subtle animation to show the update
                [timeFormatted, timeISO, timeTimestamp].forEach(element => {
                    if (element) {
                        element.style.transform = 'scale(1.05)';
                        element.style.transition = 'transform 0.2s ease';
                        setTimeout(() => {
                            element.style.transform = 'scale(1)';
                        }, 200);
                    }
                });
                
            } catch (error) {
                console.error('Error fetching time:', error);
                // Show error state briefly
                button.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Error';
                setTimeout(() => {
                    button.innerHTML = originalHTML;
                }, 2000);
            } finally {
                // Reset button after delay
                setTimeout(() => {
                    button.innerHTML = originalHTML;
                    button.disabled = false;
                }, 1000);
            }
        });
    }
    
    // Auto-refresh every 30 seconds
    setInterval(async function() {
        try {
            const response = await fetch('/api/time');
            const data = await response.json();
            
            const timeTimestamp = document.querySelector('.time-timestamp');
            if (timeTimestamp) {
                timeTimestamp.textContent = data.timestamp;
            }
        } catch (error) {
            console.error('Auto-refresh error:', error);
        }
    }, 30000);
});

// Helper function to format time (basic formatting)
function formatTime(isoString, format) {
    const date = new Date(isoString);
    
    if (format === 'formatted') {
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            hour12: true
        });
    }
    
    return isoString;
} 