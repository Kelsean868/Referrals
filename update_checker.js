// This script checks for new PWA versions and prompts the user to update.

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').then(registration => {
        console.log('Service Worker registered with scope:', registration.scope);

        registration.addEventListener('updatefound', () => {
            // A new service worker is downloading.
            const newWorker = registration.installing;
            console.log('New service worker found. State:', newWorker.state);

            newWorker.addEventListener('statechange', () => {
                // The new service worker has installed and is waiting to activate.
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    // Show a notification to the user.
                    showUpdateNotification();
                }
            });
        });
    }).catch(err => {
        console.log('Service Worker registration failed:', err);
    });
}

function showUpdateNotification() {
    // Create the notification bar element
    const notification = document.createElement('div');
    notification.id = 'update-notification';
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.left = '50%';
    notification.style.transform = 'translateX(-50%)';
    notification.style.backgroundColor = '#1d2d35'; // Dark blue-grey
    notification.style.color = 'white';
    notification.style.padding = '15px 25px';
    notification.style.borderRadius = '8px';
    notification.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
    notification.style.zIndex = '10000';
    notification.style.display = 'flex';
    notification.style.alignItems = 'center';
    notification.style.gap = '20px';
    notification.style.fontFamily = 'Montserrat, sans-serif';

    notification.innerHTML = `
        <span>A new version of the app is available.</span>
        <button id="reload-button" style="padding: 8px 16px; border: none; background-color: #ae8625; color: white; border-radius: 5px; cursor: pointer; font-weight: 600;">RELOAD</button>
    `;

    document.body.appendChild(notification);

    // Add event listener to the reload button
    document.getElementById('reload-button').addEventListener('click', () => {
        // This tells the new service worker to take over and then reloads the page.
        navigator.serviceWorker.getRegistration().then(reg => {
            if (reg && reg.waiting) {
                reg.waiting.postMessage({ type: 'SKIP_WAITING' });
                // We add a small delay to allow the new service worker to take control
                // before the page reloads.
                setTimeout(() => {
                   window.location.reload();
                }, 500);
            }
        });
    });
}
