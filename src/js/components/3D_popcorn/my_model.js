import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export function createModel(container, loadingElement, modelPath) {
    let scene, camera, renderer, controls, modelGroup;
    let frontLight;

    function init() {
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;

        scene = new THREE.Scene();
        scene.background = new THREE.Color(0xffffff);

        camera = new THREE.PerspectiveCamera(45, containerWidth / containerHeight, 0.1, 1000);
        camera.position.set(0, 0, 20);

        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(containerWidth, containerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.outputEncoding = THREE.sRGBEncoding;
        container.appendChild(renderer.domElement);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
        scene.add(ambientLight);

        frontLight = new THREE.DirectionalLight(0xffffff, 0.8);
        frontLight.position.set(0, 0, 1);
        scene.add(frontLight);

        controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.rotateSpeed = 0.7;
        controls.autoRotate = false;
        controls.enableZoom = false;
        controls.minPolarAngle = Math.PI / 2;
        controls.maxPolarAngle = Math.PI / 2;

        loadModel();
        setupEventListeners();

        return { scene, camera, renderer, controls, animate };
    }

    function loadModel() {
        const loader = new GLTFLoader();

        loader.load(
            modelPath,
            function (gltf) {
                const model = gltf.scene;
                model.scale.set(0.5, 0.5, 0.5);

                const box = new THREE.Box3().setFromObject(model);
                const center = box.getCenter(new THREE.Vector3());
                model.position.sub(center);

                model.traverse(function (node) {
                    if (node.isMesh && node.material) {
                        if (Array.isArray(node.material)) {
                            for (let i = 0; i < node.material.length; i++) {
                                node.material[i].color.set(0xfafafa);
                            }
                        } else {
                            node.material.color.set(0xfafafa);
                        }
                    }
                });

                modelGroup = new THREE.Group();
                modelGroup.add(model);
                modelGroup.rotation.set(0.5, 0.9, -0.5);
                scene.add(modelGroup);

                const size = box.getSize(new THREE.Vector3());
                const maxSize = Math.max(size.x, size.y, size.z);
                const fitHeightDistance = maxSize / (2 * Math.tan(Math.PI * camera.fov / 360));
                const fitWidthDistance = fitHeightDistance / camera.aspect;
                const distance = 1.5 * Math.max(fitHeightDistance, fitWidthDistance);
                camera.position.z = distance;
                controls.target.set(0, 0, 0);
                controls.update();

                if (loadingElement) loadingElement.style.display = 'none';
            },
            function (xhr) {
                if (loadingElement) {
                    if (xhr.lengthComputable) {
                        const percentComplete = Math.round((xhr.loaded / xhr.total) * 100);
                        loadingElement.textContent = `Carregando modelo... ${percentComplete}%`;
                    } else {
                        loadingElement.textContent = 'Carregando modelo...';
                    }
                }
            },
            function (error) {
                console.error('Erro ao carregar o modelo:', error);
                if (loadingElement) {
                    loadingElement.textContent = 'Erro ao carregar o modelo. Verifique se os arquivos .gltf e .bin estão corretos.';
                }
            }
        );
    }

    function setupEventListeners() {
        window.addEventListener('resize', onWindowResize);

        let originalRotationY = 0;

        renderer.domElement.addEventListener('pointerdown', () => {
            if (modelGroup) {
                originalRotationY = modelGroup.rotation.y;
            }
        });

        renderer.domElement.addEventListener('pointerup', () => {
            // manter rotação final
        });

        const originalRotate = controls.rotateLeft;
        controls.rotateLeft = function (angle) {
            if (modelGroup) {
                modelGroup.rotation.y -= angle;
            }
        };
    }

    function onWindowResize() {
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        camera.aspect = containerWidth / containerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(containerWidth, containerHeight);
    }

    function animate() {
        requestAnimationFrame(animate);
        controls.update();

        if (frontLight) {
            const cameraDirection = new THREE.Vector3(0, 0, -1);
            cameraDirection.applyQuaternion(camera.quaternion);
            frontLight.position.copy(cameraDirection.multiplyScalar(-1));
        }

        renderer.render(scene, camera);
    }

    return init();
}