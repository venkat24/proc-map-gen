import * as THREE from "three";
import { config } from "./config";
import FirstPersonControls from "./controls";
import Block from "./block";
import { mapGenerator2D, mapGenerator3D, mapGen } from "./generator";
import grassAsset from "./assets/grass.jpg";
import px from "./assets/skybox/px.jpg";
import py from "./assets/skybox/py.jpg";
import pz from "./assets/skybox/pz.jpg";
import nx from "./assets/skybox/nx.jpg";
import ny from "./assets/skybox/ny.jpg";
import nz from "./assets/skybox/nz.jpg";

var rotateCounterClockwise = function(matrix) {
	// reverse the individual rows
	var newMat = matrix.map(function(row) {
		return row.reverse();
	});
	// swap the symmetric elements
	for (var i = 0; i < newMat.length; i++) {
		for (var j = 0; j < i; j++) {
			var temp = newMat[i][j];
			newMat[i][j] = newMat[j][i];
			newMat[j][i] = temp;
		}
	}
	return newMat;
};

function getColor(k) {
	const baseVal = config.dim.z;
	if ( k < baseVal*(config.waterThresh - 0.05))
		return '#1CA3EC';
	else if ( k < baseVal*config.waterThresh )
		return '#3CC3FC';
	else if ( k < baseVal*0.27 )
		return '#3E7E62';
	else if ( k < baseVal*0.40 )
		return '#3E7E62';
	else if ( k < baseVal*0.56 )
		return '#A5BD7E';
	else if ( k < baseVal*0.67 )
		return '#BED2AE';
	else if ( k < baseVal*0.79 )
		return '#AAAAAA';
	else if ( k < baseVal*0.96 )
		return '#888888';
	else
		return '#EEEEEE';
}

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

let scene, camera, renderer;
const blocks = [];
let curPos;
let curBlockPos;
let controls;
const blockGroupSize = new THREE.Vector2(config.dim.x * config.blockSize, config.dim.y * config.blockSize);
const relativeMapEdges = {
	left: - (config.dim.x * config.blockSize / 2),
	right: config.dim.x * config.blockSize / 2,
	bottom: - (config.dim.y * config.blockSize / 2),
	top: config.dim.y * config.blockSize / 2
};

function createBlocks2D(centerPos) {
	const heightMap = mapGenerator2D(centerPos, config.dim);
	const blocks = [];
	const blockSize = config.blockSize;
	for (let i = 0; i < heightMap.length; ++i) {
		for (let j = 0; j < heightMap[0].length; ++j) {
			for (let k = 0; k < heightMap[i][j] + 1; ++k) {
				const x = (i * blockSize) + centerPos.x - (config.dim.x * blockSize / 2);
				const y = (j * blockSize) + centerPos.y - (config.dim.y * blockSize / 2);
				blocks.push(
					new Block({ x: x, z: y, y: k * blockSize }, getColor(k))
				);
			}
		}
	}
	return blocks;
}

function createBlocks3D(centerPos) {
	const blocks = [];
	const blockMap = mapGenerator3D(centerPos, config.dim);
	const blockSize = config.blockSize;

	for (let i = 0; i < blockMap.length; ++i) {
		for (let j = 0; j < blockMap[0].length; ++j) {
			for (let k = 0; k < blockMap[0][0].length; ++k) {
				if (blockMap[i][j][k] > 0.5) {
					const x = (k * blockSize) + centerPos.x - (config.dim.x * blockSize / 2);
					const y = (j * blockSize) + centerPos.y - (config.dim.y * blockSize / 2);
					const z = (i * blockSize) - (config.dim.z * blockSize / 2);
					blocks.push(new Block({ x: x, z: y, y: z}))
				}
			}
		}
	}

	console.log(blocks);

	return blocks;
}

function createBlocksAndAddToScene(centerPos) {
	const blocks = createBlocks2D(centerPos);
	blocks.forEach(block => scene.add(block.mesh));
	return blocks;
}

function removeBlocks(blocks) {
	blocks.forEach(function(block) {
		scene.remove(block.mesh);
		block.mesh.geometry.dispose();
		block.mesh.material.dispose();
		block.mesh = null;
	});
}

function initBlocks() {
	console.log("Entered init blocks");
	for (let i = 0; i <= 2; ++i) {
		blocks.push([]);
		for (let j = 0; j <= 2; ++j) {
			blocks[i].push(createBlocksAndAddToScene(new THREE.Vector2(
				curPos.x - (blockGroupSize.x) + j * blockGroupSize.x,
				curPos.z - (blockGroupSize.y) + (2 - i) * blockGroupSize.y,
			)));
		}
	}
}

