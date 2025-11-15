import axios from "axios";

const workflow_create = async (
  description: string,
  created_by: number,
  name: string
) => {
  try {
    const resp = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/workflow/create`,
      { description, created_by, name },
      { withCredentials: true }
    );
    return resp.data;
  } catch (error) {
    throw error;
  }
};

const get_workflow_by_id = async (workflow_id: number) => {
  try {
    const resp = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/workflow/${workflow_id}`,
      { withCredentials: true }
    );
    return resp.data;
  } catch (error) {
    throw error;
  }
};

const get_workflow_by_user = async () => {
  try {
    const resp = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/workflow/get_workflow_by_user`,
      { withCredentials: true }
    );
    return resp.data;
  } catch (error) {
    throw error;
  }
};

export { workflow_create, get_workflow_by_id, get_workflow_by_user };
