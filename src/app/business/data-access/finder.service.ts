import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

export interface SearchResult {
    name: string;
    serverip: string;
    ip: string;
    password: string;
}

export interface RandomAccount {
    name: string;
    server: string;
    serverip: string;
    purchase: string;
    date: string;
}

export interface DehashResponse {
    password: string;
    message: string;
}

@Injectable({
    providedIn: 'root'
})
export class FinderService {
    private API_BASE_URL = "https://finder.nexorast.space/api/v2/mc/";
    private BOT_API_URL = "https://mf.nexorast.space/bot/start";
    private RANDOM_ACCOUNT_URL = "https://sc.nexorast.space/api/v3/random";

    public databases = [
        { value: "Nexora_1", label: "nexora1.txt (5M)" },
        { value: "Nexora_2", label: "nexora2.txt (5M)" },
        { value: "Nexora_3", label: "nexora3.txt (5M)" },
        { value: "Nexora_4", label: "nexora4.txt (5M)" },
    ];

    public versions = [
        { value: "1.20.4", label: "1.20.4" },
        { value: "1.19.4", label: "1.19.4" },
        { value: "1.18.2", label: "1.18.2" },
        { value: "1.17.1", label: "1.17.1" },
        { value: "1.16.5", label: "1.16.5" },
        { value: "1.12.2", label: "1.12.2" },
        { value: "1.8.9", label: "1.8.9" },
    ];

    private serverConfigs = {
        "mooncraft.es": {
            icon: "../../../assets/MoonCraft_Logo.png",
            banner: "../../../assets/MoonCraft_Banner.png",
        },
        "omegacraft.cl": {
            icon: "../../../assets/OmegaCraft_Logo.png",
            banner: "../../../assets/OmegaCraft_Banner.png",
        },
    };

    constructor(private http: HttpClient) { }

    getServerConfig(serverip: string) {
        return this.serverConfigs[serverip as keyof typeof this.serverConfigs];
    }

    getToken(): string {
        return localStorage.getItem("access_token") || '';
    }

    searchAccount(query: string): Observable<SearchResult[]> {
        const token = this.getToken();
        if (!token) {
            console.error('Token no disponible');
            return of([]);
        }

        // Crear un observable personalizado usando fetch nativo
        return new Observable<SearchResult[]>(observer => {
            fetch(`${this.API_BASE_URL}${encodeURIComponent(query)}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Error HTTP: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    observer.next(data);
                    observer.complete();
                })
                .catch(error => {
                    console.error('Error en búsqueda:', error);
                    observer.next([]);
                    observer.complete();
                });
        });
    }

checkPremiumStatus(username: string): Observable<any> {
    return this.http.get<any>(`https://api.mojang.com/users/profiles/minecraft/${encodeURIComponent(username)}`)
        .pipe(
            catchError(this.handleError<any>('checkPremiumStatus', null))
        );
}

    dehashPassword(username: string, wordlist: string, hash: string): Observable<DehashResponse> {
        const token = this.getToken();
        if (!token) {
            console.error('Token no disponible');
            return of({ password: '', message: 'Error de autenticación' });
        }

        return new Observable<DehashResponse>(observer => {
            fetch(`${this.API_BASE_URL}dehash/${encodeURIComponent(username)}/${encodeURIComponent(wordlist)}/${encodeURIComponent(hash)}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Error HTTP: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    observer.next(data);
                    observer.complete();
                })
                .catch(error => {
                    console.error('Error en dehasheo:', error);
                    observer.next({ password: '', message: 'Error en el dehasheo' });
                    observer.complete();
                });
        });
    }

    startBot(data: {
        host: string,
        port: string,
        version: string,
        username: string,
        password: string
    }): Observable<any> {
        const token = this.getToken();
        if (!token) {
            console.error('Token no disponible');
            return of({ success: false });
        }

        return new Observable(observer => {
            fetch(this.BOT_API_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Error HTTP: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    observer.next(data);
                    observer.complete();
                })
                .catch(error => {
                    console.error('Error al iniciar bot:', error);
                    observer.next({ success: false });
                    observer.complete();
                });
        });
    }

    getRandomAccount(): Observable<{purchases: RandomAccount[]}> {
        const token = this.getToken();
        if (!token) {
            console.error('Token no disponible');
            return of({ purchases: [] });
        }

        return new Observable<{purchases: RandomAccount[]}>(observer => {
            fetch(this.RANDOM_ACCOUNT_URL, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Error HTTP: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    observer.next(data);
                    observer.complete();
                })
                .catch(error => {
                    console.error('Error en cuenta aleatoria:', error);
                    observer.next({ purchases: [] });
                    observer.complete();
                });
        });
    }

    getRecentSearches(): string[] {
        return JSON.parse(localStorage.getItem("recentSearches") || "[]");
    }

    addToRecentSearches(query: string): void {
        let searches = this.getRecentSearches();
        searches = searches.filter(s => s !== query);
        searches.unshift(query);
        searches = searches.slice(0, 5);
        localStorage.setItem("recentSearches", JSON.stringify(searches));
    }

    private handleError<T>(operation = 'operation', result?: T) {
        return (error: any): Observable<T> => {
            console.error(`${operation} failed: ${error.message}`);
            return of(result as T);
        };
    }
}