function updateBlocks() {
	const prevBlockPos = curBlockPos.clone();

	curBlockPos = new THREE.Vector2(
		Math.floor((curPos.x + blockGroupSize.x / 2) / blockGroupSize.x) * blockGroupSize.x,
		Math.floor((curPos.z + blockGroupSize.y / 2) / blockGroupSize.y) * blockGroupSize.y
	);

	if (curBlockPos.x < prevBlockPos.x) /*moved left*/ {
		console.log("moved left");
		// Remove right-most blocks
		removeBlocks(blocks[0][2]);
		removeBlocks(blocks[1][2]);
		removeBlocks(blocks[2][2]);
		// Shift blocks from left to right
		blocks[0][2] = blocks[0][1];
		blocks[1][2] = blocks[1][1];
		blocks[2][2] = blocks[2][1];
		blocks[0][1] = blocks[0][0];
		blocks[1][1] = blocks[1][0];
		blocks[2][1] = blocks[2][0];
		// Add new blocks to left
		blocks[0][0] = createBlocksAndAddToScene(new THREE.Vector2(curBlockPos.x - blockGroupSize.x, curBlockPos.y + blockGroupSize.y));
		blocks[1][0] = createBlocksAndAddToScene(new THREE.Vector2(curBlockPos.x - blockGroupSize.x, curBlockPos.y));
		blocks[2][0] = createBlocksAndAddToScene(new THREE.Vector2(curBlockPos.x - blockGroupSize.x, curBlockPos.y - blockGroupSize.y));		
	}
	else if (curBlockPos.x > prevBlockPos.x) /*moved right*/ {
		console.log("moved right");
		// Remove left-most blocks
		removeBlocks(blocks[0][0]);
		removeBlocks(blocks[1][0]);
		removeBlocks(blocks[2][0]);
		// Shift blocks from right to left
		blocks[0][0] = blocks[0][1];
		blocks[1][0] = blocks[1][1];
		blocks[2][0] = blocks[2][1];
		blocks[0][1] = blocks[0][2];
		blocks[1][1] = blocks[1][2];
		blocks[2][1] = blocks[2][2];
		// Add new blocks to right
		blocks[0][2] = createBlocksAndAddToScene(new THREE.Vector2(curBlockPos.x + blockGroupSize.x, curBlockPos.y + blockGroupSize.y));
		blocks[1][2] = createBlocksAndAddToScene(new THREE.Vector2(curBlockPos.x + blockGroupSize.x, curBlockPos.y));
		blocks[2][2] = createBlocksAndAddToScene(new THREE.Vector2(curBlockPos.x + blockGroupSize.x, curBlockPos.y - blockGroupSize.y));
	}

	if (curBlockPos.y < prevBlockPos.y) /*moved down*/ {
		console.log("moved down");
		// Remove top-most blocks
		removeBlocks(blocks[0][0]);
		removeBlocks(blocks[0][1]);
		removeBlocks(blocks[0][2]);
		// Shift blocks from bottom to top
		blocks[0][0] = blocks[1][0];
		blocks[0][1] = blocks[1][1];
		blocks[0][2] = blocks[1][2];
		blocks[1][0] = blocks[2][0];
		blocks[1][1] = blocks[2][1];
		blocks[1][2] = blocks[2][2];
		// Add new blocks to bottom
		blocks[2][0] = createBlocksAndAddToScene(new THREE.Vector2(curBlockPos.x - blockGroupSize.x, curBlockPos.y - blockGroupSize.y));
		blocks[2][1] = createBlocksAndAddToScene(new THREE.Vector2(curBlockPos.x, curBlockPos.y - blockGroupSize.y));
		blocks[2][2] = createBlocksAndAddToScene(new THREE.Vector2(curBlockPos.x + blockGroupSize.x, curBlockPos.y - blockGroupSize.y));
	}
	else if (curBlockPos.y > prevBlockPos.y) /*moved up*/ {
		console.log("moved up");
		// Remove bottom-most blocks
		removeBlocks(blocks[2][0]);
		removeBlocks(blocks[2][1]);
		removeBlocks(blocks[2][2]);
		// Shift blocks from top to bottom
		blocks[2][0] = blocks[1][0];
		blocks[2][1] = blocks[1][1];
		blocks[2][2] = blocks[1][2];
		blocks[1][0] = blocks[0][0];
		blocks[1][1] = blocks[0][1];
		blocks[1][2] = blocks[0][2];
		// Add new blocks to top
		blocks[0][0] = createBlocksAndAddToScene(new THREE.Vector2(curBlockPos.x - blockGroupSize.x, curBlockPos.y + blockGroupSize.y));
		blocks[0][1] = createBlocksAndAddToScene(new THREE.Vector2(curBlockPos.x, curBlockPos.y + blockGroupSize.y));
		blocks[0][2] = createBlocksAndAddToScene(new THREE.Vector2(curBlockPos.x + blockGroupSize.x, curBlockPos.y + blockGroupSize.y));
	}



	// const blockSize = config.blockSize;
	// const curBlockGroupEdges = {
	// 	left: Math.floor(curPos.x / blockGroupSize.x) * blockGroupSize,
	// 	right: Math.floor(curPos.x / blockGroupSize.x) * blockGroupSize + blockGroupSize,
	// 	bottom: Math.floor(curPos.y / blockGroupSize.y) * blockGroupSize,
	// 	top: Math.floor(curPos.y / blockGroupSize.y) * blockGroupSize + blockGroupSize,
	// }
}

