var scormAPI = null;

function scormAPIInitialize() {
    scormAPI = getAPI();
    if (scormAPI != null) {
        var result = scormAPI.LMSInitialize("");
        console.log("SCORM 1.2 - Inicialização: " + result);

        // Verifica o status atual do curso
        var status = scormAPI.LMSGetValue("cmi.core.lesson_status");
        if (status === "not attempted" || status === "") {
            scormSetLessonStatus("incomplete"); // Define como "incomplete" na primeira inicialização
        }
    } else {
        console.error("SCORM API não encontrada.");
    }
}

function scormAPITerminate() {
    if (scormAPI != null) {
        var result = scormAPI.LMSFinish("");
        console.log("SCORM 1.2 - Finalização: " + result);
    }
}

function scormSetLessonStatus(status) {
    if (scormAPI != null) {
        var result = scormAPI.LMSSetValue("cmi.core.lesson_status", status);
        console.log("Status da lição definido como: " + status + " - Resultado: " + result);
        scormAPI.LMSCommit(""); // Confirma as mudanças no LMS
    }
}

function scormSetCurrentTopic(topic) {
    if (scormAPI != null) {
        var result = scormAPI.LMSSetValue("cmi.core.lesson_location", topic);
        console.log("Tópico atual definido como: " + topic + " - Resultado: " + result);
    }
}

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
