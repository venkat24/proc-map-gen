import * as THREE from "three";
import { config } from "./config";

export default function Block(position, color) {
	const size = config.blockSize;
	const geometry = new THREE.BoxGeometry(size, size, size);
	const material = new THREE.MeshLambertMaterial({
		color: color,
		//wireframe: true,
		//wireframeLinewidth: 20
	});
	this.mesh = new THREE.Mesh(geometry, material);
	this.mesh.position.x = position.x;
	this.mesh.position.y = position.y;
	this.mesh.position.z = position.z;
}
