import '../styles/main.css';
import { createModel } from './components/my_model';
import { createModal } from './components/modal';

export default class App {
    constructor() {
        // Elementos DOM
        this.container = document.getElementById('canvas-container');
        this.loadingElement = document.getElementById('loading');

        // Iniciar o modelo principal
        const { scene, camera, renderer, controls, animate } =
            createModel(this.container, this.loadingElement);

        // Armazenar referências
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.controls = controls;
        this.animate = animate;

        // Iniciar loop de animação
        this.animate();

        // Inicializar o modal de seguro
        this.initSeguroModal();
    }

    // Método para inicializar o modal de seguro
    initSeguroModal() {
        // Criar o modal usando a função factory
        this.seguroModal = createModal();

        // Encontrar o container do troféu e adicionar evento de clique
        const containerTrofeu = document.querySelector('.container-trofeu');
        if (containerTrofeu) {
            containerTrofeu.style.cursor = 'pointer';
            containerTrofeu.addEventListener('click', () => {
                this.seguroModal.open();
            });

        } else {
            console.warn('Container do troféu não encontrado para adicionar evento de clique');
        }
    }
}