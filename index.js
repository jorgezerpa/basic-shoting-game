const canvas = document.getElementById('canvas');
const c = canvas.getContext('2d');

canvas.width = innerWidth;
canvas.height = innerHeight;

const scoreEl = document.getElementById('scoreEl');
const startGameBtn = document.getElementById('startGameBtn');
const modal = document.querySelector('.modal');

const modalGameOver = document.querySelector('.modal.gameover');
const modalGameOverScore = document.querySelector('.modal.gameover h2');
const modalGameOverBtn = document.getElementById('restartGameBtn')

        //CLASSES
class Player {
            constructor(x, y, radius, color){
                this.x = x; 
                this.y = y;
                this.radius = radius;
                this.color = color;
            }
            
            draw(){
                c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI *2, false);
        c.fillStyle = this.color;
        c.fill()
    }
}


class Projectile{
    constructor(x,y, radius, color, velocity){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }
    
    draw(){
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI *2, false);
        c.fillStyle = this.color;
        c.fill()
    }

    update(){
        this.draw();
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    }
}



class Enemy{
    constructor(x,y, radius, color, velocity){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }
    
    draw(){
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI *2, false);
        c.fillStyle = this.color;
        c.fill()
    }

    update(){
        this.draw();
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    }
}




const friction = 0.98;
class Particle{
    constructor(x,y, radius, color, velocity){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
        this.alpha = 1;
    }
    
    draw(){
        c.save();
        c.globalAlpha = this.alpha;
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI *2, false);
        c.fillStyle = this.color;
        c.fill();
        c.restore();
    }

    update(){
        this.draw();
        this.velocity.x *= friction;
        this.velocity.y *= friction;
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
        this.alpha -=.01;
    }
}







//VARIABLES
    //player coordinates
const x = canvas.width/2;
const y = canvas.height/2;


let animationId;
let score = 0;

            //INSTANCES
const player = new Player(x, y, 10, 'white')


const projectiles = [];
const enemies = [];
const particles = [];


addEventListener('click', (e)=>{
        //atan2 return arcotangent of the cocient of the arguments
const angle = Math.atan2(e.clientY-canvas.height/2, e.clientX-canvas.width/2)
const velocity = {
    x: Math.cos(angle) * 5,
    y: Math.sin(angle) * 5,
}

projectiles.push(new Projectile(canvas.width/2, canvas.height/2, 5, 'white', velocity ))
})


startGameBtn.addEventListener('click', ()=>{
    animate();
    spawnEnemies();
    modal.style.display = 'none';
})




            //FUNCTIONS

function animate(){
    animationId = requestAnimationFrame(animate);
    c.fillStyle = 'rgba(0,0,0,0.1)';
    c.fillRect(0,0 , canvas.width, canvas.height);
    player.draw();
    
    projectiles.forEach((projectile, projectileIndex)=>{
        projectile.update();

            //remove projectile when goes out of screen
        if( projectile.x + projectile.radius < 0
            || projectile.x - projectile.radius > canvas.width 
            || projectile.y + projectile.radius < 0 
            || projectile.y - projectile.radius > canvas.height 
            ){
                setTimeout(()=>{
                    projectiles.splice(projectileIndex, 1);
                    console.log(projectiles)
                },0)
            } //close the if statment
    })


    
    enemies.forEach((enemy, enemyIndex)=>{
        enemy.update();
        
        const dist = Math.hypot(player.x-enemy.x, player.y-enemy.y);
        if(dist - enemy.radius - player.radius < 1){
            cancelAnimationFrame(animationId);
            modalGameOverScore.innerHTML = score;
            modalGameOverBtn.addEventListener('click', ()=>window.location.reload());
            modalGameOver.style.display = 'block';
        }

    

    
    particles.forEach((particle, particleIndex)=>{
        particle.update();
        if(particle.alpha <=0){
            particles.splice(particleIndex, 1)
        } else{
            particle.update();
        }
    })
        
    
    
    projectiles.forEach((projectile, projectileIndex)=>{
            const dist = Math.hypot(projectile.x-enemy.x, projectile.y-enemy.y)
                //when projectile touch enemy
            if(dist - enemy.radius - projectile.radius < 1){
            
                    //create explosion
                for(let i = 0; i<enemy.radius*2; i++){
                    particles.push(new Particle(projectile.x, projectile.y, Math.random()*2, enemy.color, {x: (Math.random()-.5)*(5*Math.random()),y: (Math.random()-.5)*(5*Math.random())}))
                }
                
                if(enemy.radius-10 > 10 ){
                        //Increase Score    
                    score+=100;
                    scoreEl.innerHTML=score;

                    gsap.to(enemy, {
                        radius: enemy.radius -10,
                    })
                    setTimeout(()=>{
                        projectiles.splice(projectileIndex, 1);
                    },0)
                } else{
                        //Increase Score    
                    score+=250;
                    scoreEl.innerHTML=score;

                    //wait for the next frame to remove from the arry (avoid "flashing")
                    setTimeout(()=>{
                        enemies.splice(enemyIndex, 1);
                        projectiles.splice(projectileIndex, 1);
                    },0)
                }     
            }     
        })
    })
}


function spawnEnemies(){
    setInterval(()=>{
        const radius = Math.random()*(30-8)+8;
        
        let x;
        let y;
        if(Math.random() < .5){
            x = Math.random()<.5 ? 0-radius : canvas.width+radius; 
            y = Math.random()*canvas.height;
        } else {
            x = Math.random()*canvas.width;
            y = Math.random()<.5 ? 0-radius : canvas.height+radius;
        }

        const color = `hsl(${Math.random()*360}, 50%, 50%)`;
        const angle = Math.atan2(canvas.height/2-y, canvas.width/2-x)
        const velocity = {
            x: Math.cos(angle),
            y: Math.sin(angle),
        }
        enemies.push(new Enemy(x, y, radius, color, velocity))        
    },1000)
}

