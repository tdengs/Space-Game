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

