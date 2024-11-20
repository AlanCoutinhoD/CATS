// Esperar a que se presione el botón de inicio para cargar el script principal
document.getElementById('startButton').addEventListener('click', function() {
    // Ocultar la pantalla de inicio
    document.getElementById('startScreen').style.display = 'none';

    // Mostrar la pantalla del juego
    document.getElementById('gameScreen').style.display = 'block';

    // Cargar el script principal cuando se presiona el botón "Iniciar"
    const script = document.createElement('script');
    script.src = '../js/main.js'; // Ruta del archivo JS principal
    document.body.appendChild(script); // Añadir el script a la página
});
