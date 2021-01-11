class Keyboard{
    constructor(){
        this.keymap = {
            49: 0x1, // 1
            50: 0x2, // 2
            51: 0x3, // 3
            52: 0xc, // 4
            81: 0x4, // Q
            87: 0x5, // W
            69: 0x6, // E
            82: 0xD, // R
            65: 0x7, // A
            83: 0x8, // S
            68: 0x9, // D
            70: 0xE, // F
            90: 0xA, // Z
            88: 0x0, // X
            67: 0xB, // C
            86: 0xF  // V
        };

        this.keysPressed = [];

        this.onNextKeyPress = null;

        window.addEventListener('keydown',this.onKeyDown.bind(this),false);
        window.addEventListener('keyup',this.onKeyUp.bind(this),false);
    }

    isKeyPressed(key){
        return this.keysPressed[key];
    }

    onKeyDown(event){
        console.log(`Event is ${event.which}`);
        let key = this.keymap[event.which];
        console.log(`Key is ${key}`);
        this.keysPressed[key] = true;

        if(this.onNextKeyPress !== null && key){
            this.onNextKeyPress(parseInt(key));
            this.onNextKeyPress = null;
        }
    }

    onKeyUp(event){
        let key = this.keymap[event.which];
        this.keysPressed[key] = false;
    }
}

export default Keyboard;