import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { QRScanner, QRScannerStatus } from '@ionic-native/qr-scanner';
import { HomePage } from '../home/home';
import Web3 from 'web3';
import { DetailsPage } from '../details/details';

@Component({
  	selector: 'page-cam',
  	templateUrl: 'cam.html',
})
export class CamPage {
	content:any;
	canReturn: any;
  	constructor(public web3:Web3, private qrScanner: QRScanner, public navCtrl: NavController, public navParams: NavParams) {
		
 	}
	
	ionViewDidLoad() {
		this.content = document.getElementsByTagName('ion-app')[0];
		this.init();
	}

	init () {
		this.qrScanner.prepare()
		.then((status: QRScannerStatus) => {
			this.content.style.display = 'none';
			this.qrScanner.hide(); // hide camera preview
			this.content.style.display = 'block';
			if (status.authorized) {
			   	// camera permission was granted
			   	this.content.style.display = 'none';
				// Needed for a timer
			   	this.canReturn = true;
			  	// start scanning
       			let scanSub = this.qrScanner.scan().subscribe((text: string) => {
					if (this.web3.utils.isAddress(text) == true) {
						alert('Done!');
						this.navCtrl.setRoot(HomePage)
						this.navCtrl.push(DetailsPage,{address:text},{animate:true,animation:'md-transition',direction:'forward',duration:500})
					} else {
						alert('Error, not a valid address');
						this.navCtrl.pop();
					}
					this.qrScanner.hide(); // hide camera preview
					scanSub.unsubscribe(); // stop scanning
					this.content.style.display = 'block';
					this.canReturn = false;
				});
				const __this = this;
				setTimeout(
					function() {
						if (__this.canReturn == true) {
							__this.qrScanner.hide(); // hide camera preview
							scanSub.unsubscribe(); // stop scanning
							__this.content.style.display = 'block';
							__this.navCtrl.pop();
							__this.canReturn = false;
						}
					},10000
				)   
     		} else if (status.denied) {
				// camera permission was permanently denied
				// you must use QRScanner.openSettings() method to guide the user to the settings page
				// then they can grant the permission from there
     		} else {
       			// permission was denied, but not permanently. You can ask for permission again at a later time.
     		}
  		})
  		.catch((e: any) => console.log('Error is', e));
	}

}
