class Speaker{
    constructor(){
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audioContext = new AudioContext();

        this.gain = this.audioContext.createGain();
        this.finish = this.audioContext.destination;

        this.gain.connect(this.finish);
    }

    play(frequency){
        if (this.audioCtx && !this.oscillator) {
            this.oscillator = this.audioCtx.createOscillator();
    
            // Set the frequency
            this.oscillator.frequency.setValueAtTime(frequency || 440, this.audioCtx.currentTime);
    
            // Square wave
            this.oscillator.type = 'square';
    
            // Connect the gain and start the sound
            this.oscillator.connect(this.gain);
            this.oscillator.start();
        }
    }

    stop(){
        if (this.oscillator) {
            this.oscillator.stop();
            this.oscillator.disconnect();
            this.oscillator = null;
        }
    }
}

export default Speaker;