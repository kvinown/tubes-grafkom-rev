const donutColors = [
   0x8b4513, 0xff4b5c, 0x4f86f7, 0xfffacd, 0xd2b48c, 0x2b1700, 0x8b4513,
];

class DonutRain {
   constructor() {
      this.donuts = [];
      this.numDonuts = 30;
      this.donutColorIndex = 0;
      this.textureLoader = new THREE.TextureLoader();
      this.donutTexture = this.textureLoader.load(
         'assets/donut/textures/donut_normal.png'
      );
   }

   init() {
      this.createDonuts();
      this.animateDonuts();
   }

   createDonuts() {
      for (let i = 0; i < this.numDonuts; i++) {
         const donutGeometry = new THREE.TorusGeometry(0.5, 0.2, 16, 100);
         const donutMaterial = new THREE.MeshStandardMaterial({
            color: donutColors[this.donutColorIndex],
            normalMap: this.donutTexture,
         });
         const donut = new THREE.Mesh(donutGeometry, donutMaterial);

         donut.position.set(
            Math.random() * 40 - 5,
            Math.random() * 10 + 10,
            Math.random() * 5 - 10
         );
         donut.rotation.set(Math.random(), Math.random(), Math.random());

         this.donuts.push(donut);
         scene.add(donut);
      }
   }

   animateDonuts() {
      const animate = () => {
         for (let donut of this.donuts) {
            donut.position.y -= 0.05;
            donut.rotation.x += 0.01;
            donut.rotation.y += 0.01;

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
      console.log(
         `Donut color updated to index: ${index}, Color: ${donutColors[
            this.donutColorIndex
         ].toString(16)}`
      );
      for (let donut of this.donuts) {
         donut.material.color.set(donutColors[this.donutColorIndex]);
      }
   }
}

/**
 * Base
 */
const canvas = document.querySelector('.webgl');
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
   const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x8b4513).multiplyScalar(1.2),
      emissive: 0x000000,
      flatShading: true,
      metalness: 0,
      roughness: 0.4,
   });

   donut = new THREE.Mesh(geometry, material);
   donut.position.set(1.5, 20, 0);
   donut.rotation.x = Math.PI * -1.2;
   donut.rotation.z = Math.PI * -0.15;

   donut.hasToppings = false;
   scene.add(donut);
};

const getRandomColor = () => {
   const r = Math.floor(Math.random() * 256);
   const g = Math.floor(Math.random() * 256);
   const b = Math.floor(Math.random() * 256);
   return new THREE.Color(`rgb(${r}, ${g}, ${b})`);
};

const addToppings = (donut, isChocolate) => {
   const mesesGeometry = new THREE.CylinderGeometry(0.01, 0.01, 0.05, 8);

   const radius = 0.6;
   const tubeRadius = 0.3;

   for (let i = 0; i < 2500; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI * 2;

      const x = (radius + tubeRadius * Math.cos(phi)) * Math.cos(theta);
      const y = (radius + tubeRadius * Math.cos(phi)) * Math.sin(theta);
      const z = tubeRadius * Math.sin(phi);

      const mesesMaterial = new THREE.MeshStandardMaterial({
         color: isChocolate ? new THREE.Color('#2b1700') : getRandomColor(),
      });

      const meses = new THREE.Mesh(mesesGeometry, mesesMaterial);

      meses.position.set(x, y, z);
      meses.lookAt(
         new THREE.Vector3(
            x - radius * Math.cos(theta),
            y - radius * Math.sin(theta),
            z
         )
      );

      meses.rotation.x += Math.random() * Math.PI * 2;
      meses.rotation.y += Math.random() * Math.PI * 2;
      meses.rotation.z += Math.random() * Math.PI * 2;

      donut.add(meses);
   }
   donut.hasToppings = true;
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

const camera = new THREE.PerspectiveCamera(
   35,
   sizes.width / sizes.height,
   0.1,
   1000
);
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
const transformDonut = [
   { rotationZ: 0.45, positionX: 1.5 },
   { rotationZ: -0.45, positionX: -1.5 },
   { rotationZ: 0.0314, positionX: 0 },
];

gsap.registerPlugin(ScrollTrigger);

const updateDonutTransform = index => {
   if (!donut) return;

   gsap.to(donut.rotation, {
      z: transformDonut[index].rotationZ,
      duration: 1.5,
      ease: 'power2.inOut',
   });
   gsap.to(donut.position, {
      x: transformDonut[index].positionX,
      duration: 1.5,
      ease: 'power2.inOut',
   });
};

document.querySelectorAll('.section').forEach((section, index) => {
   ScrollTrigger.create({
      trigger: section,
      start: 'top center',
      end: 'bottom center',
      onEnter: () => updateDonutTransform(index),
      onEnterBack: () => updateDonutTransform(index),
   });
});

document.querySelectorAll(".pagination span").forEach((span, index) => {
	span.addEventListener("click", () => {
		document.querySelectorAll(".pagination span").forEach((s) => s.classList.remove("active"));
		span.classList.add("active");

		if (index === 0) {
			if (donut) {
				donut.hasToppings = false; // Set toppings flag to false
				// Remove all child objects (toppings) from the donut
				donut.children.forEach((child) => scene.remove(child));
				// Remove the donut from the scene
				scene.remove(donut);
			}
			// Reload the donut model
			loadModel();
		} else {
			// If donut model exists, update its color and toppings if needed
			if (donut) {
				donut.material.color.set(donutColors[index]); // Update color
				if (!donut.hasToppings) {
					// Determine if chocolate toppings are needed
					const isChocolate = index === 5 || index === 6;
					addToppings(donut, isChocolate); // Add toppings if not already added
				}
			}
		}

		// Reset donut position and ensure camera looks at it
		if (donut) {
			donut.position.set(0, 0, 0);
			camera.lookAt(donut.position);
		}
	});
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
window.addEventListener('resize', () => {
   sizes.width = window.innerWidth;
   sizes.height = window.innerHeight;

   renderer.setSize(sizes.width, sizes.height);
   camera.aspect = sizes.width / sizes.height;
   camera.updateProjectionMatrix();
});
