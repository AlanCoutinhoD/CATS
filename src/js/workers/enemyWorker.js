
self.onmessage = function(event) {
    if (event.data.action === 'start') {
        startEnemyGeneration();
    }
};

function startEnemyGeneration() {
    

    const generateEnemy = () => {
        self.postMessage({ action: 'spawnEnemy' });
        const randomDelay = Math.floor(Math.random() * (3000 - 10 + 1)) + 10;
        setTimeout(generateEnemy, randomDelay);
    };

    generateEnemy(); 
}
