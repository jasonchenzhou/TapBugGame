document.getElementById("gamePage").style.display='none';
var startTime;
var pausedTime = 0;     // calculate pause time
var timer=60;			// initial game timer
var p_start;           // pause start time
    
var score = 0;
var high_score=0;
var paused = false;     // whether paused
var gg = false;

var foods = [];             // x,y,id
var bugs = [];             // x,y,color,degree,opacity
var init = false;          // init the food
var level = 1;
var speed = 1;
var gameLen = 60;

var btn_re;
var btn_end;

var canvas = document.getElementById('canvas');
var ctx = document.getElementById('canvas').getContext('2d');

if(high_score==0) document.getElementById("highScore").innerHTML="High Score : "+high_score;

function getHighScore(){
    if(typeof(Storage) != "undefined"){
        var res = localStorage.getItem("high_score");
        if(res != undefined)  return res;
        else{
            setHighScore(0);
            return 0; 
        } 
    }
}

function setHighScore(score){
    if(typeof(Storage) != "undefined"){
        localStorage.setItem("high_score", score);
    }
}

function setLevel(){
    var low_speed = document.getElementById('level1');
    var high_speed = document.getElementById('level2');
    if(low_speed.checked)  level=1; 
    else if(high_speed.checked) level=2;
    else console.log("speed error!");
}

function startGame(){
    document.getElementById("startPage").style.display='none';
    document.getElementById("gamePage").style.display='block';
    setLevel();
    entry();
}

function pauseGame(){
    var curTime = Date.now();
    if(paused == false){
        p_start = Date.now();
        paused = true;
        document.getElementById("Pause").value="Resume";
        document.getElementById("Pause").innerHTML = "Resume";
    }
    else{
        pausedTime += (curTime-p_start)/1000;
        paused = false;
        document.getElementById("Pause").value="Pause";
        document.getElementById("Pause").innerHTML = "Pause";
        entry();
    }
}

function addBugs(){
    var x = 380*Math.random();
    var y = 0;
    var color = 3*Math.random();
    if(color > 2) color=2;
    else if(color > 1) color=1;
    else color = 0;

    var target_food = findNearFood(x, y);
    var degree = calDegree(x, y, target_food);

    bugs.push([x,y,color,degree,1]);
}

function addFood(){
    for(var i=0; i<5; i++){
        var x = 20+360*Math.random();
        var y = 100+400*Math.random();
        foods.push([x,y,i+1]);
    }
}

function bugShape(x,y,color,opacity){
	var img;

    switch (color) { 
		case 0: 
			img = imgSlimeBlack;
			break;
		case 1: 
			img = imgSlimeRed;
			break;
		case 2: 
			img = imgSlimeOrange;
			break;
    }
    ctx.globalAlpha=opacity;
    ctx.drawImage(img,x,y,20,20);
}

function foodShape(x,y,id){
	var img;

    switch (id) { 
		case 1: 
			img = imgFoodApple;
			break;
		case 2: 
			img = imgFoodBanana;
			break;
		case 3: 
			img = imgFoodGrape;
			break;
        case 4: 
			img = imgFoodOrange;
			break;
		case 5: 
			img = imgFoodPear;
			break;
		default:
			img.src = imgFoodApple;
    }
	ctx.globalAlpha = 1;
    ctx.drawImage(img,x,y,20,20);  
}

function drawFoods(){
    ctx.save();
    for(var i=0; i<foods.length; i++){
        var cur_food_x = foods[i][0];
        var cur_food_y = foods[i][1];
        var cur_food_id = foods[i][2];
        foodShape(cur_food_x, cur_food_y, cur_food_id);  
    }
    ctx.restore();
}

function drawBugs(){
    for(var i=bugs.length-1; i>=0; i--){
        ctx.save();
        var cur_bug_x = bugs[i][0];
        var cur_bug_y = bugs[i][1];
        var cur_bug_color = bugs[i][2];
        var cur_bug_degree = bugs[i][3]; 
        var cur_bug_opacity = bugs[i][4]       

        if(level == 1){
            switch (cur_bug_color) { 
		case 0: 
			speed=1.5;
			break;
		case 1: 
			speed=0.75;
			break;
		case 2: 
			speed=0.6;
			break;
            }
        }
        else{
            switch (cur_bug_color) { 
		case 0: 
			speed=2;
			break;
		case 1: 
			speed=1;
			break;
		case 2: 
			speed=0.8;
			break;
            }
        }
        
        if(cur_bug_opacity != 1)  bugs[i][4] -= 1/200;
        else{
            bugs[i][0] += Math.cos(cur_bug_degree/180*Math.PI)* speed;            //x position
            bugs[i][1] += Math.sin(cur_bug_degree/180*Math.PI)* speed;            //y position
        }
        
        bugShape(cur_bug_x, cur_bug_y, cur_bug_color, cur_bug_opacity);  
        eat(cur_bug_x, cur_bug_y);

        if(cur_bug_opacity < 5/200)  bugs.splice(i,1);
        ctx.restore();
    }
}

function draw(){
    if(paused == false && gg == false){
        ctx.clearRect(0,0,400,600);
        drawBugs();
        drawFoods();     


        var curTime = Date.now();
        timer = (gameLen-(curTime - startTime)/1000+pausedTime).toPrecision(2);
        if(timer < 0.1){
            timer=0;  
            reStart();
        }
        document.getElementById("Timer").innerHTML = timer;  
    }
    
    
}

