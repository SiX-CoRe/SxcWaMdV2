import Canvas from 'canvas'

class LevelUp {

    constructor() {
        this.bg = "https://i.ibb.co/4JcZQ6F/20210807-112304.jpg";
        this.avatar = "https://i.ibb.co/G5mJZxs/rin.jpg";
    }
     
    setAvatar(value) {
        this.avatar = value;
        return this;
    }
    async toAttachment() {
    
    
        
        const canvas = Canvas.createCanvas(600, 200);
        const ctx = canvas.getContext("2d");
       
   
        
        let background = await Canvas.loadImage(this.bg);
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    ctx.save();
	ctx.beginPath();
	ctx.rotate(-25 * Math.PI / 180);
	let avatar = await Canvas.loadImage(this.avatar);
    ctx.strokeStyle = 'white';  
	ctx.lineWidth = 3;  
	ctx.drawImage(avatar, 25, 100, 113, 113);
    ctx.strokeRect(25, 100, 113, 113);
	ctx.restore();
       
	   
        return canvas;
    }
}

export default LevelUp
