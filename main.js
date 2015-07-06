/////////////[UTILITY FUNCTIONS]/////////////////

function get(id) {
	return document.getElementById(id);
}

function checkCollisionRect(r1, r2) {
  return !(r2.left > r1.right || 
           r2.right < r1.left || 
           r2.top > r1.bottom ||
           r2.bottom < r1.top);
}

function isInt(n){
        return Number(n)===n && n%1===0;
}

function choose(arr) {
	return arr[Math.floor(Math.random() * arr.length)];
}

function calculatePossiblePlatformPositions() {
	var arr = [];
	var maxJumpHeight = Math.pow(-jumpSpeed, 2) / 2*gravity;
	var x=0; var y = -0.15 * Math.pow(x, 2) + maxJumpHeight;
	while (y > -50) {
		x++;
		y = -0.15 * Math.pow(x, 2) + maxJumpHeight;
		arr.push({x:x, y:-y});
	}
	return arr;
}

/////////////////[MAIN LOGIC]//////////////////

K_SPACE = 32;
K_R = 82;
started = 0;
xspeed = 4;
gravity = 0.4;
jumpSpeed = 10;
terminalVelocity = 10;

function init() {
	canvas=get("mainCanvas");
	ctx=canvas.getContext("2d");
	
	ctx.fillStyle="#000000"
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.textAlign = "center";
	ctx.fillStyle = "#FFFFFF";
	ctx.font = "30px Arial";
	ctx.fillText("click to play", canvas.width/2, canvas.height/2-30); 
	ctx.fillText("press space to jump", canvas.width/2, canvas.height/2+30); 
	
	canvas.addEventListener("click", startGame);
	canvas.addEventListener("mousedown", function(event){ event.preventDefault(); });
	document.addEventListener("keydown", function(event){
		if (started) {
			if (event.keyCode == K_SPACE) {
				player.jump();			
			}
			else if (event.keyCode == K_R) {
				reset();
			}
		}
	})
}

function startGame() {
	canvas.removeEventListener("click", startGame);
	started=1;
	tickInterval = setInterval(tick, 10);
	player=new Player();
	canvas.addEventListener("mousedown", function(){player.jump();});
	new Platform(0, 352, canvas.width+32, "#6666DD");
	score=0;
	xspeed=4;
}

function reset() {
	platforms = [];
	delete player;
	clearInterval(tickInterval);
	
	canvas.removeEventListener("click", reset);
	started=1;
	tickInterval = setInterval(tick, 10);
	player=new Player();
	new Platform(0, 352, canvas.width+32, "#6666DD");
	score=0;
	xspeed=4;
}

function tick() {
	player.tick();
	for (var i=0; i<platforms.length; i++) {
		platforms[i].tick();
	}
	
	draw(ctx);
	score++;
}

function draw(ctx) {
	ctx.fillStyle="#000000";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	for (var i=0; i<platforms.length; i++) {
		platforms[i].draw(ctx);
	}
	player.draw(ctx);
	
	ctx.textAlign = "left";
	ctx.fillStyle = "#FFFFFF";
	ctx.font = "30px Arial";
	ctx.fillText("Score: "+score, 10, 40); 
}

function addNewPlatform () {
	var lastPlatform = platforms[platforms.length-1];
	
	var possiblePositions = calculatePossiblePlatformPositions()
	
	do {
		position=choose(possiblePositions);
	} while (!(position.y + lastPlatform.y>60 && position.y + lastPlatform.y<canvas.height-60)) //keep choosing until it satisfies this conditions
	var gap = position.x * xspeed + 80;
	
	var x = lastPlatform.x + lastPlatform.width + gap;	
	var y = position.y + lastPlatform.y;
	var width = 120;
	var color = "#0000FF"
	
	var platform = new Platform(x, y, width, color)
}