function eat(x,y){
    for(var i=foods.length-1; i>=0; i--){
        var food_x = foods[i][0];
        var food_y = foods[i][1];
        if( Math.sqrt(Math.pow(food_x-x, 2) + Math.pow(food_y-y, 2)) < 20 ){  
            foods.splice(i,1);
            if(foods.length == 0)  reStart();
            reCalculate();
        }
    }
}

function reStart(){
    timer=60;
    gg=true;
    bugs = [];
    ctx.fillStyle = "#FF9A9A";
    ctx.font = "48px serif message-box";
    ctx.fillText("Your score is "+score,30,270);
    document.getElementById("controls").style.visibility = "visible";
    var previous_highscore = getHighScore(score);
    if(score > previous_highscore){
        setHighScore(score);
        document.getElementById("highScore").innerHTML="High Score : "+score;
    }
    score=0;
}

function btnRestart(){
    timer= gameLen;
    init=false;
    gg=false;
    entry();
    document.getElementById("controls").style.visibility = "hidden";
}

function btnEnd(){
    init=false;
    gg=false;
    document.getElementById("startPage").style.display='block';
    document.getElementById("gamePage").style.display='none';
    document.getElementById("controls").style.visibility = "hidden";
}

function reCalculate(){
    for(var i=0; i<bugs.length; i++){
        var bug_x = bugs[i][0];
        var bug_y = bugs[i][1];
        var food_num = findNearFood(bug_x, bug_y);
        bugs[i][3] = calDegree(bug_x, bug_y, food_num);
    }
}

function killBug(e){

    var click_x = e.layerX;
    var click_y = e.layerY;
    for(var i=bugs.length-1; i>=0; i--){
        var x = bugs[i][0];
        var y = bugs[i][1];
        if( Math.sqrt(Math.pow(click_x-x, 2) + Math.pow(click_y-y, 2)) < 30 && bugs[i][4]==1){  
	    switch (bugs[i][2]) { //calculate score based on bug colour
		    case 0: // black color
			score += 5;
			break;
		    case 1: // red color
			score += 3;
			break;
		    case 2: // orange color
				score += 1;
				break;
			default:
				console.log(bugs[i][2]);
                
	    }
            bugs[i][4] -= 1/200;
            document.getElementById("score").innerHTML = "Score: " + score;
        }
    }
}


function findNearFood(bug_x, bug_y){
    var res = 0;                               //number of nearest food
    var dis = Number.MAX_VALUE;
    for(var i=0; i<foods.length; i++){
        var food_x = foods[i][0];
        var food_y = foods[i][1];
        var cur_dis = Math.sqrt(Math.pow(food_x-bug_x, 2) + Math.pow(food_y-bug_y, 2));
        if(cur_dis < dis){
            dis = cur_dis;
            res = i;
        }
    }
    return res;
}

function calDegree(bug_x, bug_y, food_num){
    var food_x = foods[food_num][0];
    var food_y = foods[food_num][1];
    var degree;
    if(bug_x < food_x){
         degree = Math.atan( (food_y-bug_y)/(food_x-bug_x) )/Math.PI*180;
    }
    else if(bug_x > food_x){
        degree = 180 - Math.atan( (food_y-bug_y)/(bug_x-food_x) )/Math.PI*180;
    }
    else if(bug_y > food_y)  degree = 270;
    else  degree = 90;
    return degree;
}

var entry = function(){

    if(init == false){
        foods=[];
        bugs=[];
        addFood();
        init = true;
        startTime = Date.now();		
    }
	
    if (score) //if score has been defined, call the local storage.
	scoreCounter();
    
};

var moreBugTime = 1000*Math.floor(Math.random() * 3 + 1) ; //random number from 1-3 then times 1000 MS


/* Setup all the images on window load
*
*/

function loadImage() {
        var previous_highscore = getHighScore(score);
        document.getElementById("highScore").innerHTML="High Score : "+previous_highscore;

	backImg = new Image(); //background for start page and 
	backImg.src = 'images/gamePage.jpg';
	imgFoodApple = new Image();
	imgFoodApple.src = 'images/food1.png';
	imgFoodBanana = new Image();
	imgFoodBanana.src = 'images/food2.png';
	imgFoodGrape = new Image();
	imgFoodGrape.src = 'images/food3.png';
	imgFoodOrange = new Image();
	imgFoodOrange.src = 'images/food4.png';
	imgFoodPear = new Image();
	imgFoodPear.src = 'images/food5.png';

    imgSlimeBlack = new Image();         //black, red, orange slimes
	imgSlimeBlack.src = 'images/slimeBlack.png';
	imgSlimeRed = new Image();    
	imgSlimeRed.src = 'images/slimeRed.png'
	imgSlimeOrange = new Image();              
	imgSlimeOrange.src = 'images/slimeOrange.png';
}


/* setInterval for drawing
*  Unobtrusive event handlers
*
*/

setInterval(addBugs, moreBugTime);
setInterval(draw, 10);

window.addEventListener("click", killBug);

document.getElementById("restart").onclick=btnRestart;
document.getElementById("newGame").onclick=btnEnd;
document.getElementById("Pause").onclick=pauseGame;
document.getElementById("start").onclick=startGame;
window.onload=loadImage;

