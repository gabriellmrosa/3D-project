import '../styles/main.css';
import { createModel } from './components/3D_smartwatch/my_model';
import { createModal } from './components/Modal';
import smartwatchModelPath from './components/3D_smartwatch/scene.gltf';

export default class App {
    constructor() {
        // Inicializar o modelo 3D da tela inicial
        this.container = document.getElementById('canvas-container');
        this.loadingElement = document.getElementById('loading');

        const { animate } = createModel(this.container, this.loadingElement, smartwatchModelPath);
        animate();

        // Inicializar o modal com modelo e textos personalizados
        this.seguroModal = createModal({
            modelPath: smartwatchModelPath,
            title: 'Seguro Eletrônicos',
            subtitle: 'Smartwatch com seguro desde 12/04/2025'
        });

        // Evento para abrir o modal ao clicar no container do troféu
        const container = document.querySelector('.container-trofeu');
        if (container) {
            container.style.cursor = 'pointer';
            container.addEventListener('click', () => this.seguroModal.open());
        } else {
            console.warn('Container do troféu não encontrado!');
        }

    }
}