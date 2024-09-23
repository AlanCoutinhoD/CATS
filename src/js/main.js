const canvas = document.getElementById('battlefield');
const ctx = canvas.getContext('2d');


let money = 100;
let playerUnits = [];
let enemyUnits = [];
let playerBaseHealth = 100;
let enemyBaseHealth = 100;


const backgroundImage = new Image();
backgroundImage.src = '../img/background.png'; 
const playerBaseImage = new Image();
playerBaseImage.src = '../img/base_aliada.png';
const enemyBaseImage = new Image();
enemyBaseImage.src = '../img/base_enemiga.png';
const catImage = new Image();
const catTankImage = new Image();
catTankImage.src = '../img/catTank.png';
catImage.src = '../img/cat.png';
const enemyImage = new Image();
enemyImage.src = '../img/dog.png';
const catTrainImage = new Image();
catTrainImage.src = '../img/catTrain.png';

// Inicializar los workers
const enemyWorker = new Worker('../js/workers/enemyWorker.js');
const moneyWorker = new Worker('../js/workers/moneyWorker.js');
const combatWorker = new Worker('../js/workers/combatWorker.js');

// Iniciar los workers
enemyWorker.postMessage({ action: 'start' });
moneyWorker.postMessage({ action: 'start' });

function drawBaseHealth(health, x, y) {
    ctx.font = '20px Arial';
    ctx.fillStyle = 'black';
    ctx.fillText(`HP: ${health}`, x, y);
}


class Unit {
    constructor(x, y, speed, image, health) {
        this.x = x; // Posición en X
        this.y = y; // Posición en Y
        this.speed = speed; // Velocidad de movimiento
        this.image = image; // Imagen de la unidad (gato o enemigo)
        this.width = 50; // Ancho de la unidad
        this.height = 50; // Altura de la unidad
        this.health = health; // Vida de la unidad
        this.isAttacking = false; // Si está atacando
        this.inCombat = false; // Nueva propiedad para indicar si está en combate
    }

    
    draw() {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        this.drawHealth(); 
    }

    // Función para mover la unidad
    move() {
        if (!this.isAttacking && !this.inCombat) { // Detener si está en combate
            this.x += this.speed; // Mover sin dirección específica (override en cada clase específica)
        }
    }

    // Dibujar barra de vida encima de la unidad
    drawHealth() {
        ctx.fillStyle = 'red';
        const healthBarWidth = 50;
        const healthBarHeight = 5;
       // ctx.fillRect(this.x, this.y - 10, healthBarWidth * (this.health / 100), healthBarHeight); // Proporcional a la salud
    }

    // Reducir vida de la unidad
    takeDamage(damage) {
        this.health -= damage;
        if (this.health <= 0) {
            this.health = 0;
        }
    }
}

// Clase para manejar enemigos
class Enemy extends Unit {
    constructor(x, y, speed, image, health) {
        super(x, y, speed, image, health);
    }

    move() {
        if (!this.isAttacking && !this.inCombat) {
            // Evitar que el enemigo se salga del límite izquierdo 
            if (this.x - this.speed >= 100) {  // 100 es el límite donde está la base 
                this.x -= this.speed;  // Los enemigos se mueven hacia la izquierda
            } else {
                this.isAttacking = true;  // Si llega a la base, se detiene y empieza a atacar
                this.attackPlayerBase();
            }
        }
    }

    getDamage() {
        return 2; 
    }

    attackPlayerBase() {
        if (this.isAttacking && playerBaseHealth > 0) {
            const attackInterval = setInterval(() => {
                if (playerBaseHealth > 0) {
                    playerBaseHealth -= 1;
                    console.log(`Base del jugador: ${playerBaseHealth} HP`);

                    if (playerBaseHealth <= 0) {
                        playerBaseHealth = 0;
                        clearInterval(attackInterval);
                        console.log('¡La base del jugador ha sido destruida!');
                    }
                }
            }, 1000);
        }
    }
}

// Clase para manejar los gatos
class Cat extends Unit {
    constructor(x, y, image, type = 'normal') {
        let speed;
        let health;

        switch(type) {
            case 'tank':
                speed = 0.5;
                health = 300;
                break;
            case 'train':
                speed = 1.5;
                health = 10;
                break;
            case 'newCatType':
                speed = 0.15;
                health = 100;
                break;
            default:
                speed = 1.0;
                health = 100;
        }

        super(x, y, speed, image, health);
        this.type = type;
    }

    move() {
        if (!this.isAttacking && !this.inCombat) {
            if (this.x + this.width + this.speed <= canvas.width - 100) {
                this.x += this.speed; // Mover el gato hacia la derecha
            } else {
                this.isAttacking = true;
                this.attackEnemyBase();
            }
        }
    }

    attackEnemyBase() {
        if (this.isAttacking && enemyBaseHealth > 0) {
            const damage = this.getDamage(); // Obtiene el daño según el tipo de gato
            const attackInterval = setInterval(() => {
                if (enemyBaseHealth > 0) {
                    enemyBaseHealth -= damage; // Aplica el daño a la base
                    console.log(`Base enemiga: ${enemyBaseHealth} HP`);

                    if (enemyBaseHealth <= 0) {
                        enemyBaseHealth = 0;
                        clearInterval(attackInterval);
                        console.log('¡La base enemiga ha sido destruida!');
                    }
                }
            }, 1000); 
        }
    }

    
    getDamage() {
        switch (this.type) {
            case 'tank':
                return 1; // Gato tanque hace menos daño
            case 'train':
                return 10; // Gato rápido hace más daño
            case 'newCatType':
                return 5; // Gato personalizado
            default:
                return 2; // Daño estándar
        }
    }

