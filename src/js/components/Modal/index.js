import { createModel } from '../3D_smartwatch/my_model';

export function createModal({ modelPath, title, subtitle }) {
    let modalContainer, modalOverlay, modelContainer, loadingElement;

    function init() {
        createModalElements();
        setupEventListeners();
        return { open: openModal, close: closeModal, isOpen: false };
    }

    function createModalElements() {
        modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay';
        Object.assign(modalOverlay.style, {
            position: 'fixed', top: '0', left: '0', width: '100%', height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: '1000', display: 'none',
            opacity: '0', transition: 'opacity 0.3s ease-in-out', fontFamily: 'Roboto, sans-serif'
        });

        modalContainer = document.createElement('div');
        Object.assign(modalContainer.style, {
            position: 'fixed', top: '0', right: '-100%', width: '100%', height: '100%',
            backgroundColor: 'white', overflow: 'auto', zIndex: '1001', transition: 'right 0.4s ease-in-out'
        });

        const modalContent = document.createElement('div');
        Object.assign(modalContent.style, {
            padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', textAlign: 'center', maxWidth: '500px', margin: '0 auto', height: '100%'
        });

        const closeButton = document.createElement('button');
        closeButton.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" width="24" height="24">
        <path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l192 192c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256 246.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-192 192z" fill="#000000"/>
    </svg>
`;
        Object.assign(closeButton.style, {
            position: 'absolute',
            top: '10px',
            left: '20px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        });
        closeButton.addEventListener('click', closeModal);

        modelContainer = document.createElement('div');
        Object.assign(modelContainer.style, {
            width: '100%', height: '35vh', minHeight: '250px', marginBottom: '10px',
            position: 'relative', overflow: 'hidden'
        });

        loadingElement = document.createElement('div');
        loadingElement.textContent = 'Carregando modelo...';
        Object.assign(loadingElement.style, {
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)'
        });
        modelContainer.appendChild(loadingElement);

        const titleElement = document.createElement('h2');
        titleElement.textContent = title;

        const subtitleElement = document.createElement('p');
        subtitleElement.textContent = subtitle;

        modalContent.append(closeButton, modelContainer, titleElement, subtitleElement);
        modalContainer.appendChild(modalContent);
        document.body.append(modalOverlay, modalContainer);
    }

    function setupEventListeners() {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) closeModal();
        });
    }

    function createModalModel() {
        const { animate } = createModel(modelContainer, loadingElement, modelPath);
        animate();
    }

    function openModal() {
        modalOverlay.style.display = 'block';
        modalContainer.style.display = 'block';
        setTimeout(() => {
            modalOverlay.style.opacity = '1';
            modalContainer.style.right = '0';
        }, 10);

        while (modelContainer.firstChild) {
            modelContainer.removeChild(modelContainer.firstChild);
        }
        modelContainer.appendChild(loadingElement);
        createModalModel();
        this.isOpen = true;
    }

    function closeModal() {
        modalOverlay.style.opacity = '0';
        modalContainer.style.right = '-100%';
        setTimeout(() => {
            modalOverlay.style.display = 'none';
            modalContainer.style.display = 'none';
        }, 400);
        this.isOpen = false;
    }

    return init();
} 