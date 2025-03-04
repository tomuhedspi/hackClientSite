document.addEventListener("DOMContentLoaded", function() {
  const navbarHTML = `
    <nav class="navbar navbar-expand-sm navbar-dark" style="background-color: rgba(9, 110, 235, 0.754);">
      <a class="navbar-brand" href="index.html">
        <img src="image/icon.png" alt="Hack Não BK" id="app_icon" style="width:40px;">
      </a>
      <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbar" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbar">
        <ul class="navbar-nav">
          <li class="nav-item">
            <a class="nav-link" href="index.html">TỪ VỰNG</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="kanji.html">HÁN TỰ</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="unit.html">GIÁO TRÌNH</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="audio.html">NGHE</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="addword.html">ĐÓNG GÓP TỪ</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="downloadfile.html">DOWNLOAD</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="info.html">GIỚI THIỆU</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="setting.html">CÀI ĐẶT</a>
          </li>
        </ul>
      </div>
    </nav>
  `;

  document.body.insertAdjacentHTML('afterbegin', navbarHTML);

  // Load the selected language from local storage
  const selectedLanguage = localStorage.getItem('selected_language') || 'Japanese';
  updateNavbar(selectedLanguage);

  function updateNavbar(language) {
    if (language === 'English') {
      $('.nav-item a[href="kanji.html"]').parent().hide();
      $('.nav-item a[href="unit.html"]').parent().hide();
      $('.nav-item a[href="audio.html"]').parent().hide();
      $('.nav-item a[href="downloadfile.html"]').parent().hide();
    } else if (language === 'Japanese') {
      $('.nav-item a[href="kanji.html"]').parent().show();
      $('.nav-item a[href="unit.html"]').parent().show();
      $('.nav-item a[href="audio.html"]').parent().show();
      $('.nav-item a[href="downloadfile.html"]').parent().show();
    }
  }

  // Highlight the current page in the navbar
  const currentPath = window.location.pathname.split('/').pop();
  document.querySelector(`.nav-item a[href="${currentPath}"]`).classList.add('active');

  // Update navbar when language changes
  document.getElementById('languageDropdown').addEventListener('change', function() {
    const selectedLanguage = this.value;
    updateNavbar(selectedLanguage);
  });
});