Inputmask.extendDefaults({
  autoUnmask: true,
});

const modalIconsPath = "frontend/img/modal-sprite.svg";
let isBlocked = false;

export function createClientModalHTML(form = false) {
  const clientModalElement = document.createElement("div");
  clientModalElement.classList.add("modal", "fade");
  clientModalElement.setAttribute("data-bs-keyboard", "true");
  clientModalElement.setAttribute("tabindex", "-1");
  clientModalElement.setAttribute("role", "dialog");

  const clientModalElementInnerHTML = `
    <div class="modal__dialog modal-dialog modal-dialog-centered" role="document">
      <div class="modal__content">
        ${form ? "<form novalidate>" : ""}
          <div class="modal__header">
            <div class="modal__container modal__container_header">
              <h2 class="modal__title"></h2>
              <span class="client-id hidden"></span>
              <button type="button" class="btn-style-reset modal__btn-close" data-bs-dismiss="modal" aria-label="Закрыть"></button>
            </div>
          </div>

          <div class="modal__body">
            <div class="modal__container"></div>
          </div>

          <div class="modal__error error hidden">
            <div class="modal__container">
              <ul class="error__list"></ul>
            </div>
          </div>

          <div class="modal__footer">
            <div class="modal__container"></div>
          </div>
        ${form ? "</form>" : ""}
      </div>
    </div>
  `;

  clientModalElement.innerHTML = clientModalElementInnerHTML;
  return clientModalElement;
}

export function createClientModalBodyHTML() {
  return `
    <div class="modal__container">
      <div class="fullname-section">
        <div class="form-group form-group__surname">
          <label class="fullname-section__label" for="surname-input">Фамилия<span class="asterisk">*</span></label>
          <input class="input-style-reset fullname-section__input" id="surname-input" type="text" required>
        </div>

        <div class="form-group form-group__name">
          <label class="fullname-section__label" for="name-input">Имя<span class="asterisk">*</span></label>
          <input class="input-style-reset fullname-section__input" id="name-input" type="text" required>
        </div>

        <div class="form-group form-group__lastname">
          <label class="fullname-section__label" for="lastname-input">Отчество</label>
          <input class="input-style-reset fullname-section__input" id="lastname-input" type="text">
        </div>
      </div>
    </div>

    <div class="modal__container modal__container_contacts">
      <div class="contacts-section">
        <ul class="contacts-section__list" id="create-edit-client-modal-contacts-list">
        </ul>
        <button class="btn-style-reset btn-with-icon contacts-section__btn add-contact-btn" id="create-edit-client-modal-add-contact-btn" type="button">
          <span class="add-contact-btn__icon-container" aria-hidden="true">
            <svg class="add-contact-btn__icon" xmlns="http://www.w3.org/2000/svg">
              <use class="non-hovered" href="${modalIconsPath}#addClientNonHovered" />
              <use class="hovered"  href="${modalIconsPath}#addClientHovered" />
            </svg>
          </span>Добавить контакт
        </button>
      </div>
    </div>
  `;
}

function ID() {
  return Math.random().toString(36).substring(2, 9);
}

