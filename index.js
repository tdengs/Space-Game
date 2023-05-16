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

// set up game object class
class GameObject {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
    }
}

// set up movable object class
class MovableObject extends GameObject {
    constructor(x, y, type) {
        super(x, y, type)
    }

    moveTo(x, y) {
        this.x = x;
        this.y = y;
    }

}

// set up player object class
class Player extends MovableObject {
    constructor(x, y) {
        super(x, y, "Player");
    }
}

// set up enemy object class
class Enemy extends MovableObject {
    constructor(x, y) {
        super(x, y, "Enemy");
    }
}

// set up a message structure
const Messages = {
    HERO_MOVE_LEFT: 'HERO_MOVE_LEFT',
    HERO_MOVE_RIGHT: 'HERO_MOVE_RIGHT'
};

// instantiate event emitter
const eventEmitter = new EventEmitter();

// instantiate player
const player = new Player(0, 0);

// let the event emitter know to watch for messages pertaining to movements of player, and act on it
eventEmitter.subscribe(Messages.HERO_MOVE_LEFT, () => player.moveTo(5, 0));
eventEmitter.subscribe(Messages.HERO_MOVE_RIGHT, () => player.moveTo(-5, 0));

// set up the window to listen for the key up event
window.addEventListener('keyup', (evt) => {
    if (evt.key === 'ArrowLeft') {
        eventEmitter.publish(Messages.HERO_MOVE_LEFT);
    }
    else if (evt.key === 'ArrowRight') {
        eventEmitter.publish(Messages.HERO_MOVE_RIGHT);
    }
});

// load assets
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

async function run() {
    try {
      // load player and enemy graphics
      const playerImg = await loadAsset('graphics/player.png');
      const enemyImg = await loadAsset('graphics/enemy.png');
  
      canvas = document.getElementById('myCanvas');
      ctx = canvas.getContext('2d');
      ctx.drawImage(playerImg, 100, 100);
      ctx.drawImage(enemyImg, 5, 0);
    } catch (error) {
      console.log('Error:', error);
    }
  }
  


run();



