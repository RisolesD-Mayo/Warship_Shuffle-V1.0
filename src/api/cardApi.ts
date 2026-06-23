import axios from "axios";
import { Card } from "../types/cardType";

const API_URL = "http://192.168.68.108:3000/cards";

export async function getCards(): Promise<Card[]> {
  const response = await axios.get<Card[]>(API_URL);
 
  return response.data;
}