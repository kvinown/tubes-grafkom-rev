const donutColors = [
   0xAEC6CF  , 
   0xFF6347, 
   0x333333, 
   0xFFDDC1, 
   0xD2691E, 
];

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
         Math.random() * 40 - 5, //x
         Math.random() * 10 + 10, //y
         Math.random() * 5 - 10  //z
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
 // Canvas
 const canvas = document.querySelector('canvas.webgl');
 
 /**
  * Loaders
  */
 const loadingBarElement = document.querySelector('.loading-bar');
 const bodyElement = document.querySelector('body');
 const loadingManager = new THREE.LoadingManager(
   () => {
     window.setTimeout(() => {
       gsap.to(overlayMaterial.uniforms.uAlpha, {
         duration: 3,
         value: 0,
         delay: 1,
       });
       gsap.to(overlayMaterial.uniforms.uAlpha, {
        duration: 3,
        value: 0,
        delay: 1,
     });
       loadingBarElement.classList.add('ended');
       bodyElement.classList.add('loaded');
       loadingBarElement.style.transform = '';
     }, 500);
   },
   (itemUrl, itemsLoaded, itemsTotal) => {
    console.log(itemUrl, itemsLoaded, itemsTotal);
    const progressRatio = itemsLoaded / itemsTotal;
    loadingBarElement.style.transform = `scaleX(${progressRatio})`;
    console.log(progressRatio);
    },
    () => {}
 );
 const gltfLoader = new THREE.GLTFLoader(loadingManager);
 
 /**
  * Textures
  */
 const textureLoader = new THREE.TextureLoader();
 const alphaShadow = textureLoader.load('/assets/texture/simpleShadow.jpg');
 
 // Scene
 const scene = new THREE.Scene();
 
 const sphereShadow = new THREE.Mesh(
   new THREE.PlaneGeometry(1.5, 1.5),
   new THREE.MeshBasicMaterial({
     transparent: true,
     color: 0x000000,
     opacity: 0.5,
     alphaMap: alphaShadow,
   })
 );
 sphereShadow.rotation.x = -Math.PI * 0.5;
 sphereShadow.position.y = -1;
 sphereShadow.position.x = 1.5;
 scene.add(sphereShadow);
 
 /**
  * Overlay
  */
 const overlayGeometry = new THREE.PlaneGeometry(2, 2, 1, 1);
 const overlayMaterial = new THREE.ShaderMaterial({
   vertexShader: `
     void main() {
         gl_Position = vec4(position, 1.0);
     }
   `,
   fragmentShader: `
        uniform float uAlpha;
        void main() {
            gl_FragColor = vec4(0.0, 0.0, 0.0, uAlpha);
            // gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
        }
    `,
   uniforms: {
     uAlpha: {
       value: 1.0,
     },
   },
   transparent: true,
 });
 const overlay = new THREE.Mesh(overlayGeometry, overlayMaterial);
 scene.add(overlay);
 
 /**
  * GLTF Model
  */
 let donut = null;
 const loadModel = (modelPath) => {
   if (donut) {
     scene.remove(donut);
   }
   window.scrollTo(0, 0);
   gltfLoader.load(
     `./assets/donut/${modelPath}`,
     gltf => {
      console.log(gltf);
       donut = gltf.scene;
       const radius = 8.5;
       donut.position.x = 1.5;
       donut.rotation.x = Math.PI * 0.2;
       donut.rotation.z = Math.PI * 0.15;
       donut.scale.set(radius, radius, radius);
       scene.add(donut);
     },
     progress => {
       console.log(progress);
     },
     error => {
       console.error(error);
     }
   );
 };

 
const sections = document.querySelectorAll('.section');
sections.forEach((section) => {
   section.addEventListener('click', () => {
      const modelPath = section.getAttribute('data-model');
      loadModel(modelPath);

      const sectionIndex = Array.from(sections).indexOf(section);
      window.scrollTo({
         top: sizes.height * sectionIndex,
         behavior: 'smooth',
      });
   });
});
 
 // Pagination for 3D Models
 const paginationItems = document.querySelectorAll('.pagination span');
 paginationItems.forEach((item, index) => {
   item.addEventListener('click', () => {
     const modelPath = item.getAttribute('data-gltf');
     loadModel(modelPath);
     paginationItems.forEach((el) => {
       el.classList.remove('current');
     });
     item.classList.add('current');

     console.log(`Pagination item clicked: ${item.classList}`);
     donutRain.updateDonutColor(index);
   });
 });
 
 loadModel('polos.gltf');
 
 /**
  * Light
  */
 const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
 scene.add(ambientLight);
 
 const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
 directionalLight.position.set(1, 2, 0);
 directionalLight.castShadow = true;
 scene.add(directionalLight);
 
 /**
  * Sizes
  */
 const sizes = {
   width: window.innerWidth,
   height: window.innerHeight,
 };
 
 /**
  * Camera
  */
 // Base camera
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
  * Scroll
  */
 let scrollY = window.scrollY;
 let currentSection = 0;
 
 const transformDonut = [
   {
     rotationZ: 0.45,
     positionX: 1.5,
   },
   {
     rotationZ: -0.45,
     positionX: -1.5,
   },
   {
     rotationZ: 0.0314,
     positionX: 0,
   },
   {
     rotationZ: 0.0314,
     positionX: 0,
   },
 ];
 
 window.addEventListener('scroll', () => {
   scrollY = window.scrollY;
   const newSection = Math.round(scrollY / sizes.height);
 
   if (newSection !== currentSection) {
     currentSection = newSection;
 
     if (donut) {
       gsap.to(donut.rotation, {
         duration: 1.5,
         ease: 'power2.inOut',
         z: transformDonut[currentSection].rotationZ,
       });
       gsap.to(donut.position, {
         duration: 1.5,
         ease: 'power2.inOut',
         x: transformDonut[currentSection].positionX,
       });
 
       gsap.to(sphereShadow.position, {
         duration: 1.5,
         ease: 'power2.inOut',
         x: transformDonut[currentSection].positionX - 0.2,
       });
     }
   }
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
     sphereShadow.material.opacity = (1 - Math.abs(donut.position.y)) * 0.3;
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
 