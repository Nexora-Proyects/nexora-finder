import { Injectable } from "@angular/core";

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  async updateTime(token: string) {
    const res = await fetch('https://auth.nexorast.space/api/v1/update-time', {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.ok ? res.json() : null;
  }

  async changePassword(token: string, username: string, currentPassword: string, newPassword: string) {
    const res = await fetch('https://auth.nexorast.space/api/v1/change-password', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        current_password: currentPassword,
        new_password: newPassword,
      }),
    });
    return res.ok ? res.json() : null;
  }

}
