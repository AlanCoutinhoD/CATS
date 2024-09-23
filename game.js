// Obtener el canvas y su contexto
const canvas = document.getElementById('battlefield');
const ctx = canvas.getContext('2d');

// Variables globales
let money = 100;  // Dinero inicial
let playerUnits = [];  // Aquí se almacenan los gatos generados
let enemyUnits = [];  // Aquí se almacenan los enemigos generados
let playerBaseHealth = 100;
let enemyBaseHealth = 100;  // Salud de la base enemiga

// Cargar las imágenes de las bases
const playerBaseImage = new Image();
playerBaseImage.src = 'base_aliada.png'; // Reemplaza con la ruta correcta de la imagen de la base aliada

const enemyBaseImage = new Image();
enemyBaseImage.src = 'base_enemiga.png'; // Reemplaza con la ruta correcta de la imagen de la base enemiga

// Cargar la imagen del gato
const catImage = new Image();
catImage.src = 'gato.png'; // Reemplaza con la ruta de la imagen del gato

// Cargar la imagen del enemigo
const enemyImage = new Image();
enemyImage.src = 'gato.png'; // Reemplaza con la ruta de la imagen del enemigo









// Clase para manejar unidades (gatos y enemigos)
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
    }

    // Función para dibujar la unidad en el canvas
    draw() {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
      //  this.drawHealth();  // Dibujar la barra de vida encima de la unidad
    }

    // Función para mover la unidad (dirección: 1 para gatos, -1 para enemigos)
    move(direction = 1) {
        if (!this.isAttacking) {
            this.x += this.speed * direction;
        }
    }

    // Dibujar barra de vida encima de la unidad
    drawHealth() {
        ctx.fillStyle = 'red';
        const healthBarWidth = 50;
        const healthBarHeight = 5;
        ctx.fillRect(this.x, this.y - 10, healthBarWidth * (this.health / 100), healthBarHeight); // Proporcional a la salud
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
        if (!this.isAttacking) {
            // Evitar que el enemigo se salga del límite izquierdo (su base)
            if (this.x - this.speed >= 100) {  // 100 es el límite donde está la base del jugador
                this.x -= this.speed;  // Los enemigos se mueven hacia la izquierda
            } else {
                this.isAttacking = true;  // Si llega a la base, se detiene y empieza a atacar
                this.attackPlayerBase();
            }
        }
    }

    checkAttack() {
        if (this.x <= 100) {  // Si el enemigo llega a la base del jugador
            this.isAttacking = true;
            this.attackPlayerBase();
        }
    }

    attackPlayerBase() {
        if (this.isAttacking && playerBaseHealth > 0) {
            const attackInterval = setInterval(() => {
                if (playerBaseHealth > 0) {
                    playerBaseHealth -= 1;  // El enemigo causa 10 puntos de daño por ataque
                    console.log(`Base del jugador: ${playerBaseHealth} HP`);

                    if (playerBaseHealth <= 0) {
                        playerBaseHealth = 0;
                        clearInterval(attackInterval);  // Detener el ataque si la base del jugador es destruida
                        console.log('¡La base del jugador ha sido destruida!');
                    }
                }
            }, 1000);  // El ataque ocurre cada 1 segundo
        }
    }
}

// Clase para manejar los gatos
class Cat extends Unit {
    constructor(x, y, speed, image, health) {
        super(x, y, speed, image, health);
    }

    move() {
        if (!this.isAttacking) {
            // Evitar que el gato se salga del límite derecho (su base)
            if (this.x + this.width + this.speed <= canvas.width - 100) {  // canvas.width - 100 es el límite donde está la base enemiga
                this.x += this.speed;  // Mover el gato hacia la derecha
            } else {
                this.isAttacking = true;  // Si llega a la base, se detiene y empieza a atacar
                this.attackEnemyBase();
            }
        }
    }

    checkAttack() {
        if (this.x + this.width >= canvas.width - 100) {  // Si el gato llega a la base enemiga
            this.isAttacking = true;
            this.attackEnemyBase();
        }
    }

    attackEnemyBase() {
        if (this.isAttacking && enemyBaseHealth > 0) {
            const attackInterval = setInterval(() => {
                if (enemyBaseHealth > 0) {
                    enemyBaseHealth -= 10;  // El gato causa 10 puntos de daño por ataque
                    console.log(`Base enemiga: ${enemyBaseHealth} HP`);

                    if (enemyBaseHealth <= 0) {
                        enemyBaseHealth = 0;
                        clearInterval(attackInterval);  // Detener el ataque si la base enemiga es destruida
                        console.log('¡La base enemiga ha sido destruida!');
                    }
                }
            },1000);  // El ataque ocurre cada 1 segundo
        }
    }
}


// Detectar colisión entre dos unidades
function checkCollision(unitA, unitB) {
    return (
        unitA.x < unitB.x + unitB.width &&
        unitA.x + unitA.width > unitB.x &&
        unitA.y < unitB.y + unitB.height &&
        unitA.height + unitA.y > unitB.y
    );
}

