self.onmessage = function(event) {
    const { action, playerUnits, enemyUnits } = event.data;

    if (action === 'startCombat') {
        // Realizar el combate entre las unidades
        const combatResults = handleCombat(playerUnits, enemyUnits);

        // Devolver los resultados del combate
        self.postMessage({
            action: 'combatResult',
            combatResults: combatResults
        });
    }
};

// Función que maneja el combate entre las unidades del jugador y las del enemigo
function handleCombat(playerUnits, enemyUnits) {
    let updatedPlayerUnits = [...playerUnits];
    let updatedEnemyUnits = [...enemyUnits];

    // Revisar las colisiones entre las unidades del jugador y las del enemigo
    updatedPlayerUnits.forEach((cat, i) => {
        updatedEnemyUnits.forEach((enemy, j) => {
            if (checkCollision(cat, enemy)) {
                cat.inCombat = true; // Indicar que el gato está en combate
                enemy.inCombat = true; // Indicar que el enemigo está en combate

                const playerDamage = getPlayerDamage(cat);
                const enemyDamage = 10; // Daño básico de los enemigos

                cat.health -= enemyDamage;
                enemy.health -= playerDamage;

                if (cat.health <= 0) {
                    updatedPlayerUnits.splice(i, 1);
                }
                if (enemy.health <= 0) {
                    updatedEnemyUnits.splice(j, 1);
                }
            }
        });
    });

    return {
        playerUnits: updatedPlayerUnits,
        enemyUnits: updatedEnemyUnits
    };
}

// Función que verifica si dos unidades colisionan
function checkCollision(unit1, unit2) {
    const unit1Right = unit1.x + 50; // Asumiendo que todas las unidades tienen 50 de ancho
    const unit2Left = unit2.x;

    // Si el lado derecho de una unidad alcanza o supera el lado izquierdo de la otra
    return unit1Right >= unit2Left;
}

// Función para determinar el daño del gato
function getPlayerDamage(cat) {
    if (cat.type === 'tank') {
        return 0.1; // Gato tanque inflige más daño
    } else if (cat.type === 'train') {
        return 99999999999999999999; // Gato rápido inflige más daño
    }
    return 99999999; // Daño estándar
}
