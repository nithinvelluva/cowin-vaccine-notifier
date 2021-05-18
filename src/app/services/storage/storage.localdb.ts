import { Injectable } from '@angular/core';
//import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';

@Injectable({
  providedIn: 'root'
})
export class StorageLocalDBService {
  constructor(private sqlite: SQLite) {
    
    //this.setupDB();
  }

  private setupDB() {
    this.sqlite.create({
      name: 'data.db',
      location: 'default'
    })
      .then((db: SQLiteObject) => {
        db.executeSql('create table if not exists alerts(Id INT,SearchType INT NULL,PostalCode VARCHAR(10) NULL,State INT NULL,District NULL)', [])
          .then(() => console.log('Executed SQL'))
          .catch(e => console.log(e));
      })
      .catch(e => console.log(e));
  }
  hai(){
    //debugger;
  }

  /* async set(key: string, value: any): Promise<void> {
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
  } */
}