import './styles/reset.css';
import './styles/main.css';
import App from './js/app';

// Inicializar a aplicação quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    new App();
    console.log('Aplicação Three.js do Smartwatch inicializada com sucesso!');
});