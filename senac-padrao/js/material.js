var currentIndex = 0;
var maxScoreExercises = 0;
var contents = document.querySelectorAll('[data-topico]');
var topicosComAtividades = getTopicosComAtividades();
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
    console.log("Botão será escondido:")
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
    console.log("Botão será mostrado:");
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
        console.log("Atividades container:")
        console.log(atividades)
        if (atividades) {
            topicosWithAtividades.push(item);
        }
    });
    return topicosWithAtividades;
}
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
                console.log("button id:");
                console.log(item.id);
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
        console.log(element);
        console.log(index);
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
            console.log("É o ultimo topico visto")
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