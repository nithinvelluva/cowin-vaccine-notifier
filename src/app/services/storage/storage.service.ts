import { Injectable } from '@angular/core';
import { NativeStorage } from '@ionic-native/native-storage/ngx';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  constructor(private nativeStorage: NativeStorage
  ) { }
  async set(key: string, value: any): Promise<void> {
    await this.nativeStorage.setItem(key, value)
      .then(
        (data) => console.log('Stored first item!', data),
        error => console.error('Error storing item', error)
      );
  }

  async get(key: string): Promise<any> {
    const item = await this.nativeStorage.getItem(key)
      .then(
        data => { return JSON.parse(data) },
        error => console.error(error)
      );
    return item;
  }

  async remove(key: string): Promise<void> {
    await this.nativeStorage.remove(key)
    .then(
      data => console.log(data),
      error => console.error(error)
    );
  }
}