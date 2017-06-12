// Any Integer
Math.seed = 5;
function seedSelect(event) {
	Math.seed = Number(event.target.value);
	noise.seed(Math.seed % 65536);
	logState();
	proceduralGenerate();
	drawWorld();
}

// Smaller the number, smaller the cells
// Default is 1
var cellSizeIndex = 0.05;

//Canvas Boilerplate
var canvas = document.querySelector("canvas");
var context = canvas.getContext("2d");
canvas.width = 600;
canvas.height = 600;
var boardN = 600;
var refreshRate = 1;
var blockSize = 1;
var centre = [boardN/2,boardN/2];
function centreXSelect(event) {
	centre[0] = Number(event.target.value);
	logState();
	proceduralGenerate();
	drawWorld();
}
function centreYSelect(event) {
	centre[1] = Number(event.target.value);
	logState();
	proceduralGenerate();
	drawWorld();
}
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

function logState() {
	console.log('==========');
	console.log('Seed ' + Math.seed);
	console.log('Exponent ' + freqExponent);
	console.log('Wateriness ' + wateriness);
	console.log('Base Elevation ' + baseElevation);
	console.log('Land Slope ' + landSlide);
	console.log('==========');
}

var freqExponent = 1.3;
function expSelect(event) {
	freqExponent = Number(event.target.value);
	logState();
	proceduralGenerate();
	drawWorld();
}
var wateriness = 0.55;
function waterSelect(event) {
	wateriness = Number(event.target.value);
	logState();
	proceduralGenerate();
	drawWorld();
}
var baseElevation = 0.28;
function elevationSelect(event) {
	baseElevation = Number(event.target.value);
	logState();
	proceduralGenerate();
	drawWorld();
}
var landSlide = 0.0031;
function landSlideSelect(event) {
	landSlide = Number(event.target.value);
	logState();
	proceduralGenerate();
	drawWorld();
}
var scaleFactor = 1;
function slopeFactorSelect(event) {
	scaleFactor = Number(event.target.value);
	logState();
	proceduralGenerate();
	drawWorld();
}

var GridNode = function () {
	return {
		noise: 0,
		biome: 'W',
		moisture: 0,
	}
}

var world = [];
for( var i=0;i<boardN;i++) {
	world[i] = [];
	for( var j=0;j<boardN;j++) {
		world[i][j] = GridNode();
	}
}

