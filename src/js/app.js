import '../styles/main.css';
import { createModel } from './components/my_model';

export default class App {
    constructor() {
        // Elementos DOM
        this.container = document.getElementById('canvas-container');
        this.loadingElement = document.getElementById('loading');

        // Iniciar o modelo
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
    }
}