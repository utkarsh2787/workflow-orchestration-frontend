import axios from "axios";

const task_create_bulk = async (payload:any) => {
  try {
    const resp = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/task/add_tasks_bulk`,
      payload,
      { withCredentials: true }
    );
    return resp.data;
  } catch (error) {
    throw error;
  }
};

export {task_create_bulk}