function proceduralGenerate() {

	//var voronoi = new Voronoi();
	//var bbox = {
		//xl: 0,
		//xr: boardN,
		//yt: 0,
		//yb: boardN,
	//}
	//var sites = [];
	//for(var currentPoint of pointList) {
		//sites.push({
			//x: currentPoint[0],
			//y: currentPoint[1],
		//});
	//}
	//var diagram = voronoi.compute(sites, bbox);
	//console.log(diagram);

	//var mCount = 0;
	//function drawWorld () {
	//for(var edge of diagram.edges) {
	//var start = edge.va;
	//var finish = edge.vb;
	//context.beginPath();
	//context.moveTo(start.x, start.y);
	//context.lineTo(finish.x, finish.y);
	//context.stroke();
	//}
	//}

	function getNoiseShade(val) {
		var shade = (Math.floor(Math.abs((val*256))).toString(16));
		if(shade.length === 1) {
			shade = '0' + shade;
		}
		var color = '#' + shade + shade + shade;
		return color;
	}

	function getBiome(x,m) {
		if(x < wateriness || isNaN(x))
			return 'WATER';
		else if ( x < wateriness + 0.05 )
			return 'BEACH';
		else if ( x < 0.40 + 0.4 )
			return 'FOREST';
		else if ( x < 0.40 + 0.55 )
			return 'JUNGLE';
		else if ( x < 0.40 + 0.8 )
			return 'GRASSLAND';
		else if ( x < 0.40 + 1 )
			return 'MOUNTAIN';
		else if ( x < 0.40 + 1.1 )
			return 'CAPS';
		else
			return 'SNOW';
	}

	function getNoise() {
		var noiseVal = 0;
		var moistureVal = 0;
		var distance;
		for( var i=0;i<boardN;i++) {
			for (var j=0;j<boardN;j++) {
				var distance = Math.sqrt(Math.pow(i-centre[0],2) + Math.pow(j-centre[1],2));
				noiseVal =
					+	2  * (1+noise.perlin2(i / 100,j / 100))/2
					+		 (1+noise.perlin2(i / 50, j /  50))/2
					+ 0.5  * (1+noise.perlin2(i / 25, j /  25))/2
					+ 0.2  * (1+noise.perlin2(i / 10, j /  10))/2
					//+ 0.1  * (1+noise.perlin2(i / 5 , j /  5 ))/2
					//+ 0.02 * (1+noise.perlin2(i		, j		 ))/2;
				noiseVal/=2;
				noiseVal = noiseVal + baseElevation - Math.pow(landSlide*distance,scaleFactor);
				moistureVal =
					  0.5  * (1+noise.simplex2(i / 25, j /  25))/2
					+ 0.2  * (1+noise.simplex2(i / 10, j /  10))/2
					+ 0.1  * (1+noise.simplex2(i / 5 , j /  5 ))/2
					+ 0.02 * (1+noise.simplex2(i	 , j	  ))/2;

				world[i][j].noise = Math.pow(noiseVal, freqExponent);
				world[i][j].moisture = moistureVal;
			}
		}
		console.log('Noise Set');
		for( var i=0;i<boardN;i++) {
			for (var j=0;j<boardN;j++) {
				world[i][j].biome = getBiome(world[i][j].noise,world[i][j].moisture);
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
			if(world[x+1] && world[x+1][y+1]){
				adj.push([x+1,y+1]);
			}
			if(world[x+1] && world[x+1][y-1]){
				adj.push([x+1,y-1]);
			}
			if(world[x-1] && world[x-1][y+1]){
				adj.push([x-1,y+1]);
			}
			if(world[x-1] && world[x-1][y-1]){
				adj.push([x-1,y-1]);
			}
			return adj;
		}
		var floodFillQueue = [[0,0]];
		var currentNode;
		var adj = [];
		//while(floodFillQueue.length) {
			//console.log(floodFillQueue.length);
			//var currentNode = floodFillQueue.shift();
			//world[currentNode[0]][currentNode[1]].biome = 'O'
			//var adj = getAdjacentPoints(currentNode[0],currentNode[1]);
			//for(var point of adj) {
				//if(world[point[0]][point[1]].biome == 'W') {
					//floodFillQueue.push([point[0],point[1]]);
				//}
			//}
			//if(floodFillQueue.length%100 === 0)
				//alert(floodFillQueue.length);
		//}
	}
	getNoise();
}
function drawWorld() {
	for( var i=0;i<boardN;i++) {
		for (var j=0;j<boardN;j++) {
			context.beginPath();
			context.rect(blockSize*i,blockSize*j,blockSize,blockSize);
			switch(world[i][j].biome){
				case 'WATER': context.fillStyle = '#1CA3EC';
					break;
				case 'OCEAN': context.fillStyle = '#0000BB';
					break;
				case 'BEACH': context.fillStyle = '#3CC3FC';
					break;
				case 'FOREST': context.fillStyle = '#3E7E62';
					break;
				case 'JUNGLE': context.fillStyle = '#A5BD7E';
					break;
				case 'GRASSLAND': context.fillStyle = '#BED2AE';
					break;
				case 'CAPS': context.fillStyle = '#AAAAAA';
					break;
				case 'MOUNTAIN': context.fillStyle = '#888888';
					break;
				case 'SNOW': context.fillStyle = '#FFFFFF';
					break;
			}
			context.fill();
		}
	}
}
proceduralGenerate();
drawWorld();
