import { deleteClientFromDB } from "./api.js";
import { createClientModalHTML, showErrorMessages } from "./clientModal.js";
import { createLoader } from "./loader.js";

function createDeleteClientModalHTML(title) {
  const deleteClientModalElement = createClientModalHTML();

  deleteClientModalElement.setAttribute("aria-label", "Удаление клиента");

  const headerContainerElement = deleteClientModalElement.querySelector(
    ".modal__container_header"
  );
  headerContainerElement.classList.add("modal__container_header_delete");

  const titleElement = headerContainerElement.querySelector(".modal__title");
  titleElement.classList.add("modal__title_delete");
  titleElement.innerHTML = title;

  const bodyContainerElement = deleteClientModalElement.querySelector(
    ".modal__body > .modal__container"
  );
  bodyContainerElement.innerHTML = `<p class="delete-text">Вы&nbsp;действительно хотите удалить данного клиента?</p>`;

  const footerContainerElement = deleteClientModalElement.querySelector(
    ".modal__footer > .modal__container"
  );
  footerContainerElement.innerHTML = `
    <button class="btn-style-reset modal__confirm-btn modal__delete-btn" type="button">
      <span class="modal__confirm-btn-icon-container" aria-hidden="true"></span>
      Удалить
    </button>
    <button class="btn-style-reset modal__cancel-btn" type="button" data-bs-dismiss="modal">Отмена</button>
  `;

  return deleteClientModalElement;
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

export function createDeleteClientModal(
  clientId,
  { onDelete = (e) => {}, onCancel = (e) => {} } = {}
) {
  const deleteClientModalElement =
    createDeleteClientModalHTML("Удалить клиента");
  const deleteClientModal = new bootstrap.Modal(deleteClientModalElement);

  const block = () => {
    const footerContainerElement = deleteClientModalElement.querySelector(
      ".modal__footer > .modal__container"
    );
    const footerBtns = footerContainerElement.querySelectorAll("button");
    footerBtns.forEach((btn) => {
      btn.disabled = true;
    });
  };

  const unblock = () => {
    const footerContainerElement = deleteClientModalElement.querySelector(
      ".modal__footer > .modal__container"
    );
    const footerBtns = footerContainerElement.querySelectorAll("button");
    footerBtns.forEach((btn) => {
      btn.disabled = false;
    });
  };

  const confirmBtn =
    deleteClientModalElement.querySelector(".modal__delete-btn");
  confirmBtn.addEventListener("click", async (e) => {
    showLoader(deleteClientModalElement);
    block();

    const response = await deleteClientFromDB(clientId);
    if (response.status === "OK") {
      onDelete(e);
      deleteClientModal.hide();
    } else {
      showErrorMessages(deleteClientModalElement, response.errorData);
    }

    unblock();
    hideLoader(deleteClientModalElement);
  });

  deleteClientModalElement.addEventListener("hide.bs.modal", (e) => {
    onCancel(e);
  });

  deleteClientModalElement.addEventListener("hidden.bs.modal", (e) => {
    deleteClientModal.dispose();
    deleteClientModalElement.remove();
  });

  return deleteClientModal;
}