function createDropdown(list) {
  const dropdown = document.createElement("div");
  dropdown.classList.add("contact-edit__dropdown", "dropdown");

  const dropdownBtn = document.createElement("button");

  const btnId = ID();
  dropdownBtn.classList.add("btn-style-reset", "dropdown__btn");
  dropdownBtn.setAttribute("id", `dropdownBtn_${btnId}`);
  dropdownBtn.setAttribute("type", "button");
  dropdownBtn.setAttribute("data-bs-toggle", "dropdown");
  dropdownBtn.setAttribute("role", "combobox");
  dropdownBtn.setAttribute("aria-expanded", "false");
  dropdownBtn.setAttribute("aria-label", "Выберите тип контакта");
  dropdownBtn.setAttribute("aria-haspopup", "listbox");
  dropdown.append(dropdownBtn);

  const dropdownBtnText = document.createElement("span");
  dropdownBtnText.classList.add("dropdown__btn-text");

  const dropdownBtnIcon = document.createElement("span");
  dropdownBtnIcon.classList.add("dropdown__icon-container");

  const dropdownBtnIconSvg = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "svg"
  );
  dropdownBtnIconSvg.classList.add("dropdown__icon");
  dropdownBtnIconSvg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  dropdownBtnIcon.append(dropdownBtnIconSvg);

  const dropdownBtnIconUse = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "use"
  );
  dropdownBtnIconUse.setAttribute("href", `${modalIconsPath}#arrow`);
  dropdownBtnIconSvg.append(dropdownBtnIconUse);

  dropdownBtn.append(dropdownBtnText);
  dropdownBtn.append(dropdownBtnIcon);

  const dropdownList = document.createElement("ul");
  dropdownList.classList.add("dropdown-menu", "dropdown__menu");
  dropdownList.setAttribute("aria-labelledby", `dropdownBtn_${btnId}`);
  for (let item of list) {
    const link = document.createElement("a");
    link.setAttribute("href", "#");
    link.append(item);

    const itemElement = document.createElement("li");
    itemElement.append(link);

    dropdownList.append(itemElement);

    itemElement.addEventListener("click", (e) => {
      const chosenValue = e.currentTarget.innerText;
      chooseDropdownValue(dropdown, chosenValue);
    });

    link.addEventListener("click", (e) => {
      e.preventDefault();
    });
  }

  dropdown.append(dropdownList);

  return { dropdown, dropdownBtn };
}

function chooseDropdownValue(dropdownElement, value) {
  const phoneMask = new Inputmask("+7 (999)-999-99-99");

  const dropdownBtn = dropdownElement.querySelector(".dropdown__btn");
  const dropdownBtnText = dropdownBtn.querySelector(".dropdown__btn-text");
  dropdownBtnText.innerText = value;

  const dropdownItemsList = Array.from(dropdownElement.querySelectorAll("a"));
  dropdownItemsList.forEach((item) =>
    item.setAttribute("class", "dropdown-item dropdown__item")
  );

  const dropdownActiveItem = dropdownItemsList.filter(
    (item) => item.innerText === value
  )[0];
  dropdownActiveItem.classList.add("dropdown__item_active");
  dropdownActiveItem.setAttribute("aria-current", "true");

  const nonactiveDropdownItemsList = dropdownItemsList.filter(
    (item) => !item.classList.contains("dropdown__item_active")
  );
  nonactiveDropdownItemsList[0].classList.add("dropdown__item_first");
  nonactiveDropdownItemsList[
    nonactiveDropdownItemsList.length - 1
  ].classList.add("dropdown__item_last");

  const contactInput = dropdownElement.parentElement.querySelector("input");
  Inputmask.remove(contactInput);
  switch (value) {
    case "Телефон":
      contactInput.setAttribute("type", "tel");
      phoneMask.mask(contactInput);
      break;
    case "Email":
      contactInput.setAttribute("type", "email");
      break;
    default:
      contactInput.setAttribute("type", "text");
  }

  dropdownBtn.focus();
}

function createClientContactItemDeleteButton(onClick) {
  const deleteContactBtn = document.createElement("button");
  deleteContactBtn.classList.add("btn-style-reset", "contact-edit__delete-btn");
  deleteContactBtn.setAttribute("type", "button");
  deleteContactBtn.setAttribute("aria-label", "Удалить контакт");
  deleteContactBtn.setAttribute("title", "Удалить контакт");
  deleteContactBtn.setAttribute("data-bs-toggle", "tooltip");
  deleteContactBtn.setAttribute("data-bs-trigger", "hover focus");
  deleteContactBtn.setAttribute("data-bs-placement", "top");

  const tooltip = new bootstrap.Tooltip(deleteContactBtn);

  const deleteContactBtnIconContainer = document.createElement("span");
  deleteContactBtnIconContainer.classList.add(
    "contact-edit__delete-btn-icon-container"
  );
  deleteContactBtn.append(deleteContactBtnIconContainer);

  const deleteContactBtnIcon = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "svg"
  );
  deleteContactBtnIcon.classList.add("contact-edit__delete-btn-icon");
  deleteContactBtnIcon.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  deleteContactBtnIconContainer.append(deleteContactBtnIcon);

  const deleteContactBtnIconUse = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "use"
  );
  deleteContactBtnIconUse.setAttribute("href", `${modalIconsPath}#cross`);
  deleteContactBtnIcon.append(deleteContactBtnIconUse);

  deleteContactBtn.addEventListener("click", (e) => {
    onClick(e);
    tooltip.dispose();
  });

  return deleteContactBtn;
}

