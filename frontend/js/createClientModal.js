import {
  createClientModalHTML,
  createClientModalBodyHTML,
  createClientModal,
  getClientDataFromModal,
  validate,
  showErrorMessages,
  blockModal,
  unblockModal,
} from "./clientModal.js";
import { createClientInDB } from "./api.js";
import { createLoader } from "./loader.js";

function createCreateClientModalHTML(title) {
  const createClientModalElement = createClientModalHTML(true);

  createClientModalElement.setAttribute("aria-label", "Создание клиента");

  const titleElement = createClientModalElement.querySelector(".modal__title");
  titleElement.innerHTML = title;

  const bodyElement = createClientModalElement.querySelector(".modal__body");
  bodyElement.innerHTML = createClientModalBodyHTML();

  const footerContainerElement = createClientModalElement.querySelector(
    ".modal__footer > .modal__container"
  );
  footerContainerElement.innerHTML = `
    <button class="btn-style-reset modal__confirm-btn modal__save-btn" type="submit">
      <span class="modal__confirm-btn-icon-container" aria-hidden="true"></span>
      Сохранить
    </button>
    <button class="btn-style-reset modal__cancel-btn" type="button" data-bs-dismiss="modal">Отмена</button>
  `;

  return createClientModalElement;
}

function showLoader(modalElement) {
  const loader = createLoader("modal-loader");
  const loaderContainer = modalElement.querySelector(
    ".modal__confirm-btn-icon-container"
  );
  loaderContainer.append(loader);
}

function hideLoader(modalElement) {
  const loaderContainer = modalElement.querySelector(
    ".modal__confirm-btn-icon-container"
  );
  loaderContainer.innerHTML = "";
}

export function createCreateClientModal({
  onCreate = (e) => {},
  onCancel = (e) => {},
} = {}) {
  const createClientModalElement = createCreateClientModalHTML("Новый клиент");
  const clientModal = new bootstrap.Modal(createClientModalElement);

  const onBlock = () => {
    const footerContainerElement = createClientModalElement.querySelector(
      ".modal__footer > .modal__container"
    );
    const footerBtns = footerContainerElement.querySelectorAll("button");
    footerBtns.forEach((btn) => {
      btn.disabled = true;
    });
  };

  const onUnblock = () => {
    const footerContainerElement = createClientModalElement.querySelector(
      ".modal__footer > .modal__container"
    );
    const footerBtns = footerContainerElement.querySelectorAll("button");
    footerBtns.forEach((btn) => {
      btn.disabled = false;
    });
  };

  const onSubmit = async (e) => {
    showLoader(createClientModalElement);
    blockModal(createClientModalElement, onBlock, true);

    const clientData = getClientDataFromModal(createClientModalElement);
    const response = await createClientInDB(clientData);

    unblockModal(createClientModalElement, onUnblock);
    hideLoader(createClientModalElement);

    switch (response.status) {
      case "OK":
        onCreate();
        clientModal.hide();
        break;
      case "INVALID":
        showErrorMessages(createClientModalElement, response.invalidData);
        break;
      case "ERROR":
        showErrorMessages(createClientModalElement, response.errorData);
    }
  };

  const form = createClientModalElement.querySelector("form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const invalids = validate(createClientModalElement);
    if (invalids.length !== 0) {
      showErrorMessages(createClientModalElement, invalids);
    } else {
      onSubmit(e);
    }
  });

  createClientModal(createClientModalElement, { onCancel });

  createClientModalElement.addEventListener("hidden.bs.modal", (e) => {
    clientModal.dispose();
  });

  return clientModal;
}
