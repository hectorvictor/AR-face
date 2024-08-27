const b42Tour = {
  images: [],
  background: {},
  arrows: [],

  setImages: function (imagePaths) {
    try {
      if(imagePaths == undefined || imagePaths == null || !Array.isArray(imagePaths)) {
        throw 'O argumento deve ser um array de objetos.';
      }

      if (imagePaths.length === 0) {
        throw 'O array não pode estar vazio.';
      }

      if(!Array.from(imagePaths).some(item => item.id && item.src)) {
        throw `Todos os itens do array devem ser objetos com as propriedades obrigatórias "id" e "src".`;
      }

      this.images = imagePaths;

    } catch (error) {
      throw error;
    }
  },
  setBackgroud: function (path) {
    try {
      if(path == undefined || path == null || typeof path !== 'object' || Array.isArray(path)) {
        throw 'O argumento deve ser um objetos.';
      }

      if(!path.id || !path.src) {
        throw `Objeto com as propriedades obrigatórias "id" e "src".`;
      }

      this.background = path;

    } catch (error) {
      throw error;
    }

  },
  isPropsValid: function (items) {
    if (items.length === 0) {
      throw 'O campo planes não pode estar vazio.';
    }

    Array.from(items).map(item => {
      if(!item.hasOwnProperty("dataImg") || typeof item.dataImg !== "string") {
        throw `O campo 'dataImg' não existe!`;
      }

      if(!item.hasOwnProperty("position") || typeof item.position !== "string") {
        throw `O campo 'position' não existe!`;
      }

      if(!item.hasOwnProperty("rotation") || typeof item.rotation !== "string") {
        throw `O campo 'rotation' não existe!`;
      }

      if(!item.hasOwnProperty("width") || typeof item.width !== "string") {
        throw `O campo 'width' não existe!`;
      }

      if(!item.hasOwnProperty("height") || typeof item.height !== "string") {
        throw `O campo 'height' não existe!`;
      }

    })


  },
  setArrows: function (arrowConfig) {

    try {
      if (arrowConfig.length === 0) {
        throw 'O campo arrows não pode estar vazio.';
      }
      
      if(arrowConfig == undefined || arrowConfig == null || !Array.isArray(arrowConfig)) {
        throw 'O argumento deve ser um array de objetos.';
      }

      Array.from(arrowConfig).map(item => {
        if(!item.index || !item.planes) {
          throw 'Objeto com as propriedades obrigatórias "index" e "planes".';
        }

        this.isPropsValid(item.planes);
      });

      this.arrows = arrowConfig;

    } catch (error) {
      throw error;
    }

  }
};

AFRAME.registerComponent('popup-tour', {
  init: function () {
    this.el.addEventListener("loaded", e => {
      const links = this.el.querySelectorAll('.link');
      let assets = document.createElement('a-assets');
      this.sky = document.createElement('a-sky');

      // imagem do fundo
      this.img = document.createElement('img');
      this.img.setAttribute('src', b42Tour.background.src);
      this.img.id = b42Tour.background.id;
      assets.appendChild(this.img);

      //imagens adicionadas
      b42Tour.images.forEach(item => {
        let imagem = document.createElement('img');
        imagem.setAttribute('src', item.src);
        imagem.id = item.id;
        imagem.setAttribute('crossOrigin', 'anonymous');
        assets.appendChild(imagem);
      });

      this.sky.id = 'sky';
      this.sky.setAttribute('src', '#tour-02');
      this.sky.setAttribute('rotation', '0 -130 0');

      this.el.sceneEl.prepend(assets);
      this.el.sceneEl.appendChild(this.sky);

      this.onClick = this.onClick.bind(this);

      let path = this.img.getAttribute('src');
      path = path.split('/').pop().split('.')[0];
      this.updatePlane(path);
    });
  },
  updatePlane: function (index) {
    const map = Array.from(b42Tour.arrows).find(item => item.index == index);
    if(b42Tour.arrows.length == 0 || !map) {
      return;
    }

    this.el.querySelectorAll('.link').forEach(link => link.remove());
    map.planes.forEach(item => {
      let plane = document.createElement('a-plane');
      plane.setAttribute('src', '#arrow');
      plane.setAttribute('position', item.position);
      plane.setAttribute('rotation', item.rotation);
      plane.setAttribute('height', item.height);
      plane.setAttribute('width', item.width);
      plane.setAttribute('data-img', item.dataImg);
      plane.classList.add('link');

      plane.setAttribute('material', `
          side: double;
          transparent: true;
          opacity: 1
        `);

      plane.setAttribute('animation__scale', `
          property: scale;
          to: 1.5 1.5 1.5;
          dur: 250;
          dir: alternate;
          startEvents: mouseenter
        `);

      plane.setAttribute('animation__reset', `
          property: scale;
          to: 1 1 1;
          dur: 250;
          startEvents: mouseleave
        `);
      this.el.appendChild(plane);
      plane.addEventListener('click', this.onClick);
    });
  },
  onClick: function (event) {
    let path = event.target.getAttribute('data-img');
    path = path.split('/').pop().split('.')[0];
    this.img.setAttribute('src', `./img/${path}.jpg`);
    this.img.id = `tour-${path}`;

    this.img.onload = () => {
      this.sky.setAttribute('src', `#tour-${path}`);
      this.sky.components.material.material.map.needsUpdate = true;
      this.updatePlane(path);
    };
  }
});

export default b42Tour;