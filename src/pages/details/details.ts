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
	_0x:any;
	transactions:any;
	pools:any[];
  	constructor(public navCtrl: NavController, public navParams: NavParams, public http:HttpClient, private nativeStorage: NativeStorage) {
		this.tokenBalance = ' ';
		this.validSubmittedSolutionsCount = ' ';
		this.lastSubmittedSolutionTime = ' ';
		this.tokensAwarded = ' ';
		this.usingCustomDifficulty = ' ';
		this.walletBalance = ' ';
		this._0x = ' ';
		this.transactions = [];
		this.address = this.navParams.get('address');
		this.loadEtherData(this.address)
		this.nativeStorage.setItem('recAddress', {address: this.address})
		.then(
			() => console.log('Stored item!'),
			error => console.log('Error storing item')
		);

		http.get('https://husl-f0f4b.firebaseio.com/Pools.json').subscribe(
			response => {
				const __this = this;
				__this.pools = []
				Object.keys(response).forEach(
					element => {
						__this.pools.push({
							name:response[element]['name'],
							ip:response[element]['ip']
						})
					}
				);
			}
		)
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
		const __this = this;
		this.loadEtherData(__this.address);
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
				if (address.minerAddress == __this.address) {
					__this.handleFound(address.minerAddress,address.minerData)
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
					if (value.minerAddress == __this.address) {
						return __this.handleFound(value.minerAddress,value.minerData)
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
			this.http.get('https://api.etherscan.io/api?module=account&action=tokenbalance&contractaddress=0xb6ed7644c69416d67b522e20bc294a9a9b405b31&address=' + address + '&tag=latest&apikey=Y68XEEV6QB8SRCERCSGDUGMKWEWKRJ79GT',httpOptions).subscribe(
				response => {
					this._0x = (response['result']/(10**8));
				}
			)
			this.http.get('http://api.etherscan.io/api?module=account&action=txlist&address=' + address + '&startblock=0&endblock=99999999&sort=desc&apikey=Y68XEEV6QB8SRCERCSGDUGMKWEWKRJ79GT',httpOptions).subscribe(
				response => {
					this.transactions = response['result'];
					console.info(this.transactions)
				}
			)
		}
	}
}
