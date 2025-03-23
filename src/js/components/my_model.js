import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Importar diretamente o arquivo GLTF (será gerenciado pelo webpack)
import modelPath from './scene.gltf';

export function createModel(container, loadingElement) {
  // Variáveis principais
  let scene, camera, renderer, controls, model, modelGroup;
  let autoRotate = false; // Iniciando com rotação automática desabilitada
  let rotationSpeed = 0.01; // Velocidade de rotação
  let frontLight; // Luz frontal global para acessá-la no animate()

  // Inicialização
  function init() {
    // Obtendo as dimensões do contêiner
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    // Configurando a cena
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);

    // Configurando a câmera com o aspect ratio do contêiner
    camera = new THREE.PerspectiveCamera(45, containerWidth / containerHeight, 0.1, 1000);
    camera.position.set(0, 0, 20);

    // Configurando o renderizador com o tamanho do contêiner
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerWidth, containerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.outputEncoding = THREE.sRGBEncoding;
    container.appendChild(renderer.domElement);

    // Luz ambiente reduzida (apenas para evitar áreas totalmente pretas)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    // Única luz frontal - sempre iluminará a parte do objeto virada para o usuário
    frontLight = new THREE.DirectionalLight(0xffffff, 0.8);
    frontLight.position.set(0, 0, 1); // Posição inicial da luz
    scene.add(frontLight);

    // Adicionando controles de órbita com restrições
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.7;

    // Desabilitando autoRotate do OrbitControls (usaremos nossa própria rotação)
    controls.autoRotate = false;

    // Desabilitando zoom
    controls.enableZoom = false;

    // Restringindo movimento apenas ao eixo Y (rotação horizontal)
    controls.minPolarAngle = Math.PI / 2; // 90 graus
    controls.maxPolarAngle = Math.PI / 2; // 90 graus

    // Carregando o modelo GLTF
    loadModel();

    // Detector de eventos
    setupEventListeners();

    // Retornando objetos essenciais
    return {
      scene,
      camera,
      renderer,
      controls,
      animate
    };
  }

  function loadModel() {
    // Carregador GLTF
    const loader = new GLTFLoader();

    // Carregando o modelo do smartwatch
    loader.load(
      modelPath,
      function (gltf) {
        model = gltf.scene;

        // Ajustando escala para o smartwatch
        model.scale.set(0.5, 0.5, 0.5);

        // Centralizar o modelo automaticamente
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        model.position.x = -center.x;
        model.position.y = -center.y;
        model.position.z = -center.z;

        // Mudando apenas a cor dos materiais existentes para cinza claro
        model.traverse(function (node) {
          if (node.isMesh && node.material) {
            // Se o material for um array
            if (Array.isArray(node.material)) {
              for (let i = 0; i < node.material.length; i++) {
                node.material[i].color.set(0xfafafa); // Cinza claro
              }
            }
            // Se for um único material
            else {
              node.material.color.set(0xfafafa); // Cinza claro
            }
          }
        });

        // Criar um grupo para conter o modelo
        modelGroup = new THREE.Group();
        modelGroup.add(model);

        // Inclinar o grupo em 22.5 graus (igual à V2)
        modelGroup.rotation.x = 0.5; // 22.5 graus em radianos

        // Configurar uma rotação Y inicial específica (se desejar)
        modelGroup.rotation.y = 0.9; // 45 graus em radianos

        // Rotação Z inicial (giro no sentido horário/anti-horário)
        modelGroup.rotation.z = -0.5; // 30 graus em radianos

        // Ajustar a câmera para enquadrar o objeto
        const size = box.getSize(new THREE.Vector3());
        const maxSize = Math.max(size.x, size.y, size.z);
        const fitHeightDistance = maxSize / (2 * Math.tan(Math.PI * camera.fov / 360));
        const fitWidthDistance = fitHeightDistance / camera.aspect;
        const distance = 1.5 * Math.max(fitHeightDistance, fitWidthDistance);

        // Aplicar a distância ideal da câmera
        camera.position.z = distance;
        controls.target.set(0, 0, 0);
        controls.update();

        scene.add(modelGroup);

        // Esconde o indicador de carregamento
        if (loadingElement) {
          loadingElement.style.display = 'none';
        }
      },
      // Progresso de carregamento
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
      // Tratamento de erro
      function (error) {
        console.error('Erro ao carregar o modelo:', error);
        if (loadingElement) {
          loadingElement.textContent = 'Erro ao carregar o modelo. Verifique se os arquivos scene.gltf e scene.bin estão na mesma pasta.';
        }
      }
    );
  }

  function setupEventListeners() {
    // Tratamento de redimensionamento da janela
    window.addEventListener('resize', onWindowResize);

    // Salvamos a rotação original do objeto
    let originalRotationY = 0;

    // Tratamento de eventos de interação
    renderer.domElement.addEventListener('pointerdown', () => {
      // Armazenamos a rotação atual antes de começar a interação
      if (modelGroup) {
        originalRotationY = modelGroup.rotation.y;
      }
      autoRotate = false; // Desativa rotação automática durante interação
    });

    renderer.domElement.addEventListener('pointerup', () => {
      // Não ativa mais a rotação automática após soltar o mouse
      // A rotação automática permanece desativada até o próximo clique
    });

    // Sobrescreve o método de rotação do OrbitControls
    // para garantir que apenas o objeto gire, não a cena
    const originalRotate = controls.rotateLeft;
    controls.rotateLeft = function (angle) {
      if (modelGroup) {
        // Em vez de rotacionar a câmera, rotacionamos o objeto
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

    // Atualiza os controles para interação do usuário
    controls.update();

    // Implementamos nossa própria rotação automática que afeta apenas o objeto
    if (autoRotate && modelGroup) {
      modelGroup.rotation.y += rotationSpeed;
    }

    // Atualiza a posição da luz frontal para que fique sempre alinhada com a câmera
    // Isso garante que a face do objeto visível para o usuário esteja sempre iluminada
    if (frontLight) {
      // Obtém a direção da câmera
      const cameraDirection = new THREE.Vector3(0, 0, -1);
      cameraDirection.applyQuaternion(camera.quaternion);

      // Posiciona a luz na direção oposta (para iluminar o que a câmera vê)
      frontLight.position.copy(cameraDirection.multiplyScalar(-1));
    }

    // Renderiza a cena
    renderer.render(scene, camera);
  }

  // Inicializar e retornar os objetos
  return init();
}