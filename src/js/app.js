import '../styles/main.css';
import { createModel } from './components/3D_smartwatch/my_model';
import { createModel as createPopcornModel } from './components/3D_popcorn/my_model';
import { createModal } from './components/Modal';
import smartwatchModelPath from './components/3D_smartwatch/scene.gltf';
import popcornModelPath from './components/3D_popcorn/scene.gltf';

export default class App {
    constructor() {
        // Modelo Smartwatch (tela principal)
        this.container = document.getElementById('canvas-container');
        this.loadingElement = document.getElementById('loading');
        const { animate } = createModel(this.container, this.loadingElement, smartwatchModelPath);
        animate();

        // Modal Smartwatch
        this.seguroModal = createModal({
            modelPath: smartwatchModelPath,
            title: 'Seguro Eletrônicos',
            subtitle: 'Smartwatch com seguro desde 12/04/2025'
        });

        const smartwatchContainer = document.querySelector('.container-trofeu');
        if (smartwatchContainer) {
            smartwatchContainer.style.cursor = 'pointer';
            smartwatchContainer.addEventListener('click', () => this.seguroModal.open());
        }

        // Modelo Pipoca (tela principal)
        this.popcornContainer = document.getElementById('canvas-popcorn');
        this.popcornLoading = document.createElement('div');
        this.popcornLoading.textContent = 'Carregando modelo...';
        this.popcornContainer.appendChild(this.popcornLoading);

        const { animate: animatePopcorn } = createPopcornModel(this.popcornContainer, this.popcornLoading, popcornModelPath);
        animatePopcorn();

        // Modal Pipoca
        this.popcornModal = createModal({
            modelPath: popcornModelPath,
            title: 'Seus Tickets',
            subtitle: 'Você já resgatou 5 tickets no Cinemark'
        });

        const popcornClickable = document.getElementById('container-popcorn');
        if (popcornClickable) {
            popcornClickable.style.cursor = 'pointer';
            popcornClickable.addEventListener('click', () => this.popcornModal.open());
        }
    }
}
