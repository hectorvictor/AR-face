const b42Glasse = {
  models: [],
  options: [],

  setModels: function(newModels) {
    try {
      if(newModels == undefined || newModels == null || !Array.isArray(newModels)) {
        throw 'O argumento deve ser um array de objetos.';
      }

      if (newModels.length === 0) {
        throw 'O array não pode estar vazio.';
      }

      const areVariablesDefined = !Array.from(newModels).every(item => {
        return (
          item.img !== undefined &&
          item.html !== undefined
        );
      });

      if(areVariablesDefined) {
        throw `Todos os itens do array devem ser objetos com as propriedades obrigatórias "img" e "html".`;
      }

      this.models = newModels;

    } catch (error) {
      throw error;
    }
  },
  setOptions: function(newOptions) {
    try {
      if(newOptions == undefined || newOptions == null || !Array.isArray(newOptions)) {
        throw 'O argumento deve ser um array de objetos.';
      }

      if (newOptions.length === 0) {
        throw 'O array não pode estar vazio.';
      }

      const areVariablesDefined = !Array.from(newOptions).every(item => {
        return (
          item.id !== undefined &&
          item.src !== undefined &&
          item.style !== undefined &&
          item.visible !== undefined
        );
      });

      if(areVariablesDefined) {
        throw `Todos os itens do array devem ser objetos com as propriedades obrigatórias "id", "src", "style" e "visible".`;
      }

      this.options = newOptions;
    } catch (error) {
      throw error;
    }
  }
};

AFRAME.registerComponent('model-glasses', {
  init: function () {
    this.el.addEventListener("loaded", e => {
      document.querySelector(".button-menu").addEventListener("click", this.toggleMenu.bind(this));
      const options = document.querySelector('.model-options');

      if(!b42Glasse.models || b42Glasse.models.length == 0) {
        return;
      }
      b42Glasse.models.map(item => {
        let assetItem = document.createElement('a-asset-item');
        assetItem.setAttribute('id', item.img.id);
        assetItem.setAttribute('src', item.img.src);
        assets.appendChild(assetItem);
        this.el.innerHTML += item.html;
      });

      b42Glasse.options.forEach((item, index) => {
        const img = document.createElement('img');
        img.id = item.id;
        img.setAttribute('src', item.src);
        img.setAttribute('style', item.style);
        options.appendChild(img);

        const button = document.querySelector("#" + item.id);
        const entities = this.el.sceneEl.querySelectorAll("." + item.id + "-entity");
        this.setVisible(button, entities, false);
        button.addEventListener('click', () => {
          b42Glasse.options.forEach((otherItem, otherIndex) => {
            if (otherIndex !== index) {
              const otherButton = document.querySelector("#" + otherItem.id);
              const otherEntities = document.querySelectorAll("." + otherItem.id + "-entity");
              otherItem.visible = false;
              this.setVisible(otherButton, otherEntities, false);
            }
          });
          item.visible = !item.visible;
          this.setVisible(button, entities, item.visible);
        });
      });
    });
    let assets = document.createElement('a-assets');
    this.el.sceneEl.prepend(assets);
  },
  setVisible: function(button, entities, visible) {
    if (visible) {
      button.classList.add("selected");
      if (window.innerWidth < 700) {
        this.toggleMenu();
      }
    } else {
      button.classList.remove("selected");
    }

    entities.forEach((entity) => {
      entity.setAttribute("visible", visible);
    });
  },
  toggleMenu: function(event) {
    const panel = document.getElementById('optionsPanel');
    panel.classList.toggle('expanded');

    if (panel.classList.contains('expanded')) {
      panel.style.maxHeight = '400px';
    } else {
      panel.style.maxHeight = '40px';
    }
  }
});

function addPageWrapper() {
  let page = document.querySelector('.page-wrapper');
  let container = document.querySelector('.try-on-container');
  page.style.display = 'flex';
  page.style.justifyContent = 'center';
  page.style.alignItems = 'center';
  page.style.width = '100%';
  page.style.height = '100%';
  page.style.backgroundColor = '#004a8d';

  container.style.width = '40%';
  container.style.height = '80%';
  container.style.zIndex = '2';
}

document.addEventListener("DOMContentLoaded", function() {
  const isInIframe = window !== window.parent;
  const sceneEl = document.querySelector('a-scene');
  let arSystem;
  sceneEl.addEventListener('loaded', function () {
    arSystem = sceneEl.systems["mindar-face-system"];
    if (isInIframe) {
      window.addEventListener('message', function(event) {
        if(event.data == 'start') {
          arSystem.start();
        } else {
          arSystem.stop();
        }
      });
    } else {
      arSystem.start();
      addPageWrapper();
    }
  });

  sceneEl.addEventListener("arReady", (event) => {
    console.log("ar ready");
  });
  // detect target found
  sceneEl.addEventListener("targetFound", event => {
    console.log("target found");
  });
  // detect target lost
  sceneEl.addEventListener("targetLost", event => {
    console.log("target lost");
  });
  // arError event triggered when something went wrong. Mostly browser compatbility issue
  sceneEl.addEventListener("arError", (event) => {
    console.log("ar error");
    if(event.detail && event.detail.error == "VIDEO_FAIL") {
      alert("Câmera não encontrada ou sem permissão de uso");
    }
  });
});

export default b42Glasse;