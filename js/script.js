const donutColors = [0xaec6cf, 0xff6347, 0x333333, 0xffddc1, 0xd2691e];

class DonutRain {
	constructor() {
		this.donuts = [];
		this.numDonuts = 30;
		this.donutColorIndex = 0;
	}

	init() {
		this.createDonuts();
		this.animateDonuts();
	}

	createDonuts() {
		for (let i = 0; i < this.numDonuts; i++) {
			const donutGeometry = new THREE.TorusGeometry(0.5, 0.2, 16, 100);
			const donutMaterial = new THREE.MeshBasicMaterial({ color: donutColors[this.donutColorIndex] });
			const donut = new THREE.Mesh(donutGeometry, donutMaterial);

			donut.position.set(
				Math.random() * 40 - 5, // x
				Math.random() * 10 + 10, // y
				Math.random() * 5 - 10 // z
			);
			donut.rotation.set(Math.random(), Math.random(), Math.random());

			this.donuts.push(donut);
			scene.add(donut);
		}
	}

	animateDonuts() {
		const animate = () => {
			for (let donut of this.donuts) {
				donut.position.y -= 0.02;
				donut.rotation.x += 0.005;
				donut.rotation.y += 0.005;

				if (donut.position.y < -5) {
					donut.position.y = Math.random() * 10 + 10;
				}
			}
			requestAnimationFrame(animate);
		};
		animate();
	}

	updateDonutColor(index) {
		this.donutColorIndex = index;
		console.log(`Donut color updated to index: ${index}, Color: ${donutColors[this.donutColorIndex].toString(16)}`);
		for (let donut of this.donuts) {
			donut.material.color.set(donutColors[this.donutColorIndex]);
		}
	}
}

/**
 * Base
 */
const canvas = document.querySelector("canvas.webgl");
const scene = new THREE.Scene();

/**
 * Donut Model
 */
let donut = null;

const loadModel = () => {
	if (donut) {
		scene.remove(donut);
	}

	const geometry = new THREE.TorusGeometry(0.6, 0.3, 128, 128);
	const material = new THREE.MeshPhongMaterial({ color: 0x93471b, shininess: 100 });

	donut = new THREE.Mesh(geometry, material);
	donut.position.set(1.5, 5, 0);
	donut.rotation.x = Math.PI * -1.2;
	donut.rotation.z = Math.PI * -0.15;
	scene.add(donut);
};

loadModel();

/**
 * Lighting
 */
const ambientLight = new THREE.AmbientLight(0x404040, 1);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 1.5, 100);
pointLight.position.set(10, 20, 20);
scene.add(pointLight);

/**
 * Sizes
 */
const sizes = {
	width: window.innerWidth,
	height: window.innerHeight,
};

const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 1000);
camera.position.z = 5;
scene.add(camera);

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
	canvas: canvas,
	antialias: true,
	alpha: true,
});
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Scroll Event with GSAP ScrollTrigger
 */
gsap.registerPlugin(ScrollTrigger);

let currentSection = 0;
const transformDonut = [
	{ rotationZ: 0.45, positionX: 1.5 },
	{ rotationZ: -0.45, positionX: -1.5 },
	{ rotationZ: 0.0314, positionX: 0 },
];

// Create scroll triggers for each section
ScrollTrigger.create({
	trigger: ".one",
	start: "top top",
	end: "bottom top",
	onEnter: () => {
		currentSection = 0;
		gsap.to(donut.rotation, { duration: 1.5, ease: "power2.inOut", z: transformDonut[0].rotationZ });
		gsap.to(donut.position, { duration: 1.5, ease: "power2.inOut", x: transformDonut[0].positionX });
	},
});

ScrollTrigger.create({
	trigger: ".two",
	start: "top top",
	end: "bottom top",
	onEnter: () => {
		currentSection = 1;
		gsap.to(donut.rotation, { duration: 1.5, ease: "power2.inOut", z: transformDonut[1].rotationZ });
		gsap.to(donut.position, { duration: 1.5, ease: "power2.inOut", x: transformDonut[1].positionX });
	},
});

ScrollTrigger.create({
	trigger: ".three",
	start: "top top",
	end: "bottom top",
	onEnter: () => {
		currentSection = 2;
		gsap.to(donut.rotation, { duration: 1.5, ease: "power2.inOut", z: transformDonut[2].rotationZ });
		gsap.to(donut.position, { duration: 1.5, ease: "power2.inOut", x: transformDonut[2].positionX });
	},
});

/**
 * Animate
 */
const clock = new THREE.Clock();
let lastElapsedTime = 0;

const tick = () => {
	const elapsedTime = clock.getElapsedTime();
	const deltaTime = elapsedTime - lastElapsedTime;
	lastElapsedTime = elapsedTime;

	if (donut) {
		donut.position.y = Math.sin(elapsedTime * 0.5) * 0.1 - 0.1;
	}

	renderer.render(scene, camera);
	window.requestAnimationFrame(tick);
};

const donutRain = new DonutRain();
donutRain.init();

tick();

/**
 * On Reload
 */
window.onbeforeunload = function () {
	window.scrollTo(0, 0);
};

/**
 * Resize Event
 */
window.addEventListener("resize", () => {
	sizes.width = window.innerWidth;
	sizes.height = window.innerHeight;

	renderer.setSize(sizes.width, sizes.height);
	camera.aspect = sizes.width / sizes.height;
	camera.updateProjectionMatrix();
});
