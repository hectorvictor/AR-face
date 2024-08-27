var scormAPI = null;
var completedSections = []; // Array para armazenar as seções concluídas



function getAPI() {
  var api = null;
  if (window.parent && window.parent != window) {
    api = findAPI(window.parent);
  }
  if (!api && window.top.opener) {
    api = findAPI(window.top.opener);
  }
  return api;
}

function findAPI(win) {
  while ((win.API == null) && (win.parent != null) && (win.parent != win)) {
    win = win.parent;
  }
  return win.API;
}

function scormUpdateCurrentScore(scoreToAdd) {
    let currentScore = scormAPI.LMSGetValue("cmi.core.score.raw");
    if(!currentScore) {
      currentScore = 0;
    }
    currentScore += scoreToAdd;
    scormAPI.LMSSetValue("cmi.core.score.raw", currentScore);
    scormAPI.LMSCommit(""); // Confirma as mudanças no LMS
}

function scormRecordQuestionario(sectionId, node, isCorrect) {
  // Nota 0 caso erre.
  let finalScore = 0;
  let section = completedSections.find(section => section.id ===sectionId);
  if(!section) {
    return;
  }
  // Se acertar pega a max
  if(isCorrect == 1) {
    finalScore = section.maxScore
  }
  section.score = finalScore;
  section.node = node;
  section.questionarioCompleto = true;
  section.triesUsed = section.triesUsed += 1
  scormUpdateScoreRaw(finalScore);
  scormAPI.LMSSetValue("cmi.suspend_data", JSON.stringify(completedSections)); // Salva o progresso
  scormAPI.LMSCommit("");
  return section;
}

function scormCompleteSection(sectionId, maxScore, topicosComAtividades) {
  completedSections = getCompletedSections(); // Carrega as seções já concluídas
  const sectionData = {
    id: sectionId,
    node: null,
    score: 0,
    maxScore: maxScore,
    questionarioCompleto: false,
    triesUsed: 0
  }
  // Alterar para lidar com objeto
  const hasSection = completedSections.some(section => section.id == sectionId);

  if (!hasSection) {
    completedSections.push(sectionData);
    scormAPI.LMSSetValue("cmi.suspend_data", JSON.stringify(completedSections)); // Salva o progresso
    scormAPI.LMSCommit("");
    // Se tiver completado tudo
    if (completedSections.length === contents.length) {
      
      scormCompleteEntireLesson(topicosComAtividades);
    }

  }
}

function scormCompleteEntireLesson(topicosComAtividades) {
  let finalScore = 0;
  let howManyCorrect = 0;
  completedSections.forEach((item, index) => {
    if(item.score > 0) {
      howManyCorrect++;
    }
    finalScore += item.score;
  });

  // Se acertou e respondeu todas, então o finalScore se torna 100, para evitar problemas de arredondamento
  if(howManyCorrect == topicosComAtividades.length) {
    finalScore = 100;
  }
  scormUpdateScoreRaw(finalScore);
  scormSetLessonSuccessByScore(finalScore)
  scormSetLessonStatus("completed"); // Marca o curso como concluído se todos os tópicos forem concluídos
}

function scormUpdateScoreRaw() {
    let recalculatedScore = 0;
    completedSections.forEach((item, index) => {
    recalculatedScore += item.score;
  });
  scormAPI.LMSSetValue("cmi.core.score.raw", Math.round(recalculatedScore));
  scormAPI.LMSCommit(""); // Confirma as mudanças no LMS
}

function hasSuspendedData() {
  completedSections = getCompletedSections(); // Carrega as seções já concluídas
  if (completedSections.length > 0) {
    return true;
  }

  return false;
}

function getLastViewedTopico() {
  completedSections = getCompletedSections(); // Carrega as seções já concluídas
  let lastIndex = completedSections.length - 1;
  let lastTopico = completedSections[lastIndex];
  return lastTopico;

}

function getCompletedSections() {
  if (!scormAPI) {
    console.error("API do SCORM não encontrada");
    return;
  }

  var data = scormAPI.LMSGetValue("cmi.suspend_data");
  return data ? JSON.parse(data) : [];
}


function scormAPIInitialize() {
  scormAPI = getAPI();
  if (scormAPI != null) {
    var result = scormAPI.LMSInitialize("");
    console.log("SCORM 1.2 - Inicialização: " + result);

    // Verifica o status atual do curso
    var status = scormAPI.LMSGetValue("cmi.core.lesson_status");
    if (status === "not attempted" || status === "") {
      scormInitScores();
    }
  } else {
    console.error("SCORM API não encontrada.");
  }
}

