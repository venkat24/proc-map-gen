// Any Integer
Math.seed = 5;

// Smaller the number, smaller the cells
// Default is 1
var cellSizeIndex = 0.21;

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

var pointList = []; // [x,y]
var vert = []; // [x,y] -> Delaunay Triangulation

//The World
var world = new Array(boardN);
for( var i=0;i<boardN;i++) {
		world[i] = new Array(boardN);
}

function getRandomColor() {
	var letters = '56789ABCDEF';
	var color = '#';
	for (var i = 0; i < 6; i++ ) {
		color += letters[Math.floor(Math.seededRandom() * letters.length)];
	}
	return color;
}

var set=true;
for(var i=0;i<boardN;i++) {
	for (var j = 0; j < boardN; j++) {
		indexSeed=Math.seededRandom(0,9999999999999999);
		index=indexSeed%(boardN*cellSizeIndex);
		if (index == 1) {
			pointList.push({
				point: [i,j],
				color: getRandomColor(),
			});
			world[i][j]='M';
			set=false;
		} else {
			world[i][j]='W';
		}
	}
}

var mCount = 0;
function drawWorld () {
	for(var i = 0; i<boardN ; i++) {
		for (var j = 0; j < boardN; j++) {
			context.beginPath();
			context.rect(blockSize*i,blockSize*j,blockSize,blockSize);
			switch(world[i][j]) {
				case 'M':
					context.fillStyle = 'black';
					// context.fillStyle = pointList[mCount].color;
					mCount++;
					break;
				case 'W':
					context.fillStyle = findNearestPointColor(i,j);
					//context.fillStyle = "black";
					break;
			}
			context.fill();
		}
	}
}
function getAdjacentSquares (x,y) {
	var n = !!world[x][y-1]?world[x][y-1]:'O';
	var s = !!world[x][y+1]?world[x][y+1]:'O';
	var e = !!world[x-1]?world[x-1][y]:'O';
	var w = !!world[x+1]?world[x+1][y]:'O';
	return [n,e,s,w];
}

function findNearestPointColor(x,y) {
	var pointDistance = Infinity;
	var color = "";
	for(var i=0;i<pointList.length;i++){
		distance = Math.pow(x-pointList[i].point[0],2) + Math.pow(y-pointList[i].point[1],2);
		if(distance < pointDistance) {
			pointDistance = distance;
			color = pointList[i].color;
		}
	}
	return color;
}

drawWorld();
console.log('Done');
delete world;
