import axios from "axios";
import { env } from "@/shared/infrastructure/config/env";

const axiosClient = axios.create({
  baseURL: env.NEXT_PUBLIC_API_URL,
  timeout: Number(env.NEXT_PUBLIC_API_TIMEOUT ?? 15000),
  headers: { "Content-Type": "application/json" },
});

export default axiosClient;
