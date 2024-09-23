// enemyWorker.js
self.onmessage = function(event) {
    if (event.data.action === 'start') {
        startEnemyGeneration();
    }
};

function startEnemyGeneration() {
    const minTime = 10; // 1 segundo
    const maxTime = 3000; // 5 segundos

    const generateEnemy = () => {
        self.postMessage({ action: 'spawnEnemy' });
        const randomDelay = Math.floor(Math.random() * (maxTime - minTime + 1)) + minTime;
        setTimeout(generateEnemy, randomDelay);
    };

    generateEnemy(); // Iniciar la generación
}
