import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import * as io from 'socket.io-client';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NativeStorage } from '@ionic-native/native-storage';

@Component({
 	selector: 'page-details',
  	templateUrl: 'details.html',
})
export class DetailsPage {
	address:any;
	socket:any;
	pool:any;
	tokenBalance:any;
	validSubmittedSolutionsCount:any;
	lastSubmittedSolutionTime:any;
	tokensAwarded:any;
	usingCustomDifficulty:any;
	walletBalance:any;
	transactions:any;
  	constructor(public navCtrl: NavController, public navParams: NavParams, public http:HttpClient, private nativeStorage: NativeStorage) {
		this.tokenBalance = ' ';
		this.validSubmittedSolutionsCount = ' ';
		this.lastSubmittedSolutionTime = ' ';
		this.tokensAwarded = ' ';
		this.usingCustomDifficulty = ' ';
		this.walletBalance = ' ';
		this.transactions = [];
		this.address = this.navParams.get('address');
		this.nativeStorage.setItem('recAddress', {address: this.address})
		.then(
			() => console.log('Stored item!'),
			error => console.log('Error storing item')
		);
	}

	handleFound(address,data) {
		this.tokenBalance = (data.tokenBalance/10**8);
		this.validSubmittedSolutionsCount = data.validSubmittedSolutionsCount;
		var d = new Date(data.lastSubmittedSolutionTime);
    	var n = d.toLocaleTimeString();
		this.lastSubmittedSolutionTime = n;
		this.tokensAwarded = (data.tokensAwarded/10**8);
		this.usingCustomDifficulty = data.usingCustomDifficulty;
	}

	loadPoolData(data) {
		const _this = this;
		this.loadEtherData(_this.address);
		const socket = io(data,{transports: ['websocket']});
		socket.connect();
		socket.open()
		socket.on('connect', () => {
			console.log('connected'); // true
			socket.emit('getAllMinerData')
		});
		socket.on('minerData',function(data){
			var address;
			for(address of data) {
				if (address.minerAddress == _this.address) {
					_this.handleFound(address.minerAddress,address.minerData)
					socket.disconnect()
					break;
				} else {
					this.tokenBalance = 'Not Found In Pool';
					this.validSubmittedSolutionsCount = 'Not Found In Pool';
					this.lastSubmittedSolutionTime = 'Not Found In Pool';
					this.tokensAwarded = 'Not Found In Pool';
					this.usingCustomDifficulty = 'Not Found In Pool';
					this.walletBalance = 'Not Found In Pool';
				}
			}/*
			data.some(
				function (value, index, _arr) {
					if (value.minerAddress == _this.address) {
						return _this.handleFound(value.minerAddress,value.minerData)
					} else {break;}
				}
			);	*/
		})
		socket.close()
	}

	loadEtherData(address) {
		const httpOptions = {
			headers: new HttpHeaders({
				'Content-Type':  'application/json',
			})
		};
		if (address) {
			this.http.get('https://api.etherscan.io/api?module=account&action=balance&address=' + address + '&tag=latest&apikey=Y68XEEV6QB8SRCERCSGDUGMKWEWKRJ79GT',httpOptions).subscribe(
				response => {
					this.walletBalance = (response['result']/1000000000000000000);
				}
			)
			this.http.get('http://api.etherscan.io/api?module=account&action=txlist&address=' + address + '&startblock=0&endblock=99999999&sort=asc&apikey=Y68XEEV6QB8SRCERCSGDUGMKWEWKRJ79GT',httpOptions).subscribe(
				response => {
					this.transactions = response['result'];
					console.info(this.transactions)
				}
			)
		}
	}
}
