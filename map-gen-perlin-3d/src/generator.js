import SimplexNoise from "simplex-noise";
import { config } from "./config";

const simplex = new SimplexNoise();

function mapGenerator2D(centerPos, dimensions) {
	const xLength = dimensions.x;
	const yLength = dimensions.y;
	const zLength = dimensions.z;
	const heightMap = [];

	for (let i = 0; i < yLength; ++i) {
		heightMap.push([]);
		for (let j = 0; j < xLength; ++j) {
			const x = (i + centerPos.x - xLength / 2) / xLength;
			const y = (j + centerPos.y - yLength / 2) / yLength;
			heightMap[i].push(Math.floor(Math.abs(zLength * simplex.noise2D(x, y))));
		}
	}

	return heightMap;
}

function mapGen(dimensions) {
	const xLength = dimensions.x;
	const yLength = dimensions.y;
	const heightMap = [];

	for (let i = 0; i < yLength; ++i) {
		for (let j = 0; j < xLength; ++j) {
			const multiplier = 1;
			const centerPos = config.dim.x / 2;
			const x = multiplier * i / (xLength / 2);
			const y = multiplier * j / (yLength / 2);
			var noiseVal = Math.round(config.dim.z * Math.abs(10 * (
				simplex.noise2D(x, y)
				+ 0.6 * simplex.noise2D(2 * x, 2 * y)
				+ 0.3 * simplex.noise2D(4 * x, 4 * y)
				+ 0.13 * simplex.noise2D(8 * x, 8 * y)
				+ 0.08 * simplex.noise2D(16 * x, 16 * y)
				+ 0.04 * simplex.noise2D(32 * x, 32 * y)
			)) / 10);

			const baseElevation = 7;
			const distance = Math.sqrt(Math.pow(i-centerPos,2) + Math.pow(j-centerPos,2));
			const distanceDropOff = Math.pow(distance*0.3, 1.41);
			noiseVal = noiseVal - distanceDropOff + baseElevation;
			heightMap.push(noiseVal);
		}
	}

	console.log(heightMap)

	return heightMap;
}

function mapGenerator3D(centerPos, dimensions) {
	const xLength = dimensions.x;
	const yLength = dimensions.y;
	const zLength = dimensions.z
	const blockMap = [];

	for (let i = 0; i < zLength; ++i) {
		blockMap.push([]);
		for (let j = 0; j < yLength; ++j) {
			blockMap[i].push([]);
			for (let k = 0; k < xLength; ++k) {
				const x = (k + centerPos.x - xLength / 2) / xLength;
				const y = (j + centerPos.y - yLength / 2) / yLength;
				blockMap[i][j].push(simplex.noise3D(k, j, i) + (zLength - i) / zLength);
			}
		}
	}
	console.log(blockMap[0], blockMap[1]);

	return blockMap;
}

export { mapGenerator2D, mapGenerator3D, mapGen };
