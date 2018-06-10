import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { CamPage } from '../cam/cam';
import { DetailsPage } from '../details/details';
import { NativeStorage } from '@ionic-native/native-storage';
import Web3 from 'web3';

@Component({
  	selector: 'page-home',
  	templateUrl: 'home.html'
})
export class HomePage {
	isSaved:any;
	savedAddress:any;
	customAddress:any;
  	constructor(public web3:Web3, public navCtrl: NavController, private nativeStorage: NativeStorage) {
		this.isSaved = false;
		this.savedAddress = '';
	}

	_handleScan() {
		this.navCtrl.push(DetailsPage);
	}

	_handleSaved() {
		this.nativeStorage.getItem('recAddress')
		.then(
			data => this.navCtrl.push(DetailsPage,{address:data.address}),
			error => alert('No saved address found, please use the QR Scanner')
		);
	}

	_handleCustomAddress () {
		if (this.web3.utils.isAddress(this.customAddress) == true) {
			alert('Done!');
			this.navCtrl.push(DetailsPage,{address:this.customAddress},{animate:true,animation:'md-transition',direction:'forward',duration:500})
		} else {
			alert('Error, not a valid address');
			return;
		}
	}
}