function createClientContactItem(clientModalElement) {
  const item = document.createElement("li");
  item.classList.add("contacts-section__item");

  const itemContainer = document.createElement("div");
  itemContainer.classList.add("contact-edit");
  item.append(itemContainer);

  const contactTypesList = ["Телефон", "Email", "Vk", "Facebook", "Другое"];
  const defaultItem = "Телефон";
  const { dropdown, dropdownBtn } = createDropdown(contactTypesList);
  itemContainer.append(dropdown);
  new bootstrap.Dropdown(dropdownBtn);

  const contactInput = document.createElement("input");
  contactInput.classList.add("input-style-reset", "contact-edit__input");
  contactInput.setAttribute("input-style-reset", "contact-edit__input");
  itemContainer.append(contactInput);

  contactInput.addEventListener("input", (e) => {
    contactInput.parentElement.classList.remove("contact-edit_invalid");
  });

  const onClick = (e) => {
    removeContact(clientModalElement, item);
  };

  const deleteContactBtn = createClientContactItemDeleteButton(onClick);
  itemContainer.append(deleteContactBtn);

  chooseDropdownValue(dropdown, defaultItem);

  return item;
}

export function getClientDataFromModal(clientModalElement) {
  const data = {};

  const surnameElement = clientModalElement.querySelector("#surname-input");
  data.surname = surnameElement.value.trim();

  const nameElement = clientModalElement.querySelector("#name-input");
  data.name = nameElement.value.trim();

  const lastNameElement = clientModalElement.querySelector("#lastname-input");
  data.lastName = lastNameElement.value.trim();

  const contactsList = clientModalElement.querySelectorAll(
    ".contacts-section__item"
  );
  data.contacts = [];
  for (let contactItem of contactsList) {
    const contactTypeElement = contactItem.querySelector(".dropdown__btn-text");
    const type = contactTypeElement.innerText;

    const contactValueElement = contactItem.querySelector(
      ".contact-edit__input"
    );
    const value = contactValueElement.value;

    data.contacts.push({ type, value });
  }

  return data;
}

function setSurname(clientModalElement, surname) {
  const surnameElement = clientModalElement.querySelector("#surname-input");
  const inputParent = surnameElement.parentElement;

  surnameElement.value = surname;
  if (surname) {
    inputParent.classList.add("filled");
  } else {
    inputParent.classList.remove("filled");
  }
}

function setName(clientModalElement, name) {
  const nameElement = clientModalElement.querySelector("#name-input");
  const inputParent = nameElement.parentElement;

  nameElement.value = name;
  if (name) {
    inputParent.classList.add("filled");
  } else {
    inputParent.classList.remove("filled");
  }
}

function setLastname(clientModalElement, lastname) {
  const lastnameElement = clientModalElement.querySelector("#lastname-input");
  const inputParent = lastnameElement.parentElement;

  lastnameElement.value = lastname;
  if (lastname) {
    inputParent.classList.add("filled");
  } else {
    inputParent.classList.remove("filled");
  }
}

