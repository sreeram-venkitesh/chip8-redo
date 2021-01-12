class CPU{
    constructor(monitor,keyboard,speaker){
        this.memory = new Uint8Array(4096);
        this.v = new Uint8Array(16);
        this.i = 0;

        this.delayTimer = 0;
        this.soundTimer = 0;

        this.pc = 0x200;
        this.stack = new Array();

        this.monitor = monitor;
        this.keyboard = keyboard;
        this.speaker = speaker;
        
        this.paused = false;
        this.speed = 10;
    }

    loadRom(rom){
        var request = new XMLHttpRequest;
        var self = this;

        request.onload = function(){
            // if request response has any content
            if(request.response){
                let program = new Uint8Array(request.response);
                self.loadProgramIntoMemory(program);
            }
        }
        request.open('GET','roms/' + rom);
        request.responseType = 'arraybuffer';
        request.send();
    }

    loadProgramIntoMemory(program){
        for(let i=0; i<program.length; i++){
            this.memory[0x200 + i] = program[i]
        }
    }

    updateTimers(){
        if(this.delayTimer > 0){
            this.delayTimer -= 1;
        }
        if(this.soundTimer > 0){
            this.soundTimer -= 1;
        }
    }

    loadSprites(){
        const sprites = [
            0xF0, 0x90, 0x90, 0x90, 0xF0, // 0
            0x20, 0x60, 0x20, 0x20, 0x70, // 1
            0xF0, 0x10, 0xF0, 0x80, 0xF0, // 2
            0xF0, 0x10, 0xF0, 0x10, 0xF0, // 3
            0x90, 0x90, 0xF0, 0x10, 0x10, // 4
            0xF0, 0x80, 0xF0, 0x10, 0xF0, // 5
            0xF0, 0x80, 0xF0, 0x90, 0xF0, // 6
            0xF0, 0x10, 0x20, 0x40, 0x40, // 7
            0xF0, 0x90, 0xF0, 0x90, 0xF0, // 8
            0xF0, 0x90, 0xF0, 0x10, 0xF0, // 9
            0xF0, 0x90, 0xF0, 0x90, 0x90, // A
            0xE0, 0x90, 0xE0, 0x90, 0xE0, // B
            0xF0, 0x80, 0x80, 0x80, 0xF0, // C
            0xE0, 0x90, 0x90, 0x90, 0xE0, // D
            0xF0, 0x80, 0xF0, 0x80, 0xF0, // E
            0xF0, 0x80, 0xF0, 0x80, 0x80  // F
        ];

        for(let i=0; i<sprites.length; i++){
            this.memory[i] = sprites[i]
        }
    }

    playSound() {
        if (this.soundTimer > 0) {
            this.speaker.play(440);
        } else {
            this.speaker.stop();
        }
    }

    cycle(){
        for(let i=0; i<this.speed; i++){
            if(!this.paused){
                let opcode = (this.memory[this.pc] << 8 | this.memory[this.pc + 1]);
                this.executeInstruction(opcode);
            }
        }

        if(!this.paused){
            this.updateTimers();
        }

        this.monitor.render();
    }

    executeInstruction(opcode){
        this.pc += 2;

        let x = (opcode & 0x0F00) >> 8;
        let y = (opcode & 0x00F0) >> 4;

        switch(opcode & 0xF000){
            case 0x0000:
                switch(opcode){
                    case 0x00E0:
                        this.monitor.clear();
                        break;
                    case 0x00EE:
                        this.pc = this.stack.pop();
                        break;
                }
            case 0x1000:
                this.pc = (opcode & 0xFFF);
                break;
            case 0x2000:
                this.stack.push(this.pc);
                this.pc = (opcode & 0xFFF);
                break;
            case 0x3000:
                if(this.v[x] === (opcode & 0xFF)){
                    this.pc += 2;
                }
                break;
            case 0x4000:
                if(this.v[x] !== (opcode & 0xFF)){
                    this.pc += 2;
                }
                break;
            case 0x5000:
                if(this.v[x] === this.v[y]){
                    this.pc += 2;
                }
                break;
            case 0x6000:
                this.v[x] = (opcode & 0xFF);
                break;
            case 0x7000:
                this.v[x] += (opcode & 0xFF);
                break;
            case 0x8000:
                switch(opcode & 0xF){
                    case 0:
                        this.v[x] = this.v[y];
                        break;
                    case 1:
                        this.v[x] |= this.v[y];
                        break;
                    case 2:
                        this.v[x] &= this.v[y];
                        break;
                    case 3:
                        this.v[x] ^= this.v[y];
                        break;
                    case 4:
                        let sum = (this.v[x] + this.v[y]);
                        this.v[0xF] = 0;
                        if(sum>0xFF){
                            this.v[0xF] =1;
                        }
                        this.v[x] = sum;
                        break;
                    case 5:
                        let diff = (this.v[x] - this.v[y]);
                        this.v[0xF] = 0;
                        if(this.v[x] > this.v[y]){
                            this.v[0xF] = 1;
                        }
                        this.v[x] = diff;
                    case 6:
                        this.v[0xF] = (this.v[x] & 0x1);
                        this.v[x] >>= 1;
                        break; 
                    case 7:
                        this.v[0xF] = 0;
                        if(this.v[y] > this.v[x]){
                            this.v[0xF] = 1
                        }
                        this.v[x] = this.v[y] - this.v[x];
                        break;
                    case 0xE:
                        this.v[F] = (this.v[x] & 0x80);
                        this.v[x] <<= 1;
                        break;
                }

                case 0x9000:
                    if(this.v[x] !== this.v[y]){
                        this.pc += 2;
                    }
                    break;
                case 0xA000:
                    this.i = (opcode & 0xFFF);
                    break;
                case 0xB000:
                    this.pc += ((opcode & 0xFFF) + this.v[0]);
                case 0xC000:
                    let rand = Math.floor(Math.random() * 0xFF);
                    this.v[x] = (rand & (opcode & 0xFF));
                    break;
                case 0xD000:
                    let width = 8;
                    let height = (opcode & 0xF);

                    this.v[0xF] =0;
                    
                    for(let row=0; row<height; row++){
                        
                        let sprite = this.memory[this.i + row];
                        
                        for(let column=0; column<width; column++){

                            if((sprite & 0x80) > 0){
                                if(this.monitor.setPixel(this.v[x]+column, this.v[y]+row)){
                                    this.v[0xF] = 1;
                                }
                            }

                            sprite = sprite << 1;
                        }
                    }
                    break;
                case 0xE000:
                    switch(opcode & 0xFF){
                        case 0x9E:
                            if(this.keyboard.isKeyPressed(this.v[x])){
                                this.pc += 2;
                            }
                            break;
                        case 0xA1:
                            if(!this.keyboard.isKeyPressed(this.v[x])){
                                this.pc += 2;
                            }
                            break;
                    }
                case 0xF000:
                    switch(opcode & 0xFF){
                        case 0x07:
                            this.v[x] = this.delayTimer;
                            break;
                        case 0x0A:
                            this.paused = true;
                            this.keyboard.onNextKeyPress = function(key){
                                this.v[x] = key;
                                this.paused = false;
                            }.bind(this);
                            break;
                        case 0x15:
                            this.delayTimer = this.v[x];
                            break;
                        case 0x18:
                            this.soundTimer = this.v[x];
                            break;
                        case 0x1E:
                            this.i += this.v[x];
                            break;
                        case 0x29:
                            this.i = this.v[x] * 5;
                            break;
                        case 0x33:
                            this.memory[this.i] = parseInt(this.v[x]/100);
                            this.memory[this.i+1] = parseInt((this.v[x]%100)/10);
                            this.memory[this.i+2] = parseInt(this.v[x]%1);
                            break;
                        case 0x55:
                            for(let index=0; index<x; index++){
                                this.memory[this.i+index] = this.v[index];
                            }
                            break;
                        case 0x65:
                            for(let index=0; index<x; index++){
                                this.v[index] = this.memory[this.i + index];
                            }
                            break;
                            
                    }
                    break;
                default:
                    throw new Error('Invalid opcode!' + opcode);
        }

    }

}

export default CPU;