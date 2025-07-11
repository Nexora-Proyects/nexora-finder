import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class MainService {
  getAvatarUrl(username: string): string {
    return `https://mc-heads.net/avatar/${username || "Steve"}`;
  }
}