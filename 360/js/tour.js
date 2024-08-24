AFRAME.registerComponent('popup-tour', {
  init: function () {
      this.el.addEventListener("loaded", e => {
        const links = this.el.querySelectorAll('.link');
        const sceneEl = document.querySelector('a-scene');
        let assets = document.createElement('a-assets');
        this.sky = document.createElement('a-sky');

        this.listMap = [
          {
            index: '01',
            planes: [
              {
                dataImg: './img/03.jpg',
                position: '-5 -4 8',
                rotation: '90 210 -110',
                height: '3',
                width: '3'
              },
              {
                dataImg: './img/04.jpg',
                position: '-2 -4 -9',
                rotation: '90 210 -20',
                height: '3',
                width: '3'
              },
            ]
          },
          {
            index: '02',
            planes: [
              {
                dataImg: './img/03.jpg',
                position: '30 -10 -10',
                rotation: '100 -45 165',
                height: '7',
                width: '5'
              },
              {
                dataImg: './img/05.jpg',
                position: '-3 -4 -8',
                rotation: '100 -45 115',
                height: '4',
                width: '2'
              },
            ]
          },
          {
            index: '03',
            planes: [
              {
                dataImg: './img/02.jpg',
                position: '19 -10 -10',
                rotation: '100 -45 165',
                height: '7',
                width: '5'
              },
              {
                dataImg: './img/01.jpg',
                position: '-4 -4 6',
                rotation: '100 -45 0',
                height: '4',
                width: '2'
              },
            ]
          },
          {
            index: '04',
            planes: [
              {
                dataImg: './img/05.jpg',
                position: '13 -10 -10',
                rotation: '100 -45 155',
                height: '7',
                width: '5'
              },
              {
                dataImg: './img/01.jpg',
                position: '-8 -4 1',
                rotation: '100 -45 10',
                height: '4',
                width: '2'
              },
            ]
          },
          {
            index: '05',
            planes: [
              {
                dataImg: './img/04.jpg',
                position: '-3 -5 7',
                rotation: '100 -45 10',
                height: '4',
                width: '2'
              },
              {
                dataImg: './img/02.jpg',
                position: '-15 -15 -15',
                rotation: '100 -45 105',
                height: '10',
                width: '7'
              },
            ]
          }
        ]
        this.img = document.createElement('img');
        this.img.setAttribute('src', './img/02.jpg');
        this.img.id = 'tour-02';
        assets.appendChild(this.img);

        let arrow = document.createElement('img');
        arrow.setAttribute('src', './img/fast-forward.png');
        arrow.id = 'arrow';
        arrow.setAttribute('crossOrigin', 'anonymous');
        assets.appendChild(arrow);

        this.sky.id = 'sky';
        this.sky.setAttribute('src', '#tour-02');
        this.sky.setAttribute('rotation', '0 -130 0');

        sceneEl.prepend(assets);
        sceneEl.appendChild(this.sky);

        this.onClick = this.onClick.bind(this);

        let path = this.img.getAttribute('src');
        path = path.split('/').pop().split('.')[0];
        this.updatePlane(path);
      });
    },
    updatePlane: function(index) {
      const map = Array.from(this.listMap).find(item => item.index == index);
      this.el.querySelectorAll('.link').forEach(link => link.remove());
      const sceneEl = document.querySelector('a-scene');
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
  },
)