    // Método para atacar enemigos
    attackEnemy(enemy) {
        const damage = this.getDamage();
        enemy.takeDamage(damage); 
    }
}

// Función para comprobar colisiones
function checkCollision(unit1, unit2) {
    return unit1.x < unit2.x + unit2.width &&
           unit1.x + unit1.width > unit2.x &&
           unit1.y < unit2.y + unit2.height &&
           unit1.y + unit1.height > unit2.y;
}

// Recibir mensajes del worker
enemyWorker.onmessage = function(event) {
    if (event.data.action === 'spawnEnemy') {
        spawnEnemy();
    }
};

moneyWorker.onmessage = function(event) {
    if (event.data.action === 'generateMoney') {
        money += event.data.amount;
        updateMoney();
    }
};

combatWorker.onmessage = function(event) {
    if (event.data.action === 'combatResult') {
        const { combatResults } = event.data;

        playerUnits = combatResults.playerUnits.map(catData => {
            let image;
            switch(catData.type) {
                case 'tank':
                    image = catTankImage;
                    break;
                case 'train':
                    image = catTrainImage;
                    break;
                default:
                    image = catImage;
            }

            const unit = new Cat(catData.x, catData.y, image, catData.type);
            unit.inCombat = false; // Marcar como no en combate
            return unit;
        });

        enemyUnits = combatResults.enemyUnits.map(enemyData => {
            const unit = new Enemy(enemyData.x, enemyData.y, 0.1, enemyImage, enemyData.health);
            unit.inCombat = false; // Marcar como no en combate
            return unit;
        });
    }
};

// Función para crear gatos
function spawnCat() {
    if (money >= 50) {
        const newCat = new Cat(100, 330, catImage, 'normal');
        playerUnits.push(newCat);
        money -= 50;
        updateMoney();
    }
}

function spawnCatTank() {
    if (money >= 50) {
        const newCat = new Cat(100, 330, catTankImage, 'tank');
        playerUnits.push(newCat);
        money -= 50;
        updateMoney();
    }
}

function spawnCatTrain() {
    if (money >= 50) {
        const newCat = new Cat(100, 330, catTrainImage, 'train');
        playerUnits.push(newCat);
        money -= 25;
        updateMoney();
    }
}

// Función para generar enemigos
function spawnEnemy() {
    const newEnemy = new Enemy(canvas.width - 150, 330, 1, enemyImage, 100);
    enemyUnits.push(newEnemy);
}

// Función para manejar el combate
function handleCombat() {
    let combatActive = false; // Para verificar si hubo un combate

    playerUnits.forEach(playerUnit => {
        enemyUnits.forEach(enemyUnit => {
            if (checkCollision(playerUnit, enemyUnit)) {
                combatActive = true;
                playerUnit.inCombat = true;
                enemyUnit.inCombat = true;

                // Infligir daño
                const damageToEnemy = playerUnit.getDamage();
                enemyUnit.takeDamage(damageToEnemy);
                console.log(`Daño infligido al enemigo: ${damageToEnemy}. Vida restante: ${enemyUnit.health}`);

                const damageToPlayer = enemyUnit.getDamage();
                playerUnit.takeDamage(damageToPlayer);
                console.log(`Daño infligido al jugador: ${damageToPlayer}. Vida restante: ${playerUnit.health}`);

                // Eliminar unidades si la salud llega a cero
                if (enemyUnit.health <= 0) {
                    enemyUnits.splice(enemyUnits.indexOf(enemyUnit), 1);
                }
                if (playerUnit.health <= 0) {
                    playerUnits.splice(playerUnits.indexOf(playerUnit), 1);
                }
            }
        });
    });

    // Si hay combate activo, permitir que las unidades no se muevan
    if (combatActive) {
        playerUnits.forEach(unit => unit.inCombat = true);
        enemyUnits.forEach(unit => unit.inCombat = true);
    } else {
        // Si no hay combate, permitir el movimiento
        playerUnits.forEach(unit => unit.inCombat = false);
        enemyUnits.forEach(unit => unit.inCombat = false);
    }
}



// Función para dibujar las bases
function drawBase() {
    ctx.drawImage(playerBaseImage, 0, 300, 100, 100);
    drawBaseHealth(playerBaseHealth, 10, 290);
    ctx.drawImage(enemyBaseImage, canvas.width - 100, 300, 100, 100);
    drawBaseHealth(enemyBaseHealth, canvas.width - 90, 290);
}

function checkGameOver() {
    if (playerBaseHealth <= 0) {
        
        window.location.href = 'gameOver.html'; 
    } else if (enemyBaseHealth <= 0) {
    
        window.location.href = 'victory.html'; 
    }
}

// Función principal del ciclo de juego
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
    drawBase();

    playerUnits.forEach(unit => {
        unit.move();
        unit.draw();
    });

    enemyUnits.forEach(enemy => {
        enemy.move();
        enemy.draw();
    });

    handleCombat();
    requestAnimationFrame(gameLoop);
    checkGameOver(); 
}


function updateMoney() {
    document.getElementById('money').textContent = money;
}

document.getElementById('spawnCat').addEventListener('click', spawnCat);
document.getElementById('spawnCatTank').addEventListener('click', spawnCatTank);
document.getElementById('spawnCatTrain').addEventListener('click', spawnCatTrain);


gameLoop();