function scormInitScores() {
  scormAPI.LMSSetValue("cmi.core.lesson_status", "incomplete");
  scormAPI.LMSSetValue("cmi.core.score.min", "0");
  scormAPI.LMSSetValue("cmi.core.score.max", "100");
  scormAPI.LMSCommit(""); // Confirma as mudanças no LMS
}

function scormAPITerminate() {
  if (scormAPI != null) {
    var result = scormAPI.LMSFinish("");
  }
}

function scormGetLessonStatus() {
  var status = scormAPI.LMSGetValue("cmi.core.lesson_status");
  return status;
}

function scormIsLessonComplete() {
  let status = scormGetLessonStatus();
  if (status === "completed") {
    return true;
  }

  return false;
}

function scormSetLessonStatus(status) {
  if (scormAPI != null) {
    scormAPI.LMSSetValue("cmi.core.lesson_status", status);
    scormAPI.LMSCommit(""); // Confirma as mudanças no LMS
  }
}

// Marca se foi bem sucedido ou não pela nota
function scormSetLessonSuccessByScore(score) {
  const notaMinima = 60;
  if (scormAPI != null) {
    if (score >= notaMinima) {
      scormAPI.LMSSetValue("cmi.success_status", "passed");
    } else {
      scormAPI.LMSSetValue("cmi.success_status", "failed");
    }
    scormAPI.LMSCommit("");
  }
}


var showBtn = function (div, btnClass) {
    div.querySelector(btnClass).classList.remove('hide');
}
var hideBtn = function (div, btnClass) {
    div.querySelector(btnClass).classList.add('hide');
}
var showFeedback = function (div, feedbackClass) {
    div.querySelector(feedbackClass).classList.remove('hide');
}
var hideFeedback = function (div, feedbackClass) {
    div.querySelector(feedbackClass).classList.add('hide');
}
var tentarNovamente = function (div) {
    div.querySelectorAll('input[type="radio"]').forEach(function (item, index) {
        item.checked = false;
    });
    disableInputs(div, false);
    hideBtn(div, '.btn-tentar-novamente');
    hideFeedback(div, '.feedback-tentar-novamente');
}
var disableInputs = function (div, isDisabled) {
    div.querySelectorAll('input[type="radio"').forEach(function (item, index) {
        item.disabled = isDisabled
    });
}
var responder = function (div) {
    const form = div.querySelector('form');
    hideBtn(div, '.btn-resposta');
    let checkedRadio = div.querySelector('input[type="radio"]:checked');
    handleResposta(checkedRadio, form, div);
}
function handleResposta(checkedRadio, form, div) {
    const topico = form.closest('.topico-container');
    const topicoIndice = topico.getAttribute('data-topico');
    const isCorrect = checkedRadio.value;
    const node = checkedRadio.id;
    let updatedSection = scormRecordQuestionario(topicoIndice, node, isCorrect);
    if (isCorrect == 1) {
        showFeedback(div, '.feedback-certo');
        disableForm(form);
        showLoadNextButton();
        return;
    }
    if (updatedSection.triesUsed >= 2) {
        showFeedback(div, '.feedback-errado');
        disableForm(form);
        showLoadNextButton();
    } else {
        disableForm(form);
        showFeedback(div, '.feedback-tentar-novamente');
        showBtn(div, '.btn-tentar-novamente');
    }
}
function handleAlternativaSelection(event) {
    showBtn(event.target.closest('div.atividades-box-content'), '.btn-resposta');
}
async function hideButton() {
    const btnLoadNext = document.querySelector('#load-next');
    btnLoadNext.style.display = 'none';
}
async function initLoadNextBtn() {
    hideButton();
    document.querySelector('#load-next').addEventListener('click', async function () {
        const btnLoadNext = this;
        if (currentIndex >= contents.length) {
            btnLoadNext.style.display = 'none';
            return;
        }
        currentIndex++;
        await loadTopico(true)
        await hideButton();
    });
}
async function showLoadNextButton() {
    const btnLoadNext = document.querySelector('#load-next');
    btnLoadNext.style.display = 'block';
}
async function initQuizButtons() {
    document.querySelectorAll('.btn-resposta').forEach(function (item) {
        item.addEventListener('click', function (e) {
            responder(e.target.closest('div.atividades-box-content'));
        });
    });
    document.querySelectorAll('.btn-tentar-novamente').forEach(function (item) {
        item.addEventListener('click', function (e) {
            tentarNovamente(e.target.closest('div.atividades-box-content'));
        });
    });
}
async function initAllForms() {
    const forms = document.querySelectorAll('div.atividades-box-content form');
    forms.forEach(form => {
        const radios = form.querySelectorAll('input[type="radio"]');
        radios.forEach(radio => {
            radio.addEventListener('change', handleAlternativaSelection);
        })
    });
}
function getTopicosComAtividades() {
    let topicosWithAtividades = [];
    contents.forEach((item, index) => {
        let container = item.closest('.topico-container');
        let atividades = container.querySelector('.section-atividades');
        if (atividades) {
            topicosWithAtividades.push(item);
        }
    });
    return topicosWithAtividades;
}

