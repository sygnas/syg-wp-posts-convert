import { TWpData } from "../types";

// タグ除去
export default function removeTag(post: TWpData, key: keyof TWpData): string {
  const data: string = post[key as keyof TWpData] as string;
  return data.replace(/<("[^"]*"|'[^']*'|[^'">])*>/g, "");
}
