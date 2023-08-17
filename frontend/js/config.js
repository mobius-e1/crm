const BASE_URL = "http://localhost:3000/api";
export const GET_CLIENTS_PATH = `${BASE_URL}/clients`;
export const get_client_by_id_path = (id) => `${BASE_URL}/clients/${id}`;
export const CREATE_CLIENT_PATH = `${BASE_URL}/clients`;
export const get_edit_client_path = (id) => `${BASE_URL}/clients/${id}`;
export const get_delete_client_path = (id) => `${BASE_URL}/clients/${id}`;
