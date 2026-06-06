import axios from "axios";
import { env } from "@/shared/infrastructure/config/env";

const apiBaseUrl = `${env.NEXT_PUBLIC_API_URL.replace(/\/+$/, "")}${env.NEXT_PUBLIC_API_VERSION_PREFIX}`;

const axiosClient = axios.create({
  baseURL: apiBaseUrl,
  timeout: Number(env.NEXT_PUBLIC_API_TIMEOUT ?? 15000),
  headers: { "Content-Type": "application/json" },
});

export default axiosClient;