function addContact(
  clientModalElement,
  { contactType = "", contactValue = "" } = {}
) {
  const contactsSection = clientModalElement.querySelector(".contacts-section");
  const contactsList = clientModalElement.querySelector(
    "#create-edit-client-modal-contacts-list"
  );
  const addContactBtn = clientModalElement.querySelector(
    "#create-edit-client-modal-add-contact-btn"
  );

  const contactItem = createClientContactItem(clientModalElement);
  contactsList.append(contactItem);

  if (contactType) {
    const dropdown = contactItem.querySelector(".dropdown");
    chooseDropdownValue(dropdown, contactType);

    const contactInput = contactItem.querySelector(".contact-edit__input");
    contactInput.value = contactValue;
  }

  contactsSection.classList.add("filled");

  if (contactsList.children.length === 10) {
    addContactBtn.classList.add("hidden");
  }
}

function removeContact(clientModalElement, contactItem) {
  const dropdown = contactItem.querySelector(".dropdown__btn");
  const dropdownObj = bootstrap.Dropdown.getInstance(dropdown);

  dropdownObj.dispose();
  contactItem.remove();

  const contactsSection = clientModalElement.querySelector(".contacts-section");
  const contactsList = clientModalElement.querySelector(
    "#create-edit-client-modal-contacts-list"
  );
  const addContactBtn = clientModalElement.querySelector(
    "#create-edit-client-modal-add-contact-btn"
  );
  if (contactsList.children.length < 10) {
    addContactBtn.classList.remove("hidden");
  }

  if (contactsList.children.length === 0) {
    contactsSection.classList.remove("filled");
  }
}

function fillClientModal(clientModalElement, clientData) {
  const surname = "surname" in clientData ? clientData.surname : "";
  setSurname(clientModalElement, surname);

  const name = "name" in clientData ? clientData.name : "";
  setName(clientModalElement, name);

  const lastname = "lastName" in clientData ? clientData.lastName : "";
  setLastname(clientModalElement, lastname);

  const contacts = "contacts" in clientData ? clientData.contacts : [];
  for (let { type, value } of contacts) {
    addContact(clientModalElement, { contactType: type, contactValue: value });
  }
}

export function showErrorMessages(modalElement, errors) {
  const errorSection = modalElement.querySelector(".error");
  errorSection.classList.remove("hidden");

  const errorList = errorSection.querySelector(".error__list");
  errorList.innerHTML = "";

  const contacts = modalElement.querySelectorAll(".contact-edit");

  const messages = new Set();
  for (let error of errors) {
    const message = error.message;
    if (!messages.has(message)) {
      const errorItem = document.createElement("li");
      errorItem.classList.add("error__item");
      errorItem.innerText = `Ошибка: ${message}`;
      errorList.append(errorItem);

      messages.add(message);
    }

    switch (error?.field) {
      case "surname": {
        const group = modalElement.querySelector(".form-group__surname");
        group.classList.add("form-group_invalid");
        break;
      }
      case "name": {
        const group = modalElement.querySelector(".form-group__name");
        group.classList.add("form-group_invalid");
        break;
      }
      case "contacts": {
        if ("index" in error) {
          contacts[error.index].classList.add("contact-edit_invalid");
        }
      }
    }
  }
}

function validatePhone(phone) {
  return phone.length !== 10;
}

function validateEmail(email) {
  return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email);
}

export function validate(clientModalElement) {
  const clientData = getClientDataFromModal(clientModalElement);

  const invalids = [];
  if (clientData.name === "")
    invalids.push({ field: "name", message: "Не указано имя" });
  if (clientData.surname === "")
    invalids.push({ field: "surname", message: "Не указана фамилия" });
  clientData.contacts.map((contact, index) => {
    if (contact.value === "") {
      invalids.push({
        field: "contacts",
        index,
        message: "Контакт заполнен не полностью",
      });
    }
  });
  clientData.contacts.map((contact, index) => {
    if (
      contact.type === "Телефон" &&
      contact.value !== "" &&
      validatePhone(contact.value)
    ) {
      invalids.push({
        field: "contacts",
        index,
        message: "Телефон заполнен не полностью",
      });
    }
  });
  clientData.contacts.map((contact, index) => {
    if (
      contact.type === "Email" &&
      contact.value !== "" &&
      !validateEmail(contact.value)
    ) {
      invalids.push({
        field: "contacts",
        index,
        message: "Email имеет неверный формат",
      });
    }
  });

  return invalids;
}

