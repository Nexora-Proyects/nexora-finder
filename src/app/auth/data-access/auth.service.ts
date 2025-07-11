import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    async login(username: string, password: string) {
        const response = await fetch('https://auth.nexorast.space/api/v1/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Error en el login');
        }
        return response.json();
    }

    async refreshToken(refreshToken: string) {
        const response = await fetch('https://auth.nexorast.space/api/v1/refresh-token', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${refreshToken}`,
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) return null;
        return response.json();
    }
}