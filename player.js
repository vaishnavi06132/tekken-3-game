class Player {
    constructor(x, y, name, controls, spriteFolder) {
        this.x = x;
        this.y = y;
        this.width = 230;
        this.height = 400;
        this.name = name;
        this.vx = 0;
        this.vy = 0;
        this.speed = 4;
        this.jumpForce = -13;
        this.gravity = 0.6;
        this.isGrounded = false;
        this.controls = controls;
        
        this.sprites = {
            idle: new Image(),
            jump: new Image(),
            crawl: new Image(),
            punch: new Image(),
            kick: new Image()
        };
        
        this.sprites.idle.src = `${spriteFolder}/idle.png`;
        this.sprites.jump.src = `${spriteFolder}/jump.png`;
        this.sprites.crawl.src = `${spriteFolder}/crawl.png`;
        this.sprites.punch.src = `${spriteFolder}/punch.png`;
        this.sprites.kick.src = `${spriteFolder}/kick.png`;

        this.walkFrames = [];
        for (let i = 1; i <= 10; i++) {
            let img = new Image();
            let paddedNum = String(i).padStart(4, '0');
            img.src = `${spriteFolder}/walk/frame_${paddedNum}.png`;
            this.walkFrames.push(img);
        }
        this.walkFrameIndex = 0;
        this.walkTimer = 0;
        this.walkSpeed = 6;

        this.currentImg = this.sprites.idle;
        this.actionTimer = 0; 
        this.facing = 'right'; 
    }

    handleInput(keys) {
        if (this.actionTimer > 0) {
            this.actionTimer--;
            return;
        }
        
        this.width = 230;
        this.height = 400;
        this.vx = 0;
        this.currentImg = this.sprites.idle; 
        let isWalking = false;

        if (keys[this.controls.punch]) {
            this.currentImg = this.sprites.punch;
            this.actionTimer = 15; 
            this.width = 300;
            return;
        }

        if (keys[this.controls.kick]) {
            this.currentImg = this.sprites.kick;
            this.actionTimer = 15;
            this.width = 300; 
            return;
        }

        if (keys[this.controls.left]) {
            this.vx = -this.speed;
            isWalking = true;
        }
        if (keys[this.controls.right]) {
            this.vx = this.speed;
            isWalking = true;
        }

        if (isWalking && this.isGrounded) {
            this.walkTimer++;
            if (this.walkTimer >= this.walkSpeed) {
                this.walkTimer = 0;
                this.walkFrameIndex = (this.walkFrameIndex + 1) % this.walkFrames.length;
            }
        } else {
            this.walkFrameIndex = 0;
            this.walkTimer = 0;
        }

        if (keys[this.controls.jump] && this.isGrounded) {
            this.vy = this.jumpForce;
            this.isGrounded = false;
        }

        if (!this.isGrounded) {
            this.currentImg = this.sprites.jump;
        }
    }

    update(canvasHeight) {
        this.vy += this.gravity;
        this.y += this.vy;
        this.x += this.vx;

        const floor = canvasHeight - 480;
        if (this.y >= floor) {
            this.y = floor;
            this.vy = 0;
            this.isGrounded = true;
        }
    }

    draw(ctx) {
        ctx.fillStyle = "rgba(0,0,0,0.4)";
        ctx.beginPath();
        ctx.ellipse(this.x + this.width / 2, this.y + this.height, 35, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.save();

        let drawingImg = this.currentImg;
        let isWalkingNow = (this.vx !== 0 && this.isGrounded && this.currentImg === this.sprites.idle);

        if (isWalkingNow && this.walkFrames.length > 0) {
            drawingImg = this.walkFrames[this.walkFrameIndex] || this.sprites.idle;
        }

        if (drawingImg && drawingImg.complete && drawingImg.naturalWidth > 0) {
            if (this.facing === 'left') {
                ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
                ctx.scale(-1, 1);
                ctx.drawImage(drawingImg, -this.width / 2, -this.height / 2, this.width, this.height);
            } else {
                ctx.drawImage(drawingImg, this.x, this.y, this.width, this.height);
            }
        }

        ctx.restore();

        ctx.textAlign = "center";
        ctx.fillStyle = "#ff0000";
        ctx.font = "bold 14px Arial";
        ctx.fillText(this.name, this.x + this.width / 2, this.y - 10);
    }
}