var currentIndex = 0;
var maxScoreExercises = 0;
var contents = document.querySelectorAll('[data-topico]');
var topicosComAtividades = getTopicosComAtividades();


async function initAnsweredQuestionsAgain() {
    completedSections.forEach((item, index) => {
        if (item.questionarioCompleto == true) {
            let nodeToMark = item.node;
            let topicoId = item.id;
            const topicoContainer = document.querySelector(`.topico-container[data-topico=${topicoId}]`);
            const form = topicoContainer.querySelector('form');
            const div = topicoContainer.querySelector('div.atividades-box-content');
            let radioButtons = form.querySelectorAll('input[type="radio"]');
            let correctButton;
            radioButtons.forEach((item, index) => {
                if (item.id == nodeToMark) {
                    correctButton = item;
                }
            });
            correctButton.checked = true;
            if (item.score > 0) {
                showFeedback(div, '.feedback-certo');
                disableForm(form);
                return;
            }
            if (item.triesUsed >= 2) {
                showFeedback(div, '.feedback-errado');
                disableForm(form);
            } else {
                disableForm(form);
                showFeedback(div, '.feedback-tentar-novamente');
                showBtn(div, '.btn-tentar-novamente');
            }
        }
    });
}
function disableForm(form) {
    const formControls = form.querySelectorAll('input, select, textarea, button');
    formControls.forEach(control => control.disabled = true);
}
async function calculateMaxScoreForEachExercise() {
    let topicosWithAtividades = getTopicosComAtividades();
    let exercisesCount = topicosWithAtividades.length;
    return 100 / exercisesCount;
}
async function initTopicos() {
    contents.forEach((item, index) => {
        if (index == 0) {
            scormCompleteSection(item.dataset.topico, maxScoreExercises, topicosComAtividades);
            return;
        }
        item.style.display = 'none';
    })
}
async function loadLastTopicoViewed() {
    let lastViewedTopico = getLastViewedTopico();
    for (let index = 0; index < contents.length; index++) {
        let element = contents[index];
        //let shouldScroll = (scormIsLessonComplete() || index == 0 || element.dataset.topico != lastViewedTopico) ? false : true;
        if (scormIsLessonComplete() || index == 0) {
            shouldScroll = false;
        } else if (element.dataset.topico != lastViewedTopico.id) {
            shouldScroll = false;
        } else {
            shouldScroll = true;
        }
        //Encontrou o último tópico que o user viu da última vez que o material foi aberto
        // se não for o ultimo
        if (element.dataset.topico == lastViewedTopico.id) {
            if (lastViewedTopico.questionarioCompleto == true) {
                await showLoadNextButton();
            }
            await loadTopico(shouldScroll, index);
            break;
        }
        await loadTopico(shouldScroll, index);
    }
}
async function loadTopico(shouldScroll = false, fixedIndex = null) {
    if (fixedIndex != null) {
        currentIndex = fixedIndex;
    }
    const contentToDisplay = contents[currentIndex];
    contentToDisplay.style.display = 'block';
    if (shouldScroll) {
        contentToDisplay.scrollIntoView({ behavior: 'smooth' });
    }
    scormCompleteSection(contentToDisplay.dataset.topico, maxScoreExercises, topicosComAtividades);
    let nextIndex = currentIndex + 1;
    if (nextIndex >= contents.length) {
        hideButton();
    }
};

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


window.onload = async function () {
    initAllForms();
    maxScoreExercises = await calculateMaxScoreForEachExercise();
    scormAPIInitialize(); // Inicializa a comunicação SCORM
    if (!scormAPI) {
        console.error("Api do SCORM não encontrada.");
        return;
    }
    completedSections = getCompletedSections(); // Carrega as seções já concluídas
    await initTopicos();
    await initLoadNextBtn();
    await initQuizButtons();
    await initAnsweredQuestionsAgain(); // carrega novamente as questoes que foram marcadas anteriormente
    if (hasSuspendedData()) {
        await loadLastTopicoViewed();
    }
    document.querySelector(".button-wrapper").style.display = "block";
};
window.onunload = function () {
    scormAPITerminate(); // Finaliza a comunicação SCORM ao sair da página
};

