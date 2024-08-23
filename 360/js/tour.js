AFRAME.registerComponent('popup-tour', {
  init: function () {
    const links = this.el.querySelectorAll('.link');
    this.onClick = this.onClick.bind(this);

    links.forEach(link => {
        link.addEventListener('click', this.onClick);
    })
      },
    onClick: function (event) {
      const href = event.target.getAttribute('data-href');
      window.location.href = href;
    }
  }
)