function die() {
	clearInterval(tickInterval);

	ctx.fillStyle="#000000";
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	
	ctx.textAlign = "center";
	ctx.fillStyle = "#FFFFFF";
	ctx.font = "30px Arial";
	ctx.fillText("You have Died! Score: "+score, canvas.width/2, canvas.height/2-30); 
	ctx.fillText("Press 'R' or click to restart", canvas.width/2, canvas.height/2+30); 
	canvas.addEventListener("click", reset);
}



////////////////////[RECT CLASS]///////////////////

function Rect(left, top, right, bottom) {
	this.top=top;
	this.bottom=bottom;
	this.left=left;
	this.right=right;
}

Rect.prototype.update = function(left, top, right, bottom) {
	this.top=top;
	this.bottom=bottom;
	this.left=left;
	this.right=right;
}

///////////////////[PLAYER CLASS]//////////////////

function Player() {
	this.x=80;
	this.y=240;
	this.width=16;
	this.height=32;
	this.yspeed=0;
	this.onGround=false;
	this.color="#33FF33"
	this.rect=new Rect(this.x, this.y, this.x+this.width, this.y+this.height);
	this.tempRect=new Rect(this.x, this.y+2, this.x+this.width, this.y+this.height+2);
}

Player.prototype.jump = function(){
	if (this.onGround) {
		this.yspeed=-jumpSpeed;
		this.onGround=false;
	}
}

Player.prototype.tick = function() {
	if (!this.onGround) {
		this.yspeed+=gravity;
		if (this.yspeed>terminalVelocity) {
			this.yspeed=terminalVelocity;
		}
		this.y+=this.yspeed;
	}
	
	
	this.rect.update(this.x, this.y, this.x+this.width, this.y+this.height);
	this.tempRect.update(this.x, this.y+2, this.x+this.width, this.y+this.height+2);
	
	if (!this.onGround) {
		for (var i=0; i<platforms.length; i++) {
				if (checkCollisionRect(this.rect, platforms[i].rect)) {
					if (this.rect.right-xspeed > platforms[i].x) {
						this.y = Math.floor(this.y);
						while (checkCollisionRect(this.rect, platforms[i].rect)) {
							this.y--;
							this.rect.update(this.x, this.y, this.x+this.width, this.y+this.height);
							this.tempRect.update(this.x, this.y+2, this.x+this.width, this.y+this.height+2);
						}
					} else {
						this.x-=xspeed;
						this.x--;
						xspeed=0;
					}
					this.onGround=true;
				}
		}
	} else { //if we are on the ground, we must check that we are still on the ground
		var touching=0
		for (var i=0; i<platforms.length; i++) { //if we are touching NO platforms, we can't be on the ground
			if (checkCollisionRect(this.tempRect, platforms[i].rect)) {
				touching=1;
			}
		}
		if (!touching) {
			this.onGround=0;
		}
	}
	
	if (this.y>canvas.height) {	
		clearInterval(tickInterval);
		setTimeout(die, 100);
	}
}

Player.prototype.draw = function(ctx) {
	ctx.fillStyle=this.color;
	ctx.fillRect(this.x, this.y, this.width, this.height);
}

////////////////[PLATFORM CLASS]//////////////

platforms = [];

function Platform(x,y,w,color) {
	this.x=x;
	this.y=y;
	this.width=w;
	this.height=canvas.height;
	this.color=color;
	this.rect=new Rect(this.x, this.y, this.x+this.width, this.y+this.height);
	this.addedNext = false;
	
	platforms.push(this)
}

Platform.prototype.tick=function() {
	this.x-=xspeed;
	this.rect.update(this.x, this.y, this.x+this.width, this.y+this.height);
	if (this.x + this.width < 0) {
		platforms.splice(platforms.indexOf(this),1)
	}
	if (!this.addedNext && this.x < canvas.width) {
		this.addedNext=true;
		addNewPlatform();
	}
}

Platform.prototype.draw=function(ctx) {
	ctx.fillStyle=this.color;
	ctx.fillRect(this.x, this.y, this.width, this.height);
}














