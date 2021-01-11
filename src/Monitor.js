class Monitor{
    constructor(scale){
        this.cols = 64;
        this.rows = 32;

        this.scale = scale;

        this.canvas = document.querySelector('canvas');
        this.context = this.canvas.getContext('2d');

        this.canvas.width = this.cols * this.scale;
        this.canvas.height = this.rows * this.scale;

        this.display = new Array(this.cols * this.rows);
    }
    
    clear(){
        this.display = new Array(this.cols * this.rows);
    }

    setPixel(x,y){
        if(x > this.cols){
            x -= this.cols;
        }else if(x < 0){
            x += this.cols;
        }

        if(y > this.rows){
            y -= this.rows;
        }else if(y < 0){
            y += this.rows;
        }

        let pixelLocation = x + (y * this.cols);

        this.display[pixelLocation] ^= 1;

        return !this.display[pixelLocation];

    }

    render(){
        this.context.clearRect(0,0,this.canvas.width,this.canvas.height);

        for(let i=0;i<this.cols*this.rows;i++){
            let x = (i % this.cols) * this.scale;

            let y = Math.floor(i/this.cols) * this.scale;

            if(this.display[i]){
                this.context.fillStyle = "#333";
                this.context.fillRect(x,y,this.scale,this.scale);
            }
        }

    }

    testRender(){
        this.display[2047] = 1;
        this.display[64] = 1;
        this.render(); 
    }
}

export default Monitor;