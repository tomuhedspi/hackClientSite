document.addEventListener("DOMContentLoaded", function() {
  const navbarHTML = `
    <nav class="navbar navbar-expand-lg navbar-dark" style="background-color: rgba(9, 110, 235, 0.754);">
      <a class="navbar-brand" href="#">
        <img src="image/icon.png" alt="Hack Não BK" id="app_icon" style="width:40px;">
      </a>
      <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbar" aria-controls="navbar" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbar">
        <ul class="navbar-nav mr-auto">
          <!-- English Tab -->
          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" id="englishDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              Tiếng Anh
            </a>
            <div class="dropdown-menu" aria-labelledby="englishDropdown">
              <a class="dropdown-item" href="english.html">Từ vựng</a>
              <a class="dropdown-item" href="addenglish.html">Đóng góp từ</a>
            </div>
          </li>
          
          <!-- Japanese Tab -->
          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" id="japaneseDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              Tiếng Nhật
            </a>
            <div class="dropdown-menu" aria-labelledby="japaneseDropdown">
              <a class="dropdown-item" href="index.html">Từ vựng</a>
              <a class="dropdown-item" href="kanji.html">Hán tự</a>
              <a class="dropdown-item" href="addjapanese.html">Đóng góp từ</a>
              <a class="dropdown-item" href="addkanji.html">Đóng góp Hán Tự</a>
              <a class="dropdown-item" href="audio.html">Nghe</a>
              <a class="dropdown-item" href="unit.html">Giáo trình</a>
            </div>
          </li>

          <!-- Info Tab -->
          <li class="nav-item">
            <a class="nav-link" href="info.html">Info</a>
          </li>

          <!-- Download Tab -->
          <li class="nav-item">
            <a class="nav-link" href="downloadfile.html">Download</a>
          </li>
        </ul>
      </div>
    </nav>
  `;

  document.body.insertAdjacentHTML('afterbegin', navbarHTML);

  // Highlight the current page in the navbar
  const currentPath = window.location.pathname.split('/').pop();
  const currentNavItem = document.querySelector(`a[href="${currentPath}"]`);
  if (currentNavItem) {
    if (currentNavItem.classList.contains('dropdown-item')) {
      // If it's a dropdown item, highlight both the item and its parent dropdown
      currentNavItem.classList.add('active');
      const dropdownParent = currentNavItem.closest('.dropdown').querySelector('.dropdown-toggle');
      dropdownParent.classList.add('active');
    } else {
      currentNavItem.classList.add('active');
    }
  }

  // Add touch support for dropdowns on mobile
  if ('ontouchstart' in window) {
    const dropdowns = document.querySelectorAll('.dropdown-toggle');
    dropdowns.forEach(dropdown => {
      dropdown.addEventListener('click', function(e) {
        e.preventDefault();
        const dropdownMenu = this.nextElementSibling;
        const isOpen = dropdownMenu.classList.contains('show');
        
        // Close all other dropdowns
        document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
          if (menu !== dropdownMenu) {
            menu.classList.remove('show');
            menu.previousElementSibling.setAttribute('aria-expanded', 'false');
          }
        });

        // Toggle current dropdown
        if (!isOpen) {
          dropdownMenu.classList.add('show');
          this.setAttribute('aria-expanded', 'true');
        } else {
          dropdownMenu.classList.remove('show');
          this.setAttribute('aria-expanded', 'false');
        }
      });
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
      if (!e.target.closest('.dropdown')) {
        document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
          menu.classList.remove('show');
          menu.previousElementSibling.setAttribute('aria-expanded', 'false');
        });
      }
    });
  }
});