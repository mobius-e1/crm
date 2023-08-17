import {
  GET_CLIENTS_PATH,
  get_client_by_id_path,
  CREATE_CLIENT_PATH,
  get_edit_client_path,
  get_delete_client_path,
} from "./config.js";

const fromDBToAppContactsTypeDict = new Map([
  ["vk", "Vk"],
  ["fb", "Facebook"],
  ["phone", "Телефон"],
  ["mail", "Email"],
  ["other", "Другое"],
]);

const fromAppToDbContactsTypeDict = new Map(
  Array.from(fromDBToAppContactsTypeDict, (arr) => arr.reverse())
);

function transformClientData(clientData) {
  return {
    ...clientData,
    createdAt: new Date(clientData.createdAt),
    updatedAt: new Date(clientData.updatedAt),
    contacts: clientData.contacts.map(({ type, value }) => ({
      type: fromDBToAppContactsTypeDict.get(type),
      value,
    })),
  };
}

export async function getClientsFromDB(search = null) {
  try {
    const response = await fetch(
      GET_CLIENTS_PATH + (search ? `?search=${search}` : "")
    );
    const responseJSON = await response.json();
    switch (response.status) {
      case 200:
        return {
          status: "OK",
          clients: responseJSON.map((client) => transformClientData(client)),
        };
      default:
        return {
          status: "ERROR",
          errorData: [{ message: "Что-то пошло не так..." }],
        };
    }
  } catch (error) {
    return {
      status: "ERROR",
      errorData: [{ message: "Что-то пошло не так..." }],
    };
  }
}

export async function getClientByIdFromDB(clientId) {
  try {
    const response = await fetch(get_client_by_id_path(clientId));
    const responseJSON = await response.json();
    switch (response.status) {
      case 200:
        return {
          status: "OK",
          client: transformClientData(responseJSON),
        };
      case 404:
        return {
          status: "ERROR",
          errorData: [{ message: "Клиент не найден." }],
        };
      default:
        return {
          status: "ERROR",
          errorData: [{ message: "Что-то пошло не так..." }],
        };
    }
  } catch (error) {
    return {
      status: "ERROR",
      errorData: [{ message: "Что-то пошло не так..." }],
    };
  }
}

export async function createClientInDB(clientData) {
  try {
    const client = {
      ...clientData,
      contacts: clientData.contacts.map(({ type, value }) => ({
        type: fromAppToDbContactsTypeDict.get(type),
        value,
      })),
    };

    const response = await fetch(CREATE_CLIENT_PATH, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(client),
    });

    const responseJSON = await response.json();
    switch (response.status) {
      case 201:
        return {
          status: "OK",
          id: responseJSON.id,
        };
      case 422:
        return {
          status: "INVALID",
          invalidData: responseJSON.errors,
        };
      default:
        return {
          status: "ERROR",
          errorData: [{ message: "Что-то пошло не так..." }],
        };
    }
  } catch (error) {
    return {
      status: "ERROR",
      errorData: [{ message: "Что-то пошло не так..." }],
    };
  }
}

export async function editClientInDB(clientId, clientData) {
  try {
    const client = {
      ...clientData,
      contacts: clientData.contacts.map(({ type, value }) => ({
        type: fromAppToDbContactsTypeDict.get(type),
        value,
      })),
    };

    const response = await fetch(get_edit_client_path(clientId), {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(client),
    });

    const responseJSON = await response.json();
    switch (response.status) {
      case 200:
        return {
          status: "OK",
          id: responseJSON.id,
        };
      case 404:
        return {
          status: "ERROR",
          errorData: [{ message: "Клиент не найден." }],
        };
      case 422:
        return {
          status: "INVALID",
          invalidData: responseJSON.errors,
        };
      default:
        return {
          status: "ERROR",
          errorData: [{ message: "Что-то пошло не так..." }],
        };
    }
  } catch (error) {
    return {
      status: "ERROR",
      errorData: [{ message: "Что-то пошло не так..." }],
    };
  }
}

export async function deleteClientFromDB(clientId) {
  try {
    const response = await fetch(get_delete_client_path(clientId), {
      method: "DELETE",
    });

    switch (response.status) {
      case 200:
        return { status: "OK" };
      case 404:
        return {
          status: "ERROR",
          errorData: [{ message: "Клиент не найден." }],
        };
      default:
        return {
          status: "ERROR",
          errorData: [{ message: "Что-то пошло не так..." }],
        };
    }
  } catch (error) {
    return {
      status: "ERROR",
      errorData: [{ message: "Что-то пошло не так..." }],
    };
  }
}
