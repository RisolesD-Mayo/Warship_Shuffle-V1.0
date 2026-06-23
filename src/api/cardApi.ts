import { Card } from "../types/cardType";

const API_URL = "http://192.168.68.108:3000/cards";

export async function getCards(): Promise<Card[]> {
  const response = await fetch(API_URL);

  return response.json();
}