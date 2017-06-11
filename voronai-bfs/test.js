// Any Integer
Math.seed = 5;

// Smaller the number, smaller the cells
// Default is 1
var cellSizeIndex = 0.21;
// var cellSizeIndex = 1;

// Init HTML
var seedInput = document.createElement('input');
seedInput.setAttribute('type','text');
seedInput.setAttribute('id','seed_val');
seedInput.setAttribute('value',Math.seed);
document.body = document.createElement("body");
document.body.appendChild(seedInput);

//Canvas Boilerplate
var canvas = document.createElement("canvas");
var context = canvas.getContext("2d");
canvas.width = 6000;
canvas.height = 6000;
var boardN = 400;
var refreshRate = 1;
var blockSize = 2;
document.body.appendChild(canvas);

Math.seededRandom = function(min, max) {
	max = max || 1;
	min = min || 0;
	// Random ass values which seem to work well
	Math.seed = (Math.seed * 9301 + 49297) % 233280;
	var rnd = Math.seed / 233280;
	return min + rnd * (max - min);
}

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;
  var randomSeed = 0;
  while (0 !== currentIndex) {
  	randomSeed = Math.seededRandom(0,999999999);
    randomIndex = Math.floor(randomSeed % currentIndex);
    Math.seed = randomSeed;
    currentIndex -= 1;
 
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

var world = new Array(boardN);
for( var i=0;i<boardN;i++) {
    world[i] = new Array(boardN);
}

for(var i=0;i<boardN;i++){
    for(var j=0;j<boardN;j++){
        world[i][j] = {
            color: "#000000",
            type: "W"
        }
    }
}

function getRandomColor() {
	var letters = '56789ABCDEF';
	var color = '#';
	for (var i = 0; i < 6; i++ ) {
		color += letters[Math.floor(Math.seededRandom() * letters.length)];
	}
	return color;
}

var pointList = [];

for(var i=0;i<boardN;i++) {
	for (var j = 0; j < boardN; j++) {
		indexSeed=Math.seededRandom(0,9999999999999999);
		index=indexSeed%(boardN*cellSizeIndex);
		if (index == 1) {
			pointList.push({
				point: [i,j],
				color: getRandomColor(),
			});
		}
	}
}

function getAdjacentPoints (x,y) {
    var adj = [];
    // Cardinals
    if(world[x] && world[x][y+1]){
        adj.push([x,y+1]);
    }
    if(world[x] && world[x][y-1]){
        adj.push([x,y-1]);
    }
    if(world[x-1] && world[x-1][y]){
        adj.push([x-1,y]);
    }
    if(world[x+1] && world[x+1][y]){
        adj.push([x+1,y]);
    }
    // Diagonals
    // if(world[x+1] && world[x+1][y+1]){
    //     adj.push([x+1,y+1]);
    // }
    // if(world[x+1] && world[x+1][y-1]){
    //     adj.push([x+1,y-1]);
    // }
    // if(world[x-1] && world[x-1][y+1]){
    //     adj.push([x-1,y+1]);
    // }
    // if(world[x-1] && world[x-1][y-1]){
    //     adj.push([x-1,y-1]);
    // }
    return adj;
    // return shuffle(adj);
}

function setWorld() {
    var current = {};
    var adj = {};
    var queue = pointList.slice();
    for(var currentPoint of pointList) {
        world[currentPoint.point[0]][currentPoint.point[1]].color = currentPoint.color;
        world[currentPoint.point[0]][currentPoint.point[1]].type = 'M';
    }
    while(queue.length) {
        current = queue.shift();
        adj = getAdjacentPoints(current.point[0],current.point[1]);
        for(var currentPoint of adj) {
            if (world[currentPoint[0]][currentPoint[1]].type == 'M') continue;
            world[currentPoint[0]][currentPoint[1]].color = current.color;
            world[currentPoint[0]][currentPoint[1]].type = 'M';
            queue.push({
                color: current.color,
                point: currentPoint,
            });
        }
    }
    for(var currentPoint of pointList) {
        world[currentPoint.point[0]][currentPoint.point[1]].color = 'black';
    }
}

function drawWorld () {
	for(var i = 0; i<boardN ; i++) {
		for (var j = 0; j < boardN; j++) {
			context.beginPath();
			context.rect(blockSize*i,blockSize*j,blockSize,blockSize);
            context.fillStyle = world[i][j].color;
			context.fill();
		}
	}
}
setWorld();
drawWorld();
console.log('Done');
