// set up class objects
// set up game object class
class GameObject {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.type = '';
        this.dead = false;
        this.width = 0;
        this.height = 0;
        this.img = '';
    }

    draw(ctx) {
        ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
    }
}

// set up player object class
class Player extends GameObject {
    constructor(x, y) {
        super(x, y);
        this.type = 'Player';
        (this.width = 99), (this.height = 75);
        this.speed = { x: 0, y: 0 };
    }
}

// set up enemy object class
class Enemy extends GameObject {
    constructor(x, y) {
        super(x, y);
        this.type = 'Enemy';
        (this.width = 98), (this.height = 50);
        let id = setInterval(() => {
            if (this.y < canvas.height - this.height) {
                this.y += 5;
            } else {
                console.log('Stopped at', this.y);
                clearInterval(id);
            }
        }, 300)
    }
}

// set up an event emitter class that contains listeners using pub-sub pattern
class EventEmitter {
    constructor() {
        this.subscribers = {};
    }

    // takes a message and a callback function, and adds the callback to the list of subscribers for that message
    subscribe(message, subscriber) {
        if (!this.subscribers[message]) {
            this.subscribers[message] = [];
        }
        this.subscribers[message].push(subscriber);
    }

    // takes a message and payload, and invokes all the callbacks subscribed to that message with the provided arguments
    publish(message, payload = null) {
        if (this.subscribers[message]) {
            this.subscribers[message].forEach(subscriber => subscriber(message, payload));
        }
    }
}


// set up a message structure
const Messages = {
    PLAYER_MOVE_LEFT: ' PLAYER_MOVE_LEFT',
    PLAYER_MOVE_RIGHT: 'PLAYER_MOVE_RIGHT',
    PLAYER_MOVE_UP: 'PLAYER_MOVE_UP',
    PLAYER_MOVE_DOWN: 'PLAYER_MOVE_DOWN',
};

let playerImg,
    enemyImg,
    laserImg,
    canvas, ctx,
    gameObjects = [],
    player,
    eventEmitter = new EventEmitter();

// set up key event handlers
let onKeyDown = function (e) {
    console.log(e.keyCode);
    switch (e.keyCode) {
        // left arrow
        case 37:
        // right arrow
        case 39:
        // top arrow
        case 38:
        // bottom arrow
        case 40:
        // space bar
        case 32:
            e.preventDefault();
            break;
        // ignore other keys
        default:
            break;
    }
};

function initGame() {
    gameObjects = [];
    createEnemies();
    createPlayer();

    // let the event emitter know to watch for messages pertaining to movements of player, and act on it
    eventEmitter.subscribe(Messages.PLAYER_MOVE_LEFT, () => player.x -= 5);
    eventEmitter.subscribe(Messages.PLAYER_MOVE_RIGHT, () => player.x += 5);
    eventEmitter.subscribe(Messages.PLAYER_MOVE_UP, () => player.y -= 5);
    eventEmitter.subscribe(Messages.PLAYER_MOVE_DOWN, () => player.y += 5);
}

function loadAsset(path) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = path;
        img.onload = () => {
            // image loaded and ready to be used
            resolve(img);
        }
        img.onerror = () => {
            // image failed to load
            reject(new Error(`Image failed to load: ${path}`));
        }
    })
}

function createEnemies() {
    const MONSTER_TOTAL = 5;
    const MONSTER_WIDTH = MONSTER_TOTAL * 98;
    const START_X = (canvas.width - MONSTER_WIDTH) / 2;
    const STOP_X = START_X + MONSTER_WIDTH;

    for (let x = START_X; x < STOP_X; x += 98) {
        for (let y = 0; y < 50 * 5; y += 50) {
            const enemy = new Enemy(x, y);
            enemy.img = enemyImg;
            gameObjects.push(enemy);
        }
    }
}

function createPlayer(){
    const player = new Player(canvas.width / 2 - 45, canvas.height - canvas.height / 4);
    player.img = playerImg;
    gameObjects.push(player);
}

function drawGameObjects(){
    gameObjects.forEach(obj => obj.draw(ctx));
}

window.addEventListener("keydown", onKeyDown);

// set up the window to listen for the key up event
window.addEventListener('keyup', (evt) => {
    if (evt.key === 'ArrowLeft') {
        eventEmitter.publish(Messages.PLAYER_MOVE_LEFT);
    }
    else if (evt.key === 'ArrowRight') {
        eventEmitter.publish(Messages.PLAYER_MOVE_RIGHT);
    }
    else if (evt.key === 'ArrowUp') {
        eventEmitter.publish(Messages.PLAYER_MOVE_UP);
    }
    else if (evt.key === 'ArrowDown') {
        eventEmitter.publish(Messages.PLAYER_MOVE_DOWN);
    }
});


window.onload = async () => {
    canvas = document.getElementById('myCanvas');
    ctx = canvas.getContext('2d');

    try {
        // load player and enemy graphics
        playerImg = await loadAsset('graphics/player.png');
        enemyImg = await loadAsset('graphics/enemy.png');
    } catch (error) {
        console.log('Error:', error);
    }

    // only load game if all images are loaded successfully
    if (playerImg && enemyImg) {
        initGame();
    }
    else{
        // error screen
    }

    let gameLoop = setInterval(() =>{
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        drawGameObjects(ctx);
    }, 100);
}






