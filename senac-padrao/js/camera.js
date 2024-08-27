// Função para mostrar o confirm dialog personalizado
function showConfirmAllowCamera() {
    document.querySelector('#confirmAllowCamera').style.display = 'flex';
}

// Função para esconder o confirm dialog personalizado
function hideConfirmAllowCamera() {
    document.querySelector('#confirmAllowCamera').style.display = 'none';
}

// Ações dos botões
document.querySelector('#confirmCameraNovaAba').addEventListener('click', function () {
    hideConfirmAllowCamera();
    window.open('./xr/face-tracking/oculos/index.html', '_blank');
});

document.querySelector('#confirmCameraCancelar').addEventListener('click', function () {
    hideConfirmAllowCamera();
});

const btnOculosOpen = document.querySelector('#btn-oculos-open');
const btnOculosClose = document.querySelector('#btn-oculos-close');
const iframeOculos = document.querySelector('#iframe-oculos');

function openIframeOculos() {
    iframeOculos.style.display = 'block';
    btnOculosClose.style.display = 'block';
    btnOculosOpen.style.display = 'none';
    iframeOculos.contentWindow.postMessage('start', '*');
}

function closeframeOculos() {
    btnOculosClose.style.display = 'none';
    btnOculosOpen.style.display = 'block';
    iframeOculos.style.display = 'none';
    iframeOculos.contentWindow.postMessage('stop', '*');
}

btnOculosOpen.addEventListener('click', () => {
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(function (stream) {
            openIframeOculos();
        })
        .catch(function (error) {
            console.error('Permissão da câmera negada ou ocorreu um erro:', error);
            showConfirmAllowCamera();
        });

});
btnOculosClose.addEventListener('click', () => {
    closeframeOculos();
});