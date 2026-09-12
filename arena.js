window.addEventListener('DOMContentLoaded', ()=>{

    const audio = document.getElementById('punch');
    const arenaBgSrc = localStorage.getItem('gameBg') || 'assets/normal.png';
    const p1Name = localStorage.getItem('player1');
    const p2Name = localStorage.getItem('player2');
    const gameHP = localStorage.getItem('gameHp');
    let player1hp = gameHP;
    let player2hp = gameHP;
    const maxHP = gameHP;
    const canvas = document.getElementById('arenaCanvas');
    const ctx = canvas.getContext('2d');
    const keys = {};
    const bgImg = new Image();
    const power = parseInt(localStorage.getItem('gamePower')) || 100;
    const attackRange = 220;
    let roundOver = false;
    let currentRound = localStorage.getItem('round');
    let p1WIN = localStorage.getItem('p1WIN');
    let p2WIN = localStorage.getItem('p2WIN');
    localStorage.setItem('round', currentRound);

    const arenaBgmSrc = localStorage.getItem('gameBgm') || 'assets/normal.png';
    const arenaAudio = document.getElementById('arenaBGM');
    alert(`Controls for ${p1Name}\nUP: W, LEFT: A, RIGHT: D, PUNCH: G, KICK: H\nControls for ${p2Name}\nUP: UP ARROW, LEFT: LEFT ARROW, RIGHT: RIGHT ARROW, PUNCH: O, KICK: P`);


    if (arenaAudio && arenaBgmSrc) {
        arenaAudio.src = arenaBgmSrc;
        arenaAudio.volume = 0.3;
        arenaAudio.loop = true;
        arenaAudio.play().catch(error => {
            console.log("Autoplay restricted by browser:", error);
        });    
    }
    
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('keydown', (event) => {
        keys[event.code] = true;
    });
    window.addEventListener('keyup', (event) => {
        keys[event.code] = false;
    });

    bgImg.src = arenaBgSrc;

    const player1 = new Player(200, 300, p1Name, {
    left: 'KeyA', right: 'KeyD', jump: 'KeyW', crawl: 'KeyS', punch: 'KeyG', kick: 'KeyH'}, 'assets/player1',"right");
    const player2 = new Player(700, 300, p2Name, {
    left: 'ArrowLeft', right: 'ArrowRight', jump: 'ArrowUp', crawl: 'ArrowDown', punch: 'KeyO', kick: 'KeyP'}, 'assets/player2',"left");

    function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (bgImg.complete && bgImg.naturalWidth > 0) {
        const zoom = 1.3;
        const imageWidth = canvas.width * zoom;
        const imageHeight = canvas.height * zoom;
        const imageX = (canvas.width - imageWidth) / 2;
        const imageY = (canvas.height - imageHeight) / 2;
        ctx.drawImage(bgImg, imageX, imageY, imageWidth, imageHeight);
        
    }

    player1.handleInput(keys);
    player2.handleInput(keys);

    player1.update(canvas.height);
    player2.update(canvas.height);

    const collisionDistance = (player1.width + player2.width) / 2 - 120;
    const currentDistance = player2.x - player1.x;
    if (currentDistance < collisionDistance) {
        const overlap = collisionDistance - currentDistance;
        player1.x -= overlap / 2;
        player2.x += overlap / 2;
    }

    player1.draw(ctx);
    player2.draw(ctx);

     
    const distance = Math.abs(player1.x - player2.x);

    const p1IsAttacking = (player1.currentImg === player1.sprites.punch || player1.currentImg === player1.sprites.kick);
    const p2IsAttacking = (player2.currentImg === player2.sprites.punch || player2.currentImg === player2.sprites.kick);

    if (p1IsAttacking && distance < attackRange && !player1.hasHit) {
        player2hp = Math.max(0, player2hp - power);
        audio.volume = 0.5;
        audio.play().catch(error => console.log("Browser restricted autoplay:", error));
        player1.hasHit = true; 
    }
    if (!p1IsAttacking) {
        player1.hasHit = false;
    }

    if (p2IsAttacking && distance < attackRange && !player2.hasHit) {
        player1hp = Math.max(0, player1hp - power);
        audio.volume = 0.5;
        audio.play().catch(error => console.log("Browser restricted autoplay:", error));
        player2.hasHit = true;
    }
    if (!p2IsAttacking) {
        player2.hasHit = false;
    }
    localStorage.setItem('p1Hp', player1hp);
    localStorage.setItem('p2Hp',player2hp);
    drawHUD(ctx, canvas, player1, player2,player1hp,player2hp,maxHP,currentRound);
    if (player1.x < 0) player1.x = 0;
            if (player1.x > canvas.width - player1.width) player1.x = canvas.width - player1.width;

            if (player2.x < 0) player2.x = 0;
            if (player2.x > canvas.width - player2.width) player2.x = canvas.width - player2.width;

    if ((player1hp == 0 || player2hp == 0)&& !roundOver){
        roundOver = true;
        let roundWinner = '';
        if (player1hp == 0){
            roundWinner = 'p2WIN';
        }else if(player2hp == 0){
            roundWinner = 'p1WIN';
        }
        let prevWin = parseInt(localStorage.getItem(roundWinner));
        prevWin += 1;
        localStorage.setItem(roundWinner, prevWin);
        let player1Win = parseInt(localStorage.getItem('p1WIN'));
        let player2Win = parseInt(localStorage.getItem('p2WIN'));
        let ultimateWIN = '';
        if (player1Win==2 || player2Win == 2 || currentRound == 3){
            if (player1Win>player2Win){
                ultimateWIN = player1.name;
            }else if(player2Win>player1Win){
                ultimateWIN = player2.name;
            }else{
                ultimateWIN = 'DRAW';
            }
            localStorage.setItem('p2WIN',0);
            localStorage.setItem('p1WIN',0);
            localStorage.setItem('round',1);
            alert(`Match Over!\nWinner : ${ultimateWIN}`);
            window.location.href = 'dashboard.html';
            return;
        }else{
            alert(`Round ${currentRound} Completed!!\nPlay round ${parseInt(currentRound)+1}`);
            currentRound++;
            localStorage.setItem('round',currentRound);
            localStorage.setItem('p1Hp',maxHP);
            localStorage.setItem('p2Hp',maxHP);
            window.location.href = 'arena.html';
            return;
        }
    
        


    }
    requestAnimationFrame(gameLoop);
    }
    gameLoop();
});