export function blockModal(
  clientModalElement,
  onBlock = () => {},
  blockClosing = false
) {
  isBlocked = blockClosing;

  const fullnameSectionInputs = clientModalElement.querySelectorAll(
    ".fullname-section__input"
  );
  fullnameSectionInputs.forEach((input) => {
    input.readOnly = true;
    input.disabled = true;
  });

  const contactContainers =
    clientModalElement.querySelectorAll(".contact-edit");
  contactContainers.forEach((contact) => {
    const dropdownBtn = contact.querySelector(".dropdown__btn");
    dropdownBtn.disabled = true;

    const input = contact.querySelector(".contact-edit__input");
    input.readOnly = true;
    input.disabled = true;

    const deleteContactBtn = contact.querySelector(".contact-edit__delete-btn");
    deleteContactBtn.disabled = true;
  });

  const addContactBtn = clientModalElement.querySelector(
    "#create-edit-client-modal-add-contact-btn"
  );
  addContactBtn.disabled = true;

  if (blockClosing) {
    const closeModalBtn = clientModalElement.querySelector(".modal__btn-close");
    closeModalBtn.disabled = true;
  }

  onBlock();
}

export function unblockModal(clientModalElement, onUnblock = () => {}) {
  const fullnameSectionInputs = clientModalElement.querySelectorAll(
    ".fullname-section__input"
  );
  fullnameSectionInputs.forEach((input) => {
    input.readOnly = false;
    input.disabled = false;
  });

  const contactContainers =
    clientModalElement.querySelectorAll(".contact-edit");
  contactContainers.forEach((contact) => {
    const dropdownBtn = contact.querySelector(".dropdown__btn");
    dropdownBtn.disabled = false;

    const input = contact.querySelector(".contact-edit__input");
    input.readOnly = false;
    input.disabled = false;

    const deleteContactBtn = contact.querySelector(".contact-edit__delete-btn");
    deleteContactBtn.disabled = false;
  });

  const addContactBtn = clientModalElement.querySelector(
    "#create-edit-client-modal-add-contact-btn"
  );
  addContactBtn.disabled = false;

  const closeModalBtn = clientModalElement.querySelector(".modal__btn-close");
  closeModalBtn.disabled = false;

  onUnblock();

  isBlocked = false;
}

export function createClientModal(
  clientModalElement,
  { clientData = {}, onCancel = (e) => {}, onBlock = () => {} } = {}
) {
  if ("error" in clientData) {
    blockModal(clientModalElement, onBlock);
    showErrorMessages(clientModalElement, clientData.error);
  } else {
    fillClientModal(clientModalElement, clientData);
  }

  const fullnameSectionInputs = clientModalElement.querySelectorAll(
    ".fullname-section__input"
  );
  fullnameSectionInputs.forEach((input) => {
    const inputParent = input.parentElement;

    input.addEventListener("focus", (e) => {
      inputParent.classList.add("focused");
    });

    input.addEventListener("blur", (e) => {
      inputParent.classList.remove("focused");
    });

    input.addEventListener("change", (e) => {
      if (input.value.trim() !== "") {
        inputParent.classList.add("filled");
      } else {
        inputParent.classList.remove("filled");
      }

      input.classList.remove("form-group_invalid");
    });

    input.addEventListener("input", (e) => {
      inputParent.classList.remove("form-group_invalid");
    });
  });

  const addContactBtn = clientModalElement.querySelector(
    "#create-edit-client-modal-add-contact-btn"
  );
  addContactBtn.addEventListener("click", (e) => {
    addContact(clientModalElement);
  });

  clientModalElement.addEventListener("hide.bs.modal", (e) => {
    onCancel(e);

    if (isBlocked) {
      e.preventDefault();
    }
  });

  clientModalElement.addEventListener("hidden.bs.modal", (e) => {
    clientModalElement.remove();
  });

  return clientModalElement;
}
