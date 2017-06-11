// Any Integer
Math.seed = 5;
function seedSelect(event) {
	Math.seed = Number(event.target.value);
	noise.seed(Math.seed % 65536);
	logState();
	proceduralGenerate();
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
	console.log('Slope Factor ' + scaleFactor);
	console.log('==========');
}

var freqExponent = 1.2;
function expSelect(event) {
	freqExponent = Number(event.target.value);
	logState();
	proceduralGenerate();
}
var wateriness = 0.55;
function waterSelect(event) {
	wateriness = Number(event.target.value);
	logState();
	proceduralGenerate();
}
var baseElevation = 0.32;
function elevationSelect(event) {
	baseElevation = Number(event.target.value);
	logState();
	proceduralGenerate();
}
var landSlide = 0.002;
function landSlideSelect(event) {
	landSlide = Number(event.target.value);
	logState();
	proceduralGenerate();
}
var scaleFactor = 1;
function slopeFactorSelect(event) {
	scaleFactor = Number(event.target.value);
	logState();
	proceduralGenerate();
}

// Generation Constants
function proceduralGenerate() {
	var world = new Array(boardN);
	for( var i=0;i<boardN;i++) {
		world[i] = new Array(boardN);
		for (var j=0;j<boardN;j++) {
			world[i].push(0);
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

	var voronoi = new Voronoi();
	var bbox = {
		xl: 0,
		xr: boardN,
		yt: 0,
		yb: boardN,
	}
	var sites = [];
	for(var currentPoint of pointList) {
		sites.push({
			x: currentPoint.point[0],
			y: currentPoint.point[1]
		});
	}
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

	function getBiome(x) {
		if(x < wateriness || isNaN(x))
			return 'W';
		else if ( x < wateriness + 0.05 )
			return 'B';
		else if ( x < 0.40 + 0.4 )
			return 'F';
		else if ( x < 0.40 + 0.55 )
			return 'J';
		else if ( x < 0.40 + 0.8 )
			return 'G';
		else if ( x < 0.40 + 1 )
			return 'M';
		else if ( x < 0.40 + 1.1 )
			return 'C';
		else
			return 'S';
	}


	function getNoise() {
		var noiseVal = 0;
		var distance;
		for( var i=0;i<boardN;i++) {
			for (var j=0;j<boardN;j++) {
				var distance = Math.sqrt(Math.pow(i-boardN/2,2) + Math.pow(j-boardN/2,2));
				noiseVal = (1+noise.perlin2(i / 50, j / 50))/2
					+ 0.5 *(1+noise.perlin2(i / 25, j / 25))/2
					+ 0.2 *(1+noise.perlin2(i / 10, j / 10))/2;
					+ 0.1 *(1+noise.perlin2(i / 5, j / 5))/2;
				noiseVal = noiseVal + baseElevation - Math.pow(landSlide*distance,scaleFactor)
				world[i][j] = Math.pow(noiseVal, freqExponent);
			}
		}
		for( var i=0;i<boardN;i++) {
			for (var j=0;j<boardN;j++) {
				biomeType = getBiome(world[i][j]);
				context.beginPath();
				context.rect(blockSize*i,blockSize*j,blockSize,blockSize);
				switch(biomeType){
					case 'S': context.fillStyle = '#FFFFFF'
						break;
					case 'B': context.fillStyle = '#3CC3FC';
						break;
					case 'F': context.fillStyle = '#3E7E62';
						break;
					case 'J': context.fillStyle = '#A5BD7E';
						break;
					case 'G': context.fillStyle = '#BED2AE';
						break;
					case 'M': context.fillStyle = '#888888';
						break;
					case 'C': context.fillStyle = '#AAAAAA';
						break;
					case 'W': context.fillStyle = '#1CA3EC';
						break;
				}
				context.fill();
			}
		}
	}

	getNoise();
}
proceduralGenerate();
