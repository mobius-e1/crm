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
import { createDeleteClientModal } from "./deleteClientModal.js";
import { editClientInDB } from "./api.js";
import { createLoader } from "./loader.js";

function createEditClientModalHTML(title, clientId) {
  const editClientModalElement = createClientModalHTML(true);

  editClientModalElement.setAttribute("aria-label", "Редактирование клиента");

  const titleElement = editClientModalElement.querySelector(".modal__title");
  titleElement.innerHTML = title;

  const clientIdElement = editClientModalElement.querySelector(".client-id");
  clientIdElement.innerHTML = `ID:&nbsp;${clientId}`;
  clientIdElement.classList.remove("hidden");

  const bodyElement = editClientModalElement.querySelector(".modal__body");
  bodyElement.innerHTML = createClientModalBodyHTML();

  const footerContainerElement = editClientModalElement.querySelector(
    ".modal__footer > .modal__container"
  );
  footerContainerElement.innerHTML = `
    <button class="btn-style-reset modal__confirm-btn modal__save-btn" type="submit">
      <span class="modal__confirm-btn-icon-container" aria-hidden="true"></span>
      Сохранить
    </button>
    <button class="btn-style-reset modal__cancel-btn" type="button">Удалить клиента</button>
  `;

  return editClientModalElement;
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

export function createEditClientModal(
  clientId,
  clientData,
  { onEdit = (e) => {}, onDelete = (e) => {}, onCancel = (e) => {} } = {}
) {
  const editClientModalElement = createEditClientModalHTML(
    "Изменить данные",
    clientId
  );
  const clientModal = new bootstrap.Modal(editClientModalElement);

  editClientModalElement.addEventListener("show.bs.modal", (e) => {
    window.location.hash = clientId;
  });

  const onBlock = () => {
    const footerContainerElement = editClientModalElement.querySelector(
      ".modal__footer > .modal__container"
    );
    const footerBtns = footerContainerElement.querySelectorAll("button");
    footerBtns.forEach((btn) => {
      btn.disabled = true;
    });
  };

  const onUnblock = () => {
    const footerContainerElement = editClientModalElement.querySelector(
      ".modal__footer > .modal__container"
    );
    const footerBtns = footerContainerElement.querySelectorAll("button");
    footerBtns.forEach((btn) => {
      btn.disabled = false;
    });
  };

  const onSubmit = async (e) => {
    showLoader(editClientModalElement);
    blockModal(editClientModalElement, onBlock, true);

    const clientData = getClientDataFromModal(editClientModalElement);
    const response = await editClientInDB(clientId, clientData);

    unblockModal(editClientModalElement, onUnblock);
    hideLoader(editClientModalElement);

    switch (response.status) {
      case "OK":
        onEdit();
        clientModal.hide();
        break;
      case "INVALID":
        showErrorMessages(editClientModalElement, response.invalidData);
        break;
      case "ERROR":
        showErrorMessages(editClientModalElement, response.errorData);
    }
  };

  const form = editClientModalElement.querySelector("form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const invalids = validate(editClientModalElement);
    if (invalids.length !== 0) {
      showErrorMessages(editClientModalElement, invalids);
    } else {
      onSubmit(e);
    }
  });

  const onDeleteClient = async (e) => {
    const clientData = getClientDataFromModal(editClientModalElement);
    let isDeleted = false;

    const onSubmitDelete = (e) => {
      isDeleted = true;
      onDelete();
    };

    const onCancelDelete = (e) => {
      if (!isDeleted) {
        const editClientModal = createEditClientModal(clientId, clientData, {
          onEdit,
          onDelete,
        });
        editClientModal.show();
      }
    };

    const deleteClientModal = createDeleteClientModal(clientId, {
      onDelete: onSubmitDelete,
      onCancel: onCancelDelete,
    });

    clientModal.hide();
    deleteClientModal.show();
  };

  const deleteBtn = editClientModalElement.querySelector(".modal__cancel-btn");
  deleteBtn.addEventListener("click", async (e) => {
    onDeleteClient(e);
  });

  createClientModal(editClientModalElement, { clientData, onCancel, onBlock });

  editClientModalElement.addEventListener("hidden.bs.modal", (e) => {
    history.pushState(
      "",
      document.title,
      window.location.pathname + window.location.search
    );
    clientModal.dispose();
  });

  return clientModal;
}
