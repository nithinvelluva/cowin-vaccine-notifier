import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  constructor(
  ) { }

  async setItem(key: string, value: any): Promise<void> {
    await localStorage.setItem(key, value);
  }

  async getItem(key: string): Promise<any> {
    const item = await localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  }

  async removeItem(key: string): Promise<void> {
    await localStorage.remove(key)
      .then(
        data => console.log(data),
        error => console.error(error)
      );
  }
}