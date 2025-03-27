import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Importar o arquivo GLTF como um recurso
// O webpack vai transformar isso em um caminho para o arquivo
import modelPath from './scene.gltf';

export function createModal() {
    // Elementos DOM a serem criados
    let modalContainer;
    let modalOverlay;
    let modalContent;
    let modelContainer;
    let loadingElement;
    let titleElement;
    let descriptionElement;
    let detailsLink;
    let closeButton;
    let modelInstance;

    // Inicialização
    function init() {
        // Criar elementos do modal
        createModalElements();

        // Configurar eventos
        setupEventListeners();

        // Retornar API pública do modal
        return {
            open: openModal,
            close: closeModal,
            isOpen: false
        };
    }

    // Criar elementos DOM do modal
    function createModalElements() {
        // Overlay do modal (fundo escurecido)
        modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay';
        modalOverlay.style.position = 'fixed';
        modalOverlay.style.top = '0';
        modalOverlay.style.left = '0';
        modalOverlay.style.width = '100%';
        modalOverlay.style.height = '100%';
        modalOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        modalOverlay.style.zIndex = '1000';
        modalOverlay.style.display = 'none';
        modalOverlay.style.fontFamily = 'Roboto, sans-serif';
        // Adicionar propriedades de transição para o overlay
        modalOverlay.style.opacity = '0';
        modalOverlay.style.transition = 'opacity 0.3s ease-in-out';

        // Container principal do modal (tela cheia)
        modalContainer = document.createElement('div');
        modalContainer.className = 'modal-container';
        modalContainer.style.position = 'fixed';
        modalContainer.style.top = '0';
        // Posicionar inicialmente fora da tela (à direita)
        modalContainer.style.right = '-100%';
        modalContainer.style.left = 'auto';
        modalContainer.style.width = '100%';
        modalContainer.style.height = '100%';
        modalContainer.style.backgroundColor = 'white';
        modalContainer.style.overflow = 'auto';
        modalContainer.style.zIndex = '1001';
        // Adicionar propriedades de transição para o container
        modalContainer.style.transition = 'right 0.4s ease-in-out';

        // Conteúdo do modal
        modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
        modalContent.style.padding = '20px';
        modalContent.style.display = 'flex';
        modalContent.style.flexDirection = 'column';
        modalContent.style.alignItems = 'center';
        modalContent.style.justifyContent = 'center';
        modalContent.style.textAlign = 'center';
        modalContent.style.maxWidth = '500px';
        modalContent.style.margin = '0 auto';
        modalContent.style.height = '100%';

        // Botão de voltar (seta para a esquerda) no topo
        closeButton = document.createElement('button');
        closeButton.className = 'modal-close';
        closeButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" width="24" height="24"><path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l192 192c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256 246.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-192 192z" fill="#000000"/></svg>`;
        closeButton.style.position = 'absolute';
        closeButton.style.top = '10px';
        closeButton.style.left = '20px';
        closeButton.style.background = 'none';
        closeButton.style.border = 'none';
        closeButton.style.fontSize = '24px';
        closeButton.style.cursor = 'pointer';
        closeButton.style.padding = '10px';
        closeButton.style.zIndex = '5';
        closeButton.setAttribute('aria-label', 'Fechar');

        // Container para o modelo 3D - CONTÊINER ESPECÍFICO PARA O MODAL
        modelContainer = document.createElement('div');
        modelContainer.id = 'canvas-container-modal'; // ID específico para o modal
        modelContainer.className = 'model-container-modal';
        modelContainer.style.width = '100%';
        modelContainer.style.height = '35vh'; // Ajustado para ser responsivo
        modelContainer.style.minHeight = '250px';
        modelContainer.style.marginBottom = '10px';
        modelContainer.style.position = 'relative';
        modelContainer.style.overflow = 'hidden';
        modelContainer.style.border = 'none'; // Para visualizar a área

        // Elemento para indicar o carregamento do modelo
        loadingElement = document.createElement('div');
        loadingElement.className = 'loading-indicator';
        loadingElement.textContent = 'Carregando modelo...';
        loadingElement.style.position = 'absolute';
        loadingElement.style.top = '50%';
        loadingElement.style.left = '50%';
        loadingElement.style.transform = 'translate(-50%, -50%)';
        modelContainer.appendChild(loadingElement);

        // Título "Seguro Eletrônicos"
        titleElement = document.createElement('h2');
        titleElement.className = 'modal-title';
        titleElement.textContent = 'Seguro Eletrônicos';
        titleElement.style.margin = '0px 0 5px';
        titleElement.style.fontSize = '22px';
        titleElement.style.fontWeight = '500';

        // Descrição "Smart Watch com seguro desde 12/04/2025"
        descriptionElement = document.createElement('p');
        descriptionElement.className = 'modal-description';
        descriptionElement.textContent = 'Smart Watch com seguro desde 12/04/2025';
        descriptionElement.style.margin = '0 0 0px';
        descriptionElement.style.color = '#666';
        descriptionElement.style.fontSize = '14px';
        descriptionElement.style.fontWeight = '400';

        // Link "Ir para detalhes"
        detailsLink = document.createElement('a');
        detailsLink.className = 'details-link';
        detailsLink.href = '#';
        detailsLink.innerHTML = 'Ir para detalhes &rsaquo;';
        detailsLink.style.color = '#660099';
        detailsLink.style.textDecoration = 'none';
        detailsLink.style.fontSize = '14px';
        detailsLink.style.fontWeight = '500';
        detailsLink.style.display = 'block';
        detailsLink.style.marginTop = '10px';

        // Adicionar todos os elementos ao modal
        modalContent.appendChild(closeButton);
        modalContent.appendChild(modelContainer);
        modalContent.appendChild(titleElement);
        modalContent.appendChild(descriptionElement);
        modalContent.appendChild(detailsLink);
        modalContainer.appendChild(modalContent);

        // Adicionar o modal ao body
        document.body.appendChild(modalOverlay);
        document.body.appendChild(modalContainer);
    }

    // Configurar os event listeners
    function setupEventListeners() {
        // Fechar o modal ao clicar no botão de fechar
        closeButton.addEventListener('click', closeModal);

        // Fechar o modal ao clicar no overlay (fora do modal)
        modalOverlay.addEventListener('click', function (e) {
            if (e.target === modalOverlay) {
                closeModal();
            }
        });

        // Comportamento do link de detalhes
        detailsLink.addEventListener('click', function (e) {
            e.preventDefault();
            console.log('Navegando para detalhes do seguro');
            // Aqui você pode implementar a navegação real para a página de detalhes
        });
    }

    // Função para criar o modelo 3D dentro do modal
    function createModalModel() {
        // Variáveis principais
        let scene, camera, renderer, controls, model, modelGroup;
        let frontLight;

        // Obtendo as dimensões do contêiner
        const containerWidth = modelContainer.clientWidth;
        const containerHeight = modelContainer.clientHeight;

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
        modelContainer.appendChild(renderer.domElement);

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
        controls.autoRotate = false;
        controls.enableZoom = false;
        controls.minPolarAngle = Math.PI / 2; // 90 graus
        controls.maxPolarAngle = Math.PI / 2; // 90 graus

        // Carregador GLTF
        const loader = new GLTFLoader();

        // Carregando o modelo do smartwatch
        loader.load(
            // Usar o caminho gerado pelo webpack
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
                    loadingElement.textContent = 'Erro ao carregar o modelo. Verifique o console para detalhes.';
                }
            }
        );

        // Função de animação
        function animate() {
            requestAnimationFrame(animate);

            // Atualiza os controles para interação do usuário
            controls.update();

            // Atualiza a posição da luz frontal para que fique sempre alinhada com a câmera
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

        // Iniciar a animação
        animate();

        // Adicionar handler de redimensionamento
        function onWindowResize() {
            const newWidth = modelContainer.clientWidth;
            const newHeight = modelContainer.clientHeight;

            camera.aspect = newWidth / newHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(newWidth, newHeight);
        }

        window.addEventListener('resize', onWindowResize);

        // Retornar referências importantes
        return {
            scene,
            camera,
            renderer,
            controls,
            animate
        };
    }

    // Abrir o modal com animação
    function openModal() {
        // Primeiro exibimos os elementos
        modalOverlay.style.display = 'block';
        modalContainer.style.display = 'block';

        // Em seguida, iniciamos a animação no próximo ciclo de renderização
        setTimeout(() => {
            modalOverlay.style.opacity = '1';
            modalContainer.style.right = '0';
        }, 10);

        // Para garantir que o modelo 3D seja inicializado corretamente,
        // vamos sempre recriar o container e inicializá-lo novamente

        // Limpar o container do modelo se já existir
        while (modelContainer.firstChild) {
            modelContainer.removeChild(modelContainer.firstChild);
        }

        // Recriar o elemento de carregamento
        loadingElement = document.createElement('div');
        loadingElement.className = 'loading-indicator-modal';
        loadingElement.textContent = 'Carregando modelo...';
        loadingElement.style.position = 'absolute';
        loadingElement.style.top = '50%';
        loadingElement.style.left = '50%';
        loadingElement.style.transform = 'translate(-50%, -50%)';
        modelContainer.appendChild(loadingElement);

        // Usar nossa própria implementação para criar o modelo
        try {
            modelInstance = createModalModel();
        } catch (error) {
            console.error('Erro ao inicializar modelo no modal:', error);
            loadingElement.textContent = 'Erro ao carregar o modelo. Detalhes no console.';
        }

        // Atualizar a flag de estado
        this.isOpen = true;
    }

    // Fechar o modal com animação
    function closeModal() {
        // Iniciamos a animação de saída
        modalOverlay.style.opacity = '0';
        modalContainer.style.right = '-100%';

        // Após a animação terminar, removemos os elementos do DOM
        setTimeout(() => {
            modalOverlay.style.display = 'none';
            modalContainer.style.display = 'none';
        }, 400); // Este tempo deve ser igual ou maior que a duração da transição

        // Atualizar a flag de estado
        this.isOpen = false;
    }

    // Inicializar e retornar os objetos
    return init();
}