function drawHUD(ctx, canvas, p1, p2,player1hp,player2hp,maxHP,currentRound) {
    const currentMode = (localStorage.getItem('gameMode') || 'NORMAL').toUpperCase();

    ctx.textAlign = "left";
    ctx.fillStyle = "#23ce10";
    ctx.font = "bold 18px Arial";
    ctx.fillText(`Health : ${player1hp}/${maxHP}`, (canvas.width/2)-385, 45);
    ctx.fillStyle = "#23ce10";
    ctx.font = "bold 18px Arial";
    ctx.fillText(p1.name, (canvas.width/2)-185, 45);

    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.fillRect((canvas.width/2)-420, 55, 320, 22);
    const p1HealthWidth = Math.max(0, (player1hp / maxHP) * 320);
    ctx.fillStyle = "#d52e2e";
    ctx.fillRect((canvas.width/2)-420, 55, p1HealthWidth, 22);
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.strokeRect((canvas.width/2)-420, 55, 320, 22);

    ctx.textAlign = "center";
    
    ctx.fillStyle = "#ffcc00";
    ctx.font = "bold 15px Arial";
    ctx.fillText(currentMode, canvas.width / 2, 35);

    ctx.fillStyle = "#ffffff";
    ctx.font = "italic bold 32px Arial";
    ctx.fillText("V / S", canvas.width / 2, 68);

    ctx.fillStyle = "#ff4757";
    ctx.font = "bold 15px Arial";
    ctx.fillText(`ROUND ${currentRound}`, canvas.width / 2, 92);


    ctx.textAlign = "right";
    ctx.fillStyle = "#ff4757";
    ctx.font = "bold 18px Arial";
    ctx.fillText(p2.name, (canvas.width/2)+185, 45);
    ctx.fillStyle = "#ff4757";
    ctx.font = "bold 18px Arial";
    ctx.fillText(`Health : ${player1hp}/${maxHP}`, (canvas.width/2)+385, 45);

    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.fillRect((canvas.width/2)+100, 55, 320, 22);
    const p2HealthWidth = Math.max(0, (player2hp / maxHP) * 320);
    ctx.fillStyle = "#d52e2e";
    ctx.fillRect(((canvas.width/2)+420) - p2HealthWidth, 55, p2HealthWidth, 22);
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.strokeRect((canvas.width/2)+100, 55, 320, 22);
}