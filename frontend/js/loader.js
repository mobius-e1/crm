const loaderIconPath = "img/loader-sprite.svg";

export function createLoader(containerClass) {
  const loaderIcon = document.createElement("span");
  loaderIcon.classList.add("loader");
  if (containerClass) {
    loaderIcon.classList.add(containerClass);
  }
  loaderIcon.setAttribute("aria-label", "Идёт загрузка");
  loaderIcon.setAttribute("aria-busy", true);
  loaderIcon.setAttribute("aria-live", "polite");

  loaderIcon.innerHTML = `
    <svg class="loader__icon" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
      <path d="M4.00025 40.0005C4.00025 59.8825 20.1182 76.0005 40.0002 76.0005C59.8822 76.0005 76.0002 59.8825 76.0002 40.0005C76.0002 20.1185 59.8823 4.00049 40.0003 4.00049C35.3513 4.00048 30.9082 4.88148 26.8282 6.48648" stroke-miterlimit="10" stroke-linecap="round">
        <animateTransform attributeName="transform" type="rotate" dur="2s" values="0 40 40;360 40 40;" repeatCount="indefinite"/>
      </path>
    </svg>
  `;

  return loaderIcon;
}
