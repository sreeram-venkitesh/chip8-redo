import CPU from './src/CPU.js'
import Monitor from './src/Monitor.js'
import Keyboard from './src/Keyboard.js';
import Speaker from './src/Speaker.js'

const monitor = new Monitor(15);
const keyboard = new Keyboard();
const speaker = new Speaker();
const cpu = new CPU(monitor,keyboard,speaker);

let loop;

let fps = 60, fpsInterval, startTime, now, then, elapsed;

function init(){
    fpsInterval = 1000/fps;
    then = Date.now();
    startTime = then;

    cpu.loadSprites();
    cpu.loadRom("BLITZ");
    loop = requestAnimationFrame(step);
}

function step(){
    now = Date.now();
    elapsed = now - then;

    if(elapsed > fpsInterval){
        cpu.cycle();
    }

    loop = requestAnimationFrame(step);
}

init();