// Ataque entre gatos y enemigos
function handleCombat() {
    playerUnits.forEach((cat, catIndex) => {
        let catInCombat = false;  // Flag para saber si el gato está en combate

        enemyUnits.forEach((enemy, enemyIndex) => {
            let enemyInCombat = false;  // Flag para saber si el enemigo está en combate

            if (checkCollision(cat, enemy)) {
                cat.isAttacking = true;
                enemy.isAttacking = true;
                catInCombat = true;
                enemyInCombat = true;

                // Ambos se atacan y reciben daño
                cat.takeDamage(10);  // El enemigo hace 10 de daño al gato
                enemy.takeDamage(10);  // El gato hace 10 de daño al enemigo

                // Si el gato muere, se elimina de la lista de unidades
                if (cat.health <= 0) {
                    playerUnits.splice(catIndex, 1);
                }

                // Si el enemigo muere, se elimina de la lista de enemigos
                if (enemy.health <= 0) {
                    enemyUnits.splice(enemyIndex, 1);
                }
            }
        });

        // Si el gato no está en combate, debe seguir moviéndose
        if (!catInCombat) {
            cat.isAttacking = false;
        }
    });

    // Hacer lo mismo para los enemigos: si no están en combate, deben seguir moviéndose
    enemyUnits.forEach((enemy, enemyIndex) => {
        let enemyInCombat = false;

        playerUnits.forEach((cat, catIndex) => {
            if (checkCollision(cat, enemy)) {
                enemyInCombat = true;
            }
        });

        // Si el enemigo no está en combate, debe seguir moviéndose
        if (!enemyInCombat) {
            enemy.isAttacking = false;
        }
    });
}


// Función para generar gatos
function spawnCat() {
    if (money >= 50) {  // El gato cuesta 50 de dinero
        const newCat = new Cat(100, 330, 0.1, catImage, 1000);  // Crear un nuevo gato con 100 de vida
        playerUnits.push(newCat);  // Agregar el gato a la lista de unidades
        money -= 50;  // Restar dinero
        updateMoney();  // Actualizar la pantalla
    }
}

// Función para generar enemigos
function spawnEnemy() {
    const newEnemy = new Enemy(canvas.width - 150, 330, 0.1, enemyImage, 100);  // Crear un nuevo enemigo con 100 de vida
    enemyUnits.push(newEnemy);  // Agregar el enemigo a la lista de enemigos
}

// Función para dibujar las bases
function drawBase() {
    // Dibujar la base del jugador
    ctx.drawImage(playerBaseImage, 0, 300, 100, 100);
    drawBaseHealth(playerBaseHealth, 10, 290); // Vida de la base aliada

    // Dibujar la base enemiga
    ctx.drawImage(enemyBaseImage, canvas.width - 100, 300, 100, 100);
    drawBaseHealth(enemyBaseHealth, canvas.width - 90, 290); // Vida de la base enemiga
}

// Función para dibujar la vida de las bases
function drawBaseHealth(health, x, y) {
    ctx.font = '20px Arial';
    ctx.fillStyle = 'black';
    ctx.fillText(`HP: ${health}`, x, y);
}

// Función para actualizar el dinero en pantalla
function updateMoney() {
    document.getElementById('money').textContent = money;
}

// Función principal del ciclo de juego
function gameLoop() {
    // Limpiar el canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dibujar las bases
    drawBase();

    // Mover y dibujar cada gato
    playerUnits.forEach(unit => {
        unit.move(1);  // Mover el gato hacia la derecha
        unit.draw();  // Dibujar el gato
        unit.checkAttack();  // Revisar si el gato debe atacar la base enemiga
    });

    // Mover y dibujar cada enemigo
    enemyUnits.forEach(enemy => {
        enemy.move(-1);  // Mover el enemigo hacia la izquierda
        enemy.draw();  // Dibujar el enemigo
        enemy.checkAttack();  // Revisar si el enemigo debe atacar la base del jugador
    });

    // Manejar colisiones y combates entre gatos y enemigos
    handleCombat();

    // Continuar el ciclo del juego
    requestAnimationFrame(gameLoop);
}

// Generar dinero cada segundo
function generateMoney() {
    setInterval(() => {
        money += 10;  // Incrementa el dinero cada segundo
        updateMoney();  // Actualiza el valor mostrado en pantalla
    }, 1000);
}

// Asegurarse de que las imágenes están cargadas antes de iniciar el ciclo de juego
let imagesLoaded = 0;
const totalImages = 5; // playerBaseImage, enemyBaseImage, catImage, enemyImage

function checkAllImagesLoaded() {
    imagesLoaded++;
    if (imagesLoaded === totalImages) {
        // Iniciar el ciclo del juego
        gameLoop();
        generateMoney();  // Iniciar la generación de dinero
    }
}

// Asegurarse de que las imágenes se carguen antes de empezar
playerBaseImage.onload = checkAllImagesLoaded;
enemyBaseImage.onload = checkAllImagesLoaded;
catImage.onload = checkAllImagesLoaded;
enemyImage.onload = checkAllImagesLoaded;

// Lógica del botón para generar gatos
document.getElementById('spawnCat').addEventListener('click', spawnCat);

// Generar enemigos automáticamente cada cierto tiempo
setInterval(spawnEnemy, 300);  // Genera un enemigo cada 3 segundos
