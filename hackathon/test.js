// Any Integer
Math.seed = 19237;

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
var boardN = 150;
var refreshRate = 1;
var blockSize = 5;
document.body.appendChild(canvas);
Math.seededRandom = function(min, max) {
	max = max || 1;
	min = min || 0;
	// Random ass values which seem to work well
	Math.seed = (Math.seed * 9301 + 49297) % 233280;
	var rnd = Math.seed / 233280;
	return min + rnd * (max - min);
}

//Terrain Type Reference
//Forest -> F
//Water -> W
//Desert -> D
//Grassland -> G
//MainTree -> M

var terrainTypes = ['F','W','D','G'];

var forestIndices = []

//The World
var world = new Array(boardN);
for( var i=0;i<boardN;i++) {
		world[i] = new Array(boardN);
}
var set=true;
for(var i=0;i<boardN;i++) {
	for (var j = 0; j < boardN; j++) {
		indexSeed=Math.seededRandom(0,9999999999999999);
		index=indexSeed%(boardN);
		if (index == 1) {
			world[i][j]='M';
			forestIndices.push([i,j]);
			set=false;
		} else {
			world[i][j]='W';
		}
	}
}

function drawWorld () {
	for(var i = 0; i<boardN ; i++) {
		for (var j = 0; j < boardN; j++) {
			context.beginPath();
			context.rect(blockSize*i,blockSize*j,blockSize,blockSize);
			switch(world[i][j]) {
				case 'F':
					context.fillStyle = 'green'; break;
				case 'M':
					context.fillStyle = 'green'; break;
				case 'W':
					context.fillStyle = 'blue'; break;
				case 'D':
					context.fillStyle = 'tan'; break;
				case 'G':
					context.fillStyle = 'lightgreen'; break;
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

function generateLandMasses(curri,currj,val) {
	var next;
	squares=getAdjacentSquares(curri,currj);
	var waterPushes=[]
	if(val<=0) {
		return;
	}
	for(var k=0;k<4;k++){
		if (squares[k] == 'W') {
			var addRelativePos = [0,0];
			switch(k){
				case 0:addRelativePos=[curri,currj-1]; break;
				case 1:addRelativePos=[curri,currj+1]; break;
				case 2:addRelativePos=[curri+1,currj]; break;
				case 3:addRelativePos=[curri-1,currj]; break;
			}
			waterPushes.push(addRelativePos);
			currentSeed = Math.seededRandom(0,9999999999999999);
			indexToSwap=currentSeed%4;
			indexToSwap2=indexToSwap+1;
			if (indexToSwap2>3){
				indexToSwap2=0;
			}
			var temp=waterPushes[indexToSwap];
			waterPushes[indexToSwap]=waterPushes[indexToSwap2];
			waterPushes[indexToSwap2]=temp;
			Math.seed=currentSeed;
		}
	}
	for(var l=0;l<waterPushes.length;l++) {
		try {
			next=l;
			world[waterPushes[next][0]][waterPushes[next][1]]='F';
			generateLandMasses(waterPushes[next][0],waterPushes[next][1],val-1)
		}
		catch(e) {
			continue;
		}
	}
	return;
}

var value=Math.floor(boardN/2);
//var value=40;
for(var i=0;i<boardN;i++){
	for(var j=0;j<boardN;j++){
		if(world[i][j]=='M'){
			generateLandMasses(i,j,value);
		}
	}
}
function spawnSand() {
	var squaresSand;
	for(var i=0;i<boardN;i++){
		for(var j=0;j<boardN-1;j++){
			if(world[i][j]=='F' || world[i][j]=='M') {
				var count=0;
				squaresSand=getAdjacentSquares(i,j);
				for (var u=0;u<4;u++){
					if (squaresSand[u]=='W') {
						count++;
					}
				}
				if (count > 0) {
					world[i][j]='D';
				}
			}
		}
	}
}
function spawnBushes() {
	var squaresSand;
	for(var i=0;i<boardN;i++) {
		for(var j=0;j<boardN-1;j++) {
			bushSeed=Math.seededRandom(0,9999999999999999);
			if(world[i][j] == 'F') {
				if((bushSeed%20)==4) {
					world[i][j]='G';
				}
			}
		}
	}
}
spawnSand();
spawnBushes();
drawWorld();
delete world;
