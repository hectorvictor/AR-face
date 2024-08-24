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
    console.log("Section não encontrada");
    return;
  }
  // Se acertar pega a max
  if(isCorrect == 1) {
    finalScore = section.maxScore
  }
  section.score = finalScore;
  section.node = node;
  section.questionarioCompleto = true;
  console.log("Resposta salva para", section);
  console.log("Nota:", finalScore);
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
  console.log("SCORM completo");
  let finalScore = 0;
  let howManyCorrect = 0;
  completedSections.forEach((item, index) => {
    console.log("Index")
    console.log(index);
    console.log("Item")
    console.log(item);
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
    console.log("Index")
    console.log(index);
    console.log("Item")
    console.log(item);
    recalculatedScore += item.score;
  });
  console.log("score raw:")
  console.log(recalculatedScore)
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
