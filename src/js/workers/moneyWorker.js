
self.onmessage = function(event) {
    if (event.data.action === 'start') {
        startMoneyGeneration();
    }
};

function startMoneyGeneration() {
    setInterval(() => {
        self.postMessage({ action: 'generateMoney', amount: 5 });
    }, 100); // Genera 10 unidades de dinero cada 1 segundo
}

