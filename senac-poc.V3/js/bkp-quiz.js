(function () {
    var atividades = [];
    var isQuizCompleted = false;

    document.querySelectorAll('div.atividades-box-content').forEach(function (item, index) {
        atividades.push({
            index: item.dataset.index,
            tentativas: 0
        });
    });
    

    // Adaptar:
    document.querySelectorAll('div.atividades-box-content input[type="radio"]').forEach(function (item) {
        item.addEventListener('click', function (e) {
            // adicionar scorm aqui
            showBtn(e.target.closest('div.atividades-box-content'), '.btn-resposta');
        });
    });

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


    var showBtn = function(div, btnClass) {
        div.querySelector(btnClass).classList.remove('hide');
    }

    var hideBtn = function (div, btnClass) {
        div.querySelector(btnClass).classList.add('hide');
    }

    var showFeedback = function(div, feedbackClass) {
        div.querySelector(feedbackClass).classList.remove('hide');
    }

    var hideFeedback = function (div, feedbackClass) {
        div.querySelector(feedbackClass).classList.add('hide');
    }

    var tentarNovamente = function(div) {
        div.querySelectorAll('input[type="radio"]').forEach(function (item, index) {
            item.checked = false;
        });
        disableInputs(div, false);
        hideBtn(div, '.btn-tentar-novamente');
        hideFeedback(div, '.feedback-tentar-novamente');
    }

    var disableInputs = function(div, isDisabled) {
        div.querySelectorAll('input[type="radio"').forEach(function(item, index) {
            item.disabled = isDisabled
        });
    }

    // var showNext = function (currentIndex) {
    //     var nextIndex = Number(currentIndex) + 1;
        
    //     if (nextIndex >= atividades.length) {
    //         return;
    //     }

    //     var nextDiv = document.querySelector('div.atividades-box-content[data-index="' + nextIndex + '"]');
    //     nextDiv.classList.remove('hide');
    // }

    var setQuizCompleted = function() {
        if (isQuizCompleted) {
            return;
        }

        isQuizCompleted = true;

        var event = new CustomEvent("quiz-completed", {
            cancelable: false,
            bubbles: true
        });

        document.dispatchEvent(event);
    }

    var responder = function (div) {
        hideBtn(div, '.btn-resposta');

        var i = div.dataset.index;
        atividades[i].tentativas++;

        disableInputs(div, true);
        // showNext(i);

        var selectedValue = div.querySelector('input[type="radio"]:checked').value;

        if (selectedValue == '1') {
            showFeedback(div, '.feedback-certo');
        } else {
            if (atividades[i].tentativas < 2) {
                showFeedback(div, '.feedback-tentar-novamente');
                showBtn(div, '.btn-tentar-novamente');
            } else {
                showFeedback(div, '.feedback-errado');
            }
        }

        if (Number(i) == atividades.length - 1) {
            setQuizCompleted();
        }
    }
})();

// (function () {

//     if (typeof window.CustomEvent === "function") return false;

//     function CustomEvent(event, params) {
//         params = params || { bubbles: false, cancelable: false, detail: null };
//         //var evt = document.createEvent('CustomEvent');
//         var evt = new CustomEvent();
//         evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
//         return evt;
//     }

//     window.CustomEvent = CustomEvent;
// })();