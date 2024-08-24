var scormAPI = null;
var completedSections = []; // Array para armazenar as seções concluídas

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
    var result = scormAPI.LMSSetValue("cmi.core.lesson_status", status);
    scormAPI.LMSCommit(""); // Confirma as mudanças no LMS
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



function completeSection(sectionId) {
  completedSections = getCompletedSections(); // Carrega as seções já concluídas
  if (!completedSections.includes(sectionId)) {
    completedSections.push(sectionId);
    scormAPI.LMSSetValue("cmi.suspend_data", JSON.stringify(completedSections)); // Salva o progresso
    scormAPI.LMSCommit("");

    //if (completedSections.length === document.querySelectorAll('.topico-scorm').length) {
    if (completedSections.length === contents.length) {
      scormSetLessonStatus("completed"); // Marca o curso como concluído se todos os tópicos forem concluídos
    }
  }
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
