import { Component } from '@angular/core';
import { BackgroundMode } from '@ionic-native/background-mode/ngx';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,    
    private backgroundMode: BackgroundMode
  ) {   
  }

  initializeApp() {
    this.platform.ready().then(() => {      
      this.splashScreen.hide();
      // Enable Background
      this.backgroundMode.enable();
    });
  }
}
