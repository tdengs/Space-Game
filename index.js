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

    rectFromGameObject(){
        return{
            top: this.y,
            left: this.x,
            bottom: this.y + this.height,
            right: this.x + this.width,
        };
    }
}

// set up player object class
class Player extends GameObject {
    constructor(x, y) {
        super(x, y);
        this.type = 'Player';
        (this.width = 99), (this.height = 75);
        this.speed = { x: 0, y: 0 };
        this.cooldown = 0;
        this.life = 3;
        this.points = 0;
    }

    fire(){
        gameObjects.push(new Laser(this.x + 45, this.y - 10));
        this.cooldown = 500;

        let id = setInterval(() => {
            if (this.cooldown > 0){
                this.cooldown -= 100;
            }
            else{
                clearInterval(id);
            }
        }, 200);
    }

    canFire(){
        return (this.cooldown === 0);
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

class Laser extends GameObject {
    constructor(x, y){
        super(x,y);
        this.type = 'Laser';
        (this.width = 9), (this.height = 33);
        this.img = laserImg;
        let id = setInterval(() => {
            if(this.y > 0){
                this.y -= 15;
            }
            else{
                this.dead = true;
                clearInterval(id);
            }
        }, 100)
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
    KEY_EVENT_SPACE: 'KEY_EVENT_SPACE',
    COLLISION_ENEMY_LASER: 'COLLISION_ENEMY_LASER',
    COLLISION_ENEMY_PLAYER: 'COLLISION_ENEMY_PLAYER'
};

let playerImg,
    enemyImg,
    laserImg,
    lifeImg,
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
    // check that player does not exceed canvas boundary
    eventEmitter.subscribe(Messages.PLAYER_MOVE_LEFT, () => {
        if (player.x >= 0){
            player.x -= 5
        }
    });
    eventEmitter.subscribe(Messages.PLAYER_MOVE_RIGHT, () => {
        if ((player.x + player.width) <= canvas.width){
            player.x += 5
        }
    });
    eventEmitter.subscribe(Messages.PLAYER_MOVE_UP, () => {
        if (player.y >= 0){
            player.y -= 5
        }
    });
    eventEmitter.subscribe(Messages.PLAYER_MOVE_DOWN, () => {
        if ((player.y + player.height) <= canvas.height){
            player.y += 5
        }
    });
    eventEmitter.subscribe(Messages.KEY_EVENT_SPACE, () => {
        if (player.canFire()){
            player.fire()
        }
    })
    eventEmitter.subscribe(Messages.COLLISION_ENEMY_LASER, (_, {first, second}) => {
        first.dead = true;
        second.dead = true;
    })
    eventEmitter.subscribe(Messages.COLLISION_ENEMY_PLAYER, (_, {enemy}) => {
        enemy.dead = true;
    })
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
    player = new Player(canvas.width / 2 - 45, canvas.height - canvas.height / 4);
    player.img = playerImg;
    gameObjects.push(player);
}

function drawGameObjects(){
    gameObjects.forEach(obj => obj.draw(ctx));
}

function updateGameObjects(){
    const enemies = gameObjects.filter(obj => obj.type === 'Enemy');
    const lasers = gameObjects.filter(obj => obj.type === 'Laser');

    // laser hit enemies
    lasers.forEach((l) => {
        enemies.forEach((e) => {
            if(intersectRect(l.rectFromGameObject(), e.rectFromGameObject())){
                eventEmitter.publish(Messages.COLLISION_ENEMY_LASER, {first: l, second: e});
            }
        });
    });

    // player hit enemies
    enemies.forEach((e) => {
        const playerRect = player.rectFromGameObject();
        if (intersectRect(playerRect, e.rectFromGameObject())){
            eventEmitter.publish(Messages.COLLISION_ENEMY_PLAYER, {enemy: e});
        }
    })

    gameObjects = gameObjects.filter(obj => !obj.dead);
}

// to detect collision
function intersectRect(r1, r2){
    return !(r2.left > r1.right || r2.right < r1.left || r2.top > r1.bottom || r2.bottom < r1.top);
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
    else if (evt.key === ' '){
        eventEmitter.publish(Messages.KEY_EVENT_SPACE);
    }
});


window.onload = async () => {
    canvas = document.getElementById('myCanvas');
    ctx = canvas.getContext('2d');

    try {
        // load player, enemy and laser graphics
        playerImg = await loadAsset('graphics/player.png');
        enemyImg = await loadAsset('graphics/enemy.png');
        laserImg = await loadAsset('graphics/laserGreen.png');
        lifeImg = await loadAsset('graphics/life.png');
    } catch (error) {
        console.log('Error:', error);
    }

    // only load game if all images are loaded successfully
    if (playerImg && enemyImg && laserImg) {
        initGame();
    }
    else{
        // error screen
    }

    let gameLoop = setInterval(() =>{
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        updateGameObjects();
        drawGameObjects(ctx);
    }, 100);
}