function initPlane() {
	var geometry = new THREE.PlaneGeometry(
		config.blockSize * config.dim.x,
		config.blockSize * config.dim.y,
		config.dim.x,
		config.dim.y
	);
	geometry.translate(0, 0, 0);
	geometry.rotateX(1.5 * Math.PI);

	var heightMap = mapGen(new THREE.Vector2(
		config.dim.x + 1,
		config.dim.y + 1
	));
	for (let i = 0; i < heightMap.length; ++i) {
		if (heightMap[i] < config.dim.z * config.waterThresh) {
			geometry.vertices[i].y = config.dim.z * config.waterThresh
		}
		else {
			geometry.vertices[i].y = heightMap[i];
		}
	}

	var heightMap2D = [];
	var tempHeightMap = [];
	var p = 0;
	while(p < (config.dim.x + 1) * (config.dim.y + 1)) {
		tempHeightMap.push(heightMap[p]);
		if (tempHeightMap.length >= (config.dim.x + 1)) {
			heightMap2D.push(tempHeightMap)
			tempHeightMap = [];
		}
		p++;
	}


	console.log(heightMap2D)
	heightMap2D = heightMap2D[0].map((col, i) => heightMap2D.map(row => row[i]));
	heightMap2D = rotateCounterClockwise(heightMap2D);
	//rotateClockwise(heightMap2D);
	console.log(heightMap2D)

	var newHeightMap = [];
	for (var i = 0; i < heightMap2D.length; ++i) {
		for (var j = 0; j < heightMap2D[i].length; ++j) {
			newHeightMap.push(heightMap2D[i][j]);
		}
	}

	heightMap = newHeightMap;
	//console.log(newHeightMap)

	var colorMap = new Uint8Array(3 * heightMap.length);
	for (var i = 0; i < heightMap.length; ++i) {
		var stride = i * 3;
		colorMap[ stride ] = hexToRgb(getColor(heightMap[i])).r;
		colorMap[ stride + 1 ] = hexToRgb(getColor(heightMap[i])).g;
		colorMap[ stride + 2 ] = hexToRgb(getColor(heightMap[i])).b;
	}

	var texture = new THREE.DataTexture(
		colorMap, config.dim.x+1, config.dim.y+1, THREE.RGBFormat);
	texture.needsUpdate = true;
	
	var material = new THREE.MeshLambertMaterial({
	    //wireframe: true,
	    map: texture
	});

	var mesh = new THREE.Mesh(geometry, material);
	mesh.receiveShadow = true;
	scene.add(mesh);
}

function init() {

	curPos = new THREE.Vector3(0, 0, 0);
	curBlockPos = new THREE.Vector2(0, 0);

	scene = new THREE.Scene();
	scene.background = new THREE.Color( 0x87ceeb );
	scene.fog = new THREE.Fog( 0x050505, 2000, 4000 );

	var light = new THREE.PointLight( 0xffe3ba, 0.5 );
	light.position.set( config.dim.x/2, 0, 400 );
	light.castShadow = true;
	//scene.add( light );

	var aLight = new THREE.AmbientLight( 0xffe3ba, 0.5 );
	scene.add( aLight );

	camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
	camera.position.z = curPos.z;
	camera.lookAt(new THREE.Vector3(0, 10, 0));
	camera.add( light );
	scene.add( camera );

	scene.background = new THREE.CubeTextureLoader()
		.load( [ px, nx, py, ny, pz, nz ] );
	
	//initBlocks();
	initPlane();

	renderer = new THREE.WebGLRenderer();
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);
	renderer.render(scene, camera);

	controls = new FirstPersonControls(camera, renderer.domElement);
}

function animate() {

	requestAnimationFrame(animate);

	curPos = camera.position;
	updateBlocks();
	renderer.render(scene, camera);
	controls.update(0.5);
}

init();
animate();
