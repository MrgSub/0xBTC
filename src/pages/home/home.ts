import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { CamPage } from '../cam/cam';
import { DetailsPage } from '../details/details';
import { NativeStorage } from '@ionic-native/native-storage';

@Component({
  	selector: 'page-home',
  	templateUrl: 'home.html'
})
export class HomePage {
	isSaved:any;
	savedAddress:any;
  	constructor(public navCtrl: NavController, private nativeStorage: NativeStorage) {
		this.isSaved = false;
		this.savedAddress = '';
	}

	_handleScan() {
		this.navCtrl.push(CamPage);
	}

	_handleSaved() {
		this.nativeStorage.getItem('recAddress')
		.then(
			data => this.navCtrl.push(DetailsPage,{address:data.address}),
			error => alert('No saved address found, please use the QR Scanner')
		);
	}
}
